import { createNavigation } from "next-intl/navigation"
import { routing } from "@/src/i18n/routing"

/**
 * Locale-aware replacements for next/link and the router hooks. Importing Link
 * from here keeps every internal link inside the visitor's language without each
 * call site having to remember to prefix it.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing)
