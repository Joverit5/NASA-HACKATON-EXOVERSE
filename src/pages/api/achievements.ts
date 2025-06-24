// pages/api/achievements.ts

import type { NextApiRequest, NextApiResponse } from 'next'

// Solo el handler API y los datos necesarios para el endpoint
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
]

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    res.status(200).json(INITIAL_ACHIEVEMENTS)
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}