# The Joker — corpus (SOURCE OF TRUTH)

Compiled by `scripts/joker-audit.mjs` into `lib/joker-corpus.generated.json`. Edited here or nowhere.
Governed by `docs/design/joker-character.md`. Set-specific lines do NOT live here — they live in
the set's own JSON under `joker` (bible §7.1).

Line format: `- [id] text ·· tag ·· tag`. Tags: `when:` `once` `tier:rare` `ja:` `subj:` `needs:` `dialect:` `status:`.
Only `status:ship` is bundled. Ids are forever: keep the id when the wording changes, make a new
one when the meaning does. Tokens: `{bank}` `{shiny}` `{earned}` `{words}` `{chars}` `{tries}` — he counts in words.

## home
<!-- pool approved by cold read 2026-09-17 · the style reference for every other pool -->
- [home.01] よし. Pick a deck. I feel sharp today. ·· ja:よし ·· subj:him ·· status:ship
- [home.02] Choose a deck. I will deal. You will try. ·· subj:you ·· status:ship
- [home.03] Back for more of my handwriting. 当然. ·· when:!firstEver ·· ja:当然 ·· subj:you ·· status:ship
- [home.04] You again. I knew you would be back. ·· when:!firstEver ·· subj:you ·· status:ship
- [home.05] My strokes are ready. さあ, bring your pen. ·· ja:さあ ·· subj:him ·· needs:feature.strokeModel ·· status:ship
- [home.06] I warmed up the deck. どうぞ. ·· ja:どうぞ ·· subj:him ·· status:ship
- [home.07] Every answer in here is in my handwriting. Pick a deck. ·· subj:app ·· needs:feature.strokeModel ·· status:ship
- [home.08] I shuffled already. You are welcome. ·· subj:him ·· status:ship
- [home.09] You write, I reveal, you grade yourself. I trust you. たぶん. ·· ja:たぶん ·· subj:you ·· needs:rule.selfGrade ·· status:ship
- [home.10] First try means a shiny card. No pressure. Some pressure. ·· subj:you ·· needs:rule.rarityByTries ·· status:ship
- [home.11] Finish the run or keep nothing. The 親 decides. That's me. ·· ja:親 ·· subj:app ·· needs:rule.allOrNothing ·· status:ship
- [home.12] Miss a word and it comes back later. 大丈夫. ·· ja:大丈夫 ·· subj:you ·· needs:rule.missRequeues ·· status:ship
- [home.13] Nobody grades you here but you. I just watch. Closely. ·· subj:you ·· needs:rule.selfGrade ·· status:ship
- [home.14] Every run deals the whole set, shuffled. No memorizing my order. ·· subj:app ·· needs:rule.dealsWholeSet ·· status:ship
- [home.15] No signal needed. 地下 too. Your excuses need work. ·· ja:地下 ·· subj:you ·· needs:feature.offline ·· status:ship
- [home.16] Can't read a sign? 大丈夫. Photograph it. The bank remembers. ·· ja:大丈夫 ·· subj:you ·· needs:feature.bank ·· status:ship
- [home.17] No timer, no score, no one watching. Except me. ·· subj:you ·· needs:rule.noTimerNoScore ·· status:ship
- [home.18] I give the sound. The shape comes from you. よろしく. ·· ja:よろしく ·· subj:you ·· needs:rule.promptShowsReading ·· status:ship
- [home.19] いらっしゃい. Three scripts, one rule: write it before you see it. ·· ja:いらっしゃい ·· subj:app ·· needs:app.threeScripts ·· status:ship
- [home.20] Hiragana first if you're new. 基本. Everything leans on it. ·· ja:基本 ·· subj:you ·· status:ship
- [home.21] Katakana spells borrowed words. コーヒー, タクシー, probably your name. ·· ja:コーヒー,タクシー ·· subj:you ·· status:ship
- [home.22] Kanji carry meaning, not sound. Start with the station signs, 駅. ·· ja:駅 ·· subj:app ·· needs:set.station-kanji ·· status:ship
- [home.23] Hiragana, katakana, kanji. I'll make you excellent, like me. ·· subj:you ·· needs:app.threeScripts ·· status:ship
- [home.24] Strokes go top to bottom, left to right. だいたい. Watch me. ·· ja:だいたい ·· subj:app ·· status:ship
- [home.25] Recognizing is easy. Writing is why you're here. 頑張って. ·· ja:頑張って ·· subj:you ·· status:ship
- [home.26] {bank} characters in the bank, unread. まだ. We can fix that. ·· ja:まだ ·· when:bank>0 ·· subj:you ·· needs:feature.bank ·· status:ship
- [home.27] {shiny} shiny so far. ほう. I am almost impressed. ·· ja:ほう ·· when:shiny>0 ·· subj:you ·· needs:rule.rarityByTries ·· status:ship
- [home.28] No shiny yet. One word, first try. それだけ. ·· ja:それだけ ·· when:runsFinished>0,shiny=0 ·· subj:you ·· needs:rule.rarityByTries ·· status:ship
- [home.29] まだ nothing earned. Finish one run and the cards stay. ·· ja:まだ ·· when:!firstEver,runsFinished=0 ·· subj:you ·· needs:rule.allOrNothing ·· status:ship
- [home.30] お帰り. Your cards are right where you left them. ·· when:runsFinished>0 ·· ja:お帰り ·· subj:you ·· needs:feature.localProgress ·· status:ship
- [home.31] さあ. Same deal as always: I show, you grade, honestly. ·· when:!firstEver ·· ja:さあ ·· subj:you ·· needs:rule.selfGrade ·· status:ship
- [home.32] はじめまして. I'm the Joker. I deal, you write. Pick a deck. ·· ja:はじめまして ·· when:firstEver ·· once ·· subj:app ·· status:ship

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
- [deck.hiragana.01] Characters first, or straight to words. どっち? ·· ja:どっち ·· status:ship

