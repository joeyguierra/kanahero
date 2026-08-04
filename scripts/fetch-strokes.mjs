// Vendors stroke SVGs from strokesvg (github.com/zhengkyl/strokesvg) into
// public/strokes/<hex>.svg, plus the upstream LICENSE into public/licenses/.
// Run once at setup: node scripts/fetch-strokes.mjs
// Nothing is fetched at runtime — these files ship with the app.

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const REPO_RAW = "https://raw.githubusercontent.com/zhengkyl/strokesvg/main";
const OUT = path.join(import.meta.dirname, "..", "public", "strokes");
const LICENSES = path.join(import.meta.dirname, "..", "public", "licenses");

// Keep this list in sync with lib/kana.ts (71 characters).
const KANA =
  "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん" +
  "がぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽ";

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

await mkdir(OUT, { recursive: true });
await mkdir(LICENSES, { recursive: true });

let failed = 0;
for (const kana of KANA) {
  const hex = kana.codePointAt(0).toString(16).padStart(4, "0");
  const url = `${REPO_RAW}/dist/hiragana/${encodeURIComponent(kana)}.svg`;
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

const license = await fetchText(`${REPO_RAW}/LICENSE`);
await writeFile(path.join(LICENSES, "strokesvg-LICENSE.txt"), license);
console.log("ok  LICENSE -> public/licenses/strokesvg-LICENSE.txt");

if (failed > 0) {
  console.error(`\n${failed} file(s) failed`);
  process.exit(1);
}
console.log(`\nAll ${KANA.length} stroke files vendored.`);
