// The v7 scheduler (SPEC-v7-skeleton §5). Pure and DOM-free: days are passed in
// as local YYYY-MM-DD strings, nothing here reads the clock or storage.

export type Rung = 0 | 1 | 2 | 3 | 4 | 5; // 0 = never seen
export const LADDER_DAYS = [0, 1, 3, 7, 14, 30] as const; // days until due, by rung
/** new words in one deal */
export const NEW_CAP = 10;
/** words in one day's pile, reviews and new together */
export const PILE_MAX = 30;

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
  order: string[]; // item ids in list order
  /** how many new words this deal may take; the caller owns the bookkeeping */
  newLeft: number;
  /** what is left of today's pile */
  room: number;
}

export interface Deal {
  due: string[];
  fresh: string[];
  /** due words that did not fit in the pile; they stay due and come first tomorrow */
  held: number;
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
  const pos = new Map(i.order.map((id, n) => [id, n]));
  const at = (id: string) => pos.get(id) ?? Number.MAX_SAFE_INTEGER;
  const byList = (a: ItemState, b: ItemState) => at(a.id) - at(b.id);
  const room = Math.max(0, i.room);

  // Rule 1: due first, oldest due first, then list order. What does not fit
  // in the pile is held: nothing about it changes, so it is older tomorrow.
  const allDue = i.items
    .filter((s) => s.seen && s.due <= i.today)
    .sort((a, b) => (a.due < b.due ? -1 : a.due > b.due ? 1 : byList(a, b)));
  const due = allDue.slice(0, room);

  // Rule 2: then new, in list order, never shuffled, in the room left.
  const fresh = i.items
    .filter((s) => !s.seen)
    .sort(byList)
    .slice(0, Math.max(0, Math.min(i.newLeft, room - due.length)));

  const ids = (l: ItemState[]) => l.map((s) => s.id);
  return { due: ids(due), fresh: ids(fresh), held: allDue.length - due.length };
}

/** Apply one grade. A first write is a study trial (rule 5). */
export function grade(s: ItemState, today: string, ok: boolean): ItemState {
  const at = (rung: Rung): ItemState => ({
    ...s,
    seen: true,
    rung,
    due: addDays(today, LADDER_DAYS[rung]),
    lastDay: today,
  });
  if (!ok) return at(1); // rule 4
  if (!s.seen) return at(1); // rule 5
  if (s.lastDay === today) return s; // rule 3: never twice in one day
  return at(Math.min(s.rung + 1, 5) as Rung);
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
