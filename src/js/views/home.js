import { h, icon, empty } from '../ui.js';
import { t, L } from '../i18n.js';
import { getRecents } from '../db/userdata.js';
import { allDefects } from '../data.js';

const TILES = [['#/defects', 'defect', 'home.defects'], ['#/machines', 'machine', 'home.setup'], ['#/calc', 'calc', 'home.calc'], ['#/shift', 'book', 'home.shift'], ['#/maintenance', 'wrench', 'home.maint'], ['#/learn', 'learn', 'home.learn'], ['#/dictionary', 'dict', 'home.dict'], ['#/notebook', 'note', 'home.notebook'], ['#/backup', 'backup', 'home.backup']];

export default async function home(ctx) {
  const input = h('input', { type: 'search', placeholder: t('home.searchPh'), 'aria-label': t('common.search') });
  const form = h('form', { class: 'search', onSubmit: (e) => { e.preventDefault(); ctx.nav('#/search?q=' + encodeURIComponent(input.value.trim())); } }, input, h('button', { class: 'btn primary', type: 'submit' }, icon('search', 20), t('common.search')));
  const root = h('div', null, h('h1', null, t('home.title')), form);

  const [shifts, machines, notes, customs, last] = await Promise.all(['shifts', 'machines', 'notes', 'customDefects'].map((s) => ctx.db.count(s)).concat([ctx.db.get('meta', 'lastBackup')]));
  if (shifts + machines + notes + customs > 0 && (!last || Date.now() - last.at > 7 * 864e5)) {
    root.append(h('div', { class: 'banner' }, t('home.backupDue'), ' ', h('a', { href: '#/backup' }, t('home.backupNow'))));
  }
  root.append(h('div', { class: 'grid' }, TILES.map(([href, ic, key]) => h('a', { class: 'tile', href }, icon(ic, 28), t(key)))));

  const rec = await getRecents(ctx.db, 'defect', 5);
  if (rec.length) {
    const byId = new Map((await allDefects(ctx)).map((d) => [d.id, d]));
    root.append(h('h2', null, t('def.recent')), h('div', { class: 'card' }, rec.filter((r) => byId.has(r.id)).map((r) => h('div', { class: 'item' }, h('a', { class: 'grow', href: '#/defects/' + r.id }, L(byId.get(r.id).name))))));
  }
  root.append(h('p', { class: 'meta' }, t('home.safetyFoot')));
  return root;
}
