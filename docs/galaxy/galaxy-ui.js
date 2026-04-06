/* Galaxy UI — search, context panel, 2D map, settings, status bar */

let galaxyData = null;
let selectedId = null;
let callbacks = {};

/* 2D map state */
let mapScale = 1;
let mapX = 0, mapY = 0;
let isDragging = false;
let lastColorT = -1;
let dragStartX = 0, dragStartY = 0;
let dragMapStartX = 0, dragMapStartY = 0;

const map2d = document.getElementById('map-2d');
const mapContainer = document.getElementById('map-container');

/* Hex color lerp for zoom-based faction → spectral blending */
function hexToRgb(hex) {
  const v = parseInt(hex.slice(1), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}
function lerpColor(hex1, hex2, t) {
  const a = hexToRgb(hex1), b = hexToRgb(hex2);
  const r = Math.round(a[0] + (b[0] - a[0]) * t);
  const g = Math.round(a[1] + (b[1] - a[1]) * t);
  const bl = Math.round(a[2] + (b[2] - a[2]) * t);
  return 'rgb(' + r + ',' + g + ',' + bl + ')';
}

/* Galactic coords to percentage on 800px map circle */
function coordToPercent(x, z) {
  return {
    left: (x / 1000 + 0.5) * 100,
    top: (z / 1000 + 0.5) * 100
  };
}

/*
 * Visibility: dots scale naturally with zoom (grow as you zoom in).
 * Labels counter-scale so text stays readable (~14pt screen size).
 * Label tiers control when text appears. Dots for stars/landmarks always on.
 */

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

function displayName(id, body, tier) {
  if (id === 'smbh') return 'SMBH';
  if (tier !== 'gng') return body.name;
  const m = body.name.match(/^Gas-N-Gripe\s+(\d+)$/);
  return m ? 'GNG ' + m[1] : body.name;
}

/* Minimum mapScale for LABELS to appear (fade in over LABEL_FADE_RANGE zoom units) */
const LABEL_SHOW = { landmark: 0, star: 2, station: 8, gng: 12, child: 12, moon: 40 };
const LABEL_FADE_RANGE = { landmark: 1, star: 2, station: 3, gng: 3, child: 3, moon: 5 };
/* Minimum mapScale for DOTS to appear */
const DOT_SHOW = { landmark: 0, star: 0, station: 5, gng: 8, child: 5, moon: 8 };
/* Base opacity per tier */
const LABEL_OPACITY = { landmark: 0.9, star: 0.8, station: 0.7, gng: 0.6, child: 0.7, moon: 0.6 };
const LANDMARK_LABEL_FADE = 3;

function updateMapTransform() {
  mapContainer.style.transform =
    'translate(calc(-50% + ' + mapX + 'px), calc(-50% + ' + mapY + 'px)) scale(' + mapScale + ')';

  const inv = 1 / mapScale;

  /* Stroke widths in viewBox units (1 VB unit = 8px at 800px container) */
  const vbInv = inv / 8;
  const orbitAlpha = Math.min(1, Math.max(0, (mapScale - 5) / 3));
  mapContainer.style.setProperty('--orbit-stroke', (3 * vbInv));
  mapContainer.style.setProperty('--orbit-opacity', orbitAlpha.toFixed(2));
  mapContainer.style.setProperty('--lane-stroke', (2 * vbInv));

  const pins = mapContainer.querySelectorAll('.gx-pin');
  pins.forEach(pin => {
    const tier = pin.dataset.tier;

    const dotThreshold = DOT_SHOW[tier] ?? 0;
    if (mapScale < dotThreshold) { pin.style.display = 'none'; return; }
    pin.style.display = '';
    /* Non-SMBH landmarks fade out smoothly at deep zoom */
    const isSmbh = pin.dataset.id === 'smbh';
    if (tier === 'landmark' && !isSmbh) {
      const lmAlpha = mapScale <= LANDMARK_LABEL_FADE ? 1 : Math.max(0, 1 - (mapScale - LANDMARK_LABEL_FADE));
      pin.style.opacity = lmAlpha.toFixed(2);
      if (lmAlpha <= 0) return;
    } else {
      pin.style.opacity = '';
    }

    const labelEl = pin.querySelector('.gx-pin-label');
    if (!labelEl) return;


    const threshold = LABEL_SHOW[tier] ?? 0;
    const fadeRange = LABEL_FADE_RANGE[tier] ?? 2;
    const baseOpacity = LABEL_OPACITY[tier] ?? 0.7;
    let labelAlpha = threshold === 0 ? baseOpacity : Math.min(1, (mapScale - threshold) / fadeRange) * baseOpacity;
    /* Non-SMBH landmarks fade out smoothly */
    if (tier === 'landmark' && !isSmbh && mapScale > LANDMARK_LABEL_FADE)
      labelAlpha = Math.max(0, 1 - (mapScale - LANDMARK_LABEL_FADE)) * baseOpacity;

    labelEl.style.opacity = labelAlpha <= 0 ? '0' : labelAlpha.toFixed(2);
    if (labelAlpha <= 0) return;

    const dotR = (parseFloat(pin.querySelector('.gx-pin-dot').style.width) || 4) / 2;
    labelEl.style.left = '0';
    if (tier === 'star' || tier === 'landmark') {
      /* Centered on body coordinate */
      labelEl.style.top = '0';
      labelEl.style.transform = 'scale(' + inv + ') translate(-50%, -50%)';
    } else if (tier === 'child') {
      /* Planets: centered below dot */
      labelEl.style.top = (dotR + 2 * inv) + 'px';
      labelEl.style.transform = 'scale(' + inv + ') translate(-50%, 0)';
    } else {
      /* Moons, stations, GNGs: centered above dot */
      labelEl.style.top = -(dotR + 2 * inv) + 'px';
      labelEl.style.transform = 'scale(' + inv + ') translate(-50%, -100%)';
    }
  });

  /* Star color lerp: faction → spectral as zoom increases (matches 3D behavior) */
  const colorT = Math.max(0, Math.min(1, (mapScale - 4) / 11));
  if (colorT !== lastColorT) {
    lastColorT = colorT;
    mapContainer.querySelectorAll('.gx-pin[data-spectral-color]').forEach(pin => {
      const dot = pin.querySelector('.gx-pin-dot');
      if (!dot) return;
      dot.style.background = colorT <= 0 ? pin.dataset.factionColor
        : colorT >= 1 ? pin.dataset.spectralColor
        : lerpColor(pin.dataset.factionColor, pin.dataset.spectralColor, colorT);
    });
  }

  /* Zone labels: visible at low zoom, fade out as you zoom in */
  const zoneAlpha = Math.max(0, Math.min(1, (4 - mapScale) / 2));
  mapContainer.querySelectorAll('.gx-zone-label-2d').forEach(zl => {
    zl.style.opacity = zoneAlpha.toFixed(2);
    zl.style.transform = 'scale(' + inv + ') translate(-50%, -50%)';
  });

  mapContainer.style.setProperty('--zone-stroke', (1.5 * vbInv));
  mapContainer.style.setProperty('--zone-dash', (0.5 * vbInv) + ' ' + (0.4 * vbInv));

  update2DScaleBar();
}

/* Golden angle ensures siblings never clump — each one is ~137.5° from the last */
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/* Orbital radius in map units — matched to 3D ORBIT_RADIUS proportions.
   3D: planets at minR=5 + spacing=2, moons at ~35% of parent orbit × 0.25 base.
   2D: scaled to look right on the 800px/1000-unit map. */
function orbitalRadius(body, order, parentBody) {
  if (body.orbital?.a) return body.orbital.a;
  const o = order || (body.orbital?.order ?? 1);
  if (body.type === 'moon') return 1 + o * 0.6;
  if (body.type === 'station') return 4 + o * 2;
  /* Planets: 5 + order*2 matches the 3D minR=5, spacing=2 */
  return 5 + o * 2;
}

/* Pre-build sibling lists so we don't recompute per body */
let siblingCache = null;

function getSiblings(parentId) {
  if (!siblingCache) {
    siblingCache = new Map();
    Object.entries(galaxyData.bodies).forEach(([id, b]) => {
      if (!b.parentId) return;
      if (!siblingCache.has(b.parentId)) siblingCache.set(b.parentId, []);
      siblingCache.get(b.parentId).push(id);
    });
    /* Sort each sibling list by orbital order */
    siblingCache.forEach((ids, pid) => {
      ids.sort((a, b) => (galaxyData.bodies[a].orbital?.order ?? 99) - (galaxyData.bodies[b].orbital?.order ?? 99));
    });
  }
  return siblingCache.get(parentId) || [];
}

const posCache = new Map();

function bodyWorldCoords(id) {
  if (posCache.has(id)) return posCache.get(id);
  const body = galaxyData.bodies[id];
  if (!body) return null;
  if (body.position) {
    const c = { x: body.position.x, z: body.position.z };
    posCache.set(id, c);
    return c;
  }
  if (!body.parentId) return null;
  const parentCoords = bodyWorldCoords(body.parentId);
  if (!parentCoords) return null;
  const siblings = getSiblings(body.parentId);
  const myIndex = siblings.indexOf(id);
  const order = myIndex + 1;
  const rBase = orbitalRadius(body, order, galaxyData.bodies[body.parentId]);
  /* Eccentric orbits: place body at apoapsis so it sits on the ellipse tip */
  const ecc = body.orbital?.e || 0;
  const r = rBase * (1 + ecc);
  /* Golden angle + parent-seeded offset so siblings never start at angle 0 */
  let parentSeed = 0;
  for (let i = 0; i < body.parentId.length; i++) parentSeed += body.parentId.charCodeAt(i);
  const angle = myIndex * GOLDEN_ANGLE + parentSeed;
  const c = { x: parentCoords.x + r * Math.cos(angle), z: parentCoords.z + r * Math.sin(angle) };
  posCache.set(id, c);
  return c;
}

function build2DMap() {
  if (!galaxyData) return;
  posCache.clear();
  siblingCache = null;
  lastColorT = -1;
  const clip = mapContainer.querySelector('.gx-map2d-clip');
  const svg = document.getElementById('lanes-svg');

  /* Place all bodies, not just root ones */
  Object.entries(galaxyData.bodies).forEach(([id, body]) => {
    const tier = pinTier(id, body);
    const coords = bodyWorldCoords(id);
    if (!coords) return;
    const pos = coordToPercent(coords.x, coords.z);
    const faction = body.factionId ? galaxyData.factions[body.factionId] : null;
    const color = faction ? faction.color : (body.visual?.color || '#888');
    /* Spectral color for zoom-based lerp (faction → true color as you zoom in) */
    const spectral = body.visual?.spectralColor;

    const isMoon = body.type === 'moon';
    const dotSize = tier === 'landmark' ? 6 : tier === 'star' ? 4 : isMoon ? 0.5 : tier === 'station' ? 1 : tier === 'gng' ? 1 : 1.5;

    const pin = document.createElement('div');
    pin.className = 'gx-pin';
    pin.dataset.id = id;
    pin.dataset.tier = tier;
    if (spectral) {
      pin.dataset.factionColor = color;
      pin.dataset.spectralColor = spectral;
    }
    pin.style.left = pos.left + '%';
    pin.style.top = pos.top + '%';
    const dotStyle = 'width:' + dotSize + 'px;height:' + dotSize + 'px;background:' + color +
      (tier === 'gng' ? ';border-radius:0' : '');
    pin.innerHTML =
      '<div class="gx-pin-dot" style="' + dotStyle + '"></div>' +
      '<div class="gx-pin-label">' + displayName(id, body, tier) + '</div>';
    pin.addEventListener('click', (e) => {
      e.stopPropagation();
      selectBody(id);
    });
    pin.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      selectBody(id);
      flyTo2D(id);
      /* Set up 3D tracking so it persists when switching views */
      if (callbacks.onFlyTo) callbacks.onFlyTo(id);
    });
    clip.appendChild(pin);
  });

  /* Hyperlanes with orange-yellow-orange gradient */
  let defs = '<defs>';
  let lines = '';
  let laneIdx = 0;
  /* preferStation: redirect hyperlane endpoints to outermost station (matches 3D behavior) */
  function preferStation(bodyId) {
    const children = getSiblings(bodyId);
    let outermost = null;
    for (const cid of children) {
      if (galaxyData.bodies[cid]?.type === 'station') outermost = cid;
    }
    return outermost || bodyId;
  }

  Object.values(galaxyData.hyperlanes).forEach(lane => {
    const fromId = preferStation(lane.fromId);
    const toId = preferStation(lane.toId);
    const fromCoords = bodyWorldCoords(fromId);
    const toCoords = bodyWorldCoords(toId);
    if (!fromCoords || !toCoords) return;
    const p1 = coordToPercent(fromCoords.x, fromCoords.z);
    const p2 = coordToPercent(toCoords.x, toCoords.z);
    const gid = 'lane-g' + laneIdx++;
    defs += '<linearGradient id="' + gid + '" x1="' + p1.left + '" y1="' + p1.top + '" x2="' + p2.left + '" y2="' + p2.top + '" gradientUnits="userSpaceOnUse">' +
      '<stop offset="0%" stop-color="#e8a030"/>' +
      '<stop offset="50%" stop-color="#f0d060"/>' +
      '<stop offset="100%" stop-color="#e8a030"/>' +
      '</linearGradient>';
    lines += '<line x1="' + p1.left + '" y1="' + p1.top + '" x2="' + p2.left + '" y2="' + p2.top + '" stroke="url(#' + gid + ')" />';
  });
  defs += '</defs>';

  /* Orbital paths derived from actual body positions — guaranteed to pass through each body */
  let orbits = '';
  const drawnOrbits = new Set();
  Object.entries(galaxyData.bodies).forEach(([id, body]) => {
    if (!body.parentId || body.position) return;
    const parentCoords = bodyWorldCoords(body.parentId);
    const childCoords = bodyWorldCoords(id);
    if (!parentCoords || !childCoords) return;
    const dx = childCoords.x - parentCoords.x;
    const dz = childCoords.z - parentCoords.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    const e = body.orbital?.e || 0;
    const orbitKey = body.parentId + '-' + dist.toFixed(2) + '-' + e.toFixed(2);
    if (drawnOrbits.has(orbitKey)) return;
    drawnOrbits.add(orbitKey);
    const pp = coordToPercent(parentCoords.x, parentCoords.z);

    /* viewBox is 0–100, matching coordToPercent output */
    const rVB = dist / 1000 * 100;
    if (e > 0.01) {
      /* Body is at apoapsis: dist = a*(1+e), so a = dist/(1+e) */
      const a = dist / (1 + e);
      const bAxis = a * Math.sqrt(1 - e * e);
      const c = a * e;
      const angle = Math.atan2(dz, dx);
      const angleDeg = angle * 180 / Math.PI;
      const cVB = c / 1000 * 100;
      const aVB = a / 1000 * 100;
      const bVB = bAxis / 1000 * 100;
      const ecx = pp.left + cVB * Math.cos(angle);
      const ecy = pp.top + cVB * Math.sin(angle);
      orbits += '<ellipse class="gx-orbit" cx="' + ecx + '" cy="' + ecy + '" rx="' + aVB +
        '" ry="' + bVB + '" transform="rotate(' + angleDeg + ' ' + ecx + ' ' + ecy +
        ')" fill="none" stroke="rgba(255,255,255,0.12)" />';
    } else {
      orbits += '<circle class="gx-orbit" cx="' + pp.left + '" cy="' + pp.top + '" r="' + rVB + '" fill="none" stroke="rgba(255,255,255,0.12)" />';
    }
  });

  /* Zone ellipses — skip hidden zones (core, asteroid bubble, structural zones) */
  const HIDDEN_ZONE_ELLIPSES = new Set(['core', 'a-b', 'rim', 'arm-1', 'arm-2', 'arm-3']);
  let zones = '';
  Object.entries(galaxyData.zones).forEach(([zid, zone]) => {
    if (!zone.position || !zone.radius || HIDDEN_ZONE_ELLIPSES.has(zid)) return;
    const cp = coordToPercent(zone.position.x, zone.position.z);
    const rxVB = zone.radius.rx / 1000 * 100;
    const rzVB = zone.radius.rz / 1000 * 100;
    const rot = zone.rotation || 0;
    zones += '<ellipse class="gx-zone-ellipse" cx="' + cp.left + '" cy="' + cp.top + '" rx="' + rxVB + '" ry="' + rzVB + '" ' +
      'transform="rotate(' + rot + ' ' + cp.left + ' ' + cp.top + ')" ' +
      'fill="none" stroke="rgba(92,225,230,0.15)" />';
  });

  svg.innerHTML = defs + zones + orbits + lines;

  /* Zone labels — DOM elements with counter-scaling */
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
  Object.entries(galaxyData.zones).forEach(([zid, zone]) => {
    if (!zone.position || HIDDEN_ZONES.has(zid)) return;
    const cp = coordToPercent(zone.position.x, zone.position.z);
    const label = document.createElement('div');
    label.className = 'gx-zone-label-2d';
    const text = ZONE_DISPLAY[zid] || zone.name;
    label.innerHTML = text.replace(/\n/g, '<br>');
    label.style.left = cp.left + '%';
    label.style.top = cp.top + '%';
    if (zone.factionId && galaxyData.factions[zone.factionId]) {
      label.style.color = galaxyData.factions[zone.factionId].color;
    }
    clip.appendChild(label);
  });

  /* Initial visibility pass */
  updateMapTransform();
}

