"use client";

// Screens 1 & 4 plus the app state machine. No routing — no screen is
// reachable except through the session queue.

import { useState, useSyncExternalStore } from "react";
import { BASE_46, KANA, type Kana } from "@/lib/kana";
import {
  getProgress,
  getServerProgress,
  subscribeProgress,
  updateProgress,
} from "@/lib/progress";
import { shuffle } from "@/lib/session";
import Session from "@/components/Session";

type Phase = "home" | "session" | "complete";

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
  const count = progress.earned.size;
  const setLabel = progress.setChoice === "base" ? "base 46" : "all 71";

  function start() {
    setDeck(shuffle(progress.setChoice === "base" ? BASE_46 : KANA));
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
          <div className="chipStrike">of {KANA.length} written from memory</div>
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
          あ
        </span>
        <div className="hero">{loaded ? count : ""}</div>
        <div className="chipStrike">of {KANA.length} written from memory</div>
      </div>

      <div className="homeBottom">
        <div className="segmented" role="radiogroup" aria-label="kana set">
          <button
            type="button"
            className={`segment${progress.setChoice === "all" ? " segmentOn" : ""}`}
            onClick={() => updateProgress({ setChoice: "all" })}
          >
            All 71
          </button>
          <button
            type="button"
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
