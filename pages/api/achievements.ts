import { NextApiRequest, NextApiResponse } from 'next'

// Define the Achievement type
type Achievement = {
  name: string
  unlocked: boolean
}

// Initialize achievements (in a real app, this would be stored in a database)
let achievements: Achievement[] = [
  { name: "Superland Discoverer", unlocked: false },
  { name: "Master of Atmospheres", unlocked: false },
  { name: "ExoQuest Master", unlocked: false },
]

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Return all achievements
    res.status(200).json(achievements)
  } else if (req.method === 'POST') {
    // Update an achievement
    const { name } = req.body

    if (!name) {
      return res.status(400).json({ error: 'Achievement name is required' })
    }

    const achievementIndex = achievements.findIndex(a => a.name === name)

    if (achievementIndex === -1) {
      return res.status(404).json({ error: 'Achievement not found' })
    }

    achievements[achievementIndex].unlocked = true

    res.status(200).json({ message: 'Achievement updated successfully', achievements })
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}