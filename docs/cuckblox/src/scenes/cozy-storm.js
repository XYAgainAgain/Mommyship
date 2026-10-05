// Cozy Storm's backdrop: the terminal sits behind a six-pane gunmetal window looking out at a storm, lit by neon
// inside. Outside, a downpour over a dark far skyline; on the glass, a small automaton of drops that merge and trickle.
import { VISIBLE_ROWS, Mulberry32 } from '../core/engine.js';
import {
  PX_PER_CELL, M, BACKDROP_W, BACKDROP_H, WELL_W, WELL_H, MIN_FLASH_GAP, MAX_SPRITES, backdropRect, clamp, smooth, frac, mod,
  SpriteCache, FlashGate, Pen, paintRows, paintSpecks, makeRain, forkedStrike, drawBoltPx,
} from './pixel-scene.js';

export { MIN_FLASH_GAP, MAX_SPRITES, backdropRect };
const BW = BACKDROP_W;
const BH = BACKDROP_H;
const N = BW * BH;

// The window, in backdrop pixels: outer stiles and rails three pixels thick inside the well, two-pixel muntins, and
// a sill console across the bottom. Bars must stay at least two wide so a landing's 3×3 merge never reaches the next pane.
const PANE_COLS = [[M + 3, M + 19], [M + 21, M + 37]];
const PANE_ROWS = [[M + 3, M + 24], [M + 26, M + 47], [M + 49, M + 70]];
/** The six panes, two columns by three rows, as [x0, x1) × [y0, y1) backdrop pixel ranges. */
export const PANES = PANE_ROWS.flatMap(([y0, y1]) => PANE_COLS.map(([x0, x1]) => ({ x0, x1, y0, y1 })));
/** First row of the sill, under the bottom rail. */
export const SILL = PANE_ROWS[2][1] + 3;
/** Where the far skyline starts; lightning brightens only the sky above it. */
export const SKYLINE = M + 58;
/** The window's shape, for frame painters such as `paintWoodWindow`. */
export const WINDOW = { panes: PANES, sill: SILL, width: BW, height: BH };
const paneAt = new Int8Array(N).fill(-1);
PANES.forEach((p, i) => {
  for (let y = p.y0; y < p.y1; y++) paneAt.fill(i, y * BW + p.x0, y * BW + p.x1);
});
/** Which pane a backdrop pixel is glass of, or -1 on the frame. */
export const paneOf = (x, y) => (x >= 0 && x < BW && y >= 0 && y < BH ? paneAt[y * BW + x] : -1);
const onBottomRow = (cell) => {
  const p = paneAt[cell];
  return p >= 0 && Math.floor(cell / BW) === PANES[p].y1 - 1;
};

// The pane steps on a fixed tick so a slow frame never teleports a drop, and the same seed always rains the same
const TICK = 1 / 60;
const MAX_TICKS = 15;
/** Seconds of rain the glass has already seen when the scene starts, so it's never bone dry (or bare when still). */
const PREWARM = 14;
const LAND_RATE = 18;
export const MAX_BEADS = 120;
export const MAX_RUNNERS = 40;
/** Backdrop pixels a second every trickle crawls down the glass, whatever its size and however it let go. */
export const TRICKLE = 6;
const MEANDER = 0.04;
const LAND_MASS = [0.35, 0.9];
const RUN_MASS = 2.8;
// A bead sitting in a fresh trail lets go sooner, the way real rivulets reuse each other's paths
const WET_RUN_MASS = 2;
const STOP_MASS = 1.2;
const TRAIL_LOSS = 0.04;
// Water pooled on a muntin or the sill runs off along the bar, so pools stay small and never hog the bead budget
const POOL_MAX = 2.4;
const POOL_DRAIN = 0.12;
const WET_LIFE = 6;
const WET_EVERY = 4;
const TRAIL_LEVELS = [0.12, 0.3, 0.55];
const TRAIL_ALPHA = [0.07, 0.12, 0.18];

// The downpour outside: fast, long, faint streaks
const RAIN_COUNT = 44;
const RAIN_SPEED = [160, 80];
const RAIN_LEN = 6;
const RAIN_SLANT = 0.12;
const RAIN_ALPHA = 0.13;

// Lightning is a rare, soft brightening behind the glass, with a far bolt now and then
const STRIKE_GAP = [7, 9];
const SKY_LIFE = 1.6;
const SKY_RISE = 0.12;
const SKY_BRIGHT = 0.1;
const BOLT_CHANCE = 0.4;
const GLOOM_TIME = 1.4;
const GLOOM = 0.35;
const STILL_T = 2.3;

