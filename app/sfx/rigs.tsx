"use client";

// The five rigs: the app's own gestures, lifted out of the screens that own
// them, so a cue can be heard where it actually lives. Internal to /sfx.
//
// A row of PLAY buttons tells you what a file sounds like. It cannot tell you
// whether the tick survives the melt it lands inside, whether his brush is
// mistakable for yours, or whether nine lands 90 ms apart read as a deal or as
// a rattle — and those are the only questions the sound pass has left. So each
// rig reproduces the timing of the real screen, using the real constants from
// lib/reveal.ts and the real cue list from lib/sfx-schedule.ts. When those move,
// these move with them.
//
// Where a rig can use the shipping component, it does: the ink pad is the real
// WritingCanvas, the panel is the real Joker.

import { useCallback, useEffect, useRef, useState } from "react";

import { setAudioPrefs } from "@/lib/audio";
import { revealOrder } from "@/lib/reveal";
import { dealCues, hurryCues, revealCues } from "@/lib/sfx-schedule";
import { DEAL_INTERVAL, FADE, FLIGHT, LAND } from "@/components/SetScreen";
import type { Rarity } from "@/lib/progress";
import Joker from "@/components/Joker";
import WritingCanvas, { type WritingCanvasHandle } from "@/components/WritingCanvas";

import type { Bed } from "./board";
import type { Board } from "./useBoard";

function Rig({
  id,
  title,
  blurb,
  children,
}: {
  id: string;
  title: string;
  blurb: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rig" id={id}>
      <div className="rigHead">
        <span className="legend rigTag">{title}</span>
        <p className="rigBlurb">{blurb}</p>
      </div>
      {children}
    </section>
  );
}

// ---- 1 · the ink pad ----------------------------------------------------

/** the real canvas, with the bed and the six cues the round fires around it */
export function InkRig({ board }: { board: Board }) {
  const canvas = useRef<WritingCanvasHandle>(null);
  const live = useRef<Bed | null>(null);
  const last = useRef<{ x: number; y: number; t: number } | null>(null);
  const [speed, setSpeed] = useState(0);
  const [down, setDown] = useState(false);
  // the lift is owned by the pointer, not by the bed: with no ink.loop baked
  // there is no bed to stop, and ink.up must still fire and still be logged
  const holding = useRef(false);

  const lift = useCallback(() => {
    if (!holding.current) return;
    holding.current = false;
    live.current?.stop();
    live.current = null;
    last.current = null;
    setDown(false);
    setSpeed(0);
    board.fire("ink.up");
  }, [board]);

  // a pointer that leaves the window never sends its up to the pad
  useEffect(() => {
    window.addEventListener("pointerup", lift);
    window.addEventListener("pointercancel", lift);
    return () => {
      window.removeEventListener("pointerup", lift);
      window.removeEventListener("pointercancel", lift);
    };
  }, [lift]);

  return (
    <Rig
      id="rig-ink"
      title="THE INK PAD"
      blurb="Draw on it. ink.down on touch, the bed under the hand with gain and rate following pointer speed, ink.up on lift — the real WritingCanvas, so the speed you hear is the speed that thins the line. GOT IT plays the whole flag-01 window: the melt at t=0 and the tick at t=420, which is the collision the spec has not settled."
    >
      <div className="rigPad">
        <div
          className="rigCanvas"
          onPointerDown={(e) => {
            holding.current = true;
            setDown(true);
            last.current = { x: e.clientX, y: e.clientY, t: e.timeStamp };
            board.fire("ink.down");
            live.current = board.bed("ink.loop");
          }}
          onPointerMove={(e) => {
            const prev = last.current;
            if (!prev) return;
            const dt = Math.max(1, e.timeStamp - prev.t);
            const px = Math.hypot(e.clientX - prev.x, e.clientY - prev.y) / dt;
            last.current = { x: e.clientX, y: e.clientY, t: e.timeStamp };
            setSpeed(px);
            live.current?.speed(px);
          }}
        >
          <WritingCanvas ref={canvas} frozen={false} />
        </div>
        <div className="rigMeter">
          <span className="rigMeterLabel">POINTER</span>
          <div className="rigMeterTrack">
            <div
              className="rigMeterFill"
              style={{ width: `${Math.min(100, (speed / 0.6) * 100)}%` }}
            />
          </div>
          <span className="rigMeterValue">
            {down ? `${(speed * 1000).toFixed(0)} px/s` : "at rest"}
          </span>
        </div>
      </div>

      <div className="rigRow">
        <button
          type="button"
          className="btnStrike rigBtn"
          onClick={() => board.fire("ink.reveal")}
        >
          FLIP
        </button>
        <button
          type="button"
          className="btnSeam rigBtn"
          onClick={() => {
            canvas.current?.clear();
            board.fire("ink.clear");
          }}
        >
          CLEAR
        </button>
        <button
          type="button"
          className="btnSeam rigBtn"
          onClick={() => {
            canvas.current?.undo();
            board.fire("ink.undo");
          }}
        >
          UNDO
        </button>
      </div>
      <div className="rigRow">
        <button
          type="button"
          className="btnGrade btnLive rigBtn"
          onClick={() =>
            board.fireSeq([
              { name: "prompt.melt", ms: 0 },
              { name: "hand.tick", ms: 420 },
            ])
          }
        >
          GOT IT
        </button>
        <button
          type="button"
          className="btnGrade btnCaution rigBtn"
          onClick={() =>
            board.fireSeq([
              { name: "hand.miss", ms: 0 },
              { name: "prompt.melt", ms: 120 },
            ])
          }
        >
          MISSED
        </button>
      </div>
    </Rig>
  );
}

