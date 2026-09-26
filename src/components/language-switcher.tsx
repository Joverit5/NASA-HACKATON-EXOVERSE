"use client"

import { useLocale } from "next-intl"
import { usePathname, useRouter } from "@/src/i18n/navigation"
import { LOCALE_NAMES, routing, type Locale } from "@/src/i18n/routing"

/**
 * Language switcher.
 *
 * It swaps the locale on the *current* path rather than sending the visitor home,
 * so someone reading a catalogue entry in English lands on the same entry in
 * Spanish. `usePathname` from the locale-aware navigation returns the path without
 * its prefix, which is what makes that a one-line operation.
 *
 * Rendered as plain links, not a select: they are real URLs, so they can be
 * opened in a new tab, copied, and crawled — which matters because PRODUCT.md
 * says visitors arrive from shared links.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale() as Locale
  const pathname = usePathname()
  const router = useRouter()

  return (
    <div className={className}>
      <ul className="flex items-center gap-1" role="list">
        {routing.locales.map((code) => {
          const active = code === locale
          return (
            <li key={code}>
              <button
                type="button"
                lang={code}
                aria-current={active ? "true" : undefined}
                onClick={() => router.replace(pathname, { locale: code })}
                className={`font-mono text-xs uppercase tracking-[0.12em] px-2 py-1 transition-colors duration-tick ease-tick focus-visible:outline-2 focus-visible:outline-mint ${
                  active ? "text-mint" : "text-ink-faint hover:text-ink"
                }`}
              >
                {/* The label is in its own language: a Spanish speaker looking for
                    their language looks for "Español", not for "Spanish". */}
                <span className="sr-only">{LOCALE_NAMES[code]}</span>
                <span aria-hidden="true">{code.toUpperCase()}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
