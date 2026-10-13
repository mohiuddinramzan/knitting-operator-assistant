// Run after `cap add android` / `cap sync`: installs the app icon and brand colour into the Android project.
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderIcon } from './make-icons.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const res = join(root, 'android', 'app', 'src', 'main', 'res');
if (!existsSync(res)) { console.error('android/ project not found. Run: npm run android:add'); process.exit(1); }
const legacy = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };
for (const [d, px] of Object.entries(legacy)) {
  const dir = join(res, `mipmap-${d}`);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'ic_launcher.png'), renderIcon(px));
  writeFileSync(join(dir, 'ic_launcher_round.png'), renderIcon(px));
  writeFileSync(join(dir, 'ic_launcher_foreground.png'), renderIcon(Math.round((px * 108) / 48), { transparent: true, art: 0.66 }));
}
mkdirSync(join(res, 'values'), { recursive: true });
writeFileSync(join(res, 'values', 'ic_launcher_background.xml'), '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#1B2A52</color>\n</resources>\n');
console.log('Android icons and colours installed.');
