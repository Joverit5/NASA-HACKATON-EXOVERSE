import { defineRouting } from "next-intl/routing"

/**
 * Locale routing.
 *
 * PRODUCT.md records multi-language as planned for several languages, not only
 * Spanish, and leaves the locale set open. This starts with the two the project
 * can actually write and check — the team is Colombian and the site is English —
 * and the structure takes a third by adding one entry here plus a message file.
 *
 * The locale lives in the path rather than a cookie because PRODUCT.md says
 * visitors arrive overwhelmingly from a shared link: a shared URL has to carry the
 * language it was read in, and a cookie cannot travel with a link.
 */
export const routing = defineRouting({
  locales: ["en", "es"],
  defaultLocale: "en",
  // Always prefix, so /es/exovis and /en/exovis are both real, shareable URLs and
  // neither language is a second-class citizen living at the bare path.
  localePrefix: "always",
})

export type Locale = (typeof routing.locales)[number]

export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  es: "Español",
}
