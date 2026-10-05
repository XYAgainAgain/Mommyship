// Osminok Ocean's living backdrop and clear effects, drawn in chunky backdrop pixels (4 per block cell) so the art sits
// on the well's grid. Critter motion is a pure function of the scene clock, which keeps it seeded.
import { VISIBLE_ROWS, Mulberry32 } from '../core/engine.js';
import { DIVE_ZONES, zoneIndexAt } from './osminok.js';
import {
  PX_PER_CELL, MARGIN_CELLS, M, BACKDROP_W, BACKDROP_H, WELL_W, WELL_H, MIN_FLASH_GAP, MAX_SPRITES, backdropRect,
  frac, mod, clamp, smooth, SpriteCache, FlashGate, Pen, paintRows, paintSpecks, paintStormSurface, makeRain, drawRain,
  drawSwell, walkBolt, forkedStrike, drawBoltPx,
} from './pixel-scene.js';

export { PX_PER_CELL, MARGIN_CELLS, BACKDROP_W, BACKDROP_H, MIN_FLASH_GAP, MAX_SPRITES, backdropRect };
const BW = BACKDROP_W;
const BH = BACKDROP_H;
/** Backdrop pixel row of the surface; the storm sky above it sits inside the well's top two rows. */
export const WATERLINE = M + 2 * PX_PER_CELL;

const MAX_BOLT_DELAY = 0.5;
const MAX_EFFECTS = 12;
const CROSSFADE = 2.5;
const SCATTER_TIME = 1.4;
/** The moment reduced motion freezes on, picked because every band looks populated there. */
const STILL_T = 3.7;

const Z = Object.fromEntries(DIVE_ZONES.map((z, i) => [z.id, i]));
const ALL = DIVE_ZONES.map((_, i) => i);

/** Which zones each critter lives in, following the ecology lore bands. */
export const BANDS = {
  storm: [Z.surface],
  snow: ALL,
  glowspiral: [Z.twilight],
  eel: [Z.twilight, Z.crushing],
  thoughtwater: [Z.twilight, Z.midnight, Z.crushing],
  darkmaw: [Z.midnight, Z.crushing],
  ember: [Z.vents],
  voidcoral: [Z.crushing],
  singer: [Z.trenches],
  ancient: [Z.forgotten],
  deeplight: [Z.unknowable],
};
const KINDS = Object.keys(BANDS);

/** Lightning reaches the cleared rows down through the Twilight Shelves; below that a clear is living light. */
export function clearStyle(zone) {
  if (zone <= Z.twilight) return 'bolt';
  if (zone < Z.trenches) return 'shockwave';
  return 'singer';
}

// Water gradient per zone, top to bottom
const WATER = [
  ['#13405a', '#062030'],
  ['#0d3a56', '#041420'],
  ['#05141f', '#020a10'],
  ['#060a10', '#1c0c05'],
  ['#08060f', '#120820'],
  ['#05050c', '#07060f'],
  ['#030305', '#010102'],
  ['#040108', '#0a0314'],
];
const SHOCK = ['#bfe8ff', '#99f7f4', '#66d0e0', '#ffb347', '#b064ff', '#c070ff', '#a0b8d0', '#b464e6'];
const IRIDESCENT = ['#6af0ff', '#7a8cff', '#c070ff', '#ff70c8', '#ffd070', '#80ffb0'];
const JELLY = ['#5aa0ff', '#ff4a5a', '#b064ff'];
const DEEP_GLOW = 'rgb(120, 35, 170)';
const DEEP_DOT = 'rgb(180, 100, 230)';

export class OsminokScene {
  /** `makeBitmap(w, h, paint)` lets the renderer lend its own scratch canvas, so the page keeps a single one. */
  constructor({ reducedMotion = false, seed = 0x05a1, makeBitmap = null } = {}) {
    this.reducedMotion = !!reducedMotion;
    this.seed = seed;
    this.sprites = new SpriteCache(makeBitmap);
    this.flash = new FlashGate();
    this.pen = new Pen(this.sprites);
    this.rng = new Mulberry32(seed);
    this.t = 0;
    this.drawn = new Map();
    this.g = null;
    this.#spawn(new Mulberry32(seed ^ 0x2545f491));
    this.#clearRun();
  }

