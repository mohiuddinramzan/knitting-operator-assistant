// Bookmarks, recently viewed items and learning progress on top of the db wrapper.
const MAX_RECENTS = 10;

export async function toggleBookmark(db, type, id) {
  const key = `${type}:${id}`;
  if (await db.get('bookmarks', key)) { await db.remove('bookmarks', key); return false; }
  await db.put('bookmarks', { key, type, id, at: Date.now() });
  return true;
}
export const isBookmarked = async (db, type, id) => !!(await db.get('bookmarks', `${type}:${id}`));
export async function getBookmarks(db, type) {
  return (await db.getAll('bookmarks')).filter((b) => !type || b.type === type).sort((a, b) => b.at - a.at);
}
export async function addRecent(db, type, id) {
  await db.put('recents', { key: `${type}:${id}`, type, id, at: Date.now() });
  const all = (await db.getAll('recents')).filter((r) => r.type === type).sort((a, b) => b.at - a.at);
  for (const old of all.slice(MAX_RECENTS)) await db.remove('recents', old.key);
}
export async function getRecents(db, type, limit = 6) {
  return (await db.getAll('recents')).filter((r) => r.type === type).sort((a, b) => b.at - a.at).slice(0, limit);
}
export const getProgress = async (db) => Object.fromEntries((await db.getAll('progress')).map((p) => [p.key, p]));
export const setProgress = (db, key, patch) => db.put('progress', { key, at: Date.now(), ...patch });
