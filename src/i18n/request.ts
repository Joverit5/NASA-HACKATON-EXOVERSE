import { getRequestConfig } from "next-intl/server"
import { routing, type Locale } from "@/src/i18n/routing"

/**
 * Resolves the locale for each server render and loads its messages.
 *
 * An unknown locale falls back to the default rather than throwing: a stale or
 * hand-typed URL like /fr/exovis should show the site in English, not a 500.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale: Locale = routing.locales.includes(requested as Locale)
    ? (requested as Locale)
    : routing.defaultLocale

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
