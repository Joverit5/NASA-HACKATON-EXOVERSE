import type React from "react"
import type { Metadata, Viewport } from "next"
import { Roboto_Serif, Roboto_Mono } from "next/font/google"
import "./globals.css"
import SmoothScroll from "@/src/components/smoothscroll"

/**
 * Roboto Serif carries the narrative. Its optical-size axis (8–144) means one file
 * serves a 96px display and an 11px caption with the stroke contrast corrected at
 * each size, which is what keeps a long data narrative readable.
 *
 * Roboto Mono carries every archive figure. No measurement is ever set in the serif.
 */
const serif = Roboto_Serif({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  axes: ["opsz"],
})

const mono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Exoverse - Exploring Exoplanets",
  description:
    "ExoVerse is an immersive digital platform that opens a window to the wonders of exoplanets, making the vastness of space accessible to all. Our project serves as a beacon of knowledge, guiding curious minds through the cosmic ocean of planetary discovery.",
  keywords: "exoplanets, space, astronomy, education, universe, planets",
  authors: [{ name: "ExoVerse Team" }],
  robots: "index, follow",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" href="/images/exoplanet.webp" as="image" />
        <link rel="preload" href="/images/stars-bg.webp" as="image" />
      </head>
      <body className={`${serif.variable} ${mono.variable} antialiased`}>
        <SmoothScroll />
        {children}
      </body>
    </html>
  )
}
