// The audit, audited (SPEC-v5b §6.5–6.7). Run: node scripts/e2e-joker.mjs
//
// joker-audit.mjs is the thing standing between a false line and a user, so
// its failures have to be real failures. Every check below feeds it a corpus
// that is wrong in exactly one way and asserts on what comes back — and, just
// as important, asserts on the two different KINDS of wrong:
//
//   a stale claim  → the line is silenced, the build still passes
//   an empty pool  → the build fails, because he would have nothing to say
//
// No browser. The fixtures are written into a throwaway directory and the real
// script is pointed at it through KANAHERO_JOKER_DIR, so the repo's own corpus
// is never touched.

import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);
const AUDIT = path.join(import.meta.dirname, "joker-audit.mjs");
const REAL = path.join(import.meta.dirname, "..", "joker");

const facts = await readFile(path.join(REAL, "facts.json"), "utf8");
const corpus = await readFile(path.join(REAL, "corpus.md"), "utf8");

const work = await mkdtemp(path.join(tmpdir(), "kanahero-joker-"));
process.on("exit", () => void rm(work, { recursive: true, force: true }));

/** run the audit against one fixture; never throws, always reports */
async function audit({ corpus: md = corpus, facts: json = facts }) {
  await writeFile(path.join(work, "corpus.md"), md);
  await writeFile(path.join(work, "facts.json"), json);
  try {
    const { stdout } = await run("node", [AUDIT], {
      env: { ...process.env, KANAHERO_JOKER_DIR: work, KANAHERO_JOKER_OUT: path.join(work, "out.json") },
    });
    return { ok: true, out: stdout };
  } catch (err) {
    return { ok: false, out: `${err.stdout ?? ""}${err.stderr ?? ""}` };
  }
}

/** the shipped corpus with one line bolted on, in the home pool */
const withLine = (line) => corpus.replace("## home\n", `## home\n${line}\n`);

// --- 1. the six ways a line can be wrong enough to stop a build ---

const broken = [
  ["twelve words", "- [fx.long] One word two words three words four words five words six words here ·· needs:feature.bank ·· status:ship", /12 words|13 words|14 words/],
  ["an exclamation mark", "- [fx.bang] Pick a deck, quickly! ·· status:ship", /exclamation/],
  ["a typed number", "- [fx.five] Five of these are worth having. ·· status:ship", /number with no token/],
  ["an unknown fact", "- [fx.needs] A line that leans on nothing. ·· needs:rule.notAThing ·· status:ship", /silenced/],
  ["an unknown token", "- [fx.token] {sparkle} of them, at least. ·· status:ship", /unknown token/],
  ["no status", "- [fx.bare] A line nobody has signed off.", /no status/],
];

for (const [what, line, pattern] of broken) {
  const res = await audit({ corpus: withLine(line) });
  if (what === "an unknown fact") {
    // the one that is not an authoring error: the claim went stale, so the
    // line goes quiet and the build carries on
    assert.ok(res.ok, `${what}: a stale claim must not fail the build\n${res.out}`);
    assert.match(res.out, pattern, `${what}: and it must be named in the report`);
  } else {
    assert.ok(!res.ok, `${what}: should have failed the build\n${res.out}`);
    assert.match(res.out, pattern, `${what}: reported the wrong reason`);
  }
  console.log(`audit rejects: ${what}`);
}

// an unknown token is an unknown token, {minted} included — the rename is not
// a thing the corpus may quietly keep saying (SPEC-v5b §10.3)
{
  const res = await audit({ corpus: withLine("- [fx.minted] {minted} cards, all told. ·· status:ship") });
  assert.ok(!res.ok, "a corpus still saying {minted} must fail");
  assert.match(res.out, /unknown token \{minted\}/);
  console.log("audit rejects: the pre-rename {minted} token");
}

// --- 2. a feature goes away: the lines about it go quiet, nothing else ---

{
  const off = facts.replace(
    /"feature\.offline": \{\s*"holds": true/,
    '"feature.offline": {\n      "holds": false',
  );
  assert.notEqual(off, facts, "the fixture did not actually flip feature.offline");
  const res = await audit({ facts: off });
  assert.ok(res.ok, `turning a feature off must not fail the build\n${res.out}`);
  assert.match(res.out, /home\.15/, "the silenced line is named");
  assert.match(res.out, /feature\.offline/, "and so is the fact that silenced it");
  const bundle = JSON.parse(await readFile(path.join(work, "out.json"), "utf8"));
  assert.ok(
    !bundle.pools.home.some((l) => l.id === "home.15"),
    "and it is not in the bundle he draws from",
  );
  console.log("audit silences: a line whose feature is gone, and says which fact did it");
}

// --- 3. a rule goes away and takes a whole screen's voice with it ---

{
  const off = facts.replace(
    /"rule\.allOrNothing": \{\s*"holds": true/,
    '"rule.allOrNothing": {\n      "holds": false',
  );
  assert.notEqual(off, facts, "the fixture did not actually flip rule.allOrNothing");
  const res = await audit({ facts: off });
  assert.ok(!res.ok, `a rule that empties a pool must fail the build\n${res.out}`);
  assert.match(res.out, /abandon.*nothing to say|nothing to say.*abandon/s, "abandon goes silent");
  for (const pool of ["earned.shiny", "collection.empty"]) {
    assert.match(res.out, new RegExp(pool.replace(".", "\\.")), `${pool} goes silent too`);
  }
  console.log("audit fails: a rule change that would leave a screen speechless");
}

// --- 4. and the shipped corpus, as it actually stands ---

{
  const res = await audit({});
  assert.ok(res.ok, `the shipped corpus must pass its own audit\n${res.out}`);
  const bundled = res.out.match(/(\d+) global \+ (\d+) set lines bundled, (\d+) silenced/);
  assert.ok(bundled, "the report ends with a count of what shipped");
  assert.ok(Number(bundled[1]) > 50, "the corpus is all there");
  assert.equal(Number(bundled[3]), 0, "and nothing in it is silenced today");
  console.log(
    `shipped corpus: ${bundled[1]} global + ${bundled[2]} set lines bundled, ${bundled[3]} silenced`,
  );
}

console.log("\nALL CHECKS PASSED");
