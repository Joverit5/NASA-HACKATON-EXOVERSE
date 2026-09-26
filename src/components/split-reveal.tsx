"use client"

import { useEffect, useRef, createElement, type ElementType } from "react"
import { useQuality } from "@/src/components/quality-provider"

/**
 * Per-character reveal for display type.
 *
 * Six of the seven reference sites studied for this redesign animate their display
 * text by character or word on entry, and ExoVerse animated no type at all — text
 * either existed or it did not. That is the most visible finish gap left, and CSS
 * has no equivalent: there is no native way to address the characters of a text
 * node independently, which is exactly what GSAP's SplitText exists to do.
 *
 * Restraint that keeps it from being a gimmick:
 *
 *   - It runs once, on entry, and never loops. Per the world's two motion budgets,
 *     perpetual motion belongs to the scene and never to the chrome.
 *   - The stagger is derived from the shared 240 ms tick rather than invented.
 *   - The split is reverted on unmount, so the DOM the screen reader and the
 *     translator see is the original text, not a pile of per-character spans.
 *   - Under reduced motion or the essential tier it does not split at all: the
 *     text is simply there, which is the correct answer rather than a faster
 *     version of the wrong one.
 */

interface SplitRevealProps {
  children: React.ReactNode
  /** "chars" for short display lines, "words" for anything longer. */
  by?: "chars" | "words"
  /** Seconds before the reveal starts. */
  delay?: number
  className?: string
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div"
}

export function SplitReveal({ children, by = "chars", delay = 0, className, as = "div" }: SplitRevealProps) {
  const ref = useRef<HTMLElement>(null!)
  const { ambientMotion, reducedMotion } = useQuality()

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (reducedMotion || !ambientMotion) return

    let cancelled = false
    let cleanup: (() => void) | undefined

    // Dynamically imported so GSAP never lands in the initial bundle of a page
    // that has no display type to reveal.
    Promise.all([import("gsap"), import("gsap/SplitText")])
      .then(([{ gsap }, { SplitText }]) => {
        if (cancelled) return
        gsap.registerPlugin(SplitText)

        const split = new SplitText(el, { type: by, ...(by === "chars" ? { charsClass: "sr-char" } : {}) })
        const targets = by === "chars" ? split.chars : split.words

        const tween = gsap.from(targets, {
          // One tick per element at 3x, which is the world's section-entry duration.
          duration: 0.72,
          // A quarter-tick between elements: enough to read as a sweep, short
          // enough that a long headline still lands quickly.
          stagger: 0.024,
          delay,
          yPercent: 108,
          opacity: 0,
          ease: "cubic-bezier(0.2, 0, 0, 1)",
          force3D: true,
        })

        cleanup = () => {
          tween.kill()
          // Put the original text node back so assistive tech and any future
          // translation layer see real words rather than split spans.
          split.revert()
        }
      })
      .catch(() => {
        /* GSAP failed to load: the text is already in the DOM and readable. */
      })

    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [by, delay, ambientMotion, reducedMotion])

  // overflow:hidden clips the characters while they rise into place.
  return createElement(
    as as ElementType,
    { ref, className, style: { overflow: "hidden", display: "block" } },
    children,
  )
}
