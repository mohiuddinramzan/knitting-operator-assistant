import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { buildIndex, search, expandQuery, tokenize, normalize } from '../src/js/search.js';

const docs = [
  { type: 'defect', id: 'needle-line', title: 'Needle Line / সুই লাইন', text: 'vertical line along the fabric length', route: '#/defects/needle-line' },
  { type: 'defect', id: 'hole', title: 'Hole / ছিদ্র', text: 'broken stitch opening', route: '#/defects/hole' },
  { type: 'dict', id: 'sinker', title: 'Sinker / সিঙ্কার', text: 'holds the loop down', route: '#/dictionary' },
  { type: 'note', id: 'n1', title: 'M-01 note', text: 'Replaced cam on M-01 yesterday', route: '#/notebook' },
];
const aliases = [['needle line', 'সুই লাইন', 'vertical line', 'লম্বা দাগ'], ['hole', 'ছিদ্র', 'ফুটো', 'broken stitch']];
const idx = buildIndex(docs);

test('tokenizer keeps Bangla combining marks together', () => {
  assert.deepEqual(tokenize('সুই লাইন, hole!'), ['সুই', 'লাইন', 'hole']);
  assert.equal(normalize('Hole'), 'hole');
});

test('English and Bangla queries find the same defect', () => {
  assert.equal(search(idx, 'needle line', aliases)[0].id, 'needle-line');
  assert.equal(search(idx, 'সুই লাইন', aliases)[0].id, 'needle-line');
});

test('aliases bridge terms not present in the document text', () => {
  assert.equal(search(idx, 'ফুটো', aliases)[0].id, 'hole');
  assert.equal(search(idx, 'লম্বা দাগ', aliases)[0].id, 'needle-line');
});

test('searches notes, empty and unmatched queries', () => {
  assert.equal(search(idx, 'cam', aliases)[0].id, 'n1');
  assert.deepEqual(search(idx, '   ', aliases), []);
  assert.deepEqual(search(idx, 'zzzz', aliases), []);
  assert.ok(expandQuery('ফুটো', aliases).includes('broken'));
});

test('shipped alias file (if present) is well-formed', () => {
  const p = new URL('../src/data/aliases.json', import.meta.url);
  if (!existsSync(p)) return;
  const groups = JSON.parse(readFileSync(p, 'utf8'));
  assert.ok(Array.isArray(groups) && groups.every((g) => Array.isArray(g) && g.length >= 2 && g.every((t) => typeof t === 'string')));
});
