import React from 'react'
import Link from 'next/link'

export default function Navbar() {
  const handleCreditsClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();  // Evita la acción por defecto
    const section = document.getElementById("team");
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
  };
  return (
    <nav className="bg-transparent p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold tracking-tighter">
          Exoverse
        </Link>
        <ul className="flex space-x-6">
          <li>
            <Link href="/exoquest" className="text-xl hover:text-blue-400 transition-colors">
              Exoquest
            </Link>
          </li>
          <li>
            <Link href="/exocreator" className="text-xl hover:text-blue-400 transition-colors">
              ExoCreator
            </Link>
          </li>
          <li>
            <Link href="/exovis" className="text-xl hover:text-blue-400 transition-colors">
              Exovis
            </Link>
          </li>
          <li>
            <a href="#team" onClick={handleCreditsClick} className="text-xl text-white hover:text-blue-400">
                Credits
            </a>
          </li>
        </ul>
      </div>
    </nav>
  )
}