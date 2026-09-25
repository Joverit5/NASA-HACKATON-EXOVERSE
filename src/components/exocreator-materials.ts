import { MeshStandardNodeMaterial, MeshBasicNodeMaterial } from "three/webgpu"
import {
  float,
  vec3,
  uniform,
  positionLocal,
  normalLocal,
  normalView,
  positionViewDirection,
  mix,
  clamp,
  smoothstep,
  abs,
  pow,
  oneMinus,
  sin,
  time,
  normalize,
  cross,
  transformNormalToView,
  mx_noise_float,
  mx_fractal_noise_float,
} from "three/tsl"
import * as THREE from "three"
import { blackbodyRgb } from "@/src/lib/planetPhysics"

/**
 * Node materials for the ExoCreator scene, written in TSL.
 *
 * TSL compiles to WGSL under WebGPU and to GLSL under the WebGL2 fallback, so one
 * source serves both backends and the quality tier decides how much of it runs.
 *
 * What this replaces: a 512x256 canvas the CPU filled with a few thousand
 * Math.random() dots and uploaded as a texture. Surface detail is now evaluated
 * per-pixel on the GPU, sampled in 3D on the sphere so there is no UV seam and no
 * pole pinching.
 */

/* ------------------------------------------------------------------- noise */

function fbm(p: any, scale: number, octaves: number) {
  return mx_fractal_noise_float(p.mul(scale), octaves, 2.0, 0.5)
}

/**
 * Perturb the shading normal from the gradient of the height field.
 *
 * Displacing vertices alone leaves the lighting flat, because the normals still
 * describe a smooth sphere. Sampling the height at two small offsets along the
 * surface and rebuilding the normal from that gradient is what makes the
 * terminator pick out relief instead of sliding across a billiard ball.
 */
function perturbedNormal(scale: number, octaves: number, strength: number) {
  // Capped: three samples at six octaves each is ~24 octaves per pixel, and the
  // gradient only needs the high-frequency part to read as relief.
  const o = Math.min(octaves, 3)
  const eps = 0.035

  // Two directions across the surface, built from the geometric normal.
  const n = normalize(normalLocal)
  const tangent = normalize(cross(n, vec3(0.0, 1.0, 0.0).add(vec3(0.001, 0.0, 0.002))))
  const bitangent = normalize(cross(n, tangent))

  const h0 = fbm(positionLocal, scale, o)
  const hT = fbm(positionLocal.add(tangent.mul(eps)), scale, o)
  const hB = fbm(positionLocal.add(bitangent.mul(eps)), scale, o)

  const dT = hT.sub(h0).mul(strength)
  const dB = hB.sub(h0).mul(strength)

  return transformNormalToView(normalize(n.sub(tangent.mul(dT)).sub(bitangent.mul(dB))))
}

/* ------------------------------------------------------------------ planets */

export type PlanetSurface = "rock" | "water" | "gas"

export interface PlanetMaterialOptions {
  /** Equilibrium temperature in kelvin, which decides whether the world glows. */
  temperatureK: number
  /** Vertex displacement and normal detail. Off on the essential tier. */
  relief: boolean
  /** Shading octaves; fewer is cheaper and still reads correctly. */
  octaves: number
}

const DEFAULT_OPTIONS: PlanetMaterialOptions = { temperatureK: 255, relief: true, octaves: 6 }

