// Adrift: the Unowned theme's backdrop, the site warp background's flight without its nebulae or galaxies. Stars
// stream outward from the center as the ship drifts forward, faster as the level climbs, until they streak past.
import { Mulberry32 } from '../core/engine.js';
import { STAR_COLORS } from '../themes/themes.js';

// About a third are on screen at once: a star only stays in view while it's nearer the center than its depth
export const STAR_COUNT = 1000;
// Depth units a second (a star is born at depth 1 and passes the camera at 0): a slow cruise on the menus and at
// level 0, climbing with the level until the field is streaking
export const CRUISE = 0.035;
export const TOP_SPEED = 0.55;
const TOP_LEVEL = 20;
// The speed eases toward its target over about this long, so a level up surges rather than jumps
const EASE = 1.5;
// A streak reaches back to where the star was this long ago at the speed gained over cruise, so a cruising field
// is all dots and the tails only grow as the level climbs
const STREAK_SECONDS = 0.096;
const NEAR = 0.03;
// New stars fade in over the first stretch of their approach, so none pops into being
const FADE_IN = 0.15;
const TWINKLE = 0.25;
const OVER_DIM = 0.45;
const OVER_TIME = 1.4;
// The warp background's stars mix 60% of their color into white; these keep a little more of it
const COLOR_MIX = 0.75;
// Brightness steps and streak widths per tint, so a frame changes fill and alpha a few dozen times instead of once
// per star; ten steps keep fades and twinkles smooth
const BANDS = 10;
const WIDTHS = [1, 1.6, 2.3];
// A star fades out over its last stretch, so one passing dead center never blinks out bright
const FADE_OUT = 0.05;

const mixWhite = (hex, t) => {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v) => Math.round(255 + (v - 255) * t);
  return `rgb(${ch((n >> 16) & 255)}, ${ch((n >> 8) & 255)}, ${ch(n & 255)})`;
};
const TINTS = STAR_COLORS.map((c) => mixWhite(c, COLOR_MIX));
const smooth = (p) => p * p * (3 - 2 * p);

/** How fast the field flies at a level: cruise at 0, easing up to top speed at TOP_LEVEL. */
export const speedFor = (level) => CRUISE + (TOP_SPEED - CRUISE) * Math.min(1, Math.max(0, level) / TOP_LEVEL) ** 1.6;

export class AdriftScene {
  constructor({ reducedMotion = false, seed = 0xad21f7, makeBitmap = null } = {}) {
    this.reducedMotion = !!reducedMotion;
    this.t = 0;
    this.overAt = null;
    this.speed = CRUISE;
    this.target = CRUISE;
    this.rng = new Mulberry32(seed);
    this.viewW = 0;
    this.viewH = 0;
    this.viewEpoch = 0;
    // x and y are fractions of the screen's half-width and half-height, so a star born at depth 1 can be anywhere on it
    this.stars = Array.from({ length: STAR_COUNT }, () => this.#spawn(NEAR + this.rng.next() * (1 - NEAR)));
    this.paths = TINTS.map(() => Array.from({ length: BANDS + 1 }, () => WIDTHS.map(() => [])));
  }

  #starGeometry(star, cx, cy) {
    const px = star.x * cx;
    const py = star.y * cy;
    const radial = Math.hypot(px, py);
    star.px = px;
    star.py = py;
    star.radial = radial;
    star.ux = radial ? px / radial : 1;
    star.uy = radial ? py / radial : 0;
    star.geomEpoch = this.viewEpoch;
  }

