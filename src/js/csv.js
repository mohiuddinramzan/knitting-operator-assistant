// CSV helpers. Output is UTF-8 with BOM so Excel/Sheets read Bangla correctly.
const RISKY = /^[=+\-@\t\r]/;

export function csvCell(v) {
  if (v === null || v === undefined) return '';
  let s = String(v);
  if (RISKY.test(s) && !/^-?\d+(\.\d+)?$/.test(s)) s = "'" + s; // spreadsheet formula-injection guard
  return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

export function toCSV(rows, columns) {
  const head = columns.map((c) => csvCell(c.label)).join(',');
  const body = rows.map((r) => columns.map((c) => csvCell(r[c.key])).join(','));
  return [head, ...body].join('\r\n') + '\r\n';
}

export const BOM = '\uFEFF';
export const withBom = (csv) => BOM + csv;
