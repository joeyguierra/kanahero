// Compiles the Joker's corpus and polices it. Run: node scripts/joker-audit.mjs
//
// Sources of truth (SPEC-v5b §2):
//   joker/corpus.md      every global line, human-edited, cold-read in place
//   joker/facts.json     declared facts — rules and features, each with its proof
//   public/sets/*.json   set-specific lines, under a `joker` key
//        ↓
//   lib/joker-corpus.generated.json   what the app imports. Never hand-edited.
//
// The failure direction is the whole design. A line whose `needs:` no longer
// holds is SILENCED — dropped from the bundle and named in the report — so he
// says less rather than saying something false. A line that is malformed, too
// long, carries a typed number or an unknown token FAILS the build, because
// those are authoring errors and there is nothing to fall back to. Silencing
// that would leave a screen with nothing at all to say also fails: he may say
// less, never nothing.
//
// Set blocks ride along inside the set JSON rather than being compiled in
// here: a set is fetched at runtime, so its lines arrive and leave with it.
// This script only validates them, and folds them into the corpus hash so the
// device's shuffle bags reconcile when they change.

import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.join(import.meta.dirname, "..");
const CORPUS = path.join(ROOT, "joker", "corpus.md");
const FACTS = path.join(ROOT, "joker", "facts.json");
const SETS_DIR = path.join(ROOT, "public", "sets");
const SCREEN_TYPE = path.join(ROOT, "lib", "joker-lines.ts");
const OUT = path.join(ROOT, "lib", "joker-corpus.generated.json");

/** the pool key that is not a screen: lines he may say exactly once, ever */
const ONCE_POOL = "once";
/** tokens the runtime can fill (SPEC-v5b §5); `n:X` counts anything it wraps */
const TOKENS = ["bank", "shiny", "earned", "words", "chars"];
/** the voice law: a line is under twelve words, a token counting as one */
const MAX_WORDS = 11;
/** counting words he is allowed to type, because they are idiom, not data */
const NUMBER_WORD_OK = new Set([
  // "one box" is a box, not a count of boxes
  "reveal.kana.02",
  "round.kana.01",
  "once.wholeWord",
  // "One character, many readings" — the shape of kanji, not a number of them
  "home.kanji.01",
]);
const NUMBER_WORDS =
  /\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)\b|\d/i;

/** pool depth by visit frequency (bible §5). Warn-only in this build: every
    pool but `home` is a pool of one on purpose, awaiting its own pass. */
const DEPTH = [
  [["drill", "drill.prompt", "round.kana", "round.kanji", "reveal.kana", "reveal.kanji"], 30],
  [["home", "deck.hiragana", "deck.katakana", "deck.kanji", "set", "result",
    "earned.shiny", "earned.base", "earned.worn"], 15],
  [["bank", "collection", "abandon", "round.missed"], 6],
  [["credits", "collection.empty", "home.wiped"], 2],
];

const fail = [];
const warn = [];
const silenced = [];

// ---- sources ----

const corpusSrc = await readFile(CORPUS, "utf8");
const factsSrc = await readFile(FACTS, "utf8");
const facts = JSON.parse(factsSrc).facts;

// The screen keys come from the type itself, never a hand-kept copy — that is
// what makes "pool key not a JokerScreen" a real check rather than a wish.
// comments are stripped first: a semicolon inside one would end the union early
const typeSrc = (await readFile(SCREEN_TYPE, "utf8")).replace(/\/\/[^\n]*/g, "");
const typeBlock = typeSrc.match(/export type JokerScreen =([\s\S]*?);/);
if (!typeBlock) throw new Error("lib/joker-lines.ts: no JokerScreen union found");
const SCREENS = new Set([...typeBlock[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]));

