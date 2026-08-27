/**
 * Derived physics for ExoCreator.
 *
 * The previous implementation returned Math.random() for mass, gravity,
 * temperature, orbital period and even the orbital distance the user had just set
 * with a slider. Nothing the visitor built affected anything the app reported.
 *
 * Everything here is derived from the parameters the visitor actually chooses,
 * using the same relations the literature uses. Where a quantity genuinely cannot
 * be determined from those inputs — gas giant mass is the honest example, since
 * radius barely constrains it — that is stated rather than papered over with a
 * plausible-looking number. Every relation carries its source so a student can
 * check it.
 */

/* ---------------------------------------------------------------- constants */

const EARTH_RADII_PER_SOLAR = 109.076
const SOLAR_RADII_PER_AU = 215.032
const EARTH_DENSITY_G_CM3 = 5.514
const EARTH_SURFACE_GRAVITY = 9.807
const EARTH_ESCAPE_VELOCITY_KMS = 11.186

/* -------------------------------------------------------------------- stars */

export interface StarSpec {
  id: string
  /** What an astronomer would call it. */
  label: string
  spectralType: string
  /** Effective temperature in kelvin. */
  teff: number
  /** Radius in solar radii. */
  radius: number
  /** Mass in solar masses. */
  mass: number
  /** Bolometric luminosity in solar luminosities. */
  luminosity: number
  note: string
}

/**
 * Representative values for three real stellar classes. A main-sequence star's
 * temperature, radius, mass and luminosity are not independent, so these move
 * together rather than being dialled separately.
 */
export const STARS: Record<string, StarSpec> = {
  redDwarf: {
    id: "redDwarf",
    label: "Red dwarf",
    spectralType: "M3V",
    teff: 3250,
    radius: 0.36,
    mass: 0.36,
    luminosity: 0.015,
    note: "The most common star in the galaxy. Dim and long-lived, so its habitable zone sits very close in.",
  },
  yellowDwarf: {
    id: "yellowDwarf",
    label: "Yellow dwarf",
    spectralType: "G2V",
    teff: 5772,
    radius: 1,
    mass: 1,
    luminosity: 1,
    note: "A Sun-like star. Every value here is exactly one solar unit by definition.",
  },
  giant: {
    id: "giant",
    label: "Red giant",
    spectralType: "K5III",
    teff: 4050,
    radius: 25,
    mass: 1.3,
    luminosity: 190,
    note: "An evolved star that has swollen and brightened. Its habitable zone has moved far outward.",
  },
}

export function starSpec(id: string): StarSpec {
  return STARS[id] ?? STARS.yellowDwarf
}

/* ------------------------------------------------------------------ albedo */

/** Bond albedo by surface character. Earth is 0.31, Venus 0.77, Jupiter 0.50. */
const ALBEDO: Record<string, number> = {
  rock: 0.3,
  ocean: 0.25,
  gas: 0.5,
}

/* ------------------------------------------------------------- mass–radius */

export interface MassEstimate {
  /** Mass in Earth masses, or null when radius does not constrain it. */
  value: number | null
  /** The empirical relation used, named so it can be checked. */
  relation: string
  /** True when the estimate is weak enough that it should be read as a range. */
  degenerate: boolean
}

/**
 * Mass from radius.
 *
 * Below ~4 Earth radii two well-known empirical fits apply. Above that the
 * relation breaks down: a gas giant's radius is set by its envelope and its
 * irradiation, not its mass, so Jupiter and a 13-Jupiter-mass brown dwarf are
 * nearly the same size. Reporting a single confident mass there would be fiction,
 * so this returns null and the UI says so.
 */
export function estimateMass(radiusEarth: number): MassEstimate {
  if (radiusEarth < 1.5) {
    return {
      value: Math.pow(radiusEarth, 3.7),
      relation: "Zeng et al. (2016), rocky",
      degenerate: false,
    }
  }
  if (radiusEarth <= 4) {
    return {
      value: 2.69 * Math.pow(radiusEarth, 0.93),
      relation: "Weiss & Marcy (2014)",
      degenerate: false,
    }
  }
  return {
    value: null,
    relation: "Radius does not constrain mass above ~4 R⊕",
    degenerate: true,
  }
}

