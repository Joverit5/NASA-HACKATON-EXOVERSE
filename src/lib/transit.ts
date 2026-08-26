/**
 * Transit light-curve geometry.
 *
 * The direction's thesis is that the dip IS the planet: its depth is how much
 * starlight the planet blocks, and its width is how long the crossing takes. Both
 * are computed from real archive parameters, never chosen for looks. A curve you
 * cannot read the planet off is decoration, which is exactly what this build
 * refuses.
 */

export interface TransitParams {
  /** Fractional depth, (Rp / R*)^2. */
  depth: number
  /** Orbital period in days, which sets how long the crossing lasts. */
  periodDays: number | null
}

export interface CurvePoint {
  /** Phase from -1 to 1, where 0 is mid-transit. */
  x: number
  /** Normalised flux: 1.0 out of transit, 1 - depth at the floor. */
  flux: number
}

/**
 * Transit duration as a fraction of the plotted window.
 *
 * A real duration needs the semi-major axis and impact parameter, which the
 * composite table does not reliably carry. Period alone still orders planets
 * correctly — a hot Jupiter on a 3-day orbit crosses fast, a 400-day world crosses
 * slowly — so the width is scaled from period and honestly labelled as indicative.
 */
export function transitHalfWidth(periodDays: number | null): number {
  if (periodDays === null || periodDays <= 0) return 0.16
  // Log scaling keeps a 0.5-day and a 4000-day orbit both legible in one frame.
  const t = Math.log10(Math.max(periodDays, 0.3))
  return Math.min(0.34, Math.max(0.06, 0.05 + t * 0.07))
}

/**
 * Sample the curve. Ingress and egress are smoothed with a smoothstep rather than
 * drawn as vertical walls: real limb darkening rounds the shoulders, and a square
 * well reads as a UI element instead of a measurement.
 */
export function sampleCurve(params: TransitParams, samples = 240): CurvePoint[] {
  const half = transitHalfWidth(params.periodDays)
  const soft = half * 0.3
  const points: CurvePoint[] = []

  for (let i = 0; i <= samples; i++) {
    const x = -1 + (2 * i) / samples
    points.push({ x, flux: 1 - params.depth * wellDepth(Math.abs(x), half, soft) })
  }
  return points
}

/** 0 outside the transit, 1 at the floor, smoothed across ingress and egress. */
function wellDepth(distance: number, half: number, soft: number): number {
  if (distance > half + soft) return 0
  if (distance < half - soft) return 1
  const t = (half + soft - distance) / (2 * soft)
  return t * t * (3 - 2 * t)
}

/**
 * An SVG path for the curve, mapped into a viewBox.
 *
 * `depthScale` exaggerates the vertical axis. Real depths run from ~1e-5 to ~2e-2,
 * so a true-to-scale plot would be a flat line for almost every planet. The axis is
 * therefore normalised per planet and the real figure is always printed beside it —
 * the shape is comparative, the number is the measurement.
 */
export function curvePath(points: CurvePoint[], width: number, height: number, depth: number): string {
  const floor = height * 0.72
  const ceiling = height * 0.22
  const span = floor - ceiling

  return points
    .map((p, i) => {
      const px = ((p.x + 1) / 2) * width
      const drop = depth > 0 ? (1 - p.flux) / depth : 0
      const py = ceiling + drop * span
      return `${i === 0 ? "M" : "L"}${px.toFixed(2)},${py.toFixed(2)}`
    })
    .join(" ")
}

/** Depth as parts per million, the unit transit photometry is actually quoted in. */
export function depthPpm(depth: number | null): string {
  if (depth === null || !Number.isFinite(depth)) return "—"
  const ppm = depth * 1e6
  if (ppm >= 10000) return `${(ppm / 10000).toFixed(1)}%`
  return `${Math.round(ppm).toLocaleString()} ppm`
}
