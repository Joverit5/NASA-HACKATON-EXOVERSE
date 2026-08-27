"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import type { DerivedPlanet } from "@/src/lib/planetPhysics"
import { formatC, formatDays, formatDepth, formatK } from "@/src/lib/planetPhysics"
import type { ProcessedExoplanet } from "@/src/lib/exoplanetCatalog"
import { TransitCurve } from "@/src/components/transit-curve"

/**
 * What the visitor actually built, measured.
 *
 * Everything here is derived from the parameters on the control panel — nothing is
 * invented, and where radius genuinely fails to constrain a quantity the panel says
 * so instead of printing a confident number. Every figure is set in mono, per the
 * readout rule; the labels are the only serif on the panel.
 */

interface PlanetReadoutProps {
  planet: DerivedPlanet
  index: number
  onClose: () => void
}

interface Analogue extends ProcessedExoplanet {
  similarity: number
}

function Row({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2 border-b border-rule last:border-b-0">
      <dt className="text-xs text-ink-dim shrink-0">{label}</dt>
      <dd className="text-right min-w-0">
        <span className="font-mono text-sm text-ink tabular-nums">{value}</span>
        {hint && <span className="block font-mono text-xs text-ink-faint mt-0.5">{hint}</span>}
      </dd>
    </div>
  )
}

