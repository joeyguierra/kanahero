# kanahero v5 — build map (2026-09-17)

From `KanaHero v5 Handoff.dc.html`. What has to exist for v5 to ship, in build order. Companion: `paid-tier-prep.md`.

## 0. Canvas corrections before build (send back to Claude Design)
1. **S1 selection model + `START SESSION` — creator decision 2026-09-17, stands.** Rows select, the CTA commits. Fix the SPEC sheet's "no global CTA" line to match the drawings.
2. **21 = deck ceiling — creator decision, stands.** Station ships at 9 (see §3); the S8 full-deck screen is the layout ceiling, not the station set. Fix S3/S6b/S8 to one consistent set.
3. **S7b kanji reveal says "one kanji at a time at full canvas size."** Wrong — the decision is one canvas, whole word, cells at canvas-width ÷ N for kanji exactly as for kana. 改札 renders in two cells.
4. **Result layout: ship the grid.** The three-fans-of-seven alternative clips kanji by its own admission. Fan ≤5 cards, grid from 6.
5. **S6c offline = inert SAVE is a greyed feature in spirit.** Honest split: kana user-sets need no network (kana strokes are bundled) → S6c works fully offline on the hiragana/katakana decks. Kanji user-sets need stroke data → connection required, and that is the true reason for the status line, shown only on the kanji deck's S6c.
6. **Missing states:** S6b at N/N (shows the hand, no DEAL); S8 card-tap detail (the face large); S2/S3 after a user set is saved (row under YOUR SETS); cold-start S1 with everything at 0; a CREDITS screen (see §7).

## 1. Storage — local first, Supabase from day one (creator decision 2026-09-17)
Supabase is initialised in v5. **Law:** it is a mirror, never the source of truth for drilling. Every screen works with no network and no session; the free tier never requires sign-in. Local stores below stay exactly as designed; Supabase syncs them when a session exists.
Tables (RLS on, owner = auth.uid()):
- `sets` — `id uuid, owner uuid, name, glyph, script, origin('user'), words jsonb, created_at, updated_at, deleted_at`
- `progress` — `owner uuid, set_id text, word_id text, tries int, rarity text, earned_at timestamptz` (PK owner+set_id+word_id; platform set ids are text ids, user sets their uuid)
- `bank_items` — `id uuid, owner uuid, note text, captured_at, storage_path text` (photos to Supabase Storage, private bucket; upload is opt-in, never automatic)
- `profiles` — `id uuid, tier text default 'free'` — the only place `lib/tier.ts` will ever read from.
Sync: last-write-wins on `updated_at`; local is authoritative until the first successful push. Auth: magic link only, no passwords, no social buttons drawn — and no sign-in UI ships in v5; the client is initialised, the auth screen is a later build.
- `kanahero:v1` (localStorage, versioned blob) — existing character progress. Add `joker[setId][wordId] = {tries, rarity, earnedAt}`.
- `kanahero:sets` (localStorage) — user sets, `{id, name, glyph, script, origin:"user", words:[…], createdAt}`. Platform sets are never stored here; they ship as JSON.
- `kanahero-bank` (IndexedDB) — unchanged.
- `lib/tier.ts` — returns `"free"`; nothing else reads entitlement.
Migration: bump the blob version; a missing `joker` key is an empty object. Export ZIP gains `sets.json` + `progress.json` so a user's sets and cards leave with their photos.

## 2. Set schema (one file per platform set, `public/sets/<id>.json`)
```
{ "id":"everyday-hiragana", "name":"EVERYDAY WORDS", "glyph":"あ", "script":"hiragana", "origin":"platform",
  "words":[ {"word":"ありがとう","reading":"ありがとう","romaji":"arigatou","meaning":"thank you"} ] }
```
Rules: kana sets have `word === reading`; ≤5 kana per word; every kana set includes small kana and a long vowel; kanji sets carry a `place` glyph. Max 21 words. IDs are stable forever (progress keys on them).

