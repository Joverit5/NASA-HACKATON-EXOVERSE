import type { NextRequest } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import { generateQuestions, type QuizQuestion } from "@/src/lib/questionGenerator"

/**
 * ExoQuest question supply.
 *
 * A fixed bank always runs dry: 61 authored questions with 10 drawn per run meant two
 * games exhausted a difficulty. Each round now mixes the authored bank (broadened to
 * 90) with questions derived live from the NASA archive, so the supply is unbounded
 * and every generated fact is read from real data rather than invented.
 *
 * If the archive is unreachable the round is filled entirely from the authored bank,
 * so the game never fails because a third-party service is down.
 */

const QUESTIONS_PER_ROUND = 10
/** Share of a round drawn from live archive data when it is available. */
const GENERATED_SHARE = 0.4

function shuffle<T>(items: T[]): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const difficulty = searchParams.get("difficulty") ?? "all"
    const count = Math.min(30, Math.max(1, Number(searchParams.get("count") ?? QUESTIONS_PER_ROUND)))

    const file = path.join(process.cwd(), "src", "data", "exoplanet_questions.json")
    const authoredAll: QuizQuestion[] = JSON.parse(await fs.readFile(file, "utf8"))

    const authored =
      difficulty && difficulty !== "all"
        ? authoredAll.filter((q) => q.difficulty.toLowerCase() === difficulty.toLowerCase())
        : authoredAll

    const wantGenerated = Math.round(count * GENERATED_SHARE)
    const level = (difficulty === "all" ? "all" : difficulty[0].toUpperCase() + difficulty.slice(1).toLowerCase()) as
      | QuizQuestion["difficulty"]
      | "all"

    const generated = await generateQuestions(wantGenerated, level)

    // Whatever generation could not supply is taken from the authored bank.
    const authoredNeeded = count - generated.length
    const round = shuffle([...shuffle(authored).slice(0, authoredNeeded), ...generated])

    return Response.json(round, {
      headers: { "Cache-Control": "no-store" },
    })
  } catch (err: any) {
    return Response.json({ error: "Unable to load questions", details: err?.message }, { status: 500 })
  }
}
