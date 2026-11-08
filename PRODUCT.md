# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Existing codebase: Astro (static site generator) → Cloudflare Workers via Wrangler (`wrangler.jsonc`, `account_id: 17e3d982…`, `site: https://baseimpact.org`), with an `es/` Spanish locale and a full design system in `src/styles/global.css`. The owner leaves the optimal publish host to me: recommended to keep the configured Astro → Wrangler/Cloudflare Workers route (already built, tested, and the site is live at `https://baseimpact.org`), switching hosts only if a hard constraint appears. Mobile-first, static-generated pages, lean client JS. No public CMS exists; content editing is currently code/CI-driven.

## Users

Two audiences of **equal** priority:

1. **Neighbor seeking help** — a person in Brevard (or a wider FL region) who needs food, shelter, showers, or basics, often in crisis and at any hour. They scan for the nearest resource, opening hours, contact method, and a direct line to help (24/7, `211`, `(321) 323-0999`).
2. **Small nonprofit** (1–5 person) — a church, pantry, or community group that needs free device/internet setup, digital-skills training, and security support so they can keep serving.

Each is primary; neither is secondary. One site serves both.

## Product Purpose

Connect people with food, shelter, showers, and essentials (a local, verified resource directory), and keep small nonprofits' technology working so they can serve. Success = a neighbor finds a working resource, quickly and at any hour, and a small nonprofit gets reliable, cared-for technology.

## Positioning

Not a generic directory, and not a tech-only nonprofit — **both, fully automated and locally grounded, and expandable without losing the human touch.** The mechanism a neighboring org could not truthfully copy: a 24/7, localized resource directory combined with one-on-one digital-skills help ("someone to show them how"), with a proven base in Brevard FL and a proven path to scale to state, national, and world scope through partnering and networking — without claiming that expansion before it is real.

## Operating Context

- **Neighbor workflow:** land → find/closest resources → hours → call/text/map → (24/7). The directory is the core interactive surface; every other page supports it.
- **Nonprofit workflow:** browse the four focus areas → contact for a setup session → donate for devices/training/support.
- **Donation:** Zeffy peer-to-peer; 501(c)(3) tax-exempt status pending, so donations are **not currently tax-deductible** — a real constraint and a donor-psychology friction point to handle carefully.
- **Expansion (not to be stated on the site until resources are substantial):** state → national → world, via partnering and networking. A product-level rule, not a marketing promise.
- **Multilingual:** Spanish (`es/`) already present; future expansion likely needs more languages.

## Capabilities and Constraints

- **Confirmed:** local resource directory (115+ resources across Brevard/Volusia/Orange & Statewide FL, filterable by service type and state), 24/7 access, four focus pillars (technology access, digital skills & job help, tech for small nonprofits, local resource guide), partner orgs, donation flow, Spanish locale, contact `+1 (321) 323-0999` / `211`.
- **Constraints:** 501(c)(3) pending; donations not deductible; local-first now; directory content is maintained by partner orgs and must stay accurate (each has a "report an issue" loop); state/national/world expansion is not yet funded or staffed; the site is a static Astro build with no CMS (content editing is code/CI-driven today).
- **Explicitly undecided:** how partner organizations will be onboarded at scale; whether the directory becomes a public API or feed; the exact multilingual rollout; whether "agile" means frequent page edits or a headless CMS. Record these as open rather than inventing answers.

## Brand Commitments

- **Name:** Base Impact.
- **Voice:** practical, direct, warm — "Help."; belief "We believe everyone deserves a working device, a working connection, and someone to show them how."
- **Assets:** photos of volunteers, neighbors, food/shelter; the four focus-area pillars; the stat strip (115 resources · 6 service types · Any languages · 24/7); two emergency contact cards (211, (321) 323-0999).
- **Identity:** dark pine green + warm gold, Bricolage Grotesque display / system sans body; dark-first; dense but scannable.
- **Never dilute:** the belief statement or the emergency-contact prominence.

## Evidence on Hand

- Live site at `https://baseimpact.org` (homepage, `/directory`, `/donate`, `/about`, `/programs`, `/technology-access`, `/guide`, `/contact`, `/es/*`).
- Directory: 115+ resources across Brevard, Volusia, Orange & Statewide FL, filterable by service type and state, with hours, address, tags, phone, map, and a per-item "report an issue."
- Four focus pillars, stat strip, belief statement, emergency cards, donate page (Zeffy), partner-page, and supporting content pages.
- Existing code: Astro pages, `src/lib/resources/` (Brevard/Volusia/Orange/Statewide data), `src/components/ResourceCard`, `src/styles/global.css` (full design system). No public CMS.

## Product Principles

1. **Both audiences equally** — never favor one program at the expense of the other; the directory and the nonprofit tech program share the same site with equal visual and functional weight.
2. **Agile and fully automated** — infrastructure and content workflow must let the team pivot to what is growing next without a re-platform; no hard-coded assumptions about which regions or partner types.
3. **Local grounded, then expand** — start with a substantial, verified local core; do not advertise state/national/world reach until the resources and help actually support it.
4. **Always findable, always reachable** — 24/7, fast, mobile-first, and with the emergency contact (`211` / `(321) 323-0999`) never more than a tap away.
5. **Honest proof** — the "115 resources · 6 service types · 24/7" strip is the product's real social proof; keep it accurate and current rather than marketing beyond what it can back.

## Accessibility & Inclusion

- Audience includes people in crisis and people with low digital literacy — the site must be immediately scannable, high-contrast content, plain language, and one obvious next action.
- Personas include users who are deaf, have limited vision, limited mobility (large tap targets), non-English speakers (`es/` already present), and low-bandwidth mobile users.
- The directory must be fully operable without a mouse, with visible focus, screen-reader-friendly card markup, and text alternatives for every image.
- "Someone to show them how" means the site must also be legible to a volunteer learning it for the first time — consistent patterns, no jargon, prominent help links.
