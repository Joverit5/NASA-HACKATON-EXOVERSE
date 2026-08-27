/**
 * Server-side exoplanet catalog.
 *
 * The previous implementation paged the NASA archive with an Oracle-style nested
 * subquery (`SELECT * FROM (SELECT a.*, ROWNUM ...)`). The archive's TAP endpoint
 * rejects that outright — "Table '(' is not available for querying" — so every
 * ExoVis request returned HTTP 400. Two further limits shape this design:
 *
 *   - `OFFSET` is not supported (ORA-00933), so there is no server-side paging.
 *   - `TOP n` is applied BEFORE `ORDER BY`, so `SELECT TOP 20 ... ORDER BY x`
 *     returns 20 arbitrary rows and then sorts those. Sorting a paged query is
 *     therefore impossible at the source.
 *
 * The whole composite catalog is ~1.35 MB raw / 185 KB gzipped and loads in about
 * three seconds, so it is fetched once, classified, and held in memory. Search,
 * filtering, sorting and paging then happen here, correctly and instantly.
 *
 * `pscomppars` carries one row per planet already, which also removes the need for
 * the `default_flag` filter and the client-side duplicate-merging the hook used to do.
 */

export interface ProcessedExoplanet {
  name: string
  hostStar: string
  distance: string
  radius: string
  mass: string
  orbitalPeriod: string
  temperature: number | null
  discoveryYear: number | null
  discoveryMethod: string
  type: string
  habitability: "Potentially Habitable" | "Not Habitable"
  description: string
  /** Number of published references in the archive for this planet. Real provenance. */
  sources: number
  /** Stellar radius in solar radii, needed to compute a real transit depth. */
  stellarRadius: number | null
  /** Stellar effective temperature in K, which sets the star's colour. */
  stellarTemp: number | null
  /**
   * Fractional transit depth, (Rp / R*)^2 — the fraction of starlight the planet
   * blocks. This is the quantity the whole visual direction is built on: the dip
   * IS the planet. Null when either radius is missing.
   */
  transitDepth: number | null
}

/** Earth radii per solar radius. */
const EARTH_RADII_PER_SOLAR = 109.076

const TAP_URL = "https://exoplanetarchive.ipac.caltech.edu/TAP/sync"
const PARSEC_TO_LY = 3.26156

/** The archive publishes on a weekly cadence; a day is comfortably fresh. */
const TTL_MS = 24 * 60 * 60 * 1000

/** Planet types the classifier can actually produce. The UI filter must match this. */
export const PLANET_TYPES = [
  "Terrestrial",
  "Super-Earth",
  "Mini-Neptune",
  "Neptune-like",
  "Gas Giant",
  "Hot Jupiter",
] as const

interface RawPlanet {
  pl_name: string | null
  hostname: string | null
  sy_dist: number | null
  pl_rade: number | null
  pl_masse: number | null
  pl_orbper: number | null
  pl_eqt: number | null
  disc_year: number | null
  discoverymethod: string | null
  st_rad: number | null
  st_teff: number | null
}

