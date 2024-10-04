import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Orbit, Brain, BarChart3, Trophy, User } from 'lucide-react'

export default function Component() {
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-indigo-900 to-purple-900 text-white">
      <header className="p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">ExoVerse Explorer</h1>
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
            <TabsTrigger value="creator">ExoVerse Creator</TabsTrigger>
            <TabsTrigger value="exoviz">ExoViz</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Progreso General</CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={33} className="w-full" />
                </CardContent>
                <CardFooter>
                  <p>Nivel 3 - Explorador Novato</p>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Últimos Logros</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-yellow-400" />
                      <span>Descubridor de Supertierras</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-yellow-400" />
                      <span>Maestro de Atmósferas</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Actividad Reciente</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li>Completaste 5 preguntas en ExoQuest</li>
                    <li>Creaste un nuevo ExoVersea: "Zephyria"</li>
                    <li>Analizaste datos de TRAPPIST-1 en ExoViz</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="exoquest">
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-6 w-6" />
                  ExoQuest
                </CardTitle>
                <CardDescription>Desafía tu conocimiento sobre ExoVerseas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p>Pregunta actual: ¿Cuál es el ExoVersea más cercano a la Tierra?</p>
                  <div className="grid grid-cols-2 gap-4">
                    <Button>Próxima Centauri b</Button>
                    <Button>TRAPPIST-1d</Button>
                    <Button>Kepler-186f</Button>
                    <Button>HD 219134 b</Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Badge variant="secondary">Dificultad: Intermedia</Badge>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="creator">
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Orbit className="h-6 w-6" />
                  ExoVerse Creator
                </CardTitle>
                <CardDescription>Diseña tu propio ExoVersea</CardDescription>
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
                <Button className="w-full">Generar ExoVersea</Button>
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
                <CardDescription>Visualiza y analiza datos de ExoVerseas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
                  [Gráfico interactivo de datos de ExoVerseas]
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
        <p>&copy; 2024 ExoVerse Explorer. Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}