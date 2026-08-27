"use client"

import { useState } from "react"
import { useQuality } from "@/src/components/quality-provider"
import { TIER_DESCRIPTIONS, TIER_LABELS, type QualityTier } from "@/src/lib/quality"

/**
 * Lets the visitor see and override the quality tier.
 *
 * Automatic downgrades are decided from measurement, but a visitor who watched the
 * scene simplify itself deserves to know it happened and to say no. Without this
 * the site would silently decide the machine is weak and never let anyone argue.
 *
 * It also states the measured frame rate, so the decision is legible rather than
 * mysterious.
 */

const TIERS: QualityTier[] = ["full", "balanced", "essential"]

export function QualityControl({ className }: { className?: string }) {
  const { tier, fps, manual, setTier, resetToAuto } = useQuality()
  const [open, setOpen] = useState(false)

  return (
    <div className={className}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-2 border border-rule bg-surface/90 px-3 py-1.5 font-mono text-xs uppercase tracking-[0.14em] text-ink-dim transition-colors duration-tick ease-tick hover:border-rule-strong hover:text-ink focus-visible:outline-2 focus-visible:outline-mint"
      >
        <span
          aria-hidden
          className={`h-1.5 w-1.5 rounded-full ${tier === "full" ? "bg-mint" : tier === "balanced" ? "bg-gold" : "bg-ink-faint"}`}
        />
        {TIER_LABELS[tier]}
        {fps !== null && <span className="tabular-nums text-ink-faint">{fps} fps</span>}
      </button>

      {open && (
        <div className="mt-2 w-72 border border-rule bg-surface p-3">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-mint">Rendering quality</p>
          <p className="mt-2 text-xs leading-relaxed text-ink-dim">
            The scene opens at full quality and steps down only if this device cannot hold the frame rate. You can
            override that.
          </p>

          <div className="mt-3 flex flex-col gap-1">
            {TIERS.map((t) => (
              <button
                key={t}
                onClick={() => setTier(t)}
                aria-pressed={tier === t}
                className={`border px-3 py-2 text-left transition-colors duration-tick ease-tick focus-visible:outline-2 focus-visible:outline-mint ${
                  tier === t
                    ? "border-mint-deep bg-mint/10 text-mint"
                    : "border-rule bg-raised text-ink-dim hover:text-ink"
                }`}
              >
                <span className="font-mono text-xs uppercase tracking-[0.12em]">{TIER_LABELS[t]}</span>
                <span className="mt-1 block text-xs leading-snug opacity-80">{TIER_DESCRIPTIONS[t]}</span>
              </button>
            ))}
          </div>

          {manual && (
            <button
              onClick={resetToAuto}
              className="mt-3 font-mono text-xs uppercase tracking-[0.12em] text-ink-faint underline decoration-mint underline-offset-4 transition-colors duration-tick ease-tick hover:text-ink"
            >
              Back to automatic
            </button>
          )}
        </div>
      )}
    </div>
  )
}
