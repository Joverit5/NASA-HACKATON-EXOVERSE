"use client"

import { useEffect, useMemo, useRef } from "react"
import * as THREE from "three"
import { PointsNodeMaterial } from "three/webgpu"
import { attribute, float, mix, oneMinus, sin, smoothstep, time, uv, vec3 } from "three/tsl"
import { blackbodyRgb } from "@/src/lib/planetPhysics"

/**
 * The background sky for the ExoCreator scene.
 *
 * This replaces drei's <Stars>, which builds a raw GLSL ShaderMaterial. That
 * cannot compile on the WebGPU backend, so the stars silently vanished when the
 * scene moved to WebGPURenderer — a regression introduced with the renderer swap.
 * Written in TSL it works on both backends, like the rest of the scene's materials.
 *
 * The colours are not decorative. Each star's temperature is drawn from a
 * distribution close to the real stellar population — overwhelmingly cool red
 * dwarfs, with a thin tail of hot blue-white stars — and run through the same
 * blackbody fit the host star uses. So the sky is mostly dim and orange, which is
 * what the galaxy actually looks like, and the rare blue star reads as rare.
 */

interface StarfieldProps {
  count: number
  radius?: number
  /** Perpetual twinkle. Off under reduced motion or on the essential tier. */
  animate?: boolean
}

/**
 * A stellar temperature, weighted toward the low end.
 *
 * About three quarters of the stars in the Milky Way are M dwarfs; O and B stars
 * are a fraction of a percent. Cubing a uniform sample gives a similar shape
 * without pretending to be a real initial mass function.
 */
function sampleTemperature(r: number): number {
  const t = r * r * r
  return 2600 + t * 22000
}

/*
 * three's TSL declarations do not infer a node's type from the string argument to
 * attribute(), so the node arrives without its operators. The runtime is correct;
 * only the declaration is loose, so the cast is localised here rather than spread
 * through the shader.
 */
const vec3Attribute = (name: string) => attribute(name, "vec3") as unknown as ReturnType<typeof vec3>
const floatAttribute = (name: string) => attribute(name, "float") as unknown as ReturnType<typeof float>

export function Starfield({ count, radius = 340, animate = true }: StarfieldProps) {
  const pointsRef = useRef<THREE.Points>(null!)

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      // Uniform on the sphere: acos of a uniform cosine, or the poles crowd.
      const u = Math.random()
      const v = Math.random()
      const theta = 2 * Math.PI * u
      const phi = Math.acos(2 * v - 1)
      const r = radius * (0.82 + Math.random() * 0.18)

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = r * Math.cos(phi)

      const teff = sampleTemperature(Math.random())
      const { r: cr, g: cg, b: cb } = blackbodyRgb(teff)
      // Apparent brightness varies far more than colour does; most stars are faint.
      const brightness = 0.35 + Math.pow(Math.random(), 2.2) * 0.65
      colors[i * 3] = cr * brightness
      colors[i * 3 + 1] = cg * brightness
      colors[i * 3 + 2] = cb * brightness

      sizes[i] = 0.7 + Math.pow(Math.random(), 3) * 3.2
    }

    const g = new THREE.BufferGeometry()
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    g.setAttribute("starColor", new THREE.BufferAttribute(colors, 3))
    g.setAttribute("starSize", new THREE.BufferAttribute(sizes, 1))
    return g
  }, [count, radius])

  const material = useMemo(() => {
    const m = new PointsNodeMaterial()
    const starColor = vec3Attribute("starColor")
    const starSize = floatAttribute("starSize")

    // Round the point sprite off and soften its edge, so stars are discs of light
    // rather than the hard squares a raw point primitive gives.
    const d = uv().sub(vec3(0.5, 0.5, 0.0).xy).length()
    const disc = oneMinus(smoothstep(0.18, 0.5, d))

    // Atmospheric scintillation: each star drifts on its own phase, seeded by size
    // so neighbours do not pulse in unison.
    const twinkle = animate
      ? sin(time.mul(1.7).add(starSize.mul(19.0))).mul(0.16).add(0.9)
      : float(1.0)

    m.colorNode = starColor.mul(twinkle)
    m.opacityNode = disc
    m.sizeNode = starSize
    m.transparent = true
    m.depthWrite = false
    m.blending = THREE.AdditiveBlending
    m.toneMapped = false
    return m
  }, [animate])

  useEffect(() => {
    return () => {
      geometry.dispose()
      material.dispose()
    }
  }, [geometry, material])

  if (count <= 0) return null

  return <points ref={pointsRef} geometry={geometry} material={material} frustumCulled={false} />
}
