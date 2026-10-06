// CUCKBLOX hologram themes. The renderer only asks a theme "what color is this block, right now?", so a theme can
// be one color, one color per piece, or a pattern laid across the whole well. Prices are kcr; credits.js sells them.
import { TEXT } from '../text.js';

const GREEN = '#7ed957';
const RED_7 = '#ff0000';
/** The nearest legal red; the paint shop swaps Red 7™ for it. */
export const RED_6 = '#fe0000';
const legalize = (hex) => (hex.toLowerCase() === RED_7 ? RED_6 : hex);
const GREEN_BG = '#030b04';

export function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? [...h].map((c) => c + c).join('') : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex([r, g, b]) {
  return `#${[r, g, b].map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('')}`;
}

export function mix(a, b, t) {
  const x = hexToRgb(a);
  const y = hexToRgb(b);
  return rgbToHex(x.map((v, i) => v + (y[i] - v) * t));
}

export function withAlpha(hex, a) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/** Small integer hash for patterns that should look random but stay put. */
function hash(x, y = 0) {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return (h ^ (h >>> 16)) >>> 0;
}

const mod = (a, n) => ((a % n) + n) % n;

/** `hex` turned `dh` degrees around the color wheel and lightened by `dl` (0–1), saturation kept. */
export function shiftHsl(hex, dh, dl) {
  const [r, g, b] = hexToRgb(hex).map((v) => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  const h = d === 0 ? 0 : max === r ? mod((g - b) / d, 6) * 60 : max === g ? ((b - r) / d + 2) * 60 : ((r - g) / d + 4) * 60;
  const L = Math.min(0.88, Math.max(0.12, l + dl));
  const H = mod(h + dh, 360);
  const c = (1 - Math.abs(2 * L - 1)) * s;
  const x = c * (1 - Math.abs(mod(H / 60, 2) - 1));
  const [r1, g1, b1] = H < 60 ? [c, x, 0] : H < 120 ? [x, c, 0] : H < 180 ? [0, c, x] : H < 240 ? [0, x, c] : H < 300 ? [x, 0, c] : [c, 0, x];
  return legalize(rgbToHex([r1, g1, b1].map((v) => (v + L - c / 2) * 255)));
}

// One-color themes nudge each piece type around their color (degrees, lightness) so pieces stay tellable apart;
// a grey has no hue to turn, so the lightness steps alone carry it
const PIECE_SHIFTS = [[0, 0], [10, 0.05], [-10, -0.05], [20, -0.025], [-20, 0.025], [30, -0.09], [-30, 0.09]];
export const pieceShades = (color) => PIECE_SHIFTS.map(([dh, dl]) => shiftHsl(color, dh, dl));

/** Turns a spec into what the renderer reads. `body`/`glow` get (type, x, y, zone, t, dive): zone is 'active'
 *  (falling piece, previews) or 'stack', t is already stepped to the theme's frame rate, and dive is the Osminok palette state. */
export function buildTheme(spec) {
  const ui = { background: GREEN_BG, frame: GREEN, text: '#9ee87c', ...spec.ui };
  const body = spec.body;
  return {
    id: spec.id,
    name: spec.name,
    kcr: spec.kcr ?? 0,
    price: spec.kcr ? TEXT.themes.price(spec.kcr) : TEXT.themes.standardPrice,
    fps: spec.fps ?? 0,
    glowBoost: spec.glowBoost ?? 1,
    stars: spec.stars ?? null,
    dive: spec.dive ?? false,
    // Which animated backdrop the renderer loads behind the well; a dive is always Osminok's
    scene: spec.scene ?? (spec.dive ? 'osminok' : null),
    ambience: spec.ambience ?? null,
    sponsored: spec.sponsored ?? false,
    background: ui.background,
    frame: ui.frame,
    grid: withAlpha(ui.frame, 0.07),
    text: ui.text,
    dimText: withAlpha(ui.text, 0.6),
    ghost: withAlpha(spec.ghost ?? ui.frame, 0.45),
    calloutText: mix(ui.text, '#ffffff', 0.82),
    calloutOutline: withAlpha(ui.background, 0.9),
    body,
    glow: spec.glow ?? body,
    spec,
  };
}

/** A one-color theme; `shades: false` keeps every piece the exact color. */
function mono(id, name, color, { shades = true, ...extra } = {}) {
  const tints = pieceShades(color);
  return {
    id,
    name,
    ui: { frame: color, text: mix(color, '#ffffff', 0.25), background: mix('#020202', color, 0.05) },
    body: shades ? (type) => tints[type] ?? color : () => color,
    ...extra,
  };
}

// Wraps tint the whole terminal too: [frame, text, background] picked from each pattern's palette
const wrap = (spec, [frame, text, background]) => ({ ui: { frame, text, background }, ...spec });

const HOUNDSTOOTH = ['XX..', 'XXX.', '..XX', '..X.'];
const SWIRL = ['#2b1a5a', '#5b2a9a', '#a24ad8', '#e07ad8', '#5ad2e8', '#2a6ab8'];
const RAINBOW = ['#ff3b3b', '#ff9a1f', '#ffe53b', '#3bd65a', '#3b9dff', '#5a4bff', '#b44bff'];
const FLAMES = ['#3a0a05', '#7a1408', '#c0300c', '#ef6a12', '#ffb43a', '#fff2b0'];
const CAMO = ['#3f4a2a', '#5d6b3a', '#8a8a5c', '#2a2f1f'];
const SEAS = ['#0b3c5d', '#1d6a8a', '#2fa3b5', '#7fd6d0'];
const NEAPOLITAN = ['#f2a2b4', '#f6e7b4', '#7a4b2f'];
// Octarine, the eighth color: thirteen steps from fluorescent green-yellow through violet and back
const OCTARINE = Array.from({ length: 13 }, (_, i) => mix('#c8ff3c', '#9b4bff', Math.sin((i / 13) * Math.PI)));
const RAIN = ['#d8ffd0', '#5ee35e', '#2a9d3a', '#123f1a'];
// The galaxy map's NAVICOMPUTER title: this gradient, 300% wide, drifting one full loop every 69 s
const NAVI = ['#8332ac', '#f679e5', '#41ead4', '#3633ff', '#ff90e0', '#8332ac'];
const NAVI_SPAN = 3 * 10;
const NAVI_LOOP = 69;
const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];

