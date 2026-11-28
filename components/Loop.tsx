"use client";

// S2 → S3 → S4, once per item (SPEC-v7 §6).
//
//   prompt  the script being asked for and the cue, for about three seconds
//           — then it melts. A study trial (first exposure) shows the written
//           form drawing itself instead, and melts when the drawing ends.
//           Nothing here has to be waited for: a tap starts the melt, and a
//           second tap finishes it.
//   write   a blank board, one character to a box, one box on screen. The
//           board never says how long the word is: it starts as one box and
//           MORE adds the next, so the length is the learner's to know. The
//           strip under the board shows the boxes made so far and jumps back
//           to one on a tap. PREVIEW shrinks the whole word onto the screen,
//           read-only; WRITE goes back to the boxes. The prompt is gone, and
//           comes back on request: SHOW PROMPT puts the cue under the board
//           (script, meaning, a kanji word's reading — never the written
//           form; a kanji upgrade shows no reading there or on any prompt
//           after its trial), and it goes again when the pen next touches it.
//           Looking costs nothing; it is not a miss.
//   reveal  the model strokes and your ink, and you grade yourself: OVERLAY
//           draws the model across the board over the ink, SPLIT puts the
//           model above and the ink below.
//
// A miss sends the item five places back; the session ends when the queue is
// empty. Every grade is handed up the moment it is made, so leaving through ✕
// loses nothing.