map2d.addEventListener('contextmenu', (e) => e.preventDefault());

let lastMouseX = window.innerWidth / 2;
let lastMouseY = window.innerHeight / 2;
map2d.addEventListener('mousemove', (e) => { lastMouseX = e.clientX; lastMouseY = e.clientY; });

/* Zoom toward a screen-space focal point (mouse cursor or selected body) */
function zoomMap(factor) {
  const newScale = Math.min(Math.max(mapScale * factor, 0.65), 60);
  let fx, fy;
  /* If a body is selected, zoom toward it */
  if (selectedId) {
    const coords = bodyWorldCoords(selectedId);
    if (coords) {
      const pos = coordToPercent(coords.x, coords.z);
      fx = (pos.left / 100 * 800 - 400) * mapScale + mapX;
      fy = (pos.top / 100 * 800 - 400) * mapScale + mapY;
    }
  }
  if (fx === undefined) { fx = lastMouseX - window.innerWidth / 2; fy = lastMouseY - window.innerHeight / 2; }
  const ratio = newScale / mapScale;
  mapX = fx - (fx - mapX) * ratio;
  mapY = fy - (fy - mapY) * ratio;
  mapScale = newScale;
  updateMapTransform();
}

map2d.addEventListener('wheel', (e) => {
  e.preventDefault();
  zoomMap(1 - e.deltaY * 0.001);
}, { passive: false });

