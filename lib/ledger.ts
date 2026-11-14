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
}

export interface SessionRow {
  type: "session";
  day: string;
  startTs: number;
  endTs: number;
  due: number;
  fresh: number;
  done: number;
  missed: number;
}

export type LedgerRow = ItemRow | SessionRow;

const STORE = "rows";
const db = idbStore({
  name: "kanahero-ledger",
  version: 1,
  store: STORE,
  upgrade: (d) => {
    d.createObjectStore(STORE, { autoIncrement: true });
  },
});

export async function logRow(row: LedgerRow): Promise<void> {
  try {
    await db.tx("readwrite", (s) => s.add(row));
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
