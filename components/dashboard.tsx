import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Trophy } from 'lucide-react'

export function Dashboard() {
  // En una aplicación real, obtendrías estos datos de una API o base de datos
  const achievements = [
    { name: "Descubridor de Supertierras", unlocked: true },
    { name: "Maestro de Atmósferas", unlocked: true },
    { name: "ExoQuest Master", unlocked: false },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Progreso General</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={33} className="w-full" />
          <p className="mt-2">Nivel 3 - Explorador Novato</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Logros</CardTitle>
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
                  <Badge variant="secondary" className="ml-auto">Desbloqueado</Badge>
                )}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li>Completaste ExoQuest con éxito</li>
            <li>Creaste un nuevo exoplaneta: "Zephyria"</li>
            <li>Analizaste datos de TRAPPIST-1 en ExoViz</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}