let dragMoved = false;

map2d.addEventListener('mousedown', (e) => {
  if (e.target.closest('.gx-pin')) return;
  isDragging = true;
  dragMoved = false;
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  dragMapStartX = mapX;
  dragMapStartY = mapY;
});

window.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  const dx = e.clientX - dragStartX;
  const dy = e.clientY - dragStartY;
  if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragMoved = true;
  mapX = dragMapStartX + dx;
  mapY = dragMapStartY + dy;
  updateMapTransform();
});

window.addEventListener('mouseup', () => { isDragging = false; });

/* Only deselect on genuine clicks, not drag releases */
map2d.addEventListener('click', (e) => {
  if (e.target.closest('.gx-pin') || dragMoved) return;
  deselectBody();
});

/* Context panel */
function selectBody(id) {
  if (!galaxyData || !galaxyData.bodies[id]) return;
  selectedId = id;
  const body = galaxyData.bodies[id];
  const panel = document.getElementById('context-panel');
  panel.classList.add('open');

  /* Highlight 2D pin */
  document.querySelectorAll('.gx-pin.selected').forEach(p => p.classList.remove('selected'));
  const pin = document.querySelector('.gx-pin[data-id="' + id + '"]');
  if (pin) pin.classList.add('selected');

  const typeColors = {
    star: 'var(--gx-warning)', planet: '#6688cc', moon: '#888899',
    station: 'var(--gx-success)', belt: '#aa8866', megastructure: 'var(--gx-accent)'
  };
  const typeEl = document.getElementById('panel-type');
  typeEl.style.color = typeColors[body.type] || 'var(--gx-text-dim)';
  typeEl.textContent = body.type.toUpperCase() + (body.subtype ? ' / ' + body.subtype.toUpperCase() : '');
  const nameEl = document.getElementById('panel-name');
  if (body.colonizedCode != null) {
    /* 3-pointed star badge — 3 outer tips + 3 inner valleys at 120-degree intervals */
    nameEl.innerHTML = body.name + ' <span class="gx-colony-badge" title="Colonization order: System ' +
      body.colonizedCode + '"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
      '<polygon points="12,1 15.6,10.4 22,18.2 12,16.7 2,18.2 8.4,10.4" fill="#f0a030"/>' +
      '</svg><span class="gx-colony-num">' + body.colonizedCode + '</span></span>';
  } else {
    nameEl.textContent = body.name;
  }
  nameEl.style.cursor = 'context-menu';
  nameEl.oncontextmenu = (e) => { e.preventDefault(); flyToBody(id); };

  const faction = body.factionId ? galaxyData.factions[body.factionId] : null;
  let html = '';

  html += '<div class="gx-p-section"><div class="gx-p-meta">';
  html += '<div class="gx-p-meta-item"><label>Faction</label><div class="value">';
  if (faction) {
    html += '<span class="gx-p-faction-dot" style="background:' + faction.color + '"></span>' + faction.name;
  } else {
    html += '<span style="color:var(--gx-text-muted)">None</span>';
  }
  html += '</div></div>';

  if (body.position) {
    html += '<div class="gx-p-meta-item"><label>Position</label><div class="value" style="font-family:monospace;font-size:8.5pt;color:var(--gx-text-dim)">' +
      Math.round(body.position.x) + ', ' + Math.round(body.position.y) + ', ' + Math.round(body.position.z) + '</div></div>';
  } else if (body.parentId) {
    const parent = galaxyData.bodies[body.parentId];
    html += '<div class="gx-p-meta-item"><label>Orbits</label><div class="value" style="color:var(--gx-accent)">' +
      (parent ? parent.name : body.parentId) + '</div></div>';
  }
  if (body.spectralClass) {
    html += '<div class="gx-p-meta-item"><label>Spectral Class</label><div class="value" style="color:var(--gx-warning)">' + body.spectralClass + '</div></div>';
  }
  if (body.visual && body.visual.color) {
    html += '<div class="gx-p-meta-item"><label>Color</label><div class="value"><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:' +
      body.visual.color + ';vertical-align:middle;margin-right:4px"></span><span style="font-family:monospace;font-size:8.5pt;color:var(--gx-text-dim)">' +
      body.visual.color + '</span></div></div>';
  }
  html += '</div></div>';

  if (body.description) {
    html += '<div class="gx-p-section"><div class="gx-p-label">Description</div>';
    html += '<div class="gx-p-text">' + body.description + '</div></div>';
  }
  if (body.notes) {
    html += '<div class="gx-p-section"><div class="gx-p-label">Notes</div>';
    html += '<div class="gx-p-text">' + body.notes + '</div></div>';
  }

  const children = Object.entries(galaxyData.bodies)
    .filter(([, b]) => b.parentId === id)
    .sort((a, b) => (a[1].orbital?.order ?? 999) - (b[1].orbital?.order ?? 999));

  if (children.length) {
    html += '<div class="gx-p-section"><div class="gx-p-label">Orbiting Bodies (' + children.length + ')</div>';
    children.forEach(([cId, child]) => {
      const cf = child.factionId ? galaxyData.factions[child.factionId] : null;
      const dc = cf ? cf.color : (child.visual?.color || '#555');
      html += '<div class="gx-p-child" data-id="' + cId + '"><span class="gx-p-child-dot" style="background:' + dc + '"></span> ' +
        child.name + ' <span class="gx-p-child-type">' + child.type + '</span></div>';
    });
    html += '</div>';
  }

  const lanes = Object.entries(galaxyData.hyperlanes)
    .filter(([, h]) => h.fromId === id || h.toId === id);
  if (lanes.length) {
    html += '<div class="gx-p-section"><div class="gx-p-label">Hyperlanes (' + lanes.length + ')</div><div>';
    lanes.forEach(([, h]) => {
      const otherId = h.fromId === id ? h.toId : h.fromId;
      const other = galaxyData.bodies[otherId];
      html += '<span class="gx-p-lane" data-id="' + otherId + '">' + (other ? other.name : otherId) + '</span>';
    });
    html += '</div></div>';
  }

  if (body.tags?.length) {
    html += '<div class="gx-p-section"><div class="gx-p-label">Tags</div><div>';
    body.tags.forEach(t => { html += '<span class="gx-p-tag">' + t + '</span>'; });
    html += '</div></div>';
  }

  if (body.hasFuddruckers) {
    html += '<div class="gx-p-section"><div class="gx-p-fuddruckers">' +
      '<input type="checkbox" checked disabled><label>Has Fuddruckers</label></div></div>';
  }

  document.getElementById('panel-body').innerHTML = html;

  document.querySelectorAll('.gx-p-child[data-id], .gx-p-lane[data-id]').forEach(el => {
    el.addEventListener('click', () => selectBody(el.dataset.id));
    el.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      selectBody(el.dataset.id);
      flyToBody(el.dataset.id);
    });
  });

  if (callbacks.onSelect) callbacks.onSelect(id, body);
}

