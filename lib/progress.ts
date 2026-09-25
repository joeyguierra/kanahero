// On-device persistence: the earned set (the number), the last set choice, and
// the cards earned from word sets. One versioned JSON blob in localStorage so
// the shape can change later without wiping the count.

import type { Script } from "./kana";
import { clearReceipts } from "./receipts";

export type SetChoice = "all" | "base";

/** 1 try = shiny, 2 = base, 3+ = worn. Fixed when the copy is earned. */
export type Rarity = "shiny" | "base" | "worn";

/** how many copies of each stock a word has been earned (v5a §2) */
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
  // Two different "earned" meet in this file: THIS one is the character
  // drill's written-from-memory set and is a storage key that predates the
  // word sets. The cards a run earns live under `joker` below, and the
  // Joker's {earned} token counts those — never these (SPEC-v5b §10.2).
  earned: Set<string>;
  setChoice: SetChoice;
  script: Script;
  /** copies earned from word sets — see lib/joker.ts */
  joker: JokerProgress;
  /** one-shot: a v2 blob was wiped by the v3 migration and he owes a line */
  wiped: boolean;
  /** S6b's MEANING switch, remembered per set — only the sets switched OFF are
      listed, so a set with no entry is ON, which is the default */
  meaningOff: string[];
  /** the sound pass (SPEC-v5d §0.1), from the settings dialog off S1 */
  audio: AudioPrefs;
}

/** Two channels, both ON by default (creator call, 2026-09-20 — it overrides
    SPEC-v5d §0.1's silent-first default; the toggles stay). SILENT MODE is not
    a third flag: it is the state where both are off. Turning it on turns them
    off, turning it off turns them on, and switching both off by hand is the
    same thing as switching it on — so the dialog can never disagree with
    itself. */
export interface AudioPrefs {
  /** his blip as the line types (lib/joker-voice.ts) */
  voice: boolean;
  /** the card-table one-shots (lib/sfx.ts) */
  sfx: boolean;
}

export const AUDIO_DEFAULT: AudioPrefs = { voice: true, sfx: true };

/** silent mode, as the dialog shows it */
export function isSilent(a: AudioPrefs): boolean {
  return !a.voice && !a.sfx;
}

const KEY = "kanahero:v1";
// v4 (SPEC-v6 §2): every copy from before receipts goes, so every card that
// ever shows from here on has the ink that earned it behind it
const VERSION = 4;

interface Stored {
  v: number;
  earned: string[];
  setChoice: SetChoice;
  // added with katakana mode; absent in blobs written before it, hence the
  // default below rather than a version bump — the count carries over intact
  script?: Script;
  // v2 held one card per word ({tries, rarity, earnedAt}); v3 holds copy
  // counts per rarity. The shapes do not convert — v3 wipes (v5a §2). v4
  // holds the same counts but every copy has a receipt; v3's do not — v4
  // wipes again (SPEC-v6 §2), the receipts store with it.
  joker?: JokerProgress;
  wiped?: boolean;
  // added with the meaning toggle (design v5 Meaning Toggle); absent before it
  meaningOff?: string[];
  // added with the sound pass (v5d); absent reads as the default, so no
  // version bump
  audio?: Partial<AudioPrefs>;
}

/** the stored switches, each one a boolean or the default */
function readAudio(a: Partial<AudioPrefs> | undefined): AudioPrefs {
  const flag = (v: unknown, dflt: boolean) => (typeof v === "boolean" ? v : dflt);
  return {
    voice: flag(a?.voice, AUDIO_DEFAULT.voice),
    sfx: flag(a?.sfx, AUDIO_DEFAULT.sfx),
  };
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

/** Has this browser ever written a blob? The Joker's first-launch line hangs
    off it (SPEC-v5b §5, `firstEver`) — not off an empty blob, which is also
    what a wiped one looks like. */
export function hasStoredProgress(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(KEY) !== null;
  } catch {
    return false;
  }
}

export function loadProgress(): Progress {
  const fallback: Progress = {
    earned: new Set(),
    setChoice: "all",
    script: "hiragana",
    joker: {},
    wiped: false,
    meaningOff: [],
    audio: AUDIO_DEFAULT,
  };
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return fallback;
    const data = JSON.parse(raw) as Stored;
    if (data.v > VERSION || !Array.isArray(data.earned)) return fallback;
    // v2 → v3 → v4: the cards go, the characters stay (v5a §2, v6 §2). The
    // wipe is written back at once, so the line he owes is owed exactly once
    // even if the tab is closed before anything else is saved. Whatever the
    // receipts store held belonged to the cards that just went.
    const stale = (data.v ?? 1) < VERSION;
    if (stale) void clearReceipts();
    const loaded: Progress = {
      earned: new Set(data.earned.filter((s) => typeof s === "string")),
      setChoice: data.setChoice === "base" ? "base" : "all",
      script: data.script === "katakana" ? "katakana" : "hiragana",
      joker: stale ? {} : readJoker(data.joker),
      wiped: stale ? heldCards(data.joker) : data.wiped === true,
      meaningOff: Array.isArray(data.meaningOff)
        ? data.meaningOff.filter((s): s is string => typeof s === "string")
        : [],
      audio: readAudio(data.audio),
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
    meaningOff: p.meaningOff,
    audio: p.audio,
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
  meaningOff: [],
  audio: AUDIO_DEFAULT,
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

/** flip the switch for one set; the choice holds until it is flipped back */
export function setMeaningOn(setId: string, on: boolean): void {
  const off = getProgress().meaningOff.filter((id) => id !== setId);
  updateProgress({ meaningOff: on ? off : [...off, setId] });
}

/** update, persist, notify — the only write path */
export function updateProgress(patch: Partial<Progress>): Progress {
  cache = { ...getProgress(), ...patch };
  saveProgress(cache);
  listeners.forEach((l) => l());
  return cache;
}