const setFiles = (await readdir(SETS_DIR)).filter((f) => f.endsWith(".json")).sort();
const sets = [];
for (const file of setFiles) {
  const raw = await readFile(path.join(SETS_DIR, file), "utf8");
  sets.push({ file, ...JSON.parse(raw) });
}
// the ids the app actually ships, for `set.<id>`: a file nobody lists is not a
// fact about the app
const shipped = new Set(
  [...(await readFile(path.join(ROOT, "lib", "sets.ts"), "utf8")).matchAll(/"([a-z0-9-]+)",/g)]
    .map((m) => m[1])
    .filter((id) => setFiles.includes(`${id}.json`)),
);
const scripts = new Set(sets.filter((s) => shipped.has(s.id)).map((s) => s.script));

// ---- the line grammar: `- [id] text ·· tag ·· tag` ----

function parseLine(raw, pool, where) {
  const [head, ...tags] = raw.split("··").map((p) => p.trim());
  const m = head.match(/^-\s*\[([^\]]+)\]\s*(.+)$/);
  if (!m) {
    fail.push(`${where}: malformed line — ${raw.slice(0, 48)}`);
    return null;
  }
  const line = { id: m[1].trim(), text: m[2].trim(), pool };
  for (const tag of tags) {
    if (tag === "once") line.once = true;
    else if (tag === "tier:rare") line.tier = "rare";
    else if (tag.startsWith("when:")) line.when = tag.slice(5).split(",").map((c) => c.trim());
    else if (tag.startsWith("needs:")) line.needs = tag.slice(6).split(",").map((c) => c.trim());
    else if (tag.startsWith("ja:")) line.ja = tag.slice(3).split(",").map((c) => c.trim());
    else if (tag.startsWith("subj:")) line.subj = tag.slice(5).trim();
    else if (tag.startsWith("status:")) line.status = tag.slice(7).trim();
    else fail.push(`${line.id}: unknown tag "${tag}"`);
  }
  return line;
}

const pools = new Map();
{
  let pool = null;
  for (const raw of corpusSrc.split("\n")) {
    const heading = raw.match(/^##\s+(\S+)/);
    if (heading) {
      pool = heading[1];
      if (pool !== ONCE_POOL && !SCREENS.has(pool)) {
        fail.push(`corpus: pool "${pool}" is not a JokerScreen`);
      }
      if (!pools.has(pool)) pools.set(pool, []);
      continue;
    }
    if (!raw.startsWith("- [")) continue;
    if (!pool) {
      fail.push(`corpus: line before any pool — ${raw.slice(0, 40)}`);
      continue;
    }
    const line = parseLine(raw, pool, "corpus");
    if (line) pools.get(pool).push(line);
  }
}

// set blocks: same line shape, already JSON
const setLines = [];
for (const set of sets) {
  if (!set.joker) {
    if (shipped.has(set.id)) warn.push(`${set.id}: no joker block — speaks generic only`);
    continue;
  }
  for (const [key, entries] of Object.entries(set.joker)) {
    if (key !== ONCE_POOL && !SCREENS.has(key)) {
      fail.push(`${set.id}: joker key "${key}" is not a JokerScreen`);
    }
    for (const entry of entries) {
      // sitting in a `once` block is what makes a set line a once-line
      const once = key === ONCE_POOL || entry.once === true;
      setLines.push({ ...entry, once, pool: key, set: set.id, fromSet: true });
    }
  }
}

// ---- checks over every line, wherever it came from ----

const all = [...[...pools.values()].flat(), ...setLines];
const byId = new Map();

/** a token counts as one word; an em dash is not a word */
const words = (text) =>
  text
    .replace(/\{[^}]+\}/g, "token")
    .split(/\s+/)
    .filter((w) => /[\p{L}\p{N}]/u.test(w));