## deck.katakana
- [deck.katakana.01] Same sounds as hiragana, sharper strokes. Characters or words. ·· needs:script.katakana ·· status:ship

## deck.kanji
- [deck.kanji.01] No alphabet here. Every character means something. Pick a set. ·· needs:script.kanji ·· status:ship

## drill
- [drill.01] ほら. That's the stroke. Yours next to mine — honest? ·· ja:ほら ·· status:ship

## drill.prompt
- [drill.prompt.01] From memory. さあ. I'll show you after. ·· ja:さあ ·· status:ship

## bank
- [bank.01] What you couldn't read. Kept until you can. まだ. ·· ja:まだ ·· needs:feature.bank ·· status:ship

## collection
<!-- pool grown 2026-09-18 — the collection is where card mechanics are explained (bible §8), so the depth lives here -->
- [collection.01] Every copy you've made, word by word. ほら. ·· ja:ほら ·· subj:you ·· status:ship
- [collection.02] First try shiny, second base, three or more worn. ·· needs:rule.rarityByTries ·· subj:app ·· status:ship
- [collection.03] One copy per word, every finished run. 当然. ·· ja:当然 ·· needs:rule.dealsWholeSet,rule.allOrNothing ·· subj:app ·· status:ship
- [collection.04] Shiny means first try. The rest is honest work. ·· needs:rule.rarityByTries ·· subj:you ·· status:ship
- [collection.05] Replay a set and the copies stack up. どんどん. ·· ja:どんどん ·· needs:rule.dealsWholeSet ·· subj:you ·· status:ship
- [collection.06] はい. A card is kept only when its run finishes. ·· ja:はい ·· needs:rule.allOrNothing ·· subj:app ·· status:ship

## collection.empty
- [collection.empty.01] まだ nothing here. Finish a run. ·· ja:まだ ·· needs:rule.allOrNothing ·· status:ship

## abandon
- [abandon.01] Leave now and the cards stay with me. ·· needs:rule.allOrNothing ·· status:ship

## round.kana
- [round.kana.01] Whole word, one box. Make it fit. ·· status:ship

## round.kanji
- [round.kanji.01] The kana's on the card — I want the 漢字. ·· ja:漢字 ·· status:ship

## round.missed
<!-- pool rewritten 2026-09-18 — a reaction and a cue to keep going; the one mechanic he may state is that the word returns, because the drill needs it -->
- [round.missed.01] 惜しい. Back in the deck. We'll see it again. ·· ja:惜しい ·· needs:rule.missRequeues ·· subj:you ·· status:ship
- [round.missed.02] まだ. It comes back around. Next card. ·· ja:まだ ·· needs:rule.missRequeues ·· subj:you ·· status:ship
- [round.missed.03] なんでやねん. Happens to everyone but me. Next. ·· dialect:kansai ·· ja:なんでやねん ·· subj:him ·· status:ship
- [round.missed.04] Not this time. The deck remembers. ·· needs:rule.missRequeues ·· subj:you ·· status:ship
- [round.missed.05] 残念. Back it goes. Next one. ·· ja:残念 ·· needs:rule.missRequeues ·· subj:you ·· status:ship
- [round.missed.06] Missed. I'll deal it again later. 約束. ·· ja:約束 ·· needs:rule.missRequeues ·· subj:you ·· status:ship
- [round.missed.07] Not yet. Shake it off. はい次. ·· ja:はい次 ·· subj:you ·· status:ship
- [round.missed.08] おっと. That one got away. It'll be back. ·· ja:おっと ·· needs:rule.missRequeues ·· subj:you ·· status:ship

## reveal.kanji
- [reveal.kanji.01] There it is. 正直に. Did your ink match mine? ·· ja:正直に ·· status:ship

