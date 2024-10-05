"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, BarChart3, Trophy, User } from 'lucide-react'
import { Dashboard } from '@/components/dashboard'
import Link from "next/link"
export default function ExoPlanetPlatform() {
  const [isRedirecting, setIsRedirecting] = useState(false)
  const router = useRouter()

  const handleExoQuestRedirect = () => {
    setIsRedirecting(true)
    setTimeout(() => {
      router.push('/exoquest/game')
    }, 500) // Delay to allow for exit animation
  }

  return (
    <motion.div 
      className="flex flex-col h-screen bg-gradient-to-br from-indigo-900 to-purple-900 text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <header className="p-4 flex justify-between items-center">
        <Link href = "/">
        <h1 className="text-2xl font-bold">ExoQuest</h1>
        </Link>
      </header>
      
      <main className="flex-grow p-4 overflow-auto">
        <Tabs defaultValue="exoquest" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="exoquest">ExoQuest</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          </TabsList>
          
          
          <TabsContent value="dashboard">
            <Dashboard />
          </TabsContent>
          
          <TabsContent value="exoquest">
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 ">
                  <Brain className="h-6 w-6" />
                  ExoQuest
                </CardTitle>
                <CardDescription>Challenge your exoplanet knowledge</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Ready to test your knowledge about exoplanets? ExoQuest challenges you with fascinating questions about these distant worlds.</p>
                <Button onClick={handleExoQuestRedirect} className="w-full" disabled={isRedirecting}>
                  {isRedirecting ? 'Loading...' : 'Start ExoQuest'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="p-4 text-center">
        <p>&copy; 2024 ExoVerse.</p>
      </footer>
    </motion.div>
  )
}