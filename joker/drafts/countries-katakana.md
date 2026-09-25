# COUNTRIES (countries-katakana) — joker block, DRAFT 2 (2026-09-25)

**Set grown 12 → 21 (the ceiling), 2026-09-25:** ポルトガル オランダ イギリス エジプト トルコ モンゴル スイス
フィンランド ジャマイカ. Chosen for: no ー or ヴ (no stroke files for either), six kana or fewer (the card's
word size bottoms out at six), no country's kana inside another's (a `trigger` is a substring
match: インドネシア would fire India's lines), and a verifiable, warm link to Japan.

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
- [spain.vowels] Spanish vowels sound almost like Japanese ones. Easy listening. いいね. ·· trigger:スペイン ·· when:meaning ·· ja:いいね ·· subj:world
- [thailand.fish] タイ is Thailand. たい is a lucky fish. Both めでたい. ·· trigger:タイ ·· when:meaning ·· ja:たい,めでたい ·· subj:world
- [india.aiueo] The あいうえお order is based on Sanskrit. なるほど. ·· trigger:インド ·· when:meaning ·· ja:あいうえお,なるほど ·· subj:world
- [brazil.community] Brazil has the largest Japanese community abroad. すごい. ·· trigger:ブラジル ·· when:meaning ·· needs:world.brazil.largestNikkei ·· ja:すごい ·· subj:world
- [brazil.dakuten] ブラジル wears dakuten twice. Extra sparkle. きらきら. ·· trigger:ブラジル ·· ja:きらきら ·· subj:app
- [mexico.ink] Mexico's kanji nickname means ink. A writer's country. ほら. ·· trigger:メキシコ ·· when:meaning ·· ja:ほら ·· subj:world
- [philippines.small] フィリピン carries a small ィ. Tiny, and very important. だいじ. ·· trigger:フィリピン ·· ja:だいじ ·· subj:app
- [philippines.islands] Over seven thousand islands. Plenty of beaches. すてき. ·· trigger:フィリピン ·· when:meaning ·· needs:world.philippines.islands ·· ja:すてき ·· subj:world
- [vietnam.kanji] Vietnam once wrote with Chinese characters too. ほう. ·· trigger:ベトナム ·· when:meaning ·· ja:ほう ·· subj:world

### reveal.kana — the nine new countries
- [portugal.pan] パン, bread, came from Portuguese. A delicious import. おいしい. ·· trigger:ポルトガル ·· when:meaning ·· ja:パン,おいしい ·· subj:world
- [portugal.first] The first Europeans to reach Japan. Long voyage. すごい. ·· trigger:ポルトガル ·· when:meaning ·· ja:すごい ·· subj:world
- [netherlands.randoseru] ランドセル, the school backpack, is Dutch. Very well packed. ほら. ·· trigger:オランダ ·· when:meaning ·· ja:ランドセル,ほら ·· subj:world
- [netherlands.dejima] During さこく, Japan's only European trading partner. ほう. ·· trigger:オランダ ·· when:meaning ·· ja:さこく,ほう ·· subj:world
- [uk.left] Japan and the UK both drive on the left. ほら. ·· trigger:イギリス ·· when:meaning ·· ja:ほら ·· subj:world
- [uk.portuguese] イギリス came to Japanese through Portuguese. Scenic route. なるほど. ·· trigger:イギリス ·· ja:なるほど ·· subj:world
- [egypt.paper] Paper is named after papyrus. A very old word. ほう. ·· trigger:エジプト ·· when:meaning ·· ja:ほう ·· subj:world
- [turkey.yogurt] ヨーグルト comes from a Turkish word. Creamy. おいしい. ·· trigger:トルコ ·· when:meaning ·· ja:ヨーグルト,おいしい ·· subj:world
- [mongolia.yokozuna] Mongolia has given sumo several よこづな. Mighty. すごい. ·· trigger:モンゴル ·· when:meaning ·· ja:よこづな,すごい ·· subj:world
- [switzerland.suisui] スイス sounds like すいすい. That's how your pen moves. いいね. ·· trigger:スイス ·· ja:すいすい,いいね ·· subj:you
- [finland.moomin] Moomin is Finnish, and Japan built it a park. かわいい. ·· trigger:フィンランド ·· when:meaning ·· ja:かわいい ·· subj:world
- [jamaica.coffee] Japan drinks most of Jamaica's Blue Mountain coffee. Excellent taste. さすが. ·· trigger:ジャマイカ ·· when:meaning ·· needs:world.jamaica.blueMountain ·· ja:さすが ·· subj:world

## set — S6b
- [set.tour] {words} countries, all in katakana. World tour, no luggage. さあ. ·· ja:さあ ·· subj:you
- [set.stamps] Foreign names go in katakana. Every card, a stamp. どうぞ. ·· ja:どうぞ ·· subj:app

## round.kana — a clue per country (`trigger` = the word; creator ruling, bible §11.4)
Never the answer's kana, romaji or English name. Fires on the prompt, meaning on or off.
- [clue.america] Stars and stripes on this one. Very big skies. さあ. ·· trigger:アメリカ ·· ja:さあ ·· subj:world
- [clue.canada] Maple syrup country. Starts with a word you love. ふふ. ·· trigger:カナダ ·· ja:ふふ ·· subj:world
- [clue.france] Croissants, the Eiffel Tower, very good bread. さあ. ·· trigger:フランス ·· ja:さあ ·· subj:world
- [clue.germany] Pretzels, castles and precise engineering. どうぞ. ·· trigger:ドイツ ·· ja:どうぞ ·· subj:world
- [clue.italy] Pizza, pasta, and a boot-shaped coastline. おいしい. ·· trigger:イタリア ·· ja:おいしい ·· subj:world
- [clue.spain] Paella and flamenco. Olé, in katakana. さあ. ·· trigger:スペイン ·· ja:さあ ·· subj:world
- [clue.thailand] {chars} kana, the shortest trip in the deck. らくらく. ·· trigger:タイ ·· ja:らくらく ·· subj:world
- [clue.india] Curry, cricket, and the Taj Mahal. どうぞ. ·· trigger:インド ·· ja:どうぞ ·· subj:world
- [clue.brazil] Samba, football, and the Amazon. Let's dance. さあ. ·· trigger:ブラジル ·· ja:さあ ·· subj:world
- [clue.mexico] Tacos, mariachi, and very good avocados. おいしい. ·· trigger:メキシコ ·· ja:おいしい ·· subj:world
- [clue.philippines] Mangoes, jeepneys, and thousands of islands. すてき. ·· trigger:フィリピン ·· needs:world.philippines.islands ·· ja:すてき ·· subj:world
- [clue.vietnam] Phở, bánh mì, and a very long coastline. おいしい. ·· trigger:ベトナム ·· ja:おいしい ·· subj:world
- [clue.portugal] The first Europeans to reach Japan. Also, custard tarts. さあ. ·· trigger:ポルトガル ·· ja:さあ ·· subj:world
- [clue.netherlands] Tulips, windmills, and a lot of bicycles. どうぞ. ·· trigger:オランダ ·· ja:どうぞ ·· subj:world
- [clue.uk] Tea, double-decker buses, and Big Ben. どうぞ. ·· trigger:イギリス ·· ja:どうぞ ·· subj:world
- [clue.egypt] Pyramids, the Nile, and papyrus. Ancient and elegant. ほう. ·· trigger:エジプト ·· ja:ほう ·· subj:world
- [clue.turkey] Where Europe meets Asia. Kebabs and good tea. どうぞ. ·· trigger:トルコ ·· ja:どうぞ ·· subj:world
- [clue.mongolia] Wide steppes, horses, and many sumo champions. つよい. ·· trigger:モンゴル ·· ja:つよい ·· subj:world
- [clue.switzerland] Alps, chocolate, and very punctual watches. かんぺき. ·· trigger:スイス ·· ja:かんぺき ·· subj:world
- [clue.finland] Saunas, lakes, and a certain family of trolls. ほっこり. ·· trigger:フィンランド ·· ja:ほっこり ·· subj:world
- [clue.jamaica] Reggae, sprinters, and famous mountain coffee. いいね. ·· trigger:ジャマイカ ·· ja:いいね ·· subj:world

## round.kana — untriggered (any card)
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
- `world.jamaica.blueMountain` — Japan buys most (~70%) of Jamaica's Blue Mountain coffee. Proof: thebusinessyear.com (Wallenford interview) · en.wikipedia.org/wiki/Jamaican_Blue_Mountain_Coffee. Market share; re-check yearly.

## Sources for untagged facts (stable history/etymology)
米国 = rice (sljfaq.org/afaq/beikoku.html) · kanata = village (canada.ca, origin of the name) ·
アンケート < French enquête (Wiktionary) · ドイツ < Dutch duits (Wiktionary) · アルバイト < German
Arbeit (Wiktionary) · 鯛 / めでたい pun (foodinjapan.org) · gojūon order < Sanskrit/Siddham
(Wikipedia: Gojūon) · 墨 for Mexico (Wiktionary: 墨西哥) · Vietnam's chữ Hán (Wikipedia: Literary
Chinese in Vietnam) · Spanish/Japanese vowels (90dayjapanese.com) · パン < Portuguese pão and Portuguese
first Europeans in Japan, 1543 (sljfaq.org/afaq/portuguese.html) · ランドセル < Dutch ransel (Wikipedia:
Randoseru) · Dutch at Dejima during sakoku (Wikipedia: List of Japanese words of Dutch origin) · イギリス <
Portuguese Inglês (Wiktionary) · yogurt < Turkish yoğurt (etymonline.com/word/yogurt) · Mongolian
yokozuna (nippon.com: Terunofuji fifth from Mongolia) · Moominvalley Park, Hannō (japan-guide.com) ·
paper < papyrus (standard etymology).