const ANIMALS = [
  (x) => (mod(x, 2) ? '#111111' : '#f5f5f5'), // I: zebra
  (x, y) => (mod(x + y, 3) === 0 ? '#1a1208' : '#ff8c1a'), // T: tiger
  (x, y) => (hash(x, y) % 3 === 0 ? '#1b1b1b' : '#f8f8f8'), // L: cow
  (x, y) => (hash(x, y) % 4 === 0 ? '#7a4a1f' : '#e8b860'), // J: giraffe
  (x, y) => ['#2b1d0e', '#8a5a20', '#e2b25a', '#e2b25a', '#e2b25a'][hash(x, y) % 5], // Z: leopard
  (x, y) => (mod(x + y, 2) ? '#2f7a2f' : '#a8d65a'), // S: snake
  (x, y) => (hash(x, y) % 6 === 0 ? '#111111' : '#fafafa'), // O: dalmatian
];

const rgb = (r, g, b) => rgbToHex([r * 255, g * 255, b * 255]);
const smooth = (t) => t * t * (3 - 2 * t);

/** Value noise on the integer hash, 0–1, smooth between lattice points. */
function vnoise(x, y) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const u = smooth(x - xi);
  const v = smooth(y - yi);
  const h = (a, b) => hash(a, b) / 4294967295;
  const top = h(xi, yi) + (h(xi + 1, yi) - h(xi, yi)) * u;
  const bottom = h(xi, yi + 1) + (h(xi + 1, yi + 1) - h(xi, yi + 1)) * u;
  return top + (bottom - top) * v;
}

const fbm = (x, y) => 0.65 * vnoise(x, y) + 0.35 * vnoise(x * 2.03 + 17.1, y * 2.03 + 9.7);

