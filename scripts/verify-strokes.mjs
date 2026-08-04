// Sanity-checks the vendored stroke SVGs in public/strokes:
// - all 71 present
// - viewBox is 0 0 1024 1024 (the canvas is square because of this)
// - has a shadows group and a strokes group
// - stroke path count >= visible stroke count is plausible (1..10)
// Run: node scripts/verify-strokes.mjs

import { readFile } from "node:fs/promises";
import path from "node:path";

const DIR = path.join(import.meta.dirname, "..", "public", "strokes");
const KANA =
  "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん" +
  "がぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽ";

let bad = 0;
const rows = [];
for (const kana of KANA) {
  const hex = kana.codePointAt(0).toString(16).padStart(4, "0");
  try {
    const svg = await readFile(path.join(DIR, `${hex}.svg`), "utf8");
    const problems = [];
    if (!svg.includes('viewBox="0 0 1024 1024"')) problems.push("viewBox");
    if (!svg.includes('data-strokesvg="shadows"')) problems.push("no shadows group");
    const strokesIdx = svg.indexOf('data-strokesvg="strokes"');
    if (strokesIdx === -1) problems.push("no strokes group");
    // count <path> elements inside the strokes group (it is the last group in the file)
    const strokesPart = strokesIdx === -1 ? "" : svg.slice(strokesIdx);
    const paths = (strokesPart.match(/<path /g) || []).length;
    if (paths < 1 || paths > 12) problems.push(`suspicious path count ${paths}`);
    if (problems.length) {
      bad++;
      console.error(`BAD ${kana} (${hex}): ${problems.join(", ")}`);
    } else {
      rows.push(`${kana} ${paths}`);
    }
  } catch {
    bad++;
    console.error(`MISSING ${kana} (${hex}.svg)`);
  }
}

console.log(`\n${KANA.length - bad}/${KANA.length} files OK`);
console.log("animatable path counts (includes split segments for self-intersecting strokes):");
console.log(rows.join("  "));
process.exit(bad ? 1 : 0);
