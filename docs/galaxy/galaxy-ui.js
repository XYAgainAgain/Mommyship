/* Galaxy UI — search, context panel, 2D map delegation, settings, status bar */

import { createMap2D } from './map2d.js';

let galaxyData = null;
let selectedId = null;
let callbacks = {};
let isTracking = false;

/* 2D canvas map (map2d.js) — created in init() */
let map2dView = null;

const map2d = document.getElementById('map-2d');

map2d.addEventListener('contextmenu', (e) => e.preventDefault());

/* Context panel */

/* Biohazard SVG path for toxic indicator */
const TOXIC_SVG = '<svg class="gx-p-toxic" viewBox="0 0 988.6 988.6" xmlns="http://www.w3.org/2000/svg">' +
  '<path d="M556.8,602.8c-3.8-6.6-12-9.3-19-6.3c-13.3,5.8-28,8.9-43.4,8.9s-29.9-3.2-43.2-8.9c-7-3-15.2-.4-19,6.3l-106,184.7c-4.3,7.4-1.5,16.9,6.1,20.8c25.7,13.2,85.3,38.9,161.2,39.3h1.8c75.3-.4,135.3-26.1,161.2-39.3c7.6-3.9,10.5-13.4,6.2-20.8z"/>' +
  '<path d="M385.5,483.8c3.6-30.6,19.7-57.8,43-75.5c6.1-4.6,7.8-13,3.9-19.5L325,205c-4.3-7.4-14-9.7-21.1-5c-24.3,15.8-76.4,55-114.2,120.2l-.8,1.4c-37.3,65.9-44.8,130.7-46.1,159.6c-.4,8.6,6.4,15.7,15,15.7h213c7.3.1,13.7-5.6,14.6-13.1z"/>' +
  '<path d="M799.8,321.6c-.1-.2-.3-.5-.4-.7l-.4-.7c-37.8-65.2-89.9-105-114.2-120.8c-7.2-4.7-16.8-2.4-21.1,5L556.2,388.8c-3.8,6.6-2.1,14.9,3.9,19.5c23.3,17.7,39.4,44.9,43,75.5c.9,7.5,7.3,13.2,14.9,13.2h213c8.6,0,15.4-7.1,15-15.7c-1.4-28.9-8.8-93.7-46.2-159.7z"/>' +
  '<circle cx="494.3" cy="496" r="73.5"/>' +
  '<path d="M843.8,144.8C753.5,54.5,633.2,0,494.3,0S235.1,54.5,144.8,144.8C54.5,235.1,0,355.4,0,494.3s54.5,259.2,144.8,349.5S355.4,988.6,494.3,988.6s259.2-54.5,349.5-144.8c90.3-90.3,144.8-210.6,144.8-349.5S934.1,235.1,843.8,144.8zM862.3,649.7c-20.1,47.5-48.9,90.2-85.6,126.9s-79.4,65.5-126.9,85.6C600.6,883,548.3,893.6,494.4,893.6s-106.2-10.6-155.4-31.4c-47.5-20.1-90.2-48.9-126.9-85.6c-36.7-36.7-65.5-79.4-85.6-126.9C105.6,600.5,95,548.2,95,494.3s10.6-106.2,31.4-155.4c20.1-47.5,48.9-90.2,85.6-126.9s79.4-65.5,126.9-85.6C388.2,105.6,440.5,95,494.4,95s106.2,10.6,155.4,31.4c47.5,20.1,90.2,48.9,126.9,85.6c36.7,36.7,65.5,79.4,85.6,126.9c20.8,49.2,31.4,101.5,31.4,155.4S883.1,600.5,862.3,649.7z"/>' +
  '</svg>';

/* Storage-blocked browsers throw SecurityError; a module-scope throw would kill the whole import chain */
const lsGet = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch { } };

/* Editor mode state — expires after 5 min of inactivity so it's opt-in each session */
const EDITOR_COOLDOWN_MS = 5 * 60 * 1000;
const lastEditTime = parseInt(lsGet('mommyship-galaxy-editor-ts') || '0', 10);
let editorMode = lsGet('mommyship-galaxy-editor') === 'true'
  && (Date.now() - lastEditTime < EDITOR_COOLDOWN_MS);
let editorSystems = null;
let editorDirty = false;
let colorPickerOpen = false;
let deleteTimer = null;

/* Keyed by body so a second body's edit flushes the first instead of canceling it */
let rebakePending = null;
function scheduleRebake(id) {
  if (rebakePending) {
    clearTimeout(rebakePending.timer);
    if (rebakePending.id !== id) rebakePending.run();
  }
  const run = () => {
    rebakePending = null;
    if (!editorSystems) return;
    if (galaxyData.bodies[id]?.type === 'star') editorSystems.rebakeSingleStar?.(id);
    else editorSystems.rebakeSinglePlanet?.(id);
    editorSystems.rebuildMarkers();
  };
  rebakePending = { id, run, timer: setTimeout(run, 100) };
}

/* Undo/redo — body state snapshots, 15-step circular buffer */
const UNDO_MAX = 15;
const undoStack = [];
let undoPos = -1;

/* Two entry shapes: single-body { id, state } and compound { bodies, lanes } for a
   cascade delete. A null state/lane in either map means "this key was absent". */
const cloneState = (v) => (v ? JSON.parse(JSON.stringify(v)) : null);

function pushEntry(entry) {
  undoStack.length = undoPos + 1;
  undoStack.push(entry);
  if (undoStack.length > UNDO_MAX) undoStack.shift();
  undoPos = undoStack.length - 1;
}

function pushUndo(bodyId) {
  const body = galaxyData.bodies[bodyId];
  if (!body) return;
  pushEntry({ id: bodyId, state: cloneState(body) });
}

/* removeBody cascades, so one entry has to carry the whole doomed subtree and its lanes */
function pushUndoRemoved(removed) {
  if (removed?.bodies) pushEntry({ bodies: removed.bodies, lanes: removed.lanes });
}

/* Live state of exactly the keys an entry covers, so applying it is the entry's inverse */
function snapshotOf(entry) {
  if (!entry.bodies) return { id: entry.id, state: cloneState(galaxyData.bodies[entry.id]) };
  const bodies = {}, lanes = {};
  for (const bid of Object.keys(entry.bodies)) bodies[bid] = cloneState(galaxyData.bodies[bid]);
  for (const lid of Object.keys(entry.lanes || {})) lanes[lid] = cloneState(galaxyData.hyperlanes[lid]);
  return { bodies, lanes };
}

function restoreState(entry) {
  if (!editorSystems) return;
  const ids = entry.bodies ? Object.keys(entry.bodies) : [entry.id];
  if (entry.bodies) {
    for (const [bid, state] of Object.entries(entry.bodies)) {
      if (state) galaxyData.bodies[bid] = cloneState(state);
      else delete galaxyData.bodies[bid];
    }
    for (const [lid, lane] of Object.entries(entry.lanes || {})) {
      if (lane) galaxyData.hyperlanes[lid] = cloneState(lane);
      else delete galaxyData.hyperlanes[lid];
    }
  } else if (entry.state) {
    galaxyData.bodies[entry.id] = cloneState(entry.state);
  } else {
    delete galaxyData.bodies[entry.id];
  }
  editorSystems.autosave();
  for (const bid of ids) {
    if (!galaxyData.bodies[bid]) continue;
    editorSystems.rebakeSinglePlanet?.(bid);
    editorSystems.rebakeSingleStar?.(bid);
  }
  editorSystems.rebuildMarkers();
  markDirty();
  /* Always re-select the undone body so the user sees the change */
  if (galaxyData.bodies[ids[0]]) selectBody(ids[0]);
  else deselectBody();
}

/* Invariant after any undo/redo: the applied state is undoStack[undoPos + 1]; undoPos is the next undo target */
function editorUndo() {
  if (undoPos < 0) return;
  const entry = undoStack[undoPos];
  /* Bank the live state unless the successor slot already holds it — consecutive undos of
     one body would otherwise insert duplicates and stretch the redo chain unboundedly */
  const live = snapshotOf(entry);
  const succ = undoStack[undoPos + 1];
  if (!succ || JSON.stringify(succ) !== JSON.stringify(live)) {
    undoStack.splice(undoPos + 1, 0, live);
    if (undoStack.length > UNDO_MAX * 2 && undoPos > 0) { undoStack.shift(); undoPos--; }
  }
  restoreState(entry);
  undoPos--;
}

function editorRedo() {
  if (undoPos + 2 >= undoStack.length) return;
  undoPos++;
  restoreState(undoStack[undoPos + 1]);
}

const PREDEFINED_TAGS = ['landmark', 'colony', 'settlement', 'port', 'uninhabited', 'destroyed', 'hostile', 'homeworld', 'ringed', 'picturesque'];

function markDirty() {
  lsSet('mommyship-galaxy-editor-ts', String(Date.now()));
  if (editorDirty) return;
  editorDirty = true;
  const btn = document.getElementById('ed-export-nav');
  if (btn) btn.classList.add('dirty');
  /* Warn before leaving with unexported changes */
  window.onbeforeunload = (e) => {
    e.preventDefault();
    return 'Your changes are saved locally but NOT exported!';
  };
}

/* Walk from any body up to the system root, then build a tree of that entire system */
function buildSystemTree(bodyId) {
  if (!galaxyData?.bodies[bodyId]) return null;
  /* Depth-guarded: a cyclic parentId would otherwise freeze the tab */
  let rootId = bodyId, rootGuard = 0;
  while (galaxyData.bodies[rootId]?.parentId && rootGuard++ < 16) rootId = galaxyData.bodies[rootId].parentId;
  /* Build children map for the whole system */
  const childrenOf = new Map();
  for (const [id, b] of Object.entries(galaxyData.bodies)) {
    if (!b.parentId) continue;
    if (!childrenOf.has(b.parentId)) childrenOf.set(b.parentId, []);
    childrenOf.get(b.parentId).push(id);
  }
  /* Sort children by orbital order */
  for (const [, kids] of childrenOf) {
    kids.sort((a, b) => (galaxyData.bodies[a]?.orbital?.order ?? 999) - (galaxyData.bodies[b]?.orbital?.order ?? 999));
  }
  /* Build ancestry set for highlight path */
  const ancestry = new Set();
  let walk = bodyId, walkGuard = 0;
  while (walk && walkGuard++ < 16) { ancestry.add(walk); walk = galaxyData.bodies[walk]?.parentId || null; }

  /* Depth cap matches the walk guards: a cycle would otherwise recurse until the stack blows */
  function buildNode(id, depth = 0) {
    const body = galaxyData.bodies[id];
    const kids = depth < 16 ? (childrenOf.get(id) || []) : [];
    return { id, name: body?.name || id, type: body?.type || '?', body, children: kids.map(k => buildNode(k, depth + 1)) };
  }
  /* Root might be a star system with sibling stars at the same level */
  return { root: buildNode(rootId), ancestry, selectedId: bodyId };
}

/* Render a system tree as HTML — expandMode: 'hover' (view) or 'full' (editor) */
function renderTreeHTML(tree, expandMode) {
  if (!tree) return '';
  const { ancestry, selectedId } = tree;
  function renderNode(node, depth) {
    const body = node.body;
    const isSelected = node.id === selectedId;
    const isAncestor = ancestry.has(node.id);
    const cf = body?.factionId ? galaxyData.factions[body.factionId] : null;
    const dot = cf ? cf.color : (body?.visual?.color || '#555');
    const selClass = isSelected ? ' gx-nav-selected' : (isAncestor ? ' gx-nav-ancestor' : '');
    const hasKids = node.children.length > 0;
    /* In hover mode, depth-0 children (planets) always visible, deeper levels on hover/ancestry */
    const expanded = expandMode === 'full' || isAncestor || isSelected || depth === 0;
    let html = '<div class="gx-nav-item' + selClass + '" data-id="' + node.id + '" style="padding-left:' + (depth * 14 + 6) + 'px">';
    html += '<span class="gx-nav-dot" style="background:' + dot + '"></span>';
    html += '<span class="gx-nav-name">' + node.name + '</span>';
    html += '<span class="gx-nav-type">' + node.type + '</span>';
    html += '</div>';
    if (hasKids) {
      const groupClass = expanded ? ' open' : '';
      html += '<div class="gx-nav-children' + groupClass + '">';
      for (const child of node.children) html += renderNode(child, depth + 1);
      html += '</div>';
    }
    return html;
  }
  return renderNode(tree.root, 0);
}

