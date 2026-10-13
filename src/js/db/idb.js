// Small promise wrapper around IndexedDB. The factory can be injected for tests.
import { DB_NAME, SCHEMA_VERSION, STORES, BACKUP_STORES, upgrade } from './schema.js';

export class StorageError extends Error {
  constructor(cause) {
    super(cause && cause.message ? cause.message : String(cause || 'Storage error'));
    this.name = 'StorageError';
    this.cause = cause;
  }
}

export function uid(prefix = 'id') {
  const rnd = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now().toString(36)}${rnd}`;
}

function run(rawDb, storeNames, mode, fn) {
  return new Promise((resolve, reject) => {
    let tx;
    try { tx = rawDb.transaction(storeNames, mode); } catch (e) { reject(new StorageError(e)); return; }
    let out;
    tx.oncomplete = () => resolve(typeof out === 'function' ? out() : out);
    tx.onerror = () => reject(new StorageError(tx.error));
    tx.onabort = () => reject(new StorageError(tx.error || 'Transaction aborted'));
    try { out = fn(tx); } catch (e) { try { tx.abort(); } catch { /* ignore */ } reject(new StorageError(e)); }
  });
}

function wrap(rawDb) {
  const check = (store) => { if (!STORES[store]) throw new StorageError(`Unknown store: ${store}`); };
  return {
    raw: rawDb,
    async put(store, value) {
      check(store);
      await run(rawDb, [store], 'readwrite', (tx) => { tx.objectStore(store).put(value); });
      return value;
    },
    async get(store, key) {
      check(store);
      return run(rawDb, [store], 'readonly', (tx) => { const r = tx.objectStore(store).get(key); return () => r.result; });
    },
    async getAll(store) {
      check(store);
      return run(rawDb, [store], 'readonly', (tx) => { const r = tx.objectStore(store).getAll(); return () => r.result || []; });
    },
    async remove(store, key) {
      check(store);
      await run(rawDb, [store], 'readwrite', (tx) => { tx.objectStore(store).delete(key); });
    },
    async clear(store) {
      check(store);
      await run(rawDb, [store], 'readwrite', (tx) => { tx.objectStore(store).clear(); });
    },
    async count(store) {
      check(store);
      return run(rawDb, [store], 'readonly', (tx) => { const r = tx.objectStore(store).count(); return () => r.result; });
    },
    /** Atomically replace (mode 'replace') or upsert (mode 'merge') several stores. All-or-nothing. */
    async bulkWrite(data, mode = 'replace') {
      const names = Object.keys(data);
      names.forEach(check);
      if (!names.length) return;
      await run(rawDb, names, 'readwrite', (tx) => {
        for (const name of names) {
          const os = tx.objectStore(name);
          if (mode === 'replace') os.clear();
          for (const item of data[name]) os.put(item);
        }
      });
    },
    /** Clear every user-data store atomically. */
    async clearAllUserData() {
      await run(rawDb, BACKUP_STORES, 'readwrite', (tx) => { BACKUP_STORES.forEach((s) => tx.objectStore(s).clear()); });
    },
    close() { rawDb.close(); },
  };
}

export function openDb({ factory = globalThis.indexedDB, name = DB_NAME } = {}) {
  return new Promise((resolve, reject) => {
    if (!factory) { reject(new StorageError('IndexedDB is not available')); return; }
    let req;
    try { req = factory.open(name, SCHEMA_VERSION); } catch (e) { reject(new StorageError(e)); return; }
    req.onupgradeneeded = (e) => upgrade(req.result, e.oldVersion, SCHEMA_VERSION, req.transaction);
    req.onsuccess = () => resolve(wrap(req.result));
    req.onerror = () => reject(new StorageError(req.error));
    req.onblocked = () => reject(new StorageError('Database blocked by another tab'));
  });
}
