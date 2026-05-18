// Build-time sitemap generator. Mirrors scripts/og/build.mjs in pattern.
// Writes public/sitemap.xml so vite build copies it into dist/.
// Run via: pnpm sitemap:build (also chained into `pnpm build`).
//
// SEO_PAGES_SYNC: the route list below mirrors `buildSeoPages()` in
// src/lib/data.ts. Keep them in sync. We don't import the TS module directly
// because deploys can't assume Node >= 22.6 for --experimental-strip-types.

import { mkdirSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "../..");
const outPath = resolve(projectRoot, "public/sitemap.xml");

const BASE = "https://voltloop.site";

// --- SEO_PAGES_SYNC start: parallels src/lib/data.ts ----------------------

// All non-generic EV models that get a per-model page.
const EV_MODEL_SLUGS = [
  "tesla-model-3",
  "tesla-model-y",
  "tesla-model-s",
  "tesla-model-x",
  "ford-f-150-lightning",
  "ford-mustang-mach-e",
  "chevy-bolt",
  "rivian-r1t",
  "hyundai-ioniq-5",
  "kia-ev6",
];

// Charger-type landing pages.
const CHARGER_SLUGS = [
  "tesla-supercharger-cost",
  "home-ev-charging-cost",
  "public-dc-fast-charging-cost",
  "level-1-vs-level-2-charging-cost",
];

// Top-model × state combos. Top models is a subset of EV_MODEL_SLUGS.
const TOP_MODEL_SLUGS = [
  "tesla-model-3",
  "tesla-model-y",
  "ford-f-150-lightning",
  "chevy-bolt",
];

const STATE_SLUGS = [
  "california",
  "texas",
  "florida",
  "new-york",
  "washington",
  "oregon",
  "arizona",
  "nevada",
  "colorado",
  "illinois",
  "georgia",
  "north-carolina",
  "virginia",
  "massachusetts",
  "new-jersey",
];

const GUIDE_SLUGS = ["how-much-does-it-cost-to-charge-an-ev"];

function buildSeoSlugs() {
  const slugs = [];
  EV_MODEL_SLUGS.forEach(m => slugs.push(`${m}-charging-cost`));
  CHARGER_SLUGS.forEach(c => slugs.push(c));
  TOP_MODEL_SLUGS.forEach(m => {
    STATE_SLUGS.forEach(s => slugs.push(`${m}-charging-cost-${s}`));
  });
  GUIDE_SLUGS.forEach(g => slugs.push(g));
  return slugs;
}

// --- SEO_PAGES_SYNC end ---------------------------------------------------

const STATIC_ROUTES = ["/", "/ev-charging-cost-calculator"];

const routes = [...STATIC_ROUTES, ...buildSeoSlugs().map(s => `/${s}`)];

const today = new Date().toISOString().slice(0, 10);

function xmlEscape(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

const urls = routes
  .map(
    r =>
      `  <url>\n    <loc>${xmlEscape(BASE + r)}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`,
  )
  .join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, xml);

console.log(`✓ wrote ${outPath} (${routes.length} URLs)`);
