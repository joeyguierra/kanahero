# COUNTRIES (countries-katakana) — joker block, DRAFT 1 (2026-09-25)

Not bundled. Drafts stay here until cold read (bible §11.5: the app reads set JSON raw, so a
draft in the JSON would be live). On ship: move the line into `public/sets/countries-katakana.json`
under `joker.<key>` with `status: ship`, and add its `needs:` fact to `joker/facts.json`.

Creator direction: humorous fun facts about the countries, **always positive, never a jab**
(bible §12). Ids are shown without the `countries-katakana/` prefix, which they get on ship.

## reveal.kana — one fact per country (`trigger` = the word on the card)
Reveal is the only screen where the card's katakana may appear. Lines that name the country or its
meaning carry `when:meaning` (§11.4).
- [america.candy] アメ can mean candy or rain. America gets both. いいね. ·· trigger:アメリカ ·· when:meaning ·· ja:いいね ·· subj:world
- [america.rice] Japan's short name for America means rice. Delicious. すごい. ·· trigger:アメリカ ·· when:meaning ·· ja:すごい ·· subj:world
- [canada.kana] カナダ begins with カナ. Clearly your kind of country. とうぜん. ·· trigger:カナダ ·· ja:とうぜん ·· subj:you
- [canada.village] Canada comes from kanata, a word for village. Cozy. ほっこり. ·· trigger:カナダ ·· when:meaning ·· ja:ほっこり ·· subj:world
- [france.survey] アンケート, the survey, came from French. Elegant paperwork. ほら. ·· trigger:フランス ·· ja:アンケート,ほら ·· subj:world
- [germany.dutch] ドイツ reached Japanese through Dutch traders. Well-travelled word. なるほど. ·· trigger:ドイツ ·· ja:なるほど ·· subj:world
- [germany.arbeit] アルバイト, a part-time job, is German. Hard-working word. さすが. ·· trigger:ドイツ ·· ja:アルバイト,さすが ·· subj:world
- [germany.tsu] ドイツ ends in ツ: last stroke falls from the top. きれい. ·· trigger:ドイツ ·· ja:きれい ·· subj:app
- [italy.heritage] Italy has the most World Heritage sites. Handsome country. みごと. ·· trigger:イタリア ·· when:meaning ·· needs:world.italy.mostHeritage ·· ja:みごと ·· subj:world
- [spain.vowels] Spanish vowels sound almost like Japanese ones. Instant friends. いいね. ·· trigger:スペイン ·· when:meaning ·· ja:いいね ·· subj:world
- [thailand.fish] タイ is Thailand. たい is a lucky fish. Both めでたい. ·· trigger:タイ ·· when:meaning ·· ja:たい,めでたい ·· subj:world
- [india.aiueo] The あいうえお order is based on Sanskrit. ありがとう, India. ·· trigger:インド ·· when:meaning ·· ja:あいうえお,ありがとう ·· subj:world
- [brazil.community] Brazil has the largest Japanese community abroad. なかま. ·· trigger:ブラジル ·· when:meaning ·· needs:world.brazil.largestNikkei ·· ja:なかま ·· subj:world
- [brazil.dakuten] ブラジル wears dakuten twice. Extra sparkle. きらきら. ·· trigger:ブラジル ·· ja:きらきら ·· subj:app
- [mexico.ink] Mexico's kanji nickname means ink. A writer's country. ほら. ·· trigger:メキシコ ·· when:meaning ·· ja:ほら ·· subj:world
- [philippines.small] フィリピン carries a small ィ. Tiny, and very important. だいじ. ·· trigger:フィリピン ·· ja:だいじ ·· subj:app
- [philippines.islands] Over seven thousand islands. Plenty of beaches. すてき. ·· trigger:フィリピン ·· when:meaning ·· needs:world.philippines.islands ·· ja:すてき ·· subj:world
- [vietnam.kanji] Vietnam once wrote with Chinese characters too. Kanji cousins. ほう. ·· trigger:ベトナム ·· when:meaning ·· ja:ほう ·· subj:world

