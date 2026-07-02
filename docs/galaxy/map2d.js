/* 2D galaxy map — full-viewport Canvas2D renderer.
   Camera {cx, cz, k}: screen = (world − c)·k + center. World = canonical map units (±500). */

/* k = screen px per map unit; 0.8 ≈ the old default 800px disc */
const K_DEFAULT = 0.8;
const K_MIN = 0.52, K_MAX = 48;
const WORLD_R = 500;
const CORE_VOID_R = 35;
const CINEMATIC_HZ = 30;

const PAN_SPEED = 8;
const ZOOM_SPEED = 0.03;

/* Tier gates keyed off legacy mapScale (= k / 0.8) so the old zoom feel carries over */
const DOT_SHOW = { landmark: 0, star: 0, station: 5, gng: 8, child: 5, moon: 8 };
const LANDMARK_FADE = 3;
const DOT_SIZE = { landmark: 6, star: 4, child: 1.5, moon: 1, station: 1, gng: 1 };

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

function lerpColor(hex1, hex2, t) {
  const a = hexToRgb(hex1), b = hexToRgb(hex2);
  return 'rgb(' + Math.round(a[0] + (b[0] - a[0]) * t) + ',' +
    Math.round(a[1] + (b[1] - a[1]) * t) + ',' +
    Math.round(a[2] + (b[2] - a[2]) * t) + ')';
}

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

