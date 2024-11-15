"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Rocket, Brain, ChartBar, Users } from 'lucide-react'
import { cn } from "@/lib/utils"
interface NavItemProps {
  href: string;
  icon: React.ElementType; 
  label: string;
}
interface MobileMenuProps {
  navItems: NavItemProps[];
  handleCreditsClick: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
  toggleMenu: () => void;
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }


  const handleCreditsClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault()
    const section = document.getElementById("team")
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' })
    }
    setIsOpen(false)
  }

  const navItems = [
    { href: "/exoquest/menu", icon: Rocket, label: "ExoQuest" },
    { href: "/exocreator", icon: Brain, label: "ExoCreator" },
    { href: "/exovis", icon: ChartBar, label: "ExoVis" },
  ]

  return (
    <motion.nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-md transition-all duration-300",
        isScrolled ? "py-2" : "py-4"
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold tracking-tighter text-white hover:text-primary transition-colors">
            Exoverse
          </Link>
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-white focus:outline-none"
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
          <ul className="hidden md:flex md:space-x-6 items-center">
            {navItems.map((item) => (
              <li key={item.href}>
                <NavItem {...item} />
              </li>
            ))}
            <li>
              <a
                href="#team"
                onClick={handleCreditsClick}
                className="flex items-center space-x-2 text-xl text-white hover:text-blue-400 transition-colors"
              >
                <Users className="h-5 w-5" />
                <span>Credits</span>
              </a>
            </li>
          </ul>
        </div>
        <AnimatePresence>
          {isOpen && (
            <MobileMenu
              navItems={navItems}
              handleCreditsClick={handleCreditsClick}
              toggleMenu={toggleMenu}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  )
}

const NavItem: React.FC<NavItemProps> = ({ href, icon: Icon, label }) => (
  <Link
    href={href}
    className="flex items-center space-x-2 text-xl text-white hover:text-blue-400 transition-colors"
  >
    <Icon className="h-5 w-5" />
    <span>{label}</span>
  </Link>
);

const MobileMenu: React.FC<MobileMenuProps> = ({ navItems, handleCreditsClick, toggleMenu }) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.2 }}
    className="md:hidden absolute top-full left-0 right-0 bg-black/90 backdrop-blur-md py-4"
  >
    <div className="container mx-auto px-4 flex flex-col space-y-4">
    <ul className="flex flex-col space-y-2">
    {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="flex items-center space-x-2 text-white hover:text-primary transition-colors"
          onClick={toggleMenu}
        >
          <item.icon className="h-4 w-4" />
          <span>{item.label}</span>
        </Link>
      ))}
      <li>
        <a
          href="#team"
          onClick={handleCreditsClick}
          className="flex items-center space-x-2 text-white hover:text-primary transition-colors"
        >
          <Users className="h-5 w-5" />
          <span>Credits</span>
        </a>
      </li>
    </ul>
    </div>
  </motion.div>
)