// Static project checks: imports resolve, JSON valid, i18n keys complete, build output sane.
import { readdirSync, statSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const problems = [];
let jsFiles = [];
const bad = (m) => problems.push(m);
const walk = (d) => (existsSync(d) ? readdirSync(d).flatMap((n) => { const p = join(d, n); return statSync(p).isDirectory() ? (n === 'node_modules' ? [] : walk(p)) : [p]; }) : []);

if (process.argv.includes('--dist')) {
  const dist = join(root, 'dist');
  for (const f of ['index.html', 'sw.js', 'manifest.webmanifest', 'offline.html', 'js/app.js', 'data/ui.json']) if (!existsSync(join(dist, f))) bad(`dist/${f} missing`);
  if (existsSync(join(dist, 'sw.js'))) {
    const sw = readFileSync(join(dist, 'sw.js'), 'utf8');
    if (sw.includes("'__CACHE_VERSION__';") || sw.includes("'__PRECACHE_JSON__'")) bad('sw.js placeholders not stamped');
    const m = sw.match(/JSON\.parse\('(\[.*?\])'\)/);
    if (!m) bad('sw.js precache list not found'); else for (const p of JSON.parse(m[1])) { const rel = p === './' ? 'index.html' : p.slice(2); if (!existsSync(join(dist, rel))) bad(`precache entry missing in dist: ${p}`); }
  }
  finish();
}

// 1. imports resolve
jsFiles = [...walk(join(root, 'src/js')), ...walk(join(root, 'tests')), ...walk(join(root, 'scripts'))].filter((f) => ['.js', '.mjs'].includes(extname(f)));
for (const f of jsFiles) {
  const src = readFileSync(f, 'utf8');
  for (const m of src.matchAll(/(?:from\s+|import\s*\(\s*|import\s+)['"](\.{1,2}\/[^'"]+)['"]/g)) {
    if (!existsSync(resolve(dirname(f), m[1]))) bad(`${f.replace(root + '/', '')}: cannot resolve ${m[1]}`);
  }
}
// 2. JSON validity
for (const f of [...walk(join(root, 'src/data')), join(root, 'src/manifest.webmanifest'), join(root, 'capacitor.config.json'), join(root, 'package.json')]) {
  try { JSON.parse(readFileSync(f, 'utf8')); } catch (e) { bad(`invalid JSON ${f.replace(root + '/', '')}: ${e.message}`); }
}
// 3. bilingual data completeness
const data = (n) => JSON.parse(readFileSync(join(root, 'src/data', n), 'utf8'));
for (const d of data('defects.json').defects) for (const k of ['symptoms', 'causes', 'diagnostic', 'inspection', 'actions', 'verify']) if (!d[k].en.length || d[k].en.length !== d[k].bn.length) bad(`defect ${d.id}.${k} not bilingual`);
for (const q of data('quizzes.json')) if (q.options.en.length !== q.options.bn.length || q.answer >= q.options.en.length) bad(`quiz ${q.id} invalid`);
// 4. i18n keys
const ui = data('ui.json');
for (const [k, v] of Object.entries(ui)) if (!v.en || !v.bn) bad(`ui.json key without both languages: ${k}`);
const NS = 'app|nav|home|def|calc|shift|mach|maint|learn|dict|notes|backup|set|err|common|fabric|safety|search|more|about';
const used = new Set();
for (const f of walk(join(root, 'src/js'))) {
  const src = readFileSync(f, 'utf8');
  for (const m of src.matchAll(new RegExp(`['"\`]((?:${NS})(?:\\.[A-Za-z0-9_-]+)+)['"\`]`, 'g'))) used.add(m[1]);
}
const dyn = { 'fabric.': ['single-jersey', 'rib', 'interlock', 'fleece', 'other'], 'search.type.': ['defect', 'guide', 'dict', 'lesson', 'note', 'machine'], 'backup.result.': ['saved', 'shared', 'copied', 'failed'], 'maint.type.': ['issue', 'downtime', 'inspection', 'lubrication', 'checklist'], 'mach.kind.': ['component', 'fabric'], 'set.theme.': ['auto', 'light', 'dark'], 'shift.f.': ['machineId', 'shift', 'fabric', 'from', 'to', 'q'] };
for (const [p, list] of Object.entries(dyn)) list.forEach((s) => used.add(p + s));
for (const k of used) if (!ui[k]) bad(`missing i18n key: ${k}`);
// 5. packaging config
const cap = JSON.parse(readFileSync(join(root, 'capacitor.config.json'), 'utf8'));
if (cap.webDir !== 'dist') bad('capacitor webDir must be dist');
for (const f of ['.github/workflows/ci.yml', '.github/workflows/android-apk.yml', 'README.md', 'BUILD_GUIDE_BN.md', 'src/icons/icon-512.png', 'src/icons/icon-192.png']) if (!existsSync(join(root, f))) bad(`missing file: ${f}`);
finish();

function finish() {
  if (problems.length) { console.error('Check FAILED:\n - ' + problems.join('\n - ')); process.exit(1); }
  console.log(`Check OK (${jsFiles.length || 'dist'} files)`);
  process.exit(0);
}
