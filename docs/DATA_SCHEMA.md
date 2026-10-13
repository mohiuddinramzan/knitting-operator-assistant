# Data schema (IndexedDB `koa-db`, version 1)

Object stores and key paths (see `src/js/db/schema.js`):

| Store | Key | Contents |
|---|---|---|
| machines | id | name (machine ID), fabric, diameter, gauge, needles, feeders, notes |
| shifts | id | date (YYYY-MM-DD, stored as typed), shift, operator, machineId, fabric, style, target, actual, unit, downtimeMin, downtimeReason, defects, action, handover |
| maintenance | id | type (checklist/issue/downtime/inspection/lubrication), machineId, date, title, note, minutes, count, position, checklist run data |
| customDefects | id | user-created defect entries |
| defectNotes | defectId | personal note + confirmed cause per defect |
| calcs | id | calc, inputs, summary, createdAt |
| progress | key | `lesson:<id>` / `quiz:<id>` progress |
| bookmarks | key | `<type>:<id>` |
| recents | key | recently viewed items |
| checklists | id | editable checklist templates (seeded on first run) |
| notes | id | machine notebook entries |
| meta | key | internal flags (seed marker, last backup time); not backed up |

## Upgrades
`MIGRATIONS[n](db, tx)` in `schema.js` runs for every version between the stored and current version. Add a new numbered step for each schema change; never edit earlier steps.

## Backup file
```json
{ "app": "knitting-operator-assistant", "schemaVersion": 1, "exportedAt": "ISO time", "counts": {}, "data": { "<store>": [ ... ] } }
```
Restore validates: app id, integer schemaVersion (rejects newer versions), known stores only, arrays of objects with unique string keys. Replace/merge writes are one atomic transaction, so a failed restore leaves existing data unchanged.
