/* Galaxy data + interactive layer — JSON persistence, markers, labels, raycasting */

import * as THREE from 'three';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { createRng } from './rng.js';
import { loadShader, loadShaderPair } from './shaders.js';
import { bakeStarAtlas } from './star-bake.js';
import { createStarDetail } from './star-detail.js';
import { parseMK } from './star-params.js';
import { bakePlanetAtlas } from './planet-bake.js';
import { createPlanetDetail } from './planet-detail.js';
import { parsePlanetType, findParentStar } from './planet-params.js';

const STORAGE_KEY = 'mommyship-galaxy-data';
const MARKER_RADIUS = 2.5;
const MARKER_SEGMENTS = 12;
const CLICK_THRESHOLD = 5;
/* [near, far] fade distances indexed by hierarchy depth */
const LABEL_FADE = [[200, 300], [60, 120], [25, 50]];
const LABEL_POOL_SIZE = 80;
const LABEL_REASSIGN_EVERY = 10;

/* Cube sizing: match sphere volume for visual consistency */
const SPHERE_VOL = (4 / 3) * Math.PI * Math.pow(MARKER_RADIUS, 3);
const CUBE_SMALL = Math.cbrt(SPHERE_VOL * 2 / 3);
const CUBE_FULL = Math.cbrt(SPHERE_VOL);

const LANDMARK_IDS = new Set(['smbh', 'broken-arm-nebula', 'gantropic-gulch']);
const FULL_SIZE_CUBES = new Set(['gas-n-gripe-alpha', 'gas-n-gripe-premium']);

function isGasNGripe(id, body) {
  return id.startsWith('gas-n-gripe') && body?.type === 'station';
}

/* Orbital scatter — Keplerian ellipses for child body animation */
const TWO_PI = Math.PI * 2;
const ORBIT_RADIUS = [null, [5, 10], [2, 4], [1, 2]];
const ECC_SIGMA    = [0, 0.08, 0.015, 0.015];
const ECC_MAX      = [0, 0.5,  0.06,  0.06];
/* Planets: Gaussian centered at 30° σ10°; moons: half-Gaussian σ5° with ±15° cap */
const INCL_SIGMA   = [0, 10,   5,     5];
const INCL_CENTER  = [0, 30,   0,     0];
const INCL_MIN     = [0, 5,    0,     0];
const INCL_MAX     = [0, 60,   15,    15];
const ORBIT_PERIOD = [null, [30, 90], [15, 45], [8, 25]];

/* Marker scale per depth: stars 80%, planets 30% of star, moons 25% of planet */
const DEPTH_SCALE = [0.8, 0.24, 0.06, 0.015];

/* Quick body radius lookup from T-shirt size for orbital spacing */
const SIZE_TO_RADIUS = { XXXS: 0.3, XXS: 0.5, XS: 0.7, S: 0.85, M: 1.0, L: 1.3, XL: 1.6, XXL: 2.0, XXXL: 3.0 };
function getBodyRadius(body) {
  const sz = body.stats?.size ?? body.visual?.size;
  if (typeof sz === 'string') return SIZE_TO_RADIUS[sz.toUpperCase()] ?? 1.0;
  if (typeof sz === 'number') return sz;
  return 1.0;
}

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return h;
}

function rayleighSample(rng, sigma) {
  return sigma * Math.sqrt(-2 * Math.log(1 - rng.next()));
}

const RESONANCES = [
  { ratio: 2,     weight: 0.35 },
  { ratio: 3/2,   weight: 0.30 },
  { ratio: 5/3,   weight: 0.15 },
  { ratio: 4,     weight: 0.10 },
  { ratio: 5/2,   weight: 0.10 }
];

/* Probabilistically lock a period ratio toward a simple integer resonance */
function nudgeToResonance(ratio, rng, strength) {
  let best = null, bestDist = Infinity;
  for (const r of RESONANCES) {
    const dist = Math.abs(ratio - r.ratio);
    if (dist < bestDist) { bestDist = dist; best = r; }
  }
  if (rng.next() > best.weight) return ratio;
  return ratio + (best.ratio - ratio) * (strength || 0.6);
}

function generateOrbitalDefaults(bodyId, depth) {
  const d = Math.min(depth, 3);
  const rng = createRng(hashString(bodyId));
  const [rMin, rMax] = ORBIT_RADIUS[d];
  const [pMin, pMax] = ORBIT_PERIOD[d];

  /* Planets: Gaussian centered at 30°; moons: half-Gaussian clustered near zero */
  const rawIncl = d >= 2
    ? Math.abs(rng.gauss()) * INCL_SIGMA[d]
    : INCL_CENTER[d] + rng.gauss() * INCL_SIGMA[d];
  const incl = Math.max(INCL_MIN[d], Math.min(rawIncl, INCL_MAX[d])) * (Math.PI / 180);

  return {
    a: rMin + (rMax - rMin) * rng.next(),
    e: Math.min(rayleighSample(rng, ECC_SIGMA[d]), ECC_MAX[d]),
    incl,
    omega: rng.next() * TWO_PI,
    Omega: rng.next() * TWO_PI,
    M0: rng.next() * TWO_PI,
    period: pMin + (pMax - pMin) * rng.next()
  };
}

function solveKepler(M, e) {
  let E = M + e * Math.sin(M);
  for (let j = 0; j < 8; j++) {
    const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < 1e-6) break;
  }
  return E;
}

/* Perifocal → ecliptic rotation as a flat column-major mat3 for the orbit shader.
   Column-major because Three.js Matrix3.set() is row-major but .elements is column-major,
   and ShaderMaterial passes .elements directly to GLSL mat3. */
function orbitMatrix(omega, Omega, incl) {
  const cw = Math.cos(omega), sw = Math.sin(omega);
  const cO = Math.cos(Omega), sO = Math.sin(Omega);
  const cI = Math.cos(incl),  sI = Math.sin(incl);
  const m = new THREE.Matrix3();
  /* Row 0: x coefficients for px, py, (unused pz=0) */
  /* Row 1: y coefficients */
  /* Row 2: z coefficients */
  m.set(
    cO*cw - sO*sw*cI,  -cO*sw - sO*cw*cI,  0,
    sw*sI,              cw*sI,               0,
    sO*cw + cO*sw*cI,   -sO*sw + cO*cw*cI,  0
  );
  return m;
}

/* Line segment vs sphere — returns true if the segment passes through the sphere */
function lineHitsSphere(from, to, center, radius) {
  const dx = to.x - from.x, dy = to.y - from.y, dz = to.z - from.z;
  const fx = from.x - center.x, fy = from.y - center.y, fz = from.z - center.z;
  const a = dx * dx + dy * dy + dz * dz;
  const b = 2 * (fx * dx + fy * dy + fz * dz);
  const c = fx * fx + fy * fy + fz * fz - radius * radius;
  const disc = b * b - 4 * a * c;
  if (disc < 0) return false;
  const sq = Math.sqrt(disc);
  const t1 = (-b - sq) / (2 * a), t2 = (-b + sq) / (2 * a);
  /* Exclude endpoint neighborhoods so the line's own terminals don't self-block */
  return (t1 > 0.05 && t1 < 0.95) || (t2 > 0.05 && t2 < 0.95) || (t1 < 0.05 && t2 > 0.95);
}

/* 3D offset from parent via Keplerian orbital elements (Y-up) */
function orbitalOffset(orb, time) {
  const M = orb.M0 + (TWO_PI / orb.period) * time;
  const E = solveKepler(M, orb.e);
  const px = orb.a * (Math.cos(E) - orb.e);
  const py = orb.a * Math.sqrt(1 - orb.e * orb.e) * Math.sin(E);
  const cw = Math.cos(orb.omega), sw = Math.sin(orb.omega);
  const ci = Math.cos(orb.incl),  si = Math.sin(orb.incl);
  const cO = Math.cos(orb.Omega), sO = Math.sin(orb.Omega);
  return {
    x: (cO * cw - sO * sw * ci) * px + (-cO * sw - sO * cw * ci) * py,
    y: sw * si * px + cw * si * py,
    z: (sO * cw + cO * sw * ci) * px + (-sO * sw + cO * cw * ci) * py
  };
}

/* Differential rotation — replicated from galaxy-disk.vert */
function angularSpeed(radius) {
  const coreBoost = 0.30 * Math.exp(-radius * 0.05);
  return 0.06 + 0.008 / (radius + 60) + coreBoost;
}

function canonicalToRotated(cx, cz, rotationTime) {
  const r = Math.sqrt(cx * cx + cz * cz);
  if (r < 0.001) return { x: cx, z: cz };
  const angle = angularSpeed(r) * rotationTime;
  const cos = Math.cos(angle), sin = Math.sin(angle);
  return { x: cx * cos - cz * sin, z: cx * sin + cz * cos };
}

function rotatedToCanonical(rx, rz, rotationTime) {
  const r = Math.sqrt(rx * rx + rz * rz);
  if (r < 0.001) return { x: rx, z: rz };
  const angle = -(angularSpeed(r) * rotationTime);
  const cos = Math.cos(angle), sin = Math.sin(angle);
  return { x: rx * cos - rz * sin, z: rx * sin + rz * cos };
}

function smoothstep(lo, hi, x) {
  const t = Math.max(0, Math.min(1, (x - lo) / (hi - lo)));
  return t * t * (3 - 2 * t);
}

function createEmptyGalaxy() {
  return {
    meta: { version: '1.0.0', name: 'The Known Galaxy',
      lastModified: new Date().toISOString(), authors: ['Sam', 'Jaz'] },
    zones: {}, factions: {}, bodies: {}, hyperlanes: {}, regions: {}
  };
}

