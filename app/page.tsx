"use client";

// Screens 1 & 4 plus the app state machine. No routing — no screen is
// reachable except through the session queue.

import { useState, useSyncExternalStore } from "react";
import { BY_SCRIPT, kanaSet, type Kana, type Script } from "@/lib/kana";
import {
  getProgress,
  getServerProgress,
  subscribeProgress,
  updateProgress,
} from "@/lib/progress";
import { shuffle } from "@/lib/session";
import Session from "@/components/Session";

type Phase = "home" | "session" | "complete";

const SCRIPTS: { id: Script; label: string; ghost: string }[] = [
  { id: "hiragana", label: "Hiragana", ghost: "あ" },
  { id: "katakana", label: "Katakana", ghost: "ア" },
];

/** returns true if newly earned; persists immediately so an interrupted
    session loses nothing */
function earnKana(kana: string): boolean {
  const { earned } = getProgress();
  if (earned.has(kana)) return false;
  updateProgress({ earned: new Set([...earned, kana]) });
  return true;
}

export default function App() {
  const [phase, setPhase] = useState<Phase>("home");
  const [deck, setDeck] = useState<Kana[]>([]);
  const [sessionDelta, setSessionDelta] = useState(0);

  const progress = useSyncExternalStore(subscribeProgress, getProgress, getServerProgress);
  // the hydration render uses the stable server snapshot; a real read replaces it
  const loaded = progress !== getServerProgress();

  const script = progress.script;
  const scriptKana = BY_SCRIPT[script];
  // the number is per script: あ and ア are different characters to write
  const count = scriptKana.filter((k) => progress.earned.has(k.kana)).length;
  const total = scriptKana.length;
  const ghost = SCRIPTS.find((s) => s.id === script)!.ghost;
  const setLabel = `${script} · ${progress.setChoice === "base" ? "base 46" : "all 71"}`;

  function start() {
    setDeck(shuffle(kanaSet(script, progress.setChoice === "base")));
    setSessionDelta(0);
    setPhase("session");
  }

  if (phase === "session") {
    return (
      <Session
        key={deck.map((k) => k.hex).join()}
        deck={deck}
        setLabel={setLabel}
        earnKana={earnKana}
        onFinish={(delta) => {
          setSessionDelta(delta);
          setPhase("complete");
        }}
      />
    );
  }

  if (phase === "complete") {
    return (
      <main className="frame">
        <header className="appHead">
          <span className="brand">kanahero</span>
          <span className="sessionSet">queue cleared</span>
        </header>
        <div className="homeCenter">
          <div className="hero">{count}</div>
          <div className="chipStrike">
            of {total} {script} written from memory
          </div>
          {sessionDelta > 0 ? (
            <div className="chipLive">+{sessionDelta} this session</div>
          ) : (
            <div className="chipRail">nothing new this session</div>
          )}
        </div>
        <div className="homeBottom">
          <button type="button" className="btnStrike" onClick={start}>
            Again
          </button>
          <button type="button" className="btnSeam" style={{ padding: 19 }} onClick={() => setPhase("home")}>
            Done
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="frame">
      <div className="hazard" />
      <header className="appHead">
        <span className="brand">kanahero</span>
        <span className="onDevice">
          <span className="led" />
          on-device
        </span>
      </header>

      <div className="homeCenter">
        <span className="ghostKana" aria-hidden>
          {ghost}
        </span>
        <div className="hero">{loaded ? count : ""}</div>
        <div className="chipStrike">
          of {total} {script} written from memory
        </div>
      </div>

      <div className="homeBottom">
        <div className="segmented" role="radiogroup" aria-label="script">
          {SCRIPTS.map((s) => (
            <button
              key={s.id}
              type="button"
              role="radio"
              aria-checked={script === s.id}
              className={`segment${script === s.id ? " segmentOn" : ""}`}
              onClick={() => updateProgress({ script: s.id })}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="segmented" role="radiogroup" aria-label="kana set">
          <button
            type="button"
            role="radio"
            aria-checked={progress.setChoice === "all"}
            className={`segment${progress.setChoice === "all" ? " segmentOn" : ""}`}
            onClick={() => updateProgress({ setChoice: "all" })}
          >
            All 71
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={progress.setChoice === "base"}
            className={`segment${progress.setChoice === "base" ? " segmentOn" : ""}`}
            onClick={() => updateProgress({ setChoice: "base" })}
          >
            Base 46
          </button>
        </div>
        <button type="button" className="btnStrike" onClick={start} disabled={!loaded}>
          Start
        </button>
        <a className="attribution" href="/licenses/strokesvg-LICENSE.txt">
          stroke data from strokesvg (MIT) · derived from Klee One (SIL OFL 1.1)
        </a>
      </div>
    </main>
  );
}