// The Broken Arm Nebula's six emission spheres from the galaxy map (volumetric.js), thick end to thin end, each
// [color, color2, weight]; weight is the sphere's scale squared, its share of the sky
const NEBULA = [
  [rgb(0.90, 0.30, 0.58), rgb(0.25, 0.30, 0.70), 140 ** 2],
  [rgb(0.85, 0.25, 0.55), rgb(0.35, 0.12, 0.50), 120 ** 2],
  [rgb(0.65, 0.22, 0.50), rgb(0.12, 0.35, 0.50), 130 ** 2],
  [rgb(0.35, 0.28, 0.55), rgb(0.12, 0.38, 0.52), 110 ** 2],
  [rgb(0.12, 0.35, 0.50), rgb(0.08, 0.40, 0.45), 100 ** 2],
  [rgb(0.10, 0.38, 0.48), rgb(0.20, 0.28, 0.60), 80 ** 2],
];
// Its two dark dust lanes absorb light, so they read as dimmed mauve
const NEBULA_DUST = [mix(rgb(0.55, 0.45, 0.60), '#000000', 0.55), mix(rgb(0.45, 0.50, 0.65), '#000000', 0.55)];
const DUST_SHARE = 0.12;

/** Domain-warped noise drifting across the well: `s` runs pink at the floor to teal up top, `dust` marks the lanes. */
function nebulaFields(x, y, t) {
  const px = x * 0.32;
  const py = y * 0.32;
  const qx = fbm(px + t * 0.06, py);
  const qy = fbm(px + 5.2, py + 1.3 - t * 0.05);
  const along = Math.min(1, Math.max(0, (y / 21) * 0.7 + (x / 9) * 0.3));
  return {
    s: 0.5 * along + 0.5 * fbm(px + 2.2 * qx, py + 2.2 * qy),
    dust: fbm(px * 0.8 + 31 - t * 0.03, py * 0.8 + 7),
    pick: fbm(px * 1.7 + 11, py * 1.7 + t * 0.04),
    along,
  };
}

// Noise bunches up in the middle, so the band edges are quantiles of a sample over the well and a stretch of
// drift: each sphere then covers its real share of the sky, and the dust its own
const NEBULA_EDGES = (() => {
  const s = [];
  const dust = [];
  for (let t = 0; t < 60; t += 3.7) {
    for (let y = 0; y < 22; y++) for (let x = 0; x < 10; x++) {
      const f = nebulaFields(x, y, t);
      s.push(f.s);
      dust.push(f.dust);
    }
  }
  s.sort((a, b) => a - b);
  dust.sort((a, b) => a - b);
  const total = NEBULA.reduce((sum, [, , w]) => sum + w, 0);
  let cumulative = 0;
  const bands = NEBULA.map(([, , w]) => s[Math.min(s.length - 1, Math.floor(((cumulative += w) / total) * s.length))]);
  return { bands, dust: dust[Math.floor((1 - DUST_SHARE) * dust.length)] };
})();

function brokenArm(x, y, t) {
  const f = nebulaFields(x, y, t);
  if (f.dust > NEBULA_EDGES.dust) return NEBULA_DUST[f.along < 0.5 ? 0 : 1];
  const i = NEBULA_EDGES.bands.findIndex((edge) => f.s <= edge);
  const band = NEBULA[i < 0 ? NEBULA.length - 1 : i];
  return f.pick > 0.5 ? band[1] : band[0];
}

/** The sparkle at a board cell, or null: about one cell in six holds a five-point star with its own size class
 *  (0–2), resting spin, and twinkle. The same cell always holds the same star. */
export function starAt(x, y, density) {
  const h = hash(x * 7 + 3, y * 13 + 5);
  if ((h % 1000) / 1000 >= density) return null;
  return {
    size: (h >>> 10) % 3,
    spin: (((h >>> 12) % 360) * Math.PI) / 180,
    phase: (((h >>> 4) % 628) / 100),
    rate: 0.6 + ((h >>> 20) % 50) / 50,
    depth: 0.3 + ((h >>> 16) % 25) / 100,
  };
}

