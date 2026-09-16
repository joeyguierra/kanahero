// Vendors kanji stroke SVGs from KanjiVG (kanjivg.tagaini.net) into
// public/strokes/<hex>.svg, plus the upstream license into public/licenses/.
// Characters: every distinct kanji across the kanji platform sets in
// public/sets/*.json (station: 14 characters).
// Run once at setup: node scripts/fetch-kanjivg.mjs [weight]
// Nothing is fetched at runtime — these files ship with the app.
//
// KanjiVG draws centerlines in a 109-unit box at a hairline width. strokesvg
// (the kana source) ships 1024-unit files whose strokes are clipped to a
// filled Klee One outline. To put the two hands side by side we:
//   1. wrap the paths in scale(1024/109) so the viewBox reads 0 0 1024 1024,
//   2. drop the stroke-number <text> layer,
//   3. restate the stroke as round-capped at STROKE_WIDTH (1024-unit space),
//   4. re-emit it in the shape lib/strokeAnimator.ts expects: a "shadows"
//      group (the ghost of the finished character) and a "strokes" group of
//      one path per pen stroke, in writing order, tagged style="--i:N".
//
// STROKE_WIDTH is the one tuned number, in 1024-unit space. It was measured,
// then checked by eye. Two statistics over 18 vendored kana:
//   ink area ÷ centerline length      → 54 (mean 54.1, range 50.3–57.5)
//   median local thickness (distance  → matched at 58
//     transform of the filled outline)
// Klee One's pen tapers, so the first number is dragged down by stroke ends
// while the second is what the eye reads as the weight of the hand. 58 is the
// perceptual match; the kanji then sit beside the kana without looking drawn
// by a finer pen. Retune with `node scripts/fetch-kanjivg.mjs <weight>`.

import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const STROKE_WIDTH = Number(process.argv[2] ?? process.env.KANJIVG_WEIGHT ?? 58);

const KVG_RAW = "https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji";
const ROOT = path.join(import.meta.dirname, "..");
const SETS = path.join(ROOT, "public", "sets");
const OUT = path.join(ROOT, "public", "strokes");
const LICENSES = path.join(ROOT, "public", "licenses");

const SCALE = 1024 / 109;
// stroke-width is applied in the scaled coordinate system, so divide it back
const INNER_WIDTH = +(STROKE_WIDTH / SCALE).toFixed(4);

const isKanji = (ch) => {
  const c = ch.codePointAt(0);
  return (c >= 0x4e00 && c <= 0x9fff) || (c >= 0x3400 && c <= 0x4dbf);
};

/** every distinct kanji across the kanji platform sets, in first-seen order */
export async function kanjiInSets() {
  const chars = [];
  for (const name of (await readdir(SETS)).filter((f) => f.endsWith(".json")).sort()) {
    const set = JSON.parse(await readFile(path.join(SETS, name), "utf8"));
    if (set.script !== "kanji") continue;
    for (const w of set.words) {
      for (const ch of w.word) if (isKanji(ch) && !chars.includes(ch)) chars.push(ch);
    }
  }
  return chars;
}

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

/** KanjiVG file → one 1024-unit strokesvg-shaped file */
export function normalize(char, hex, kvg) {
  const body = kvg.slice(kvg.indexOf("StrokePaths"));
  // stroke order is document order; the -sN ids confirm it
  const paths = [...body.matchAll(/<path[^>]*\sid="kvg:[^"]*-s(\d+)"[^>]*\sd="([^"]+)"/g)]
    .map((m) => ({ n: Number(m[1]), d: m[2] }))
    .sort((a, b) => a.n - b.n);
  if (paths.length === 0) throw new Error("no stroke paths");
  if (paths.some((p, i) => p.n !== i + 1)) throw new Error("stroke numbers are not 1..n");

  const pen = `stroke-width:${INNER_WIDTH};stroke-linecap:round;stroke-linejoin:round`;
  const ghost = paths.map((p) => `      <path d="${p.d}"/>`).join("\n");
  const ink = paths
    .map((p, i) => `      <path style="--i:${i}" d="${p.d}"/>`)
    .join("\n");

  return `<svg data-strokesvg="${char}" data-source="kanjivg" data-stroke-width="${STROKE_WIDTH}" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <!-- KanjiVG (CC BY-SA 3.0), U+${hex.toUpperCase()}; normalized 109→1024, stroke weight ${STROKE_WIDTH} to match strokesvg. -->
  <g transform="scale(${SCALE.toFixed(6)})">
    <g data-strokesvg="shadows" style="fill:none;stroke:var(--shadow,#ccc);${pen}">
${ghost}
    </g>
    <g data-strokesvg="strokes" style="fill:none;stroke:var(--stroke,#000);${pen}">
${ink}
    </g>
  </g>
</svg>
`;
}

if (import.meta.filename === process.argv[1]) {
  await mkdir(OUT, { recursive: true });
  await mkdir(LICENSES, { recursive: true });

  const chars = await kanjiInSets();
  console.log(`${chars.length} distinct kanji: ${chars.join(" ")}`);
  console.log(`stroke weight ${STROKE_WIDTH} (=${INNER_WIDTH} before scale(${SCALE.toFixed(6)}))\n`);

  let failed = 0;
  const written = [];
  for (const char of chars) {
    const hex = char.codePointAt(0).toString(16).padStart(5, "0"); // KanjiVG pads to 5
    try {
      const kvg = await fetchText(`${KVG_RAW}/${hex}.svg`);
      const out = normalize(char, hex, kvg);
      const strokes = (out.match(/--i:/g) || []).length;
      await writeFile(path.join(OUT, `${char.codePointAt(0).toString(16)}.svg`), out);
      written.push(`U+${hex.toUpperCase()}`);
      console.log(`ok  ${char} -> ${char.codePointAt(0).toString(16)}.svg  ${strokes} strokes`);
    } catch (e) {
      failed++;
      console.error(`FAIL ${char}: ${e.message}`);
    }
  }

  // CC BY-SA requires the license travel with the work; the visible credit
  // lives on the CREDITS screen (SPEC-v5 §8).
  const license = await fetchText(
    "https://raw.githubusercontent.com/KanjiVG/kanjivg/master/COPYING",
  );
  await writeFile(
    path.join(LICENSES, "kanjivg-LICENSE.txt"),
    `KanjiVG stroke data — Copyright (C) 2009-2024 Ulrich Apel and contributors.
Licensed under Creative Commons Attribution-Share Alike 3.0.
Homepage: https://kanjivg.tagaini.net/

The files in public/strokes/ for kanji characters are derived from KanjiVG:
the 109-unit viewBox is scaled to 1024, the stroke-number layer is removed,
and the stroke weight is set to ${STROKE_WIDTH} to match the kana stroke data.
Those derived files remain under CC BY-SA 3.0.

${license}`,
  );
  console.log("ok  LICENSE -> public/licenses/kanjivg-LICENSE.txt");

  if (failed > 0) {
    console.error(`\n${failed} file(s) failed`);
    process.exit(1);
  }
  console.log(`\nAll ${chars.length} kanji vendored: ${written.join(" ")}`);
}
