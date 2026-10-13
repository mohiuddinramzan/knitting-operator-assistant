import { h, icon, pill, empty, buildForm, confirmDialog, toast, field } from '../ui.js';
import { t, fmt } from '../i18n.js';
import { uid } from '../db/idb.js';
import { prefs, saveTextFile } from '../platform.js';
import { toCSV, withBom } from '../csv.js';
import { validateShift, filterShifts, groupTotals, downtimeByReason, todayLocal, SHIFT_CSV_COLUMNS, DEFAULT_UNITS } from '../shift.js';
import { pageHead, fabricOptions, fabricLabel } from './shared.js';

export const units = () => prefs.get('units', DEFAULT_UNITS);

export async function route(ctx, [id, edit]) {
  if (id === 'new') return form(ctx, null);
  if (id === 'summary') return summary(ctx);
  if (id === 'handover') return handover(ctx);
  if (id && edit === 'edit') return form(ctx, id);
  if (id) return detail(ctx, id);
  return list(ctx);
}

const tabs = (active) => h('div', { class: 'pills' }, [['', 'shift.records'], ['summary', 'shift.summary'], ['handover', 'shift.handover']].map(([k, key]) => h('a', { class: 'pill' + (active === k ? ' on' : ''), href: '#/shift' + (k ? '/' + k : '') }, t(key))));
const unitsText = (u) => Object.entries(u).map(([name, v]) => `${fmt(v.actual)}/${fmt(v.target)} ${name}`).join(' · ');

async function list(ctx) {
  const all = await ctx.db.getAll('shifts');
  const f = { from: '', to: '', machineId: '', shift: '', fabric: '', q: '' };
  const ctl = (key, node) => { node.addEventListener('input', () => { f[key] = node.value; render(); }); return node; };
  const sel = (key, values, labelFn) => ctl(key, h('select', { 'aria-label': t('shift.f.' + key) }, h('option', { value: '' }, t('shift.f.' + key) + ': ' + t('common.all')), values.map((v) => h('option', { value: v }, labelFn ? labelFn(v) : v))));
  const uniq = (k) => [...new Set(all.map((s) => s[k]).filter(Boolean))].sort();
  const out = h('div');
  const render = () => {
    const rows = filterShifts(all, f);
    out.replaceChildren(rows.length ? h('div', { class: 'card' }, rows.map((s) => h('div', { class: 'item' }, h('div', { class: 'grow' }, h('a', { href: '#/shift/' + s.id }, h('strong', null, `${s.date} · ${t('shift.shiftWord')} ${s.shift} · ${s.machineId}`)), h('div', { class: 'meta' }, `${fabricLabel(s.fabric)} · ${fmt(s.actual)}/${fmt(s.target)} ${s.unit}${s.downtimeMin ? ' · ' + t('shift.downtimeShort', { m: fmt(s.downtimeMin, 0) }) : ''}`))))) : empty(all.length ? 'shift.noMatch' : 'shift.empty'), h('div', { class: 'meta' }, t('shift.count', { n: rows.length })));
    out.rows = rows;
  };
  const exportCsv = async () => {
    const rows = out.rows || [];
    if (!rows.length) { toast(t('shift.nothingExport')); return; }
    const csv = withBom(toCSV(rows, SHIFT_CSV_COLUMNS));
    const res = await saveTextFile(`shift-records-${todayLocal()}.csv`, csv, 'text/csv');
    toast(t('backup.result.' + res));
  };
  const filters = h('div', { class: 'form' },
    field(t('shift.f.from'), ctl('from', h('input', { type: 'date' }))), field(t('shift.f.to'), ctl('to', h('input', { type: 'date' }))),
    sel('machineId', uniq('machineId')), sel('shift', uniq('shift')), sel('fabric', ['single-jersey', 'rib', 'interlock', 'fleece', 'other'].filter((x) => all.some((s) => s.fabric === x)), fabricLabel),
    ctl('q', h('input', { type: 'search', placeholder: t('shift.f.q'), 'aria-label': t('shift.f.q') })));
  const root = h('div', null, pageHead(t('home.shift'), null, [h('a', { class: 'btn sm primary', href: '#/shift/new' }, icon('plus', 18), t('shift.new')), h('button', { class: 'btn sm', onClick: exportCsv }, icon('download', 18), t('shift.csv'))]), tabs(''), h('div', { class: 'card' }, filters), out);
  render();
  return root;
}