function deselectBody() {
  selectedId = null;
  document.getElementById('context-panel').classList.remove('open');
  document.querySelectorAll('.gx-pin.selected').forEach(p => p.classList.remove('selected'));
  if (callbacks.onDeselect) callbacks.onDeselect();
}

/* 2D fly-to animation */
let mapFlyAnim = null;

function flyTo2D(id) {
  const coords = bodyWorldCoords(id);
  if (!coords) return;
  const body = galaxyData.bodies[id];
  const tier = pinTier(id, body);
  const targetScale = tier === 'landmark' ? 2 : tier === 'star' ? 4 : tier === 'gng' ? 8 : 6;
  /* Pin position in 800px map-container local coords */
  const pos = coordToPercent(coords.x, coords.z);
  const px = pos.left / 100 * 800;
  const pz = pos.top / 100 * 800;
  /* Container is centered via translate(-50%, -50%) then offset by mapX/mapY.
     Transform origin is center. Pin offset from center = (px - 400).
     After scale, pin screen offset from container center = (px - 400) * scale.
     Container center is at viewport center + (mapX, mapY).
     To center pin on screen: mapX = -(px - 400) * scale */
  const toScale = Math.max(targetScale, mapScale);
  const toX = -(px - 400) * toScale;
  const toY = -(pz - 400) * toScale;

  mapFlyAnim = {
    fromX: mapX, fromY: mapY, fromScale: mapScale,
    toX, toY, toScale,
    start: performance.now(), duration: 800
  };
  requestAnimationFrame(animateMapFly);
}

