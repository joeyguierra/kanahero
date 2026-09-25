"use client";

// The card, front and centre, and the only place its receipt can be seen
// (SPEC-v6 §5). One overlay for the two screens that open an earned face:
// S8's tap-to-view (one card, from run state) and S6d's (every copy of one
// stock, newest first, on a track).
//
// Tap outside closes; a tap on the card does nothing. Hold the card and it
// turns into its receipt in place — the chip stays, the body becomes the ink
// with the model over it, the foot reads the attempt — and writes itself out
// while you hold. Release and the printed face is back. Enter or Space toggle
// the same thing for anyone who cannot hold.
//
// On open the first card shows its ink first, holds half a second, and the
// print fades in over it: the ink drying into the card. Once per open, first
// card only, and never under reduced motion — the legend under the card does
// the teaching there.

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import type { InkSnapshot } from "@/lib/ink";
import type { EarnedCard } from "@/lib/joker";
import type { SetWord, WordSet } from "@/lib/sets";
import Card from "./Card";

/** how long a finger stays still before the card turns over */
const HOLD_MS = 150;
/** the opening: ink for this long… */
const FLASH_INK_MS = 500;
/** …then the print comes in over it (must match the CSS transition) */
const FLASH_FADE_MS = 300;
/** the track: card width plus the gap, the distance from one snap to the next */
const CARD_W = 214;
const GAP = 36;

export interface ViewCard {
  word: SetWord;
  card: EarnedCard;
  /** the receipt, if this copy has one */
  ink?: InkSnapshot;
  /** when the copy was earned — the chip prints it */
  earnedAt?: number;
  /** the legacy card: how many copies of this stock have no receipt */
  legacy?: number;
}

/** `9-18-26` — month, day, two-digit year, no leading zeros, local time */
export function stampDate(ms: number): string {
  const d = new Date(ms);
  return `${d.getMonth() + 1}-${d.getDate()}-${String(d.getFullYear()).slice(-2)}`;
}

function chipFor(view: ViewCard): string | undefined {
  if (view.legacy !== undefined) return `×${view.legacy}`;
  if (view.ink && view.earnedAt !== undefined) return stampDate(view.earnedAt);
  return undefined;
}

function reduced(): boolean {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

type Flash = "ink" | "fade" | null;

function ReceiptCard({
  set,
  view,
  flash,
}: {
  set: WordSet;
  view: ViewCard;
  /** the opening, driven from above: ink showing, or fading to print */
  flash: Flash;
}) {
  const [held, setHeld] = useState(false);
  const timer = useRef<number | null>(null);
  const button = useRef<HTMLButtonElement>(null);
  const ink = view.ink;

  const arm = (e: PointerEvent<HTMLButtonElement>) => {
    if (!ink || e.button !== 0) return;
    disarm();
    const id = e.pointerId;
    timer.current = window.setTimeout(() => {
      timer.current = null;
      // captured, so a thumb that drifts keeps the hold; a thumb that pans
      // never gets here — the browser's pan cancels the pointer first
      try {
        button.current?.setPointerCapture(id);
      } catch {
        /* a pointer that is already gone */
      }
      setHeld(true);
    }, HOLD_MS);
  };
  function disarm() {
    if (timer.current !== null) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }
  const release = () => {
    disarm();
    setHeld(false);
  };

  useEffect(() => disarm, []);

  const toggle = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (!ink || (e.key !== "Enter" && e.key !== " ")) return;
    e.preventDefault();
    setHeld((h) => !h);
  };

  const chip = chipFor(view);
  // the held face is mounted only while it is wanted — the ink is drawn on
  // demand and the model's strokes are fetched with it
  const show = held ? "on" : flash;

  return (
    <button
      ref={button}
      type="button"
      className={`receiptCard${ink ? " receiptCardInk" : ""}`}
      data-ink={show ?? undefined}
      aria-label={ink ? `${view.word.word} — hold for your ink` : view.word.word}
      onPointerDown={arm}
      onPointerUp={release}
      onPointerCancel={release}
      onLostPointerCapture={release}
      onPointerLeave={() => {
        // a pointer that leaves before the hold lands was a tap or a pan;
        // once captured it cannot leave
        if (!held) disarm();
      }}
      onKeyDown={toggle}
      onContextMenu={(e) => e.preventDefault()}
    >
      <Card word={view.word} set={set} size="earn" card={view.card} chip={chip} />
      {ink && show && (
        <Card
          word={view.word}
          set={set}
          size="earn"
          card={view.card}
          chip={chip}
          held={{ ink, tries: view.card.tries, play: held }}
          className="receiptHeld"
        />
      )}
    </button>
  );
}

export default function CardView({
  set,
  cards,
  onClose,
}: {
  set: WordSet;
  /** one card, or every copy of one stock, newest first, legacy card last */
  cards: ViewCard[];
  onClose: () => void;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  // the opening — ink first, then print. First card only, once per open, and
  // not under reduced motion: the legend does the teaching there
  const [flash, setFlash] = useState<Flash>(() =>
    cards[0]?.ink && typeof window !== "undefined" && !reduced() ? "ink" : null,
  );
  const many = cards.length > 1;
  const current = cards[Math.min(index, cards.length - 1)];

  useEffect(() => {
    if (flash !== "ink") return;
    const fade = window.setTimeout(() => setFlash("fade"), FLASH_INK_MS);
    const done = window.setTimeout(() => setFlash(null), FLASH_INK_MS + FLASH_FADE_MS);
    return () => {
      clearTimeout(fade);
      clearTimeout(done);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the timers run once, from the opening
  }, []);

  const step = (by: number) => {
    const next = Math.max(0, Math.min(cards.length - 1, index + by));
    track.current?.scrollTo({ left: next * (CARD_W + GAP), behavior: reduced() ? "auto" : "smooth" });
    setIndex(next);
  };

  return (
    <div
      className={`cardOverlay cardView${many ? " cardViewMany" : ""}`}
      role="dialog"
      onClick={(e) => {
        // the overlay swallows the tap whatever it was on; only a tap on the
        // backdrop — not the card, not the pager — puts the card back
        e.stopPropagation();
        const on = e.target as HTMLElement;
        if (on.closest(".receiptCard, .receiptPager")) return;
        onClose();
      }}
    >
      <div
        className="receiptTrack"
        ref={track}
        onScroll={(e) => {
          const at = Math.round(e.currentTarget.scrollLeft / (CARD_W + GAP));
          if (at !== index) setIndex(Math.max(0, Math.min(cards.length - 1, at)));
        }}
      >
        {cards.map((view, i) => (
          <ReceiptCard
            key={`${view.word.word}-${view.earnedAt ?? "legacy"}-${i}`}
            set={set}
            view={view}
            flash={i === 0 ? flash : null}
          />
        ))}
      </div>

      {/* the row is always there, blank on a card with no ink, so the pager
          under it does not jump when the track lands on the legacy card */}
      <div className={`legend receiptLegend${current?.ink ? "" : " receiptLegendBlank"}`} aria-hidden={!current?.ink}>
        HOLD · YOUR INK
      </div>

      {many && (
        <div className="receiptPager">
          <button
            type="button"
            className="receiptStep"
            aria-label="Previous copy"
            disabled={index === 0}
            onClick={() => step(-1)}
          >
            ‹
          </button>
          <span className="detailPosition receiptPage">
            {index + 1} / {cards.length}
          </span>
          <button
            type="button"
            className="receiptStep"
            aria-label="Next copy"
            disabled={index === cards.length - 1}
            onClick={() => step(1)}
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