// ---- 2 · the panel ------------------------------------------------------

/** corpus-shaped lines: the short one, the median one, and the longest the
    panel can hold without wrapping to three */
const LINES = [
  "Nice.",
  "That one goes in the book.",
  "Write it the way you would if nobody was watching, and we will see what the paper says.",
];

/** Joker.tsx types at this rate; the paper click follows the same clock */
const TICK = 22;
/** the inventory's rate for the click: one every third character, spaces and
    punctuation skipped */
const EVERY = 3;

export function TalkRig({ board }: { board: Board }) {
  const [take, setTake] = useState(0);
  const [which, setWhich] = useState(1);
  const [paper, setPaper] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  // PAPER mode is the inventory's joker.talk; SYNTH is what ships today
  // (lib/joker-voice.ts). The real panel always uses the synth, so paper mode
  // mutes the voice channel for the length of the line and runs the click on
  // the same 22 ms clock beside it. Both channels come back on unmount.
  useEffect(() => {
    setAudioPrefs({ voice: !paper, sfx: true });
    return () => setAudioPrefs({ voice: true, sfx: true });
  }, [paper]);

  const line = LINES[which];

  const replay = () => {
    setTake((n) => n + 1);
    if (timer.current) clearInterval(timer.current);
    if (!paper) return;
    const chars = [...line];
    let i = 0;
    let voiced = 0;
    timer.current = setInterval(() => {
      const ch = chars[i++];
      if (ch === undefined) {
        clearInterval(timer.current!);
        timer.current = null;
        return;
      }
      if (!ch.trim() || /[.,!?—、。]/.test(ch)) return;
      if (voiced++ % EVERY === 0) board.fire("joker.talk");
    }, TICK);
  };

  useEffect(() => () => void (timer.current && clearInterval(timer.current)), []);

  return (
    <Rig
      id="rig-talk"
      title="THE PANEL"
      blurb="The real Joker, typing a real-length line at 22 ms a character. SYNTH is the square wave that ships today, every 6th voiced character. PAPER is the inventory's cue — one dry click every third character — and it needs joker.talk baked before it makes a sound. Flag 02 is the question this rig is for: does the click belong on every line, or only on the first line of a screen, a miss, and a once-line?"
    >
      <div className="rigPanel">
        <Joker key={`${take}-${which}-${paper}`} line={line} size={96} tail="left" />
      </div>
      <div className="rigRow">
        <span className="toggle toggleTap" role="radiogroup" aria-label="voice">
          <button
            type="button"
            role="radio"
            aria-checked={!paper}
            className={`toggleOpt${paper ? "" : " toggleOn"}`}
            onClick={() => setPaper(false)}
          >
            SYNTH
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={paper}
            className={`toggleOpt${paper ? " toggleOn" : ""}`}
            onClick={() => setPaper(true)}
          >
            PAPER
          </button>
        </span>
        <button type="button" className="btnBone rigBtn" onClick={replay}>
          TYPE IT
        </button>
      </div>
      <div className="rigRow rigRowTight">
        {LINES.map((text, i) => (
          <button
            key={i}
            type="button"
            className={`rigChip${which === i ? " rigChipOn" : ""}`}
            onClick={() => setWhich(i)}
          >
            {[...text].length} CHARS
          </button>
        ))}
      </div>
    </Rig>
  );
}

// ---- 3 · the deal -------------------------------------------------------

/** S6b seats nine backs */
const HAND = 9;

