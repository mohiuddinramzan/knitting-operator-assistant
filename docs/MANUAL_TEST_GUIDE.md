# Manual test guide

Mark each item only after you have actually done it.

## Web / PWA
1. `npm run build && npm run serve:dist`, open http://127.0.0.1:8080 in Chrome, wait for the home screen.
2. **Airplane mode:** turn on airplane mode, reload. The app must still open; open Defects, Calculator, Shift Book, Dictionary.
3. **Install:** Chrome menu → Install app / Add to Home screen; launch it from the icon.
4. **Persistence:** add a machine, a shift record, a note. Close the browser fully, reopen: data still present.
5. **Backup/restore:** More → Backup → export. Add one extra record. Restore the file with *Replace*: the extra record disappears. Try restoring a random .json file: a clear error appears and nothing changes. Try *Merge*.
6. **CSV:** Shift Book → Export CSV. Open in a spreadsheet; Bangla text must display correctly.
7. **Clear all data:** needs the checkbox; afterwards every list is empty. The default maintenance checklists are re-created automatically.
8. **Responsive:** phone width (bottom nav), tablet, desktop ≥ 900 px (left sidebar). No horizontal page scroll; tables scroll inside their card.
9. **Errors:** enter empty/zero/negative/letters in each calculator; clear messages appear. Save a shift without a unit: blocked.
10. **Languages/themes:** switch বাং/EN and the theme button; text stays readable.

## Android APK
1. Install `app-debug.apk` (allow installs from this source).
2. Open in airplane mode; check all five bottom tabs.
3. Back button: moves back through screens, closes dialogs, exits only from Home.
4. Status bar is indigo with light icons.
5. Export backup/CSV: the share sheet appears; save to Files/Drive, or send it to yourself. Restore via *Choose backup file*.
6. Remember: APK storage is separate from the browser/PWA storage.
