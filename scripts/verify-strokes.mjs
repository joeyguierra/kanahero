// Sanity-checks the vendored stroke SVGs in public/strokes:
// - all 142 kana present (71 hiragana + 71 katakana)
// - every character of every word in public/sets/*.json has a file
// - viewBox is 0 0 1024 1024 (the canvas is square because of this)
// - has a shadows group and a strokes group
// - stroke path count is plausible (1..24 — 線 is 15)
// Run: node scripts/verify-strokes.mjs

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const ROOT = path.join(import.meta.dirname, "..");
const DIR = path.join(ROOT, "public", "strokes");
const SETS = path.join(ROOT, "public", "sets");
const HIRAGANA =
  "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん" +
  "がぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽ";
const KANA =
  HIRAGANA +
  [...HIRAGANA].map((c) => String.fromCodePoint(c.codePointAt(0) + 0x60)).join("");

let bad = 0;
const rows = [];
const checked = new Set();

async function check(char, where) {
  if (checked.has(char)) return;
  checked.add(char);
  const hex = char.codePointAt(0).toString(16);
  try {
    const svg = await readFile(path.join(DIR, `${hex}.svg`), "utf8");
    const problems = [];
    if (!svg.includes('viewBox="0 0 1024 1024"')) problems.push("viewBox");
    if (!svg.includes('data-strokesvg="shadows"')) problems.push("no shadows group");
    const strokesIdx = svg.indexOf('data-strokesvg="strokes"');
    if (strokesIdx === -1) problems.push("no strokes group");
    // count <path> elements inside the strokes group (it is the last group)
    const strokesPart = strokesIdx === -1 ? "" : svg.slice(strokesIdx);
    const paths = (strokesPart.match(/<path /g) || []).length;
    if (paths < 1 || paths > 24) problems.push(`suspicious path count ${paths}`);
    if (problems.length) {
      bad++;
      console.error(`BAD ${char} (${hex}) [${where}]: ${problems.join(", ")}`);
    } else {
      rows.push(`${char} ${paths}`);
    }
  } catch {
    bad++;
    console.error(`MISSING ${char} (${hex}.svg) [${where}]`);
  }
}

for (const kana of KANA) await check(kana, "kana");
const kanaCount = checked.size;

// Set coverage: nothing can be dealt that cannot be drawn.
const setFiles = (await readdir(SETS)).filter((f) => f.endsWith(".json")).sort();
for (const file of setFiles) {
  const set = JSON.parse(await readFile(path.join(SETS, file), "utf8"));
  const before = checked.size;
  for (const word of set.words) {
    if (set.script !== "kanji" && word.word !== word.reading) {
      bad++;
      console.error(`BAD ${set.id}: "${word.word}" is a kana word but reading is "${word.reading}"`);
    }
    for (const ch of word.word) await check(ch, set.id);
  }
  const distinct = new Set([...set.words.flatMap((w) => [...w.word])]).size;
  console.log(
    `${set.id}: ${set.words.length} words, ${distinct} distinct characters` +
      `${checked.size - before > 0 ? ` (${checked.size - before} beyond the kana)` : ""}`,
  );
}

console.log(`\n${checked.size - bad}/${checked.size} files OK (${kanaCount} kana, ${setFiles.length} sets covered)`);
console.log("animatable path counts (includes split segments for self-intersecting strokes):");
console.log(rows.join("  "));
process.exit(bad ? 1 : 0);
