"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Star, AlertTriangle, ChevronRight } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: string
  explanation: string
  difficulty: string
}

export default function ExoQuest() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState("")
  const [isAnswered, setIsAnswered] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Simular la obtención de preguntas de una API
      await new Promise(resolve => setTimeout(resolve, 1500))
      setQuestions([
        {
          id: "1",
          question: "¿Cuál es el exoplaneta más cercano a la Tierra?",
          options: ["Próxima Centauri b", "TRAPPIST-1d", "Kepler-186f", "HD 219134 b"],
          correctAnswer: "Próxima Centauri b",
          explanation: "Próxima Centauri b es el exoplaneta confirmado más cercano a la Tierra, orbitando la estrella más cercana a nuestro Sol, Próxima Centauri, a solo 4.2 años luz de distancia.",
          difficulty: "Fácil"
        },
        {
          id: "2",
          question: "¿Qué método se utiliza más comúnmente para detectar exoplanetas?",
          options: ["Tránsito", "Velocidad radial", "Microlente gravitacional", "Imagen directa"],
          correctAnswer: "Tránsito",
          explanation: "El método de tránsito es el más común para detectar exoplanetas. Detecta la disminución en el brillo de una estrella cuando un planeta pasa frente a ella desde nuestra perspectiva.",
          difficulty: "Intermedio"
        },
        {
          id: "3",
          question: "¿Cuál de estos exoplanetas está en la 'zona habitable' de su estrella?",
          options: ["WASP-12b", "Kepler-442b", "HD 189733b", "55 Cancri e"],
          correctAnswer: "Kepler-442b",
          explanation: "Kepler-442b es un exoplaneta que orbita dentro de la zona habitable de su estrella, lo que significa que podría tener condiciones adecuadas para albergar agua líquida en su superficie.",
          difficulty: "Difícil"
        }
      ])
    } catch (err) {
      setError('Error al cargar las preguntas. Por favor, intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnswer = (answer: string) => {
    if (isAnswered) return
    setSelectedAnswer(answer)
    setIsAnswered(true)
    if (answer === questions[currentQuestionIndex].correctAnswer) {
      setScore(score + 1)
    }
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer("")
      setIsAnswered(false)
    }
  }

  const getButtonStyle = (option: string) => {
    if (!isAnswered) return "bg-secondary text-black hover: hover:text-white"
    if (option === questions[currentQuestionIndex].correctAnswer) return "bg-green-500 text-black hover:bg-green-600 hover:text-white"
    if (option === selectedAnswer) return "bg-red-500 text-black hover:bg-red-600 hover:text-white"
    return "bg-secondary text-black hover:bg-secondary/80 hover:text-white"
  }

  const progressPercentage = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Alert>
          <AlertTitle>No hay preguntas disponibles</AlertTitle>
          <AlertDescription>
            No se encontraron preguntas en la base de datos. Por favor, intenta más tarde.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">ExoQuest</CardTitle>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-xl mb-4">{currentQuestion.question}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQuestion.options.map((option, index) => (
                  <Button
                    key={index}
                    onClick={() => handleAnswer(option)}
                    className={`h-auto py-4 px-6 text-left transition-all duration-300 transform hover:scale-105 ${getButtonStyle(option)}`}
                    disabled={isAnswered}
                  >
                    {option}
                  </Button>
                ))}
              </div>
              {isAnswered && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mt-4 p-4 bg-secondary rounded-lg"
                >
                  <h3 className="font-bold mb-2">Explicación:</h3>
                  <p>{currentQuestion.explanation}</p>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </CardContent>
        <CardFooter className="flex flex-col items-center gap-4">
          <div className="w-full">
            <Progress value={progressPercentage} className="w-full" />
          </div>
          <div className="flex justify-between w-full">
            <Badge variant="outline">
              Pregunta {currentQuestionIndex + 1} de {questions.length}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Star className="w-4 h-4" />
              Puntuación: {score}
            </Badge>
            <Badge variant="outline">{currentQuestion.difficulty}</Badge>
          </div>
          {isAnswered && (
            <Button onClick={handleNext} className="mt-4 w-full">
              Siguiente <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}