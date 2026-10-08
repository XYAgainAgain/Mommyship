// What the animated backdrops behind the well share (Osminok Ocean, Cozy Storm): a pen that lays chunky backdrop
// pixels (4 per block cell) on the well's grid, a bounded ImageBitmap sprite cache, the flash cap, and the storm.
import { COLS, VISIBLE_ROWS } from '../core/engine.js';
import { mix } from '../themes/themes.js';

export const PX_PER_CELL = 4;
/** The backdrop reaches one cell past the well on every side, under the well's glowing frame. */
export const MARGIN_CELLS = 1;
export const M = MARGIN_CELLS * PX_PER_CELL;
export const BACKDROP_W = (COLS + 2 * MARGIN_CELLS) * PX_PER_CELL;
export const BACKDROP_H = (VISIBLE_ROWS + 2 * MARGIN_CELLS) * PX_PER_CELL;
export const WELL_W = COLS * PX_PER_CELL;
export const WELL_H = VISIBLE_ROWS * PX_PER_CELL;
/** Photosensitivity cap: two flashes a second at most, counting every strike and clear bolt together. */
export const MIN_FLASH_GAP = 0.5;
export const MAX_SPRITES = 32;

export const frac = (v) => v - Math.floor(v);
export const mod = (a, n) => ((a % n) + n) % n;
export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
export const smooth = (p) => p * p * (3 - 2 * p);

/** Canvas rect the backdrop covers for a given well rect. */
export function backdropRect({ x, y, cell }) {
  return { x: x - MARGIN_CELLS * cell, y: y - MARGIN_CELLS * cell, w: BACKDROP_W * (cell / PX_PER_CELL), h: BACKDROP_H * (cell / PX_PER_CELL) };
}

/** Scene sprites, capped; the whole cache is freed when it fills, since a scene's sprite keys are few and stable. */
export class SpriteCache {
  /** `makeBitmap(w, h, paint)` lets the renderer lend its own scratch canvas, so the page keeps a single one. */
  constructor(makeBitmap = null, max = MAX_SPRITES) {
    this.makeBitmap = makeBitmap;
    this.max = max;
    this.map = new Map();
    this.scratch = null;
  }

  get size() {
    return this.map.size;
  }

  get(key, w, h, paint) {
    let s = this.map.get(key);
    if (s) return s;
    if (this.map.size >= this.max) this.evict();
    s = this.makeBitmap ? this.makeBitmap(w, h, paint) : this.#bitmap(w, h, paint);
    if (s) this.map.set(key, s);
    return s;
  }

  /** A one-off bitmap the caller owns (and closes), off the same scratch canvas. */
  bake(w, h, paint) {
    return this.makeBitmap ? this.makeBitmap(w, h, paint) : this.#bitmap(w, h, paint);
  }

  evict() {
    for (const s of this.map.values()) s?.close?.();
    this.map.clear();
  }

  dispose() {
    this.evict();
    this.scratch = null;
  }

  /** Same path as the renderer: one shared scratch canvas, each sprite kept as an ImageBitmap. */
  #bitmap(w, h, paint) {
    if (typeof OffscreenCanvas === 'undefined') {
      if (typeof document === 'undefined') return null;
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      paint(c.getContext('2d'));
      return c;
    }
    this.scratch ??= new OffscreenCanvas(w, h);
    const s = this.scratch;
    if (s.width !== w) s.width = w;
    if (s.height !== h) s.height = h;
    const g = s.getContext('2d');
    if (g.reset) g.reset();
    else s.width = w;
    paint(g);
    return s.transferToImageBitmap();
  }
}

/** Every flash in a scene books its moment here, so none lands within MIN_FLASH_GAP of another. */
export class FlashGate {
  constructor() {
    this.free = -Infinity;
    this.log = [];
  }

  reserve(start) {
    this.free = start + MIN_FLASH_GAP;
    this.log.push(start);
    if (this.log.length > 64) this.log.shift();
  }
}

/** Maps backdrop pixels onto the canvas for one draw; `begin` is called with the well rect every frame. */
export class Pen {
  constructor(sprites) {
    this.sprites = sprites;
  }

