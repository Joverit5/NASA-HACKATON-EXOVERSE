"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Rocket, Brain, BarChartIcon as ChartBar, Users } from 'lucide-react';
import { cn } from "@/src/utils/utils";

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
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };



  const leftNavItems = [
    { href: "/exoquest/menu", icon: Rocket, label: "ExoQuest" },
    { href: "/exocreator", icon: Brain, label: "ExoCreator" },
  ];

  const rightNavItems = [
    { href: "/exovis", icon: ChartBar, label: "ExoVis" },
    { 
      href: "/#credits", 
      icon: Users, 
      label: "Credits"
    },
  ];

  return (
    <motion.nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4",
        isScrolled ? "bg-black/50 backdrop-blur-md" : "bg-transparent"
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Left Navigation */}
          <ul className="hidden md:flex md:flex-1 md:items-center md:space-x-16">
            {leftNavItems.map((item) => (
              <li key={item.href}>
                <NavItem {...item} />
              </li>
            ))}
          </ul>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-white focus:outline-none"
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Center Logo */}
          <Link href="/" className="flex items-center gap-2 md:flex-none md:absolute md:left-1/2 md:-translate-x-1/2">
            <span className="text-4xl font-bold">Exoverse</span>
          </Link>

          {/* Right Navigation */}
          <ul className="hidden md:flex md:flex-1 md:items-center md:justify-end md:space-x-16">
            {rightNavItems.map((item) => (
              <li key={item.href}>
                <NavItem {...item} />
              </li>
            ))}
          </ul>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <MobileMenu
              navItems={[...leftNavItems, ...rightNavItems]}
              toggleMenu={toggleMenu}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}

const NavItem: React.FC<NavItemProps> = ({ href, icon: Icon, label }) => (
  <Link
    href={href}
    className="flex items-center space-x-2 text-xl text-white hover:text-blue-400 transition-colors px-8"
  >
    <Icon className="h-5 w-5" />
    <span>{label}</span>
  </Link>
);

const MobileMenu: React.FC<Omit<MobileMenuProps, 'handleCreditsClick'>> = ({
  navItems,
  toggleMenu,
}) => (
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
      </ul>
    </div>
  </motion.div>
);

