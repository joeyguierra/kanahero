# The Joker — corpus (SOURCE OF TRUTH)

Compiled by `scripts/joker-audit.mjs` into `lib/joker-corpus.generated.json`. Edited here or nowhere.
Governed by `docs/design/joker-character.md`. Set-specific lines do NOT live here — they live in
the set's own JSON under `joker` (bible §7.1).

Line format: `- [id] text ·· tag ·· tag`. Tags: `when:` `once` `tier:rare` `ja:` `subj:` `needs:` `status:`.
Only `status:ship` is bundled. Ids are forever: keep the id when the wording changes, mint a new
one when the meaning does. Tokens: `{bank}` `{shiny}` `{minted}` `{words}` `{chars}` — he counts in words.

## home
<!-- pool approved by cold read 2026-09-17 · the style reference for every other pool -->
- [home.01] よし. Pick a deck. I feel sharp today. ·· ja:よし ·· subj:him ·· status:ship
- [home.02] Choose a deck. I will deal. You will try. ·· subj:you ·· status:ship
- [home.03] Back for more of my handwriting. 当然. ·· when:!firstEver ·· ja:当然 ·· subj:you ·· status:ship
- [home.04] You again. I knew you would be back. ·· when:!firstEver ·· subj:you ·· status:ship
- [home.05] My strokes are ready. Bring your pen. ·· subj:him ·· needs:feature.strokeModel ·· status:ship
- [home.06] I warmed up the deck. どうぞ. ·· ja:どうぞ ·· subj:him ·· status:ship
- [home.07] Every answer in here is in my handwriting. Pick a deck. ·· subj:app ·· needs:feature.strokeModel ·· status:ship
- [home.08] I shuffled already. You are welcome. ·· subj:him ·· status:ship
- [home.09] You write, I reveal, you grade yourself. I trust you. Mostly. ·· subj:you ·· needs:rule.selfGrade ·· status:ship
- [home.10] First try means a shiny card. No pressure. Some pressure. ·· subj:you ·· needs:rule.rarityByTries ·· status:ship
- [home.11] Finish the run or keep nothing. My house, my rules. ·· subj:app ·· needs:rule.allOrNothing ·· status:ship
- [home.12] Miss a word and it comes back later. 大丈夫. ·· ja:大丈夫 ·· subj:you ·· needs:rule.missRequeues ·· status:ship
- [home.13] Nobody grades you here but you. I just watch. Closely. ·· subj:you ·· needs:rule.selfGrade ·· status:ship
- [home.14] Every run deals the whole set, shuffled. No memorizing my order. ·· subj:app ·· needs:rule.dealsWholeSet ·· status:ship
- [home.15] Works with no signal. Your excuses will need to be better. ·· subj:you ·· needs:feature.offline ·· status:ship
- [home.16] Can't read a sign? Photograph it. The bank remembers. ·· subj:you ·· needs:feature.bank ·· status:ship
- [home.17] No timer, no score, no one watching. Except me. ·· subj:you ·· needs:rule.noTimerNoScore ·· status:ship
- [home.18] I give the sound. The shape comes from you. ·· subj:you ·· needs:rule.promptShowsReading ·· status:ship
- [home.19] いらっしゃい. Three scripts, one rule: write it before you see it. ·· ja:いらっしゃい ·· subj:app ·· needs:app.threeScripts ·· status:ship
- [home.20] Hiragana first, if you are new. Everything else leans on it. ·· subj:you ·· status:ship
- [home.21] Katakana spells borrowed words. Coffee, taxi, probably your name. ·· subj:you ·· status:ship
- [home.22] Kanji carry meaning, not sound. Start with the station signs. ·· subj:app ·· needs:set.station-kanji ·· status:ship
- [home.23] Hiragana, katakana, kanji. I'll make you excellent, like me. ·· subj:you ·· needs:app.threeScripts ·· status:ship
- [home.24] Strokes go top to bottom, left to right. Mostly. Watch me. ·· subj:app ·· status:ship
- [home.25] Recognizing is easy. Writing is why you're here. 頑張って. ·· ja:頑張って ·· subj:you ·· status:ship
- [home.26] {bank} characters in the bank, unread. We can fix that. ·· when:bank>0 ·· subj:you ·· needs:feature.bank ·· status:ship
- [home.27] {shiny} shiny cards so far. I am almost impressed. ·· when:shiny>0 ·· subj:you ·· needs:rule.rarityByTries ·· status:ship
- [home.28] No shiny yet. One word, first try. That's all it takes. ·· when:runsFinished>0,shiny=0 ·· subj:you ·· needs:rule.rarityByTries ·· status:ship
- [home.29] Nothing minted yet. Finish one run and the cards stay. ·· when:!firstEver,runsFinished=0 ·· subj:you ·· needs:rule.allOrNothing ·· status:ship
- [home.30] お帰り. Your cards are right where you left them. ·· when:runsFinished>0 ·· ja:お帰り ·· subj:you ·· needs:feature.localProgress ·· status:ship
- [home.31] さあ. Same deal as always: I show, you grade, honestly. ·· when:!firstEver ·· ja:さあ ·· subj:you ·· needs:rule.selfGrade ·· status:ship
- [home.32] I'm the Joker. I deal, you write. Pick a deck. ·· when:firstEver ·· once ·· subj:app ·· status:ship

