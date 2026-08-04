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
  type SetChoice,
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
      <main className="screen">
        <div className="hero">{count}</div>
        <div className="heroSub">of {KANA.length} written from memory</div>
        <div className="delta">
          {sessionDelta > 0 ? `+${sessionDelta} this session` : "nothing new this session"}
        </div>
        <div className="row">
          <button type="button" className="btn btnPrimary" onClick={start}>
            Again
          </button>
          <button type="button" className="btn" onClick={() => setPhase("home")}>
            Done
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="screen">
      <div className="hero">{loaded ? count : " "}</div>
      <div className="heroSub">of {KANA.length} written from memory</div>

      <div className="segmented" role="radiogroup" aria-label="kana set">
        <button
          type="button"
          className={`segment${progress.setChoice === "all" ? " segmentOn" : ""}`}
          onClick={() => updateProgress({ setChoice: "all" satisfies SetChoice })}
        >
          All 71
        </button>
        <button
          type="button"
          className={`segment${progress.setChoice === "base" ? " segmentOn" : ""}`}
          onClick={() => updateProgress({ setChoice: "base" satisfies SetChoice })}
        >
          Base 46
        </button>
      </div>

      <button type="button" className="btn btnPrimary btnStart" onClick={start} disabled={!loaded}>
        Start
      </button>

      <footer className="homeFooter">
        Stroke data from strokesvg (MIT), derived from Klee One (SIL OFL 1.1) —{" "}
        <a href="/licenses/strokesvg-LICENSE.txt">licenses</a>
      </footer>
    </main>
  );
}