/* All-systems list for navicomputer when nothing is selected */
function buildSystemIndex() {
  if (!galaxyData) return '';
  const stars = [];
  const freeFloat = [];
  for (const [id, b] of Object.entries(galaxyData.bodies)) {
    if (!b.position) continue;
    if (b.type === 'star') {
      stars.push({ id, name: b.name, code: b.colonizedCode });
    } else {
      freeFloat.push({ id, name: b.name, type: b.type });
    }
  }
  /* Stars sorted by colonization order; uncolonized (Osminok) last */
  stars.sort((a, b) => {
    if (a.code != null && b.code != null) return a.code - b.code;
    if (a.code != null) return -1;
    if (b.code != null) return 1;
    return a.name.localeCompare(b.name);
  });
  freeFloat.sort((a, b) => a.name.localeCompare(b.name));
  let html = '';
  for (const s of stars) {
    const label = s.code != null ? 'System ' + s.code : 'System ?';
    html += '<div class="gx-nav-item" data-id="' + s.id + '">';
    html += '<span class="gx-nav-dot" style="background:var(--gx-warning)"></span>';
    html += '<span class="gx-nav-name">' + s.name + '</span>';
    html += '<span class="gx-nav-type">' + label + '</span>';
    html += '</div>';
  }
  if (freeFloat.length) {
    html += '<div class="gx-nav-lanes"><div class="gx-p-label">Free-Floating (' + freeFloat.length + ')</div></div>';
    for (const f of freeFloat) {
      html += '<div class="gx-nav-item" data-id="' + f.id + '">';
      html += '<span class="gx-nav-dot" style="background:var(--gx-text-muted)"></span>';
      html += '<span class="gx-nav-name">' + f.name + '</span>';
      html += '<span class="gx-nav-type">' + f.type + '</span>';
      html += '</div>';
    }
  }
  return html;
}

/* Edit-mode navicomputer — floating left panel with full tree */
function updateNavicomputer(bodyId) {
  const panel = document.getElementById('navicomputer-panel');
  const container = document.getElementById('navicomputer-body');
  if (!panel || !container) return;
  if (!editorMode || viewMode !== '3d') { panel.classList.remove('open'); return; }
  /* No body selected — show all systems by colonization order */
  if (!bodyId) {
    container.innerHTML = buildSystemIndex();
    panel.classList.add('open');
    container.querySelectorAll('.gx-nav-item[data-id]').forEach(el => {
      el.addEventListener('click', () => selectBody(el.dataset.id));
      el.addEventListener('contextmenu', (e) => { e.preventDefault(); selectBody(el.dataset.id); flyToBody(el.dataset.id); });
    });
    return;
  }
  const tree = buildSystemTree(bodyId);
  if (!tree) { panel.classList.remove('open'); return; }
  let html = renderTreeHTML(tree, 'full');
  /* Hyperlanes for the root star — lets you hop to adjacent systems */
  const rootId = tree.root.id;
  const lanes = Object.entries(galaxyData.hyperlanes)
    .filter(([, h]) => h.fromId === rootId || h.toId === rootId);
  if (lanes.length) {
    html += '<div class="gx-nav-lanes"><div class="gx-p-label">Hyperlanes (' + lanes.length + ')</div><div>';
    lanes.forEach(([, h]) => {
      const otherId = h.fromId === rootId ? h.toId : h.fromId;
      const other = galaxyData.bodies[otherId];
      html += '<span class="gx-p-lane" data-id="' + otherId + '">' + (other ? other.name : otherId) + '</span>';
    });
    html += '</div></div>';
  }
  container.innerHTML = html;
  panel.classList.add('open');
  /* Wire clicks: L-click selects, R-click tracks (consistent with 3D scene behavior) */
  container.querySelectorAll('.gx-nav-item[data-id], .gx-p-lane[data-id]').forEach(el => {
    el.addEventListener('click', () => selectBody(el.dataset.id));
    el.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      selectBody(el.dataset.id);
      flyToBody(el.dataset.id);
    });
  });
}

/* Canonical subtype lists */
const SUBTYPES = {
  star: ['red-dwarf', 'orange-dwarf', 'yellow-dwarf', 'yellow-subgiant', 'blue-giant', 'red-giant', 'red-supergiant', 'white-dwarf', 'brown-dwarf', 'wolf-rayet', 'pulsar', 'binary'],
  planet: ['rocky', 'barren', 'gas', 'ocean', 'ice', 'volcanic', 'crystalline', 'fungal', 'constructed'],
  moon: ['rocky', 'barren', 'gas', 'ocean', 'ice', 'volcanic', 'crystalline', 'fungal', 'constructed'],
  station: ['port', 'military', 'recreation', 'science', 'fueling'],
  belt: ['constructed'],
  megastructure: ['constructed'],
  /* Not selectable in v1 — included as canonical reference for future Place mode */
  anomaly: ['black-hole', 'grav-lensing', 'fast-radio-bursts', 'gamma-rays', 'cosmic-void', 'rogue-planet', 'wormhole', 'white-hole', 'rift'],
  nebula: ['emission', 'reflection', 'dark', 'planetary', 'supernova-remnants', 'molecular-cloud', 'Bok-globules', 'Wolf-Rayet']
};

const CLASSES = ['S', 'A', 'B', 'C', 'D', 'U', 'X'];

/* MK classification dropdown data */
/* Ordered coldest → hottest, then exotic/rare at the end */
const MK_TYPES = [
  { value: 'Y', label: 'Y — Brown Dwarf (icy)' },
  { value: 'T', label: 'T — Brown Dwarf (cold)' },
  { value: 'L', label: 'L — Brown Dwarf (cool)' },
  { value: 'M', label: 'M — Red Dwarf' },
  { value: 'K', label: 'K — Orange' },
  { value: 'G', label: 'G — Yellow (Sol-like)' },
  { value: 'F', label: 'F — Yellow-White' },
  { value: 'A', label: 'A — White' },
  { value: 'B', label: 'B — Blue-White' },
  { value: 'O', label: 'O — Blue' },
  { value: 'C', label: 'C — Carbon Star' },
  { value: 'WN', label: 'WN — Wolf-Rayet (nitrogen)' },
  { value: 'WC', label: 'WC — Wolf-Rayet (carbon)' },
  { value: 'WO', label: 'WO — Wolf-Rayet (oxygen)' },
  { value: 'DA', label: 'DA — White Dwarf (remnant)' },
  { value: 'DB', label: 'DB — White Dwarf (He)' },
  { value: 'SD', label: 'SD — Subdwarf' },
  { value: 'TT', label: 'TT — T Tauri (protostar)' },
  { value: 'PSR', label: 'PSR — Pulsar' },
];

/* Types that use numeric subclass 0–9 */
const MK_HAS_SUBCLASS = new Set(['O','B','A','F','G','K','M','L','T','Y','C','WN','WC','WO','DA','DB']);
/* Types that use luminosity class I–V */
const MK_HAS_LUMINOSITY = new Set(['O','B','A','F','G','K','M','L','T','Y','C']);

const MK_LUMINOSITIES = [
  { value: 'I', label: 'I — Supergiant' },
  { value: 'II', label: 'II — Bright Giant' },
  { value: 'III', label: 'III — Giant' },
  { value: 'IV', label: 'IV — Subgiant' },
  { value: 'V', label: 'V — Main Sequence' },
];

/* Human-readable MK descriptor for header: "K5V" → "Orange Dwarf" */
const MK_COLOR_NAMES = {
  O: 'Blue', B: 'Blue-White', A: 'White', F: 'Yellow-White',
  G: 'Yellow', K: 'Orange', M: 'Red',
  L: 'Brown Dwarf', T: 'Brown Dwarf', Y: 'Brown Dwarf',
  C: 'Carbon Star', WN: 'Wolf-Rayet', WC: 'Wolf-Rayet', WO: 'Wolf-Rayet',
  DA: 'White Dwarf', DB: 'White Dwarf', SD: 'Subdwarf',
  TT: 'T Tauri', PSR: 'Pulsar',
};
const MK_LUM_NAMES = { I: 'Supergiant', II: 'Bright Giant', III: 'Giant', IV: 'Subgiant', V: 'Dwarf' };
/* Approximate display colors for MK types — matches star-params atmoColor palette */
const MK_DISPLAY_COLORS = {
  O: '#99bbff', B: '#aaccff', A: '#eeeeff', F: '#ffffee',
  G: '#ffee88', K: '#ffaa44', M: '#ff6633',
  L: '#cc4422', T: '#994433', Y: '#664422',
  C: '#ff3322', WN: '#9933cc', WC: '#9933cc', WO: '#9933cc',
  DA: '#eeeeff', DB: '#eeeeff', SD: '#aabbcc',
  TT: '#ffcc66', PSR: '#aaddff',
};
function mkDescriptor(raw) {
  if (!raw) return '';
  const parsed = parseMKDropdown(raw);
  if (!parsed.type) return raw.toUpperCase();
  const color = MK_COLOR_NAMES[parsed.type] || parsed.type;
  /* Types that are self-describing (no luminosity suffix needed) */
  if (['L','T','Y','C','WN','WC','WO','DA','DB','TT','PSR','SD'].includes(parsed.type)) return color;
  const lum = MK_LUM_NAMES[parsed.lum] || '';
  return lum ? (color + ' ' + lum) : color;
}

/* Parse existing spectralClass string into dropdown values */
function parseMKDropdown(raw) {
  if (!raw) return { type: '', sub: '', lum: '' };
  const s = raw.trim().toUpperCase();
  if (s === 'PSR') return { type: 'PSR', sub: '', lum: '' };
  if (s.startsWith('TT')) return { type: 'TT', sub: '', lum: '' };
  if (s.startsWith('SD')) {
    const inner = parseMKDropdown(s.slice(2));
    return { type: 'SD', sub: inner.sub, lum: inner.lum };
  }
  /* Two-letter prefixes: WN, WC, WO, DA, DB */
  for (const prefix of ['WN', 'WC', 'WO', 'DA', 'DB']) {
    if (s.startsWith(prefix)) {
      const rest = s.slice(prefix.length);
      const digit = rest.match(/[0-9]/);
      return { type: prefix, sub: digit ? digit[0] : '', lum: '' };
    }
  }
  /* Standard single-letter type */
  const letter = s.charAt(0);
  const digit = s.match(/[0-9]/);
  const lumMatch = s.match(/(I{1,3}|IV|V)$/);
  return { type: letter, sub: digit ? digit[0] : '', lum: lumMatch ? lumMatch[0] : '' };
}

/* Build subclass <option> HTML based on spectral type */
function mkSubclassOptions(type, selected) {
  if (!type || !MK_HAS_SUBCLASS.has(type)) return '<option value="">--</option>';
  let html = '<option value="">--</option>';
  for (let i = 0; i <= 9; i++) {
    html += '<option value="' + i + '"' + (String(i) === String(selected) ? ' selected' : '') + '>' + i + '</option>';
  }
  return html;
}

/* Build luminosity <option> HTML based on spectral type */
function mkLumOptions(type, selected) {
  if (!type || !MK_HAS_LUMINOSITY.has(type)) return '<option value="">--</option>';
  let html = '<option value="">--</option>';
  MK_LUMINOSITIES.forEach(l => {
    html += '<option value="' + l.value + '"' + (l.value === selected ? ' selected' : '') + '>' + l.label + '</option>';
  });
  return html;
}

