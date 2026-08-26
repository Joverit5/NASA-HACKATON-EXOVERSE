---
name: ExoVerse
description: A planetarium for real exoplanet data — graphite instrument panels lit from within, floating in a moving sky.
colors:
  void-black: "#000000"
  deep-space: "#09090B"
  graphite-panel: "#111827"
  panel-edge: "#374151"
  starlight: "#FFFFFF"
  starlight-dim: "#D1D5DB"
  starlight-faint: "#9CA3AF"
  violet-primary: "#9966FF"
  violet-accent: "#CC66FF"
  violet-deep: "#3D1F7A"
  habitable-green: "#4ADE80"
  hostile-red: "#F87171"
  data-blue: "#60A5FA"
  stellar-gold: "#FACC15"
  planet-blue: "#2563EB"
  star-amber: "#CA8A04"
  system-violet: "#9333EA"
typography:
  display:
    fontFamily: "Geist Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(3rem, 9vw, 6rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "normal"
  headline:
    fontFamily: "Geist Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Geist Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "normal"
  readout:
    fontFamily: "Geist Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 300
    lineHeight: 1.1
    letterSpacing: "normal"
  body:
    fontFamily: "Geist Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.625
    letterSpacing: "normal"
  lede:
    fontFamily: "Geist Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 400
    lineHeight: 1.625
    letterSpacing: "normal"
  label:
    fontFamily: "Geist Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "normal"
  mono:
    fontFamily: "Geist Mono, ui-monospace, SFMono-Regular, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
rounded:
  md: "6px"
  lg: "8px"
  xl: "12px"
  2xl: "16px"
  3xl: "24px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  section: "80px"
components:
  panel-floating:
    backgroundColor: "{colors.graphite-panel}"
    textColor: "{colors.starlight}"
    rounded: "{rounded.2xl}"
    padding: "24px"
    width: "384px"
  button-primary:
    backgroundColor: "{colors.graphite-panel}"
    textColor: "{colors.starlight}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "12px 24px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.panel-edge}"
    textColor: "{colors.starlight}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.starlight-faint}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "12px 24px"
    height: "40px"
  button-ghost-hover:
    backgroundColor: "{colors.graphite-panel}"
    textColor: "{colors.starlight}"
  tab-pill:
    backgroundColor: "transparent"
    textColor: "{colors.starlight-dim}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "8px 16px"
    height: "36px"
  tab-pill-active:
    backgroundColor: "{colors.planet-blue}"
    textColor: "{colors.starlight}"
  input-search:
    backgroundColor: "{colors.graphite-panel}"
    textColor: "{colors.starlight}"
    typography: "{typography.body}"
    rounded: "{rounded.xl}"
    padding: "0 48px"
    height: "48px"
  badge-habitable:
    backgroundColor: "{colors.habitable-green}"
    textColor: "{colors.habitable-green}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "2px 10px"
  badge-hostile:
    backgroundColor: "{colors.hostile-red}"
    textColor: "{colors.hostile-red}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "2px 10px"
  card-readout:
    backgroundColor: "{colors.graphite-panel}"
    textColor: "{colors.starlight}"
    rounded: "{rounded.2xl}"
    padding: "24px"
---

# Design System: ExoVerse

## Overview

**Creative North Star: "The Planetarium"**

The room is dark and the show is already running. Above and behind everything, a real sky moves — drifting stars, a rotating planet, a nebula wash that never quite settles. In front of it float instrument panels: solid graphite slabs with a bright hairline along their top edge, the way a lit object looks in a dark room. The visitor is seated in the dome, and the interface is the console in front of them, not the thing they came to see.

That division governs everything. The **scene** is generous, continuous, and theatrical: it uses scale, depth, and perpetual slow motion to make someone feel small in a good way. The **chrome** is disciplined to the point of near-invisibility: graphite, starlight, hairline edges, controls that resolve only when approached. The two never trade jobs. When a panel starts performing — a gradient headline, a colored button, a pulsing card — it stops being a console and becomes a competing light source, and the dome loses its illusion.

