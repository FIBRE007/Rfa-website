# RFA Clubs Registration

Standalone frontend for `https://clubs.royalfamilyacademy.org/`.

## Deployment

Create a Cloudflare Pages project from `FIBRE007/Rfa-website` using:

- Production branch: `main` (after this branch is merged)
- Build command: none
- Build output/root directory: `clubs/`
- Custom domain: `clubs.royalfamilyacademy.org`

The page is plain HTML/CSS/JavaScript and uses the existing RFA logo from `media.royalfamilyacademy.org`.

## Current club rules encoded

- Nursery: Kindergarten only; only Nursery club list is shown.
- Lower Primary: Grades 1–3; general clubs + Lower Primary-only clubs.
- Upper Primary: Grades 4–5; general clubs + Upper Primary-only clubs.
- Grade 6 and High School: general club list only unless the portal API returns stricter eligibility.
- One club can be selected per registration flow.
- Capacity values supplied by RFA are encoded as maximum membership values.

The server/portal must remain authoritative. Do not rely on frontend filtering for eligibility, duplicate-registration prevention, or final capacity enforcement.

## Portal integration

`app.js` currently uses `API_BASE = ''`, which intentionally leaves the site in preview mode and prevents it from pretending a registration was saved.

When the existing portal club API is exposed for this standalone page, set `API_BASE` to its origin and provide these endpoints (or edit the small adapter in `app.js` to match the existing endpoint names):

### Availability / learner verification

`GET {API_BASE}/public/clubs/availability?admissionNumber=...&classCode=...`

Suggested response:

```json
{
  "student": {
    "name": "Learner Name",
    "classCode": "G4"
  },
  "registration": null,
  "clubs": [
    {
      "id": "maths",
      "registeredCount": 27,
      "isOpen": true
    }
  ]
}
```

If `registration` is not null, the server should reject a second active club registration unless an authorised change workflow is used.

### Registration

`POST {API_BASE}/public/clubs/register`

Request body:

```json
{
  "admissionNumber": "RFA/2026/001",
  "classCode": "G4",
  "clubId": "maths"
}
```

Suggested success response:

```json
{
  "ok": true,
  "confirmationCode": "RFA-CLUB-XXXX"
}
```

The server must atomically re-check learner eligibility, existing registration, club status, and remaining capacity before inserting the registration. This prevents two learners from taking the final slot at the same time.

## Security / privacy notes

- Do not expose an administrator token or portal secret in browser JavaScript.
- Prefer a narrowly-scoped public registration API or a Cloudflare Pages Function proxy.
- Rate-limit admission-number lookups and registration attempts.
- Return only the minimum learner information needed for confirmation.
- Keep an audit trail of registrations and authorised changes in the portal.
