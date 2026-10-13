import test from 'node:test';
import assert from 'node:assert/strict';
import { FakeIDBFactory } from './helpers/fake-idb.js';
import { openDb, uid } from '../src/js/db/idb.js';
import { exportBackup, validateBackup, restoreBackup, APP_ID } from '../src/js/db/backup.js';
import { SCHEMA_VERSION, BACKUP_STORES } from '../src/js/db/schema.js';

const fresh = () => openDb({ factory: new FakeIDBFactory() });

test('create database with all stores', async () => {
  const db = await fresh();
  for (const s of BACKUP_STORES) assert.equal(await db.count(s), 0);
});

test('CRUD: put, get, getAll, update, delete, clear', async () => {
  const db = await fresh();
  await db.put('machines', { id: 'm1', name: 'M-01', gauge: 24 });
  await db.put('machines', { id: 'm2', name: 'M-02', gauge: 28 });
  assert.equal((await db.get('machines', 'm1')).name, 'M-01');
  assert.equal((await db.getAll('machines')).length, 2);
  await db.put('machines', { id: 'm1', name: 'M-01b', gauge: 24 });
  assert.equal((await db.get('machines', 'm1')).name, 'M-01b');
  assert.equal(await db.count('machines'), 2);
  await db.remove('machines', 'm2');
  assert.equal(await db.get('machines', 'm2'), undefined);
  await db.clear('machines');
  assert.equal((await db.getAll('machines')).length, 0);
});

test('custom keyPaths (defectNotes uses defectId) and unknown store errors', async () => {
  const db = await fresh();
  await db.put('defectNotes', { defectId: 'needle-line', text: 'check cams' });
  assert.equal((await db.get('defectNotes', 'needle-line')).text, 'check cams');
  await assert.rejects(() => db.put('nope', { id: 1 }), /Unknown store/);
  await assert.rejects(() => db.put('machines', { name: 'no id' }), (e) => e.name === 'StorageError');
});

test('data persists across reopen of the same factory', async () => {
  const factory = new FakeIDBFactory();
  const a = await openDb({ factory });
  await a.put('shifts', { id: 's1', actual: 10 });
  const b = await openDb({ factory });
  assert.equal((await b.get('shifts', 's1')).actual, 10);
});

test('missing IndexedDB yields a StorageError', async () => {
  await assert.rejects(() => openDb({ factory: null }), (e) => e.name === 'StorageError');
});

test('uid is unique-ish', () => { assert.notEqual(uid('x'), uid('x')); });

test('backup export -> validate -> restore (replace) round trip', async () => {
  const a = await fresh();
  await a.put('machines', { id: 'm1', name: 'বৃত্তাকার মেশিন' });
  await a.put('shifts', { id: 's1', date: '2026-10-01', actual: 5, unit: 'kg' });
  const backup = JSON.parse(JSON.stringify(await exportBackup(a)));
  assert.equal(backup.app, APP_ID); assert.equal(backup.schemaVersion, SCHEMA_VERSION);
  const v = validateBackup(backup);
  assert.ok(v.ok, JSON.stringify(v.errors));
  const b = await fresh();
  await b.put('machines', { id: 'old', name: 'should vanish' });
  await restoreBackup(b, backup, 'replace');
  assert.equal(await b.get('machines', 'old'), undefined);
  assert.equal((await b.get('machines', 'm1')).name, 'বৃত্তাকার মেশিন');
  assert.equal(await b.count('shifts'), 1);
});

test('restore merge keeps existing records', async () => {
  const a = await fresh();
  await a.put('machines', { id: 'm1', name: 'A' });
  const backup = await exportBackup(a);
  const b = await fresh();
  await b.put('machines', { id: 'm9', name: 'keep' });
  await restoreBackup(b, backup, 'merge');
  assert.equal(await b.count('machines'), 2);
});

test('validateBackup rejects bad input without throwing', () => {
  const codes = (o) => validateBackup(o).errors.map((e) => e.code);
  assert.ok(codes(null).includes('backup.notObject'));
  assert.ok(codes({}).includes('backup.wrongApp'));
  assert.ok(codes({ app: APP_ID, schemaVersion: SCHEMA_VERSION + 1, data: {} }).includes('backup.newerVersion'));
  assert.ok(codes({ app: APP_ID, schemaVersion: 'x', data: {} }).includes('backup.badVersion'));
  assert.ok(codes({ app: APP_ID, schemaVersion: 1 }).includes('backup.noData'));
  assert.ok(codes({ app: APP_ID, schemaVersion: 1, data: { evil: [] } }).includes('backup.unknownStore'));
  assert.ok(codes({ app: APP_ID, schemaVersion: 1, data: { machines: {} } }).includes('backup.badStore'));
  assert.ok(codes({ app: APP_ID, schemaVersion: 1, data: { machines: [{ name: 'x' }] } }).includes('backup.badRecord'));
  assert.ok(codes({ app: APP_ID, schemaVersion: 1, data: { machines: [{ id: 'a' }, { id: 'a' }] } }).includes('backup.duplicate'));
});

test('restore of an invalid backup leaves data untouched', async () => {
  const db = await fresh();
  await db.put('machines', { id: 'm1', name: 'safe' });
  await assert.rejects(() => restoreBackup(db, { app: 'other', data: {} }, 'replace'), /Invalid backup/);
  assert.equal(await db.count('machines'), 1);
});

test('clearAllUserData empties every backup store', async () => {
  const db = await fresh();
  await db.put('machines', { id: 'm1' }); await db.put('bookmarks', { key: 'defect:x' });
  await db.clearAllUserData();
  assert.equal(await db.count('machines'), 0); assert.equal(await db.count('bookmarks'), 0);
});
