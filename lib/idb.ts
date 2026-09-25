// One object store in one IndexedDB database, opened lazily and once.
//
// Lifted out of lib/bank.ts for the receipts (SPEC-v6 §3.2) so the two stores
// share the same two rules and nothing else:
//   - a rejected open is not cached, or one bad open poisons the tab;
//   - a write resolves on transaction *complete*, not request success — a
//     quota failure surfaces when the transaction aborts, which is after the
//     request "worked".
// Each caller gets its own database, so a version bump for one never touches
// the other, and a blocked or broken one cannot take the other down with it.

export interface IdbStore {
  tx<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T>;
}

export function idbStore(spec: {
  name: string;
  version: number;
  store: string;
  /** create the store and its indexes — called inside onupgradeneeded */
  upgrade: (db: IDBDatabase) => void;
}): IdbStore {
  let dbPromise: Promise<IDBDatabase> | null = null;

  function openDB(): Promise<IDBDatabase> {
    if (!dbPromise) {
      dbPromise = new Promise((resolve, reject) => {
        if (typeof indexedDB === "undefined") {
          reject(new Error("indexeddb unavailable"));
          return;
        }
        const req = indexedDB.open(spec.name, spec.version);
        req.onupgradeneeded = () => spec.upgrade(req.result);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
        req.onblocked = () => reject(new Error("indexeddb blocked"));
      });
      dbPromise.catch(() => {
        dbPromise = null;
      });
    }
    return dbPromise;
  }

  return {
    async tx<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
      const db = await openDB();
      return new Promise<T>((resolve, reject) => {
        const t = db.transaction(spec.store, mode);
        const req = run(t.objectStore(spec.store));
        t.oncomplete = () => resolve(req.result);
        t.onerror = () => reject(t.error ?? req.error);
        t.onabort = () => reject(t.error ?? req.error ?? new Error("transaction aborted"));
      });
    },
  };
}
