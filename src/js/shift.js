// Shift record validation, filtering and unit-safe summaries. Pure functions.
import { parseNumber } from './calc/formulas.js';

export const DEFAULT_UNITS = ['kg', 'm', 'pcs', 'roll'];
export const FABRICS = ['single-jersey', 'rib', 'interlock', 'fleece', 'other'];

export function isValidDate(s) {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [y, m, d] = s.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

/** Local calendar date as YYYY-MM-DD (no UTC shifting). */
export function todayLocal(now = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;
}

/** Validate and normalise a shift record. Returns {ok, errors, record}. */
export function validateShift(input) {
  const errors = {};
  const r = { ...input };
  if (!isValidDate(r.date)) errors.date = 'err.date';
  if (!String(r.shift || '').trim()) errors.shift = 'err.required';
  if (!String(r.machineId || '').trim()) errors.machineId = 'err.required';
  if (!FABRICS.includes(r.fabric)) errors.fabric = 'err.required';
  const unit = String(r.unit || '').trim();
  if (!unit) errors.unit = 'err.required';
  else if (unit.length > 12) errors.unit = 'err.range';
  const num = (key, required) => {
    const n = parseNumber(r[key]);
    if (n === null) { if (required) errors[key] = 'err.required'; return required ? undefined : 0; }
    if (Number.isNaN(n)) { errors[key] = 'err.invalid'; return undefined; }
    if (n < 0) { errors[key] = 'err.negative'; return undefined; }
    return n;
  };
  const target = num('target', false);
  const actual = num('actual', true);
  const downtimeMin = num('downtimeMin', false);
  if (downtimeMin !== undefined && downtimeMin > 1440) errors.downtimeMin = 'err.range';
  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true, errors,
    record: {
      ...r, date: r.date, shift: String(r.shift).trim(), machineId: String(r.machineId).trim(), unit,
      operator: String(r.operator || '').trim(), style: String(r.style || '').trim(),
      target, actual, downtimeMin,
    },
  };
}

export function filterShifts(list, f = {}) {
  const q = (f.q || '').trim().toLowerCase();
  return list.filter((s) => {
    if (f.from && s.date < f.from) return false;
    if (f.to && s.date > f.to) return false;
    if (f.machineId && s.machineId !== f.machineId) return false;
    if (f.shift && s.shift !== f.shift) return false;
    if (f.fabric && s.fabric !== f.fabric) return false;
    if (q) {
      const hay = [s.operator, s.machineId, s.style, s.defects, s.action, s.handover, s.downtimeReason].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  }).sort((a, b) => (a.date === b.date ? String(b.createdAt || '').localeCompare(String(a.createdAt || '')) : b.date.localeCompare(a.date)));
}

/** Group records by keyFn; totals are kept per production unit and never mixed. */
export function groupTotals(list, keyFn) {
  const map = new Map();
  for (const s of list) {
    const key = keyFn(s);
    if (!map.has(key)) map.set(key, { key, units: {}, downtimeMin: 0, records: 0 });
    const g = map.get(key);
    const u = (g.units[s.unit] ||= { target: 0, actual: 0 });
    u.target += s.target || 0;
    u.actual += s.actual || 0;
    g.downtimeMin += s.downtimeMin || 0;
    g.records += 1;
  }
  return [...map.values()].sort((a, b) => String(b.key).localeCompare(String(a.key)));
}

export function downtimeByReason(list) {
  const map = new Map();
  for (const s of list) {
    if (!(s.downtimeMin > 0)) continue;
    const k = (s.downtimeReason || '').trim() || '—';
    map.set(k, (map.get(k) || 0) + s.downtimeMin);
  }
  return [...map.entries()].map(([reason, minutes]) => ({ reason, minutes })).sort((a, b) => b.minutes - a.minutes);
}

export const SHIFT_CSV_COLUMNS = [
  ['date', 'Date'], ['shift', 'Shift'], ['operator', 'Operator'], ['machineId', 'Machine ID'], ['fabric', 'Fabric type'],
  ['style', 'Style/Order'], ['target', 'Target'], ['actual', 'Actual'], ['unit', 'Unit'], ['downtimeMin', 'Downtime (min)'],
  ['downtimeReason', 'Downtime reason'], ['defects', 'Defect observations'], ['action', 'Corrective action'], ['handover', 'Handover notes'],
].map(([key, label]) => ({ key, label }));