function animateMapFly() {
  if (!mapFlyAnim) return;
  const raw = (performance.now() - mapFlyAnim.start) / mapFlyAnim.duration;
  const t = raw >= 1 ? 1 : raw * raw * (3 - 2 * raw);
  mapX = mapFlyAnim.fromX + (mapFlyAnim.toX - mapFlyAnim.fromX) * t;
  mapY = mapFlyAnim.fromY + (mapFlyAnim.toY - mapFlyAnim.fromY) * t;
  mapScale = mapFlyAnim.fromScale + (mapFlyAnim.toScale - mapFlyAnim.fromScale) * t;
  updateMapTransform();
  if (raw < 1) requestAnimationFrame(animateMapFly);
  else mapFlyAnim = null;
}

/* Fly to body — dispatches to 2D or 3D via callback */
function flyToBody(id) {
  if (viewMode === '2d') {
    flyTo2D(id);
  } else if (callbacks.onFlyTo) {
    callbacks.onFlyTo(id);
  }
}

/* Search */
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');

searchInput.addEventListener('input', () => {
  const q = searchInput.value.trim().toLowerCase();
  if (!q || !galaxyData) { searchResults.classList.remove('open'); return; }

  const qNum = /^\d+$/.test(q) ? parseInt(q) : null;
  const matches = Object.entries(galaxyData.bodies)
    .filter(([id, b]) => {
      if (qNum !== null && b.colonizedCode === qNum) return true;
      /* Pure-number queries only match colonization codes, not name substrings */
      if (qNum !== null) return false;
      return b.name.toLowerCase().includes(q) || id.includes(q);
    })
    .sort((a, b) => {
      const aCode = qNum !== null && a[1].colonizedCode === qNum ? 0 : 1;
      const bCode = qNum !== null && b[1].colonizedCode === qNum ? 0 : 1;
      return aCode - bCode;
    })
    .slice(0, 15);

  if (!matches.length) { searchResults.classList.remove('open'); return; }

  searchHighlight = -1;
  searchResults.innerHTML = matches.map(([id, b]) => {
    const faction = b.factionId ? galaxyData.factions[b.factionId] : null;
    const color = faction ? faction.color : '#555';
    const codeTag = b.colonizedCode != null
      ? '<span class="gx-search-code">System ' + b.colonizedCode + '</span>' : '';
    return '<div class="gx-search-item" data-id="' + id + '">' +
      '<span class="gx-search-dot" style="background:' + color + '"></span>' +
      '<span class="gx-search-name">' + b.name + '</span>' +
      codeTag +
      '<span class="gx-search-type">' + b.type + '</span></div>';
  }).join('');
  searchResults.classList.add('open');
});