Color is the strictest rule in the system. ExoVerse handles real archive data whose meaning is often carried by hue: whether a world could hold life, what class of planet it is, which subsystem you're editing. A saturated color therefore has to *mean* something. Chrome is graphite and starlight; hue is reserved for data. This is not minimalism as taste — it's the only way a green badge can be trusted to say "potentially habitable" instead of "we liked green here."

**Key Characteristics:**

- Opaque graphite panels with a lit top edge, never translucent glass
- Two blacks: void black for the sky, graphite for every panel
- Saturated color exclusively as data semantics; chrome is achromatic
- Perpetual ambient motion in the scene; sub-300ms input-response motion in the chrome
- Controls recessive at rest, fully resolved on approach
- Sections joined by black gradient seams — the sky is never cut

## Colors

A near-achromatic system of two blacks and three starlights, punctuated only where a hue carries information.

### Primary

- **Signal Violet** (`--primary`, hsl(260 100% 70%)): The interactive accent defined in `app/globals.css`. It marks focus rings, active links, and progress fills — moments where the system is answering the visitor. It is a *state* color, not a surface color: never paint a panel or a resting button with it.
- **Aurora Violet** (`--accent`, hsl(280 100% 70%)): A single step warmer than Signal Violet, used for the secondary layer of the same interaction — hover companions to a violet-focused element, and accent-foreground pairings.
- **Violet Deep** (`--secondary`, hsl(260 60% 30%)): The recessed counterpart. Backgrounds of selected-but-inactive controls and the low end of the violet ramp.

### Secondary

The data-semantic set. Each of these is *only* legal where it encodes archive meaning, always as a 20%-opacity fill with a 30%-opacity border and full-strength text.

