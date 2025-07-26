import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const difficulty = searchParams.get('difficulty');
    const jsonDirectory = path.join(process.cwd(), 'src', 'data', 'exoplanet-questions.json');
    const fileContents = await fs.readFile(jsonDirectory, 'utf8');
    let questions = JSON.parse(fileContents);

    if (difficulty && difficulty !== 'all') {
      questions = questions.filter((q: any) => q.difficulty.toLowerCase() === difficulty.toLowerCase());
    }

    // Shuffle and select 10 questions
    const selectedQuestions = questions.sort(() => 0.5 - Math.random()).slice(0, 10);

    return NextResponse.json(selectedQuestions);
  } catch (error) {
    return NextResponse.json({ error: 'Unable to load questions' }, { status: 500 });
  }
}