  get flashLog() {
    return this.flash.log;
  }

  setReducedMotion(on) {
    this.reducedMotion = !!on;
    if (!on) return;
    this.fromZone = null;
    this.effects = this.effects.filter((e) => e.kind === 'pulse');
  }

  /** A fresh dive: back to the surface and critters home, with a plunge splash unless `plunge` is false. */
  reset({ plunge = true } = {}) {
    this.#clearRun();
    if (plunge) this.plunge();
  }

  /** The splash of going under, played as the run sinks past the storm surface. */
  plunge() {
    if (!this.reducedMotion) this.#plunge();
  }

  onGameOver() {
    if (this.overAt === null) this.overAt = this.t;
  }

  update(dt, dive) {
    const step = clamp(dt || 0, 0, 0.25);
    this.t += step;
    const t = this.t;
    const zone = dive?.zone ?? this.zone ?? 0;
    if (zone !== this.zone) {
      if (this.zone === null || this.reducedMotion) this.fromZone = null;
      // A zone change mid-fade fades out from whichever zone was showing most
      else this.fromZone = this.fromZone !== null && this.fade < 0.5 ? this.fromZone : this.zone;
      this.fade = 0;
      this.zone = zone;
    }
    if (this.fromZone !== null && (this.fade += step / CROSSFADE) >= 1) this.fromZone = null;
    this.zoneT = clamp(dive?.zoneT ?? 0, 0, 1);
    if (this.zone === Z.surface && this.overAt === null && !this.reducedMotion && t >= this.nextStrike) {
      if (t >= this.flash.free) {
        this.#strike(t);
        this.nextStrike = t + 0.9 + this.rng.next() * 2.4;
      } else this.nextStrike = this.flash.free;
    }
    if (this.effects.length) this.effects = this.effects.filter((e) => t < e.start + e.life);
  }

