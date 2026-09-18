# The Joker — character bible and dialogue architecture

**Status: character locked, corpus owed (2026-09-17).** This is SPEC-v5a §8's "new dialogue,"
promoted to its own file because it turned out to be a character problem before it was a copy
problem. Supersedes the voice notes in `v4-joker-design-brief.md` §The Joker. The interim lines
in `lib/joker-lines.ts` (SPEC-v5a §4) are replaced wholesale by the corpus this file governs.

Spec wins on behavior. This wins on what he says and how the app picks it.

> ⚠️ **AMENDED 2026-09-17 (same day, after the first cold read) — read everything below through
> this block.** Creator's read of `home` draft 1: *too much about him, too vague.* Eight of thirty
> lines survived. That is new information, so this is an amendment, not a relitigation. The
> sections below are preserved unedited for the reasoning trail.
>
> **1. The premise changes. "He thinks he is the Kana Hero" is retired.** It pointed every line at
> himself. New premise: **he is a guide who has dealt this deck ten thousand times, and you are
> the most entertaining thing at his table.** His constant is *perpetual amusement aimed at the
> user* — he knows what you will get wrong before you do, enjoys being right, enjoys being
> surprised more. The handsome-rogue reference is kept for **timing** (statement, beat, undercut),
> not for ego. From here he is our own character.
>
> **2. Service ego passes, status ego fails.** The eight surviving lines were not ego-free — five
> are about him. The difference: *"I warmed up the deck," "I shuffled already," "my strokes are
> ready"* are things he did **for you**. *"They named the app after me," "I will be magnificent"*
> are about his standing. Ego is allowed only as service, and only as seasoning.
>
> **3. NEW LAW — information first.** Every line is self-explanatory and either instructional or
> informational. Nothing vague. Test: **cover the joke — what remains must tell the user something
> true and useful about this screen, this app, or Japanese.** This overrules §2's "never a
> tutorial": he IS the guide. What survives of that ban is only law 7 — he never explains the same
> thing twice in a row, which the shuffle bag now guarantees.
>
> **4. NEW LAW — the button.** The joke lives in the last one to four words. Information up front,
> undercut at the end. (*"First try means a shiny card. No pressure. Some pressure."*)
>
> **5. NEW LAW — the user is the subject.** At most one line in three may be about him. Audited
> per pool with a `subj:` tag, same as the `ja:` ratio.
>
> **6. Law 6 softened.** He may acknowledge a real result with real numbers (*"almost
> impressed"*). He still never gushes. Reactive lines carry storage numbers only — truth law.
>
> **Research behind the amendment (mechanisms borrowed, no lines, no characters):**
> - *Borderlands 2's villain* — its writer reports early drafts failed because he joked
>   constantly and became a tiresome one-liner machine; the fix was **fewer jokes**. → not every
>   line is a joke; information carries the line.
> - *Portal 2* — playtests cut the AI's harsher insults because relentless meanness ground
>   players down; the player is the straight man in a world gone mad. → the user is the straight
>   man; the barb never accumulates.
> - *Hand of Fate's Dealer* — commentary names the specific thing you just did or failed to do. →
>   specificity is what "attention on the user" actually means; hence reactive lines with tokens.
> - *Balatro's Jimbo* — a joker-guide whose loss lines rib himself and the player together. →
>   complicity; he is on your side of the joke.
> - *Deadpool* — fourth-wall intimacy: in on the joke together. → he knows this is an app, knows
>   it is handwriting on glass, knows the grading is an honour system.

---

## 1. The delusion

**He thinks he is the Kana Hero.** The app is named Kana Hero. He believes it is named after him.

This is not a bit bolted onto a mascot. It is the honest reading of the app's own architecture:
the stroke model you compare your ink against is his, the correct answer on every screen is his,
and the design brief already calls him "the hero mascot." He is, factually, the only entity in
this application that writes Japanese correctly every single time.

He is right about the facts and wrong about what they mean. That gap is the whole character.

You are, in his account, the person he graciously permits to hold the pen. He is not teaching
you so much as **demonstrating**, and allowing you to attempt a copy. When you get it right, his
example was excellent. When you get it wrong, his example was subtle.

### What this buys us mechanically
- He can take credit for a correct stroke without lying — it *was* his stroke.
- A miss never lands on the user. It lands on his complexity. ("Nobody gets me first time.")
- Self-grading needs a voice with an opinion but no authority, and a delusional narrator is
  exactly that: he has opinions constantly and his verdict is worthless, so the judgment stays
  yours. This is why the character does not fight the app's core mechanic.

---

## 2. Voice laws

These are pass/fail. A line that breaks one gets rewritten or cut.

1. **Volume is banned. Ego is not.** No exclamation marks, ever. No capitals for emphasis. He is
   so certain of his standing that raising his voice would be undignified. The calm narcissist is
   funnier than the loud one and preserves the channel's flatness rule (`bio.md`: "if a line
   sounds like a YouTuber wrote it, flatten it").
2. **Under twelve words.** Unchanged from SPEC-v5 §6. The count includes Japanese words.
3. **First person.** He is the subject of his own sentences even when the sentence is about you.
4. **One line per screen, never two at once.** Unchanged.
5. **Never disappointed in you — delighted.** A miss is an administrative delay on the way to an
   outcome he considers inevitable. He is never sarcastic *at* the user's expense; the barb lands
   on the stroke, the deck, the difficulty, or his own excellence.
6. **He never congratulates.** "Good job" does not exist in his vocabulary. The nearest he comes
   is treating your success as unsurprising, because he taught you. 当然.
7. **Never explains a mechanic twice.** Unchanged, and now enforced by the `once` flag (§5).
8. **He never mentions streaks, days, XP, ranks, levels, or how long it has been.** Absent
   features stay absent (`paid-tier-prep.md` §5 copy guard). He has no opinion about your
   consistency because he does not concede that you have a life outside the app.
9. **The truth rule binds him.** No line on S7/S7c may call a card earned, kept or yours before
   the run finishes (SPEC-v5a §1.6). Ego does not get to overrule the truth law — and in fact
   the constraint is in character: the house does not hand over cards mid-deal.

### Three things he is never allowed to be
- **Cruel.** The user is an adult, alone, bad at handwriting, self-grading with nobody watching.
  Contempt from the only voice in the room is a retention failure wearing a joke's clothes.
  Condescension that is clearly affection is the register; he picked you and he is pleased.
- **Needy.** No "come back soon," no "don't leave," no guilt. Doctrine block 7 — zero desperation —
  applies to the app, not just the videos. He does not need you. He is doing you a favor.
- **A tutorial.** He is not a help system. If a line's job is to explain UI, it is not his line;
  it belongs in the interface.

---

## 3. The Japanese seeding mechanic

He drops Japanese into his own speech, unremarked. This is the app's only incidental-acquisition
channel and the only place it teaches outside the drill loop.

**Rules:**
1. **Never load-bearing.** Remove the Japanese word and the line must still read in English. If
   comprehension depends on knowing it, it is the wrong word or the wrong line.
2. **He never translates himself.** Glossing in the same breath is condescending and violates
   law 7. Meaning arrives by repetition and context, the way it does in the real world.
3. **Japanese is written in Japanese.** Kana and kanji, never romaji. The app's entire premise is
   that romaji is a crutch; the voice cannot ship the crutch.
4. **Roughly one line in three or four.** Over-seasoning turns it into a gimmick and makes the
   pool unreadable to a beginner. Tracked as a ratio across each pool, not per line.
5. **Vocabulary is his, not a syllabus.** Dealer words, ego words, table words. A curriculum here
   would resurrect the banned flashcard idea through the back door.

### His starter lexicon
| word | reading | why it is his |
| :-- | :-- | :-- |
| 俺 | おれ | the swaggering masculine "I." He has been telling you exactly who he is with one character since the first screen. |
| 当然 | とうぜん | "naturally, obviously." His catchphrase candidate — the verbal shrug of a man who expected to win. |
| さすが | — | normally a compliment *to someone else*. Turning it on yourself (さすが俺, "as expected of me") is a recognized joke in Japanese, not merely Japanese-flavored English. |
| 見事 | みごと | "splendid, masterful." Reserved for his own strokes. |
| どうぞ | — | "go ahead, be my guest." The dealer's word. |
| 残念 | ざんねん | "what a shame." Used about your miss with theatrical, unconvincing sympathy. |
| 大丈夫 | だいじょうぶ | "it's fine." His reassurance, which is really about his own reputation. |
| まあまあ | — | "so-so." The worst thing he will ever say about your work, and he will say it kindly. |

**A `ja: string[]` field on every line records which seeded words it carries**, so the ratio can be
audited and a future long-press gloss has its data. Ship with no gloss surfaced — same pattern as
the entitlement flag: the seam exists, the feature does not.

### The payoff worth protecting
A learner who sticks with this will eventually learn that 俺 is the arrogant "I" — and realize the
character has been introducing himself in a single character the whole time. Do not spend that
with an early explanatory line. It is also a video beat.

---

## 4. Proof of voice — seed lines

Not the corpus. These exist to prove the character produces lines under every law above, and to
serve as the style reference the full generation pass is measured against.

**`home`**
- Back for more of my handwriting. 当然.
- Four decks. All of them mine. Pick one.
- They named the app after me. Choose a deck.
- I warmed up the deck. どうぞ.
- You again. I knew you would be back.
- こんにちは. Pick a deck, I'll deal, you write. *(the original, kept — it still passes)*

**`drill.prompt`** — from memory, before the reveal
- From memory. Then I will show you how it is done.
- Your turn first. Mine is better, but go ahead.
- Write it. I will follow with the real one.

**`drill`** — the stroke is revealed, and it is his
- That is mine. Yours beside it — honest?
- Look at that stroke. 見事. Now compare.
- My hand, your hand. Be honest about which.

**`round.missed`**
- Back in the deck. Nobody gets me first time.
- It will come round again. 大丈夫.
- 残念. My stroke deserves a second look.

**`earned.shiny`** — bound by the truth rule; every line must carry the condition
- First try. Shiny, if you finish what you started.
- さすが俺. Finish the run and it is yours.
- One try. My influence. Finish, and keep it.

**`credits`**
- Other people's work, named. Even I do not take that credit.

**Rare tier (see §5)**
- The tag says JOKER. I have filed a complaint.
- 俺. That is my word for I. Not for work. *(gated late — see §3 payoff)*

### A copy bug this pass found
The shipped `abandon` line reads *"Leave now and this run's cards leave with you."* — which says
the opposite of what happens; the cards are lost, they do not go with you. The character fixes it
for free, because he is the house:

> **Leave now and the cards stay with me.**

Same length, correct, and in voice. Evidence the character choice is doing structural work rather
than decoration.

---

## 5. Dialogue architecture

Today `lib/joker-lines.ts` is `Record<JokerScreen, string>` — one line per screen, forever. A
daily user meets the same home line on launch four hundred. That is not a voice, it is a caption.

### Data shape
```ts
interface JokerLine {
  id: string;        // stable — for seen-tracking, bug reports, and the audit
  text: string;      // may carry {n} / {word} tokens, filled by the existing *Line() helpers
  when?: Cond[];     // every condition must hold for the line to be eligible
  tier?: "common" | "rare";   // default "common"
  once?: boolean;    // retire permanently after one showing
  ja?: string[];     // seeded Japanese words carried by this line
}

interface JokerContext {
  screen: JokerScreen;
  firstEver: boolean;
  runsFinished: number;
  missStreak: number;      // consecutive misses this run
  triesThisWord: number;
  script?: "hiragana" | "katakana" | "kanji";
  setId?: string;
  counts?: { minted: number; shiny: number };
}
```

### Selection — shuffle bag, not random
Random repeats. A **shuffle bag** guarantees every line in a pool is seen before any repeats,
which is precisely what "not repetitive" means, and it reuses the seeded mulberry32 shuffle
already sitting in `lib/joker.ts`.

1. Filter the screen's pool by `when` against the context; drop spent `once` lines.
2. Roll for the rare tier first (~1 in 40). On a hit, serve from the rare pool's own bag.
3. Otherwise deal the next line from the common bag. Reshuffle when the bag empties, with the
   guard that the reshuffled bag may not open on the line that just closed the previous one.
4. Persist bag state as **indices, not strings**, under `kanahero:v1.joker.bags`. Bounded, small,
   and survives a version bump by resetting to a fresh bag rather than throwing.

The existing `peekOnce` / `markSeen` mechanism collapses into the `once` flag and its own seen
set — one mechanism instead of two.

### The scaling law nobody writes down
Pool depth must be proportional to **screen visit frequency**, not to how fun the screen is to
write for. A ten-line home pool cycles thirty-six times in a year of daily use and feels thin by
March, while `collection.empty` may never be seen twice.

| tier | screens | pool depth |
| :-- | :-- | :-- |
| every session, many times | `drill`, `drill.prompt`, `round.kana`, `round.kanji`, `reveal.*` | **30–40** |
| every session, once or twice | `home`, `deck.*`, `set`, `result`, `earned.*` | **15–25** |
| occasional | `bank`, `collection`, `abandon`, `round.missed` | **6–10** |
| rare or terminal | `credits`, `collection.empty`, `home.wiped` | **2–4** |

That is roughly 250–350 lines. Which is why they get baked, not typed.

### Generation, and the $0 law
Live API calls for bespoke lines are **out**, and not on taste — on the repo's own law. README:
*"$0 runtime. No metered API is called by the shipped app, ever."* `e2e-offline.mjs` exists
specifically to catch a deploy that is silently not offline. A Joker who goes quiet underground
on the Keihan line breaks the loudest claim the channel has made.

**Bake at build time instead.** Generate the corpus offline, curate it, ship it as JSON in the
bundle. This is strictly better than live generation: more variety, zero cost, works in a tunnel,
and a bad line never reaches a user because a human read it first.

The one architecturally legal place for generation is **set creation**, which is already online
(`paid-tier-prep.md` §2: user sets are created online, cached, then drilled offline). A user-made
set can be handed its own baked lines at the moment it is created. The seam exists; it does not
need inventing.

---

## 6. Owed before this builds
- The corpus itself: ~250–350 lines against §2's laws and §4's reference, audited for the §3
  ratio and word count.
- Condition vocabulary finalised (`Cond[]`) — which context flags earn lines and which are
  over-engineering.
- Whether the `JOKER` panel tag ever becomes a running joke (he would prefer `HERO`). Banked,
  not built.

---

## 7. Sync — how the corpus stays true when the app changes *(added 2026-09-17)*

**Why this exists.** The information-first law made every line a factual claim about the app,
and a factual claim goes stale. This is not hypothetical — an audit of the shipped table on
2026-09-17 found three live truth-law bugs, all caused by the app moving under a fixed string:

1. **`kuchi`: "Five of these share 口."** The station set has **seven** (出口 入口 東口 中央口 西口 南口
   北口). A false number, shipped.
2. **`kuchi` fires on any kanji word containing 口** — including `test-kanji`'s lone 口, where the
   line is nonsense. And it is a once-line: spent there, it never fires in STATION where it belongs.
3. **`deck.kanji`: "Only words, only places you've been."** DAILY BASICS kanji is single
   characters about nature and people. False on both counts since that set landed.

And SPEC-v5a §0.6 was the same failure handled by hand: "Joker lines that the new rules make
untrue are replaced." It will recur on every set and every rule change unless it is mechanical.

### 7.1 Three rules
- **Set-specific lines live in the set file.** A line that is only true of one set ships inside
  `public/sets/<id>.json` under a `joker` block keyed by screen (`set`, `round.*`, `reveal.*`,
  `result`, `collection`, plus `once` asides). Add a set → its lines arrive with it. Delete a
  set → they leave. No orphans, no global line that quietly assumes one set. Pool for a screen =
  global pool ∪ the active set's pool, set lines weighted up (specificity is the character).
  Same shape for `origin: "user"` sets later — the seam costs nothing now.
- **Every claim declares what it needs.** A line carries `needs:` tags — `rule.allOrNothing`,
  `feature.bank`, `feature.offline`, `set.station-kanji`, `script.kanji`. Facts resolve two ways:
  *derived* (sets, scripts, screens — read from `public/sets/` and the `JokerScreen` type, never
  hand-kept) and *declared* (rules and features — one small `joker-facts` file, each entry
  naming the spec section or e2e step that proves it).
- **No typed numbers.** A number about data is a token computed from the data (`{n:口}`,
  `{words}`, `{shiny}`), never a literal. A literal number about the app ("three scripts")
  requires a `needs:`. Bug 1 above becomes impossible rather than unlikely.

### 7.2 The audit — `scripts/joker-audit.mjs`, run in `prebuild` beside `gen-sw`
Formalizes the checks already run by hand three times this session (dogfood rule: the tool is
born from the friction). It compiles the corpus source + every set's `joker` block into the
bundled JSON, and on the way:

| check | on failure |
| :-- | :-- |
| voice laws: < 12 words, no `!`, `ja` ratio, `subj` ratio per pool | build fails |
| every `needs:` resolves to a currently true fact | **line is silenced** (excluded), reported |
| every `JokerScreen` key has a pool ≥ its frequency-tier minimum (§5) | warn; **fail if empty** |
| every set has a `joker` block | warn: "speaks generic only" |
| literal number without a token or `needs:` | build fails |
| only `status: ship` lines are bundled; `draft` lines never are | — |

The failure direction is the point: **a stale line goes silent, it does not ship.** Change a
rule → flip one fact → every dependent line drops out of the bundle and appears on a review
list. He says less until you have re-read them; he never lies in the meantime.

### 7.3 Add / branch / update — the three flows
- **Add (new set).** Drop the set JSON in. Audit reports "speaks generic only." Generate
  candidate lines at dev time against this bible + the set's words → they land as `draft` →
  creator cold-reads → promote to `ship`. Dev-time generation is legal; the $0 law governs the
  shipped app, not the workshop. Nothing is ever auto-shipped: a human reads every line first.
- **Branch (new screen or new state).** Add the key to `JokerScreen` → audit fails on the empty
  pool until it has lines. New `when:` conditions branch an existing pool without a new key.
- **Update (rule or feature changes).** Edit the fact. Dependent lines silence themselves and
  queue for rewrite. Lines keep their `id` when the wording changes and get a new `id` when the
  meaning does.

### 7.4 On the device — bag reconciliation
Bags persist as line **ids**, not indices (amends §5: indices break the moment a pool is
edited). On a corpus version change: drop ids that no longer exist, and insert new ids **at the
front** of the remaining bag — so after an update the user meets the new lines first, which is
the entire visible payoff of shipping them. Spent `once` ids are kept forever.

### 7.5 Out of scope, routed
Runtime generation for user-created sets is online/paid-tier territory (`paid-tier-prep.md`)
and is **not** part of this build. The `joker` block in the set file is the only seam it needs.

---

## 8. Placement — where he explains and where he doesn't *(added 2026-09-18)*

Creator's read of the earned lines (*"First try. Shiny — if you finish the run."*): vague to a
first-timer, and the wrong place for it. New law:

**Mechanics are explained where they are seen, never while performing.** On the drill screens
(S4, S7, S7b, S7c) he reacts and cues the next card; the UI carries the mechanic (`SHINY · FIRST
TRY`, `KEPT WHEN THE RUN FINISHES`, the hand strip). Card rules — rarity by tries, one copy per
finished run, all-or-nothing — are explained on **home** (one fact at a time, in rotation) and on
the **collection** screen (in depth, where the cards are). The one drill-screen exception is the
miss line, which may say the word comes back, because the drill needs the user to know that.

This keeps the truth rule (SPEC-v5a §1.6) for free: a reaction line never claims a card is kept.

**Corrected frequency tiers (amends §5).** `earned.*` and `round.missed` fire once **per word**,
not once per session — ten times a run. They are top-tier and need 30–40 lines each, not 15–25.
The 2026-09-18 pools (10 / 8 / 8 / 8) are a first pass toward that depth.

**Routed to part 2 (SPEC-v5a §8):** a dedicated how-it-works / tutorial screen. Until it exists,
home + collection are the explanation surfaces.

---

## 9. The mix, and his Japanese *(added 2026-09-18 — amends §3)*

**Creator call: more Japanese. Target 70/30.** The measure is **line coverage** — the share of
lines in a pool that carry at least one Japanese phrase. Before this pass the corpus sat at 28%;
after it, 69–88% per written pool. The *word* share is 8–12% and cannot go much higher under §3.1
(never load-bearing): a line that is one-third Japanese by words stops reading in English. Line
coverage is the honest number and the one the audit reports.

### What the research changed
- **He is the tsukkomi.** Manzai runs on a *boke* (the fool) and a *tsukkomi* (the retort). Your
  stroke is the boke; he is the retort. That is the exact shape of the button law (§ amendment 4):
  information, then a short comeback. The retort words (惜しい, なんでやねん, おっと, まさか) are the
  purest non-load-bearing Japanese there is — reactions carry no information the English needs.
- **A signature word.** Hosts have a tic (Monokuma's laugh; the King of All Cosmos's record
  scratch). His is **ほら / ほらね** — "see? told you." It is the word of a man who knew what you
  would get wrong. Use it on reveals and returns, never more than once per pool.
- **The emotional swing is the reward.** The King of All Cosmos belittles constantly and then
  praises exuberantly, and the swing is what makes approval land. He keeps law 6 (never gush) on
  base and worn; on shiny he is allowed one visible flicker — ほう, おっと, 完璧.
- **The 日本語上手 joke.** Japanese speakers tell any foreigner who manages one word that their
  Japanese is 上手 (skilled). Every learner knows this. When he says 上手 after a first try, the
  learners who know will laugh; the rest will learn it — and then get the joke retroactively.
  Same mechanism as 俺 (§3).
- **親 and 子.** In mahjong the dealer is 親 (parent) and the other players are 子 (children). The
  app's home ghost glyph is already 親 (`page.tsx`: "親 is the dealer"). He is 親; the user is 子.
  He may call the user 子 exactly once, late, as a rare line — it is condescension and affection in
  one character, which is the whole register.
- **Kansai.** The app was born on a train between Kyoto and Osaka, and Osaka is manzai's home.
  A few Kansai retorts are in character (なんでやねん, ええやん, 知らんけど). Rule: **Kansai only in
  comedy retorts, never in anything informational** — the app must not teach dialect as standard.
  Tagged `dialect:kansai` so the whole layer can be removed with one filter if it ever misleads.

### Lexicon (extends §3)
| word | reading | he uses it for | register |
| :-- | :-- | :-- | :-- |
| ほら / ほらね | hora / hora ne | "see?" — his signature, reveals and returns | casual |
| 惜しい | oshii | the near miss; the kindest miss word in the language | neutral |
| おっと | otto | "whoa / oops" — catching himself reacting | casual |
| ほう | hou | "oh?" — intrigued, one eyebrow | casual, slightly old-fashioned |
| まさか | masaka | "no way" — mock disbelief at a clean stroke | neutral |
| なるほど | naruhodo | "I see" — conceding you did something | neutral |
| まだ | mada | "not yet" — the bank, the empty collection, a miss | neutral |
| やっと | yatto | "finally" — the worn tier | neutral |
| 上手 | jouzu | skilled — the 日本語上手 joke, first tries | neutral |
| 完璧 | kanpeki | perfect — the rare shiny flicker | neutral |
| 余裕 | yoyuu | "easy, plenty of margin" — about himself | casual |
| 根性 | konjou | guts, grit — the worn tier, said with respect | casual |
| はい次 | hai, tsugi | "okay, next" — the drill's metronome | neutral |
| お疲れ | otsukare | "good work" — the end of a run, and nowhere else | casual |
| はじめまして | hajimemashite | "pleased to meet you" — the first-launch line only | polite |
| よろしく | yoroshiku | "counting on you" — handing you the pen | neutral |
| 正直に | shoujiki ni | "honestly" — the grading prompt | neutral |
| 約束 | yakusoku | "promise" — a missed word will return | neutral |
| どっち | docchi | "which?" — a choice of two | casual |
| どんどん | dondon | "more and more" — copies stacking up | casual |
| たぶん | tabun | "probably" — undercutting his own trust in you | neutral |
| だいたい | daitai | "mostly, roughly" — the stroke-order caveat | neutral |
| 基本 | kihon | "the basics" — hiragana | neutral |
| 地下 | chika | "underground" — where it still works | neutral |
| 親 / 子 | oya / ko | dealer / player — mahjong's terms; the ghost glyph already says 親 | — |
| なんでやねん | nande ya nen | the Osaka retort — "what the—" | **Kansai**, retorts only |
| ええやん | ee yan | "nice, why not" | **Kansai**, retorts only |
| 知らんけど | shiran kedo | "…but what do I know" — after an opinion, never a fact | **Kansai**, retorts only |

### Guardrails that stay
- §3.1–3.3 unchanged: never load-bearing, never self-translated, never romaji.
- A Japanese word may **replace** an English word only when the English word was itself a
  button, never when it carried the information (だいたい may replace "Mostly"; nothing may
  replace "first try").
- The examples in a line may be Japanese when the line is *about* Japanese — "Katakana spells
  borrowed words. コーヒー, タクシー, probably your name." demonstrates the script and still reads
  with the examples removed.

---

## 10. Language toggle — designed now, built later *(added 2026-09-18)*

The creator foresees an English ⇄ Japanese UI toggle. The Joker is bilingual in both modes; the
toggle flips his **mix**: English mode ≈ 70/30 English/Japanese by line coverage, Japanese mode
≈ 70/30 Japanese/English. Not this build. What is designed now so nothing has to be rebuilt:

- **One id, two texts.** A line is a meaning with a `text.en` (the current mix) and a `text.ja`
  (the flipped mix — Japanese carries the information, English is the seasoning). Same id, same
  `when`, same `needs`, same `subj`. Bags and `once` are keyed by id, so switching language
  mid-life loses no state and repeats nothing.
- **`text.ja` may be missing.** The audit warns per pool ("ja-mix: 12 of 32") and the runtime
  falls back to `text.en`. Coverage is a number on the report, never a build failure, so the
  toggle can ship with partial coverage and grow.
- **The audit's laws are per text.** Word count, `!`, load-bearing and coverage are checked on
  each variant. In `text.ja` the non-load-bearing rule inverts: remove the *English* and the line
  must still read in Japanese.
- **Counters.** He counts in words, and Japanese counts with counters: cards are 枚 (七枚), words
  are 語, tries are 回. The token renderer becomes locale-aware: `{tries}` → "three" / "三回".
  This is the only piece of real logic the toggle adds to the runtime.
- **UI chrome is a separate concern.** Labels (`DECKS`, `KEPT WHEN THE RUN FINISHES`, `VIEW
  COLLECTION`) go through whatever string table the UI toggle introduces; the Joker's corpus does
  not hold UI strings and the UI never holds his.
- **Corpus grammar, when it lands:** a second line under the same id, `- [home.11] ja: …`,
  parsed as the `text.ja` variant. No new file, no new id.
