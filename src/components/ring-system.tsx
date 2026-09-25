"use client"

import { useEffect, useMemo, useRef } from "react"
import * as THREE from "three"
import { MeshStandardNodeMaterial } from "three/webgpu"
import { attribute, cos, float, positionLocal, sin, time, uniform, vec3, mx_fractal_noise_float } from "three/tsl"

/**
 * A ring system made of individual particles rather than a painted disc.
 *
 * Two things make this read as a real ring rather than a hoop:
 *
 * Keplerian shear. Orbital speed goes as 1/sqrt(r), so the inner edge laps the
 * outer one. A rigid disc rotating as one piece is the most common tell that a
 * ring is decoration, and it is wrong for the same reason a solid ring cannot
 * exist there: tides inside the Roche limit would tear it apart.
 *
 * Vertical thickness. Real rings are extraordinarily flat — Saturn's are metres
 * thick across hundreds of thousands of kilometres — so the scatter here is tiny
 * on purpose, and the ring nearly vanishes edge-on, as it should.
 *
 * The orbit is evaluated in the vertex shader from per-instance attributes. The
 * first version rebuilt 4,500 instance matrices on the CPU every frame, which was
 * the second-largest cost in the scene after the bloom bug. Here the CPU writes
 * the orbits once and the GPU advances the phase.
 */

interface RingSystemProps {
  /** Planet radius in scene units. */
  planetRadius: number
  bandCount: number
  /** Outer extent in planet radii, from the Roche limit. */
  rocheRadii: number
  color: string
  particlesPerBand: number
  animate: boolean
}

/* three's TSL declarations do not infer a node's type from attribute()'s string
   argument, so the casts are localised here rather than spread through the shader. */
const floatAttribute = (name: string) => attribute(name, "float") as unknown as ReturnType<typeof float>

export function RingSystem({
  planetRadius,
  bandCount,
  rocheRadii,
  color,
  particlesPerBand,
  animate,
}: RingSystemProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const total = bandCount * particlesPerBand

  const geometry = useMemo(() => {
    const base = new THREE.IcosahedronGeometry(1, 0)
    const g = new THREE.InstancedBufferGeometry()
    g.index = base.index
    g.attributes.position = base.attributes.position
    g.attributes.normal = base.attributes.normal

    const inner = planetRadius * 1.35
    const outer = planetRadius * rocheRadii
    const span = Math.max(0.3, outer - inner)

    const radii = new Float32Array(total)
    const phases = new Float32Array(total)
    const speeds = new Float32Array(total)
    const scales = new Float32Array(total)
    const heights = new Float32Array(total)

    let i = 0
    for (let band = 0; band < bandCount; band++) {
      const bandInner = inner + span * (band / bandCount)
      const bandOuter = inner + span * ((band + 0.72) / bandCount)
      for (let p = 0; p < particlesPerBand; p++) {
        const r = bandInner + Math.random() * (bandOuter - bandInner)
        radii[i] = r
        phases[i] = Math.random() * Math.PI * 2
        // v goes as 1/sqrt(r): the inner edge laps the outer one.
        speeds[i] = 0.55 / Math.sqrt(r)
        scales[i] = 0.012 + Math.pow(Math.random(), 2.5) * 0.045 * planetRadius
        // Rings are almost perfectly flat; this scatter is deliberately tiny.
        heights[i] = (Math.random() - 0.5) * planetRadius * 0.012
        i++
      }
    }

    g.setAttribute("ringRadius", new THREE.InstancedBufferAttribute(radii, 1))
    g.setAttribute("ringPhase", new THREE.InstancedBufferAttribute(phases, 1))
    g.setAttribute("ringSpeed", new THREE.InstancedBufferAttribute(speeds, 1))
    g.setAttribute("ringScale", new THREE.InstancedBufferAttribute(scales, 1))
    g.setAttribute("ringHeight", new THREE.InstancedBufferAttribute(heights, 1))
    g.instanceCount = total
    base.dispose()
    return g
  }, [planetRadius, bandCount, rocheRadii, total, particlesPerBand])

  const material = useMemo(() => {
    const m = new MeshStandardNodeMaterial()
    const base = uniform(new THREE.Color(color))

    const r = floatAttribute("ringRadius")
    const phase0 = floatAttribute("ringPhase")
    const speed = floatAttribute("ringSpeed")
    const scale = floatAttribute("ringScale")
    const height = floatAttribute("ringHeight")

    // Keplerian shear, evaluated per vertex on the GPU.
    const phase = animate ? phase0.add(time.mul(speed)) : phase0
    const centre = vec3(cos(phase).mul(r), height, sin(phase).mul(r))

    m.positionNode = positionLocal.mul(scale).add(centre)

    // Ring material is dirty ice: bright, rough, and varied particle to particle.
    const grain = mx_fractal_noise_float(positionLocal.add(vec3(r, phase0, height)), 3, 2.0, 0.5)
      .mul(0.35)
      .add(0.8)
    m.colorNode = base.mul(grain)
    m.roughnessNode = float(0.85)
    m.metalnessNode = float(0.0)
    return m
  }, [color, animate])

  useEffect(() => {
    return () => {
      material.dispose()
      geometry.dispose()
    }
  }, [material, geometry])

  if (bandCount <= 0 || total <= 0) return null

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry as unknown as THREE.BufferGeometry, material, total]}
      frustumCulled={false}
    />
  )
}
