// Generates PWA icons from the vendored か stroke SVG (it's the app's subject
// matter, and Klee One's OFL license permits this use).
// Run: node scripts/gen-icons.mjs

import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.join(import.meta.dirname, "..");
const BG = "#0a0a0b"; // chassis
const INK = "#ff2e88"; // strike — the model-stroke color is the brand mark

// か with all strokes shown (shadows hidden, strokes at full ink)
const ka = await readFile(path.join(ROOT, "public", "strokes", "304b.svg"), "utf8");
const glyph = ka
  .replace('data-strokesvg="shadows" style="fill:var(--shadow,#ccc)"', 'data-strokesvg="shadows" style="fill:none"')
  .replace("stroke:var(--stroke,#000)", `stroke:${INK}`);

function icon(size, pad) {
  const inner = size - pad * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
    <rect width="${size}" height="${size}" fill="${BG}"/>
    <svg x="${pad}" y="${pad}" width="${inner}" height="${inner}" viewBox="0 0 1024 1024">
      ${glyph.replace(/<svg[^>]*>/, "").replace("</svg>", "")}
    </svg>
  </svg>`;
}

const targets = [
  ["icon-192.png", 192, 24],
  ["icon-512.png", 512, 64],
  ["icon-512-maskable.png", 512, 128], // maskable: keep glyph inside the safe zone
  ["apple-touch-icon.png", 180, 26],
];

for (const [name, size, pad] of targets) {
  await sharp(Buffer.from(icon(size, pad))).png().toFile(path.join(ROOT, "public", name));
  console.log(`ok  ${name}`);
}
