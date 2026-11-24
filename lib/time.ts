// Study time per day, from ledger rows (BRIEF-study-time-dashboard §4). Pure:
// rows in, numbers out. Three paper parts are typed in (check, morning, night);
// the drill is read from the sessions the app already wrote.
//
// Everything is counted in tenths of a minute, the unit results.md prints, and
// sums are sums of those tenths — so a row's cells add up to its total as shown.
//
// Untimed is not zero. A part that happened with no time adds nothing to any
// total and is counted in `untimed`; it is never estimated.

import { addDays } from "./schedule";

export type Part = "check" | "morning" | "night";
export const PARTS: readonly Part[] = ["check", "morning", "night"];

/** Loose on purpose: old rows, and rows this file does not read, pass through. */
export interface Row {
  type: string;
  day?: string;
  part?: string;
  ms?: number | null;
  none?: boolean;
  ts?: number;
  startTs?: number;
  endTs?: number;
}

export type Cell =
  | { kind: "timed"; tenths: number; ms: number }
  /** it happened, nobody timed it */
  | { kind: "untimed" }
  /** marked as not having happened */
  | { kind: "none" }
  /** not expected that day, or not yet */
  | { kind: "blank" };

export interface DayTime {
  day: string;
  check: Cell;
  morning: Cell;
  night: Cell;
  /** check + morning, the bar the screen draws; null = nothing measured */
  pre: number | null;
  /** how many of check and morning are untimed */
  preUntimed: number;
  /** app sessions summed, wall clock; null = no session that day */
  drill: number | null;
  total: number;
  untimed: number;
}

export interface Totals {
  pre: number | null;
  drill: number | null;
  night: number | null;
  total: number;
  untimed: number;
}

export interface Options {
  /** the phone's day; its unfinished parts are "not yet", not untimed */
  today: string;
  /** first day each paper routine ran; before it the part is blank, not untimed */
  starts?: { check?: string; night?: string };
}

export const toTenths = (ms: number): number => Math.round(ms / 6000);
export const fmt = (tenths: number): string => (tenths / 10).toFixed(1);

/** "11:12" → ms. Stopwatch form only: minutes, colon, two digits of seconds. */
export function parseMSS(text: string): number | null {
  const m = /^(\d{1,3}):([0-5]\d)$/.exec(text.trim());
  if (!m) return null;
  return (Number(m[1]) * 60 + Number(m[2])) * 1000;
}

/** What the entry field shows for what was typed: digits only, the last two
    are the seconds, the colon places itself. "5" → "0:05", "855" → "8:55",
    "8840" → "88:40". Four digits at most, so 99:59 is the ceiling; all zeros
    is an empty field. Seconds past 59 show as typed and are refused by parseMSS. */
export function typeMSS(raw: string): string {
  const d = raw.replace(/\D/g, "").replace(/^0+/, "").slice(0, 4);
  if (d === "") return "";
  const p = d.padStart(3, "0");
  return `${p.slice(0, -2)}:${p.slice(-2)}`;
}

export function toMSS(ms: number): string {
  const s = Math.round(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

const DAY = /^\d{4}-\d{2}-\d{2}$/;
const isPart = (p: unknown): p is Part => p === "check" || p === "morning" || p === "night";

export function aggregate(rows: readonly Row[], { today, starts = {} }: Options): { days: DayTime[]; totals: Totals } {
  const drillMs = new Map<string, number>();
  const latest = new Map<string, Row>(); // `${day}|${part}` → newest row; later rows win a tie

  for (const r of rows) {
    if (typeof r.day !== "string" || !DAY.test(r.day) || r.day > today) continue;
    if (r.type === "session") {
      const ms = (r.endTs ?? NaN) - (r.startTs ?? NaN);
      if (Number.isFinite(ms) && ms > 0) drillMs.set(r.day, (drillMs.get(r.day) ?? 0) + ms);
    } else if (r.type === "time" && isPart(r.part)) {
      const key = `${r.day}|${r.part}`;
      const held = latest.get(key);
      if (!held || (r.ts ?? 0) >= (held.ts ?? 0)) latest.set(key, r);
    }
  }

  const studied = new Set(drillMs.keys());
  for (const r of latest.values()) if (typeof r.ms === "number") studied.add(r.day!);

  function cell(day: string, part: Part): Cell {
    const r = latest.get(`${day}|${part}`);
    if (r && typeof r.ms === "number" && r.ms >= 0) {
      return { kind: "timed", tenths: toTenths(r.ms), ms: r.ms };
    }
    if (r?.none) return { kind: "none" };
    if (!studied.has(day)) return { kind: "blank" };
    if (part === "night") {
      // tonight's sheet has not happened yet
      return day === today || day < (starts.night ?? "") ? { kind: "blank" } : { kind: "untimed" };
    }
    // check and morning come before the drill: today they are owed once it has run
    if (day === today && !drillMs.has(day)) return { kind: "blank" };
    if (part === "check") return day < (starts.check ?? "") ? { kind: "blank" } : { kind: "untimed" };
    // morning items exist only when there was a sheet the night before
    const lastNight = cell(addDays(day, -1), "night").kind;
    return lastNight === "timed" || lastNight === "untimed" ? { kind: "untimed" } : { kind: "blank" };
  }

  const days: DayTime[] = [...studied].sort().map((day) => {
    const c = { check: cell(day, "check"), morning: cell(day, "morning"), night: cell(day, "night") };
    const t = (x: Cell) => (x.kind === "timed" ? x.tenths : 0);
    const u = (x: Cell) => (x.kind === "untimed" ? 1 : 0);
    const preTimed = c.check.kind === "timed" || c.morning.kind === "timed";
    const pre = preTimed ? t(c.check) + t(c.morning) : null;
    const drill = drillMs.has(day) ? toTenths(drillMs.get(day)!) : null;
    return {
      day,
      ...c,
      pre,
      preUntimed: u(c.check) + u(c.morning),
      drill,
      total: (pre ?? 0) + (drill ?? 0) + t(c.night),
      untimed: u(c.check) + u(c.morning) + u(c.night),
    };
  });

  const sum = (pick: (d: DayTime) => number | null): number | null => {
    const got = days.map(pick).filter((v): v is number => v !== null);
    return got.length ? got.reduce((a, b) => a + b, 0) : null;
  };
  const totals: Totals = {
    pre: sum((d) => d.pre),
    drill: sum((d) => d.drill),
    night: sum((d) => (d.night.kind === "timed" ? d.night.tenths : null)),
    total: days.reduce((a, d) => a + d.total, 0),
    untimed: days.reduce((a, d) => a + d.untimed, 0),
  };
  return { days, totals };
}
