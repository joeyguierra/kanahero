import type { Kana } from "./kana";

// A missed card comes back a few positions later — far enough to clear
// short-term memory, near enough that the session tail isn't all misses.
export const REQUEUE_AT = 5;

export function shuffle<T>(input: T[]): T[] {
  const a = [...input];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Remove the front card and reinsert it REQUEUE_AT positions in. */
export function requeue(queue: Kana[]): Kana[] {
  const [head, ...rest] = queue;
  const pos = Math.min(REQUEUE_AT, rest.length);
  return [...rest.slice(0, pos), head, ...rest.slice(pos)];
}
