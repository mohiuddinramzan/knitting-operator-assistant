// Offline search with Bangla/English support and alias groups.
export function normalize(s) {
  return String(s || '').normalize('NFC').toLowerCase().replace(/[\u200c\u200d]/g, '');
}
export function tokenize(s) {
  return normalize(s).split(/[^\p{L}\p{M}\p{N}]+/u).filter(Boolean);
}

/** docs: [{type,id,title,text,route}] -> index */
export function buildIndex(docs) {
  return docs.map((d) => ({ ...d, _title: normalize(d.title), _text: normalize(d.text) }));
}

/** aliasGroups: [[term, term, ...], ...] — all terms in a group are equivalent. */
export function expandQuery(query, aliasGroups = []) {
  const q = normalize(query).trim();
  const terms = new Set(tokenize(q));
  if (!q) return [];
  for (const group of aliasGroups) {
    const g = group.map(normalize);
    const hit = g.some((term) => q.includes(term) || terms.has(term));
    if (hit) g.forEach((term) => tokenize(term).forEach((tk) => terms.add(tk)));
  }
  return [...terms];
}

export function search(index, query, aliasGroups = [], limit = 40) {
  const q = normalize(query).trim();
  if (!q) return [];
  const terms = expandQuery(q, aliasGroups);
  const direct = tokenize(q);
  const scored = [];
  for (const d of index) {
    let score = 0;
    if (d._title.includes(q)) score += 20;
    for (const t of terms) {
      const w = direct.includes(t) ? 1 : 0.6; // alias hits count slightly less
      if (d._title.includes(t)) score += 6 * w;
      if (d._text.includes(t)) score += 2 * w;
    }
    if (score > 0) scored.push({ doc: d, score });
  }
  scored.sort((a, b) => b.score - a.score || a.doc.title.localeCompare(b.doc.title));
  return scored.slice(0, limit).map((s) => s.doc);
}
