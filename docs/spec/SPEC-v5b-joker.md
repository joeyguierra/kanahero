# kanahero — build spec v5b · the Joker's corpus, its engine, and the audit

**Status: READY TO BUILD (2026-09-17).** This is SPEC-v5a §8's "new dialogue", part 1: the machinery
and the first real pool. It is **not** the full corpus — only `home` has been written and approved.
**Base:** `fbe1645` (`add joker line`). ⚠️ The tree is dirty at that commit — `globals.css`,
`Card.tsx`, `Joker.tsx`, `SetScreen.tsx` carry uncommitted work. Commit or stash it before step 1;
do not fold it into these commits.
**Governing docs:** `docs/design/joker-character.md` (the bible — read its amendment block first,
then §5 and §7). Where this file and the bible disagree on behavior, this file wins; on wording,
the bible wins.
**Next.js:** read `AGENTS.md` first — this is Next 16; check `node_modules/next/dist/docs/` before
touching framework APIs.

## 0. Scope
**In this build**
1. Fix four false lines shipping today (§1) — first, on their own commit, before any machinery.
2. `joker/corpus.md` + `joker/facts.json` become the source of truth; `scripts/joker-audit.mjs`
   compiles and polices them (§2–3).
3. Set-specific lines move into the set JSON (§4).
4. Runtime: pools, conditions, tokens, shuffle bag, bag reconciliation (§5).
5. e2e stops asserting on his wording (§6).

**Not in this build:** writing any pool other than `home` (every other key migrates as a pool of
one — interim, by design); a gloss UI for seeded Japanese; any change to `Joker.tsx`'s typing
animation or art; generation for user-created sets (online / paid-tier — `paid-tier-prep.md`);
the rare tier's odds tuning beyond the default in §5.

## 1. The truth fixes — commit these first
Found by audit on 2026-09-17 (bible §7). Three are stale facts; one says the opposite of the code.

