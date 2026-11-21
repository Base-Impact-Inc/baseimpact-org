# Base Impact — Page → Email Mapping

**Owner:** web-designer (Douglas PC / agency.douglaspc.com)
**Parent task:** t_ecca6d3f (contact-form reliability + forwarding plan)
**Date:** 2026-11-21

All department addresses below were confirmed WORKING by parent task t_ecca6d3f
(Cloudflare Email Routing forwards all @baseimpact.org aliases to baseimpactorg@gmail.com,
zero DNS changes). No DNS, provisioning, or paid services were touched per stop condition.

## Principle
- **Form first** on every contact surface — the contact form is the primary call to action.
- **Email is secondary** — shown as "Prefer email? Reach us at …".
- **admin@baseimpact.org is NEVER public** — zero occurrences in built output (verified via
  `grep -rciE 'admin@baseimpact.org' dist` → 0) and zero occurrences on live pages.

## Page → Email mapping

| Page (route) | Department email | Form primary? | Notes |
|---|---|---|---|
| `/` (homepage) | *(none shown)* | — | Landing page; "Contact us" CTA → /contact |
| `/contact/` | `contact@baseimpact.org` | Yes (contact form) | Email card now shows contact@ |
| `/connect/` | `connect@baseimpact.org` | Yes (links to /contact) | Connect page: form + connect@ |
| `/donate/` | `donate@baseimpact.org` | Yes ("Contact us to donate" + form) | Added secondary donate@ |
| `/wishlist/` | `donate@baseimpact.org` | Yes ("Donate a used bike" → /contact) | Footer + prefer-email both donate@ |
| `/partners/` | `partners@baseimpact.org` | Yes (links to /contact) | Added secondary partners@ |
| `/share-your-story/` | `connect@baseimpact.org` | Yes (story form) | Added secondary connect@ (story/intake) |
| `/about/` | `contact@baseimpact.org` | Yes (links to /contact) | info@ routed to contact@ (2 places) |
| `/grants/` | `contact@baseimpact.org` | Yes ("Contact us") | admin@ → contact@; for funders |
| `/terms/` | `contact@baseimpact.org` | Yes (contact form) | admin@ → contact@; legal page |
| JSON-LD (all pages) | `contact@baseimpact.org` | n/a | `Base.astro` `<script type="application/ld+json">` |
| `/base-impact-one-pager.pdf` | `contact@baseimpact.org` | n/a | Public one-pager PDF (regenerated, contact@) |

## Changes summary

| File | Change |
|---|---|
| `src/layouts/Base.astro` | JSON-LD `email`: admin@ → contact@ |
| `src/pages/contact.astro` | Email admin@ → contact@ |
| `src/pages/connect.astro` | Email admin@ → connect@ |
| `src/pages/donate.astro` | Added prefer-email donate@ (secondary) |
| `src/pages/wishlist.astro` | Email admin@ → donate@ + prefer-email donate@ |
| `src/pages/partners.astro` | Added prefer-email partners@ (secondary) |
| `src/pages/share-your-story.astro` | Added prefer-email connect@ (secondary) |
| `src/pages/about.astro` | info@ → contact@ (2 places) + admin@ → contact@ |
| `src/pages/grants.astro` | Email admin@ → contact@ + prefer-email line |
| `src/pages/terms.astro` | Email admin@ → contact@ + prefer-email line |
| `public/base-impact-one-pager.pdf` | Email admin@ → contact@ (Flate-compressed stream patched) |

## Notes / judgment calls
- **About** is a general-org page; routed `info@` → `contact@` (best-fit, form primary).
- **Grants** is a funder/partner page; routed `admin@` → `contact@` (best-fit, form primary).
- **Wishlist** is the donor-facing item wish-list; `admin@` → `donate@` (best-fit).
- **Stories intake** = `/share-your-story`; routed to `connect@`.
- Server-side notification fallback in `src/pages/api/contact.ts` still holds a hard-coded
  `admin@baseimpact.org` as the default `CONTACT_NOTIFY_TO` fallback (only used when the env
  var is unset; production sets `CONTACT_NOTIFY_TO=baseimpactorg@gmail.com` per parent task).
  It is server-side code, not public, and does not appear in the built output.
