import { NextApiRequest, NextApiResponse } from 'next'

type Achievement = {
  name: string
  unlocked: boolean
}

let achievements: Achievement[] = [
  { name: "Superland Discoverer", unlocked: false },
  { name: "Master of Atmospheres", unlocked: false },
  { name: "ExoQuest Master", unlocked: false },
]

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Retrieve achievements from session storage if available
    const sessionAchievements = global.sessionStorage?.getItem('achievements')
    if (sessionAchievements) {
      achievements = JSON.parse(sessionAchievements)
    }
    res.status(200).json(achievements)
  } else if (req.method === 'POST') {
    const { name } = req.body

    if (!name) {
      return res.status(400).json({ error: 'Achievement name is required' })
    }

    const achievementIndex = achievements.findIndex(a => a.name === name)

    if (achievementIndex === -1) {
      return res.status(404).json({ error: 'Achievement not found' })
    }

    achievements[achievementIndex].unlocked = true

    // Store updated achievements in session storage
    if (global.sessionStorage) {
      global.sessionStorage.setItem('achievements', JSON.stringify(achievements))
    }

    res.status(200).json({ message: 'Achievement updated successfully', achievements })
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}