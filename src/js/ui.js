// DOM helpers, icons, toast, modal, form builder. Never uses innerHTML with user data.
import { t, L } from './i18n.js';
import { parseNumber } from './calc/formulas.js';

export function h(tag, props, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'value') el.value = v;
    else if (k === 'checked' || k === 'selected' || k === 'disabled') el[k] = !!v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  append(el, kids);
  return el;
}
export function append(el, kids) {
  for (const k of kids.flat(Infinity)) {
    if (k === null || k === undefined || k === false) continue;
    el.append(k instanceof Node ? k : document.createTextNode(String(k)));
  }
  return el;
}
export const clear = (el) => { while (el.firstChild) el.removeChild(el.firstChild); return el; };

const ICONS = {
  home: 'M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10',
  defect: 'M12 3l10 18H2L12 3zM12 10v5M12 18v.5',
  calc: 'M5 3h14v18H5zM8 7h8M8 12h2M12 12h2M8 16h2M12 16h2M16 12v4',
  book: 'M4 4h12a3 3 0 013 3v13H7a3 3 0 01-3-3V4zM8 9h7M8 13h7',
  more: 'M5 12h.01M12 12h.01M19 12h.01',
  search: 'M11 4a7 7 0 100 14 7 7 0 000-14zM21 21l-5-5',
  wrench: 'M14 6a4 4 0 005 5l-9 9a2.5 2.5 0 01-4-4l9-9a4 4 0 00-1-1z',
  learn: 'M2 9l10-5 10 5-10 5-10-5zM6 11v5c3 2 9 2 12 0v-5',
  dict: 'M5 3h12a2 2 0 012 2v16H7a2 2 0 01-2-2V3zM9 8h6M9 12h6',
  note: 'M5 3h14v18H5zM9 8h6M9 12h6M9 16h3',
  backup: 'M12 3v12M7 10l5 5 5-5M4 20h16',
  check: 'M4 12l5 5L20 6',
  star: 'M12 3l2.8 5.9 6.2.8-4.6 4.3 1.2 6.2L12 17.2 6.4 20.2l1.2-6.2L3 9.7l6.2-.8L12 3z',
  plus: 'M12 5v14M5 12h14',
  trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
  edit: 'M4 20h4L19 9l-4-4L4 16v4z',
  back: 'M15 5l-7 7 7 7',
  settings: 'M12 9a3 3 0 100 6 3 3 0 000-6zM19 12l2-1-1-3-2 .5-1.5-1.5.5-2-3-1-1 2h-2l-1-2-3 1 .5 2L6.5 8 4.5 7.5l-1 3 2 1v2l-2 1 1 3 2-.5L8 18.5l-.5 2 3 1 1-2h2l1 2 3-1-.5-2 1.5-1.5 2 .5 1-3-2-1v-2z',
  warn: 'M12 3l10 18H2L12 3zM12 10v5M12 18v.5',
  download: 'M12 3v12M7 10l5 5 5-5M4 20h16',
  upload: 'M12 15V3M7 8l5-5 5 5M4 20h16',
  machine: 'M3 8h18v10H3zM7 8V5h10v3M7 13h2M11 13h2M15 13h2',
};
export function icon(name, size = 22) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('width', size); svg.setAttribute('height', size);
  svg.setAttribute('fill', 'none'); svg.setAttribute('stroke', 'currentColor'); svg.setAttribute('stroke-width', '1.8');
  svg.setAttribute('stroke-linecap', 'round'); svg.setAttribute('stroke-linejoin', 'round'); svg.setAttribute('aria-hidden', 'true');
  const p = document.createElementNS(ns, 'path'); p.setAttribute('d', ICONS[name] || ICONS.more); svg.appendChild(p);
  return svg;
}

