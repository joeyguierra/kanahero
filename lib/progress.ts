// On-device persistence: the earned set (the number) and the last set choice.
// One versioned JSON blob in localStorage so the shape can change later
// without wiping the count.

export type SetChoice = "all" | "base";

export interface Progress {
  earned: Set<string>; // kana characters ever written correctly on first attempt
  setChoice: SetChoice;
}

const KEY = "kanahero:v1";

interface Stored {
  v: 1;
  earned: string[];
  setChoice: SetChoice;
}

export function loadProgress(): Progress {
  const fallback: Progress = { earned: new Set(), setChoice: "all" };
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return fallback;
    const data = JSON.parse(raw) as Stored;
    if (data.v !== 1 || !Array.isArray(data.earned)) return fallback;
    return {
      earned: new Set(data.earned.filter((s) => typeof s === "string")),
      setChoice: data.setChoice === "base" ? "base" : "all",
    };
  } catch {
    return fallback;
  }
}

export function saveProgress(p: Progress): void {
  const data: Stored = { v: 1, earned: [...p.earned], setChoice: p.setChoice };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // storage full or unavailable — the session still works, it just won't persist
  }
}

// ---- tiny store around the blob, for useSyncExternalStore ----

// stable server/hydration snapshot; reference-compared to detect "not loaded yet"
const SERVER: Progress = { earned: new Set(), setChoice: "all" };
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
