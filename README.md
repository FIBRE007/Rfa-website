# Royal Family Academy — Website Ecosystem

A source-controlled, premium, cinematic website ecosystem for Royal Family
Academy (RFA), Abuja: a single-viewport academy gateway plus three
school-specific subdomains, built as static HTML/CSS/JS sharing one design
system.

```
royalfamilyacademy.org                              — main/                (single-viewport gateway, no subpages)
nurseryandprimaryschool.royalfamilyacademy.org       — nurseryandprimaryschool/   (Crèche – Grade 6)
highschool.royalfamilyacademy.org                    — highschool/          (Junior High 1 – Senior High 3)
sixthform.royalfamilyacademy.org                     — sixthform/           (Age 17+, verified shell only)

shared/    design tokens, base styles, components, animation/interaction JS, RFA AI + knowledge base — used by all four sites
images/    the real-photography asset system (see images/README.md)
robots.txt, sitemap.xml
```

## Source governance (read this before editing content)

This build is **source-controlled**: content is restricted to the current
RFA website and currently published RFA materials (see Source Register
below). Two rules govern every edit:

1. **Never invent institutional facts** — fees, admission dates, staff
   biographies, results, awards, accreditation wording, university
   destinations, facilities, programmes, testimonials, statistics.
2. **Where current sources don't provide something, leave an explicit,
   greppable placeholder** rather than generic filler copy. Find every open
   placeholder with:
   ```sh
   grep -rn "INSERT VERIFIED\|INSERT RFA-APPROVED\|Verify before publication\|Content note:\|Pending RFA approval" main nurseryandprimaryschool highschool sixthform
   ```

**ACSI status is authoritative and current.** RFA has confirmed its ACSI
approval is current — the main-domain gateway presents "ACSI Accredited
School" prominently and without qualification. Do not reintroduce older
"pending accreditation" wording from historical materials; if RFA ever
confirms different terminology (e.g. "approved" vs. "accredited"), update
`main/index.html`'s `.acsi-badge__status` and `shared/js/rfa-knowledge.js`'s
`acsi.status` together — they must always agree.

**Preserve RFA terminology exactly:** motto "Raising Distinguished
Leaders"; Leadership as the core value, anchored on Discipline, Excellence,
Hard Work, Integrity and Innovation. Do not split Primary into separate
Lower/Upper Primary curricula, and do not invent Sixth Form programme
detail — both are explicitly unsupported by current sources (see §34 of the
originating specification).

## Site-by-site summary

- **Main gateway** (`main/index.html`): a single non-scrolling viewport —
  RFA logo, large ACSI badge + status, a short (currently placeholder,
  pending RFA approval) Christian-school significance statement, a VISIT
  CTA that opens a lightweight contact modal (kept as a modal, not a new
  section, so the page still never scrolls), the three school links (using
  real production subdomain URLs), social placeholders, and the RFA AI
  launcher. No conventional navigation, no long-form content — that's by
  design (see spec §4.1).
- **Nursery & Primary** (`nurseryandprimaryschool/`): full verified content
  — Early Years age table, Primary age table + curriculum, both weekly
  timetables, clubs/events/sports/houses, Christian formation, Discovery
  Centre/AAS support, campus facilities, school-day/parent info, transport
  routes, shared leadership roster, policies list. Plus `admissions.html`
  and `contact.html`.
- **High School** (`highschool/`): full verified content — age table,
  Junior High + Senior High subject lists, academic assessment, the
  Leadership/Innovation/Discipline philosophy passages, MUN + Duke of
  Edinburgh, spiritual formation, safety/conduct, policies. Plus
  `admissions.html` and `contact.html`.
- **Sixth Form College** (`sixthform/`): deliberately a **shell**. Only the
  verified positioning is published (17+, advanced academic programmes,
  tailored support, university prep and leadership, Head of Sixth Form Mrs
  Adebola Oluboyo); every other section is a clearly labelled placeholder
  per spec §20.2. Do not fill these in without a current RFA-approved
  source — that's the one subdomain where under-building is correct.

## RFA AI

`shared/js/rfa-knowledge.js` is the single source of truth for the
assistant (motto/vision/mission/values, ACSI status, school links, contact,
admissions steps, age tables, school hours, leadership). `shared/js/rfa-ai.js`
is a discreet bottom-right launcher present on every property; it answers
**only** by matching keywords against that knowledge object and returning
its exact strings — it does not call a generative model and cannot invent
facts. If nothing matches, it says so and points to verified contact
details instead of guessing. Swap in a real backend later by replacing the
`answer()` function's internals; the markup/CSS contract can stay as-is.

## Why this structure

- **Content vs. design vs. components are separated.** All visual language
  lives in `shared/css/tokens.css`; reusable UI lives in
  `shared/css/components.css`, `gateway.css`, `rfa-ai.css` and
  `shared/js/*`; every page is markup + real copy over shared components.
- **One brand, four personalities.** `tokens.css` defines
  `[data-site="junior"]` / `[data-site="highschool"]` accent overrides (the
  `nurseryandprimaryschool` and `sixthform` bodies use `data-site` for
  AI-widget routing context today; extend the token overrides the same way
  if those subdomains need their own accent lean).
