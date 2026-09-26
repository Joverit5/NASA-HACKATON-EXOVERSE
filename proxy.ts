import createMiddleware from "next-intl/middleware"
import { routing } from "@/src/i18n/routing"

/**
 * Locale detection and redirect.
 *
 * Next 16 names this file `proxy`, not `middleware` — see
 * node_modules/next/dist/docs/01-app/02-guides/internationalization.md.
 */
export default createMiddleware(routing)

export const config = {
  // Everything except API routes, Next internals and files with an extension.
  matcher: ["/((?!api|_next|_vercel|.*\..*).*)"],
}
