/* Galaxy data + interactive layer — JSON persistence, markers, labels, raycasting */

import * as THREE from 'three';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { createRng } from './rng.js';

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

function isGasNGripe(id) { return id.startsWith('gas-n-gripe'); }

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

/* Compute orbit ellipse vertices in parent-relative coordinates */
function computeOrbitPath(orbital, segments = 64) {
  const { a, e, incl, omega, Omega } = orbital;
  const positions = new Float32Array((segments + 1) * 3);
  const cw = Math.cos(omega), sw = Math.sin(omega);
  const ci = Math.cos(incl),  si = Math.sin(incl);
  const cO = Math.cos(Omega), sO = Math.sin(Omega);
  const b = Math.sqrt(1 - e * e);
  for (let i = 0; i <= segments; i++) {
    const E = (i / segments) * TWO_PI;
    const px = a * (Math.cos(E) - e);
    const py = a * b * Math.sin(E);
    const j = i * 3;
    positions[j]     = (cO * cw - sO * sw * ci) * px + (-cO * sw - sO * cw * ci) * py;
    positions[j + 1] = sw * si * px + cw * si * py;
    positions[j + 2] = (sO * cw + cO * sw * ci) * px + (-sO * sw + cO * cw * ci) * py;
  }
  return positions;
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
  let starColorLerp = [];
  let cubeSpins = [];

  /* Hyperlane endpoint redirect: star → outermost orbiting station */
  const preferStation = new Map();

  /* Orbit path lines — visible only when tracking */
  const orbitLines = new Map();
  const orbitSolidTracked = new THREE.LineBasicMaterial({ color: 0xc0c0c8, transparent: true, opacity: 0.8, depthWrite: false });
  const orbitSolidOther   = new THREE.LineBasicMaterial({ color: 0xc0c0c8, transparent: true, opacity: 0.5, depthWrite: false });
  const orbitDashedTracked = new THREE.LineDashedMaterial({ color: 0xc0c0c8, transparent: true, opacity: 0.8, depthWrite: false, dashSize: 0.3, gapSize: 0.2 });
  const orbitDashedOther   = new THREE.LineDashedMaterial({ color: 0xc0c0c8, transparent: true, opacity: 0.5, depthWrite: false, dashSize: 0.3, gapSize: 0.2 });

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

  /* Two InstancedMesh groups: spheres (stars/stations) and cubes (Gas-n-Gripes) */
  const sphereGeo = new THREE.SphereGeometry(MARKER_RADIUS, MARKER_SEGMENTS, 8);
  const cubeGeo = new THREE.BoxGeometry(1, 1, 1);
  const markerMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  let sphereMarkers = null, cubeMarkers = null;
  let sphereIds = [], cubeIds = [];
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
    a.href = url; a.download = 'galaxy.json'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  }

  function importJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          galaxyData = JSON.parse(e.target.result);
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
    rebuildMarkers();
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

  /* White for GnGs + independents, lightened faction color for everyone else */
  function getLabelColor(id, body) {
    if (isGasNGripe(id)) return '#ffffff';
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

    /* Depth 0: root bodies with galactic positions */
    for (const [id, body] of Object.entries(galaxyData.bodies)) {
      if (!body.position) continue;
      const instanceScale = isGasNGripe(id)
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

        /* Moon orbits scale to parent's orbit — keeps them inside the Hill sphere */
        let minR, spacing;
        if (depth === 1) {
          minR = ORBIT_RADIUS[1][0];
          spacing = 2.0;
        } else {
          const parentA = bodyMeta.get(parentId)?.orbital?.a || 3;
          const maxR = parentA * 0.35;
          minR = maxR * 0.25;
          spacing = Math.max(0.15, (maxR - minR) / Math.max(childIds.length, 1));
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
            if (src?.incl == null)
              orbitals[i].orbital.incl = Math.max(0, baseTilt + scatter.gauss() * 5 * (Math.PI / 180));
            if (src?.Omega == null)
              orbitals[i].orbital.Omega = baseAz + scatter.gauss() * 8 * (Math.PI / 180);
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
            const scatter = createRng(hashString(orbitals[i].id) + 99);
            orbitals[i].orbital.incl = Math.max(0, poleTilt + scatter.gauss() * 3 * (Math.PI / 180));
            orbitals[i].orbital.Omega = poleAzimuth + scatter.gauss() * 2 * (Math.PI / 180);
          }
        }

        const depthFactor = DEPTH_SCALE[Math.min(depth, 3)];
        for (const o of orbitals) {
          const instanceScale = isGasNGripe(o.id)
            ? (FULL_SIZE_CUBES.has(o.id) ? CUBE_FULL : CUBE_SMALL) * depthFactor
            : depthFactor;
          bodyMeta.set(o.id, { depth, parentId, orbital: o.orbital, instanceScale });
          depthBuckets[depth].push(o.id);
          bodyWorldPos.set(o.id, { x: 0, y: 0, z: 0 });
        }
      }
    }
  }

  function rebuildMarkers() {
    if (sphereMarkers) { markerScene.remove(sphereMarkers); sphereMarkers.dispose(); }
    if (cubeMarkers) { markerScene.remove(cubeMarkers); cubeMarkers.dispose(); }
    sphereMarkers = null;
    cubeMarkers = null;
    hitboxes.forEach(hb => { if (hb.parent) hb.removeFromParent(); });
    hitboxes.length = 0;

    resolveHierarchy();

    sphereIds = [];
    cubeIds = [];
    starColorLerp = [];
    cubeSpins = [];
    allPositionedIds = [];
    for (const [id] of bodyMeta) {
      allPositionedIds.push(id);
      if (LANDMARK_IDS.has(id)) continue;
      if (isGasNGripe(id)) cubeIds.push(id);
      else sphereIds.push(id);
    }

    /* Sphere InstancedMesh (stars + non-GnG stations) */
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
        const bodyColor = getBodyColor(body);
        _color.set(bodyColor);
        sphereMarkers.setColorAt(i, _color);

        /* Track stars with spectral colors for distance-based faction→spectral lerp */
        if (meta.depth === 0 && body.visual?.spectralColor && body.visual.spectralColor !== bodyColor) {
          starColorLerp.push({
            index: i,
            factionColor: new THREE.Color(bodyColor),
            spectralColor: new THREE.Color(body.visual.spectralColor)
          });
        }
      }
      sphereMarkers.instanceMatrix.needsUpdate = true;
      if (sphereMarkers.instanceColor) sphereMarkers.instanceColor.needsUpdate = true;
      markerScene.add(sphereMarkers);
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

    /* Orbit path lines for each child body */
    for (const [, ol] of orbitLines) markerScene.remove(ol.line);
    orbitLines.clear();
    for (const [id, meta] of bodyMeta) {
      if (meta.depth === 0 || !meta.orbital) continue;
      let rootId = meta.parentId;
      let rm = bodyMeta.get(rootId);
      while (rm && rm.depth > 0) { rootId = rm.parentId; rm = bodyMeta.get(rootId); }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(computeOrbitPath(meta.orbital), 3));
      const isDashed = meta.depth >= 2;
      const line = new THREE.LineLoop(geo, isDashed ? orbitDashedOther : orbitSolidOther);
      if (isDashed) line.computeLineDistances();
      line.renderOrder = 6;
      line.visible = false;
      markerScene.add(line);
      orbitLines.set(id, { line, parentId: meta.parentId, rootId });
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
  }

  /* Show orbit paths for a tracked body's entire system */
  function showOrbitsForBody(bodyId) {
    for (const [id, ol] of orbitLines) {
      let rootId = ol.rootId;
      let trackedRoot = bodyId;
      let tm = bodyMeta.get(trackedRoot);
      while (tm && tm.depth > 0) { trackedRoot = tm.parentId; tm = bodyMeta.get(trackedRoot); }

      if (rootId === trackedRoot) {
        ol.line.visible = true;
        const isDashed = bodyMeta.get(id).depth >= 2;
        ol.line.material = id === bodyId
          ? (isDashed ? orbitDashedTracked : orbitSolidTracked)
          : (isDashed ? orbitDashedOther : orbitSolidOther);
        if (isDashed) ol.line.computeLineDistances();
      } else {
        ol.line.visible = false;
      }
    }
  }

  function hideOrbits() {
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
          entry.el.style.textDecoration = body.tags?.includes('destroyed') ? 'line-through' : 'none';
          entry.el.appendChild(document.createTextNode(body.name || id));
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

  /* Per-frame update: rotate markers + labels to match galactic disk */
  function update(delta, rotationTime, lodFactor) {
    lastRotationTime = rotationTime;
    const hasSpheres = sphereMarkers && sphereIds.length > 0;
    const hasCubes = cubeMarkers && cubeIds.length > 0;

    if (!hasSpheres && !hasCubes) return;

    /* Compute world positions in depth order */
    for (const id of depthBuckets[0]) {
      const body = galaxyData.bodies[id];
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

    /* Write instance matrices from world positions */
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

      /* Distance-based star color: faction at distance → spectral up close */
      if (starColorLerp.length > 0) {
        const camPos = camera.position;
        for (const sc of starColorLerp) {
          const wp = bodyWorldPos.get(sphereIds[sc.index]);
          const dx = camPos.x - wp.x, dy = camPos.y - wp.y, dz = camPos.z - wp.z;
          const t = 1 - smoothstep(25, 120, Math.sqrt(dx * dx + dy * dy + dz * dz));
          _color.copy(sc.factionColor).lerp(sc.spectralColor, t);
          sphereMarkers.setColorAt(sc.index, _color);
        }
        sphereMarkers.instanceColor.needsUpdate = true;
      }
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

    /* Orbit lines follow their parent's world position */
    for (const [, ol] of orbitLines) {
      if (!ol.line.visible) continue;
      const pw = bodyWorldPos.get(ol.parentId);
      if (pw) ol.line.position.set(pw.x, pw.y, pw.z);
    }

    /* Hyperlane endpoints: prefer GnG stations over parent stars */
    for (const hl of hyperlaneLines) {
      const fromId = preferStation.get(hl.fromId) || hl.fromId;
      const toId = preferStation.get(hl.toId) || hl.toId;
      const from = bodyWorldPos.get(fromId);
      const to = bodyWorldPos.get(toId);
      if (!from || !to) { hl.line.visible = false; continue; }

      /* Hide lane if it passes through any body (orbital interference) */
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

      const arr = hl.posBuffer.array;
      arr[0] = from.x; arr[1] = from.y; arr[2] = from.z;
      arr[3] = to.x; arr[4] = to.y; arr[5] = to.z;
      hl.posBuffer.needsUpdate = true;

      hl.line.visible = true;
    }

    /* Screen-space BH disc radius for hiding labels behind the lensing */
    /* Measure BH disc in screen space along camera-right so it's correct at any angle */
    let bhNdcX = 0, bhNdcY = 0, bhScreenR = 0;
    if (lodFactor > 0) {
      _proj.set(0, 0, 0).project(camera);
      bhNdcX = _proj.x; bhNdcY = _proj.y;
      _proj.setFromMatrixColumn(camera.matrixWorld, 0).normalize().multiplyScalar(60);
      _proj.project(camera);
      bhScreenR = Math.hypot(_proj.x - bhNdcX, _proj.y - bhNdcY);
    }

    /* Zone labels rotate with galaxy, fade when close */
    const camDist = camera.position.length();
    const zoneFade = smoothstep(150, 350, camDist);
    for (const zl of zoneLabels) {
      const rot = canonicalToRotated(zl.cx, zl.cz, rotationTime);
      zl.css2d.position.set(rot.x, 0, rot.z);
      let opacity = zoneFade * 0.8;
      if (bhScreenR > 0) {
        _proj.set(rot.x, 0, rot.z).project(camera);
        const d = Math.hypot(_proj.x - bhNdcX, _proj.y - bhNdcY);
        opacity *= smoothstep(bhScreenR * 0.5, bhScreenR, d);
      }
      zl.el.style.opacity = String(opacity);
    }

    /* Label pool: reassign every N frames, update positions every frame */
    if (++labelAssignFrame >= LABEL_REASSIGN_EVERY) {
      labelAssignFrame = 0;
      reassignLabels();
    }
    updatePool(rotationTime, bhNdcX, bhNdcY, bhScreenR);
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
    if (sphereMarkers) sphereMarkers.computeBoundingSphere();
    if (cubeMarkers) cubeMarkers.computeBoundingSphere();

    if (mode === 'select' || mode === 'track' || !mode) {
      const allHits = [];
      if (sphereMarkers) {
        for (const h of raycaster.intersectObject(sphereMarkers))
          allHits.push({ distance: h.distance, bodyId: sphereIds[h.instanceId] });
      }
      if (cubeMarkers) {
        for (const h of raycaster.intersectObject(cubeMarkers))
          allHits.push({ distance: h.distance, bodyId: cubeIds[h.instanceId] });
      }
      if (allHits.length > 0) {
        allHits.sort((a, b) => a.distance - b.distance);
        const hitId = allHits[0].bodyId;
        if (mode !== 'track') { selectedId = hitId; reassignLabels(); }
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
          if (mode !== 'track') { selectedId = lm.landmarkId; reassignLabels(); }
          return { type: 'select', bodyId: lm.landmarkId, body: galaxyData.bodies[lm.landmarkId] };
        }
      }
      if (mode !== 'track') { selectedId = null; reassignLabels(); }
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
  initLabelPool();
  initZoneLabels();
  rebuildMarkers();

  return {
    update,
    resize,
    handleClick,
    initClickDetection,
    setClickDisabled: (v) => { clickDisabled = v; },
    setMuseActive: (v) => { museActive = v; if (v) reassignLabels(); },
    getData: () => galaxyData,
    getSelectedId: () => selectedId,
    setSelectedId: (id) => { selectedId = id; reassignLabels(); },
    setHoveredId: (id) => { hoveredId = id; },
    addBody,
    updateBody,
    removeBody,
    generateId,
    exportJSON,
    importJSON,
    revertToSaved,
    rebuildMarkers,
    autosave,
    angularSpeed,
    canonicalToRotated,
    rotatedToCanonical,
    getBodyWorldPos: (id) => bodyWorldPos.get(id) || null,
    showOrbitsForBody,
    hideOrbits,
    labelRenderer,
    markerScene
  };
}
