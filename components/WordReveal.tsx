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

import { useEffect, useRef } from "react";
import { createStrokePlayer, type StrokePlayer } from "@/lib/strokeAnimator";
import { isSmallKana, scopeSvgIds, strokeSvgPath } from "@/lib/strokes";

const SMALL_SCALE = 0.7;

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

  useEffect(() => {
    let dead = false;
    players.current = [];

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
        ready.push(player);
      });
      players.current = ready;

      const reduced =
        typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      if (reduced) {
        ready.forEach((p) => p.finish());
        onDone?.();
        return;
      }
      // left to right, one character at a time, at the drill's own speed
      for (const player of ready) {
        if (dead) return;
        await player.play();
      }
      if (!dead) onDone?.();
    })();

    return () => {
      dead = true;
      players.current.forEach((p) => p.cancel());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [word]);

  return (
    <div className="wordReveal" ref={holder} aria-hidden>
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

