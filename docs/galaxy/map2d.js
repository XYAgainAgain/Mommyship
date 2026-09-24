/* 2D galaxy map — full-viewport Canvas2D renderer.
   Camera {cx, cz, k}: screen = (world − c)·k + center. World = canonical map units (±500). */
import { createFirmament, CANVAS_FILTER } from './map2d-firmament.js';

/* k = screen px per map unit; 0.8 ≈ the old default 800px disc */
const K_DEFAULT = 0.8;
const K_MIN = 0.52, K_MAX = 48;
const WORLD_R = 500;
const CORE_VOID_R = 35;
/* Pan can't wander past the rim — there's no universe out there to see */
const PAN_MAX = WORLD_R * 1.05;
/* Min zoom fills ~78% of the smaller viewport axis with the disc */
const K_FILL = 0.78;
const PAN_SPEED = 8;
const ZOOM_SPEED = 0.03;

/* Tier gates keyed off legacy mapScale (= k / 0.8) so the old zoom feel carries over */
const DOT_SHOW = { landmark: 0, star: 0, station: 5, gng: 8, child: 5, moon: 8 };
const LANDMARK_FADE = 3;
const DOT_SIZE = { landmark: 12, star: 10, child: 7, moon: 4.5, station: 5.5, gng: 6 };
/* Dots grow gently past their show threshold so bodies read at system zoom */
const DOT_GROW_CAP = { landmark: 1.6, star: 2.0, child: 2.6, moon: 2.6, station: 2.4, gng: 2.0 };
const DOT_GROW_RATE = 0.05;

const LABEL_SHOW = { landmark: 0, star: 2, station: 8, gng: 12, child: 12, moon: 40 };
const LABEL_FADE_RANGE = { landmark: 1, star: 2, station: 3, gng: 3, child: 3, moon: 5 };
const LABEL_OPACITY = { landmark: 0.9, star: 0.8, station: 0.7, gng: 0.6, child: 0.7, moon: 0.6 };
/* Declutter priority — lower wins the spot (zones handled separately, always win) */
const LABEL_PRIO = { landmark: 1, star: 2, station: 3, child: 4, gng: 5, moon: 6 };
const DECLUTTER_MS = 150;

const HIDDEN_ZONES = new Set(['core', 'a-b', 'rim', 'arm-1', 'arm-2', 'arm-3']);
const ZONE_DISPLAY = {
  'cuck-core': 'C.U.C.K.\nSPACE',
  '1gwrz': 'FIRST GALACTIC\nWAR RUIN ZONE',
  'dead-zone': 'UNEXPLAINED\nDEAD ZONE',
  'unclaimed': 'UNCLAIMED\nTERRITORY',
  'neo-gio-core': 'NEO-GIOVANNI\nCORE WORLDS',
  'clp': 'COMEXO\nLIFESTYLE\nPLANETS',
  'fields': 'SAPPHIRE\nFIELDS',
  'smelt': 'SMELT\nWORLDS'
};

function displayName(id, body, tier) {
  if (id === 'smbh') return 'SMBH';
  if (tier !== 'gng') return body.name;
  const m = body.name.match(/^Gas-N-Gripe\s+(\d+)$/);
  return m ? 'GNG ' + m[1] : body.name;
}

/* AABB overlap with a little breathing room */
function rectsOverlap(a, b) {
  return a[0] < b[0] + b[2] + 2 && b[0] < a[0] + a[2] + 2 &&
         a[1] < b[1] + b[3] + 2 && b[1] < a[1] + a[3] + 2;
}

const NICE_CONSTANT = 69;
const NICE_DISTANCES = [
  1, 2, 5, 10, 20, 50, 69, 100, 200, 500,
  1000, 2000, 4000, 7000, 10000, 20000, 40000, 62100
];

function pinTier(id, body) {
  if (body.tags?.includes('landmark')) return 'landmark';
  if (body.type === 'star') return 'star';
  /* Stations with their own galactic coords are as important as stars for navigation */
  if (body.position && body.type === 'station' && !body.name?.startsWith('Gas-N-Gripe')) return 'star';
  if (body.name && body.name.startsWith('Gas-N-Gripe')) return 'gng';
  if (body.type === 'station') return 'station';
  if (body.type === 'moon') return 'moon';
  return 'child';
}

