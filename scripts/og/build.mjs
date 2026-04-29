// Build-time OG image generator.
// Renders public/og-image.png (1200x630) using satori (JSX → SVG with text as
// paths) + @resvg/resvg-js (SVG → PNG). Run via: pnpm og:build
//
// When M3.1 lands, this becomes the per-slug renderer (loop over data.ts,
// emit dist/og/{slug}.png). For now it produces the single default image
// referenced by index.html's og:image / twitter:image meta tags.

import { Resvg } from "@resvg/resvg-js";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import satori from "satori";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "../..");
const outPath = resolve(projectRoot, "public/og-image.png");

// Bundled TTF — borrowed from calcengine.site. resvg can't read system fonts
// in our docker image and doesn't decode WOFF; satori needs raw font bytes.
const interBold = readFileSync(resolve(projectRoot, "src/assets/fonts/inter-bold.ttf"));

const BRAND_BLUE = "#0b65d6";
const BRAND_BLUE_DARK = "#084694";
const BRAND_YELLOW = "#ffd400";
const MUTED = "#cbd5e1";

// Satori takes elements via h(type, props, children). No JSX so we don't
// need a JSX transform in the build script.
const h = (type, props = {}, children = []) => ({
  type,
  props: { ...props, children },
});

const boltSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 450" width="240" height="450">
  <path d="M168 18 L50 218 H120 L100 432 L220 168 H150 Z"
        fill="${BRAND_YELLOW}"
        stroke="${BRAND_BLUE_DARK}"
        stroke-width="3"
        stroke-linejoin="round"/>
</svg>`;

const tree = h(
  "div",
  {
    style: {
      width: "1200px",
      height: "630px",
      display: "flex",
      flexDirection: "row",
      backgroundImage: `linear-gradient(135deg, ${BRAND_BLUE} 0%, ${BRAND_BLUE_DARK} 100%)`,
      fontFamily: "Inter",
      color: "white",
    },
  },
  [
    // left column — text
    h(
      "div",
      {
        style: {
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "80px",
          justifyContent: "space-between",
        },
      },
      [
        h(
          "div",
          {
            style: {
              display: "flex",
              fontSize: "36px",
              color: BRAND_YELLOW,
              letterSpacing: "4px",
            },
          },
          ["⚡ VOLTLOOP"],
        ),
        h(
          "div",
          { style: { display: "flex", flexDirection: "column", gap: "20px" } },
          [
            h(
              "div",
              {
                style: {
                  display: "flex",
                  fontSize: "72px",
                  lineHeight: 1.05,
                  color: "white",
                },
              },
              ["EV Charging Cost Calculator"],
            ),
            h(
              "div",
              {
                style: {
                  display: "flex",
                  fontSize: "28px",
                  color: MUTED,
                  lineHeight: 1.3,
                },
              },
              ["Know exactly what it costs to charge — at home or on a Supercharger."],
            ),
          ],
        ),
        h(
          "div",
          { style: { display: "flex", flexDirection: "column", gap: "12px" } },
          [
            h(
              "div",
              {
                style: {
                  display: "flex",
                  fontSize: "22px",
                  color: BRAND_YELLOW,
                  letterSpacing: "3px",
                },
              },
              ["HOME · LEVEL 2 · SUPERCHARGER"],
            ),
            h(
              "div",
              {
                style: {
                  display: "flex",
                  fontSize: "20px",
                  color: "rgba(255,255,255,0.65)",
                },
              },
              ["voltloop.site"],
            ),
          ],
        ),
      ],
    ),
    // right column — bolt mark
    h(
      "div",
      {
        style: {
          width: "380px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 60px",
        },
      },
      [
        h(
          "div",
          {
            style: {
              width: "260px",
              height: "420px",
              backgroundColor: "rgba(255,255,255,0.08)",
              border: "2px solid rgba(255,255,255,0.15)",
              borderRadius: "48px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            },
          },
          [
            h("img", {
              src: `data:image/svg+xml;utf8,${encodeURIComponent(boltSvg)}`,
              width: 200,
              height: 360,
            }),
          ],
        ),
      ],
    ),
  ],
);

const svg = await satori(tree, {
  width: 1200,
  height: 630,
  fonts: [{ name: "Inter", data: interBold, weight: 700, style: "normal" }],
});

const png = new Resvg(svg, { background: BRAND_BLUE }).render().asPng();

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, png);

const sizeKb = (png.length / 1024).toFixed(1);
console.log(`✓ wrote ${outPath} (${sizeKb} KB)`);
