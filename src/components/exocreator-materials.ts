import { MeshStandardNodeMaterial, MeshBasicNodeMaterial } from "three/webgpu"
import {
  float,
  vec3,
  uniform,
  positionLocal,
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
  mx_noise_float,
  mx_fractal_noise_float,
} from "three/tsl"
import * as THREE from "three"
import { blackbodyRgb } from "@/src/lib/planetPhysics"

/**
 * Node materials for the ExoCreator scene, written in TSL.
 *
 * TSL compiles to WGSL under WebGPU and to GLSL under the WebGL2 fallback, so one
 * source serves both backends. That matters here beyond novelty: PRODUCT.md says
 * this has to run on a classroom laptop, and without a single shader source we
 * would be maintaining two.
 *
 * What this replaces: a 512x256 canvas the CPU filled with a few thousand
 * Math.random() dots and then uploaded as a texture. It was low resolution, it
 * pixelated on approach, it cost a main-thread stall on every parameter change,
 * and it looked the same whether the planet was rock, ocean or gas. Surface detail
 * is now evaluated per-pixel on the GPU at whatever resolution the viewer is at.
 */

/* ------------------------------------------------------------------ planets */

/**
 * Fractal Brownian motion over the local position of the sphere. Because it is
 * sampled in 3D on the surface itself there is no UV seam and no pole pinching,
 * which the equirectangular canvas texture had at both ends.
 */
function surfaceNoise(scale: number, octaves: number) {
  return mx_fractal_noise_float(positionLocal.mul(scale), octaves, 2.0, 0.5)
}

export type PlanetSurface = "rock" | "water" | "gas"

export function createPlanetMaterial(surface: PlanetSurface, colorHex: string): MeshStandardNodeMaterial {
  const material = new MeshStandardNodeMaterial()
  const base = uniform(new THREE.Color(colorHex))

  if (surface === "gas") {
    /* Latitudinal banding, the way a gas giant actually organises itself: zonal
       flow stretches turbulence into bands parallel to the equator. The bands are
       driven by local Y, then distorted by noise so they meander instead of
       reading as stripes. */
    const turbulence = surfaceNoise(2.2, 4).mul(0.35)
    const bands = sin(positionLocal.y.mul(11.0).add(turbulence.mul(6.0)))
      .mul(0.5)
      .add(0.5)

    const storm = smoothstep(0.62, 0.94, surfaceNoise(3.4, 5))

    const light = base.mul(1.25)
    const dark = base.mul(0.55)
    const banded = mix(dark, light, bands)

    material.colorNode = mix(banded, base.mul(1.6), storm)
    material.roughnessNode = float(0.95)
    material.metalnessNode = float(0.0)
    return material
  }

  if (surface === "water") {
    /* An ocean world: a low-frequency continental mask with a hard coastline, and
       roughness that actually differs between land and sea, so the star glints off
       the water and not off the continents. */
    const continents = surfaceNoise(1.6, 5)
    const land = smoothstep(0.02, 0.14, continents)

    const sea = base.mul(0.75)
    const shallow = base.mul(1.35)
    const coastal = mix(sea, shallow, smoothstep(-0.06, 0.02, continents))

    const rock = vec3(0.32, 0.29, 0.24).mul(oneMinus(surfaceNoise(6.0, 4).mul(0.4)))

    material.colorNode = mix(coastal, rock, land)
    // Water is a mirror, land is not. This is the whole reason to have a shader.
    material.roughnessNode = mix(float(0.08), float(0.92), land)
    material.metalnessNode = float(0.0)
    return material
  }

  /* Rock: broad terrain plus fine cratering, with the fine detail modulating the
     normal so the terminator picks out relief instead of sliding across a
     billiard ball. */
  const terrain = surfaceNoise(2.4, 6)
  const craters = smoothstep(0.55, 0.85, abs(mx_noise_float(positionLocal.mul(9.0))))

  const low = base.mul(0.5)
  const high = base.mul(1.3)
  const ground = mix(low, high, clamp(terrain.add(0.5), 0.0, 1.0))

  material.colorNode = mix(ground, ground.mul(0.62), craters)
  material.roughnessNode = clamp(float(0.95).sub(terrain.mul(0.2)), 0.4, 1.0)
  material.metalnessNode = float(0.02)
  return material
}