for (const line of all) {
  const where = line.id ?? "(no id)";
  // 1 — id, shape, status
  if (!line.id) fail.push(`${line.pool}: a line with no id`);
  else if (byId.has(line.id)) fail.push(`${line.id}: duplicate id`);
  else byId.set(line.id, line);
  if (!line.status) fail.push(`${where}: no status tag`);
  else if (line.status !== "ship" && line.status !== "draft") {
    fail.push(`${where}: status "${line.status}" is not ship or draft`);
  }
  if (line.fromSet && !line.id?.startsWith(`${line.set}/`)) {
    fail.push(`${where}: a set line's id must be namespaced "${line.set}/..."`);
  }

  // 2 — voice law
  const n = words(line.text).length;
  if (n > MAX_WORDS) fail.push(`${where}: ${n} words (max ${MAX_WORDS})`);
  if (line.text.includes("!")) fail.push(`${where}: carries an exclamation mark`);

  // 6 — tokens he can actually fill
  for (const [, token] of line.text.matchAll(/\{([^}]+)\}/g)) {
    if (token.startsWith("n:")) {
      if (!line.fromSet) fail.push(`${where}: {n:…} is only legal inside a set block`);
    } else if (!TOKENS.includes(token)) {
      fail.push(`${where}: unknown token {${token}}`);
    }
  }

  // 5 — no typed numbers about data
  const hasToken = /\{[^}]+\}/.test(line.text);
  if (!hasToken && !line.needs && !NUMBER_WORD_OK.has(line.id) && NUMBER_WORDS.test(line.text)) {
    fail.push(`${where}: a number with no token and no needs: — "${line.text}"`);
  }

  // 3 — every claim resolves, or the line goes quiet
  for (const need of line.needs ?? []) {
    let holds;
    if (need.startsWith("set.")) holds = shipped.has(need.slice(4));
    else if (need.startsWith("script.")) holds = scripts.has(need.slice(7));
    else holds = facts[need]?.holds === true;
    if (!holds) {
      line.silenced = need;
      silenced.push({ id: line.id, pool: line.pool, need });
      break;
    }
  }
}

// ---- 4: no reachable context may leave a pool with nothing to say ----

// The runtime's twin of this evaluator lives in lib/joker-lines.ts; the two
// must move together. Grammar: flag, !flag, key=value, key!=value, key>n, key>=n.
function holds(cond, ctx) {
  const m = cond.match(/^(!?)([A-Za-z.]+)(?:(>=|!=|>|=)(.+))?$/);
  if (!m) return false;
  const [, not, key, op, rhs] = m;
  const value = ctx[key];
  if (!op) return not ? !value : Boolean(value);
  // a comparison against something the screen cannot know is never true
  if (value === undefined) return false;
  if (op === "=") return String(value) === rhs;
  if (op === "!=") return String(value) !== rhs;
  return op === ">" ? Number(value) > Number(rhs) : Number(value) >= Number(rhs);
}

// The candidate values each numeric key is probed with. Most counts can be
// zero; a word always has a character in it and a set always has a word, so
// probing those at zero would invent a context the app cannot reach.
const NUMERIC = {
  bank: [0, 1, 5],
  shiny: [0, 1, 5],
  base: [0, 1, 5],
  worn: [0, 1, 5],
  earned: [0, 1, 5],
  runsFinished: [0, 1, 5],
  missStreak: [0, 1, 5],
  triesThisWord: [0, 1, 5],
  words: [1, 5],
  chars: [1, 5],
};
const STRINGY = { script: ["hiragana", "katakana", "kanji"], setId: [...shipped] };