  #syncProjection(width, height) {
    if (width === this.viewW && height === this.viewH) return;
    this.viewW = width;
    this.viewH = height;
    this.viewEpoch += 1;
    const cx = width / 2;
    const cy = height / 2;
    for (const star of this.stars) this.#starGeometry(star, cx, cy);
  }

  #spawn(z, star = {}) {
    const r = this.rng;
    star.x = r.next() * 2 - 1;
    star.y = r.next() * 2 - 1;
    star.z = z;
    star.tint = Math.floor(r.next() * TINTS.length);
    star.phase = r.next() * Math.PI * 2;
    star.rate = 0.6 + r.next() * 1.4;
    star.geomEpoch = -1;
    if (this.viewW) this.#starGeometry(star, this.viewW / 2, this.viewH / 2);
    return star;
  }

  setReducedMotion(on) {
    this.reducedMotion = !!on;
  }

  update(dt, state = {}) {
    const step = Math.min(0.25, Math.max(0, dt || 0));
    this.t += step;
    this.target = this.overAt === null && state.playing ? speedFor(Number.isFinite(state.level) ? state.level : 0) : CRUISE;
    this.speed += (this.target - this.speed) * Math.min(1, step / EASE);
    if (this.reducedMotion) return;
    const dz = this.speed * step;
    for (const s of this.stars) {
      s.z -= dz;
      if (s.z <= NEAR) this.#spawn(1, s);
    }
  }

  reset() {
    this.overAt = null;
  }

  onGameOver() {
    if (this.overAt === null) this.overAt = this.t;
  }

  plunge() {}

  onClear() {}

  /** The starfield fills the whole canvas behind the well and the menus. */
  drawBackdrop(ctx, wellRect) {
    const W = ctx.canvas.width;
    const H = ctx.canvas.height;
    this.#syncProjection(W, H);
    const cx = W / 2;
    const cy = H / 2;
    // Star sizes follow the well's cell, so they read the same at any pixel density
    const unit = Math.max(1, (wellRect?.cell ?? 24) / 24);
    const still = this.reducedMotion;
    const dim = this.overAt === null ? 1 : 1 - OVER_DIM * Math.min(1, (this.t - this.overAt) / OVER_TIME);
    const trail = still ? 0 : Math.max(0, this.speed - CRUISE) * STREAK_SECONDS;
    const streaking = trail > 1e-7;
    const paths = this.paths;
    for (const tint of paths) for (const band of tint) for (const list of band) list.length = 0;

    for (const s of this.stars) {
      const zt = streaking ? Math.min(1, s.z + trail) : s.z;
      if (Math.abs(s.px) > (cx + 8) * zt || Math.abs(s.py) > (cy + 8) * zt) continue;

      const invZ = 1 / s.z;
      const near = 1 - s.z;
      let fade = 1;
      if (near < FADE_IN) fade *= smooth(near / FADE_IN);
      if (s.z < NEAR + FADE_OUT) fade *= smooth((s.z - NEAR) / FADE_OUT);
      const twinkle = still ? 1 : 0.875 + 0.125 * Math.sin(this.t * s.rate + s.phase);
      const band = Math.round((0.2 + 0.8 * near) * fade * twinkle * BANDS);
      if (band < 1) continue;

      const wi = near < 1 / 3 ? 0 : near < 2 / 3 ? 1 : 2;
      const list = paths[s.tint][band][wi];
      if (!streaking) {
        list.push(cx + s.px * invZ, cy + s.py * invZ);
        continue;
      }

      const invZt = 1 / zt;
      const midInv = (invZ + invZt) / 2;
      list.push(cx + s.px * midInv, cy + s.py * midInv, s.radial * (invZ - invZt), s.ux, s.uy);
    }

    // Filled rectangles avoid dynamic paths that can force slow software rasterization.
    ctx.globalCompositeOperation = 'source-over';
    for (let k = 0; k < TINTS.length; k++) {
      ctx.fillStyle = TINTS[k];
      for (let b = 1; b <= BANDS; b++) {
        const buckets = paths[k][b];
        if (!buckets[0].length && !buckets[1].length && !buckets[2].length) continue;
        ctx.globalAlpha = (b / BANDS) * dim;
        for (let w = 0; w < WIDTHS.length; w++) {
          const list = buckets[w];
          if (!list.length) continue;
          const width = WIDTHS[w] * unit;
          const half = width / 2;
          if (!streaking) {
            for (let i = 0; i < list.length; i += 2) {
              ctx.fillRect(list[i] - half, list[i + 1] - half, width, width);
            }
            continue;
          }
          for (let i = 0; i < list.length; i += 5) {
            const x = list[i];
            const y = list[i + 1];
            const len = list[i + 2];
            if (len < 0.01) {
              ctx.setTransform(1, 0, 0, 1, 0, 0);
              ctx.fillRect(x - half, y - half, width, width);
              continue;
            }
            ctx.setTransform(list[i + 3], list[i + 4], -list[i + 4], list[i + 3], x, y);
            ctx.fillRect(-(len + width) / 2, -half, len + width, width);
          }
        }
      }
    }
    if (streaking) ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
  }

  drawEffects() {}

  dispose() {}
}