/* ------------------------------------------------------------------ orbits */

/** Kepler's third law: P² = a³ / M★, with P in years, a in AU, M in solar masses. */
export function orbitalPeriodDays(semiMajorAxisAu: number, starMassSolar: number): number {
  return Math.sqrt(Math.pow(semiMajorAxisAu, 3) / starMassSolar) * 365.25
}

/** Starlight received relative to Earth: S = L / a². */
export function insolation(luminositySolar: number, semiMajorAxisAu: number): number {
  return luminositySolar / (semiMajorAxisAu * semiMajorAxisAu)
}

/**
 * Equilibrium temperature: the temperature a body reaches balancing absorbed
 * starlight against thermal emission. It ignores greenhouse warming, which is why
 * Earth's equilibrium value is 255 K while its surface averages 288 K.
 */
export function equilibriumTemperature(star: StarSpec, semiMajorAxisAu: number, albedo: number): number {
  const starRadiusAu = star.radius / SOLAR_RADII_PER_AU
  return star.teff * Math.sqrt(starRadiusAu / (2 * semiMajorAxisAu)) * Math.pow(1 - albedo, 0.25)
}

export interface HabitableZone {
  innerAu: number
  outerAu: number
}

/**
 * Conservative habitable zone, scaled from the runaway-greenhouse and
 * maximum-greenhouse limits (Kopparapu et al. 2013).
 */
export function habitableZone(star: StarSpec): HabitableZone {
  return {
    innerAu: Math.sqrt(star.luminosity / 1.107),
    outerAu: Math.sqrt(star.luminosity / 0.356),
  }
}

/* ------------------------------------------------------------- the summary */

export interface PlanetInputs {
  /** Planet radius in Earth radii. */
  radiusEarth: number
  /** "rock" | "ocean" | "gas". */
  type: string
  starId: string
  /** Orbital distance in AU. */
  semiMajorAxisAu: number
  moons: number
  rings: number
}

export interface DerivedPlanet {
  star: StarSpec
  radiusEarth: number
  mass: MassEstimate
  /** Bulk density in g/cm³, null when mass is unconstrained. */
  densityGCm3: number | null
  /** Surface gravity in m/s², null when mass is unconstrained. */
  surfaceGravity: number | null
  /** Escape velocity in km/s, null when mass is unconstrained. */
  escapeVelocityKms: number | null
  semiMajorAxisAu: number
  orbitalPeriodDays: number
  insolationEarth: number
  equilibriumTempK: number
  albedo: number
  /** Fraction of starlight blocked in transit — how detectable this world is. */
  transitDepth: number
  habitableZone: HabitableZone
  inHabitableZone: boolean
  /** Same classifier the archive catalog uses, so the label means the same thing. */
  classification: string
  habitability: "Potentially Habitable" | "Not Habitable"
  moons: number
  rings: number
}

/** Mirrors the archive classifier in src/lib/exoplanetCatalog.ts. */
function classify(radius: number, mass: number | null, temperature: number): string {
  const r = radius
  const m = mass

  let type: string
  if (m !== null) {
    if (r < 1.5 && m < 5) type = "Terrestrial"
    else if (r < 2.0 && m < 10) type = "Super-Earth"
    else if (r < 4.0 && m < 20) type = "Mini-Neptune"
    else if (r < 6.0 && m < 50) type = "Neptune-like"
    else type = "Gas Giant"
  } else {
    if (r < 1.5) type = "Terrestrial"
    else if (r < 2.0) type = "Super-Earth"
    else if (r < 4.0) type = "Mini-Neptune"
    else if (r < 6.0) type = "Neptune-like"
    else type = "Gas Giant"
  }

  if (type === "Gas Giant" && temperature > 1000) type = "Hot Jupiter"
  return type
}

