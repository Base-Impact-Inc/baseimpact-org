# Base Impact: Free Astro Template Research & Comparison

## Requirements Filter
- ✅ Free for NPO/commercial use (MIT or equivalent)
- ✅ WCAG 2.1/2.2 AA / ADA compliant or strong accessibility baseline
- ✅ Elderly-friendly: readable type scale, high contrast, clear navigation, fallbacks
- ✅ Modern, sleek, innovative design
- ✅ Astro 7+ / Tailwind 4+ (latest stable)
- ✅ Cloudflare-friendly static output
- ✅ Scalable to worldwide reach (i18n, multi-page, content collections)
- ✅ Supports long-term goals: events, classes, resources, partner orgs, blog, docs

## Top Candidates (Ranked)

### 1. AstroWind ⭐ Top Pick
- **Repo:** https://github.com/arthelokyo/astrowind
- **Stars:** 6k+
- **License:** MIT
- **Stack:** Astro 7 + Tailwind CSS 4 + TypeScript
- **Why it wins:** Most-starred Astro theme, 30+ section widgets (hero, bento, pricing, FAQ, testimonials, team, timeline), blog with MDX/categories/tags/RSS, dark mode, RTL, shadcn/ui-compatible tokens. Production-ready, actively maintained, massive community.
- **Accessibility:** Good baseline with semantic HTML; accessibility features present but not the primary focus like Accessible Astro Starter.
- **NPO fit:** Excellent for modern marketing site, events, programs, blog. Easy to add donation/partner sections.
- **Elderly-friendly:** High contrast options, readable typography, clear navigation patterns.
- **Global ready:** RTL built-in, i18n-ready, content collections.
- **Cloudflare:** Deploys easily to Cloudflare Pages.

### 2. Accessible Astro Starter ⭐ Accessibility-First
- **Repo:** https://github.com/incluud/accessible-astro-starter
- **Stars:** 1.2k
- **License:** MIT
- **Stack:** Astro 6+ + Tailwind 4 + TypeScript
- **Why it wins:** Built specifically for WCAG 2.2 AA + EAA compliance. Includes focus-outline improvements, landmarks, semantics, skip-link navigation, ARIA labels, keyboard navigation, color contrast tools. Ships with ESLint + Prettier.
- **Accessibility:** Best-in-class. Explicitly designed for inclusive websites.
- **NPO fit:** Perfect for serving diverse populations including elderly and disabled users. Mission-aligned with Base Impact's inclusive values.
- **Elderly-friendly:** Superior — built with accessibility as the primary requirement, not an afterthought.
- **Global ready:** Supports i18n, semantic markup aids screen readers.
- **Cloudflare:** Static export works perfectly.
- **Tradeoff:** Fewer pre-built marketing sections than AstroWind; more starter than finished site.

### 3. USWDS / Astro Gov Starter ⭐ Service-Oriented
- **Repo:** https://github.com/ctrimm/astro-gov-starter
- **Stars:** 10
- **License:** MIT
- **Stack:** Astro 7 + USWDS 3.x + TypeScript
- **Why it wins:** Designed for government/service sites. USWDS baked in, Section 508 + WCAG 2.1 AA compliant, plain-language linting (Flesch-Kincaid), i18n scaffolding (en/es), analytics-free, zero client JS by default. Lighthouse CI configured.
- **Accessibility:** Outstanding — USWDS is the U.S. Web Design System with accessibility baked into every component.
- **NPO fit:** Excellent for service-oriented non-profits. The "government service" aesthetic maps well to NPOs serving communities.
- **Elderly-friendly:** USWDS components are designed for maximum readability and usability.
- **Global ready:** i18n scaffolding, plain-language scoring for multiple languages.
- **Cloudflare:** Deploys anywhere, zero client JS by default.
- **Tradeoff:** Smaller community, fewer pre-built pages. Design is more utilitarian than "sleek/modern."

