> 🗄 **HISTORY — not the live corpus.** Drafts 1 and 2 of `home` and their cold-read verdicts,
> kept for the reasoning trail. Live lines: `joker/corpus.md`. Laws: `joker-character.md` §READ FIRST.

# The Joker — corpus (draft)

Governed by `joker-character.md`. One pool per screen key. Format per line:
`- text` then optional ` ·· ` tags: `when:` conditions, `ja:` seeded words, `engine:` the joke
engine (audit only — never ships). Status per pool in its heading.

## `home` — DRAFT 1 (2026-09-17) · SUPERSEDED by draft 2 below — creator read: too much about him, too vague. Eight lines survived.

### common
- Every deck here is mine. Pick one anyway. ·· engine:owner
- The decks are mine. The ink is yours. Pick. ·· engine:owner
- Pick a deck. I will try to keep it fair. ·· engine:owner
- They named the app after me. Choose a deck. ·· engine:title
- いらっしゃい. The hero is in. Pick a deck. ·· ja:いらっしゃい ·· engine:title
- I warmed up the deck. どうぞ. ·· ja:どうぞ ·· engine:prep
- I shuffled already. You are welcome. ·· engine:prep
- I am ready. I am always ready. Pick a deck. ·· engine:prep
- My strokes are ready. Bring your pen. ·· engine:hand
- Every answer in here is in my handwriting. Pick a deck. ·· engine:hand
- I have never missed a stroke. Pick a deck and watch. ·· engine:hand
- My handwriting will not admire itself. Pick a deck. ·· engine:hand
- You hold the pen. I handle the being correct. ·· engine:roles
- The hero deals. The assistant writes. どうぞ. ·· ja:どうぞ ·· engine:roles
- Good, my assistant is here. Pick a deck. ·· engine:roles
- I deal, you write, I am proven right. Pick one. ·· engine:roles
- Hiragana, katakana, kanji. I am excellent at all three. ·· engine:range
- Pick a deck. I will be magnificent in any of them. ·· engine:range
- Any deck. I look good in all of them. ·· engine:range
- よし. Pick a deck. I feel sharp today. ·· ja:よし ·· engine:mood
- 俺の出番だ. Pick a deck. ·· ja:俺,出番 ·· engine:mood
- こんにちは. Pick a deck, I'll deal, you write. ·· ja:こんにちは ·· engine:plain
- Choose a deck. I will deal. You will try. ·· engine:plain
- Back for more of my handwriting. 当然. ·· when:!firstEver ·· ja:当然 ·· engine:inevitable
- You again. I knew you would be back. ·· when:!firstEver ·· engine:inevitable
- さあ. Show me what my teaching has done. ·· when:runsFinished>0 ·· ja:さあ ·· engine:inevitable

### conditional
- I am the Kana Hero. You may hold the pen. ·· when:firstEver ·· once ·· engine:title
- Nothing minted yet. Pick a deck and fix that. ·· when:!firstEver,runsFinished=0 ·· engine:plain

### rare
- The tag says JOKER. I have filed a complaint. ·· engine:meta
- 俺. That is my word for I. Not for work. ·· when:runsFinished>=20 ·· ja:俺 ·· engine:meta

---

## `home` — DRAFT 2 (2026-09-17) · written against the amended bible · ✅ cold read passed, no cuts (creator, 2026-09-17) — this pool is the style reference for every other pool

Tags add `subj:` — who the line is about (`you` / `app` / `him`). Audit target: `him` ≤ 1 in 3,
and every `him` line must be service ego, never status ego.

### kept verbatim from draft 1 (creator's picks)
- よし. Pick a deck. I feel sharp today. ·· ja:よし ·· subj:him
- Choose a deck. I will deal. You will try. ·· subj:you
- Back for more of my handwriting. 当然. ·· when:!firstEver ·· ja:当然 ·· subj:you
- You again. I knew you would be back. ·· when:!firstEver ·· subj:you
- My strokes are ready. Bring your pen. ·· subj:him
- I warmed up the deck. どうぞ. ·· ja:どうぞ ·· subj:him
- Every answer in here is in my handwriting. Pick a deck. ·· subj:app
- I shuffled already. You are welcome. ·· subj:him

### how the app works
- You write, I reveal, you grade yourself. I trust you. Mostly. ·· subj:you
- First try means a shiny card. No pressure. Some pressure. ·· subj:you
- Finish the run or keep nothing. My house, my rules. ·· subj:app
- Miss a word and it comes back later. 大丈夫. ·· ja:大丈夫 ·· subj:you
- Nobody grades you here but you. I just watch. Closely. ·· subj:you
- Every run deals the whole set, shuffled. No memorizing my order. ·· subj:app
- Works with no signal. Your excuses will need to be better. ·· subj:you
- Can't read a sign? Photograph it. The bank remembers. ·· subj:you
- No timer, no score, no one watching. Except me. ·· subj:you
- I give the sound. The shape comes from you. ·· subj:you

### what the decks are
- いらっしゃい. Three scripts, one rule: write it before you see it. ·· ja:いらっしゃい ·· subj:app
- Hiragana first, if you are new. Everything else leans on it. ·· subj:you
- Katakana spells borrowed words. Coffee, taxi, probably your name. ·· subj:you
- Kanji carry meaning, not sound. Start with the station signs. ·· subj:app
- Hiragana, katakana, kanji. I'll make you excellent, like me. ·· subj:you
- Strokes go top to bottom, left to right. Mostly. Watch me. ·· subj:app
- Recognizing is easy. Writing is why you're here. 頑張って. ·· ja:頑張って ·· subj:you

### reactive — real numbers from storage, never estimated
- {bank} characters in the bank, unread. We can fix that. ·· when:bank>0 ·· subj:you
- {shiny} shiny cards so far. I am almost impressed. ·· when:shiny>0 ·· subj:you
- No shiny yet. One word, first try. That's all it takes. ·· when:runsFinished>0,shiny=0 ·· subj:you
- Nothing minted yet. Finish one run and the cards stay. ·· when:!firstEver,runsFinished=0 ·· subj:you
- お帰り. Your cards are right where you left them. ·· when:runsFinished>0 ·· ja:お帰り ·· subj:you
- さあ. Same deal as always: I show, you grade, honestly. ·· when:!firstEver ·· ja:さあ ·· subj:you

### once
- I'm the Joker. I deal, you write. Pick a deck. ·· when:firstEver ·· once ·· subj:app