## 3. Starter content (draft — confirm every reading before it ships; numbers in the UI must match the file)
**everyday-hiragana (10, written to `public/sets/`):** ありがとう · おはよう · こんにちは · すみません · ください · ちょっと · きょう · おやすみ · いいえ · はい
 → small kana in ちょっと/きょう; long vowels in ありがとう/おはよう/きょう. (こんにちは is 5 kana and its は reads "wa" — a good honesty line for the Joker.)
**countries-katakana (12, written to `public/sets/`):** アメリカ · カナダ · フランス · ドイツ · イタリア · スペイン · タイ · インド · ブラジル · メキシコ · フィリピン · ベトナム
 → small kana in フィリピン; long vowel none — consider swapping メキシコ for オーストラリア? No: 7 kana, over the cap. Keep as listed; note the cap excludes 日本/中国/韓国 (kanji), which is honest.
**station-kanji (9, creator-sourced 2026-09-17):** 出口 · 入口 · 新幹線 · 禁煙 · 東口 · 中央口 · 西口 · 南口 · 北口
 → written to `public/sets/station-kanji.json`. 12 distinct characters, so the KanjiVG vendor pulls 12 files. Five words share 口 — the reveal will teach the component by repetition, which is a feature; the Joker can say so once.

## 4. Stroke data
- Kana: bundled (`public/strokes/`, 142 files, strokesvg). Covers every kana in any kana set — user or platform — so kana sets are fully offline.
- Kanji: **KanjiVG is not vendored yet.** Write `scripts/fetch-kanjivg.mjs`: for every distinct character across kanji platform sets, fetch the KanjiVG SVG, normalize viewBox 109→1024 and stroke weight to match strokesvg (SPEC.md §stroke data), write to `public/strokes/`, vendor the KanjiVG license. Precache the result. User kanji sets fetch at save time (the connection requirement) and cache into the SW.

## 5. Code
- `lib/joker.ts` — dealer: queue from unearned words, `miss()` to tail with gap 2, seeded shuffle, rarity from tries. Line table keyed by screen × state (the JOKER sheet is the source; ship as `lib/joker-lines.ts`).
- `components/Card.tsx` — one component, two prompt faces, four earned faces, four sizes.
- Reveal renderer — lay out N characters in cells of canvas-width ÷ N, small kana at reduced size; used for kanji words too. Only new canvas code.
- Screens: S2/S2k/S3 (deck), S6b, S6c, S7/S7b/S7c, S8 (grid). S1 rewritten to rows-only. S4/S5 get the Joker header only.
- Service worker: precache `sets/*.json` + new strokes; bump version.
- e2e: extend `e2e-loop.mjs` for a set round; add a user-set create → drill offline test for kana.

## 6. Assets
- Joker mascot, final art (placeholder is not final). Deliver as SVG, single color + strike, ≤ 8 KB; 78px and 110px must both read.
- Card stock textures (foil stripe, worn weave) as CSS, not images.

## 7. Attribution — what is actually required
Today the app ships **strokesvg (MIT) with kana derived from Klee One (SIL OFL 1.1)**. KanjiVG is not shipped yet, so naming it is premature — remove until kanji strokes are vendored.
- MIT: include the license text with the distribution. `public/licenses/` satisfies it. No UI credit required.
- OFL: include the license text; do not sell the font data alone; do not use "Klee One" in the product name. No UI credit required.
- KanjiVG (when shipped): CC BY-SA **requires attribution in a reasonable manner** — a visible credit with the license name and a link, and the derived stroke files stay BY-SA.
Decision: S1's footer becomes one word, `CREDITS`, opening a small S9 CREDITS screen that lists what ships with license and link. Required lines only; no font credits for the UI typefaces beyond what their licenses demand (Archivo, JetBrains Mono, Noto: OFL — license text in `public/licenses/`, no UI line needed).

## Build order
1 storage + schema → 2 platform sets JSON (kana) → 3 Card + reveal renderer → 4 deck screens + S6b/S7/S8 → 5 S6c kana offline → 6 KanjiVG vendor script + station set → 7 S1 rewrite + CREDITS → 8 SW + e2e → 9 README ("no account" line = free tier) → 10 mascot art drop-in.
