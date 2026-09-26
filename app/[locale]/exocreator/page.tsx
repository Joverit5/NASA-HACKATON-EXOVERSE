"use client"

import dynamic from "next/dynamic"

/**
 * ssr:false because the scene reaches for WebGPU at mount, which has no meaning on
 * the server.
 *
 * The 3-second setTimeout that used to gate this page is gone. It showed a loading
 * screen for a fixed delay whether or not anything was loading, so the visitor
 * waited three seconds to reach a creator that was already ready. The dynamic
 * import's own boundary covers the real wait, which is the chunk arriving.
 */
const ExoCreator = dynamic(() => import("@/src/components/exocreator"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center bg-void">
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-ink-faint">Loading the creator…</p>
    </div>
  ),
})

export default function ExoCreatorPage() {
  return <ExoCreator />
}
