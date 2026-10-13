// Versioned IndexedDB schema. See docs/DATA_SCHEMA.md.
export const DB_NAME = 'koa-db';
export const SCHEMA_VERSION = 1;

/** store name -> keyPath */
export const STORES = {
  machines: 'id',
  shifts: 'id',
  maintenance: 'id',
  customDefects: 'id',
  defectNotes: 'defectId',
  calcs: 'id',
  progress: 'key',
  bookmarks: 'key',
  recents: 'key',
  checklists: 'id',
  notes: 'id',
  meta: 'key',
};
/** Stores included in JSON backups ('meta' is internal and excluded). */
export const BACKUP_STORES = Object.keys(STORES).filter((s) => s !== 'meta');

/** Migration step per version: receives the open database during versionchange. */
export const MIGRATIONS = {
  1(db) {
    for (const [name, keyPath] of Object.entries(STORES)) {
      if (!db.objectStoreNames.contains(name)) db.createObjectStore(name, { keyPath });
    }
  },
  // 2(db, tx) { ... add new stores / transform records here, never edit step 1 ... }
};

export function upgrade(db, oldVersion, newVersion, tx) {
  for (let v = oldVersion + 1; v <= newVersion; v++) {
    if (MIGRATIONS[v]) MIGRATIONS[v](db, tx);
  }
}
