// The dealer. No difficulty model, no scheduling, no SRS — it deals the whole
// set every time, puts a miss back in the deck, and earns one copy of every
// word when the run finishes. That is the whole of it (SPEC-v5a §1–2).
//
// A run is all-or-nothing: nothing reaches storage until the queue empties.
// Leaving early, reloading or closing costs the run. That is why tries live in
// the round's own state and not in this module.

import { getProgress, updateProgress, NO_COPIES, type RarityCounts, type Rarity } from "./progress";
import type { SetWord, WordSet } from "./sets";

/** a missed word never comes straight back: this is how far down it goes */
const MISS_GAP = 2;

/** a card as it exists inside a run — earned, but not kept until the finish */
export interface EarnedCard {
  rarity: Rarity;
  /** attempts within this run, up to and including the correct one */
  tries: number;
}

export function rarityFor(tries: number): Rarity {
  if (tries <= 1) return "shiny";
  if (tries === 2) return "base";
  return "worn";
}

export function cardsFor(setId: string): Record<string, RarityCounts> {
  return getProgress().joker[setId] ?? {};
}

/** the copies of one word, all three stocks, zeros included */
export function copies(setId: string, wordId: string): RarityCounts {
  return cardsFor(setId)[wordId] ?? NO_COPIES;
}

/** the set's shelf: every copy of every word, by stock */
export function setTotals(set: WordSet): RarityCounts {
  const cards = cardsFor(set.id);
  const out = { shiny: 0, base: 0, worn: 0 };
  for (const word of set.words) {
    const row = cards[word.word];
    if (!row) continue;
    out.shiny += row.shiny;
    out.base += row.base;
    out.worn += row.worn;
  }
  return out;
}

/** every copy in the app, by stock — what {shiny} counts on the home screen */
export function allTotals(): RarityCounts {
  const out = { shiny: 0, base: 0, worn: 0 };
  for (const words of Object.values(getProgress().joker)) {
    for (const row of Object.values(words)) {
      out.shiny += row.shiny;
      out.base += row.base;
      out.worn += row.worn;
    }
  }
  return out;
}

/** How many runs have ever been finished. Every finished run adds exactly one
    copy of every word of its set, so the largest row total in any set is the
    number of times that set was run — and the largest of those is the answer.
    Exact, not an estimate (SPEC-v5b §5). */
export function runsFinished(): number {
  let most = 0;
  for (const words of Object.values(getProgress().joker)) {
    for (const row of Object.values(words)) {
      most = Math.max(most, row.shiny + row.base + row.worn);
    }
  }
  return most;
}

/** how many words of the set have at least one copy — the collection's own count */
export function collectedCount(set: WordSet): number {
  const cards = cardsFor(set.id);
  return set.words.filter((w) => cards[w.word]).length;
}

// ---- the shuffle ----

/** mulberry32 — small, seeded, and the same queue every time for a given seed.
    The Joker's shuffle bag draws on it too; there is one of these in the app. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function newSeed(): number {
  return Math.floor(Math.random() * 0xffffffff);
}

/**
 * The run's queue: the whole set, shuffled by `seed`. A set is always
 * replayable — what you already own changes nothing about what is dealt.
 * The seed is logged so a bad run can be replayed from a bug report.
 */
export function deal(set: WordSet, seed: number): SetWord[] {
  const queue = [...set.words];
  const rand = mulberry32(seed);
  for (let i = queue.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [queue[i], queue[j]] = [queue[j], queue[i]];
  }
  if (typeof console !== "undefined") {
    console.info(`[joker] dealt ${set.id} · ${queue.length} words · seed ${seed}`);
  }
  return queue;
}

/**
 * Put the head back in the deck. To the tail normally; in a short queue, at
 * index 2 — near the end but never next, so a miss is always a second look
 * rather than a staring contest.
 */
export function miss(queue: SetWord[]): SetWord[] {
  const [head, ...rest] = queue;
  if (rest.length === 0) return [head];
  const pos = rest.length < 3 ? Math.min(MISS_GAP, rest.length) : rest.length;
  return [...rest.slice(0, pos), head, ...rest.slice(pos)];
}

/**
 * The only write. One save at the end of a finished run: every word of the run
 * adds one copy of the stock it was earned in. Called nowhere else — an
 * abandoned or reloaded run leaves storage exactly as it found it.
 */
export function earnRun(setId: string, run: { wordId: string; rarity: Rarity }[]): number {
  if (run.length === 0) return 0;
  const joker = getProgress().joker;
  const set = { ...(joker[setId] ?? {}) };
  // a stock the shelf has never held before — what S8's note counts as NEW
  let fresh = 0;
  for (const { wordId, rarity } of run) {
    const row = set[wordId] ?? NO_COPIES;
    if (row[rarity] === 0) fresh += 1;
    set[wordId] = { ...row, [rarity]: row[rarity] + 1 };
  }
  updateProgress({ joker: { ...joker, [setId]: set } });
  return fresh;
}