/* Assemble spectralClass string from dropdown values */
function assembleMK(type, sub, lum) {
  if (!type) return null;
  if (type === 'PSR' || type === 'TT') return type;
  let result = type;
  if (sub !== '') result += sub;
  if (lum && MK_HAS_LUMINOSITY.has(type)) result += lum;
  return result;
}
const SIZE_NAMES = ['XXXS', 'XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

const TYPE_COLORS = {
  star: 'var(--gx-warning)', planet: '#6688cc', moon: '#888899',
  station: 'var(--gx-success)', belt: '#aa8866', megastructure: 'var(--gx-accent)',
  anomaly: 'var(--gx-accent)', nebula: '#aa66cc'
};

/* Editor tooltips — 1250ms hover delay */
let tooltipEl = null;
let tooltipTimer = 0;
function wireTooltips() {
  if (!tooltipEl) {
    tooltipEl = document.createElement('div');
    tooltipEl.className = 'gx-ed-tooltip';
    document.body.appendChild(tooltipEl);
  }
  document.querySelectorAll('[data-tooltip]').forEach(el => {
    el.addEventListener('pointerenter', () => {
      clearTimeout(tooltipTimer);
      tooltipTimer = setTimeout(() => {
        tooltipEl.textContent = el.dataset.tooltip;
        const rect = el.getBoundingClientRect();
        tooltipEl.style.left = rect.left + 'px';
        tooltipEl.style.top = (rect.top - 6) + 'px';
        tooltipEl.style.transform = 'translateY(-100%)';
        tooltipEl.classList.add('visible');
      }, 1250);
    });
    el.addEventListener('pointerleave', () => {
      clearTimeout(tooltipTimer);
      tooltipEl.classList.remove('visible');
    });
  });
}

/* Shared header update — used by both view and editor modes */
function updatePanelHeader(body) {
  const typeEl = document.getElementById('panel-type');
  typeEl.style.color = TYPE_COLORS[body.type] || 'var(--gx-text-dim)';
  /* MK spectral fills in subtype for stars */
  let typeText = body.type.toUpperCase();
  if (body.spectralClass) {
    const mk = body.spectralClass.toUpperCase();
    const desc = mkDescriptor(body.spectralClass);
    const mkTip = 'Morgan-Keenan Classification: Letter = temp class, Number = subclass, Roman = luminosity';
    typeText += ' / <span data-tooltip="' + mkTip + '">' + mk + (desc ? ' (' + desc.toUpperCase() + ')' : '') + '</span>';
  } else if (body.subtype) {
    typeText += ' / ' + body.subtype.toUpperCase();
  }
  typeEl.innerHTML = typeText + (body.stats?.toxic ? ' ' + TOXIC_SVG : '');

  const nameEl = document.getElementById('panel-name');
  if (body.colonizedCode != null) {
    nameEl.innerHTML = body.name + ' <span class="gx-colony-badge" title="Colonization order: System ' +
      body.colonizedCode + '"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
      '<polygon points="12,1 15.6,10.4 22,18.2 12,16.7 2,18.2 8.4,10.4" fill="#f0a030"/>' +
      '</svg><span class="gx-colony-num">' + body.colonizedCode + '</span></span>';
  } else {
    nameEl.textContent = body.name;
  }
  nameEl.style.cursor = 'context-menu';

  const subEl = document.getElementById('panel-subtitle');
  subEl.textContent = body.subtitle || '';
}

/* View-only panel content */
function buildViewPanel(body, id) {
  const faction = body.factionId ? galaxyData.factions[body.factionId] : null;
  let html = '';

  html += '<div class="gx-p-section"><div class="gx-p-meta">';
  html += '<div class="gx-p-meta-item" data-tooltip="Political/corporate allegiance; sets default distant color"><label>Faction</label><div class="value">';
  if (faction) {
    html += '<span class="gx-p-faction-dot" style="background:' + faction.color + '"></span>' + faction.name;
  } else {
    html += '<span class="gx-p-muted">None</span>';
  }
  html += '</div></div>';

  if (body.position) {
    html += '<div class="gx-p-meta-item"><label>Position</label><div class="value gx-p-mono">' +
      Math.round(body.position.x) + ', ' + Math.round(body.position.y) + ', ' + Math.round(body.position.z) + '</div></div>';
  } else if (body.parentId) {
    const parent = galaxyData.bodies[body.parentId];
    html += '<div class="gx-p-meta-item"><label>Orbits</label><div class="value gx-p-accent">' +
      (parent ? parent.name : body.parentId) + '</div></div>';
  }
  if (body.spectralClass) {
    html += '<div class="gx-p-meta-item" data-tooltip="Morgan-Keenan (MK) classification: Letter = temperature class (Y coldest → O hottest), Number = subclass (0 hottest → 9 coolest), Roman Numeral = luminosity (I supergiant → V main sequence)"><label>Spectral Class</label><div class="value gx-p-warning">' + body.spectralClass + '</div></div>';
  }
  if (body.visual && body.visual.color) {
    html += '<div class="gx-p-meta-item"><label>Color</label><div class="value"><span class="gx-p-swatch" style="background:' +
      body.visual.color + '"></span><span class="gx-p-mono">' + body.visual.color + '</span></div></div>';
  }

  if (body.stats) {
    if (body.stats.class) {
      html += '<div class="gx-p-meta-item" data-tooltip="Safety/vibe rating; no visuals, but stations inherit as subtitle"><label>Class</label><div class="value gx-p-warning">' + body.stats.class + '</div></div>';
    }
    if (body.stats.population != null) {
      html += '<div class="gx-p-meta-item"><label>Population</label><div class="value gx-p-mono">~' + body.stats.population.toLocaleString() + '</div></div>';
    }
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

  /* System hierarchy tree — hover-expand for children */
  const tree = buildSystemTree(id);
  if (tree) {
    html += '<div class="gx-p-section"><div class="gx-p-label" style="color:#fff">NAVICOMPUTER</div>';
    html += '<div class="gx-nav-tree">' + renderTreeHTML(tree, 'hover') + '</div>';
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

  return html;
}

/* Build a <select> dropdown */
function edSelect(name, value, options, disabled) {
  let html = '<select class="gx-ed-select" data-field="' + name + '"' + (disabled ? ' disabled' : '') + '>';
  options.forEach(opt => {
    const selected = opt === value ? ' selected' : '';
    html += '<option value="' + opt + '"' + selected + '>' + (opt || 'None') + '</option>';
  });
  html += '</select>';
  return html;
}

/* Collect every tag used across all bodies + predefined list */
function getAllTags() {
  const set = new Set(PREDEFINED_TAGS);
  for (const b of Object.values(galaxyData.bodies)) {
    if (b.tags) b.tags.forEach(t => set.add(t));
  }
  return Array.from(set).sort();
}

/* Editor panel content */
function buildEditorPanel(body, id) {
  const stats = body.stats || {};
  const vis = body.visual || {};
  const isUneditable = body.type === 'anomaly' || body.type === 'nebula';
  const subtypeList = SUBTYPES[body.type] || [];

  /* Faction + zone dropdown options */
  const factionOpts = [''].concat(Object.keys(galaxyData.factions));
  const factionLabels = { '': 'None' };
  for (const [k, v] of Object.entries(galaxyData.factions)) factionLabels[k] = v.name;

  const zoneOpts = [''].concat(Object.keys(galaxyData.zones));
  const zoneLabels = { '': 'None' };
  for (const [k, v] of Object.entries(galaxyData.zones)) zoneLabels[k] = v.name;

  /* Size slider step — find index of current size */
  const curSize = (stats.size || '').toUpperCase();
  const sizeIdx = SIZE_NAMES.indexOf(curSize);

  let html = '';

  /* Collapsible section helper — open state persisted per session */
  function secOpen(key) {
    const stored = sessionStorage.getItem('gx-ed-' + key);
    if (stored != null) return stored === '1';
    return true;
  }
  function sec(label, key) {
    return '<details class="gx-ed-section gx-ed-details" data-sec="' + key + '"' + (secOpen(key) ? ' open' : '') + '>' +
      '<summary class="gx-ed-section-label gx-ed-summary">' + label + '</summary>';
  }
  const secEnd = '</details>';

  /* Identity section */
  html += sec('Identity', 'identity');
  html += '<div class="gx-ed-field" data-tooltip="Display name for labels &amp; Spoogle Search"><label>Name</label><input class="gx-ed-input" data-field="name" value="' + (body.name || '').replace(/"/g, '&quot;') + '"></div>';
  html += '<div class="gx-ed-field" data-tooltip="Informative descriptor shown below the name"><label>Subtitle</label><input class="gx-ed-input" data-field="subtitle" value="' + (body.subtitle || '').replace(/"/g, '&quot;') + '" placeholder="optional descriptor"></div>';

  /* Type dropdown */
  html += '<div class="gx-ed-field" data-tooltip="Body classification; changing type resets subtype"><label>Type</label>';
  html += edSelect('type', body.type, ['star', 'planet', 'moon', 'station', 'belt', 'megastructure', 'anomaly', 'nebula'], false);
  html += '</div>';

  /* Subtype dropdown — hidden for stars (MK classification handles it), disabled for anomaly/nebula */
  if (body.type !== 'star') {
    html += '<div class="gx-ed-field" data-tooltip="Determines visual appearance &amp; slider parameters"><label>Subtype</label>';
    html += edSelect('subtype', body.subtype || '', [''].concat(subtypeList), isUneditable);
    html += '</div>';
  }

  html += '<div class="gx-ed-field" data-tooltip="Safety/vibe rating; no visuals, but stations inherit as subtitle"><label>Class</label>';
  /* Class lives in two places historically; stats.class is the newer home */
  html += edSelect('stats.class', stats.class ?? body.class ?? '', [''].concat(CLASSES), false);
  html += '</div>';

  html += '<div class="gx-ed-field" data-tooltip="Political/corporate allegiance; sets default distant color"><label>Faction</label>';
  html += '<select class="gx-ed-select" data-field="factionId">';
  factionOpts.forEach(k => {
    const sel = k === (body.factionId || '') ? ' selected' : '';
    html += '<option value="' + k + '"' + sel + '>' + factionLabels[k] + '</option>';
  });
  html += '</select></div>';

  html += '<div class="gx-ed-field" data-tooltip="Galactic region this celestial body belongs to"><label>Zone</label>';
  html += '<select class="gx-ed-select" data-field="zoneId">';
  zoneOpts.forEach(k => {
    const sel = k === (body.zoneId || '') ? ' selected' : '';
    html += '<option value="' + k + '"' + sel + '>' + zoneLabels[k] + '</option>';
  });
  html += '</select></div>';

  /* MK Spectral Class — only for stars */
  const isStar = body.type === 'star';
  if (isStar) {
    const mkParsed = parseMKDropdown(body.spectralClass || '');
    html += '<div class="gx-ed-field" data-tooltip="Morgan-Keenan (MK) classification: Letter = temperature class (Y coldest → O hottest), Number = subclass (0 hottest → 9 coolest), Roman Numeral = luminosity (I supergiant → V main sequence)"><label>Spectral</label>';
    html += '<div class="gx-ed-mk-row">';
    html += '<select class="gx-ed-select gx-ed-mk-type" id="ed-mk-type">';
    html += '<option value="">--</option>';
    MK_TYPES.forEach(t => {
      html += '<option value="' + t.value + '"' + (t.value === mkParsed.type ? ' selected' : '') + '>' + t.label + '</option>';
    });
    html += '</select>';
    html += '<select class="gx-ed-select gx-ed-mk-sub" id="ed-mk-sub">';
    html += mkSubclassOptions(mkParsed.type, mkParsed.sub);
    html += '</select>';
    html += '<select class="gx-ed-select gx-ed-mk-lum" id="ed-mk-lum">';
    html += mkLumOptions(mkParsed.type, mkParsed.lum);
    html += '</select>';
    html += '</div></div>';
  }

  html += secEnd;

  const meta = editorSystems?.getBodyMeta(id);

  /* AUTO button helper — always visible, bright when auto, dim when overridden */
  function autoBtn(elId, isAuto) {
    return '<button class="gx-ed-auto-btn' + (isAuto ? ' active' : '') + '" id="' + elId + '-auto">AUTO</button>';
  }

  /* Orbit section — hidden for free-floating bodies (depth 0, no parent) */
  const hasOrbit = body.parentId || (meta && meta.depth > 0);
  if (hasOrbit) {
    html += sec('Orbit', 'orbit');

    /* Parent body — auto-suggest text input */
    const parentName = body.parentId ? (galaxyData.bodies[body.parentId]?.name || body.parentId) : '';
    html += '<div class="gx-ed-field" data-tooltip="Body this one orbits; empty = top-level/free-floating"><label>Parent</label>';
    html += '<div style="position:relative;flex:1;min-width:0">';
    html += '<input class="gx-ed-input" id="ed-parent-input" value="' + parentName.replace(/"/g, '&quot;') + '" placeholder="none (root body)">';
    html += '<div class="gx-ed-autocomplete" id="ed-parent-autocomplete"></div>';
    html += '</div></div>';

    const computedA = meta?.orbital?.a;
    const computedIncl = meta?.orbital?.incl != null ? +(meta.orbital.incl * 180 / Math.PI).toFixed(1) : null;
    const computedE = meta?.orbital?.e != null ? +meta.orbital.e.toFixed(2) : null;

    const computedOrder = meta?.computedOrder;
    const orderIsAuto = body.orbital?.order == null;
    const orderDisplay = orderIsAuto ? (computedOrder ?? '') : body.orbital.order;
    html += '<div class="gx-ed-field" data-tooltip="Position in orbital sequence; lower = closer to parent"><label>Order</label>';
    html += '<input type="number" class="gx-ed-number" id="ed-orbit-order" min="1" value="' + orderDisplay + '">';
    if (computedOrder != null) html += autoBtn('ed-orbit-order', orderIsAuto);
    html += '</div>';

    /* Orbital sliders with AUTO buttons */
    function orbSlider(label, elId, explicit, computed, min, max, step, fmt, tip) {
      const isAuto = explicit == null;
      const val = isAuto ? (computed ?? (max - min) / 2) : explicit;
      html += '<div class="gx-ed-field"' + (tip ? ' data-tooltip="' + tip.replace(/"/g, '&quot;') + '"' : '') + '><label>' + label + '</label>';
      html += '<div class="gx-ed-slider-wrap">';
      html += '<input type="range" class="gx-ed-slider" id="' + elId + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '">';
      html += '<span class="gx-ed-slider-val" id="' + elId + '-val">' + fmt(val) + '</span>';
      html += autoBtn(elId, isAuto);
      html += '</div></div>';
    }
    orbSlider('Distance', 'ed-orbit-radius', body.orbital?.a, computedA, 0, 60, 0.1,
      v => (+v).toFixed(1), 'Orbital radius in map units (1u = 69ly)');
    orbSlider('Eccentricity', 'ed-orbit-ecc', body.orbital?.e, computedE, 0, 0.99, 0.01,
      v => (+v).toFixed(2), 'Orbit shape; 0 = circle, 0.99 = silly ellipse');
    orbSlider('Tilt', 'ed-orbit-incl', body.orbital?.incl, computedIncl, 0, 180, 1,
      v => Math.round(v) + '\u00B0', 'Incline of orbital plane relative to parent');
    /* Speed slider — inverted: low period = fast, slider left = slow, right = fast */
    const computedPeriod = meta?.orbital?.period ?? 60;
    const explicitPeriod = body.orbital?.period;
    const speedVal = explicitPeriod ?? computedPeriod;
    const speedIsAuto = explicitPeriod == null;
    const fmtSpeed = v => {
      if (v <= 5) return 'Dizzying';
      if (v >= 200) return 'Sluggish';
      return '';
    };
    html += '<div class="gx-ed-field" data-tooltip="How fast the sucker goes round \'n\' round"><label>Rev. Speed</label>';
    html += '<div class="gx-ed-slider-wrap">';
    html += '<input type="range" class="gx-ed-slider" id="ed-orbit-speed" min="5" max="200" step="1" value="' + (205 - speedVal) + '">';
    html += '<span class="gx-ed-slider-val" id="ed-orbit-speed-val">' + (fmtSpeed(speedVal) || '') + '</span>';
    html += autoBtn('ed-orbit-speed', speedIsAuto);
    html += '</div></div>';

    html += secEnd;
  }

  /* Visuals section */
  html += sec('Visuals', 'visuals');

  /* Size slider — hidden for stars (they use MK spectral radius) */
  if (!isStar) {
    html += '<div class="gx-ed-field" data-tooltip="Display scale from XXXS\u2013XXXL"><label>Size</label>';
    html += '<div class="gx-ed-slider-wrap">';
    html += '<input type="range" class="gx-ed-slider" data-field="stats.size" min="0" max="8" step="1" value="' + (sizeIdx >= 0 ? sizeIdx : 4) + '">';
    html += '<span class="gx-ed-size-label">' + (sizeIdx >= 0 ? SIZE_NAMES[sizeIdx] : 'M') + '</span>';
    html += '</div></div>';
  }

  /* Axial tilt — body's spin axis, not orbital (stars don't have per-body spin yet) */
  if (!isStar) {
    const axialTilt = body.axialTilt;
    const computedTilt = meta?.computedAxialTilt;
    const tiltIsAuto = axialTilt == null;
    const tiltDisplay = tiltIsAuto && computedTilt != null ? computedTilt : (axialTilt ?? 0);
    html += '<div class="gx-ed-field" data-tooltip="Spin axis angle; tilts/rotates the body\'s poles"><label>Axial Tilt</label>';
    html += '<div class="gx-ed-slider-wrap">';
    html += '<input type="range" class="gx-ed-slider" id="ed-axial-tilt" min="0" max="180" step="1" value="' + tiltDisplay + '">';
    html += '<span class="gx-ed-slider-val" id="ed-axial-tilt-val">' + Math.round(tiltDisplay) + '\u00B0</span>';
    html += autoBtn('ed-axial-tilt', tiltIsAuto);
    html += '</div></div>';
  }

  /* Rot. Speed — planets/moons/stations only (stars don't have per-body spin yet) */
  if (!isStar) {
  const computedSpin = meta?.computedSpinSpeed;
  const explicitSpin = vis.spinSpeed;
  const spinIsAuto = explicitSpin == null;
  const spinDisplay = spinIsAuto ? (computedSpin ?? 0.1) : explicitSpin;
  const fmtSpin = v => {
    const n = +v;
    if (Math.abs(n) < 0.005) return 'Stopped';
    return (n > 0 ? '+' : '') + n.toFixed(2);
  };
  html += '<div class="gx-ed-field" data-tooltip="Axial spin rate; negative = reverse direction, 0 = tidally locked"><label>Rot. Speed</label>';
  html += '<div class="gx-ed-slider-wrap">';
  html += '<input type="range" class="gx-ed-slider" id="ed-spin-speed" min="-0.5" max="0.5" step="0.01" value="' + spinDisplay + '">';
  html += '<span class="gx-ed-slider-val" id="ed-spin-speed-val">' + (spinIsAuto ? '' : fmtSpin(spinDisplay)) + '</span>';
  html += autoBtn('ed-spin-speed', spinIsAuto);
  html += '</div></div>';
  }

  /* Visual parameter sliders — non-stars only */
  if (!isStar) {
    /* Visual slider helper — continuous range with label showing current value */
    function visSlider(label, elId, val, min, max, step, fmt, tip) {
      const isAuto = val == null;
      const v = isAuto ? (min + max) / 2 : val;
      const display = isAuto ? '' : fmt(v);
      html += '<div class="gx-ed-field"' + (tip ? ' data-tooltip="' + tip.replace(/"/g, '&quot;') + '"' : '') + '><label>' + label + '</label>';
      html += '<div class="gx-ed-slider-wrap">';
      html += '<input type="range" class="gx-ed-slider" id="' + elId + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + v + '">';
      html += '<span class="gx-ed-slider-val" id="' + elId + '-val">' + display + '</span>';
      html += autoBtn(elId, isAuto);
      html += '</div></div>';
    }
    const fmtPct = v => Math.round(v * 100) + '%';
    const fmtTemp = v => {
      if (v <= 0.01 || v >= 0.99) return "Don't Bother";
      const celsius = -270 + v * 1770;
      const fahr = celsius * 9 / 5 + 32;
      return celsius.toFixed(1) + '\u00B0C/' + Math.round(fahr) + '\u00B0F';
    };
    const fmtAtmo = v => (+v).toFixed(1);

    const sub = body.subtype || '';
    if (sub === 'rocky' || sub === 'ocean') {
      visSlider('Ocean Level', 'ed-ocean-level', vis.oceanLevel, 0, 1, 0.01, fmtPct,
        'Water coverage; 0 = Arrakis, 1 = Waterworld');
    }
    visSlider('Avg. Temp', 'ed-temperature', vis.temperature, 0, 1, 0.01, fmtTemp,
      'Shifts biome palette warm/cool; affects terrain color &amp; ice');
    visSlider('Atmosphere', 'ed-atmo-intensity', vis.atmosphereIntensity, 0, 2, 0.05, fmtAtmo,
      'Atmospheric glow ring brightness; 0 = no atmo, 2 = thick haze');
    visSlider('Roughness', 'ed-roughness', vis.roughness, 0, 1, 0.01, fmtPct,
      'Surface roughness; 0 = polished, 1 = matte');
    visSlider('Metalness', 'ed-metalness', vis.metalness, 0, 1, 0.01, fmtPct,
      'Metallic sheen; 0 = dirt, 1 = shiny as hell, but WARNING: high values darken the surface!');
  }

  /* Color — stars use MK-derived color (not editable), everything else gets the picker */
  const mkParsedType = isStar ? parseMKDropdown(body.spectralClass || '').type : '';
  const mkColor = mkParsedType ? (MK_DISPLAY_COLORS[mkParsedType] || '') : '';
  if (isStar) {
    const starColor = mkColor || '#aaaaaa';
    html += '<div class="gx-ed-field"><label>Color</label>';
    html += '<span class="gx-ed-color-swatch" style="background:' + starColor + '"></span>';
    html += '<span class="gx-ed-star-hex" id="ed-star-hex" title="Click to copy">' + starColor + '</span>';
    html += '<span class="gx-p-muted" style="font-size:9.5pt">(set by MK type)</span>';
    html += '</div>';
  } else {
    const hasExplicitColor = !!vis.color;
    const curColor = vis.color || '';
    const swatchStyle = curColor
      ? 'background:' + curColor
      : 'background:linear-gradient(135deg,#f00,#ff0,#0f0,#0ff,#00f,#f0f)';
    const colorLabel = curColor || 'Not Set';
    html += '<div class="gx-ed-field" data-tooltip="Base color anchor for the terrain palette"><label>Color</label>';
    html += '<div class="gx-ed-color-field" id="ed-color-toggle">';
    html += '<span class="gx-ed-color-swatch" id="ed-color-swatch" style="' + swatchStyle + '"></span>';
    html += '<span class="gx-ed-color-hex' + (hasExplicitColor ? '' : ' gx-p-muted') + '" id="ed-color-hex">' + colorLabel + '</span>';
    html += autoBtn('ed-color', !hasExplicitColor);
    html += '</div></div>';

    /* Expandable color picker */
    html += '<div class="gx-ed-color-picker" id="ed-color-picker">';
    html += '<div class="gx-ed-color-picker-inner">';
    html += '<div class="gx-ed-sv-square" id="ed-sv-square"><div class="gx-ed-sv-cursor" id="ed-sv-cursor"></div></div>';
    html += '<div class="gx-ed-hue-bar" id="ed-hue-bar"><div class="gx-ed-hue-cursor" id="ed-hue-cursor"></div></div>';
    const pickerColor = curColor || '#888888';
    html += '<div class="gx-ed-hex-row"><span class="gx-ed-hex-preview" id="ed-hex-preview" style="background:' + pickerColor + '"></span>';
    html += '<input class="gx-ed-hex-input" id="ed-hex-input" value="' + pickerColor + '" maxlength="7"></div>';
    html += '</div></div>';

    /* Atmosphere tint color — second picker */
    const atmoColor = vis.atmosphereTint || '';
    const atmoSwatchStyle = atmoColor
      ? 'background:' + atmoColor
      : 'background:linear-gradient(135deg,#88cc22,#4488ff,#cc44ff)';
    const atmoLabel = atmoColor || 'Auto';
    html += '<div class="gx-ed-field" data-tooltip="Atmosphere glow ring color override; auto-picks from subtype"><label>Atmo Tint</label>';
    html += '<div class="gx-ed-color-field" id="ed-atmo-toggle">';
    html += '<span class="gx-ed-color-swatch" id="ed-atmo-swatch" style="' + atmoSwatchStyle + '"></span>';
    html += '<span class="gx-ed-color-hex' + (atmoColor ? '' : ' gx-p-muted') + '" id="ed-atmo-hex">' + atmoLabel + '</span>';
    html += autoBtn('ed-atmo', !atmoColor);
    html += '</div></div>';
    html += '<div class="gx-ed-color-picker" id="ed-atmo-picker">';
    html += '<div class="gx-ed-color-picker-inner">';
    html += '<div class="gx-ed-sv-square" id="ed-atmo-sv"><div class="gx-ed-sv-cursor" id="ed-atmo-sv-cursor"></div></div>';
    html += '<div class="gx-ed-hue-bar" id="ed-atmo-hue"><div class="gx-ed-hue-cursor" id="ed-atmo-hue-cursor"></div></div>';
    const atmoPickerColor = atmoColor || '#88cc22';
    html += '<div class="gx-ed-hex-row"><span class="gx-ed-hex-preview" id="ed-atmo-preview" style="background:' + atmoPickerColor + '"></span>';
    html += '<input class="gx-ed-hex-input" id="ed-atmo-hex-input" value="' + atmoPickerColor + '" maxlength="7"></div>';
    html += '</div></div>';
  }

  html += secEnd;

  /* Stats section — pop/hab hidden for stars */
  if (!isStar) {
    html += sec('Stats', 'stats');
    html += '<div class="gx-ed-field"><label>Population</label><input type="number" class="gx-ed-number" data-field="stats.population" min="0" value="' + (stats.population != null ? stats.population : '') + '" placeholder="0"></div>';
    const habVal = stats.habitability ?? 0;
    html += '<div class="gx-ed-field" data-tooltip="Livability score; 0 = lethal, 100 = paradise"><label>Habitability</label>';
    html += '<div class="gx-ed-slider-wrap">';
    html += '<input type="range" class="gx-ed-slider" id="ed-habitability" min="0" max="100" step="1" value="' + habVal + '">';
    html += '<span class="gx-ed-slider-val" id="ed-habitability-val">' + habVal + '%</span>';
    html += '</div></div>';
    html += secEnd;
  }

  /* Tags section */
  html += sec('Tags', 'tags');
  html += '<div class="gx-ed-tag-wrap" id="ed-tag-wrap">';
  (body.tags || []).forEach(t => {
    html += '<span class="gx-ed-tag-pill" data-tag="' + t + '">' + t + ' <span class="gx-ed-tag-remove">x</span></span>';
  });
  html += '<span class="gx-ed-tag-add"><input class="gx-ed-tag-input" id="ed-tag-input" placeholder="+ add tag"></span>';
  html += '</div>';

  /* Checkboxes */
  html += '<div class="gx-ed-checkbox-row">';
  html += '<label><input type="checkbox" data-field="stats.toxic"' + (stats.toxic ? ' checked' : '') + '> Toxic</label>';
  html += '<label><input type="checkbox" data-field="hasFuddruckers"' + (body.hasFuddruckers ? ' checked' : '') + '> Has Fuddruckers</label>';
  html += '</div>' + secEnd;

  /* Text fields — default closed unless body has content */
  const hasText = body.description || body.notes;
  html += '<details class="gx-ed-section gx-ed-details" data-sec="text"' +
    (secOpen('text') || hasText ? ' open' : '') + '>';
  html += '<summary class="gx-ed-section-label gx-ed-summary">Text</summary>';
  html += '<div class="gx-ed-field" style="align-items:flex-start"><label style="padding-top:6px">Description</label>';
  html += '<textarea class="gx-ed-textarea" data-field="description" rows="4">' + (body.description || '') + '</textarea></div>';
  html += '<div class="gx-ed-field" style="align-items:flex-start"><label style="padding-top:6px">Notes</label>';
  html += '<textarea class="gx-ed-textarea" data-field="notes" rows="3">' + (body.notes || '') + '</textarea></div>';
  html += '</details>';

  /* Actions */
  html += '<div class="gx-ed-actions">';
  html += '<button class="gx-ed-btn gx-ed-btn-danger" id="ed-delete">Delete</button>';
  html += '<span class="spacer"></span>';
  html += '<button class="gx-ed-btn" id="ed-revert">Revert</button>';
  html += '</div>';

  return html;
}

/* Build nothing-selected state for editor mode */
function buildEditorEmpty() {
  const bodyCount = Object.keys(galaxyData.bodies).length;
  const factionCount = Object.keys(galaxyData.factions).length;
  let html = '<div class="gx-ed-empty">';
  html += '<div class="gx-ed-empty-stat">' + bodyCount + ' bodies</div>';
  html += '<div class="gx-ed-empty-stat">' + factionCount + ' factions</div>';
  html += '<div style="margin:16px 0;color:var(--gx-text-dim)">Click a body to edit its properties</div>';
  html += '<div class="gx-ed-actions" style="justify-content:center;border:none;margin:0;padding:0">';
  html += '<button class="gx-ed-btn" id="ed-revert">Revert</button>';
  html += '</div></div>';
  return html;
}

/* HSL ↔ hex conversion for the color picker */
function hexToHsl(hex) {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return [h * 360, s * 100, l * 100];
}

function hslToHex(h, s, l) {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;
  if (s === 0) { r = g = b = l; }
  else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  const toHex = v => { const h = Math.round(v * 255).toString(16); return h.length === 1 ? '0' + h : h; };
  return '#' + toHex(r) + toHex(g) + toHex(b);
}

/* Wire editor field events after panel HTML is inserted */
function wireEditorEvents(id) {
  const body = galaxyData.bodies[id];
  if (!body) return;

  /* Capture undo snapshot once per edit burst (1s debounce) */
  let undoSnapshotPending = true;
  let undoDebounce = 0;
  function captureUndo() {
    if (undoSnapshotPending) { pushUndo(id); undoSnapshotPending = false; }
    clearTimeout(undoDebounce);
    undoDebounce = setTimeout(() => { undoSnapshotPending = true; }, 1000);
  }

  /* autosave() last: a storage quota throw must not take rebuildMarkers/markDirty down with it */
  const save = () => { if (editorSystems) { editorSystems.rebuildMarkers(); markDirty(); editorSystems.autosave(); } };
  /* Debounced save — writes data immediately but delays expensive rebuildMarkers for spinner hold */
  let saveTimer = 0;
  const debouncedSave = () => {
    if (!editorSystems) return;
    editorSystems.autosave();
    markDirty();
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => editorSystems.rebuildMarkers(), 150);
  };
  /* Lightweight single-body rebake — updates paramsCache then rebuilds markers to pick up new sizes */
  const rebakeVisuals = () => { if (editorSystems) scheduleRebake(id); };

  /* Star hex — click to copy */
  const starHex = document.getElementById('ed-star-hex');
  if (starHex) {
    starHex.addEventListener('click', () => {
      navigator.clipboard.writeText(starHex.textContent).then(() => {
        const orig = starHex.textContent;
        starHex.textContent = 'Copied!';
        setTimeout(() => { starHex.textContent = orig; }, 1200);
      });
    });
  }

  /* Text + select fields */
  document.querySelectorAll('.gx-ed-input, .gx-ed-select, .gx-ed-textarea, .gx-ed-number').forEach(el => {
    const field = el.dataset.field;
    if (!field) return;
    el.addEventListener('input', () => {
      captureUndo();
      let val = el.value;
      if (el.type === 'number') val = val === '' ? undefined : Number(val);

      /* Write to the correct nested path */
      if (field.startsWith('stats.')) {
        body.stats = body.stats || {};
        const key = field.slice(6);
        if (val === undefined || val === '') delete body.stats[key];
        else body.stats[key] = val;
        /* Station subtitles read the top-level `class`; keep both copies in step */
        if (key === 'class') {
          if (val === undefined || val === '') delete body.class;
          else body.class = val;
        }
      } else if (field === 'factionId' || field === 'zoneId') {
        body[field] = val || null;
      } else if (field === 'name') {
        if (!val) return;
        body.name = val;
      } else {
        body[field] = (field === 'description' || field === 'notes' || field === 'subtitle') ? val : (val || '');
      }
      /* Textareas (description/notes) defer save to blur — no visible UI to update mid-type */
      if (el.tagName === 'TEXTAREA') {
        if (editorSystems) { editorSystems.autosave(); markDirty(); }
      } else if (el.type === 'number') debouncedSave();
      else save();

      /* Live-update header for identity fields */
      if (field === 'name' || field === 'subtitle' || field === 'type' || field === 'subtype') {
        updatePanelHeader(body);
      }

      /* Trigger atlas rebake for visual-affecting fields */
      if (field === 'type' || field === 'subtype') rebakeVisuals();

      /* Update subtype dropdown when type changes — clear stale subtype from data model */
      if (field === 'type') {
        const subSel = document.querySelector('[data-field="subtype"]');
        if (subSel) {
          const isLocked = val === 'anomaly' || val === 'nebula';
          subSel.disabled = isLocked;
          const newList = SUBTYPES[val] || [];
          subSel.innerHTML = '<option value="">None</option>' +
            newList.map(s => '<option value="' + s + '">' + s + '</option>').join('');
          body.subtype = '';
          save();
        }
      }
    });
    /* Full rebuild on textarea blur — deferred during typing to avoid hitching */
    if (el.tagName === 'TEXTAREA') {
      el.addEventListener('blur', () => save());
    }
  });

  /* MK spectral class cascading dropdowns */
  const mkType = document.getElementById('ed-mk-type');
  const mkSub = document.getElementById('ed-mk-sub');
  const mkLum = document.getElementById('ed-mk-lum');
  if (mkType && mkSub && mkLum) {
    function applyMK() {
      captureUndo();
      body.spectralClass = assembleMK(mkType.value, mkSub.value, mkLum.value);
      save();
      rebakeVisuals();
      updatePanelHeader(body);
    }
    mkType.addEventListener('change', () => {
      mkSub.innerHTML = mkSubclassOptions(mkType.value, '');
      mkLum.innerHTML = mkLumOptions(mkType.value, '');
      mkSub.disabled = !MK_HAS_SUBCLASS.has(mkType.value);
      mkLum.disabled = !MK_HAS_LUMINOSITY.has(mkType.value);
      applyMK();
    });
    mkSub.addEventListener('change', applyMK);
    mkLum.addEventListener('change', applyMK);
  }

  /* Size slider */
  const slider = document.querySelector('[data-field="stats.size"]');
  const sizeLabel = document.querySelector('.gx-ed-size-label');
  if (slider) {
    slider.addEventListener('input', () => {
      captureUndo();
      const idx = parseInt(slider.value, 10);
      const name = SIZE_NAMES[idx];
      if (sizeLabel) sizeLabel.textContent = name;
      body.stats = body.stats || {};
      body.stats.size = name;
      save();
      rebakeVisuals();
    });
  }

  /* Visual parameter sliders — write to body.visual, debounce rebake */
  function wireVisSlider(elId, key, parser, fmt) {
    const el = document.getElementById(elId);
    if (!el) return;
    const valLabel = document.getElementById(elId + '-val');
    const autoEl = document.getElementById(elId + '-auto');
    el.addEventListener('input', () => {
      captureUndo();
      const val = parser(el.value);
      body.visual = body.visual || {};
      body.visual[key] = val;
      if (valLabel) valLabel.textContent = fmt(val);
      if (autoEl) autoEl.classList.remove('active');
      if (editorSystems) { editorSystems.autosave(); markDirty(); }
      rebakeVisuals();
    });
    if (autoEl) autoEl.addEventListener('click', () => {
      captureUndo();
      if (body.visual) delete body.visual[key];
      autoEl.classList.add('active');
      if (valLabel) valLabel.textContent = '';
      if (editorSystems) { editorSystems.autosave(); markDirty(); }
      rebakeVisuals();
      /* Re-render panel to pick up new computed defaults */
      setTimeout(() => { if (selectedId === id) selectBody(id); }, 120);
    });
  }
  const fmtPct = v => Math.round(v * 100) + '%';
  const fmtTemp = v => {
    if (v <= 0.01 || v >= 0.99) return "Don't Bother";
    const celsius = -270 + v * 1770;
    const fahr = celsius * 9 / 5 + 32;
    return celsius.toFixed(1) + '\u00B0C/' + Math.round(fahr) + '\u00B0F';
  };
  wireVisSlider('ed-ocean-level', 'oceanLevel', parseFloat, fmtPct);
  wireVisSlider('ed-temperature', 'temperature', parseFloat, fmtTemp);
  wireVisSlider('ed-atmo-intensity', 'atmosphereIntensity', parseFloat, v => (+v).toFixed(1));
  wireVisSlider('ed-roughness', 'roughness', parseFloat, fmtPct);
  wireVisSlider('ed-metalness', 'metalness', parseFloat, fmtPct);

  /* Checkboxes */
  document.querySelectorAll('.gx-ed-checkbox-row input[type="checkbox"]').forEach(cb => {
    const field = cb.dataset.field;
    if (!field) return;
    cb.addEventListener('change', () => {
      captureUndo();
      if (field.startsWith('stats.')) {
        body.stats = body.stats || {};
        body.stats[field.slice(6)] = cb.checked;
      } else {
        body[field] = cb.checked;
      }
      save();
      if (field === 'stats.toxic') updatePanelHeader(body);
    });
  });

  /* Color picker toggle */
  const colorToggle = document.getElementById('ed-color-toggle');
  const colorPicker = document.getElementById('ed-color-picker');
  if (colorToggle && colorPicker) {
    colorPickerOpen = false;
    colorToggle.addEventListener('click', () => {
      colorPickerOpen = !colorPickerOpen;
      colorPicker.classList.toggle('open', colorPickerOpen);
      if (colorPickerOpen) initColorPicker(body, id, null, captureUndo);
    });
  }

  /* Color AUTO button */
  const colorAutoEl = document.getElementById('ed-color-auto');
  if (colorAutoEl) {
    colorAutoEl.addEventListener('click', (e) => {
      e.stopPropagation();
      captureUndo();
      if (body.visual) delete body.visual.color;
      colorAutoEl.classList.add('active');
      if (editorSystems) { editorSystems.autosave(); markDirty(); }
      rebakeVisuals();
      setTimeout(() => { if (selectedId === id) selectBody(id); }, 120);
    });
  }

  /* Atmosphere tint picker toggle */
  const atmoToggle = document.getElementById('ed-atmo-toggle');
  const atmoPicker = document.getElementById('ed-atmo-picker');
  let atmoPickerOpen = false;
  if (atmoToggle && atmoPicker) {
    atmoToggle.addEventListener('click', () => {
      atmoPickerOpen = !atmoPickerOpen;
      atmoPicker.classList.toggle('open', atmoPickerOpen);
      if (atmoPickerOpen) initColorPicker(body, id, {
        key: 'atmosphereTint',
        svId: 'ed-atmo-sv', svCursorId: 'ed-atmo-sv-cursor',
        hueId: 'ed-atmo-hue', hueCursorId: 'ed-atmo-hue-cursor',
        hexInputId: 'ed-atmo-hex-input', hexPreviewId: 'ed-atmo-preview',
        swatchId: 'ed-atmo-swatch', hexLabelId: 'ed-atmo-hex',
      }, captureUndo);
    });
  }

  /* Atmo Tint AUTO button */
  const atmoAutoEl = document.getElementById('ed-atmo-auto');
  if (atmoAutoEl) {
    atmoAutoEl.addEventListener('click', (e) => {
      e.stopPropagation();
      captureUndo();
      if (body.visual) delete body.visual.atmosphereTint;
      atmoAutoEl.classList.add('active');
      if (editorSystems) { editorSystems.autosave(); markDirty(); }
      rebakeVisuals();
      setTimeout(() => { if (selectedId === id) selectBody(id); }, 120);
    });
  }

  /* Tag system */
  wireTagEditor(body, id);

  /* Parent body auto-suggest */
  wireParentEditor(body, id);

  const orderInput = document.getElementById('ed-orbit-order');
  if (orderInput) {
    const orderAutoEl = document.getElementById('ed-orbit-order-auto');
    orderInput.addEventListener('input', () => {
      captureUndo();
      const val = orderInput.value === '' ? undefined : parseInt(orderInput.value, 10);
      body.orbital = body.orbital || {};
      if (val === undefined) delete body.orbital.order;
      else body.orbital.order = Math.max(1, Math.min(99, val));
      if (orderAutoEl) orderAutoEl.classList.remove('active');
      debouncedSave();
    });
    if (orderAutoEl) orderAutoEl.addEventListener('click', () => {
      captureUndo();
      delete (body.orbital || {}).order;
      orderAutoEl.classList.add('active');
      const co = editorSystems?.getBodyMeta(id)?.computedOrder;
      orderInput.value = co ?? '';
      debouncedSave();
    });
  }

  /* Orbital sliders — Distance, Eccentricity, Tilt */
  /* Wire orbital slider + AUTO button pair */
  function wireOrbSlider(elId, key, parser, fmt, isAngle) {
    const el = document.getElementById(elId);
    if (!el) return;
    const valLabel = document.getElementById(elId + '-val');
    const autoEl = document.getElementById(elId + '-auto');
    el.addEventListener('input', () => {
      captureUndo();
      const val = parser(el.value);
      body.orbital = body.orbital || {};
      body.orbital[key] = val;
      if (valLabel) valLabel.textContent = fmt(val);
      if (autoEl) autoEl.classList.remove('active');
      debouncedSave();
    });
    if (autoEl) autoEl.addEventListener('click', () => {
      captureUndo();
      delete (body.orbital || {})[key];
      autoEl.classList.add('active');
      /* Revert slider to computed value */
      const m = editorSystems?.getBodyMeta(id);
      if (m?.orbital?.[key] != null) {
        const raw = m.orbital[key];
        const display = isAngle ? +(raw * 180 / Math.PI).toFixed(1) : +raw.toFixed(2);
        el.value = display;
        if (valLabel) valLabel.textContent = fmt(display);
      }
      debouncedSave();
    });
  }
  wireOrbSlider('ed-orbit-radius', 'a', parseFloat, v => (+v).toFixed(1));
  wireOrbSlider('ed-orbit-ecc', 'e', parseFloat, v => (+v).toFixed(2));
  wireOrbSlider('ed-orbit-incl', 'incl', parseFloat, v => Math.round(v) + '\u00B0', true);

  /* Habitability slider */
  const habSlider = document.getElementById('ed-habitability');
  if (habSlider) {
    const habLabel = document.getElementById('ed-habitability-val');
    habSlider.addEventListener('input', () => {
      captureUndo();
      const val = parseInt(habSlider.value, 10);
      body.stats = body.stats || {};
      body.stats.habitability = val;
      if (habLabel) habLabel.textContent = val + '%';
      debouncedSave();
    });
  }
  /* Speed slider — inverted period */
  const speedSlider = document.getElementById('ed-orbit-speed');
  if (speedSlider) {
    const speedLabel = document.getElementById('ed-orbit-speed-val');
    const fmtSpd = v => {
      if (v <= 5) return 'Dizzying';
      if (v >= 200) return 'Sluggish';
      return '';
    };
    const speedAuto = document.getElementById('ed-orbit-speed-auto');
    speedSlider.addEventListener('input', () => {
      captureUndo();
      const period = 205 - parseInt(speedSlider.value, 10);
      body.orbital = body.orbital || {};
      body.orbital.period = period;
      if (speedLabel) speedLabel.textContent = fmtSpd(period) || '';
      if (speedAuto) speedAuto.classList.remove('active');
      debouncedSave();
    });
    if (speedAuto) speedAuto.addEventListener('click', () => {
      captureUndo();
      delete (body.orbital || {}).period;
      speedAuto.classList.add('active');
      const m = editorSystems?.getBodyMeta(id);
      const cp = m?.orbital?.period ?? 60;
      speedSlider.value = 205 - cp;
      if (speedLabel) speedLabel.textContent = fmtSpd(cp) || '';
      debouncedSave();
    });
  }

  /* Axial tilt slider — body-level property. Rebakes visuals since it affects spin. */
  const tiltSlider = document.getElementById('ed-axial-tilt');
  if (tiltSlider) {
    const tiltLabel = document.getElementById('ed-axial-tilt-val');
    const tiltAutoEl = document.getElementById('ed-axial-tilt-auto');
    tiltSlider.addEventListener('input', () => {
      captureUndo();
      const val = parseFloat(tiltSlider.value);
      body.axialTilt = val;
      if (tiltLabel) tiltLabel.textContent = Math.round(val) + '\u00B0';
      if (tiltAutoEl) tiltAutoEl.classList.remove('active');
      if (editorSystems) { editorSystems.autosave(); markDirty(); }
      rebakeVisuals();
    });
    if (tiltAutoEl) tiltAutoEl.addEventListener('click', () => {
      captureUndo();
      delete body.axialTilt;
      tiltAutoEl.classList.add('active');
      const ct = editorSystems?.getBodyMeta(id)?.computedAxialTilt ?? 0;
      tiltSlider.value = ct;
      if (tiltLabel) tiltLabel.textContent = Math.round(ct) + '\u00B0';
      if (editorSystems) { editorSystems.autosave(); markDirty(); }
      rebakeVisuals();
    });
  }

  /* Rot. Speed slider — stored in body.visual.spinSpeed, rebakes to update spin */
  const spinSlider = document.getElementById('ed-spin-speed');
  if (spinSlider) {
    const spinLabel = document.getElementById('ed-spin-speed-val');
    const spinAutoEl = document.getElementById('ed-spin-speed-auto');
    const fmtSpinEv = v => {
      const n = +v;
      if (Math.abs(n) < 0.005) return 'Stopped';
      return (n > 0 ? '+' : '') + n.toFixed(2);
    };
    spinSlider.addEventListener('input', () => {
      captureUndo();
      body.visual = body.visual || {};
      body.visual.spinSpeed = parseFloat(spinSlider.value);
      if (spinLabel) spinLabel.textContent = fmtSpinEv(spinSlider.value);
      if (spinAutoEl) spinAutoEl.classList.remove('active');
      if (editorSystems) { editorSystems.autosave(); markDirty(); }
      rebakeVisuals();
    });
    if (spinAutoEl) spinAutoEl.addEventListener('click', () => {
      captureUndo();
      if (body.visual) delete body.visual.spinSpeed;
      spinAutoEl.classList.add('active');
      const cs = editorSystems?.getBodyMeta(id)?.computedSpinSpeed ?? 0.1;
      spinSlider.value = cs;
      if (spinLabel) spinLabel.textContent = '';
      if (editorSystems) { editorSystems.autosave(); markDirty(); }
      rebakeVisuals();
    });
  }

  /* Delete button */
  const delBtn = document.getElementById('ed-delete');
  if (delBtn) {
    let confirming = false;
    delBtn.addEventListener('click', () => {
      if (!confirming) {
        confirming = true;
        delBtn.textContent = 'Really?';
        delBtn.classList.add('confirming');
        clearTimeout(deleteTimer);
        deleteTimer = setTimeout(() => {
          confirming = false;
          delBtn.textContent = 'Delete';
          delBtn.classList.remove('confirming');
        }, 3000);
      } else {
        clearTimeout(deleteTimer);
        /* Direct push, not captureUndo(): a delete must snapshot even mid-edit-burst */
        if (editorSystems) pushUndoRemoved(editorSystems.removeBody(id));
        deselectBody();
      }
    });
  }

  const revBtn = document.getElementById('ed-revert');
  if (revBtn) revBtn.addEventListener('click', () => {
    if (!confirm('Revert all changes to the last saved version?')) return;
    if (editorSystems) {
      editorSystems.revertToSaved();
      if (selectedId) selectBody(selectedId);
    }
  });
}

/* Color picker interaction — cfg overrides element IDs and visual key for reuse (atmo tint) */
function initColorPicker(body, bodyId, cfg, onBeforeEdit) {
  const key = cfg?.key || 'color';
  const svSquare = document.getElementById(cfg?.svId || 'ed-sv-square');
  const svCursor = document.getElementById(cfg?.svCursorId || 'ed-sv-cursor');
  const hueBar = document.getElementById(cfg?.hueId || 'ed-hue-bar');
  const hueCursor = document.getElementById(cfg?.hueCursorId || 'ed-hue-cursor');
  const hexInput = document.getElementById(cfg?.hexInputId || 'ed-hex-input');
  const hexPreview = document.getElementById(cfg?.hexPreviewId || 'ed-hex-preview');
  const swatch = document.getElementById(cfg?.swatchId || 'ed-color-swatch');
  const hexLabel = document.getElementById(cfg?.hexLabelId || 'ed-color-hex');
  if (!svSquare || !hueBar) return;

  const mkT = !cfg && body.type === 'star' ? parseMKDropdown(body.spectralClass || '').type : '';
  const curColor = body.visual?.[key] || (mkT && MK_DISPLAY_COLORS[mkT]) || '#888888';
  let [hue, sat, light] = hexToHsl(curColor);
  /* Convert HSL to HSV for the SV square */
  let sv_s, sv_v;
  { const l = light / 100; const s = sat / 100;
    sv_v = l + s * Math.min(l, 1 - l);
    sv_s = sv_v === 0 ? 0 : 2 * (1 - l / sv_v);
  }

  function updateSvBackground() {
    svSquare.style.background = 'linear-gradient(to top, #000, transparent), ' +
      'linear-gradient(to right, #fff, hsl(' + hue + ',100%,50%))';
  }

  function applyColor() {
    if (onBeforeEdit) onBeforeEdit();
    /* Convert HSV back to HSL */
    const l = sv_v * (1 - sv_s / 2);
    const s = (l === 0 || l === 1) ? 0 : (sv_v - l) / Math.min(l, 1 - l);
    const hex = hslToHex(hue, s * 100, l * 100);
    if (swatch) swatch.style.background = hex;
    if (hexLabel) hexLabel.textContent = hex;
    if (hexPreview) hexPreview.style.background = hex;
    if (hexInput) hexInput.value = hex;

    body.visual = body.visual || {};
    body.visual[key] = hex;
    if (editorSystems) {
      editorSystems.rebuildMarkers();
      markDirty();
      editorSystems.autosave();
      scheduleRebake(bodyId);
    }
  }

  updateSvBackground();
  /* Position cursors */
  hueCursor.style.left = (hue / 360 * 100) + '%';
  svCursor.style.left = (sv_s * 100) + '%';
  svCursor.style.top = ((1 - sv_v) * 100) + '%';

  /* SV square drag */
  function onSvMove(e) {
    const rect = svSquare.getBoundingClientRect();
    sv_s = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    sv_v = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height));
    svCursor.style.left = (sv_s * 100) + '%';
    svCursor.style.top = ((1 - sv_v) * 100) + '%';
    applyColor();
  }
  svSquare.onpointerdown = (e) => {
    e.preventDefault();
    svSquare.setPointerCapture(e.pointerId);
    onSvMove(e);
    svSquare.onpointermove = onSvMove;
    svSquare.onpointerup = () => { svSquare.onpointermove = null; };
  };

  /* Hue bar drag */
  function onHueMove(e) {
    const rect = hueBar.getBoundingClientRect();
    hue = Math.max(0, Math.min(360, (e.clientX - rect.left) / rect.width * 360));
    hueCursor.style.left = (hue / 360 * 100) + '%';
    updateSvBackground();
    applyColor();
  }
  hueBar.onpointerdown = (e) => {
    e.preventDefault();
    hueBar.setPointerCapture(e.pointerId);
    onHueMove(e);
    hueBar.onpointermove = onHueMove;
    hueBar.onpointerup = () => { hueBar.onpointermove = null; };
  };

  /* Hex input */
  if (hexInput) {
    hexInput.addEventListener('change', () => {
      let val = hexInput.value.trim();
      if (!val.startsWith('#')) val = '#' + val;
      if (/^#[0-9a-fA-F]{6}$/.test(val)) {
        [hue, sat, light] = hexToHsl(val);
        const l = light / 100; const s = sat / 100;
        sv_v = l + s * Math.min(l, 1 - l);
        sv_s = sv_v === 0 ? 0 : 2 * (1 - l / sv_v);
        hueCursor.style.left = (hue / 360 * 100) + '%';
        svCursor.style.left = (sv_s * 100) + '%';
        svCursor.style.top = ((1 - sv_v) * 100) + '%';
        updateSvBackground();
        applyColor();
      }
    });
  }
}

/* Tag autocomplete system */
/* Floating autocomplete — appended to body to escape overflow:auto clipping */
let floatingDropdown = null;
function getFloatingDropdown() {
  if (!floatingDropdown) {
    floatingDropdown = document.createElement('div');
    floatingDropdown.className = 'gx-ed-autocomplete';
    document.body.appendChild(floatingDropdown);
  }
  return floatingDropdown;
}

function positionDropdown(input) {
  const dd = getFloatingDropdown();
  const rect = input.getBoundingClientRect();
  dd.style.position = 'fixed';
  dd.style.left = rect.left + 'px';
  dd.style.top = rect.bottom + 2 + 'px';
  dd.style.width = Math.max(rect.width, 160) + 'px';
}

function wireTagEditor(body, id) {
  const wrap = document.getElementById('ed-tag-wrap');
  const input = document.getElementById('ed-tag-input');
  if (!wrap || !input) return;
  const dropdown = getFloatingDropdown();

  const save = () => { if (editorSystems) { editorSystems.rebuildMarkers(); markDirty(); editorSystems.autosave(); } };

  function closeDropdown() { dropdown.classList.remove('open'); dropdown.innerHTML = ''; }

  function addTag(tag) {
    tag = tag.trim().toLowerCase();
    if (!tag) return;
    body.tags = body.tags || [];
    if (body.tags.includes(tag)) return;
    pushUndo(id);
    body.tags.push(tag);
    save();
    const pill = document.createElement('span');
    pill.className = 'gx-ed-tag-pill';
    pill.dataset.tag = tag;
    pill.innerHTML = tag + ' <span class="gx-ed-tag-remove">x</span>';
    pill.querySelector('.gx-ed-tag-remove').addEventListener('click', () => removeTag(tag, pill));
    wrap.insertBefore(pill, wrap.querySelector('.gx-ed-tag-add'));
    input.value = '';
    closeDropdown();
  }

  function removeTag(tag, pill) {
    if (!body.tags) return;
    pushUndo(id);
    body.tags = body.tags.filter(t => t !== tag);
    save();
    pill.remove();
  }

  /* Wire existing remove buttons */
  wrap.querySelectorAll('.gx-ed-tag-remove').forEach(btn => {
    const pill = btn.closest('.gx-ed-tag-pill');
    btn.addEventListener('click', () => removeTag(pill.dataset.tag, pill));
  });

  /* Show matching tags — called on both focus and input */
  function showTagSuggestions() {
    const val = input.value.trim().toLowerCase();
    const allTags = getAllTags();
    const existing = new Set(body.tags || []);
    const matches = val
      ? allTags.filter(t => t.includes(val) && !existing.has(t))
      : allTags.filter(t => !existing.has(t));
    if (matches.length === 0) { closeDropdown(); return; }

    dropdown.innerHTML = '';
    matches.forEach(tag => {
      const item = document.createElement('div');
      item.className = 'gx-ed-autocomplete-item';
      item.textContent = tag;
      item.addEventListener('mousedown', (e) => { e.preventDefault(); addTag(tag); });
      dropdown.appendChild(item);
    });
    positionDropdown(input);
    dropdown.classList.add('open');
  }

  input.addEventListener('focus', showTagSuggestions);
  input.addEventListener('input', showTagSuggestions);

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input.value);
    } else if (e.key === 'Escape') {
      closeDropdown();
    }
  });

  input.addEventListener('blur', () => { setTimeout(closeDropdown, 150); });
}

/* Parent body auto-suggest — floating dropdown like tag autocomplete */
let parentDropdown = null;
function getParentDropdown() {
  if (!parentDropdown) {
    parentDropdown = document.createElement('div');
    parentDropdown.className = 'gx-ed-autocomplete';
    document.body.appendChild(parentDropdown);
  }
  return parentDropdown;
}

function wireParentEditor(body, id) {
  const input = document.getElementById('ed-parent-input');
  if (!input) return;
  const dropdown = getParentDropdown();
  const save = () => { if (editorSystems) { editorSystems.rebuildMarkers(); markDirty(); editorSystems.autosave(); } };

  function closeDD() { dropdown.classList.remove('open'); dropdown.innerHTML = ''; }

  /* A parent that is this body or one of its descendants makes a cycle, which poisons every root-walk */
  function wouldCycle(candidateId) {
    let walk = candidateId, guard = 0;
    while (walk && guard++ < 32) {
      if (walk === id) return true;
      walk = galaxyData.bodies[walk]?.parentId || null;
    }
    return false;
  }

  function setParent(newParentId) {
    if (newParentId && wouldCycle(newParentId)) {
      input.value = galaxyData.bodies[body.parentId]?.name || '';
      closeDD();
      return;
    }
    pushUndo(id);
    body.parentId = newParentId || null;
    if (!newParentId) body.position = body.position || { x: 0, y: 0, z: 0 };
    save();
    closeDD();
  }

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { closeDD(); return; }

    /* Search all bodies except self — sorted by name match quality */
    const matches = [];
    for (const [bid, b] of Object.entries(galaxyData.bodies)) {
      if (bid === id) continue;
      const name = b.name.toLowerCase();
      if (name.includes(q)) matches.push({ id: bid, name: b.name, type: b.type, exact: name === q });
    }
    matches.sort((a, b) => (b.exact ? 1 : 0) - (a.exact ? 1 : 0) || a.name.localeCompare(b.name));

    if (matches.length === 0) { closeDD(); return; }

    dropdown.innerHTML = '';
    matches.slice(0, 15).forEach(m => {
      const item = document.createElement('div');
      item.className = 'gx-ed-autocomplete-item';
      item.innerHTML = m.name + ' <span style="color:var(--gx-text-muted);font-size:9.5pt">' + m.type + '</span>';
      item.addEventListener('mousedown', (e) => {
        e.preventDefault();
        input.value = m.name;
        setParent(m.id);
      });
      dropdown.appendChild(item);
    });

    /* "None" option to make it a root body */
    const noneItem = document.createElement('div');
    noneItem.className = 'gx-ed-autocomplete-item';
    noneItem.innerHTML = '<span style="color:var(--gx-text-muted)">None (root body)</span>';
    noneItem.addEventListener('mousedown', (e) => {
      e.preventDefault();
      input.value = '';
      setParent(null);
    });
    dropdown.appendChild(noneItem);

    const rect = input.getBoundingClientRect();
    dropdown.style.position = 'fixed';
    dropdown.style.left = rect.left + 'px';
    dropdown.style.top = rect.bottom + 2 + 'px';
    dropdown.style.width = Math.max(rect.width, 200) + 'px';
    dropdown.classList.add('open');
  });

  input.addEventListener('blur', () => { setTimeout(closeDD, 150); });
}

function selectBody(id) {
  if (!galaxyData || !galaxyData.bodies[id]) return;
  selectedId = id;
  const body = galaxyData.bodies[id];
  const panel = document.getElementById('context-panel');
  panel.classList.add('open');
  panel.classList.toggle('gx-editor-active', editorMode);
  colorPickerOpen = false;
  if (floatingDropdown) floatingDropdown.classList.remove('open');

  map2dView?.setSelected(id);

  updatePanelHeader(body);
  document.getElementById('panel-name').oncontextmenu = (e) => { e.preventDefault(); flyToBody(id); };

  const html = editorMode ? buildEditorPanel(body, id) : buildViewPanel(body, id);
  document.getElementById('panel-body').innerHTML = html;

  /* Persist section collapse state per session */
  if (editorMode) {
    document.querySelectorAll('.gx-ed-details[data-sec]').forEach(det => {
      det.addEventListener('toggle', () => {
        sessionStorage.setItem('gx-ed-' + det.dataset.sec, det.open ? '1' : '0');
      });
    });
    wireEditorEvents(id);
    /* Update navicomputer tree (edit mode, 3D only) */
    updateNavicomputer(id);
  } else {
    /* Wire tree items + hyperlanes: L-click selects, R-click tracks */
    document.querySelectorAll('.gx-nav-item[data-id], .gx-p-lane[data-id]').forEach(el => {
      el.addEventListener('click', () => selectBody(el.dataset.id));
      el.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        selectBody(el.dataset.id);
        flyToBody(el.dataset.id);
      });
    });
    /* Hover-expand collapsed tree branches with 200ms collapse delay */
    document.querySelectorAll('.gx-nav-item[data-id]').forEach(el => {
      let collapseTimer = 0;
      const sibling = el.nextElementSibling;
      if (!sibling?.classList.contains('gx-nav-children')) return;
      const isAncestry = sibling.querySelector('.gx-nav-selected, .gx-nav-ancestor');
      el.addEventListener('mouseenter', () => { clearTimeout(collapseTimer); sibling.classList.add('open'); });
      el.addEventListener('mouseleave', () => {
        if (isAncestry) return;
        collapseTimer = setTimeout(() => sibling.classList.remove('open'), 500);
      });
      sibling.addEventListener('mouseenter', () => clearTimeout(collapseTimer));
      sibling.addEventListener('mouseleave', () => {
        if (isAncestry) return;
        collapseTimer = setTimeout(() => sibling.classList.remove('open'), 500);
      });
    });
  }
  wireTooltips();

  if (callbacks.onSelect) callbacks.onSelect(id, body);
}

