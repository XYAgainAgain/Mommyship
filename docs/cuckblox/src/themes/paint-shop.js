// The Color Zones editor ("paint shop"): a native dialog with one main and one accent color per zone, like the
// D.A.V.E. Paint Jobs. Colors are picked in the terminal's own picker, never the OS one.
import { ZONES, RED_6, STOCK_PAINTS, hexToRgb, rgbToHex } from './themes.js';
import { TEXT, spoken } from '../text.js';

const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

/** Hex to hue (0–360), saturation, and value (0–1). */
export function hexToHsv(hex) {
  const [r, g, b] = hexToRgb(hex).map((c) => c / 255);
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  let h = 0;
  if (d) h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: (h * 60 + 360) % 360, s: max ? d / max : 0, v: max };
}

export function hsvToHex({ h, s, v }) {
  const f = (n) => {
    const k = (n + h / 60) % 6;
    return (v - v * s * clamp(Math.min(k, 4 - k))) * 255;
  };
  return rgbToHex([f(5), f(3), f(1)]);
}

function el(tag, props = {}, ...children) {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...children);
  return node;
}

/** Drags a pointer across `area`, reporting x and y as 0–1 fractions of its box. */
function track(area, onMove) {
  const move = (e) => {
    const r = area.getBoundingClientRect();
    onMove(clamp((e.clientX - r.left) / r.width), clamp((e.clientY - r.top) / r.height));
  };
  area.addEventListener('pointerdown', (e) => {
    area.setPointerCapture(e.pointerId);
    area.focus({ preventScroll: true });
    move(e);
  });
  area.addEventListener('pointermove', (e) => { if (area.hasPointerCapture(e.pointerId)) move(e); });
}

/** Changes show live. Finished asks onFinish (which may answer with a promise) to pay for the job and stays open when
 *  it can't; Cancel and Escape put everything back. quote(colors) returns { cr, text, balance } for the running price. */
