"use client";

// The v7 app: one switch, six screens, no routing (SPEC-v7-skeleton §7).
//
//   launch → S1 Today for the last-used set, or S0 when there is none
//   S0 row → S1 (through S1a the first time a set opens)
//   S1 DEAL → the loop (S2 → S3 → S4, per item) → S5 → S1

import { useEffect, useState, useSyncExternalStore } from "react";
import Credits from "@/components/Credits";
import Done from "@/components/Done";
import Loop, { type LoopResult } from "@/components/Loop";
import Placement from "@/components/Placement";
import Sets from "@/components/Sets";
import Today, { nextDueLine } from "@/components/Today";
import { exportLedger, logRow } from "@/lib/ledger";
import { localDay } from "@/lib/schedule";
import { loadPlatformSets, type WordSet } from "@/lib/sets";
import {
  applyGrade,
  buildQueue,
  getServerState,
  getState,
  importV6Once,
  setState,
  subscribeState,
  todayView,
  type QueueItem,
} from "@/lib/store";

type Phase = "sets" | "placement" | "today" | "loop" | "done" | "credits";

/** one deal, from DEAL to S5. The day is fixed at the start: a session that
    crosses midnight keeps its start day (§5 rule 10). */
interface Session {
  day: string;
  startTs: number;
  queue: QueueItem[];
  due: number;
  fresh: number;
  writeAnyway: boolean;
}

/** the session's ledger row; returns how many minutes it took */
function closeSession(setId: string, session: Session, results: LoopResult[]): number {
  const endTs = Date.now();
  if (results.length > 0) {
    void logRow({
      type: "session",
      day: session.day,
      setId,
      startTs: session.startTs,
      endTs,
      due: session.due,
      fresh: session.fresh,
      done: results.length,
      missed: results.filter((r) => !r.ok).length,
    });
  }
  return Math.max(1, Math.round((endTs - session.startTs) / 60000));
}

/** one grade: the schedule moves, and the ledger gets its row */
function recordGrade(setId: string, session: Session, item: QueueItem, ok: boolean, ms: number) {
  setState(applyGrade(getState(), setId, item, session.day, ok, session.writeAnyway));
  void logRow({
    type: "item",
    day: session.day,
    ts: Date.now(),
    setId,
    word: item.word,
    trial: item.trial,
    ok,
    ms,
  });
}

/** fix the queue and the day for one deal */
function startSession(set: WordSet, writeAnyway: boolean): Session | null {
  const day = localDay(new Date());
  const queue = buildQueue(getState(), set, day, writeAnyway);
  if (queue.length === 0) return null;
  return {
    day,
    startTs: Date.now(),
    queue,
    due: queue.filter((q) => !q.trial && !q.placed).length,
    fresh: queue.filter((q) => q.trial || q.placed).length,
    writeAnyway,
  };
}

export default function App() {
  const state = useSyncExternalStore(subscribeState, getState, getServerState);
  const [sets, setSets] = useState<WordSet[] | null>(null);
  const [phase, setPhase] = useState<Phase | null>(null);
  const [setId, setSetId] = useState<string | null>(null);
  const [today, setToday] = useState(() => localDay(new Date()));
  const [session, setSession] = useState<Session | null>(null);
  const [summary, setSummary] = useState<{ results: LoopResult[]; minutes: number } | null>(null);

  // the sets, then the one-time v6 import, then where launch lands
  useEffect(() => {
    let dead = false;
    void loadPlatformSets().then((loaded) => {
      if (dead) return;
      importV6Once(loaded, localDay(new Date()));
      const last = getState().lastSet;
      const known = loaded.some((s) => s.id === last);
      setSets(loaded);
      setSetId(known ? (last ?? null) : null);
      setPhase(known ? "today" : "sets");
    });
    return () => {
      dead = true;
    };
  }, []);

  // the app can sit open across midnight; the day follows the wall clock
  // whenever it comes back to the front
  useEffect(() => {
    const tick = () => setToday(localDay(new Date()));
    document.addEventListener("visibilitychange", tick);
    return () => document.removeEventListener("visibilitychange", tick);
  }, []);

  const set = sets?.find((s) => s.id === setId) ?? null;

  if (!sets || !phase) return <main className="frame" />;

  function open(next: WordSet) {
    setToday(localDay(new Date()));
    setSetId(next.id);
    setState({ ...getState(), lastSet: next.id });
    setPhase(getState().placement[next.id] ? "today" : "placement");
  }

  function deal(writeAnyway: boolean) {
    if (!set) return;
    const next = startSession(set, writeAnyway);
    if (!next) return;
    setToday(next.day);
    setSession(next);
    setPhase("loop");
  }

  if (phase === "credits") return <Credits onBack={() => setPhase("sets")} />;

  if (phase === "sets" || !set) {
    return (
      <Sets
        sets={sets}
        state={state}
        today={today}
        onOpen={open}
        onExport={() => void exportLedger(today)}
        onCredits={() => setPhase("credits")}
      />
    );
  }

  if (phase === "placement") {
    return (
      <Placement
        set={set}
        onChoose={(choice) => {
          const now = getState();
          setState({ ...now, placement: { ...now.placement, [set.id]: choice } });
          setPhase("today");
        }}
      />
    );
  }

  if (phase === "loop" && session) {
    return (
      <Loop
        key={session.startTs}
        set={set}
        queue={session.queue}
        onGrade={(item, ok, ms) => recordGrade(set.id, session, item, ok, ms)}
        onFinish={(results) => {
          setSummary({ results, minutes: closeSession(set.id, session, results) });
          setPhase("done");
        }}
        onQuit={(results) => {
          closeSession(set.id, session, results);
          setSession(null);
          setToday(localDay(new Date()));
          setPhase("today");
        }}
      />
    );
  }

  if (phase === "done" && session && summary) {
    return (
      <Done
        day={session.day}
        results={summary.results}
        minutes={summary.minutes}
        next={nextDueLine(todayView(state, set, session.day).next, session.day)}
        onClose={() => {
          setSession(null);
          setSummary(null);
          setToday(localDay(new Date()));
          setPhase("today");
        }}
      />
    );
  }

  return (
    <Today set={set} view={todayView(state, set, today)} onSets={() => setPhase("sets")} onDeal={deal} />
  );
}