  /** `rows` are cleared row indices with 0 at the top; `depth` is meters after the clear. */
  onClear({ rows = [], lines = rows.length, depth = 0 } = {}) {
    const n = clamp(lines || 1, 1, 4);
    const k = n / 4;
    const t = this.t;
    const ys = rows.map((r) => M + clamp(r, 0, VISIBLE_ROWS - 1) * PX_PER_CELL + 2).sort((a, b) => a - b);
    if (!ys.length) ys.push(M + WELL_H / 2);
    const zone = zoneIndexAt(depth);
    const cx = M + WELL_W / 2;
    const cy = (ys[0] + ys[ys.length - 1]) / 2;
    let style = this.reducedMotion ? 'pulse' : clearStyle(zone);
    // Rapid clears near the surface trade their bolt for a soft glow rather than break the flash cap
    if (style === 'bolt' && this.flash.free - t > MAX_BOLT_DELAY) style = 'pulse';
    if (style === 'bolt') {
      const start = Math.max(t, this.flash.free);
      this.flash.reserve(start);
      this.effects.push({ layer: 'front', kind: 'bolt', start, life: 0.35, k, px: this.#bolt(ys, k) });
    } else if (style === 'shockwave') {
      this.effects.push({ layer: 'front', kind: 'ring', start: t, life: 0.9 + 0.12 * (n - 1), n, k, cx, cy, color: SHOCK[zone] });
    } else if (style === 'singer') {
      this.effects.push({ layer: 'front', kind: 'singer', start: t, life: 2.4 + 0.35 * (n - 1), n, k, cx, cy });
    } else {
      this.effects.push({ layer: 'front', kind: 'pulse', start: t, life: 0.7, k, color: SHOCK[zone] });
    }
    if (this.effects.length > MAX_EFFECTS) this.effects.splice(0, this.effects.length - MAX_EFFECTS);
  }

  drawBackdrop(ctx, wellRect, dive) {
    this.drawn.clear();
    const zone = this.zone ?? dive?.zone ?? 0;
    const g = this.#begin(ctx, wellRect);
    ctx.save();
    ctx.beginPath();
    ctx.rect(g.ox, g.oy, g.w, g.h);
    ctx.clip();
    ctx.imageSmoothingEnabled = false;
    ctx.globalCompositeOperation = 'source-over';
    const f = this.fromZone === null ? 1 : smooth(clamp(this.fade, 0, 1));
    if (this.fromZone !== null) this.#plate(this.fromZone, 1);
    this.#plate(zone, f);
    if (zone + 1 < DIVE_ZONES.length && this.zoneT > 0) this.#plate(zone + 1, 0.3 * this.zoneT * f);
    const over = this.#overT();
    this.alive = 1 - over;
    this.push = this.reducedMotion ? 0 : over * over * 36;
    for (const kind of KINDS) {
      const inNow = BANDS[kind].includes(zone);
      const inFrom = this.fromZone !== null && BANDS[kind].includes(this.fromZone);
      if (!inNow && !inFrom) continue;
      const w = Math.min(1, (inNow ? f : 0) + (inFrom ? 1 - f : 0));
      // Snow only dims at game over; everything alive scatters or goes dark
      const A = kind === 'snow' ? w * (1 - 0.7 * over) : w * this.alive;
      if (A <= 0.001) continue;
      this.drawn.set(kind, this.#critters(kind, A, zone));
    }
    for (const e of this.effects) if (e.layer === 'back') this.#drawEffect(e);
    if (over > 0) {
      ctx.globalAlpha = 0.5 * over;
      ctx.fillStyle = '#000';
      ctx.fillRect(g.ox, g.oy, g.w, g.h);
    }
    ctx.restore();
    // restore() keeps the current path, so drop the clip rect before the renderer's next fill()
    ctx.beginPath();
  }

  drawEffects(ctx, wellRect) {
    if (!this.effects.some((e) => e.layer === 'front')) return;
    const g = this.#begin(ctx, wellRect);
    ctx.save();
    ctx.beginPath();
    ctx.rect(g.wx, g.wy, g.ww, g.wh);
    ctx.clip();
    for (const e of this.effects) if (e.layer === 'front') this.#drawEffect(e);
    ctx.restore();
    ctx.beginPath();
  }

  dispose() {
    this.sprites.dispose();
  }

  #clearRun() {
    this.zone = null;
    this.fromZone = null;
    this.fade = 1;
    this.zoneT = 0;
    this.overAt = null;
    this.effects = [];
    this.flash.free = -Infinity;
    this.nextStrike = this.t + 0.6;
  }

  #overT() {
    if (this.overAt === null) return 0;
    return smooth(clamp((this.t - this.overAt) / SCATTER_TIME, 0, 1));
  }

  get #mt() {
    return this.reducedMotion ? STILL_T : this.t;
  }

