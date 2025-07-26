import { NextRequest, NextResponse } from 'next/server';

const INITIAL_ACHIEVEMENTS = [
  {
    name: "Superland Discoverer",
    description: "Enter ExoVis for the first time",
    unlocked: false
  },
  {
    name: "Master of Atmospheres",
    description: "Create your first planet in ExoCreator",
    unlocked: false
  },
  {
    name: "ExoQuest Master",
    description: "Win ExoQuest by getting 6 or more correct answers",
    unlocked: false
  }
];

export async function GET(req: NextRequest) {
  return NextResponse.json(INITIAL_ACHIEVEMENTS);
}
