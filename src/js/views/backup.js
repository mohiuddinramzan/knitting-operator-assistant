import { h, icon, confirmDialog, toast, safetyNote } from '../ui.js';
import { t } from '../i18n.js';
import { saveTextFile } from '../platform.js';
import { exportBackup, validateBackup, restoreBackup, parseBackupText } from '../db/backup.js';
import { todayLocal } from '../shift.js';
import { pageHead } from './shared.js';

export default async function backup(ctx) {
  const status = h('div', { role: 'status' });
  const fileInput = h('input', { type: 'file', accept: 'application/json,.json', 'aria-label': t('backup.choose') });
  const say = (msg, bad) => status.replaceChildren(h('div', { class: bad ? 'warnbox' : 'res' }, msg));

  const doExport = async () => {
    const data = await exportBackup(ctx.db);
    const res = await saveTextFile(`knitting-backup-${todayLocal()}.json`, JSON.stringify(data, null, 2), 'application/json');
    if (res !== 'failed') await ctx.db.put('meta', { key: 'lastBackup', at: Date.now() });
    say(t('backup.result.' + res), res === 'failed');
  };

  const doImport = async () => {
    const f = fileInput.files && fileInput.files[0];
    if (!f) { say(t('backup.noFile'), true); return; }
    let text;
    try { text = await f.text(); } catch { say(t('backup.readFail'), true); return; }
    const parsed = parseBackupText(text);
    if (parsed.error) { say(t(parsed.error), true); return; }
    const v = validateBackup(parsed.obj);
    if (!v.ok) { status.replaceChildren(h('div', { class: 'warnbox' }, h('strong', null, t('backup.invalid')), h('ul', { class: 'bul' }, v.errors.slice(0, 6).map((e) => h('li', null, t(e.code) + (e.detail ? ` (${e.detail})` : '')))))); return; }
    const total = Object.values(v.counts).reduce((a, b) => a + b, 0);
    const mode = await chooseMode(total);
    if (!mode) return;
    try { await restoreBackup(ctx.db, parsed.obj, mode); await ctx.reseedIfEmpty(); say(t('backup.restored', { n: total })); } catch { say(t('err.storage'), true); }
  };
  const chooseMode = async (total) => {
    const replace = await confirmDialog({ title: t('backup.importTitle'), message: t('backup.replaceMsg', { n: total }), confirmLabel: t('backup.replace'), danger: true });
    if (replace) return 'replace';
    const merge = await confirmDialog({ title: t('backup.importTitle'), message: t('backup.mergeMsg', { n: total }), confirmLabel: t('backup.merge') });
    return merge ? 'merge' : null;
  };
  const doClear = async () => {
    if (!(await confirmDialog({ title: t('backup.clearTitle'), message: t('backup.clearMsg'), danger: true, confirmLabel: t('backup.clearAll'), checkLabel: t('backup.clearCheck') }))) return;
    await ctx.db.clearAllUserData(); await ctx.reseedIfEmpty(); say(t('backup.cleared'));
  };
  return h('div', null, pageHead(t('home.backup'), '#/more'), safetyNote(t('backup.storageNote')),
    h('div', { class: 'card' }, h('h3', null, t('backup.export')), h('p', null, t('backup.exportMsg')), h('button', { class: 'btn primary', onClick: doExport }, icon('download', 18), t('backup.exportBtn'))),
    h('div', { class: 'card' }, h('h3', null, t('backup.import')), h('p', null, t('backup.importMsg')), fileInput, h('div', { class: 'row' }, h('button', { class: 'btn', onClick: doImport }, icon('upload', 18), t('backup.importBtn')))),
    h('div', { class: 'card' }, h('h3', null, t('backup.move')), h('p', null, t('backup.moveMsg')), h('p', null, h('a', { href: '#/shift' }, t('shift.csv')))),
    h('div', { class: 'card' }, h('h3', null, t('backup.clear')), h('p', null, t('backup.clearHint')), h('button', { class: 'btn danger', onClick: doClear }, icon('trash', 18), t('backup.clearAll'))),
    status);
}