for (const [pool, lines] of pools) {
  const live = lines.filter((l) => l.status === "ship" && !l.silenced);
  if (live.length === 0) {
    fail.push(`${pool}: every line is silenced or draft — he would have nothing to say`);
    continue;
  }
  // A pool that is nothing but once-lines is a one-shot variant key (home.wiped,
  // the global once pool): the caller only asks for it when it has a reason and
  // falls back when it is spent. Nothing to keep full.
  if (live.every((l) => l.once)) continue;

  const keys = new Set();
  for (const l of live) for (const c of l.when ?? []) {
    const k = c.match(/^!?([A-Za-z.]+)/);
    if (k) keys.add(k[1]);
  }
  const axes = [...keys].map((key) => {
    if (NUMERIC[key]) return [key, NUMERIC[key]];
    if (STRINGY[key]) return [key, STRINGY[key]];
    return [key, [true, false]];
  });
  const contexts = axes.reduce(
    (acc, [key, values]) => acc.flatMap((ctx) => values.map((v) => ({ ...ctx, [key]: v }))),
    [{}],
  );
  for (const ctx of contexts) {
    const open = live.filter((l) => !l.once && (l.when ?? []).every((c) => holds(c, ctx)));
    if (open.length === 0) {
      const named = Object.entries(ctx).map(([k, v]) => `${k}=${v}`).join(" ") || "any context";
      fail.push(`${pool}: nothing eligible when ${named}`);
      break;
    }
  }
}

// ---- 7, 8, 9: warnings ----

for (const [pool, lines] of pools) {
  const live = lines.filter((l) => l.status === "ship" && !l.silenced);
  const min = DEPTH.find(([keys]) => keys.includes(pool))?.[1];
  if (min && live.length < min) {
    warn.push(`${pool}: ${live.length} line${live.length === 1 ? "" : "s"}, wants ${min}`);
  }
  if (live.length >= 8) {
    const him = live.filter((l) => l.subj === "him").length;
    if (him * 3 > live.length) warn.push(`${pool}: ${him}/${live.length} lines are about him`);
    const ja = live.filter((l) => l.ja).length;
    if (ja * 5 < live.length || ja * 3 > live.length) {
      warn.push(`${pool}: ${ja}/${live.length} lines seed Japanese (wants 1 in 3 to 1 in 5)`);
    }
  }
}

// ---- the bundle ----

const hash = createHash("sha256")
  .update(corpusSrc)
  .update(factsSrc)
  .update(JSON.stringify(sets.map((s) => s.joker ?? null)))
  .digest("hex")
  .slice(0, 12);

const bundle = { hash, pools: {} };
let bundled = 0;
for (const [pool, lines] of pools) {
  const keep = lines.filter((l) => l.status === "ship" && !l.silenced);
  bundle.pools[pool] = keep.map(({ id, text, when, once, tier, ja, subj }) => ({
    id,
    text,
    ...(when ? { when } : {}),
    ...(once ? { once: true } : {}),
    ...(tier ? { tier } : {}),
    ...(ja ? { ja } : {}),
    ...(subj ? { subj } : {}),
  }));
  bundled += keep.length;
}

// ---- the report ----

console.log(`joker-audit · corpus ${hash}`);
for (const [pool, lines] of pools) {
  const keep = lines.filter((l) => l.status === "ship" && !l.silenced).length;
  const quiet = lines.length - keep;
  console.log(`  ${pool.padEnd(18)} ${String(keep).padStart(3)}${quiet ? `  (${quiet} not bundled)` : ""}`);
}
if (setLines.length) {
  console.log(`  set blocks:`);
  for (const line of setLines) {
    console.log(`    ${line.id}${line.silenced ? `  silenced: ${line.silenced}` : ""}`);
  }
}
for (const s of silenced) console.log(`  silenced  ${s.id} — needs ${s.need}, which does not hold`);
for (const w of warn) console.log(`  warn      ${w}`);
for (const f of fail) console.log(`  FAIL      ${f}`);

const setBundled = setLines.filter((l) => l.status === "ship" && !l.silenced).length;
console.log(
  `${bundled} global + ${setBundled} set lines bundled, ${silenced.length} silenced, ` +
    `${warn.length} warning${warn.length === 1 ? "" : "s"}`,
);

if (fail.length) {
  console.error(`joker-audit: ${fail.length} failure${fail.length === 1 ? "" : "s"}`);
  process.exit(1);
}

await writeFile(OUT, `${JSON.stringify(bundle, null, 2)}\n`);
