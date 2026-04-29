# Voltloop — Plan & Feature Roadmap

Last updated: 2026-04-25
Reference: patterns lifted from sister project [`calcengine.site`](../../calcengine.site/AI_AGENT.md).

## 1. Vision
Voltloop is a programmatic-SEO calculator site for EV charging cost queries. Win long-tail searches like "tesla model 3 charging cost", "supercharger cost per kwh", "home ev charging cost california" with one fast tool + a hundred+ data-driven landing pages. Static-first, deployed to Cloudflare Pages. No SaaS, no auth — traffic and affiliate/ad revenue is the play.

## 2. Where we are today (M0 — Foundation)

| Thing | State |
|---|---|
| Stack: Vite 6 + React 18 + TS + Tailwind 3 + shadcn + pnpm | ✅ Done |
| `src/lib/charging.ts` — pure cost math | ✅ Done |
| `src/lib/data.ts` — SEO entry list | ✅ Done (seed entries only) |
| `Calculator.tsx` UI shell over the math | ✅ Done |
| React Router routes (`/`, `/{topic}-calculator`, `/:slug`) | ✅ Done |
| Cloudflare Pages deploy + green build | ✅ Done |
| Favicon + theme-color | ✅ Done |
| Vitest setup + 1 sample test | ✅ Done |
| `docs/Prompts.md` reusable scaffold prompt | ✅ Done |
| `AI_AGENT.md` with Makefile/Docker workflow | ✅ Done |

## 3. The one architectural decision that unlocks everything else

**Voltloop is currently an SPA.** React Router renders client-side. That means every URL serves the same `index.html` shell, and Googlebot has to execute JS to see slug-specific content. For pSEO at scale that's table stakes — we need static HTML per slug.

calcengine solved this with Astro (static-first, React islands for interactivity). We can't just switch frameworks again — we burned a day proving Astro+MUI doesn't work, and the genai shadcn scaffold is shadcn-on-Vite.

**Three viable paths, ordered by recommended:**

| Option | What it is | Pro | Con |
|---|---|---|---|
| **A. `vite-react-ssg`** | Vite plugin that pre-renders every route to static HTML at build time, hydrates as SPA at runtime | Zero stack switch; reuses current React Router routes; ~1 day to wire | Less mature than Astro; some plugin gotchas |
| B. Migrate to Astro + shadcn + React islands | Same shape as calcengine, proven SEO infra | Best long-term ergonomics; reuse calcengine code wholesale | 3–5 day port; risk of shadcn-on-Astro friction |
| C. Stay pure SPA + pre-render only home/category pages | Cheapest | Detail pages won't rank; defeats pSEO goal | Skip |

Recommendation: **Option A.** Keep current stack, add SSG. Re-evaluate Astro at M5 if SSG pain > expected.

Everything below assumes Option A is taken. If we pick B, M2–M4 collapse into Astro-native equivalents.

## 4. Milestones & feature tables

Effort: **S** = ½ day, **M** = 1–2 days, **L** = 3–5 days.
Status: **Done / Next / Planned / Backlog**.

### M1 — Static HTML per route (the unlock)

| # | Feature | Why | Effort | Status |
|---|---|---|---|---|
| 1.1 | Wire `vite-react-ssg` (or equivalent); prerender `/`, `/ev-charging-cost-calculator`, `/:slug` | Without this, no SEO entry in `data.ts` gets indexed properly | M | Next |
| 1.2 | Build script: enumerate `data.ts` entries → static routes | One source of truth; new entries = new static pages | S | Next |
| 1.3 | Per-route `<head>` (title, meta description, canonical, OG, twitter:card) — currently only one global head | Each page must be uniquely indexable | S | Next |
| 1.4 | CI step: fail build if any route's static HTML lacks `<title>` or canonical | Cheap regression guardrail | S | Planned |

### M2 — Schema.org JSON-LD

Lift the builder pattern from `calcengine/src/seo/jsonLd.ts`. Compose per page.

| # | Feature | Why | Effort | Status |
|---|---|---|---|---|
| 2.1 | `src/seo/jsonLd.ts` with `buildFaq`, `buildWebApp`, `buildBreadcrumb`, `buildOrganization` | Earns rich results, sitelinks searchbox | S | Planned |
| 2.2 | Inject FAQ JSON-LD on every detail page (5 Q&A from `data.ts`) | FAQ rich snippets in SERP | S | Planned |
| 2.3 | Inject WebApplication JSON-LD on calculator pages | Marks the page as a tool, not just an article | S | Planned |
| 2.4 | Inject Breadcrumb JSON-LD on `/:slug` pages | Breadcrumb display in SERP | S | Planned |
| 2.5 | One Organization JSON-LD on `/` | Knowledge panel signal | S | Planned |

