# Knitting Operator Assistant V1

Offline-first helper for circular knitting machine operators. Bangla and English. Works as a PWA in the browser and as an Android APK (Capacitor). No account, server, paid API or internet is needed after installation.

> **Safety:** the app never asks anyone to touch moving parts. Defect causes are *possible* causes only. Always stop and isolate the machine per your factory SOP and follow the manufacturer's manual.

## Features
- **Fabric Defect Solver** – 15 bilingual defects (needle line, drop stitch, hole, oil mark, barré, lycra feeding, yarn breakage, crease, GSM, sinker mark, uneven stitch, spirality, thick-thin, fleece loops, dial/cylinder setting) with symptoms, *possible* causes, safe diagnostic/inspection steps, corrective actions, verification, related defects, bookmarks, recents, personal notes, a separate "confirmed cause" field and custom defects.
- **Machine setup** – component and fabric guides, machine profiles, maintenance history.
- **Maintenance** – editable checklists (pre-start, style change, cleaning, lubrication reminders, needle/sinker inspection), issue/downtime/inspection logs.
- **Calculators** – GSM, fabric weight, target vs actual, RPM/production *estimate*, yarn consumption, machine reference; formulas and steps shown; history with reuse/delete.
- **Shift Book** – records with explicit units, filters, daily/machine/downtime summaries (never mixing units), handover view, UTF-8 CSV export.
- **Learning Center**, **Dictionary**, **Machine Notebook**, global **Search** (Bangla + English + aliases), **Backup/Restore**.

## Quick start (Termux or any machine with Node 18+)
```bash
npm install          # creates package-lock.json - commit it
npm run validate     # static checks + tests + build + build verification
npm run dev          # http://127.0.0.1:8080  (serves src/)
npm run serve:dist   # serves the production build in dist/
```
The web app itself has **no runtime dependencies and no bundler**: `npm run build` copies `src/` to `dist/` and stamps the service worker with a content-hash cache version and precache list.

## Android APK (GitHub Actions)
1. Push the project to GitHub (see `BUILD_GUIDE_BN.md`).
2. Actions → **Build Android debug APK** → *Run workflow*.
3. Download the artifact `knitting-operator-assistant-debug-apk`, unzip, install `app-debug.apk`.

This is a **debug-signed APK, not a release build**. Release signing is not configured (no keys are stored in the repo).
Local build (needs JDK 17 + Android SDK): `npm run android:add && npm run android:build`.

## Data and storage
IndexedDB database `koa-db` (schema v1, see `docs/DATA_SCHEMA.md`); LocalStorage only for language/theme/unit preferences. **The web app and the Android app have separate storage and do not sync.** Move data with *Backup → Export* and *Restore*. Clearing browser/app data or uninstalling deletes data – back up first.

On Android the CSV/backup export uses the Capacitor Filesystem + Share plugins (share sheet); in browsers it downloads a file.

## Project layout
```
src/            index.html, sw.js, manifest, offline.html, icons/, css/
src/js/         app.js (shell+router), ui.js, i18n.js, search.js, shift.js, csv.js, platform.js
src/js/calc/    formulas.js (pure calculator functions)
src/js/db/      schema.js, idb.js, backup.js, userdata.js
src/js/views/   one module per screen
src/data/       bilingual JSON content (defects, guides, dictionary, lessons, quizzes, checklists, aliases, ui)
tests/          node:test suites + in-memory IndexedDB double
scripts/        build, check, serve, make-icons, android-prepare
tools/          Python generators for the JSON content (optional)
.github/workflows/  ci.yml, android-apk.yml
docs/           DATA_SCHEMA.md, MANUAL_TEST_GUIDE.md
```

## Production estimate formula (documented assumptions)
`yarn per revolution = feeders × needles × needle share × stitch length`  
`kg/h = yarn length per hour ÷ metres-per-gram × efficiency` (Ne: 1 Ne = 1.6933 m/g; tex: 1000/tex; denier: 9000/den).  
Assumes every counted needle knits at every feeder pass (no tuck/miss), excludes lycra/extra yarns, and is labelled an **estimate**. Fabric length per hour is only shown when courses per cm is entered.

## Verification status
See `docs/VERIFICATION.md` for exactly what was run (35 automated tests, static checks, production build, headless-Chromium workflow tests) and what was not (npm install, Capacitor/Gradle APK build, on-device checks).
