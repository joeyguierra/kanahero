#!/usr/bin/env node
// Generates the README brand assets from the vendored stroke data, so the marks
// are the same centerlines the app animates — not a redraw of them.
//
//   node scripts/make-brand.mjs      -> .github/media/{lockup,stroke-so,palette}.svg
//
// The fourth asset, .github/media/loop.gif, is cut from the screen recording:
//
//   ffmpeg -ss 10.2 -t 8.2 -i public/assets/screen-demo.mp4 \
//     -vf "crop=1080:2064:0:112,fps=15,scale=360:-1:flags=lanczos,palettegen=max_colors=96:stats_mode=diff" -y /tmp/pal.png
//   ffmpeg -ss 10.2 -t 8.2 -i public/assets/screen-demo.mp4 -i /tmp/pal.png \
//     -filter_complex "[0:v]crop=1080:2064:0:112,fps=15,scale=360:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle" \
//     -y .github/media/loop.gif

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, ".github", "media");

// THE LOG doctrine — same tokens as app/globals.css
const C = {
  strike: "#ff2e88",
  chassis: "#0a0a0b",
  plate: "#141416",
  seam: "#2a2a2e",
  carbon: "#5a5a5f",
  rail: "#8c8c93",
  print: "#b9b6b1",
  bone: "#f2f0eb",
  live: "#00e58a",
  caution: "#ffb300",
  blueprint: "#2e9dff",
  ghost: "#17171a",
  shadow: "#232327",
};

const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

/** Pull the shadow (silhouette) and stroke (centerline) paths out of a vendored glyph. */
function glyph(code) {
  const svg = readFileSync(join(root, "public", "strokes", `${code}.svg`), "utf8");
  const s = svg.indexOf('data-strokesvg="strokes"');
  const h = svg.indexOf('data-strokesvg="shadows"');
  const d = (chunk) => [...chunk.matchAll(/<path[^>]*\sd="([^"]+)"/g)].map((m) => m[1]);
  return { shadows: d(svg.slice(h, s)), strokes: d(svg.slice(s)) };
}

/** Registration tick — the crosshair that sits in every canvas corner in-app. */
const reg = (x, y, r = 5) =>
  `<path d="M${x - r} ${y}h${r * 2}M${x} ${y - r}v${r * 2}" stroke="${C.carbon}" stroke-width="1"/>`;

/** Chamfered plate: the 12px top-right cut that every strike button carries. */
const chamfer = (w, h, cut) =>
  `M0 0H${w - cut}L${w} ${cut}V${h}H0Z`;

// ---------------------------------------------------------------- lockup

