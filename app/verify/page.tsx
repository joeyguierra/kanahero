"use client";

// Stroke-data acceptance page: renders every character the app can ask for,
// animating, so the vendored data can be eyeballed before anything is built on
// top of it. Not part of the app's screens — it exists for verification only.
//
// Two sources have to pass as one hand: strokesvg for kana (Klee One outlines)
// and KanjiVG for kanji (centerlines, normalized by scripts/fetch-kanjivg.mjs).
// あ and 出 sit side by side at the top at the same size and speed so the two
// can be compared directly — that comparison is the gate (SPEC-v5 STEP 0).

import { useEffect, useState } from "react";
import { HIRAGANA, KATAKANA } from "@/lib/kana";
import { charsInWords, loadWords, type Word } from "@/lib/words";
import StrokeChar from "@/components/StrokeChar";

const ALL = [...HIRAGANA, ...KATAKANA];

export default function VerifyPage() {
  const [run, setRun] = useState(0);
  const [words, setWords] = useState<Word[] | null>(null);
  const [wordsError, setWordsError] = useState<string | null>(null);

  useEffect(() => {
    loadWords().then(setWords, (e: Error) => setWordsError(e.message));
  }, []);

  return (
    <main className="verify" key={run}>
      <header className="verifyHeader">
        <h1>stroke data check — {ALL.length} kana + every list character</h1>
        <p>
          Each tile should draw the way a pen writes: stroke by stroke, in order, each stroke
          growing from its start point. Tap a tile to replay it.
        </p>
        <button type="button" className="verifyReplay" onClick={() => setRun((n) => n + 1)}>
          Replay all
        </button>
      </header>

      <section className="verifyCompare">
        <h2>the two hands, same size, same speed</h2>
        <p>
          Left: strokesvg, the kana source. Right: KanjiVG, normalized to the same 1024 box.
          They should look drawn by one pen — same weight, same round ends.
        </p>
        <div className="verifyPair">
          <StrokeChar char="あ" label="あ · strokesvg" size={220} />
          <StrokeChar char="出" label="出 · kanjivg" size={220} />
        </div>
      </section>

      {wordsError && <p className="strokeCharError">word list failed to load: {wordsError}</p>}
      {words && (
        <section className="verifySet">
          <h2>
            the word list <span className="verifySetMeta">n5</span>
          </h2>
          <p>
            {words.length} words · {charsInWords(words).length} distinct characters
          </p>
          <div className="verifyGrid">
            {charsInWords(words).map((char) => (
              <StrokeChar
                key={char}
                char={char}
                label={words.find((w) => w.write.includes(char))!.write}
              />
            ))}
          </div>
        </section>
      )}

      <section className="verifySet">
        <h2>
          every kana <span className="verifySetMeta">strokesvg</span>
        </h2>
        <p>{ALL.length} characters — the base the drill runs on.</p>
        <div className="verifyGrid">
          {ALL.map((kana) => (
            <StrokeChar key={kana.hex} char={kana.kana} label={kana.romaji} />
          ))}
        </div>
      </section>

      <footer className="verifyFooter">
        Kana stroke data from strokesvg (MIT), derived from Klee One (SIL OFL 1.1). Kanji stroke
        data from <a href="https://kanjivg.tagaini.net/">KanjiVG</a> (CC BY-SA 3.0) —{" "}
        <a href="/licenses/NOTICE.txt">licenses</a>
      </footer>
    </main>
  );
}
