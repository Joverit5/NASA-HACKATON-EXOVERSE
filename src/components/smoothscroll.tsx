"use client"

import { useEffect } from "react"
import Lenis from "lenis"

/**
 * Momentum scrolling for the whole app.
 *
 * DESIGN.md's Seam Rule joins every section with an overlapping black gradient so
 * the scene reads as one continuous sky; native step-scrolling breaks that illusion
 * at exactly the seams it was built to hide. Lenis drives the real window scroll
 * position, so framer-motion's useScroll and every IntersectionObserver keep working.
 *
 * Disabled outright under prefers-reduced-motion — per DESIGN.md, ambient motion
 * stops, it does not merely shorten.
 */
export default function SmoothScroll() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (reduced.matches) return

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // Touch devices keep native scrolling: momentum emulation on mobile costs
      // more than it buys, and PRODUCT.md treats mobile as a first-class case.
      syncTouch: false,
    })

    let frame = 0
    const raf = (time: number) => {
      lenis.raf(time)
      frame = requestAnimationFrame(raf)
    }
    frame = requestAnimationFrame(raf)

    // In-page anchors (the navbar's /#credits link) must go through Lenis,
    // otherwise the browser jumps and Lenis snaps it back.
    const onAnchorClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement | null)?.closest?.('a[href*="#"]')
      if (!(anchor instanceof HTMLAnchorElement)) return
      const url = new URL(anchor.href, window.location.href)
      if (url.pathname !== window.location.pathname || !url.hash) return
      const target = document.querySelector(url.hash)
      if (!target) return
      e.preventDefault()
      lenis.scrollTo(target as HTMLElement, { offset: -80 })
    }
    document.addEventListener("click", onAnchorClick)

    return () => {
      document.removeEventListener("click", onAnchorClick)
      cancelAnimationFrame(frame)
      lenis.destroy()
    }
  }, [])

  return null
}