async function detail(ctx, id) {
  const s = await ctx.db.get('shifts', id);
  if (!s) return h('div', null, pageHead(t('home.shift'), '#/shift'), empty('err.notfound'));
  const pct = s.target > 0 ? (s.actual / s.target) * 100 : null;
  const row = (k, v) => (v || v === 0 ? h('tr', null, h('th', null, t(k)), h('td', null, String(v))) : null);
  const del = async () => { if (await confirmDialog({ title: t('shift.deleteTitle'), message: t('shift.deleteMsg'), danger: true, confirmLabel: t('common.delete') })) { await ctx.db.remove('shifts', id); toast(t('common.deleted')); ctx.nav('#/shift'); } };
  return h('div', null, pageHead(`${s.date} · ${s.machineId}`, '#/shift', [h('a', { class: 'btn sm', href: `#/shift/${id}/edit` }, icon('edit', 18), t('common.edit')), h('button', { class: 'btn sm danger', onClick: del }, icon('trash', 18), t('common.delete'))]),
    h('div', { class: 'card tblwrap' }, h('table', { class: 'tbl' }, h('tbody', null,
      row('shift.f.date', s.date), row('shift.f.shift', s.shift), row('shift.f.operator', s.operator), row('shift.f.machine', s.machineId), row('shift.f.fabricType', fabricLabel(s.fabric)), row('shift.f.style', s.style),
      row('shift.f.target', `${fmt(s.target)} ${s.unit}`), row('shift.f.actual', `${fmt(s.actual)} ${s.unit}`), row('shift.achieve', pct === null ? t('calc.target.zero') : `${fmt(pct)} %`),
      row('shift.f.downtime', s.downtimeMin ? `${fmt(s.downtimeMin, 0)} min` : ''), row('shift.f.reason', s.downtimeReason), row('shift.f.defects', s.defects), row('shift.f.action', s.action), row('shift.f.handover', s.handover)))));
}

async function form(ctx, id) {
  const ex = id ? await ctx.db.get('shifts', id) : null;
  if (id && !ex) return empty('err.notfound');
  const machines = await ctx.db.getAll('machines');
  const dlM = h('datalist', { id: 'dl-m' }, machines.map((m) => h('option', { value: m.name })));
  const dlU = h('datalist', { id: 'dl-u' }, units().map((u) => h('option', { value: u })));
  const dlS = h('datalist', { id: 'dl-s' }, ['A', 'B', 'C', '1', '2', '3'].map((x) => h('option', { value: x })));
  const fields = [
    { name: 'date', type: 'date', label: 'shift.f.date', default: todayLocal() }, { name: 'shift', type: 'text', label: 'shift.f.shift', list: 'dl-s' },
    { name: 'operator', type: 'text', label: 'shift.f.operator' }, { name: 'machineId', type: 'text', label: 'shift.f.machine', list: 'dl-m' },
    { name: 'fabric', type: 'select', label: 'shift.f.fabricType', options: fabricOptions() }, { name: 'style', type: 'text', label: 'shift.f.style' },
    { name: 'target', type: 'number', label: 'shift.f.target' }, { name: 'actual', type: 'number', label: 'shift.f.actual' },
    { name: 'unit', type: 'text', label: 'shift.f.unit', list: 'dl-u', hint: 'shift.unitHint', default: units()[0] },
    { name: 'downtimeMin', type: 'number', label: 'shift.f.downtimeMin' }, { name: 'downtimeReason', type: 'text', label: 'shift.f.reason', wide: true },
    { name: 'defects', type: 'textarea', label: 'shift.f.defects', wide: true }, { name: 'action', type: 'textarea', label: 'shift.f.action', wide: true }, { name: 'handover', type: 'textarea', label: 'shift.f.handover', wide: true },
  ];
  const fm = buildForm(fields, ex || {});
  const save = async () => {
    const v = validateShift(fm.read());
    fm.errors(v.errors);
    if (!v.ok) return;
    const rec = { ...v.record, id: ex?.id || uid('sh'), createdAt: ex?.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() };
    await ctx.db.put('shifts', rec); toast(t('common.saved')); ctx.nav('#/shift/' + rec.id);
  };
  return h('div', null, pageHead(t(ex ? 'shift.edit' : 'shift.new'), id ? '#/shift/' + id : '#/shift'), h('div', { class: 'card' }, fm.el, dlM, dlU, dlS, h('div', { class: 'row end' }, h('a', { class: 'btn', href: id ? '#/shift/' + id : '#/shift' }, t('common.cancel')), h('button', { class: 'btn primary', onClick: save }, t('common.save')))));
}