- **No animation library dependency.** Scroll reveals, counters and hero
  entrances use IntersectionObserver + CSS transitions
  (`shared/js/reveal.js`, `shared/css/animations.css`), fully inert under
  `prefers-reduced-motion`.
- **Images are drop-in.** See `images/README.md`. `.media-slot` shows an
  on-brand placeholder until a real file lands at the documented path —
  nothing else needs to change.

## Deploying as four real (sub)domains

This repo currently serves all four sites as sibling folders with relative
links so the whole ecosystem can be previewed from one static file server,
except the **main gateway's three school links and every subdomain's
cross-links to sibling subdomains**, which already use real absolute
production URLs (`https://nurseryandprimaryschool.royalfamilyacademy.org/`,
etc.) since these are genuinely separate origins once deployed. To go live:

1. Point `royalfamilyacademy.org` at `main/`.
2. Point `nurseryandprimaryschool.royalfamilyacademy.org` at
   `nurseryandprimaryschool/`.
3. Point `highschool.royalfamilyacademy.org` at `highschool/`.
4. Point `sixthform.royalfamilyacademy.org` at `sixthform/`.
5. Each subdomain's pages still reference `../shared/` and `../images/` —
   either deploy those two folders to each subdomain host, or (recommended)
   rewrite those paths to a shared CDN/asset-host URL before going live.
   Search for `../shared/` and `../images/` to find every reference.
6. Update canonical/OG URLs if final hosting differs from what's declared.

## What's built vs. what the full specification describes

The specification's IA table lists many more subdomain pages (curriculum,
facilities, parents, news/media as standalone URLs) than exist as separate
files today. To keep the build real rather than a skeleton of empty pages,
Nursery & Primary and High School each ship as one content-complete home
page (all IA sections present as anchored sections, matching the nav)
plus dedicated `admissions.html` and `contact.html` — the two pages worth
splitting out for direct linking/SEO. Splitting any anchored section into
its own physical page later is a copy-paste of that section into the
existing header/footer scaffold; no new components are needed.

Not yet built: a shared news/events/gallery/media system (spec §25), a full
masonry gallery with lightbox, and Sixth Form's remaining pages (all
intentionally deferred pending RFA-approved content, per §20.2).

## Typography & colour quick reference

- Display serif: **Cormorant Garamond** (statement numbers/quotes use **DM
  Serif Display**) — swap the `--font-display` / `--font-accent-serif`
  stacks in `tokens.css` if a licensed Canela-style face becomes available.
- Body sans: **Inter**.
- Royal purple `--rfa-purple-600 #431677`, accent gold `--rfa-gold-500
  #c6a24e`, ivory/warm-white/charcoal neutrals — all in `tokens.css`.

## Accessibility & performance notes

- Skip link, semantic landmarks, visible focus states, and
  `prefers-reduced-motion` support are in place on every page.
- All imagery goes through `.media-slot`: reserves aspect ratio up front
  (no layout shift), lazy-loads below the fold, eager-loads only
  hero/first-viewport imagery.
- The gateway (`main/index.html`) is hard-capped to one viewport
  (`height: 100svh; overflow: hidden`) with `clamp()`/`vh`-based spacing so
  it holds together without scrolling from small phones to large desktops;
  the Christian-school significance statement and logo subtitle
  auto-collapse under `max-height: 620px` to protect that guarantee on very
  short viewports.
- Fonts load via `display=swap` Google Fonts with `preconnect`; for
  production, consider self-hosting the weights actually used.

## Source Register

| Source | URL |
|---|---|
| Current RFA homepage | https://royalfamilyacademy.org/ |
| Current RFA home page | https://royalfamilyacademy.org/home/ |
| History & Milestones | https://royalfamilyacademy.org/history-milestones/ |
| History | https://royalfamilyacademy.org/history.html |
| About / FAQs | https://royalfamilyacademy.org/about.html |
| Welcome from Director | https://royalfamilyacademy.org/welcome.html |
| Prospectus | https://royalfamilyacademy.org/prospectus.html |
| Nursery admissions | https://royalfamilyacademy.org/nursery/ |
| Primary admissions | https://royalfamilyacademy.org/primary-school-2/ |
| High School admissions | https://royalfamilyacademy.org/high-school/ |
| Co-curricular activities | https://royalfamilyacademy.org/curricular.html |
| Events & Activities | https://royalfamilyacademy.org/events-activities/ |
| Policies | https://royalfamilyacademy.org/policies/ |
| High School handbook (PDF) | https://www.royalfamilyacademy.org/uploads/TheHighSchoolhandbook.pdf |
| Primary School handbook (PDF) | https://www.royalfamilyacademy.org/uploads/ThePrimarySchoolhandbook.pdf |

## Content gaps — do not invent

Current detailed Sixth Form curriculum/programme pages; Sixth Form
admission requirements and fees; university destinations and graduate
outcomes; verified examination results and awards; detailed Lower/Upper
Primary curricula; a complete teacher directory; verified parent/student
testimonials; any ACSI wording beyond the current approved status; any
facility or programme not explicitly supported by current RFA sources.