export function createMap2D({ canvas, labelLayer, systems, callbacks }) {
  const ctx = canvas.getContext('2d');
  const lightmapImg = document.getElementById('lightmap-img');
  const bgColor = getComputedStyle(document.body).getPropertyValue('--gx-bg').trim() || '#0d0d1a';

  let cx = 0, cz = 0, k = K_DEFAULT;
  let viewW = 0, viewH = 0, dpr = 1;
  let active = false;
  let dirty = true;
  let cinAccum = 0;

  let selectedId = null;
  let hoveredId = null;
  let positions = null;

  /* Caches cleared on invalidate() — editor edits land while the map is inactive */
  const tierCache = new Map();
  const orbitCache = new Map();
  const standoffCache = new Map();

  const labelEls = new Map();
  const zoneEls = [];
  let zonesBuilt = false;
  const declutter = new Map();
  let lastDeclutterAt = 0;

  let flyAnim = null;
  const keys = {};

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
    standoffCache.clear();
    declutter.clear();
    for (const L of labelEls.values()) L.el.remove();
    labelEls.clear();
    for (const zl of zoneEls) zl.el.remove();
    zoneEls.length = 0;
    zonesBuilt = false;
    positions = null;
    dirty = true;
  }

  function resize() {
    dpr = window.devicePixelRatio || 1;
    viewW = canvas.clientWidth;
    viewH = canvas.clientHeight;
    canvas.width = Math.round(viewW * dpr);
    canvas.height = Math.round(viewH * dpr);
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

  /* Lane endpoint standoff — clear of the system's outermost orbit ring */
  function standoff(id) {
    let s = standoffCache.get(id);
    if (s !== undefined) return s;
    const data = systems.getData();
    let maxA = 0;
    for (const [cid, b] of Object.entries(data.bodies)) {
      if (b.parentId !== id) continue;
      const a = systems.getBodyMeta(cid)?.orbital?.a || 0;
      if (a > maxA) maxA = a;
    }
    s = Math.min(Math.max(maxA * 1.15, 2), 12);
    standoffCache.set(id, s);
    return s;
  }

  function drawLightmap() {
    if (!lightmapImg?.complete || !lightmapImg.naturalWidth) { dirty = true; return; }
    const N = lightmapImg.naturalWidth;
    /* Visible world rect → source region, clamped to the image */
    const ix0 = Math.max(0, (wx(0) / 1000 + 0.5) * N);
    const ix1 = Math.min(N, (wx(viewW) / 1000 + 0.5) * N);
    const iz0 = Math.max(0, (wz(0) / 1000 + 0.5) * N);
    const iz1 = Math.min(N, (wz(viewH) / 1000 + 0.5) * N);
    if (ix1 <= ix0 || iz1 <= iz0) return;
    const dx0 = sx((ix0 / N - 0.5) * 1000);
    const dx1 = sx((ix1 / N - 0.5) * 1000);
    const dz0 = sz((iz0 / N - 0.5) * 1000);
    const dz1 = sz((iz1 / N - 0.5) * 1000);

    ctx.save();
    ctx.beginPath();
    ctx.arc(sx(0), sz(0), WORLD_R * k, 0, Math.PI * 2);
    ctx.clip();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.65;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(lightmapImg, ix0, iz0, ix1 - ix0, iz1 - iz0, dx0, dz0, dx1 - dx0, dz1 - dz0);
    ctx.restore();
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
      let path = orbitCache.get(id);
      if (!path) {
        path = systems.sampleOrbitXZ(id);
        if (!path) continue;
        orbitCache.set(id, path);
      }
      ctx.beginPath();
      ctx.moveTo(px + path[0] * k, pz + path[1] * k);
      for (let i = 2; i < path.length; i += 2) {
        ctx.lineTo(px + path[i] * k, pz + path[i + 1] * k);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

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

      /* Trim both ends so lanes never enter orbit-ring territory */
      let dx = to.x - from.x, dz = to.z - from.z;
      const len = Math.hypot(dx, dz);
      const sOff = standoff(lane.fromId), tOff = standoff(lane.toId);
      if (len <= sOff + tOff + 1) continue;
      dx /= len; dz /= len;
      const x1 = from.x + dx * sOff, z1 = from.z + dz * sOff;
      const x2 = to.x - dx * tOff, z2 = to.z - dz * tOff;

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

  function drawDots(mapScale) {
    /* Faction → spectral color lerp as zoom increases (matches 3D crossfade) */
    const colorT = Math.max(0, Math.min(1, (mapScale - 4) / 11));
    for (const [id, p] of positions) {
      const info = bodyInfo(id);
      if (!info) continue;
      const alpha = dotAlpha(id, info, mapScale);
      if (alpha <= 0) continue;
      const px = sx(p.x), pz = sz(p.z);
      if (px < -10 || px > viewW + 10 || pz < -10 || pz > viewH + 10) continue;
      const color = (info.spectral && colorT > 0)
        ? (colorT >= 1 ? info.spectral : lerpColor(info.color, info.spectral, colorT))
        : info.color;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      if (info.tier === 'gng') {
        ctx.fillRect(px - info.size / 2, pz - info.size / 2, info.size, info.size);
      } else {
        ctx.beginPath();
        ctx.arc(px, pz, info.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawRing(id, radius, alpha) {
    const p = positions.get(id);
    if (!p) return;
    const info = bodyInfo(id);
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
    const zoneRects = [];
    for (const zl of zoneEls) {
      const px = sx(zl.x), pz = sz(zl.z);
      zl.el.style.transform = 'translate(' + Math.round(px - zl.w / 2) + 'px,' + Math.round(pz - zl.h / 2) + 'px)';
      zl.el.style.opacity = zoneAlpha.toFixed(2);
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
        if (L) L.el.style.opacity = '0';
        continue;
      }
      const L = labelFor(id, info);
      const dotR = info.size / 2;
      let tx, ty;
      if (info.tier === 'star' || info.tier === 'landmark') {
        tx = px - L.w / 2; ty = pz - L.h / 2;
      } else if (info.tier === 'child') {
        tx = px - L.w / 2; ty = pz + dotR + 3;
      } else {
        tx = px - L.w / 2; ty = pz - dotR - 3 - L.h;
      }
      L.el.style.transform = 'translate(' + Math.round(tx) + 'px,' + Math.round(ty) + 'px)';
      cands.push({ id, L, a, rect: [tx, ty, L.w, L.h], prio: forced ? 0 : (LABEL_PRIO[info.tier] ?? 9) });
    }

    const now = performance.now();
    if (now - lastDeclutterAt >= DECLUTTER_MS) {
      lastDeclutterAt = now;
      declutterPass(cands, zoneRects);
    }
    for (const c of cands) {
      const hidden = c.prio !== 0 && declutter.get(c.id)?.hidden;
      c.L.el.style.opacity = hidden ? '0' : Math.min(1, c.a).toFixed(2);
    }
  }

  function draw(rotationTime) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, viewW, viewH);

    positions = systems.flattenPositions(rotationTime);
    const mapScale = k / K_DEFAULT;

    drawLightmap();
    drawZones();
    drawOrbits(mapScale);
    drawLanes();
    drawDots(mapScale);
    if (hoveredId && hoveredId !== selectedId) drawRing(hoveredId, 7, 0.6);
    if (selectedId) drawRing(selectedId, 9, 0.9);
    updateLabels(mapScale);
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
    const newK = Math.min(Math.max(k * factor, K_MIN), K_MAX);
    if (newK === k) return;
    const wxA = wx(ax), wzA = wz(ay);
    k = newK;
    cx = wxA - (ax - viewW / 2) / k;
    cz = wzA - (ay - viewH / 2) / k;
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
      const r = Math.max(info.size / 2 + 4, 8);
      if (d2 < r * r && d2 < bestD2) { best = id; bestD2 = d2; }
    }
    return best;
  }

  function flyTo(id) {
    if (!positions) positions = systems.flattenPositions(lastRotTime);
    const p = positions.get(id);
    if (!p) return;
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
    flyAnim = {
      fromCx: cx, fromCz: cz, fromK: k,
      toCx: 0, toCz: 0, toK: K_DEFAULT,
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
    if (raw >= 1) flyAnim = null;
    dirty = true;
  }

  /* Called from the main RAF every frame while in 2D view */
  function frame(delta, rotationTime, rotating) {
    if (!active) return;
    lastRotTime = rotationTime;
    if (flyAnim) stepFly();

    if (keys.KeyW || keys.KeyS || keys.KeyA || keys.KeyD) {
      const step = PAN_SPEED / k;
      if (keys.KeyW) cz -= step;
      if (keys.KeyS) cz += step;
      if (keys.KeyA) cx -= step;
      if (keys.KeyD) cx += step;
      dirty = true;
    }
    if (keys.KeyE) zoomFocal(1 + ZOOM_SPEED);
    else if (keys.KeyQ) zoomFocal(1 - ZOOM_SPEED);

    /* Idle throttle: interaction redraws at display rate, orbital drift at ~30 Hz, paused idle = zero */
    cinAccum += delta;
    const cinematic = rotating && cinAccum >= 1 / CINEMATIC_HZ;
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
    canvas.setPointerCapture(e.pointerId);
  });

  canvas.addEventListener('pointermove', (e) => {
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    if (dragging) {
      const dx = e.clientX - dragStartX;
      const dy = e.clientY - dragStartY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragMoved = true;
      cx = dragCx - dx / k;
      cz = dragCz - dy / k;
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
  });

  canvas.addEventListener('pointercancel', () => { dragging = false; });

  canvas.addEventListener('pointerup', (e) => {
    if (e.button !== 0 || !dragging) return;
    dragging = false;
    if (dragMoved) return;
    const hit = hitTest(e.clientX, e.clientY);
    if (hit) callbacks.onSelect?.(hit);
    else callbacks.onDeselect?.();
  });

  canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    const hit = hitTest(e.clientX, e.clientY);
    if (!hit) return;
    callbacks.onSelect?.(hit);
    flyTo(hit);
    /* Set up 3D tracking so it persists across view switches */
    callbacks.onTrack?.(hit);
  });

  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    zoomAt(1 - e.deltaY * 0.001, e.clientX, e.clientY);
  }, { passive: false });

  /* Double-click: focus a body, or glide 2× deeper anchored at the cursor */
  canvas.addEventListener('dblclick', (e) => {
    const hit = hitTest(e.clientX, e.clientY);
    if (hit) { flyTo(hit); return; }
    const toK = Math.min(Math.max(k * 2, K_MIN), K_MAX);
    if (toK === k) return;
    const wxA = wx(e.clientX), wzA = wz(e.clientY);
    flyAnim = {
      fromCx: cx, fromCz: cz, fromK: k,
      toCx: wxA - (e.clientX - viewW / 2) / toK,
      toCz: wzA - (e.clientY - viewH / 2) / toK,
      toK, start: performance.now(), duration: 350
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
  });
  window.addEventListener('keyup', (e) => { keys[e.code] = false; });
  window.addEventListener('blur', () => { for (const c in keys) keys[c] = false; });

  window.addEventListener('resize', resize);
  if (lightmapImg && !lightmapImg.complete) {
    lightmapImg.addEventListener('load', () => { dirty = true; });
  }
  /* Remeasure once webfonts land — pre-load widths are wrong for declutter */
  document.fonts?.ready.then(() => {
    for (const L of labelEls.values()) { L.w = L.el.offsetWidth; L.h = L.el.offsetHeight; }
    for (const zl of zoneEls) { zl.w = zl.el.offsetWidth; zl.h = zl.el.offsetHeight; }
    dirty = true;
  });
  resize();

  return {
    frame,
    flyTo,
    resetView,
    invalidate,
    setActive(v) {
      active = v;
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
    getCamera: () => ({ cx, cz, k })
  };
}
