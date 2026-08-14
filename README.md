# Royal Family Academy — Website Ecosystem

A premium, cinematic, three-site ecosystem for Royal Family Academy (RFA),
Abuja: one main academy gateway plus two dedicated school subdomains, built
as static HTML/CSS/JS sharing a single design system.

```
rfa/
  shared/           design tokens, base styles, components, animation & interaction JS — used by all three sites
  images/           the real-photography asset system (see images/README.md)
  main/             royalfamilyacademy.org  — index, about, admissions, contact
  junior/           junior.royalfamilyacademy.org — Nursery / Kindergarten / Primary
  highschool/        highschool.royalfamilyacademy.org — Junior/Senior Secondary, Sixth Form
  robots.txt, sitemap.xml
```

## Why this structure

- **Content vs. design vs. components are separated.** All visual language
  (colour, type, spacing, motion) lives in `shared/css/tokens.css`; reusable
  UI lives in `shared/css/components.css` and `shared/js/*`; every page is
  just markup + real copy. Update the brand once, it updates everywhere.
- **One brand, three personalities.** `tokens.css` defines `[data-site="junior"]`
  and `[data-site="highschool"]` overrides so each school can lean warmer or
  more austere without forking the design system.
- **No animation library dependency.** Scroll reveals, counters and the
  hero entrance are done with plain IntersectionObserver + CSS transitions
  (`shared/js/reveal.js`, `shared/css/animations.css`) per the brief's
  performance guidance — everything is inert under `prefers-reduced-motion`.
- **Images are drop-in.** See `images/README.md`. Nothing needs to be
  rebuilt when RFA supplies real photography — files just need to land at
  the documented path.

## Deploying as three real (sub)domains

This repo currently serves all three sites as sibling folders with relative
links (`../junior/index.html`, etc.) so the whole ecosystem can be previewed
from one static file server. To go live on the real domain structure:

1. Point `royalfamilyacademy.org` at `rfa/main/`.
2. Point `junior.royalfamilyacademy.org` at `rfa/junior/`.
3. Point `highschool.royalfamilyacademy.org` at `rfa/highschool/`.
4. Each subdomain's `index.html` still needs `../shared/` and `../images/`
   reachable — either deploy `shared/` and `images/` to each subdomain host,
   or (recommended) rewrite the `../shared/…` and `../images/…` paths to an
   absolute CDN/asset-host URL shared by all three deployments before going
   live. Search each HTML file for `../shared/` and `../images/` to find
   every reference.
5. Update the canonical/OG URLs already present in each page's `<head>` if
   the final hosting differs from what's declared.

## Content &amp; placeholder policy (important)

Per the brief: **no fabricated facts.** Every place where verified RFA
information was not supplied is marked with an explicit, greppable
placeholder such as `[INSERT VERIFIED …]`, so nothing invented can be
mistaken for confirmed fact. To find every placeholder still needing real
content:

```sh
grep -rn "INSERT VERIFIED\|—]</p>" rfa/main rfa/junior rfa/highschool
```

This currently covers: vision/mission statements, history/timeline
milestones, principal/leadership bios, curriculum specifics per stage,
facilities descriptions beyond the standard category names, admission
requirements, achievements/statistics, and testimonials. Replace each with
RFA-approved copy before launch — do not fill them with invented figures,
quotes, or credentials.

## What's built vs. what the full brief describes

The brief (§1–§39) specifies a very large site — dozens of pages per
subdomain (curriculum, facilities, gallery, news, FAQs, etc.), a full news
system, and a full masonry gallery with lightbox. To ship something
coherent and real rather than a skeleton of empty pages, this pass built
the pages that carry the brand's core emotional arc end-to-end:

- **Main site:** homepage (hero → Why RFA → "Who will your child become" →
  school selection → story timeline → academic journey → facilities
  explorer → student life → testimonials → achievements → news stub →
  final CTA), About, Admissions, Contact.
- **Junior subdomain:** full homepage (hero → about → Nursery/KG/Primary →
  learning approach → student life → admissions CTA).
- **High School subdomain:** full homepage (hero → about → Junior/Senior
  Secondary/Sixth Form → STEM &amp; Arts → leadership → university prep →
  achievements → admissions CTA).

**Not yet built** (structurally ready to add using the same `shared/`
system + the same section patterns already in these pages): dedicated
curriculum/facilities/gallery/news/FAQ pages, the full masonry gallery with
lightbox, and the remaining subdomain sub-pages listed in brief §31–32.
Each can be assembled quickly by copying an existing page's header/footer
scaffold and composing the relevant `shared/css/components.css` blocks
(`.pillar`, `.editorial-grid`, `.timeline`, `.journey`, `.gallery-masonry`,
`.quote-carousel`, `.stat-grid` are all already built and reusable).

## Typography &amp; colour quick reference

- Display serif: **Cormorant Garamond** (statement numbers/quotes use **DM
  Serif Display**) — swap the `--font-display` / `--font-accent-serif`
  stacks in `tokens.css` if a licensed Canela-style face becomes available;
  nothing else needs to change.
- Body sans: **Inter**.
- Royal purple `--rfa-purple-600 #431677`, accent gold `--rfa-gold-500
  #c6a24e`, ivory/warm-white/charcoal neutrals — all in `tokens.css`.

## Accessibility &amp; performance notes

- Skip link, semantic landmarks, visible focus states, and
  `prefers-reduced-motion` support are in place on every page.
- All imagery goes through `.media-slot`, which reserves aspect ratio up
  front (no layout shift), lazy-loads everything below the fold, and
  eager-loads only hero/first-viewport imagery.
- Fonts are loaded via `display=swap` Google Fonts with `preconnect`; for a
  production launch, consider self-hosting the two weights actually used to
  cut an external request.
