import { setStrings, setLang, getLang, t } from './i18n.js';
import { h, clear, icon, toast, closeTopModal } from './ui.js';
import { prefs, isNative, setupNative, setStatusBar } from './platform.js';
import { openDb, StorageError } from './db/idb.js';
import { loadData } from './data.js';
import home from './views/home.js';
import * as defects from './views/defects.js';
import calculators from './views/calculators.js';
import * as shift from './views/shiftbook.js';
import * as more from './views/more.js';
import * as machines from './views/machines.js';
import maintenance from './views/maintenance.js';
import * as learn from './views/learn.js';
import dictionary from './views/dictionary.js';
import notebook from './views/notebook.js';
import backup from './views/backup.js';
import searchView from './views/search.js';

const nullDb = (() => {
  const fail = () => Promise.reject(new StorageError('Storage unavailable'));
  return { raw: null, get: async () => undefined, getAll: async () => [], count: async () => 0, put: fail, remove: fail, clear: fail, bulkWrite: fail, clearAllUserData: fail, close() {} };
})();

export const ctx = { db: nullDb, dbError: null, data: null, nav: (hash) => { location.hash = hash; }, refresh: () => route() };

const routes = [
  [/^\/$/, home, 'home'],
  [/^\/defects(?:\/([^/]+))?$/, defects.route, 'defects'],
  [/^\/calc(?:\/([^/]+))?$/, calculators, 'calc'],
  [/^\/shift(?:\/([^/]+))?(?:\/(edit))?$/, shift.route, 'shift'],
  [/^\/more$/, more.menu, 'more'],
  [/^\/settings$/, more.settings, 'more'],
  [/^\/about$/, more.about, 'more'],
  [/^\/machines(?:\/([^/]+))?$/, machines.route, 'more'],
  [/^\/guides(?:\/([^/]+))?$/, machines.guides, 'more'],
  [/^\/maintenance$/, maintenance, 'more'],
  [/^\/learn(?:\/(lesson|quiz))?(?:\/([^/]+))?$/, learn.route, 'more'],
  [/^\/dictionary$/, dictionary, 'more'],
  [/^\/notebook$/, notebook, 'more'],
  [/^\/backup$/, backup, 'more'],
  [/^\/search$/, searchView, 'home'],
];

