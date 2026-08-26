# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Three audiences, all confirmed as primary and none subordinate to the others:

- **Students and teachers** using ExoVerse as a learning resource — the quiz, catalog, and creator function as teaching tools inside or alongside a class.
- **Curious general public** arriving from a shared link with no astronomy background, wanting to be amazed first and to learn something real second.
- **Space and astronomy enthusiasts** who already follow exoplanet news and come for actual NASA archive data, filters, and depth.

A fourth audience evaluates rather than uses the site: judges, professors, and recruiters assessing the team's work in a short session. Their needs are served by the same surfaces, not by separate ones.

## Product Purpose

ExoVerse makes exoplanet science explorable rather than merely readable. It turns a research archive and a body of astronomy education into four things a visitor can *do*: read, be quizzed, build, and search real data. Success is a visitor who arrives knowing nothing about exoplanets and leaves having actually interacted with the subject — not one who scrolled a page of facts.

## Positioning

The mechanism a neighboring exoplanet site could not truthfully copy is the **combination of live NASA Exoplanet Archive data with hands-on creation and play in one continuous experience**. Reference sites have the data but no play; educational sites have the play but use invented or frozen data. ExoVerse queries the real archive (`exoplanetarchive.ipac.caltech.edu` TAP API) *and* lets the visitor design a planet in 3D and be quizzed on what they learned, without leaving the product.

Live at https://exoverse.vercel.app. The project began as a NASA Space Apps hackathon entry and now serves double duty: a real, evolving public product **and** the team's calling card. Neither purpose may be sacrificed for the other — it must work for a real visitor and hold up under evaluation.

## Operating Context

- Visitors arrive overwhelmingly from a shared link (social, a class, a submission page) rather than from search or a deliberate return visit. First-viewport impact carries disproportionate weight.
- Sessions are typically short and single-visit. There are no accounts and no server-side persistence; progress lives in the visitor's browser.
- Devices span classroom laptops, personal desktops, and phones. Mobile is not a secondary case.
- The 3D surfaces (ExoCreator, planet visualizations) are GPU-dependent and run on hardware the team does not control, including low-end school machines.
- ExoVis depends on a third-party public archive that can be slow or unavailable; that dependency is visible in the experience.

## Capabilities and Constraints

**The four pillars (binding — do not rename, merge, or drop):**

1. **Information Hub** — the landing experience: exoplanet basics, discovery history, and statistics, presented as a scroll-driven narrative.
2. **ExoQuest** — a quiz game over a local question bank (`src/data/exoplanet_questions.json`), filterable by difficulty, 10 questions per run, 6+ correct is a win, with per-question explanations.
3. **ExoCreator** — a real-time 3D planet designer: size, color, planet type (Terrestrial, Sub-Neptune, Neptune-like, Gas Giant, Hot Jupiter), star type/distance/intensity, up to 5 moons and 5 rings, with educational content attached to each choice.
4. **ExoVis** — a searchable, filterable catalog over live NASA Exoplanet Archive data: search by planet or host star, filter by type and habitability, sort by name/distance/discovery year/habitability, paginated.

**Technical facts:**

- Next.js 14 App Router, React 18, TypeScript, Tailwind + shadcn/ui primitives (Radix), Framer Motion, React Three Fiber / drei over Three.js. Deployed on Vercel.
- Exoplanet data is fetched server-side through `app/api/exoplanets/route.ts` against the NASA Exoplanet Archive TAP API. Habitability and planet-type classification are derived in-app, not supplied by the archive.
- Achievements are stored in `localStorage` only (`src/lib/achievementsService.ts`); three exist today, one per interactive pillar. No backend, no accounts, no analytics.
- Fonts are self-hosted Geist Sans and Geist Mono. Tailwind carries a default shadcn token set that the app largely bypasses in favor of a hardcoded black/white space palette.

**Explicitly changeable:** everything outside the four pillars. The data source, copy, credits presentation, visual system, and component structure are all open to proposal and replacement.

**Open decisions — do not invent an answer:**

- **Multi-language.** Copy should eventually exist in several languages, not only English and Spanish. No framework, locale set, or launch order has been chosen. Design and copy work should avoid choices that make localization harder (baked-in text in images, layouts that assume English string lengths), but must not claim the site is multilingual today.
- **Donations.** The "Support Us" button is a placeholder that currently only dismisses itself. Real donation support is genuinely intended but not built. Never present it as functional, and never state or imply an amount raised, a recipient, or a funding claim.

## Brand Commitments

- The name **ExoVerse** and the four pillar names — **Information Hub**, **ExoQuest**, **ExoCreator**, **ExoVis** — are fixed.
- Voice is warm and wonder-forward without being juvenile: it addresses a curious adult and a curious student in the same sentence. Accurate science, plainly said.
- No other identity constraint is binding. The current dark-space visual treatment is incumbent evidence, not a commitment.

## Evidence on Hand

- **Real data:** live NASA Exoplanet Archive queries (planet name, host star, distance, radius, mass, orbital period, equilibrium temperature, discovery year, discovery method).
- **Real content:** a written exoplanet question bank with difficulty levels and explanations; educational copy per planet type in ExoCreator.
- **Real assets:** exoplanet and space imagery in `public/images/` (Kepler, K2, Proxima Centauri, 51 Pegasi, HD/HAT/WASP/TOI subjects, telescope and starfield backgrounds), a space background video in `public/videos/`, and photographs of the five team members.
- **Real people:** five named team members from Universidad Tecnológica de Bolívar with public GitHub and LinkedIn profiles (`src/data/team-members.ts`), and a project presentation video on YouTube.

**Absences future work must not fabricate:** no user counts, visitor numbers, download figures, school adoptions, testimonials, press coverage, awards, competition placements, ratings, funding, or partnership or endorsement by NASA. Using NASA's public archive is not affiliation with NASA and must never be presented as such.

## Product Principles

1. **Interaction over exposition.** Every pillar exists because it lets the visitor do something. When a choice is between explaining a concept and letting someone handle it, let them handle it.
2. **Real data, honestly labeled.** The archive is the product's spine. Derived values (habitability, planet type) are shown as the interpretations they are, never as archive facts.
3. **Wonder that survives contact.** The first viewport should stop someone; the next ten minutes must reward them with substance. Spectacle that leads nowhere fails both the visitor and the evaluator.
4. **One experience, three audiences.** A twelve-year-old, a hobbyist, and a professor use the same screens. Depth is layered in, not gated behind a mode switch.
5. **Runs on the machine it's opened on.** A 3D-heavy site that stutters on a classroom laptop or a phone has failed, however good it looks on a workstation.

## Accessibility & Inclusion

No formal standard has been mandated. Product-specific needs that follow from the audiences and stack:

- Classroom and low-end hardware means motion and 3D density are an accessibility concern, not only a performance one; honor reduced-motion preferences and degrade gracefully.
- The astronomy vocabulary is the subject matter, so terms must be defined in place rather than assumed — a comprehension requirement for the student and general-public audiences.
- Data is conveyed through color-coded planet visualizations and habitability badges; color must never be the only carrier of that meaning.
