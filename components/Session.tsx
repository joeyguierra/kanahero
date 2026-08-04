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

export default function Session({
  deck,
  setLabel,
  earnKana,
  onFinish,
}: {
  deck: Kana[];
  setLabel: string;
  /** returns true if this kana was newly earned */
  earnKana: (kana: string) => boolean;
  onFinish: (earnedThisSession: number) => void;
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

  const current = queue[0];

  function grade(gotIt: boolean) {
    const firstAttempt = !attempted.current.has(current.kana);
    attempted.current.add(current.kana);
    if (gotIt && firstAttempt && earnKana(current.kana)) {
      earnedThisSession.current++;
    }
    const next = gotIt ? queue.slice(1) : requeue(queue);
    canvasRef.current?.clear();
    setStrokeCount(null);
    setStrokeNow(0);
    playerRef.current = null;
    setPhase("prompt");
    if (next.length === 0) {
      onFinish(earnedThisSession.current);
    } else {
      setQueue(next);
    }
  }

  const reveal = phase === "reveal";

  return (
    <main className="session">
      <div className="sessionHead">
        <span className="sessionLeft">{queue.length} left</span>
        <span className="sessionSet">set · {setLabel}</span>
      </div>

      {/* prompt card, flips in place */}
      <div className={`card${reveal ? " cardFlipped" : ""}`}>
        {reveal ? (
          <>
            <div className="cardKana">{current.kana}</div>
            <div className="cardRevealCol">
              <div className="cardRomajiSmall">{current.romaji}</div>
              <div className="chipSeam">
                {strokeCount === null
                  ? "…"
                  : `${strokeCount} stroke${strokeCount === 1 ? "" : "s"}`}
              </div>
            </div>
          </>
        ) : (
          <>
            <span className="reg" style={{ top: 8, left: 10 }}>
              +
            </span>
            <span className="reg" style={{ bottom: 8, right: 10, color: "var(--seam)" }}>
              +
            </span>
            <div className="cardRomaji">{current.romaji}</div>
            <div className="cardHint">write it from memory</div>
          </>
        )}
      </div>

      {/* canvas stays put across the flip */}
      <div className="canvasWrap">
        <div className="canvasBox">
          <span className="reg" style={{ top: 7, left: 8 }}>+</span>
          <span className="reg" style={{ top: 7, right: 8 }}>+</span>
          <span className="reg" style={{ bottom: 7, left: 8 }}>+</span>
          <span className="reg" style={{ bottom: 7, right: 8 }}>+</span>
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

      {reveal ? (
        <div className="sessionActions">
          <button
            type="button"
            className="btnSeam"
            onClick={() => playerRef.current?.play(setStrokeNow)}
          >
            Replay
          </button>
          <div className="row">
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
          <div className="row">
            <button type="button" className="btnSeam" onClick={() => canvasRef.current?.clear()}>
              Clear
            </button>
            <button type="button" className="btnSeam" onClick={() => canvasRef.current?.undo()}>
              Undo
            </button>
          </div>
          <button
            type="button"
            className="btnStrike"
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
