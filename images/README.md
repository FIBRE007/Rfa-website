# RFA Image System

This folder is the single source of real photography for the whole RFA
ecosystem (main academy site + `junior` + `highschool`). Every photograph on
every page is rendered through the `.media-slot` component
(`shared/css/components.css` + `shared/js/media.js`), which:

1. Shows an elegant, on-brand placeholder (royal purple → gold gradient with
   a text label) until a real file exists at the expected path.
2. Automatically swaps the placeholder for the real photo the moment that
   file is present — **no HTML/CSS edits required**. Just add the file.

## Folder taxonomy

| Folder | Use for |
|---|---|
| `academy/` | Whole-institution shots: campus signage, gates, brand moments used on the main domain |
| `campus/` | Wide establishing shots, aerial/exterior architecture |
| `nursery/` | Nursery-specific classrooms, play, staff |
| `kindergarten/` | Kindergarten-specific classrooms, activities |
| `primary/` | Primary school classrooms, activities |
| `high-school/` | Junior/Senior Secondary + Sixth Form imagery |
| `students/` | Cross-cutting candid student portraiture/moments not tied to one subject |
| `teachers/` | Faculty portraits and teaching moments |
| `leadership/` | Head of school, principals, board — official portraits |
| `classrooms/` | Interior learning environments |
| `science/` | Labs, experiments, STEM |
| `ict/` | Computer labs, robotics, digital learning |
| `sports/` | PE, teams, matches, sports day |
| `music/` | Choir, instruments, performances |
| `arts/` | Visual art, design, drama |
| `leadership-development/` | Assemblies, public speaking, student leadership programmes |
| `graduation/` | Convocation / graduation ceremonies |
| `events/` | School events, trips, competitions |
| `facilities/` | Library, auditorium, cafeteria, clinic, discovery centre, swimming |

## Naming convention

`lowercase-hyphenated-description.jpg`, e.g.
`rfa/images/science/student-conducting-experiment.jpg`

Each `.media-slot` in the markup already declares its expected filename via
`data-src`, and a human-readable placeholder label via `data-alt` (this
value becomes the final `alt` text — write it as a real description of the
photo's content per WCAG guidance, not a caption).

## Supplying real photography

1. Export the photo. Recommended: **WebP** (or AVIF if available), sRGB,
   photographed/cropped so the subject's focal point sits where the
   `--focal` CSS custom property on the slot expects it (default is
   centered; a slot may set e.g. `style="--focal: 50% 20%"` for a
   top-weighted crop — check the page markup for the slot in question).
2. Save at the exact path shown in that slot's `data-src`.
3. For hero/full-bleed slots, also supply `data-srcset`/`data-sizes` values
   (already wired in markup) so the browser downloads an appropriately
   sized file per viewport instead of one giant original.
4. Reload the page — the placeholder is gone, the real photo fades in.

## Optimisation checklist (per brief §9)

- Prefer WebP/AVIF; keep a JPEG fallback only if a consuming browser
  requires it.
- Generate at minimum 3 widths per hero/full-bleed image (e.g. 800/1600/2400)
  for `srcset`.
- Compress to the smallest file size that preserves visible quality
  (target: hero images under ~300KB, in-grid photography under ~150KB).
- Never upload an unresized camera original directly into these folders.
- `loading="lazy"` is automatic for every slot except those marked
  `data-eager` (hero and first-viewport imagery) which preload instead.
- `width`/`height` (or `aspect-ratio` via the `.media-slot--*` modifier
  classes) are always set ahead of the real image loading, so nothing shifts
  layout as photography comes in.

## Do not fabricate

Do not place stock photography, AI-generated imagery, or photographs of
students/staff without RFA's explicit permission into this system. Every
image slot is meant to be filled with **real, approved RFA photography**
only. Leave slots as placeholders rather than filling them with anything
else.
