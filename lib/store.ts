// v7 state: what the scheduler remembers between days (SPEC-v7-skeleton §8).
// One versioned blob in localStorage. The top half is pure — state in, state
// out — so scripts/e2e-schedule.mjs can run it without a browser.

import {
  DUE_CEILING,
  NEW_CAP,
  addDays,
  deal,
  grade,
  isDone,
  nextDue,
  unseen,
  type Deal,
  type ItemState,
  type Rung,
} from "./schedule";
import { itemId, type WordSet } from "./sets";

export type Placement = "new" | "known";

export interface V7State {
  version: 1;
  /** only items that have been graded; anything absent is unseen */
  items: Record<string, ItemState>;
  placement: Record<string, Placement>;
  /** per set: how many new items were first written against `day`'s cap */
  capSpent: Record<string, { day: string; n: number }>;
  /** the set Today opens on at launch */
  lastSet?: string;
  /** the v6 blob has been read; it is never read again */
  importedV6: boolean;
}

export function emptyState(): V7State {
  return { version: 1, items: {}, placement: {}, capSpent: {}, importedV6: false };
}

const DAY = /^\d{4}-\d{2}-\d{2}$/;
const isDay = (v: unknown): v is string => typeof v === "string" && DAY.test(v);
const isObj = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);

/** trust nothing from storage: a bad entry is dropped, not thrown */
export function parseState(raw: string | null): V7State {
  const out = emptyState();
  if (!raw) return out;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return out;
  }
  if (!isObj(data) || data.version !== 1) return out;
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
  if (isObj(data.placement)) {
    for (const [id, v] of Object.entries(data.placement)) {
      if (v === "new" || v === "known") out.placement[id] = v;
    }
  }
  if (isObj(data.capSpent)) {
    for (const [id, v] of Object.entries(data.capSpent)) {
      if (isObj(v) && isDay(v.day) && typeof v.n === "number" && v.n > 0) {
        out.capSpent[id] = { day: v.day, n: Math.floor(v.n) };
      }
    }
  }
  if (typeof data.lastSet === "string") out.lastSet = data.lastSet;
  out.importedV6 = data.importedV6 === true;
  return out;
}

/** every item of a set, in set order, seen or not */
export function itemsFor(state: V7State, set: WordSet): ItemState[] {
  return set.words.map((w) => {
    const id = itemId(set.id, w.word);
    return state.items[id] ?? unseen(id);
  });
}

/** What is left of today's new-item cap. A cap already borrowed by an earlier
    WRITE ANYWAY sits on a later day and leaves nothing for today. */
export function capLeft(state: V7State, setId: string, today: string): number {
  const spent = state.capSpent[setId];
  if (!spent || spent.day < today) return NEW_CAP;
  if (spent.day > today) return 0;
  return Math.max(0, NEW_CAP - spent.n);
}

function dealWith(state: V7State, set: WordSet, today: string, newCap: number): Deal {
  return deal({
    today,
    items: itemsFor(state, set),
    setOrder: set.words.map((w) => itemId(set.id, w.word)),
    newCap,
    dueCeiling: DUE_CEILING,
    placedKnown: state.placement[set.id] === "known",
  });
}

export type TodayKind = "deal" | "writeAnyway" | "done";

export interface TodayView {
  kind: TodayKind;
  due: number;
  fresh: number;
  /** the "next: <day> · <n> due" line; null when nothing is scheduled */
  next: { day: string; count: number } | null;
}

/** S1's state, and S0's row (SPEC-v7 §7). */
export function todayView(state: V7State, set: WordSet, today: string): TodayView {
  const d = dealWith(state, set, today, capLeft(state, set.id, today));
  const items = itemsFor(state, set);
  const kind: TodayKind =
    d.due.length + d.fresh.length > 0 ? "deal" : isDone(items, today) ? "done" : "writeAnyway";
  return { kind, due: d.due.length, fresh: d.fresh.length, next: nextDue(items, today) };
}