// Neon inside: a pink tube along the sill and a short teal one on the top rail, each with a soft glow on the
// glass beside it. Now and then one dips gently: never a blackout, and dips start at least DIP_EVERY apart.
const PINK_TUBE = [[M + 2, 9], [M + 12, 8], [M + 21, 8], [M + 30, 8]].map(([x, w]) => [x, SILL, w]);
export const NEON = [
  { tube: PINK_TUBE, color: '#ff6aa8', glow: '#ff4f9a', alpha: 0.5, glowAlpha: 0.3, x0: M + 1, x1: M + WELL_W - 1, above: [0.6, 0.45, 0.34, 0.25, 0.17, 0.11, 0.07, 0.04], below: [0.5, 0.28, 0.12] },
  { tube: [[M + 26, M + 1, 10]], color: '#4fd8cf', glow: '#3fc8c0', alpha: 0.42, glowAlpha: 0.2, x0: M + 25, x1: M + 37, above: [0.3], below: [0.5, 0.32, 0.18, 0.08] },
];
const FLICKER_GAP = [8, 14];
const DIP_LIFE = 0.45;
export const DIP_EVERY = 0.6;
const DIP_DEPTH = [0.2, 0.22];
/** The deepest a dip ever goes, so a tube never drops below 1 - DIP_MAX of its glow. */
export const DIP_MAX = DIP_DEPTH[0] + DIP_DEPTH[1];

// Status lights pulse slowly (a second or more a cycle), as does the far antenna's warning light
const LED = { low: 0.12, high: 0.55 };
const LEDS = [
  [M + 5, M + 1, '#ffb347', 2.9, 0.1],
  [M + 7, M + 1, '#4fd8cf', 1.7, 0.6],
  [M + 29, SILL + 3, '#8ef0a0', 1.3, 0.3],
  [M + 31, SILL + 3, '#ffb347', 3.4, 0.8],
  [M + 33, SILL + 3, '#4fd8cf', 2.2, 0.45],
].map(([x, y, color, period, phase]) => ({ x, y, color, period, phase }));
const BEACON = { color: '#ff6b5e', period: 2.6, low: 0.08, high: 0.42 };

const C = {
  rain: '#8c9bb0',
  sky: '#aebcd2',
  boltHalo: '#8fa8c8',
  boltCore: '#dfe8f4',
  trail: '#7f93a8',
  bead: '#9fb2c6',
  shine: '#ffd9a8',
  shadow: '#0b1118',
  lamp: '#ffb35c',
};
/** The drop layer's colors, the only ones drawn on the glass itself. */
export const DROP_COLORS = [C.trail, C.bead, C.shine, C.shadow];
// Dark gunmetal paneling, its lit edges warmed a touch by the room
const METAL = {
  margin: '#111317', base: '#1d1f24', plate: '#22252b', lit: '#3d3633', shade: '#111317', seam: '#0c0d10', rivet: '#57504f',
  vent: '#08090c', pipe: '#262b33', collar: '#3b3f48', screen: '#0b1517', glyph: '#7a6136', sillLit: '#46353c',
};

/** A slow, smooth 0–1 pulse, so no light here ever snaps on or off. */
const pulse = (t, period, phase) => 0.5 - 0.5 * Math.cos(2 * Math.PI * (t / period + phase));

/** A tube's glow as a stepped band of rows above and below it, fading toward the band's ends; it covers a strip a few
 *  pixels tall, never the window. */
export function paintNeonGlow(p, { tube, glow, x0, x1, above, below }) {
  const y = tube[0][1];
  p.fillStyle = glow;
  const row = (yy, a) => {
    for (let x = x0; x < x1; x++) {
      const end = Math.min(x - x0, x1 - 1 - x);
      p.globalAlpha = a * (end === 0 ? 0.35 : end === 1 ? 0.7 : 1);
      p.fillRect(x, yy, 1, 1);
    }
  };
  above.forEach((a, i) => row(y - 1 - i, a));
  row(y, 0.6);
  below.forEach((a, i) => row(y + 1 + i, a));
  p.globalAlpha = 1;
}