### M3 — OG image generation

Pre-built PNG per slug at deploy time. Pattern from `calcengine/src/og/renderOg.ts`.

| # | Feature | Why | Effort | Status |
|---|---|---|---|---|
| 3.1 | `satori` + `@resvg/resvg-js` pipeline at `scripts/og/build.mjs` (single default for now; per-slug loop in 3.3) | Branded social preview | M | ✅ Done 2026-04-28 |
| 3.2 | Bundled Inter Bold TTF at `src/assets/fonts/inter-bold.ttf` (borrowed from calcengine) | Consistent text rendering — resvg can't read system fonts in our docker | S | ✅ Done 2026-04-28 |
| 3.3 | Per-slug variant: loop over `data.ts`, emit `dist/og/{slug}.png`, per-page `og:image` meta | X/LinkedIn previews vary by page | S | Planned (after M1) |
| 3.4 | Replace Lovable-default `og:image` / `twitter:image` in `index.html` with `/og-image.png` | Currently both pointed at lovable.dev — bad brand signal | S | ✅ Done 2026-04-28 |

### M4 — Sitemap, robots, canonical hygiene

| # | Feature | Why | Effort | Status |
|---|---|---|---|---|
| 4.1 | Generate `dist/sitemap.xml` at build from route list | Crawl coverage | S | Planned |
| 4.2 | `dist/robots.txt` with sitemap link | Standard | S | Done (basic) |
| 4.3 | Per-page canonical points to `https://voltloop.site/...` (was `voltloop.app` in seed) | Avoid SEO split | S | ✅ Done 2026-04-28 |
| 4.4 | Per-page canonical from route, not hardcoded | Correct dedupe across params | S | Planned |

### M5 — Analytics

| # | Feature | Why | Effort | Status |
|---|---|---|---|---|
| 5.1 | GA4 wiring via `PUBLIC_GA_ID` env var (Cloudflare Pages env) | Baseline traffic | S | Planned |
| 5.2 | `src/analytics/ga.ts` thin helpers: `trackCalculatorViewed`, `trackCalculatorUsed` (mirrors calcengine) | Funnel visibility | S | Planned |
| 5.3 | Optional: Plausible or Cloudflare Web Analytics as cookie-free alternative | Privacy + simplicity | S | Backlog |

### M6 — Externalized pricing data

Hardcoded rates in `data.ts` rot. Pull them out.

| # | Feature | Why | Effort | Status |
|---|---|---|---|---|
| 6.1 | `src/data/pricing/utilities.json` — { utility, state, plan, ratePerKwh, lastVerified } | Decouples rate updates from code deploys | S | Planned |
| 6.2 | `src/data/pricing/superchargers.json` — Tesla DCFC pricing by region | Same | S | Planned |
| 6.3 | `src/data/pricing/vehicles.json` — battery sizes, real-world efficiency | Drive prefills from one place | S | Planned |
| 6.4 | "Last verified" badge surfaced on pages | Trust + freshness signal to Google | S | Planned |
| 6.5 | Phase 2: scraper (Cloudflare Worker + KV) to refresh pricing weekly | Hands-off freshness | L | Backlog |

### M7 — Page template upgrade ("golden page")

Match calcengine's content depth. Currently our detail pages are short — Google will see them as thin.

| # | Feature | Why | Effort | Status |
|---|---|---|---|---|
| 7.1 | Page template: title, tagline, intro (2–4 paras), calculator, formula block, worked example, pricing table, tips, FAQ (5), related links (3) | Thin pages don't rank | M | Planned |
| 7.2 | `data.ts` schema upgrade to carry all the template fields | Single source of truth | S | Planned |
| 7.3 | Backfill 10 seed pages to the new template | Validate before scaling | M | Planned |

### M8 — Programmatic page expansion

| # | Feature | Why | Effort | Status |
|---|---|---|---|---|
| 8.1 | Vehicle pages: top 30 EV models (Tesla, Rivian, Ford, Hyundai, Kia, etc.) | Long-tail vehicle searches | M | Planned |
| 8.2 | State pages: "home ev charging cost {state}" × 50 states | Location intent | M | Planned |
| 8.3 | Charger-network pages: Supercharger, Electrify America, EVgo, ChargePoint, Wallbox | Brand-intent searches | S | Planned |
| 8.4 | Comparison pages: "{vehicle A} vs {vehicle B} charging cost" — top 20 pairs | Comparison-intent (high CTR) | M | Planned |
| 8.5 | Category index `/calculators` with searchable list (React island) | Internal linking + UX | S | Planned |

