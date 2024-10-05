import React from 'react'
import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="bg-transparent p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold tracking-tighter">
          Exoverse
        </Link>
        <ul className="flex space-x-6">
          <li>
            <Link href="/" className="text-xl hover:text-blue-400 transition-colors">
              Info
            </Link>
          </li>
          <li>
            <Link href="/game" className="text-xl hover:text-blue-400 transition-colors">
              Game
            </Link>
          </li>
          <li>
            <Link href="/planet-creator" className="text-xl hover:text-blue-400 transition-colors">
              Planet Creator
            </Link>
          </li>
          <li>
            <Link href="/exovis" className="text-xl hover:text-blue-400 transition-colors">
              Exovis
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}