function deselectBody() {
  selectedId = null;
  const panel = document.getElementById('context-panel');
  panel.classList.remove('open');
  panel.classList.remove('gx-editor-active');
  document.getElementById('panel-subtitle').textContent = '';
  map2dView?.setSelected(null);

  /* Show system index in navicomputer when nothing is selected */
  if (editorMode) updateNavicomputer(null);

  /* Show nothing-selected editor state if editor mode is on */
  if (editorMode) {
    panel.classList.add('open');
    panel.classList.add('gx-editor-active');
    document.getElementById('panel-type').textContent = '';
    document.getElementById('panel-name').textContent = 'The Known Galaxy';
    document.getElementById('panel-subtitle').textContent = '';
    document.getElementById('panel-body').innerHTML = buildEditorEmpty();
    const revBtn = document.getElementById('ed-revert');
    if (revBtn) revBtn.addEventListener('click', () => {
      if (!confirm('Revert all changes to the last saved version?')) return;
      if (editorSystems) editorSystems.revertToSaved();
    });
  }

  if (callbacks.onDeselect) callbacks.onDeselect();
}

function toggleEditorMode() {
  editorMode = !editorMode;
  lsSet('mommyship-galaxy-editor', String(editorMode));
  if (editorMode) lsSet('mommyship-galaxy-editor-ts', String(Date.now()));
  const navExport = document.getElementById('ed-export-nav');
  if (navExport) navExport.classList.toggle('visible', editorMode);
  updateControlsVisibility();
  /* Navicomputer + Galaxy Forge sync with editor mode */
  const naviPanel = document.getElementById('navicomputer-panel');
  if (naviPanel && !editorMode) naviPanel.classList.remove('open');
  const forgeTitle = document.getElementById('forge-title');
  if (forgeTitle) forgeTitle.classList.toggle('visible', editorMode);
  if (selectedId) selectBody(selectedId);
  else deselectBody();
}