### 4. ScrewFast ⭐ All-in-One
- **Repo:** https://github.com/mearashadowfax/ScrewFast
- **Stars:** 1.4k
- **License:** MIT
- **Stack:** Astro 7 + Tailwind CSS 4 + Preline UI
- **Why it wins:** Combines landing page + blog + product catalog + Starlight documentation in one site. Shared layout/nav/footer. Marketing + docs rarely come in one free template.
- **Accessibility:** Good — Preline UI has accessibility considerations, Starlight docs are accessible.
- **NPO fit:** Perfect if Base Impact wants both a marketing site AND comprehensive docs/resources section.
- **Elderly-friendly:** Good typography and navigation.
- **Global ready:** i18n support, translated into 7 languages for docs.
- **Cloudflare:** Deploys easily.
- **Tradeoff:** More complex setup; heavier bundle.

### 5. Astroplate ⭐ Multilingual
- **Repo:** https://github.com/zeon-studio/astroplate
- **Stars:** 1.2k
- **License:** MIT
- **Stack:** Astro + TailwindCSS + TypeScript
- **Why it wins:** 15+ pages, built-in search, Git-based CMS, multilingual support.
- **Accessibility:** Good baseline.
- **NPO fit:** Strong for global reach with built-in i18n and search.
- **Elderly-friendly:** Standard modern patterns.
- **Global ready:** Excellent — multilingual-first design.
- **Cloudflare:** Works well.

### 6. Elementary ⭐ Educational NPO
- **Repo:** https://github.com/nicole-levin/elementary
- **Stars:** N/A (newer)
- **License:** MIT
- **Stack:** Astro + Tailwind CSS
- **Why it wins:** Designed specifically for elementary schools, daycare, preschools, educational organizations. Clean, friendly, modern.
- **Accessibility:** Good.
- **NPO fit:** Perfect for Base Impact's educational mission (events, classes, teaching AI/tech).
- **Elderly-friendly:** Clean, simple navigation.
- **Global ready:** Basic i18n possible.
- **Cloudflare:** Works well.
- **Tradeoff:** Niche educational design; may need rebranding.

## Also Considered (Excluded or Lower Priority)

| Template | Reason |
|----------|--------|
| Kindora Astro | **PAID** — excluded despite perfect NPO fit |
| AstroPaper | Blog-only; too limited for full NPO site |
| Starlight | Docs-only; use as sub-site if needed |
| Astro Cactus | Blog-only, minimal |
| PowerAI Astro | Dark AI SaaS theme — mismatched brand |
| Flowbite Admin | Dashboard reference, not a marketing site |
| Church Starter | Could work but limited pages |

## Recommendations

**Primary recommendation:** Start with **AstroWind** for the main marketing/presence site. It has the best combination of modern design, page coverage, blog, and community support. Layer in **Accessible Astro Starter** patterns/components for WCAG compliance, or use its accessible component library.

**Alternative path:** Use **USWDS / Astro Gov Starter** if accessibility and service-oriented design are the absolute top priorities. It's the most "responsible" choice but requires more design work to make it feel innovative.

**Hybrid approach:** Use **ScrewFast** if you want marketing + docs + catalog in one site without stitching separate themes together.

## Next Steps
1. Build proof-of-concept with top 2 templates (AstroWind + Accessible Astro Starter patterns)
2. Test on mobile + with screen reader
3. Evaluate customization effort vs. out-of-box design
4. Check license compliance for NPO commercial use (all above are MIT)
5. Deploy test builds to Cloudflare Pages

## Long-Term Strategic Notes
- Removing "Brevard County" from tagline to enable worldwide reach
- Future: partner organization directory, resource sharing platform, event/class registration, volunteer matching
- Need flexible content model: blog, events, resources, partners, about, impact metrics
- Consider headless CMS integration early if content will be managed by non-developers
- Data strategy: may need separate databases or better data layer as we scale to multiple regions
