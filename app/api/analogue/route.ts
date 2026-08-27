import type { NextRequest } from "next/server"
import { getCatalog } from "@/src/lib/exoplanetCatalog"

/**
 * The real world most like the one the visitor just built.
 *
 * Similarity is measured in log space across radius, equilibrium temperature and
 * orbital period, because all three span orders of magnitude — a linear distance
 * would let period alone decide every match. Each axis is weighted by how much it
 * actually characterises a planet: radius most, then temperature, then period.
 *
 * This is what turns ExoCreator from a toy into an instrument. You build a world,
 * and the archive tells you which of its 6,354 entries you just re-derived.
 */

interface Query {
  radius: number
  tempK: number
  periodDays: number
}

function logDistance(a: number, b: number): number {
  if (a <= 0 || b <= 0) return 4
  return Math.abs(Math.log10(a) - Math.log10(b))
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q: Query = {
    radius: Number(searchParams.get("radius") ?? 1),
    tempK: Number(searchParams.get("tempK") ?? 255),
    periodDays: Number(searchParams.get("periodDays") ?? 365),
  }

  try {
    const catalog = await getCatalog()

    const scored = catalog
      .map((p) => {
        const r = Number.parseFloat(p.radius)
        const period = Number.parseFloat(p.orbitalPeriod)
        if (Number.isNaN(r) || p.temperature === null || Number.isNaN(period)) return null

        const score =
          logDistance(r, q.radius) * 1.0 +
          logDistance(p.temperature, q.tempK) * 0.7 +
          logDistance(period, q.periodDays) * 0.4

        return { planet: p, score }
      })
      .filter((x): x is { planet: (typeof catalog)[number]; score: number } => x !== null)
      .sort((a, b) => a.score - b.score)
      .slice(0, 3)

    return Response.json({
      matches: scored.map((s) => ({
        ...s.planet,
        similarity: Number(s.score.toFixed(3)),
      })),
      comparedAgainst: catalog.length,
    })
  } catch (err: any) {
    return Response.json({ error: "The archive is unavailable.", details: err?.message }, { status: 503 })
  }
}
