import { getCatalog, type ProcessedExoplanet } from "@/src/lib/exoplanetCatalog"

/**
 * Archive-derived quiz questions.
 *
 * The authored bank holds 61 questions and a run draws 10, so two games exhaust a
 * difficulty. Rather than only writing more, ExoQuest also generates questions from
 * the live catalog: every fact is read straight from the NASA archive, so the supply
 * is effectively unbounded and nothing can be factually stale or invented.
 *
 * Difficulty is derived from how well studied a planet is. `sources` counts published
 * references in the archive, which is a good proxy for fame: Proxima Cen b and
 * TRAPPIST-1 e carry dozens, a single-detection microlensing world carries one.
 */

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: string
  explanation: string
  difficulty: "Easy" | "Intermediate" | "Hard"
  /** Present only on generated questions, so the UI can credit the archive. */
  generated?: true
}

type Difficulty = QuizQuestion["difficulty"]

function shuffle<T>(items: T[]): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const pick = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)]

/** Numeric value behind a formatted field such as "1402.3 ly" or "Not available". */
function value(formatted: string): number | null {
  const n = Number.parseFloat(formatted)
  return Number.isNaN(n) ? null : n
}

/**
 * Pools by how well studied each planet is. Easy questions use famous worlds and
 * wide margins; hard ones use the long tail and values that sit close together.
 */
function pools(catalog: ProcessedExoplanet[]) {
  const ranked = [...catalog].sort((a, b) => b.sources - a.sources)
  return {
    Easy: ranked.slice(0, 300),
    Intermediate: ranked.slice(200, 1500),
    Hard: ranked.slice(1200),
  }
}

/** Four distinct planets from a pool that all have a usable value for `field`. */
function sample(pool: ProcessedExoplanet[], field: (p: ProcessedExoplanet) => number | null, count = 4) {
  const usable = pool.filter((p) => field(p) !== null)
  if (usable.length < count) return null

  const chosen: ProcessedExoplanet[] = []
  const seen = new Set<string>()
  let guard = 0
  while (chosen.length < count && guard++ < 200) {
    const p = pick(usable)
    if (seen.has(p.name)) continue
    seen.add(p.name)
    chosen.push(p)
  }
  return chosen.length === count ? chosen : null
}

type Builder = (pool: ProcessedExoplanet[], difficulty: Difficulty) => QuizQuestion | null

const nearest: Builder = (pool, difficulty) => {
  const picks = sample(pool, (p) => value(p.distance))
  if (!picks) return null
  const winner = picks.reduce((a, b) => (value(a.distance)! < value(b.distance)! ? a : b))
  return {
    id: `gen-near-${winner.name}`,
    question: "Which of these exoplanets lies closest to Earth?",
    options: shuffle(picks.map((p) => p.name)),
    correctAnswer: winner.name,
    explanation: `${winner.name} sits ${winner.distance} away, orbiting ${winner.hostStar}. ${picks
      .filter((p) => p.name !== winner.name)
      .map((p) => `${p.name} is ${p.distance}`)
      .join(", ")}.`,
    difficulty,
    generated: true,
  }
}

const largest: Builder = (pool, difficulty) => {
  const picks = sample(pool, (p) => value(p.radius))
  if (!picks) return null
  const winner = picks.reduce((a, b) => (value(a.radius)! > value(b.radius)! ? a : b))
  return {
    id: `gen-big-${winner.name}`,
    question: "Which of these exoplanets has the largest radius?",
    options: shuffle(picks.map((p) => p.name)),
    correctAnswer: winner.name,
    explanation: `${winner.name} measures ${winner.radius}, where Earth is 1 R⊕. It is classified as a ${winner.type.toLowerCase()}.`,
    difficulty,
    generated: true,
  }
}

const hottest: Builder = (pool, difficulty) => {
  const picks = sample(pool, (p) => p.temperature)
  if (!picks) return null
  const winner = picks.reduce((a, b) => (a.temperature! > b.temperature! ? a : b))
  return {
    id: `gen-hot-${winner.name}`,
    question: "Which of these exoplanets is the hottest?",
    options: shuffle(picks.map((p) => p.name)),
    correctAnswer: winner.name,
    explanation: `${winner.name} has an equilibrium temperature of ${Math.round(winner.temperature!)} K. For comparison, Earth sits near 255 K.`,
    difficulty,
    generated: true,
  }
}