function shootingStars(x, y, t) {
  for (let k = 0; k < 4; k++) {
    const speed = 5 + (hash(k) % 4);
    const hx = mod(hash(k, 1) % 12 + t * speed, 16) - 3;
    const hy = 21 - mod(t * speed * 0.8 + (hash(k, 2) % 20), 26);
    for (let i = 0; i < 3; i++) {
      if (Math.round(hx - i) === x && Math.round(hy + i) === y) return ['#ffffff', '#bcd4ff', '#5f7fd8'][i];
    }
  }
  return hash(x, y) % 23 === 0 ? '#3a4a8a' : '#0a0f2e';
}

/** The NAVICOMPUTER gradient at a cell, dithered between its two nearest stops instead of blended. */
function naviColor(x, y, t) {
  const u = mod((x + 0.5) / NAVI_SPAN - t / NAVI_LOOP, 1) * (NAVI.length - 1);
  const i = Math.floor(u);
  return u - i > (BAYER[mod(y, 4)][mod(x, 4)] + 0.5) / 16 ? NAVI[i + 1] : NAVI[i];
}

// Osminok Ocean: three living lights per dive zone (DIVE_ZONES order), from the dive page's shallow, twilight, and
// abyss palettes. Every one keeps 4.5:1 contrast on the theme's background, however deep the zone.
export const OSMINOK_PALETTES = [
  ['#41ead4', '#78e6c8', '#64d2e6'],
  ['#6482ff', '#50a0ff', '#b464dc'],
  ['#a0e0ff', '#fcec60', '#c0a8ff'],
  ['#ffa032', '#ff7820', '#ffd060'],
  ['#d84ad0', '#a050ff', '#ff8ad8'],
  ['#6af0ff', '#ff7ae0', '#b0ff8a'],
  ['#9fb8c8', '#d8c8a8', '#8fa8ff'],
  ['#b464e6', '#c88cff', '#e0b0ff'],
];
// A zone crossfade is an ordered 2×2 dissolve, block by block, so it adds no in-between colors (each one would
// cost a glow sprite)
const DISSOLVE = [0, 2, 3, 1];

/** A block's light: `dive` is { zone, from, fade } with fade stepped in quarters; no dive means the surface. */
export function osminokColor(type, x, y, dive) {
  const zone = dive?.zone ?? 0;
  const fade = dive?.fade ?? 1;
  const z = fade >= 1 || DISSOLVE[mod(x, 2) + 2 * mod(y, 2)] / 4 < fade ? zone : dive.from;
  return OSMINOK_PALETTES[z][mod(type, 3)];
}

// Cozy Storm's blocks come from its window's neon, lights, and city: teal, magenta, green, amber, steel, coral, violet
const COZY = ['#337b78', '#9c436a', '#466c4d', '#a8763a', '#4a6a8e', '#a34e48', '#6e5490'];
/** Cozy Storm's sound, for the shell to play while the theme is on: a seamless rain loop (`file`, beside the page) */
export const COZY_STORM_AMBIENCE = { file: 'sounds/cozy-storm-ambience.ogg', lowpassHz: 8000, gain: 0.35 };
/** Osminok's menus preview its megastorm; in a run the dive's own soundscape carries the storm, so this one bows out. */
export const OSMINOK_AMBIENCE = { file: '../assets/audio/surface/OsminokMegastorm.ogg', lowpassHz: 15000, gain: 0.3, menuOnly: true };

const FACTIONS = [
  ['boc-bloc', 'BOC BLOC', '#e7191f'],
  ['business-de-borto', 'BUSINESS DE BORTO', '#dd7733'],
  ['comexo', 'COMEXO CORP', '#8aceff'],
  ['criminal', 'CRIMINAL', '#aa4466'],
  ['gas-n-gripe', 'GRIPPIANI ENTERPRISES', '#6a696b'],
  ['independent', 'INDEPENDENT', '#a6a6a6'],
  ['neo-gio', 'NEO-GIOVANNI', '#35538f'],
  ['shrike-co', 'SHRIKE CO.', '#9f2101'],
  ['the-board', 'THE BOARD', '#9966cc'],
  ['the-hawke-consortium', 'THE HAWKE CONSORTIUM', '#cc8844'],
  ['adrift', 'UNOWNED', '#555555'],
];

