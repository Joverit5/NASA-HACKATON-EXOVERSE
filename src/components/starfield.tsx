"use client"

import { useEffect, useMemo, useRef } from "react"
import * as THREE from "three"
import { SpriteNodeMaterial } from "three/webgpu"
import { attribute, float, oneMinus, positionGeometry, sin, smoothstep, time, uv, vec2, vec3 } from "three/tsl"
import { blackbodyRgb } from "@/src/lib/planetPhysics"

/**
 * The background sky for the ExoCreator scene.
 *
 * Two rewrites, both for real reasons:
 *
 * drei's <Stars> builds a raw GLSL ShaderMaterial, which cannot compile on the
 * WebGPU backend, so the stars silently vanished when the scene moved to
 * WebGPURenderer.
 *
 * The replacement used THREE.Points with a sizeNode, which does not work either:
 * WebGPU has no gl_PointSize, so every star drew at one pixel and the field was
 * invisible against black. Instanced billboarded sprites are the construction that
 * behaves identically on both backends.
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
  return 2600 + r * r * r * 22000
}

/* three's TSL declarations do not infer a node's type from attribute()'s string
   argument, so the casts are localised here rather than spread through the shader. */
const vec3Attribute = (name: string) => attribute(name, "vec3") as unknown as ReturnType<typeof vec3>
const floatAttribute = (name: string) => attribute(name, "float") as unknown as ReturnType<typeof float>

export function Starfield({ count, radius = 340, animate = true }: StarfieldProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null!)

  const geometry = useMemo(() => {
    const quad = new THREE.PlaneGeometry(1, 1)
    const g = new THREE.InstancedBufferGeometry()
    g.index = quad.index
    g.attributes.position = quad.attributes.position
    g.attributes.uv = quad.attributes.uv

    const centres = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      // Uniform on the sphere: acos of a uniform cosine, or the poles crowd.
      const theta = 2 * Math.PI * Math.random()
      const phi = Math.acos(2 * Math.random() - 1)
      const r = radius * (0.82 + Math.random() * 0.18)

      centres[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      centres[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      centres[i * 3 + 2] = r * Math.cos(phi)

      const { r: cr, g: cg, b: cb } = blackbodyRgb(sampleTemperature(Math.random()))
      // Apparent brightness varies far more than colour does; most stars are faint.
      const brightness = 0.4 + Math.pow(Math.random(), 2.2) * 0.6
      colors[i * 3] = cr * brightness
      colors[i * 3 + 1] = cg * brightness
      colors[i * 3 + 2] = cb * brightness

      sizes[i] = 0.9 + Math.pow(Math.random(), 3) * 3.4
    }

    g.setAttribute("starCentre", new THREE.InstancedBufferAttribute(centres, 3))
    g.setAttribute("starColor", new THREE.InstancedBufferAttribute(colors, 3))
    g.setAttribute("starSize", new THREE.InstancedBufferAttribute(sizes, 1))
    g.instanceCount = count
    quad.dispose()
    return g
  }, [count, radius])

  const material = useMemo(() => {
    const m = new SpriteNodeMaterial()

    const centre = vec3Attribute("starCentre")
    const starColor = vec3Attribute("starColor")
    const starSize = floatAttribute("starSize")

    // SpriteNodeMaterial billboards the quad on its own; positionNode places the
    // centre and scaleNode sizes it.
    m.positionNode = centre
    m.scaleNode = starSize

    // Round the quad off so a star is a disc of light rather than a square.
    const d = vec2(uv()).sub(vec2(0.5, 0.5)).length()
    const disc = oneMinus(smoothstep(0.1, 0.5, d))

    // Scintillation: each star drifts on its own phase, seeded by size so
    // neighbours do not pulse in unison.
    const twinkle = animate ? sin(time.mul(1.7).add(starSize.mul(19.0))).mul(0.16).add(0.9) : float(1.0)

    m.colorNode = starColor.mul(twinkle)
    m.opacityNode = disc
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

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry as unknown as THREE.BufferGeometry, material, count]}
      frustumCulled={false}
    />
  )
}