export interface QueueItem {
  id: string;
  word: string;
  /** first exposure: show the form, then melt (§6.2) */
  trial: boolean;
  /** blind first write of a placed-known set (§5 rule 6) */
  placed: boolean;
}

/**
 * The session queue, fixed when DEAL is tapped: due first, then new. WRITE
 * ANYWAY deals a full cap of new items and then tomorrow's (§5 rule 7).
 */
export function buildQueue(
  state: V7State,
  set: WordSet,
  today: string,
  writeAnyway = false,
): QueueItem[] {
  const d = dealWith(state, set, today, writeAnyway ? NEW_CAP : capLeft(state, set.id, today));
  const known = state.placement[set.id] === "known";
  const word = (id: string) => id.slice(set.id.length + 1);
  const old = (id: string): QueueItem => ({ id, word: word(id), trial: false, placed: false });
  const fresh = (id: string): QueueItem => ({ id, word: word(id), trial: !known, placed: known });
  return [...d.due.map(old), ...d.fresh.map(fresh), ...(writeAnyway ? d.pulledForward.map(old) : [])];
}

/**
 * One grade. A capped new item spends the cap of the day it was dealt for:
 * today's in a normal deal, tomorrow's under WRITE ANYWAY.
 */
export function applyGrade(
  state: V7State,
  setId: string,
  q: QueueItem,
  today: string,
  ok: boolean,
  writeAnyway = false,
): V7State {
  const before = state.items[q.id] ?? unseen(q.id);
  const items = { ...state.items, [q.id]: grade(before, today, ok, { placed: q.placed }) };
  if (before.seen || q.placed) return { ...state, items };
  const day = writeAnyway ? addDays(today, 1) : today;
  const spent = state.capSpent[setId];
  const n = spent && spent.day === day ? spent.n + 1 : spent && spent.day > day ? spent.n : 1;
  const capDay = spent && spent.day > day ? spent.day : day;
  return { ...state, items, capSpent: { ...state.capSpent, [setId]: { day: capDay, n } } };
}

/**
 * Read v6's `kanahero:v1` once. A word v6 had a card for, or a kana word whose
 * every character v6 counted as written from memory, enters seen at rung 1,
 * due today: prior work is kept and immediately re-tested. The v6 blob itself
 * is never written.
 */
export function importV6(
  state: V7State,
  sets: WordSet[],
  v6raw: string | null,
  today: string,
): V7State {
  if (state.importedV6) return state;
  const done = { ...state, importedV6: true };
  let data: unknown;
  try {
    data = v6raw ? JSON.parse(v6raw) : null;
  } catch {
    return done;
  }
  if (!isObj(data)) return done;
  const earned = new Set(
    Array.isArray(data.earned) ? data.earned.filter((c) => typeof c === "string") : [],
  );
  const cards = isObj(data.joker) ? data.joker : {};
  const items = { ...state.items };
  for (const set of sets) {
    const held = cards[set.id];
    for (const w of set.words) {
      const id = itemId(set.id, w.word);
      if (items[id]) continue;
      const hadCard = isObj(held) && isObj(held[w.word]);
      const kanaKnown = set.script !== "kanji" && [...w.word].every((ch) => earned.has(ch));
      if (hadCard || kanaKnown) items[id] = { id, rung: 1, due: today, seen: true };
    }
  }
  return { ...done, items };
}

// ---- the blob, and a tiny store around it for useSyncExternalStore ----

const KEY = "kanahero:v7";
const V6_KEY = "kanahero:v1";

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

/** run the one-time v6 import once the sets are loaded */
export function importV6Once(sets: WordSet[], today: string): void {
  const state = getState();
  if (state.importedV6) return;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(V6_KEY);
  } catch {
    // unreadable storage imports nothing
  }
  setState(importV6(state, sets, raw, today));
}
