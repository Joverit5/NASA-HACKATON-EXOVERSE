"use client"

import { useEffect, useRef, useState } from "react"
import { useQuality } from "@/src/components/quality-provider"

/**
 * An archive figure that counts to its value instead of appearing at it.
 *
 * Phase 03 declared the rule — "every archive quantity changes as a visible
 * physical event, never a silent text swap" — and then the build only honoured it
 * inside the 3D scene. This is the rule applied where most of the figures actually
 * live: the readout rows.
 *
 * It is not decoration. A number that visibly travels from zero to 6,354 tells the
 * visitor that something was counted, which is the whole argument of a site built
 * on a real archive. A number that simply appears could have been typed.
 *
 * Correctness details that matter more than the animation:
 *
 *   - The final frame is the exact target value, never an interpolated
 *     approximation, so the figure on screen always matches the data.
 *   - Under reduced motion or the essential tier it renders the final value
 *     immediately.
 *   - Formatting is pinned to en-US, because an unpinned toLocaleString takes the
 *     runtime's locale and renders 1527 as "1.527" on a Spanish host.
 */

interface CountingReadoutProps {
  value: number
  /** Decimal places to show. */
  decimals?: number
  /** Appended after the number, unanimated. */
  suffix?: string
  /** Seconds. Defaults to three of the world's 240 ms ticks. */
  duration?: number
  className?: string
}

function format(n: number, decimals: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

export function CountingReadout({
  value,
  decimals = 0,
  suffix = "",
  duration = 0.72,
  className,
}: CountingReadoutProps) {
  const { ambientMotion, reducedMotion } = useQuality()
  const [display, setDisplay] = useState(() => format(value, decimals))
  const frame = useRef(0)
  const startedFrom = useRef(0)

  useEffect(() => {
    if (reducedMotion || !ambientMotion) {
      setDisplay(format(value, decimals))
      return
    }

    const from = startedFrom.current
    const to = value
    if (from === to) {
      setDisplay(format(to, decimals))
      return
    }

    const t0 = performance.now()
    const ms = duration * 1000

    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / ms)
      // Ease out cubic: the count decelerates into its value rather than stopping.
      const eased = 1 - Math.pow(1 - t, 3)
      if (t >= 1) {
        // Land on the exact value, never on the interpolation.
        setDisplay(format(to, decimals))
        startedFrom.current = to
        return
      }
      setDisplay(format(from + (to - from) * eased, decimals))
      frame.current = requestAnimationFrame(tick)
    }

    frame.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame.current)
  }, [value, decimals, duration, ambientMotion, reducedMotion])

  return (
    <span className={className}>
      {/* The live region is off: a figure that recounts on every filter change
          would flood a screen reader. The value is read from the text as usual. */}
      <span aria-hidden="true">{display}</span>
      <span className="sr-only">{format(value, decimals)}</span>
      {suffix}
    </span>
  )
}