<!-- everything below: the shipped v5a table migrated as pools of ONE. Interim — each becomes a real pool in a later pass. -->

## home.wiped
- [home.wiped.01] New rules, so I reshuffled. Your old cards are gone. ·· when:wiped ·· once ·· status:ship

## home.hiragana
- [home.hiragana.01] Native words, particles, endings. The first script. ·· status:ship

## home.katakana
- [home.katakana.01] Loanwords, names, signs. Same sounds, sharper strokes. ·· status:ship

## home.kanji
- [home.kanji.01] Kanji. Meaning, not sound. One character, many readings. ·· status:ship

## home.bank
- [home.bank.01] The bank. Characters you snapped but couldn't read yet. ·· needs:feature.bank ·· status:ship

## deck.hiragana
- [deck.hiragana.01] Characters first, or straight to words. Your call. ·· status:ship

## deck.katakana
- [deck.katakana.01] Same sounds as hiragana, sharper strokes. Characters or words. ·· needs:script.katakana ·· status:ship

## deck.kanji
- [deck.kanji.01] No alphabet here. Every character means something. Pick a set. ·· needs:script.kanji ·· status:ship

## drill
- [drill.01] That's the stroke. Yours next to mine — honest? ·· status:ship

## drill.prompt
- [drill.prompt.01] From memory. I'll show you after. ·· status:ship

## bank
- [bank.01] What you couldn't read. Kept until you can. ·· needs:feature.bank ·· status:ship

## collection
- [collection.01] Every copy you've made, word by word. ·· status:ship

## collection.empty
- [collection.empty.01] Nothing here yet. Finish a run. ·· needs:rule.allOrNothing ·· status:ship

## abandon
- [abandon.01] Leave now and the cards stay with me. ·· needs:rule.allOrNothing ·· status:ship

## round.kana
- [round.kana.01] Whole word, one box. Make it fit. ·· status:ship

## round.kanji
- [round.kanji.01] The kana's on the card — I want the kanji. ·· status:ship

## round.missed
- [round.missed.01] Back in the deck. It'll come round again. ·· status:ship

## reveal.kanji
- [reveal.kanji.01] There it is. Be honest. Did your ink match mine? ·· status:ship

## earned.shiny
- [earned.shiny.01] First try. Shiny — if you finish the run. ·· needs:rule.allOrNothing ·· status:ship

## earned.base
- [earned.base.01] Second try. Base stock. Finish to keep it. ·· needs:rule.allOrNothing ·· status:ship

## earned.worn
- [earned.worn.01] Took a few. Worn stock. Finish to keep it. ·· needs:rule.allOrNothing ·· status:ship

## credits
- [credits.01] Other people's work, named. That's the deal. ·· status:ship

## set
- [set.01] {words} words, face down. Deal when you're ready. ·· needs:rule.dealsWholeSet ·· status:ship

## reveal.kana
- [reveal.kana.01] {chars} characters, one line. Did they all land? ·· when:chars>1 ·· status:ship
- [reveal.kana.02] One character, one box. Did it land? ·· when:chars=1 ·· status:ship

## result
- [result.01] {minted} cards minted, {shiny} shiny. Deal again whenever. ·· when:shiny>0 ·· status:ship
- [result.02] {minted} cards minted. Deal again whenever. ·· when:shiny=0 ·· status:ship

## once (global)
- [once.wholeWord] Whole word, one box. Make it fit. ·· once ·· when:script!=kanji ·· status:ship