function totalsTable(groups, keyLabel) {
  return h('div', { class: 'card tblwrap' }, h('table', { class: 'tbl' }, h('thead', null, h('tr', null, h('th', null, keyLabel), h('th', null, t('shift.sum.actualTarget')), h('th', null, t('shift.sum.achieve')), h('th', null, t('shift.f.downtime')))),
    h('tbody', null, groups.map((g) => h('tr', null, h('td', null, g.key), h('td', null, Object.entries(g.units).map(([u, v]) => h('div', null, `${fmt(v.actual)} / ${fmt(v.target)} ${u}`))), h('td', null, Object.entries(g.units).map(([u, v]) => h('div', null, v.target > 0 ? `${fmt((v.actual / v.target) * 100, 1)} %` : '—'))), h('td', null, g.downtimeMin ? `${fmt(g.downtimeMin, 0)} min` : '—'))))));
}

async function summary(ctx) {
  const all = await ctx.db.getAll('shifts');
  if (!all.length) return h('div', null, pageHead(t('home.shift'), null), tabs('summary'), empty('shift.empty'));
  const reasons = downtimeByReason(all);
  return h('div', null, pageHead(t('home.shift'), null), tabs('summary'), h('p', { class: 'meta' }, t('shift.unitsNote')),
    h('h2', null, t('shift.sum.daily')), totalsTable(groupTotals(all, (s) => s.date), t('shift.f.date')),
    h('h2', null, t('shift.sum.machine')), totalsTable(groupTotals(all, (s) => s.machineId).sort((a, b) => a.key.localeCompare(b.key)), t('shift.f.machine')),
    h('h2', null, t('shift.sum.downtime')), reasons.length ? h('div', { class: 'card' }, reasons.map((r) => h('div', { class: 'item' }, h('div', { class: 'grow' }, r.reason), h('strong', null, `${fmt(r.minutes, 0)} min`)))) : empty('shift.sum.noDowntime'));
}

async function handover(ctx) {
  const all = await ctx.db.getAll('shifts');
  if (!all.length) return h('div', null, pageHead(t('home.shift'), null), tabs('handover'), empty('shift.empty'));
  const dates = [...new Set(all.map((s) => s.date))].sort().reverse();
  const dateSel = h('select', { 'aria-label': t('shift.f.date') }, dates.map((d) => h('option', { value: d }, d)));
  const shiftSel = h('select', { 'aria-label': t('shift.f.shift') });
  const out = h('div');
  const render = () => {
    const rows = filterShifts(all, { from: dateSel.value, to: dateSel.value }).filter((s) => !shiftSel.value || s.shift === shiftSel.value);
    out.replaceChildren(...rows.map((s) => h('div', { class: 'card' }, h('h3', null, `${s.machineId} · ${fabricLabel(s.fabric)} · ${t('shift.shiftWord')} ${s.shift}`), h('p', { class: 'meta' }, `${fmt(s.actual)}/${fmt(s.target)} ${s.unit}${s.downtimeMin ? ' · ' + fmt(s.downtimeMin, 0) + ' min' : ''}${s.downtimeReason ? ' (' + s.downtimeReason + ')' : ''}`),
      s.defects ? h('p', null, h('strong', null, t('shift.f.defects') + ': '), s.defects) : null, s.action ? h('p', null, h('strong', null, t('shift.f.action') + ': '), s.action) : null, h('p', null, h('strong', null, t('shift.f.handover') + ': '), s.handover || '—'))));
  };
  const fillShifts = () => { const names = [...new Set(all.filter((s) => s.date === dateSel.value).map((s) => s.shift))].sort(); shiftSel.replaceChildren(h('option', { value: '' }, t('common.all')), ...names.map((n) => h('option', { value: n }, n))); render(); };
  dateSel.addEventListener('input', fillShifts); shiftSel.addEventListener('input', render);
  fillShifts();
  return h('div', null, pageHead(t('home.shift'), null), tabs('handover'), h('div', { class: 'row' }, dateSel, shiftSel), out);
}
