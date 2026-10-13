import { h, icon, pill, empty, buildForm, confirmDialog, toast, safetyNote } from '../ui.js';
import { t, L } from '../i18n.js';
import { uid } from '../db/idb.js';
import { readNum } from '../calc/formulas.js';
import { todayLocal, isValidDate } from '../shift.js';
import { pageHead } from './shared.js';

const TYPES = ['issue', 'downtime', 'inspection', 'lubrication'];

export default async function maintenance(ctx, _p, query) {
  const root = h('div');
  const st = { tab: 'lists', run: null, edit: null, machine: query.m || '' };
  const machines = await ctx.db.getAll('machines');
  const dl = h('datalist', { id: 'mdl' }, machines.map((m) => h('option', { value: m.name })));

  async function render() {
    const body = h('div');
    root.replaceChildren(pageHead(t('home.maint'), '#/more'), h('div', { class: 'pills' }, [['lists', 'maint.tab.lists'], ['log', 'maint.tab.log'], ['history', 'maint.tab.history']].map(([k, key]) => pill(t(key), st.tab === k && !st.run && !st.edit, () => { st.tab = k; st.run = null; st.edit = null; render(); }))), safetyNote(t('maint.safety')), body, dl);
    if (st.run) await runView(body); else if (st.edit) await editView(body); else if (st.tab === 'lists') await listsView(body); else if (st.tab === 'log') logView(body); else await historyView(body);
  }

  async function lists() { return (await ctx.db.getAll('checklists')).sort((a, b) => a.id.localeCompare(b.id)); }

  async function listsView(body) {
    for (const c of await lists()) {
      body.append(h('div', { class: 'card' }, h('h3', null, L(c.title) || c.title), h('p', { class: 'meta' }, t('maint.items', { n: c.items.length })),
        h('div', { class: 'row' }, h('button', { class: 'btn primary sm', onClick: () => { st.run = { list: c, done: new Set() }; render(); } }, t('maint.run')), h('button', { class: 'btn sm', onClick: () => { st.edit = c; render(); } }, icon('edit', 18), t('maint.editItems')))));
    }
  }

  const itemRow = (it, extra) => h('div', { class: 'item' }, extra, h('div', { class: 'grow' }, it.safety ? h('span', { class: 'tag custom' }, t('safety.label')) : null, ' ', it.custom ? it.text : L(it)));
  const itemText = (it) => (it.custom ? it.text : L(it));

  async function runView(body) {
    const { list, done } = st.run;
    const m = h('input', { list: 'mdl', placeholder: t('maint.machinePh'), value: st.machine, 'aria-label': t('maint.f.machine') });
    const note = h('textarea', { 'aria-label': t('maint.f.note') });
    body.append(h('div', { class: 'card' }, h('h3', null, L(list.title) || list.title), h('div', { class: 'field' }, h('label', null, t('maint.f.machine')), m),
      list.items.map((it) => h('div', { class: 'item' }, h('input', { type: 'checkbox', id: 'ck-' + it.id, 'aria-label': itemText(it), onChange: (e) => { e.target.checked ? done.add(it.id) : done.delete(it.id); } }), h('label', { class: 'grow', for: 'ck-' + it.id }, it.safety ? h('span', { class: 'tag custom' }, t('safety.label')) : null, ' ', itemText(it)))),
      h('div', { class: 'field' }, h('label', null, t('maint.f.note')), note),
      h('div', { class: 'row end' }, h('button', { class: 'btn', onClick: () => { st.run = null; render(); } }, t('common.cancel')), h('button', { class: 'btn primary', onClick: async () => {
        await ctx.db.put('maintenance', { id: uid('mt'), type: 'checklist', machineId: m.value.trim(), date: todayLocal(), title: '', listId: list.id, listTitle: L(list.title) || list.title, done: [...done], total: list.items.length, note: note.value.trim(), createdAt: Date.now() });
        toast(t('common.saved')); st.run = null; st.tab = 'history'; render(); } }, t('maint.saveRun')))));
  }

  async function editView(body) {
    const c = st.edit;
    const input = h('input', { placeholder: t('maint.newItemPh'), 'aria-label': t('maint.newItemPh') });
    const safe = h('input', { type: 'checkbox', id: 'nsafe' });
    const persist = async () => { await ctx.db.put('checklists', c); };
    const itemsBox = h('div');
    const drawItems = () => itemsBox.replaceChildren(...c.items.map((it) => itemRow(it, null)).map((row, i) => { row.append(h('button', { class: 'btn sm', 'aria-label': t('common.delete'), onClick: async () => { if (await confirmDialog({ title: t('maint.deleteItem'), message: t('common.cannotUndo'), danger: true, confirmLabel: t('common.delete') })) { c.items.splice(i, 1); await persist(); drawItems(); } } }, icon('trash', 18))); return row; }));
    drawItems();
    body.append(h('div', { class: 'card' }, h('h3', null, L(c.title) || c.title), itemsBox, h('div', { class: 'field' }, h('label', null, t('maint.newItem')), input), h('label', { class: 'check' }, safe, ' ', t('maint.markSafety')),
      h('div', { class: 'row end' }, h('button', { class: 'btn', onClick: () => { st.edit = null; render(); } }, t('common.close')), h('button', { class: 'btn primary', onClick: async () => { const v = input.value.trim(); if (!v) return; c.items.push({ id: uid('it'), custom: true, text: v, safety: safe.checked }); await persist(); input.value = ''; safe.checked = false; drawItems(); toast(t('common.saved')); } }, icon('plus', 18), t('common.add')))));
  }

  function logView(body) {
    const type = h('select', { 'aria-label': t('maint.f.type') }, TYPES.map((k) => h('option', { value: k }, t('maint.type.' + k))));
    const holder = h('div');
    let fm;
    const draw = () => {
      const k = type.value;
      const fields = [{ name: 'date', type: 'date', label: 'maint.f.date', default: todayLocal() }, { name: 'machineId', type: 'text', label: 'maint.f.machine', list: 'mdl', default: st.machine },
        { name: 'title', type: 'text', label: k === 'downtime' ? 'maint.f.reason' : 'maint.f.title', wide: true },
        k === 'downtime' ? { name: 'minutes', type: 'number', label: 'maint.f.minutes' } : null,
        k === 'inspection' ? { name: 'count', type: 'number', label: 'maint.f.count', hint: 'maint.f.countHint' } : null,
        k === 'inspection' ? { name: 'position', type: 'text', label: 'maint.f.position' } : null,
        { name: 'note', type: 'textarea', label: 'maint.f.note', wide: true }].filter(Boolean);
      fm = buildForm(fields, {});
      holder.replaceChildren(fm.el);
    };
    type.addEventListener('input', draw); draw();
    const save = async () => {
      const v = fm.read(); const errors = {};
      if (!isValidDate(v.date)) errors.date = 'err.date';
      if (!v.machineId.trim()) errors.machineId = 'err.required';
      if (!v.title.trim()) errors.title = 'err.required';
      const rec = { id: uid('mt'), type: type.value, date: v.date, machineId: v.machineId.trim(), title: v.title.trim(), note: v.note.trim(), createdAt: Date.now() };
      for (const k of ['minutes', 'count']) if (k in v) { const r = readNum(v[k], { optional: k === 'count' }); if (r.error) errors[k] = r.error; else rec[k] = r.value; }
      if ('position' in v) rec.position = v.position.trim();
      fm.errors(errors);
      if (Object.keys(errors).length) return;
      await ctx.db.put('maintenance', rec); toast(t('common.saved')); st.tab = 'history'; render();
    };
    body.append(h('div', { class: 'card' }, h('div', { class: 'field' }, h('label', null, t('maint.f.type')), type), holder, h('div', { class: 'row end' }, h('button', { class: 'btn primary', onClick: save }, t('common.save')))));
  }

  async function historyView(body) {
    const all = (await ctx.db.getAll('maintenance')).sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);
    const names = [...new Set(all.map((r) => r.machineId).filter(Boolean))].sort();
    const sel = h('select', { 'aria-label': t('maint.f.machine') }, h('option', { value: '' }, t('maint.f.machine') + ': ' + t('common.all')), names.map((n) => h('option', { value: n, selected: n === st.machine }, n)));
    const out = h('div');
    const draw = () => {
      const rows = all.filter((r) => !sel.value || r.machineId === sel.value);
      out.replaceChildren(rows.length ? h('div', { class: 'card' }, rows.map((r) => h('div', { class: 'item' }, h('div', { class: 'grow' }, h('strong', null, `${r.date} · ${r.machineId || '—'} · ${t('maint.type.' + r.type)}`),
        h('div', { class: 'meta' }, r.type === 'checklist' ? `${r.listTitle}: ${r.done.length}/${r.total}` : [r.title, r.minutes ? r.minutes + ' min' : '', r.count ? r.count + ' ' + t('maint.pcs') : '', r.position].filter(Boolean).join(' · ')), r.note ? h('div', null, r.note) : null),
        h('button', { class: 'btn sm', 'aria-label': t('common.delete'), onClick: async () => { if (await confirmDialog({ title: t('maint.deleteRec'), message: t('common.cannotUndo'), danger: true, confirmLabel: t('common.delete') })) { await ctx.db.remove('maintenance', r.id); render(); } } }, icon('trash', 18))))) : empty('maint.none'));
    };
    sel.addEventListener('input', draw); body.append(sel, out); draw();
  }

  await render();
  return root;
}
