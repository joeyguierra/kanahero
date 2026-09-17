"use client";

// S1 and the app state machine. No routing — every screen is reached through
// this switch, and nothing is reachable except the way the flows say.
//
// S1 selects, the CTA commits: the three decks lead to their deck screen, the
// bank strip leads to the bank. The ghost glyph and the Joker's line follow
// the selection.

import { useEffect, useState, useSyncExternalStore, type CSSProperties } from "react";
import { BY_SCRIPT, kanaSet, type Kana, type Script } from "@/lib/kana";
import {
  getProgress,
  getServerProgress,
  subscribeProgress,
  updateProgress,
} from "@/lib/progress";
import { getBank, getServerBank, subscribeBank } from "@/lib/bank";
import { shuffle } from "@/lib/session";
import { deal, newSeed } from "@/lib/joker";
import { jokerLine, type JokerScreen } from "@/lib/joker-lines";
import { loadPlatformSets, type SetWord, type WordSet } from "@/lib/sets";
import Session, { type SessionSummary } from "@/components/Session";
import Bank from "@/components/Bank";
import CaptureDetail from "@/components/CaptureDetail";
import Joker from "@/components/Joker";
import Deck from "@/components/Deck";
import SetScreen from "@/components/SetScreen";
import Collection from "@/components/Collection";
import Round, { type RoundCard } from "@/components/Round";
import Result from "@/components/Result";
import Credits from "@/components/Credits";

type Phase =
  | "home"
  | "deck"
  | "set"
  | "collection"
  | "round"
  | "result"
  | "session"
  | "complete"
  | "bank"
  | "credits";

type DeckId = Script | "kanji";
type Selection = DeckId | "bank";

const DECKS: { id: DeckId; label: string; glyph: string }[] = [
  { id: "hiragana", label: "HIRAGANA", glyph: "あ" },
  { id: "katakana", label: "KATAKANA", glyph: "ア" },
  { id: "kanji", label: "KANJI", glyph: "漢" },
];

/** the ghost behind S1 — 親 is the dealer, 未 the bank's "not yet" */
const GHOST: Record<Selection | "none", string> = {
  none: "親",
  hiragana: "あ",
  katakana: "ア",
  kanji: "漢",
  bank: "未",
};