/* Fly to body — dispatches to 2D or 3D */
function flyToBody(id) {
  if (viewMode === '2d') {
    map2dView?.flyTo(id);
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

function updateControlsVisibility() {
  const activeModes = new Set();
  activeModes.add(viewMode);           // '3d' or '2d'
  if (viewMode === '3d' && isTracking) activeModes.add('track');
  if (editorMode) activeModes.add('edit');

  document.querySelectorAll('#controls-popup [data-mode]').forEach(el => {
    const modes = el.getAttribute('data-mode').split(',');
    el.style.display = modes.some(m => activeModes.has(m)) ? '' : 'none';
  });
}

/* Screenshot mode — hides all UI for clean screen captures */
const screenshotBtn = document.getElementById('btn-screenshot');

function toggleScreenshot() {
  const active = document.body.classList.toggle('screenshot-active');
  screenshotBtn.classList.toggle('active', active);
}

screenshotBtn.addEventListener('click', toggleScreenshot);
document.addEventListener('keydown', (e) => {
  /* Editor toggle — works even when focused on inputs */
  if (e.ctrlKey && e.altKey && e.shiftKey && e.code === 'KeyE') {
    e.preventDefault();
    toggleEditorMode();
    return;
  }
  /* Undo/redo — works even when focused on inputs */
  if (editorMode && e.ctrlKey && e.key === 'z' && !e.shiftKey) { e.preventDefault(); editorUndo(); return; }
  if (editorMode && e.ctrlKey && (e.key === 'Z' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); editorRedo(); return; }
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  /* Photo Mode's hide list only covers 3D chrome — in 2D it half-strips the UI with no visible undo */
  if (e.key === 'F2' && viewMode === '3d') { e.preventDefault(); toggleScreenshot(); }
  /* Bare 1/2/3 only (Ctrl+2 is a browser tab switch), and never mid-Muse — 2D hides Muse's exit affordance */
  const museOn = document.getElementById('btn-muse')?.classList.contains('active');
  if (!e.ctrlKey && !e.altKey && !e.metaKey && !museOn) {
    if (e.key === '1') resetView();
    else if (e.key === '2') setViewMode('2d');
    else if (e.key === '3') setViewMode('3d');
  }
  /* Close color picker on Escape */
  if (e.key === 'Escape' && colorPickerOpen) {
    const picker = document.getElementById('ed-color-picker');
    if (picker) { picker.classList.remove('open'); colorPickerOpen = false; }
  }
});

/* Reset view — lerp back to default position */
function resetView() {
  deselectBody();
  if (viewMode === '2d') {
    map2dView?.resetView();
  } else if (callbacks.onResetView) {
    callbacks.onResetView();
  }
}

/* Panel close */
document.getElementById('panel-close').addEventListener('click', deselectBody);
document.getElementById('context-panel').addEventListener('contextmenu', e => e.preventDefault());

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
    '15,000 asteroids',
    viewMode === '2d' ? '1 galaxy' : '25 galaxies, only 1 important'
  ];
  document.getElementById('status-center').textContent = parts.join('  \u00b7  ');
}

