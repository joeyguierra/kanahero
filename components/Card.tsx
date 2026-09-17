"use client";

// One card component, two prompt faces and three earned faces, four sizes.
//
// The one semantic rule (CARD sheet): a card is earned, never shown. Before
// the first correct write the word exists only as a prompt — no kanji on a
// kanji prompt, no kana on a kana prompt, not even as a watermark. The word's
// first appearance is the earned face.
//
// Type steps down with word length and nothing wraps: the word is sized in
// cqw against the card's own width, so one component covers 214px and 46px.

import type { Ref } from "react";

import type { MintedCard } from "@/lib/joker";
import type { SetWord, WordSet } from "@/lib/sets";

export type CardSize = "round" | "earn" | "fan" | "grid" | "shelf";

/** width in cqw for a word of N characters, measured off the CARD sheet */
const WORD_CQW = [43, 43, 34.6, 24.3, 18.7, 15.9, 13];
/** the smaller sizes carry more chrome per pixel, so the word gives a little */
const SIZE_SCALE: Record<CardSize, number> = {
  earn: 1,
  round: 0.95,
  fan: 0.78,
  // the shelf card is the fan card's twin, sized by its column instead of
  // fixed — half of the earn face, which is where the 0.78 comes from
  shelf: 0.78,
  grid: 0.82,
};

function wordSize(size: CardSize, chars: number): string {
  const cqw = WORD_CQW[Math.min(chars, WORD_CQW.length - 1)] * SIZE_SCALE[size];
  return `${cqw.toFixed(1)}cqw`;
}

/** the kanji prompt's reading: 34px at 150px wide, stepped down so five kana
    still sit on one line inside the card's padding */
function readingSize(chars: number): string {
  return `${Math.min(22.7, 84 / chars).toFixed(1)}cqw`;
}

/** the kana prompt's romaji: same idea, Latin letters being narrower */
function romajiSize(chars: number): string {
  return `${Math.min(14.7, 135 / chars).toFixed(1)}cqw`;
}

const RARITY_TRY: Record<string, string> = { shiny: "1st TRY", base: "2nd TRY", worn: "TRIES" };

export default function Card({
  word,
  set,
  size,
  card,
  stamp = true,
  /** replaces the footer's kind line while a round is flipped: ATTEMPT n */
  attempt,
  onClick,
  className = "",
}: {
  word: SetWord;
  set: WordSet;
  size: CardSize;
  /** present = the earned face; absent = the prompt face */
  card?: MintedCard;
  /** false: the face without its rarity stamp */
  stamp?: boolean;
  attempt?: number;
  onClick?: () => void;
  className?: string;
}) {
  const kanji = set.script === "kanji";
  const mark = kanji ? (set.place ?? set.glyph) : set.glyph;
  const kindWord = kanji ? (set.label ?? "PLACE") : "WORD";
  const compact = size === "fan" || size === "grid" || size === "shelf";
  const classes = [
    "card",
    `card-${size}`,
    // an unstamped face carries no stock either — S6d says what a word's
    // copies are in its columns, and a mixed row has no one rarity to wear
    card ? `card-${stamp ? card.rarity : "plain"}` : "card-prompt",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const body = card ? (
    // ---- earned: the word's first appearance ----
    compact ? (
      <>
        {stamp && (
          <div className="cardChip">
            {card.rarity.toUpperCase()}
            {size === "fan" ? ` · ${card.tries}` : ""}
          </div>
        )}
        <div className="cardMid">
          <span className="cardWord" style={{ fontSize: wordSize(size, word.word.length) }}>
            {word.word}
          </span>
        </div>
        <div className="cardRomaji">{word.romaji.toUpperCase()}</div>
      </>
    ) : (
      <>
        <div className="cardHead">
          <span className="cardChip">
            {stamp
              ? `${card.rarity.toUpperCase()} · ${card.rarity === "worn" ? `${card.tries} ` : ""}${RARITY_TRY[card.rarity]}`
              : "COLLECTED"}
          </span>
          <span className="cardMark">{mark}</span>
        </div>
        <div className="cardMid">
          <span className="cardRomaji">{word.romaji.toUpperCase()}</span>
          <span className="cardWord" style={{ fontSize: wordSize(size, word.word.length) }}>
            {word.word}
          </span>
          {kanji && <span className="cardReading">{word.reading}</span>}
        </div>
        <div className="cardFoot">
          <span className="cardRule" />
          <span className="cardMeaning">{word.meaning.toUpperCase()}</span>
          <span className="cardKind">
            {kindWord} · {mark} {set.name}
          </span>
        </div>
      </>
    )
  ) : (
    // ---- prompt: everything but the word ----
    <>
      <div className="cardHead">
        <span className="cardChip cardChipPlain">PROMPT</span>
        <span className="cardMark cardMarkStrike">{mark}</span>
      </div>
      <div className="cardMid">
        {kanji ? (
          <>
            <span
              className="cardReading cardReadingBig"
              style={{ fontSize: readingSize([...word.reading].length) }}
            >
              {word.reading}
            </span>
            <span className="cardRomaji">{word.romaji.toUpperCase()}</span>
          </>
        ) : (
          <>
            <span
              className="cardPromptRomaji"
              style={{ fontSize: romajiSize(word.romaji.length) }}
            >
              {word.romaji.toUpperCase()}
            </span>
            <span className="cardRomaji">{word.word.length} KANA</span>
          </>
        )}
      </div>
      <div className="cardFoot">
        <span className="cardRule" />
        <span className="cardMeaning">{word.meaning.toUpperCase()}</span>
        <span className="cardKind">
          {attempt !== undefined
            ? `ATTEMPT ${attempt}`
            : `${kindWord} · NO ${kanji ? "KANJI" : "KANA"} YET`}
        </span>
      </div>
    </>
  );

  if (onClick) {
    return (
      <button type="button" className={classes} onClick={onClick}>
        {body}
      </button>
    );
  }
  return <div className={classes}>{body}</div>;
}

/** the face-down back: deck mark on stripe, no word anywhere */
export function CardBack({
  set,
  onClick,
  className = "",
  /** the S6b deal animates each back from the Joker's hand into its slot */
  ref,
}: {
  set: WordSet;
  onClick?: () => void;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}) {
  const mark = set.script === "kanji" ? (set.place ?? set.glyph) : set.glyph;
  const body = <span className="cardBackMark">{mark}</span>;
  const classes = `card card-back ${className}`.trim();
  return onClick ? (
    <button type="button" className={classes} onClick={onClick}>
      {body}
    </button>
  ) : (
    <div className={classes} ref={ref}>
      {body}
    </div>
  );
}
