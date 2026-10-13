// Generates app icons (PNG) without dependencies. Used by `npm run icons` and scripts/android-prepare.mjs.
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const BG = [27, 42, 82];
const LIGHT = [223, 232, 255];
const ACCENT = [242, 183, 5];

const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc32 = (buf) => { let c = 0xffffffff; for (const b of buf) c = crcTable[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
export function encodePng(w, h, rgba) {
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) { raw[y * (w * 4 + 1)] = 0; rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4); }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

const segDist = (px, py, ax, ay, bx, by) => {
  const dx = bx - ax, dy = by - ay; const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
};

/** Renders the icon: indigo field with rows of knit "V" stitches, one safety-yellow row. opts.transparent leaves the background clear. */
export function renderIcon(size, { transparent = false, art = 1 } = {}) {
  const buf = Buffer.alloc(size * size * 4);
  const u = size / 512;
  const cell = 64 * u * art, half = 6 * u * art;
  const origin = (size - cell * 8) / 2;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    let col = BG, a = transparent ? 0 : 1;
    const gx = (x - origin) / cell, gy = (y - origin) / cell;
    const cx = Math.floor(gx), cy = Math.floor(gy);
    if (cx >= 0 && cx < 8 && cy >= 0 && cy < 8) {
      const ccx = (cx + 0.5 - 4) * cell, ccy = (cy + 0.5 - 4) * cell;
      if (Math.hypot(ccx, ccy) <= 175 * u * art) {
        const lx = (gx - cx) * cell, ly = (gy - cy) * cell;
        const d = Math.min(segDist(lx, ly, cell * 0.15, cell * 0.2, cell * 0.5, cell * 0.82), segDist(lx, ly, cell * 0.5, cell * 0.82, cell * 0.85, cell * 0.2));
        const cover = Math.max(0, Math.min(1, half - d + 0.5));
        if (cover > 0) {
          const c = cy === 4 ? ACCENT : LIGHT;
          if (transparent) { col = c; a = cover; } else { col = [0, 1, 2].map((i) => BG[i] + (c[i] - BG[i]) * cover); }
        }
      }
    }
    const o = (y * size + x) * 4; buf[o] = col[0]; buf[o + 1] = col[1]; buf[o + 2] = col[2]; buf[o + 3] = Math.round(a * 255);
  }
  return encodePng(size, size, buf);
}

if (process.argv[1] && process.argv[1].endsWith('make-icons.mjs')) {
  const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'icons');
  mkdirSync(out, { recursive: true });
  writeFileSync(join(out, 'icon-512.png'), renderIcon(512));
  writeFileSync(join(out, 'icon-192.png'), renderIcon(192));
  writeFileSync(join(out, 'icon-maskable-512.png'), renderIcon(512));
  console.log('Icons written to src/icons');
}
