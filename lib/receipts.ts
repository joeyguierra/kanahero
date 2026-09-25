// The receipts: the ink that earned each copy, kept with the copy (SPEC-v6).
//
// Counts in `kanahero:v1` stay the source of truth. A receipt is an attachment
// in its own IndexedDB database — never the blob, which has a ceiling, and
// never the bank's database, whose version must not move for this. A copy
// with no receipt is a full copy (every copy earned before v6, and any whose
// write failed); a receipt with no copy behind it is ignored and never
// deleted (§2.4).
//
// Store shape mirrors lib/bank.ts: subscribe/get/getServer, an async load, a
// `ready: false` first snapshot that a real one replaces.

import type { InkSnapshot } from "./ink";
import { idbStore } from "./idb";
import type { Rarity } from "./progress";

const DB_NAME = "kanahero-receipts";
const DB_VERSION = 1;
const STORE = "receipts";

export interface Receipt extends InkSnapshot {
  /** `${earnedAt}-${rand4hex}` — sortable, collision-safe */
  id: string;
  setId: string;
  /** word.word — what progress keys on */
  wordId: string;
  rarity: Rarity;
  /** attempts within the run, up to and including the earning one */
  tries: number;
  /** the finishing write's Date.now(); every receipt of a run shares it */
  earnedAt: number;
  /** the run's deal() seed — the one already logged to console */
  seed: number;
}

export interface ReceiptsState {
  ready: boolean;
  /** `${setId}/${wordId}` → that word's receipts, newest first */
  byWord: Map<string, Receipt[]>;
}

const db = idbStore({
  name: DB_NAME,
  version: DB_VERSION,
  store: STORE,
  upgrade(d) {
    if (!d.objectStoreNames.contains(STORE)) {
      d.createObjectStore(STORE, { keyPath: "id" }).createIndex("word", ["setId", "wordId"]);
    }
  },
});

// ---- store ----

const SERVER: ReceiptsState = { ready: false, byWord: new Map() };
let cache: ReceiptsState = SERVER;
const listeners = new Set<() => void>();
let loading: Promise<void> | null = null;

function set(patch: Partial<ReceiptsState>): void {
  cache = { ...cache, ...patch };
  listeners.forEach((l) => l());
}

export function subscribeReceipts(cb: () => void): () => void {
  listeners.add(cb);
  void load();
  return () => {
    listeners.delete(cb);
  };
}

export function getReceipts(): ReceiptsState {
  return cache;
}

export function getServerReceipts(): ReceiptsState {
  return SERVER;
}

const key = (setId: string, wordId: string) => `${setId}/${wordId}`;

function byNewest(a: Receipt, b: Receipt): number {
  return b.earnedAt - a.earnedAt || b.id.localeCompare(a.id);
}

/** trust nothing from storage: a record missing its shape is dropped */
function sound(r: unknown): r is Receipt {
  if (!r || typeof r !== "object") return false;
  const x = r as Partial<Receipt>;
  return (
    typeof x.id === "string" &&
    typeof x.setId === "string" &&
    typeof x.wordId === "string" &&
    (x.rarity === "shiny" || x.rarity === "base" || x.rarity === "worn") &&
    typeof x.tries === "number" &&
    typeof x.earnedAt === "number" &&
    !!x.box &&
    typeof x.box.w === "number" &&
    typeof x.box.h === "number" &&
    Array.isArray(x.strokes)
  );
}

function index(all: Receipt[]): Map<string, Receipt[]> {
  const out = new Map<string, Receipt[]>();
  for (const r of all) {
    const k = key(r.setId, r.wordId);
    const list = out.get(k);
    if (list) list.push(r);
    else out.set(k, [r]);
  }
  for (const list of out.values()) list.sort(byNewest);
  return out;
}

function load(): Promise<void> {
  if (!loading) {
    loading = (async () => {
      try {
        const all = await db.tx<unknown[]>("readonly", (s) => s.getAll() as IDBRequest<unknown[]>);
        // a run kept while the read was in flight is already in the cache
        set({ ready: true, byWord: merge(index(all.filter(sound)), cache.byWord) });
      } catch {
        // no receipts store: every copy is a legacy card, which is a true state
        set({ ready: true });
      }
    })();
  }
  return loading;
}

/** both maps, deduplicated by id, each list newest first */
function merge(a: Map<string, Receipt[]>, b: Map<string, Receipt[]>): Map<string, Receipt[]> {
  const out = new Map(a);
  for (const [k, list] of b) {
    const seen = new Set((out.get(k) ?? []).map((r) => r.id));
    out.set(k, [...(out.get(k) ?? []), ...list.filter((r) => !seen.has(r.id))].sort(byNewest));
  }
  return out;
}

// ---- reads ----

/** one word's receipts in one stock, newest first — S6d's stack */
export function receiptsFor(setId: string, wordId: string, rarity: Rarity): Receipt[] {
  return (cache.byWord.get(key(setId, wordId)) ?? []).filter((r) => r.rarity === rarity);
}

/** how many receipts a set has at all — his line on S6d asks */
export function receiptCount(setId: string): number {
  let n = 0;
  for (const [k, list] of cache.byWord) if (k.startsWith(`${setId}/`)) n += list.length;
  return n;
}

/** every receipt, oldest first — the export */
export async function allReceipts(): Promise<Receipt[]> {
  await load();
  return [...cache.byWord.values()].flat().sort((a, b) => a.earnedAt - b.earnedAt || a.id.localeCompare(b.id));
}

// ---- the one write ----

export function newReceiptId(earnedAt: number): string {
  const rand = Math.floor(Math.random() * 0x10000)
    .toString(16)
    .padStart(4, "0");
  return `${earnedAt}-${rand}`;
}

/**
 * Keep a finished run's receipts: one transaction, all or nothing. Resolves
 * false on failure and never throws — the cards were already counted, and a
 * copy without its receipt is still a copy (SPEC-v6 §2.5). Called from the
 * round, after `earnRun`, and nowhere else.
 */
export async function keepRun(receipts: Receipt[]): Promise<boolean> {
  if (receipts.length === 0) return true;
  try {
    await db.tx("readwrite", (s) => {
      let last!: IDBRequest;
      for (const r of receipts) last = s.add(r);
      return last;
    });
    const merged = new Map(cache.byWord);
    for (const r of receipts) {
      const k = key(r.setId, r.wordId);
      merged.set(k, [...(merged.get(k) ?? []), r].sort(byNewest));
    }
    set({ byWord: merged });
    return true;
  } catch {
    return false;
  }
}
