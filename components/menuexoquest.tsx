"use client"

import React, { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, Rocket, ChevronRight } from 'lucide-react'
import { Dashboard } from '@/components/dashboard'
import Link from "next/link"
import dynamic from 'next/dynamic'

const CoverParticles = dynamic(() => import("@/components/ui/star_particles"), {
  ssr: false,
  loading: () => <div className="h-screen bg-blue-950" />
});

export default function ExoPlanetPlatform() {
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [showDifficultyMenu, setShowDifficultyMenu] = useState(false)
  const router = useRouter()

  const handleExoQuestRedirect = useCallback((difficulty: string) => {
    setIsRedirecting(true)
    setTimeout(() => {
      router.push(`/exoquest/game?difficulty=${difficulty}`)
    }, 500) 
  }, [router])

  return (
    <motion.div 
      className="flex flex-col min-h-screen bg-blue-950 text-white relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <CoverParticles />
      <div className="absolute inset-0 bg-gradient-to-br from-black to-purple-900/20" />
      
      <header className="p-4 flex justify-between items-center relative z-10">
        <Link href="/">
          <h1 className="text-2xl font-bold">ExoQuest</h1>
        </Link>
      </header>
      
      <main className="flex-grow p-4 overflow-auto relative z-10">
        <Card className="w-full max-w-4xl mx-auto bg-indigo-900/30 border-indigo-500/30 backdrop-blur-md">
          <CardContent className="p-0">
            <Tabs defaultValue="exoquest" className="w-full">
              <TabsList className="grid w-full grid-cols-2 rounded-t-lg overflow-hidden bg-transparent">
                <TabsTrigger 
                  value="exoquest" 
                  className="text-lg font-semibold py-3 px-6 text-indigo-200 bg-indigo-900/50 data-[state=active]:bg-indigo-700 data-[state=active]:text-white transition-all duration-300 rounded-tl-xl flex items-center justify-center"
                >
                  ExoQuest
                </TabsTrigger>
                <TabsTrigger 
                  value="dashboard" 
                  className="text-lg font-semibold py-3 px-6 text-indigo-200 bg-indigo-900/50 data-[state=active]:bg-indigo-700 data-[state=active]:text-white transition-all duration-300 rounded-tr-xl flex items-center justify-center"
                >
                  Dashboard
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="dashboard" className="mt-0 p-6">
                <Dashboard />
              </TabsContent>
              
              <TabsContent value="exoquest" className="mt-0 p-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="flex items-center gap-2 text-3xl text-white">
                      <Brain className="h-9 w-8 text-indigo-300" />
                      ExoQuest
                    </CardTitle>
                    <CardDescription className="text-lg text-indigo-200">Challenge your exoplanet knowledge</CardDescription>
                  </CardHeader>
                  <CardContent className="px-0">
                    <p className="mb-6 text-lg text-indigo-100">Ready to embark on a cosmic journey? ExoQuest challenges you with fascinating questions about distant worlds and the wonders of our universe.</p>
                    <AnimatePresence mode="wait">
                      {!showDifficultyMenu ? (
                        <motion.div
                          key="start-button"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Button 
                            onClick={() => setShowDifficultyMenu(true)} 
                            className="w-full py-6 text-xl bg-indigo-600 hover:bg-indigo-700 transition-all duration-300 text-white"
                          >
                            <Rocket className="mr-2 h-6 w-6" /> Launch ExoQuest
                          </Button>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="difficulty-menu"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-4"
                        >
                          <p className="text-center font-semibold text-xl mb-4 text-white">Choose your mission difficulty:</p>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {['easy', 'intermediate', 'hard'].map((level) => (
                              <Button 
                                key={level}
                                onClick={() => handleExoQuestRedirect(level)} 
                                className="w-full py-6 text-lg capitalize bg-indigo-600 hover:bg-indigo-700 transition-all duration-300 text-white"
                                disabled={isRedirecting}
                              >
                                {level} <ChevronRight className="ml-2 h-5 w-5" />
                              </Button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </motion.div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
      
      <footer className="p-4 text-center text-indigo-200 relative z-10">
        <p>&copy; 2024 ExoVerse. Exploring the cosmos, one question at a time.</p>
      </footer>
    </motion.div>
  )
}