/** One-click colors in the paint shop as [name, color, the theme whose owners get it free]. */
export const STOCK_PAINTS = [
  ['C.U.C.K. GREEN', GREEN, 'cuck-green'],
  ...FACTIONS.map(([id, name, color]) => [name, color, id]),
  ['WHITE', '#ffffff', 'lightblocks-white'],
  ['VOID', '#050505', null],
];

const GREEN_SHADES = pieceShades(GREEN);
// Grippiani Enterprises' theme wears its gas-station chain's colors, and says so
const GAS_N_GRIPE = { id: 'gas-n-gripe', name: 'GAS-N-GRIPE', sponsored: true, ui: { frame: '#ff7357', text: '#ffd2b4', background: '#120605' }, body: (type) => GNG[type] ?? GNG[0] };
const AMBER_REDS = pieceShades('#d8261c');
// Gas-N-Gripe's creamsicle and rust, with its sunset yellow, rocket tan, teal water, cherry stripe, and cream
const GNG = ['#ff7357', '#d64124', '#f7ab1f', '#e39d6e', '#2d808a', '#a81e24', '#ddb68e'];
/** The site warp background's star palette, shared by Adrift's stars and its blocks. */
export const STAR_COLORS = ['#ffffff', '#dce6ff', '#aabfff', '#fff4e8', '#ffed97', '#ffc46b', '#ff9a5c'];