| # | today | problem | fix |
| :-- | :-- | :-- | :-- |
| 1 | `kuchi`: "Five of these share 口." | STATION has **seven** 口 words (出口 入口 東口 中央口 西口 南口 北口). A false number, shipped. | Number becomes a token: `{n:口} of these share 口. You'll know it by the third.` → renders "Seven of these…". Never a literal again (§3, check 5). |
| 2 | `pickOnce()` in `Round.tsx` fires `kuchi` on **any** kanji word containing 口 | Fires in `test-kanji` (lone 口) where the line is nonsense — and being a once-line, it is then spent and never fires in STATION. | The line moves into `station-kanji.json` (§4). `pickOnce`'s `includes("口")` branch is deleted; set-scoped once-lines carry their own trigger. |
| 3 | `deck.kanji`: "No alphabet here. Only words, only places you've been." | DAILY BASICS kanji is single characters (日 月 火…) about nature and people. False twice since `ef4124b`. | "No alphabet here. Every character means something. Pick a set." |
| 4 | `abandon`: "Leave now and this run's cards leave with you." | Says the cards go *with* the user. They are discarded. | "Leave now and the cards stay with me." (`e2e-loop`'s `/Leave now/` still matches.) |

Also: `deck.katakana`'s "Countries today." is a set-specific claim on a script-level screen — true
only while COUNTRIES is the sole katakana set. Replaced with "Same sounds as hiragana, sharper
strokes. Characters or words." Fixes 3, 4 and this one are already in `joker/corpus.md`.

**Seen-key migration for fix 1–2:** delete the legacy id `kuchi` from `kanahero:v1.joker.seen` on
first load. The old line was false; every user gets the true one once. `wholeWord` maps to
`once.wholeWord` (already-seen stays seen).

**For step 1 only** these are plain string edits in `lib/joker-lines.ts` + the `pickOnce` guard
(`set.id === "station-kanji"`) + a computed count — the smallest change that stops the app lying.
The rest of the build then replaces that file.

## 2. Source of truth
```
joker/corpus.md     every global line. Human-edited, cold-read in place. Already written.
joker/facts.json    declared facts (rules, features). Already written — 12 entries, each with its proof.
public/sets/*.json  set-specific lines, under a `joker` key (§4)
        ↓  scripts/joker-audit.mjs
lib/joker-corpus.generated.json   what the app imports. Git-ignored. Never hand-edited.
```
**Do not retype any line.** `joker/corpus.md` was generated from the approved draft and from the
shipped table by script; move text only by script or by copy. It holds 60 lines, 27 pools.

Line grammar: `- [id] text ·· tag ·· tag`. Tags:
- `status:ship|draft` — **required.** Only `ship` is bundled.
- `when:` — comma-separated, all must hold. Grammar: `flag`, `!flag`, `key=value`, `key!=value`,
  `key>n`, `key>=n`. Keys in §5.
- `once` — retired forever after one showing. `tier:rare` — see §5.
- `needs:` — comma-separated fact ids. `ja:` seeded Japanese. `subj:you|app|him`.
- An HTML comment or a line not starting `- [` is ignored. `## key` opens a pool; `key` must be a
  `JokerScreen` or `once`.

## 3. The audit — `scripts/joker-audit.mjs`
Plain Node, no dependencies, same style as `gen-sw.mjs`. Wire it **before** the Next build:
`"build": "node scripts/joker-audit.mjs && next build && node scripts/gen-sw.mjs"`, plus
`"joker": "node scripts/joker-audit.mjs"` and a `predev` hook so `next dev` never runs on a stale
bundle.

| # | check | on failure |
| :-- | :-- | :-- |
| 1 | duplicate or malformed id; pool key not a `JokerScreen`; missing `status` | **fail** |
| 2 | voice law: ≥ 12 words (a `{token}` counts as one), or contains `!` | **fail** |
| 3 | every `needs:` resolves — declared in `facts.json` with `holds: true`, or derived: `set.<id>` (a file in `public/sets/` that is also in `PLATFORM_SET_IDS`), `script.<name>` (at least one such set has that script) | **line silenced**: excluded from the bundle, listed in the report. Not a failure. |
| 4 | a `JokerScreen` key whose pool is **empty** after silencing, for some reachable context | **fail** — he may say less, never nothing |
| 5 | a digit or number-word (`one`…`twenty`, case-insensitive) in a line with no `{token}` and no `needs:` | **fail**. Allow-list by id for idiom ("One character, one box", "first try" is not a number-word). |
| 6 | every `{token}` used is one §5 defines | **fail** |
| 7 | pool depth under its frequency-tier minimum (bible §5 table) | **warn only in this build** — every pool but `home` is a pool of one on purpose |
| 8 | per pool of ≥ 8 lines: `subj:him` > 1 in 3, or `ja:` outside 1-in-3 … 1-in-5 | warn |
| 9 | a set in `PLATFORM_SET_IDS` with no `joker` block | warn: "speaks generic only" |

Check 4's "reachable context" is cheap to do honestly: for each pool, evaluate the `when:` sets
against the small product of flags that pool can see, and fail if any combination leaves zero
eligible non-`once` lines. `home` today passes (23 unconditional lines).

Report to stdout: counts per pool, silenced lines with the fact that silenced them, warnings.
Exit non-zero on any **fail**.

## 4. Set-scoped lines
`WordSet` gains an optional `joker` block. Same line shape as the bundle, keyed by screen, plus
`once` entries that carry a trigger:
```jsonc
// public/sets/station-kanji.json
"joker": {
  "once": [
    { "id": "station-kanji/kuchi",
      "text": "{n:口} of these share 口. You'll know it by the third.",
      "trigger": { "wordIncludes": "口" }, "ja": ["口"], "status": "ship" }
  ]
}
```
- Ids are namespaced `<setId>/<name>` so a set can never collide with the global corpus.
- Pool for a set-scoped screen (`set`, `round.*`, `reveal.*`, `earned.*`, `result`, `collection*`)
  = global pool ∪ the active set's pool. Set lines are drawn at **3×** weight — specificity is
  the character (bible: the Dealer principle).
- Once-lines keep today's contract: picked when the prompt is dealt, spent only once actually
  shown (`peek` / `markSeen`). Order of precedence on S7 prompt is unchanged:
  missed-line → eligible once → pool.
- The audit validates set blocks with the same checks as the corpus. `{n:X}` is only legal
  inside a set block.
- This build adds the block to `station-kanji.json` only. The other four sets will warn (check 9).

## 5. Runtime — `lib/joker-lines.ts` rewritten
Public surface, replacing `jokerLine` / `setLine` / `revealLine` / `resultLine` / `peekOnce`:
```ts
peekLine(screen: JokerScreen, ctx: JokerContext): { id: string; text: string }
commitLine(id: string): void      // advance the bag / spend a once — call when actually shown
```
Keep today's peek-then-spend split: `peekLine` is pure and safe to call during render;
`commitLine` is the only thing that writes. A `useJokerLine(screen, ctx)` hook wraps both — pick
once per mount (`useState` initializer), commit in an effect. A re-render must never re-draw:
`Joker.tsx` restarts its typing whenever `line` changes.

**Hydration:** this is a static export. The line depends on `localStorage`, so it cannot be
chosen on the server. Follow whatever pattern `progress`/`bank` already use for their server
snapshot; the constraints are (a) no hydration mismatch warning, (b) **no layout shift** — the
panel reserves its height before the line arrives, as `Joker.tsx`'s header comment already demands.

**Context** — `JokerScreen` gains `set` and `result`; drop `reveal.kana`'s dead static entry.
| key | source |
| :-- | :-- |
| `firstEver` | no `kanahero:v1` blob and empty bags at load |
| `wiped` | `progress.wiped` (unchanged one-shot) |
| `runsFinished` | max row-sum over any word in `progress.joker` — every finished run adds exactly one copy per word, so this is exact, not an estimate |
| `shiny` `base` `worn` | totals across all sets, from `setTotals` |
| `bank` | `bank.captures.length`; lines needing it are ineligible until `bank.ready` |
| `script` `setId` `words` | the active set |
| `chars` `minted` `missStreak` `triesThisWord` | round state, passed by the caller |

**Tokens** — `{bank} {shiny} {minted} {words} {chars} {n:X}`. All render through the existing
`count()` so he keeps counting in words ("Seven"), falling back to digits past twenty-one.
Capitalized at the start of a line, lowercase elsewhere. **A token whose value is unavailable
makes the line ineligible** — never render a blank, a zero he did not mean, or `NaN`.

**Selection**
1. Eligible = pool (∪ set pool) filtered by `when`, minus spent `once`, minus unavailable tokens.
2. An eligible `once` line wins outright (first-launch intro, the wipe line).
3. Else roll rare: 1 in 40, if any eligible `tier:rare` line exists. (None ship in this build.)
4. Else draw from the **shuffle bag** for that screen.

**Shuffle bag** — per screen, persisted under `kanahero:v1.joker.bags` as
`{ v: <corpus hash>, bags: { [screen]: string[] } }` — an ordered list of **ids still to come**.
- Draw = the first id in the bag that is eligible *right now*; remove it. Ineligible ids stay
  where they are, so a conditional line is not burned while its condition is false.
- Empty (or nothing eligible left in it) → refill with every `ship` id of the pool, shuffled with
  the mulberry32 already in `lib/joker.ts` (export it; do not write a second one). Guard: the
  refill may not open on the id that was drawn last.
- **Reconcile on corpus hash change:** drop ids that no longer exist; insert ids that are new
  **at the front**. After an update the user meets the new lines first — that is the entire
  visible payoff of shipping them.
- Defensive like every other reader here: malformed storage → fresh bags, never a throw. No
  storage at all → he draws at random and occasionally repeats; not worth failing over.

`kanahero:v1.joker.seen` keeps holding spent `once` ids (with the §1 migration). Export ZIP is
unchanged — bags and seen are cosmetic state and are not exported.

## 6. e2e — stop asserting on his wording
`e2e-loop.mjs` pins exact Joker text, and one of those pins is **already stale**: it expects
`"Pick a deck. I'll deal, you write."` while `fbe1645` ships `"こんにちは. Pick a deck, …"`. With
pools, every text assertion becomes a coin flip.
- `Joker.tsx` takes an optional `lineId` and renders it as `data-line` on `.jokerPanel`. No other
  change to the component.
- Replace text assertions with id assertions: `home.wiped.01` shown once, then an id matching
  `/^home\.\d+$/`; `collection.empty.01`; `abandon.01`.
- New assertions:
  1. first-ever load shows `home.32` (the intro); second load never does.
  2. 40 consecutive home loads: no id repeats until the eligible pool has been exhausted.
  3. with a bag persisted, bump the corpus hash and add a fake id → it is the next line shown.
  4. STATION run: the first 口 word shows `station-kanji/kuchi` and the text contains "Seven";
     a `test-kanji` run never shows it.
  5. `joker-audit` exits non-zero on a fixture corpus containing: a 12-word line, a `!`, a bare
     "Five", an unknown `needs`, an unknown token, an empty pool. One fixture per check.
  6. flip `feature.offline` to `holds: false` in a fixture → `home.15` is absent from the bundle,
     the build still passes, and the report names the line and the fact that silenced it.
  7. flip `rule.allOrNothing` instead → the build **fails** on check 4: `abandon`, `earned.*` and
     `collection.empty` are pools of one and would go empty. That is the intended behavior — a
     rule change that would leave him speechless somewhere must be answered with new lines, not
     shipped around.
- `e2e-offline.mjs`: a home load with the network cut still shows a line (the bundle is in the
  precache because it is imported, not fetched — confirm, do not assume).

## 7. Build order
1 truth fixes (§1), own commit → 2 audit script + `package.json` wiring, compiling the existing
`joker/` files → 3 runtime rewrite (§5) with every call site moved to `useJokerLine` → 4 set
block + `station-kanji.json` (§4), delete `pickOnce`'s hard-coded branch → 5 `data-line` + e2e
(§6) → 6 delete dead code: `LINES`, `ONCE`, `WORDS` stays (now used by tokens), `setLine`,
`revealLine`, `resultLine`. Commit per step. `npm run lint`, `npm run build`, `npm run e2e` clean.

## 8. Report back
Commits; the audit's full stdout; anything skipped and why; and **the measured number of lines
bundled vs. silenced** — that number is video material and must come from the tool, not memory.

## 9. Noticed, not in scope — creator to decide
- `test-kanji` ("TEST", three characters) is in `PLATFORM_SET_IDS` and ships to users. SPEC-v5a's
  e2e expects the kanji row to read `2 SETS`; with TEST listed it would read three. Dev fixture
  or real set?
- `docs/design/joker-corpus.md` is now history (draft 1, draft 2 and the cold-read verdicts).
  All further line work happens in `joker/corpus.md` as `status:draft` → `status:ship`.

---

## 10. Addendum — "minted" becomes "earned" (2026-09-17)
*Creator decision. "Minted" is trading-card jargon that means nothing to someone here to learn kana. The UI says **EARNED**; the code follows now, while the codebase is small.*
**This section overrides the word "minted" / `MINTED` / `{minted}` wherever it appears in this file (§5 context table and tokens, §6), in `SPEC-v5a.md` (§3 S8, §4, §6, and the §9 reveal addendum), and in `docs/design/joker-character.md`.** Read every one of them as the renamed form below. Do not edit the older spec files; this section is the record.

### 10.1 What the user sees
| where | was | becomes |
| :-- | :-- | :-- |
| S8 count label | `10 MINTED` | `10 EARNED` |
| S8 reveal mount state (SPEC-v5a §9.3) | `0 MINTED` | `0 EARNED` |
| `result.01` | `{minted} cards minted, {shiny} shiny. Deal again whenever.` | `{earned} cards earned, {shiny} shiny. Deal again whenever.` |
| `result.02` | `{minted} cards minted. Deal again whenever.` | `{earned} cards earned. Deal again whenever.` |
| `home.29` | `Nothing minted yet. Finish one run and the cards stay.` | `Nothing earned yet. Finish one run and the cards stay.` |

Keep each line's **id** (`result.01`, `result.02`, `home.29`) — the meaning is unchanged, only the word (corpus rule: ids are forever). SPEC-v5a §1.6 still holds: nothing on S7 says "earned" during a run; the word appears only once the run has finished.

### 10.2 Code names
| was | becomes |
| :-- | :-- |
| `mintRun()` (`lib/joker.ts`) | `earnRun()` |
| `MintedCard` (`lib/joker.ts`, imported by `Card.tsx`, `Round.tsx`) | `EarnedCard` |
| token `{minted}` and the context field `minted` (§5, `joker-audit.mjs` known-token list) | `{earned}` / `earned` |
| `counts.minted` in `joker-character.md`'s context shape | `counts.earned` |
| `/MINTED/` assertions in `e2e-loop.mjs`, `e2e-offline.mjs` | `/EARNED/` |

- Rewrite every comment and assertion message that says mint / minted / mints in `lib/`, `components/`, `app/`, `scripts/` and `joker/` to earn / earned / earns (e.g. `// a finished run earns one copy per word`). `joker/corpus.md` line 8's "mint a new one" becomes "make a new one".
- **Do not rename** `Progress.earned` or the `earned` array in the `kanahero:v1` blob. That field is the character drill's written-from-memory set, it is a storage key, and it predates this. Where both appear in one file, a one-line comment says which is which; the token `{earned}` counts **cards earned this run**, never characters.
- No storage change, no version bump — "minted" was never persisted.
- `docs/design/joker-corpus.md` and older specs (`SPEC.md`, `SPEC-v3.md`, `SPEC-v5.md`) are history: leave them.

### 10.3 Order and checks
- One commit, **after §7 step 1 (truth fixes) and before step 3 (runtime rewrite)**, so the token is born as `{earned}`. If SPEC-v5a §9 (the reveal) is built later, it uses `EARNED` from the start.
- `grep -rni mint lib components app scripts joker` returns nothing.
- `npm run lint`, `npm run build`, `npm run e2e` clean; `joker-audit` passes with `{earned}` as a known token and fails on a fixture still using `{minted}` (unknown token, check as in §6.5).