async function tapQuery<T>(query: string, signal?: AbortSignal): Promise<T[]> {
  const params = new URLSearchParams({ query, format: "json" })
  const res = await fetch(`${TAP_URL}?${params}`, {
    headers: { Accept: "application/json", "User-Agent": "ExoVerse/2.0" },
    signal,
    // We do our own caching below; Next's data cache caps entries at 2 MB and this
    // payload sits close enough to that ceiling to be worth keeping out of it.
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error(`NASA archive returned HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`)
  }

  const text = await res.text()
  // The TAP service answers errors with a VOTable XML document and a 200 in some cases.
  if (text.trimStart().startsWith("<")) {
    const reason = text.match(/value="ERROR">\s*([^<]+)/)?.[1]?.trim()
    throw new Error(`NASA archive rejected the query: ${reason || text.slice(0, 200)}`)
  }

  return JSON.parse(text) as T[]
}

/**
 * Physical classification, derived here rather than supplied by the archive.
 * Thresholds are carried over unchanged from the original implementation.
 */
function classify(radius: number | null, mass: number | null, temperature: number | null): string {
  const r = radius ?? Number.NaN
  const m = mass ?? Number.NaN
  let type = "Unknown"

  if (!Number.isNaN(r) && !Number.isNaN(m)) {
    if (r < 1.5 && m < 5) type = "Terrestrial"
    else if (r < 2.0 && m < 10) type = "Super-Earth"
    else if (r < 4.0 && m < 20) type = "Mini-Neptune"
    else if (r < 6.0 && m < 50) type = "Neptune-like"
    else type = "Gas Giant"
  } else if (!Number.isNaN(r)) {
    if (r < 1.5) type = "Terrestrial"
    else if (r < 2.0) type = "Super-Earth"
    else if (r < 4.0) type = "Mini-Neptune"
    else if (r < 6.0) type = "Neptune-like"
    else type = "Gas Giant"
  } else if (!Number.isNaN(m)) {
    if (m < 5) type = "Terrestrial"
    else if (m < 10) type = "Super-Earth"
    else if (m < 20) type = "Mini-Neptune"
    else if (m < 50) type = "Neptune-like"
    else type = "Gas Giant"
  }

  if (type === "Gas Giant" && temperature !== null && temperature > 1000) {
    type = "Hot Jupiter"
  }

  return type
}

/**
 * A rocky world inside a rough liquid-water temperature band.
 *
 * A planet with no measured equilibrium temperature is NOT counted as habitable.
 * The original code intended to allow that case but tested `temperature === null`
 * against a `NaN`, so the branch never ran. Excluding it is the correct behaviour
 * anyway: calling a world potentially habitable without a temperature would be a
 * claim the archive does not support.
 */
function assessHabitability(type: string, temperature: number | null): ProcessedExoplanet["habitability"] {
  const rocky = type === "Terrestrial" || type === "Super-Earth"
  if (rocky && temperature !== null && temperature >= 200 && temperature <= 350) {
    return "Potentially Habitable"
  }
  return "Not Habitable"
}

function num(value: number | null, decimals: number, unit: string): string {
  if (value === null || Number.isNaN(value)) return "Not available"
  return `${value.toFixed(decimals)}${unit}`
}

function process(raw: RawPlanet, referenceCount: number): ProcessedExoplanet {
  const name = raw.pl_name || "Unknown"
  const hostStar = raw.hostname || "Unknown"
  const temperature = raw.pl_eqt ?? null
  const type = classify(raw.pl_rade, raw.pl_masse, temperature)
  const habitability = assessHabitability(type, temperature)

  const distance =
    raw.sy_dist !== null && !Number.isNaN(raw.sy_dist)
      ? `${(raw.sy_dist * PARSEC_TO_LY).toFixed(1)} ly`
      : "Not available"

  const sourceInfo = referenceCount > 1 ? ` Combined from ${referenceCount} published references.` : ""
  const description =
    `${name} is a ${type.toLowerCase()} exoplanet orbiting ${hostStar}. ` +
    (habitability === "Potentially Habitable"
      ? "This world shows potential for habitability with temperatures that could support liquid water."
      : "This distant world represents the diversity of planetary systems in our galaxy.") +
    sourceInfo

  return {
    name,
    hostStar,
    distance,
    radius: num(raw.pl_rade, 2, " R⊕"),
    mass: num(raw.pl_masse, 2, " M⊕"),
    orbitalPeriod: num(raw.pl_orbper, 1, " days"),
    temperature,
    discoveryYear: raw.disc_year ?? null,
    discoveryMethod: raw.discoverymethod || "Unknown",
    type,
    habitability,
    description,
    sources: referenceCount,
    stellarRadius: raw.st_rad ?? null,
    stellarTemp: raw.st_teff ?? null,
    transitDepth:
      raw.pl_rade !== null && raw.st_rad !== null && raw.st_rad > 0
        ? Math.pow(raw.pl_rade / EARTH_RADII_PER_SOLAR / raw.st_rad, 2)
        : null,
  }
}

let cache: { at: number; planets: ProcessedExoplanet[] } | null = null
let inflight: Promise<ProcessedExoplanet[]> | null = null

async function load(): Promise<ProcessedExoplanet[]> {
  const [rows, refCounts] = await Promise.all([
    tapQuery<RawPlanet>(
      "SELECT pl_name,hostname,sy_dist,pl_rade,pl_masse,pl_orbper,pl_eqt,disc_year,discoverymethod,st_rad,st_teff FROM pscomppars",
    ),
    // Real provenance: how many published references the archive holds per planet.
    tapQuery<{ pl_name: string; nrefs: number }>("SELECT pl_name, COUNT(*) AS nrefs FROM ps GROUP BY pl_name").catch(
      () => [] as { pl_name: string; nrefs: number }[],
    ),
  ])

  const refs = new Map(refCounts.map((r) => [r.pl_name, r.nrefs]))

  return rows
    .filter((r) => r.pl_name && r.hostname)
    .map((r) => process(r, refs.get(r.pl_name as string) ?? 1))
}

/**
 * The full classified catalog. Concurrent callers share one in-flight fetch, and a
 * stale cache is served rather than failing if the archive is unreachable.
 */
export async function getCatalog(): Promise<ProcessedExoplanet[]> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.planets
  if (inflight) return inflight

  inflight = load()
    .then((planets) => {
      cache = { at: Date.now(), planets }
      return planets
    })
    .catch((err) => {
      // A stale catalog beats an outage: the archive is a third-party dependency
      // and PRODUCT.md treats its unavailability as a visible part of the experience.
      if (cache) return cache.planets
      throw err
    })
    .finally(() => {
      inflight = null
    })

  return inflight
}

