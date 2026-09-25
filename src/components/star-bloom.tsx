"use client"

import { useEffect, useMemo } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { PostProcessing } from "three/webgpu"
import { pass } from "three/tsl"
import { bloom } from "three/addons/tsl/display/BloomNode.js"

/**
 * Bloom over the scene's emissive output.
 *
 * This is the one effect that earns a whole-frame pass: the star is the only
 * object in the scene that emits light, so the glow around it is physical rather
 * than a decorative halo pasted on a UI element.
 *
 * Built on three's own TSL post-processing rather than @react-three/postprocessing,
 * which targets WebGLRenderer and cannot drive a WebGPU pipeline.
 *
 * The first version of this monkey-patched `renderer.render` to call
 * `renderAsync()`. R3F invokes render() synchronously every frame and discards
 * whatever it returns, so a promise was being created and abandoned sixty-plus
 * times a second with nothing draining the queue — which locked the page solid at
 * the full tier. The pass now drives the frame through R3F's own render priority,
 * synchronously, which is what the API expects.
 */
export function StarBloom() {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  const camera = useThree((s) => s.camera)

  const post = useMemo(() => {
    // Only the WebGPU/TSL pipeline exposes PostProcessing. If R3F fell back to the
    // plain WebGL renderer there is nothing to attach to and the scene simply
    // renders without bloom.
    if (!(gl as any)?.isWebGPURenderer) return null

    const processing = new PostProcessing(gl as any)
    const scenePass = pass(scene, camera)
    // Threshold at 0.9 so only genuinely bright pixels bloom: the star's disc, not
    // the lit face of the planet.
    processing.outputNode = scenePass.add(bloom(scenePass, 0.7, 0.3, 0.9))
    return processing
  }, [gl, scene, camera])

  // Taking a render priority above 0 makes R3F hand the frame over instead of
  // calling its own render, so this replaces the draw cleanly rather than by
  // patching the renderer.
  useFrame(() => {
    if (post) post.render()
  }, 1)

  useEffect(() => {
    return () => {
      post?.dispose?.()
    }
  }, [post])

  return null
}