  #spawn(rng) {
    const r = () => rng.next();
    const n = (count, f) => Array.from({ length: count }, (_, i) => f(i));
    this.snow = n(40, () => ({ x: r() * BW, y: r() * BH, v: 2 + r() * 4, ph: r() * 6.28, a: 0.2 + r() * 0.3 }));
    this.rain = makeRain(r, 30, [70, 40]);
    this.spirals = n(3, (i) => ({
      x: M + 5 + i * 13 + r() * 5, y: BH - 10 - r() * 22, ph: r() * 6.28,
      members: n(3 + Math.floor(r() * 3), () => ({ dx: Math.round(r() * 6 - 3), dy: Math.round(r() * 4 - 2), ph: r() * 6.28 })),
    }));
    this.eels = n(2, () => ({ x: r() * BW, y: 20 + r() * 50, v: 6 + r() * 5, dir: r() < 0.5 ? -1 : 1, ph: r() * 6.28 }));
    this.jellies = n(3, (i) => ({ x: r() * BW, y: 16 + r() * 56, ph: r() * 6.28, drift: r() < 0.5 ? -1 : 1, hue: i % 3 }));
    this.lures = n(2, (i) => ({ x: M + 8 + i * 22 + Math.round(r() * 6), y: BH - 5, ph: r() * 6.28, period: 9 + r() * 6 }));
    this.embers = n(18, () => ({ x: r() * BW, off: r(), v: 4 + r() * 5, ph: r() * 6.28, hot: r() < 0.4 }));
    this.vents = [{ x: M + 6, h: 12 }, { x: M + 27, h: 18 }];
    this.singers = n(2, (i) => ({ x: M + 10 + i * 20, y: 24 + i * 30 + r() * 6, ph: r() * 6, period: 5 + r() * 2.5 }));
    this.ancients = n(5, () => ({ x: 4 + r() * (BW - 8), y: 8 + r() * (BH - 16), period: 9 + r() * 7, off: r(), warm: r() < 0.5 }));
    this.deep = n(16, () => ({ x: 2 + r() * (BW - 4), y: 2 + r() * (BH - 4), period: 1.6 + r() * 2.4, off: r() }));
    // Voidcoral grows in branching walks up from the floor; the plate paints it, the tips glow live
    const px = [];
    const tips = [];
    for (let c = 0; c < 7; c++) {
      const stack = [[Math.floor(r() * BW), BH - 1, 10 + Math.floor(r() * 18)]];
      while (stack.length) {
        let [x, y, len] = stack.pop();
        for (let i = 0; i < len; i++) {
          px.push(x, y);
          y--;
          x = clamp(x + Math.round(r() * 2 - 1), 0, BW - 1);
          if (len > 6 && stack.length < 6 && r() < 0.12) stack.push([x, y, Math.floor(len * 0.6)]);
        }
        tips.push(x, y);
      }
    }
    this.coral = { px, tips };
  }

  #begin(ctx, wellRect) {
    this.g = this.pen.begin(ctx, wellRect);
    return this.g;
  }

  /** A dotted ring of backdrop pixels; the dots read as bioluminescent motes rather than a drawn line. */
  #ring(x, y, r, a, colors = null, cap = 96) {
    if (a <= 0.001 || r <= 0) return;
    const { ctx } = this.g;
    const count = clamp(Math.round((2 * Math.PI * r) / 2), 8, cap);
    ctx.globalAlpha = Math.min(1, a);
    const segs = colors ? colors.length : 1;
    for (let k = 0; k < count; k++) {
      if (colors && k % Math.ceil(count / segs) === 0) ctx.fillStyle = colors[Math.floor((k * segs) / count)];
      const ang = (k / count) * Math.PI * 2;
      this.g.dot(x + Math.cos(ang) * r, y + Math.sin(ang) * r);
    }
  }

  #scatter(x, y) {
    if (!this.push) return [x, y];
    const dx = x - BW / 2;
    const dy = y - BH / 2;
    const len = Math.hypot(dx, dy) || 1;
    return [x + (dx / len) * this.push, y + (dy / len) * this.push];
  }

  #plate(zone, a) {
    if (a <= 0.001) return;
    this.g.plate(this.sprites.get(`p|${zone}`, BW, BH, (g) => this.#paintPlate(g, zone)), a);
  }

  /** A zone's still scenery at backdrop resolution, scaled up unsmoothed so every pixel lands on the grid. */
  #paintPlate(g, zone) {
    const rng = new Mulberry32(this.seed + zone * 7919);
    const r = () => rng.next();
    const [top, bottom] = WATER[zone];
    const rows = (y0, y1, c0, c1) => paintRows(g, y0, y1, c0, c1);
    const speck = (count, color, alpha, y0, y1) => paintSpecks(g, r, count, color, alpha, y0, y1);
    if (zone === Z.surface) {
      paintStormSurface(g, r, { horizon: WATERLINE, sky: ['#273246', '#121926'], skySpecks: [40, '#0b1018', 0.8], sea: [top, bottom], seaSpecks: [30, '#1d5470', 0.5] });
      return;
    }
    rows(0, BH, top, bottom);
    if (zone === Z.twilight) {
      // Faint blue light from above, then kelp silhouettes against it
      g.fillStyle = '#7ab8ff';
      for (let s = 0; s < 3; s++) {
        const x0 = 4 + s * 15 + r() * 6;
        for (let y = 0; y < 56; y++) {
          g.globalAlpha = (1 - y / 56) * 0.09;
          g.fillRect(Math.round(x0 + y * 0.3), y, 3, 1);
        }
      }
      g.globalAlpha = 1;
      g.fillStyle = '#021219';
      for (let s = 0; s < 6; s++) {
        const base = Math.floor(r() * BW);
        const height = 28 + Math.floor(r() * 34);
        const ph = r() * 6.28;
        for (let k = 0; k < height; k++) {
          const x = base + Math.round(Math.sin(k * 0.18 + ph) * 1.5);
          g.fillRect(x, BH - 1 - k, 1, 1);
          if (k % 5 === 2) g.fillRect(x + (k % 10 === 2 ? 1 : -1), BH - 1 - k, 1, 1);
        }
      }
    } else if (zone === Z.midnight) {
      speck(50, '#0a1a22', 0.6);
      g.fillStyle = '#0b1519';
      g.fillRect(0, BH - 3, BW, 3);
    } else if (zone === Z.vents) {
      g.fillStyle = '#ff7a1a';
      for (let y = BH - 30; y < BH; y++) {
        g.globalAlpha = ((y - (BH - 30)) / 30) ** 2 * 0.35;
        g.fillRect(0, y, BW, 1);
      }
      g.globalAlpha = 1;
      for (const v of this.vents) {
        g.fillStyle = '#0c0705';
        g.fillRect(v.x, BH - v.h, 3, v.h);
        g.fillStyle = '#ff9a3a';
        g.fillRect(v.x, BH - v.h, 3, 1);
      }
    } else if (zone === Z.crushing) {
      g.fillStyle = '#1e0e30';
      const { px } = this.coral;
      for (let i = 0; i < px.length; i += 2) g.fillRect(px[i], px[i + 1], 1, 1);
    } else if (zone === Z.trenches || zone === Z.forgotten) {
      const wall = zone === Z.trenches ? '#07070d' : '#040406';
      const ph = r() * 6.28;
      for (let y = 0; y < BH; y++) {
        const left = 3 + Math.round(Math.sin(y * 0.15 + ph) * 2 + r());
        const right = 3 + Math.round(Math.cos(y * 0.11 + ph) * 2 + r());
        g.fillStyle = wall;
        g.fillRect(0, y, left, 1);
        g.fillRect(BW - right, y, right, 1);
        if (zone === Z.trenches) {
          g.fillStyle = '#141030';
          g.fillRect(left, y, 1, 1);
          g.fillRect(BW - right - 1, y, 1, 1);
        }
      }
    } else if (zone === Z.unknowable) {
      speck(24, '#12051f', 0.7);
    }
  }

  #critters(kind, A, zone) {
    switch (kind) {
      case 'storm': return this.#storm(A, zone);
      case 'snow': return this.#snow(A, zone);
      case 'glowspiral': return this.#glowspiral(A, zone);
      case 'eel': return this.#eel(A, zone);
      case 'thoughtwater': return this.#thoughtwater(A, zone);
      case 'darkmaw': return this.#darkmaw(A, zone);
      case 'ember': return this.#ember(A, zone);
      case 'voidcoral': return this.#voidcoral(A, zone);
      case 'singer': return this.#singer(A, zone);
      case 'ancient': return this.#ancient(A, zone);
      case 'deeplight': return this.#deeplight(A, zone);
      default: return 0;
    }
  }

  #storm(A) {
    const t = this.#mt;
    const { ctx } = this.g;
    const drawn = drawRain(this.g, this.rain, t, A, { floor: WATERLINE, slant: 0.3, color: '#9fb0c8', alpha: 0.45, splash: 0.6 });
    drawSwell(this.g, t, A, WATERLINE, { color: '#7fb4d0', alpha: 0.5 });
    if (this.reducedMotion && this.overAt === null) {
      // Reduced motion: the storm's lightning is only a slow brightening of the sky, inside the well
      const { wx, wy, ww, oy, P } = this.g;
      ctx.fillStyle = '#9fc4ff';
      ctx.globalAlpha = (0.05 + 0.05 * Math.sin((this.t * Math.PI * 2) / 6)) * A;
      ctx.fillRect(wx, wy, ww, Math.round(oy + WATERLINE * P) - wy);
    }
    return drawn;
  }

  #snow(A, zone) {
    const t = this.#mt;
    const { ctx } = this.g;
    let drawn = 0;
    ctx.fillStyle = '#c8d2f0';
    for (const s of this.snow) {
      const y = mod(s.y + s.v * t, BH);
      if (zone === Z.surface && y < WATERLINE + 1) continue;
      ctx.globalAlpha = s.a * A;
      this.g.dot(mod(s.x + Math.sin(t * 0.5 + s.ph) * 1.5, BW), y);
      drawn++;
    }
    return drawn;
  }

  #glowspiral(A) {
    const t = this.#mt;
    const { ctx } = this.g;
    const pts = [];
    for (const grp of this.spirals) {
      const gx = grp.x + Math.sin(t * 0.07 + grp.ph) * 2;
      for (const m of grp.members) {
        const [x, y] = this.#scatter(gx + m.dx, grp.y + m.dy);
        this.g.glow('#5ff0c8', 3, x, y, (0.3 + 0.12 * Math.sin(t * 0.8 + m.ph)) * A);
        pts.push(x, y);
      }
    }
    ctx.fillStyle = '#d4fff0';
    ctx.globalAlpha = 0.8 * A;
    for (let i = 0; i < pts.length; i += 2) this.g.dot(pts[i], pts[i + 1]);
    return pts.length / 2;
  }

  #eel(A) {
    const t = this.#mt;
    const { ctx } = this.g;
    const dim = this.zone === Z.crushing ? 0.6 : 1;
    for (const e of this.eels) {
      const hx = mod(e.x + e.dir * e.v * t, BW + 20) - 10;
      ctx.fillStyle = '#99f7f4';
      let head = null;
      for (let i = 0; i < 9; i++) {
        const x = hx - e.dir * i;
        const [sx, sy] = this.#scatter(x, e.y + Math.round(Math.sin(x * 0.35 + t * 3 + e.ph) * 1.5));
        ctx.globalAlpha = (0.8 - i * 0.06) * A * dim;
        this.g.dot(sx, sy);
        head ??= [sx, sy];
      }
      // A tiny crackle near the head, never bright or big enough to read as a flash
      if (frac(t * 0.7 + e.ph) < 0.04) {
        ctx.fillStyle = '#fcffa3';
        ctx.globalAlpha = 0.8 * A * dim;
        this.g.dot(head[0] + e.dir, head[1] - 1);
      }
    }
    return this.eels.length;
  }

  #thoughtwater(A, zone) {
    const t = this.#mt;
    const { ctx } = this.g;
    for (const j of this.jellies) {
      const color = zone === Z.twilight ? JELLY[0] : JELLY[j.hue];
      const [x, y] = this.#scatter(mod(j.x + j.drift * t * 0.6 + Math.sin(t * 0.13 + j.ph) * 4, BW), j.y + Math.sin(t * 0.9 + j.ph) * 2);
      this.g.glow(color, 4, x, y, (0.22 + 0.12 * Math.sin(t * 1.7 + j.ph)) * A);
      const beat = Math.sin(t * 2.4 + j.ph) > 0 ? 1 : 0;
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.75 * A;
      this.g.dot(x - 1, y, 3, 1);
      this.g.dot(x, y - 1);
      this.g.dot(x - 1, y + 1, 1, 2 + beat);
      this.g.dot(x + 1, y + 1, 1, 3 - beat);
    }
    return this.jellies.length;
  }

  #darkmaw(A) {
    const t = this.#mt;
    const { ctx } = this.g;
    for (const l of this.lures) {
      const [bx, by] = this.#scatter(l.x, l.y);
      ctx.fillStyle = '#1d3238';
      ctx.globalAlpha = A;
      this.g.dot(bx, by - 2, 1, 2);
      const lx = bx + Math.round(Math.sin(t * 0.6 + l.ph));
      const ly = by - 3 + Math.round(Math.sin(t * 1.1 + l.ph) * 0.6);
      this.g.glow('#66d0e0', 5, lx, ly, (0.35 + 0.1 * Math.sin(t * 1.3 + l.ph)) * A);
      ctx.fillStyle = '#e6f0fa';
      ctx.globalAlpha = 0.9 * A;
      this.g.dot(lx, ly);
      // Now and then the maw under the lure opens, a row of teeth in the dark
      if (frac(t / l.period + l.ph / 6.28) < 0.05) {
        ctx.fillStyle = '#4a1820';
        ctx.globalAlpha = 0.8 * A;
        this.g.dot(bx - 3, by, 7, 1);
        for (let i = -3; i <= 3; i += 2) this.g.dot(bx + i, by - 1);
      }
    }
    return this.lures.length;
  }

  #ember(A) {
    const t = this.#mt;
    const { ctx } = this.g;
    this.vents.forEach((v, i) => this.g.glow('#ff8a2a', 4, v.x + 1, BH - v.h, (0.45 + 0.2 * Math.sin(t * 5 + i * 2)) * A));
    for (const e of this.embers) {
      const u = frac((t * e.v) / BH + e.off);
      const [x, y] = this.#scatter(mod(e.x + Math.sin(t * 1.5 + e.ph) * 1.2, BW), BH - 2 - u * BH * 0.75);
      ctx.fillStyle = e.hot ? '#ffd27a' : '#ff7a1a';
      ctx.globalAlpha = (1 - u) * 0.7 * A;
      this.g.dot(x, y);
    }
    return this.embers.length + this.vents.length;
  }

  #voidcoral(A) {
    const t = this.#mt;
    const { ctx } = this.g;
    const { tips } = this.coral;
    ctx.fillStyle = '#a050e0';
    for (let i = 0; i < tips.length; i += 2) {
      ctx.globalAlpha = (0.25 + 0.25 * Math.sin(t * 0.6 + i * 0.85)) * A;
      this.g.dot(tips[i], tips[i + 1]);
    }
    return tips.length / 2;
  }

  #singer(A) {
    const t = this.#mt;
    const { ctx } = this.g;
    for (const s of this.singers) {
      const h = mod(t * 0.25 + s.ph, IRIDESCENT.length);
      const i0 = Math.floor(h);
      const fr = h - i0;
      const [x, y] = this.#scatter(s.x + Math.sin(t * 0.05 + s.ph) * 6, s.y + Math.sin(t * 0.07 + s.ph) * 4);
      // Iridescence crossfades between neighboring palette sprites, so the cache stays one sprite per hue
      this.g.glow(IRIDESCENT[i0], 10, x, y, 0.4 * (1 - fr) * A);
      this.g.glow(IRIDESCENT[(i0 + 1) % IRIDESCENT.length], 10, x, y, 0.4 * fr * A);
      ctx.fillStyle = IRIDESCENT[(i0 + 2) % IRIDESCENT.length];
      ctx.globalAlpha = 0.6 * A;
      this.g.dot(x - 1, y, 3, 1);
      this.g.dot(x, y - 1, 1, 3);
      const u = frac(t / s.period + s.ph);
      ctx.fillStyle = IRIDESCENT[i0];
      this.#ring(x, y, 2 + u * 34, (1 - u) * 0.4 * A, null, 64);
    }
    return this.singers.length;
  }

  #ancient(A) {
    const t = this.#mt;
    const { ctx } = this.g;
    let lit = 0;
    for (const a of this.ancients) {
      const u = frac(t / a.period + a.off);
      if (u >= 0.15) continue;
      const v = Math.sin((u / 0.15) * Math.PI);
      const color = a.warm ? '#d8c8a0' : '#a0b8d0';
      const [x, y] = this.#scatter(a.x, a.y);
      this.g.glow(color, 3, x, y, 0.5 * v * A);
      ctx.fillStyle = color;
      ctx.globalAlpha = v * A;
      this.g.dot(x, y);
      lit++;
    }
    return lit;
  }

  #deeplight(A) {
    const t = this.#mt;
    const { ctx } = this.g;
    for (const d of this.deep) {
      const v = Math.max(0, Math.sin(Math.PI * 2 * (t / d.period + d.off))) ** 2;
      const [x, y] = this.#scatter(d.x, d.y);
      this.g.glow(DEEP_GLOW, 4, x, y, 0.7 * v * A);
      ctx.fillStyle = DEEP_DOT;
      ctx.globalAlpha = v * A;
      this.g.dot(x, y);
    }
    return this.deep.length;
  }

  #bolt(ys, k) {
    const r = this.rng;
    const px = [];
    const xr = () => M + 2 + Math.floor(r.next() * (WELL_W - 4));
    const end = walkBolt(r, px, xr(), M, ys[0], xr());
    const trunk = px.length / 2;
    const ends = [end];
    for (let i = 1; i < ys.length; i++) {
      const from = Math.floor(r.next() * trunk * 0.6) * 2;
      ends.push(walkBolt(r, px, px[from], px[from + 1], ys[i], xr()));
    }
    // Each cleared row crackles sideways from where its fork lands, wider with more lines
    const half = Math.round((WELL_W * (0.3 + 0.7 * k)) / 2);
    ys.forEach((y, i) => {
      for (let x = Math.max(M, ends[i] - half); x <= Math.min(M + WELL_W - 1, ends[i] + half); x++) {
        px.push(x, clamp(y + (r.next() < 0.2 ? Math.round(r.next() * 2 - 1) : 0), M, M + WELL_H - 1));
      }
    });
    return Int16Array.from(px);
  }

  #strike(t) {
    this.flash.reserve(t);
    this.effects.push({ layer: 'back', kind: 'strike', start: t, life: 0.28, k: 0.6, px: forkedStrike(this.rng, M, WATERLINE - 1) });
  }

  #plunge() {
    const r = this.rng;
    const drops = Array.from({ length: 16 }, () => ({ x: M + WELL_W / 2 + (r.next() * 10 - 5), vx: r.next() * 24 - 12, vy: 20 + r.next() * 22 }));
    this.effects.push({ layer: 'back', kind: 'plunge', start: this.t, life: 0.9, drops });
  }

  #drawEffect(e) {
    const { ctx } = this.g;
    const age = this.t - e.start;
    if (age < 0) return;
    const p = clamp(age / e.life, 0, 1);
    if (e.kind === 'bolt' || e.kind === 'strike') {
      const fade = (1 - p) ** 2;
      const { wx, wy, ww, wh, oy, P } = this.g;
      ctx.fillStyle = '#cfe8ff';
      ctx.globalAlpha = 0.2 * e.k * (1 - p) ** 3;
      // A storm strike lights only the sky strip and the top of the water; a clear bolt lights the well
      ctx.fillRect(wx, wy, ww, e.kind === 'strike' ? Math.round(oy + (WATERLINE + 3) * P) - wy : wh);
      drawBoltPx(this.g, e.px, fade * (0.6 + 0.4 * e.k));
    } else if (e.kind === 'ring') {
      ctx.fillStyle = e.color;
      for (let i = 0; i < e.n; i++) {
        const q = (age - i * 0.12) / 0.9;
        if (q < 0 || q > 1) continue;
        const r = 2 + q * (14 + 26 * e.k);
        this.#ring(e.cx, e.cy, r, (1 - q) * (0.5 + 0.4 * e.k));
        this.#ring(e.cx, e.cy, r - 1.5, (1 - q) * (0.25 + 0.2 * e.k));
      }
    } else if (e.kind === 'singer') {
      const shift = Math.floor(this.t * 3);
      const colors = IRIDESCENT.map((_, i) => IRIDESCENT[(i + shift) % IRIDESCENT.length]);
      for (let i = 0; i < e.n; i++) {
        const q = (age - i * 0.35) / 2.4;
        if (q < 0 || q > 1) continue;
        const r = 2 + smooth(q) * (18 + 30 * e.k);
        const a = (1 - q) * (0.45 + 0.35 * e.k);
        this.#ring(e.cx, e.cy, r, a, colors);
        this.#ring(e.cx, e.cy, r - 1.5, a * 0.5, colors);
      }
    } else if (e.kind === 'pulse') {
      const { wx, wy, ww, wh } = this.g;
      ctx.fillStyle = e.color;
      ctx.globalAlpha = (0.08 + 0.14 * e.k) * (1 - p);
      ctx.fillRect(wx, wy, ww, wh);
    } else if (e.kind === 'plunge') {
      ctx.fillStyle = '#d4fcff';
      ctx.globalAlpha = 0.8 * (1 - p);
      for (const d of e.drops) {
        const y = WATERLINE - (d.vy * age - 40 * age * age);
        if (y <= WATERLINE) this.g.dot(d.x + d.vx * age, y);
      }
      const spread = Math.round(age * 30);
      this.g.dot(M + WELL_W / 2 - spread, WATERLINE - 1);
      this.g.dot(M + WELL_W / 2 + spread, WATERLINE - 1);
    }
  }
}
