// On-device persistence: the earned set (the number), the last set choice, and
// the cards earned from word sets. One versioned JSON blob in localStorage so
// the shape can change later without wiping the count.

import type { Script } from "./kana";

export type SetChoice = "all" | "base";

/** 1 try = shiny, 2 = base, 3+ = worn. Fixed when the copy is minted. */
export type Rarity = "shiny" | "base" | "worn";

/** how many copies of each stock a word has been minted (v5a §2) */
export interface RarityCounts {
  shiny: number;
  base: number;
  worn: number;
}

/** setId → wordId → copies. A word with no entry has no copies. */
export type JokerProgress = Record<string, Record<string, RarityCounts>>;

export interface Progress {
  // kana characters ever written correctly on first attempt. Flat across both
  // scripts — あ and ア are different codepoints, so they never collide, and
  // the home screen counts whichever script is selected.
  earned: Set<string>;
  setChoice: SetChoice;
  script: Script;
  /** copies minted from word sets — see lib/joker.ts */
  joker: JokerProgress;
  /** one-shot: a v2 blob was wiped by the v3 migration and he owes a line */
  wiped: boolean;
}

const KEY = "kanahero:v1";
const VERSION = 3;

interface Stored {
  v: number;
  earned: string[];
  setChoice: SetChoice;
  // added with katakana mode; absent in blobs written before it, hence the
  // default below rather than a version bump — the count carries over intact
  script?: Script;
  // v2 held one card per word ({tries, rarity, earnedAt}); v3 holds copy
  // counts per rarity. The shapes do not convert — v3 wipes (v5a §2).
  joker?: JokerProgress;
  wiped?: boolean;
}

export const NO_COPIES: RarityCounts = { shiny: 0, base: 0, worn: 0 };

const whole = (n: unknown): number =>
  typeof n === "number" && Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;

/** trust nothing from storage: a bad entry is dropped, not thrown */
function readJoker(raw: unknown): JokerProgress {
  const out: JokerProgress = {};
  if (!raw || typeof raw !== "object") return out;
  for (const [setId, words] of Object.entries(raw as Record<string, unknown>)) {
    if (!words || typeof words !== "object") continue;
    const cards: Record<string, RarityCounts> = {};
    for (const [wordId, counts] of Object.entries(words as Record<string, unknown>)) {
      if (!counts || typeof counts !== "object") continue;
      const c = counts as Partial<RarityCounts>;
      const row = { shiny: whole(c.shiny), base: whole(c.base), worn: whole(c.worn) };
      // a row of three zeros is not a collected word; drop it rather than
      // carry a word that shows a face with no copies behind it
      if (row.shiny + row.base + row.worn === 0) continue;
      cards[wordId] = row;
    }
    out[setId] = cards;
  }
  return out;
}

/** did a v2 blob hold anything worth telling the user it lost? */
function heldCards(raw: unknown): boolean {
  if (!raw || typeof raw !== "object") return false;
  return Object.values(raw as Record<string, unknown>).some(
    (words) => words && typeof words === "object" && Object.keys(words).length > 0,
  );
}

export function loadProgress(): Progress {
  const fallback: Progress = {
    earned: new Set(),
    setChoice: "all",
    script: "hiragana",
    joker: {},
    wiped: false,
  };
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return fallback;
    const data = JSON.parse(raw) as Stored;
    if (data.v > VERSION || !Array.isArray(data.earned)) return fallback;
    // v2 → v3: the cards go, the characters stay (v5a §2). The wipe is
    // written back at once, so the line he owes is owed exactly once even if
    // the tab is closed before anything else is saved.
    const stale = (data.v ?? 1) < VERSION;
    const loaded: Progress = {
      earned: new Set(data.earned.filter((s) => typeof s === "string")),
      setChoice: data.setChoice === "base" ? "base" : "all",
      script: data.script === "katakana" ? "katakana" : "hiragana",
      joker: stale ? {} : readJoker(data.joker),
      wiped: stale ? heldCards(data.joker) : data.wiped === true,
    };
    if (stale) saveProgress(loaded);
    return loaded;
  } catch {
    return fallback;
  }
}

function toStored(p: Progress): Stored {
  return {
    v: VERSION,
    earned: [...p.earned],
    setChoice: p.setChoice,
    script: p.script,
    joker: p.joker,
    wiped: p.wiped,
  };
}

export function saveProgress(p: Progress): void {
  const data = toStored(p);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // storage full or unavailable — the session still works, it just won't persist
  }
}

// ---- tiny store around the blob, for useSyncExternalStore ----

// stable server/hydration snapshot; reference-compared to detect "not loaded yet"
const SERVER: Progress = {
  earned: new Set(),
  setChoice: "all",
  script: "hiragana",
  joker: {},
  wiped: false,
};
let cache: Progress | null = null;
const listeners = new Set<() => void>();

export function subscribeProgress(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function getProgress(): Progress {
  if (cache === null) cache = loadProgress();
  return cache;
}

export function getServerProgress(): Progress {
  return SERVER;
}

/** the whole blob, for the export ZIP — SPEC-v5 §2.
    Nothing may have been written yet; the export still carries a real blob
    rather than an empty object, so a restore has something to read. */
export function progressBlob(): string {
  if (typeof window === "undefined") return "{}";
  return window.localStorage.getItem(KEY) ?? JSON.stringify(toStored(getProgress()));
}

/** update, persist, notify — the only write path */
export function updateProgress(patch: Partial<Progress>): Progress {
  cache = { ...getProgress(), ...patch };
  saveProgress(cache);
  listeners.forEach((l) => l());
  return cache;
}
