import { h, icon, pill, empty, buildForm, confirmDialog, toast, safetyNote } from '../ui.js';
import { t, L } from '../i18n.js';
import { allDefects, toLines } from '../data.js';
import { search, buildIndex } from '../search.js';
import { toggleBookmark, isBookmarked, addRecent, getRecents, getBookmarks } from '../db/userdata.js';
import { uid } from '../db/idb.js';
import { pageHead, fabricLabel, FABRIC_KEYS } from './shared.js';

export async function route(ctx, [id]) {
  if (id === 'new') return customForm(ctx);
  if (id && id.startsWith('edit-')) return customForm(ctx, id.slice(5));
  return id ? detail(ctx, id) : list(ctx);
}

async function list(ctx) {
  const defects = await allDefects(ctx);
  const bookmarks = new Set((await getBookmarks(ctx.db, 'defect')).map((b) => b.id));
  const recents = await getRecents(ctx.db, 'defect', 5);
  const idx = buildIndex(defects.map((d) => ({ id: d.id, title: `${d.name.en} ${d.name.bn}`, text: [...d.symptoms.en, ...d.symptoms.bn, ...d.causes.en, ...d.causes.bn].join(' ') })));
  const st = { q: '', cat: '', fabric: '', marked: false };
  const input = h('input', { type: 'search', placeholder: t('def.searchPh'), 'aria-label': t('common.search') });
  const out = h('div');
  const chips = h('div');
  const render = () => {
    const ids = st.q.trim() ? new Set(search(idx, st.q, ctx.data.aliases).map((d) => d.id)) : null;
    const rows = defects.filter((d) => (!ids || ids.has(d.id)) && (!st.cat || d.cat === st.cat) && (!st.fabric || d.fabrics.includes(st.fabric)) && (!st.marked || bookmarks.has(d.id)));
    out.replaceChildren(rows.length ? h('div', { class: 'card' }, rows.map((d) => h('div', { class: 'item' },
      h('div', { class: 'grow' }, h('a', { href: '#/defects/' + d.id }, h('strong', null, L(d.name))), h('div', null, d.custom ? h('span', { class: 'tag custom' }, t('def.custom')) : null, h('span', { class: 'tag' }, L(ctx.data.categories[d.cat]) || d.cat), d.fabrics.map((f) => h('span', { class: 'tag' }, fabricLabel(f))))),
      bookmarks.has(d.id) ? icon('star', 18) : null))) : empty('def.none'));
    const cats = Object.keys(ctx.data.categories);
    chips.replaceChildren(
      h('div', { class: 'pills' }, pill(t('common.all'), !st.cat, () => { st.cat = ''; render(); }), cats.map((c) => pill(L(ctx.data.categories[c]), st.cat === c, () => { st.cat = c; render(); }))),
      h('div', { class: 'pills' }, pill(t('common.all'), !st.fabric, () => { st.fabric = ''; render(); }), FABRIC_KEYS.map((f) => pill(fabricLabel(f), st.fabric === f, () => { st.fabric = f; render(); })), pill(t('def.bookmarked'), st.marked, () => { st.marked = !st.marked; render(); })));
  };
  input.addEventListener('input', () => { st.q = input.value; render(); });
  const root = h('div', null, pageHead(t('home.defects'), null, h('a', { class: 'btn sm', href: '#/defects/new' }, icon('plus', 18), t('def.add'))), h('div', { class: 'search' }, input), chips, out);
  if (recents.length) {
    const byId = new Map(defects.map((d) => [d.id, d]));
    root.append(h('h2', null, t('def.recent')), h('div', { class: 'pills' }, recents.filter((r) => byId.has(r.id)).map((r) => h('a', { class: 'pill', href: '#/defects/' + r.id }, L(byId.get(r.id).name)))));
  }
  root.append(safetyNote(t('def.disclaimer')));
  render();
  return root;
}

const sectionList = (title, items, cls, checkable) => h('div', { class: cls || null },
  h('h2', null, title),
  h('ul', { class: checkable ? 'plain' : 'bul' }, items.map((x) => h('li', checkable ? { class: 'item' } : null, checkable ? h('input', { type: 'checkbox', 'aria-label': x }) : null, checkable ? h('span', { class: 'grow' }, x) : x))));