let searchHighlight = -1;

function updateSearchHighlight() {
  const items = searchResults.querySelectorAll('.gx-search-item');
  items.forEach((el, i) => el.classList.toggle('highlighted', i === searchHighlight));
}

function confirmSearch() {
  const items = searchResults.querySelectorAll('.gx-search-item');
  const target = searchHighlight >= 0 && searchHighlight < items.length
    ? items[searchHighlight] : items[0];
  if (!target) return;
  const id = target.dataset.id;
  selectBody(id);
  flyToBody(id);
  searchInput.value = '';
  searchInput.blur();
  searchResults.classList.remove('open');
  searchHighlight = -1;
}

searchResults.addEventListener('click', e => {
  const item = e.target.closest('.gx-search-item');
  if (!item) return;
  const id = item.dataset.id;
  selectBody(id);
  flyToBody(id);
  searchInput.value = '';
  searchResults.classList.remove('open');
  searchHighlight = -1;
});

searchInput.addEventListener('keydown', (e) => {
  const items = searchResults.querySelectorAll('.gx-search-item');
  if (!items.length) return;
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    searchHighlight = Math.min(searchHighlight + 1, items.length - 1);
    updateSearchHighlight();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    searchHighlight = Math.max(searchHighlight - 1, 0);
    updateSearchHighlight();
  } else if (e.key === 'Enter') {
    e.preventDefault();
    confirmSearch();
  } else if (e.key === 'Escape') {
    searchInput.value = '';
    searchInput.blur();
    searchResults.classList.remove('open');
    searchHighlight = -1;
  }
});

