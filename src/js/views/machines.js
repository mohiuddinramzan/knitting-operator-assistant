import { h, icon, empty, buildForm, confirmDialog, toast, safetyNote } from '../ui.js';
import { t, L, fmt } from '../i18n.js';
import { readNum } from '../calc/formulas.js';
import { uid } from '../db/idb.js';
import { pageHead, fabricOptions, fabricLabel } from './shared.js';

export async function route(ctx, [id]) {
  if (id === 'new') return form(ctx, null);
  if (id && id.startsWith('edit-')) return form(ctx, id.slice(5));
  return id ? detail(ctx, id) : list(ctx);
}

async function list(ctx) {
  const machines = (await ctx.db.getAll('machines')).sort((a, b) => a.name.localeCompare(b.name));
  return h('div', null, pageHead(t('home.setup'), '#/more', h('a', { class: 'btn sm primary', href: '#/machines/new' }, icon('plus', 18), t('mach.add'))),
    h('h2', null, t('mach.profiles')),
    machines.length ? h('div', { class: 'card' }, machines.map((m) => h('div', { class: 'item' }, h('div', { class: 'grow' }, h('a', { href: '#/machines/' + m.id }, h('strong', null, m.name)), h('div', { class: 'meta' }, `${fabricLabel(m.fabric)}${m.diameter ? ' · Ø' + m.diameter + '"' : ''}${m.gauge ? ' · ' + m.gauge + 'G' : ''}${m.needles ? ' · ' + m.needles + ' ' + t('mach.needlesShort') : ''}`))))) : empty('mach.none'),
    h('h2', null, t('mach.guides')), h('div', { class: 'card' }, ctx.data.guides.map((g) => h('div', { class: 'item' }, h('div', { class: 'grow' }, h('a', { href: '#/guides/' + g.id }, L(g.title)), h('div', null, h('span', { class: 'tag' }, t('mach.kind.' + g.kind))))))),
    safetyNote(t('mach.safety')));
}

async function detail(ctx, id) {
  const m = await ctx.db.get('machines', id);
  if (!m) return h('div', null, pageHead(t('home.setup'), '#/machines'), empty('err.notfound'));
  const hist = (await ctx.db.getAll('maintenance')).filter((r) => r.machineId === m.name).sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);
  const notes = (await ctx.db.getAll('notes')).filter((n) => n.machineId === m.name);
  const row = (k, v) => (v ? h('tr', null, h('th', null, t(k)), h('td', null, String(v))) : null);
  const del = async () => { if (await confirmDialog({ title: t('mach.deleteTitle'), message: t('mach.deleteMsg'), danger: true, confirmLabel: t('common.delete') })) { await ctx.db.remove('machines', id); ctx.nav('#/machines'); } };
  const q = encodeURIComponent(m.name);
  return h('div', null, pageHead(m.name, '#/machines', [h('a', { class: 'btn sm', href: '#/machines/edit-' + id }, icon('edit', 18), t('common.edit')), h('button', { class: 'btn sm danger', onClick: del }, icon('trash', 18))]),
    h('div', { class: 'card tblwrap' }, h('table', { class: 'tbl' }, h('tbody', null, row('mach.f.fabric', fabricLabel(m.fabric)), row('mach.f.diameter', m.diameter && `${m.diameter} in`), row('mach.f.gauge', m.gauge && `${m.gauge} G`), row('mach.f.needles', m.needles), row('mach.f.feeders', m.feeders), row('mach.f.notes', m.notes)))),
    h('div', { class: 'row' }, h('a', { class: 'btn', href: '#/maintenance?m=' + q }, icon('wrench', 18), t('mach.logWork')), h('a', { class: 'btn', href: '#/notebook?m=' + q }, icon('note', 18), t('mach.notesBtn', { n: notes.length }))),
    h('h2', null, t('mach.history')),
    hist.length ? h('div', { class: 'card' }, hist.slice(0, 40).map((r) => h('div', { class: 'item' }, h('div', { class: 'grow' }, h('strong', null, `${r.date} · ${t('maint.type.' + r.type)}`), h('div', { class: 'meta' }, r.title || r.listTitle || ''), r.note ? h('div', null, r.note) : null)))) : empty('mach.noHistory'));
}

async function form(ctx, id) {
  const ex = id ? await ctx.db.get('machines', id) : null;
  const fields = [
    { name: 'name', type: 'text', label: 'mach.f.id', wide: true }, { name: 'fabric', type: 'select', label: 'mach.f.fabric', options: fabricOptions() },
    { name: 'diameter', type: 'number', label: 'mach.f.diameter' }, { name: 'gauge', type: 'number', label: 'mach.f.gauge' },
    { name: 'needles', type: 'number', label: 'mach.f.needles' }, { name: 'feeders', type: 'number', label: 'mach.f.feeders' },
    { name: 'notes', type: 'textarea', label: 'mach.f.notes', wide: true },
  ];
  const fm = buildForm(fields, ex || {});
  const save = async () => {
    const v = fm.read(); const errors = {}; const rec = { ...(ex || {}), id: ex?.id || uid('mc'), name: v.name.trim(), fabric: v.fabric, notes: v.notes.trim(), createdAt: ex?.createdAt || Date.now() };
    if (!rec.name) errors.name = 'err.required';
    else if ((await ctx.db.getAll('machines')).some((m) => m.name.toLowerCase() === rec.name.toLowerCase() && m.id !== rec.id)) errors.name = 'mach.dup';
    for (const k of ['diameter', 'gauge', 'needles', 'feeders']) { const r = readNum(v[k], { optional: true, positive: true }); if (r.error) errors[k] = r.error; else rec[k] = r.value; }
    fm.errors(errors);
    if (Object.keys(errors).length) return;
    if (ex && ex.name !== rec.name) toast(t('mach.renameNote'));
    await ctx.db.put('machines', rec); toast(t('common.saved')); ctx.nav('#/machines/' + rec.id);
  };
  return h('div', null, pageHead(t(ex ? 'mach.edit' : 'mach.add'), id ? '#/machines/' + id : '#/machines'), h('div', { class: 'card' }, fm.el, h('div', { class: 'row end' }, h('button', { class: 'btn primary', onClick: save }, t('common.save')))));
}

export async function guides(ctx, [id]) {
  if (!id) return list(ctx);
  const g = ctx.data.guides.find((x) => x.id === id);
  if (!g) return empty('err.notfound');
  return h('div', null, pageHead(L(g.title), '#/machines'), safetyNote(L(g.safety)), h('div', { class: 'card' }, L(g.body).map((p) => h('p', null, p))));
}
