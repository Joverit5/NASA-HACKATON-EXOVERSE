/**
 * Quality tiers.
 *
 * PRODUCT.md principle 5: the site opens at its best and steps down only when
 * measurement on the actual device says it must. It never budgets down in advance
 * for hardware it has not met, and it never infers a tier from a user-agent string,
 * a screen size, or a core count — all of which are guesses that get poor machines
 * wrong in both directions.
 *
 * Three tiers, and the lowest is still meant to be a good page rather than an
 * apology: it drops effects that cost frames, not information.
 */

export type QualityTier = "full" | "balanced" | "essential"

export interface QualitySettings {
  tier: QualityTier
  /** Device pixel ratio ceiling for 3D canvases. */
  dpr: number
  /** Latitude/longitude segments for the planet sphere. */
  sphereSegments: number
  /** Whether the atmospheric shell is rendered at all. */
  atmosphere: boolean
  /** Selective bloom over the star's emissive channel. */
  bloom: boolean
  /** Background starfield particle count; 0 removes it. */
  starfield: number
  /** Shadow maps in the 3D scene. */
  shadows: boolean
  /** Sample count for a full-size transit curve. */
  curveSamples: number
  /** Perpetual ambient loops outside the 3D scene. */
  ambientMotion: boolean
}

export const TIERS: Record<QualityTier, QualitySettings> = {
  /* Everything on. This is what a visitor gets unless their own device tells us
     otherwise. */
  full: {
    tier: "full",
    dpr: 2,
    sphereSegments: 128,
    atmosphere: true,
    bloom: true,
    starfield: 3000,
    shadows: true,
    curveSamples: 320,
    ambientMotion: true,
  },
  /* The first step down: the expensive whole-frame effects go, the geometry and
     the materials stay. Visually very close; substantially cheaper. */
  balanced: {
    tier: "balanced",
    dpr: 1.25,
    sphereSegments: 64,
    atmosphere: true,
    bloom: false,
    starfield: 1200,
    shadows: false,
    curveSamples: 180,
    ambientMotion: true,
  },
  /* The floor. Still the same design, the same data, the same shaders — just no
     perpetual motion and no per-pixel extras. Nothing informational is removed. */
  essential: {
    tier: "essential",
    dpr: 1,
    sphereSegments: 32,
    atmosphere: false,
    bloom: false,
    starfield: 0,
    shadows: false,
    curveSamples: 96,
    ambientMotion: false,
  },
}

export const DEFAULT_TIER: QualityTier = "full"

const STORAGE_KEY = "exoverse.quality"

interface StoredQuality {
  tier: QualityTier
  /** Set when the visitor chose the tier themselves; we then stop overriding it. */
  manual: boolean
  at: number
}

/** A measured downgrade is remembered for a week, then re-probed. */
const MEMORY_MS = 7 * 24 * 60 * 60 * 1000

export function readStoredQuality(): StoredQuality | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredQuality
    if (!TIERS[parsed.tier]) return null
    // A manual choice never expires; a measured one is re-checked after a week,
    // because the same person may come back on a different machine.
    if (!parsed.manual && Date.now() - parsed.at > MEMORY_MS) return null
    return parsed
  } catch {
    return null
  }
}

export function writeStoredQuality(tier: QualityTier, manual: boolean): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ tier, manual, at: Date.now() } satisfies StoredQuality))
  } catch {
    /* Private mode, blocked storage: the tier simply does not persist. */
  }
}

export function stepDown(tier: QualityTier): QualityTier {
  if (tier === "full") return "balanced"
  if (tier === "balanced") return "essential"
  return "essential"
}

export const TIER_LABELS: Record<QualityTier, string> = {
  full: "Full",
  balanced: "Balanced",
  essential: "Essential",
}

export const TIER_DESCRIPTIONS: Record<QualityTier, string> = {
  full: "Everything on: atmospheres, bloom, full-resolution surfaces.",
  balanced: "Atmospheres kept, bloom and shadows dropped, lower resolution.",
  essential: "No perpetual motion and no per-pixel extras. Same data, same design.",
}
