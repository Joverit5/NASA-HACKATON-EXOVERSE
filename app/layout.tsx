import type React from "react"
import type { Metadata, Viewport } from "next"
import localFont from "next/font/local"
import "./globals.css"

const geistSans = localFont({
  src: "../src/fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap", 
  preload: true,
})

const geistMono = localFont({
  src: "../src/fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap", 
  preload: true,
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preload" href="/images/exoplanet.webp" as="image" />
        <link rel="preload" href="/images/stars-bg.webp" as="image" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  )
}
