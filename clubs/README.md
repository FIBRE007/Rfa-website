# RFA Standalone Club Registration

Standalone, mobile-first club registration site intended for:

`https://clubs.royalfamilyacademy.org`

## What is included

- RFA-branded club registration interface.
- Section-specific class options.
- Section-specific club eligibility.
- Published club capacities.
- Server-side revalidation of class/club eligibility.
- Cloudflare Pages Function that securely forwards registrations to the existing school portal without exposing the portal token in the browser.

## Important assumption

The first unlabeled club list supplied for this build is treated as the **High School** list. The other lists are explicitly mapped to Upper Primary, Lower Primary and Nursery.

## Club rules in this version

- **Upper Primary:** Grades 4 and 5 only.
- **Lower Primary:** Grades 1, 2 and 3 only.
- **Nursery:** Kindergarten pupils only.
- **High School:** JH 1–3 and SH 1–3 are currently offered as class choices.

Capacities shown on the page are the published maximum capacities, not live spaces remaining. Live capacity / duplicate-registration enforcement should remain in the existing portal backend.

## Connect to the existing portal

The Cloudflare Pages Function is at:

`functions/api/register.js`

Configure these environment variables in the Cloudflare Pages project:

- `CLUBS_PORTAL_REGISTER_URL` — required. The existing portal endpoint that accepts a club registration.
- `CLUBS_PORTAL_TOKEN` — optional. A server-side bearer token if the portal endpoint requires one.

The bridge sends JSON in this shape:

```json
{
  "studentName": "Student Name",
  "studentId": "RFA/2026/001",
  "section": "upper-primary",
  "sectionLabel": "Upper Primary",
  "classLevel": "Grade 5",
  "club": "ICT Club (Upper Primary)",
  "guardianPhone": "",
  "guardianEmail": "",
  "session": "2026/2027",
  "term": "Joy Term",
  "publishedCapacity": 25
}
```

If the current portal uses different field names, adapt only the outgoing payload inside `functions/api/register.js`; the public page does not need to change.

## Cloudflare Pages deployment

Create a second Pages project using the existing `FIBRE007/Rfa-website` repository.

Recommended settings:

- Production branch: `main` (after this feature is merged)
- Root directory: `clubs`
- Framework preset: None
- Build command: leave blank
- Build output directory: `.`

Then add the environment variables above and attach the custom domain:

`clubs.royalfamilyacademy.org`

Cloudflare will handle HTTPS once the custom domain is attached.

## Before going live

1. Confirm that the first club list is indeed for High School.
2. Confirm the exact High School class labels used by the portal.
3. Provide or identify the existing portal club-registration endpoint and its expected request/response fields.
4. Test a registration against a non-production/test student if the portal supports one.
5. Confirm that duplicate registration and capacity locking are enforced by the portal transaction, not only in the browser.
