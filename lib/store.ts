// v7 state: what the scheduler remembers between days (SPEC-v7-skeleton §8).
// One versioned blob in localStorage. The top half is pure — state in, state
// out — so scripts/e2e-schedule.mjs can run it without a browser.
//
// One queue, one pile a day (§5): every due word first, oldest first, then up
// to NEW_CAP new words in the room left under PILE_MAX. When that deal is
// written, MORE adds new words, NEW_CAP at a time, until the day's pile is
// full.

import {
  NEW_CAP,
  PILE_MAX,
  addDays,
  deal,
  grade,
  nextDue,
  unseen,
  type Deal,
  type ItemState,
  type Rung,
} from "./schedule";

export interface V7State {
  version: 2;
  /** only items that have been graded; anything absent is unseen. Keyed by
      the written word. */
  items: Record<string, ItemState>;
  /** how many new words were first written on `day` */
  newSpent?: { day: string; n: number };
}

export function emptyState(): V7State {
  return { version: 2, items: {} };
}

const DAY = /^\d{4}-\d{2}-\d{2}$/;
const isDay = (v: unknown): v is string => typeof v === "string" && DAY.test(v);
const isObj = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);

/** Trust nothing from storage: a bad entry is dropped, not thrown. A version 1
    blob was keyed by set and is not carried over: the queue starts clean. */
export function parseState(raw: string | null): V7State {
  const out = emptyState();
  if (!raw) return out;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return out;
  }
  if (!isObj(data) || data.version !== 2) return out;
  if (isObj(data.items)) {
    for (const [id, v] of Object.entries(data.items)) {
      if (!isObj(v) || !isDay(v.due)) continue;
      const rung = v.rung;
      if (typeof rung !== "number" || !Number.isInteger(rung) || rung < 1 || rung > 5) continue;
      out.items[id] = {
        id,
        rung: rung as Rung,
        due: v.due,
        lastDay: isDay(v.lastDay) ? v.lastDay : undefined,
        seen: true,
      };
    }
  }
  const spent = data.newSpent;
  if (isObj(spent) && isDay(spent.day) && typeof spent.n === "number" && spent.n > 0) {
    out.newSpent = { day: spent.day, n: Math.floor(spent.n) };
  }
  return out;
}

/** every item of the list, in list order, seen or not */
export function itemsFor(state: V7State, order: string[]): ItemState[] {
  return order.map((id) => state.items[id] ?? unseen(id));
}

/** How much of today's pile is left. Every word graded today has taken a
    place in it, new or review, got or missed. */
export function roomLeft(state: V7State, today: string): number {
  const written = Object.values(state.items).filter((s) => s.lastDay === today).length;
  return Math.max(0, PILE_MAX - written);
}

/** what is left of the deal's new words: NEW_CAP less those first written today */
export function newLeft(state: V7State, today: string): number {
  const spent = state.newSpent;
  return Math.max(0, NEW_CAP - (spent && spent.day === today ? spent.n : 0));
}

/** The day's deal, or with `more` the next batch of new words on top of it. */
function dealWith(state: V7State, order: string[], today: string, more: boolean): Deal {
  return deal({
    today,
    items: itemsFor(state, order),
    order,
    newLeft: more ? NEW_CAP : newLeft(state, today),
    room: roomLeft(state, today),
  });
}

export type TodayKind = "deal" | "more" | "done";

export interface TodayView {
  kind: TodayKind;
  due: number;
  fresh: number;
  /** the "next: <day> · <n> due" line; null when nothing is scheduled */
  next: { day: string; count: number } | null;
}

/** Today's state (SPEC-v7 §7):
    deal  there is a pile to write
    more  the deal is written, the pile has room and unseen words remain
    done  the pile is full, or nothing is left to give */
export function todayView(state: V7State, order: string[], today: string): TodayView {
  const d = dealWith(state, order, today, false);
  const items = itemsFor(state, order);
  const dealt = d.due.length + d.fresh.length > 0;
  const kind: TodayKind = dealt
    ? "deal"
    : dealWith(state, order, today, true).fresh.length > 0
      ? "more"
      : "done";
  // Due words the pile had no room for slide to tomorrow and join what is due
  // then. The line never promises more than one pile.
  const tomorrow = addDays(today, 1);
  const waiting = dealt ? 0 : d.held;
  const soon = nextDue(items, today);
  const next =
    waiting > 0
      ? { day: tomorrow, count: waiting + (soon && soon.day === tomorrow ? soon.count : 0) }
      : soon;
  return {
    kind,
    due: d.due.length,
    fresh: d.fresh.length,
    next: next && { day: next.day, count: Math.min(PILE_MAX, next.count) },
  };
}

export interface QueueItem {
  /** the written word */
  id: string;
  /** first exposure: show the form, then melt (§6.2) */
  trial: boolean;
}

/** The session queue, fixed when the button is tapped: due first, then new. */
export function buildQueue(
  state: V7State,
  order: string[],
  today: string,
  more = false,
): QueueItem[] {
  const d = dealWith(state, order, today, more);
  return [
    ...d.due.map((id) => ({ id, trial: false })),
    ...d.fresh.map((id) => ({ id, trial: true })),
  ];
}

/** One grade. A word's first write counts against the day it was written. */
export function applyGrade(state: V7State, q: QueueItem, today: string, ok: boolean): V7State {
  const before = state.items[q.id] ?? unseen(q.id);
  const items = { ...state.items, [q.id]: grade(before, today, ok) };
  if (before.seen) return { ...state, items };
  const spent = state.newSpent;
  const n = spent && spent.day === today ? spent.n + 1 : 1;
  return { ...state, items, newSpent: { day: today, n } };
}

// ---- the blob, and a tiny store around it for useSyncExternalStore ----

const KEY = "kanahero:v7";

const SERVER = emptyState(); // stable hydration snapshot
let cache: V7State | null = null;
const listeners = new Set<() => void>();

function load(): V7State {
  if (typeof window === "undefined") return SERVER;
  try {
    return parseState(window.localStorage.getItem(KEY));
  } catch {
    return emptyState();
  }
}

export function subscribeState(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function getState(): V7State {
  if (cache === null) cache = load();
  return cache;
}

export function getServerState(): V7State {
  return SERVER;
}

/** replace, persist, notify — the only write path */
export function setState(next: V7State): V7State {
  cache = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // storage full or unavailable — the session still works, it just won't persist
  }
  listeners.forEach((l) => l());
  return next;
}