/* View mode */
let viewMode = '3d';
const VIEW_KEY = 'mommyship-galaxy-view';

function setViewMode(mode) {
  lsSet(VIEW_KEY, mode);
  viewMode = mode;
  document.getElementById('btn-3d').classList.toggle('active', mode === '3d');
  document.getElementById('btn-2d').classList.toggle('active', mode === '2d');
  map2d.classList.toggle('active', mode === '2d');
  document.body.classList.toggle('view-2d', mode === '2d');
  map2dView?.setActive(mode === '2d');
  updateControlsVisibility();
  updateStatus();
  /* Navicomputer only in 3D edit mode */
  const naviPanel = document.getElementById('navicomputer-panel');
  if (naviPanel) {
    if (mode === '2d' || !editorMode) naviPanel.classList.remove('open');
    else if (selectedId) updateNavicomputer(selectedId);
  }

  if (callbacks.onViewChange) callbacks.onViewChange(mode);
}

document.getElementById('btn-3d').addEventListener('click', () => setViewMode('3d'));
/* Same gate as the 1/2/3 keys: 2D hides Muse's exit affordance */
document.getElementById('btn-2d').addEventListener('click', () => {
  if (document.getElementById('btn-muse')?.classList.contains('active')) return;
  setViewMode('2d');
});

