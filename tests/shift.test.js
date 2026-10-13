import test from 'node:test';
import assert from 'node:assert/strict';
import { validateShift, filterShifts, groupTotals, downtimeByReason, isValidDate, todayLocal, SHIFT_CSV_COLUMNS } from '../src/js/shift.js';
import { toCSV, withBom, csvCell } from '../src/js/csv.js';

const base = { date: '2026-10-12', shift: 'A', machineId: 'M-01', fabric: 'single-jersey', unit: 'kg', target: '200', actual: '180', downtimeMin: '20' };

test('valid record is normalised', () => {
  const r = validateShift(base);
  assert.ok(r.ok);
  assert.equal(r.record.target, 200); assert.equal(r.record.actual, 180); assert.equal(r.record.downtimeMin, 20);
});

test('production unit is mandatory and bounded; bad numbers rejected', () => {
  assert.equal(validateShift({ ...base, unit: '' }).errors.unit, 'err.required');
  assert.equal(validateShift({ ...base, unit: 'x'.repeat(13) }).errors.unit, 'err.range');
  assert.equal(validateShift({ ...base, actual: '' }).errors.actual, 'err.required');
  assert.equal(validateShift({ ...base, actual: '-5' }).errors.actual, 'err.negative');
  assert.equal(validateShift({ ...base, target: 'abc' }).errors.target, 'err.invalid');
  assert.equal(validateShift({ ...base, downtimeMin: '5000' }).errors.downtimeMin, 'err.range');
  assert.equal(validateShift({ ...base, machineId: ' ' }).errors.machineId, 'err.required');
});

test('dates are validated and never shifted', () => {
  assert.ok(isValidDate('2024-02-29')); assert.ok(!isValidDate('2026-02-29')); assert.ok(!isValidDate('2026-13-01')); assert.ok(!isValidDate('12/10/2026'));
  assert.equal(validateShift({ ...base, date: '2026-02-30' }).errors.date, 'err.date');
  assert.equal(validateShift({ ...base, date: '2026-10-12' }).record.date, '2026-10-12');
  assert.equal(todayLocal(new Date(2026, 0, 5, 23, 59)), '2026-01-05');
});

const list = [
  { id: '1', ...base, target: 200, actual: 180, downtimeMin: 20, downtimeReason: 'Needle change', operator: 'Rahim' },
  { id: '2', ...base, date: '2026-10-11', shift: 'B', machineId: 'M-02', fabric: 'rib', unit: 'kg', target: 100, actual: 110, downtimeMin: 0 },
  { id: '3', ...base, machineId: 'M-03', fabric: 'interlock', unit: 'm', target: 500, actual: 450, downtimeMin: 30, downtimeReason: 'Needle change' },
];

test('filters by date range, machine, shift, fabric and text', () => {
  assert.equal(filterShifts(list, { from: '2026-10-12' }).length, 2);
  assert.equal(filterShifts(list, { to: '2026-10-11' }).length, 1);
  assert.equal(filterShifts(list, { machineId: 'M-02' })[0].id, '2');
  assert.equal(filterShifts(list, { shift: 'B' }).length, 1);
  assert.equal(filterShifts(list, { fabric: 'interlock' }).length, 1);
  assert.equal(filterShifts(list, { q: 'rahim' }).length, 1);
  assert.equal(filterShifts(list, {}).length, 3);
});

test('totals never mix incompatible units', () => {
  const g = groupTotals(list, (s) => s.date).find((x) => x.key === '2026-10-12');
  assert.deepEqual(g.units, { kg: { target: 200, actual: 180 }, m: { target: 500, actual: 450 } });
  assert.equal(g.downtimeMin, 50);
  const byMachine = groupTotals(list, (s) => s.machineId);
  assert.equal(byMachine.length, 3);
});

test('downtime summary by reason', () => {
  assert.deepEqual(downtimeByReason(list), [{ reason: 'Needle change', minutes: 50 }]);
});

test('editing a record keeps id and applies changes', () => {
  const edited = validateShift({ ...list[0], actual: '190' });
  assert.ok(edited.ok); assert.equal(edited.record.id, '1'); assert.equal(edited.record.actual, 190);
});

test('CSV: BOM, quoting, Bangla, formula-injection guard', () => {
  const rows = [{ date: '2026-10-12', operator: 'রহিম, "জ্যেষ্ঠ"', style: '=SUM(A1)', target: 5 }];
  const cols = SHIFT_CSV_COLUMNS.filter((c) => ['date', 'operator', 'style', 'target'].includes(c.key));
  const csv = withBom(toCSV(rows, cols));
  assert.ok(csv.startsWith('\uFEFF'));
  assert.ok(csv.includes('"রহিম, ""জ্যেষ্ঠ"""'));
  assert.ok(csv.includes("'=SUM(A1)"));
  assert.equal(csvCell(-5), '-5'); assert.equal(csvCell(null), '');
  assert.ok(Buffer.from(csv, 'utf8').subarray(0, 3).equals(Buffer.from([0xef, 0xbb, 0xbf])));
});
