"use client";

// S2 / S2k / S3 — a deck is characters plus sets.
//
// Kana decks carry the characters card (the v3 drill) and their platform sets.
// Kanji has no alphabet to drill, so its deck is sets and nothing else.
// YOUR SETS and NEW SET are not in this build (SPEC-v5 §0.4).
//
// A set row shows what the set is and how many words it holds — no fraction,
// no bar, no stock count. A set is never finished, so there is nothing to fill
// (SPEC-v5a §3). The characters card keeps its fraction: it counts characters.

import type { Script } from "@/lib/kana";
import { useJokerLine, type JokerScreen } from "@/lib/joker-lines";
import type { WordSet } from "@/lib/sets";
import Joker from "./Joker";

const DECK_NAME: Record<Script | "kanji", string> = {
  hiragana: "HIRAGANA",
  katakana: "KATAKANA",
  kanji: "KANJI",
};

export default function Deck({
  script,
  glyph,
  sets,
  characters,
  onHome,
  onCharacters,
  onOpenSet,
}: {
  script: Script | "kanji";
  glyph: string;
  sets: WordSet[];
  /** kana decks only: the drill's count, total and dakuten toggle */
  characters?: {
    label: string;
    done: number;
    total: number;
    base: boolean;
    onToggle: (base: boolean) => void;
  };
  onHome: () => void;
  onCharacters: () => void;
  onOpenSet: (set: WordSet) => void;
}) {
  const line = useJokerLine(`deck.${script}` as JokerScreen);
  return (
    <main className="frame">
      <div className="livery" aria-hidden>
        <span className="ghost ghostHome">{glyph}</span>
      </div>

      <div className="screenHead">
        <button type="button" className="backLink" onClick={onHome}>
          ← HOME
        </button>
        <span className="screenTitle">
          {glyph} {DECK_NAME[script]}
        </span>
      </div>

      <Joker line={line.text} lineId={line.id} className="jokerDeck" />

      {characters && (
        <>
          <div className="legend legendSpaced">CHARACTERS</div>
          <button type="button" className="panel panelNotch deckCharacters" onClick={onCharacters}>
            <div className="deckCharactersTop">
              <span className="panelName">{characters.label}</span>
              <span className="panelCount">
                {characters.done}/{characters.total}
              </span>
            </div>
            <span
              className="bar barBone"
              style={{ "--fill": `${(characters.done / characters.total) * 100}%` } as React.CSSProperties}
            >
              <i />
            </span>
            <div className="deckDakuten">
              <span className="legend">DAKUTEN</span>
              <span className="toggle" role="radiogroup" aria-label="dakuten">
                <span
                  role="radio"
                  aria-checked={!characters.base}
                  className={`toggleOpt${characters.base ? "" : " toggleOn"}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    characters.onToggle(false);
                  }}
                >
                  ON
                </span>
                <span
                  role="radio"
                  aria-checked={characters.base}
                  className={`toggleOpt${characters.base ? " toggleOn" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    characters.onToggle(true);
                  }}
                >
                  OFF
                </span>
              </span>
            </div>
            <div className="deckNote">MISSED CARDS REPLAY UNTIL ZERO.</div>
          </button>
        </>
      )}

      <div className="legend legendSpaced">SETS</div>
      <div className="legend legendFaint">PLATFORM</div>
      {sets.map((set) => (
        <button
          type="button"
          key={set.id}
          className="panel panelNotch setRow"
          onClick={() => onOpenSet(set)}
        >
          <div className="setRowTop">
            <span className="setGlyph">{set.glyph}</span>
            <span className="setRowName">
              <span className="panelName">{set.name}</span>
              <span className="setRowMeta">{setDescription(set)}</span>
            </span>
            <span className="panelCount setRowWords">{set.words.length} WORDS</span>
          </div>
        </button>
      ))}

      <div className="grow" />
    </main>
  );
}

/**
 * The row's second line: what the set is, in the canvas's own words. It no
 * longer carries the word count — the count is the row's right-hand number
 * now that there is no fraction to show (SPEC-v5a §3).
 */
function setDescription(set: WordSet): string {
  if (set.blurb) return set.blurb;
  if (set.script === "kanji") return "EXITS, SIGNS";
  const longest = Math.max(...set.words.map((w) => w.word.length));
  return `≤${longest} KANA`;
}
