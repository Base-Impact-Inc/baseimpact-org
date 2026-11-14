# Contributing to Base Impact

Thank you for your interest in contributing to Base Impact! We're building open-source digital infrastructure that helps hyperlocal communities solve their own crisis resource gaps — starting with a verified, offline-capable directory and nonprofit technology capacity program in Brevard/Volusia/Orange counties, Florida.

## Ways to Contribute

### 🐛 Report Bugs
- Use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md)
- Include steps to reproduce, expected vs actual behavior, screenshots
- Tag with `bug` label

### ✨ Suggest Features
- Use the [feature request template](.github/ISSUE_TEMPLATE/feature_request.md)
- Explain the problem it solves and who benefits
- Tag with `enhancement` label

### 📍 Update Resource Data
- Use the [resource update template](.github/ISSUE_TEMPLATE/resource_update.md)
- Add new resources or fix incorrect info for Brevard/Volusia/Orange counties
- Tag with `data-update` label

### 🤝 Partner Onboarding
- Use the [partner onboarding template](.github/ISSUE_TEMPLATE/partner_onboarding.md)
- For new nonprofit partners wanting to join the directory
- Tag with `partner` label

### 🌐 Translations
- Use the [translation request template](.github/ISSUE_TEMPLATE/translation_request.md)
- Priority: Spanish (complete), Haitian Creole, Portuguese
- Tag with `translation` label

### 💻 Code Contributions
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run checks: `npm run astro check && npm run build`
5. Submit a Pull Request using our [PR template](.github/PULL_REQUEST_TEMPLATE.md)

## Development Setup

```bash
# Prerequisites: Node.js 22+, npm
git clone https://github.com/Base-Impact-Inc/baseimpact-org.git
cd baseimpact-org
npm install
npm run dev          # Start dev server at http://localhost:4321
npm run build        # Production build
npm run astro check  # Type checking
```

## Code Standards

- **TypeScript** — Strict mode enabled, no `any` types
- **Astro 7.4** — Components in `.astro`, logic in `.ts`
- **Tailwind v3** — Utility-first, dark-first design system
- **Accessibility** — WCAG AA required (contrast, focus, ARIA)
- **Mobile-first** — Test at 375px, 768px, 1024px breakpoints
- **Conventional Commits** — `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`

## Project Structure

```
src/
├── components/          # Reusable UI components
├── content/             # Astro content collections (posts, photos, events)
├── data/                # Static data (translations, etc.)
├── layouts/             # Page layouts
├── lib/
│   ├── resources/       # Resource directory engine (types, logic, data)
│   └── *.ts             # Utilities
├── pages/               # Routes (including /es/ Spanish locale)
└── styles/              # Global CSS (design system)
```

## Resource Directory Contributions

The directory covers Brevard, Volusia, and Orange counties in Florida. Resources are stored in `src/lib/resources/data/` by county:

- `brevard.ts` — Brevard County resources
- `volusia.ts` — Volusia County resources
- `orange.ts` — Orange County resources
- `statewide.ts` — Florida statewide resources
- `towns.ts` — Town/ZIP code coordinates

Each resource has: name, address, lat/lng, tags, description, hours, phone, website, service URL, source URL, group/category.

To add a resource:
1. Add to appropriate county file
2. Run `npm run build` to verify
3. Submit PR with `data-update` label

## Multilingual Support

- **English** — Default (`/`)
- **Spanish** — `/es/` locale (complete for UI, stories in progress)
- **Haitian Creole** — Planned (`/ht/`)
- **Portuguese** — Planned (`/pt/`)

Translations live in `src/data/spanish-translations.ts` and content collections.

## Testing

```bash
npm run astro check    # TypeScript + Astro validation
npm run build          # Production build (catches errors)
# Accessibility: npx @axe-core/cli http://localhost:4321 --dir dist
```

## Code Review Checklist

- [ ] `npm run astro check` passes
- [ ] `npm run build` passes
- [ ] No contrast regressions (WCAG AA: 4.5:1 normal, 3:1 large)
- [ ] Mobile tested (375px viewport)
- [ ] Spanish locale updated (if user-facing strings changed)
- [ ] No new console errors in dev
- [ ] `prefers-reduced-motion` respected for new animations

## Community Guidelines

- Be respectful and inclusive
- Focus on the mission: neighbors in crisis + small nonprofits
- Prefer practical, shippable solutions over perfect architecture
- Consider bilingual (EN/ES) and future multilingual needs
- All code must be MIT-licensed, production-ready

## Questions?

Open a [discussion](https://github.com/Base-Impact-Inc/baseimpact-org/discussions) or email [YOUR EMAIL]

---

**License:** By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE.md).