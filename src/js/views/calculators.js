import { h, icon, buildForm, confirmDialog, toast, empty, safetyNote } from '../ui.js';
import { t, fmt } from '../i18n.js';
import * as F from '../calc/formulas.js';
import { uid } from '../db/idb.js';
import { pageHead } from './shared.js';

const U = { g: 'g', kg: 'kg', cm2: 'cm²', m2: 'm²', mm: 'mm', cm: 'cm', m: 'm', in: 'in' };
const opts = (keys) => keys.map((k) => ({ value: k, label: U[k] }));
const q = (name, unitName, label, units, def) => ({ name, type: 'quantity', label, unitName, units: opts(units), defaultUnit: def, wide: false });
const n = (name, label, hint) => ({ name, type: 'number', label, hint });

const SPECS = [
  { id: 'gsm', title: 'calc.gsm', fields: [q('mass', 'massUnit', 'calc.gsm.mass', ['g', 'kg'], 'g'), q('area', 'areaUnit', 'calc.gsm.area', ['cm2', 'm2'], 'cm2')],
    example: { mass: '1.8', massUnit: 'g', area: '100', areaUnit: 'cm2' }, compute: F.gsm, formula: 'calc.gsm.formula',
    view: (r, i) => ({ big: `${fmt(r.gsm)} GSM`, steps: [t('calc.gsm.s1', { v: fmt(+F.parseNumber(i.mass), 4), u: U[i.massUnit], g: fmt(r.massG, 4) }), t('calc.gsm.s2', { v: fmt(+F.parseNumber(i.area), 4), u: U[i.areaUnit], m: fmt(r.areaM2, 6) }), t('calc.gsm.s3', { g: fmt(r.massG, 4), m: fmt(r.areaM2, 6), r: fmt(r.gsm) })], notes: ['calc.gsm.note'] }),
    summary: (r) => `${fmt(r.gsm)} GSM` },
  { id: 'fabric', title: 'calc.fabric', fields: [n('gsm', 'calc.fabric.gsm'), q('length', 'lengthUnit', 'calc.fabric.length', ['m', 'cm', 'mm', 'in'], 'm'), q('width', 'widthUnit', 'calc.fabric.width', ['cm', 'm', 'mm', 'in'], 'cm')],
    example: { gsm: '180', length: '100', lengthUnit: 'm', width: '150', widthUnit: 'cm' }, compute: F.fabricWeight, formula: 'calc.fabric.formula',
    view: (r) => ({ big: `${fmt(r.massKg, 3)} kg`, steps: [t('calc.fabric.s1', { l: fmt(r.lengthM, 4), w: fmt(r.widthM, 4), a: fmt(r.areaM2, 4) }), t('calc.fabric.s2', { g: fmt(r.massG, 2), kg: fmt(r.massKg, 3) })], notes: ['calc.fabric.note'] }),
    summary: (r) => `${fmt(r.massKg, 3)} kg` },
  { id: 'target', title: 'calc.target', fields: [n('target', 'calc.target.target'), n('actual', 'calc.target.actual'), { name: 'unit', type: 'text', label: 'calc.target.unit', placeholder: 'kg', hint: 'calc.target.unitHint' }],
    example: { target: '200', actual: '165', unit: 'kg' }, compute: F.achievement, formula: 'calc.target.formula',
    view: (r) => ({ big: r.zeroTarget ? t('calc.target.zero') : `${fmt(r.percent)} %`, steps: [r.zeroTarget ? t('calc.target.zeroMsg') : t('calc.target.s1', { a: fmt(r.actual), t: fmt(r.target), p: fmt(r.percent) }), t('calc.target.s2', { d: fmt(r.difference), u: r.unit }), t('calc.target.s3', { r: fmt(r.remaining), u: r.unit }), r.surplus > 0 ? t('calc.target.s4', { s: fmt(r.surplus), u: r.unit }) : null].filter(Boolean), notes: [] }),
    summary: (r) => (r.zeroTarget ? `${fmt(r.actual)} ${r.unit} / 0` : `${fmt(r.percent)} % (${fmt(r.actual)}/${fmt(r.target)} ${r.unit})`) },
  { id: 'production', title: 'calc.prod', fields: [n('rpm', 'calc.prod.rpm'), n('feeders', 'calc.prod.feeders'), n('needles', 'calc.prod.needles', 'calc.prod.needlesHint'), n('stitchLength', 'calc.prod.sl', 'calc.prod.slHint'), n('count', 'calc.prod.count'),
      { name: 'countSystem', type: 'select', label: 'calc.prod.system', options: [{ value: 'Ne', label: 'Ne (English cotton)' }, { value: 'tex', label: 'tex' }, { value: 'den', label: 'denier' }] },
      { name: 'needleShare', type: 'number', label: 'calc.prod.share', hint: 'calc.prod.shareHint', default: '100' },
      { name: 'efficiency', type: 'number', label: 'calc.prod.eff', hint: 'calc.prod.effHint' }, { name: 'hours', type: 'number', label: 'calc.prod.hours', hint: 'calc.prod.hoursHint' },
      { name: 'coursesPerCm', type: 'number', label: 'calc.prod.cpc', hint: 'calc.prod.cpcHint' }],
    example: { rpm: '25', feeders: '90', needles: '2260', stitchLength: '2.8', count: '30', countSystem: 'Ne', needleShare: '100', efficiency: '85', hours: '8', coursesPerCm: '' }, compute: F.estimateProduction, formula: 'calc.prod.formula',
    view: (r) => ({ big: `≈ ${fmt(r.kgPerHour, 2)} kg/h`, badge: 'calc.estimate', steps: [t('calc.prod.s1', { m: fmt(r.yarnPerRevM, 3) }), t('calc.prod.s2', { m: fmt(r.yarnMPerHour, 1), e: fmt(r.efficiency) }), t('calc.prod.s3', { kg: fmt(r.kgPerHour, 3), h: fmt(r.hours), t: fmt(r.kgForHours, 2) }), r.fabricMPerHour === null ? t('calc.prod.noLen') : t('calc.prod.s4', { m: fmt(r.fabricMPerHour, 2), t: fmt(r.fabricMForHours, 1) })], notes: ['calc.prod.assume1', 'calc.prod.assume2', 'calc.prod.assume3'] }),
    summary: (r) => `≈ ${fmt(r.kgPerHour, 2)} kg/h (${t('calc.estimate')})` },
  { id: 'yarn', title: 'calc.yarn', fields: [n('fabricKg', 'calc.yarn.fabric'), n('yarnKg', 'calc.yarn.yarn'), { name: 'basis', type: 'select', label: 'calc.yarn.basis', hint: 'calc.yarn.basisHint', options: [{ value: '', label: '—' }, { value: 'measured', key: 'calc.yarn.measured' }, { value: 'theoretical', key: 'calc.yarn.theoretical' }] }],
    example: { fabricKg: '100', yarnKg: '103.5', basis: 'measured' }, compute: F.yarnConsumption, formula: 'calc.yarn.formula',
    view: (r) => ({ big: `${fmt(r.ratio, 3)} : 1`, badge: r.basis === 'measured' ? 'calc.yarn.measured' : 'calc.yarn.theoretical', steps: [t('calc.yarn.s1', { y: fmt(r.yarnKg, 3), f: fmt(r.fabricKg, 3), r: fmt(r.ratio, 4) }), t('calc.yarn.s2', { d: fmt(r.differenceKg, 3), pf: fmt(r.differencePctOfFabric), py: fmt(r.differencePctOfYarn) })], notes: ['calc.yarn.note'] }),
    summary: (r) => `${fmt(r.ratio, 3)} : 1 (${t(r.basis === 'measured' ? 'calc.yarn.measured' : 'calc.yarn.theoretical')})` },
  { id: 'machine', title: 'calc.mach', fields: [n('diameter', 'calc.mach.dia'), n('gauge', 'calc.mach.gauge'), n('needles', 'calc.mach.needles'), n('feeders', 'calc.mach.feeders'), n('rpm', 'calc.mach.rpm')],
    example: { diameter: '30', gauge: '24', needles: '2260', feeders: '90', rpm: '25' }, compute: F.machineReference, formula: 'calc.mach.formula',
    view: (r) => ({ big: r.approxNeedles === null ? '—' : `≈ ${fmt(r.approxNeedles, 0)} ${t('calc.mach.needlesUnit')}`, badge: 'calc.estimate', steps: [r.approxNeedles === null ? null : t('calc.mach.s1', { n: fmt(r.approxNeedles, 1) }), r.needleDeviationPct === null ? null : t('calc.mach.s2', { p: fmt(r.needleDeviationPct, 2) }), r.surfaceSpeedMPerMin === null ? null : t('calc.mach.s3', { v: fmt(r.surfaceSpeedMPerMin, 2) }), r.positionsPerRev === null ? null : t('calc.mach.s4', { v: fmt(r.positionsPerRev, 0) }), r.feederPassesPerHour === null ? null : t('calc.mach.s5', { v: fmt(r.feederPassesPerHour, 0) })].filter(Boolean), notes: ['calc.mach.note'] }),
    summary: (r, i) => `Ø${i.diameter || '–'} / ${i.gauge || '–'}G` },
];

