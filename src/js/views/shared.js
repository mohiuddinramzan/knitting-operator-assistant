import { h, icon } from '../ui.js';
import { t, L } from '../i18n.js';

export function pageHead(title, back, actions) {
  return h('div', { class: 'row between' },
    h('div', { class: 'row' }, back ? h('a', { class: 'btn sm', href: back, 'aria-label': t('common.back') }, icon('back', 18)) : null, h('h1', { style: 'margin:0' }, title)),
    actions ? h('div', { class: 'row' }, actions) : null);
}
export const link = (href, text, cls = 'btn') => h('a', { class: cls, href }, text);
export const fabricLabel = (f) => t('fabric.' + f);
export const FABRIC_KEYS = ['single-jersey', 'rib', 'interlock', 'fleece'];
export const fabricOptions = (withOther = true) => [...FABRIC_KEYS, ...(withOther ? ['other'] : [])].map((f) => ({ value: f, label: fabricLabel(f) }));
export const nowIso = () => new Date().toISOString();
export { L };
