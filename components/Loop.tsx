"use client";

// S2 → S3 → S4, once per item (SPEC-v7 §6).
//
//   prompt  the script being asked for and the cue, for about three seconds
//           — then it melts. A study trial (first exposure) shows the written
//           form drawing itself instead, and melts when the drawing ends.
//           Nothing here has to be waited for: a tap starts the melt, and a
//           second tap finishes it.
//   write   a blank board, one box per character. The prompt is gone, and
//           comes back on request: SHOW PROMPT puts the cue under the board
//           (script, meaning, a kanji word's reading — never the written
//           form), and it goes again when the pen next touches the board.
//           Looking costs nothing; it is not a miss.
//   reveal  the model strokes over your ink, and you grade yourself.
//
// A miss sends the item five places back; the session ends when the queue is
// empty. Every grade is handed up the moment it is made, so leaving through ✕
// loses nothing.

import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { requeue } from "@/lib/session";
import type { QueueItem } from "@/lib/store";
import { promptFor, type Word } from "@/lib/words";
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
  words,
  queue: dealt,
  onGrade,
  onFinish,
  onQuit,
}: {
  words: Word[];
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
  /** the prompt, asked for again on the write screen */
  const [peek, setPeek] = useState(false);
  const results = useRef<LoopResult[]>([]);
  const shownAt = useRef(0);
  const promptRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<WritingCanvasHandle>(null);
  /** whatever the prompt is waiting on: a timer, then the melt */
  const pending = useRef<(() => void) | null>(null);
  /** where the prompt is on its way out; "idle" while a trial is still drawing */
  const stage = useRef<"idle" | "wait" | "melt">("idle");
  /** when the wait was last armed, on the clock event timestamps use */
  const armedAt = useRef(0);

  const byId = useMemo(() => new Map(words.map((w) => [w.write, w])), [words]);
  const current = queue[0];
  const word: Word = byId.get(current.id) ?? {
    order: 0,
    write: current.id,
    ask: "hiragana",
    reading: current.id,
    kanji: null,
    romaji: "",
    meaning: "",
  };
  const chars = [...word.write];
  const total = dealt.length;
  const position = total - queue.length + 1;
  const cue = promptFor(word);
  const reveal = step === "reveal";

  /** hand over the board, whatever the prompt was in the middle of */
  function toWrite() {
    pending.current?.();
    pending.current = null;
    stage.current = "idle";
    setStep("write");
  }

  function startMelt() {
    pending.current?.();
    const el = promptRef.current;
    if (!el) {
      toWrite();
      return;
    }
    stage.current = "melt";
    pending.current = meltOut(el, toWrite);
  }

  /** after `wait`, melt the prompt away and hand over the board */
  function leavePromptAfter(wait: number) {
    pending.current?.();
    stage.current = "wait";
    armedAt.current = performance.now();
    const timer = setTimeout(startMelt, wait);
    pending.current = () => clearTimeout(timer);
  }

  /** A tap hurries the prompt: the first starts the melt, the second finishes
      it. The word still has to be written; only the waiting is skipped. A
      study trial's drawing takes its own taps (WordReveal), and the tap that
      finishes the drawing must not also start the melt, so a tap older than
      the wait it would hurry is ignored. */
  function tapPrompt(e: MouseEvent) {
    if (e.timeStamp < armedAt.current) return;
    if (stage.current === "wait") startMelt();
    else if (stage.current === "melt") toWrite();
  }

  useEffect(() => {
    shownAt.current = performance.now();
    // a study trial waits on its own drawing (WordReveal's onDone) instead
    if (!queue[0].trial) leavePromptAfter(PROMPT_MS);
    return () => {
      pending.current?.();
      pending.current = null;
      stage.current = "idle";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presented]);

  function grade(ok: boolean) {
    onGrade(current, ok, Math.round(performance.now() - shownAt.current));
    results.current = [...results.current, { word: word.write, reading: word.reading, ok }];
    const rest = ok ? queue.slice(1) : requeue([{ ...current, trial: false }, ...queue.slice(1)]);
    if (rest.length === 0) {
      onFinish(results.current);
      return;
    }
    setQueue(rest);
    setHasInk(false);
    setPeek(false);
    setStep("prompt");
    setPresented((n) => n + 1);
  }

  if (step === "prompt") {
    return (
      <main className="frame v7Loop" onClick={tapPrompt}>
        <div className="rail" aria-hidden />
        <div className="v7Head">
          <span>PROMPT</span>
          <span>
            {position} / {total}
          </span>
        </div>
        <MeltFilter />
        <div className="v7Prompt" ref={promptRef} key={presented}>
          <div className="v7Script">{cue.script}</div>
          {current.trial ? (
            <>
              <div className="v7TrialForm">
                <WordReveal word={word.write} onDone={() => leavePromptAfter(TRIAL_HOLD_MS)} />
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

      <div className="canvasWrap" onPointerDownCapture={() => setPeek(false)}>
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
          {reveal && <WordReveal word={word.write} />}
        </div>
      </div>

      {!reveal && (
        <div className="v7Cue">
          <button
            type="button"
            className="v7CueToggle"
            aria-expanded={peek}
            onClick={() => setPeek((p) => !p)}
          >
            {peek ? "HIDE PROMPT" : "SHOW PROMPT"}
          </button>
          {peek && (
            <div className="v7CueBody">
              <div className="v7CueScript">{cue.script}</div>
              <div className="v7CueMain">{cue.main}</div>
              {cue.reading && <div className="v7CueReading v7Jp">{cue.reading}</div>}
            </div>
          )}
        </div>
      )}

      {reveal && (
        <div className="v7Answer">
          <div className="v7AnswerWord v7Jp">{word.write}</div>
          {/* reserved: pitch accent, blank in v7 */}
          <div className="v7Slot" />
          {word.reading !== word.write && <div className="v7AnswerReading v7Jp">{word.reading}</div>}
          {/* a word asked in hiragana: the kanji it is usually written with */}
          {word.kanji && <div className="v7AnswerReading v7AnswerKanji v7Jp">{word.kanji}</div>}
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
            <button
              type="button"
              className="btnSeam"
              onClick={() => canvasRef.current?.undo()}
              disabled={!hasInk}
            >
              UNDO
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
