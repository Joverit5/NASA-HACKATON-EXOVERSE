# Surface brief — app/page.tsx

## Scope and mode

The landing surface (Information Hub) and the shared light-curve mechanism it introduces. Mode: **Persuade** — the visitor decides ExoVerse is worth their next ten minutes and reaches for a control.

## Audience and job

A visitor arriving from a shared link with no astronomy background, alongside a student sent by a teacher and an enthusiast who already follows exoplanet news. The job is the same for all three: understand within one viewport that these are real, *measured* worlds, and find a way in.

## Action and proof

One primary action in the first viewport: **Walk the curve**. The proof is the measurement itself — a live transit light curve whose dip depth, period and distance come from the NASA Exoplanet Archive rather than being authored. Showing the method is the argument for trusting the numbers.

## Chosen direction

**The Transit Curve** — chosen by the user, overriding the roll. The Orrery (seed 45fa31a7, candidate 6 of 7) was rejected on named grounds: it reads as steampunk, and ExoVerse is meant to be modern, technological and vanguard. A user-pinned direction beats the roll, always.

Every planet enters as it was actually discovered: as a dip in its star's light. The curve is the navigation surface and the data structure, not a decorative plot. **The dip is the planet** — its depth encodes radius, its width encodes period, so reading the graph teaches the method.

It refuses the arrangement this category always ships — starfield, neon gradient headline, 3D planet drifting right of centre, glassmorphic cards — which is precisely what ExoVerse is today.

## References (pin the register, not the world)

- **un.org/en/content/feature/theracetosavespace** → Roboto Serif variable (optical size 8–144) for narrative plus Roboto Mono for every archive value; single mint accent `#78D6A9` taken literally. Mint doubles as the habitability semantic, so the site's only accent and its most important datum are the same thing.
- **oakley.com/en-us/l/axiom-space** → the copy voice is engineering spec, not marketing. "TRANSIT DEPTH 0.0021 · 384.8 d · 1402 ly", never "an immersive digital platform".
- **gru.space** → the craft bar, plus an explicit loading state rather than a pretence of instant data. Section sequence maps as hero → timeline → technical explainer → credits → CTA.

## Memorable moment

Scroll position maps to time on the curve: scrolling *is* walking the transit, driven by native CSS scroll-driven animations (`animation-timeline: scroll()`) on the compositor rather than a JS animation runtime. Discovery history advances as a series of real light curves, from 51 Pegasi b in 1995 outward.

## Constraints

- The four pillar names and structure are fixed product truth; this surface introduces the mechanism the other three reuse.
- Requires the coordinated version jump first: React 19.2, Next 16.3, `@react-three/fiber` 9.7, drei 10.7, three 0.185. R3F v8 pins React 18 and is what forced the revert in commit `67dca00`; the five move together or not at all.
- No apply button anywhere: one control remaps the whole view live with a visible numeric readout.
- Every archive quantity changes as a visible physical event, never a silent text swap.
- Three degradation tiers — WebGPU, WebGL2, flat SVG — and the flat SVG ships as a peer rendering for reduced-motion, screen readers and print, not as a sad placeholder.
- No fabricated claims: no user counts, adoptions, press, awards, or NASA affiliation.

## Unresolved

- Multi-language is recorded as planned but undecided; condensed mono labels break first under a 1.6× string, and no archive value may be baked into a texture.
- The donation control remains a placeholder and must not be presented as functional.
- ExoQuest is the weakest fit for the mechanism and inherits materials rather than geometry; revisit after the pillar phase rather than sanding the mismatch down.
- Popover API + CSS anchor positioning for planet detail: support is still uneven, so progressive enhancement or nothing.
