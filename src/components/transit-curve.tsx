"use client"

import { useId } from "react"
import type { ProcessedExoplanet } from "@/src/lib/exoplanetCatalog"
import { sampleCurve, curvePath, transitHalfWidth, depthPpm } from "@/src/lib/transit"
import { useQuality } from "@/src/components/quality-provider"

/**
 * The signature surface: a real transit light curve, and the page's navigation.
 *
 * Scroll position maps to time along the curve, so scrolling IS walking the transit.
 * The playhead is driven by `animation-timeline: scroll()` (see .curve-playhead in
 * globals.css), which runs on the compositor — no requestAnimationFrame, no JS
 * animation runtime, and it costs the same whether one curve is on screen or twenty.
 *
 * This is SVG rather than canvas deliberately. The curve has to be a peer rendering
 * rather than a fallback: crisp at any DPI, selectable, translatable, printable, and
 * readable by a screen reader. There is no separate "accessible version" to drift.
 */

interface TransitCurveProps {
  planet: ProcessedExoplanet
  /** Rendered without motion, for the reduced-motion and no-JS paths. */
  still?: boolean
  /**
   * Card-sized: fewer samples, no axes, no annotation. A catalog page holds sixty
   * of these at once, so the full plot's furniture would be noise and its sample
   * count wasted.
   */
  compact?: boolean
  className?: string
}

const VIEW_W = 1200
const VIEW_H = 420

export function TransitCurve({ planet, still = false, compact = false, className }: TransitCurveProps) {
  const uid = useId().replace(/:/g, "")
  const { curveSamples, ambientMotion, reducedMotion } = useQuality()
  const depth = planet.transitDepth ?? 0
  const periodDays = Number.parseFloat(planet.orbitalPeriod)
  const period = Number.isNaN(periodDays) ? null : periodDays

  const points = sampleCurve({ depth: depth || 0.02, periodDays: period }, compact ? Math.round(curveSamples / 3) : curveSamples)
  const path = curvePath(points, VIEW_W, VIEW_H, depth || 0.02)
  const half = transitHalfWidth(period)

  // Where the floor of the dip sits, so the marker and its label can anchor to it.
  const floorX = VIEW_W / 2
  const floorY = VIEW_H * 0.72
  const baseY = VIEW_H * 0.22

  const hours = ["-6h", "-4h", "-2h", "0", "+2h", "+4h", "+6h"]

  return (
    <figure className={className}>
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="w-full h-auto"
        role="img"
        aria-labelledby={`${uid}-title ${uid}-desc`}
        preserveAspectRatio="xMidYMid meet"
      >
        <title id={`${uid}-title`}>Transit light curve of {planet.name}</title>
        <desc id={`${uid}-desc`}>
          The brightness of {planet.hostStar} dips by {depthPpm(planet.transitDepth)} when {planet.name} crosses in
          front of it. The planet completes an orbit every {planet.orbitalPeriod}.
        </desc>

        <defs>
          <linearGradient id={`${uid}-fill`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--mint))" stopOpacity="0.16" />
            <stop offset="100%" stopColor="hsl(var(--mint))" stopOpacity="0" />
          </linearGradient>
          <clipPath id={`${uid}-clip`}>
            <rect x="0" y="0" width={VIEW_W} height={VIEW_H} />
          </clipPath>
        </defs>

        {/* Photometric grid */}
        <g stroke="hsl(var(--rule))" strokeWidth="1">
          {[0, 1, 2, 3, 4].map((i) => {
            const y = baseY + ((floorY - baseY) / 4) * i
            return <line key={`h${i}`} x1="0" y1={y} x2={VIEW_W} y2={y} />
          })}
          {hours.map((_, i) => {
            const x = (VIEW_W / (hours.length - 1)) * i
            return <line key={`v${i}`} x1={x} y1={baseY - 30} x2={x} y2={floorY + 30} />
          })}
        </g>

        {/* Out-of-transit baseline, the reference the dip is measured against */}
        <line
          x1="0"
          y1={baseY}
          x2={VIEW_W}
          y2={baseY}
          stroke="hsl(var(--ink-faint))"
          strokeWidth="1"
          strokeDasharray="4 6"
        />

        {/* The curve, and the area under it. The dip is the planet. */}
        <g clipPath={`url(#${uid}-clip)`}>
          <path d={`${path} L${VIEW_W},${baseY} L0,${baseY} Z`} fill={`url(#${uid}-fill)`} />
          <path
            d={path}
            fill="none"
            stroke="hsl(var(--mint))"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </g>

        {/* Ingress and egress, where the crossing begins and ends */}
        {!compact && [-half, half].map((h, i) => {
          const x = ((h + 1) / 2) * VIEW_W
          return (
            <line
              key={`c${i}`}
              x1={x}
              y1={baseY}
              x2={x}
              y2={floorY}
              stroke="hsl(var(--mint-deep))"
              strokeWidth="1"
              strokeDasharray="3 5"
            />
          )
        })}

        {!compact && (<>{/* The floor marker carries the measurement */}
        <circle cx={floorX} cy={floorY} r="5" fill="hsl(var(--mint))" />
        <line x1={floorX} y1={floorY} x2={floorX} y2={baseY} stroke="hsl(var(--mint))" strokeWidth="1" opacity="0.4" />

        <text
          x={floorX + 16}
          y={floorY + 6}
          className="font-mono"
          fontSize="20"
          fill="hsl(var(--mint))"
          style={{ letterSpacing: "0.08em" }}
        >
          {depthPpm(planet.transitDepth).toUpperCase()}
        </text>
        <text
          x={floorX + 16}
          y={floorY + 30}
          className="font-mono"
          fontSize="15"
          fill="hsl(var(--ink-faint))"
          style={{ letterSpacing: "0.12em" }}
        >
          THE DIP IS THE PLANET
        </text>

        {/* Flux axis */}
        <text x="8" y={baseY - 10} className="font-mono" fontSize="14" fill="hsl(var(--ink-faint))">
          1.0000
        </text>
        <text x="8" y={floorY + 24} className="font-mono" fontSize="14" fill="hsl(var(--ink-faint))">
          {(1 - depth).toFixed(4)}
        </text>

        {/* Time axis */}
        {hours.map((label, i) => (
          <text
            key={label}
            x={(VIEW_W / (hours.length - 1)) * i}
            y={VIEW_H - 12}
            textAnchor="middle"
            className="font-mono"
            fontSize="14"
            fill="hsl(var(--ink-faint))"
          >
            {label}
          </text>
        ))}</>)}

        {/*
          The playhead. Scroll drives it across the curve; without scroll-driven
          animation support, or under reduced motion, it simply rests at mid-transit.
        */}
        {!still && ambientMotion && !reducedMotion && (
          <g className="curve-playhead">
            <line x1="0" y1={baseY - 40} x2="0" y2={floorY + 40} stroke="hsl(var(--ink))" strokeWidth="1.5" />
            <circle cx="0" cy={baseY - 40} r="4" fill="hsl(var(--ink))" />
          </g>
        )}
      </svg>
    </figure>
  )
}