function lockup() {
  const ka = glyph("304b");
  const a = glyph("3042");

  const clips = ka.shadows.map((d) => `<path d="${d}"/>`).join("");
  const ghost = a.shadows.map((d) => `<path d="${d}"/>`).join("");
  const marks = ka.strokes.map((d) => `<path d="${d}"/>`).join("");

  const chip = "38 OF 71 WRITTEN FROM MEMORY";
  const chipW = chip.length * 11.2 + 28;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 400" width="1280" height="400" role="img" aria-label="kanahero — write all 71 hiragana from memory">
  <defs>
    <clipPath id="plate"><path d="${chamfer(1280, 400, 26)}"/></clipPath>
    <clipPath id="kaMask">${clips}</clipPath>
  </defs>
  <g clip-path="url(#plate)">
    <rect width="1280" height="400" fill="${C.chassis}"/>
    <g fill="${C.ghost}" transform="translate(742 -66) scale(0.56)">${ghost}</g>
    <g transform="translate(86 92) scale(0.2148)">
      <g clip-path="url(#kaMask)" fill="none" stroke="${C.strike}" stroke-width="128" stroke-linecap="round">${marks}</g>
    </g>
    <text x="356" y="198" font-family="${MONO}" font-size="62" font-weight="700" letter-spacing="9.9" fill="${C.bone}">KANAHERO</text>
    <text x="358" y="241" font-family="${MONO}" font-size="17" letter-spacing="2.4" fill="${C.print}">WRITE ALL 71 HIRAGANA FROM MEMORY</text>
    <rect x="356" y="268" width="${chipW}" height="34" fill="${C.strike}"/>
    <text x="370" y="291" font-family="${MONO}" font-size="15" font-weight="700" letter-spacing="2" fill="#000">${chip}</text>
    <circle cx="866" cy="352" r="4.5" fill="${C.live}"/>
    <text x="884" y="357" font-family="${MONO}" font-size="13" letter-spacing="1.8" fill="${C.carbon}">ON DEVICE · NO ACCOUNT · NO BACKEND</text>
    ${reg(30, 30)}${reg(1250, 30)}${reg(30, 370)}${reg(1250, 370)}
    <path d="${chamfer(1280, 400, 26)}" fill="none" stroke="${C.seam}" stroke-width="2"/>
  </g>
</svg>
`;
}

// ------------------------------------------------------------ animated そ

function strokeSo() {
  const so = glyph("305d");
  const clips = so.shadows.map((d) => `<path d="${d}"/>`).join("");
  const shadows = so.shadows.map((d) => `<path d="${d}"/>`).join("");
  // pathLength normalises every centerline to 1000 units, so the dash animation
  // needs no measured length and stays correct if the upstream data changes.
  const strokes = so.strokes
    .map((d) => `<path d="${d}" pathLength="1000"/>`)
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 356" width="320" height="356" role="img" aria-label="the hiragana so drawing itself in stroke order">
  <defs>
    <clipPath id="soPlate"><path d="${chamfer(320, 356, 18)}"/></clipPath>
    <clipPath id="soMask">${clips}</clipPath>
    <style>
      .ink { stroke-dasharray: 1000; stroke-dashoffset: 0; animation: draw 4s linear infinite; }
      @keyframes draw {
        0%, 6%   { stroke-dashoffset: 1000; }
        66%, 100% { stroke-dashoffset: 0; }
      }
      @media (prefers-reduced-motion: reduce) { .ink { animation: none; } }
    </style>
  </defs>
  <g clip-path="url(#soPlate)">
    <rect width="320" height="356" fill="${C.chassis}"/>
    <path d="M12 12H296L308 24V300H12Z" fill="${C.bone}"/>
    <g transform="translate(32 28) scale(0.25)">
      <g fill="${C.shadow}">${shadows}</g>
      <g class="ink" clip-path="url(#soMask)" fill="none" stroke="${C.strike}" stroke-width="128" stroke-linecap="round" stroke-linejoin="round">${strokes}</g>
    </g>
    ${reg(26, 26, 4)}${reg(294, 26, 4)}${reg(26, 286, 4)}${reg(294, 286, 4)}
    <text x="160" y="330" text-anchor="middle" font-family="${MONO}" font-size="12" letter-spacing="2.2" fill="${C.carbon}">SO · 1 STROKE · CENTERLINE</text>
    <path d="${chamfer(320, 356, 18)}" fill="none" stroke="${C.seam}" stroke-width="2"/>
  </g>
</svg>
`;
}

// --------------------------------------------------------------- palette

function palette() {
  const ramp = [
    ["chassis", C.chassis],
    ["plate", C.plate],
    ["seam", C.seam],
    ["carbon", C.carbon],
    ["rail", C.rail],
    ["print", C.print],
    ["bone", C.bone],
    ["strike", C.strike],
    ["live", C.live],
    ["caution", C.caution],
    ["blueprint", C.blueprint],
  ];
  const M = 40, GAP = 12, W = 1280;
  const sw = (W - M * 2 - GAP * (ramp.length - 1)) / ramp.length;

  const cells = ramp
    .map(([name, hex], i) => {
      const x = M + i * (sw + GAP);
      return `<rect x="${x.toFixed(1)}" y="52" width="${sw.toFixed(1)}" height="66" fill="${hex}" stroke="${C.seam}"/>
    <text x="${x.toFixed(1)}" y="140" font-family="${MONO}" font-size="12" letter-spacing="1.4" fill="${C.bone}">${name.toUpperCase()}</text>
    <text x="${x.toFixed(1)}" y="158" font-family="${MONO}" font-size="11" letter-spacing="0.8" fill="${C.carbon}">${hex.toUpperCase()}</text>`;
    })
    .join("\n    ");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 190" width="1280" height="190" role="img" aria-label="THE LOG doctrine palette">
  <rect width="1280" height="190" fill="${C.chassis}"/>
  <text x="40" y="32" font-family="${MONO}" font-size="13" font-weight="700" letter-spacing="3" fill="${C.bone}">THE LOG DOCTRINE</text>
  <text x="${1280 - 40}" y="32" text-anchor="end" font-family="${MONO}" font-size="12" letter-spacing="1.8" fill="${C.carbon}">7 GREYS · 4 SIGNALS</text>
  ${cells}
</svg>
`;
}

mkdirSync(out, { recursive: true });
for (const [name, svg] of [
  ["lockup.svg", lockup()],
  ["stroke-so.svg", strokeSo()],
  ["palette.svg", palette()],
]) {
  writeFileSync(join(out, name), svg);
  console.log(`wrote .github/media/${name}  ${svg.length} bytes`);
}