## earned.shiny
<!-- pool rewritten 2026-09-18 — reaction only, no card mechanics on drill screens (bible §8). Truth rule: none of these says kept / yours / earned. -->
- [earned.shiny.01] First try. ほう. I'm almost amused. Next one. ·· ja:ほう ·· subj:you ·· status:ship
- [earned.shiny.02] First try. Careful, I might start enjoying this. ·· subj:you ·· status:ship
- [earned.shiny.03] First try. Do that again and I'll notice. たぶん. ·· ja:たぶん ·· subj:you ·· status:ship
- [earned.shiny.04] First try. さすが. Don't let it go to your head. ·· ja:さすが ·· subj:you ·· status:ship
- [earned.shiny.05] First try. おっと. I nearly reacted. Next. ·· ja:おっと ·· subj:him ·· status:ship
- [earned.shiny.06] First try. まさか. Suspicious. Next one. ·· ja:まさか ·· subj:you ·· status:ship
- [earned.shiny.07] First try. My handwriting suits you. Next. ·· subj:him ·· status:ship
- [earned.shiny.08] First try. 見事. Now do it again. ·· ja:見事 ·· subj:you ·· status:ship
- [earned.shiny.09] One look and you had it. 完璧. Next. ·· ja:完璧 ·· subj:you ·· needs:rule.rarityByTries ·· status:ship
- [earned.shiny.10] First try. 上手. I saw that. Keep going. ·· ja:上手 ·· subj:you ·· status:ship

## earned.base
<!-- pool rewritten 2026-09-18 — reaction only, no card mechanics on drill screens (bible §8). Truth rule: none of these says kept / yours / earned. -->
- [earned.base.01] Second try. まあ. Better. Next one. ·· ja:まあ ·· subj:you ·· status:ship
- [earned.base.02] Second try. The first one was a warm-up. ·· subj:you ·· status:ship
- [earned.base.03] Second try. まあまあ. Next. ·· ja:まあまあ ·· subj:you ·· status:ship
- [earned.base.04] Second try. はい, I'll pretend I didn't see the first. ·· ja:はい ·· subj:you ·· status:ship
- [earned.base.05] Second try. That's the one. はい次. ·· ja:はい次 ·· subj:you ·· status:ship
- [earned.base.06] Two tries. One more than me. 当然. ·· ja:当然 ·· subj:him ·· needs:rule.rarityByTries ·· status:ship
- [earned.base.07] Second try. よし, we got there. Next one. ·· ja:よし ·· subj:you ·· status:ship
- [earned.base.08] Second try. Your hand caught up. なるほど. ·· ja:なるほど ·· subj:you ·· status:ship

## earned.worn
<!-- pool rewritten 2026-09-18 — reaction only, no card mechanics on drill screens (bible §8). Truth rule: none of these says kept / yours / earned. -->
- [earned.worn.01] Took a few. It stuck. やっと. Next one. ·· ja:やっと ·· subj:you ·· status:ship
- [earned.worn.02] {tries} tries. I enjoyed every miss. Next. ·· subj:you ·· status:ship
- [earned.worn.03] Took a few. That one fights everyone. 本当に. ·· ja:本当に ·· subj:you ·· status:ship
- [earned.worn.04] ゆっくり. Got there. That still counts as there. ·· ja:ゆっくり ·· subj:you ·· status:ship
- [earned.worn.05] Took a while. 余裕. I was never worried. Next. ·· ja:余裕 ·· subj:him ·· status:ship
- [earned.worn.06] {tries} tries. 根性. I respect that a little. ·· ja:根性 ·· subj:you ·· status:ship
- [earned.worn.07] Took a few. Your hand knows it now. はい次. ·· ja:はい次 ·· subj:you ·· status:ship
- [earned.worn.08] Many tries. 大丈夫? Next one. ·· ja:大丈夫 ·· subj:you ·· status:ship

## credits
- [credits.01] Other people's work, named. That's the deal. ·· status:ship

## set
- [set.01] {words} words, face down. さあ, deal when you're ready. ·· ja:さあ ·· needs:rule.dealsWholeSet ·· status:ship

## reveal.kana
- [reveal.kana.01] {chars} characters, one line. Did they all land? ·· when:chars>1 ·· status:ship
- [reveal.kana.02] One character, one box. Did it land? ·· when:chars=1 ·· status:ship

## result
- [result.01] {earned} cards earned, {shiny} shiny. お疲れ. Deal again whenever. ·· ja:お疲れ ·· when:shiny>0 ·· status:ship
- [result.02] {earned} cards earned. お疲れ. Deal again whenever. ·· ja:お疲れ ·· when:shiny=0 ·· status:ship

## once (global)
- [once.wholeWord] Whole word, one box. Make it fit. ·· once ·· when:script!=kanji ·· status:ship