function parseHash() {
  const raw = location.hash.replace(/^#/, '') || '/';
  const [path, qs = ''] = raw.split('?');
  return { path: path || '/', query: Object.fromEntries(new URLSearchParams(qs)) };
}

const NAV = [['home', '#/', 'nav.home', 'home'], ['defects', '#/defects', 'nav.defects', 'defect'], ['calc', '#/calc', 'nav.calc', 'calc'], ['shift', '#/shift', 'nav.shift', 'book'], ['more', '#/more', 'nav.more', 'more']];
let shell;

function buildShell() {
  const app = document.getElementById('app');
  clear(app);
  const langBtn = h('button', { class: 'tbtn', 'aria-label': t('set.language'), onClick: () => setLanguage(getLang() === 'bn' ? 'en' : 'bn') }, getLang() === 'bn' ? 'EN' : 'বাং');
  const themeBtn = h('button', { class: 'tbtn', 'aria-label': t('set.theme'), onClick: cycleTheme }, themeLabel());
  const searchBtn = h('a', { class: 'tbtn', href: '#/search', 'aria-label': t('common.search') }, icon('search', 20));
  const top = h('header', { class: 'top' }, h('div', { class: 'bar' }, h('a', { class: 'brand', href: '#/' }, t('app.name')), searchBtn, langBtn, themeBtn), h('div', { class: 'stitch' }));
  const nav = h('nav', { class: 'nav', 'aria-label': 'Primary' }, NAV.map(([id, href, key, ic]) => h('a', { href, 'data-nav': id }, icon(ic, 22), h('span', null, t(key)))));
  const view = h('main', { id: 'view', tabindex: '-1' });
  app.append(h('div', { class: 'app' }, top, nav, view));
  shell = { nav, view };
}

function themeLabel() { return { auto: '◐', light: '☀', dark: '☾' }[prefs.get('theme', 'auto')]; }
function applyTheme() {
  const mode = prefs.get('theme', 'auto');
  if (mode === 'auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', mode);
  const dark = mode === 'dark' || (mode === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  const meta = document.querySelector('meta[name=theme-color]'); if (meta) meta.content = dark ? '#0d1530' : '#1b2a52';
  setStatusBar(dark);
}
function cycleTheme() {
  const order = ['auto', 'light', 'dark'];
  prefs.set('theme', order[(order.indexOf(prefs.get('theme', 'auto')) + 1) % 3]);
  applyTheme(); buildShell(); route();
}
export function setLanguage(l) { prefs.set('lang', l); setLang(l); buildShell(); route(); }
ctx.setLanguage = setLanguage; ctx.applyTheme = applyTheme; ctx.themeLabel = themeLabel; ctx.rebuild = () => { buildShell(); route(); };

let routeToken = 0;
async function route() {
  const token = ++routeToken;
  const { path, query } = parseHash();
  const match = routes.map((r) => ({ r, m: path.match(r[0]) })).find((x) => x.m);
  const view = shell.view;
  const navId = match ? match.r[2] : 'home';
  shell.nav.querySelectorAll('a').forEach((a) => (a.dataset.nav === navId ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
  try {
    const node = match ? await match.r[1](ctx, match.m.slice(1), query) : h('div', { class: 'empty' }, t('err.notfound'));
    if (token !== routeToken) return;
    clear(view).append(node);
  } catch (e) {
    if (token !== routeToken) return;
    console.error(e);
    clear(view).append(h('div', { class: 'warnbox' }, h('strong', null, t('err.generic')), h('p', null, e instanceof StorageError ? t('err.storage') : String(e.message || e))));
  }
  window.scrollTo(0, 0);
}

function onBack() {
  if (closeTopModal()) return true;
  const { path } = parseHash();
  if (path !== '/') { if (history.length > 1) history.back(); else location.hash = '#/'; return true; }
  return false;
}

async function seed(db) {
  if (await db.get('meta', 'seeded:checklists')) return;
  for (const c of ctx.data.checklists) {
    await db.put('checklists', { id: c.id, title: c.title, items: c.items.map((it, i) => ({ id: `${c.id}-${i}`, en: it.en, bn: it.bn, safety: !!it.safety })) });
  }
  await db.put('meta', { key: 'seeded:checklists', at: Date.now() });
}

ctx.reseedIfEmpty = async () => {
  if ((await ctx.db.count('checklists')) === 0) { await ctx.db.remove('meta', 'seeded:checklists'); await seed(ctx.db); }
};

async function init() {
  setLang(prefs.get('lang', 'bn'));
  applyTheme();
  try {
    setStrings(await (await fetch('data/ui.json')).json());
    ctx.data = await loadData();
  } catch (e) {
    document.getElementById('app').textContent = 'Could not load app data: ' + e.message; return;
  }
  try { ctx.db = await openDb(); await seed(ctx.db); } catch (e) { ctx.dbError = e; ctx.db = nullDb; }
  buildShell();
  if (ctx.dbError) document.getElementById('view').before(h('div', { class: 'banner' }, t('err.storageBanner')));
  window.addEventListener('hashchange', route);
  window.addEventListener('unhandledrejection', (ev) => { ev.preventDefault(); toast(ev.reason instanceof StorageError ? t('err.storage') : t('err.generic')); });
  setupNative({ onBack, dark: document.documentElement.dataset.theme === 'dark' });
  await route();
  if ('serviceWorker' in navigator && !isNative() && location.protocol !== 'file:') {
    navigator.serviceWorker.register('./sw.js').then((reg) => {
      reg.addEventListener('updatefound', () => {
        const w = reg.installing;
        if (w) w.addEventListener('statechange', () => { if (w.state === 'installed' && navigator.serviceWorker.controller) toast(t('app.updateReady')); });
      });
    }).catch(() => { /* offline caching unavailable; app still works */ });
  }
}
init();
