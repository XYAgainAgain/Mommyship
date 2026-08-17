/* CPU echo of the 3D firmament for the 2D map underlay: colordodge nebula
   (skybox.tsl.js math + preset) and the same 24 distant spirals as background.js.
   Prerendered once to offscreen canvases, composited with parallax in map2d. */
import { createRng } from './rng.js';
import { perlin3d, buildPermutationTable } from './volume-bake.js';

const NEB_RES = 512;
const GAL_RES = 2048;
const ROWS_PER_TICK = 32;

/* Skybox preset params (seed rerolls per load) — keep in sync with skybox.tsl.js */
const NEB = {
  res1: 1.75, res2: 1.45, resMix: 1.0, warp: 0.3,
  octaves: 4.25, contrast: 4.2, intensity: 0.63,   /* preset 0.42 × 1.5 — reads through the vignette */
  colA: [13, 13, 26], colB: [70, 22, 169], colC: [217, 67, 140], colD: [31, 89, 128]
};

/* background.js GAL config + seed — same RNG stream, so these ARE the 3D galaxies */
const GAL_SEED = 1778;
const GAL = {
  count: 24, particles: 420, baseSize: 24, sizeVar: 1.5, distMin: 555, distMax: 645,
  maxArms: 6, turnsMin: 0.7, turnsMax: 2.0, flatten: 0.15, hueVar: 1.0, coreBoost: 0.8,
  bright: 0.85
};
const GAL_HUE_FAMILIES = [0.62, 0.72, 0.85, 0.48, 0.08, 0.55, 0.95, 0.13];

/* Twinkly boiz — weighted like the 3D STAR_PALETTE, drawn live so they can twinkle */
const STAR_SEED = 6969;
const STAR_COUNT = 2400;
const STAR_COLORS = [
  ['#ffffff', 5], ['#dce6ff', 2], ['#aabfff', 1],
  ['#fff4e8', 2], ['#ffed97', 1.5], ['#ffc46b', 1], ['#ff9a5c', 0.5]
];

const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (x) => x < 0 ? 0 : x > 1 ? 1 : x;

