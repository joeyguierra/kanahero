// The ledger: one row per graded item and one per session, in its own
// IndexedDB database (SPEC-v7-skeleton §8). This is results.md's data source.
// A failed write never blocks the loop — the drill matters more than the row.
// Rows written before the one-queue rework carry a `setId`; rows since do not.

import { idbStore } from "./idb";

export interface ItemRow {
  type: "item";
  day: string;
  ts: number;
  word: string;
  trial: boolean;
  ok: boolean;
  /** prompt shown → grade tapped */
  ms: number;
  /** on every row of a kanji upgrade: the kana word it took over from */
  upgradeOf?: string;
}

export interface SessionRow {
  type: "session";
  day: string;
  startTs: number;
  endTs: number;
  due: number;
  /** every study trial, upgrades included */
  fresh: number;
  /** how many of `fresh` were kanji upgrades; absent on rows from before them */
  up?: number;
  done: number;
  missed: number;
}

/** A paper part's stopwatch time, typed in on /time (BRIEF-study-time-dashboard §4).
    Append-only, latest `ts` wins for a `day` + `part`. */
export interface TimeRow {
  type: "time";
  /** the study day it counts for — chosen, not taken from the clock */
  day: string;
  part: "check" | "morning" | "night";
  /** null = no time: back to untimed, or with `none`, the part did not happen */
  ms: number | null;
  none?: true;
  ts: number;
  how: "manual" | "timer";
}

export type LedgerRow = ItemRow | SessionRow | TimeRow;

const STORE = "rows";
const db = idbStore({
  name: "kanahero-ledger",
  version: 1,
  store: STORE,
  upgrade: (d) => {
    d.createObjectStore(STORE, { autoIncrement: true });
  },
});

/** Write one row and say so if it failed — for /time, where the row is the point. */
export async function writeRow(row: LedgerRow): Promise<void> {
  await db.tx("readwrite", (s) => s.add(row));
}

export async function logRow(row: LedgerRow): Promise<void> {
  try {
    await writeRow(row);
  } catch {
    // no ledger row is worth interrupting a session for
  }
}

export async function allRows(): Promise<LedgerRow[]> {
  return db.tx<LedgerRow[]>("readonly", (s) => s.getAll());
}

/** Download every row as `kanahero-ledger-<day>.json`. */
export async function exportLedger(day: string): Promise<void> {
  const rows = await allRows();
  const blob = new Blob([JSON.stringify({ exported: day, rows }, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `kanahero-ledger-${day}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
