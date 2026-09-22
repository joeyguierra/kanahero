# SPEC-v5e — the MEANING switch

Design: `docs/design/v5/v5 Meaning Toggle.dc.html` (S6b, S7 · meaning off). One run-level switch,
decided before the deal. Same vocabulary as DAKUTEN on the deck screen. This is the only thing
shipping from that sheet: the rarity ceiling and the S7 peek-as-assist are parked (§5).

## 1. Placement — S6b

One row between the set head and the grid, in the same panel stock as the shelf. Label left
(`MEANING`, with a one-line hint under it: *English on every card* / *Kana + romaji only*, the
off hint in strike), two-segment switch right. ON chosen is bone on chassis, like DAKUTEN; OFF
chosen is strike on black. Each segment is a 44px target — the switch stands alone here, not
inside a panel button. Nothing else on the screen moves when it flips.

## 2. Behaviour

- **Run-level.** Set on S6b, read by every S7 prompt card in the run. ON: the card carries its
  English line. OFF: the card keeps its full silhouette — same size, same rule, same class tag
  (`PLACE · NO KANJI YET`, `ATTEMPT n`) — and where the English sat, a dash and `MEANING OFF` in
  the faint mono, at the same height. Kana and romaji only.
- **The peek on the way out.** With the switch OFF, grading a card (GOT IT or MISSED) puts the
  word's English on the prompt card for one second — in the meaning's own line, where the stub
  sat, so nothing else moves — and only then does the card leave and the next prompt melt in.
  Both grade buttons are dead for that second, so one tap is one card. With the switch ON there
  is no pause: the meaning was already there. (`components/Round.tsx`, `MEANING_PEEK_MS`.)
- **Locked at DEAL.** The switch does not appear on S7. The run reads the choice as it stood at
  DEAL (`app/page.tsx` holds it in run state), so a later flip cannot reach a run in play.
- **Prompt face only.** The earned faces — S7b's reveal card is still the prompt face and stays
  bare; S8, S6d and the card overlay always carry the meaning. A word you have written has one.
- **Defaults ON; remembered per set.** Storage lists only the sets switched OFF
  (`lib/progress.ts`, `meaningOff: string[]`; no version bump, absent = ON), so a set with no
  entry is ON.

## 3. The Joker

His set line answers the choice, and a flip is a new beat.

- `set.01` — "{words} words, face down. さあ, deal when you're ready." `when:meaning`
- `set.02` — "No meanings. Just the sound and your memory. すき." `when:!meaning`,
  `needs:feature.meaningToggle`. (The sheet writes 好き; the bible's kana law of 2026-09-19
  writes it すき.)

Engine: `JokerContext.meaning` — true when the card shows its English meaning. S6b passes the
switch, S7 passes the run's held value, so a reveal line that says a word's meaning can carry
`when:meaning` and go quiet when the card does. The audit rule for that (a set-block line on
`reveal.*` or `drill` whose text contains the word's `meaning` string must carry `when:meaning`)
belongs to the dialogue pass.

On S7 his line drops the English hint too: he says the kana, not the meaning. No shipped S7
line says one today.

## 4. Verification

`scripts/e2e-loop.mjs` §10.1b: defaults ON and he says `set.01`; OFF flips his line to
`set.02`; DEAL locks it — no switch on S7, the prompt and the flipped card carry
`MEANING OFF` and no `.cardMeaning`, the class tag stays; leaving the run finds the switch
still OFF; the choice is per set (another set is still ON); ON deals the meaning back.

## 5. Later

Rarity ceiling and the S7 peek-as-assist are parked.
