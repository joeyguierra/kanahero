"use client";

// The whole-word reveal — the only new canvas code in v5 (SPEC-v5 §4).
//
// On FLIP the model word draws over the user's ink: N characters, one cell of
// canvasWidth / N each, vertically centred, no cell lines. Glyph scale is the
// cell width against the 1024 viewBox the stroke files share, so kanji and
// kana lay out through the same code — 改札 is two cells, 駅 is one, ありがとう
// is five. Small kana render at 0.7x, bottom-left in their cell.
//
// The user's ink is never touched. The comparison is the grading.
//
// A tap through it, the way S8's reveal takes one: the first tap hurries the
// rest of the word over at FAST times the pen's pace — every stroke still
// draws, in order, it just stops taking its time — and a second tap snaps
// the whole word finished. The taps land on the reveal layer itself, which
// covers the frozen canvas exactly.

import { useEffect, useRef } from "react";
import { createStrokePlayer, type StrokePlayer } from "@/lib/strokeAnimator";
import { isSmallKana, scopeSvgIds, strokeSvgPath } from "@/lib/strokes";

const SMALL_SCALE = 0.7;
/** the pen's pace, multiplied, after the first tap */
const FAST = 3;

export default function WordReveal({
  word,
  onDone,
}: {
  word: string;
  /** fires when the last character has finished drawing */
  onDone?: () => void;
}) {
  const holder = useRef<HTMLDivElement>(null);
  const players = useRef<StrokePlayer[]>([]);
  const chars = [...word];
  /** taps so far on this word: one hurries, two finishes */
  const taps = useRef(0);
  /** the word is on screen whole, by drawing, by snap, or by reduced motion */
  const done = useRef(false);

  const finish = () => {
    if (done.current) return;
    done.current = true;
    onDone?.();
  };

  const tap = () => {
    if (done.current) return;
    taps.current += 1;
    if (taps.current === 1) {
      // players still on the wire pick the pace up when they mount (below)
      players.current.forEach((p) => p.hurry(FAST));
      return;
    }
    players.current.forEach((p) => p.finish());
    finish();
  };

  useEffect(() => {
    let dead = false;
    players.current = [];
    taps.current = 0;
    done.current = false;

    (async () => {
      const cells = Array.from(
        holder.current?.querySelectorAll<HTMLDivElement>("[data-cell]") ?? [],
      );
      // load every cell first: the word should start drawing as a word, not
      // stutter while the third character is still on the wire
      const files = await Promise.all(
        chars.map(async (char) => {
          try {
            const res = await fetch(strokeSvgPath(char));
            return res.ok ? await res.text() : null;
          } catch {
            return null;
          }
        }),
      );
      if (dead) return;

      const ready: StrokePlayer[] = [];
      files.forEach((text, i) => {
        const cell = cells[i];
        if (!text || !cell) return;
        cell.innerHTML = scopeSvgIds(text, `r${i}`);
        const svg = cell.querySelector("svg");
        if (!svg) return;
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "100%");
        const player = createStrokePlayer(svg as SVGSVGElement);
        // hide it the moment it mounts: a cell that has not had its turn must
        // be blank, not a finished character waiting to be animated over
        player.hide();
        // a tap that landed while the files were loading still counts
        if (taps.current >= 1) player.hurry(FAST);
        ready.push(player);
      });
      players.current = ready;

      const reduced =
        typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      if (reduced || taps.current >= 2) {
        ready.forEach((p) => p.finish());
        finish();
        return;
      }
      // left to right, one character at a time, at the drill's own speed
      for (const player of ready) {
        if (dead || done.current) return;
        await player.play();
      }
      if (!dead) finish();
    })();

    return () => {
      dead = true;
      players.current.forEach((p) => p.cancel());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [word]);

  return (
    <div className="wordReveal" ref={holder} aria-hidden onClick={tap}>
      {chars.map((char, i) => (
        <div
          className="wordRevealCell"
          key={`${char}-${i}`}
          style={{ width: `${100 / chars.length}%` }}
        >
          <div
            data-cell
            className={`wordRevealGlyph${isSmallKana(char) ? " wordRevealSmall" : ""}`}
            style={isSmallKana(char) ? { transform: `scale(${SMALL_SCALE})` } : undefined}
          />
        </div>
      ))}
    </div>
  );
}