- **Habitable Green** (#4ADE80): "Potentially Habitable." Nothing else, ever.
- **Hostile Red** (#F87171): "Not Habitable," and destructive confirmation.
- **Data Blue** (#60A5FA): Provenance and counts — source badges, record counts, archive metadata.
- **Stellar Gold** (#FACC15): Achievement unlocks and starred state.

### Tertiary

The ExoCreator subsystem set. In the creator, hue answers "what am I editing right now," which makes it meaning rather than decoration — the one place a saturated fill may sit on a control.

- **Planet Blue** (#2563EB): the planet subsystem.
- **Star Amber** (#CA8A04): the star subsystem.
- **System Violet** (#9333EA): the orbital-system subsystem.

### Neutral

- **Void Black** (#000000): The sky. The page ground, behind every scene layer and video. Nothing else is this dark.
- **Deep Space** (#09090B, `--background`): The token-level page background — void black with a faint violet cast. Used where a surface must read as "sky" but sit above true black.
- **Graphite Panel** (#111827): Every raised surface, applied at 90–95% opacity over the scene so the sky bleeds faintly through. This is the single panel color in the system.
- **Panel Edge** (#374151): The 1px hairline border on every graphite panel. The only border color on opaque surfaces.
- **Starlight** (#FFFFFF): Primary text, active icons, and the resolved state of any control.
- **Starlight Dim** (#D1D5DB): Lede paragraphs and secondary body copy.
- **Starlight Faint** (#9CA3AF): Captions, labels, placeholders, and the resting state of recessive controls. Also expressed as `white/60` and `white/40` on translucent scene layers.

### Named Rules

**The Instrument Panel Rule.** A saturated hue may appear only where it encodes something a caption would otherwise have to spell out: habitability, planet class, provenance, achievement, or which subsystem is active. If removing the color would cost the visitor no information, the color is decoration and must be removed instead.

**The Two Blacks Rule.** The scene is void black (#000000); panels are graphite (#111827 at 90–95%). Never paint a panel pure black — it dissolves into the sky, the lit edge has nothing to sit against, and the room flattens into a page.

**The Data Badge Formula.** Semantic color is always the same three-part chord: fill at 20% opacity, border at 30%, text at full strength. `bg-green-500/20 text-green-400 border-green-500/30`. Deviating from the formula makes one badge shout over its siblings.

## Typography

**Display Font:** Geist Sans (variable, 100–900), with `ui-sans-serif, system-ui, sans-serif`
**Body Font:** Geist Sans — the same family throughout
**Label/Mono Font:** Geist Mono, with `ui-monospace, SFMono-Regular, monospace`

**Character:** One variable family carrying the entire range, from a 6rem bold display to a 12px label. Geist's neutral, slightly technical grotesque keeps the chrome quiet enough to disappear while staying precise enough to render an orbital period without ceremony. The system's expression comes from *weight distance*, not from a second typeface: bold display against light readouts, with everything in between at 400–600.

### Hierarchy

- **Display** (700, `clamp(3rem, 9vw, 6rem)`, 1.1): The single page title. `text-5xl sm:text-7xl md:text-8xl`. Carries the monochrome light wash (see The One Gradient Rule). One per page, never more.
- **Headline** (600, 1.875rem, 1.2, -0.02em): Section openers.
- **Title** (600, 1.25rem, 1.4): Card and panel headings.
- **Readout** (300, 1.875rem+, 1.1): Any figure pulled from the archive or the creator. Light weight at large size — the number reads as an instrument display rather than a headline.
- **Lede** (400, 1.25rem → 1.5rem at `md`, 1.625): The one paragraph under a display heading. Set in Starlight Dim, capped at `max-w-2xl` (≈65ch).
- **Body** (400, 0.875rem, 1.625): Panel copy, explanations, descriptions.
- **Label** (500, 0.75rem, 1.4): Control labels, badges, captions, metadata. Set in Starlight Faint.

### Named Rules

**The Readout Rule.** Any number the archive supplies is set in Readout (300 weight, ≥1.875rem) with its label directly beneath in Starlight Faint at Label size. The number is the object; the label is its caption. Never bold a data figure — weight makes it look like an opinion.

**The One Gradient Rule.** The only gradient permitted on type is the monochrome white → #9CA3AF wash on a page's single display heading. It reads as light falling across the letters, which is planetarium logic. Hue gradients on text — the blue → purple and cyan → purple → pink headings still present in `featurecard.tsx` and the credits section — are decoration wearing a data color, and are retired.

**The Weight Distance Rule.** Two adjacent type roles must differ by at least 200 in weight or 1.5× in size. One family means hierarchy has no other way to announce itself.

## Layout

A centered single-column column-of-sections model over a full-bleed moving scene. Content sits in `container mx-auto` with `px-4` on compact viewports and `px-6` from `md` up; measure is then capped per role rather than globally — `max-w-2xl` for prose, `max-w-3xl` for hero copy, `max-w-5xl` through `max-w-7xl` for card grids.

Spacing runs on a 4px base with 8, 16, 24, and 32px doing nearly all the work, and 80px (`py-20`) as the section rhythm. Grids step 1 → 2 → 4 across `md` and `lg`.

`md` (768px) is the system's real breakpoint — 47 of 59 responsive utilities in the codebase are `md:`. Below it, the navigation collapses to a sheet, multi-column grids become single-column, and the floating creator panels give up their fixed right-hand position for full-width stacking. `sm` (640px) and `lg` (1024px) exist for type scale and grid density only. Treat mobile and `md`-and-up as two real layouts; everything else is interpolation.

Sections do not butt against each other. Each is pulled up 64px into its predecessor (`-mt-16 pt-32`) and the join is covered by a 128px-tall black-to-transparent gradient, so the scene reads as one continuous sky rather than a stack of bands.

### Named Rules

**The Seam Rule.** No hard edge ever divides two sections. Every junction is a `h-32` gradient from Void Black to transparent over an overlapping negative margin. If you can see where one section ends, the seam is missing.

**The Two Layouts Rule.** Design for compact and for `md`-and-up as two deliberate compositions, not one composition that shrinks. The creator's control panels in particular change position and dimension, not just width.

## Elevation & Depth

Depth is **lit, not stacked**. A panel is a solid object standing in a dark room with a light source above it: a 1px inset highlight along its top edge catches that light, and a deep, soft, low-opacity black shadow puts it above the sky. The highlight is the load-bearing half — without it a dark panel on a dark ground reads as a hole punched in the page rather than a slab floating over it.

Panels are opaque (graphite at 90–95%), not glass. Backdrop blur is used sparingly and only where a panel overlaps live moving scene content that would otherwise read through as visual noise; it is a legibility tool, not a material, and it is expensive on the classroom hardware this product has to run on.

### Shadow Vocabulary

- **Lit Panel** (`box-shadow: 0 20px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)`): The signature. Every floating control panel, modal, and primary card.
- **Lit Surface** (`box-shadow: 0 8px 32px 0 rgba(31,38,135,0.37), inset 0 1px 0 rgba(255,255,255,0.1)`): The lighter variant for in-flow cards. The shadow carries a faint blue cast, which is why it reads as cast light rather than dirt.
- **Data Glow** (`box-shadow: 0 0 20px <semantic-color>40`): Reserved for rendered celestial objects — the planet spheres in ExoVis and ExoCreator. Never applied to UI chrome.

### Named Rules

**The Lit-From-Within Rule.** Every raised panel carries `inset 0 1px 0 rgba(255,255,255,0.1–0.2)` along with its drop shadow. A drop shadow alone is not elevation in this system; it is the top highlight that makes the panel an object.

**The Glow Is Physical Rule.** Glow means an object emits light — a star, a planet, an atmosphere. A button does not emit light. Data Glow never touches chrome.

## Shapes

Fully round or gently rectangular, with nothing in between carrying meaning. `rounded-full` is the most-used shape in the codebase by a factor of four: every control that a hand operates — buttons, tabs, badges, icon buttons, color swatches, the scroll indicator — is a pill or a circle. Containers are rectangles with soft corners: 8px (`lg`) for in-flow cards, 12px (`xl`) for inputs and dropdowns, 16px (`2xl`) for floating panels, and 24px (`3xl`) for the largest shell surfaces. The larger the surface, the larger its radius.

Borders are always exactly 1px. On opaque graphite, the border is Panel Edge (#374151); on translucent scene layers it is white at 10–30% opacity, scaling with how much the element needs to assert itself. There is no second border weight and no dashed or doubled treatment anywhere in the system.

### Named Rules

**The Pill Rule.** If a control responds to a click, it is `rounded-full`. If it holds content, it is a soft rectangle. A rounded-rectangle button is a container pretending to be a control.

**The Hairline Rule.** All borders are 1px. Emphasis is expressed by raising the border's opacity (white/10 → white/20 → white/30), never by thickening it.

## Components

### Buttons

- **Shape:** Pill (`rounded-full`, 9999px). Height 40px default, 36px compact.
- **Primary:** Graphite fill (#111827), Starlight text, 12px/24px padding, Label typography. No color at rest — under The Instrument Panel Rule a primary action is not information.
- **Hover / Focus:** Background lifts to Panel Edge (#374151) over 300ms. Focus-visible draws a 2px Signal Violet ring, offset 2px. Hover never scales chrome (see The Two Budgets Rule).
- **Ghost:** Transparent at rest with Starlight Faint text; graphite fill and Starlight text on hover. The default for tertiary and repeated actions — sort controls, panel dismissals, pagination.
- **Selected state:** Inverted — Starlight fill, Void Black text. Inversion is how the system says "this one," because it costs no hue.

### Chips

- **Style:** Pill, 2px/10px padding, Label typography.
- **Data chips:** Follow The Data Badge Formula exactly — semantic fill at 20%, border at 30%, text at full strength.
- **Filter/sort chips:** Ghost button at rest, inverted (Starlight on Void Black) when selected.

### Cards / Containers

- **Corner Style:** 8px in flow, 16px when floating.
- **Background:** Graphite at 90–95% opacity over the scene.
- **Shadow Strategy:** Lit Surface in flow, Lit Panel when floating. Always with the inset top highlight.
- **Border:** 1px Panel Edge.
- **Internal Padding:** 24px (`p-6`) standard, 16px (`p-4`) compact.
- **Entry:** Fade and rise 50px on scroll into view, 600ms, staggered 50ms per item, `viewport once` — then completely still.

### Inputs / Fields

- **Style:** Graphite fill, 1px border at white/20, 12px radius, 48px height. Leading icon inset 16px from the left in Starlight Faint; trailing status icon (spinner, clear) mirrored on the right. Placeholder in Starlight Faint.
- **Focus:** Border resolves to white/40 and a 2px Signal Violet ring appears. No glow, no scale, no color fill.
- **Error:** Border and helper text in Hostile Red; the field's fill never changes.
- **Disabled:** 50% opacity, pointer events off.

### Navigation

Fixed to the top, transparent over the hero, then graphite at 50% with backdrop blur once scrolled past 20px — the bar materializes as the sky scrolls away beneath it. The wordmark sits dead center at 2.25rem/700, with navigation split symmetrically to either side at 1.25rem in Starlight, each item an icon plus a label. Hover shifts the item to Data Blue over 300ms.

Below `md` the bar collapses to a hamburger with the wordmark centered; the sheet drops from the bar in graphite at 90% with backdrop blur, animating in over 200ms as a 20px rise and fade.

### Signature Component: The Floating Control Panel

ExoCreator's defining surface, and the fullest expression of the system. A 384px-wide graphite panel fixed to the top-right of the viewport, capped at `calc(100vh - 120px)` with internal scroll, at 16px radius with a Panel Edge hairline and the full Lit Panel shadow. It hovers over a live 3D scene it is directly controlling, which is exactly why it must be opaque and why it must be lit along its top edge: it is a console in front of the show, not a window into it.

Inside, subsystem tab pills carry the Tertiary colors — the one sanctioned use of saturated fill on chrome, because there the hue answers "what am I editing." Below `md` the panel abandons its fixed position and becomes a bottom-anchored, collapsible full-width sheet.

## Do's and Don'ts

### Do:

- **Do** paint every panel Graphite (#111827) at 90–95% opacity over the sky, with a 1px Panel Edge border and both halves of the Lit Panel shadow.
- **Do** reserve saturated hue for data semantics — habitability, planet class, provenance, achievement, active subsystem — and follow The Data Badge Formula (20% fill / 30% border / full-strength text).
- **Do** set archive figures in Readout (300 weight, ≥1.875rem) above a Starlight Faint label.
- **Do** give the scene a perpetual slow loop (≥3s) and hold the chrome to input-response motion at ≤300ms.
- **Do** join sections with a `h-32` black-to-transparent gradient over a `-mt-16 pt-32` overlap.
- **Do** let controls rest recessive — border at white/10–white/20, text at Starlight Faint — and resolve to full contrast only on hover and focus.
- **Do** design compact and `md`-and-up as two deliberate compositions, especially for the creator's control panels.
- **Do** honor `prefers-reduced-motion` by stopping every ambient loop, not by shortening it.

### Don't:

- **Don't** put a hue gradient on type. The blue → purple headings in [featurecard.tsx](src/components/ui/featurecard.tsx) and the cyan → purple → pink treatment in the credits section are retired; only the monochrome white → #9CA3AF display wash survives.
- **Don't** paint chrome with a semantic color. A violet or indigo button fill (`bg-indigo-700/30`, `bg-indigo-600/50` in [exoquest.tsx](src/components/exoquest.tsx)) makes an action look like a data state.
- **Don't** build translucent glass panels. `backdrop-blur-xl bg-white/5 border-white/10` is the older ExoVis dialect; it is being migrated to opaque graphite, and blur is legibility-only from here on.
- **Don't** scale chrome on hover. `hover:scale-105` on cards and answer buttons is scene behavior applied to a console.
- **Don't** apply Data Glow to a UI element. Glow means the object emits light; only stars, planets, and atmospheres do.
- **Don't** paint a panel pure black — it dissolves into the sky and the lit edge loses its ground.
- **Don't** add a third `:root` block to [globals.css](app/globals.css). Two already exist (line 6 and line 234) and the later one silently overrides the first; the cosmic dark values at line 234 are the live tokens.
- **Don't** leave `body { font-family: Arial, Helvetica, sans-serif }` in place at [globals.css:68](app/globals.css#L68). Geist is loaded, preloaded, and exposed as `--font-geist-sans`, but nothing consumes it — that one declaration is currently overriding the entire type system documented above.
