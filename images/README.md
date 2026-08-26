# RFA Image System

Real photography and video for the whole RFA ecosystem (main gateway +
Nursery & Primary + High School + Sixth Form) live in a **Cloudflare R2
bucket** (`media.royalfamilyacademy.org`) — not in this repository. This
folder holds only documentation and the taxonomy the bucket's object keys
follow; there is nothing to commit here.

Every photograph on every page is rendered through the `.media-slot`
component (`shared/css/components.css` + `shared/js/media.js` +
`shared/js/media-config.js`), which:

1. Shows an elegant, on-brand placeholder (royal purple → gold gradient with
   a text label) until a real file exists at the expected key in the bucket.
2. Automatically swaps the placeholder for the real photo the moment that
   file is present — **no HTML/CSS edits required**. Just upload the file.

`media-config.js` defines `RFA_MEDIA_URL()`, which resolves a `data-src` (or
`data-video-mp4`/`data-video-webm`) value like `"academy/gateway-cinematic-backdrop.jpg"`
against `RFA_MEDIA_BASE` (`https://media.royalfamilyacademy.org/`) to get the
real URL fetched at runtime. Markup never hardcodes the bucket host —
change `RFA_MEDIA_BASE` in one place if the bucket ever moves.

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

`<category>/lowercase-hyphenated-description.jpg` — the category is the R2
object key prefix (matches the table above), e.g.
`science/student-conducting-experiment.jpg`. That full key is what goes in
`data-src`, exactly as it should be typed at the R2 bucket.

Each `.media-slot` in the markup already declares its expected key via
`data-src`, and a human-readable placeholder label via `data-alt` (this
value becomes the final `alt` text — write it as a real description of the
photo's content per WCAG guidance, not a caption).

## Supplying real photography

1. Export the photo. Recommended: **WebP** (or AVIF if available), sRGB,
   photographed/cropped so the subject's focal point sits where the
   `--focal` CSS custom property on the slot expects it (default is
   centered; a slot may set e.g. `style="--focal: 50% 20%"` for a
   top-weighted crop — check the page markup for the slot in question).
2. Upload it to the `media.royalfamilyacademy.org` R2 bucket at the exact
   key shown in that slot's `data-src` (Cloudflare dashboard → R2 → the
   bucket → Upload, or drag-and-drop into the matching folder).
3. For hero/full-bleed slots, also supply the files named in that slot's
   `data-srcset` (already wired in markup) so the browser downloads an
   appropriately sized file per viewport instead of one giant original.
4. Reload the page — the placeholder is gone, the real photo fades in. No
   redeploy needed; the bucket is fetched live at runtime.

## Background video (main gateway only, optional)

The gateway's cinematic backdrop slot (`main/index.html`) also accepts a
looping background video that fades in over the photograph the moment it's
supplied — same drop-in contract as photography, via `shared/js/video-bg.js`.
The photo stays as the poster and permanent fallback; nothing breaks if the
video is never added.

1. Upload the file to the R2 bucket at `academy/gateway-cinematic-backdrop.mp4`
   (H.264, required) and optionally also
   `academy/gateway-cinematic-backdrop.webm` (VP9, tried first where
   supported — noticeably smaller for the same quality).
2. Keep the existing `academy/gateway-cinematic-backdrop.jpg` in the bucket —
   it's used as the `poster` attribute and the only thing shown at all when
   video is skipped (see below), so it must still represent the scene well
   on its own.
3. Recommended spec: silent (audio is stripped by autoplay policy anyway),
   ambient/establishing B-roll — not a produced piece with cuts that assume
   sound or a fixed runtime. 10–20s, seamless loop (matching first/last
   frame), 1920×1080, target **well under 6MB** — this plays behind a
   single-viewport hero, so it must not be the thing that slows the page down.
4. Reload the gateway — the photo shows instantly as always, and the video
   quietly fades in on top of it once it's buffered enough to play.

**Video is automatically skipped** (photo-only, no request even attempted)
when the visitor has `prefers-reduced-motion` set, or the browser reports
Data Saver / a 2G-class connection. This is not configurable per-slot; it's
a blanket accessibility/performance guarantee.

Same rule as photography: **do not fabricate.** No stock footage, no
AI-generated video — real, RFA-approved campus footage only, or leave it as
a photograph.

## Optimisation checklist (per brief §9)

- Prefer WebP/AVIF; keep a JPEG fallback only if a consuming browser
  requires it.
- Generate at minimum 3 widths per hero/full-bleed image (e.g. 800/1600/2400)
  for `srcset`.
- Compress to the smallest file size that preserves visible quality
  (target: hero images under ~300KB, in-grid photography under ~150KB).
- Never upload an unresized camera original straight into the bucket.
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
