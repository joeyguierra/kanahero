// The capture bank: photos of characters met in the wild that can't be read
// yet, held until a later build turns them into cards.
//
// Photos never touch `kanahero:v1`. The number stays a small localStorage
// blob; the photos live in IndexedDB. Separate failure domains on purpose —
// a quota failure in one must not be able to take the other with it.
//
// Store shape mirrors lib/progress.ts (subscribe/get/getServer) so the home
// screen reads the bank count exactly the way it reads earned counts. The
// difference is that the read is async, so the first snapshot is `ready:
// false` and a real one replaces it.

import { zipStore, type ZipEntry } from "./zip";

const DB_NAME = "kanahero-bank";
const DB_VERSION = 1;
const STORE = "captures";

/** long edge cap, px. Legibility beats bytes — a capture that can't be read
    at a hotel table later is a lost capture. */
export const MAX_EDGE = 1600;
export const JPEG_QUALITY = 0.82;

export interface Capture {
  id: string;
  blob: Blob;
  w: number;
  h: number;
  bytes: number;
  takenAt: number;
  note: string;
}

/** `persist()` is a request, not a guarantee — which is why export exists.
    Whatever it answered gets surfaced honestly in the S5 footer. */
export type Persistence = "unknown" | "persistent" | "best-effort";

export interface BankState {
  ready: boolean;
  /** newest first — the only order a trip needs */
  captures: Capture[];
  persistence: Persistence;
  /** a failed write, stated bluntly. Never a toast: a capture that silently
      didn't save is worse than one that visibly didn't. */
  error: string | null;
}

// ---- database ----

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      if (typeof indexedDB === "undefined") {
        reject(new Error("indexeddb unavailable"));
        return;
      }
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE, { keyPath: "id" }).createIndex("takenAt", "takenAt");
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
      req.onblocked = () => reject(new Error("indexeddb blocked"));
    });
    // a rejected promise must not be cached, or one bad open poisons the tab
    dbPromise.catch(() => {
      dbPromise = null;
    });
  }
  return dbPromise;
}

/** Resolves on transaction *complete*, not request success — a quota failure
    surfaces when the transaction aborts, which is after the request "worked". */
async function tx<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await openDB();
  return new Promise<T>((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const req = run(t.objectStore(STORE));
    t.oncomplete = () => resolve(req.result);
    t.onerror = () => reject(t.error ?? req.error);
    t.onabort = () => reject(t.error ?? req.error ?? new Error("transaction aborted"));
  });
}

// ---- store ----

const SERVER: BankState = {
  ready: false,
  captures: [],
  persistence: "unknown",
  error: null,
};

let cache: BankState = SERVER;
const listeners = new Set<() => void>();
let loadStarted = false;

function set(patch: Partial<BankState>): void {
  cache = { ...cache, ...patch };
  listeners.forEach((l) => l());
}

export function subscribeBank(cb: () => void): () => void {
  listeners.add(cb);
  void load();
  return () => {
    listeners.delete(cb);
  };
}

export function getBank(): BankState {
  return cache;
}

export function getServerBank(): BankState {
  return SERVER;
}

function byNewest(a: Capture, b: Capture): number {
  return b.takenAt - a.takenAt || b.id.localeCompare(a.id);
}

async function load(): Promise<void> {
  if (loadStarted) return;
  loadStarted = true;
  try {
    const all = await tx<Capture[]>("readonly", (s) => s.getAll() as IDBRequest<Capture[]>);
    set({ ready: true, captures: all.sort(byNewest), persistence: await persistence() });
  } catch {
    set({
      ready: true,
      captures: [],
      error: "BANK STORAGE UNAVAILABLE — CAPTURES CANNOT SAVE.",
    });
  }
}

async function persistence(): Promise<Persistence> {
  try {
    if (!navigator.storage?.persisted) return "unknown";
    return (await navigator.storage.persisted()) ? "persistent" : "best-effort";
  } catch {
    return "unknown";
  }
}

/** Requested on the first successful capture; never blocks anything. */
async function requestPersistence(): Promise<void> {
  if (cache.persistence === "persistent") return;
  try {
    if (!navigator.storage?.persist) return;
    set({ persistence: (await navigator.storage.persist()) ? "persistent" : "best-effort" });
  } catch {
    /* the footer keeps whatever it already knew */
  }
}

// ---- capture pipeline ----

function newId(): string {
  const rand = Math.floor(Math.random() * 0x10000)
    .toString(16)
    .padStart(4, "0");
  return `${Date.now()}-${rand}`; // sortable, collision-safe
}

/** Phone cameras always write EXIF rotation and canvas otherwise ignores it,
    so the orientation is baked in here, once, at decode. */
