// The v7 scheduler (SPEC-v7-skeleton §5). Pure and DOM-free: days are passed in
// as local YYYY-MM-DD strings, nothing here reads the clock or storage.

export type Rung = 0 | 1 | 2 | 3 | 4 | 5; // 0 = never seen
export const LADDER_DAYS = [0, 1, 3, 7, 14, 30] as const; // days until due, by rung
export const NEW_CAP = 10;
export const DUE_CEILING = 20;

export interface ItemState {
  id: string;
  rung: Rung;
  due: string; // YYYY-MM-DD local; "" while unseen
  lastDay?: string; // last day this item was graded
  seen: boolean;
}

export interface DealInput {
  today: string;
  items: ItemState[];
  setOrder: string[]; // item ids in set order
  newCap: number; // what is left of today's cap; the caller owns the bookkeeping
  dueCeiling: number;
  placedKnown: boolean;
}

export interface Deal {
  due: string[];
  fresh: string[];
  /** Tomorrow's items, offered only by WRITE ANYWAY; empty unless nothing is due. */
  pulledForward: string[];
}

export function unseen(id: string): ItemState {
  return { id, rung: 0, due: "", seen: false };
}

/** Local calendar day of a Date. */
export function localDay(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Calendar arithmetic on day strings; done in UTC so DST never bends a day. */
export function addDays(day: string, n: number): string {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

export function deal(i: DealInput): Deal {
  const pos = new Map(i.setOrder.map((id, n) => [id, n]));
  const at = (id: string) => pos.get(id) ?? Number.MAX_SAFE_INTEGER;
  const bySet = (a: ItemState, b: ItemState) => at(a.id) - at(b.id);

  // Rule 1: due first, oldest due first, then set order.
  const due = i.items
    .filter((s) => s.seen && s.due <= i.today)
    .sort((a, b) => (a.due < b.due ? -1 : a.due > b.due ? 1 : bySet(a, b)));

  // Rules 2, 6, 9: unseen in set order, never shuffled. A placed-known set is
  // dealt whole; otherwise the cap applies, and a heavy due pile means none.
  const allFresh = i.items.filter((s) => !s.seen).sort(bySet);
  const fresh = i.placedKnown
    ? allFresh
    : due.length > i.dueCeiling
      ? []
      : allFresh.slice(0, Math.max(0, i.newCap));

  // Rule 7: only tomorrow, never further, never something graded today.
  const tomorrow = addDays(i.today, 1);
  const pulledForward =
    due.length > 0
      ? []
      : i.items
          .filter((s) => s.seen && s.due === tomorrow && s.lastDay !== i.today)
          .sort(bySet);

  const ids = (l: ItemState[]) => l.map((s) => s.id);
  return { due: ids(due), fresh: ids(fresh), pulledForward: ids(pulledForward) };
}

/**
 * Apply one grade. `placed` marks the blind first write of a placed-known set
 * (rule 6); every other first write is a study trial (rule 5).
 */
export function grade(
  s: ItemState,
  today: string,
  ok: boolean,
  opts: { placed?: boolean } = {},
): ItemState {
  const at = (rung: Rung): ItemState => ({
    ...s,
    seen: true,
    rung,
    due: addDays(today, LADDER_DAYS[rung]),
    lastDay: today,
  });
  if (!ok) return at(1); // rule 4
  if (!s.seen) return at(opts.placed ? 2 : 1); // rules 5, 6
  if (s.lastDay === today) return s; // rule 3: never twice in one day
  return at(Math.min(s.rung + 1, 5) as Rung);
}

/** Rule 8: a set is done when nothing is due and nothing is unseen. */
export function isDone(items: ItemState[], today: string): boolean {
  return items.every((s) => s.seen && s.due > today);
}

/** The "next: <day> · <n> due" line: the nearest future due day and its count. */
export function nextDue(
  items: ItemState[],
  today: string,
): { day: string; count: number } | null {
  const later = items.filter((s) => s.seen && s.due > today).map((s) => s.due);
  if (later.length === 0) return null;
  const day = later.reduce((a, b) => (a < b ? a : b));
  return { day, count: later.filter((d) => d === day).length };
}