export function createPlanetMaterial(
  surface: PlanetSurface,
  colorHex: string,
  options: Partial<PlanetMaterialOptions> = {},
): MeshStandardNodeMaterial {
  const { temperatureK, relief, octaves } = { ...DEFAULT_OPTIONS, ...options }
  const material = new MeshStandardNodeMaterial()
  const base = uniform(new THREE.Color(colorHex))

  /*
   * Thermal emission. Above roughly 800 K a body radiates visibly in its own
   * right — this is why hot Jupiters are detectable in secondary eclipse, and why
   * their night sides are not black. The colour is the blackbody colour of the
   * planet itself, not of its star.
   */
  const glowStrength = Math.max(0, Math.min(1, (temperatureK - 750) / 1400))
  if (glowStrength > 0.001) {
    const { r, g, b } = blackbodyRgb(Math.max(1000, temperatureK))
    material.emissiveNode = vec3(r, g, b).mul(float(glowStrength * 0.9))
  }

  if (surface === "gas") {
    /* Latitudinal banding, the way zonal flow really organises a giant: turbulence
       stretched into bands parallel to the equator, meandering rather than striped. */
    const turbulence = fbm(positionLocal, 2.2, octaves - 2).mul(0.35)
    const bands = sin(positionLocal.y.mul(11.0).add(turbulence.mul(6.0))).mul(0.5).add(0.5)
    const storm = smoothstep(0.62, 0.94, fbm(positionLocal, 3.4, octaves - 1))

    const banded = mix(base.mul(0.55), base.mul(1.25), bands)
    material.colorNode = mix(banded, base.mul(1.6), storm)
    material.roughnessNode = float(0.95)
    material.metalnessNode = float(0.0)

    // A gas giant has no solid relief, but its cloud decks do have depth.
    if (relief) material.normalNode = perturbedNormal(2.6, octaves - 2, 1.4)
    return material
  }

  if (surface === "water") {
    const continents = fbm(positionLocal, 1.6, octaves)
    const land = smoothstep(0.02, 0.14, continents)

    const coastal = mix(base.mul(0.75), base.mul(1.35), smoothstep(-0.06, 0.02, continents))
    const rock = vec3(0.32, 0.29, 0.24).mul(oneMinus(fbm(positionLocal, 6.0, octaves - 2).mul(0.4)))

    material.colorNode = mix(coastal, rock, land)
    // Water is a mirror, land is not. This is the whole reason to have a shader.
    material.roughnessNode = mix(float(0.08), float(0.92), land)
    material.metalnessNode = float(0.0)

    if (relief) {
      // Only the land is displaced; an ocean surface is level by definition.
      material.positionNode = positionLocal.add(normalLocal.mul(land.mul(continents).mul(0.035)))
      material.normalNode = perturbedNormal(4.0, octaves - 1, 2.2)
    }
    return material
  }

  /* Rock: broad terrain plus fine cratering, displaced so the silhouette itself
     is uneven rather than a perfect circle. */
  const terrain = fbm(positionLocal, 2.4, octaves)
  const craters = smoothstep(0.55, 0.85, abs(mx_noise_float(positionLocal.mul(9.0))))

  const ground = mix(base.mul(0.5), base.mul(1.3), clamp(terrain.add(0.5), 0.0, 1.0))
  material.colorNode = mix(ground, ground.mul(0.62), craters)
  material.roughnessNode = clamp(float(0.95).sub(terrain.mul(0.2)), 0.4, 1.0)
  material.metalnessNode = float(0.02)

  if (relief) {
    material.positionNode = positionLocal.add(normalLocal.mul(terrain.mul(0.055)))
    material.normalNode = perturbedNormal(3.2, octaves, 3.0)
  }
  return material
}

/* ------------------------------------------------------------------ clouds */

/**
 * A cloud deck on its own shell, rotating independently of the surface.
 *
 * Real atmospheres are not locked to the ground — Venus's upper clouds lap the
 * planet in four days while its surface takes 243. Giving the deck its own mesh
 * and its own rotation is what sells a planet as a world with weather rather than
 * a painted ball.
 */
export function createCloudMaterial(colorHex: string): MeshStandardNodeMaterial {
  const material = new MeshStandardNodeMaterial()

  const drift = positionLocal.add(vec3(time.mul(0.012), 0.0, 0.0))
  const density = fbm(drift, 3.1, 5)
  const cover = smoothstep(0.06, 0.4, density)

  material.colorNode = vec3(1.0, 0.99, 0.97)
  material.opacityNode = cover.mul(0.72)
  material.roughnessNode = float(1.0)
  material.metalnessNode = float(0.0)
  material.transparent = true
  material.depthWrite = false
  return material
}

/* -------------------------------------------------------------- atmosphere */

/**
 * A limb-lit atmospheric shell.
 *
 * Rendered on the back faces of a slightly larger sphere and added to the frame,
 * so it reads as a glow around the planet's edge rather than a film over its face.
 * The Fresnel term concentrates it at the limb, where an atmosphere is optically
 * thickest from our viewpoint — the same reason Earth's is a thin blue arc from
 * orbit rather than an even haze.
 *
 * Colour comes from the host star: a red dwarf's atmosphere cannot scatter blue
 * light it never emitted.
 */
export function createAtmosphereMaterial(starTeff: number, surface: PlanetSurface): MeshBasicNodeMaterial {
  const material = new MeshBasicNodeMaterial()

  const { r, g, b } = blackbodyRgb(starTeff)
  // Rayleigh scattering goes as 1/lambda^4, so the blue end survives the trip
  // through the shell far better than the red end.
  const scattered = new THREE.Color(r * 0.45, g * 0.72, b * 1.0)
  if (surface === "gas") scattered.multiplyScalar(0.85)

  // Light that grazes the limb travels through far more air, which strips the blue
  // out of it. That is sunset, and it belongs at the very edge of the disc.
  const reddened = new THREE.Color(r * 1.0, g * 0.55, b * 0.28)

  const tint = uniform(scattered)
  const sunset = uniform(reddened)

  // mu is cos(angle) between the surface normal and the eye: 1 head-on, 0 at the limb.
  const mu = normalView.dot(positionViewDirection).abs()
  const rim = pow(oneMinus(mu), 2.4)
  const grazing = pow(oneMinus(mu), 7.0)

  material.colorNode = mix(tint, sunset, clamp(grazing.mul(1.6), 0.0, 1.0)).mul(rim.mul(1.8))
  material.opacityNode = clamp(rim.mul(1.15), 0.0, 0.85)
  material.transparent = true
  material.depthWrite = false
  material.side = THREE.BackSide
  material.blending = THREE.AdditiveBlending
  return material
}