import { memo, useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import type { InkSnapshot } from "@/lib/ink";
import { requeue } from "@/lib/session";
import type { QueueItem } from "@/lib/store";
import { promptFor, type Word } from "@/lib/words";
import InkPreview from "./InkPreview";
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

/** the most boxes MORE will make; the longest word on the list is six */
const MAX_BOXES = 8;

/** One box of the board: its own canvas, so CLEAR and UNDO act on this
    character alone and a stroke cannot run into the next one. */
const InkBox = memo(function InkBox({
  index,
  register,
  onInk,
}: {
  index: number;
  register: (index: number, handle: WritingCanvasHandle | null) => void;
  onInk: (index: number, hasInk: boolean) => void;
}) {
  const ref = useCallback(
    (handle: WritingCanvasHandle | null) => register(index, handle),
    [index, register],
  );
  const ink = useCallback((hasInk: boolean) => onInk(index, hasInk), [index, onInk]);
  return (
    <div className="v7Box">
      <WritingCanvas ref={ref} frozen={false} onInkChange={ink} />
    </div>
  );
});

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
  /** how many boxes the learner has made, and which one is on screen */
  const [boxes, setBoxes] = useState(1);
  const [at, setAt] = useState(0);
  /** which boxes have ink in them */
  const [inked, setInked] = useState<boolean[]>([]);
  /** PREVIEW: the whole word on one screen, read-only */
  const [preview, setPreview] = useState(false);
  /** the ink as it stood when PREVIEW or DONE was tapped, one entry per box */
  const [snaps, setSnaps] = useState<(InkSnapshot | null)[]>([]);
  /** the answer's view; it holds from word to word */
  const [split, setSplit] = useState(false);
  /** the prompt, asked for again on the write screen */
  const [peek, setPeek] = useState(false);
  const results = useRef<LoopResult[]>([]);
  const shownAt = useRef(0);
  const promptRef = useRef<HTMLDivElement>(null);
  const handles = useRef<(WritingCanvasHandle | null)[]>([]);
  const register = useCallback((index: number, handle: WritingCanvasHandle | null) => {
    handles.current[index] = handle;
  }, []);
  const onInk = useCallback((index: number, hasInk: boolean) => {
    setInked((was) => {
      if (!!was[index] === hasInk) return was;
      const next = [...was];
      next[index] = hasInk;
      return next;
    });
  }, []);
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
  const total = dealt.length;
  const position = total - queue.length + 1;
  /** the prompt screen's cue; a trial's carries the reading, whatever the word */
  const cue = promptFor(word, current.trial);
  /** SHOW PROMPT's cue: never a trial's */
  const peekCue = promptFor(word);
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

  /** every box's ink, as it stands */
  function takeSnaps(): (InkSnapshot | null)[] {
    return Array.from({ length: boxes }, (_, i) => handles.current[i]?.snapshot() ?? null);
  }

  /** the next box, made if it is not there yet */
  function more() {
    if (at === boxes - 1) setBoxes(boxes + 1);
    setAt(at + 1);
  }

  function goTo(index: number) {
    setPreview(false);
    setAt(index);
  }

  function togglePreview() {
    if (!preview) setSnaps(takeSnaps());
    setPreview(!preview);
  }

  /** the word is whatever was written: a box left empty at the end is not
      part of it */
  function done() {
    const taken = takeSnaps();
    while (taken.length > 1 && !taken[taken.length - 1]) taken.pop();
    setSnaps(taken);
    setStep("reveal");
  }

  function grade(ok: boolean) {
    onGrade(current, ok, Math.round(performance.now() - shownAt.current));
    results.current = [...results.current, { word: word.write, reading: word.reading, ok }];
    const rest = ok ? queue.slice(1) : requeue([{ ...current, trial: false }, ...queue.slice(1)]);
    if (rest.length === 0) {
      onFinish(results.current);
      return;
    }
    setQueue(rest);
    handles.current = [];
    setBoxes(1);
    setAt(0);
    setInked([]);
    setPreview(false);
    setSnaps([]);
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

  const anyInk = inked.some(Boolean);
  const shrunk = reveal || preview;

  return (
    <main className="frame v7Loop">
      <div className="rail" aria-hidden />
      <div className="v7Head">
        <span>{reveal ? "REVEAL" : "WRITE"}</span>
        <span className="v7HeadRight">
          {reveal && (
            <button type="button" className="v7ViewToggle" onClick={() => setSplit(!split)}>
              {split ? "OVERLAY" : "SPLIT"}
            </button>
          )}
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
        <div className={`canvasBox v7Board${reveal && split ? " v7Split" : ""}`}>
          {/* the boxes stay mounted and the same size whatever is showing:
              the ink lives in them, in the pixels it was written in */}
          <div
            className={`v7Strip${shrunk ? " v7StripHidden" : ""}`}
            style={{ transform: `translateX(${-at * 100}%)` }}
            key={presented}
          >
            {Array.from({ length: boxes }, (_, i) => (
              <InkBox key={i} index={i} register={register} onInk={onInk} />
            ))}
          </div>
          {shrunk && (
            <div className={`v7InkLayer${reveal ? " v7InkUnder" : ""}`}>
              <InkPreview boxes={snaps} />
            </div>
          )}
          {reveal && (
            <div className="v7ModelLayer">
              <WordReveal word={word.write} />
            </div>
          )}
        </div>
      </div>

      {!reveal && (
        <div className="v7Cue">
          <div className="v7CueBar">
            <button
              type="button"
              className="v7CueToggle"
              aria-expanded={peek}
              onClick={() => setPeek((p) => !p)}
            >
              {peek ? "HIDE PROMPT" : "SHOW PROMPT"}
            </button>
            {/* the boxes made so far — never how many the word has */}
            <div className="v7Cells">
              {Array.from({ length: boxes }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`v7Cell${inked[i] ? " v7CellInk" : ""}${!preview && i === at ? " v7CellAt" : ""}`}
                  aria-label={`Box ${i + 1}`}
                  aria-current={!preview && i === at}
                  onClick={() => goTo(i)}
                />
              ))}
            </div>
          </div>
          {peek && (
            <div className="v7CueBody">
              <div className="v7CueScript">{peekCue.script}</div>
              <div className="v7CueMain">{peekCue.main}</div>
              {peekCue.reading && <div className="v7CueReading v7Jp">{peekCue.reading}</div>}
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
              onClick={() => handles.current[at]?.clear()}
              disabled={preview || !inked[at]}
            >
              CLEAR
            </button>
            <button
              type="button"
              className="btnSeam"
              onClick={() => handles.current[at]?.undo()}
              disabled={preview || !inked[at]}
            >
              UNDO
            </button>
            <button type="button" className="btnSeam" onClick={togglePreview} disabled={!anyInk}>
              {preview ? "WRITE" : "PREVIEW"}
            </button>
          </div>
          <div className="v7Finish">
            <button
              type="button"
              className="btnSeam v7More"
              onClick={more}
              disabled={preview || (at === boxes - 1 && boxes >= MAX_BOXES)}
            >
              MORE
            </button>
            <button type="button" className="btnStrike" onClick={done} disabled={!anyInk}>
              DONE
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