const discoveryYear: Builder = (pool, difficulty) => {
  const usable = pool.filter((p) => p.discoveryYear !== null)
  if (usable.length < 1) return null
  const target = pick(usable)
  const year = target.discoveryYear!
  const offsets = shuffle([-7, -4, -2, 2, 3, 6]).slice(0, 3)
  const options = shuffle([year, ...offsets.map((o) => year + o)].map(String))
  return {
    id: `gen-year-${target.name}`,
    question: `In what year was ${target.name} discovered?`,
    options,
    correctAnswer: String(year),
    explanation: `${target.name} was discovered in ${year} using the ${target.discoveryMethod.toLowerCase()} method.`,
    difficulty,
    generated: true,
  }
}

const method: Builder = (pool, difficulty) => {
  const usable = pool.filter((p) => p.discoveryMethod && p.discoveryMethod !== "Unknown")
  if (usable.length < 1) return null
  const target = pick(usable)
  const alternatives = ["Transit", "Radial Velocity", "Microlensing", "Imaging", "Astrometry", "Transit Timing Variations"]
  const distractors = shuffle(alternatives.filter((m) => m !== target.discoveryMethod)).slice(0, 3)
  return {
    id: `gen-method-${target.name}`,
    question: `By which method was ${target.name} discovered?`,
    options: shuffle([target.discoveryMethod, ...distractors]),
    correctAnswer: target.discoveryMethod,
    explanation: `${target.name} was found by ${target.discoveryMethod.toLowerCase()} in ${target.discoveryYear ?? "an unrecorded year"}.`,
    difficulty,
    generated: true,
  }
}

const hostStar: Builder = (pool, difficulty) => {
  const picks = sample(pool, () => 1)
  if (!picks) return null
  const target = picks[0]
  if (picks.some((p, i) => i > 0 && p.hostStar === target.hostStar)) return null
  return {
    id: `gen-host-${target.name}`,
    question: `Which exoplanet orbits the star ${target.hostStar}?`,
    options: shuffle(picks.map((p) => p.name)),
    correctAnswer: target.name,
    explanation: `${target.name} orbits ${target.hostStar}, ${target.distance} from Earth.`,
    difficulty,
    generated: true,
  }
}

const orbitalPeriod: Builder = (pool, difficulty) => {
  const picks = sample(pool, (p) => value(p.orbitalPeriod))
  if (!picks) return null
  const winner = picks.reduce((a, b) => (value(a.orbitalPeriod)! < value(b.orbitalPeriod)! ? a : b))
  return {
    id: `gen-period-${winner.name}`,
    question: "Which of these exoplanets has the shortest year?",
    options: shuffle(picks.map((p) => p.name)),
    correctAnswer: winner.name,
    explanation: `${winner.name} completes an orbit in ${winner.orbitalPeriod}, so a year there is shorter than on any of the others.`,
    difficulty,
    generated: true,
  }
}

interface NamedBuilder {
  /** Template key: two questions sharing one read as a repeat even with different subjects. */
  key: string
  build: Builder
}

const BUILDERS: NamedBuilder[] = [
  { key: "nearest", build: nearest },
  { key: "largest", build: largest },
  { key: "hottest", build: hottest },
  { key: "year", build: discoveryYear },
  { key: "method", build: method },
  { key: "host", build: hostStar },
  { key: "period", build: orbitalPeriod },
]

/** At most this many questions from one template in a single round. */
const MAX_PER_TEMPLATE = 1

/**
 * Build `count` archive-derived questions. Returns fewer (or none) rather than
 * throwing if the archive is unreachable — the authored bank still carries the game.
 */
export async function generateQuestions(count: number, difficulty: Difficulty | "all"): Promise<QuizQuestion[]> {
  let catalog: ProcessedExoplanet[]
  try {
    catalog = await getCatalog()
  } catch {
    return []
  }
  if (catalog.length < 50) return []

  const byDifficulty = pools(catalog)
  const out: QuizQuestion[] = []
  const usedIds = new Set<string>()
  const templateUse = new Map<string, number>()

  // Enough templates for the round, or the cap has to relax so it can still be filled.
  const perTemplate = Math.max(MAX_PER_TEMPLATE, Math.ceil(count / BUILDERS.length))

  let guard = 0
  while (out.length < count && guard++ < count * 25) {
    const level: Difficulty = difficulty === "all" ? pick(["Easy", "Intermediate", "Hard"] as Difficulty[]) : difficulty
    const builder = pick(BUILDERS)
    if ((templateUse.get(builder.key) ?? 0) >= perTemplate) continue

    const q = builder.build(byDifficulty[level], level)
    if (!q || usedIds.has(q.id)) continue
    // A question whose options contain duplicates is unanswerable.
    if (new Set(q.options).size !== q.options.length) continue

    usedIds.add(q.id)
    templateUse.set(builder.key, (templateUse.get(builder.key) ?? 0) + 1)
    out.push(q)
  }

  return out
}
