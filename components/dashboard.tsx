import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Trophy } from 'lucide-react'

type Achievement = {
  name: string
  unlocked: boolean
}

export function Dashboard() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAchievements()
  }, [])

  const fetchAchievements = async () => {
    try {
      const response = await fetch('/api/achievements')
      if (!response.ok) {
        throw new Error('Failed to fetch achievements')
      }
      const data = await response.json()
      setAchievements(data)
    } catch (error) {
      console.error('Error fetching achievements:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate progress based on unlocked achievements
  const unlockedAchievements = achievements.filter(a => a.unlocked).length
  const totalAchievements = achievements.length
  const progressPercentage = (unlockedAchievements / totalAchievements) * 100

  if (isLoading) {
    return <div>Loading achievements...</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>General Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={progressPercentage} className="w-full" />
          <p className="mt-2">
            {unlockedAchievements} of {totalAchievements} completed achievements
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {achievements.map((achievement, index) => (
              <li key={index} className="flex items-center gap-2">
                <Trophy className={`h-4 w-4 ${achievement.unlocked ? 'text-yellow-400' : 'text-gray-400'}`} />
                <span className={achievement.unlocked ? 'font-medium' : 'text-gray-500'}>
                  {achievement.name}
                </span>
                {achievement.unlocked && (
                  <Badge variant="secondary" className="ml-auto">Unlucked</Badge>
                )}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}