# SIGNAL / NOISE — Ericsson Raphael

A monochrome data-installation that happens to be a resume. Next.js 16 + Three.js (react-three-fiber) + GSAP + Lenis, black and white only.

## Run

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build (static)
```

## The chapters

| #    | Chapter    | Scene (all Three.js unless noted)                                                                                                                                                      |
| ---- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 01   | HERO       | 16,000 particles assemble "ERICSSON RAPHAEL", repel around the cursor, dissolve into noise on scroll                                                                                   |
| 02   | MANIFESTO  | "Engineer by craft, adventurer at heart" (solid vs outlined type), scroll-drawn square-to-sine SVG, stat strip with years computed live from Oct 2021                                  |
| 03   | EXPERIENCE | Accordion career record grouped Full-time (incl. the Side Hustle internship) / Contract / Freelance, each with outbound links, plus a one-line Education entry                         |
| 04   | WORKS      | Index of builds with full-row hover inversion                                                                                                                                          |
| 04.5 | STACK      | Rolling credits: five equal disciplines scrolling like a film's cast, hover to hold a column, EXPAND for the full flat list                                                            |
| 05   | LENS       | Horizontally pinned gallery of Ericsson's own photos and autoplaying reels (converted reel leads): monochrome + dark wash by default, true color develops on hover (in view, on touch) |
| 06   | SIGNAL     | Broadcast ripples answering the cursor, contact + colophon                                                                                                                             |

## Make it fully yours

1. **Moniepoint bullets and dates**: `src/content/profile.ts` (search `TODO(ericsson)`).
2. **Gallery media**: Run `node scripts/prepare-gallery.mjs` to resize photos into `public/gallery/`, and `node scripts/transcode-reel.mjs` to convert HEVC video via the bundled ffmpeg-static, then update `src/content/gallery.ts`.
3. **Social links**: add Instagram / portfolio links in `src/content/profile.ts` under `contact`.
4. **Years of experience** are computed from `CAREER_START` (Oct 2021) in `profile.ts`, floored with a `+` suffix, so they update automatically each October.
5. All copy lives in `src/content/profile.ts`.

## Notes

- Polarity system: every chapter declares `data-polarity="dark|light"`; fixed chrome (nav, cursor, HUD) survives inversion via `mix-blend-difference`.
- All scenes lazy-mount near the viewport and respect `prefers-reduced-motion`.
- Fonts: Archivo (variable width), Fragment Mono, EB Garamond via `next/font`.
