"use client";

// S2 → S3 → S4, once per item (SPEC-v7 §6).
//
//   prompt  the cue, alone, for about three seconds — then it melts. A study
//           trial (first exposure) shows the written form drawing itself
//           instead, and melts when the drawing ends.
//   write   a blank board, one box per character. No hint, no trace.
//   reveal  the model strokes over your ink, and you grade yourself.
//
// A miss sends the item five places back; the session ends when the queue is
// empty. Every grade is handed up the moment it is made, so leaving through ✕
// loses nothing.

import { useEffect, useRef, useState } from "react";
import { requeue } from "@/lib/session";
import { promptFor, type SetWord, type WordSet } from "@/lib/sets";
import type { QueueItem } from "@/lib/store";
import { MeltFilter, meltOut } from "./PromptMelt";
import WordReveal from "./WordReveal";
import WritingCanvas, { type WritingCanvasHandle } from "./WritingCanvas";

/** how long a prompt stands before it melts */
const PROMPT_MS = 3000;
/** how long a study trial's finished form stands before it melts */
const TRIAL_HOLD_MS = 1200;

export interface LoopResult {
  word: string;
  reading: string;
  ok: boolean;
}

type Step = "prompt" | "write" | "reveal";

export default function Loop({
  set,
  queue: dealt,
  onGrade,
  onFinish,
  onQuit,
}: {
  set: WordSet;
  queue: QueueItem[];
  /** one grade, as it is made; `ms` runs from the prompt to the tap */
  onGrade: (item: QueueItem, ok: boolean, ms: number) => void;
  onFinish: (results: LoopResult[]) => void;
  onQuit: (results: LoopResult[]) => void;
}) {
  const [queue, setQueue] = useState<QueueItem[]>(dealt);
  const [step, setStep] = useState<Step>("prompt");
  /** counts presentations, so a requeued item is a new prompt */
  const [presented, setPresented] = useState(0);
  const [hasInk, setHasInk] = useState(false);
  const results = useRef<LoopResult[]>([]);
  const shownAt = useRef(0);
  const promptRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<WritingCanvasHandle>(null);
  /** whatever the prompt is waiting on: a timer, then the melt */
  const pending = useRef<(() => void) | null>(null);

  const current = queue[0];
  const word: SetWord =
    set.words.find((w) => w.word === current.word) ??
    ({ word: current.word, reading: current.word, romaji: "", meaning: "" } as SetWord);
  const chars = [...word.word];
  const total = dealt.length;
  const position = total - queue.length + 1;
  const cue = promptFor(set, word);
  const reveal = step === "reveal";

  /** after `wait`, melt the prompt away and hand over the board */
  function leavePromptAfter(wait: number) {
    pending.current?.();
    const timer = setTimeout(() => {
      const el = promptRef.current;
      if (!el) {
        setStep("write");
        return;
      }
      pending.current = meltOut(el, () => {
        pending.current = null;
        setStep("write");
      });
    }, wait);
    pending.current = () => clearTimeout(timer);
  }

  useEffect(() => {
    shownAt.current = performance.now();
    // a study trial waits on its own drawing (WordReveal's onDone) instead
    if (!queue[0].trial) leavePromptAfter(PROMPT_MS);
    return () => {
      pending.current?.();
      pending.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presented]);

  function grade(ok: boolean) {
    onGrade(current, ok, Math.round(performance.now() - shownAt.current));
    results.current = [...results.current, { word: word.word, reading: word.reading, ok }];
    const rest = ok
      ? queue.slice(1)
      : requeue([{ ...current, trial: false, placed: false }, ...queue.slice(1)]);
    if (rest.length === 0) {
      onFinish(results.current);
      return;
    }
    setQueue(rest);
    setHasInk(false);
    setStep("prompt");
    setPresented((n) => n + 1);
  }

  if (step === "prompt") {
    return (
      <main className="frame v7Loop">
        <div className="rail" aria-hidden />
        <div className="v7Head">
          <span>PROMPT</span>
          <span>
            {position} / {total}
          </span>
        </div>
        <MeltFilter />
        <div className="v7Prompt" ref={promptRef} key={presented}>
          {current.trial ? (
            <>
              <div className="v7TrialForm">
                <WordReveal word={word.word} onDone={() => leavePromptAfter(TRIAL_HOLD_MS)} />
              </div>
              <div className="v7TrialGloss">
                {cue.reading && <span className="v7Jp">{cue.reading}</span>}
                <span>{cue.main}</span>
              </div>
            </>
          ) : (
            <>
              <div className={`v7PromptMain${cue.reading ? "" : " v7PromptSolo"}`}>{cue.main}</div>
              {cue.reading && <div className="v7PromptReading v7Jp">{cue.reading}</div>}
            </>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="frame v7Loop">
      <div className="rail" aria-hidden />
      <div className="v7Head">
        <span>{reveal ? "REVEAL" : "WRITE"}</span>
        <span className="v7HeadRight">
          {position} / {total}
          {!reveal && (
            <button
              type="button"
              className="quit"
              aria-label="Leave the session"
              onClick={() => onQuit(results.current)}
            >
              ✕
            </button>
          )}
        </span>
      </div>

      <div className="canvasWrap">
        <div className="canvasBox v7Board">
          {chars.slice(1).map((_, i) => (
            <i
              key={i}
              className="v7Divider"
              style={{ left: `${((i + 1) * 100) / chars.length}%` }}
              aria-hidden
            />
          ))}
          <WritingCanvas ref={canvasRef} frozen={reveal} onInkChange={setHasInk} />
          {reveal && <WordReveal word={word.word} />}
        </div>
      </div>

      {reveal && (
        <div className="v7Answer">
          <div className="v7AnswerWord v7Jp">{word.word}</div>
          {/* reserved: pitch accent, blank in v7 */}
          <div className="v7Slot" />
          {word.reading !== word.word && <div className="v7AnswerReading v7Jp">{word.reading}</div>}
          <div className="v7AnswerMeaning">{word.meaning}</div>
        </div>
      )}

      <div className="grow" />

      {reveal ? (
        <div className="sessionActions">
          <div className="actionRow">
            <button type="button" className="btnSeam v7Grade" onClick={() => grade(true)}>
              GOT IT
            </button>
            <button type="button" className="btnSeam v7Grade" onClick={() => grade(false)}>
              MISSED
            </button>
          </div>
          <div className="v7GradeNote">dots, long vowels and small kana count</div>
          {/* reserved: blank in v7 */}
          <div className="v7Slot" />
        </div>
      ) : (
        <div className="sessionActions">
          <div className="actionRow">
            <button
              type="button"
              className="btnSeam"
              onClick={() => canvasRef.current?.clear()}
              disabled={!hasInk}
            >
              CLEAR
            </button>
          </div>
          <button
            type="button"
            className="btnStrike actionBar"
            onClick={() => setStep("reveal")}
            disabled={!hasInk}
          >
            DONE
          </button>
        </div>
      )}
    </main>
  );
}
