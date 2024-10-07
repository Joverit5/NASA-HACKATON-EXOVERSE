"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSticky, setIsSticky] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 0)
    }
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const handleCreditsClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault()
    const section = document.getElementById("team")
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' })
    }
    setIsOpen(false)
  }

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  return (
    <nav className={`${isSticky ? 'fixed top-0 left-0 right-0 bg-black bg-opacity-90' : 'bg-transparent'} p-4 transition-all duration-300 z-50`}>
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold tracking-tighter">
            Exoverse
          </Link>
          <div className="md:hidden">
            <button onClick={toggleMenu} className="text-white focus:outline-none">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
          <ul className="hidden md:flex md:space-x-6">
            <li>
              <Link href="/exoquest/menu" className="text-xl hover:text-blue-400 transition-colors">
                ExoQuest
              </Link>
            </li>
            <li>
              <Link href="/exocreator" className="text-xl hover:text-blue-400 transition-colors">
                ExoCreator
              </Link>
            </li>
            <li>
              <Link href="/exovis" className="text-xl hover:text-blue-400 transition-colors">
                ExoVis
              </Link>
            </li>
            <li>
              <a href="#team" onClick={handleCreditsClick} className="text-xl text-white hover:text-blue-400">
                Credits
              </a>
            </li>
          </ul>
        </div>
        <div className={`md:hidden ${isOpen ? 'block' : 'hidden'} mt-4`}>
          <ul className="flex flex-col space-y-2">
            <li>
              <Link href="/exoquest/menu" className="block text-xl hover:text-blue-400 transition-colors" onClick={() => setIsOpen(false)}>
                ExoQuest
              </Link>
            </li>
            <li>
              <Link href="/exocreator" className="block text-xl hover:text-blue-400 transition-colors" onClick={() => setIsOpen(false)}>
                ExoCreator
              </Link>
            </li>
            <li>
              <Link href="/exovis" className="block text-xl hover:text-blue-400 transition-colors" onClick={() => setIsOpen(false)}>
                ExoVis
              </Link>
            </li>
            <li>
              <a href="#team" onClick={handleCreditsClick} className="block text-xl text-white hover:text-blue-400">
                Credits
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}