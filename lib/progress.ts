// On-device persistence: the earned set (the number), the last set choice, and
// the cards earned from word sets. One versioned JSON blob in localStorage so
// the shape can change later without wiping the count.

import type { Script } from "./kana";

export type SetChoice = "all" | "base";

/** 1 try = foil, 2 = base, 3+ = worn. Fixed at the earn, never recomputed. */
export type Rarity = "foil" | "base" | "worn";

export interface EarnedCard {
  /** attempts up to and including the first correct one, across rounds */
  tries: number;
  rarity: Rarity;
  earnedAt: string;
}

/** setId → wordId → card. A word is earned iff it has an entry. */
export type JokerProgress = Record<string, Record<string, EarnedCard>>;

export interface Progress {
  // kana characters ever written correctly on first attempt. Flat across both
  // scripts — あ and ア are different codepoints, so they never collide, and
  // the home screen counts whichever script is selected.
  earned: Set<string>;
  setChoice: SetChoice;
  script: Script;
  /** cards earned from word sets — see lib/joker.ts */
  joker: JokerProgress;
}

const KEY = "kanahero:v1";
const VERSION = 2;

interface Stored {
  v: number;
  earned: string[];
  setChoice: SetChoice;
  // added with katakana mode; absent in blobs written before it, hence the
  // default below rather than a version bump — the count carries over intact
  script?: Script;
  // v2: the Joker's cards. A v1 blob has none, which reads as an empty object
  // — the migration is the absence, nothing is rewritten until the next save.
  joker?: JokerProgress;
}

const RARITIES: Rarity[] = ["foil", "base", "worn"];

/** trust nothing from storage: a bad entry is dropped, not thrown */
function readJoker(raw: unknown): JokerProgress {
  const out: JokerProgress = {};
  if (!raw || typeof raw !== "object") return out;
  for (const [setId, words] of Object.entries(raw as Record<string, unknown>)) {
    if (!words || typeof words !== "object") continue;
    const cards: Record<string, EarnedCard> = {};
    for (const [wordId, card] of Object.entries(words as Record<string, unknown>)) {
      const c = card as Partial<EarnedCard>;
      if (typeof c?.tries !== "number" || !RARITIES.includes(c.rarity as Rarity)) continue;
      cards[wordId] = {
        tries: c.tries,
        rarity: c.rarity as Rarity,
        earnedAt: typeof c.earnedAt === "string" ? c.earnedAt : new Date(0).toISOString(),
      };
    }
    out[setId] = cards;
  }
  return out;
}

export function loadProgress(): Progress {
  const fallback: Progress = {
    earned: new Set(),
    setChoice: "all",
    script: "hiragana",
    joker: {},
  };
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return fallback;
    const data = JSON.parse(raw) as Stored;
    if (data.v > VERSION || !Array.isArray(data.earned)) return fallback;
    return {
      earned: new Set(data.earned.filter((s) => typeof s === "string")),
      setChoice: data.setChoice === "base" ? "base" : "all",
      script: data.script === "katakana" ? "katakana" : "hiragana",
      joker: readJoker(data.joker),
    };
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