## set — S6b
- [set.tour] {words} countries, all in katakana. World tour, no luggage. さあ. ·· ja:さあ ·· subj:you
- [set.stamps] Foreign names go in katakana. Every card, a stamp. どうぞ. ·· ja:どうぞ ·· subj:app

## round.kana — the prompt (no answer kana, no meaning)
- [round.passport] A country, in katakana. Your pen is the passport. さあ. ·· ja:さあ ·· subj:you
- [round.sounds] Sound it out. Katakana spells it the Japanese way. どうぞ. ·· ja:どうぞ ·· subj:app

## earned.* — untriggered (§11.5 gap 2)
- [shiny.passport] First try. Passport-perfect handwriting. かんぺき. ·· pool:earned.shiny ·· ja:かんぺき ·· subj:you
- [shiny.customs] First try. Customs would wave you straight through. すごい. ·· pool:earned.shiny ·· ja:すごい ·· subj:you
- [base.landing] Second try. Smooth landing. よし. ·· pool:earned.base ·· ja:よし ·· subj:you
- [base.arrived] Second try. Arrived safely. はいつぎ. ·· pool:earned.base ·· ja:はいつぎ ·· subj:you
- [worn.flight] Took a few. Long flight, safe landing. ようこそ. ·· pool:earned.worn ·· ja:ようこそ ·· subj:you
- [worn.trip] {tries} tries. Every country is worth the trip. いいね. ·· pool:earned.worn ·· ja:いいね ·· subj:you

## round.missed
- [missed.stay] It comes back around. Countries don't go anywhere. だいじょうぶ. ·· needs:rule.missRequeues ·· ja:だいじょうぶ ·· subj:you
- [missed.visit] Back in the deck. Good places deserve a second visit. また. ·· needs:rule.missRequeues ·· ja:また ·· subj:you

## result
- [result.tour] {earned} countries earned. Well travelled. おつかれ. ·· when:shiny=0 ·· ja:おつかれ ·· subj:you
- [result.shiny] {earned} countries, {shiny} shiny. A beautiful world tour. おつかれ. ·· when:shiny>0 ·· ja:おつかれ ·· subj:you

## collection
- [collection.passport] Every country you've written, card by card. Quite the passport. ほら. ·· ja:ほら ·· subj:you

## once — HINT, creator to rule (§11.4)
- [once.smallI] This one needs a small ィ. Tiny, but it matters. だいじ. ·· trigger:フィリピン ·· ja:だいじ ·· subj:you

## Facts to add to joker/facts.json on ship
- `world.italy.mostHeritage` — Italy has the most UNESCO World Heritage sites. Proof: whc.unesco.org/en/statesparties/it · Statista chart 23622. **Re-check each July** (the committee meets yearly; China is close).
- `world.brazil.largestNikkei` — largest Japanese-descent population outside Japan (~2M). Proof: en.wikipedia.org/wiki/Japanese_Brazilians.
- `world.philippines.islands` — 7,641 islands (NAMRIA, 2017). Proof: en.wikipedia.org/wiki/List_of_islands_of_the_Philippines.

## Sources for untagged facts (stable history/etymology)
米国 = rice (sljfaq.org/afaq/beikoku.html) · kanata = village (canada.ca, origin of the name) ·
アンケート < French enquête (Wiktionary) · ドイツ < Dutch duits (Wiktionary) · アルバイト < German
Arbeit (Wiktionary) · 鯛 / めでたい pun (foodinjapan.org) · gojūon order < Sanskrit/Siddham
(Wikipedia: Gojūon) · 墨 for Mexico (Wiktionary: 墨西哥) · Vietnam's chữ Hán (Wikipedia: Literary
Chinese in Vietnam) · Spanish/Japanese vowels (90dayjapanese.com).