const SPECS = [
  { id: 'cuck-green', name: 'C.U.C.K. GREEN', body: (type) => GREEN_SHADES[type] ?? GREEN },
  mono('lightblocks-white', 'SURRENDER WHITE', '#ffffff', { shades: false, ui: { frame: '#e8e8e8', text: '#ffffff', background: '#08090c' } }),
  {
    id: 'soviet-red-amber',
    name: 'EYE-STRAIN RELIEF',
    ui: { frame: '#ffb000', text: '#ffbf33', background: '#0e0402' },
    body: (type) => AMBER_REDS[type] ?? AMBER_REDS[0],
    glow: () => '#ffb000',
  },
  wrap({ id: 'houndstooth', name: 'CLASSIC HOUNDSTOOTH', body: (type, x, y) => (HOUNDSTOOTH[mod(y, 4)][mod(x, 4)] === 'X' ? '#2b2b2b' : '#f2ead8') }, ['#d9cfb8', '#f2ead8', '#0b0a08']),
  wrap({
    id: 'checkerboard',
    name: 'COUNTRY CHECKERBOARD',
    body: (type, x, y) => ['#fbf3f0', '#e88a9a', '#c8102e'][(mod(x, 2) === 0) + (mod(y, 2) === 0)],
  }, ['#e0384f', '#f7c9d1', '#120406']),
  wrap({ id: 'neapolitan', name: 'CREAMY NEAPOLITAN', body: (type) => NEAPOLITAN[type % 3] }, ['#f2a2b4', '#f6e7b4', '#100906']),
  wrap({
    id: 'digicode',
    name: 'DIGICODE STRIPES',
    fps: 12,
    body: (type, x, y, zone, t) => {
      const phase = mod(y + t * (3 + (hash(x) % 5)) + (hash(x) % 10), 10);
      return RAIN[phase < 1 ? 0 : phase < 3 ? 1 : phase < 6 ? 2 : 3];
    },
  }, ['#5ee35e', '#d8ffd0', '#020a03']),
  wrap({
    id: 'galaxy-swirl',
    name: 'GALAXY SWIRL',
    fps: 10,
    body: (type, x, y, zone, t) => {
      const v = Math.atan2(y - 9.5, x - 4.5) / (2 * Math.PI) + Math.hypot(x - 4.5, y - 9.5) * 0.08 - t * 0.05;
      return SWIRL[Math.floor(mod(v, 1) * SWIRL.length)];
    },
  }, ['#a24ad8', '#7fe0f0', '#07041a']),
  wrap({ id: 'rainbow', name: 'GAYEST RAINBOW', body: (type) => RAINBOW[type] ?? RAINBOW[0] }, ['#b44bff', '#ffe53b', '#0a0612']),
  wrap({
    id: 'octarine',
    name: 'OCTARINE TRIDECAHELIX',
    fps: 12,
    body: (type, x, y, zone, t) => OCTARINE[mod(Math.floor(x * 1.3 + Math.sin(y * 0.5 + t * 2) * 2 + t * 4), 13)],
  }, ['#9b4bff', '#c8ff3c', '#090414']),
  wrap({ id: 'ombre-flames', name: 'OMBRE FLAMES', body: (type, x, y) => FLAMES[Math.min(5, Math.max(0, Math.floor((y / 20) * 6)))] }, ['#ef6a12', '#ffb43a', '#120402']),
  wrap({ id: 'digi-camo', name: 'PARAMILITARY DIGI-CAMO', body: (type, x, y) => CAMO[hash(Math.floor((x + mod(y, 2)) / 2), Math.floor(y / 2)) % 4] }, ['#8a8a5c', '#c4c69a', '#0a0c06']),
  wrap({
    id: 'broken-arm',
    name: 'BROKEN ARM NEBULA',
    fps: 10,
    body: (type, x, y, zone, t) => brokenArm(x, y, t),
    stars: { density: 0.17 },
  }, ['#c64a9a', '#8fd6e6', '#06040f']),
  // Reborn Robotics' trademarked seventh red: plain #FF0000, just glowing harder
  mono('red-7', 'RED 7™', RED_7, { shades: false, glowBoost: 1.8 }),
  wrap({ id: 'racing-stripes', name: 'RACING STRIPES', body: (type, x) => (x === 3 || x === 6 ? '#f4f4f4' : '#1d4fd8') }, ['#3b6cf0', '#f4f4f4', '#03061a']),
  wrap({ id: 'shooting-stars', name: 'SHOOTING STARS', fps: 15, body: (type, x, y, zone, t) => shootingStars(x, y, t) }, ['#5f7fd8', '#bcd4ff', '#04071a']),
  wrap({
    id: 'soothing-seas',
    name: 'SOOTHING SEAS',
    fps: 10,
    body: (type, x, y, zone, t) => SEAS[Math.floor(mod(y + Math.sin(x * 0.7 + t * 1.3) * 1.5 + t * 0.8, 8) / 2)],
  }, ['#2fa3b5', '#7fd6d0', '#02101a']),
  wrap({ id: 'zoological', name: 'ZOOLOGICAL ZEST', body: (type, x, y) => (ANIMALS[type] ?? ANIMALS[0])(x, y) }, ['#ff8c1a', '#e8b860', '#0c0805']),
  wrap({
    id: 'navicomputer-nebula',
    name: 'NAVICOMPUTER NEBULA',
    fps: 10,
    body: (type, x, y, zone, t) => naviColor(x, y, t),
    glow: () => '#b356c8',
  }, ['#f679e5', '#41ead4', '#0d0d1a']),
  wrap({ id: 'osminok-ocean', name: 'OSMINOK OCEAN', dive: true, ambience: OSMINOK_AMBIENCE, body: (type, x, y, zone, t, dive) => osminokColor(type, x, y, dive) }, ['#41ead4', '#9ff0e6', '#020a12']),
  wrap({
    id: 'cozy-storm',
    name: 'COZY STORM',
    scene: 'cozy-storm',
    ambience: COZY_STORM_AMBIENCE,
    body: (type) => COZY[type] ?? COZY[0],
  }, ['#ff6aa8', '#a8e8e2', '#111317']),
  // The Unowned faction's theme: adrift on OLED black among slowly passing stars, one star color per piece
  wrap({ id: 'adrift', name: 'ADRIFT', scene: 'adrift', body: (type) => STAR_COLORS[type] ?? STAR_COLORS[0] }, ['#5a5a5a', '#8c8c8c', '#000000']),
  // One mono preset per faction color in galaxy.json (C.U.C.K. is the default above)
  ...FACTIONS.filter(([id]) => id !== 'adrift').map(([id, name, color]) => (id === 'gas-n-gripe' ? GAS_N_GRIPE : mono(id, name, color))),
];

