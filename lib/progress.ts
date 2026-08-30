// On-device persistence: the earned set (the number) and the last set choice.
// One versioned JSON blob in localStorage so the shape can change later
// without wiping the count.

import type { Script } from "./kana";

export type SetChoice = "all" | "base";

export interface Progress {
  // kana characters ever written correctly on first attempt. Flat across both
  // scripts — あ and ア are different codepoints, so they never collide, and
  // the home screen counts whichever script is selected.
  earned: Set<string>;
  setChoice: SetChoice;
  script: Script;
}

const KEY = "kanahero:v1";

interface Stored {
  v: 1;
  earned: string[];
  setChoice: SetChoice;
  // added with katakana mode; absent in blobs written before it, hence the
  // default below rather than a version bump — the count carries over intact
  script?: Script;
}

export function loadProgress(): Progress {
  const fallback: Progress = { earned: new Set(), setChoice: "all", script: "hiragana" };
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return fallback;
    const data = JSON.parse(raw) as Stored;
    if (data.v !== 1 || !Array.isArray(data.earned)) return fallback;
    return {
      earned: new Set(data.earned.filter((s) => typeof s === "string")),
      setChoice: data.setChoice === "base" ? "base" : "all",
      script: data.script === "katakana" ? "katakana" : "hiragana",
    };
  } catch {
    return fallback;
  }
}

export function saveProgress(p: Progress): void {
  const data: Stored = {
    v: 1,
    earned: [...p.earned],
    setChoice: p.setChoice,
    script: p.script,
  };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // storage full or unavailable — the session still works, it just won't persist
  }
}

// ---- tiny store around the blob, for useSyncExternalStore ----

// stable server/hydration snapshot; reference-compared to detect "not loaded yet"
const SERVER: Progress = { earned: new Set(), setChoice: "all", script: "hiragana" };
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

/** update, persist, notify — the only write path */
export function updateProgress(patch: Partial<Progress>): Progress {
  cache = { ...getProgress(), ...patch };
  saveProgress(cache);
  listeners.forEach((l) => l());
  return cache;
}
