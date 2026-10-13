import test from 'node:test';
import assert from 'node:assert/strict';
import * as F from '../src/js/calc/formulas.js';

const near = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} !~ ${b}`);

test('parseNumber handles empty, Bangla digits, comma and junk', () => {
  assert.equal(F.parseNumber(''), null);
  assert.equal(F.parseNumber('  '), null);
  assert.equal(F.parseNumber('১২৩.৫'), 123.5);
  assert.equal(F.parseNumber('2,5'), 2.5);
  assert.ok(Number.isNaN(F.parseNumber('abc')));
  assert.ok(Number.isNaN(F.parseNumber('1e5')));
  assert.ok(Number.isNaN(F.parseNumber('1.2.3')));
});

test('GSM: g and cm2 (classic 100 cm2 cutter)', () => {
  const r = F.gsm({ mass: 1.5, massUnit: 'g', area: 100, areaUnit: 'cm2' });
  assert.ok(r.ok);
  near(r.areaM2, 0.01);
  near(r.gsm, 150);
});

test('GSM: kg and m2 conversions', () => {
  const r = F.gsm({ mass: 0.0015, massUnit: 'kg', area: 0.01, areaUnit: 'm2' });
  near(r.massG, 1.5);
  near(r.gsm, 150);
});

test('GSM: zero, negative, missing and invalid inputs are rejected', () => {
  assert.equal(F.gsm({ mass: 1, massUnit: 'g', area: 0, areaUnit: 'cm2' }).errors.area, 'err.zero');
  assert.equal(F.gsm({ mass: -1, massUnit: 'g', area: 1, areaUnit: 'cm2' }).errors.mass, 'err.negative');
  assert.equal(F.gsm({ mass: '', massUnit: 'g', area: 1, areaUnit: 'cm2' }).errors.mass, 'err.required');
  assert.equal(F.gsm({ mass: 'x', massUnit: 'g', area: 1, areaUnit: 'cm2' }).errors.mass, 'err.invalid');
  assert.equal(F.gsm({ mass: 1, massUnit: 'lb', area: 1, areaUnit: 'cm2' }).errors.massUnit, 'err.unit');
});

test('Fabric weight from GSM and dimensions with explicit units', () => {
  const r = F.fabricWeight({ gsm: 180, length: 100, lengthUnit: 'm', width: 150, widthUnit: 'cm' });
  assert.ok(r.ok);
  near(r.areaM2, 150);
  near(r.massKg, 27);
  const inch = F.fabricWeight({ gsm: 100, length: 39.37007874, lengthUnit: 'in', width: 1, widthUnit: 'm' });
  near(inch.areaM2, 1, 1e-6);
  assert.equal(F.fabricWeight({ gsm: 0, length: 1, lengthUnit: 'm', width: 1, widthUnit: 'm' }).errors.gsm, 'err.zero');
});

test('Achievement: normal, over-target, zero target', () => {
  let r = F.achievement({ target: 200, actual: 150, unit: 'kg' });
  near(r.percent, 75); near(r.difference, -50); near(r.remaining, 50); near(r.surplus, 0);
  r = F.achievement({ target: 200, actual: 230, unit: 'kg' });
  near(r.percent, 115); near(r.remaining, 0); near(r.surplus, 30);
  r = F.achievement({ target: 0, actual: 10, unit: 'kg' });
  assert.ok(r.ok); assert.equal(r.percent, null); assert.equal(r.zeroTarget, true);
  assert.equal(F.achievement({ target: 10, actual: 5, unit: ' ' }).errors.unit, 'err.required');
  assert.equal(F.achievement({ target: -1, actual: 5, unit: 'kg' }).errors.target, 'err.negative');
});

test('Production estimate: Ne count, documented formula', () => {
  // 30 feeders x 2000 needles x 3.0 mm = 180 m of yarn per revolution
  const r = F.estimateProduction({ rpm: 25, feeders: 30, needles: 2000, stitchLength: 3, count: 30, countSystem: 'Ne', efficiency: 85 });
  assert.ok(r.ok && r.isEstimate);
  near(r.yarnPerRevM, 180);
  near(r.yarnMPerHour, 180 * 25 * 60 * 0.85);
  const mPerG = 30 * F.NE_M_PER_G;
  near(r.kgPerHour, (180 * 25 * 60 * 0.85) / mPerG / 1000, 1e-9);
  assert.equal(r.fabricMPerHour, null);
});

test('Production estimate: tex/den equivalence, needle share, courses/cm, hours', () => {
  const base = { rpm: 20, feeders: 24, needles: 1000, stitchLength: 2.8, efficiency: 100 };
  const tex = F.estimateProduction({ ...base, count: 20, countSystem: 'tex' });
  const den = F.estimateProduction({ ...base, count: 180, countSystem: 'den' });
  near(tex.kgPerHour, den.kgPerHour, 1e-9);
  const half = F.estimateProduction({ ...base, count: 20, countSystem: 'tex', needleShare: 50 });
  near(half.kgPerHour, tex.kgPerHour / 2, 1e-9);
  const f = F.estimateProduction({ ...base, count: 20, countSystem: 'tex', coursesPerCm: 15, hours: 8 });
  near(f.fabricMPerHour, (20 * 60 * 24) / (15 * 100));
  near(f.kgForHours, f.kgPerHour * 8);
});

test('Production estimate refuses missing/invalid parameters', () => {
  const r = F.estimateProduction({ rpm: 25, feeders: 30, needles: '', stitchLength: 3, count: 30, countSystem: 'Ne' });
  assert.equal(r.ok, false); assert.equal(r.errors.needles, 'err.required');
  assert.equal(F.estimateProduction({ rpm: 25, feeders: 30, needles: 10, stitchLength: 3, count: 30, countSystem: 'Ne', efficiency: 120 }).errors.efficiency, 'err.range');
  assert.equal(F.estimateProduction({ rpm: 25, feeders: 30, needles: 10, stitchLength: 3, count: 30, countSystem: 'x' }).errors.countSystem, 'err.unit');
});

test('Yarn consumption requires explicit basis and computes ratio/difference', () => {
  assert.equal(F.yarnConsumption({ fabricKg: 100, yarnKg: 103 }).errors.basis, 'err.required');
  const r = F.yarnConsumption({ fabricKg: 100, yarnKg: 103, basis: 'measured' });
  near(r.ratio, 1.03); near(r.differenceKg, 3); near(r.differencePctOfFabric, 3);
  assert.equal(r.basis, 'measured');
  assert.equal(F.yarnConsumption({ fabricKg: 0, yarnKg: 1, basis: 'measured' }).errors.fabricKg, 'err.zero');
});

test('Machine reference uses geometric relations only', () => {
  const r = F.machineReference({ diameter: 30, gauge: 24, needles: 2260, feeders: 90, rpm: 20 });
  near(r.approxNeedles, Math.PI * 30 * 24);
  assert.ok(Math.abs(r.needleDeviationPct) < 1);
  near(r.surfaceSpeedMPerMin, Math.PI * 30 * 0.0254 * 20);
  near(r.positionsPerRev, 2260 * 90);
  near(r.feederPassesPerHour, 90 * 20 * 60);
  const empty = F.machineReference({});
  assert.equal(empty.approxNeedles, null); assert.equal(empty.surfaceSpeedMPerMin, null);
  assert.equal(F.machineReference({ diameter: -1 }).errors.diameter, 'err.negative');
});
