import { h, icon, empty } from '../ui.js';
import { t } from '../i18n.js';
import { search } from '../search.js';
import { buildSearchDocs } from '../data.js';
import { pageHead } from './shared.js';

export default async function searchView(ctx, _p, query) {
  const index = await buildSearchDocs(ctx);
  const input = h('input', { type: 'search', value: query.q || '', placeholder: t('home.searchPh'), 'aria-label': t('common.search') });
  const results = h('div');
  const run = () => {
    const found = search(index, input.value, ctx.data.aliases);
    results.replaceChildren(...(!input.value.trim() ? [] : found.length ? [h('div', { class: 'card' }, found.map((d) => h('div', { class: 'item' }, h('div', { class: 'grow' }, h('a', { href: d.route }, d.title.trim() || '—'), h('div', null, h('span', { class: 'tag' }, t('search.type.' + d.type)))))))] : [empty('search.none')]));
  };
  input.addEventListener('input', run);
  const root = h('div', null, pageHead(t('common.search'), '#/'), h('div', { class: 'search' }, input), results);
  run();
  setTimeout(() => input.focus(), 50);
  return root;
}