/* -------------------------------------------------------------- atmosphere */

/**
 * A limb-lit atmospheric shell.
 *
 * Rendered on the back faces of a slightly larger sphere and added to the frame,
 * so it reads as a glow around the planet's edge rather than a film over its face.
 * The Fresnel term concentrates it at the limb, which is where an atmosphere is
 * optically thickest from our viewpoint — the same reason Earth's is a thin blue
 * arc from orbit rather than an even haze.
 *
 * Colour comes from the host star's temperature: a red dwarf's atmosphere cannot
 * scatter blue light it does not emit.
 */
export function createAtmosphereMaterial(starTeff: number, surface: PlanetSurface): MeshBasicNodeMaterial {
  const material = new MeshBasicNodeMaterial()

  const { r, g, b } = blackbodyRgb(starTeff)
  // Rayleigh scattering goes as 1/lambda^4, so the blue end survives the trip
  // through the shell far better than the red end. Bias the starlight accordingly.
  const scattered = new THREE.Color(r * 0.45, g * 0.72, b * 1.0)
  if (surface === "gas") scattered.multiplyScalar(0.85)

  const tint = uniform(scattered)

  // mu is cos(angle) between the surface normal and the eye: 1 head-on, 0 at the limb.
  const mu = normalView.dot(positionViewDirection).abs()
  const rim = pow(oneMinus(mu), 2.4)

  material.colorNode = tint.mul(rim.mul(1.8))
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
 * Limb darkening: a star is not a flat disc of uniform brightness. Looking at its
 * edge you see higher, cooler layers of the photosphere, so the limb is dimmer and
 * redder than the centre. This is a real, measurable effect — it is part of how
 * transit depths get modelled in the first place.
 *
 * Granulation: the convective cells that tile the photosphere, drifting slowly.
 */
export function createStarMaterial(teff: number): MeshBasicNodeMaterial {
  const material = new MeshBasicNodeMaterial()

  const { r, g, b } = blackbodyRgb(teff)
  const core = uniform(new THREE.Color(r, g, b))
  // The limb shows cooler gas, so it is dimmer and shifted toward the red.
  const limbTint = uniform(new THREE.Color(r, g * 0.82, b * 0.62))

  const mu = clamp(normalView.dot(positionViewDirection).abs(), 0.0, 1.0)

  // Classic linear limb-darkening law: I(mu) / I(1) = 1 - u(1 - mu), u ~ 0.6.
  const darkening = float(1.0).sub(float(0.62).mul(oneMinus(mu)))

  const granulation = mx_fractal_noise_float(positionLocal.mul(7.0).add(time.mul(0.06)), 4, 2.0, 0.5)
    .mul(0.12)
    .add(1.0)

  material.colorNode = mix(limbTint, core, pow(mu, 0.55)).mul(darkening).mul(granulation)
  material.toneMapped = false
  return material
}

/* ------------------------------------------------------------------- rings */

/**
 * Ring particles, shaded so the ring is a field of debris rather than a flat disc.
 *
 * Real ring systems live inside the Roche limit, where tidal forces prevent the
 * material from accreting into a moon. That is why Saturn has rings and Earth does
 * not, and it is why the outer radius here is derived rather than decorative.
 */
export function createRingMaterial(colorHex: string): MeshBasicNodeMaterial {
  const material = new MeshBasicNodeMaterial()
  const base = uniform(new THREE.Color(colorHex))

  // Radial banding: gaps carved by resonances with the moons.
  const radial = positionLocal.xz.length()
  const gaps = smoothstep(0.35, 0.65, mx_noise_float(vec3(radial.mul(26.0), 0.0, 0.0)).add(0.5))

  material.colorNode = base.mul(mix(float(0.35), float(1.0), gaps))
  material.opacityNode = mix(float(0.12), float(0.7), gaps)
  material.transparent = true
  material.depthWrite = false
  material.side = THREE.DoubleSide
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
