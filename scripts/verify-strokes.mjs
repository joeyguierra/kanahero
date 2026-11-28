// Sanity-checks the vendored stroke SVGs in public/strokes:
// - all 142 kana present (71 hiragana + 71 katakana)
// - every character of every word in public/words/n5.json has a file
// - the list keeps its promises: unique written forms, unique meanings
// - every kanji upgrade (a word marked `upgrade`, written as its `kanji`) can
//   be drawn, and is an id no list word and no other upgrade has
// - the research copy of the list is byte-identical to the shipped one
// - viewBox is 0 0 1024 1024 (the canvas is square because of this)
// - has a shadows group and a strokes group
// - stroke path count is plausible (1..24 — 線 is 15)
// Run: node scripts/verify-strokes.mjs

import { readFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.join(import.meta.dirname, "..");
const DIR = path.join(ROOT, "public", "strokes");
const WORDS = path.join(ROOT, "public", "words", "n5.json");
const WORDS_COPY = path.join(ROOT, "docs", "research", "01-n5-week1-words.json");
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

// List coverage: nothing can be dealt that cannot be drawn. The list's own
// promises are checked here too, because the app leans on them: the written
// word is the item id, and a kana word is prompted by its meaning alone.
const raw = await readFile(WORDS);
const words = JSON.parse(raw.toString("utf8"));
if (!raw.equals(await readFile(WORDS_COPY))) {
  bad++;
  console.error("BAD n5: docs/research/01-n5-week1-words.json differs from public/words/n5.json");
}
const before = checked.size;
const dupes = (key) => {
  const seen = new Set();
  return words.map((w) => w[key]).filter((v) => seen.size === seen.add(v).size);
};
for (const key of ["write", "meaning"]) {
  for (const v of dupes(key)) {
    bad++;
    console.error(`BAD n5: ${key} "${v}" appears twice`);
  }
}
for (const w of words) {
  if (!["hiragana", "katakana", "kanji"].includes(w.ask)) {
    bad++;
    console.error(`BAD n5: "${w.write}" asks for "${w.ask}"`);
  }
  if (w.ask !== "kanji" && w.write !== w.reading) {
    bad++;
    console.error(`BAD n5: "${w.write}" is a kana word but reading is "${w.reading}"`);
  }
  for (const ch of w.write) await check(ch, "n5");
}
const distinct = new Set(words.flatMap((w) => [...w.write])).size;
console.log(
  `n5: ${words.length} words, ${distinct} distinct characters (${checked.size - before} beyond the kana)`,
);

// Kanji upgrades (SPEC-kanji-upgrade §2.3): derived at run time, so they are
// not in the JSON, but each is an item id and must be drawable like any word.
const written = new Set(words.map((w) => w.write));
const upgrades = new Set();
const beforeUp = checked.size;
for (const w of words.filter((x) => x.upgrade !== undefined)) {
  if (w.upgrade !== true || w.ask !== "hiragana" || !w.kanji) {
    bad++;
    console.error(`BAD n5: "${w.write}" is marked upgrade but is not a kana word with a kanji form`);
    continue;
  }
  if (written.has(w.kanji) || upgrades.has(w.kanji)) {
    bad++;
    console.error(`BAD n5: upgrade "${w.kanji}" (of "${w.write}") is already an item id`);
  }
  upgrades.add(w.kanji);
  for (const ch of w.kanji) await check(ch, `upgrade of ${w.write}`);
}
console.log(`upgrades: ${upgrades.size} words, ${checked.size - beforeUp} more characters`);

console.log(`\n${checked.size - bad}/${checked.size} files OK (${kanaCount} kana, ${words.length} words covered)`);
console.log("animatable path counts (includes split segments for self-intersecting strokes):");
console.log(rows.join("  "));
process.exit(bad ? 1 : 0);