export function PlanetReadout({ planet, index, onClose }: PlanetReadoutProps) {
  const [analogue, setAnalogue] = useState<Analogue | null>(null)
  const [analogueState, setAnalogueState] = useState<"loading" | "ready" | "unavailable">("loading")

  // The archive decides which real world this most resembles.
  useEffect(() => {
    const controller = new AbortController()
    const params = new URLSearchParams({
      radius: String(planet.radiusEarth),
      tempK: String(Math.round(planet.equilibriumTempK)),
      periodDays: String(planet.orbitalPeriodDays.toFixed(2)),
    })

    setAnalogueState("loading")
    fetch(`/api/analogue?${params}`, { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("unavailable"))))
      .then((d) => {
        if (d?.matches?.length) {
          setAnalogue(d.matches[0])
          setAnalogueState("ready")
        } else {
          setAnalogueState("unavailable")
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setAnalogueState("unavailable")
      })

    return () => controller.abort()
  }, [planet.radiusEarth, planet.equilibriumTempK, planet.orbitalPeriodDays])

  const massText =
    planet.mass.value === null ? "Not constrained" : `${planet.mass.value.toFixed(2)} M⊕`

  return (
    <aside
      className="fixed bottom-4 right-4 z-30 w-[min(24rem,calc(100vw-2rem))] max-h-[calc(100vh-9rem)] overflow-y-auto border border-rule bg-surface text-ink"
      aria-label="Derived measurements for your planet"
    >
      <header className="sticky top-0 flex items-center justify-between gap-3 border-b border-rule bg-raised px-4 py-3">
        <div className="min-w-0">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-mint">Derived measurements</p>
          <h2 className="truncate text-base">
            World {String(index).padStart(3, "0")} · {planet.classification}
          </h2>
        </div>
        <button
          onClick={onClose}
          aria-label="Close measurements"
          className="shrink-0 rounded-full p-1.5 text-ink-dim transition-colors duration-tick ease-tick hover:bg-rule hover:text-ink focus-visible:outline-2 focus-visible:outline-mint"
        >
          <X className="h-4 w-4" />
        </button>
      </header>

      <div className="px-4 py-3">
        {/* The transit signature: how detectable this world would be from Earth. */}
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-ink-faint mb-2">
          Transit signature
        </p>
        <TransitCurve
          planet={
            {
              name: `World ${index}`,
              hostStar: planet.star.label,
              orbitalPeriod: `${planet.orbitalPeriodDays.toFixed(1)} days`,
              transitDepth: planet.transitDepth,
              radius: `${planet.radiusEarth.toFixed(2)} R⊕`,
            } as ProcessedExoplanet
          }
          still
        />
        <p className="mt-1 font-mono text-xs text-ink-faint">
          {formatDepth(planet.transitDepth)} of {planet.star.label.toLowerCase()} starlight blocked
        </p>

        <dl className="mt-4">
          <Row label="Classification" value={planet.classification} />
          <Row label="Radius" value={`${planet.radiusEarth.toFixed(2)} R⊕`} />
          <Row
            label="Mass"
            value={massText}
            hint={planet.mass.relation}
          />
          <Row
            label="Density"
            value={planet.densityGCm3 !== null ? `${planet.densityGCm3.toFixed(2)} g/cm³` : "—"}
            hint={planet.densityGCm3 !== null ? "Earth is 5.51" : undefined}
          />
          <Row
            label="Surface gravity"
            value={planet.surfaceGravity !== null ? `${planet.surfaceGravity.toFixed(2)} m/s²` : "—"}
            hint={
              planet.surfaceGravity !== null
                ? `${(planet.surfaceGravity / 9.807).toFixed(2)}× Earth`
                : undefined
            }
          />
          <Row
            label="Escape velocity"
            value={planet.escapeVelocityKms !== null ? `${planet.escapeVelocityKms.toFixed(1)} km/s` : "—"}
          />
        </dl>

        <p className="mt-5 font-mono text-xs uppercase tracking-[0.16em] text-ink-faint mb-1">Orbit</p>
        <dl>
          <Row label="Distance from star" value={`${planet.semiMajorAxisAu.toFixed(3)} AU`} />
          <Row label="Year length" value={formatDays(planet.orbitalPeriodDays)} hint="Kepler's third law" />
          <Row
            label="Starlight received"
            value={`${planet.insolationEarth.toFixed(2)} S⊕`}
            hint={planet.insolationEarth > 1 ? "More than Earth" : "Less than Earth"}
          />
          <Row
            label="Equilibrium temp."
            value={formatK(planet.equilibriumTempK)}
            hint={`${formatC(planet.equilibriumTempK)} · no greenhouse`}
          />
          <Row
            label="Habitable zone"
            value={`${planet.habitableZone.innerAu.toFixed(2)} – ${planet.habitableZone.outerAu.toFixed(2)} AU`}
            hint={planet.inHabitableZone ? "Your orbit is inside it" : "Your orbit is outside it"}
          />
        </dl>

        <p className="mt-5 font-mono text-xs uppercase tracking-[0.16em] text-ink-faint mb-1">Host star</p>
        <dl>
          <Row label="Type" value={`${planet.star.label} (${planet.star.spectralType})`} />
          <Row label="Temperature" value={formatK(planet.star.teff)} />
          <Row label="Luminosity" value={`${planet.star.luminosity} L☉`} />
        </dl>

        {/* Habitability, using the same rule the archive catalog applies. */}
        <div
          className={`mt-5 border px-3 py-2.5 ${
            planet.habitability === "Potentially Habitable"
              ? "border-mint-deep bg-mint/10 text-mint"
              : "border-rule bg-raised text-ink-dim"
          }`}
        >
          <p className="font-mono text-xs uppercase tracking-[0.14em]">{planet.habitability}</p>
          <p className="mt-1 text-xs leading-relaxed">
            {planet.habitability === "Potentially Habitable"
              ? "A rocky world with an equilibrium temperature between 200 and 350 K — the same test the catalog applies to real archive entries."
              : planet.classification === "Gas Giant" || planet.classification === "Hot Jupiter"
                ? "Gas-dominated worlds have no surface for liquid water to sit on."
                : `At ${formatK(planet.equilibriumTempK)} this world falls outside the 200–350 K band used for the rocky habitability test.`}
          </p>
        </div>

        {/* The archive's verdict on what you just re-derived. */}
        <p className="mt-5 font-mono text-xs uppercase tracking-[0.16em] text-ink-faint mb-1">
          Closest real world
        </p>
        {analogueState === "loading" && (
          <p className="font-mono text-xs text-ink-faint py-2">Searching the archive…</p>
        )}
        {analogueState === "unavailable" && (
          <p className="text-xs text-ink-faint py-2">
            The NASA archive is unreachable, so no comparison can be made right now.
          </p>
        )}
        {analogueState === "ready" && analogue && (
          <div className="border border-rule bg-raised px-3 py-2.5">
            <p className="font-mono text-sm text-ink">{analogue.name}</p>
            <p className="mt-1 text-xs text-ink-dim leading-relaxed">
              {analogue.radius} · {analogue.temperature !== null ? formatK(analogue.temperature) : "temp unknown"} ·{" "}
              {analogue.orbitalPeriod}
            </p>
            <p className="mt-1.5 font-mono text-xs text-ink-faint">
              {analogue.distance} away · discovered {analogue.discoveryYear ?? "—"}
            </p>
          </div>
        )}
      </div>
    </aside>
  )
}
