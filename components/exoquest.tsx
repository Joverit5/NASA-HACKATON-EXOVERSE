'use client';

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { achievementsService } from '@/pages/api/achievements';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Loader2,
  Star,
  AlertTriangle,
  ChevronRight,
  Trophy,
  RefreshCw,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const CoverParticles = dynamic(() => import("@/components/ui/star_particles"), {
  ssr: false,
  loading: () => <div className="h-screen bg-blue-950" />,
});

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: string;
}

type Achievement = {
  name: string;
  unlocked: boolean;
}

export default function ExoQuest() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const router = useRouter();
  
  const searchParams = useSearchParams();
  const difficulty = searchParams.get("difficulty") || "all";

  const shuffleArray = useCallback((array: any[]) => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }, [])

  
  useEffect(() => {
    fetchAchievements()
  }, [])

const fetchAchievements = async () => {
    try {
      const response = await fetch('/api/achievements')
      if (response.ok) {
        const achievements = await response.json()
        setUnlockedAchievements(achievements.filter((a: Achievement) => a.unlocked).map((a: Achievement) => a.name))
      }
    } catch (error) {
      console.error('Error fetching achievements:', error)
    }
  }
  const fetchQuestions = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/questions?difficulty=${difficulty}`)
      if (!response.ok) {
        throw new Error("Failed to fetch questions")
      }
      const data = await response.json()
      const randomizedQuestions = shuffleArray(data)
        .slice(0, 10)
        .map((q: Question) => ({
          ...q,
          options: shuffleArray(q.options),
        }))
      setQuestions(randomizedQuestions)
    } catch (err) {
      setError("An error occurred when loading questions. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [difficulty, shuffleArray])

  useEffect(() => {
    fetchQuestions()
  }, [fetchQuestions])

  const handleAnswer = useCallback(
    (answer: string) => {
      if (isAnswered) return
      setSelectedAnswer(answer)
      setIsAnswered(true)
      if (answer === questions[currentQuestionIndex].correctAnswer) {
        setScore((prevScore) => prevScore + 1)
      }
    },
    [isAnswered, questions, currentQuestionIndex]
  )

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1)
      setSelectedAnswer("")
      setIsAnswered(false)
    } else {
      setGameOver(true)
      setIsVictory(score >= 6)
      if (score >= 6) {
        const achievement = achievementsService.unlockAchievement("ExoQuest Master");
      }
    }
  }, [currentQuestionIndex, questions.length, score])

  const handleRetry = useCallback(() => {
    setQuestions([])
    setCurrentQuestionIndex(0)
    setScore(0)
    setSelectedAnswer("")
    setIsAnswered(false)
    setGameOver(false)
    setIsVictory(false)
    fetchQuestions()
  }, [fetchQuestions])

  const getButtonStyle = useCallback(
    (option: string) => {
      if (!isAnswered)
        return "bg-indigo-700/30 text-white hover:bg-indigo-600/50"
      if (option === questions[currentQuestionIndex].correctAnswer)
        return "bg-green-500/30 text-white hover:bg-green-600/50"
      if (option === selectedAnswer)
        return "bg-red-500/30 text-white hover:bg-red-600/50"
      return "bg-indigo-700/30 text-white hover:bg-indigo-600/50"
    },
    [isAnswered, questions, currentQuestionIndex, selectedAnswer]
  )

  const progressPercentage = useMemo(
    () =>
      questions.length > 0
        ? ((currentQuestionIndex + 1) / questions.length) * 100
        : 0,
    [questions.length, currentQuestionIndex]
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-blue-950">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-blue-950">
        <Alert
          variant="destructive"
          className="bg-red-900/30 border-red-600/30 text-white backdrop-blur-md"
        >
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-blue-950">
        <Alert className="bg-indigo-900/30 border-indigo-600/30 text-white backdrop-blur-md">
          <AlertTitle>No questions available</AlertTitle>
          <AlertDescription>
            No questions found in database. Please, try again later.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (gameOver) {
    return (
      <motion.div
        className="min-h-screen bg-blue-950 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <CoverParticles />
        <Card className="w-full max-w-md glassmorphism">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-white">
              {isVictory ? "¡Congratulations!" : "Game Over"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-xl mb-4 text-white">
              {isVictory
                ? "You've won! You've got 6 or more answers correct."
                : `You got ${score} out of ${questions.length} correct answers.`}
            </p>
            {isVictory && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                <p className="text-lg font-semibold mb-2 text-white">
                  New badge unlocked!
                </p>
                <Badge
                  variant="secondary"
                  className="text-lg py-1 px-3 bg-indigo-600/30 text-white"
                >
                  ExoQuest Master
                </Badge>
              </motion.div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center space-x-4">
            <Button
              onClick={handleRetry}
              className="flex items-center bg-indigo-600/30 text-white hover:bg-indigo-600/50"
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Try Again
            </Button>
            <Button
              onClick={() => router.push("/exoquest/menu")}
              variant="outline"
              className="text-white border-white/30 hover:bg-white/10"
            >
              Back to Menu
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]

  return (
    <motion.div
      className="min-h-screen bg-blue-950 flex items-center justify-center p-4 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <CoverParticles />
      <div className="absolute inset-0 bg-gradient-to-br from-black to-purple-500/20" />
      <Card className="w-full max-w-2xl glassmorphism relative z-10">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-white">
            ExoQuest
          </CardTitle>
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
              <h2 className="text-xl mb-4 text-white">
                {currentQuestion.question}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQuestion.options.map((option, index) => (
                  <Button
                    key={index}
                    onClick={() => handleAnswer(option)}
                    className={`h-auto py-4 px-6 text-left transition-all duration-300 transform hover:scale-105 ${getButtonStyle(
                      option
                    )}`}
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
                  className="mt-4 p-4 bg-indigo-800/20 rounded-lg backdrop-blur-md"
                >
                  <h3 className="font-bold mb-2 text-white">Explanation:</h3>
                  <p className="text-white">{currentQuestion.explanation}</p>
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
            <Badge variant="outline" className="border-white/30 text-white">
              Question {currentQuestionIndex + 1} of {questions.length}
            </Badge>
            <Badge
              variant="outline"
              className="flex items-center gap-1 border-white/30 text-white"
            >
              <Star className="w-4 w-4" />
              Score: {score}
            </Badge>
            <Badge variant="outline" className="border-white/30 text-white">
              {currentQuestion.difficulty}
            </Badge>
          </div>
          {isAnswered && (
            <Button
              onClick={handleNext}
              className="mt-4 w-full bg-indigo-700/30 text-white hover:bg-indigo-600/50"
            >
              {currentQuestionIndex < questions.length - 1 ? (
                <>
                  Next <ChevronRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                "Show Results"
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  )
}