### M9 — Dark mode + polish

| # | Feature | Why | Effort | Status |
|---|---|---|---|---|
| 9.1 | CSS-var + `.dark` class toggle, persisted via `localStorage` | Standard expectation | S | Planned |
| 9.2 | shadcn theme variables already support dark — just expose toggle | Cheap | S | Planned |
| 9.3 | Visual polish: hero illustration, brand color accent on results | Conversion of organic visitors | M | Backlog |

### M10 — Growth & monetization

| # | Feature | Why | Effort | Status |
|---|---|---|---|---|
| 10.1 | Email capture: "Get monthly EV charging rate updates" — ConvertKit/Buttondown | Audience asset; unblocks future products | S | Planned |
| 10.2 | Affiliate links: charger hardware (Wallbox, Tesla Wall Connector, JuiceBox) on relevant pages | Revenue with zero ops | S | Planned |
| 10.3 | Affiliate: Tesla referral code on Supercharger pages | Zero-effort revenue | S | Planned |
| 10.4 | Display ads (Ezoic / Mediavine) — only after ≥10k monthly sessions | Don't poison UX too early | S | Backlog |
| 10.5 | "Sponsor this page" Stripe link on high-traffic pages | Direct sponsorship | S | Backlog |

### M11 — Testing & guardrails

| # | Feature | Why | Effort | Status |
|---|---|---|---|---|
| 11.1 | Unit tests for `charging.ts` covering edge cases (0% target, >100% target, negative rate) | Math is the product | S | Planned |
| 11.2 | SEO audit suite: every built HTML must have unique `<title>`, canonical, JSON-LD, OG tags | Catch regressions at build | M | Planned |
| 11.3 | Route smoke test: every entry in `data.ts` returns 200 | Catches missing slugs | S | Planned |
| 11.4 | Playwright golden-path test: home → calculator → input → result | Regression net | M | Backlog |

### M12 — Comparisons & adjacent tools

Once core pSEO is humming, expand product surface.

| # | Feature | Why | Effort | Status |
|---|---|---|---|---|
| 12.1 | Range estimator (battery + temp + speed → real-world range) | Adjacent search intent | M | Backlog |
| 12.2 | Charger time-to-full estimator (separate from cost) | Different query class | S | Backlog |
| 12.3 | Cost-per-mile vs gas comparison widget | High emotional pull, shareable | S | Backlog |
| 12.4 | Solar + EV combined ROI calculator (pulls voltloop into solar-adjacent traffic) | Cross-vertical | L | Backlog |

## 5. Suggested execution order

Not strictly milestone-by-milestone — pick high-leverage items first:

1. ~~**Now (this sprint):** 3.4 — replace the Lovable-default OG image / twitter:image.~~ Done 2026-04-28 (M3.1, 3.2, 3.4 all landed via `scripts/og/build.mjs`). M3.3 (per-slug variants) deferred until M1 lands per-route static HTML.
2. **Sprint 1:** M1 in full. Without static HTML per route nothing in `data.ts` matters.
3. **Sprint 2:** M2 (JSON-LD) + M4 (sitemap) + M5.1–5.2 (GA4). Search-engine table stakes.
4. **Sprint 3:** M7 (golden page template) + backfill 10 seed pages. Validate the template ranks.
5. **Sprint 4:** M3 (OG images) + M6.1–6.4 (externalized pricing). Polish + freshness signal.
6. **Sprint 5:** M8 (volume) + M10.1–10.3 (revenue mechanics). Scale + monetize.
7. **Ongoing:** M11 (tests) layered into each sprint, not held to the end.

## 6. Open questions

- ~~**Domain:** is the production domain `voltloop.site` or `voltloop.app`?~~ Resolved 2026-04-28: **`voltloop.site`**. All canonicals + JSON-LD URLs swept.
- **GA vs Plausible:** privacy-first or growth-default? Affects M5.
- **Email tool:** ConvertKit, Buttondown, or roll our own with Cloudflare Workers? Affects M10.1.
- **Astro re-eval gate:** at end of Sprint 2, are we fighting `vite-react-ssg`? If yes, port to Astro before M7 (cheaper than later).