searchInput.addEventListener('blur', () => {
  setTimeout(() => { searchResults.classList.remove('open'); searchHighlight = -1; }, 150);
});

/* Settings dropdown */
document.getElementById('settings-toggle').addEventListener('click', () => {
  document.getElementById('settings-dropdown').classList.toggle('open');
});

document.addEventListener('click', e => {
  if (!e.target.closest('#settings-toggle') && !e.target.closest('#settings-dropdown')) {
    document.getElementById('settings-dropdown').classList.remove('open');
  }
});

/* Controls popup */
document.getElementById('controls-toggle').addEventListener('click', () => {
  document.getElementById('controls-popup').classList.toggle('open');
});

/* Screenshot mode — hides all UI for clean screen captures */
const screenshotBtn = document.getElementById('btn-screenshot');

function toggleScreenshot() {
  const active = document.body.classList.toggle('screenshot-active');
  screenshotBtn.classList.toggle('active', active);
}

screenshotBtn.addEventListener('click', toggleScreenshot);
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  if (e.key === 'F2') { e.preventDefault(); toggleScreenshot(); }
  if (e.key === '1') { resetView(); }
  if (e.key === '2') { setViewMode('2d'); }
  if (e.key === '3') { setViewMode('3d'); }
});

/* Reset view — lerp back to default position */
function resetView() {
  deselectBody();
  if (viewMode === '2d') {
    mapFlyAnim = { fromX: mapX, fromY: mapY, fromScale: mapScale, toX: 0, toY: 0, toScale: 1, start: performance.now(), duration: 1000 };
    requestAnimationFrame(animateMapFly);
  } else if (callbacks.onResetView) {
    callbacks.onResetView();
  }
}

/* Panel close */
document.getElementById('panel-close').addEventListener('click', deselectBody);
document.getElementById('context-panel').addEventListener('contextmenu', e => e.preventDefault());

/* 2D scale bar — uses same elements as 3D */
const NICE_CONSTANT = 69;
const NICE_DISTANCES_2D = [
  1, 2, 5, 10, 20, 50, 69, 100, 200, 500,
  1000, 2000, 4000, 7000, 10000, 20000, 40000, 62100
];

