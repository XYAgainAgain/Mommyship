/* 2D galaxy map — full-viewport Canvas2D renderer.
   Camera {cx, cz, k}: screen = (world − c)·k + center. World = canonical map units (±500). */
import { createFirmament } from './map2d-firmament.js';

/* k = screen px per map unit; 0.8 ≈ the old default 800px disc */
const K_DEFAULT = 0.8;
const K_MIN = 0.52, K_MAX = 48;
const WORLD_R = 500;
const CORE_VOID_R = 35;
/* Pan can't wander past the rim — there's no universe out there to see */
const PAN_MAX = WORLD_R * 1.05;
/* Min zoom fills ~78% of the smaller viewport axis with the disc */
const K_FILL = 0.78;
/* Unpaused orbital-drift redraw rate: ~10 Hz at overview easing up to display rate
   zoomed in (motion is sub-pixel far out). Absolute Cinema bypasses entirely. */
const CIN_HZ_FLOOR = 10;
const CIN_SCALE_LO = 4, CIN_SCALE_HI = 9;

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

function lerpRgb(hex1, hex2, t) {
  const a = hexToRgb(hex1), b = hexToRgb(hex2);
  return [Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t)];
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

const CAM_KEY = 'mommyship-galaxy-map2d';

export function createMap2D({ canvas, labelLayer, systems, callbacks }) {
  const ctx = canvas.getContext('2d');
  const lightmapImg = document.getElementById('lightmap-img');
  const firmament = createFirmament(() => { bgBakedSide = 0; dirty = true; });

  /* DOM layers under the vector canvas — repainted rarely, moved via CSS transforms */
  const bgLayerCanvas = document.getElementById('map2d-bg');
  const starsCanvas = document.getElementById('map2d-stars');
  const lmLayerCanvas = document.getElementById('map2d-lightmap');
  const starsCtx = starsCanvas.getContext('2d');
  let bgBakedSide = 0, bgTf = '';
  let lmBake = null, lmTf = '';
  /* Mid-gesture zooms ride the CSS scale; layers rebake once, 200 ms after k settles */
  let lastKForSettle = 0, settleAt = 0;

  let cx = 0, cz = 0, k = K_DEFAULT;
  let kMin = K_MIN;
  let viewW = 0, viewH = 0, dpr = 1;
  let active = false;
  let dirty = true;
  let cinAccum = 0;
  let cinRate = CIN_HZ_FLOOR;
  let dispHz = 60;

  let selectedId = null;
  let hoveredId = null;
  let trackedId = null;
  let positions = null;

  /* Caches cleared on invalidate() — editor edits land while the map is inactive */
  const tierCache = new Map();
  const orbitCache = new Map();

  const labelEls = new Map();
  const zoneEls = [];
  let zonesBuilt = false;
  const declutter = new Map();
  let lastDeclutterAt = 0;

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

  function invalidate() {
    tierCache.clear();
    orbitCache.clear();
    declutter.clear();
    for (const L of labelEls.values()) L.el.remove();
    labelEls.clear();
    for (const zl of zoneEls) zl.el.remove();
    zoneEls.length = 0;
    zonesBuilt = false;
    positions = null;
    dirty = true;
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
    dpr = window.devicePixelRatio || 1;
    viewW = canvas.clientWidth;
    viewH = canvas.clientHeight;
    canvas.width = Math.round(viewW * dpr);
    canvas.height = Math.round(viewH * dpr);
    starsCanvas.width = Math.round(viewW * dpr);
    starsCanvas.height = Math.round(viewH * dpr);
    starsCanvas.style.width = viewW + 'px';
    starsCanvas.style.height = viewH + 'px';
    bgBakedSide = 0;
    lmBake = null;
    kMin = Math.max(K_MIN, Math.min(viewW, viewH) * K_FILL / (WORLD_R * 2));
    if (k < kMin) k = kMin;
    dirty = true;
  }

  function bodyInfo(id) {
    let info = tierCache.get(id);
    if (info) return info;
    const data = systems.getData();
    const body = data.bodies[id];
    if (!body) return null;
    const tier = pinTier(id, body);
    const faction = body.factionId ? data.factions[body.factionId] : null;
    info = {
      tier,
      color: faction ? faction.color : (body.visual?.color || '#888'),
      spectral: body.visual?.spectralColor || null,
      size: DOT_SIZE[tier] ?? 1.5
    };
    tierCache.set(id, info);
    return info;
  }

  /* Decode once to an ImageBitmap; prescaled 2048 mid tier serves far zoom */
  let lmFull = null, lmMid = null;
  async function buildLightmapSources() {
    if (!lightmapImg?.complete || !lightmapImg.naturalWidth) return;
    lmFull = await createImageBitmap(lightmapImg);
    const mid = document.createElement('canvas');
    mid.width = mid.height = 2048;
    mid.getContext('2d').drawImage(lmFull, 0, 0, 2048, 2048);
    lmMid = await createImageBitmap(mid);
    lmBake = null;
    dirty = true;
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

  /* Lightmap layer bakes with a margin; pan and moderate zoom ride the CSS transform */
  const LM_MARGIN = 1.5;
  function bakeLightmap() {
    const src = (k <= 2 ? lmMid : lmFull) || lmFull;
    if (!src || !viewW) return;
    const w = Math.ceil(viewW * LM_MARGIN), h = Math.ceil(viewH * LM_MARGIN);
    lmLayerCanvas.width = Math.round(w * dpr);
    lmLayerCanvas.height = Math.round(h * dpr);
    lmLayerCanvas.style.width = w + 'px';
    lmLayerCanvas.style.height = h + 'px';
    const c = lmLayerCanvas.getContext('2d');
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, w, h);
    const N = src.width;
    const wx0 = cx - w / 2 / k, wz0 = cz - h / 2 / k;
    const ix0 = Math.max(0, (wx0 / 1000 + 0.5) * N);
    const iz0 = Math.max(0, (wz0 / 1000 + 0.5) * N);
    const ix1 = Math.min(N, ((cx + w / 2 / k) / 1000 + 0.5) * N);
    const iz1 = Math.min(N, ((cz + h / 2 / k) / 1000 + 0.5) * N);
    if (ix1 > ix0 && iz1 > iz0) {
      c.imageSmoothingEnabled = true;
      c.imageSmoothingQuality = 'high';
      c.drawImage(src, ix0, iz0, ix1 - ix0, iz1 - iz0,
        ((ix0 / N - 0.5) * 1000 - wx0) * k, ((iz0 / N - 0.5) * 1000 - wz0) * k,
        (ix1 - ix0) / N * 1000 * k, (iz1 - iz0) / N * 1000 * k);
    }
    lmBake = { cx, cz, k, w, h };
  }

  function updateLayers() {
    const zooming = settleAt !== 0;
    if (firmament.isReady()) {
      const g = firmamentGeom();
      const drift = bgBakedSide ? Math.abs(g.side - bgBakedSide) / bgBakedSide : 1;
      if (!bgBakedSide || drift > (zooming ? 0.5 : 0.04)) {
        if (firmament.paintBase(bgLayerCanvas, g.side, dpr)) bgBakedSide = g.side;
      }
      if (bgBakedSide) {
        const tf = 'translate(' + g.dx.toFixed(1) + 'px,' + g.dz.toFixed(1) + 'px) scale(' + (g.side / bgBakedSide).toFixed(4) + ')';
        if (bgTf !== tf) { bgLayerCanvas.style.transform = tf; bgTf = tf; }
      }
    }
    if (!lmBake) bakeLightmap();
    if (!lmBake) return;
    let s = k / lmBake.k;
    const sHi = zooming ? 2.2 : 1.3, sLo = zooming ? 0.45 : 0.75;
    if (s > sHi || s < sLo ||
        Math.abs((lmBake.cx - cx) * k) > (lmBake.w * s - viewW) / 2 ||
        Math.abs((lmBake.cz - cz) * k) > (lmBake.h * s - viewH) / 2) {
      bakeLightmap();
      s = 1;
    }
    const tx = (lmBake.cx - cx) * k + viewW / 2 - s * lmBake.w / 2;
    const tz = (lmBake.cz - cz) * k + viewH / 2 - s * lmBake.h / 2;
    const tf = 'translate(' + tx.toFixed(1) + 'px,' + tz.toFixed(1) + 'px) scale(' + s.toFixed(4) + ')';
    if (lmTf !== tf) { lmLayerCanvas.style.transform = tf; lmTf = tf; }
  }

  /* Map-table framing: rim ring + outside vignette, drawn whenever any of it is on screen */
  function drawRim() {
    const r = WORLD_R * k;
    const rx = sx(0), rz = sz(0);
    const nearest = Math.hypot(
      Math.max(-rx, rx - viewW, 0),
      Math.max(-rz, rz - viewH, 0));
    const farthest = Math.hypot(Math.max(rx, viewW - rx), Math.max(rz, viewH - rz));
    if (farthest > r) {
      const vg = ctx.createRadialGradient(rx, rz, r, rx, rz, r * 1.8);
      vg.addColorStop(0, 'rgba(8,8,18,0)');
      vg.addColorStop(1, 'rgba(8,8,18,0.6)');
      /* Clip to outside the rim — composites only the pixels the gradient can touch */
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, viewW, viewH);
      ctx.arc(rx, rz, r, 0, Math.PI * 2);
      ctx.clip('evenodd');
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, viewW, viewH);
      ctx.restore();
    }
    if (r < nearest - 10 || r > farthest + 10) return;
    ctx.strokeStyle = 'rgba(131,50,172,0.12)';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(rx, rz, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(131,50,172,0.45)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(rx, rz, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  function drawZones() {
    const data = systems.getData();
    ctx.save();
    ctx.strokeStyle = 'rgba(92,225,230,0.15)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([0.5, 0.4]);
    for (const [zid, zone] of Object.entries(data.zones)) {
      if (!zone.position || !zone.radius || HIDDEN_ZONE_ELLIPSES.has(zid)) continue;
      ctx.beginPath();
      ctx.ellipse(sx(zone.position.x), sz(zone.position.z),
        zone.radius.rx * k, zone.radius.rz * k,
        (zone.rotation || 0) * Math.PI / 180, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
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
    for (const [id, body] of Object.entries(data.bodies)) {
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

  /* Lanes run body-center to body-center — dots occlude the endpoints, exactly like 3D */
  function drawLanes() {
    const data = systems.getData();
    ctx.save();
    ctx.globalAlpha = 0.6;
    ctx.lineWidth = 2;
    for (const lane of Object.values(data.hyperlanes)) {
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

      const grad = ctx.createLinearGradient(sx1, sz1, sx2, sz2);
      const voidHit = segCircleT(x1, z1, x2, z2, CORE_VOID_R);
      if (voidHit) {
        const [t0, t1] = voidHit;
        grad.addColorStop(0, laneColorAt(0, 1));
        grad.addColorStop(Math.max(0, t0 - 0.02), laneColorAt(t0, 1));
        grad.addColorStop(t0, laneColorAt(t0, 0.25));
        grad.addColorStop(t1, laneColorAt(t1, 0.25));
        grad.addColorStop(Math.min(1, t1 + 0.02), laneColorAt(t1, 1));
        grad.addColorStop(1, laneColorAt(1, 1));
      } else {
        grad.addColorStop(0, laneColorAt(0, 1));
        grad.addColorStop(0.5, laneColorAt(0.5, 1));
        grad.addColorStop(1, laneColorAt(1, 1));
      }
      ctx.strokeStyle = grad;
      ctx.beginPath();
      ctx.moveTo(sx1, sz1);
      ctx.lineTo(sx2, sz2);
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

  /* The heart of the galaxy deserves better than a dot: black core, photon ring, glow */
  function drawSMBH(mapScale) {
    const p = positions.get('smbh');
    if (!p) return;
    const px = sx(p.x), pz = sz(p.z);
    const r = smbhRadius(mapScale);
    if (px < -r * 4 || px > viewW + r * 4 || pz < -r * 4 || pz > viewH + r * 4) return;
    ctx.save();
    const glow = ctx.createRadialGradient(px, pz, r, px, pz, r * 3.5);
    glow.addColorStop(0, 'rgba(246,121,229,0.35)');
    glow.addColorStop(0.4, 'rgba(131,50,172,0.18)');
    glow.addColorStop(1, 'rgba(131,50,172,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(px, pz, r * 3.5, 0, Math.PI * 2);
    ctx.fill();
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

  function dotRgb(info, colorT) {
    if (!info.spectral || colorT <= 0) return hexToRgb(info.color);
    return colorT >= 1 ? hexToRgb(info.spectral) : lerpRgb(info.color, info.spectral, colorT);
  }

  function drawDots(mapScale) {
    /* Faction → spectral color lerp as zoom increases (matches 3D crossfade) */
    const colorT = Math.max(0, Math.min(1, (mapScale - 4) / 11));
    const rim = 'rgba(10,10,20,0.75)';
    for (const [id, p] of positions) {
      if (id === 'smbh') continue;   /* gets its own portrait via drawSMBH */
      const info = bodyInfo(id);
      if (!info) continue;
      const alpha = dotAlpha(id, info, mapScale);
      if (alpha <= 0) continue;
      const px = sx(p.x), pz = sz(p.z);
      if (px < -20 || px > viewW + 20 || pz < -20 || pz > viewH + 20) continue;
      const rgb = dotRgb(info, colorT);
      const r = dotRadius(info, mapScale);
      ctx.globalAlpha = alpha;

      /* Stars and landmarks get a soft halo so they read against the lightmap */
      if (info.tier === 'star' || info.tier === 'landmark') {
        const gr = r * 3;
        const glow = ctx.createRadialGradient(px, pz, r * 0.4, px, pz, gr);
        glow.addColorStop(0, rgbaStr(rgb, 0.55));
        glow.addColorStop(0.5, rgbaStr(rgb, 0.18));
        glow.addColorStop(1, rgbaStr(rgb, 0));
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(px, pz, gr, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = rgbStr(rgb);
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
    }
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

  function labelFor(id, info) {
    let L = labelEls.get(id);
    if (L) return L;
    const body = systems.getData().bodies[id];
    const el = document.createElement('div');
    el.className = 'gx-m2-label';
    el.dataset.tier = info.tier;
    el.textContent = displayName(id, body, info.tier);
    labelLayer.appendChild(el);
    L = { el, w: el.offsetWidth, h: el.offsetHeight };
    labelEls.set(id, L);
    return L;
  }

  function buildZoneLabels() {
    zonesBuilt = true;
    const data = systems.getData();
    for (const [zid, zone] of Object.entries(data.zones)) {
      if (!zone.position || HIDDEN_ZONES.has(zid)) continue;
      const el = document.createElement('div');
      el.className = 'gx-zone-label-2d';
      el.innerHTML = (ZONE_DISPLAY[zid] || zone.name).replace(/\n/g, '<br>');
      if (zone.factionId && data.factions[zone.factionId]) {
        el.style.color = data.factions[zone.factionId].color;
      }
      labelLayer.appendChild(el);
      zoneEls.push({ el, x: zone.position.x, z: zone.position.z, w: el.offsetWidth, h: el.offsetHeight });
    }
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

  function updateLabels(mapScale) {
    if (!zonesBuilt) buildZoneLabels();

    /* Zone labels: big at overview, gone by mapScale 4 */
    const zoneAlpha = Math.max(0, Math.min(1, (4 - mapScale) / 2));
    const zoneOp = zoneAlpha.toFixed(2);
    const zoneRects = [];
    for (const zl of zoneEls) {
      const px = sx(zl.x), pz = sz(zl.z);
      if (zoneAlpha > 0.01) {
        const tf = 'translate(' + Math.round(px - zl.w / 2) + 'px,' + Math.round(pz - zl.h / 2) + 'px)';
        if (zl.tf !== tf) { zl.el.style.transform = tf; zl.tf = tf; }
      }
      if (zl.op !== zoneOp) { zl.el.style.opacity = zoneOp; zl.op = zoneOp; }
      if (zoneAlpha > 0.05) zoneRects.push([px - zl.w / 2, pz - zl.h / 2, zl.w, zl.h]);
    }

    const cands = [];
    for (const [id, p] of positions) {
      const info = bodyInfo(id);
      if (!info) continue;
      const forced = id === selectedId || id === hoveredId;
      let a = labelAlpha(id, info, mapScale);
      if (forced) a = Math.max(a, 1);
      const px = sx(p.x), pz = sz(p.z);
      if (a <= 0 || dotAlpha(id, info, mapScale) <= 0 ||
          px < -150 || px > viewW + 150 || pz < -60 || pz > viewH + 60) {
        const L = labelEls.get(id);
        if (L && L.op !== '0') { L.el.style.opacity = '0'; L.op = '0'; }
        continue;
      }
      const L = labelFor(id, info);
      const dotR = dotRadius(info, mapScale) + 1;
      let tx, ty;
      if (id === 'smbh') {
        tx = px - L.w / 2; ty = pz + smbhRadius(mapScale) + 6;
      } else if (info.tier === 'landmark') {
        tx = px - L.w / 2; ty = pz - L.h / 2;
      } else if (info.tier === 'child' || info.tier === 'star') {
        tx = px - L.w / 2; ty = pz + dotR + 3;
      } else {
        tx = px - L.w / 2; ty = pz - dotR - 3 - L.h;
      }
      const tf = 'translate(' + Math.round(tx) + 'px,' + Math.round(ty) + 'px)';
      if (L.tf !== tf) { L.el.style.transform = tf; L.tf = tf; }
      cands.push({ id, L, a, rect: [tx, ty, L.w, L.h], prio: forced ? 0 : (LABEL_PRIO[info.tier] ?? 9) });
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

  const PERF = new URLSearchParams(location.search).has('mapperf');
  const perfAcc = {};
  let perfN = 0;
  const perfMark = (name, t0) => {
    const t1 = performance.now();
    perfAcc[name] = (perfAcc[name] || 0) + (t1 - t0);
    return t1;
  };

  function draw(rotationTime) {
    let t = PERF ? performance.now() : 0;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, viewW, viewH);

    positions = systems.flattenPositions(rotationTime);
    /* Follow-cam: stay centered on the tracked body as it orbits */
    if (trackedId && !flyAnim && !dragging) {
      const tp = positions.get(trackedId);
      if (tp) { cx = tp.x; cz = tp.z; }
    }
    const mapScale = k / K_DEFAULT;

    updateLayers();
    if (PERF) t = perfMark('layers', t);
    starsCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    starsCtx.clearRect(0, 0, viewW, viewH);
    const g = firmamentGeom();
    firmament.drawStars(starsCtx, g.dx, g.dz, g.side, viewW, viewH, rotationTime);
    if (PERF) t = perfMark('stars', t);
    drawRim();
    if (PERF) t = perfMark('rim', t);
    drawZones();
    drawOrbits(mapScale);
    drawLanes();
    if (PERF) t = perfMark('zones+orbits+lanes', t);
    drawDots(mapScale);
    drawSMBH(mapScale);
    if (hoveredId && hoveredId !== selectedId) drawRing(hoveredId, 3.5, 0.6, mapScale);
    if (selectedId) drawRing(selectedId, 5, 0.9, mapScale);
    drawMeasure();
    if (PERF) t = perfMark('dots+rings', t);
    updateLabels(mapScale);
    if (PERF) {
      perfMark('labels', t);
      if (++perfN >= 120) {
        const avg = {};
        for (const [n, v] of Object.entries(perfAcc)) { avg[n] = +(v / perfN).toFixed(2); perfAcc[n] = 0; }
        console.table(avg);
        perfN = 0;
      }
    }
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
    dirty = true;
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
    for (const [id, p] of positions) {
      const info = bodyInfo(id);
      if (!info || dotAlpha(id, info, mapScale) <= 0) continue;
      const dx = sx(p.x) - mx, dy = sz(p.z) - my;
      const d2 = dx * dx + dy * dy;
      const base = id === 'smbh' ? smbhRadius(mapScale) : dotRadius(info, mapScale);
      const r = Math.max(base + 4, 8);
      if (d2 < r * r && d2 < bestD2) { best = id; bestD2 = d2; }
    }
    return best;
  }

  function flyTo(id) {
    if (!positions) positions = systems.flattenPositions(lastRotTime);
    const p = positions.get(id);
    if (!p) return;
    trackedId = id;
    const info = bodyInfo(id);
    const targetScale = info.tier === 'landmark' ? 2 : info.tier === 'star' ? 4 : info.tier === 'gng' ? 8 : 6;
    flyAnim = {
      fromCx: cx, fromCz: cz, fromK: k,
      toCx: p.x, toCz: p.z, toK: Math.max(targetScale * K_DEFAULT, k),
      start: performance.now(), duration: 800
    };
    dirty = true;
  }

  function resetView() {
    releaseTracking();
    flyAnim = {
      fromCx: cx, fromCz: cz, fromK: k,
      toCx: 0, toCz: 0, toK: Math.max(K_DEFAULT, kMin),
      start: performance.now(), duration: 1000
    };
    dirty = true;
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
    dirty = true;
  }

  /* Called from the main RAF every frame while in 2D view */
  function frame(delta, rotationTime, rotating, cinema) {
    if (!active) return;
    /* T=0 while paused still changes the clock — repaint once so the reset shows */
    if (!rotating && rotationTime !== lastRotTime) dirty = true;
    lastRotTime = rotationTime;
    if (flyAnim) stepFly();

    if (k !== lastKForSettle) {
      lastKForSettle = k;
      settleAt = performance.now() + 200;
    } else if (settleAt && performance.now() >= settleAt) {
      settleAt = 0;
      dirty = true;   /* one clean rebake at the tight thresholds */
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
      dirty = true;
    }
    if (keys.KeyE) zoomFocal(1 + ZOOM_SPEED);
    else if (keys.KeyQ) zoomFocal(1 - ZOOM_SPEED);

    /* Idle throttle: interaction at display rate, orbital drift at the eased
       zoom-adaptive rate, paused idle = zero redraws */
    dispHz += (Math.min(1 / Math.max(delta, 0.002), 250) - dispHz) * 0.05;
    /* Following a body wants full smoothness regardless of zoom */
    const st = trackedId ? 1
      : Math.min(Math.max((k / K_DEFAULT - CIN_SCALE_LO) / (CIN_SCALE_HI - CIN_SCALE_LO), 0), 1);
    const target = CIN_HZ_FLOOR + (dispHz - CIN_HZ_FLOOR) * st * st * (3 - 2 * st);
    cinRate += (target - cinRate) * (1 - Math.exp(-delta * 2.5));

    cinAccum += delta;
    const cinematic = rotating && (cinema || cinAccum >= 1 / cinRate);
    if (!dirty && !cinematic) return;
    if (cinematic) cinAccum = 0;
    dirty = false;
    draw(rotationTime);
    updateScaleBar();
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
      dirty = true;
      return;
    }
    const hit = hitTest(e.clientX, e.clientY);
    if (hit !== hoveredId) {
      hoveredId = hit;
      canvas.style.cursor = hit ? 'pointer' : '';
      dirty = true;
    }
    if (measurePts.length && !measureDone) dirty = true;   /* live rubber-band segment */
  });

  canvas.addEventListener('pointercancel', () => { dragging = false; });

  canvas.addEventListener('pointerup', (e) => {
    if (e.button !== 0 || !dragging) return;
    dragging = false;
    if (dragMoved) return;
    if (e.ctrlKey) {
      if (measureDone) clearMeasure();
      pushWaypoint(measureWaypoint(e));
      dirty = true;
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
      dirty = true;
      return;
    }
    const hit = hitTest(e.clientX, e.clientY);
    if (hit) {
      trackedId = hit;
      callbacks.onSelect?.(hit);
      flyTo(hit);
      /* Set up 3D tracking so it persists across view switches */
      callbacks.onTrack?.(hit);
    } else if (trackedId) {
      releaseTracking();
      dirty = true;
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
      dirty = true;
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
    dirty = true;
  });

  window.addEventListener('keydown', (e) => {
    if (!active) return;
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyQ', 'KeyE'].includes(e.code)) {
      e.preventDefault();
      keys[e.code] = true;
    }
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') keys[e.code] = true;
    if (e.code === 'Escape' && measurePts.length) {
      clearMeasure();
      dirty = true;
    }
  });
  window.addEventListener('keyup', (e) => { keys[e.code] = false; });
  window.addEventListener('blur', () => { for (const c in keys) keys[c] = false; });

  window.addEventListener('resize', resize);
  if (lightmapImg?.complete && lightmapImg.naturalWidth) {
    buildLightmapSources();
  } else if (lightmapImg) {
    lightmapImg.addEventListener('load', buildLightmapSources);
  }
  /* Remeasure once webfonts land — pre-load widths are wrong for declutter */
  document.fonts?.ready.then(() => {
    for (const L of labelEls.values()) { L.w = L.el.offsetWidth; L.h = L.el.offsetHeight; }
    for (const zl of zoneEls) { zl.w = zl.el.offsetWidth; zl.h = zl.el.offsetHeight; }
    dirty = true;
  });
  resize();
  restoreCam();

  return {
    frame,
    flyTo,
    resetView,
    invalidate,
    setActive(v) {
      active = v;
      clearMeasure();
      if (v) {
        invalidate();
        lastBarK = -1;
        resize();
      }
    },
    setSelected(id) {
      selectedId = id;
      dirty = true;
    },
    /* 3D-side track state syncs in through these — no callbacks, or we'd loop */
    setTracked(id) {
      trackedId = id;
      dirty = true;
    },
    clearTracking() {
      trackedId = null;
    },
    getCamera: () => ({ cx, cz, k })
  };
}
