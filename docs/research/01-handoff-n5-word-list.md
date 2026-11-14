# Research handoff 01 — the N5 word list, week one (2026-11-14)

For the research agent. You are asked for two things: a rule for choosing and ordering the
words a beginner writes each day, and the first week's list built by that rule. The app's
builder will turn the list into data; you do not write code.

## 1. Read first

| File | Why |
| :-- | :-- |
| `docs/HANDOFF.md` | What the app is and where it is going (N5 → N3, daily drill). |
| `docs/results.md` | The learner's measured baseline. The list is judged against this. |
| `docs/research/00-survey.md` | The first research pass, and its confidence legend (A/B/C). Use the same legend. |
| `docs/spec/SPEC-v7-skeleton.md` | The current build: the loop, the scheduler, the review ladder. |

## 2. What the app does with a word

The learner sees a prompt, the prompt disappears, he writes the word by hand from memory, the
app draws the correct strokes over his ink, and he grades himself GOT IT or MISSED. A word he
gets right comes back after 1, 3, 7, 14, then 30 days. A word he misses comes back tomorrow.

This is production by hand, not recognition. Every word on the list will be handwritten many
times, so a word's written length and stroke load are real costs.

## 3. Decisions already made (do not reopen)

> **Amended 2026-11-14 05:23 (alignment with the research agent).** The daily rule is now:
> **one pile, floating size, 30 words max.** The pile is every due review and miss first,
> then up to 10 new words in whatever room is left under 30; no new words on a day the reviews
> fill it. Extra work means more new words until the pile reaches 30, never past it. If more
> than 30 are due, oldest first and the rest slide a day. This replaces "10 new a day, up to 30
> new" below and the built "0 new when due > 20" rule (SPEC-v7 D4). 30 is load arithmetic, not a
> finding; revisit on the first measured drill day. The list stays 210 in one order; the first
> 70 are week one if nothing is missed, the rest are the following weeks, not a maximum week.
> Added constraint: every `meaning` is unique across the list (kana words prompt by meaning alone).

- **No sets.** The app has one queue. It decides what the learner writes each day; he does not
  choose a deck. The old sets in `public/sets/` are retired unless your list includes their words.
- **The learner is a beginner at N5.** Other levels come later; write the rule so it can be
  rerun for N4 and up.
- **10 new words a day.** If he keeps working he can take more, up to **30 new words in one
  day**. Reviews of earlier words come on top.
- **Week one only: 7 days.** That is 70 words at the normal pace and 210 if he takes the
  maximum every day.
- **Every new word is shown once before he writes it** (the written form drawing itself, with
  its reading and meaning). Nothing is assumed known. He cannot skip a word.
- **Each day mixes hiragana, katakana and kanji.**
- **The prompt says which script is being asked for**: `hiragana`, `katakana` or `kanji`.
  A word asked in hiragana that also has a kanji form shows that kanji form in the answer,
  with the meaning.
- **The nine words the learner did not know at baseline must be on the list:**
  新しい · 電気 · 外 · つける · つとめる · ゆうべ · おととい · くらい · のる.
- **The measure of success** is the JLPT N5 文字・語彙 mock in `docs/results.md`, re-taken.

## 4. What to research

### 4.1 Which words
What makes a word worth a beginner's first week of handwriting? Find what the evidence
supports for selection: frequency (and in which corpus), usefulness in conversation, how the
JLPT N5 vocabulary and kanji are actually tested, and how well-established any "N5 list" is.
Say plainly where a source is a community compilation and not an official list.

"Proven" here means the *selection rule* rests on evidence. No source proves an individual
word. Do not present one as if it did.

### 4.2 Which form is asked
Many N5 words have a kanji form a beginner cannot yet write (たべる / 食べる). For each word
decide whether the learner is asked for the kanji form or the hiragana form, and give the rule.
A starting point to test, not a conclusion: ask for kanji only when every kanji in the word is
on the N5 kanji list. Find out what is known about when beginners should start writing a
word's kanji.

### 4.3 What order
The list is **one ordered list**, not seven fixed bundles: if the learner takes 30 words on
Monday, Tuesday starts at word 31. So the ordering has to hold in any run of ten.

Find what the evidence says about:
- introducing similar items close together (same meaning field, look-alike kanji, look-alike
  or sound-alike kana) versus apart;
- simple before complex (stroke count, shared components, word length);
- how to mix the three scripts, and in what proportion, across a run of ten.

### 4.4 The load
With 10 new words a day and the ladder above, the learner writes about 10 reviews a day from
day 2 and 20 a day from day 5, on top of the new words. At 30 new a day the numbers triple.
Say what the evidence supports for a beginner's daily new-word load in a handwriting task, and
whether 10 and 30 are defensible.

## 5. What to deliver

Two files in `docs/research/`.

### 5.1 `01-n5-word-list.md` — the report
- The selection rule, the form rule and the ordering rule, each stated in a few sentences so
  it can be applied again for week two and for N4.
- For each rule: the finding it rests on, the source, and a confidence grade (A/B/C as in the
  survey). Mark anything you could only read as an abstract.
- What you looked for and did not find.
- Anything in section 3 the evidence argues against. Say so; do not work around it silently.

### 5.2 `01-n5-week1-words.json` — the list
An array of 210 objects in drill order. The first 70 must work as a complete week on their
own, with the nine baseline words inside those 70.

```json
{
  "order": 1,
  "write": "みず",
  "ask": "hiragana",
  "reading": "みず",
  "kanji": "水",
  "romaji": "mizu",
  "meaning": "water",
  "pos": "noun",
  "source": "which list or corpus put it here",
  "note": ""
}
```

- `write` — exactly what the learner handwrites.
- `ask` — `hiragana`, `katakana` or `kanji`. A word written with kanji plus kana (新しい) is `kanji`.
- `reading` — the full reading in kana.
- `kanji` — the standard kanji form when `ask` is `hiragana` and one is in common use; otherwise `null`.
- `meaning` — short plain English, one sense, the sense N5 tests.
- `note` — only if the builder needs to know something (a look-alike to watch, a second sense).

## 6. Constraints on the words

- Every kanji must be a Jōyō kanji: the app's stroke data comes from KanjiVG.
- Katakana words with the long-vowel mark ー are wanted (タクシー, ホテル, パーティー are in the
  baseline). The builder will source its stroke data.
- Dictionary form for verbs and adjectives.
- No sentences, particles, counters-as-grammar or set phrases longer than one word. Collocations
  (タクシーにのる) are a known gap in the baseline but belong to a later build; note the ones
  you meet in the report and leave them off the list.
- At the end of the report, list every distinct character the 210 words use, so the builder
  can check stroke coverage.

## 7. Not in scope

Grammar, listening, pitch accent, reading practice, the review schedule itself (the ladder is
fixed for now), app design, and any word list beyond week one.
