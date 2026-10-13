import { h, icon, empty, confirmDialog, toast } from '../ui.js';
import { t } from '../i18n.js';
import { uid } from '../db/idb.js';
import { pageHead } from './shared.js';

export default async function notebook(ctx, _p, query) {
  const root = h('div');
  const st = { machine: query.m || '', edit: null };
  const machines = await ctx.db.getAll('machines');
  async function draw() {
    const all = (await ctx.db.getAll('notes')).sort((a, b) => b.updatedAt - a.updatedAt);
    const names = [...new Set([...all.map((n) => n.machineId), ...machines.map((m) => m.name)].filter(Boolean))].sort();
    const sel = h('select', { 'aria-label': t('maint.f.machine') }, h('option', { value: '' }, t('maint.f.machine') + ': ' + t('common.all')), names.map((n) => h('option', { value: n, selected: n === st.machine }, n)));
    sel.addEventListener('input', () => { st.machine = sel.value; draw(); });
    const m = h('input', { list: 'nbdl', value: st.edit ? st.edit.machineId : st.machine, placeholder: t('maint.machinePh'), 'aria-label': t('maint.f.machine') });
    const text = h('textarea', { 'aria-label': t('notes.text') }); text.value = st.edit ? st.edit.text : '';
    const rows = all.filter((n) => !st.machine || n.machineId === st.machine);
    const save = async () => {
      if (!text.value.trim()) { toast(t('err.required')); return; }
      const now = Date.now();
      await ctx.db.put('notes', { id: st.edit?.id || uid('nt'), machineId: m.value.trim(), text: text.value.trim(), createdAt: st.edit?.createdAt || now, updatedAt: now });
      st.edit = null; toast(t('common.saved')); draw();
    };
    root.replaceChildren(pageHead(t('home.notebook'), '#/more'), sel,
      h('div', { class: 'card' }, h('h3', null, t(st.edit ? 'notes.edit' : 'notes.add')), h('div', { class: 'field' }, h('label', null, t('maint.f.machine')), m), h('div', { class: 'field' }, h('label', null, t('notes.text')), text),
        h('div', { class: 'row end' }, st.edit ? h('button', { class: 'btn', onClick: () => { st.edit = null; draw(); } }, t('common.cancel')) : null, h('button', { class: 'btn primary', onClick: save }, t('common.save')))),
      h('datalist', { id: 'nbdl' }, names.map((n) => h('option', { value: n }))),
      rows.length ? h('div', { class: 'card' }, rows.map((n) => h('div', { class: 'item' }, h('div', { class: 'grow' }, h('strong', null, n.machineId || '—'), h('div', { class: 'meta' }, new Date(n.updatedAt).toLocaleString()), h('div', { style: 'white-space:pre-wrap' }, n.text)),
        h('button', { class: 'btn sm', 'aria-label': t('common.edit'), onClick: () => { st.edit = n; draw(); window.scrollTo(0, 0); } }, icon('edit', 18)),
        h('button', { class: 'btn sm', 'aria-label': t('common.delete'), onClick: async () => { if (await confirmDialog({ title: t('notes.deleteTitle'), message: t('common.cannotUndo'), danger: true, confirmLabel: t('common.delete') })) { await ctx.db.remove('notes', n.id); draw(); } } }, icon('trash', 18))))) : empty('notes.none'));
  }
  await draw();
  return root;
}