export class CozyStormScene {
  /** `makeBitmap(w, h, paint)` lets the renderer lend its own scratch canvas, so the page keeps a single one. */
  constructor({ reducedMotion = false, seed = 0xc0257, makeBitmap = null } = {}) {
    this.reducedMotion = !!reducedMotion;
    this.seed = seed;
    this.sprites = new SpriteCache(makeBitmap);
    this.flash = new FlashGate();
    this.pen = new Pen(this.sprites);
    this.rng = new Mulberry32(seed);
    this.paneRng = new Mulberry32(seed ^ 0x9e3779b9);
    this.t = 0;
    this.drawn = new Map();
    this.rain = makeRain(() => this.rng.next(), RAIN_COUNT, RAIN_SPEED);
    this.mass = new Float32Array(N);
    this.wet = new Float32Array(N);
    this.slot = new Int16Array(N).fill(-1);
    this.beads = new Int32Array(MAX_BEADS);
    this.count = 0;
    this.runners = [];
    this.landAcc = 0;
    this.tickAcc = 0;
    this.ticks = 0;
    this.towers = this.#towers();
    this.beacon = this.#beacon();
    this.neonRng = new Mulberry32(seed ^ 0x5eed);
    this.neon = NEON.map(() => ({ dips: [], next: FLICKER_GAP[0] * this.neonRng.next() }));
    this.neonRestart = false;
    this.big = [];
    this.#clearRun();
    for (let i = 0; i < PREWARM / TICK; i++) this.#tick();
  }

  get flashLog() {
    return this.flash.log;
  }

  setReducedMotion(on) {
    if (this.reducedMotion && !on) this.neonRestart = true;
    this.reducedMotion = !!on;
    if (on) this.effects = [];
  }

  /** A new run brings the sky back to life; the glass keeps its rain. */
  reset() {
    this.#clearRun();
  }

  /** Cozy Storm has no dive, so nothing ever goes under. */
  plunge() {}

  onGameOver() {
    if (this.overAt === null) this.overAt = this.t;
  }

  update(dt) {
    const step = clamp(dt || 0, 0, 0.25);
    this.t += step;
    if (this.reducedMotion) return;
    this.tickAcc += step;
    for (let i = 0; this.tickAcc >= TICK && i < MAX_TICKS; i++) {
      this.tickAcc -= TICK;
      this.#tick();
    }
    this.tickAcc = Math.min(this.tickAcc, TICK);
    const t = this.t;
    this.#scheduleFlicker(t);
    if (this.overAt === null && t >= this.nextStrike) {
      if (t >= this.flash.free) {
        this.#strike(t);
        this.nextStrike = t + STRIKE_GAP[0] + this.rng.next() * STRIKE_GAP[1];
      } else this.nextStrike = this.flash.free;
    }
    if (this.effects.length) this.effects = this.effects.filter((e) => t < e.start + e.life);
  }

  /** How bright neon tube `i` is right now, 1 at full glow; reduced motion holds it steady. */
  neonLevel(i) {
    if (this.reducedMotion) return 1;
    let dip = 0;
    for (const d of this.neon[i].dips) {
      const u = (this.t - d.start) / DIP_LIFE;
      if (u > 0 && u < 1) dip = Math.max(dip, d.depth * Math.sin(Math.PI * u) ** 2);
    }
    return 1 - dip;
  }

  /** A clear thumps the glass: drops beside the cleared rows let go, and four lines shake the whole window loose.
   *  `rows` count from the top of the well. */
  onClear({ rows = [], lines = rows.length } = {}) {
    if (this.reducedMotion) return;
    const n = clamp(lines || 1, 1, 4);
    let y0 = 0;
    let y1 = BH;
    if (n < 4 && rows.length) {
      y0 = M + clamp(Math.min(...rows), 0, VISIBLE_ROWS - 1) * PX_PER_CELL - PX_PER_CELL;
      y1 = M + (clamp(Math.max(...rows), 0, VISIBLE_ROWS - 1) + 1) * PX_PER_CELL + PX_PER_CELL;
    }
    const least = n < 4 ? 0.6 : 0.9;
    for (const cell of this.beads.slice(0, this.count)) {
      const y = Math.floor(cell / BW);
      if (y < y0 || y >= y1 || this.mass[cell] < least) continue;
      this.#letGo(cell, 6 + 4 * n);
    }
  }