let toastTimer;
export function toast(msg) {
  let el = document.getElementById('toast');
  if (!el) { el = h('div', { id: 'toast', role: 'status', 'aria-live': 'polite' }); document.body.append(el); }
  el.textContent = msg; el.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

// ---- modal stack (also used by the Android back button) ----
const modals = [];
export const closeTopModal = () => { const m = modals.pop(); if (!m) return false; m.close(false); return true; };
function openModal(build) {
  return new Promise((resolve) => {
    const overlay = h('div', { class: 'overlay', role: 'dialog', 'aria-modal': 'true' });
    const entry = { close: (v) => { overlay.remove(); const i = modals.indexOf(entry); if (i >= 0) modals.splice(i, 1); resolve(v); } };
    modals.push(entry);
    overlay.append(build(entry.close));
    overlay.addEventListener('click', (e) => { if (e.target === overlay) entry.close(false); });
    document.body.append(overlay);
    const f = overlay.querySelector('button.primary, button.danger'); if (f) f.focus();
  });
}
/** Confirm dialog. opts: {title, message, confirmLabel, danger, checkLabel} -> Promise<boolean> */
export function confirmDialog(opts) {
  return openModal((close) => {
    const box = opts.checkLabel ? h('input', { type: 'checkbox', id: 'cd-check' }) : null;
    const ok = h('button', { class: opts.danger ? 'btn danger' : 'btn primary', onClick: () => close(true) }, opts.confirmLabel || t('common.confirm'));
    if (box) { ok.disabled = true; box.addEventListener('change', () => { ok.disabled = !box.checked; }); }
    return h('div', { class: 'modal' },
      h('h2', null, opts.title), h('p', null, opts.message),
      box ? h('label', { class: 'check' }, box, ' ', opts.checkLabel) : null,
      h('div', { class: 'row end' }, h('button', { class: 'btn', onClick: () => close(false) }, t('common.cancel')), ok));
  });
}
/** Show arbitrary content in a modal. */
export function showModal(title, content) {
  return openModal((close) => h('div', { class: 'modal' }, h('h2', null, title), content, h('div', { class: 'row end' }, h('button', { class: 'btn primary', onClick: () => close(true) }, t('common.close')))));
}

// ---- form builder ----
/** fields: [{name, type:text|number|date|select|textarea|quantity|check, label(key), options:[{value,label}], hint(key), units, unitName, list, placeholder}] */
export function buildForm(fields, values = {}) {
  const refs = {};
  const rows = fields.map((f) => {
    const id = 'f-' + f.name + '-' + Math.random().toString(36).slice(2, 6);
    let input;
    const val = values[f.name] ?? f.default ?? '';
    if (f.type === 'select') {
      input = h('select', { id }, f.options.map((o) => h('option', { value: o.value, selected: String(o.value) === String(val) }, o.key ? t(o.key) : o.label)));
    } else if (f.type === 'textarea') {
      input = h('textarea', { id, rows: f.rows || 3 }); input.value = val;
    } else if (f.type === 'check') {
      input = h('input', { id, type: 'checkbox', checked: !!val });
    } else {
      input = h('input', { id, type: f.type === 'date' ? 'date' : 'text', inputmode: f.type === 'number' || f.type === 'quantity' ? 'decimal' : null, autocomplete: 'off', list: f.list || null, placeholder: f.placeholder || null });
      input.value = val;
    }
    refs[f.name] = input;
    let unitSel = null;
    if (f.type === 'quantity') {
      unitSel = h('select', { 'aria-label': t('common.unit') }, f.units.map((u) => h('option', { value: u.value, selected: String(u.value) === String(values[f.unitName] ?? f.defaultUnit ?? f.units[0].value) }, u.label)));
      refs[f.unitName] = unitSel;
    }
    const err = h('div', { class: 'err', id: id + '-e', role: 'alert' });
    refs['__err_' + f.name] = err;
    input.setAttribute('aria-describedby', id + '-e');
    const lab = h('label', { for: id }, t(f.label));
    if (f.type === 'check') return h('div', { class: 'field' }, h('div', { class: 'check' }, input, lab), err);
    return h('div', { class: 'field' + (f.wide ? ' wide' : '') }, lab, unitSel ? h('div', { class: 'qty' }, input, unitSel) : input, f.hint ? h('div', { class: 'hint' }, t(f.hint)) : null, err);
  });
  const el = h('div', { class: 'form' }, rows);
  return {
    el,
    read() {
      const out = {};
      for (const f of fields) {
        const i = refs[f.name];
        out[f.name] = f.type === 'check' ? i.checked : i.value;
        if (f.type === 'quantity') out[f.unitName] = refs[f.unitName].value;
      }
      return out;
    },
    set(vals) {
      for (const f of fields) {
        if (vals[f.name] === undefined) continue;
        const i = refs[f.name];
        if (f.type === 'check') i.checked = !!vals[f.name]; else i.value = vals[f.name];
        if (f.type === 'quantity' && vals[f.unitName] !== undefined) refs[f.unitName].value = vals[f.unitName];
      }
    },
    errors(errs = {}) {
      for (const f of fields) {
        const e = refs['__err_' + f.name];
        const key = errs[f.name] || (f.unitName && errs[f.unitName]);
        e.textContent = key ? t(key) : '';
        refs[f.name].classList.toggle('invalid', !!key);
      }
      const first = fields.find((f) => errs[f.name] || (f.unitName && errs[f.unitName]));
      if (first) refs[first.name].focus();
    },
  };
}

export const field = (labelText, node) => h('div', { class: 'field' }, h('label', null, labelText), node);
export const pill = (text, active, onClick) => h('button', { class: 'pill' + (active ? ' on' : ''), type: 'button', 'aria-pressed': active ? 'true' : 'false', onClick }, text);
export const empty = (msgKey, actionNode) => h('div', { class: 'empty' }, h('p', null, t(msgKey)), actionNode || null);
export const safetyNote = (text) => h('div', { class: 'safety', role: 'note' }, icon('warn', 20), h('div', null, h('strong', null, t('safety.label')), ' ', text));
export { L };
export const numOrNull = (v) => { const n = parseNumber(v); return n === null || Number.isNaN(n) ? null : n; };
