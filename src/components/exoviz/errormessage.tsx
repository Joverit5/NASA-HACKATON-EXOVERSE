"use client"

import { motion } from "framer-motion"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/src/components/ui/button"

interface ErrorMessageProps {
  message: string
  onRetry: () => void
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-20 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <AlertTriangle className="w-16 h-16 text-red-400 mb-6" />
      <h3 className="text-2xl font-light text-white mb-4">Connection Error</h3>
      <p className="text-white/60 mb-8 max-w-md">{message}</p>
      <Button onClick={onRetry} variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
        <RefreshCw className="w-4 h-4 mr-2" />
        Try Again
      </Button>
    </motion.div>
  )
}
