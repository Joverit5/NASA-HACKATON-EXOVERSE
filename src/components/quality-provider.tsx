"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import {
  DEFAULT_TIER,
  TIERS,
  readStoredQuality,
  stepDown,
  writeStoredQuality,
  type QualitySettings,
  type QualityTier,
} from "@/src/lib/quality"

/**
 * Measures the frame rate and steps quality down when the device cannot hold it.
 *
 * Every visitor starts at `full`. Nothing is inferred from the user agent, the
 * screen size or the core count — those are guesses, and they get real machines
 * wrong in both directions. The only evidence used is how fast this device is
 * actually painting right now.
 *
 * A downgrade needs sustained evidence, not one bad second: several consecutive
 * measurement windows have to come in under the threshold. That matters because
 * the first seconds of a page are the worst ones — fonts, chunks and a WebGPU
 * device are all arriving at once — and judging a machine on that would demote
 * fast hardware for being busy.
 */

interface QualityContextValue extends QualitySettings {
  /** Frames per second over the most recent window; null before the first one. */
  fps: number | null
  /** True once the visitor has chosen a tier, after which measurement stops acting. */
  manual: boolean
  setTier: (tier: QualityTier) => void
  /** Hands control back to measurement. */
  resetToAuto: () => void
  /** Independent of tier: an accessibility preference, not a performance one. */
  reducedMotion: boolean
}

const QualityContext = createContext<QualityContextValue | null>(null)

/** Below this, for several windows running, the device is not keeping up. */
const FPS_FLOOR = 34
/** Length of one measurement window. */
const WINDOW_MS = 1000
/** Consecutive failing windows required before stepping down. */
const STRIKES_TO_DOWNGRADE = 3
/** Ignore the opening seconds; that is startup cost, not steady-state capability. */
const WARMUP_MS = 2500

export function QualityProvider({ children }: { children: React.ReactNode }) {
  const [tier, setTierState] = useState<QualityTier>(DEFAULT_TIER)
  const [manual, setManual] = useState(false)
  const [fps, setFps] = useState<number | null>(null)
  const [reducedMotion, setReducedMotion] = useState(false)

  const strikes = useRef(0)
  const tierRef = useRef<QualityTier>(DEFAULT_TIER)
  const manualRef = useRef(false)

  tierRef.current = tier
  manualRef.current = manual

  // A remembered tier is honoured immediately, so a machine that already proved it
  // cannot hold `full` does not have to fail its way down again on every visit.
  useEffect(() => {
    const stored = readStoredQuality()
    if (stored) {
      setTierState(stored.tier)
      setManual(stored.manual)
    }
  }, [])

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    const apply = () => setReducedMotion(query.matches)
    apply()
    query.addEventListener("change", apply)
    return () => query.removeEventListener("change", apply)
  }, [])

  useEffect(() => {
    let raf = 0
    let frames = 0
    let windowStart = 0
    const mountedAt = performance.now()

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)

      if (windowStart === 0) windowStart = now
      frames++

      const elapsed = now - windowStart
      if (elapsed < WINDOW_MS) return

      const measured = (frames * 1000) / elapsed
      frames = 0
      windowStart = now
      setFps(Math.round(measured))

      if (now - mountedAt < WARMUP_MS) return
      if (manualRef.current) return
      // A backgrounded tab reports near-zero frames; that is not slow hardware.
      if (document.hidden) return
      if (tierRef.current === "essential") return

      if (measured < FPS_FLOOR) {
        strikes.current++
        if (strikes.current >= STRIKES_TO_DOWNGRADE) {
          const next = stepDown(tierRef.current)
          strikes.current = 0
          setTierState(next)
          writeStoredQuality(next, false)
        }
      } else {
        strikes.current = 0
      }
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const setTier = useCallback((next: QualityTier) => {
    setTierState(next)
    setManual(true)
    strikes.current = 0
    writeStoredQuality(next, true)
  }, [])

  const resetToAuto = useCallback(() => {
    setManual(false)
    setTierState(DEFAULT_TIER)
    strikes.current = 0
    writeStoredQuality(DEFAULT_TIER, false)
  }, [])

  const value = useMemo<QualityContextValue>(
    () => ({ ...TIERS[tier], fps, manual, setTier, resetToAuto, reducedMotion }),
    [tier, fps, manual, setTier, resetToAuto, reducedMotion],
  )

  return <QualityContext.Provider value={value}>{children}</QualityContext.Provider>
}

/**
 * Quality settings for the current device. Safe outside the provider: it returns
 * the full tier, so a component rendered on its own never silently degrades.
 */
export function useQuality(): QualityContextValue {
  const ctx = useContext(QualityContext)
  if (ctx) return ctx
  return {
    ...TIERS[DEFAULT_TIER],
    fps: null,
    manual: false,
    setTier: () => {},
    resetToAuto: () => {},
    reducedMotion: false,
  }
}