export interface CatalogQuery {
  searchTerm?: string
  typeFilter?: string
  habitabilityFilter?: string
  sortBy?: string
  offset?: number
  limit?: number
}

export interface CatalogPage {
  planets: ProcessedExoplanet[]
  total: number
  offset: number
  limit: number
  hasMore: boolean
  catalogSize: number
}

export function queryCatalog(all: ProcessedExoplanet[], q: CatalogQuery): CatalogPage {
  const { searchTerm = "", typeFilter = "All", habitabilityFilter = "All", sortBy = "name" } = q
  const offset = Math.max(0, q.offset ?? 0)
  const limit = Math.min(200, Math.max(1, q.limit ?? 60))

  let rows = all

  const term = searchTerm.trim().toLowerCase()
  if (term) {
    rows = rows.filter((p) => p.name.toLowerCase().includes(term) || p.hostStar.toLowerCase().includes(term))
  }
  if (typeFilter !== "All") {
    rows = rows.filter((p) => p.type === typeFilter)
  }
  if (habitabilityFilter !== "All") {
    rows = rows.filter((p) => p.habitability === habitabilityFilter)
  }

  // Sorting runs across the whole filtered set, which the archive could not do.
  const sorted = [...rows]
  switch (sortBy) {
    case "distance":
      sorted.sort((a, b) => parseDistance(a.distance) - parseDistance(b.distance))
      break
    case "year":
      sorted.sort((a, b) => (b.discoveryYear ?? -Infinity) - (a.discoveryYear ?? -Infinity))
      break
    case "habitability":
      sorted.sort((a, b) => {
        const rank = (p: ProcessedExoplanet) => (p.habitability === "Potentially Habitable" ? 0 : 1)
        return rank(a) - rank(b) || a.name.localeCompare(b.name)
      })
      break
    default:
      sorted.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
  }

  return {
    planets: sorted.slice(offset, offset + limit),
    total: sorted.length,
    offset,
    limit,
    hasMore: offset + limit < sorted.length,
    catalogSize: all.length,
  }
}

function parseDistance(distance: string): number {
  const n = Number.parseFloat(distance)
  return Number.isNaN(n) ? Number.POSITIVE_INFINITY : n
}

/**
 * The planet the landing page opens on.
 *
 * It has to be a transiting world with a real measured depth, well enough studied
 * that its numbers are trustworthy, and with a dip deep enough to read at a glance.
 * Picked from the archive rather than hard-coded, so the hero cannot go stale or
 * point at a planet whose parameters were later revised away.
 */
export interface FeaturedPick {
  planet: ProcessedExoplanet
  /** How many worlds met the bar, so the page can say what it drew from. */
  poolSize: number
}

/**
 * A planet for the landing page, drawn fresh on each visit.
 *
 * Every candidate has to clear the same bar: discovered in transit, with a real
 * measured depth deep enough to read at a glance, well enough studied that its
 * numbers are trustworthy, and with a period and distance on record. Within that
 * pool the choice is random, so the hero is a different real world each time
 * rather than one hard-coded favourite.
 */
export async function getFeaturedPlanet(): Promise<FeaturedPick | null> {
  let catalog: ProcessedExoplanet[]
  try {
    catalog = await getCatalog()
  } catch {
    return null
  }

  const pool = catalog.filter(
    (p) =>
      p.discoveryMethod === "Transit" &&
      p.transitDepth !== null &&
      p.transitDepth > 0.0015 &&
      p.sources >= 5 &&
      p.orbitalPeriod !== "Not available" &&
      p.distance !== "Not available" &&
      p.radius !== "Not available",
  )
  if (pool.length === 0) return null

  return { planet: pool[Math.floor(Math.random() * pool.length)], poolSize: pool.length }
}
