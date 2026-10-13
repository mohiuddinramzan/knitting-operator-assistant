// Minimal in-memory IndexedDB double covering what the app uses (open/upgrade, put/get/getAll/delete/clear/count).
const tick = (fn) => setTimeout(fn, 0);

class FakeRequest { constructor() { this.result = undefined; this.error = null; this.onsuccess = null; this.onerror = null; } }

class FakeTx {
  constructor(db, names) {
    this.db = db; this.names = names; this.pending = 0; this.done = false; this.error = null;
    this.oncomplete = null; this.onerror = null; this.onabort = null;
    this._check();
  }
  _check() {
    tick(() => { if (this.pending === 0 && !this.done) { this.done = true; this.oncomplete && this.oncomplete(); } });
  }
  _op(fn) {
    const req = new FakeRequest();
    this.pending++;
    tick(() => {
      try { req.result = fn(); req.onsuccess && req.onsuccess({ target: req }); } catch (e) { this.error = e; req.error = e; this.done = true; this.onerror && this.onerror(); this.onabort && this.onabort(); return; }
      this.pending--;
      this._check();
    });
    return req;
  }
  abort() { this.done = true; this.onabort && this.onabort(); }
  objectStore(name) {
    if (!this.names.includes(name) || !this.db._stores.has(name)) throw new Error('NotFoundError: ' + name);
    const { keyPath, rows } = this.db._stores.get(name);
    const clone = (v) => (v === undefined ? v : structuredClone(v));
    return {
      put: (v) => this._op(() => { if (!v || v[keyPath] === undefined) throw new Error('DataError'); rows.set(v[keyPath], clone(v)); return v[keyPath]; }),
      get: (k) => this._op(() => clone(rows.get(k))),
      getAll: () => this._op(() => [...rows.values()].map(clone)),
      delete: (k) => this._op(() => { rows.delete(k); }),
      clear: () => this._op(() => { rows.clear(); }),
      count: () => this._op(() => rows.size),
    };
  }
}

class FakeDb {
  constructor(stores, version) { this._stores = stores; this.version = version; }
  get objectStoreNames() { return { contains: (n) => this._stores.has(n) }; }
  createObjectStore(name, { keyPath }) { this._stores.set(name, { keyPath, rows: new Map() }); }
  transaction(names) {
    const list = Array.isArray(names) ? names : [names];
    list.forEach((n) => { if (!this._stores.has(n)) throw new Error('NotFoundError: ' + n); });
    return new FakeTx(this, list);
  }
  close() {}
}

export class FakeIDBFactory {
  constructor() { this.dbs = new Map(); }
  open(name, version) {
    const req = new FakeRequest();
    tick(() => {
      let rec = this.dbs.get(name);
      const old = rec ? rec.version : 0;
      if (!rec) { rec = { version, stores: new Map() }; this.dbs.set(name, rec); }
      const db = new FakeDb(rec.stores, version);
      req.result = db;
      if (version > old) { req.transaction = {}; req.onupgradeneeded && req.onupgradeneeded({ oldVersion: old, newVersion: version }); rec.version = version; }
      req.onsuccess && req.onsuccess({ target: req });
    });
    return req;
  }
}