async function decode(file: File): Promise<{
  source: CanvasImageSource;
  width: number;
  height: number;
  release: () => void;
}> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        release: () => bitmap.close(),
      };
    } catch {
      /* fall through to the <img> path */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode(); // browsers apply EXIF orientation when rendering an <img>
    return {
      source: img,
      width: img.naturalWidth,
      height: img.naturalHeight,
      release: () => URL.revokeObjectURL(url),
    };
  } catch (err) {
    URL.revokeObjectURL(url);
    throw err;
  }
}

async function downscale(file: File): Promise<{ blob: Blob; w: number; h: number }> {
  const { source, width, height, release } = await decode(file);
  try {
    const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
    const w = Math.max(1, Math.round(width * scale));
    const h = Math.max(1, Math.round(height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no 2d context");
    ctx.drawImage(source, 0, 0, w, h);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
    );
    if (!blob) throw new Error("jpeg encode failed");
    return { blob, w, h };
  } finally {
    release();
  }
}

function failure(err: unknown): string {
  const name = err instanceof DOMException ? err.name : "";
  if (name === "QuotaExceededError" || name === "NS_ERROR_DOM_QUOTA_REACHED") {
    return "CAPTURE DID NOT SAVE — STORAGE FULL. EXPORT NOW.";
  }
  return "CAPTURE DID NOT SAVE — TRY AGAIN.";
}

/** Save immediately: no confirm step, nothing between shutter and stored.
    Returns null if the write failed — the reason is on the state. */
export async function addCapture(file: File): Promise<Capture | null> {
  try {
    const { blob, w, h } = await downscale(file);
    const capture: Capture = {
      id: newId(),
      blob,
      w,
      h,
      bytes: blob.size,
      takenAt: Date.now(),
      note: "",
    };
    await tx("readwrite", (s) => s.add(capture));
    set({ captures: [capture, ...cache.captures], error: null });
    void requestPersistence();
    return capture;
  } catch (err) {
    set({ error: failure(err) });
    return null;
  }
}

/** The one line of "where I was", written at the hotel table. */
export async function updateNote(id: string, note: string): Promise<void> {
  const current = cache.captures.find((c) => c.id === id);
  if (!current || current.note === note) return;
  const next = { ...current, note };
  try {
    await tx("readwrite", (s) => s.put(next));
    set({ captures: cache.captures.map((c) => (c.id === id ? next : c)), error: null });
  } catch {
    set({ error: "NOTE DID NOT SAVE — STORAGE FULL. EXPORT NOW." });
  }
}

/** Permanent, and the only way the count goes down in this build. */
export async function deleteCapture(id: string): Promise<void> {
  await tx("readwrite", (s) => s.delete(id));
  set({ captures: cache.captures.filter((c) => c.id !== id), error: null });
}

export function clearBankError(): void {
  if (cache.error) set({ error: null });
}

// ---- export ----

export function bankBytes(captures: Capture[]): number {
  return captures.reduce((sum, c) => sum + c.bytes, 0);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function stamp(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
}

export interface ManifestEntry {
  id: string;
  file: string;
  takenAt: number;
  note: string;
  w: number;
  h: number;
  bytes: number;
}

export type ExportResult = "shared" | "downloaded" | "empty";

/** One ZIP: `captures/<id>.jpg` plus a manifest. Never mutates the bank —
    it is a copy, repeatable and idempotent, and it is also the input format
    the later conversion build reads. */
export async function exportBank(): Promise<ExportResult> {
  const captures = [...cache.captures].sort((a, b) => a.takenAt - b.takenAt);
  if (captures.length === 0) return "empty";

  const now = new Date();
  const entries: ZipEntry[] = [];
  const manifest: ManifestEntry[] = [];

  for (const c of captures) {
    const file = `captures/${c.id}.jpg`;
    entries.push({ name: file, data: new Uint8Array(await c.blob.arrayBuffer()) });
    manifest.push({
      id: c.id,
      file,
      takenAt: c.takenAt,
      note: c.note,
      w: c.w,
      h: c.h,
      bytes: c.bytes,
    });
  }

  entries.push({
    name: "manifest.json",
    data: new TextEncoder().encode(
      JSON.stringify(
        {
          format: "kanahero-bank",
          version: 1,
          exportedAt: now.toISOString(),
          captures: manifest,
        },
        null,
        2,
      ),
    ),
  });

  const zip = zipStore(entries, now);
  const name = `kanahero-bank-${stamp(now)}.zip`;
  const file = new File([zip], name, { type: "application/zip" });

  // Share first: on iOS that is AirDrop, Files and messaging in one move,
  // which is exactly "off the phone". Anything it refuses falls through to a
  // plain download — including the gesture timeout iOS raises when the ZIP
  // took a moment to build.
  try {
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file] });
      return "shared";
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") return "shared";
  }

  const url = URL.createObjectURL(zip);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
  return "downloaded";
}
