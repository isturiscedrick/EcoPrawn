import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const root = fileURLToPath(new URL("..", import.meta.url));
const src = readFileSync(join(root, "src/components/layout/BrandMark.tsx"), "utf8");

// Pull every { kind: "...", d: "..." } entry out of SHAPES.
const shapes = [...src.matchAll(/kind:\s*"(shrimp|text)",\s*d:\s*"([^"]+)"/g)].map(
  (m) => ({ kind: m[1], d: m[2] })
);
if (!shapes.length) throw new Error("No shapes found in BrandMark.tsx");

const COLORS = { shrimp: "#d94416", text: "#02262b" };
const path = (s) => `<path fill="${COLORS[s.kind]}" fill-rule="evenodd" d="${s.d}"/>`;

const svg = (viewBox, items) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${items.map(path).join("")}</svg>`;

const pad = 30;
const files = {
  "ecoprawn-logo-with-text": svg(`${0 - pad} ${0 - pad} ${1086 + pad * 2} ${362 + pad * 2}`, shapes),
  "ecoprawn-logo-no-text": svg(`${70 - pad} ${4 - pad} ${411 + pad * 2} ${357 + pad * 2}`, shapes.filter((s) => s.kind === "shrimp")),
};

const out = join(root, "public/assets/logo-export");
mkdirSync(out, { recursive: true });

let sharp = null;
try { sharp = (await import("sharp")).default; } catch {}

for (const [name, markup] of Object.entries(files)) {
  writeFileSync(join(out, `${name}.svg`), markup);
  if (sharp) {
    // Transparent background, high resolution.
    await sharp(Buffer.from(markup), { density: 300 })
      .resize({ width: 2400 })
      .png()
      .toFile(join(out, `${name}.png`));
  }
}
console.log(`Saved to ${out}` + (sharp ? "" : " (SVG only, sharp not found)"));