function update2DScaleBar() {
  if (viewMode !== '2d') return;
  const scaleBarEl = document.getElementById('scale-bar');
  const scaleBarLine = document.getElementById('scale-bar-line');
  const scaleBarLabel = document.getElementById('scale-bar-label');
  /* 800px container = 1000 map units. At mapScale, 1 screen px = 1000/(800*mapScale) map units */
  const lyPerPx = (1000 * NICE_CONSTANT) / (800 * mapScale);
  /* Capped so high zoom picks useful distances (200 ly) instead of viewport-spanning ones (1000 ly) */
  const maxBarPx = Math.min(window.innerWidth * 0.3, 280);

  let bestLy = null;
  for (let i = NICE_DISTANCES_2D.length - 1; i >= 0; i--) {
    if (NICE_DISTANCES_2D[i] / lyPerPx <= maxBarPx) {
      bestLy = NICE_DISTANCES_2D[i];
      break;
    }
  }

  if (!bestLy) { scaleBarEl.style.visibility = 'hidden'; return; }
  scaleBarEl.style.visibility = 'visible';
  scaleBarLine.style.width = Math.round(bestLy / lyPerPx) + 'px';
  scaleBarLabel.textContent = bestLy === 69
    ? '69 ly (1 map unit)'
    : bestLy.toLocaleString() + ' ly';
}

/* Status bar */
function updateStatus() {
  if (!galaxyData) return;
  const bodies = Object.values(galaxyData.bodies);
  const counts = { star: 0, planet: 0, moon: 0, station: 0, gng: 0 };
  bodies.forEach(b => {
    if (b.type === 'star') counts.star++;
    else if (b.type === 'planet') counts.planet++;
    else if (b.type === 'moon') counts.moon++;
    else if (b.type === 'station') {
      if (b.name && b.name.startsWith('Gas-N-Gripe')) counts.gng++;
      else counts.station++;
    }
  });
  const parts = [
    counts.star + ' star systems',
    counts.planet + ' planets',
    counts.moon + ' moons',
    counts.station + ' stations',
    counts.gng + ' Gas-N-Gripes',
    '80,000 rendered stars',
    '15,000 asteroids'
  ];
  document.getElementById('status-center').textContent = parts.join('  \u00b7  ');
}

/* View mode */
let viewMode = '3d';

function setViewMode(mode) {
  viewMode = mode;
  document.getElementById('btn-3d').classList.toggle('active', mode === '3d');
  document.getElementById('btn-2d').classList.toggle('active', mode === '2d');
  map2d.classList.toggle('active', mode === '2d');
  document.body.classList.toggle('view-2d', mode === '2d');
  document.getElementById('controls-3d').style.display = mode === '3d' ? '' : 'none';
  document.getElementById('controls-2d').style.display = mode === '2d' ? '' : 'none';

  if (callbacks.onViewChange) callbacks.onViewChange(mode);
}

document.getElementById('btn-3d').addEventListener('click', () => setViewMode('3d'));
document.getElementById('btn-2d').addEventListener('click', () => setViewMode('2d'));

/* 2D keyboard controls — WASD pan, Q/E zoom */
const PAN_SPEED_2D = 8;
const ZOOM_SPEED_2D = 0.03;
const keys2d = {};
let raf2d = null;

window.addEventListener('keydown', (e) => {
  if (viewMode !== '2d') return;
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  const code = e.code;
  if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyQ', 'KeyE'].includes(code)) {
    e.preventDefault();
    keys2d[code] = true;
    if (!raf2d) raf2d = requestAnimationFrame(tick2d);
  }
});

window.addEventListener('keyup', (e) => {
  keys2d[e.code] = false;
});

window.addEventListener('blur', () => { for (const k in keys2d) keys2d[k] = false; });

function tick2d() {
  raf2d = null;
  const anyPressed = Object.values(keys2d).some(Boolean);
  if (!anyPressed || viewMode !== '2d') return;

  if (keys2d['KeyW']) mapY += PAN_SPEED_2D;
  if (keys2d['KeyS']) mapY -= PAN_SPEED_2D;
  if (keys2d['KeyA']) mapX += PAN_SPEED_2D;
  if (keys2d['KeyD']) mapX -= PAN_SPEED_2D;
  if (keys2d['KeyE']) { zoomMap(1 + ZOOM_SPEED_2D); }
  else if (keys2d['KeyQ']) { zoomMap(1 - ZOOM_SPEED_2D); }
  else { updateMapTransform(); }
  raf2d = requestAnimationFrame(tick2d);
}

updateMapTransform();

export function init(data, cbs) {
  galaxyData = data;
  callbacks = cbs || {};
  updateStatus();
  build2DMap();
}

export function getSelectedId() { return selectedId; }
export function getViewMode() { return viewMode; }

export { selectBody, deselectBody, setViewMode, flyToBody };