export default async function calculators(ctx, [id]) {
  if (!id) {
    return h('div', null, pageHead(t('nav.calc'), null), h('div', { class: 'grid' }, SPECS.map((s) => h('a', { class: 'tile', href: '#/calc/' + s.id }, icon('calc', 26), t(s.title)))), safetyNote(t('calc.disclaimer')));
  }
  const spec = SPECS.find((s) => s.id === id);
  if (!spec) return empty('err.notfound');
  const form = buildForm(spec.fields, {});
  const out = h('div');
  const hist = h('div');
  let last = null;

  const calc = () => {
    const inputs = form.read();
    const r = spec.compute(inputs);
    form.errors(r.ok ? {} : r.errors);
    last = null;
    if (!r.ok) { out.replaceChildren(); return; }
    last = { r, inputs };
    const v = spec.view(r, inputs);
    out.replaceChildren(h('div', { class: 'res', role: 'status' },
      v.badge ? h('span', { class: 'tag custom' }, t(v.badge)) : null,
      h('div', { class: 'big' }, v.big),
      h('div', { class: 'steps' }, h('strong', null, t('calc.steps')), h('ul', { class: 'bul' }, v.steps.map((s) => h('li', null, s)))),
      v.notes.length ? h('ul', { class: 'bul meta' }, v.notes.map((k) => h('li', null, t(k)))) : null,
      h('div', { class: 'row' }, h('button', { class: 'btn', onClick: save }, icon('check', 18), t('calc.save')))));
  };
  const save = async () => {
    if (!last) return;
    await ctx.db.put('calcs', { id: uid('calc'), calc: spec.id, inputs: last.inputs, summary: spec.summary(last.r, last.inputs), createdAt: Date.now() });
    toast(t('common.saved')); renderHist();
  };
  const renderHist = async () => {
    const rows = (await ctx.db.getAll('calcs')).filter((c) => c.calc === spec.id).sort((a, b) => b.createdAt - a.createdAt).slice(0, 30);
    hist.replaceChildren(h('h2', null, t('calc.history')), rows.length ? h('div', { class: 'card' }, rows.map((c) => h('div', { class: 'item' },
      h('div', { class: 'grow' }, h('strong', null, c.summary), h('div', { class: 'meta' }, new Date(c.createdAt).toLocaleString())),
      h('button', { class: 'btn sm', onClick: () => { form.set(c.inputs); calc(); window.scrollTo(0, 0); } }, t('calc.reuse')),
      h('button', { class: 'btn sm', 'aria-label': t('common.delete'), onClick: async () => { if (await confirmDialog({ title: t('calc.deleteTitle'), message: t('common.cannotUndo'), danger: true, confirmLabel: t('common.delete') })) { await ctx.db.remove('calcs', c.id); renderHist(); } } }, icon('trash', 18))))) : empty('calc.noHistory'));
  };
  const reset = () => { const blank = {}; spec.fields.forEach((f) => { blank[f.name] = f.default ?? ''; }); form.set(blank); form.errors({}); out.replaceChildren(); last = null; };
  const root = h('div', null, pageHead(t(spec.title), '#/calc'),
    h('div', { class: 'card' }, h('p', null, h('strong', null, t('calc.formula') + ': '), t(spec.formula)), form.el,
      h('div', { class: 'row' }, h('button', { class: 'btn primary', onClick: calc }, t('calc.calculate')), h('button', { class: 'btn', onClick: () => { form.set(spec.example); calc(); } }, t('calc.example')), h('button', { class: 'btn', onClick: reset }, t('calc.reset'))), out),
    hist);
  await renderHist();
  return root;
}
