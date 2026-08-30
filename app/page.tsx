"use client";

// Screens 1 & 4 plus the app state machine. No routing — no screen is
// reachable except through the session queue.

import { useState, useSyncExternalStore, type CSSProperties } from "react";
import { BY_SCRIPT, kanaSet, type Kana, type Script } from "@/lib/kana";
import {
  getProgress,
  getServerProgress,
  subscribeProgress,
  updateProgress,
} from "@/lib/progress";
import { shuffle } from "@/lib/session";
import Session, { type SessionSummary } from "@/components/Session";

type Phase = "home" | "session" | "complete";

const TRACKS: { id: Script; label: string; glyph: string }[] = [
  { id: "hiragana", label: "Hiragana", glyph: "あ" },
  { id: "katakana", label: "Katakana", glyph: "ア" },
];

/** the caution chips only have room for so many before the screen fills */
const MISSED_CHIP_LIMIT = 12;

/** returns true if newly earned; persists immediately so an interrupted
    session loses nothing */
function earnKana(kana: string): boolean {
  const { earned } = getProgress();
  if (earned.has(kana)) return false;
  updateProgress({ earned: new Set([...earned, kana]) });
  return true;
}

function fill(count: number, total: number): CSSProperties {
  return { "--fill": `${total === 0 ? 0 : (count / total) * 100}%` } as CSSProperties;
}

export default function App() {
  const [phase, setPhase] = useState<Phase>("home");
  const [deck, setDeck] = useState<Kana[]>([]);
  const [summary, setSummary] = useState<SessionSummary | null>(null);

  const progress = useSyncExternalStore(subscribeProgress, getProgress, getServerProgress);
  // the hydration render uses the stable server snapshot; a real read replaces it
  const loaded = progress !== getServerProgress();

  const script = progress.script;
  const scriptKana = BY_SCRIPT[script];
  // the number is per script: あ and ア are different characters to write
  const count = scriptKana.filter((k) => progress.earned.has(k.kana)).length;
  const total = scriptKana.length;
  const track = TRACKS.find((t) => t.id === script)!;
  const base = progress.setChoice === "base";

  function run(cards: Kana[]) {
    setDeck(shuffle(cards));
    setSummary(null);
    setPhase("session");
  }

  if (phase === "session") {
    return (
      <Session
        key={deck.map((k) => k.hex).join()}
        deck={deck}
        trackLabel={track.label}
        earnKana={earnKana}
        onQuit={() => setPhase("home")}
        onFinish={(result) => {
          setSummary(result);
          setPhase("complete");
        }}
      />
    );
  }

  if (phase === "complete" && summary) {
    const missed = summary.missed;
    const shown = missed.slice(0, MISSED_CHIP_LIMIT);
    return (
      <main className="frame">
        <div className="livery" aria-hidden>
          <span className="ghost ghostDone">{track.glyph}</span>
        </div>
        <div className="legend">
          {script} · {base ? "base 46" : "all 71"} — {deck.length} cards
        </div>
        <div className="doneTitle">Session done.</div>

        <div className="statRow">
          <div className="stat">
            <div className="statLabel statGot">
              <i />
              got it
            </div>
            <div className="statValue">{summary.got}</div>
          </div>
          <div className="stat">
            <div className="statLabel statMissed">
              <i />
              missed
            </div>
            <div className="statValue">{missed.length}</div>
          </div>
        </div>

        {missed.length > 0 && (
          <>
            <div className="legend" style={{ marginTop: 28 }}>
              missed — will replay
            </div>
            <div className="missedList">
              {shown.map((k) => (
                <span key={k.hex} className="missedChip">
                  {k.kana}
                </span>
              ))}
              {missed.length > shown.length && (
                <span className="missedMore">+{missed.length - shown.length}</span>
              )}
            </div>
          </>
        )}

        <div className="trackSummary">
          <div className="trackSummaryHead">
            <span className="legend" style={{ fontSize: 9, letterSpacing: "0.18em" }}>
              {script} track
            </span>
            {summary.earned > 0 && (
              <span className="chipLive">+{summary.earned} from memory</span>
            )}
          </div>
          <div className="trackSummaryRow">
            <b>Written from memory</b>
            <span>
              {count}/{total}
            </span>
          </div>
          <div className="bar barOn" style={fill(count, total)}>
            <i />
          </div>
        </div>

        <div className="grow" />

        <div className="homeActions">
          {missed.length > 0 ? (
            <>
              <button
                type="button"
                className="btnStrike homeStart"
                onClick={() => run(missed)}
              >
                Replay missed ({missed.length})
              </button>
              <div className="actionRow">
                <button
                  type="button"
                  className="btnSeam"
                  onClick={() => run(kanaSet(script, base))}
                >
                  Again
                </button>
                <button type="button" className="btnSeam" onClick={() => setPhase("home")}>
                  Home
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                className="btnStrike homeStart"
                onClick={() => run(kanaSet(script, base))}
              >
                Again
              </button>
              <div className="actionRow">
                <button type="button" className="btnSeam" onClick={() => setPhase("home")}>
                  Home
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="frame">
      <div className="livery" aria-hidden>
        <span className="ghost ghostHome">{track.glyph}</span>
      </div>
      <header className="appHead">
        <span className="brand">KANA HERO</span>
        <span className="onDevice">offline · $0</span>
      </header>

      <div className="legend" style={{ marginTop: 30 }}>
        track
      </div>
      <div className="trackList">
        {TRACKS.map((t) => {
          const kana = BY_SCRIPT[t.id];
          const done = kana.filter((k) => progress.earned.has(k.kana)).length;
          const on = script === t.id;
          return (
            <div key={t.id} className={`track${on ? " trackOn" : ""}`}>
              <button
                type="button"
                className="trackSelect"
                aria-pressed={on}
                onClick={() => updateProgress({ script: t.id })}
              >
                <span className="trackTop">
                  <span className="trackName">
                    <span className="trackGlyph">{t.glyph}</span>
                    <span className="trackLabel">{t.label}</span>
                  </span>
                  <span className="trackCount">
                    {loaded ? `${done}/${kana.length}` : "—"}
                  </span>
                </span>
                <span
                  className={`bar${on ? " barOn" : ""}`}
                  style={fill(loaded ? done : 0, kana.length)}
                >
                  <i />
                </span>
              </button>

              {/* the set toggle belongs to the selected track only */}
              {on && (
                <div className="setToggle" role="radiogroup" aria-label="kana set">
                  <button
                    type="button"
                    role="radio"
                    aria-checked={base}
                    className={`setChip${base ? " setChipOn" : ""}`}
                    onClick={() => updateProgress({ setChoice: "base" })}
                  >
                    Base 46
                  </button>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={!base}
                    className={`setChip${!base ? " setChipOn" : ""}`}
                    onClick={() => updateProgress({ setChoice: "all" })}
                  >
                    All 71
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="grow" />

      <div className="homeNote">
        {script} — {base ? "base 46, no dakuten." : "all 71, dakuten included."}
        <br />
        Missed cards replay until zero.
      </div>

      <button
        type="button"
        className="btnStrike homeStart"
        onClick={() => run(kanaSet(script, base))}
        disabled={!loaded}
      >
        Start session
      </button>
      <a className="attribution" href="/licenses/strokesvg-LICENSE.txt">
        strokesvg (MIT) / Klee One (SIL OFL 1.1)
      </a>
    </main>
  );
}
