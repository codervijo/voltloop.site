# Prompts

Reusable prompts for spinning up sister projects to the same working state as this one.

## pSEO calculator site — generic scaffold prompt

Drop this into a fresh Claude Code session in any project directory. Replace `{TOPIC}` and `{DOMAIN}` (e.g. `TOPIC = "solar panel cost"`, `DOMAIN = "solarcalc.site"`).

```
You are a senior full-stack engineer. Build a programmatic-SEO calculator site
about {TOPIC} (e.g. "solar panel cost", "heat pump cost", "mortgage payoff").
Domain: {DOMAIN}. Static-first, deployable to Cloudflare Pages.

## Stack — locked in (these are the only versions known to work end-to-end)

- Vite ^6.3.5  (Cloudflare Pages Wrangler refuses Vite < 6 — non-negotiable)
- React 18 + TypeScript
- @vitejs/plugin-react-swc ^3.11
- Tailwind 3 + shadcn/ui (Radix primitives) + lucide-react
- React Router 6
- TanStack Query 5 (already idiomatic in the shadcn ecosystem)
- pnpm (delete any bun.lock / bun.lockb / package-lock.json)
- Vitest 3 for unit tests

Do NOT use: Astro+MUI (SSR createTheme crashes on CJS/ESM interop),
lovable-tagger (pins Vite 5, dev-only Lovable artifact, drop it),
Tailwind 4 (shadcn templates target Tailwind 3).

## Project shape

/
  package.json            "packageManager": "pnpm@9.12.0"
  vite.config.ts          react-swc + path alias "@" → ./src
  tailwind.config.ts      shadcn defaults
  tsconfig.json + app/node split
  index.html
  /public                 robots.txt, favicon
  /src
    main.tsx              BrowserRouter + QueryClientProvider
    App.tsx               <Routes>
    index.css             tailwind base/components/utilities
    /components
      Calculator.tsx      single source-of-truth calculator (props for prefill)
      Layout.tsx, Seo.tsx (react-helmet-style head), NavLink.tsx, InternalLinks.tsx
      /ui                 shadcn primitives (Button, Card, Input, Slider, Select, etc.)
    /lib
      {topic}.ts          pure calculation function + types
      data.ts             pSEO entries: { slug, title, h1, description, directAnswer, ...prefill }
      utils.ts            cn() helper
    /pages
      Index.tsx           landing + calculator + popular slugs
      CalculatorPage.tsx  /{topic}-calculator dedicated route
      SeoPageRoute.tsx    reads slug → looks up data.ts → renders Calculator with prefilled props
      NotFound.tsx
    /test                 setup.ts + at least one test for the calc fn

Routes: "/", "/{topic}-calculator", and one dynamic "/:slug" backed by data.ts.

Each page must render: <title>, meta description, canonical, OG tags, H1, a short
direct-answer paragraph, the calculator, and ≥3 internal links to siblings.

## Cloudflare Pages hygiene — avoid the traps that bit voltloop

1. If a Lovable/scaffold dir was dropped under this repo and has its OWN .git
   inside it: gitignore the dir AND run `git rm --cached <dir>` to drop the
   gitlink (mode 160000) from the index. With no .gitmodules, Cloudflare's
   --recurse-submodules clone will hard-fail at "updating repository submodules".
   Verify after: `git ls-tree -r HEAD | awk '$2 == "commit"'` must be empty.

2. Do not commit with `git add .` blindly while a `git rm --cached` is staged —
   re-adds resurrect the gitlink. Always `git status` before commit.

3. If a docker dev server is locking files as root (e.g. `make check-vite proj=...`),
   stop it before scaffolding — otherwise rsync/cp into src/ silently no-ops.

4. .gitignore must include: node_modules, dist, .vite, bun.lock, bun.lockb,
   any reference-only scaffold dirs (e.g. `genai/`).

## Calculator math

Put a pure `calculate{Topic}({...inputs})` function in src/lib/{topic}.ts that
returns a result object. Cover it with one Vitest test. The Calculator component
is a thin UI shell over this function — never inline math in components.

## SEO data file (data.ts)

Export `pages: SeoPage[]` with at least 8 entries that each have a unique slug
and prefill values for the calculator. SeoPageRoute looks up by slug. Future
pages = append to the array, no code changes.

## Acceptance — must pass before declaring done

- `pnpm install` clean (no peer warnings beyond known-harmless)
- `pnpm build` produces dist/ with zero errors
- `pnpm dev` opens, calculator renders, sliders/inputs work, output updates live
- `pnpm test` green
- `git ls-tree -r HEAD | awk '$2 == "commit"'` is empty (no stray gitlinks)
- Commit + show diff; do NOT push without explicit approval

## Output style

Generate a complete, runnable scaffold — no placeholders, no TODOs, no partial
files. Brief commentary only. Match the file tree above exactly.
```
