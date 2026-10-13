# Verification status (authoring environment)

Actually executed:
- `npm test` (node:test): 35 tests passed — formulas/unit conversion/validation, achievement, production estimate, shift validation/filter/summaries, CSV, search (Bangla/English/aliases), IndexedDB CRUD (in-memory double), backup validate/restore.
- `node scripts/check.mjs`: imports resolve, JSON valid, bilingual data complete, all i18n keys present, packaging files present.
- `node scripts/build.mjs` + `node scripts/check.mjs --dist`: production build and precache list verified.
- Headless Chromium (Playwright; `tools/browser_smoke_routes.py`, `tools/browser_e2e.py`): all 25 routes render without console errors; GSM calculation + zero-input error + history save; machine and shift CRUD; missing-unit validation; UTF-8 BOM CSV download; JSON backup export; invalid-file rejection; valid restore (replace); persistence after reload; Bangla search; service worker active and app usable offline; desktop sidebar layout.

NOT executed (needs your GitHub run / device):
- `npm install`/`npm ci` (no network in the authoring sandbox, so `package-lock.json` is not included — run `npm install` and commit it).
- Capacitor `cap add android`, Gradle `assembleDebug`, APK install, Android back button, status bar, share-sheet export.
- Dependency versions (`~6.x` Capacitor ranges) were not resolved against the registry.
