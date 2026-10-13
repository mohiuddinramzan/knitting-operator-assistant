// JSON backup / restore with validation and schema checks.
import { STORES, BACKUP_STORES, SCHEMA_VERSION } from './schema.js';

export const APP_ID = 'knitting-operator-assistant';

export async function exportBackup(db, now = new Date()) {
  const data = {};
  const counts = {};
  for (const s of BACKUP_STORES) { data[s] = await db.getAll(s); counts[s] = data[s].length; }
  return { app: APP_ID, schemaVersion: SCHEMA_VERSION, exportedAt: now.toISOString(), counts, data };
}

/** Returns {ok, errors:[{code,detail}], counts}. Never throws on bad input. */
export function validateBackup(obj) {
  const errors = [];
  const fail = (code, detail) => errors.push({ code, detail });
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) { fail('backup.notObject'); return { ok: false, errors, counts: {} }; }
  if (obj.app !== APP_ID) fail('backup.wrongApp');
  if (!Number.isInteger(obj.schemaVersion) || obj.schemaVersion < 1) fail('backup.badVersion');
  else if (obj.schemaVersion > SCHEMA_VERSION) fail('backup.newerVersion', String(obj.schemaVersion));
  const counts = {};
  if (!obj.data || typeof obj.data !== 'object' || Array.isArray(obj.data)) {
    fail('backup.noData');
  } else {
    for (const [store, items] of Object.entries(obj.data)) {
      if (!BACKUP_STORES.includes(store)) { fail('backup.unknownStore', store); continue; }
      if (!Array.isArray(items)) { fail('backup.badStore', store); continue; }
      const keyPath = STORES[store];
      const seen = new Set();
      items.forEach((it, i) => {
        const k = it && typeof it === 'object' ? it[keyPath] : undefined;
        if (typeof k !== 'string' || !k) fail('backup.badRecord', `${store}[${i}]`);
        else if (seen.has(k)) fail('backup.duplicate', `${store}:${k}`);
        else seen.add(k);
      });
      counts[store] = items.length;
    }
  }
  return { ok: errors.length === 0, errors, counts };
}

/** Upgrade older backups to the current schema (identity while only v1 exists). */
export function migrateBackup(obj) { return obj; }

/** mode 'replace' wipes the listed stores first; 'merge' upserts by key. Atomic. */
export async function restoreBackup(db, obj, mode = 'replace') {
  const v = validateBackup(obj);
  if (!v.ok) { const e = new Error('Invalid backup'); e.errors = v.errors; throw e; }
  const migrated = migrateBackup(obj);
  const data = {};
  if (mode === 'replace') BACKUP_STORES.forEach((s) => { data[s] = []; });
  for (const [s, items] of Object.entries(migrated.data)) data[s] = items;
  await db.bulkWrite(data, mode);
  return v.counts;
}

export function parseBackupText(text) {
  try { return { obj: JSON.parse(text) }; } catch { return { error: 'backup.notJson' }; }
}