async function detail(ctx, id) {
  const defects = await allDefects(ctx);
  const d = defects.find((x) => x.id === id);
  if (!d) return h('div', null, pageHead(t('home.defects'), '#/defects'), empty('def.none'));
  await addRecent(ctx.db, 'defect', id).catch(() => {});
  const marked = await isBookmarked(ctx.db, 'defect', id);
  const note = (await ctx.db.get('defectNotes', id)) || { defectId: id, text: '', confirmedCause: '' };
  const starBtn = h('button', { class: 'btn sm', type: 'button', 'aria-pressed': String(marked), onClick: async () => { const on = await toggleBookmark(ctx.db, 'defect', id); starBtn.setAttribute('aria-pressed', String(on)); starBtn.lastChild.textContent = on ? t('def.bookmarked') : t('def.bookmark'); } }, icon('star', 18), marked ? t('def.bookmarked') : t('def.bookmark'));
  const actions = [starBtn];
  if (d.custom) {
    actions.push(h('a', { class: 'btn sm', href: '#/defects/edit-' + id }, icon('edit', 18), t('common.edit')));
    actions.push(h('button', { class: 'btn sm danger', onClick: async () => { if (await confirmDialog({ title: t('def.deleteTitle'), message: t('def.deleteMsg'), danger: true, confirmLabel: t('common.delete') })) { await ctx.db.remove('customDefects', id); ctx.nav('#/defects'); } } }, icon('trash', 18)));
  }
  const root = h('div', null, pageHead(L(d.name), '#/defects', actions));
  root.append(h('div', null, h('span', { class: 'tag' }, L(ctx.data.categories[d.cat]) || d.cat), d.fabrics.map((f) => h('span', { class: 'tag' }, fabricLabel(f)))));
  if (d.safety) root.append(safetyNote(L(d.safety)));
  root.append(h('div', { class: 'card' },
    sectionList(t('def.symptoms'), L(d.symptoms) || [], null),
    h('div', { class: 'possible' }, sectionList(t('def.causes'), L(d.causes) || [], null), h('p', { class: 'meta' }, t('def.causesNote'))),
    sectionList(t('def.diagnostic'), L(d.diagnostic) || [], null, true),
    sectionList(t('def.inspection'), L(d.inspection) || [], null),
    sectionList(t('def.actions'), L(d.actions) || [], null),
    sectionList(t('def.verify'), L(d.verify) || [], null, true)));
  const rel = d.related.map((r) => defects.find((x) => x.id === r)).filter(Boolean);
  if (rel.length) root.append(h('h2', null, t('def.related')), h('div', { class: 'pills' }, rel.map((r) => h('a', { class: 'pill', href: '#/defects/' + r.id }, L(r.name)))));
  const text = h('textarea', { 'aria-label': t('def.notes') }); text.value = note.text || '';
  const conf = h('textarea', { 'aria-label': t('def.confirmed'), rows: 2 }); conf.value = note.confirmedCause || '';
  root.append(h('h2', null, t('def.notes')), h('div', { class: 'card' },
    h('div', { class: 'field' }, h('label', null, t('def.notesLabel')), text),
    h('div', { class: 'confirmed' }, h('div', { class: 'field' }, h('label', null, t('def.confirmed')), conf, h('div', { class: 'hint' }, t('def.confirmedHint')))),
    h('div', { class: 'row end' }, h('button', { class: 'btn primary', onClick: async () => { await ctx.db.put('defectNotes', { defectId: id, text: text.value.trim(), confirmedCause: conf.value.trim(), updatedAt: Date.now() }); toast(t('common.saved')); } }, t('common.save')))));
  return root;
}

async function customForm(ctx, editId) {
  const existing = editId ? await ctx.db.get('customDefects', editId) : null;
  const fields = [
    { name: 'name', type: 'text', label: 'def.f.name', wide: true },
    { name: 'cat', type: 'select', label: 'def.f.cat', options: Object.keys(ctx.data.categories).map((c) => ({ value: c, label: L(ctx.data.categories[c]) })) },
    { name: 'symptoms', type: 'textarea', label: 'def.symptoms', wide: true, hint: 'def.f.oneLine' },
    { name: 'causes', type: 'textarea', label: 'def.causes', wide: true },
    { name: 'diagnostic', type: 'textarea', label: 'def.diagnostic', wide: true },
    { name: 'actions', type: 'textarea', label: 'def.actions', wide: true },
    { name: 'verify', type: 'textarea', label: 'def.verify', wide: true },
  ];
  const v = existing ? { ...existing, symptoms: (existing.symptoms || []).join('\n'), causes: (existing.causes || []).join('\n'), diagnostic: (existing.diagnostic || []).join('\n'), actions: (existing.actions || []).join('\n'), verify: (existing.verify || []).join('\n') } : {};
  const form = buildForm(fields, v);
  const fabrics = new Set(existing?.fabrics || []);
  const fabricRow = h('div', { class: 'pills' }, FABRIC_KEYS.map((f) => { const b = pill(fabricLabel(f), fabrics.has(f), () => { fabrics.has(f) ? fabrics.delete(f) : fabrics.add(f); b.classList.toggle('on'); b.setAttribute('aria-pressed', String(fabrics.has(f))); }); return b; }));
  const save = async () => {
    const r = form.read();
    if (!r.name.trim()) { form.errors({ name: 'err.required' }); return; }
    const rec = { id: existing?.id || uid('cd'), name: r.name.trim(), cat: r.cat, fabrics: [...fabrics], symptoms: toLines(r.symptoms), causes: toLines(r.causes), diagnostic: toLines(r.diagnostic), inspection: [], actions: toLines(r.actions), verify: toLines(r.verify), createdAt: existing?.createdAt || Date.now(), updatedAt: Date.now() };
    await ctx.db.put('customDefects', rec); toast(t('common.saved')); ctx.nav('#/defects/' + rec.id);
  };
  return h('div', null, pageHead(t('def.add'), '#/defects'), safetyNote(t('def.customSafety')), h('div', { class: 'card' }, form.el, h('div', { class: 'field' }, h('label', null, t('def.f.fabrics')), fabricRow), h('div', { class: 'row end' }, h('button', { class: 'btn primary', onClick: save }, t('common.save')))));
}
