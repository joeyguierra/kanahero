"use client";

// The v7 app: one switch, one queue, no routing (SPEC-v7-skeleton §7).
//
//   launch → S1 Today, the only home
//   S1 DEAL or MORE → the loop (S2 → S3 → S4, per word) → S5 → S1

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Credits from "@/components/Credits";
import Menu from "@/components/Menu";
import Done from "@/components/Done";
import Loop, { type LoopResult } from "@/components/Loop";
import Today, { nextDueLine } from "@/components/Today";
import { exportLedger, logRow } from "@/lib/ledger";
import { localDay } from "@/lib/schedule";
import {
  applyGrade,
  buildQueue,
  getServerState,
  getState,
  setState,
  subscribeState,
  todayView,
  type QueueItem,
} from "@/lib/store";
import { loadWords, type Word } from "@/lib/words";

type Phase = "today" | "loop" | "done" | "credits" | "menu";

/** one deal, from DEAL or MORE to S5. The day is fixed at the start: a session that
    crosses midnight keeps its start day (§5 rule 10). */
interface Session {
  day: string;
  startTs: number;
  queue: QueueItem[];
  due: number;
  fresh: number;
}

/** the session's ledger row; returns how many minutes it took */
function closeSession(session: Session, results: LoopResult[]): number {
  const endTs = Date.now();
  if (results.length > 0) {
    void logRow({
      type: "session",
      day: session.day,
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
function recordGrade(session: Session, item: QueueItem, ok: boolean, ms: number) {
  setState(applyGrade(getState(), item, session.day, ok));
  void logRow({
    type: "item",
    day: session.day,
    ts: Date.now(),
    word: item.id,
    trial: item.trial,
    ok,
    ms,
  });
}

/** fix the queue and the day for one deal */
function startSession(order: string[], more: boolean): Session | null {
  const day = localDay(new Date());
  const queue = buildQueue(getState(), order, day, more);
  if (queue.length === 0) return null;
  return {
    day,
    startTs: Date.now(),
    queue,
    due: queue.filter((q) => !q.trial).length,
    fresh: queue.filter((q) => q.trial).length,
  };
}

export default function App() {
  const state = useSyncExternalStore(subscribeState, getState, getServerState);
  const [words, setWords] = useState<Word[] | null>(null);
  const [phase, setPhase] = useState<Phase>("today");
  const [today, setToday] = useState(() => localDay(new Date()));
  const [session, setSession] = useState<Session | null>(null);
  const [summary, setSummary] = useState<{ results: LoopResult[]; minutes: number } | null>(null);

  useEffect(() => {
    let dead = false;
    void loadWords().then((loaded) => {
      if (!dead) setWords(loaded);
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

  const order = useMemo(() => words?.map((w) => w.write) ?? [], [words]);

  if (!words) return <main className="frame" />;

  function deal(more: boolean) {
    const next = startSession(order, more);
    if (!next) return;
    setToday(next.day);
    setSession(next);
    setPhase("loop");
  }

  function home() {
    setSession(null);
    setSummary(null);
    setToday(localDay(new Date()));
    setPhase("today");
  }

  if (phase === "credits") return <Credits onBack={() => setPhase("today")} />;
  if (phase === "menu") return <Menu onBack={() => setPhase("today")} />;

  if (phase === "loop" && session) {
    return (
      <Loop
        key={session.startTs}
        words={words}
        queue={session.queue}
        onGrade={(item, ok, ms) => recordGrade(session, item, ok, ms)}
        onFinish={(results) => {
          setSummary({ results, minutes: closeSession(session, results) });
          setPhase("done");
        }}
        onQuit={(results) => {
          closeSession(session, results);
          home();
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
        next={nextDueLine(todayView(state, order, session.day).next, session.day)}
        onClose={home}
      />
    );
  }

  return (
    <Today
      day={today}
      view={todayView(state, order, today)}
      onDeal={deal}
      onExport={() => void exportLedger(today)}
      onCredits={() => setPhase("credits")}
      onMenu={() => setPhase("menu")}
    />
  );
}
