"use client"

import { useEffect, useMemo } from "react"
import { useThree } from "@react-three/fiber"
import { PostProcessing } from "three/webgpu"
import { pass } from "three/tsl"
import { bloom } from "three/addons/tsl/display/BloomNode.js"

/**
 * Bloom over the scene's emissive output.
 *
 * This is the one effect that earns a whole-frame pass here: the star is the only
 * object in the scene that emits light, so the glow around it is physical rather
 * than a decorative halo pasted on a UI element. It runs on the full tier only.
 *
 * Built on three's own TSL post-processing rather than @react-three/postprocessing,
 * which targets WebGLRenderer and cannot drive a WebGPU pipeline.
 */
export function StarBloom() {
  const { gl, scene, camera } = useThree()

  const post = useMemo(() => {
    // Only the WebGPU/TSL pipeline exposes PostProcessing; if R3F fell back to the
    // plain WebGL renderer there is nothing to attach to, and the scene simply
    // renders without bloom.
    if (!(gl as any)?.isWebGPURenderer) return null

    const processing = new PostProcessing(gl as any)
    const scenePass = pass(scene, camera)
    processing.outputNode = scenePass.add(bloom(scenePass, 0.85, 0.35, 0.72))
    return processing
  }, [gl, scene, camera])

  useEffect(() => {
    if (!post) return
    const renderer = gl as any
    const previous = renderer.render?.bind(renderer)
    // Take over the frame so the composed pass reaches the screen.
    renderer.render = () => post.renderAsync()
    return () => {
      if (previous) renderer.render = previous
      post.dispose?.()
    }
  }, [post, gl])

  return null
}