/* -------------------------------------------------------------------- star */

/**
 * A star's disc, with the two things that actually make one look like a star.
 *
 * Limb darkening: a star is not a flat disc of uniform brightness. At its edge you
 * see higher, cooler layers of the photosphere, so the limb is dimmer and redder.
 * This is real and measurable — it is part of how transit depths get modelled.
 *
 * Granulation: the convective cells tiling the photosphere, drifting slowly.
 */
export function createStarMaterial(teff: number): MeshBasicNodeMaterial {
  const material = new MeshBasicNodeMaterial()

  const { r, g, b } = blackbodyRgb(teff)
  const core = uniform(new THREE.Color(r, g, b))
  const limbTint = uniform(new THREE.Color(r, g * 0.82, b * 0.62))

  const mu = clamp(normalView.dot(positionViewDirection).abs(), 0.0, 1.0)

  // Classic linear limb-darkening law: I(mu)/I(1) = 1 - u(1 - mu), u ~ 0.62.
  const darkening = float(1.0).sub(float(0.62).mul(oneMinus(mu)))

  // Two scales of convection: broad supergranules under fine granules.
  const supergranules = fbm(positionLocal.add(vec3(time.mul(0.02), 0.0, 0.0)), 3.0, 3).mul(0.09)
  const granules = fbm(positionLocal.add(vec3(0.0, time.mul(0.05), 0.0)), 9.0, 4).mul(0.11)
  const surface = supergranules.add(granules).add(1.0)

  material.colorNode = mix(limbTint, core, pow(mu, 0.55)).mul(darkening).mul(surface)
  material.toneMapped = false
  return material
}

/**
 * The corona: the outer atmosphere, far hotter and far fainter than the disc.
 * Visible around a real star only when the disc itself is blocked, which is why it
 * belongs on its own shell rather than blended into the photosphere.
 */
export function createCoronaMaterial(teff: number): MeshBasicNodeMaterial {
  const material = new MeshBasicNodeMaterial()
  const { r, g, b } = blackbodyRgb(teff)
  const tint = uniform(new THREE.Color(r, g, b))

  const mu = clamp(normalView.dot(positionViewDirection).abs(), 0.0, 1.0)
  const halo = pow(oneMinus(mu), 3.2)
  const flicker = sin(time.mul(0.7)).mul(0.06).add(0.94)

  material.colorNode = tint.mul(halo.mul(1.4).mul(flicker))
  material.opacityNode = clamp(halo.mul(0.9), 0.0, 0.6)
  material.transparent = true
  material.depthWrite = false
  material.side = THREE.BackSide
  material.blending = THREE.AdditiveBlending
  material.toneMapped = false
  return material
}

/* ------------------------------------------------------------------- rings */

/**
 * Ring particles: individual bodies, not a painted disc.
 *
 * Ring systems live inside the Roche limit, where tidal forces prevent material
 * from accreting into a moon. That is why Saturn has rings and Earth does not, and
 * it is why the outer radius is derived rather than chosen.
 */
export function createRingParticleMaterial(colorHex: string): MeshStandardNodeMaterial {
  const material = new MeshStandardNodeMaterial()
  const base = uniform(new THREE.Color(colorHex))

  // Ring material is dirty ice: bright, rough, and varied particle to particle.
  const grain = fbm(positionLocal, 14.0, 3).mul(0.35).add(0.8)
  material.colorNode = base.mul(grain)
  material.roughnessNode = float(0.85)
  material.metalnessNode = float(0.0)
  return material
}

/**
 * The Roche limit for a rigid satellite, in planet radii.
 *
 * d = 1.26 * R_planet * (rho_planet / rho_moon)^(1/3). With no mass estimate the
 * relation cannot be evaluated, so the caller gets the conventional 2.5 radii
 * rather than a fabricated one.
 */
export function rocheLimitRadii(planetDensityGCm3: number | null): number {
  if (planetDensityGCm3 === null || planetDensityGCm3 <= 0) return 2.5
  const iceMoonDensity = 1.2
  return 1.26 * Math.cbrt(planetDensityGCm3 / iceMoonDensity)
}
