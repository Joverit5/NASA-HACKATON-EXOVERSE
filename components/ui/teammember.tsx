'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Star } from 'lucide-react'
import { TeamMember, teamMembers } from '@/data/team-members'

const ConstellationLine = ({ start, end }: { start: { x: number; y: number }; end: { x: number; y: number } }) => (
  <motion.div
    className="absolute inset-0 pointer-events-none"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 1 }}
  >
    <svg className="w-full h-full">
      <motion.line
        x1={`${start.x}%`}
        y1={`${start.y}%`}
        x2={`${end.x}%`}
        y2={`${end.y}%`}
        stroke="rgba(59, 130, 246, 0.2)"
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />
    </svg>
  </motion.div>
)

const InteractiveStar = ({ member }: { member: TeamMember }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{ left: `${member.coordinates.x}%`, top: `${member.coordinates.y}%` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Star className="w-6 h-6 text-blue-400 fill-blue-400/20" />
      <motion.div
        className="absolute inset-0 bg-blue-400 rounded-full blur-sm"
        animate={{
          opacity: [0.2, 0.5, 0.2],
          scale: [0.8, 1.2, 0.8],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="absolute z-10 w-64 bg-gray-900/90 backdrop-blur-xl rounded-lg overflow-hidden border border-blue-500/20 shadow-2xl"
            style={{
              left: member.coordinates.x < 50 ? '0' : 'auto',
              right: member.coordinates.x >= 50 ? '0' : 'auto',
              top: member.coordinates.y < 50 ? '100%' : 'auto',
              bottom: member.coordinates.y >= 50 ? '100%' : 'auto',
            }}
          >
            <div className="relative h-32 overflow-hidden">
              <Image
                src={member.image}
                alt={member.name}
                layout="fill"
                objectFit="cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-bold text-white mb-1">{member.name}</h3>
              <p className="text-sm text-blue-400 mb-2">{member.role}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

const ParallaxStars = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(200)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            width: Math.random() * 2 + 1 + 'px',
            height: Math.random() * 2 + 1 + 'px',
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            zIndex: Math.floor(Math.random() * 3) - 1,
          }}
          animate={{
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

export default function ConstellationCredits() {
  return (
    <div className="relative w-full h-screen overflow-hidden">
    <ParallaxStars />
      <div className="absolute inset-0">
        <div className="absolute inset-0" />
        <div className="absolute inset-0 opacity-30 mix-blend-overlay" />
      </div>

      {/* Constellation Lines */}
      {teamMembers.map((member, index) => {
        const nextMember = teamMembers[(index + 1) % teamMembers.length]
        return (
          <ConstellationLine
            key={`line-${member.id}`}
            start={member.coordinates}
            end={nextMember.coordinates}
          />
        )
      })}

      {/* Interactive Stars */}
      {teamMembers.map((member) => (
        <InteractiveStar key={member.id} member={member} />
      ))}

      {/* Cosmic Dust */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="h-full w-full bg-[url('/images/cosmic-dust.png')] bg-repeat-y animate-float opacity-20" />
      </div>
    </div>
  )
}