const MISSED_CHIP_LIMIT = 12;

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
  const [selection, setSelection] = useState<Selection | null>(null);
  const [sets, setSets] = useState<WordSet[]>([]);
  const [deckId, setDeckId] = useState<DeckId>("hiragana");
  const [activeSet, setActiveSet] = useState<WordSet | null>(null);
  const [queue, setQueue] = useState<SetWord[]>([]);
  const [hand, setHand] = useState<RoundCard[]>([]);
  const [drill, setDrill] = useState<Kana[]>([]);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [openCapture, setOpenCapture] = useState<string | null>(null);

  const progress = useSyncExternalStore(subscribeProgress, getProgress, getServerProgress);
  const bank = useSyncExternalStore(subscribeBank, getBank, getServerBank);
  const loaded = progress !== getServerProgress();

  // the platform sets are static JSON, precached by the service worker; the
  // decks show "—" for the fraction until they land, which is one frame
  useEffect(() => {
    loadPlatformSets().then(setSets, () => setSets([]));
  }, []);

  const script = progress.script;
  const base = progress.setChoice === "base";
  const bankCount = bank.captures.length;
  const setsFor = (id: DeckId) => sets.filter((s) => s.script === id);
  const deckGlyph = DECKS.find((d) => d.id === deckId)!.glyph;
  const deckLabel = DECKS.find((d) => d.id === deckId)!.label;

  function runDrill(cards: Kana[]) {
    setDrill(shuffle(cards));
    setSummary(null);
    setPhase("session");
  }

  function openDeck(id: DeckId) {
    setDeckId(id);
    if (id !== "kanji") updateProgress({ script: id });
    setPhase("deck");
  }

  /**
   * S1 rows and the bank strip. Choosing anything spends the Joker's wipe line
   * (SPEC-v5a §2): it stands on a cold home screen until it has been read, and
   * the first tap is the acknowledgement that retires it for good.
   */
  function choose(next: Selection) {
    if (progress.wiped) updateProgress({ wiped: false });
    setSelection(next);
  }

  function commit() {
    if (selection === null) return;
    if (selection === "bank") {
      setOpenCapture(null);
      setPhase("bank");
      return;
    }
    openDeck(selection);
  }

  // ---- the word-set screens ----

  if (phase === "set" && activeSet) {
    return (
      <SetScreen
        set={activeSet}
        deckName={deckLabel}
        onBack={() => setPhase("deck")}
        onCollection={() => setPhase("collection")}
        onDeal={() => {
          setQueue(deal(activeSet, newSeed()));
          setHand([]);
          setPhase("round");
        }}
      />
    );
  }

  if (phase === "collection" && activeSet) {
    return <Collection set={activeSet} onBack={() => setPhase("set")} />;
  }

  if (phase === "round" && activeSet && queue.length > 0) {
    return (
      <Round
        key={activeSet.id + queue.length}
        set={activeSet}
        queue={queue}
        onAbandon={() => setPhase("set")}
        onFinish={(won) => {
          setHand(won);
          setPhase("result");
        }}
      />
    );
  }

  if (phase === "result" && activeSet) {
    return <Result set={activeSet} hand={hand} onBackToDeck={() => setPhase("deck")} />;
  }

  if (phase === "deck") {
    const kana = deckId !== "kanji";
    const chars = kana ? BY_SCRIPT[deckId as Script] : [];
    return (
      <Deck
        script={deckId}
        glyph={deckGlyph}
        sets={setsFor(deckId)}
        characters={
          kana
            ? {
                label: base ? "BASE 46" : "ALL 71",
                done: chars.filter((k) => progress.earned.has(k.kana)).length,
                total: chars.length,
                base,
                onToggle: (b) => updateProgress({ setChoice: b ? "base" : "all" }),
              }
            : undefined
        }
        onHome={() => setPhase("home")}
        onCharacters={() => runDrill(kanaSet(deckId as Script, base))}
        onOpenSet={(set) => {
          setActiveSet(set);
          setPhase("set");
        }}
      />
    );
  }

  if (phase === "credits") {
    return <Credits onBack={() => setPhase("home")} />;
  }

  // ---- the v3 screens, unchanged but for the Joker ----

  if (phase === "bank") {
    const index = bank.captures.findIndex((c) => c.id === openCapture);
    if (openCapture !== null && index !== -1) {
      return (
        <CaptureDetail
          capture={bank.captures[index]}
          ordinal={bank.captures.length - index}
          total={bank.captures.length}
          onBack={() => setOpenCapture(null)}
        />
      );
    }
    return <Bank onBack={() => setPhase("home")} onOpen={setOpenCapture} />;
  }

  if (phase === "session") {
    return (
      <Session
        key={drill.map((k) => k.hex).join()}
        deck={drill}
        trackLabel={script.toUpperCase()}
        earnKana={earnKana}
        onQuit={() => setPhase("deck")}
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
    const chars = BY_SCRIPT[script];
    const count = chars.filter((k) => progress.earned.has(k.kana)).length;
    return (
      <main className="frame">
        <div className="livery" aria-hidden>
          <span className="ghost ghostDone">{deckGlyph}</span>
        </div>
        <div className="legend">
          {script} · {base ? "base 46" : "all 71"} — {drill.length} cards
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
            {summary.earned > 0 && <span className="chipLive">+{summary.earned} from memory</span>}
          </div>
          <div className="trackSummaryRow">
            <b>Written from memory</b>
            <span>
              {count}/{chars.length}
            </span>
          </div>
          <div className="bar barOn" style={fill(count, chars.length)}>
            <i />
          </div>
        </div>

        <div className="grow" />

        <div className="homeActions">
          {missed.length > 0 ? (
            <>
              <button type="button" className="btnStrike homeStart" onClick={() => runDrill(missed)}>
                Replay missed ({missed.length})
              </button>
              <div className="actionRow">
                <button
                  type="button"
                  className="btnSeam"
                  onClick={() => runDrill(kanaSet(script, base))}
                >
                  Again
                </button>
                <button type="button" className="btnSeam" onClick={() => setPhase("deck")}>
                  Deck
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                className="btnStrike homeStart"
                onClick={() => runDrill(kanaSet(script, base))}
              >
                Again
              </button>
              <div className="actionRow">
                <button type="button" className="btnSeam" onClick={() => setPhase("deck")}>
                  Deck
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    );
  }

  // ---- S1 ----

  const line = jokerLine(
    selection === null
      ? progress.wiped
        ? "home.wiped"
        : "home"
      : (`home.${selection}` as JokerScreen),
  );

  return (
    <main className="frame">
      <div className="livery" aria-hidden>
        <span className="ghost ghostHome">{GHOST[selection ?? "none"]}</span>
      </div>
      <div className="brand">KANA HERO</div>

      {/* the canvas draws him 110 wide on S1 — 89 tall, his art being 1.25:1 */}
      <Joker line={line} size={89} className="jokerHome" />

      <div className="legend legendSpaced">DECKS</div>
      <div className="deckList">
        {DECKS.map((d) => {
          const on = selection === d.id;
          // the row says what the deck holds, not how far through it you are:
          // a set is never finished, so there is no fraction to show and no
          // bar to fill (SPEC-v5a §3)
          const deckSets = setsFor(d.id);
          const value = `${deckSets.length} SET${deckSets.length === 1 ? "" : "S"}`;
          return (
            <button
              type="button"
              key={d.id}
              className={`deckRow${on ? " deckRowOn" : ""}`}
              aria-pressed={on}
              onClick={() => choose(d.id)}
            >
              <span className="deckRowTop">
                <span className="deckRowName">
                  <span className="deckGlyph">{d.glyph}</span>
                  <span className="deckLabel">{d.label}</span>
                </span>
                <span className="deckCount">{loaded ? value : "—"}</span>
              </span>
            </button>
          );
        })}

        <button
          type="button"
          className={`bankStrip${selection === "bank" ? " bankStripOn" : ""}`}
          aria-pressed={selection === "bank"}
          onClick={() => choose("bank")}
        >
          <span className="legend">BANK</span>
          <span className="grow" />
          <span className={`bankStripCount${bankCount === 0 ? " bankStripCountZero" : ""}`}>
            {bank.ready ? bankCount : "—"}
          </span>
          <span className="bankStripArrow">→</span>
        </button>
      </div>

      <div className="grow" />

      <button
        type="button"
        className={selection === null ? "btnInert homeStart" : "btnStrike homeStart"}
        onClick={commit}
        disabled={selection === null || !loaded}
      >
        {selection === "bank" ? "OPEN BANK" : "START SESSION"}
      </button>
      <button type="button" className="attribution" onClick={() => setPhase("credits")}>
        CREDITS
      </button>
    </main>
  );
}
