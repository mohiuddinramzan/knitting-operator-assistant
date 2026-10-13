// Loads bundled JSON content and merges user-created defects.
import { buildIndex } from './search.js';
import { L } from './i18n.js';

const FILES = ['defects', 'guides', 'dictionary', 'lessons', 'quizzes', 'checklists', 'aliases'];

async function getJson(path) {
  const r = await fetch(path);
  if (!r.ok) throw new Error(`Failed to load ${path}`);
  return r.json();
}

export async function loadData() {
  const out = {};
  await Promise.all(FILES.map(async (f) => { out[f] = await getJson(`data/${f}.json`); }));
  out.categories = out.defects.categories;
  out.defects = out.defects.defects;
  return out;
}

const lines = (s) => String(s || '').split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
export const toLines = lines;

/** Convert a user-created defect record to the same shape as bundled ones. */
export function normalizeCustom(c) {
  const both = (txt) => { const a = Array.isArray(txt) ? txt : lines(txt); return { en: a, bn: a }; };
  return {
    id: c.id, custom: true, raw: c, cat: c.cat || 'appearance',
    name: { en: c.name, bn: c.name }, fabrics: c.fabrics || [], related: [],
    symptoms: both(c.symptoms), causes: both(c.causes), diagnostic: both(c.diagnostic),
    inspection: both(c.inspection), actions: both(c.actions), verify: both(c.verify), safety: null,
  };
}

export async function allDefects(ctx) {
  const custom = (await ctx.db.getAll('customDefects')).map(normalizeCustom);
  return [...ctx.data.defects, ...custom];
}

/** Build the global search index (async because it reads user data). */
export async function buildSearchDocs(ctx) {
  const docs = [];
  const j = (o) => `${o.en} ${o.bn}`;
  const jl = (o) => `${(o.en || []).join(' ')} ${(o.bn || []).join(' ')}`;
  for (const d of await allDefects(ctx)) {
    docs.push({ type: 'defect', id: d.id, title: j(d.name), text: [jl(d.symptoms), jl(d.causes), jl(d.actions)].join(' '), route: `#/defects/${d.id}` });
  }
  for (const g of ctx.data.guides) docs.push({ type: 'guide', id: g.id, title: j(g.title), text: j(g.body && { en: g.body.en.join(' '), bn: g.body.bn.join(' ') }), route: `#/guides/${g.id}` });
  for (const w of ctx.data.dictionary) docs.push({ type: 'dict', id: w.id, title: `${w.en} ${w.bn}`, text: `${j(w.def)} ${w.aliases || ''}`, route: `#/dictionary?q=${encodeURIComponent(w.en)}` });
  for (const l of ctx.data.lessons) docs.push({ type: 'lesson', id: l.id, title: j(l.title), text: `${l.body.en.join(' ')} ${l.body.bn.join(' ')}`, route: `#/learn/lesson/${l.id}` });
  for (const n of await ctx.db.getAll('notes')) docs.push({ type: 'note', id: n.id, title: `${n.machineId || ''}`, text: n.text, route: '#/notebook' });
  for (const m of await ctx.db.getAll('machines')) docs.push({ type: 'machine', id: m.id, title: m.name, text: `${m.notes || ''} ${m.fabric || ''}`, route: `#/machines/${m.id}` });
  for (const n of await ctx.db.getAll('defectNotes')) docs.push({ type: 'note', id: 'dn-' + n.defectId, title: n.defectId, text: `${n.text || ''} ${n.confirmedCause || ''}`, route: `#/defects/${n.defectId}` });
  return buildIndex(docs);
}
export { L };
