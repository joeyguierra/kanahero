"use client";

// Screens 2 & 3: the writing loop. Prompt and Reveal are the same screen in
// two states — the card flips in place (Strike border marks the flipped
// state) and the canvas never moves, so the stroke animation lands exactly
// on top of the attempt.

import { useRef, useState } from "react";
import type { Kana } from "@/lib/kana";
import { requeue } from "@/lib/session";
import type { StrokePlayer } from "@/lib/strokeAnimator";
import WritingCanvas, { type WritingCanvasHandle } from "./WritingCanvas";
import StrokeOverlay from "./StrokeOverlay";

export interface SessionSummary {
  /** newly written from memory — first-attempt Got it, not already earned */
  earned: number;
  /** cards cleared on the first attempt */
  got: number;
  /** cards fumbled at least once, in the order they came up */
  missed: Kana[];
}

export default function Session({
  deck,
  trackLabel,
  earnKana,
  onQuit,
  onFinish,
}: {
  deck: Kana[];
  trackLabel: string;
  /** returns true if this kana was newly earned */
  earnKana: (kana: string) => boolean;
  onQuit: () => void;
  onFinish: (summary: SessionSummary) => void;
}) {
  const [queue, setQueue] = useState<Kana[]>(deck);
  const [phase, setPhase] = useState<"prompt" | "reveal">("prompt");
  const [hasInk, setHasInk] = useState(false);
  const [strokeCount, setStrokeCount] = useState<number | null>(null);
  const [strokeNow, setStrokeNow] = useState(0);
  const canvasRef = useRef<WritingCanvasHandle>(null);
  const playerRef = useRef<StrokePlayer | null>(null);
  // kana attempted at least once this session — a requeued "Got it" is not
  // from memory, so only first attempts can mint the number
  const attempted = useRef(new Set<string>());
  const earnedThisSession = useRef(0);
  const gotFirstTry = useRef(0);
  const missed = useRef<Kana[]>([]);

  const current = queue[0];

  function grade(gotIt: boolean) {
    const firstAttempt = !attempted.current.has(current.kana);
    attempted.current.add(current.kana);
    if (firstAttempt) {
      if (gotIt) {
        gotFirstTry.current++;
        if (earnKana(current.kana)) earnedThisSession.current++;
      } else {
        missed.current.push(current);
      }
    }
    const next = gotIt ? queue.slice(1) : requeue(queue);
    canvasRef.current?.clear();
    setStrokeCount(null);
    setStrokeNow(0);
    playerRef.current = null;
    setPhase("prompt");
    if (next.length === 0) {
      onFinish({
        earned: earnedThisSession.current,
        got: gotFirstTry.current,
        missed: missed.current,
      });
    } else {
      setQueue(next);
    }
  }

  const reveal = phase === "reveal";

  return (
    <main className="session">
      <div className="rail" aria-hidden />
      <div className="sessionHead">
        <div className="sessionTrack">
          <span className="trackBadge">{trackLabel}</span>
          <span className="sessionLeft">{queue.length} left</span>
        </div>
        {reveal ? (
          <span className="revealing">
            <span className="led" />
            revealing
          </span>
        ) : (
          <button type="button" className="quit" onClick={onQuit}>
            ✕ quit
          </button>
        )}
      </div>

      {/* fixed-height slot; the prompt flips into the reveal card in place */}
      <div className="promptSlot">
        {reveal ? (
          <div className="revealCard">
            <div className="revealKana">{current.kana}</div>
            <div className="revealCol">
              <div className="revealRomaji">{current.romaji}</div>
              <span className="chipSeam">
                {strokeCount === null
                  ? "…"
                  : `${strokeCount} stroke${strokeCount === 1 ? "" : "s"}`}
              </span>
            </div>
          </div>
        ) : (
          <div className="prompt">
            <div className="promptLabel">write</div>
            <div className="promptRomaji">{current.romaji}</div>
          </div>
        )}
      </div>

      {/* canvas stays put across the flip */}
      <div className="canvasWrap">
        <div className="canvasBox">
          <span className="canvasTag">{reveal ? "your ink · 30%" : "draw"}</span>
          <WritingCanvas ref={canvasRef} frozen={reveal} onInkChange={setHasInk} />
          {reveal && (
            <StrokeOverlay
              kana={current}
              onStroke={setStrokeNow}
              onReady={(player) => {
                playerRef.current = player;
                setStrokeCount(player.strokeCount);
              }}
            />
          )}
          {reveal && strokeNow > 0 && strokeCount !== null && (
            <div className="strokeCounter">
              stroke {strokeNow}/{strokeCount}
            </div>
          )}
        </div>
      </div>

      <div className="grow" />

      {reveal ? (
        <div className="sessionActions">
          <button
            type="button"
            className="btnSeam actionBar"
            onClick={() => playerRef.current?.play(setStrokeNow)}
          >
            ↻ replay
          </button>
          <div className="actionRow">
            <button type="button" className="btnSeam btnLive" onClick={() => grade(true)}>
              Got it
            </button>
            <button type="button" className="btnSeam btnCaution" onClick={() => grade(false)}>
              Missed
            </button>
          </div>
        </div>
      ) : (
        <div className="sessionActions">
          <div className="actionRow">
            <button type="button" className="btnSeam" onClick={() => canvasRef.current?.clear()}>
              Clear
            </button>
            <button type="button" className="btnSeam" onClick={() => canvasRef.current?.undo()}>
              Undo
            </button>
          </div>
          <button
            type="button"
            className="btnStrike actionBar"
            onClick={() => setPhase("reveal")}
            disabled={!hasInk}
          >
            Show
          </button>
        </div>
      )}
    </main>
  );
}