function hslToRgb(h, s, l) {
  const f = (n) => {
    const k = (n + h * 12) % 12;
    return l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return [f(0), f(8), f(4)];
}

/* cloudCD: sin(noise(p + seed) · 7) · 0.5 + 0.5 */
function cloudCD(x, y, z, seed, perm) {
  return Math.sin(perlin3d(x + seed, y + seed, z + seed, perm) * 7) * 0.5 + 0.5;
}

/* Fixed 8-iteration stack, fractional octaves fade the tail (mirrors cloudNoiseCD) */
function cloudNoise(x, y, z, frq, seed, octaves, perm) {
  let n = 0, gain = 1;
  for (let i = 0; i < 8; i++) {
    const w = clamp01(octaves - i);
    if (w <= 0) break;
    const s = gain / frq;
    n += cloudCD(x * s, y * s, z * s, seed + i * 10, perm) * (0.5 / gain) * w;
    gain *= 2;
  }
  return n;
}

function renderGalaxies() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = GAL_RES;
  const ctx = canvas.getContext('2d');
  ctx.globalCompositeOperation = 'lighter';
  const rng = createRng(GAL_SEED * 7 + 3);
  const TAU = Math.PI * 2;
  const pxPerWorld = GAL_RES / 2;

  for (let gi = 0; gi < GAL.count; gi++) {
    /* Same draw order as buildGalaxyGeometry so every galaxy keeps its 3D identity */
    const theta = Math.acos(2 * rng.next() - 1);
    const phi = rng.next() * TAU;
    const dist = lerp(GAL.distMin, GAL.distMax, rng.next());
    const gx = (phi / TAU) * GAL_RES;
    const gy = (theta / Math.PI) * GAL_RES;
    const size = GAL.baseSize * (1 - GAL.sizeVar * 0.6 + Math.pow(rng.next(), 1.5) * GAL.sizeVar * 1.6);
    const sizePx = Math.max(size / dist * pxPerWorld, 6);
    const arms = rng.next() < 0.45 ? 2 : 1 + Math.floor(rng.next() * GAL.maxArms);
    const turns = lerp(GAL.turnsMin, GAL.turnsMax, rng.next());
    const flatten = 1 - GAL.flatten * rng.next();
    rng.next(); rng.next();                       // spinRate (two draws) — static here
    const ax = rng.gauss(), ay = rng.gauss();
    rng.gauss();                                  // az — 2D keeps only an orientation angle
    const orient = Math.atan2(ay, ax);
    const co = Math.cos(orient), so = Math.sin(orient);
    const baseHue = GAL_HUE_FAMILIES[(rng.next() * GAL_HUE_FAMILIES.length) | 0];
    const hueA = (baseHue + (rng.next() - 0.5) * 0.12 * GAL.hueVar + 1) % 1;
    const hueB = (hueA + (rng.next() - 0.5) * 0.35 * GAL.hueVar + 1) % 1;
    const sat = 0.3 + rng.next() * 0.45 * GAL.hueVar;
    const innerCol = hslToRgb(hueA, sat, 0.72);
    const outerCol = hslToRgb(hueB, sat * 0.85, 0.6);

    for (let k = 0; k < GAL.particles; k++) {
      const t = k / GAL.particles, arm = k % arms;
      const angle = t * turns * TAU + arm * (TAU / arms) + (rng.next() - 0.5) * 0.4 * (1 - t);
      const radius = (Math.pow(t, 0.85) * 0.95 + rng.next() * 0.05) * sizePx;
      const core = clamp01(1 - t / 0.32);
      rng.gauss();                                // pz scatter — flat in 2D
      const lx = Math.cos(angle) * radius, ly = Math.sin(angle) * radius * flatten;
      const px = gx + lx * co - ly * so;
      const py = gy + lx * so + ly * co;
      const alpha = (0.45 + rng.next() * 0.55) * (0.6 + core * 0.8) * GAL.bright * 0.55;
      const wh = core * GAL.coreBoost;
      const r = Math.round(clamp01(lerp(lerp(innerCol[0], outerCol[0], t), 1, wh)) * 255);
      const g = Math.round(clamp01(lerp(lerp(innerCol[1], outerCol[1], t), 1, wh)) * 255);
      const b = Math.round(clamp01(lerp(lerp(innerCol[2], outerCol[2], t), 1, wh)) * 255);
      ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + alpha.toFixed(3) + ')';
      ctx.beginPath();
      ctx.arc(px, py, Math.max(sizePx * 0.018 * (1.3 - t), 0.6), 0, TAU);
      ctx.fill();
    }
  }
  return canvas;
}

function buildStars() {
  const rng = createRng(STAR_SEED);
  const total = STAR_COLORS.reduce((s, c) => s + c[1], 0);
  const stars = [];
  for (let i = 0; i < STAR_COUNT; i++) {
    let pick = rng.next() * total, color = STAR_COLORS[0][0];
    for (const [col, w] of STAR_COLORS) {
      pick -= w;
      if (pick <= 0) { color = col; break; }
    }
    stars.push({
      x: rng.next() * GAL_RES, y: rng.next() * GAL_RES,
      r: 0.4 + Math.pow(rng.next(), 2) * 1.3,
      baseA: 0.3 + rng.next() * 0.7,
      phase: rng.next() * Math.PI * 2,
      rate: 0.8 + rng.next() * 1.4,
      color,
      /* Every 3rd star twinkles live; the rest bake static into the bg layer */
      live: i % 3 === 0
    });
  }
  return stars;
}