  drawBackdrop(ctx, wellRect) {
    this.drawn.clear();
    const g = this.pen.begin(ctx, wellRect);
    const t = this.reducedMotion ? STILL_T : this.t;
    ctx.save();
    ctx.beginPath();
    ctx.rect(g.ox, g.oy, g.w, g.h);
    ctx.clip();
    ctx.imageSmoothingEnabled = false;
    ctx.globalCompositeOperation = 'source-over';
    g.plate(this.sprites.get('outside', BW, BH, (p) => this.#paintOutside(p)), 1);
    this.drawn.set('sky', 1);
    this.drawn.set('rain', this.#drawRain(t));
    const bright = this.#skyBright();
    for (const e of this.effects) this.#drawStrike(e);
    if (this.beacon) {
      ctx.fillStyle = BEACON.color;
      ctx.globalAlpha = BEACON.low + (BEACON.high - BEACON.low) * pulse(t, BEACON.period, 0);
      g.dot(this.beacon.x, this.beacon.y);
      this.drawn.set('beacon', 1);
    }
    const over = this.overAt === null ? 0 : smooth(clamp((this.t - this.overAt) / GLOOM_TIME, 0, 1));
    if (over > 0) {
      // Game over: the storm outside sinks into gloom; the frame drawn over it stays lamplit
      ctx.globalAlpha = GLOOM * over;
      ctx.fillStyle = '#000';
      ctx.fillRect(g.ox, g.oy, g.w, g.h);
    }
    g.plate(this.sprites.get('frame', BW, BH, (p) => this.#paintFrame(p)), 1);
    this.drawn.set('frame', 1);
    this.drawn.set('neon', this.#drawNeon());
    this.drawn.set('leds', this.#drawLeds(t));
    // A desk lamp's warm reflection in the glass
    g.glow(C.lamp, 10, M + 8, M + 14, 0.12);
    this.drawn.set('lamp', 1);
    this.drawn.set('pane', this.#drawPane(bright));
    ctx.restore();
    // restore() keeps the current path, so drop the clip rect before the renderer's next fill()
    ctx.beginPath();
  }

  /** Everything happens behind the glass, so nothing draws over the blocks. */
  drawEffects() {}

  dispose() {
    this.sprites.dispose();
  }

  #clearRun() {
    this.overAt = null;
    this.effects = [];
    this.flash.free = -Infinity;
    this.nextStrike = this.t + 3 + this.rng.next() * 4;
  }

  /** The skyline's blocky towers as [x, width, height above the skyline], from the outside plate's own stream. */
  #towers() {
    const rng = new Mulberry32(this.seed + 7919);
    // The sky's 50 specks take the stream's first 100 values
    for (let i = 0; i < 100; i++) rng.next();
    return Array.from({ length: 5 }, () => [M + Math.floor(rng.next() * 36), 2 + Math.floor(rng.next() * 2), Math.floor(rng.next() * 5)]);
  }

  /** An antenna's warning light on the tallest tower whose mast shows through the glass, if any does. */
  #beacon() {
    const masts = this.towers.map(([tx, w, h]) => ({ x: tx + Math.floor(w / 2), y: SKYLINE + h - 3, h }));
    const seen = masts.filter((b) => paneOf(b.x, b.y) >= 0 && paneOf(b.x, b.y + 2) >= 0);
    return seen.sort((a, b) => a.h - b.h)[0] ?? null;
  }

  /** The storm sky down to a faint, dark far skyline: rolling hills and a few blocky towers, lit here and there. */
  #paintOutside(p) {
    const rng = new Mulberry32(this.seed + 7919);
    const r = () => rng.next();
    paintRows(p, 0, BH, '#161c26', '#2c3644');
    paintSpecks(p, r, 50, '#0f141c', 0.6, 0, SKYLINE - 2);
    const towers = this.towers;
    p.fillStyle = '#131921';
    for (let x = 0; x < BW; x++) {
      let top = SKYLINE + 5 + Math.round(1.6 * Math.sin(x * 0.19 + 0.7) + 1.2 * Math.sin(x * 0.07 + 2));
      for (const [tx, w, h] of towers) if (x >= tx && x < tx + w) top = Math.min(top, SKYLINE + h);
      p.fillRect(x, top, 1, BH - top);
    }
    if (this.beacon) p.fillRect(this.beacon.x, this.beacon.y + 1, 1, 2);
    // Nearer ground, a shade darker, below the lowest hilltop
    p.fillStyle = '#0d1117';
    p.fillRect(0, SKYLINE + 10, BW, BH - SKYLINE - 10);
    p.fillStyle = '#6a5a3c';
    p.globalAlpha = 0.35;
    for (const [tx, w, h] of towers.slice(0, 3)) p.fillRect(tx + Math.floor(w / 2), SKYLINE + h + 2, 1, 1);
    // A few more lit windows, cool screens and warm rooms, a little dimmer
    const lit = new Mulberry32(this.seed + 15485863);
    p.globalAlpha = 0.25;
    for (const [tx, w, h] of towers) {
      p.fillStyle = lit.next() < 0.5 ? '#4fa8b8' : '#8a6a3c';
      p.fillRect(tx + Math.floor(lit.next() * w), SKYLINE + h + 4 + Math.floor(lit.next() * 3), 1, 1);
    }
    p.globalAlpha = 1;
  }

  /** The window: gunmetal stiles, rails, and muntins lit from above by the room, riveted plates, a pipe and vents,
   *  a console sill with a dim readout, and clear panes. The neon and status lights are drawn live over it. */
  #paintFrame(p) {
    const fill = (color, x, y, w = 1, h = 1) => {
      p.fillStyle = color;
      p.fillRect(x, y, w, h);
    };
    const L = M;
    const R = M + WELL_W - 1;
    const B = M + WELL_H - 1;
    fill(METAL.margin, 0, 0, BW, BH);
    fill(METAL.base, L, L, WELL_W, WELL_H);
    for (const q of PANES) p.clearRect(q.x0, q.y0, q.x1 - q.x0, q.y1 - q.y0);
    for (const q of PANES) {
      // Each bar catches the lamp on its top and left edges and falls into shade on the others
      fill(METAL.lit, q.x0 - 1, q.y1, q.x1 - q.x0 + 2, 1);
      fill(METAL.shade, q.x0 - 1, q.y0 - 1, q.x1 - q.x0 + 2, 1);
      fill(METAL.lit, q.x1, q.y0, 1, q.y1 - q.y0);
      fill(METAL.shade, q.x0 - 1, q.y0, 1, q.y1 - q.y0);
    }
    const bolt = (x, y) => {
      fill(METAL.rivet, x, y);
      fill(METAL.seam, x, y + 1);
    };
    // Left stile: riveted plates
    for (const [, y1] of PANE_ROWS) {
      fill(METAL.seam, L, y1 - 10, 2, 1);
      bolt(L + 1, y1 - 14);
      bolt(L + 1, y1 - 7);
    }
    // Right stile: a coolant pipe held by clamps
    const px = PANE_COLS[1][1] + 1;
    fill(METAL.pipe, px, PANE_ROWS[0][0], 1, PANE_ROWS[2][1] - PANE_ROWS[0][0]);
    for (let y = PANE_ROWS[0][0] + 5; y < PANE_ROWS[2][1]; y += 12) fill(METAL.collar, px, y, 2, 1);
    // Muntin hubs where the bars cross
    for (const y of [PANE_ROWS[0][1], PANE_ROWS[1][1]]) {
      const x = PANE_COLS[0][1];
      fill(METAL.plate, x, y, 2, 2);
      fill(METAL.rivet, x, y);
      fill(METAL.seam, x + 1, y + 1);
    }
    // Top rail: sockets for two status lights, a vent, and the teal tube's groove and brackets
    for (let x = L + 10; x <= L + 18; x += 2) fill(METAL.vent, x, L + 1);
    for (const [x, , w] of NEON[1].tube) {
      fill(METAL.seam, x, L + 1, w, 1);
      fill(METAL.rivet, x - 1, L + 1);
      fill(METAL.rivet, x + w, L + 1);
    }
    for (const d of LEDS) fill(METAL.seam, d.x, d.y);
    for (const x of [L + 4, L + 15, L + 25, L + 35]) bolt(x, PANE_ROWS[2][1] + 1);
    // The sill console: the pink tube's channel and brackets, a lit lip, then vents, a readout, lights, and a pipe
    fill(METAL.seam, L, SILL, WELL_W, 1);
    for (const [x, , w] of PINK_TUBE) {
      fill(METAL.rivet, x - 1, SILL);
      fill(METAL.rivet, x + w, SILL);
    }
    fill(METAL.sillLit, L, SILL + 1, WELL_W, 1);
    fill(METAL.plate, L, SILL + 2, WELL_W, 4);
    for (let x = L + 2; x <= L + 10; x += 2) fill(METAL.vent, x, SILL + 3, 1, 2);
    for (const x of [L + 12, L + 27, L + 35]) fill(METAL.seam, x, SILL + 2, 1, 4);
    const sx = L + 14;
    fill(METAL.screen, sx, SILL + 2, 12, 3);
    for (const [x, y] of [[sx, SILL + 2], [sx + 11, SILL + 2], [sx, SILL + 4], [sx + 11, SILL + 4]]) fill(METAL.plate, x, y);
    p.globalAlpha = 0.6;
    for (const x of [2, 3, 5, 7, 8]) fill(METAL.glyph, sx + x, SILL + 3);
    p.globalAlpha = 1;
    for (const d of LEDS) if (d.y > SILL) fill(METAL.vent, d.x - 1, d.y, 3, 1);
    for (const y of [SILL + 3, SILL + 5]) fill(METAL.vent, L + 36, y, 3, 1);
    fill(METAL.pipe, L, B, WELL_W, 1);
    for (const x of [L + 5, L + 16, L + 27, L + 37]) fill(METAL.collar, x, B);
    // Chamfered outer corners, each with a lit bevel
    for (const [x, y, sx2, sy] of [[L, L, 1, 1], [R, L, -1, 1], [L, B, 1, -1], [R, B, -1, -1]]) {
      fill(METAL.margin, x, y);
      fill(METAL.margin, x + sx2, y);
      fill(METAL.margin, x, y + sy);
      fill(METAL.lit, x + 2 * sx2, y);
      fill(METAL.lit, x + sx2, y + sy);
      fill(METAL.lit, x, y + 2 * sy);
    }
    // The glass: a soft shadow under each pane's top and left lip, and two faint glare streaks
    p.fillStyle = '#06080b';
    p.globalAlpha = 0.3;
    for (const q of PANES) {
      p.fillRect(q.x0, q.y0, q.x1 - q.x0, 1);
      p.fillRect(q.x0, q.y0 + 1, 1, q.y1 - q.y0 - 1);
    }
    p.fillStyle = '#c8d4e0';
    for (const [x0, a] of [[34, 0.05], [41, 0.04]]) {
      p.globalAlpha = a;
      for (let y = 0; y < BH; y++) {
        const x = Math.round(x0 - y * 0.35);
        if (paneOf(x, y) >= 0) p.fillRect(x, y, 1, 1);
      }
    }
    p.globalAlpha = 1;
  }

  /** Books each tube's next flicker: one to three gentle dips, DIP_EVERY apart, then a long steady stretch. */
  #scheduleFlicker(t) {
    const r = this.neonRng;
    for (const n of this.neon) {
      if (n.dips.length && t > n.dips[0].start + DIP_LIFE) n.dips = n.dips.filter((d) => t < d.start + DIP_LIFE);
      // Back from reduced motion (or a stalled clock), drop what was booked and wait a full gap, so no dip starts mid-way
      if (this.neonRestart || n.next < t - FLICKER_GAP[0]) {
        n.dips = [];
        n.next = t + FLICKER_GAP[0] + r.next() * FLICKER_GAP[1];
      }
      while (t >= n.next) {
        const count = 1 + Math.floor(r.next() * 3);
        for (let k = 0; k < count; k++) n.dips.push({ start: n.next + k * DIP_EVERY, depth: DIP_DEPTH[0] + r.next() * DIP_DEPTH[1] });
        n.next += (count - 1) * DIP_EVERY + DIP_LIFE + FLICKER_GAP[0] + r.next() * FLICKER_GAP[1];
      }
    }
    this.neonRestart = false;
  }

  /** Each neon tube and its soft glow on the glass and frame beside it; returns the fills and plates drawn. */
  #drawNeon() {
    const g = this.pen;
    const { ctx } = g;
    let n = 0;
    NEON.forEach((tube, i) => {
      const k = this.neonLevel(i);
      ctx.globalCompositeOperation = 'lighter';
      g.plate(this.sprites.get(`neon|${i}`, BW, BH, (p) => paintNeonGlow(p, tube)), tube.glowAlpha * k);
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = tube.color;
      ctx.globalAlpha = tube.alpha * k;
      for (const [x, y, w] of tube.tube) g.dot(x, y, w, 1);
      n += 1 + tube.tube.length;
    });
    return n;
  }

  #drawLeds(t) {
    const g = this.pen;
    for (const d of LEDS) {
      g.ctx.fillStyle = d.color;
      g.ctx.globalAlpha = LED.low + (LED.high - LED.low) * pulse(t, d.period, d.phase);
      g.dot(d.x, d.y);
    }
    return LEDS.length;
  }

