import { h, icon, pill, toast, safetyNote } from '../ui.js';
import { t } from '../i18n.js';
import { prefs, isNative } from '../platform.js';
import { DEFAULT_UNITS } from '../shift.js';
import { pageHead } from './shared.js';
import { getLang } from '../i18n.js';

const ITEMS = [['#/machines', 'machine', 'home.setup'], ['#/maintenance', 'wrench', 'home.maint'], ['#/learn', 'learn', 'home.learn'], ['#/dictionary', 'dict', 'home.dict'], ['#/notebook', 'note', 'home.notebook'], ['#/backup', 'backup', 'home.backup'], ['#/settings', 'settings', 'more.settings'], ['#/about', 'warn', 'more.about']];

export async function menu() {
  return h('div', null, h('h1', null, t('nav.more')), h('div', { class: 'card' }, ITEMS.map(([href, ic, key]) => h('div', { class: 'item' }, icon(ic, 22), h('a', { class: 'grow', href }, t(key))))));
}

export async function settings(ctx) {
  const unitsInput = h('input', { value: prefs.get('units', DEFAULT_UNITS).join(', '), 'aria-label': t('set.units') });
  const mode = prefs.get('theme', 'auto');
  return h('div', null, pageHead(t('more.settings'), '#/more'),
    h('div', { class: 'card' }, h('h3', null, t('set.language')), h('div', { class: 'pills' }, pill('বাংলা', getLang() === 'bn', () => ctx.setLanguage('bn')), pill('English', getLang() === 'en', () => ctx.setLanguage('en')))),
    h('div', { class: 'card' }, h('h3', null, t('set.theme')), h('div', { class: 'pills' }, ['auto', 'light', 'dark'].map((m) => pill(t('set.theme.' + m), mode === m, () => { prefs.set('theme', m); ctx.applyTheme(); ctx.rebuild(); })))),
    h('div', { class: 'card' }, h('h3', null, t('set.units')), h('p', { class: 'meta' }, t('set.unitsHint')), unitsInput,
      h('div', { class: 'row end' }, h('button', { class: 'btn primary', onClick: () => { const list = [...new Set(unitsInput.value.split(',').map((x) => x.trim()).filter((x) => x && x.length <= 12))]; if (!list.length) { toast(t('err.required')); return; } prefs.set('units', list); toast(t('common.saved')); } }, t('common.save')))));
}

export async function about() {
  return h('div', null, pageHead(t('more.about'), '#/more'), safetyNote(t('about.safety')),
    h('div', { class: 'card' }, h('h3', null, t('app.name') + ' 1.0.0'), h('p', null, t('about.offline')), h('p', null, t('about.storage')), h('p', null, t('about.platform', { p: isNative() ? 'Android app' : 'Web/PWA' })), h('p', { class: 'meta' }, t('about.disclaimer'))));
}
