// Dependency-free build: copies src/ to dist/ and stamps the service worker
// with a content-based cache version and a precache file list.
import { readdirSync, statSync, mkdirSync, copyFileSync, readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join, relative, dirname, sep } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'src');
const dist = join(root, 'dist');

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

if (!existsSync(join(src, 'index.html'))) throw new Error('src/index.html is missing');
rmSync(dist, { recursive: true, force: true });
const files = walk(src).sort();
const hash = createHash('sha1');
const precache = [];
for (const f of files) {
  const rel = relative(src, f).split(sep).join('/');
  const out = join(dist, rel);
  mkdirSync(dirname(out), { recursive: true });
  copyFileSync(f, out);
  hash.update(rel).update(readFileSync(f));
  if (rel !== 'sw.js') precache.push(rel === 'index.html' ? './' : './' + rel);
  if (rel === 'index.html') precache.push('./index.html');
}
const version = `koa-${JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version}-${hash.digest('hex').slice(0, 10)}`;
const swPath = join(dist, 'sw.js');
let sw = readFileSync(swPath, 'utf8');
if (!sw.includes('__CACHE_VERSION__') || !sw.includes('__PRECACHE_JSON__')) throw new Error('sw.js placeholders missing');
sw = sw.replace('__CACHE_VERSION__', version).replace('__PRECACHE_JSON__', JSON.stringify(precache));
writeFileSync(swPath, sw);
console.log(`Build OK: ${files.length} files -> dist/ (cache ${version})`);