  begin(ctx, { x, y, w, h, cell }) {
    const P = cell / PX_PER_CELL;
    const ox = x - MARGIN_CELLS * cell;
    const oy = y - MARGIN_CELLS * cell;
    this.ctx = ctx;
    this.P = P;
    this.ox = ox;
    this.oy = oy;
    this.w = Math.round(ox + BACKDROP_W * P) - Math.round(ox);
    this.h = Math.round(oy + BACKDROP_H * P) - Math.round(oy);
    this.wx = x;
    this.wy = y;
    this.ww = w ?? COLS * cell;
    this.wh = h ?? VISIBLE_ROWS * cell;
    return this;
  }

  /** Canvas y of a backdrop row's top edge, on the same rounding as dot(). */
  rowY(y) {
    return Math.round(this.oy + Math.round(y) * this.P);
  }

  /** One backdrop pixel (or a w×h block of them), snapped so neighbors never leave seams. */
  dot(x, y, w = 1, h = 1) {
    const { ctx, P, ox, oy } = this;
    const X = Math.round(x);
    const Y = Math.round(y);
    const L = Math.round(ox + X * P);
    const T = Math.round(oy + Y * P);
    ctx.fillRect(L, T, Math.round(ox + (X + w) * P) - L, Math.round(oy + (Y + h) * P) - T);
  }

  /** A stepped, chunky halo from a cached sprite, added onto whatever is under it. */
  glow(color, r, x, y, a) {
    if (a <= 0.001) return;
    const S = 2 * r + 1;
    const sprite = this.sprites.get(`g|${color}|${r}`, S, S, (g) => {
      g.fillStyle = color;
      for (let j = 0; j < S; j++) {
        for (let i = 0; i < S; i++) {
          const d = Math.hypot(i - r, j - r) / (r + 0.5);
          if (d >= 1) continue;
          // Stepped falloff keeps the halo chunky instead of a smooth blur
          g.globalAlpha = Math.round((1 - d) ** 1.6 * 4) / 4 * 0.9;
          g.fillRect(i, j, 1, 1);
        }
      }
    });
    if (!sprite) return;
    const { ctx, P, ox, oy } = this;
    const X = Math.round(x) - r;
    const Y = Math.round(y) - r;
    const L = Math.round(ox + X * P);
    const T = Math.round(oy + Y * P);
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = Math.min(1, a);
    ctx.drawImage(sprite, L, T, Math.round(ox + (X + S) * P) - L, Math.round(oy + (Y + S) * P) - T);
    ctx.globalCompositeOperation = 'source-over';
  }

  /** A whole-backdrop plate sprite, scaled up unsmoothed so every pixel lands on the grid. */
  plate(sprite, a) {
    if (!sprite || a <= 0.001) return;
    this.ctx.globalAlpha = Math.min(1, a);
    this.ctx.drawImage(sprite, Math.round(this.ox), Math.round(this.oy), this.w, this.h);
  }

  /** plate() for a sprite that is clear outside backdrop pixels [x0, x1) × [y0, y1): the same draw, clipped to the
   *  whole canvas pixels over that box. Clear pixels add nothing, so the picture is the same at a fraction of the fill. */
  platePart(sprite, a, x0, y0, x1, y1) {
    if (!sprite || a <= 0.001) return;
    const { ctx } = this;
    const L = Math.round(this.ox);
    const T = Math.round(this.oy);
    const sx = this.w / sprite.width;
    const sy = this.h / sprite.height;
    const left = Math.floor(L + x0 * sx) - 1;
    const top = Math.floor(T + y0 * sy) - 1;
    ctx.save();
    ctx.beginPath();
    ctx.rect(left, top, Math.ceil(L + x1 * sx) + 1 - left, Math.ceil(T + y1 * sy) + 1 - top);
    ctx.clip();
    this.plate(sprite, a);
    ctx.restore();
    ctx.beginPath();
  }
}

// Plate painting, at backdrop resolution on a sprite's context

export function paintRows(g, y0, y1, c0, c1) {
  for (let y = y0; y < y1; y++) {
    g.fillStyle = mix(c0, c1, (y - y0) / Math.max(1, y1 - y0 - 1));
    g.fillRect(0, y, BACKDROP_W, 1);
  }
}

export function paintSpecks(g, r, count, color, alpha, y0 = 0, y1 = BACKDROP_H) {
  g.fillStyle = color;
  g.globalAlpha = alpha;
  for (let i = 0; i < count; i++) g.fillRect(Math.floor(r() * BACKDROP_W), Math.floor(y0 + r() * (y1 - y0)), 1, 1);
  g.globalAlpha = 1;
}