export function init(data, cbs, systems) {
  galaxyData = data;
  callbacks = cbs || {};
  editorSystems = systems || null;
  updateStatus();

  map2dView = createMap2D({
    canvas: document.getElementById('map2d-canvas'),
    labelLayer: document.getElementById('map2d-labels'),
    systems,
    callbacks: {
      onSelect: selectBody,
      onDeselect: deselectBody,
      onTrack: (id) => { if (callbacks.onFlyTo) callbacks.onFlyTo(id); },
      onUntrack: () => { if (callbacks.onUntrack) callbacks.onUntrack(); }
    }
  });
  /* Restore last-used view; also catches '2' pressed during load */
  const savedView = lsGet(VIEW_KEY);
  if (savedView === '2d' && viewMode !== '2d') setViewMode('2d');
  else map2dView.setActive(viewMode === '2d');

  /* Nav export button — wired once, visibility toggled with editor mode */
  const navExport = document.getElementById('ed-export-nav');
  if (navExport) {
    if (editorMode) navExport.classList.add('visible');
    navExport.addEventListener('click', () => {
      if (editorSystems) editorSystems.exportJSON();
      editorDirty = false;
      navExport.classList.remove('dirty');
      window.onbeforeunload = null;
    });
  }

  /* If editor mode was persisted, show the empty-state panel */
  if (editorMode && editorSystems) deselectBody();
  updateControlsVisibility();

  /* Compass rose toggle — click center to shrink/restore, persisted in localStorage */
  const compassEl = document.getElementById('gx-compass');
  const smbhCircle = compassEl?.querySelector('#SMBH');
  if (smbhCircle) {
    smbhCircle.style.cursor = 'pointer';
    smbhCircle.style.pointerEvents = 'auto';
    const COMPASS_KEY = 'mommyship-galaxy-compass-mini';
    let mini = lsGet(COMPASS_KEY) === 'true';
    function applyCompass() {
      compassEl.style.transform = mini ? 'scale(0.5) translate(-200px, -200px)' : '';
      compassEl.style.opacity = mini ? '0.85' : '';
    }
    applyCompass();
    smbhCircle.addEventListener('click', () => {
      mini = !mini;
      lsSet(COMPASS_KEY, String(mini));
      applyCompass();
    });
  }
}

export function getSelectedId() { return selectedId; }
export function getViewMode() { return viewMode; }
export function setTracking(v, id) {
  isTracking = v;
  updateControlsVisibility();
  /* Keep the 2D follow-cam honest: every 3D untrack path lands here */
  if (!map2dView) return;
  if (!v) map2dView.clearTracking();
  else if (id) map2dView.setTracked(id);
}
export function frame2d(delta, rotationTime, rotating, cinema) { map2dView?.frame(delta, rotationTime, rotating, cinema); }
export function get2DCamera() { return map2dView?.getCamera() || null; }

export { selectBody, deselectBody, setViewMode, flyToBody };
