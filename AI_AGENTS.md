# AI Agent Context — voltloop.site

## What this project is
A programmatic-SEO calculator site for EV charging cost queries (e.g. "tesla model 3 charging cost", "tesla supercharger cost per kwh"). Static-first, deployed to Cloudflare Pages. Goal is traffic capture via hundreds of pSEO pages, not SaaS.

## Stack
- Language: TypeScript
- Framework: React 18 + Vite 6
- Routing: react-router-dom v6
- UI: Tailwind CSS 3 + shadcn/ui (Radix primitives) + lucide-react
- Forms: react-hook-form + zod
- Data fetching: TanStack Query v5
- Tests: Vitest 3 + Testing Library + jsdom
- Package manager: pnpm 9 (do not use npm or bun in this project)

## Project structure
- `src/pages/` — top-level route components (`Index`, `CalculatorPage`, `SeoPageRoute`, `NotFound`)
- `src/components/` — shared components; shadcn primitives live under `src/components/ui/`
- `src/lib/charging.ts` — pure calculation function (no UI). All math lives here.
- `src/lib/data.ts` — pSEO entry list ({ slug, title, h1, description, ...prefill }). Add new SEO pages by appending here, no code changes.
- `src/lib/utils.ts` — `cn()` helper
- `src/test/` — Vitest setup + tests
- `public/` — static assets (favicon, robots.txt)
- `genai/` — Lovable-generated reference scaffold; **gitignored**, kept on disk for reference only, never part of the build
- `docs/Prompts.md` — reusable prompt for spinning up sister pSEO sites in the same shape

## Repo layout — important
- `voltloop.site/` is its **own git repo** (`git@github.com:codervijo/voltloop.site.git`), separate from the parent `sites/` monorepo (`codervijo/sites`).
- The parent `sites/` directory contains a workspace of independent project folders (one git repo each), plus shared dev tooling: `Makefile`, `dev_container.sh`, a top-level `package.json`, and a docker image (`sites1`).
- Cloudflare Pages is wired to `codervijo/voltloop.site` `main` branch. Build cmd: `pnpm build`. Output: `dist/`.

## Build tooling — Makefile + Docker

All dev work runs inside the parent `sites1` docker container. The host doesn't need Node/pnpm installed; the container does. The parent `Makefile` (at `../Makefile` from this dir) is the canonical entry point.

### Why docker
- Pinned Node + pnpm versions match Cloudflare's build env (currently node 22 + pnpm 9.12).
- Avoids polluting the host with per-project node_modules.
- Same image (`sites1`) serves every sibling project.

### Common Makefile targets (run from parent `sites/` dir)

| Command | What it does |
|---|---|
| `make buildsh` | Drop into a bash shell inside the docker container at `/usr/src/app` (= `sites/` mounted in). |
| `make run proj=voltloop.site` | `pnpm install` then start dev server (auto-detects astro/vite/other via `check-vite`). |
| `make check-vite proj=voltloop.site` | Just start the dev server, skipping install. |
| `make test proj=voltloop.site` | `pnpm install` + `pnpm build` + `pnpm test`. **Hard-fails outside docker** — must be run via `make buildsh` first or via `docker exec`. |
| `make deps` | Globally install pnpm (used by the docker image bootstrap). |
| `make new name=foo` | Scaffold a new Vite React project in `foo/`. |
| `make reclaim` | Prune docker resources. |
| `make clean` | Remove `package.json`, `package-lock.json`, `node_modules/` from the parent. Don't run inside a project dir. |

### Running Make targets from a Claude Code session
The Bash tool runs on the host as `vijo`, not inside docker. To execute a Make target inside the container, find the container and `docker exec` into it:

```bash
docker ps                              # find the running sites1 container name
docker exec -w /usr/src/app <name> make test proj=voltloop.site
```

Background note for agents: a previous session's Astro/MUI scaffold left a root-owned `astro dev` running inside docker, which kept regenerating files in `src/` and locked them against `vijo`-owned writes from the host. If you see permission-denied on `src/` writes, check `ps aux | grep astro` and stop any stale dev server first.

