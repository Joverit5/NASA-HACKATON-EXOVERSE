'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

export const WarpSpeed = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const stars: { x: number; y: number; z: number; radius: number }[] = []

    for (let i = 0; i < 1000; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * canvas.width,
        radius: Math.random() * 1.5
      })
    }

    function animate() {
      if (!ctx || !canvas) return

      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      stars.forEach(star => {
        star.z -= 5
        if (star.z <= 0) {
          star.z = canvas.width
        }

        const x = (star.x - canvas.width / 2) * (canvas.width / star.z) + canvas.width / 2
        const y = (star.y - canvas.height / 2) * (canvas.width / star.z) + canvas.height / 2
        const radius = star.radius * (canvas.width / star.z)

        ctx.beginPath()
        ctx.fillStyle = 'white'
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.fill()
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(requestAnimationFrame(animate))
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 z-0" />
}

const AuroraEffect = () => (
  <div className="absolute inset-0 overflow-hidden z-10 pointer-events-none opacity-50">
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/20 to-purple-500/20 animate-aurora" />
  </div>
)

const CosmicDust = () => (
  <motion.div
    className="absolute inset-0 bg-[url('/images/cosmic-dust.png')] bg-repeat z-20 pointer-events-none opacity-20"
    animate={{
      backgroundPosition: ['0% 0%', '100% 100%'],
    }}
    transition={{
      duration: 50,
      ease: 'linear',
      repeat: Infinity,
    }}
  />
)

export const CosmicEffects = () => (
  <>
    <WarpSpeed />
    <AuroraEffect />
    <CosmicDust />
  </>
)

