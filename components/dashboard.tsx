'use client'

import { useState, useEffect, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Star } from "lucide-react"

type Achievement = {
  name: string
  unlocked: boolean
}

export function Dashboard() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchAchievements = useCallback(async () => {
    try {
      const response = await fetch("/api/achievements")
      if (!response.ok) {
        throw new Error("Failed to fetch achievements")
      }
      const data = await response.json()
      setAchievements(data)
    } catch (error) {
      console.error("Error fetching achievements:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAchievements()
  }, [fetchAchievements])

  const { unlockedAchievements, totalAchievements, progressPercentage } = useMemo(() => {
    const unlockedCount = achievements.filter((a) => a.unlocked).length
    return {
      unlockedAchievements: unlockedCount,
      totalAchievements: achievements.length,
      progressPercentage: achievements.length > 0 ? (unlockedCount / achievements.length) * 100 : 0,
    }
  }, [achievements])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="bg-indigo-900/30 border-indigo-500/30 backdrop-blur-md overflow-hidden">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white flex items-center">
            <Star className="mr-2 h-6 w-6 text-yellow-400" />
            General Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-200 bg-indigo-600">
                  Progress
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-indigo-200">
                  {progressPercentage.toFixed(0)}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
              <motion.div
                style={{ width: `${progressPercentage}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
          <p className="text-indigo-200 text-lg mt-4">
            {unlockedAchievements} of {totalAchievements} completed achievements
          </p>
        </CardContent>
      </Card>

      <Card className="bg-indigo-900/30 border-indigo-500/30 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white flex items-center">
            <Trophy className="mr-2 h-6 w-6 text-yellow-400" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            <AnimatePresence>
              {achievements.map((achievement, index) => (
                <motion.li
                  key={index}
                  className="flex items-center justify-between bg-indigo-800/50 p-3 rounded-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="flex items-center">
                    <Trophy
                      className={`h-5 w-5 mr-3 ${
                        achievement.unlocked ? "text-yellow-400" : "text-gray-400"
                      }`}
                    />
                    <span
                      className={`font-medium ${
                        achievement.unlocked ? "text-white" : "text-indigo-300"
                      }`}
                    >
                      {achievement.name}
                    </span>
                  </div>
                  {achievement.unlocked && (
                    <Badge variant="secondary" className="bg-indigo-600 text-white">
                      Unlocked
                    </Badge>
                  )}
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}