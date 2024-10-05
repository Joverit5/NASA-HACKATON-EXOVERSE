"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Star, AlertTriangle, ChevronRight, Trophy, RefreshCw } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useRouter } from 'next/navigation'

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
  const [gameOver, setGameOver] = useState(false)
  const [isVictory, setIsVictory] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/questions')
      if (!response.ok) {
        throw new Error('Failed to fetch questions')
      }
      const data = await response.json()
      setQuestions(data)
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
    } else {
      setGameOver(true)
      setIsVictory(score >= 6)
      if (score >= 6) {
        // Aquí llamaríamos a una función para actualizar los logros y las insignias
        updateAchievements()
      }
    }
  }

  const updateAchievements = async () => {
    try {
      await fetch('/api/update-achievements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ achievement: 'ExoQuest Master' }),
      })
    } catch (error) {
      console.error('Error updating achievements:', error)
    }
  }

  const handleRetry = () => {
    setQuestions([])
    setCurrentQuestionIndex(0)
    setScore(0)
    setSelectedAnswer("")
    setIsAnswered(false)
    setGameOver(false)
    setIsVictory(false)
    fetchQuestions()
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

  if (gameOver) {
    return (
      <motion.div
        className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              {isVictory ? '¡Felicidades!' : 'Fin del juego'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-xl mb-4">
              {isVictory
                ? '¡Has ganado! Obtuviste 6 o más respuestas correctas.'
                : `Obtuviste ${score} de 10 respuestas correctas.`}
            </p>
            {isVictory && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              >
                <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                <p className="text-lg font-semibold mb-2">¡Nueva insignia desbloqueada!</p>
                <Badge variant="secondary" className="text-lg py-1 px-3">
                  ExoQuest Master
                </Badge>
              </motion.div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center space-x-4">
            <Button onClick={handleRetry} className="flex items-center">
              <RefreshCw className="mr-2 h-4 w-4" /> Intentar de nuevo
            </Button>
            <Button onClick={() => router.push('/')} variant="outline">
              Volver al inicio
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
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
              <Star className="w-4 w-4" />
              Puntuación: {score}
            </Badge>
            <Badge variant="outline">{currentQuestion.difficulty}</Badge>
          </div>
          {isAnswered && (
            <Button onClick={handleNext} className="mt-4 w-full">
              {currentQuestionIndex < questions.length - 1 ? (
                <>
                  Siguiente <ChevronRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                'Ver resultados'
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  )
}