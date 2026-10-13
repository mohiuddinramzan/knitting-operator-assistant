// Calculator formulas. Pure functions, no DOM. All results: {ok:true,...} or {ok:false,errors:{field:key}}.
export const MASS_TO_G = { g: 1, kg: 1000 };
export const AREA_TO_M2 = { cm2: 0.0001, m2: 1 };
export const LENGTH_TO_M = { mm: 0.001, cm: 0.01, m: 1, in: 0.0254 };
// 1 Ne = 840 yd per lb  ->  metres of yarn per gram
export const NE_M_PER_G = (840 * 0.9144) / 453.59237;

const BN_DIGITS = '০১২৩৪৫৬৭৮৯';
/** Parse user text to a number. Accepts Bangla digits and decimal comma. Returns null if empty, NaN if invalid. */
export function parseNumber(v) {
  if (v === null || v === undefined) return null;
  if (typeof v === 'number') return Number.isFinite(v) ? v : NaN;
  let s = String(v).trim();
  if (s === '') return null;
  s = s.replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d))).replace(',', '.');
  if (!/^[+-]?(\d+\.?\d*|\.\d+)$/.test(s)) return NaN;
  return Number(s);
}

/** Validate a numeric field. opts: {positive:true} => > 0 ; else >= 0. Returns {value} or {error}. */
export function readNum(raw, { positive = false, optional = false } = {}) {
  const n = parseNumber(raw);
  if (n === null) return optional ? { value: null } : { error: 'err.required' };
  if (Number.isNaN(n)) return { error: 'err.invalid' };
  if (n < 0) return { error: 'err.negative' };
  if (positive && n === 0) return { error: 'err.zero' };
  return { value: n };
}

function collect(spec, input) {
  const values = {};
  const errors = {};
  for (const [name, opts] of Object.entries(spec)) {
    const r = readNum(input[name], opts);
    if (r.error) errors[name] = r.error; else values[name] = r.value;
  }
  return { values, errors, bad: Object.keys(errors).length > 0 };
}

function unitOf(table, unit, field, errors) {
  if (!Object.prototype.hasOwnProperty.call(table, unit)) errors[field] = 'err.unit';
  return table[unit];
}

/** GSM = mass(g) / area(m2) */
export function gsm(input) {
  const { values, errors, bad } = collect({ mass: { positive: true }, area: { positive: true } }, input);
  const mf = unitOf(MASS_TO_G, input.massUnit, 'massUnit', errors);
  const af = unitOf(AREA_TO_M2, input.areaUnit, 'areaUnit', errors);
  if (bad || Object.keys(errors).length) return { ok: false, errors };
  const massG = values.mass * mf;
  const areaM2 = values.area * af;
  return { ok: true, massG, areaM2, gsm: massG / areaM2 };
}

/** Fabric mass = GSM x length(m) x width(m) */
export function fabricWeight(input) {
  const { values, errors, bad } = collect({ gsm: { positive: true }, length: { positive: true }, width: { positive: true } }, input);
  const lf = unitOf(LENGTH_TO_M, input.lengthUnit, 'lengthUnit', errors);
  const wf = unitOf(LENGTH_TO_M, input.widthUnit, 'widthUnit', errors);
  if (bad || Object.keys(errors).length) return { ok: false, errors };
  const lengthM = values.length * lf;
  const widthM = values.width * wf;
  const areaM2 = lengthM * widthM;
  const massG = values.gsm * areaM2;
  return { ok: true, lengthM, widthM, areaM2, massG, massKg: massG / 1000 };
}

/** Target vs actual. Zero target => percentage is null (not computed). */
export function achievement(input) {
  const { values, errors, bad } = collect({ target: {}, actual: {} }, input);
  if (!input.unit || !String(input.unit).trim()) errors.unit = 'err.required';
  if (bad || errors.unit) return { ok: false, errors };
  const { target, actual } = values;
  return {
    ok: true,
    unit: String(input.unit).trim(),
    target,
    actual,
    zeroTarget: target === 0,
    percent: target === 0 ? null : (actual / target) * 100,
    difference: actual - target,
    remaining: Math.max(target - actual, 0),
    surplus: Math.max(actual - target, 0),
  };
}

/** Convert yarn count to metres per gram. */
export function metresPerGram(count, system) {
  if (system === 'Ne') return count * NE_M_PER_G;
  if (system === 'tex') return 1000 / count;
  if (system === 'den') return 9000 / count;
  return NaN;
}

