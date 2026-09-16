// Vendors stroke SVGs from strokesvg (github.com/zhengkyl/strokesvg) into
// public/strokes/<hex>.svg, plus the upstream LICENSE into public/licenses/.
// Both scripts: 71 hiragana and the 71 katakana that mirror them, plus the 20
// small kana the word sets need (ちょっと, フィリピン) — see SMALL below.
// Run once at setup: node scripts/fetch-strokes.mjs
// Nothing is fetched at runtime — these files ship with the app.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const REPO_RAW = "https://raw.githubusercontent.com/zhengkyl/strokesvg/main";
const OUT = path.join(import.meta.dirname, "..", "public", "strokes");
const LICENSES = path.join(import.meta.dirname, "..", "public", "licenses");

// Keep this list in sync with lib/kana.ts (71 characters).
const HIRAGANA =
  "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん" +
  "がぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽ";

// Same 0x60 shift lib/kana.ts uses to derive the katakana set.
const KATAKANA = [...HIRAGANA]
  .map((c) => String.fromCodePoint(c.codePointAt(0) + 0x60))
  .join("");

const SETS = [
  { dir: "hiragana", chars: HIRAGANA },
  { dir: "katakana", chars: KATAKANA },
];
const TOTAL = HIRAGANA.length + KATAKANA.length;

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

await mkdir(OUT, { recursive: true });
await mkdir(LICENSES, { recursive: true });

let failed = 0;
let small_ok = 0;
for (const { dir, chars } of SETS) {
  for (const kana of chars) {
    const hex = kana.codePointAt(0).toString(16).padStart(4, "0");
    const url = `${REPO_RAW}/dist/${dir}/${encodeURIComponent(kana)}.svg`;
    try {
      const svg = await fetchText(url);
      if (!svg.includes("data-strokesvg")) throw new Error("not a strokesvg file");
      await writeFile(path.join(OUT, `${hex}.svg`), svg);
      console.log(`ok  ${kana} -> ${hex}.svg`);
    } catch (e) {
      failed++;
      console.error(`FAIL ${kana}: ${e.message}`);
    }
  }
}

// Small kana. A word set can ask for any of them (ちょっと, フィリピン), so they
// need files of their own. Upstream ships 16 of the 20, already drawn small
// inside the 1024 box — and it has no っ ッ ゎ ヮ at all. Mixing pre-shrunk
// files with full-size ones would make "small" mean two different things, so
// all 20 are written here from their full-size twin instead: a small kana is
// the same hand at a smaller size, and SPEC-v5 §4 does the shrinking in the
// cell, uniformly. Ids inside the copy are re-prefixed, or two files inlined
// on one page would share clipPath ids.
const SMALL = [
  ["ぁ", "あ"], ["ぃ", "い"], ["ぅ", "う"], ["ぇ", "え"], ["ぉ", "お"],
  ["っ", "つ"], ["ゃ", "や"], ["ゅ", "ゆ"], ["ょ", "よ"], ["ゎ", "わ"],
];

for (const [small, full] of SMALL) {
  for (const shift of [0, 0x60]) {
    const s = String.fromCodePoint(small.codePointAt(0) + shift);
    const f = String.fromCodePoint(full.codePointAt(0) + shift);
    const hex = s.codePointAt(0).toString(16).padStart(4, "0");
    const fullHex = f.codePointAt(0).toString(16).padStart(4, "0");
    try {
      const svg = (await readFile(path.join(OUT, `${fullHex}.svg`), "utf8"))
        .replaceAll(fullHex, hex)
        .replace(`data-strokesvg="${f}"`, `data-strokesvg="${s}" data-from="${f}"`);
      if (!svg.includes("data-strokesvg")) throw new Error("not a strokesvg file");
      await writeFile(path.join(OUT, `${hex}.svg`), svg);
      small_ok++;
      console.log(`ok  ${s} <- ${f} -> ${hex}.svg`);
    } catch (e) {
      failed++;
      console.error(`FAIL ${s}: ${e.message}`);
    }
  }
}

const license = await fetchText(`${REPO_RAW}/LICENSE`);
await writeFile(path.join(LICENSES, "strokesvg-LICENSE.txt"), license);
console.log("ok  LICENSE -> public/licenses/strokesvg-LICENSE.txt");

if (failed > 0) {
  console.error(`\n${failed} file(s) failed`);
  process.exit(1);
}
console.log(`\nAll ${TOTAL + small_ok} stroke files vendored (${TOTAL} kana + ${small_ok} small).`);