export async function createSystems(scene, camera, renderer) {

  /* CSS2D label renderer */
  const labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.domElement.style.position = 'absolute';
  labelRenderer.domElement.style.top = '0';
  labelRenderer.domElement.style.left = '0';
  labelRenderer.domElement.style.pointerEvents = 'none';
  document.querySelector('.experience').appendChild(labelRenderer.domElement);

  /* Zone labels — faction-colored or turquoise, rotate with galaxy */
  const ZONE_FACTIONS = { 'cuck-core': 'cuck', 'neo-gio-core': '#6b8cbf', 'clp': 'comexo' };
  const ZONE_BREAKS = {
    'cuck-core': 'C.U.C.K.\nSpace',
    '1gwrz': 'First Galactic\nWar Ruin Zone',
    'dead-zone': 'Unexplained\nDead Zone',
    'unclaimed': 'Unclaimed\nTerritory',
    'neo-gio-core': 'Neo-Giovanni\nCore Worlds',
    'clp': 'Comexo\nLifestyle Planets',
    'fields': 'Sapphire\nFields',
    'smelt': 'Smelt\nWorlds'
  };
  const zoneLabels = [];

  /* Separate scene for markers — rendered post-compositor with depth occlusion */
  const markerScene = new THREE.Scene();

  /* Data state */
  let galaxyData = null;
  let selectedId = null;
  let hoveredId = null;
  let museActive = false;
  let lastRotationTime = 0;
  let cubeSpins = [];
  let labelsDirty = false;
  let needsLabelRender = false;
  let hlThrottle = 0;

  /* Hyperlane endpoint redirect: star → outermost orbiting station */
  const preferStation = new Map();

  /* Orbit path lines — visible only when tracking */
  const orbitLines = new Map();
  let orbitShaders = null;
  let orbitGeo = null;
  let wasPhotoMode = false;
  let trackedOrbitId = null;
  const ORBIT_LUCENCY = 0.85;
  const ORBIT_ATTENUATE = 0.69;

  /* Hyperlane lines — always visible, thick Line2 */
  const hyperlaneLines = [];
  const hyperlaneMat = new LineMaterial({
    color: 0xffffff, transparent: true, opacity: 0.69,
    depthWrite: false, worldUnits: true, linewidth: 0.8
  });
  hyperlaneMat.resolution.set(window.innerWidth, window.innerHeight);
  hyperlaneMat.onBeforeCompile = (shader) => {
    shader.uniforms.uHlA = { value: new THREE.Color('#ff914d') };
    shader.uniforms.uHlB = { value: new THREE.Color('#ffdd59') };
    shader.vertexShader = 'varying float vLineT;\n' + shader.vertexShader.replace(
      /}\s*$/, 'vLineT = position.y < 0.5 ? 1.0 : 0.0;\n}'
    );
    shader.fragmentShader = 'varying float vLineT;\nuniform vec3 uHlA;\nuniform vec3 uHlB;\n' +
      shader.fragmentShader.replace(
        'vec4 diffuseColor = vec4( diffuse, alpha );',
        'float gT = 1.0 - abs(vLineT * 2.0 - 1.0);\nfloat nearFade = smoothstep(0.0, 0.002, gl_FragCoord.z);\nvec4 diffuseColor = vec4(mix(uHlA, uHlB, gT), alpha * nearFade);'
      );
  };

  /* Three InstancedMesh groups: stars (atlas shader), other spheres (basic), cubes (GnGs) */
  const starGeo = new THREE.SphereGeometry(MARKER_RADIUS, MARKER_SEGMENTS, 8);
  const sphereGeo = new THREE.SphereGeometry(MARKER_RADIUS, MARKER_SEGMENTS, 8);
  const cubeGeo = new THREE.BoxGeometry(1, 1, 1);
  const markerMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  let starAtlasMat = null;
  let planetAtlasMat = null;
  let starMarkers = null, sphereMarkers = null, cubeMarkers = null, planetMarkers = null;
  let starIds = [], sphereIds = [], cubeIds = [];
  let starAtlasData = null;
  let planetAtlasData = null;
  let crossfadeAttr = null;
  let planetCrossfadeAttr = null;
  let planetLightDirAttr = null;
  let planetIds = [];
  let planetToStarId = new Map();
  let planetSpins = [];
  let starDetail = null;
  let planetDetail = null;
  let detailActiveIds = new Set();
  let planetDetailActiveIds = new Map();
  const pulsarFarTori = [];
  let pulsarTorusShaders = null;
  let pulsarTorusGeoFar = null;
  let allPositionedIds = [];
  const _dummy = new THREE.Object3D();
  const _color = new THREE.Color();

  /* Hierarchy state for depth-ordered orbital computation */
  const bodyMeta = new Map();
  const bodyWorldPos = new Map();
  const depthBuckets = [[], [], [], []];

  /* Label pool — fixed set of CSS2D objects, dynamically assigned to nearest bodies */
  const labelPool = [];
  let labelAssignFrame = 0;

  function initLabelPool() {
    for (let i = 0; i < LABEL_POOL_SIZE; i++) {
      const div = document.createElement('div');
      div.className = 'system-label';
      const obj = new CSS2DObject(div);
      obj.visible = false;
      scene.add(obj);
      labelPool.push({ css2d: obj, el: div, bodyId: null, labelColor: '#fff', factionColor: '#fff' });
    }
  }

  /* Landmark hitboxes (invisible, raycastable) */
  const LANDMARKS = [
    { bodyId: 'smbh', radius: 30 },
    { bodyId: 'gantropic-gulch', radius: 15 }
  ];
  const hitboxGeo = new THREE.SphereGeometry(1, 8, 6);
  const hitboxMat = new THREE.MeshBasicMaterial({ visible: false });
  const hitboxes = [];

  /* Raycaster */
  const raycaster = new THREE.Raycaster();
  const _mouse = new THREE.Vector2();
  const _placementPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const _planeHit = new THREE.Vector3();
  const _proj = new THREE.Vector3();

  /* Click detection state */
  let pointerDownPos = null;
  let clickDisabled = false;

  /* Data loading */
  async function loadData() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { galaxyData = JSON.parse(saved); return; }
      catch (e) { /* fall through */ }
    }
    try {
      const resp = await fetch('galaxy/galaxy.json');
      if (resp.ok) { galaxyData = await resp.json(); return; }
    } catch (e) { /* fall through */ }
    galaxyData = createEmptyGalaxy();
  }

  function autosave() {
    galaxyData.meta.lastModified = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(galaxyData));
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(galaxyData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'galaxy-update.json'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  }

  function importJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          galaxyData = JSON.parse(e.target.result);
          await rebakeStarAtlas();
          await rebakePlanetAtlas();
          rebuildMarkers();
          autosave();
          resolve(galaxyData);
        } catch (err) { reject(err); }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  async function revertToSaved() {
    localStorage.removeItem(STORAGE_KEY);
    await loadData();
    await rebakeStarAtlas();
    await rebakePlanetAtlas();
    rebuildMarkers();
  }

  async function rebakePlanetAtlas() {
    if (!planetAtlasMat) return;
    try {
      const newData = await bakePlanetAtlas(renderer, galaxyData.bodies);
      if (newData.atlas) {
        const oldAtlas = planetAtlasData?.atlas;
        planetAtlasData = newData;
        planetAtlasMat.uniforms.uAtlas.value = newData.atlas;
        if (oldAtlas) oldAtlas.dispose();
        planetDetailActiveIds = new Map();
        if (planetDetail) {
          planetDetail.invalidateCaches();
          if (newData.paramsCache) planetDetail.setParamsCache(newData.paramsCache);
        }
      }
    } catch (e) {
      console.warn('Planet atlas re-bake failed:', e);
    }
  }

  /* Lightweight single-body rebake — invalidates detail mesh so it re-reads fresh params.
     Skips the full atlas rebuild (8–12s), detail mesh re-activates in ~1 frame. */
  function rebakeSinglePlanet(bodyId) {
    if (!planetDetail) return;
    const body = galaxyData.bodies[bodyId];
    if (!body) return;
    const parentStar = findParentStar(bodyId, galaxyData.bodies);
    const params = parsePlanetType(body, bodyId, parentStar, galaxyData.bodies);
    /* Invalidate FIRST (deletes old cache entry), then write fresh params */
    planetDetail.invalidateBody(bodyId);
    if (planetAtlasData?.paramsCache) planetAtlasData.paramsCache.set(bodyId, params);
    if (planetAtlasData?.churnMap) planetAtlasData.churnMap.set(bodyId, params.churn || 0);
  }

  /* Lightweight single-star rebake — same pattern as planets */
  function rebakeSingleStar(bodyId) {
    if (!starDetail) return;
    starDetail.invalidateBody(bodyId);
  }

  async function rebakeStarAtlas() {
    if (!starAtlasMat) return;
    try {
      if (starAtlasData?.atlas) starAtlasData.atlas.dispose();
      starAtlasData = await bakeStarAtlas(renderer, galaxyData.bodies);
      starAtlasMat.uniforms.uAtlas.value = starAtlasData.atlas;
      if (starDetail) {
        markerScene.remove(starDetail.container);
        starDetail.dispose();
        detailActiveIds = new Set();
        starDetail = await createStarDetail(renderer);
        markerScene.add(starDetail.container);
      }
    } catch (e) {
      console.warn('Star atlas re-bake failed:', e);
    }
  }

  function generateId(name) {
    const base = (name || 'unnamed-body')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (!galaxyData.bodies[base]) return base;
    let n = 2;
    while (galaxyData.bodies[base + '-' + n]) n++;
    return base + '-' + n;
  }

  function getBodyColor(body) {
    if (body.visual?.color) return body.visual.color;
    if (body.factionId && galaxyData.factions[body.factionId])
      return galaxyData.factions[body.factionId].color;
    return '#ffffff';
  }

  /* Orbit color: faction color, walking up the parent chain if needed */
  const _orbitHSL = {};
  function getOrbitColor(id, body) {
    let hex;
    let cur = body;
    while (cur) {
      if (cur.factionId && galaxyData.factions[cur.factionId]) {
        hex = galaxyData.factions[cur.factionId].color;
        break;
      }
      cur = cur.parentId ? galaxyData.bodies[cur.parentId] : null;
    }
    if (!hex) hex = body.visual?.color || '#c0c0c8';
    /* Floor brightness so dark factions stay readable against deep space */
    _color.set(hex);
    _color.getHSL(_orbitHSL);
    if (_orbitHSL.l < 0.35) _color.setHSL(_orbitHSL.h, _orbitHSL.s, 0.35);
    return '#' + _color.getHexString();
  }

  /* White for GnGs + independents, lightened faction color for everyone else */
  function getLabelColor(id, body) {
    if (isGasNGripe(id, body)) return '#ffffff';
    if (body.factionId === 'independent') return '#ffffff';
    return lightenHex(getBodyColor(body), 0.45);
  }

  const _white = new THREE.Color('#ffffff');
  function lightenHex(hex, blend) {
    _color.set(hex);
    _color.lerp(_white, blend);
    return '#' + _color.getHexString();
  }

  function darkenHex(hex, factor) {
    _color.set(hex);
    _color.multiplyScalar(factor);
    return '#' + _color.getHexString();
  }

  /* Resolve parent→child chains, generate deterministic orbital params */
  function resolveHierarchy() {
    bodyMeta.clear();
    bodyWorldPos.clear();
    for (let d = 0; d < 4; d++) depthBuckets[d] = [];

    const childrenOf = new Map();
    for (const [id, body] of Object.entries(galaxyData.bodies)) {
      if (body.parentId) {
        if (!childrenOf.has(body.parentId)) childrenOf.set(body.parentId, []);
        childrenOf.get(body.parentId).push(id);
      }
    }

    /* Depth 0: root bodies with galactic positions (skip bodies with parents — they orbit) */
    for (const [id, body] of Object.entries(galaxyData.bodies)) {
      if (!body.position || body.parentId) continue;
      const instanceScale = isGasNGripe(id, body)
        ? (FULL_SIZE_CUBES.has(id) ? CUBE_FULL : CUBE_SMALL) * DEPTH_SCALE[0] : DEPTH_SCALE[0];
      bodyMeta.set(id, { depth: 0, parentId: null, orbital: null, instanceScale });
      depthBuckets[0].push(id);
      bodyWorldPos.set(id, { x: 0, y: 0, z: 0 });
    }

    /* BFS: scatter children with collision-free 3D orbits */
    preferStation.clear();
    for (let depth = 1; depth < 4; depth++) {
      for (const parentId of depthBuckets[depth - 1]) {
        const childIds = (childrenOf.get(parentId) || []).filter(id => galaxyData.bodies[id]);
        if (childIds.length === 0) continue;

        /* Track orbital stations for hyperlane endpoint redirect (pick outermost) */
        for (const cid of childIds) {
          if (galaxyData.bodies[cid]?.type === 'station') preferStation.set(parentId, cid);
        }

        /* Compute max child radius for spacing — larger bodies need more room */
        let maxChildRadius = 1.0;
        for (const cid of childIds) {
          const r = getBodyRadius(galaxyData.bodies[cid]);
          if (r > maxChildRadius) maxChildRadius = r;
        }
        /* Visual diameter in world units = MARKER_RADIUS × DEPTH_SCALE × radius × 2.
           Add 40% breathing room so orbits don't visually overlap. */
        const radiusPadding = MARKER_RADIUS * DEPTH_SCALE[Math.min(depth, 3)] * maxChildRadius * 2.8;

        let minR, spacing;
        if (depth === 1) {
          minR = ORBIT_RADIUS[1][0];
          spacing = Math.max(2.0, radiusPadding);
        } else {
          const parentA = bodyMeta.get(parentId)?.orbital?.a || 3;
          const maxR = parentA * 0.35;
          minR = maxR * 0.25;
          spacing = Math.max(radiusPadding, 0.15, (maxR - minR) / Math.max(childIds.length, 1));
        }

        /* Generate params; non-GnG sort by radius first, GnGs always outermost */
        const orbitals = childIds.map(id => {
          const body = galaxyData.bodies[id];
          const defaults = generateOrbitalDefaults(id, depth);
          return { id, orbital: body.orbital ? { ...defaults, ...body.orbital } : defaults };
        });
        /* Sort: explicit order → random a, stations always outermost */
        orbitals.sort((a, b) => {
          const aS = galaxyData.bodies[a.id]?.type === 'station' ? 1 : 0;
          const bS = galaxyData.bodies[b.id]?.type === 'station' ? 1 : 0;
          if (aS !== bS) return aS - bS;
          const aO = galaxyData.bodies[a.id]?.orbital?.order ?? a.orbital.a;
          const bO = galaxyData.bodies[b.id]?.orbital?.order ?? b.orbital.a;
          return aO - bO;
        });

        /* Even spacing with eccentricity cap — preserve explicit JSON overrides */
        for (let i = 0; i < orbitals.length; i++) {
          const src = galaxyData.bodies[orbitals[i].id]?.orbital;
          const hasExplicitA = src?.a != null;
          const a = hasExplicitA ? orbitals[i].orbital.a : minR + (i + 0.5) * spacing;
          orbitals[i].orbital.a = a;
          if (src?.e == null)
            orbitals[i].orbital.e = Math.min(orbitals[i].orbital.e, spacing / (2 * a + spacing));
        }

        /* Nudge adjacent period ratios toward integer resonances (Kepler T ∝ a^1.5).
           Weaker strength for crowded systems so compounding doesn't blow out outer orbits */
        const resStrength = orbitals.length <= 4 ? 0.6 : 0.3;
        for (let i = 1; i < orbitals.length; i++) {
          if (galaxyData.bodies[orbitals[i].id]?.orbital?.a != null) continue;
          const inner = orbitals[i - 1].orbital.a;
          const outer = orbitals[i].orbital.a;
          const ratio = Math.pow(outer / inner, 1.5);
          const resRng = createRng(hashString(orbitals[i].id) + 314);
          const nudged = nudgeToResonance(ratio, resRng, resStrength);
          if (nudged === ratio) continue;
          /* Clamp so nudging can't push beyond 1.5× the original spacing */
          const maxA = minR + (i + 0.5) * spacing * 1.5;
          const newA = Math.min(inner * Math.pow(nudged, 2 / 3), maxA);
          orbitals[i].orbital.a = newA;
          if (galaxyData.bodies[orbitals[i].id]?.orbital?.e == null)
            orbitals[i].orbital.e = Math.min(orbitals[i].orbital.e,
              spacing / (2 * newA + spacing));
        }

        if (depth >= 2) {
          /* Moons: inherit parent's orbital plane + planet's own axial tilt */
          const parentOrb = bodyMeta.get(parentId)?.orbital;
          const poleRng = createRng(hashString(parentId) + 84);
          const baseTilt = (parentOrb?.incl || 0) + (10 + poleRng.next() * 20) * (Math.PI / 180);
          const baseAz = (parentOrb?.Omega || 0) + (poleRng.next() - 0.5) * 0.5;
          for (let i = 0; i < orbitals.length; i++) {
            const src = galaxyData.bodies[orbitals[i].id]?.orbital;
            const scatter = createRng(hashString(orbitals[i].id) + 199);
            if (src?.incl != null)
              orbitals[i].orbital.incl = src.incl * (Math.PI / 180);
            else
              orbitals[i].orbital.incl = Math.max(0, baseTilt + scatter.gauss() * 5 * (Math.PI / 180));
            if (src?.Omega != null)
              orbitals[i].orbital.Omega = src.Omega * (Math.PI / 180);
            else
              orbitals[i].orbital.Omega = baseAz + scatter.gauss() * 8 * (Math.PI / 180);
            if (src?.omega != null)
              orbitals[i].orbital.omega = src.omega * (Math.PI / 180);
          }
        } else {
          /* Planets: shared orbital plane from star's pole axis (overridable via poleAngle) */
          const poleRng = createRng(hashString(parentId) + 42);
          const parentBody = galaxyData.bodies[parentId];
          const poleTilt = parentBody?.poleAngle != null
            ? parentBody.poleAngle * (Math.PI / 180)
            : (15 + poleRng.next() * 35) * (Math.PI / 180);
          const poleAzimuth = poleRng.next() * TWO_PI;
          for (let i = 0; i < orbitals.length; i++) {
            const src = galaxyData.bodies[orbitals[i].id]?.orbital;
            const scatter = createRng(hashString(orbitals[i].id) + 99);
            if (src?.incl != null)
              orbitals[i].orbital.incl = src.incl * (Math.PI / 180);
            else
              orbitals[i].orbital.incl = Math.max(0, poleTilt + scatter.gauss() * 3 * (Math.PI / 180));
            if (src?.Omega != null)
              orbitals[i].orbital.Omega = src.Omega * (Math.PI / 180);
            else
              orbitals[i].orbital.Omega = poleAzimuth + scatter.gauss() * 2 * (Math.PI / 180);
            if (src?.omega != null)
              orbitals[i].orbital.omega = src.omega * (Math.PI / 180);
            if (src?.M0 != null)
              orbitals[i].orbital.M0 = src.M0 * (Math.PI / 180);
          }
        }

        const depthFactor = DEPTH_SCALE[Math.min(depth, 3)];
        for (let oi = 0; oi < orbitals.length; oi++) {
          const o = orbitals[oi];
          const instanceScale = isGasNGripe(o.id, galaxyData.bodies[o.id])
            ? (FULL_SIZE_CUBES.has(o.id) ? CUBE_FULL : CUBE_SMALL) * depthFactor
            : depthFactor;
          bodyMeta.set(o.id, { depth, parentId, orbital: o.orbital, instanceScale, computedOrder: oi + 1 });
          depthBuckets[depth].push(o.id);
          bodyWorldPos.set(o.id, { x: 0, y: 0, z: 0 });
        }
      }
    }
  }

  function rebuildMarkers() {
    if (starMarkers) { markerScene.remove(starMarkers); starMarkers.dispose(); }
    if (sphereMarkers) { markerScene.remove(sphereMarkers); sphereMarkers.dispose(); }
    if (cubeMarkers) { markerScene.remove(cubeMarkers); cubeMarkers.dispose(); }
    if (planetMarkers) { markerScene.remove(planetMarkers); planetMarkers.dispose(); }
    for (const pt of pulsarFarTori) {
      markerScene.remove(pt.mesh);
      pt.mat.dispose();
    }
    pulsarFarTori.length = 0;
    starMarkers = null;
    sphereMarkers = null;
    cubeMarkers = null;
    planetMarkers = null;
    crossfadeAttr = null;
    planetCrossfadeAttr = null;
    planetLightDirAttr = null;
    planetIds = [];
    planetSpins = [];
    planetToStarId = new Map();
    hitboxes.forEach(hb => { if (hb.parent) hb.removeFromParent(); });
    hitboxes.length = 0;

    resolveHierarchy();

    starIds = [];
    sphereIds = [];
    cubeIds = [];
    cubeSpins = [];
    allPositionedIds = [];
    for (const [id] of bodyMeta) {
      allPositionedIds.push(id);
      if (LANDMARK_IDS.has(id)) continue;
      if (isGasNGripe(id, galaxyData.bodies[id])) cubeIds.push(id);
      else if (galaxyData.bodies[id].type === 'star') starIds.push(id);
      else if (planetAtlasData?.layerMap.has(id)) planetIds.push(id);
      else sphereIds.push(id);
    }

    /* Star InstancedMesh (textured via atlas shader) */
    if (starIds.length > 0 && starAtlasMat && starAtlasData) {
      starMarkers = new THREE.InstancedMesh(starGeo, starAtlasMat, starIds.length);
      starMarkers.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      starMarkers.renderOrder = 5;

      const layers = new Float32Array(starIds.length);
      const crossfades = new Float32Array(starIds.length);

      for (let i = 0; i < starIds.length; i++) {
        const id = starIds[i];
        const body = galaxyData.bodies[id];
        const meta = bodyMeta.get(id);
        const mkParams = parseMK(body.spectralClass, body.visual?.size);
        meta.mkRadius = mkParams.radius;
        const pos = body.position || { x: 0, y: 0, z: 0 };
        _dummy.position.set(pos.x, pos.y || 0, pos.z);
        _dummy.scale.setScalar(meta.instanceScale * mkParams.radius);
        _dummy.updateMatrix();
        starMarkers.setMatrixAt(i, _dummy.matrix);
        _color.set(getBodyColor(body));
        starMarkers.setColorAt(i, _color);
        layers[i] = starAtlasData.layerMap.get(id) ?? 0;
        crossfades[i] = 0;
      }

      const layerAttr = new THREE.InstancedBufferAttribute(layers, 1);
      crossfadeAttr = new THREE.InstancedBufferAttribute(crossfades, 1);
      crossfadeAttr.setUsage(THREE.DynamicDrawUsage);
      starMarkers.geometry.setAttribute('aLayer', layerAttr);
      starMarkers.geometry.setAttribute('aCrossfade', crossfadeAttr);

      starMarkers.instanceMatrix.needsUpdate = true;
      if (starMarkers.instanceColor) starMarkers.instanceColor.needsUpdate = true;
      markerScene.add(starMarkers);

      /* Pulsar far-LOD: low-poly torus with same shader, crossfades to detail mesh */
      if (pulsarTorusShaders && pulsarTorusGeoFar) {
        for (const id of starIds) {
          const body = galaxyData.bodies[id];
          if (body.subtype !== 'pulsar') continue;
          const seed = hashString(id);
          const params = parseMK(body.spectralClass, body.visual?.size);
          const mat = new THREE.ShaderMaterial({
            vertexShader: pulsarTorusShaders.vert,
            fragmentShader: pulsarTorusShaders.frag,
            glslVersion: THREE.GLSL3,
            uniforms: {
              uTime:      { value: 0 },
              uSeed:      { value: seed },
              uColor:     { value: new THREE.Color(params.atmoColor) },
              uIntensity: { value: 2.0 },
            },
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            transparent: true,
            side: THREE.DoubleSide,
          });
          const mesh = new THREE.Mesh(pulsarTorusGeoFar, mat);
          mesh.rotation.x = Math.PI / 2;
          mesh.visible = false;
          mesh.renderOrder = 4;
          markerScene.add(mesh);
          pulsarFarTori.push({ id, mesh, mat });
        }
      }
    } else if (starIds.length > 0) {
      /* Fallback if atlas hasn't baked yet — use basic material */
      sphereIds = starIds.concat(sphereIds);
      starIds = [];
    }

    /* Non-star sphere InstancedMesh (planets, moons, stations) */
    if (sphereIds.length > 0) {
      sphereMarkers = new THREE.InstancedMesh(sphereGeo, markerMat, sphereIds.length);
      sphereMarkers.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      sphereMarkers.renderOrder = 5;

      for (let i = 0; i < sphereIds.length; i++) {
        const id = sphereIds[i];
        const body = galaxyData.bodies[id];
        const meta = bodyMeta.get(id);
        const pos = body.position || { x: 0, y: 0, z: 0 };
        _dummy.position.set(pos.x, pos.y || 0, pos.z);
        _dummy.scale.setScalar(meta.instanceScale);
        _dummy.updateMatrix();
        sphereMarkers.setMatrixAt(i, _dummy.matrix);
        _color.set(getBodyColor(body));
        sphereMarkers.setColorAt(i, _color);
      }
      sphereMarkers.instanceMatrix.needsUpdate = true;
      if (sphereMarkers.instanceColor) sphereMarkers.instanceColor.needsUpdate = true;
      markerScene.add(sphereMarkers);
    }

    /* Planet/moon InstancedMesh (textured via planet atlas shader) */
    if (planetIds.length > 0 && planetAtlasMat && planetAtlasData) {
      planetMarkers = new THREE.InstancedMesh(sphereGeo, planetAtlasMat, planetIds.length);
      planetMarkers.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      planetMarkers.renderOrder = 5;

      const pLayers = new Float32Array(planetIds.length);
      const pCrossfades = new Float32Array(planetIds.length);
      const pLightDirs = new Float32Array(planetIds.length * 3);
      const pChurns = new Float32Array(planetIds.length);
      const pAtmos = new Float32Array(planetIds.length * 4);

      for (let i = 0; i < planetIds.length; i++) {
        const id = planetIds[i];
        const body = galaxyData.bodies[id];
        const meta = bodyMeta.get(id);
        const pcache = planetAtlasData.paramsCache?.get(id);
        /* Store planet radius on meta so detail mesh and render loop use the same scale */
        meta.planetRadius = pcache?.radius ?? 1;
        const pos = body.position || { x: 0, y: 0, z: 0 };
        _dummy.position.set(pos.x, pos.y || 0, pos.z);
        _dummy.scale.setScalar(meta.instanceScale * meta.planetRadius);
        _dummy.updateMatrix();
        planetMarkers.setMatrixAt(i, _dummy.matrix);
        _color.set(getBodyColor(body));
        planetMarkers.setColorAt(i, _color);
        pLayers[i] = planetAtlasData.layerMap.get(id) ?? 0;
        pCrossfades[i] = 0;
        /* Default light dir — updated per frame */
        pLightDirs[i * 3] = 1; pLightDirs[i * 3 + 1] = 0.3; pLightDirs[i * 3 + 2] = 0;
        pChurns[i] = planetAtlasData.churnMap?.get(id) ?? 0;
        if (pcache) {
          _color.set(pcache.atmosphereTint);
          pAtmos[i * 4]     = _color.r;
          pAtmos[i * 4 + 1] = _color.g;
          pAtmos[i * 4 + 2] = _color.b;
          pAtmos[i * 4 + 3] = pcache.atmosphereIntensity;
        } else {
          pAtmos[i * 4] = 0.53; pAtmos[i * 4 + 1] = 0.67;
          pAtmos[i * 4 + 2] = 0.8; pAtmos[i * 4 + 3] = 0.2;
        }

        /* Axial rotation — body.axialTilt overrides random tilt when set */
        const spinRng = createRng(hashString(id) + 333);
        const bodyObj = galaxyData.bodies[id];
        const tiltRad = bodyObj?.axialTilt != null
          ? bodyObj.axialTilt * (Math.PI / 180)
          : 0.15 + spinRng.next() * 0.4;
        const tiltAz = spinRng.next() * TWO_PI;
        const spinAxis = new THREE.Vector3(
          Math.sin(tiltRad) * Math.cos(tiltAz), Math.cos(tiltRad), Math.sin(tiltRad) * Math.sin(tiltAz)
        ).normalize();
        const autoSpinSpeed = (0.08 + spinRng.next() * 0.12) * (spinRng.next() > 0.5 ? 1 : -1);
        const spinSpeed = bodyObj?.visual?.spinSpeed ?? autoSpinSpeed;
        planetSpins.push({ axis: spinAxis, speed: spinSpeed });
        /* Store computed values for editor display */
        meta.computedAxialTilt = +(tiltRad * 180 / Math.PI).toFixed(1);
        meta.computedSpinSpeed = +autoSpinSpeed.toFixed(3);
      }

      const pLayerAttr = new THREE.InstancedBufferAttribute(pLayers, 1);
      planetCrossfadeAttr = new THREE.InstancedBufferAttribute(pCrossfades, 1);
      planetCrossfadeAttr.setUsage(THREE.DynamicDrawUsage);
      planetLightDirAttr = new THREE.InstancedBufferAttribute(pLightDirs, 3);
      planetLightDirAttr.setUsage(THREE.DynamicDrawUsage);
      planetMarkers.geometry.setAttribute('aLayer', pLayerAttr);
      planetMarkers.geometry.setAttribute('aCrossfade', planetCrossfadeAttr);
      planetMarkers.geometry.setAttribute('aLightDir', planetLightDirAttr);
      planetMarkers.geometry.setAttribute('aChurn', new THREE.InstancedBufferAttribute(pChurns, 1));
      planetMarkers.geometry.setAttribute('aAtmosphere', new THREE.InstancedBufferAttribute(pAtmos, 4));

      planetMarkers.instanceMatrix.needsUpdate = true;
      if (planetMarkers.instanceColor) planetMarkers.instanceColor.needsUpdate = true;
      markerScene.add(planetMarkers);
      /* Cache planet→starId mapping once to avoid per-frame hierarchy walks */
      for (const pid of planetIds) {
        const star = findParentStar(pid, galaxyData.bodies);
        if (star) {
          const sid = Object.keys(galaxyData.bodies).find(k => galaxyData.bodies[k] === star);
          if (sid) planetToStarId.set(pid, sid);
        }
      }
    } else if (planetIds.length > 0) {
      /* Fallback — put planets back into sphereIds for basic rendering */
      sphereIds = sphereIds.concat(planetIds);
      planetIds = [];
    }

    /* Cube InstancedMesh (Gas-n-Gripes) */
    if (cubeIds.length > 0) {
      cubeMarkers = new THREE.InstancedMesh(cubeGeo, markerMat, cubeIds.length);
      cubeMarkers.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      cubeMarkers.renderOrder = 5;

      for (let i = 0; i < cubeIds.length; i++) {
        const id = cubeIds[i];
        const body = galaxyData.bodies[id];
        const meta = bodyMeta.get(id);
        const pos = body.position || { x: 0, y: 0, z: 0 };
        _dummy.position.set(pos.x, pos.y || 0, pos.z);
        _dummy.scale.setScalar(meta.instanceScale);
        _dummy.updateMatrix();
        cubeMarkers.setMatrixAt(i, _dummy.matrix);
        _color.set(getBodyColor(body));
        cubeMarkers.setColorAt(i, _color);

        /* GnG spin: random axis tilt, core cubes spin faster */
        const spinRng = createRng(hashString(id) + 777);
        const tilt = 0.15;
        const axis = new THREE.Vector3(
          (spinRng.next() - 0.5) * tilt * 2, 1, (spinRng.next() - 0.5) * tilt * 2
        ).normalize();
        const r = body.position ? Math.sqrt(body.position.x ** 2 + body.position.z ** 2) : 200;
        const coreBoost = 1 + 0.3 / (1 + r * 0.005);
        const speed = (0.2 + spinRng.next() * 0.15) * (spinRng.next() > 0.5 ? 1 : -1) * coreBoost;
        cubeSpins.push({ axis, speed });
      }
      cubeMarkers.instanceMatrix.needsUpdate = true;
      if (cubeMarkers.instanceColor) cubeMarkers.instanceColor.needsUpdate = true;
      markerScene.add(cubeMarkers);
    }

    /* Landmark hitboxes (invisible geometry, still raycastable) */
    for (const lm of LANDMARKS) {
      const body = galaxyData.bodies[lm.bodyId];
      if (!body || !body.position) continue;
      const mesh = new THREE.Mesh(hitboxGeo, hitboxMat);
      mesh.position.set(body.position.x, body.position.y || 0, body.position.z);
      mesh.scale.setScalar(lm.radius);
      mesh.userData = { landmarkId: lm.bodyId };
      hitboxes.push(mesh);
    }

    /* Orbit path lines — GPU-computed Keplerian ellipses */
    for (const [, ol] of orbitLines) { markerScene.remove(ol.line); ol.mat.dispose(); }
    orbitLines.clear();
    if (orbitShaders) {
      if (!orbitGeo) {
        /* Shared parametric geometry: position.x = t ∈ [0, 511/512) */
        const ORBIT_VERTS = 512;
        const verts = new Float32Array(ORBIT_VERTS * 3);
        for (let i = 0; i < ORBIT_VERTS; i++) {
          verts[i * 3] = i / ORBIT_VERTS;
          verts[i * 3 + 1] = 0;
          verts[i * 3 + 2] = 0;
        }
        orbitGeo = new THREE.BufferGeometry();
        orbitGeo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
      }
      for (const [id, meta] of bodyMeta) {
        if (meta.depth === 0 || !meta.orbital) continue;
        let rootId = meta.parentId;
        let rm = bodyMeta.get(rootId);
        while (rm && rm.depth > 0) { rootId = rm.parentId; rm = bodyMeta.get(rootId); }
        const body = galaxyData.bodies[id];
        const color = getOrbitColor(id, body);
        const mat = new THREE.ShaderMaterial({
          vertexShader: orbitShaders.vert,
          fragmentShader: orbitShaders.frag,
          glslVersion: THREE.GLSL3,
          uniforms: {
            uA:           { value: meta.orbital.a },
            uE:           { value: meta.orbital.e },
            uOrbitMat:    { value: orbitMatrix(meta.orbital.omega, meta.orbital.Omega, meta.orbital.incl) },
            uTrailStart:  { value: 0.0 },
            uTrailLength: { value: 0.95 },
            uAttenuate:   { value: ORBIT_ATTENUATE },
            uLucency:     { value: ORBIT_LUCENCY },
            uTracked:     { value: 0.0 },
            uColor:       { value: new THREE.Color(color) },
            uDashed:      { value: meta.depth >= 2 ? 1.0 : 0.0 },
          },
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        });
        const line = new THREE.LineLoop(orbitGeo, mat);
        line.frustumCulled = false;
        line.renderOrder = 6;
        line.visible = false;
        markerScene.add(line);
        orbitLines.set(id, { line, mat, parentId: meta.parentId, rootId, orbital: meta.orbital });
      }
    }

    /* Hyperlane lines (thick Line2 with orange→yellow→orange gradient) */
    for (const hl of hyperlaneLines) { markerScene.remove(hl.line); hl.line.geometry.dispose(); }
    hyperlaneLines.length = 0;
    for (const [, hl] of Object.entries(galaxyData.hyperlanes)) {
      if (!bodyMeta.has(hl.fromId) || !bodyMeta.has(hl.toId)) continue;
      const geo = new LineGeometry();
      geo.setPositions([0,0,0, 0,0,0]);
      const line = new Line2(geo, hyperlaneMat);
      line.renderOrder = 6;
      line.frustumCulled = false;
      markerScene.add(line);
      const posBuffer = line.geometry.getAttribute('instanceStart').data;
      hyperlaneLines.push({ line, fromId: hl.fromId, toId: hl.toId, posBuffer });
    }

    labelAssignFrame = LABEL_REASSIGN_EVERY;

    /* Restore orbit visibility if a body was being tracked */
    if (trackedOrbitId) showOrbitsForBody(trackedOrbitId);
  }

  /* Show orbit paths for a tracked body's entire system */
  function showOrbitsForBody(bodyId) {
    trackedOrbitId = bodyId;
    let trackedRoot = bodyId;
    let tm = bodyMeta.get(trackedRoot);
    while (tm && tm.depth > 0) { trackedRoot = tm.parentId; tm = bodyMeta.get(trackedRoot); }

    for (const [id, ol] of orbitLines) {
      ol.line.visible = ol.rootId === trackedRoot;
    }
  }

  function hideOrbits() {
    trackedOrbitId = null;
    for (const [, ol] of orbitLines) ol.line.visible = false;
  }

  /* Assign pool labels to the nearest/most important bodies */
  function reassignLabels() {
    if (museActive) {
      for (const entry of labelPool) entry.css2d.visible = false;
      return;
    }

    const camPos = camera.position;
    const scored = [];

    for (const id of allPositionedIds) {
      const body = galaxyData.bodies[id];
      if (!body) continue;

      const wp = bodyWorldPos.get(id);
      if (!wp) continue;
      const dx = camPos.x - wp.x, dy = camPos.y - wp.y, dz = camPos.z - wp.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      /* Landmarks: skip if camera is very close to them */
      if (body.tags?.includes('landmark') && id !== selectedId && id !== hoveredId) {
        if (dist < (id === 'smbh' ? 100 : 60)) continue;
      }
      const tier = getLabelTier(id);
      const depth = bodyMeta.get(id)?.depth || 0;
      const fadeFar = LABEL_FADE[Math.min(depth, 2)][1];

      if (tier === 2 && dist > fadeFar) continue;

      scored.push({ id, dist, tier });
    }

    /* Tier 1 first (landmarks, selected, hovered), then tier 2 by distance */
    scored.sort((a, b) => {
      if (a.tier !== b.tier) return a.tier - b.tier;
      return a.dist - b.dist;
    });

    for (let i = 0; i < LABEL_POOL_SIZE; i++) {
      const entry = labelPool[i];
      if (i < scored.length) {
        const { id } = scored[i];
        const body = galaxyData.bodies[id];
        if (entry.bodyId !== id) {
          entry.bodyId = id;
          entry.el.textContent = '';
          const isDestroyed = body.tags?.includes('destroyed');
          const nameSpan = document.createElement('span');
          nameSpan.textContent = body.name || id;
          if (isDestroyed) nameSpan.style.textDecoration = 'line-through';
          entry.el.appendChild(nameSpan);
          if (body.type === 'station' && body.class) {
            const sub = document.createElement('div');
            sub.className = 'label-class';
            sub.textContent = body.class + '-Class';
            entry.el.appendChild(sub);
          } else if (body.subtitle) {
            const sub = document.createElement('div');
            sub.className = 'label-class';
            sub.textContent = '(' + body.subtitle + ')';
            entry.el.appendChild(sub);
          }
          entry.labelColor = getLabelColor(id, body);
          entry.factionColor = getBodyColor(body);
        }
        entry.css2d.visible = true;
      } else {
        entry.bodyId = null;
        entry.css2d.visible = false;
      }
    }
  }

  /* Per-frame pool update: positions, opacity, selected styling */
  function updatePool(rotationTime, bhNdcX, bhNdcY, bhScreenR) {
    const camPos = camera.position;
    for (const entry of labelPool) {
      if (!entry.bodyId || !entry.css2d.visible) continue;
      const wp = bodyWorldPos.get(entry.bodyId);
      if (!wp) continue;

      const meta = bodyMeta.get(entry.bodyId);
      const scale = DEPTH_SCALE[Math.min(meta?.depth || 0, 3)];
      entry.css2d.position.set(wp.x, wp.y + MARKER_RADIUS * scale + 0.5, wp.z);

      const el = entry.el;
      const isSelected = entry.bodyId === selectedId;
      let opacity;

      if (isSelected) {
        el.style.color = '#ffffff';
        const dark = darkenHex(entry.factionColor, 0.55);
        el.style.textShadow = '0 0 10px ' + dark + ', 0 0 20px ' + dark;
        el.classList.add('selected');
        el.classList.remove('label-landmark');
        opacity = 1;
      } else {
        el.style.color = entry.labelColor;
        el.style.textShadow = '';
        el.classList.remove('selected');

        const tier = getLabelTier(entry.bodyId);
        if (tier === 1) {
          const body = galaxyData.bodies[entry.bodyId];
          if (body?.tags?.includes('landmark')) {
            const dx2 = camPos.x - wp.x, dy2 = camPos.y - wp.y, dz2 = camPos.z - wp.z;
            const bodyDist = Math.sqrt(dx2 * dx2 + dy2 * dy2 + dz2 * dz2);
            const fadeStart = entry.bodyId === 'smbh' ? 100 : 60;
            const fadeEnd = entry.bodyId === 'smbh' ? 200 : 150;
            opacity = smoothstep(fadeStart, fadeEnd, bodyDist);
          } else {
            opacity = 1;
          }
          el.classList.add('label-landmark');
        } else {
          el.classList.remove('label-landmark');
          const dx = camPos.x - wp.x, dy = camPos.y - wp.y, dz = camPos.z - wp.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
          const [fadeNear, fadeFar] = LABEL_FADE[Math.min(meta?.depth || 0, 2)];
          opacity = 1 - smoothstep(fadeNear, fadeFar, dist);
        }
      }

      /* Fade ALL labels (including selected) that overlap the BH's lensed disc */
      if (bhScreenR > 0) {
        _proj.set(wp.x, wp.y, wp.z).project(camera);
        const d = Math.hypot(_proj.x - bhNdcX, _proj.y - bhNdcY);
        opacity *= smoothstep(bhScreenR * 0.5, bhScreenR, d);
      }

      el.style.opacity = String(opacity);
    }
  }

  /* Cached BH screen-space values for label occlusion (persist across idle frames) */
  let cachedBhNdcX = 0, cachedBhNdcY = 0, cachedBhScreenR = 0;

  /* Per-frame update: rotate markers + labels to match galactic disk */
  function update(delta, rotationTime, lodFactor, worldDirty, trackedId) {
    lastRotationTime = rotationTime;
    const hasStars = starMarkers && starIds.length > 0;
    const hasSpheres = sphereMarkers && sphereIds.length > 0;
    const hasCubes = cubeMarkers && cubeIds.length > 0;
    const hasPlanets = planetMarkers && planetIds.length > 0;

    if (!hasStars && !hasSpheres && !hasCubes) return;

    /* When nothing has moved, only refresh label styling if selection/hover changed */
    if (!worldDirty) {
      if (labelsDirty) {
        labelsDirty = false;
        needsLabelRender = true;
        reassignLabels();
        updatePool(rotationTime, cachedBhNdcX, cachedBhNdcY, cachedBhScreenR);
      }
      return;
    }

    /* Compute world positions in depth order */
    for (const id of depthBuckets[0]) {
      const body = galaxyData.bodies[id];
      if (!body?.position) continue;
      const rot = canonicalToRotated(body.position.x, body.position.z, rotationTime);
      const wp = bodyWorldPos.get(id);
      wp.x = rot.x; wp.y = body.position.y || 0; wp.z = rot.z;
    }
    for (let d = 1; d < 4; d++) {
      for (const id of depthBuckets[d]) {
        const meta = bodyMeta.get(id);
        const pw = bodyWorldPos.get(meta.parentId);
        const off = orbitalOffset(meta.orbital, rotationTime);
        const wp = bodyWorldPos.get(id);
        wp.x = pw.x + off.x; wp.y = pw.y + off.y; wp.z = pw.z + off.z;
      }
    }

    /* Write star instance matrices + crossfade from faction color to atlas texture */
    if (hasStars) {
      _dummy.quaternion.identity();
      const camPos = camera.position;
      let cfDirty = false;
      for (let i = 0; i < starIds.length; i++) {
        /* Detail-active stars must stay at scale 0 every frame to avoid one-frame ghost */
        if (detailActiveIds.has(starIds[i])) {
          _dummy.scale.setScalar(0); _dummy.updateMatrix();
          starMarkers.setMatrixAt(i, _dummy.matrix); continue;
        }
        const meta = bodyMeta.get(starIds[i]);
        const wp = bodyWorldPos.get(starIds[i]);
        _dummy.position.set(wp.x, wp.y, wp.z);
        _dummy.scale.setScalar(meta.instanceScale * (meta.mkRadius || 1));
        _dummy.updateMatrix();
        starMarkers.setMatrixAt(i, _dummy.matrix);
        const dx = camPos.x - wp.x, dy = camPos.y - wp.y, dz = camPos.z - wp.z;
        const cf = 1 - smoothstep(25, 120, Math.sqrt(dx * dx + dy * dy + dz * dz));
        if (crossfadeAttr.array[i] !== cf) {
          crossfadeAttr.array[i] = cf;
          cfDirty = true;
        }
      }
      starMarkers.instanceMatrix.needsUpdate = true;
      if (cfDirty) crossfadeAttr.needsUpdate = true;

      /* Detail mesh: show high-poly stars when tracked or close.
         Walk parent chain so tracking a planet activates its parent star. */
      if (starDetail) {
        let starTrackId = trackedId || null;
        if (starTrackId && galaxyData.bodies[starTrackId]?.type !== 'star') {
          let cur = galaxyData.bodies[starTrackId]?.parentId;
          while (cur && galaxyData.bodies[cur]?.type !== 'star') cur = galaxyData.bodies[cur]?.parentId;
          if (cur) starTrackId = cur;
        }
        const prevIds = new Set(detailActiveIds);
        detailActiveIds = starDetail.update(starTrackId, camPos, bodyWorldPos, galaxyData, rotationTime, bodyMeta);

        /* Hide instanced stars that just became active detail meshes */
        for (const id of detailActiveIds) {
          if (prevIds.has(id)) continue;
          const idx = starIds.indexOf(id);
          if (idx < 0) continue;
          _dummy.scale.setScalar(0);
          _dummy.updateMatrix();
          starMarkers.setMatrixAt(idx, _dummy.matrix);
          starMarkers.instanceMatrix.needsUpdate = true;
        }

        /* Restore instanced stars that just lost detail meshes */
        for (const id of prevIds) {
          if (detailActiveIds.has(id)) continue;
          const idx = starIds.indexOf(id);
          if (idx < 0) continue;
          const wp = bodyWorldPos.get(id);
          if (!wp) continue;
          const pm = bodyMeta.get(id);
          _dummy.position.set(wp.x, wp.y, wp.z);
          _dummy.scale.setScalar(pm.instanceScale * (pm.mkRadius || 1));
          _dummy.updateMatrix();
          starMarkers.setMatrixAt(idx, _dummy.matrix);
          starMarkers.instanceMatrix.needsUpdate = true;
        }
      }
    }

    /* Pulsar far-LOD tori: same shader as detail, hidden when detail takes over */
    if (pulsarFarTori.length > 0) {
      for (const pt of pulsarFarTori) {
        const wp = bodyWorldPos.get(pt.id);
        if (!wp) { pt.mesh.visible = false; continue; }
        if (detailActiveIds.has(pt.id)) { pt.mesh.visible = false; continue; }
        pt.mesh.position.set(wp.x, wp.y, wp.z);
        pt.mat.uniforms.uTime.value = rotationTime;
        pt.mat.uniforms.uIntensity.value = 2.0;
        /* Match detail torus orientation — gentle wobble, no mesh spin
           (the shader's time-based animation provides all the visual motion) */
        const wobble = Math.sin(rotationTime * 0.25) * 0.08;
        pt.mesh.rotation.set(Math.PI / 2, wobble, 0);
        /* Fixed world-space scale — torus geometry is already the right size */
        pt.mesh.visible = true;
      }
    }

    /* Write non-star sphere instance matrices */
    if (hasSpheres) {
      _dummy.quaternion.identity();
      for (let i = 0; i < sphereIds.length; i++) {
        const wp = bodyWorldPos.get(sphereIds[i]);
        _dummy.position.set(wp.x, wp.y, wp.z);
        _dummy.scale.setScalar(bodyMeta.get(sphereIds[i]).instanceScale);
        _dummy.updateMatrix();
        sphereMarkers.setMatrixAt(i, _dummy.matrix);
      }
      sphereMarkers.instanceMatrix.needsUpdate = true;
    }

    /* Write planet/moon instance matrices + crossfade + light direction */
    if (planetAtlasMat) planetAtlasMat.uniforms.uTime.value = rotationTime;
    if (hasPlanets) {
      const camPos = camera.position;

      /* Detail update FIRST so planetDetailActiveIds is current before the instance loop */
      if (planetDetail) {
        planetDetailActiveIds = planetDetail.update(
          trackedId || null, camPos, bodyWorldPos, galaxyData,
          rotationTime, bodyMeta
        );
      }

      let pcfDirty = false, pldDirty = false;
      for (let i = 0; i < planetIds.length; i++) {
        const id = planetIds[i];

        /* Detail mesh replaces atlas — but only hide atlas once fully opaque */
        const detailFade = planetDetailActiveIds.get(id);
        if (detailFade !== undefined && detailFade > 0.99) {
          _dummy.scale.setScalar(0);
          _dummy.updateMatrix();
          planetMarkers.setMatrixAt(i, _dummy.matrix);
          continue;
        }

        const wp = bodyWorldPos.get(id);
        if (!wp) continue;
        const meta = bodyMeta.get(id);
        _dummy.position.set(wp.x, wp.y, wp.z);
        _dummy.scale.setScalar(meta.instanceScale * (meta.planetRadius || 1));
        const spin = planetSpins[i];
        if (spin) _dummy.quaternion.setFromAxisAngle(spin.axis, spin.speed * rotationTime);
        else _dummy.quaternion.identity();
        _dummy.updateMatrix();
        planetMarkers.setMatrixAt(i, _dummy.matrix);

        /* Crossfade: close = atlas texture, far = faction color */
        const dx = camPos.x - wp.x, dy = camPos.y - wp.y, dz = camPos.z - wp.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const cf = 1 - smoothstep(15, 80, dist);
        if (planetCrossfadeAttr.array[i] !== cf) {
          planetCrossfadeAttr.array[i] = cf;
          pcfDirty = true;
        }

        const starId = planetToStarId.get(id);
        if (starId) {
          const starWp = bodyWorldPos.get(starId);
          if (starWp) {
            const lx = starWp.x - wp.x, ly = starWp.y - wp.y, lz = starWp.z - wp.z;
            const len = Math.sqrt(lx * lx + ly * ly + lz * lz) || 1;
            const idx3 = i * 3;
            const nlx = lx / len, nly = ly / len, nlz = lz / len;
            if (planetLightDirAttr.array[idx3] !== nlx || planetLightDirAttr.array[idx3 + 1] !== nly) {
              planetLightDirAttr.array[idx3] = nlx;
              planetLightDirAttr.array[idx3 + 1] = nly;
              planetLightDirAttr.array[idx3 + 2] = nlz;
              pldDirty = true;
            }
          }
        }
      }
      planetMarkers.instanceMatrix.needsUpdate = true;
      if (pcfDirty) planetCrossfadeAttr.needsUpdate = true;
      if (pldDirty) planetLightDirAttr.needsUpdate = true;
    }

    if (hasCubes) {
      for (let i = 0; i < cubeIds.length; i++) {
        const wp = bodyWorldPos.get(cubeIds[i]);
        _dummy.position.set(wp.x, wp.y, wp.z);
        _dummy.scale.setScalar(bodyMeta.get(cubeIds[i]).instanceScale);
        const spin = cubeSpins[i];
        if (spin) _dummy.quaternion.setFromAxisAngle(spin.axis, spin.speed * rotationTime);
        _dummy.updateMatrix();
        cubeMarkers.setMatrixAt(i, _dummy.matrix);
      }
      cubeMarkers.instanceMatrix.needsUpdate = true;
    }

    /* Hitboxes not in any scene — update matrices manually for raycasting */
    for (const hb of hitboxes) {
      const wp = bodyWorldPos.get(hb.userData.landmarkId);
      if (!wp) continue;
      hb.position.set(wp.x, wp.y, wp.z);
      hb.updateMatrixWorld(true);
    }

    /* Photo Mode (F2) — hide orbits and hyperlanes for clean captures */
    const photoMode = document.body.classList.contains('screenshot-active');

    if (photoMode) {
      for (const [, ol] of orbitLines) ol.line.visible = false;
    } else if (wasPhotoMode && trackedOrbitId) {
      showOrbitsForBody(trackedOrbitId);
    }
    wasPhotoMode = photoMode;

    for (const [id, ol] of orbitLines) {
      if (!ol.line.visible) continue;
      const pw = bodyWorldPos.get(ol.parentId);
      if (pw) ol.line.position.set(pw.x, pw.y, pw.z);
      const orb = ol.orbital;
      const M = orb.M0 + (TWO_PI / orb.period) * rotationTime;
      const E = solveKepler(M, orb.e);
      ol.mat.uniforms.uTrailStart.value = ((E % TWO_PI) + TWO_PI) % TWO_PI / TWO_PI;
      /* Highlight tracked and/or selected orbit (no double-up if both) */
      const highlighted = id === trackedOrbitId || id === selectedId;
      ol.mat.uniforms.uTracked.value = highlighted ? 1.0 : 0.0;
      ol.mat.uniforms.uAttenuate.value = highlighted ? ORBIT_ATTENUATE * 0.5 : ORBIT_ATTENUATE;
      ol.mat.uniforms.uLucency.value = highlighted ? ORBIT_LUCENCY * 2.0 : ORBIT_LUCENCY;
    }

    /* Hyperlane endpoints + throttled occlusion checks */
    const runOcclusion = (++hlThrottle % 4) === 0;
    for (const hl of hyperlaneLines) {
      if (photoMode) { hl.line.visible = false; continue; }
      const fromId = preferStation.get(hl.fromId) || hl.fromId;
      const toId = preferStation.get(hl.toId) || hl.toId;
      const from = bodyWorldPos.get(fromId);
      const to = bodyWorldPos.get(toId);
      if (!from || !to) { hl.line.visible = false; continue; }

      /* Occlusion: check if lane passes through any body (throttled to every 4 frames) */
      if (runOcclusion) {
        let blocked = false;
        for (const bid of depthBuckets[0]) {
          if (bid === hl.fromId || bid === hl.toId || bid === fromId || bid === toId) continue;
          const bwp = bodyWorldPos.get(bid);
          const bm = bodyMeta.get(bid);
          if (!bwp || !bm) continue;
          const r = LANDMARK_IDS.has(bid) ? (bid === 'smbh' ? 15 : 0) : MARKER_RADIUS * bm.instanceScale * 1.5;
          if (r > 0 && lineHitsSphere(from, to, bwp, r)) { blocked = true; break; }
        }
        if (blocked) { hl.line.visible = false; continue; }
        hl.line.visible = true;
      }

      if (!hl.line.visible) continue;
      const arr = hl.posBuffer.array;
      arr[0] = from.x; arr[1] = from.y; arr[2] = from.z;
      arr[3] = to.x; arr[4] = to.y; arr[5] = to.z;
      hl.posBuffer.needsUpdate = true;
    }

    /* Screen-space BH disc radius for hiding labels behind the lensing */
    cachedBhNdcX = 0; cachedBhNdcY = 0; cachedBhScreenR = 0;
    if (lodFactor > 0) {
      _proj.set(0, 0, 0).project(camera);
      cachedBhNdcX = _proj.x; cachedBhNdcY = _proj.y;
      _proj.setFromMatrixColumn(camera.matrixWorld, 0).normalize().multiplyScalar(60);
      _proj.project(camera);
      cachedBhScreenR = Math.hypot(_proj.x - cachedBhNdcX, _proj.y - cachedBhNdcY);
    }

    /* Zone labels rotate with galaxy, fade when close */
    const camDist = camera.position.length();
    const zoneFade = smoothstep(150, 350, camDist);
    for (const zl of zoneLabels) {
      const rot = canonicalToRotated(zl.cx, zl.cz, rotationTime);
      zl.css2d.position.set(rot.x, 0, rot.z);
      let opacity = zoneFade * 0.8;
      if (cachedBhScreenR > 0) {
        _proj.set(rot.x, 0, rot.z).project(camera);
        const d = Math.hypot(_proj.x - cachedBhNdcX, _proj.y - cachedBhNdcY);
        opacity *= smoothstep(cachedBhScreenR * 0.5, cachedBhScreenR, d);
      }
      zl.el.style.opacity = String(opacity);
    }

    /* Label pool: reassign every N frames, update positions every frame */
    if (++labelAssignFrame >= LABEL_REASSIGN_EVERY) {
      labelAssignFrame = 0;
      reassignLabels();
    }
    labelsDirty = false;
    updatePool(rotationTime, cachedBhNdcX, cachedBhNdcY, cachedBhScreenR);
  }

  function getLabelTier(bodyId) {
    if (bodyId === selectedId || bodyId === hoveredId) return 1;
    const body = galaxyData.bodies[bodyId];
    if (body?.tags?.includes('landmark')) return 1;
    if (body?.tags?.includes('capital')) return 1;
    return 2;
  }

  /* Click/selection handling */
  function handleClick(event, mode) {
    _mouse.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );
    raycaster.setFromCamera(_mouse, camera);

    /* Bounding spheres are cached from first raycast — stale after rotation */
    if (starMarkers) starMarkers.computeBoundingSphere();
    if (sphereMarkers) sphereMarkers.computeBoundingSphere();
    if (cubeMarkers) cubeMarkers.computeBoundingSphere();
    if (planetMarkers) planetMarkers.computeBoundingSphere();

    if (mode === 'select' || mode === 'track' || !mode) {
      const allHits = [];
      /* Detail meshes cover stars — raycast all active pool entries */
      if (detailActiveIds.size > 0 && starDetail) {
        for (const child of starDetail.container.children) {
          if (!child.visible || !child.userData.bodyId) continue;
          for (const h of raycaster.intersectObject(child, true))
            allHits.push({ distance: h.distance, bodyId: child.userData.bodyId });
        }
      }
      /* Planet detail meshes — same pattern */
      if (planetDetailActiveIds.size > 0 && planetDetail) {
        for (const child of planetDetail.container.children) {
          if (!child.visible || !child.userData.bodyId) continue;
          for (const h of raycaster.intersectObject(child, true))
            allHits.push({ distance: h.distance, bodyId: child.userData.bodyId });
        }
      }
      if (starMarkers) {
        for (const h of raycaster.intersectObject(starMarkers))
          allHits.push({ distance: h.distance, bodyId: starIds[h.instanceId] });
      }
      if (sphereMarkers) {
        for (const h of raycaster.intersectObject(sphereMarkers))
          allHits.push({ distance: h.distance, bodyId: sphereIds[h.instanceId] });
      }
      if (cubeMarkers) {
        for (const h of raycaster.intersectObject(cubeMarkers))
          allHits.push({ distance: h.distance, bodyId: cubeIds[h.instanceId] });
      }
      if (planetMarkers) {
        for (const h of raycaster.intersectObject(planetMarkers))
          allHits.push({ distance: h.distance, bodyId: planetIds[h.instanceId] });
      }
      if (allHits.length > 0) {
        allHits.sort((a, b) => a.distance - b.distance);
        const hitId = allHits[0].bodyId;
        if (mode !== 'track') { selectedId = hitId; labelsDirty = true; reassignLabels(); }
        return { type: 'select', bodyId: hitId, body: galaxyData.bodies[hitId] };
      }

      /* Landmark hitboxes — skip any the camera is inside (they'd swallow all clicks) */
      if (hitboxes.length > 0) {
        /* Landmarks only clickable from galaxy overview distances */
        const farHitboxes = hitboxes.filter(hb => {
          const dx = camera.position.x - hb.position.x;
          const dy = camera.position.y - hb.position.y;
          const dz = camera.position.z - hb.position.z;
          return Math.sqrt(dx * dx + dy * dy + dz * dz) > Math.max(hb.scale.x * 8, 300);
        });
        const lmHits = raycaster.intersectObjects(farHitboxes);
        if (lmHits.length > 0) {
          lmHits.sort((a, b) => a.distance - b.distance);
          const lm = lmHits[0].object.userData;
          if (mode !== 'track') { selectedId = lm.landmarkId; labelsDirty = true; reassignLabels(); }
          return { type: 'select', bodyId: lm.landmarkId, body: galaxyData.bodies[lm.landmarkId] };
        }
      }
      if (mode !== 'track') { selectedId = null; labelsDirty = true; reassignLabels(); }
      return { type: 'deselect' };
    }

    if (mode === 'place') {
      const hit = raycaster.ray.intersectPlane(_placementPlane, _planeHit);
      if (hit) {
        return { type: 'place', position: { x: _planeHit.x, y: 0, z: _planeHit.z } };
      }
    }

    return null;
  }

  /* Pointer tracking for click-vs-drag detection */
  function initClickDetection(canvas, onAction) {
    canvas.addEventListener('contextmenu', e => e.preventDefault());

    canvas.addEventListener('pointerdown', (e) => {
      if (clickDisabled) return;
      pointerDownPos = { x: e.clientX, y: e.clientY, button: e.button };
    });

    canvas.addEventListener('pointerup', (e) => {
      if (!pointerDownPos) return;
      if (clickDisabled) { pointerDownPos = null; return; }
      if (e.button !== pointerDownPos.button) { pointerDownPos = null; return; }
      const dx = e.clientX - pointerDownPos.x;
      const dy = e.clientY - pointerDownPos.y;
      if (Math.sqrt(dx * dx + dy * dy) < CLICK_THRESHOLD) {
        const result = handleClick(e, e.button === 2 ? 'track' : 'select');
        if (result) result.button = e.button;
        if (onAction) onAction(result);
      }
      pointerDownPos = null;
    });
  }

  function resize() {
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    hyperlaneMat.resolution.set(window.innerWidth, window.innerHeight);
  }

  /* Body CRUD (triggers visual rebuild) */
  function addBody(id, body) {
    galaxyData.bodies[id] = body;
    rebuildMarkers();
    autosave();
  }

  function updateBody(id, changes) {
    if (!galaxyData.bodies[id]) return;
    Object.assign(galaxyData.bodies[id], changes);
    rebuildMarkers();
    autosave();
  }

  function removeBody(id) {
    delete galaxyData.bodies[id];
    for (const [hlId, hl] of Object.entries(galaxyData.hyperlanes)) {
      if (hl.fromId === id || hl.toId === id) {
        delete galaxyData.hyperlanes[hlId];
      } else if (hl.via) {
        hl.via = hl.via.filter(v => v !== id);
      }
    }
    rebuildMarkers();
    autosave();
  }

  function initZoneLabels() {
    for (const [zid, zone] of Object.entries(galaxyData.zones)) {
      if (zid === 'core' || zid === 'a-b' || !zone.position) continue;
      const div = document.createElement('div');
      div.className = 'zone-label';
      const displayName = ZONE_BREAKS[zid] || zone.name;
      displayName.split('\n').forEach((line, i) => {
        if (i > 0) div.appendChild(document.createElement('br'));
        div.appendChild(document.createTextNode(line));
      });
      const fc = ZONE_FACTIONS[zid];
      if (fc) div.style.color = fc.startsWith('#') ? fc : (galaxyData.factions[fc]?.color || '#5ce1e6');
      const obj = new CSS2DObject(div);
      obj.position.set(zone.position.x, 0, zone.position.z);
      scene.add(obj);
      zoneLabels.push({ css2d: obj, el: div, cx: zone.position.x, cz: zone.position.z });
    }
  }

  /* Init */
  await loadData();

  /* Bake star atlas before first rebuild so stars get the textured material */
  try {
    const atlasShaders = await loadShaderPair('star-atlas');
    starAtlasMat = new THREE.ShaderMaterial({
      vertexShader: atlasShaders.vert,
      fragmentShader: atlasShaders.frag,
      glslVersion: THREE.GLSL3,
      uniforms: { uAtlas: { value: null }, uVisualScale: { value: 0.87 } },
      defines: { USE_INSTANCING: '', USE_INSTANCING_COLOR: '' },
    });
    starAtlasData = await bakeStarAtlas(renderer, galaxyData.bodies);
    starAtlasMat.uniforms.uAtlas.value = starAtlasData.atlas;
    starDetail = await createStarDetail(renderer);
    markerScene.add(starDetail.container);
    pulsarTorusShaders = await loadShaderPair('pulsar-torus');
    pulsarTorusGeoFar = new THREE.TorusGeometry(4, 3.95, 16, 32);
  } catch (e) {
    console.warn('Star atlas bake failed, falling back to basic material:', e);
  }

  /* Orbit shaders — independent of atlas pipeline so a bake failure doesn't kill orbits */
  try {
    orbitShaders = await loadShaderPair('orbit');
  } catch (e) {
    console.warn('Orbit shaders failed to load, orbits disabled:', e);
  }

  /* Planet atlas — same pattern, separate InstancedMesh */
  try {
    const [planetShaders, noiseSrc] = await Promise.all([
      loadShaderPair('planet-atlas'),
      loadShader('galaxy/shaders/noise-common.glsl'),
    ]);
    const planetAtlasFrag = planetShaders.frag.replace('/* @include noise-common */', noiseSrc);
    planetAtlasMat = new THREE.ShaderMaterial({
      vertexShader: planetShaders.vert,
      fragmentShader: planetAtlasFrag,
      glslVersion: THREE.GLSL3,
      uniforms: {
        uAtlas: { value: null },
        uVisualScale: { value: 0.87 },
        uTime: { value: 0 },
      },
      defines: { USE_INSTANCING: '', USE_INSTANCING_COLOR: '' },
    });
    planetAtlasData = await bakePlanetAtlas(renderer, galaxyData.bodies);
    if (planetAtlasData.atlas) {
      planetAtlasMat.uniforms.uAtlas.value = planetAtlasData.atlas;
    }
    planetDetail = await createPlanetDetail(renderer);
    if (planetAtlasData.paramsCache) planetDetail.setParamsCache(planetAtlasData.paramsCache);
    markerScene.add(planetDetail.container);
  } catch (e) {
    console.warn('Planet atlas bake failed, falling back to basic material:', e);
  }

  initLabelPool();
  initZoneLabels();
  rebuildMarkers();

  return {
    update,
    resize,
    handleClick,
    initClickDetection,
    setClickDisabled: (v) => { clickDisabled = v; },
    setMuseActive: (v) => { museActive = v; labelsDirty = true; if (v) reassignLabels(); },
    getData: () => galaxyData,
    getSelectedId: () => selectedId,
    setSelectedId: (id) => { selectedId = id; labelsDirty = true; reassignLabels(); },
    setHoveredId: (id) => { hoveredId = id; labelsDirty = true; },
    addBody,
    updateBody,
    removeBody,
    generateId,
    exportJSON,
    importJSON,
    revertToSaved,
    rebuildMarkers,
    autosave,
    rebakePlanetAtlas,
    rebakeStarAtlas,
    rebakeSinglePlanet,
    rebakeSingleStar,
    angularSpeed,
    canonicalToRotated,
    rotatedToCanonical,
    getBodyWorldPos: (id) => bodyWorldPos.get(id) || null,
    getBodyMeta: (id) => bodyMeta.get(id) || null,
    showOrbitsForBody,
    hideOrbits,
    get needsLabelRender() { return needsLabelRender; },
    set needsLabelRender(v) { needsLabelRender = v; },
    labelRenderer,
    markerScene,
    /* Force GPU to compile all hidden detail shader programs during loading */
    warmUpShaders(renderer, camera) {
      const targets = [];
      /* Collect one material from each pool entry type — planet detail + atmo + glow */
      if (planetDetail) {
        for (const child of planetDetail.container.children) {
          if (!child.visible) { child.visible = true; targets.push(child); }
          for (const gc of child.children) {
            if (!gc.visible) { gc.visible = true; targets.push(gc); }
          }
        }
      }
      if (starDetail) {
        for (const child of starDetail.container.children) {
          if (!child.visible) { child.visible = true; targets.push(child); }
          for (const gc of child.children) {
            if (!gc.visible) { gc.visible = true; targets.push(gc); }
          }
        }
      }
      renderer.compile(markerScene, camera);
      for (const t of targets) t.visible = false;
    }
  };
}