/**
 * Theoretical yarn-based production estimate.
 * yarn length per revolution = feeders x needles x needleShare x stitchLength
 * Assumes every counted needle forms one loop at every feeder pass (no tuck/miss), lycra/other yarns excluded.
 */
export function estimateProduction(input) {
  const spec = {
    rpm: { positive: true }, feeders: { positive: true }, needles: { positive: true },
    stitchLength: { positive: true }, count: { positive: true },
    efficiency: { optional: true }, hours: { optional: true }, coursesPerCm: { optional: true, positive: true },
  };
  const { values, errors } = collect(spec, input);
  if (!['Ne', 'tex', 'den'].includes(input.countSystem)) errors.countSystem = 'err.unit';
  const share = input.needleShare === undefined || input.needleShare === '' ? 100 : parseNumber(input.needleShare);
  if (Number.isNaN(share) || share <= 0 || share > 100) errors.needleShare = 'err.range';
  const eff = values.efficiency === null || values.efficiency === undefined ? 100 : values.efficiency;
  if (eff > 100 || eff === 0) errors.efficiency = 'err.range';
  const hours = values.hours === null || values.hours === undefined ? 1 : values.hours;
  if (hours === 0) errors.hours = 'err.zero';
  if (Object.keys(errors).length) return { ok: false, errors };

  const e = eff / 100;
  const yarnPerRevM = (values.feeders * values.needles * (share / 100) * values.stitchLength) / 1000;
  const yarnMPerHour = yarnPerRevM * values.rpm * 60 * e;
  const gPerHour = yarnMPerHour / metresPerGram(values.count, input.countSystem);
  const kgPerHour = gPerHour / 1000;
  const feederPassesPerHour = values.rpm * 60 * values.feeders * e;
  const fabricMPerHour = values.coursesPerCm ? (values.rpm * 60 * values.feeders * e) / (values.coursesPerCm * 100) : null;
  return {
    ok: true, isEstimate: true, efficiency: eff, hours, needleShare: share,
    yarnPerRevM, yarnMPerHour, kgPerHour, kgForHours: kgPerHour * hours,
    fabricMPerHour, fabricMForHours: fabricMPerHour === null ? null : fabricMPerHour * hours,
    feederPassesPerHour,
  };
}

/** Yarn consumption comparison. basis must be chosen explicitly: 'measured' | 'theoretical'. */
export function yarnConsumption(input) {
  const { values, errors, bad } = collect({ fabricKg: { positive: true }, yarnKg: { positive: true } }, input);
  if (!['measured', 'theoretical'].includes(input.basis)) errors.basis = 'err.required';
  if (bad || errors.basis) return { ok: false, errors };
  const diff = values.yarnKg - values.fabricKg;
  return {
    ok: true, basis: input.basis, fabricKg: values.fabricKg, yarnKg: values.yarnKg,
    ratio: values.yarnKg / values.fabricKg,
    differenceKg: diff,
    differencePctOfFabric: (diff / values.fabricKg) * 100,
    differencePctOfYarn: (diff / values.yarnKg) * 100,
  };
}

/**
 * Machine reference. Only geometric relations are computed:
 *  approx needles = pi x diameter(in) x gauge (needles per inch)  [approximation; actual count is set by the maker]
 *  surface speed  = pi x diameter(m) x rpm
 *  needle-feeder positions per revolution = needles x feeders
 */
export function machineReference(input) {
  const { values, errors } = collect({
    diameter: { positive: true, optional: true }, gauge: { positive: true, optional: true },
    needles: { positive: true, optional: true }, feeders: { positive: true, optional: true },
    rpm: { positive: true, optional: true },
  }, input);
  if (Object.keys(errors).length) return { ok: false, errors };
  const v = values;
  const approxNeedles = v.diameter && v.gauge ? Math.PI * v.diameter * v.gauge : null;
  return {
    ok: true,
    approxNeedles,
    needleDeviationPct: approxNeedles && v.needles ? ((v.needles - approxNeedles) / approxNeedles) * 100 : null,
    surfaceSpeedMPerMin: v.diameter && v.rpm ? Math.PI * v.diameter * 0.0254 * v.rpm : null,
    positionsPerRev: v.needles && v.feeders ? v.needles * v.feeders : null,
    feederPassesPerHour: v.feeders && v.rpm ? v.feeders * v.rpm * 60 : null,
  };
}
