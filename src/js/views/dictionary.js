import { h, empty } from '../ui.js';
import { t, L } from '../i18n.js';
import { buildIndex, search } from '../search.js';
import { pageHead } from './shared.js';

export default async function dictionary(ctx, _p, query) {
  const words = ctx.data.dictionary;
  const idx = buildIndex(words.map((w) => ({ id: w.id, title: `${w.en} ${w.bn}`, text: `${w.def.en} ${w.def.bn} ${w.aliases || ''}` })));
  const input = h('input', { type: 'search', value: query.q || '', placeholder: t('dict.searchPh'), 'aria-label': t('common.search') });
  const out = h('div');
  const draw = () => {
    const ids = input.value.trim() ? new Set(search(idx, input.value, ctx.data.aliases, 100).map((d) => d.id)) : null;
    const rows = words.filter((w) => !ids || ids.has(w.id)).sort((a, b) => a.en.localeCompare(b.en));
    out.replaceChildren(rows.length ? h('div', { class: 'card' }, rows.map((w) => h('div', { class: 'item' }, h('div', { class: 'grow' }, h('strong', null, `${w.en} — ${w.bn}`), h('div', null, L(w.def)))))) : empty('search.none'));
  };
  input.addEventListener('input', draw); draw();
  return h('div', null, pageHead(t('home.dict'), '#/more'), h('div', { class: 'search' }, input), out);
}