function hexToRgb(hex) {
  const v = parseInt(hex.slice(1), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

const rgbStr = (c) => 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';
const rgbaStr = (c, a) => 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')';

/* Lane gradient color at parametric t (orange → yellow → orange) */
function laneColorAt(t, alpha) {
  const half = t < 0.5 ? t * 2 : (1 - t) * 2;
  const r = Math.round(0xe8 + (0xf0 - 0xe8) * half);
  const g = Math.round(0xa0 + (0xd0 - 0xa0) * half);
  const b = Math.round(0x30 + (0x60 - 0x30) * half);
  return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
}

/* Segment ∩ circle at origin → [t0, t1] clamped to [0,1], or null */
function segCircleT(x1, z1, x2, z2, r) {
  const dx = x2 - x1, dz = z2 - z1;
  const a = dx * dx + dz * dz;
  if (a < 1e-9) return null;
  const b = 2 * (x1 * dx + z1 * dz);
  const c = x1 * x1 + z1 * z1 - r * r;
  const disc = b * b - 4 * a * c;
  if (disc <= 0) return null;
  const s = Math.sqrt(disc);
  const t0 = (-b - s) / (2 * a), t1 = (-b + s) / (2 * a);
  if (t1 <= 0 || t0 >= 1) return null;
  return [Math.max(0, t0), Math.min(1, t1)];
}

const HIDDEN_ZONE_ELLIPSES = new Set(['core', 'a-b', 'rim', 'arm-1', 'arm-2', 'arm-3']);

/* The lightmap grade, baked into its idle double buffer; the live layer applies it via CSS */
const LM_FILTER = 'brightness(1.12) contrast(1.16)';

const CAM_KEY = 'mommyship-galaxy-map2d';

export function createMap2D({ canvas, labelLayer, systems, callbacks }) {
  const ctx = canvas.getContext('2d');
  /* ?mapperf: per-section draw timings every ~2 s plus the counters on window.__map2dPerf */
  const PERF = new URLSearchParams(location.search).has('mapperf');
  const pc = {
    frames: 0, draws: 0, drawMs: 0, lmRebake: 0, astRebake: 0, bgRebake: 0, bgMs: 0, bakeMs: 0,
    vecBuilds: 0, vecBlits: 0, starsDraws: 0,
    labelsCreated: 0, labelBatches: 0, labelTf: 0, zoneTf: 0, staticTf: 0, layerTf: 0, gradients: 0, zoneStrokes: 0
  };
  /* Raster events over 2 ms, one console line each, so single hitch frames show up by cause */
  const perfEvent = (kind, layer, px, ms) => {
    if (ms > 2) console.log('[map2d] ' + kind + ' ' + layer + ' ' + (px / 1e6).toFixed(2) + ' Mpx ' + ms.toFixed(1) + ' ms');
  };
  const lightmapImg = document.getElementById('lightmap-img');
  const firmament = createFirmament(() => { bgBakedSide = 0; markDirty(); });

  /* DOM layers under the vector canvas — repainted rarely, moved via CSS transforms */
  const bgLayerCanvas = document.getElementById('map2d-bg');
  const starsCanvas = document.getElementById('map2d-stars');
  const lmLayerCanvas = document.getElementById('map2d-lightmap');
  const asteroidsImg = document.getElementById('asteroids-img');
  const astLayerCanvas = document.getElementById('map2d-asteroids');
  const starsCtx = starsCanvas.getContext('2d');
  if (CANVAS_FILTER) {
    starsCanvas.classList.add('gx-m2-baked');
    bgLayerCanvas.classList.add('gx-m2-baked');
  }
  /* Static labels (zones + bodies with fixed coords) share one container so a fixed-scale pan
     moves them with a single transform write */
  const staticLabelLayer = document.createElement('div');
  staticLabelLayer.className = 'gx-m2-static-labels';
  labelLayer.appendChild(staticLabelLayer);
  let bgBakedSide = 0, bgTf = '';
  /* Twinklers only change with time or parallax; hover-only redraws skip the stars canvas */
  const starsAt = { t: NaN, dx: NaN, dz: NaN, side: NaN };
  /* Region-baked image layers; their tiers fill in asynchronously after decode */
  const lmL = { name: 'lightmap', canvas: lmLayerCanvas, img: lightmapImg, tiers: [], bake: null, tf: '', src: '', rev: 0 };
  const astL = { name: 'asteroids', canvas: astLayerCanvas, img: asteroidsImg, tiers: [], bake: null, tf: '', src: '', rev: 0 };
  /* Smoothed camera velocity in CSS px per draw; pan rebakes lead along it */
  let panVx = 0, panVz = 0;
  /* One big raster per draw: a soft rebake waits a frame when another layer already took the slot */
  let rasterFree = true, rasterDeferred = false;
  /* Mid-gesture zooms ride the CSS scale; layers rebake once, 200 ms after k settles */
  let lastKForSettle = 0, settleAt = 0;

  let cx = 0, cz = 0, k = K_DEFAULT;
  let kMin = K_MIN;
  let viewW = 0, viewH = 0, dpr = 1;
  let active = false;
  let dirty = true;
  /* Camera at the previous draw; a draw that moved it owes one settle draw so the
     mid-motion shortcuts (vector cache offsets, label container) snap back to exact */
  let prevCx = NaN, prevCz = NaN, prevK = NaN;
  let restPending = false;
  /* Set by editor mutations; the next frame drops every data-derived cache in one go */
  let staleData = false;

  let selectedId = null;
  let hoveredId = null;
  let trackedId = null;
  /* Entries are rewritten in place each tick; recomputed only when rotationTime moves */
  let positions = null;
  let posTime = NaN;

  /* Caches cleared on invalidate() — editor edits land while the map is inactive */
  const tierCache = new Map();
  const orbitCache = new Map();
  const laneCache = new Map();

  const labelEls = new Map();
  const zoneEls = [];
  let zonesBuilt = false, zoneSig = '';
  let labelsPrimed = false;
  const declutter = new Map();
  let lastDeclutterAt = 0;
  /* Camera the static label container was built against; slOx/slOy hold the whole-px pan since then */
  let slAnchor = null;
  let slOx = 0, slOy = 0;
  const cands = [];
  const candPool = [];
  const zoneRects = [];
  const missing = [];

  let flyAnim = null;
  const keys = {};
  /* Waypoints: {id} anchors to a body and tracks its orbit; {x, z} is a fixed point */
  const measurePts = [];
  let measureDone = false;

  const measurePt = (p) => p.id ? positions?.get(p.id) : p;

  function measureWaypoint(e) {
    const hit = hitTest(e.clientX, e.clientY);
    return hit ? { id: hit } : { x: wx(e.clientX), z: wz(e.clientY) };
  }

  /* Dedup adjacent waypoints — double-click otherwise stacks the same spot 3× */
  function pushWaypoint(wp) {
    const last = measurePts[measurePts.length - 1];
    if (last && (last.id || wp.id ? last.id === wp.id
      : Math.hypot(last.x - wp.x, last.z - wp.z) * k < 4)) return;
    measurePts.push(wp);
  }

  function clearMeasure() {
    measurePts.length = 0;
    measureDone = false;
  }

  /* Releasing here must also free the 3D camera, or it stays glued to the old body */
  function releaseTracking() {
    if (!trackedId) return;
    trackedId = null;
    callbacks.onUntrack?.();
  }

  let lastRotTime = 0;
  let lastMouseX = window.innerWidth / 2, lastMouseY = window.innerHeight / 2;
  let dragging = false, dragMoved = false;
  let dragStartX = 0, dragStartY = 0, dragCx = 0, dragCz = 0;

  let lastBarK = -1;

  const sx = (x) => (x - cx) * k + viewW / 2;
  const sz = (z) => (z - cz) * k + viewH / 2;
  const wx = (px) => (px - viewW / 2) / k + cx;
  const wz = (py) => (py - viewH / 2) / k + cz;

  function markDirty() {
    dirty = true;
    callbacks.onWake?.();
  }

  function ensurePositions(rotationTime) {
    if (!positions) { positions = new Map(); posTime = NaN; }
    if (rotationTime !== posTime) {
      systems.flattenPositionsInto(positions, rotationTime);
      posTime = rotationTime;
    }
    return positions;
  }

  /* Everything a zone label bakes in at build time: id, name, anchor, faction color */
  function zoneSignature(data) {
    let sig = '';
    for (const zid in data.zones) {
      const z = data.zones[zid];
      sig += zid + '|' + z.name + '|' + (z.position ? z.position.x + ',' + z.position.z : '') + '|' +
        ((z.factionId && data.factions[z.factionId]?.color) || '') + ';';
    }
    return sig;
  }

  /* Editor-edit variant of invalidate(): same cache drops, but labels whose body, text, tier,
     and container still match survive, so a slider drag doesn't re-fade every label per tick */
  function refreshData() {
    staleData = false;
    labelsPrimed = false;
    tierCache.clear();
    orbitCache.clear();
    laneCache.clear();
    positions = null;
    vec = null;
    const data = systems.getData();
    for (const [id, L] of labelEls) {
      const body = data.bodies[id];
      const info = body ? bodyInfo(id) : null;
      if (!info || L.fixed !== info.fixed || L.el.dataset.tier !== info.tier ||
          L.el.textContent !== displayName(id, body, info.tier)) {
        L.el.remove();
        labelEls.delete(id);
        declutter.delete(id);
      }
    }
    if (zonesBuilt && zoneSignature(data) !== zoneSig) {
      for (const zl of zoneEls) zl.el.remove();
      zoneEls.length = 0;
      zonesBuilt = false;
    }
    if (hoveredId && !data.bodies[hoveredId]) hoveredId = null;
    markDirty();
  }

  function invalidate() {
    staleData = false;
    tierCache.clear();
    orbitCache.clear();
    laneCache.clear();
    declutter.clear();
    for (const L of labelEls.values()) L.el.remove();
    labelEls.clear();
    for (const zl of zoneEls) zl.el.remove();
    zoneEls.length = 0;
    zonesBuilt = false;
    labelsPrimed = false;
    slAnchor = null;
    positions = null;
    vec = null;
    hoveredId = null;
    markDirty();
  }

  function clampCam() {
    const d = Math.hypot(cx, cz);
    if (d > PAN_MAX) {
      const s = PAN_MAX / d;
      cx *= s;
      cz *= s;
    }
  }

  /* Remember where the user left the map */
  let saveTimer = 0;
  function queueSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try { localStorage.setItem(CAM_KEY, JSON.stringify({ cx, cz, k })); } catch { }
    }, 500);
  }

  function restoreCam() {
    try {
      const s = JSON.parse(localStorage.getItem(CAM_KEY));
      if (!s || !Number.isFinite(s.cx) || !Number.isFinite(s.cz) || !Number.isFinite(s.k)) return;
      cx = s.cx;
      cz = s.cz;
      k = Math.min(Math.max(s.k, kMin), K_MAX);
      clampCam();
    } catch { }
  }

  function resize() {
    const tb = PERF ? performance.now() : 0;
    dpr = window.devicePixelRatio || 1;
    viewW = canvas.clientWidth;
    viewH = canvas.clientHeight;
    canvas.width = Math.round(viewW * dpr);
    canvas.height = Math.round(viewH * dpr);
    starsCanvas.width = Math.round(viewW * dpr);
    starsCanvas.height = Math.round(viewH * dpr);
    starsCanvas.style.width = viewW + 'px';
    starsCanvas.style.height = viewH + 'px';
    starsAt.t = NaN;
    bgBakedSide = 0;
    lmL.bake = null;
    astL.bake = null;
    dropGrade();
    vec = null;
    slAnchor = null;
    kMin = Math.max(K_MIN, Math.min(viewW, viewH) * K_FILL / (WORLD_R * 2));
    if (k < kMin) k = kMin;
    if (PERF) perfEvent('resize', 'main+stars', canvas.width * canvas.height * 2, performance.now() - tb);
    markDirty();
  }

  /* Monitor hops and browser zoom change the DPR without always firing a resize */
  function watchDpr() {
    const mq = window.matchMedia?.('(resolution: ' + (window.devicePixelRatio || 1) + 'dppx)');
    mq?.addEventListener('change', () => { resize(); watchDpr(); }, { once: true });
  }

  function bodyInfo(id) {
    let info = tierCache.get(id);
    if (info) return info;
    const data = systems.getData();
    const body = data.bodies[id];
    if (!body) return null;
    const tier = pinTier(id, body);
    const faction = body.factionId ? data.factions[body.factionId] : null;
    const color = faction ? faction.color : (body.visual?.color || '#888');
    const spectral = body.visual?.spectralColor || null;
    info = {
      tier,
      color,
      spectral,
      size: DOT_SIZE[tier] ?? 1.5,
      /* Fixed-coordinate bodies never move in 2D; their labels ride the static container */
      fixed: !!body.position,
      rgb: hexToRgb(color),
      specRgb: spectral ? hexToRgb(spectral) : null,
      /* Per-colorT style strings and the local-space halo gradient, reused while nothing changes */
      colorT: NaN, fill: '', halo0: '', halo1: '', halo2: '',
      halo: null, haloR: 0
    };
    tierCache.set(id, info);
    return info;
  }

  /* Tiers at 2048 and 4096 plus the native size, picked per bake by texels per device px. The native
     tier alone serves everything above 4.096 texels/unit (no 8192 copy of a 12k image: the memory
     isn't worth a milder downscale). Firefox caches canvas sources only up to 5280², so a native
     size above 4096 is cut into tiles. */
  const TIER_SIZES = [2048, 4096];
  const TIER_WHOLE_MAX = 4096;
  /* 8192 → 2×2 and 12288 → 3×3 tiles, and a bake draws only the tiles it touches */
  const TILE = 4096;
  /* Overlap texels per interior tile side (tiles top out at 4100²), so a seam's filter taps read
     the real neighbor instead of a clamped edge */
  const TILE_PAD = 2;
  const yieldTask = () => new Promise((r) => setTimeout(r, 0));
  const imgSrc = (img) => img.currentSrc || img.src;

  /* Swaps in a layer's tier list and closes the tiers it drops; a bake drawn from those can't survive */
  function setTiers(L, tiers) {
    const keep = new Set(tiers);
    let dropped = false;
    for (const t of L.tiers) {
      if (keep.has(t)) continue;
      for (const tile of t.tiles) tile.bmp.close();
      dropped = true;
    }
    L.tiers = tiers;
    if (dropped) {
      L.bake = null;
      if (L === lmL) dropGrade();
    }
    markDirty();
  }

  /* Everything reads straight from the <img>, one bitmap in flight at a time, and each intermediate
     closes as soon as the next exists: no full-size copy is ever held. A newer source revision
     abandons the build and closes whatever it made. */
  async function buildTiers(L, rev) {
    const img = L.img, src = imgSrc(img);
    const stale = () => rev !== L.rev || !img.complete || imgSrc(img) !== src;
    if (stale() || !img.naturalWidth) return;
    const n = img.naturalWidth;
    /* A source swap keeps the old set on screen until the new one is whole */
    const progressive = !L.tiers.length;
    const made = [];
    const held = new Set();
    const own = (b) => { held.add(b); return b; };
    const drop = (b) => { held.delete(b); b.close(); };
    const publish = () => {
      made.sort((x, y) => x.n - y.n);
      for (const t of made) for (const tl of t.tiles) held.delete(tl.bmp);
      setTiers(L, made.slice());
    };
    const resize = (from, s) => createImageBitmap(from, { resizeWidth: s, resizeHeight: s, resizeQuality: 'high' });
    try {
      /* Down the chain in steps of at most 2× (clean box filtering whatever the resize filter) */
      let prev = null;
      for (const s of TIER_SIZES.filter((s) => s < n).reverse()) {
        let from = prev || img, fromN = prev ? prev.width : n, tmp = null;
        while (fromN / 2 > s) {
          const half = own(await resize(from, fromN / 2));
          if (tmp) drop(tmp);
          if (stale()) return;
          from = tmp = half;
          fromN /= 2;
        }
        const bmp = own(await resize(from, s));
        if (tmp) drop(tmp);
        if (stale()) return;
        made.push({ n: s, tiles: [{ bmp, u0: 0, v0: 0, u1: s, v1: s, bx: 0, by: 0 }] });
        prev = bmp;
        await yieldTask();
      }
      if (progressive && made.length) publish();
      const tiles = [];
      if (n <= TIER_WHOLE_MAX) {
        tiles.push({ bmp: own(await createImageBitmap(img)), u0: 0, v0: 0, u1: n, v1: n, bx: 0, by: 0 });
      } else {
        for (let v = 0; v < n; v += TILE) {
          for (let u = 0; u < n; u += TILE) {
            const u1 = Math.min(n, u + TILE), v1 = Math.min(n, v + TILE);
            const bx = Math.max(0, u - TILE_PAD), by = Math.max(0, v - TILE_PAD);
            const bw = Math.min(n, u1 + TILE_PAD) - bx, bh = Math.min(n, v1 + TILE_PAD) - by;
            /* The same-size resize forces a real copy; a plain crop would pin the whole decode */
            const bmp = own(await createImageBitmap(img, bx, by, bw, bh, { resizeWidth: bw, resizeHeight: bh }));
            tiles.push({ bmp, u0: u, v0: v, u1, v1, bx, by });
            if (stale()) return;
            await yieldTask();
          }
        }
      }
      if (stale()) return;
      made.push({ n, tiles });
      publish();
    } catch (e) {
      if (!stale()) console.warn('[map2d] ' + L.name + ' tiers:', e);
    } finally {
      for (const b of held) b.close();
    }
  }
  /* Serialized so only one tier is ever being built; a repeat load of the same source is a no-op */
  let tierQueue = Promise.resolve();
  function queueTiers(L) {
    const src = imgSrc(L.img);
    if (!L.img.naturalWidth || src === L.src) return;
    L.src = src;
    const rev = ++L.rev;
    tierQueue = tierQueue.then(() => buildTiers(L, rev));
  }

  /* Lowest tier with at least one texel per device px, else the sharpest there is */
  function pickTier(tiers, kd) {
    for (const t of tiers) if (t.n / 1000 >= kd) return t;
    return tiers[tiers.length - 1] || null;
  }

  /* Firmament space → screen mapping shared by the bg layer transform and live stars */
  function firmamentGeom() {
    const pk = Math.pow(k / K_DEFAULT, 0.1);
    const side = Math.max(viewW, viewH) * 1.25 * pk;
    const maxOffX = Math.max(0, (side - viewW) / 2);
    const maxOffZ = Math.max(0, (side - viewH) / 2);
    const offX = Math.min(Math.max(cx * 0.12 * pk, -maxOffX), maxOffX);
    const offZ = Math.min(Math.max(cz * 0.12 * pk, -maxOffZ), maxOffZ);
    return { side, dx: viewW / 2 - side / 2 - offX, dz: viewH / 2 - side / 2 - offZ };
  }

  /* Lightmap + asteroid layers bake a margin slice; pan and moderate zoom ride the CSS transform,
     so a pan costs no raster work until the margin is actually exhausted. Both share one baker. */
  const LM_MARGIN = 1.5;
  /* A pan rebake centers this share of the margin ahead of the camera, so straight pans rebake less */
  const LEAD = 0.6;

  function takeRaster() {
    if (!rasterFree) { rasterDeferred = true; return false; }
    rasterFree = false;
    return true;
  }

  /* Soft-rebake slack is three draws of margin burn, so a rebake deferred two frames never shows an edge */
  const softRoom = (room, rate) => rate > 0 && room < Math.max(48, rate * 3);

  /* Draws device rows [y0, y1) of bake b into c (identity transform) with row y0 at the top.
     Every interior edge (tile seam, bake edge, grade band cut) draws a few texels past itself and
     clips at a whole device px, so edge clamping lands off-screen whatever the backend samples. */
  function drawRegion(c, b, y0, y1) {
    const t = b.tier, n = t.n, tpu = n / 1000, kd = b.k * b.dpr;
    const devX = (u) => (u / tpu - 500 - b.wx0) * kd;
    const devZ = (v) => (v / tpu - 500 - b.wz0) * kd;
    const texX = (x) => (x / kd + b.wx0 + 500) * tpu;
    const texZ = (y) => (y / kd + b.wz0 + 500) * tpu;
    const ru0 = Math.max(0, texX(0)), ru1 = Math.min(n, texX(b.pw));
    const rv0 = Math.max(0, texZ(y0)), rv1 = Math.min(n, texZ(y1));
    if (ru1 <= ru0 || rv1 <= rv0) return;
    c.imageSmoothingEnabled = true;
    c.imageSmoothingQuality = 'high';
    for (const tl of t.tiles) {
      const u0 = Math.max(tl.u0, ru0), u1 = Math.min(tl.u1, ru1);
      const v0 = Math.max(tl.v0, rv0), v1 = Math.min(tl.v1, rv1);
      if (u1 <= u0 || v1 <= v0) continue;
      /* Clip edges: image border → a px clear of the draw; seam → rounded; region cut → exact */
      const cx0 = u0 === 0 ? Math.floor(devX(0)) - 1 : u0 === tl.u0 ? Math.round(devX(u0)) : 0;
      const cx1 = u1 === n ? Math.ceil(devX(n)) + 1 : u1 === tl.u1 ? Math.round(devX(u1)) : b.pw;
      const cz0 = v0 === 0 ? Math.floor(devZ(0)) - 1 : v0 === tl.v0 ? Math.round(devZ(v0)) : y0;
      const cz1 = v1 === n ? Math.ceil(devZ(n)) + 1 : v1 === tl.v1 ? Math.round(devZ(v1)) : y1;
      if (cx1 <= cx0 || cz1 <= cz0) continue;
      const bw = tl.bmp.width, bh = tl.bmp.height;
      const su0 = u0 === 0 ? 0 : Math.max(tl.bx, texX(cx0) - TILE_PAD);
      const su1 = u1 === n ? n : Math.min(tl.bx + bw, texX(cx1) + TILE_PAD);
      const sv0 = v0 === 0 ? 0 : Math.max(tl.by, texZ(cz0) - TILE_PAD);
      const sv1 = v1 === n ? n : Math.min(tl.by + bh, texZ(cz1) + TILE_PAD);
      const dx0 = devX(su0), dz0 = devZ(sv0);
      c.save();
      c.beginPath();
      c.rect(cx0, cz0 - y0, cx1 - cx0, cz1 - cz0);
      c.clip();
      c.drawImage(tl.bmp, su0 - tl.bx, sv0 - tl.by, su1 - su0, sv1 - sv0,
        dx0, dz0 - y0, devX(su1) - dx0, devZ(sv1) - dz0);
      c.restore();
    }
  }

  function bakeLayer(L, tier) {
    if (!tier || !viewW || !viewH) return null;
    const tb = PERF ? performance.now() : 0;
    if (PERF) pc[L === lmL ? 'lmRebake' : 'astRebake']++;
    const layerCanvas = L.canvas;
    const w = Math.ceil(viewW * LM_MARGIN), h = Math.ceil(viewH * LM_MARGIN);
    const pw = Math.round(w * dpr), ph = Math.round(h * dpr);
    /* Reassigning the size reallocates and clears the backing store even when it's unchanged */
    const c = layerCanvas.getContext('2d');
    const resized = layerCanvas.width !== pw || layerCanvas.height !== ph;
    if (resized) {
      layerCanvas.width = pw;
      layerCanvas.height = ph;
    } else {
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.clearRect(0, 0, pw, ph);
    }
    if (layerCanvas.style.width !== w + 'px') layerCanvas.style.width = w + 'px';
    if (layerCanvas.style.height !== h + 'px') layerCanvas.style.height = h + 'px';
    const sp = Math.hypot(panVx, panVz);
    const lx = sp > 0.5 ? LEAD * (w - viewW) / 2 * panVx / sp : 0;
    const lz = sp > 0.5 ? LEAD * (h - viewH) / 2 * panVz / sp : 0;
    const b = { tier, k, dpr, w, h, pw, ph, wx0: cx + (lx - w / 2) / k, wz0: cz + (lz - h / 2) / k, cx: 0, cz: 0, room: NaN };
    b.cx = b.wx0 + w / 2 / k;
    b.cz = b.wz0 + h / 2 / k;
    c.setTransform(1, 0, 0, 1, 0, 0);
    drawRegion(c, b, 0, ph);
    if (PERF) {
      const ms = performance.now() - tb;
      pc.bakeMs += ms;
      perfEvent((resized ? 'rebake+resize ' : 'rebake ') + tier.n, L.name, pw * ph, ms);
    }
    return b;
  }

  /* Rebakes now when a pan or zoom-out uncovers the viewport; on the next free draw when the margin
     runs low, the scale drifts, or a better tier fits. Then writes the CSS transform. */
  function positionLayer(L, zooming) {
    const want = pickTier(L.tiers, k * dpr);
    if (!want) return;
    let b = L.bake, s = 1;
    if (b) {
      s = k / b.k;
      const room = Math.min((b.w * s - viewW) / 2 - Math.abs((b.cx - cx) * k),
        (b.h * s - viewH) / 2 - Math.abs((b.cz - cz) * k));
      const rate = b.room - room;
      b.room = room;
      const sHi = zooming ? 2.2 : 1.3, sLo = zooming ? 0.45 : 0.75;
      const soft = softRoom(room, rate) || s > sHi || s < sLo || (!zooming && b.tier !== want);
      if (room < 0 || (soft && takeRaster())) b = null;
    }
    if (!b) {
      rasterFree = false;
      const fresh = bakeLayer(L, want);
      if (fresh) L.bake = fresh;
      b = L.bake;
      if (!b) return;
      s = k / b.k;
    }
    const tx = (b.cx - cx) * k + viewW / 2 - s * b.w / 2;
    const tz = (b.cz - cz) * k + viewH / 2 - s * b.h / 2;
    const tf = 'translate(' + tx.toFixed(1) + 'px,' + tz.toFixed(1) + 'px) scale(' + s.toFixed(4) + ')';
    if (L.tf !== tf) { L.canvas.style.transform = tf; L.tf = tf; if (PERF) pc.layerTf++; }
  }

  /* Graded lightmap double buffer: after the camera sits still for GRADE_IDLE_MS, a CPU canvas
     rasters the current bake with the grade baked in, one band per frame, then swaps in for the
     live layer (which keeps its CSS grade). Any rebake drops back to the live layer. */
  const GRADE_IDLE_MS = 500;
  const GRADE_BANDS = 12;
  let gradeCanvas = null, gradeCtx = null, gradeScratch = null;
  if (CANVAS_FILTER) {
    gradeCanvas = lmLayerCanvas.cloneNode(false);
    gradeCanvas.removeAttribute('id');
    gradeCanvas.classList.add('gx-m2-baked');
    gradeCanvas.style.display = 'none';
    lmLayerCanvas.after(gradeCanvas);
    /* willReadFrequently keeps it on the CPU: a filter on a GPU canvas reads the whole surface
       back first, which is what hitched pans */
    gradeCtx = gradeCanvas.getContext('2d', { willReadFrequently: true });
  }
  let gradeJob = null, gradedBake = null, gradeShown = false, gradeTf = '';
  let lastMoveAt = 0;

  function showGrade(on) {
    if (gradeShown === on) return;
    gradeShown = on;
    gradeCanvas.style.display = on ? '' : 'none';
    lmLayerCanvas.style.display = on ? 'none' : '';
  }

  function dropGrade() {
    gradeJob = null;
    gradedBake = null;
    if (gradeShown) showGrade(false);
  }

  const gradeWanted = () => !!gradeCanvas && !!lmL.bake && gradedBake !== lmL.bake;

  /* Each band draws only its own rows, from the live bake's own tier, so graded and live pixels match */
  function stepGrade() {
    const now = performance.now();
    if (!gradeWanted() || settleAt || dragging || flyAnim || now - lastMoveAt < GRADE_IDLE_MS) return;
    const b = lmL.bake;
    if (!b.pw || !b.ph) return;
    if (!gradeJob || gradeJob.bake !== b) {
      gradeJob = { bake: b, row: 0 };
      if (gradeCanvas.width !== b.pw || gradeCanvas.height !== b.ph) {
        gradeCanvas.width = b.pw;
        gradeCanvas.height = b.ph;
      }
    }
    const band = Math.ceil(b.ph / GRADE_BANDS);
    const y0 = gradeJob.row, h = Math.min(band, b.ph - y0);
    if (!gradeScratch || gradeScratch.width < b.pw || gradeScratch.height < band) {
      gradeScratch = document.createElement('canvas');
      gradeScratch.width = b.pw;
      gradeScratch.height = band;
    }
    const sc = gradeScratch.getContext('2d', { willReadFrequently: true });
    sc.setTransform(1, 0, 0, 1, 0, 0);
    sc.clearRect(0, 0, gradeScratch.width, gradeScratch.height);
    drawRegion(sc, b, y0, y0 + h);
    gradeCtx.setTransform(1, 0, 0, 1, 0, 0);
    gradeCtx.clearRect(0, y0, b.pw, h);
    gradeCtx.filter = LM_FILTER;
    gradeCtx.drawImage(gradeScratch, 0, 0, b.pw, h, 0, y0, b.pw, h);
    gradeCtx.filter = 'none';
    gradeJob.row += h;
    if (gradeJob.row >= b.ph) {
      gradeJob = null;
      gradedBake = b;
      gradeCanvas.style.width = lmLayerCanvas.style.width;
      gradeCanvas.style.height = lmLayerCanvas.style.height;
      gradeCanvas.style.transform = gradeTf = lmL.tf;
      showGrade(true);
    }
    if (PERF) {
      const ms = performance.now() - now;
      perfAdd('grade', ms);
      perfEvent(gradedBake === b ? 'grade band+swap' : 'grade band', 'lightmap', b.pw * h, ms);
    }
  }

  function updateLayers() {
    const zooming = settleAt !== 0;
    if (firmament.isReady()) {
      const g = firmamentGeom();
      const drift = bgBakedSide ? Math.abs(g.side - bgBakedSide) / bgBakedSide : 1;
      if (!bgBakedSide || (drift > (zooming ? 0.5 : 0.04) && takeRaster())) {
        rasterFree = false;
        const tb = PERF ? performance.now() : 0;
        if (firmament.paintBase(bgLayerCanvas, g.side, dpr)) bgBakedSide = g.side;
        if (PERF) {
          const ms = performance.now() - tb;
          pc.bgRebake++;
          pc.bgMs += ms;
          perfEvent('repaint', 'background', bgLayerCanvas.width * bgLayerCanvas.height, ms);
        }
      }
      if (bgBakedSide) {
        const tf = 'translate(' + g.dx.toFixed(1) + 'px,' + g.dz.toFixed(1) + 'px) scale(' + (g.side / bgBakedSide).toFixed(4) + ')';
        if (bgTf !== tf) { bgLayerCanvas.style.transform = tf; bgTf = tf; if (PERF) pc.layerTf++; }
      }
    }
    const lmBefore = lmL.bake;
    positionLayer(lmL, zooming);
    if (lmL.bake !== lmBefore) dropGrade();
    if (gradeShown && gradeTf !== lmL.tf) gradeCanvas.style.transform = gradeTf = lmL.tf;
    positionLayer(astL, zooming);
  }

  /* Map-table framing: rim ring + outside vignette, drawn whenever any of it touches the
     CSS-px rect (x0, y0)–(x1, y1) of context `c` */
  function drawRim(c, x0, y0, x1, y1) {
    const r = WORLD_R * k;
    const rx = sx(0), rz = sz(0);
    const nearest = Math.hypot(
      Math.max(x0 - rx, rx - x1, 0),
      Math.max(y0 - rz, rz - y1, 0));
    const farthest = Math.hypot(Math.max(rx - x0, x1 - rx), Math.max(rz - y0, y1 - rz));
    if (farthest > r) {
      const vg = c.createRadialGradient(rx, rz, r, rx, rz, r * 1.8);
      if (PERF) pc.gradients++;
      vg.addColorStop(0, 'rgba(8,8,18,0)');
      vg.addColorStop(1, 'rgba(8,8,18,0.6)');
      /* Even-odd fill of rect + rim circle paints only outside the rim, with no clip mask pass */
      c.fillStyle = vg;
      c.beginPath();
      c.rect(x0, y0, x1 - x0, y1 - y0);
      c.arc(rx, rz, r, 0, Math.PI * 2);
      c.fill('evenodd');
    }
    if (r < nearest - 10 || r > farthest + 10) return;
    c.strokeStyle = 'rgba(131,50,172,0.12)';
    c.lineWidth = 7;
    c.beginPath();
    c.arc(rx, rz, r, 0, Math.PI * 2);
    c.stroke();
    c.strokeStyle = 'rgba(131,50,172,0.45)';
    c.lineWidth = 1.5;
    c.beginPath();
    c.arc(rx, rz, r, 0, Math.PI * 2);
    c.stroke();
  }

  /* Conservative: false only when the stroke can't touch the rect, including the zoomed-in
     case where the rect sits wholly inside the ellipse (sub-px dashes cost per circumference) */
  function zoneTouches(ex, ez, a, b, rot, x0, y0, x1, y1) {
    const pad = 2;
    const co = Math.cos(rot), si = Math.sin(rot);
    const hx = Math.sqrt(a * a * co * co + b * b * si * si);
    const hz = Math.sqrt(a * a * si * si + b * b * co * co);
    if (ex + hx < x0 - pad || ex - hx > x1 + pad || ez + hz < y0 - pad || ez - hz > y1 + pad) return false;
    /* Every corner inside the ellipse scaled by rho keeps the rect ≥ pad from its edge */
    const rho = 1 - pad / Math.min(a, b);
    if (rho <= 0) return true;
    const rho2 = rho * rho;
    const inside = (px, py) => {
      const dx = px - ex, dy = py - ez;
      const u = (dx * co + dy * si) / a, v = (-dx * si + dy * co) / b;
      return u * u + v * v < rho2;
    };
    return !(inside(x0, y0) && inside(x1, y0) && inside(x0, y1) && inside(x1, y1));
  }

  function drawZones(c, x0, y0, x1, y1) {
    const data = systems.getData();
    c.save();
    c.strokeStyle = 'rgba(92,225,230,0.15)';
    c.lineWidth = 1.5;
    c.setLineDash([0.5, 0.4]);
    for (const zid in data.zones) {
      const zone = data.zones[zid];
      if (!zone.position || !zone.radius || HIDDEN_ZONE_ELLIPSES.has(zid)) continue;
      const ex = sx(zone.position.x), ez = sz(zone.position.z);
      const a = zone.radius.rx * k, b = zone.radius.rz * k;
      const rot = (zone.rotation || 0) * Math.PI / 180;
      if (!zoneTouches(ex, ez, a, b, rot, x0, y0, x1, y1)) continue;
      if (PERF) pc.zoneStrokes++;
      c.beginPath();
      c.ellipse(ex, ez, a, b, rot, 0, Math.PI * 2);
      c.stroke();
    }
    c.restore();
  }

  /* Rim + zones don't move with time, so they raster once per camera into an overscanned cache that
     is always the same size (no reallocation). At rest it's built on the exact camera and blitted at a
     whole-device-px offset, which is bit-exact; mid-pan it slides by whole device px. */
  const vecCanvas = document.createElement('canvas');
  const vecCtx = vecCanvas.getContext('2d');
  const VEC_MARGIN = 1.5;
  let vec = null;

  function buildVec(lead) {
    const tb = PERF ? performance.now() : 0;
    const ox = Math.round(canvas.width * (VEC_MARGIN - 1) / 2);
    const oy = Math.round(canvas.height * (VEC_MARGIN - 1) / 2);
    const pw = canvas.width + ox * 2, ph = canvas.height + oy * 2;
    const resized = vecCanvas.width !== pw || vecCanvas.height !== ph;
    if (resized) {
      vecCanvas.width = pw;
      vecCanvas.height = ph;
    } else {
      vecCtx.setTransform(1, 0, 0, 1, 0, 0);
      vecCtx.clearRect(0, 0, pw, ph);
    }
    /* Mid-pan builds shift the cache ahead along the pan by whole device px */
    const sp = lead ? Math.hypot(panVx, panVz) : 0;
    const lx = sp > 0.5 ? Math.round(LEAD * ox * panVx / sp) : 0;
    const ly = sp > 0.5 ? Math.round(LEAD * oy * panVz / sp) : 0;
    const ex = ox - lx, ey = oy - ly;
    vecCtx.setTransform(dpr, 0, 0, dpr, ex, ey);
    drawRim(vecCtx, -ex / dpr, -ey / dpr, (pw - ex) / dpr, (ph - ey) / dpr);
    drawZones(vecCtx, -ex / dpr, -ey / dpr, (pw - ex) / dpr, (ph - ey) / dpr);
    vec = { cx, cz, k, dpr, cw: canvas.width, ch: canvas.height, ox, oy, lx, ly, room: NaN };
    if (PERF) {
      pc.vecBuilds++;
      perfEvent(resized ? 'vector cache+resize' : 'vector cache', 'rim+zones', pw * ph, performance.now() - tb);
    }
  }

  function blitVec(dx, dy) {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(vecCanvas, vec.ox + dx, vec.oy + dy, canvas.width, canvas.height,
      0, 0, canvas.width, canvas.height);
    ctx.restore();
    if (PERF) pc.vecBlits++;
  }

  function drawStaticVectors(settled, kChanged) {
    /* drawImage throws on a zero-size source (collapsed window) */
    if (!canvas.width || !canvas.height) return;
    if (kChanged) {
      /* Mid-zoom every frame is a new scale; a cache would only add a copy */
      drawRim(ctx, 0, 0, viewW, viewH);
      drawZones(ctx, 0, 0, viewW, viewH);
      return;
    }
    if (vec && vec.k === k && vec.dpr === dpr && vec.cw === canvas.width && vec.ch === canvas.height) {
      const kd = k * dpr;
      const dx = Math.round((cx - vec.cx) * kd) - vec.lx, dy = Math.round((cz - vec.cz) * kd) - vec.ly;
      const room = Math.min(vec.ox - Math.abs(dx), vec.oy - Math.abs(dy));
      const rate = vec.room - room;
      vec.room = room;
      const exact = vec.cx === cx && vec.cz === cz;
      /* A deferred rest rebuild blits the whole-px approximation for one frame, then goes exact */
      const rebuild = room < 0 || (settled ? !exact && takeRaster() : softRoom(room, rate) && takeRaster());
      if (!rebuild) {
        blitVec(dx, dy);
        return;
      }
    }
    rasterFree = false;
    buildVec(!settled);
    blitVec(-vec.lx, -vec.ly);
  }

  function drawOrbits(mapScale) {
    const alpha = Math.min(1, Math.max(0, (mapScale - 5) / 3));
    if (alpha <= 0) return;
    const data = systems.getData();
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 3;
    const margin = 50 * k;
    for (const id in data.bodies) {
      const body = data.bodies[id];
      if (!body.parentId || body.position) continue;
      const meta = systems.getBodyMeta(id);
      if (!meta?.orbital) continue;
      const pp = positions.get(meta.parentId);
      if (!pp) continue;
      const px = sx(pp.x), pz = sz(pp.z);
      const reach = meta.orbital.a * (1 + meta.orbital.e) * k;
      if (px + reach < -margin || px - reach > viewW + margin ||
          pz + reach < -margin || pz - reach > viewH + margin) continue;
      /* Cached Path2D in parent-local world units — one stroke call per orbit */
      let path = orbitCache.get(id);
      if (!path) {
        const pts = systems.sampleOrbitXZ(id);
        if (!pts) continue;
        path = new Path2D();
        path.moveTo(pts[0], pts[1]);
        for (let i = 2; i < pts.length; i += 2) path.lineTo(pts[i], pts[i + 1]);
        path.closePath();
        orbitCache.set(id, path);
      }
      ctx.save();
      ctx.translate(px, pz);
      ctx.scale(k, k);
      ctx.lineWidth = 3 / k;
      ctx.stroke(path);
      ctx.restore();
    }
    ctx.restore();
  }

  /* The gradient lives in world units (lanes stroke under a uniform world transform, which keeps
     Firefox's AA-stroke fast path), so it survives pans and zooms; only a moving endpoint rebuilds it */
  function laneGradient(lane, x1, z1, x2, z2) {
    let lc = laneCache.get(lane);
    if (!lc || lc.x1 !== x1 || lc.z1 !== z1 || lc.x2 !== x2 || lc.z2 !== z2) {
      const voidHit = segCircleT(x1, z1, x2, z2, CORE_VOID_R);
      let stops;
      if (voidHit) {
        const [t0, t1] = voidHit;
        stops = [
          0, laneColorAt(0, 1),
          Math.max(0, t0 - 0.02), laneColorAt(t0, 1),
          t0, laneColorAt(t0, 0.25),
          t1, laneColorAt(t1, 0.25),
          Math.min(1, t1 + 0.02), laneColorAt(t1, 1),
          1, laneColorAt(1, 1)
        ];
      } else {
        stops = [0, laneColorAt(0, 1), 0.5, laneColorAt(0.5, 1), 1, laneColorAt(1, 1)];
      }
      const grad = ctx.createLinearGradient(x1, z1, x2, z2);
      if (PERF) pc.gradients++;
      for (let i = 0; i < stops.length; i += 2) grad.addColorStop(stops[i], stops[i + 1]);
      lc = { x1, z1, x2, z2, grad };
      laneCache.set(lane, lc);
    }
    return lc.grad;
  }

  /* Lanes run body-center to body-center — dots occlude the endpoints, exactly like 3D */
  function drawLanes() {
    const data = systems.getData();
    ctx.save();
    ctx.globalAlpha = 0.6;
    const kd = k * dpr;
    ctx.setTransform(kd, 0, 0, kd, (viewW / 2 - cx * k) * dpr, (viewH / 2 - cz * k) * dpr);
    ctx.lineWidth = 2 / k;
    for (const laneId in data.hyperlanes) {
      const lane = data.hyperlanes[laneId];
      const fromId = systems.getPreferStation(lane.fromId);
      const toId = systems.getPreferStation(lane.toId);
      const from = positions.get(fromId);
      const to = positions.get(toId);
      if (!from || !to) continue;

      const x1 = from.x, z1 = from.z;
      const x2 = to.x, z2 = to.z;
      if (Math.hypot(x2 - x1, z2 - z1) < 1e-6) continue;

      const sx1 = sx(x1), sz1 = sz(z1), sx2 = sx(x2), sz2 = sz(z2);
      if (Math.max(sx1, sx2) < 0 || Math.min(sx1, sx2) > viewW ||
          Math.max(sz1, sz2) < 0 || Math.min(sz1, sz2) > viewH) continue;

      ctx.strokeStyle = laneGradient(lane, x1, z1, x2, z2);
      ctx.beginPath();
      ctx.moveTo(x1, z1);
      ctx.lineTo(x2, z2);
      ctx.stroke();
    }
    ctx.restore();
  }

  function dotAlpha(id, info, mapScale) {
    if (mapScale < (DOT_SHOW[info.tier] ?? 0)) return 0;
    if (info.tier === 'landmark' && id !== 'smbh' && mapScale > LANDMARK_FADE) {
      return Math.max(0, 1 - (mapScale - LANDMARK_FADE));
    }
    return 1;
  }

  function dotRadius(info, mapScale) {
    const show = Math.max(DOT_SHOW[info.tier] ?? 0, 1);
    const grow = Math.min(DOT_GROW_CAP[info.tier] ?? 2,
      1 + Math.max(0, mapScale - show) * DOT_GROW_RATE);
    return (info.size * grow) / 2;
  }

  const smbhRadius = (mapScale) => 18 + Math.min(mapScale, 20) * 1.35;

  /* Glow gradient in local space around the hole, drawn under a translate so it survives pans */
  let smbhGlow = null, smbhGlowR = NaN;

  /* The heart of the galaxy deserves better than a dot: black core, photon ring, glow */
  function drawSMBH(mapScale) {
    const p = positions.get('smbh');
    if (!p) return;
    const px = sx(p.x), pz = sz(p.z);
    const r = smbhRadius(mapScale);
    if (px < -r * 4 || px > viewW + r * 4 || pz < -r * 4 || pz > viewH + r * 4) return;
    ctx.save();
    if (smbhGlowR !== r) {
      smbhGlow = ctx.createRadialGradient(0, 0, r, 0, 0, r * 3.5);
      if (PERF) pc.gradients++;
      smbhGlow.addColorStop(0, 'rgba(246,121,229,0.35)');
      smbhGlow.addColorStop(0.4, 'rgba(131,50,172,0.18)');
      smbhGlow.addColorStop(1, 'rgba(131,50,172,0)');
      smbhGlowR = r;
    }
    ctx.setTransform(dpr, 0, 0, dpr, px * dpr, pz * dpr);
    ctx.fillStyle = smbhGlow;
    ctx.beginPath();
    ctx.arc(0, 0, r * 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(px, pz, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,217,240,0.95)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(px, pz, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,144,224,0.35)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(px, pz, r + 2.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  /* Faction → spectral lerp strings, rebuilt only when the zoom-driven colorT changes */
  function dotColors(info, colorT) {
    if (info.colorT === colorT) return;
    info.colorT = colorT;
    const a = info.rgb, b = info.specRgb;
    const rgb = !b || colorT <= 0 ? a : colorT >= 1 ? b
      : [Math.round(a[0] + (b[0] - a[0]) * colorT),
        Math.round(a[1] + (b[1] - a[1]) * colorT),
        Math.round(a[2] + (b[2] - a[2]) * colorT)];
    info.fill = rgbStr(rgb);
    info.halo0 = rgbaStr(rgb, 0.55);
    info.halo1 = rgbaStr(rgb, 0.18);
    info.halo2 = rgbaStr(rgb, 0);
    info.halo = null;
  }

  function drawDots(mapScale) {
    /* Faction → spectral color lerp as zoom increases (matches 3D crossfade) */
    const colorT = Math.max(0, Math.min(1, (mapScale - 4) / 11));
    const rim = 'rgba(10,10,20,0.75)';
    positions.forEach((p, id) => {
      if (id === 'smbh') return;   /* gets its own portrait via drawSMBH */
      const info = bodyInfo(id);
      if (!info) return;
      const alpha = dotAlpha(id, info, mapScale);
      if (alpha <= 0) return;
      const px = sx(p.x), pz = sz(p.z);
      if (px < -20 || px > viewW + 20 || pz < -20 || pz > viewH + 20) return;
      dotColors(info, colorT);
      const r = dotRadius(info, mapScale);
      ctx.globalAlpha = alpha;

      /* Stars and landmarks get a soft halo so they read against the lightmap */
      if (info.tier === 'star' || info.tier === 'landmark') {
        const gr = r * 3;
        /* Local-space gradient under a translate: position-free, so pans reuse it */
        if (!info.halo || info.haloR !== r) {
          const glow = ctx.createRadialGradient(0, 0, r * 0.4, 0, 0, gr);
          if (PERF) pc.gradients++;
          glow.addColorStop(0, info.halo0);
          glow.addColorStop(0.5, info.halo1);
          glow.addColorStop(1, info.halo2);
          info.halo = glow;
          info.haloR = r;
        }
        ctx.setTransform(dpr, 0, 0, dpr, px * dpr, pz * dpr);
        ctx.fillStyle = info.halo;
        ctx.beginPath();
        ctx.arc(0, 0, gr, 0, Math.PI * 2);
        ctx.fill();
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      ctx.fillStyle = info.fill;
      ctx.strokeStyle = rim;
      ctx.lineWidth = 1;
      if (info.tier === 'gng') {
        const s = r * 2;
        ctx.fillRect(px - r, pz - r, s, s);
        ctx.strokeRect(px - r, pz - r, s, s);
      } else {
        ctx.beginPath();
        ctx.arc(px, pz, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    });
    ctx.globalAlpha = 1;
  }

  function drawRing(id, pad, alpha, mapScale) {
    const p = positions.get(id);
    if (!p) return;
    const info = bodyInfo(id);
    const base = id === 'smbh' ? smbhRadius(mapScale) : info ? dotRadius(info, mapScale) : 4;
    const radius = base + pad;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = info?.spectral || info?.color || '#fff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(sx(p.x), sz(p.z), radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  /* All writes first, then all reads: one layout flush for the whole batch instead of one per label */
  function createLabels(ids) {
    const data = systems.getData();
    const fixedFrag = document.createDocumentFragment();
    const movingFrag = document.createDocumentFragment();
    const made = [];
    for (const id of ids) {
      const info = bodyInfo(id);
      const el = document.createElement('div');
      el.className = 'gx-m2-label';
      el.dataset.tier = info.tier;
      el.textContent = displayName(id, data.bodies[id], info.tier);
      (info.fixed ? fixedFrag : movingFrag).appendChild(el);
      const L = { el, fixed: info.fixed, w: 0, h: 0, tx: NaN, ty: NaN, op: '0' };
      labelEls.set(id, L);
      made.push(L);
    }
    staticLabelLayer.appendChild(fixedFrag);
    labelLayer.appendChild(movingFrag);
    for (const L of made) { L.w = L.el.offsetWidth; L.h = L.el.offsetHeight; }
    if (PERF) { pc.labelsCreated += made.length; pc.labelBatches++; }
  }

  function buildZoneLabels() {
    zonesBuilt = true;
    const data = systems.getData();
    zoneSig = zoneSignature(data);
    const frag = document.createDocumentFragment();
    for (const zid in data.zones) {
      const zone = data.zones[zid];
      if (!zone.position || HIDDEN_ZONES.has(zid)) continue;
      const el = document.createElement('div');
      el.className = 'gx-zone-label-2d';
      el.innerHTML = (ZONE_DISPLAY[zid] || zone.name).replace(/\n/g, '<br>');
      if (zone.factionId && data.factions[zone.factionId]) {
        el.style.color = data.factions[zone.factionId].color;
      }
      frag.appendChild(el);
      zoneEls.push({ el, x: zone.position.x, z: zone.position.z, w: 0, h: 0, tx: NaN, ty: NaN, rect: [0, 0, 0, 0] });
    }
    staticLabelLayer.appendChild(frag);
    for (const zl of zoneEls) { zl.w = zl.el.offsetWidth; zl.h = zl.el.offsetHeight; }
  }

  /* Label top-left for a dot at screen (px, pz), written into out[0..1] */
  const spot = [0, 0];
  function labelSpot(id, info, L, px, pz, mapScale, out) {
    const dotR = dotRadius(info, mapScale) + 1;
    out[0] = px - L.w / 2;
    if (id === 'smbh') out[1] = pz + smbhRadius(mapScale) + 6;
    else if (info.tier === 'landmark') out[1] = pz - L.h / 2;
    else if (info.tier === 'child' || info.tier === 'star') out[1] = pz + dotR + 3;
    else out[1] = pz - dotR - 3 - L.h;
  }

  /* Whole-px transform writes, skipped when the rounded spot hasn't changed */
  function placeLabel(L, x, y) {
    const tx = Math.round(x), ty = Math.round(y);
    if (L.tx === tx && L.ty === ty) return false;
    L.tx = tx; L.ty = ty;
    L.el.style.transform = 'translate(' + tx + 'px,' + ty + 'px)';
    return true;
  }

  function labelAlpha(id, info, mapScale) {
    const th = LABEL_SHOW[info.tier] ?? 0;
    const base = LABEL_OPACITY[info.tier] ?? 0.7;
    let a = th === 0 ? base : Math.min(1, (mapScale - th) / (LABEL_FADE_RANGE[info.tier] ?? 2)) * base;
    if (info.tier === 'landmark' && id !== 'smbh' && mapScale > LANDMARK_FADE) {
      a = Math.max(0, 1 - (mapScale - LANDMARK_FADE)) * base;
    }
    return a;
  }

  /* Overlap resolution by tier priority; a loser needs 2 clear passes to come back (hysteresis) */
  function declutterPass(cands, zoneRects) {
    const kept = zoneRects.slice();
    cands.sort((a, b) => a.prio - b.prio);
    for (const c of cands) {
      const st = declutter.get(c.id) || { hidden: false, clear: 0 };
      if (kept.some(r => rectsOverlap(r, c.rect))) {
        st.hidden = true;
        st.clear = 0;
      } else if (st.hidden && ++st.clear >= 2) {
        st.hidden = false;
      }
      if (!st.hidden || c.prio === 0) kept.push(c.rect);
      declutter.set(c.id, st);
    }
  }

  function updateLabels(mapScale, settled) {
    /* Static container re-anchors at rest and on any scale/viewport change; mid-pan it rides
       the whole-px offset since the anchor, so fixed labels need no individual writes */
    if (!slAnchor) slAnchor = { cx: NaN, cz: NaN, k: NaN, vw: 0, vh: 0 };
    if (settled || slAnchor.k !== k || slAnchor.vw !== viewW || slAnchor.vh !== viewH) {
      slAnchor.cx = cx; slAnchor.cz = cz; slAnchor.k = k; slAnchor.vw = viewW; slAnchor.vh = viewH;
    }
    const ox = Math.round((slAnchor.cx - cx) * k), oy = Math.round((slAnchor.cz - cz) * k);
    if (ox !== slOx || oy !== slOy) {
      slOx = ox; slOy = oy;
      staticLabelLayer.style.transform = ox || oy ? 'translate(' + ox + 'px,' + oy + 'px)' : '';
      if (PERF) pc.staticTf++;
    }
    /* Anchor-frame screen coords; identical to sx/sz once re-anchored */
    const ax = (x) => (x - slAnchor.cx) * k + viewW / 2;
    const az = (z) => (z - slAnchor.cz) * k + viewH / 2;

    /* Every label up front in one batch (one layout flush) so pans never create or measure mid-gesture */
    if (!labelsPrimed) {
      labelsPrimed = true;
      missing.length = 0;
      positions.forEach((p, id) => { if (!labelEls.has(id) && bodyInfo(id)) missing.push(id); });
      if (missing.length) createLabels(missing);
    }
    let n = 0;
    missing.length = 0;
    positions.forEach((p, id) => {
      const info = bodyInfo(id);
      if (!info) return;
      const forced = id === selectedId || id === hoveredId;
      let a = labelAlpha(id, info, mapScale);
      if (forced) a = Math.max(a, 1);
      const px = sx(p.x), pz = sz(p.z);
      if (a <= 0 || dotAlpha(id, info, mapScale) <= 0 ||
          px < -150 || px > viewW + 150 || pz < -60 || pz > viewH + 60) {
        const L = labelEls.get(id);
        if (L && L.op !== '0') { L.el.style.opacity = '0'; L.op = '0'; }
        return;
      }
      const c = candPool[n] || (candPool[n] = { id: '', info: null, L: null, a: 0, px: 0, pz: 0, prio: 0, rect: [0, 0, 0, 0] });
      n++;
      c.id = id; c.info = info; c.a = a; c.px = px; c.pz = pz;
      c.prio = forced ? 0 : (LABEL_PRIO[info.tier] ?? 9);
      c.L = labelEls.get(id) || null;
      if (!c.L) missing.push(id);
    });
    if (!zonesBuilt) buildZoneLabels();
    if (missing.length) createLabels(missing);

    /* Zone labels: big at overview, gone by mapScale 4 */
    const zoneAlpha = Math.max(0, Math.min(1, (4 - mapScale) / 2));
    const zoneOp = zoneAlpha.toFixed(2);
    zoneRects.length = 0;
    for (const zl of zoneEls) {
      const px = sx(zl.x), pz = sz(zl.z);
      if (zoneAlpha > 0.01 && placeLabel(zl, ax(zl.x) - zl.w / 2, az(zl.z) - zl.h / 2) && PERF) pc.zoneTf++;
      if (zl.op !== zoneOp) { zl.el.style.opacity = zoneOp; zl.op = zoneOp; }
      if (zoneAlpha > 0.05) {
        const r = zl.rect;
        r[0] = px - zl.w / 2; r[1] = pz - zl.h / 2; r[2] = zl.w; r[3] = zl.h;
        zoneRects.push(r);
      }
    }

    cands.length = 0;
    for (let i = 0; i < n; i++) {
      const c = candPool[i];
      const { id, info, px, pz } = c;
      const L = c.L || (c.L = labelEls.get(id));
      const r = c.rect;
      labelSpot(id, info, L, px, pz, mapScale, r);
      r[2] = L.w; r[3] = L.h;
      let moved;
      if (info.fixed) {
        const p = positions.get(id);
        labelSpot(id, info, L, ax(p.x), az(p.z), mapScale, spot);
        moved = placeLabel(L, spot[0], spot[1]);
      } else {
        moved = placeLabel(L, r[0], r[1]);
      }
      if (moved && PERF) pc.labelTf++;
      cands.push(c);
    }

    const now = performance.now();
    if (now - lastDeclutterAt >= DECLUTTER_MS) {
      lastDeclutterAt = now;
      declutterPass(cands, zoneRects);
    }
    for (const c of cands) {
      const hidden = c.prio !== 0 && declutter.get(c.id)?.hidden;
      const op = hidden ? '0' : Math.min(1, c.a).toFixed(2);
      if (c.L.op !== op) { c.L.el.style.opacity = op; c.L.op = op; }
    }
  }

  const fmtLy = (ly) => Math.round(ly).toLocaleString() + ' ly';

  /* Ctrl+click waypoints → dashed polyline + per-segment ly + cumulative chip.
     Body-anchored waypoints follow their orbits, so distances update live. */
  function drawMeasure() {
    if (!measurePts.length) return;
    const pts = measurePts.map(measurePt).filter(Boolean);
    if (!pts.length) return;
    ctx.save();
    ctx.strokeStyle = 'rgba(92,225,230,0.9)';
    ctx.fillStyle = 'rgba(92,225,230,0.9)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(sx(pts[0].x), sz(pts[0].z));
    for (let i = 1; i < pts.length; i++) ctx.lineTo(sx(pts[i].x), sz(pts[i].z));
    const rubber = !measureDone && !dragging;
    if (rubber) ctx.lineTo(lastMouseX, lastMouseY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = '600 12px "League Spartan", sans-serif';
    ctx.textAlign = 'center';
    let total = 0;
    const segLabel = (x1, z1, x2, z2, mx, my) => {
      const d = Math.hypot(x2 - x1, z2 - z1) * NICE_CONSTANT;
      total += d;
      ctx.strokeStyle = 'rgba(10,10,20,0.9)';
      ctx.lineWidth = 3;
      ctx.strokeText(fmtLy(d), mx, my - 5);
      ctx.fillText(fmtLy(d), mx, my - 5);
    };
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i];
      segLabel(a.x, a.z, b.x, b.z, (sx(a.x) + sx(b.x)) / 2, (sz(a.z) + sz(b.z)) / 2);
    }
    if (rubber) {
      const a = pts[pts.length - 1];
      segLabel(a.x, a.z, wx(lastMouseX), wz(lastMouseY),
        (sx(a.x) + lastMouseX) / 2, (sz(a.z) + lastMouseY) / 2);
    }

    for (const p of pts) {
      ctx.beginPath();
      ctx.arc(sx(p.x), sz(p.z), 3, 0, Math.PI * 2);
      ctx.fill();
    }

    /* Cumulative chip: rides the cursor while measuring, parks at the endpoint when done */
    if (total > 0) {
      const end = pts[pts.length - 1];
      const bx = (measureDone ? sx(end.x) : lastMouseX) + 16;
      const by = (measureDone ? sz(end.z) : lastMouseY) + 20;
      const text = 'Σ ' + fmtLy(total);
      const tw = ctx.measureText(text).width;
      ctx.fillStyle = 'rgba(13,13,26,0.88)';
      ctx.strokeStyle = 'rgba(92,225,230,0.45)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(bx, by - 13, tw + 14, 20, 4);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'rgba(92,225,230,0.95)';
      ctx.textAlign = 'left';
      ctx.fillText(text, bx + 7, by + 1);
    }
    ctx.restore();
  }

  const perfAcc = {}, perfMax = {}, perfTot = {};
  let perfN = 0, perfPrintAt = 0;
  const perfAdd = (name, d) => {
    perfAcc[name] = (perfAcc[name] || 0) + d;
    perfMax[name] = Math.max(perfMax[name] || 0, d);
    perfTot[name] = (perfTot[name] || 0) + d;
  };
  const perfMark = (name, t0) => {
    const t1 = performance.now();
    perfAdd(name, t1 - t0);
    return t1;
  };

  function draw(rotationTime) {
    let t = PERF ? performance.now() : 0;
    const t0 = t;
    if (PERF) pc.draws++;
    rasterFree = true;
    rasterDeferred = false;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, viewW, viewH);

    ensurePositions(rotationTime);
    if (PERF) t = perfMark('flatten', t);
    /* Follow-cam: stay centered on the tracked body as it orbits */
    if (trackedId && !flyAnim && !dragging) {
      const tp = positions.get(trackedId);
      if (tp) { cx = tp.x; cz = tp.z; }
    }
    const mapScale = k / K_DEFAULT;
    const kChanged = k !== prevK;
    const moving = kChanged || cx !== prevCx || cz !== prevCz;
    /* A held drag with a still pointer isn't rest: no exact rebuilds or label re-anchors mid-gesture */
    const settled = !moving && !dragging;
    if (kChanged || settled) {
      panVx = panVz = 0;
    } else if (moving) {
      panVx = panVx * 0.5 + (cx - prevCx) * k * 0.5;
      panVz = panVz * 0.5 + (cz - prevCz) * k * 0.5;
    }
    prevCx = cx; prevCz = cz; prevK = k;
    restPending = moving;
    if (moving) lastMoveAt = performance.now();

    updateLayers();
    if (PERF) t = perfMark('layers', t);
    const g = firmamentGeom();
    if (starsAt.t !== rotationTime || starsAt.dx !== g.dx || starsAt.dz !== g.dz || starsAt.side !== g.side) {
      starsCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      starsCtx.clearRect(0, 0, viewW, viewH);
      firmament.drawStars(starsCtx, g.dx, g.dz, g.side, viewW, viewH, rotationTime, dpr);
      if (firmament.isReady()) {
        starsAt.t = rotationTime; starsAt.dx = g.dx; starsAt.dz = g.dz; starsAt.side = g.side;
      }
      if (PERF) pc.starsDraws++;
    }
    if (PERF) t = perfMark('stars', t);
    drawStaticVectors(settled, kChanged);
    if (PERF) t = perfMark('rim+zones', t);
    drawOrbits(mapScale);
    if (PERF) t = perfMark('orbits', t);
    drawLanes();
    if (PERF) t = perfMark('lanes', t);
    drawDots(mapScale);
    drawSMBH(mapScale);
    if (hoveredId && hoveredId !== selectedId) drawRing(hoveredId, 3.5, 0.6, mapScale);
    if (selectedId) drawRing(selectedId, 5, 0.9, mapScale);
    drawMeasure();
    if (PERF) t = perfMark('dots+rings', t);
    updateLabels(mapScale, settled);
    /* A soft rebake lost the raster slot; the next draw takes it */
    if (rasterDeferred) dirty = true;
    if (PERF) {
      pc.drawMs += perfMark('labels', t) - t0;
      perfN++;
    }
  }

  /* Per-section averages per draw, printed on a wall-clock beat so an open console stays cheap */
  function perfPrint() {
    const now = performance.now();
    if (now - perfPrintAt < 2000) return;
    perfPrintAt = now;
    if (!perfN && !perfAcc.grade) return;
    const rows = {};
    for (const [n, v] of Object.entries(perfAcc)) {
      rows[n] = { avg: +(v / Math.max(1, perfN)).toFixed(2), max: +perfMax[n].toFixed(2) };
      perfAcc[n] = 0;
      perfMax[n] = 0;
    }
    rows.draws = { avg: perfN, max: 0 };
    console.table(rows);
    perfN = 0;
  }

  function updateScaleBar() {
    if (k === lastBarK) return;
    lastBarK = k;
    const barEl = document.getElementById('scale-bar');
    const lineEl = document.getElementById('scale-bar-line');
    const labelEl = document.getElementById('scale-bar-label');
    if (!barEl) return;
    const lyPerPx = NICE_CONSTANT / k;
    const maxBarPx = Math.min(window.innerWidth * 0.3, 280);
    let bestLy = null;
    for (let i = NICE_DISTANCES.length - 1; i >= 0; i--) {
      if (NICE_DISTANCES[i] / lyPerPx <= maxBarPx) { bestLy = NICE_DISTANCES[i]; break; }
    }
    if (!bestLy) { barEl.style.visibility = 'hidden'; return; }
    barEl.style.visibility = 'visible';
    lineEl.style.width = Math.round(bestLy / lyPerPx) + 'px';
    labelEl.textContent = bestLy === NICE_CONSTANT
      ? '69 ly (1 map unit)'
      : bestLy.toLocaleString() + ' ly';
  }

  /* Zoom about a screen-space anchor so that world point stays put */
  function zoomAt(factor, ax, ay) {
    const newK = Math.min(Math.max(k * factor, kMin), K_MAX);
    if (newK === k) return;
    const wxA = wx(ax), wzA = wz(ay);
    k = newK;
    cx = wxA - (ax - viewW / 2) / k;
    cz = wzA - (ay - viewH / 2) / k;
    clampCam();
    queueSave();
    markDirty();
  }

  /* Q/E zoom toward the selected body if any, else the cursor */
  function zoomFocal(factor) {
    let ax = lastMouseX, ay = lastMouseY;
    if (selectedId && positions) {
      const p = positions.get(selectedId);
      if (p) { ax = sx(p.x); ay = sz(p.z); }
    }
    zoomAt(factor, ax, ay);
  }

  function hitTest(mx, my) {
    if (!positions) return null;
    const mapScale = k / K_DEFAULT;
    let best = null, bestD2 = Infinity;
    positions.forEach((p, id) => {
      const info = bodyInfo(id);
      if (!info || dotAlpha(id, info, mapScale) <= 0) return;
      const dx = sx(p.x) - mx, dy = sz(p.z) - my;
      const d2 = dx * dx + dy * dy;
      const base = id === 'smbh' ? smbhRadius(mapScale) : dotRadius(info, mapScale);
      const r = Math.max(base + 4, 8);
      if (d2 < r * r && d2 < bestD2) { best = id; bestD2 = d2; }
    });
    return best;
  }

  function flyTo(id) {
    ensurePositions(lastRotTime);
    const p = positions.get(id);
    if (!p) return;
    trackedId = id;
    /* Mirror the track into 3D so it survives a view switch */
    callbacks.onTrack?.(id);
    const info = bodyInfo(id);
    const targetScale = info.tier === 'landmark' ? 2 : info.tier === 'star' ? 4 : info.tier === 'gng' ? 8 : 6;
    flyAnim = {
      fromCx: cx, fromCz: cz, fromK: k,
      toCx: p.x, toCz: p.z, toK: Math.max(targetScale * K_DEFAULT, k),
      start: performance.now(), duration: 800
    };
    markDirty();
  }

  function resetView() {
    releaseTracking();
    flyAnim = {
      fromCx: cx, fromCz: cz, fromK: k,
      toCx: 0, toCz: 0, toK: Math.max(K_DEFAULT, kMin),
      start: performance.now(), duration: 1000
    };
    markDirty();
  }

  function stepFly() {
    const raw = (performance.now() - flyAnim.start) / flyAnim.duration;
    const t = raw >= 1 ? 1 : raw * raw * (3 - 2 * raw);
    cx = flyAnim.fromCx + (flyAnim.toCx - flyAnim.fromCx) * t;
    cz = flyAnim.fromCz + (flyAnim.toCz - flyAnim.fromCz) * t;
    k = flyAnim.fromK + (flyAnim.toK - flyAnim.fromK) * t;
    if (raw >= 1) {
      flyAnim = null;
      queueSave();
    }
    markDirty();
  }

  const keysHeld = () => keys.KeyW || keys.KeyS || keys.KeyA || keys.KeyD || keys.KeyQ || keys.KeyE;

  /* Called from the main RAF every frame while in 2D view. Orbital drift and twinkle draw at
     display rate; returns whether 2D still needs frames (false lets a paused loop park). */
  function frame(delta, rotationTime, rotating) {
    if (!active) return false;
    if (PERF) pc.frames++;
    if (staleData) refreshData();
    /* T=0 while paused still changes the clock — repaint once so the reset shows */
    if (!rotating && rotationTime !== lastRotTime) markDirty();
    lastRotTime = rotationTime;
    if (flyAnim) stepFly();

    if (k !== lastKForSettle) {
      lastKForSettle = k;
      settleAt = performance.now() + 200;
    } else if (settleAt && performance.now() >= settleAt) {
      settleAt = 0;
      markDirty();   /* one clean rebake at the tight thresholds */
    }

    if (keys.KeyW || keys.KeyS || keys.KeyA || keys.KeyD) {
      const step = PAN_SPEED * (keys.ShiftLeft || keys.ShiftRight ? 3 : 1) / k;
      if (keys.KeyW) cz -= step;
      if (keys.KeyS) cz += step;
      if (keys.KeyA) cx -= step;
      if (keys.KeyD) cx += step;
      clampCam();
      queueSave();
      releaseTracking();
      markDirty();
    }
    if (keys.KeyE) zoomFocal(1 + ZOOM_SPEED);
    else if (keys.KeyQ) zoomFocal(1 - ZOOM_SPEED);

    /* Paused idle = zero redraws; a draw that moved the camera owes one settle draw */
    if (dirty || rotating || restPending) {
      dirty = false;
      draw(rotationTime);
      updateScaleBar();
    }
    /* Stays awake through the idle wait and band steps so a paused loop still finishes the grade */
    const grading = gradeWanted() && !dragging;
    if (grading) stepGrade();
    if (PERF) perfPrint();
    return rotating || dirty || restPending || grading || !!flyAnim || settleAt !== 0 || !!keysHeld();
  }

  canvas.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    dragging = true;
    dragMoved = false;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    dragCx = cx;
    dragCz = cz;
    try { canvas.setPointerCapture(e.pointerId); } catch { /* synthetic pointers have no capture */ }
  });

  canvas.addEventListener('pointermove', (e) => {
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    if (dragging) {
      const dx = e.clientX - dragStartX;
      const dy = e.clientY - dragStartY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) { dragMoved = true; releaseTracking(); }
      cx = dragCx - dx / k;
      cz = dragCz - dy / k;
      clampCam();
      queueSave();
      flyAnim = null;
      markDirty();
      return;
    }
    const hit = hitTest(e.clientX, e.clientY);
    if (hit !== hoveredId) {
      hoveredId = hit;
      canvas.style.cursor = hit ? 'pointer' : '';
      markDirty();
    }
    if (measurePts.length && !measureDone) markDirty();   /* live rubber-band segment */
  });

  canvas.addEventListener('pointercancel', () => { dragging = false; });

  canvas.addEventListener('pointerup', (e) => {
    if (e.button !== 0 || !dragging) return;
    dragging = false;
    /* A drag held still can let the loop park; releasing must restart the idle grade */
    markDirty();
    if (dragMoved) return;
    if (e.ctrlKey) {
      if (measureDone) clearMeasure();
      pushWaypoint(measureWaypoint(e));
      markDirty();
      return;
    }
    const hit = hitTest(e.clientX, e.clientY);
    if (hit) callbacks.onSelect?.(hit);
    else callbacks.onDeselect?.();
  });

  canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    /* Any right-click parks an active measurement (Ctrl+R-click screenshots in Firefox!) */
    if (measurePts.length && !measureDone) {
      pushWaypoint(measureWaypoint(e));
      measureDone = true;
      markDirty();
      return;
    }
    const hit = hitTest(e.clientX, e.clientY);
    if (hit) {
      callbacks.onSelect?.(hit);
      flyTo(hit);
    } else if (trackedId) {
      releaseTracking();
      markDirty();
    }
  });

  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    zoomAt(1 - e.deltaY * 0.001, e.clientX, e.clientY);
  }, { passive: false });

  /* Double-click: focus a body, or glide 2× deeper anchored at the cursor */
  canvas.addEventListener('dblclick', (e) => {
    /* Measuring? Double-click parks it (zoom-in gets the gesture back afterward) */
    if (measurePts.length && !measureDone) {
      pushWaypoint(measureWaypoint(e));
      measureDone = true;
      markDirty();
      return;
    }
    const hit = hitTest(e.clientX, e.clientY);
    if (hit) { flyTo(hit); return; }
    const toK = Math.min(Math.max(k * 2, kMin), K_MAX);
    if (toK === k) return;
    const wxA = wx(e.clientX), wzA = wz(e.clientY);
    let toCx = wxA - (e.clientX - viewW / 2) / toK;
    let toCz = wzA - (e.clientY - viewH / 2) / toK;
    const d = Math.hypot(toCx, toCz);
    if (d > PAN_MAX) { toCx *= PAN_MAX / d; toCz *= PAN_MAX / d; }
    flyAnim = {
      fromCx: cx, fromCz: cz, fromK: k,
      toCx, toCz, toK, start: performance.now(), duration: 350
    };
    markDirty();
  });

  window.addEventListener('keydown', (e) => {
    if (!active) return;
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyQ', 'KeyE'].includes(e.code)) {
      e.preventDefault();
      keys[e.code] = true;
      markDirty();
    }
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') keys[e.code] = true;
    if (e.code === 'Escape' && measurePts.length) {
      clearMeasure();
      markDirty();
    }
  });
  window.addEventListener('keyup', (e) => { keys[e.code] = false; });
  window.addEventListener('blur', () => { for (const c in keys) keys[c] = false; });

  window.addEventListener('resize', resize);
  for (const L of [lmL, astL]) {
    if (!L.img) continue;
    if (L.img.complete) queueTiers(L);
    L.img.addEventListener('load', () => queueTiers(L));
  }
  /* Remeasure once webfonts land — pre-load widths are wrong for declutter */
  document.fonts?.ready.then(() => {
    for (const L of labelEls.values()) { L.w = L.el.offsetWidth; L.h = L.el.offsetHeight; }
    for (const zl of zoneEls) { zl.w = zl.el.offsetWidth; zl.h = zl.el.offsetHeight; }
    markDirty();
  });
  resize();
  watchDpr();
  restoreCam();

  if (PERF) {
    window.__map2dPerf = {
      pc, tot: perfTot,
      reset() { for (const n in pc) pc[n] = 0; for (const n in perfTot) perfTot[n] = 0; },
      setCam(x, z, kk) { cx = x; cz = z; k = Math.min(Math.max(kk, kMin), K_MAX); markDirty(); },
      getCam: () => ({ cx, cz, k, kMin, K_MAX }),
      getState: () => ({ hoveredId, selectedId, trackedId, fixed: hoveredId ? bodyInfo(hoveredId)?.fixed : null })
    };
  }

  return {
    frame,
    flyTo,
    resetView,
    invalidate,
    /* Deferred so an edit's autosave + rebuildMarkers pair costs one rebuild, after both land */
    dataChanged() {
      staleData = true;
      markDirty();
    },
    setActive(v) {
      active = v;
      clearMeasure();
      if (v) {
        invalidate();
        lastBarK = -1;
        resize();
      } else {
        /* Pointer leaves without a move event — else a stale hover ring greets the return */
        hoveredId = null;
        markDirty();
      }
    },
    setSelected(id) {
      selectedId = id;
      markDirty();
    },
    /* 3D-side track state syncs in through these — no callbacks, or we'd loop */
    setTracked(id) {
      trackedId = id;
      markDirty();
    },
    clearTracking() {
      trackedId = null;
      markDirty();
    },
    getCamera: () => ({ cx, cz, k })
  };
}
