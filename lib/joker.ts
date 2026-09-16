// The dealer. No difficulty model, no scheduling, no SRS — it deals what you
// haven't earned, puts a miss back in the deck, and writes the card when you
// finally get it. That is the whole of it (SPEC-v5 §3).

import { getProgress, updateProgress, type EarnedCard, type Rarity } from "./progress";
import type { SetWord, WordSet } from "./sets";

/** a missed word never comes straight back: this is how far down it goes */
const MISS_GAP = 2;

export function rarityFor(tries: number): Rarity {
  if (tries <= 1) return "foil";
  if (tries === 2) return "base";
  return "worn";
}

export function cardsFor(setId: string): Record<string, EarnedCard> {
  return getProgress().joker[setId] ?? {};
}

export function isEarned(setId: string, wordId: string): boolean {
  return cardsFor(setId)[wordId] !== undefined;
}

export function earnedCount(set: WordSet): number {
  const cards = cardsFor(set.id);
  return set.words.filter((w) => cards[w.word]).length;
}

export function foilCount(set: WordSet): number {
  const cards = cardsFor(set.id);
  return set.words.filter((w) => cards[w.word]?.rarity === "foil").length;
}

// ---- the shuffle ----

/** mulberry32 — small, seeded, and the same queue every time for a given seed */
function random(seed: number): () => number {
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
 * The round's queue: every unearned word, shuffled by `seed`.
 * The seed is logged so a bad round can be replayed from a bug report.
 */
export function deal(set: WordSet, seed: number): SetWord[] {
  const cards = cardsFor(set.id);
  const queue = set.words.filter((w) => !cards[w.word]);
  const rand = random(seed);
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

// ---- attempts ----
//
// SPEC-v5 §3 wants tries counted "across rounds", §2 wants nothing about a
// round persisted but the earns. Both hold if the count lives in memory: a
// word missed and abandoned is still on its second attempt when the next round
// deals it, and a reload starts it clean. Nothing here touches localStorage.
const attempts = new Map<string, number>();

const key = (setId: string, wordId: string) => `${setId}/${wordId}`;

/** count this attempt and return the number of it (1 for the first) */
export function attempt(setId: string, wordId: string): number {
  const n = (attempts.get(key(setId, wordId)) ?? 0) + 1;
  attempts.set(key(setId, wordId), n);
  return n;
}

export function attemptsSoFar(setId: string, wordId: string): number {
  return attempts.get(key(setId, wordId)) ?? 0;
}

/** only for tests — the app never resets a count it is meant to remember */
export function resetAttempts(): void {
  attempts.clear();
}

/**
 * Write the card. `tries` counts attempts up to and including this one, across
 * rounds — an abandoned round keeps its misses. Rarity is fixed here, forever.
 */
export function earn(setId: string, wordId: string, tries: number): EarnedCard {
  attempts.delete(key(setId, wordId));
  const card: EarnedCard = {
    tries,
    rarity: rarityFor(tries),
    earnedAt: new Date().toISOString(),
  };
  const joker = getProgress().joker;
  updateProgress({ joker: { ...joker, [setId]: { ...(joker[setId] ?? {}), [wordId]: card } } });
  return card;
}
