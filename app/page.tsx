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
  hasStoredProgress,
  getServerProgress,
  setMeaningOn,
  subscribeProgress,
  updateProgress,
  type AudioPrefs,
} from "@/lib/progress";
import { getBank, getServerBank, subscribeBank } from "@/lib/bank";
import { shuffle } from "@/lib/session";
import { audio, canSound, setAudioPrefs } from "@/lib/audio";
import { voice } from "@/lib/joker-voice";
import { play, preload, TOGGLE_OFF } from "@/lib/sfx";
import { allTotals, deal, newSeed, runsFinished } from "@/lib/joker";
import { useJokerLine, type JokerScreen } from "@/lib/joker-lines";
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
import Settings from "@/components/Settings";

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
  /** the seed the queue was dealt from — the run's receipts carry it */
  const [runSeed, setRunSeed] = useState(0);
  const [hand, setHand] = useState<RoundCard[]>([]);
  /** S6b's MEANING switch as it stood at DEAL: the run reads this, never the
      stored choice, so flipping the switch later cannot reach a run in play */
  const [runMeaning, setRunMeaning] = useState(true);
  /** how many of the last run's cards were a stock its shelf never held */
  const [newStock, setNewStock] = useState(0);
  const [drill, setDrill] = useState<Kana[]>([]);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [openCapture, setOpenCapture] = useState<string | null>(null);

  const progress = useSyncExternalStore(subscribeProgress, getProgress, getServerProgress);
  const bank = useSyncExternalStore(subscribeBank, getBank, getServerBank);
  const loaded = progress !== getServerProgress();

  /** the settings dialog, over S1 */
  const [settings, setSettings] = useState(false);

  // the audio gate follows the stored switches — on every load, and on every
  // flip. The context itself is only ever built inside a tap in the dialog
  // (below), because that is the one moment a browser lets it start.
  useEffect(() => {
    setAudioPrefs(progress.audio);
  }, [progress.audio]);

  // S6b's deal is nearly always the session's first one-shot, and it is the
  // tightest cue in the app: nine lands 90 ms apart, the first of them under
  // 200 ms after the screen mounts. Decoding the files inside that window
  // costs the first land outright, and a context built in the same breath
  // starts its clock late enough to put the rest behind the picture. So the
  // screen before it warms both — the tap that opened the deck is the gesture
  // the context needs, and nothing sounds here.
  useEffect(() => {
    if (phase === "deck" && canSound("sfx")) void preload();
  }, [phase]);

  /**
   * One switch in the settings dialog. A flip that opens a channel builds and
   * unlocks the AudioContext inside this same gesture, decodes the one-shots,
   * and sounds that channel once — so the tap that turns a thing on is heard
   * to. Silencing sounds nothing, obviously.
   */
  function changeAudio(patch: Partial<AudioPrefs>) {
    const was = progress.audio;
    const next = { ...was, ...patch };
    updateProgress({ audio: next });
    setAudioPrefs(next);
    if (!audio()) return;
    // which way did the switch the user moved go? SILENT MODE moves both keys
    // and moves them together, so any key in the patch answers it.
    const on = Object.values(patch).some(Boolean);
    // The click that says the switch moved. Turning SOUND EFFECTS on is the one
    // cue in the app that must always be heard — it is how the player learns
    // the channel exists — and on a cold context nothing is decoded yet, so it
    // waits for the buffers rather than being the one tap that makes no sound.
    // Switching sfx OFF is silent, which is the point of switching it off.
    if (next.sfx) void preload().then(() => play("ui.toggle", { rate: on ? 1 : TOGGLE_OFF }));
    if (next.voice && !was.voice && canSound("voice")) voice().say("・");
  }

  // S1's line. The hook sits above every phase's early return, so the screen
  // he is not on passes null and spends nothing (SPEC-v5b §5).
  // Nothing is drawn until storage has landed: with an empty context the
  // conditional lines are all ineligible, so an early draw would spend a line
  // he was never going to say. The panel holds its height meanwhile.
  const homeScreen: JokerScreen | null =
    phase !== "home" || !loaded
      ? null
      : selection === null
        ? progress.wiped
          ? "home.wiped"
          : "home"
        : (`home.${selection}` as JokerScreen);
  const homeLine = useJokerLine(
    homeScreen,
    {
      // first ever means this browser has never written a blob — not an empty
      // one, which is also what a wipe leaves behind
      firstEver: !hasStoredProgress(),
      wiped: progress.wiped,
      runsFinished: runsFinished(),
      ...allTotals(),
      bank: bank.ready ? bank.captures.length : undefined,
    },
    // a new line when the deck under his nose changes
    selection,
  );

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

  /**
   * Every plain move between screens (SPEC-v5d §2d, tier 3). ui.nav IS the
   * transition — the inventory lists screen transitions as deliberately silent
   * precisely because this cue is the transition — so it belongs to the state
   * machine, not to eight buttons. A screen added later inherits it by being a
   * screen.
   *
   * The louder moves opt out by not coming through here: choosing a deck or a
   * set is drawer.open, a confirm is ui.primary, and the moves that happen
   * inside a run (DEAL, FLIP, the grade) already own a cue or are deliberately
   * silent.
   */
  function go(next: Phase) {
    play("ui.nav");
    setPhase(next);
  }

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
    // the drawer under the table, where the decks live — a bigger act than
    // navigating, and the ladder says so at −16 against nav's −22. Guarded on
    // the row actually changing: its 250 ms gap is a fact about the cue, not
    // something the player enforces by tapping slowly.
    if (next !== selection) play("drawer.open");
    setSelection(next);
  }

  function commit() {
    if (selection === null) return;
    // the confirm. START SESSION and OPEN BANK are both this: a latch closing
    // on a choice already made, which is why the choice itself sounded first.
    play("ui.primary");
    if (selection === "bank") {
      setOpenCapture(null);
      setPhase("bank");
      return;
    }
    openDeck(selection);
  }

  // ---- the word-set screens ----

  if (phase === "set" && activeSet) {
    const meaning = !progress.meaningOff.includes(activeSet.id);
    return (
      <SetScreen
        set={activeSet}
        deckName={deckLabel}
        meaning={meaning}
        onMeaning={(on) => setMeaningOn(activeSet.id, on)}
        onBack={() => go("deck")}
        onCollection={() => go("collection")}
        onDeal={() => {
          setRunMeaning(meaning);
          const seed = newSeed();
          setRunSeed(seed);
          setQueue(deal(activeSet, seed));
          setHand([]);
          setPhase("round");
        }}
      />
    );
  }

  if (phase === "collection" && activeSet) {
    return <Collection set={activeSet} onBack={() => go("set")} />;
  }

  if (phase === "round" && activeSet && queue.length > 0) {
    return (
      <Round
        key={activeSet.id + queue.length}
        set={activeSet}
        queue={queue}
        seed={runSeed}
        meaning={runMeaning}
        onAbandon={() => setPhase("set")}
        onFinish={(won, fresh) => {
          setHand(won);
          setNewStock(fresh);
          setPhase("result");
        }}
      />
    );
  }

  if (phase === "result" && activeSet) {
    return (
      <Result
        set={activeSet}
        hand={hand}
        newStock={newStock}
        onBackToDeck={() => go("deck")}
      />
    );
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
        onHome={() => go("home")}
        onCharacters={() => {
          // the CHARACTERS panel starts a drill: a bone/strike CTA with no cue
          // of its own, which is exactly what ui.primary is for
          play("ui.primary");
          runDrill(kanaSet(deckId as Script, base));
        }}
        onOpenSet={(set) => {
          // a set is chosen — the same act as choosing a deck, same cue
          play("drawer.open");
          setActiveSet(set);
          setPhase("set");
        }}
      />
    );
  }

  if (phase === "credits") {
    return <Credits onBack={() => go("home")} />;
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
          onBack={() => {
            play("ui.nav");
            setOpenCapture(null);
          }}
        />
      );
    }
    return (
      <Bank
        onBack={() => go("home")}
        onOpen={(id) => {
          play("ui.nav");
          setOpenCapture(id);
        }}
      />
    );
  }

  if (phase === "session") {
    return (
      <Session
        key={drill.map((k) => k.hex).join()}
        deck={drill}
        trackLabel={script.toUpperCase()}
        earnKana={earnKana}
        onQuit={() => go("deck")}
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
              <button
                type="button"
                className="btnStrike homeStart"
                onClick={() => {
                  play("ui.primary");
                  runDrill(missed);
                }}
              >
                Replay missed ({missed.length})
              </button>
              <div className="actionRow">
                <button
                  type="button"
                  className="btnSeam"
                  onClick={() => {
                    play("ui.primary");
                    runDrill(kanaSet(script, base));
                  }}
                >
                  Again
                </button>
                <button type="button" className="btnSeam" onClick={() => go("deck")}>
                  Deck
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                className="btnStrike homeStart"
                onClick={() => {
                  play("ui.primary");
                  runDrill(kanaSet(script, base));
                }}
              >
                Again
              </button>
              <div className="actionRow">
                <button type="button" className="btnSeam" onClick={() => go("deck")}>
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

  return (
    <main className={`frame${settings ? " frameBehindDialog" : ""}`}>
      <div className="livery" aria-hidden>
        <span className="ghost ghostHome">{GHOST[selection ?? "none"]}</span>
      </div>
      <div className="brand">KANA HERO</div>

      {/* the canvas draws him 110 wide on S1 — 89 tall, his art being 1.25:1 */}
      <Joker line={homeLine.text} lineId={homeLine.id} size={89} className="jokerHome" />

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
      <div className="homeFoot">
        <button type="button" className="attribution" onClick={() => go("credits")}>
          CREDITS
        </button>
        <button type="button" className="attribution" onClick={() => setSettings(true)}>
          SETTINGS
        </button>
      </div>

      {settings && (
        <Settings audio={progress.audio} onAudio={changeAudio} onClose={() => setSettings(false)} />
      )}
    </main>
  );
}