export function openPaintShop({ initial, quote, onChange, onFinish, onCancel, onClose }) {
  const colors = { ...initial };
  const swatches = {};
  let editing = null;
  let hsv = { h: 0, s: 0, v: 0 };

  const cost = el('p', { className: 'price' });
  cost.setAttribute('aria-live', 'polite');
  const balance = el('p', { className: 'price' });
  // The price is announced when it changes, which only happens when the count of new colors does, not every drag frame
  const showPrice = () => {
    const q = quote(colors);
    if (cost.textContent !== q.text) cost.textContent = q.text;
    if (balance.textContent !== q.balance) balance.textContent = q.balance;
  };
  const notice = el('p', { className: 'price' });
  notice.setAttribute('role', 'status');

  // Every change lands here; the game redraws at most once per frame however fast a drag reports
  let pending = 0;
  function setColor(key, hex, { fromPicker = false } = {}) {
    let next = hex.toLowerCase();
    if (next === '#ff0000') {
      next = RED_6;
      notice.textContent = TEXT.paint.trademark;
    }
    colors[key] = next;
    swatches[key].style.setProperty('--paint', next);
    swatches[key].setAttribute('aria-label', `${spoken(swatches[key].dataset.label)}, ${next}`);
    showPrice();
    if (!fromPicker || next !== hsvToHex(hsv)) hsv = hexToHsv(next);
    if (key === editing) syncPicker();
    pending ||= requestAnimationFrame(() => {
      pending = 0;
      onChange({ ...colors });
    });
  }

  // The picker: one panel that moves under whichever color is being edited
  const pad = el('div', { className: 'pick-pad', tabIndex: 0 });
  const padThumb = el('span', { className: 'pick-thumb' });
  pad.append(padThumb);
  pad.setAttribute('role', 'slider');
  pad.setAttribute('aria-label', spoken(TEXT.paint.shade));
  pad.setAttribute('aria-valuemin', '0');
  pad.setAttribute('aria-valuemax', '100');
  const hueBar = el('div', { className: 'pick-hue', tabIndex: 0 });
  const hueThumb = el('span', { className: 'pick-thumb' });
  hueBar.append(hueThumb);
  hueBar.setAttribute('role', 'slider');
  hueBar.setAttribute('aria-label', spoken(TEXT.paint.hue));
  hueBar.setAttribute('aria-valuemin', '0');
  hueBar.setAttribute('aria-valuemax', '359');
  const hex = el('input', { type: 'text', className: 'pick-hex', maxLength: 7, spellcheck: false, autocomplete: 'off' });
  hex.setAttribute('aria-label', TEXT.paint.hex);
  const stock = el('div', { className: 'pick-stock' });
  for (const [name, color] of STOCK_PAINTS) {
    const chip = el('button', { type: 'button', className: 'pick-chip', title: name });
    chip.style.setProperty('--paint', color);
    chip.setAttribute('aria-label', spoken(name));
    chip.addEventListener('click', () => setColor(editing, color));
    stock.append(chip);
  }
  const panel = el(
    'div',
    { className: 'picker', hidden: true },
    pad,
    hueBar,
    el('label', { className: 'pick-hex-row' }, el('span', { textContent: TEXT.paint.hex }), hex),
    el('p', { className: 'pick-stock-label', textContent: TEXT.paint.stock }),
    stock,
  );

  function syncPicker() {
    panel.style.setProperty('--hue', hsv.h);
    panel.style.setProperty('--paint', colors[editing]);
    padThumb.style.left = `${hsv.s * 100}%`;
    padThumb.style.top = `${(1 - hsv.v) * 100}%`;
    hueThumb.style.left = `${(hsv.h / 360) * 100}%`;
    pad.setAttribute('aria-valuenow', String(Math.round(hsv.v * 100)));
    pad.setAttribute('aria-valuetext', TEXT.say.shade(colors[editing], Math.round(hsv.s * 100), Math.round(hsv.v * 100)));
    hueBar.setAttribute('aria-valuenow', String(Math.round(hsv.h)));
    if (document.activeElement !== hex) hex.value = colors[editing].toUpperCase();
  }

  const fromHsv = () => setColor(editing, hsvToHex(hsv), { fromPicker: true });
  track(pad, (x, y) => { hsv = { ...hsv, s: x, v: 1 - y }; fromHsv(); });
  track(hueBar, (x) => { hsv = { ...hsv, h: Math.min(359, x * 360) }; fromHsv(); });

  // Arrows nudge, Shift moves ten times as far
  pad.addEventListener('keydown', (e) => {
    const step = e.shiftKey ? 0.1 : 0.01;
    const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] }[e.key];
    if (!moves) return;
    e.preventDefault();
    hsv = { ...hsv, s: clamp(hsv.s + moves[0]), v: clamp(hsv.v + moves[1]) };
    fromHsv();
  });
  hueBar.addEventListener('keydown', (e) => {
    const step = e.shiftKey ? 15 : 1;
    const d = { ArrowLeft: -step, ArrowDown: -step, ArrowRight: step, ArrowUp: step }[e.key];
    if (d === undefined) return;
    e.preventDefault();
    hsv = { ...hsv, h: (hsv.h + d + 360) % 360 };
    fromHsv();
  });
  hex.addEventListener('input', () => {
    const v = hex.value.trim().replace(/^#?/, '#');
    if (/^#[0-9a-f]{6}$/i.test(v)) setColor(editing, v);
  });
  hex.addEventListener('keydown', (e) => {
    // Enter would submit the dialog's form and close the shop
    if (e.key === 'Enter') e.preventDefault();
  });
  hex.addEventListener('blur', () => syncPicker());

  function edit(key) {
    const opening = editing !== key || panel.hidden;
    for (const [k, s] of Object.entries(swatches)) s.setAttribute('aria-expanded', String(opening && k === key));
    if (!opening) {
      panel.hidden = true;
      editing = null;
      return;
    }
    editing = key;
    hsv = hexToHsv(colors[key]);
    swatches[key].closest('.paint-row').after(panel);
    panel.hidden = false;
    syncPicker();
  }

  const form = el('form', { method: 'dialog' }, el('h2', { textContent: TEXT.paint.title }), cost, balance, el('p', { className: 'price', textContent: TEXT.paint.hint }), notice);
  let paying = false;
  form.addEventListener('submit', async (e) => {
    // Payment can wait on another tab, so the shop closes itself once it's paid; a refusal keeps it open as it is
    e.preventDefault();
    if (paying) return;
    paying = true;
    const paid = await onFinish({ ...colors });
    paying = false;
    if (paid) dialog.close('done');
    else notice.textContent = TEXT.wallet.broke;
  });
  for (const { zone, keys } of ZONES) {
    const set = el('fieldset', {}, el('legend', { textContent: zone }));
    for (const [key, label] of keys) {
      const swatch = el('button', { type: 'button', className: 'paint-swatch' });
      swatch.dataset.label = label;
      swatch.setAttribute('aria-controls', 'paint-picker');
      swatch.setAttribute('aria-expanded', 'false');
      swatch.addEventListener('click', () => edit(key));
      swatches[key] = swatch;
      set.append(el('div', { className: 'paint-row' }, el('span', { textContent: label }), swatch));
    }
    form.append(set);
  }
  panel.id = 'paint-picker';
  for (const key of Object.keys(swatches)) setColor(key, colors[key]);
  cancelAnimationFrame(pending);
  pending = 0;

  // Escape cancels too, but touch and pointer players need a button that backs out without paying
  const cancel = el('button', { type: 'button', className: 'paint-cancel', textContent: TEXT.paint.cancel });
  form.append(el('div', { className: 'paint-actions' }, cancel, el('button', { value: 'done', className: 'paint-done', textContent: TEXT.paint.done })));
  const dialog = el('dialog', { className: 'paint-shop' }, form);
  dialog.setAttribute('aria-label', spoken(TEXT.paint.title));
  const backOut = () => {
    cancelAnimationFrame(pending);
    onCancel();
  };
  dialog.addEventListener('cancel', (e) => {
    // Escape mid-payment would roll back a job that's about to be paid for
    if (paying) return e.preventDefault();
    backOut();
  });
  cancel.addEventListener('click', () => {
    if (paying) return;
    backOut();
    dialog.close();
  });
  dialog.addEventListener('close', () => {
    dialog.remove();
    onClose();
  });
  document.body.append(dialog);
  dialog.showModal();
  dialog.querySelector('.paint-swatch')?.focus();
}
