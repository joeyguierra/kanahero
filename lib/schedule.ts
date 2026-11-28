// The v7 scheduler (SPEC-v7-skeleton §5, SPEC-kanji-upgrade §2.4). Pure and
// DOM-free: days are passed in as local YYYY-MM-DD strings, nothing here reads
// the clock or storage.

export type Rung = 0 | 1 | 2 | 3 | 4 | 5; // 0 = never seen
export const LADDER_DAYS = [0, 1, 3, 7, 14, 30] as const; // days until due, by rung
/** new words in one deal */
export const NEW_CAP = 10;
/** kanji upgrades in one day, beside the new words */
export const UPGRADE_CAP = 3;
/** words in one day's pile: reviews, new words and upgrades together */
export const PILE_MAX = 40;
/** the rung at which a word is known: three correct returns in a row */
export const KNOWN_RUNG = 4;
/** a late review this many days past due is dealt among the young ones */
export const HELD_DAYS = 3;
/** an upgrade whose kana word was last written this many days ago has waited */
export const WAITED_DAYS = 4;

/** a marked kana word's id → the id of the kanji item it comes back as */
export type Upgrades = ReadonlyMap<string, string>;

export interface ItemState {
  id: string;
  rung: Rung;
  due: string; // YYYY-MM-DD local; "" while unseen
  lastDay?: string; // last day this item was graded
  seen: boolean;
}

export interface DealInput {
  today: string;
  /** list words and their upgrades, seen or not */
  items: ItemState[];
  order: string[]; // list word ids in list order; new words come from here only
  /** how many new words this deal may take; the caller owns the bookkeeping */
  newLeft: number;
  /** what is left of today's pile */
  room: number;
  upgrades?: Upgrades;
  /** how many upgrades this deal may take */
  upLeft?: number;
}

export interface Deal {
  /** reviews in session order: young (held late ones among them), then late */
  due: string[];
  /** kanji upgrades, each a study trial */
  ups: string[];
  fresh: string[];
  /** due words that did not fit in the pile; they stay due and are older tomorrow */
  held: number;
}

/** A marked kana word that is known is parked: never dealt again, never due,
    whatever its `due` says. Its kanji takes over from the next day. */
export function isParked(s: ItemState, upgrades?: Upgrades): boolean {
  return s.seen && s.rung >= KNOWN_RUNG && !!upgrades?.has(s.id);
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
  const ups = i.upgrades ?? new Map<string, string>();
  const kanaOf = new Map([...ups].map(([kana, kanji]) => [kanji, kana]));
  const pos = new Map(i.order.map((id, n) => [id, n]));
  // an upgrade sits at its kana word's place in the list
  const at = (id: string) => pos.get(id) ?? pos.get(kanaOf.get(id) ?? "") ?? Number.MAX_SAFE_INTEGER;
  const byList = (a: ItemState, b: ItemState) => at(a.id) - at(b.id);
  const oldest = (a: ItemState, b: ItemState) =>
    a.due < b.due ? -1 : a.due > b.due ? 1 : byList(a, b);
  const byId = new Map(i.items.map((s) => [s.id, s]));
  let room = Math.max(0, i.room);
  const take = <T>(list: T[], cap = room): T[] => {
    const got = list.slice(0, Math.max(0, Math.min(cap, room)));
    room -= got.length;
    return got;
  };

  const allDue = i.items.filter((s) => s.seen && s.due <= i.today && !isParked(s, ups));
  const isYoung = (s: ItemState) =>
    s.rung < KNOWN_RUNG || i.today >= addDays(s.due, HELD_DAYS);

  // An upgrade can be dealt once its kana word is parked, but not on a day
  // that word was written. One that could have been dealt on three earlier
  // days and was not has waited.
  const eligible: { s: ItemState; waited: boolean }[] = [];
  for (const [kana, kanji] of ups) {
    const k = byId.get(kana);
    if (!k || !isParked(k, ups) || byId.get(kanji)?.seen) continue;
    if (k.lastDay && k.lastDay >= i.today) continue;
    eligible.push({
      s: byId.get(kanji) ?? unseen(kanji),
      waited: !k.lastDay || i.today >= addDays(k.lastDay, WAITED_DAYS),
    });
  }
  eligible.sort((a, b) => byList(a.s, b.s));
  const pick = (waited: boolean) => eligible.filter((e) => e.waited === waited).map((e) => e.s);
  const upLeft = Math.max(0, i.upLeft ?? 0);

  // Each step takes the room the ones before it leave.
  // 1 young reviews, held late reviews among them: oldest due first, then list order
  const young = take(allDue.filter(isYoung).sort(oldest));
  // 2 upgrades that have waited
  const waited = take(pick(true), upLeft);
  // 3 new words, in list order, never shuffled
  const fresh = take(i.items.filter((s) => !s.seen && pos.has(s.id)).sort(byList), i.newLeft);
  // 4 the other upgrades, within the same day's cap
  const others = take(pick(false), upLeft - waited.length);
  // 5 late reviews. What does not fit is held: nothing about it changes, so
  //   it is older tomorrow.
  const late = take(allDue.filter((s) => !isYoung(s)).sort(oldest));

  const ids = (l: ItemState[]) => l.map((s) => s.id);
  return {
    due: ids([...young, ...late]),
    ups: ids([...waited, ...others].sort(byList)),
    fresh: ids(fresh),
    held: allDue.length - young.length - late.length,
  };
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