/** The megastorm: storm sky down to `horizon`, then the sea, each a gradient with a scatter of specks. */
export function paintStormSurface(g, r, { horizon, sky, skySpecks, sea, seaSpecks }) {
  paintRows(g, 0, horizon, ...sky);
  paintSpecks(g, r, skySpecks[0], skySpecks[1], skySpecks[2], 0, horizon - 2);
  paintRows(g, horizon, BACKDROP_H, ...sea);
  paintSpecks(g, r, seaSpecks[0], seaSpecks[1], seaSpecks[2], horizon + 2, BACKDROP_H);
}

// The storm, live

/** Rain streaks as [x, phase, speed]; speeds run `speed[0]` to `speed[0] + speed[1]` backdrop pixels a second. */
export function makeRain(r, count, [v0, dv]) {
  return Array.from({ length: count }, () => ({ x: r() * BACKDROP_W, off: r(), v: v0 + r() * dv }));
}

/** Slanted rain falling to `floor`, splashing there when `splash` is above zero; returns the streaks drawn. */
export function drawRain(pen, rain, t, A, { floor, slant, color, alpha, splash }) {
  const { ctx } = pen;
  const D = floor + 3;
  ctx.fillStyle = color;
  for (const d of rain) {
    const u = frac((t * d.v) / D + d.off);
    const y = Math.round(-3 + u * D);
    const x = mod(d.x + y * slant, BACKDROP_W);
    ctx.globalAlpha = alpha * A;
    if (y < floor) pen.dot(x, y, 1, Math.min(3, floor - y));
    if (splash > 0 && u < 0.12) {
      const ix = mod(d.x + (floor - 1) * slant, BACKDROP_W);
      const s = u < 0.06 ? 1 : 2;
      ctx.globalAlpha = splash * A;
      pen.dot(ix - s, floor - s);
      pen.dot(ix + s, floor - s);
    }
  }
  return rain.length;
}

/** The choppy line where the sea meets the sky, rolling at `speed`. */
export function drawSwell(pen, t, A, y, { color, alpha, speed = 2.2 }) {
  pen.ctx.fillStyle = color;
  pen.ctx.globalAlpha = alpha * A;
  for (let x = 0; x < BACKDROP_W; x++) pen.dot(x, y - (Math.sin(x * 0.5 + t * speed) > 0.55 ? 1 : 0));
}

/** Random-walks a bolt one backdrop row at a time, pulled toward its target when it must hurry to reach it. */
export function walkBolt(rng, out, x, y, y1, x1) {
  while (y <= y1) {
    out.push(x, y);
    y++;
    const left = y1 - y;
    const gap = x1 - x;
    x += Math.abs(gap) > left ? Math.sign(gap) : Math.round(rng.next() * 2 - 1);
    x = clamp(x, M, M + WELL_W - 1);
  }
  return x;
}

/** A sky bolt from `top` to `bottom` (at least four rows), forking halfway as often as not. */
export function forkedStrike(rng, top, bottom) {
  const px = [];
  const x0 = M + 2 + Math.floor(rng.next() * (WELL_W - 4));
  const end = walkBolt(rng, px, x0, top, bottom, x0 + Math.round(rng.next() * 8 - 4));
  if (rng.next() < 0.5) walkBolt(rng, px, px[6], px[7], bottom - 2, end + (rng.next() < 0.5 ? -5 : 5));
  return Int16Array.from(px);
}

/** A bolt's pixels at strength `a`: a three-wide halo, kept inside the well, under a one-pixel core. */
export function drawBoltPx(pen, px, a, { halo = '#99f7f4', core = '#f4fbff' } = {}) {
  const { ctx } = pen;
  ctx.fillStyle = halo;
  ctx.globalAlpha = 0.35 * a;
  for (let i = 0; i < px.length; i += 2) {
    const x = Math.max(M, px[i] - 1);
    pen.dot(x, px[i + 1], Math.min(3, M + WELL_W - x), 1);
  }
  ctx.fillStyle = core;
  ctx.globalAlpha = a;
  for (let i = 0; i < px.length; i += 2) pen.dot(px[i], px[i + 1]);
}
