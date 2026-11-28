// v7 state: what the scheduler remembers between days (SPEC-v7-skeleton §8).
// One versioned blob in localStorage. The top half is pure — state in, state
// out — so scripts/e2e-schedule.mjs can run it without a browser.
//
// One queue, one pile a day (§5, SPEC-kanji-upgrade §2.4): young reviews, then
// up to NEW_CAP new words and UPGRADE_CAP kanji upgrades, then late reviews,
// all under PILE_MAX. When that deal is written, MORE adds new words, NEW_CAP
// at a time, until the day's pile is full.

import {
  NEW_CAP,
  PILE_MAX,
  UPGRADE_CAP,
  addDays,
  deal,
  grade,
  isParked,
  nextDue,
  unseen,
  type Deal,
  type ItemState,
  type Rung,
  type Upgrades,
} from "./schedule";

/** What the scheduler needs to know of the word list. */
export interface Deck {
  /** list word ids in list order; new words are dealt from here */
  order: string[];
  /** a marked kana word's id → its kanji upgrade's id */
  upgrades: Upgrades;
}

/** `pairs`: each upgrade as [kana word, kanji form] */
export function deckOf(order: string[], pairs: [string, string][] = []): Deck {
  return { order, upgrades: new Map(pairs) };
}

export interface V7State {
  version: 2;
  /** only items that have been graded; anything absent is unseen. Keyed by
      the written word. */
  items: Record<string, ItemState>;
  /** how many new words were first written on `day` */
  newSpent?: { day: string; n: number };
  /** how many kanji upgrades were first written on `day` */
  upSpent?: { day: string; n: number };
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
  for (const key of ["newSpent", "upSpent"] as const) {
    const spent = data[key];
    if (isObj(spent) && isDay(spent.day) && typeof spent.n === "number" && spent.n > 0) {
      out[key] = { day: spent.day, n: Math.floor(spent.n) };
    }
  }
  return out;
}

/** every item of the list in list order, then every upgrade, seen or not */
export function itemsFor(state: V7State, deck: Deck): ItemState[] {
  return [...deck.order, ...deck.upgrades.values()].map((id) => state.items[id] ?? unseen(id));
}

/** How much of today's pile is left. Every word graded today has taken a
    place in it, new or review, got or missed. */
export function roomLeft(state: V7State, today: string): number {
  const written = Object.values(state.items).filter((s) => s.lastDay === today).length;
  return Math.max(0, PILE_MAX - written);
}

const spentOn = (spent: V7State["newSpent"], today: string) =>
  spent && spent.day === today ? spent.n : 0;

/** what is left of the deal's new words: NEW_CAP less those first written today */
export function newLeft(state: V7State, today: string): number {
  return Math.max(0, NEW_CAP - spentOn(state.newSpent, today));
}

/** what is left of the day's upgrades: UPGRADE_CAP less those first written today */
export function upLeft(state: V7State, today: string): number {
  return Math.max(0, UPGRADE_CAP - spentOn(state.upSpent, today));
}

/** The day's deal, or with `more` the next batch of new words on top of it.
    MORE never adds an upgrade. */
function dealWith(state: V7State, deck: Deck, today: string, more: boolean): Deal {
  return deal({
    today,
    items: itemsFor(state, deck),
    order: deck.order,
    upgrades: deck.upgrades,
    newLeft: more ? NEW_CAP : newLeft(state, today),
    upLeft: more ? 0 : upLeft(state, today),
    room: roomLeft(state, today),
  });
}

export type TodayKind = "deal" | "more" | "done";

export interface TodayView {
  kind: TodayKind;
  due: number;
  /** new words and kanji upgrades together */
  fresh: number;
  /** the "next: <day> · <n> due" line; null when nothing is scheduled */
  next: { day: string; count: number } | null;
}

/** Today's state (SPEC-v7 §7):
    deal  there is a pile to write
    more  the deal is written, the pile has room and unseen words remain
    done  the pile is full, or nothing is left to give */
export function todayView(state: V7State, deck: Deck, today: string): TodayView {
  const d = dealWith(state, deck, today, false);
  // a parked kana word is never due again
  const items = itemsFor(state, deck).filter((s) => !isParked(s, deck.upgrades));
  const fresh = d.fresh.length + d.ups.length;
  const dealt = d.due.length + fresh > 0;
  const kind: TodayKind = dealt
    ? "deal"
    : dealWith(state, deck, today, true).fresh.length > 0
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
    fresh,
    next: next && { day: next.day, count: Math.min(PILE_MAX, next.count) },
  };
}

export interface QueueItem {
  /** the written word */
  id: string;
  /** first exposure: show the form, then melt (§6.2) */
  trial: boolean;
  /** a kanji upgrade: the kana word it took over from. On every queue item of
      an upgraded word, trial or review. */
  upgradeOf?: string;
}

/** The session queue, fixed when the button is tapped: reviews (young, then
    late), then upgrades, then new words. */
export function buildQueue(state: V7State, deck: Deck, today: string, more = false): QueueItem[] {
  const d = dealWith(state, deck, today, more);
  const kanaOf = new Map([...deck.upgrades].map(([kana, kanji]) => [kanji, kana]));
  const item = (trial: boolean) => (id: string): QueueItem => {
    const upgradeOf = kanaOf.get(id);
    return upgradeOf ? { id, trial, upgradeOf } : { id, trial };
  };
  return [...d.due.map(item(false)), ...d.ups.map(item(true)), ...d.fresh.map(item(true))];
}

/** One grade. A word's first write counts against the day it was written: an
    upgrade against the day's upgrades, any other word against its new words. */
export function applyGrade(state: V7State, q: QueueItem, today: string, ok: boolean): V7State {
  const before = state.items[q.id] ?? unseen(q.id);
  const items = { ...state.items, [q.id]: grade(before, today, ok) };
  if (before.seen) return { ...state, items };
  const key = q.upgradeOf ? "upSpent" : "newSpent";
  return { ...state, items, [key]: { day: today, n: spentOn(state[key], today) + 1 } };
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
