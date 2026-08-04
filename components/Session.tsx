"use client";

// Screens 2 & 3: the writing loop. Prompt and Reveal are the same screen in
// two states — the card flips in place and the canvas never moves, so the
// stroke animation lands exactly on top of the attempt.

import { useRef, useState } from "react";
import type { Kana } from "@/lib/kana";
import { requeue } from "@/lib/session";
import type { StrokePlayer } from "@/lib/strokeAnimator";
import WritingCanvas, { type WritingCanvasHandle } from "./WritingCanvas";
import StrokeOverlay from "./StrokeOverlay";

export default function Session({
  deck,
  earnKana,
  onFinish,
}: {
  deck: Kana[];
  /** returns true if this kana was newly earned */
  earnKana: (kana: string) => boolean;
  onFinish: (earnedThisSession: number) => void;
}) {
  const [queue, setQueue] = useState<Kana[]>(deck);
  const [phase, setPhase] = useState<"prompt" | "reveal">("prompt");
  const [hasInk, setHasInk] = useState(false);
  const [strokeCount, setStrokeCount] = useState<number | null>(null);
  const canvasRef = useRef<WritingCanvasHandle>(null);
  const playerRef = useRef<StrokePlayer | null>(null);
  // kana attempted at least once this session — a requeued "Got it" is not
  // from memory, so only first attempts can mint the number
  const attempted = useRef(new Set<string>());
  const earnedThisSession = useRef(0);

  const current = queue[0];

  function show() {
    setPhase("reveal");
  }

  function grade(gotIt: boolean) {
    const firstAttempt = !attempted.current.has(current.kana);
    attempted.current.add(current.kana);
    if (gotIt && firstAttempt && earnKana(current.kana)) {
      earnedThisSession.current++;
    }
    const next = gotIt ? queue.slice(1) : requeue(queue);
    canvasRef.current?.clear();
    setStrokeCount(null);
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
      <div className="sessionLeft">{queue.length} left</div>

      {/* prompt card, flips in place */}
      <div className="card">
        {reveal ? (
          <>
            <div className="cardKana">{current.kana}</div>
            <div className="cardSub">
              {current.romaji}
              {strokeCount !== null &&
                ` · ${strokeCount} stroke${strokeCount === 1 ? "" : "s"}`}
            </div>
          </>
        ) : (
          <div className="cardRomaji">{current.romaji}</div>
        )}
      </div>

      {/* canvas stays put across the flip */}
      <div className="canvasBox">
        <WritingCanvas ref={canvasRef} frozen={reveal} onInkChange={setHasInk} />
        {reveal && (
          <StrokeOverlay
            kana={current}
            onReady={(player) => {
              playerRef.current = player;
              setStrokeCount(player.strokeCount);
            }}
          />
        )}
      </div>

      {reveal ? (
        <div className="row">
          <button type="button" className="btn" onClick={() => playerRef.current?.play()}>
            Replay
          </button>
          <button type="button" className="btn btnGrade" onClick={() => grade(true)}>
            Got it
          </button>
          <button type="button" className="btn btnGrade" onClick={() => grade(false)}>
            Missed
          </button>
        </div>
      ) : (
        <div className="row">
          <button type="button" className="btn" onClick={() => canvasRef.current?.clear()}>
            Clear
          </button>
          <button type="button" className="btn" onClick={() => canvasRef.current?.undo()}>
            Undo
          </button>
          <button type="button" className="btn btnPrimary" onClick={show} disabled={!hasInk}>
            Show
          </button>
        </div>
      )}
    </main>
  );
}