export function derivePlanet(inputs: PlanetInputs): DerivedPlanet {
  const star = starSpec(inputs.starId)
  const albedo = ALBEDO[inputs.type] ?? 0.3
  const r = Math.max(0.1, inputs.radiusEarth)
  const a = Math.max(0.005, inputs.semiMajorAxisAu)

  const mass = estimateMass(r)
  const temp = equilibriumTemperature(star, a, albedo)
  const hz = habitableZone(star)

  const density = mass.value !== null ? EARTH_DENSITY_G_CM3 * (mass.value / Math.pow(r, 3)) : null
  const gravity = mass.value !== null ? EARTH_SURFACE_GRAVITY * (mass.value / (r * r)) : null
  const escape = mass.value !== null ? EARTH_ESCAPE_VELOCITY_KMS * Math.sqrt(mass.value / r) : null

  const classification = classify(r, mass.value, temp)
  const rocky = classification === "Terrestrial" || classification === "Super-Earth"

  return {
    star,
    radiusEarth: r,
    mass,
    densityGCm3: density,
    surfaceGravity: gravity,
    escapeVelocityKms: escape,
    semiMajorAxisAu: a,
    orbitalPeriodDays: orbitalPeriodDays(a, star.mass),
    insolationEarth: insolation(star.luminosity, a),
    equilibriumTempK: temp,
    albedo,
    transitDepth: Math.pow(r / EARTH_RADII_PER_SOLAR / star.radius, 2),
    habitableZone: hz,
    inHabitableZone: a >= hz.innerAu && a <= hz.outerAu,
    classification,
    // Same rule the archive catalog applies, so the badge means the same thing here.
    habitability: rocky && temp >= 200 && temp <= 350 ? "Potentially Habitable" : "Not Habitable",
    moons: inputs.moons,
    rings: inputs.rings,
  }
}

/* ------------------------------------------------------------- formatting */

export function formatK(k: number): string {
  return `${Math.round(k)} K`
}

export function formatC(k: number): string {
  return `${Math.round(k - 273.15)} °C`
}

export function formatDays(days: number): string {
  if (days < 1) return `${(days * 24).toFixed(1)} h`
  if (days > 730) return `${(days / 365.25).toFixed(1)} yr`
  return `${days.toFixed(1)} d`
}

export function formatDepth(depth: number): string {
  const ppm = depth * 1e6
  if (ppm >= 10000) return `${(ppm / 10000).toFixed(2)} %`
  return `${Math.round(ppm).toLocaleString("en-US")} ppm`
}

/**
 * The slider is a position in a scene, not a physical distance. Mapping it
 * logarithmically lets one control reach both a scorching 0.02 AU orbit and a cold
 * 8 AU one, which is the range real systems actually occupy.
 */
export function sliderToAu(slider: number, min = 20, max = 100): number {
  const t = (slider - min) / (max - min)
  return 0.02 * Math.pow(8 / 0.02, Math.max(0, Math.min(1, t)))
}

export function auToSlider(au: number, min = 20, max = 100): number {
  const t = Math.log(au / 0.02) / Math.log(8 / 0.02)
  return min + t * (max - min)
}

/**
 * Blackbody colour of a star from its effective temperature.
 *
 * The 3D scene previously hard-coded pure yellow (#ffff00) for a Sun-like star,
 * which no star is: the Sun is white, and it looks yellow from Earth only because
 * the atmosphere scatters its blue light away. Deriving the colour from Teff means
 * an M dwarf renders genuinely orange-red and a hot star genuinely blue-white,
 * which is the difference the visitor is being taught.
 *
 * Approximation after Tanner Helland's blackbody fit, valid roughly 1000–40000 K.
 */
export function blackbodyRgb(teff: number): { r: number; g: number; b: number } {
  const t = Math.max(1000, Math.min(40000, teff)) / 100
  const clamp = (v: number) => Math.max(0, Math.min(255, v)) / 255

  const r = t <= 66 ? 255 : 329.698727446 * Math.pow(t - 60, -0.1332047592)
  const g =
    t <= 66 ? 99.4708025861 * Math.log(t) - 161.1195681661 : 288.1221695283 * Math.pow(t - 60, -0.0755148492)
  const b = t >= 66 ? 255 : t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307

  return { r: clamp(r), g: clamp(g), b: clamp(b) }
}

/** Relative luminosity, scaled so a Sun-like star reads as a sensible light level. */
export function starLightIntensity(luminositySolar: number): number {
  // Log-scaled: a red giant is 190x the Sun's output, which would blow out the scene.
  return 6 + Math.log10(Math.max(0.001, luminositySolar) + 1) * 14
}
