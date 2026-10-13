// Browser/Capacitor platform helpers. Everything degrades gracefully in a normal browser.
export const isNative = () => !!(window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform());
const plugin = (name) => {
  const c = window.Capacitor;
  if (!c) return null;
  return (c.Plugins && c.Plugins[name]) || (typeof c.registerPlugin === 'function' ? c.registerPlugin(name) : null);
};

export const prefs = {
  get(key, fallback) { try { const v = localStorage.getItem('koa.' + key); return v === null ? fallback : JSON.parse(v); } catch { return fallback; } },
  set(key, value) { try { localStorage.setItem('koa.' + key, JSON.stringify(value)); } catch { /* storage unavailable */ } },
};

/** Save or share a text file. Returns 'saved' | 'shared' | 'copied' | 'failed'. */
export async function saveTextFile(filename, text, mime = 'text/plain') {
  const FS = isNative() ? plugin('Filesystem') : null;
  const Share = isNative() ? plugin('Share') : null;
  if (FS && Share) {
    try {
      const res = await FS.writeFile({ path: filename, data: text, directory: 'CACHE', encoding: 'utf8' });
      await Share.share({ title: filename, url: res.uri, dialogTitle: filename });
      return 'shared';
    } catch (e) { if (e && /cancel/i.test(String(e.message || e))) return 'failed'; }
  }
  try {
    const blob = new Blob([text], { type: mime + ';charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    return 'saved';
  } catch { /* fall through */ }
  try { await navigator.clipboard.writeText(text); return 'copied'; } catch { return 'failed'; }
}

/** Android back button + status bar. Safe no-op elsewhere. */
export function setupNative({ onBack, dark }) {
  if (!isNative()) return;
  const App = plugin('App');
  if (App && App.addListener) App.addListener('backButton', () => { if (!onBack()) App.exitApp && App.exitApp(); });
  setStatusBar(dark);
}
export function setStatusBar(dark) {
  if (!isNative()) return;
  const SB = plugin('StatusBar');
  if (!SB) return;
  try {
    SB.setStyle && SB.setStyle({ style: 'DARK' }); // light icons on the indigo bar
    SB.setBackgroundColor && SB.setBackgroundColor({ color: dark ? '#0d1530' : '#1b2a52' });
  } catch { /* ignore */ }
}