export function DealRig({ board }: { board: Board }) {
  const [throws, setThrows] = useState(false);
  const [reduced, setReduced] = useState(false);

  // The app's own list, from the same dealCues() SetScreen schedules and the
  // same constants its animation runs on — so what the board plays is what
  // S6b plays, and a change to either shows up here without being copied.
  const lands = dealCues({ count: HAND, gap: DEAL_INTERVAL, land: LAND, reduced, fade: FADE });

  const deal = () => {
    const cues: { name: string; ms: number }[] = [];
    // deal.throw is board-only: it is held out of lib/sfx.ts until the deal
    // has been heard without it (SPEC-v5d §2c)
    if (throws && !reduced) {
      for (let i = 0; i < HAND; i++) cues.push({ name: "deal.throw", ms: i * DEAL_INTERVAL });
    }
    // deal.press is NOT here either, and for the opposite reason to throw: it
    // was wired and then dropped (2026-09-25), because SetScreen mounts S7 in
    // the same handler and the riffle played over the round. This rig mirrors
    // the screen, so the screen's silence is the rig's silence — its own row in
    // the table above is where you audition the file.
    board.fireSeq([
      ...cues,
      ...lands.map((cue) => ({ name: cue.name as string, ms: cue.at })),
    ]);
  };

  return (
    <Rig
      id="rig-deal"
      title="THE DEAL"
      blurb={`S6b, wired: the nine backs each land as they seat — ${DEAL_INTERVAL} ms apart, ${LAND} ms after each release (SetScreen's LAND: where the flight's easing actually puts the card down, not the ${FLIGHT} ms its animation runs for), off SetScreen's own constants through the same dealCues() the screen schedules. The tap itself is silent: deal.press was dropped from DEAL on 2026-09-25 because the round mounts in the same handler and the riffle was heard over it. Turn THROWS on to hear why the inventory holds it back: from t=${LAND} the throws and the lands interleave. PRESENT is M5 on its own.`}
    >
      <div className="rigRow">
        <button type="button" className="btnStrike rigBtn" onClick={deal}>
          DEAL
        </button>
        <button
          type="button"
          className="btnSeam rigBtn"
          onClick={() => board.fire("prompt.melt")}
        >
          PRESENT A WORD
        </button>
        <button
          type="button"
          className="btnSeam rigBtn"
          onClick={() => board.fire("reveal.arrive")}
        >
          THE SET ARRIVES
        </button>
      </div>
      <div className="rigRow rigRowTight">
        <button
          type="button"
          className={`rigChip${throws ? " rigChipOn" : ""}`}
          onClick={() => setThrows((t) => !t)}
        >
          THROWS {throws ? "ON" : "OFF"}
        </button>
        <button
          type="button"
          className={`rigChip${reduced ? " rigChipOn" : ""}`}
          onClick={() => setReduced((r) => !r)}
        >
          REDUCED MOTION {reduced ? "ON" : "OFF"}
        </button>
      </div>
    </Rig>
  );
}

// ---- 4 · the reveal -----------------------------------------------------

const HANDS: { label: string; hand: Rarity[] }[] = [
  { label: "9 · one shiny", hand: ["worn", "worn", "base", "base", "base", "worn", "base", "shiny", "base"] },
  { label: "9 · no shiny", hand: ["worn", "worn", "worn", "base", "base", "base", "worn", "base", "base"] },
  {
    label: "21 · three shiny",
    hand: [
      "worn", "base", "shiny", "worn", "base", "base", "worn",
      "base", "shiny", "worn", "worn", "base", "base", "base",
      "shiny", "worn", "base", "worn", "base", "worn", "base",
    ],
  },
];

export function RevealRig({ board }: { board: Board }) {
  const [pick, setPick] = useState(0);
  const order = revealOrder(HANDS[pick].hand.map((rarity) => ({ card: { rarity } })));

  // The board schedules reveal.arrive at t=0 itself: M14 is specced but not yet
  // in lib/sfx-schedule.ts, and the whole point of hearing it is hearing it
  // land inside LEAD_MS ahead of the first flip.
  const cues = [
    { name: "reveal.arrive", ms: 0 },
    ...revealCues(order).map((c) => ({ name: c.name as string, ms: c.at })),
  ];
  const skip = hurryCues(order, Math.floor(order.length / 3)).map((c) => ({
    name: c.name as string,
    ms: c.at,
  }));

  return (
    <Rig
      id="rig-reveal"
      title="THE REVEAL"
      blurb="The real cue list from lib/sfx-schedule.ts, laid out against the audio clock exactly as Result.tsx lays it out — flips 114–160 ms apart, the knock at the end, and reveal.arrive scheduled at t=0 the way M14 asks for. TAP THROUGH riffles from a third of the way in: the cards go over silently and the one thud of the spread landing is the sound of it."
    >
      <div className="rigRow rigRowTight">
        {HANDS.map((h, i) => (
          <button
            key={h.label}
            type="button"
            className={`rigChip${pick === i ? " rigChipOn" : ""}`}
            onClick={() => setPick(i)}
          >
            {h.label}
          </button>
        ))}
      </div>
      <div className="rigRow">
        <button type="button" className="btnStrike rigBtn" onClick={() => board.fireSeq(cues)}>
          PLAY THE REVEAL
        </button>
        <button type="button" className="btnSeam rigBtn" onClick={() => board.fireSeq(skip)}>
          TAP THROUGH
        </button>
      </div>
      <ol className="rigTimeline">
        {cues.map((cue, i) => (
          <li key={i}>
            <span className="rigTimelineAt">{cue.ms.toString().padStart(4, " ")}</span>
            <span className="rigTimelineName">{cue.name}</span>
          </li>
        ))}
      </ol>
    </Rig>
  );
}