// Credits per theme, in kcr; anything unlisted is standard issue
const PRICES = {
  houndstooth: 30, checkerboard: 30, neapolitan: 30, digicode: 10, 'galaxy-swirl': 33, rainbow: 15, octarine: 13,
  'ombre-flames': 50, 'red-7': 77, 'broken-arm': 69, 'digi-camo': 40, 'racing-stripes': 25, 'shooting-stars': 60, 'soothing-seas': 60, zoological: 50,
  'boc-bloc': 10, 'business-de-borto': 10, comexo: 5, criminal: 10, 'gas-n-gripe': 2, independent: 2, 'neo-gio': 5,
  'shrike-co': 15, 'the-board': 50, 'the-hawke-consortium': 2, adrift: 25, 'osminok-ocean': 150, 'navicomputer-nebula': 33, 'cozy-storm': 80,
};

// Cheapest first; the sort is stable, so ties keep the order above and C.U.C.K. Green stays the default
export const PRESETS = SPECS.map((spec) => buildTheme({ kcr: PRICES[spec.id] ?? 0, ...spec })).sort((a, b) => a.kcr - b.kcr);
export const DEFAULT_THEME = PRESETS[0];

/** The Color Zones a custom theme sets, mirroring the D.A.V.E. Paint Jobs table. */
const FIELD_KEYS = [['activeBlock', 'activeGlow'], ['stackBlock', 'stackGlow'], ['frame', 'ghost'], ['background', 'text']];
export const ZONES = FIELD_KEYS.map((keys, z) => ({
  zone: TEXT.paint.zones[z],
  keys: keys.map((key, k) => [key, TEXT.paint.fields[z * 2 + k]]),
}));

export const KCR_PER_COLOR = 25;

/** A custom theme from the eight Color Zone colors, priced per unique color. */
export function customTheme(colors) {
  const c = Object.fromEntries(Object.entries(colors).map(([k, v]) => [k, legalize(v)]));
  const unique = new Set(Object.values(c).map((v) => v.toLowerCase())).size;
  const theme = buildTheme({
    id: 'custom',
    name: 'CUSTOM PAINT JOB',
    kcr: unique * KCR_PER_COLOR,
    ui: { background: c.background, frame: c.frame, text: c.text },
    ghost: c.ghost,
    body: (type, x, y, zone) => (zone === 'active' ? c.activeBlock : c.stackBlock),
    glow: (type, x, y, zone) => (zone === 'active' ? c.activeGlow : c.stackGlow),
    colors: c,
  });
  theme.price = TEXT.themes.customPrice(theme.kcr, KCR_PER_COLOR);
  return theme;
}

/** Starting colors for the editor, sampled from whatever theme is on now. */
export function zoneColorsOf(theme) {
  if (theme.spec.colors) return { ...theme.spec.colors };
  const solid = (fn, zone) => {
    const v = fn(1, 4, 2, zone, 0);
    return v.startsWith('#') ? v : GREEN;
  };
  const colors = {
    activeBlock: solid(theme.body, 'active'),
    activeGlow: solid(theme.glow, 'active'),
    stackBlock: solid(theme.body, 'stack'),
    stackGlow: solid(theme.glow, 'stack'),
    frame: theme.frame,
    ghost: theme.spec.ghost ?? theme.frame,
    background: theme.background,
    text: theme.text,
  };
  // Starting the editor from Red 7™ must not hand out its red for free
  return Object.fromEntries(Object.entries(colors).map(([k, v]) => [k, legalize(v)]));
}

export function themeById(id, custom) {
  if (id === 'custom' && custom) return customTheme(custom);
  return PRESETS.find((t) => t.id === id) ?? DEFAULT_THEME;
}
