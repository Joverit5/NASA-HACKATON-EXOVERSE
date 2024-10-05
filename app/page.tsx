"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Orbit, Brain, BarChart3, Trophy, User } from 'lucide-react'
import { Dashboard } from '@/components/dashboard'
export default function ExoPlanetPlatform() {
  const [isRedirecting, setIsRedirecting] = useState(false)
  const router = useRouter()

  const handleExoQuestRedirect = () => {
    setIsRedirecting(true)
    setTimeout(() => {
      router.push('/exoquest')
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
        <h1 className="text-2xl font-bold">ExoPlanet Explorer</h1>
        <Button variant="outline" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Mi Perfil
        </Button>
      </header>
      
      <main className="flex-grow p-4 overflow-auto">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="exoquest">ExoQuest</TabsTrigger>
            <TabsTrigger value="creator">Exoplanet Creator</TabsTrigger>
            <TabsTrigger value="exoviz">ExoViz</TabsTrigger>
          </TabsList>
          
          
          <TabsContent value="dashboard">
            <Dashboard />
          </TabsContent>
          
          <TabsContent value="exoquest">
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-6 w-6" />
                  ExoQuest
                </CardTitle>
                <CardDescription>Desafía tu conocimiento sobre exoplanetas</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">¿Listo para poner a prueba tus conocimientos sobre exoplanetas? ExoQuest te desafía con preguntas fascinantes sobre estos mundos distantes.</p>
                <Button onClick={handleExoQuestRedirect} className="w-full" disabled={isRedirecting}>
                  {isRedirecting ? 'Cargando...' : 'Iniciar ExoQuest'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="creator">
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Orbit className="h-6 w-6" />
                  Exoplanet Creator
                </CardTitle>
                <CardDescription>Diseña tu propio exoplaneta</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2">Tamaño del planeta</label>
                    <input type="range" min="0" max="100" className="w-full" />
                  </div>
                  <div>
                    <label className="block mb-2">Distancia a la estrella</label>
                    <input type="range" min="0" max="100" className="w-full" />
                  </div>
                  <div>
                    <label className="block mb-2">Composición atmosférica</label>
                    <select className="w-full p-2 rounded bg-gray-700">
                      <option>Rica en hidrógeno</option>
                      <option>Similar a la Tierra</option>
                      <option>Sin atmósfera</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2">Tipo de estrella</label>
                    <select className="w-full p-2 rounded bg-gray-700">
                      <option>Enana roja</option>
                      <option>Similar al Sol</option>
                      <option>Gigante azul</option>
                    </select>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Generar Exoplaneta</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="exoviz">
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-6 w-6" />
                  ExoViz
                </CardTitle>
                <CardDescription>Visualiza y analiza datos de exoplanetas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
                  [Gráfico interactivo de datos de exoplanetas]
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Cambiar Visualización</Button>
                <Button variant="outline">Exportar Datos</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="p-4 text-center">
        <p>&copy; 2024 ExoPlanet Explorer. Todos los derechos reservados.</p>
      </footer>
    </motion.div>
  )
}