export function createFirmament(onReady) {
  /* Fresh sky every visit — the nebula rerolls, galaxies and stars stay put */
  const nebSeed = 10000 + Math.floor(Math.random() * 900000);
  const nebCanvas = document.createElement('canvas');
  nebCanvas.width = nebCanvas.height = NEB_RES;
  const nebCtx = nebCanvas.getContext('2d');
  const img = nebCtx.createImageData(NEB_RES, NEB_RES);
  const perm = buildPermutationTable(createRng(nebSeed));
  let galCanvas = null;
  let ready = false;
  let row = 0;

  function bakeRows() {
    const data = img.data;
    const end = Math.min(row + ROWS_PER_TICK, NEB_RES);
    for (; row < end; row++) {
      const py = (row / NEB_RES) * 2.2 - 1.1;
      for (let i = 0; i < NEB_RES; i++) {
        const px = (i / NEB_RES) * 2.2 - 1.1;
        const pz = 0.35;   /* fixed slice through the 3D noise field */
        const c1 = cloudNoise(px, py, pz, NEB.res1, nebSeed, NEB.octaves, perm);
        const w = c1 * NEB.warp;
        const c2 = cloudNoise(px + w, py + w, pz + w, NEB.res2, nebSeed + 310.4, NEB.octaves, perm);
        const c3 = cloudNoise(px, py, pz, NEB.resMix, nebSeed + 661.384, NEB.octaves, perm);
        const strength = Math.pow(c2, NEB.contrast) * 2 * NEB.intensity;
        const o = (row * NEB_RES + i) * 4;
        data[o]     = Math.min(255, lerp(lerp(NEB.colA[0], NEB.colB[0], c3), lerp(NEB.colC[0], NEB.colD[0], c3), c1) * strength);
        data[o + 1] = Math.min(255, lerp(lerp(NEB.colA[1], NEB.colB[1], c3), lerp(NEB.colC[1], NEB.colD[1], c3), c1) * strength);
        data[o + 2] = Math.min(255, lerp(lerp(NEB.colA[2], NEB.colB[2], c3), lerp(NEB.colC[2], NEB.colD[2], c3), c1) * strength);
        data[o + 3] = 255;
      }
    }
    if (row < NEB_RES) {
      schedule(bakeRows);
      return;
    }
    nebCtx.putImageData(img, 0, 0);
    galCanvas = renderGalaxies();
    ready = true;
    onReady?.();
  }

  function schedule(fn) {
    if (window.requestIdleCallback) requestIdleCallback(fn, { timeout: 200 });
    else setTimeout(fn, 16);
  }

  schedule(bakeRows);

  const stars = buildStars();

  /* Paints nebula + galaxies + static stars into the bg DOM layer at `side` CSS px.
     map2d.js CSS-transforms that layer for parallax; this only reruns on zoom-tier drift. */
  function paintBase(canvas, side, dpr) {
    if (!ready) return false;
    const s = Math.ceil(side);
    canvas.width = canvas.height = Math.round(s * dpr);
    canvas.style.width = canvas.style.height = s + 'px';
    const bctx = canvas.getContext('2d', { alpha: false });
    bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    bctx.imageSmoothingEnabled = true;
    bctx.imageSmoothingQuality = 'high';
    bctx.drawImage(nebCanvas, 0, 0, s, s);
    bctx.globalCompositeOperation = 'lighter';
    const scale = s / GAL_RES;
    bctx.drawImage(galCanvas, 0, 0, s, s);
    for (const st of stars) {
      if (st.live) continue;
      bctx.globalAlpha = st.baseA * 0.8;
      bctx.fillStyle = st.color;
      const sz = Math.max(1.2, st.r * 1.8);
      bctx.fillRect(st.x * scale, st.y * scale, sz, sz);
    }
    bctx.globalCompositeOperation = 'source-over';
    bctx.globalAlpha = 1;
    return true;
  }

  /* Live twinklers ride rotationTime, so Pause freezes the sky too.
     dx/dz/side map firmament space → screen, matching the bg layer's CSS transform. */
  function drawStars(ctx, dx, dz, side, viewW, viewH, time) {
    if (!ready) return;
    const scale = side / GAL_RES;
    for (const s of stars) {
      if (!s.live) continue;
      const px = dx + s.x * scale, py = dz + s.y * scale;
      if (px < -2 || px > viewW + 2 || py < -2 || py > viewH + 2) continue;
      const a = s.baseA * (0.55 + 0.45 * Math.sin(s.phase + time * s.rate));
      if (a < 0.05) continue;
      ctx.globalAlpha = a;
      ctx.fillStyle = s.color;
      const sz = Math.max(1.2, s.r * 1.8);
      ctx.fillRect(px, py, sz, sz);
    }
    ctx.globalAlpha = 1;
  }

  return { paintBase, drawStars, isReady: () => ready };
}