// ---- 5 · the chrome -----------------------------------------------------

const DECKS = ["HIRAGANA", "KATAKANA", "KANJI"];

export function ChromeRig({ board }: { board: Board }) {
  const [deck, setDeck] = useState(0);
  const [on, setOn] = useState(true);
  const [modal, setModal] = useState(false);
  const [lifted, setLifted] = useState(false);

  return (
    <Rig
      id="rig-chrome"
      title="THE CHROME"
      blurb="By category, never by button. Every control here is the real thing off S1: the back link is ui.nav — which is also the screen transition, so in the app it hangs off go() in the state machine rather than off any button — a deck row going live is drawer.open, the CTA is ui.primary, and the sound switch is the one cue in the app that must sound even when sound was off a moment ago. Re-tapping the live row is silent, exactly as S1 is: choosing the deck you already chose is not a choice. A SET row is silent too — that tap mounts S6b, and the deal is its sound."
    >
      <div className="rigChrome">
        <button type="button" className="backLink" onClick={() => board.fire("ui.nav")}>
          ← BACK
        </button>

        <div className="rigDecks">
          {DECKS.map((label, i) => (
            <button
              key={label}
              type="button"
              className={`rigDeck${deck === i ? " rigDeckOn" : ""}`}
              onClick={() => {
                setDeck(i);
                // the app guards this the same way: choose() only sounds when
                // the row actually changes (app/page.tsx)
                if (deck !== i) board.fire("drawer.open");
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="rigRow">
          <button
            type="button"
            className="btnBone rigBtn"
            onClick={() => board.fire("ui.primary")}
          >
            START SESSION
          </button>
          <span className="toggle toggleTap" role="radiogroup" aria-label="sound">
            <button
              type="button"
              role="radio"
              aria-checked={on}
              className={`toggleOpt${on ? " toggleOn" : ""}`}
              onClick={() => {
                setOn(true);
                board.fire("ui.toggle (ON)");
              }}
            >
              ON
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={!on}
              className={`toggleOpt toggleStrike${on ? "" : " toggleOn"}`}
              onClick={() => {
                setOn(false);
                board.fire("ui.toggle (OFF)");
              }}
            >
              OFF
            </button>
          </span>
        </div>

        <div className="rigRow">
          <button
            type="button"
            className="btnSeam rigBtn"
            onClick={() => {
              setModal(true);
              board.fire("modal.open");
            }}
          >
            OPEN THE DIALOG
          </button>
          <button
            type="button"
            className={`rigCard${lifted ? " rigCardUp" : ""}`}
            onClick={() => {
              setLifted((up) => !up);
              board.fire(lifted ? "overlay.set" : "overlay.lift");
            }}
          >
            {lifted ? "SET IT DOWN" : "LIFT A CARD"}
          </button>
        </div>
      </div>

      {modal && (
        <div
          className="dialogScrim"
          onClick={() => {
            setModal(false);
            board.fire("modal.close");
          }}
        >
          <div
            className="dialogPanel"
            role="dialog"
            aria-modal="true"
            aria-label="leave the run"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="settingsTitle">LEAVE THE RUN?</div>
            <div className="dialogActions">
              <button
                type="button"
                className="btnBone dialogBtn"
                onClick={() => {
                  setModal(false);
                  board.fire("modal.close");
                }}
              >
                KEEP WRITING
              </button>
              <button
                type="button"
                className="btnSeam dialogBtn"
                onClick={() => {
                  setModal(false);
                  board.fire("modal.leave");
                }}
              >
                LEAVE RUN
              </button>
            </div>
          </div>
        </div>
      )}
    </Rig>
  );
}