### Direct pnpm scripts (when already inside docker, bypassing Make)
```bash
pnpm install   # update node_modules and lockfile
pnpm dev       # vite dev server on :8080
pnpm build     # production build → dist/
pnpm preview   # serve dist/ locally
pnpm lint      # ESLint
pnpm test      # Vitest run-once
pnpm test:watch
```

## Cloudflare Pages — known traps from this project's history

1. **Submodule clone failure.** Cloudflare clones with `--recurse-submodules`. If any path is registered in the index as mode 160000 (gitlink) without a matching `.gitmodules` entry — typically because a tool like Lovable left its own `.git` inside a subdirectory — the clone hard-fails: `"error occurred while updating repository submodules"`. Fix: gitignore the offending dir AND `git rm --cached <path>`. Verify with `git ls-tree -r HEAD | awk '$2 == "commit"'` (must be empty).
2. **Vite version floor.** Cloudflare Pages' Wrangler refuses Vite < 6 (`"cannot be automatically configured. Please update the Vite version to at least 6.0.0"`). Stay on `vite ^6.x`. Do not let `lovable-tagger` re-pin Vite 5 — it's been removed from this project for that reason.
3. **Frozen lockfile.** CI runs `pnpm install --frozen-lockfile`. Whenever `package.json` changes, regenerate `pnpm-lock.yaml` locally (`pnpm install` inside docker) and commit it in the same change.
4. **Stale src/ from prior scaffolds.** If you swap stacks, fully clean root-owned leftovers (`node_modules`, `pnpm-lock.yaml`, `.astro`, stray `src/env.d.ts`) before re-installing. Use `sudo` on host or just operate inside docker as root.

## Key conventions
- shadcn/ui components live in `src/components/ui/` and use `class-variance-authority` + `tailwind-merge`.
- Routing is defined in `src/App.tsx` using react-router-dom.
- Path alias `@/` maps to `src/`.
- All calculator math lives in `src/lib/charging.ts` as pure functions; `src/components/Calculator.tsx` is a thin UI shell.
- pSEO pages are data-driven via `src/lib/data.ts` + `src/pages/SeoPageRoute.tsx`. To add a page, append an entry — do not create a new route file.

## Out of scope / don't touch
- `genai/` — kept as a Lovable reference scaffold. It's gitignored. Don't modify or delete it.
- The parent `sites/` `Makefile` and `dev_container.sh` — shared across all sibling projects.

## Status
- **Stack settled:** Vite 6 + React 18 + TypeScript + Tailwind 3 + shadcn/ui + pnpm.
- **Earlier dead end (do not retry):** Astro + MUI was attempted and abandoned — MUI's `createTheme` crashes under Astro's Vite SSR due to CJS/ESM interop. See `docs/Prompts.md` for the constraints encoded for future sister sites.
- **Next step:** verify Cloudflare deploys cleanly on the latest commit, then start adding pSEO entries to `src/lib/data.ts`.

## Versioning

This project follows the two-level versioning convention canonical
to the portfolio (see `sites/portfolio/AI_AGENTS.md` for the full
statement):

- **`vN`** — major capability tier (SemVer-MAJOR semantics).
- **`vN.X`** — phase letter within a tier (A, B, C, …) for
  internal slicing.
- **`vN.X.Y`** — numeric sub-phase for follow-up work that lands
  after `vN.X` shipped.

Track current phase + completed work in `docs/prd.md`.

## Building info

This project's `Makefile` forwards every target to `../Makefile`
(the sites/ workspace) which delegates per-stack work to the central
builder at `~/work/projects/builder/`. Common: `make deps`, `make dev`,
`make build`. Don't duplicate build logic per-site.

## Deployment info

Cloudflare Pages. Push to `main` triggers an auto-build via the
`wrangler.jsonc` config; build output is `dist/`. Custom domain
configured via the CF Pages dashboard.

