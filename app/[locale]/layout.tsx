import type React from "react"
import type { Metadata, Viewport } from "next"
import { Roboto_Serif, Roboto_Mono } from "next/font/google"
import { notFound } from "next/navigation"
import { NextIntlClientProvider } from "next-intl"
import { setRequestLocale } from "next-intl/server"
import "../globals.css"
import SmoothScroll from "@/src/components/smoothscroll"
import { QualityProvider } from "@/src/components/quality-provider"
import { routing, type Locale } from "@/src/i18n/routing"

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
    "ExoVerse turns the NASA Exoplanet Archive into something you can handle: read it, be quizzed on it, build a world, and search the real catalogue.",
  keywords: "exoplanets, space, astronomy, education, universe, planets",
  authors: [{ name: "ExoVerse Team" }],
  robots: "index, follow",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

/**
 * Pre-renders both language trees at build time rather than waiting for a first
 * visitor in each one.
 */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  // A URL naming a language the site does not have is a 404, not a silent
  // fallback: /fr/exovis should say it does not exist rather than quietly serve
  // English under a French address.
  if (!routing.locales.includes(locale as Locale)) notFound()

  setRequestLocale(locale)

  return (
    <html lang={locale}>
      <body className={`${serif.variable} ${mono.variable} antialiased`}>
        <NextIntlClientProvider>
          <QualityProvider>
            <SmoothScroll />
            {children}
          </QualityProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
