// Tiny i18n: strings live in data/ui.json as {key:{en,bn}}.
let strings = {};
let lang = 'en';
export const setStrings = (s) => { strings = s; };
export const setLang = (l) => { lang = l === 'bn' ? 'bn' : 'en'; document.documentElement.lang = lang; };
export const getLang = () => lang;

export function t(key, params) {
  const e = strings[key];
  let s = e ? (e[lang] || e.en || key) : key;
  if (params) s = s.replace(/\{(\w+)\}/g, (m, k) => (params[k] !== undefined ? params[k] : m));
  return s;
}
/** Pick the current-language text from a {en,bn} object. */
export const L = (o) => (o == null ? '' : typeof o === 'string' ? o : o[lang] || o.en || '');

export function fmt(n, digits = 2) {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  return new Intl.NumberFormat(lang === 'bn' ? 'bn-BD' : 'en-US', { maximumFractionDigits: digits }).format(n);
}