  // The pane's automaton

  #addBead(cell, m) {
    if (this.mass[cell] > 0) {
      this.mass[cell] += m;
      return true;
    }
    if (this.count >= MAX_BEADS) return false;
    this.mass[cell] = m;
    this.slot[cell] = this.count;
    this.beads[this.count++] = cell;
    return true;
  }

  #takeBead(cell) {
    const m = this.mass[cell];
    if (!(m > 0)) return 0;
    const i = this.slot[cell];
    const last = this.beads[--this.count];
    this.beads[i] = last;
    this.slot[last] = i;
    this.slot[cell] = -1;
    this.mass[cell] = 0;
    return m;
  }

  #tick() {
    const r = this.paneRng;
    this.ticks++;
    this.landAcc += LAND_RATE * TICK;
    while (this.landAcc >= 1) {
      this.landAcc -= 1;
      const q = PANES[Math.floor(r.next() * PANES.length)];
      const x = q.x0 + Math.floor(r.next() * (q.x1 - q.x0));
      const y = q.y0 + Math.floor(r.next() * (q.y1 - q.y0));
      this.#land(x, y, LAND_MASS[0] + r.next() * LAND_MASS[1]);
    }
    for (const run of this.runners) this.#flow(run);
    if (this.runners.some((run) => run.done)) this.runners = this.runners.filter((run) => !run.done);
    if (this.ticks % WET_EVERY === 0) {
      const k = Math.exp((-WET_EVERY * TICK) / WET_LIFE);
      const wet = this.wet;
      for (let i = 0; i < N; i++) if (wet[i] > 0) wet[i] = wet[i] < 0.02 ? 0 : wet[i] * k;
      // Backwards, since taking a bead moves the last one into its slot
      const drain = POOL_DRAIN * WET_EVERY * TICK;
      for (let i = this.count - 1; i >= 0; i--) {
        const cell = this.beads[i];
        if (!onBottomRow(cell)) continue;
        this.mass[cell] -= drain;
        if (this.mass[cell] < 0.25) this.#takeBead(cell);
      }
    }
  }

  /** A drop lands; every bead it touches coalesces into the biggest, which runs once it's heavy enough. */
  #land(x, y, m) {
    let best = -1;
    let total = m;
    const touching = [];
    for (let dy = -1; dy <= 1; dy++) {
      const yy = y + dy;
      if (yy < 0 || yy >= BH) continue;
      for (let dx = -1; dx <= 1; dx++) {
        const xx = x + dx;
        if (xx < 0 || xx >= BW) continue;
        const c = yy * BW + xx;
        if (!(this.mass[c] > 0)) continue;
        touching.push(c);
        if (best < 0 || this.mass[c] > this.mass[best]) best = c;
      }
    }
    if (best < 0) {
      this.#addBead(y * BW + x, m);
      return;
    }
    for (const c of touching) if (c !== best) total += this.#takeBead(c);
    this.mass[best] += total;
    if (onBottomRow(best)) this.mass[best] = Math.min(this.mass[best], POOL_MAX);
    const need = this.wet[best] > 0.2 ? WET_RUN_MASS : RUN_MASS;
    if (this.mass[best] >= need) this.#letGo(best, 0);
  }

  /** A bead becomes a runner; `coast` rows pass before it can stop, so a knocked-loose drop really slides. A bead
   *  already pooled on a bar has nowhere to run. */
  #letGo(cell, coast) {
    if (this.runners.length >= MAX_RUNNERS || onBottomRow(cell)) return;
    const x = cell % BW;
    const row = Math.floor(cell / BW);
    this.runners.push({ x, row, y: row, m: this.#takeBead(cell), pane: paneAt[cell], coast, done: false });
  }

  #flow(run) {
    const r = this.paneRng;
    const q = PANES[run.pane];
    run.y += TRICKLE * TICK;
    while (!run.done && Math.floor(run.y) > run.row) {
      const row = run.row + 1;
      if (row >= q.y1) {
        // It reached the bar below its pane and pools there
        run.done = true;
        const cell = run.row * BW + run.x;
        if (this.#addBead(cell, Math.max(0.3, run.m))) this.mass[cell] = Math.min(this.mass[cell], POOL_MAX);
        return;
      }
      const prev = run.row * BW + run.x;
      const wide = run.m >= RUN_MASS ? 2 : 1;
      let x = run.x;
      if (r.next() < MEANDER) x += r.next() < 0.5 ? -1 : 1;
      x = clamp(x, q.x0, q.x1 - wide);
      run.x = x;
      run.row = row;
      for (let dx = -1; dx <= wide; dx++) {
        if (x + dx >= q.x0 && x + dx < q.x1) run.m += this.#takeBead(row * BW + x + dx);
      }
      for (let dx = 0; dx < wide; dx++) this.wet[row * BW + x + dx] = 1;
      run.m -= TRAIL_LOSS;
      // Now and then a rivulet leaves a bead behind on its way down
      if (run.m > 1.5 && r.next() < 0.03 && this.#addBead(prev, 0.5)) run.m -= 0.5;
      if (run.coast > 0) run.coast--;
      else if (run.m < STOP_MASS) {
        run.done = true;
        this.#addBead(row * BW + x, Math.max(0.3, run.m));
      }
    }
  }

  // Drawing

  /** The downpour outside, behind the frame (which hides whatever falls on the bars); returns the streaks drawn. */
  #drawRain(t) {
    const g = this.pen;
    const D = SILL + RAIN_LEN;
    g.ctx.fillStyle = C.rain;
    g.ctx.globalAlpha = RAIN_ALPHA;
    for (const d of this.rain) {
      const y = Math.round(-RAIN_LEN + frac((t * d.v) / D + d.off) * D);
      g.dot(mod(Math.round(d.x + y * RAIN_SLANT), BW), y, 1, RAIN_LEN);
    }
    return this.rain.length;
  }

  #skyBright() {
    let b = 0;
    for (const e of this.effects) b = Math.max(b, this.#strikeCurve(e) * e.k);
    return b;
  }

  #strikeCurve(e) {
    const age = this.t - e.start;
    if (age < 0 || age >= e.life) return 0;
    return age < SKY_RISE ? age / SKY_RISE : (1 - (age - SKY_RISE) / (e.life - SKY_RISE)) ** 2;
  }

  #strike(t) {
    this.flash.reserve(t);
    const r = this.rng;
    const k = 0.6 + 0.4 * r.next();
    const px = r.next() < BOLT_CHANCE ? forkedStrike(r, M + 2, SKYLINE - 1) : null;
    this.effects.push({ kind: 'sky', start: t, life: SKY_LIFE, k, px });
  }

  /** The sky behind the glass brightens, inside the well only, and a far bolt shows through when there is one. */
  #drawStrike(e) {
    const b = this.#strikeCurve(e) * e.k;
    if (b <= 0.001) return;
    const { ctx, wx, wy, ww } = this.pen;
    ctx.fillStyle = C.sky;
    ctx.globalAlpha = SKY_BRIGHT * b;
    ctx.fillRect(wx, wy, ww, this.pen.rowY(SKYLINE) - wy);
    if (e.px) drawBoltPx(this.pen, e.px, 0.55 * b, { halo: C.boltHalo, core: C.boltCore });
    this.drawn.set('strike', (this.drawn.get('strike') ?? 0) + 1);
  }

  /** Trails as run-length columns grouped by wetness, then beads and runners, each kept on its own pane; returns
   *  the drops drawn. */
  #drawPane(bright) {
    const g = this.pen;
    const { ctx } = g;
    ctx.fillStyle = C.trail;
    const wet = this.wet;
    for (let x = 0; x < BW; x++) {
      let start = 0;
      let level = 0;
      for (let y = 0; y <= BH; y++) {
        const w = y < BH ? wet[y * BW + x] : 0;
        const l = w > TRAIL_LEVELS[2] ? 3 : w > TRAIL_LEVELS[1] ? 2 : w > TRAIL_LEVELS[0] ? 1 : 0;
        if (l === level) continue;
        if (level) {
          ctx.globalAlpha = TRAIL_ALPHA[level - 1];
          g.dot(x, start, 1, y - start);
        }
        level = l;
        start = y;
      }
    }
    // Lightning outside lights the drops up a little too
    const lift = 1 + 1.5 * bright;
    const big = this.big;
    big.length = 0;
    ctx.fillStyle = C.bead;
    for (let i = 0; i < this.count; i++) {
      const cell = this.beads[i];
      const m = this.mass[cell];
      const x = cell % BW;
      const y = (cell - x) / BW;
      if (m < 1.6) {
        ctx.globalAlpha = Math.min(1, (m < 0.7 ? 0.35 : 0.6) * lift);
        g.dot(x, y);
      } else {
        const q = PANES[paneAt[cell]];
        const bx = Math.min(x, q.x1 - 2);
        const by = Math.min(y, q.y1 - 2);
        ctx.globalAlpha = Math.min(1, 0.55 * lift);
        g.dot(bx, by, 2, 2);
        big.push(bx, by, m, q);
      }
    }
    for (const run of this.runners) {
      const q = PANES[run.pane];
      const w = Math.min(run.m >= RUN_MASS ? 2 : 1, q.x1 - run.x);
      const top = Math.max(q.y0, run.row - 1);
      if (run.row - 3 >= q.y0) {
        ctx.globalAlpha = Math.min(1, 0.35 * lift);
        g.dot(run.x, run.row - 3, 1, 2);
      }
      ctx.globalAlpha = Math.min(1, 0.7 * lift);
      g.dot(run.x, top, w, run.row - top + 1);
      // The next pixel down fills in as the drop creeps toward it, so the crawl reads smooth on the chunky grid
      const lead = frac(run.y);
      if (run.row + 1 < q.y1 && lead > 0.2) {
        ctx.globalAlpha = Math.min(1, 0.55 * lead * lift);
        g.dot(run.x, run.row + 1, w, 1);
      }
      big.push(run.x, top, run.m, q);
    }
    // Big drops read as lenses: a dark rim under them and the room's warm light caught on top
    ctx.fillStyle = C.shadow;
    ctx.globalAlpha = 0.35;
    for (let i = 0; i < big.length; i += 4) {
      const q = big[i + 3];
      if (big[i + 2] >= 2.4 && big[i + 1] + 2 < q.y1) g.dot(Math.min(big[i], q.x1 - 2), big[i + 1] + 2, 2, 1);
    }
    ctx.fillStyle = C.shine;
    ctx.globalAlpha = 0.55;
    for (let i = 0; i < big.length; i += 4) g.dot(big[i], big[i + 1]);
    return this.count + this.runners.length;
  }
}
