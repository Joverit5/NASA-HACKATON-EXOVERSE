'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { WarpSpeed } from './ui/CosmicEffects'

export const LoadingScreen = () => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress === 100) {
          clearInterval(timer)
          return 100
        }
        const newProgress = oldProgress + 1
        return newProgress
      })
    }, 50)

    return () => {
      clearInterval(timer)
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <WarpSpeed />
      <div className="relative z-10 text-center">
        <motion.h2 
          className="text-4xl font-bold text-white mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          ExoVerse
        </motion.h2>
        <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-blue-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <motion.p 
          className="mt-2 text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Starting the cosmic journey...
        </motion.p>
      </div>
    </div>
  )
}

