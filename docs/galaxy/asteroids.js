import * as THREE from 'three';
import { loadShaderPair } from './shaders.js';
import { createRng } from './rng.js';

/* Perlin gradient noise — CPU-side only, runs once at init */
const PERM = new Uint8Array(512);
const GRAD3 = [
  [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
  [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
  [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]
];

function initPerlin(seed) {
  const rng = createRng(seed);
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = (rng.next() * (i + 1)) | 0;
    const tmp = p[i]; p[i] = p[j]; p[j] = tmp;
  }
  for (let i = 0; i < 512; i++) PERM[i] = p[i & 255];
}

function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
function lerp(a, b, t) { return a + t * (b - a); }
function dot3(g, x, y, z) { return g[0] * x + g[1] * y + g[2] * z; }

function noise3d(x, y, z) {
  const X = Math.floor(x) & 255, Y = Math.floor(y) & 255, Z = Math.floor(z) & 255;
  x -= Math.floor(x); y -= Math.floor(y); z -= Math.floor(z);
  const u = fade(x), v = fade(y), w = fade(z);
  const A = PERM[X] + Y, AA = PERM[A] + Z, AB = PERM[A + 1] + Z;
  const B = PERM[X + 1] + Y, BA = PERM[B] + Z, BB = PERM[B + 1] + Z;
  return lerp(
    lerp(lerp(dot3(GRAD3[PERM[AA] % 12], x, y, z),
              dot3(GRAD3[PERM[BA] % 12], x - 1, y, z), u),
         lerp(dot3(GRAD3[PERM[AB] % 12], x, y - 1, z),
              dot3(GRAD3[PERM[BB] % 12], x - 1, y - 1, z), u), v),
    lerp(lerp(dot3(GRAD3[PERM[AA + 1] % 12], x, y, z - 1),
              dot3(GRAD3[PERM[BA + 1] % 12], x - 1, y, z - 1), u),
         lerp(dot3(GRAD3[PERM[AB + 1] % 12], x, y - 1, z - 1),
              dot3(GRAD3[PERM[BB + 1] % 12], x - 1, y - 1, z - 1), u), v), w);
}

function noise2d(x, y) { return noise3d(x, y, 0); }

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return h >>> 0;
}

function smoothstep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

const INNER_R = 100;
const OUTER_R = 220;
const PEAK_LO = 140;
const PEAK_HI = 180;
const GAP_ANGLE = Math.atan2(125, 71);
const GAP_HALF_WIDTH = 0.35;
const GAP_MIN_DENSITY = 0.15;
const EXCLUSION_DEFAULT = 18;
const BODY_SCAN_INNER = 80;
const BODY_SCAN_OUTER = 250;
const HYPERLANE_HALF_WIDTH = 8;

/* Drift/collision physics */
const DRIFT_ACTIVATION_R = 100;
const DRIFT_DEACTIVATION_R = 120;
const DRIFT_BELT_INNER = 80;
const DRIFT_BELT_OUTER = 240;
const DRIFT_MAX_ACTIVE = 500;
const DRIFT_SPEED_MIN = 0.03;
const DRIFT_SPEED_MAX = 0.15;
const DRIFT_RESTORE_K = 0.003;
const DRIFT_DAMPING = 0.97;
const DRIFT_MAX_VEL = 0.5;
const DRIFT_EASE_IN = 0.5;
const DRIFT_EASE_OUT = 2.0;
const DRIFT_REBUILD_INTERVAL = 30;
const COLL_RESTITUTION = 0.6;
const COLL_GRID_SIZE = 10;
const COLL_MAX_PER_FRAME = 2;
const COLL_RADIUS_FACTOR = 0.4;
const ANIM_REVERSE_CHANCE_LIGHT = 0.6;
const ANIM_REVERSE_CHANCE_HEAVY = 0.3;
const COLLISION_COOLDOWN = 5.0;
const SPLIT_CHANCE = 0.4;
const SPLIT_MIN = 3;
const SPLIT_MAX = 5;
const LILGUY_SPARES = 200;

function radialDensity(r) {
  const rampUp = smoothstep(INNER_R, PEAK_LO, r);
  const rampDown = 1.0 - smoothstep(PEAK_HI, OUTER_R, r);
  return rampUp * rampDown;
}

function cowardGap(theta) {
  const diff = Math.atan2(Math.sin(theta - GAP_ANGLE), Math.cos(theta - GAP_ANGLE));
  const angularDist = Math.abs(diff);
  const gapFactor = smoothstep(0.0, GAP_HALF_WIDTH, angularDist);
  return GAP_MIN_DENSITY + (1.0 - GAP_MIN_DENSITY) * gapFactor;
}

/* Point-to-segment squared distance in XZ plane */
function distToSegmentSq(px, pz, ax, az, bx, bz) {
  const dx = bx - ax, dz = bz - az;
  const lenSq = dx * dx + dz * dz;
  if (lenSq < 0.001) return (px - ax) * (px - ax) + (pz - az) * (pz - az);
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / lenSq));
  const projX = ax + t * dx, projZ = az + t * dz;
  return (px - projX) * (px - projX) + (pz - projZ) * (pz - projZ);
}

function buildExclusionZones(data) {
  const circles = [];
  const segments = [];
  const bodies = data.bodies || {};

  /* Find max child orbital radius per parent (explicit orbital.a or default spacing) */
  const maxChildRadius = {};
  for (const [, body] of Object.entries(bodies)) {
    if (!body.parentId) continue;
    const a = body.orbital?.a || (body.orbital?.order || 1) * 2.0;
    const prev = maxChildRadius[body.parentId] || 0;
    maxChildRadius[body.parentId] = Math.max(prev, a);
  }

  /* Circle exclusion around every body with a position in the scan band */
  for (const [id, body] of Object.entries(bodies)) {
    if (!body.position) continue;
    const x = body.position.x, z = body.position.z;
    const r = Math.sqrt(x * x + z * z);
    if (r < BODY_SCAN_INNER || r > BODY_SCAN_OUTER) continue;
    const childMax = maxChildRadius[id] || 0;
    const radius = Math.max(EXCLUSION_DEFAULT, childMax + 8);
    circles.push({ x, z, r2: radius * radius });
  }

  /* Hyperlane corridor exclusion — line segments between star positions */
  const hyperlanes = data.hyperlanes || {};
  for (const [, hl] of Object.entries(hyperlanes)) {
    const from = bodies[hl.fromId], to = bodies[hl.toId];
    if (!from?.position || !to?.position) continue;
    segments.push({
      ax: from.position.x, az: from.position.z,
      bx: to.position.x, bz: to.position.z
    });
  }

  return { circles, segments };
}

function inExclusionZone(x, z, zones) {
  for (const c of zones.circles) {
    const dx = x - c.x, dz = z - c.z;
    if (dx * dx + dz * dz < c.r2) return true;
  }
  const hw2 = HYPERLANE_HALF_WIDTH * HYPERLANE_HALF_WIDTH;
  for (const s of zones.segments) {
    if (distToSegmentSq(x, z, s.ax, s.az, s.bx, s.bz) < hw2) return true;
  }
  return false;
}

function generatePositions(count, rng, exclusionZones) {
  const offsets = new Float32Array(count * 3);
  const timeOffsets = new Float32Array(count);
  const radii = new Float32Array(count);
  const tints = new Float32Array(count);

  let placed = 0;
  let attempts = 0;
  const maxAttempts = count * 40;

  while (placed < count && attempts < maxAttempts) {
    attempts++;

    /* Random polar position biased toward mid-band */
    const r = INNER_R + (OUTER_R - INNER_R) * Math.pow(rng.next(), 0.7);
    const theta = rng.next() * Math.PI * 2;
    const x = r * Math.cos(theta);
    const z = r * Math.sin(theta);

    /* Density evaluation */
    const rd = radialDensity(r);
    const edgeMod = 0.7 + 0.3 * (noise2d(theta * 2.0, r * 0.01) * 0.5 + 0.5);
    const clump = 0.25 + 0.75 * smoothstep(-0.2, 0.6, noise3d(x * 0.025, 0, z * 0.025));
    const gap = cowardGap(theta);
    const density = rd * edgeMod * clump * gap;

    if (rng.next() > density) continue;
    if (inExclusionZone(x, z, exclusionZones)) continue;

    /* Gaussian Y spread — thicker at peak density, thinner at edges */
    const sigma = 3.0 + 5.0 * radialDensity(r);
    const y = rng.gauss() * sigma;

    offsets[placed * 3]     = x;
    offsets[placed * 3 + 1] = y;
    offsets[placed * 3 + 2] = z;
    radii[placed] = r;
    tints[placed] = 0.7 + rng.next() * 0.3;
    timeOffsets[placed] = rng.next() * 100.0;

    placed++;
  }

  return { offsets, radii, tints, timeOffsets, placed };
}

let bigBoiMesh = null;
let lilGuyMesh = null;
let megaMesh = null;
let bigBoiMat = null;
let lilGuyMat = null;
let megaMat = null;

/* Per-population refs needed for drift system buffer mutation */
const populations = {};

/* Active asteroid tracking — keyed by "pop-index" (e.g. "big-42") */
const activeSet = new Map();
const deadSet = new Set();
const spareIndices = [];
let driftActive = false;
let rebuildCounter = 0;

const BIGBOI = {
  texture: 'galaxy/textures/BigBoi.webp',
  columns: 12, rows: 10, totalFrames: 120,
  count: 4000,
  sizeMin: 1.5, sizeMax: 4.0,
  fps: 12,
  seed: 'nevertellmetheodds'
};

const LILGUY = {
  texture: 'galaxy/textures/LilGuy.webp',
  columns: 10, rows: 6, totalFrames: 60,
  count: 11000,
  sizeMin: 0.3, sizeMax: 1.2,
  fps: 14,
  seed: 372021
};

const MEGA = {
  texture: 'galaxy/textures/BigBoi.webp',
  columns: 12, rows: 10, totalFrames: 120,
  count: 5,
  sizeMin: 10.0, sizeMax: 18.0,
  fps: 6,
  seed: 'absoluteunit'
};

/* Mega asteroids: placed only in the densest patches, far from each other */
function generateMegaPositions(count, rng, exclusionZones) {
  const offsets = new Float32Array(count * 3);
  const timeOffsets = new Float32Array(count);
  const radii = new Float32Array(count);
  const tints = new Float32Array(count);
  const megaPositions = [];

  let placed = 0;
  let attempts = 0;
  const maxAttempts = count * 2000;
  const minMegaSpacing = 60;

  while (placed < count && attempts < maxAttempts) {
    attempts++;
    const r = INNER_R + (OUTER_R - INNER_R) * Math.pow(rng.next(), 0.5);
    const theta = rng.next() * Math.PI * 2;
    const x = r * Math.cos(theta);
    const z = r * Math.sin(theta);

    const rd = radialDensity(r);
    const clump = 0.25 + 0.75 * smoothstep(-0.2, 0.6, noise3d(x * 0.025, 0, z * 0.025));
    const gap = cowardGap(theta);
    const density = rd * clump * gap;

    /* Only place in top-density areas */
    if (density < 0.65) continue;
    if (inExclusionZone(x, z, exclusionZones)) continue;

    /* Enforce spacing between megas */
    let tooClose = false;
    for (const mp of megaPositions) {
      const dx = x - mp.x, dz = z - mp.z;
      if (dx * dx + dz * dz < minMegaSpacing * minMegaSpacing) { tooClose = true; break; }
    }
    if (tooClose) continue;

    const y = rng.gauss() * 2.0;
    offsets[placed * 3]     = x;
    offsets[placed * 3 + 1] = y;
    offsets[placed * 3 + 2] = z;
    radii[placed] = r;
    tints[placed] = 0.6 + rng.next() * 0.2;
    timeOffsets[placed] = rng.next() * 100.0;
    megaPositions.push({ x, z });
    placed++;
  }

  return { offsets, radii, tints, timeOffsets, placed };
}

function createAsteroidMesh(cfg, shaders, rng, exclusionZones, lightmap, megaMode, spareCount) {
  const { offsets, radii, tints, timeOffsets, placed } = megaMode
    ? generateMegaPositions(cfg.count, rng, exclusionZones)
    : generatePositions(cfg.count, rng, exclusionZones);

  const total = placed + (spareCount || 0);

  /* Per-instance scale — spares start at 0 (invisible) */
  const scaleArr = new Float32Array(total);
  for (let i = 0; i < placed; i++)
    scaleArr[i] = cfg.sizeMin + (cfg.sizeMax - cfg.sizeMin) * rng.next();

  /* Per-instance animation direction — all forward initially */
  const animDirArr = new Float32Array(total);
  animDirArr.fill(1.0);

  /* Extend placement buffers for spares (zeroed positions, mid-belt radius) */
  const finalOffsets = new Float32Array(total * 3);
  finalOffsets.set(offsets.subarray(0, placed * 3));
  const finalRadii = new Float32Array(total);
  finalRadii.set(radii.subarray(0, placed));
  for (let i = placed; i < total; i++) finalRadii[i] = 160;
  const finalTints = new Float32Array(total);
  finalTints.set(tints.subarray(0, placed));
  for (let i = placed; i < total; i++) finalTints[i] = 1.0;
  const finalTimeOffsets = new Float32Array(total);
  finalTimeOffsets.set(timeOffsets.subarray(0, placed));
  for (let i = placed; i < total; i++) finalTimeOffsets[i] = rng.next() * 100.0;

  const geo = new THREE.PlaneGeometry(1, 1);
  const instGeo = new THREE.InstancedBufferGeometry();
  instGeo.index = geo.index;
  instGeo.attributes.position = geo.attributes.position;
  instGeo.attributes.uv = geo.attributes.uv;
  instGeo.instanceCount = total;

  instGeo.setAttribute('aOffset',
    new THREE.InstancedBufferAttribute(finalOffsets, 3));
  instGeo.setAttribute('aScale',
    new THREE.InstancedBufferAttribute(scaleArr, 1));
  instGeo.setAttribute('aTimeOffset',
    new THREE.InstancedBufferAttribute(finalTimeOffsets, 1));
  instGeo.setAttribute('aRadius',
    new THREE.InstancedBufferAttribute(finalRadii, 1));
  instGeo.setAttribute('aTint',
    new THREE.InstancedBufferAttribute(finalTints, 1));
  instGeo.setAttribute('aAnimDir',
    new THREE.InstancedBufferAttribute(animDirArr, 1));

  const tex = new THREE.TextureLoader().load(cfg.texture);
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;

  const mat = new THREE.ShaderMaterial({
    vertexShader: shaders.vert,
    fragmentShader: shaders.frag,
    uniforms: {
      uTime:        { value: 0 },
      uColumns:     { value: cfg.columns },
      uRows:        { value: cfg.rows },
      uTotalFrames: { value: cfg.totalFrames },
      uFPS:         { value: cfg.fps },
      uSpriteSheet: { value: tex },
      uLightmap:    { value: lightmap }
    },
    side: THREE.DoubleSide,
    depthWrite: true,
    depthTest: true,
    transparent: false,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1
  });

  const mesh = new THREE.Mesh(instGeo, mat);
  mesh.frustumCulled = false;
  return { mesh, mat, count: placed, scaleArr, spareStart: placed, spareCount: spareCount || 0 };
}

export async function init(scene, data, lightmap) {
  initPerlin(42069);
  const shaders = await loadShaderPair('asteroid');
  const exclusionZones = buildExclusionZones(data);

  const bigRng = createRng(hashString(BIGBOI.seed));
  const big = createAsteroidMesh(BIGBOI, shaders, bigRng, exclusionZones, lightmap, false);
  bigBoiMesh = big.mesh;
  bigBoiMat = big.mat;
  scene.add(bigBoiMesh);
  const bigGeo = big.mesh.geometry;
  populations.big = {
    mesh: big.mesh, count: big.count, scales: big.scaleArr,
    offsetAttr: bigGeo.getAttribute('aOffset'),
    scaleAttr: bigGeo.getAttribute('aScale'),
    animDirAttr: bigGeo.getAttribute('aAnimDir'),
    timeOffsetAttr: bigGeo.getAttribute('aTimeOffset')
  };

  const lilRng = createRng(typeof LILGUY.seed === 'number'
    ? LILGUY.seed : hashString(LILGUY.seed));
  const lil = createAsteroidMesh(LILGUY, shaders, lilRng, exclusionZones, lightmap, false, LILGUY_SPARES);
  lilGuyMesh = lil.mesh;
  lilGuyMat = lil.mat;
  scene.add(lilGuyMesh);
  const lilGeo = lil.mesh.geometry;
  populations.lil = {
    mesh: lil.mesh, count: lil.count, scales: lil.scaleArr,
    offsetAttr: lilGeo.getAttribute('aOffset'),
    scaleAttr: lilGeo.getAttribute('aScale'),
    animDirAttr: lilGeo.getAttribute('aAnimDir'),
    radiusAttr: lilGeo.getAttribute('aRadius'),
    tintAttr: lilGeo.getAttribute('aTint'),
    timeOffsetAttr: lilGeo.getAttribute('aTimeOffset')
  };
  /* Fill spare pool with indices after placed LilGuys */
  for (let i = lil.spareStart; i < lil.spareStart + lil.spareCount; i++)
    spareIndices.push(i);

  const megaRng = createRng(hashString(MEGA.seed));
  const mega = createAsteroidMesh(MEGA, shaders, megaRng, exclusionZones, lightmap, true);
  megaMesh = mega.mesh;
  megaMat = mega.mat;
  scene.add(megaMesh);
  const megaGeo = mega.mesh.geometry;
  populations.mega = {
    mesh: mega.mesh, count: mega.count, scales: mega.scaleArr,
    offsetAttr: megaGeo.getAttribute('aOffset'),
    scaleAttr: megaGeo.getAttribute('aScale'),
    animDirAttr: megaGeo.getAttribute('aAnimDir'),
    timeOffsetAttr: megaGeo.getAttribute('aTimeOffset')
  };

  console.log(`Asteroids: ${big.count} BigBoi + ${lil.count} LilGuy + ${mega.count} Mega = ${big.count + lil.count + mega.count} total`);
}

/* Matches the vertex shader's differential rotation formula */
function asteroidAngularSpeed(r) {
  return 0.06 + 0.008 / (r + 60.0) + 0.30 * Math.exp(-r * 0.05);
}

/* XZ distance² from camera to each asteroid's rotated world position */
function getCandidates(pop, camX, camZ, rotationTime) {
  const attr = populations[pop].offsetAttr;
  const radiusAttr = populations[pop].mesh.geometry.getAttribute('aRadius');
  const count = populations[pop].count;
  const r2 = DRIFT_ACTIVATION_R * DRIFT_ACTIVATION_R;
  const candidates = [];
  for (let i = 0; i < count; i++) {
    if (pop === 'big' && deadSet.has(i)) continue;
    const cx = attr.getX(i), cz = attr.getZ(i);
    const r = radiusAttr.getX(i);
    const angle = rotationTime * asteroidAngularSpeed(r);
    const cosA = Math.cos(angle), sinA = Math.sin(angle);
    /* Canonical → world rotation (same as vertex shader) */
    const wx = cx * cosA - cz * sinA;
    const wz = cx * sinA + cz * cosA;
    const dx = wx - camX, dz = wz - camZ;
    const d2 = dx * dx + dz * dz;
    if (d2 < r2) candidates.push({ pop, index: i, distSq: d2 });
  }
  return candidates;
}

function rebuildActiveSet(camX, camZ, now, rotationTime) {
  const candidates = [
    ...getCandidates('mega', camX, camZ, rotationTime),
    ...getCandidates('big', camX, camZ, rotationTime),
    ...getCandidates('lil', camX, camZ, rotationTime)
  ];

  /* Mega always first, then closest to camera */
  candidates.sort((a, b) => {
    if (a.pop === 'mega' && b.pop !== 'mega') return -1;
    if (b.pop === 'mega' && a.pop !== 'mega') return 1;
    return a.distSq - b.distSq;
  });

  const desired = new Set();
  const kept = candidates.slice(0, DRIFT_MAX_ACTIVE);
  for (const c of kept) {
    const key = c.pop + '-' + c.index;
    desired.add(key);

    if (!activeSet.has(key)) {
      const attr = populations[c.pop].offsetAttr;
      const scale = populations[c.pop].scales[c.index];
      const rng = createRng(c.index * 7919 + c.pop.charCodeAt(0));
      const speed = DRIFT_SPEED_MIN + (DRIFT_SPEED_MAX - DRIFT_SPEED_MIN) * rng.next();
      const angle = rng.next() * Math.PI * 2;

      const radiusAttr = populations[c.pop].mesh.geometry.getAttribute('aRadius');
      activeSet.set(key, {
        pop: c.pop,
        index: c.index,
        origX: attr.getX(c.index), origY: attr.getY(c.index), origZ: attr.getZ(c.index),
        origR: radiusAttr.getX(c.index),
        x: attr.getX(c.index), y: attr.getY(c.index), z: attr.getZ(c.index),
        vx: Math.cos(angle) * speed,
        vy: (rng.next() - 0.5) * 0.6 * speed,
        vz: Math.sin(angle) * speed,
        radius: scale * COLL_RADIUS_FACTOR,
        mass: c.pop === 'mega' ? Infinity : scale * scale * scale,
        activationTime: now,
        lastCollisionTime: 0,
        easeComplete: false,
        deactivating: false,
        deactivationTime: 0,
        collisionsThisFrame: 0
      });
    } else {
      /* Re-entered range — cancel pending deactivation */
      const rec = activeSet.get(key);
      if (rec.deactivating) rec.deactivating = false;
    }
  }

  /* Begin deactivating asteroids that left the desired set (spare fragments exempt) */
  for (const [key, rec] of activeSet) {
    if (!desired.has(key) && !rec.deactivating && !rec.isSpare) {
      rec.deactivating = true;
      rec.deactivationTime = now;
    }
  }
}

function easeInQuad(t) { return t * t; }
function easeOutQuad(t) { return t * (2 - t); }

function stepDrift(delta, now) {
  /* Normalize to 60fps equivalent so behavior is consistent across framerates */
  const dampFactor = Math.pow(DRIFT_DAMPING, delta * 60);
  const keysToRemove = [];

  for (const [key, rec] of activeSet) {
    rec.collisionsThisFrame = 0;

    if (rec.deactivating) {
      /* Ease back toward original position */
      const t = Math.min(1, (now - rec.deactivationTime) / DRIFT_EASE_OUT);
      const e = Math.min(1, easeOutQuad(t) * delta * 3);
      rec.x += (rec.origX - rec.x) * e;
      rec.y += (rec.origY - rec.y) * e;
      rec.z += (rec.origZ - rec.z) * e;
      rec.vx *= 0.9;
      rec.vy *= 0.9;
      rec.vz *= 0.9;

      const dx = rec.x - rec.origX, dy = rec.y - rec.origY, dz = rec.z - rec.origZ;
      if (t >= 1 || (dx * dx + dy * dy + dz * dz) < 0.001) {
        rec.x = rec.origX;
        rec.y = rec.origY;
        rec.z = rec.origZ;
        keysToRemove.push(key);
        continue;
      }
    } else if (rec.mass !== Infinity) {
      /* Spring toward original position (normalized to 60fps) */
      const springK = DRIFT_RESTORE_K * delta * 60;
      rec.vx -= (rec.x - rec.origX) * springK;
      rec.vy -= (rec.y - rec.origY) * springK;
      rec.vz -= (rec.z - rec.origZ) * springK;

      rec.vx *= dampFactor;
      rec.vy *= dampFactor;
      rec.vz *= dampFactor;

      /* Velocity cap */
      const speed = Math.sqrt(rec.vx * rec.vx + rec.vy * rec.vy + rec.vz * rec.vz);
      if (speed > DRIFT_MAX_VEL) {
        const s = DRIFT_MAX_VEL / speed;
        rec.vx *= s; rec.vy *= s; rec.vz *= s;
      }

      rec.x += rec.vx * delta;
      rec.y += rec.vy * delta;
      rec.z += rec.vz * delta;
    }

    /* Activation ease-in blend — skip collisions until complete */
    if (!rec.deactivating && !rec.easeComplete) {
      const t = Math.min(1, (now - rec.activationTime) / DRIFT_EASE_IN);
      if (t < 1) {
        const e = easeInQuad(t);
        rec.x = rec.origX + (rec.x - rec.origX) * e;
        rec.y = rec.origY + (rec.y - rec.origY) * e;
        rec.z = rec.origZ + (rec.z - rec.origZ) * e;
      } else {
        rec.easeComplete = true;
      }
    }
  }

  for (const key of keysToRemove) {
    const rec = activeSet.get(key);
    if (rec.isSpare) {
      /* Return spare to pool — hide it */
      populations.lil.scaleAttr.setX(rec.index, 0);
      populations.lil.scaleAttr.needsUpdate = true;
      spareIndices.push(rec.index);
    } else {
      populations[rec.pop].offsetAttr.setXYZ(rec.index, rec.origX, rec.origY, rec.origZ);
    }
    activeSet.delete(key);
  }
}

function splitBigBoi(rec, now) {
  const count = SPLIT_MIN + Math.floor(Math.random() * (SPLIT_MAX - SPLIT_MIN + 1));
  const available = Math.min(count, spareIndices.length);
  if (available === 0) return;

  /* Hide the BigBoi */
  populations.big.scaleAttr.setX(rec.index, 0);
  populations.big.scaleAttr.needsUpdate = true;
  deadSet.add(rec.index);

  const pop = populations.lil;
  for (let i = 0; i < available; i++) {
    const si = spareIndices.pop();
    const angle = (i / available) * Math.PI * 2 + Math.random() * 0.5;
    const spread = rec.radius * 0.5 + Math.random() * rec.radius * 0.3;
    const fragScale = LILGUY.sizeMin + Math.random() * (LILGUY.sizeMax - LILGUY.sizeMin);
    const speed = DRIFT_SPEED_MIN + Math.random() * DRIFT_SPEED_MAX;

    /* Position fragments around the split point with outward velocity */
    const fx = rec.x + Math.cos(angle) * spread;
    const fy = rec.y + (Math.random() - 0.5) * spread * 0.4;
    const fz = rec.z + Math.sin(angle) * spread;

    /* Write buffer attributes for this spare */
    pop.offsetAttr.setXYZ(si, fx, fy, fz);
    pop.scaleAttr.setX(si, fragScale);
    pop.radiusAttr.setX(si, rec.origR || 160);
    pop.tintAttr.setX(si, 0.7 + Math.random() * 0.3);
    pop.animDirAttr.setX(si, Math.random() < 0.5 ? -1.0 : 1.0);

    const key = 'lil-' + si;
    activeSet.set(key, {
      pop: 'lil', index: si,
      origX: fx, origY: fy, origZ: fz,
      x: fx, y: fy, z: fz,
      vx: Math.cos(angle) * speed + rec.vx * 0.5,
      vy: (Math.random() - 0.5) * speed * 0.3 + rec.vy * 0.5,
      vz: Math.sin(angle) * speed + rec.vz * 0.5,
      radius: fragScale * COLL_RADIUS_FACTOR,
      mass: fragScale * fragScale * fragScale,
      activationTime: now,
      lastCollisionTime: 0,
      easeComplete: true,
      deactivating: false,
      deactivationTime: 0,
      collisionsThisFrame: 0,
      isSpare: true
    });
  }

  /* Mark dirty */
  pop.offsetAttr.needsUpdate = true;
  pop.scaleAttr.needsUpdate = true;
  pop.radiusAttr.needsUpdate = true;
  pop.tintAttr.needsUpdate = true;
  pop.animDirAttr.needsUpdate = true;
}

/* Flip animation direction while preserving the current frame (no visual discontinuity).
   Continuity: (T + offset_old) * dir_old = (T + offset_new) * dir_new
   Since dir_new = -dir_old: offset_new = -2T - offset_old */
function flipAnimDir(pop, index, rotationTime) {
  const p = populations[pop];
  const oldOffset = p.timeOffsetAttr.getX(index);
  p.timeOffsetAttr.setX(index, -2 * rotationTime - oldOffset);
  p.timeOffsetAttr.needsUpdate = true;
  p.animDirAttr.setX(index, -p.animDirAttr.getX(index));
  p.animDirAttr.needsUpdate = true;
}

/* Collisions in canonical space — valid because nearby asteroids rotate nearly identically */
function resolveCollisions(now, rotationTime) {
  const grid = new Map();
  const pendingSplits = [];
  const inv = 1 / COLL_GRID_SIZE;

  for (const [, rec] of activeSet) {
    if (rec.deactivating || !rec.easeComplete) continue;
    const cellKey = (Math.floor(rec.x * inv) << 16) | (Math.floor(rec.z * inv) & 0xFFFF);
    if (!grid.has(cellKey)) grid.set(cellKey, []);
    grid.get(cellKey).push(rec);
  }

  for (const [cellKey, cell] of grid) {
    const cx = cellKey >> 16;
    const cz = (cellKey << 16) >> 16;

    for (let dx = -1; dx <= 1; dx++) {
      for (let dz = -1; dz <= 1; dz++) {
        const nk = ((cx + dx) << 16) | ((cz + dz) & 0xFFFF);
        const neighbor = grid.get(nk);
        if (!neighbor) continue;

        const isSelf = dx === 0 && dz === 0;

        for (let i = 0; i < cell.length; i++) {
          const a = cell[i];
          if (a.collisionsThisFrame >= COLL_MAX_PER_FRAME) continue;

          const jStart = isSelf ? i + 1 : 0;
          for (let j = jStart; j < neighbor.length; j++) {
            const b = neighbor[j];
            if (b.collisionsThisFrame >= COLL_MAX_PER_FRAME) continue;

            const ex = b.x - a.x, ey = b.y - a.y, ez = b.z - a.z;
            const distSq = ex * ex + ey * ey + ez * ez;
            const minDist = a.radius + b.radius;
            if (distSq >= minDist * minDist || distSq < 0.0001) continue;

            const dist = Math.sqrt(distSq);
            const nx = ex / dist, ny = ey / dist, nz = ez / dist;
            const overlap = minDist - dist;

            /* Two immovable objects can't resolve — skip */
            if (a.mass === Infinity && b.mass === Infinity) continue;

            /* Separate — weighted by inverse mass */
            if (a.mass === Infinity) {
              b.x += nx * overlap; b.y += ny * overlap; b.z += nz * overlap;
            } else if (b.mass === Infinity) {
              a.x -= nx * overlap; a.y -= ny * overlap; a.z -= nz * overlap;
            } else {
              const total = a.mass + b.mass;
              const aS = b.mass / total, bS = a.mass / total;
              a.x -= nx * overlap * aS; a.y -= ny * overlap * aS; a.z -= nz * overlap * aS;
              b.x += nx * overlap * bS; b.y += ny * overlap * bS; b.z += nz * overlap * bS;
            }

            /* Impulse-based elastic bounce */
            const relVn = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny + (a.vz - b.vz) * nz;
            if (relVn <= 0) { a.collisionsThisFrame++; b.collisionsThisFrame++; continue; }

            const invA = a.mass === Infinity ? 0 : 1 / a.mass;
            const invB = b.mass === Infinity ? 0 : 1 / b.mass;
            const impulse = relVn * (1 + COLL_RESTITUTION) / (invA + invB);

            if (a.mass !== Infinity) {
              a.vx -= impulse * invA * nx;
              a.vy -= impulse * invA * ny;
              a.vz -= impulse * invA * nz;
            }
            if (b.mass !== Infinity) {
              b.vx += impulse * invB * nx;
              b.vy += impulse * invB * ny;
              b.vz += impulse * invB * nz;
            }

            a.collisionsThisFrame++;
            b.collisionsThisFrame++;

            /* Cooldown prevents rapid re-collision jitter */
            const aReady = (now - a.lastCollisionTime) > COLLISION_COOLDOWN;
            const bReady = (now - b.lastCollisionTime) > COLLISION_COOLDOWN;
            if (!aReady && !bReady) continue;

            if (aReady) a.lastCollisionTime = now;
            if (bReady) b.lastCollisionTime = now;

            /* Lighter rock: 60% reversal, heavier: 30% */
            const aIsLighter = a.mass <= b.mass;
            const aChance = aIsLighter ? ANIM_REVERSE_CHANCE_LIGHT : ANIM_REVERSE_CHANCE_HEAVY;
            const bChance = aIsLighter ? ANIM_REVERSE_CHANCE_HEAVY : ANIM_REVERSE_CHANCE_LIGHT;

            if (aReady && a.mass !== Infinity && Math.random() < aChance) {
              flipAnimDir(a.pop, a.index, rotationTime);
            }
            if (bReady && b.mass !== Infinity && Math.random() < bChance) {
              flipAnimDir(b.pop, b.index, rotationTime);
            }

            /* 40% chance for BigBoi to split on collision */
            if (a.pop === 'big' && aReady && Math.random() < SPLIT_CHANCE)
              pendingSplits.push(a);
            if (b.pop === 'big' && bReady && Math.random() < SPLIT_CHANCE)
              pendingSplits.push(b);
          }
        }
      }
    }
  }

  /* Process splits after iteration (modifies activeSet) */
  for (const rec of pendingSplits) {
    const key = 'big-' + rec.index;
    if (!activeSet.has(key)) continue;
    splitBigBoi(rec, now);
    activeSet.delete(key);
  }
}

/* Write active positions to GPU buffers */
function flushBuffers() {
  const dirty = { big: false, lil: false, mega: false };

  for (const [, rec] of activeSet) {
    populations[rec.pop].offsetAttr.setXYZ(rec.index, rec.x, rec.y, rec.z);
    dirty[rec.pop] = true;
  }

  for (const pop of ['big', 'lil', 'mega']) {
    if (dirty[pop]) populations[pop].offsetAttr.needsUpdate = true;
  }
}

export function update(delta, rotationTime, cameraPos) {
  if (bigBoiMat) bigBoiMat.uniforms.uTime.value = rotationTime;
  if (lilGuyMat) lilGuyMat.uniforms.uTime.value = rotationTime;
  if (megaMat) megaMat.uniforms.uTime.value = rotationTime;

  if (!cameraPos || !populations.big) return;

  const camR = Math.sqrt(cameraPos.x * cameraPos.x + cameraPos.z * cameraPos.z);
  const inBelt = camR > DRIFT_BELT_INNER && camR < DRIFT_BELT_OUTER;
  const now = performance.now() / 1000;

  if (inBelt && !driftActive) {
    driftActive = true;
    rebuildActiveSet(cameraPos.x, cameraPos.z, now, rotationTime);
    rebuildCounter = 0;
  }

  if (!inBelt && driftActive && activeSet.size === 0) {
    driftActive = false;
  }

  if (!driftActive && activeSet.size === 0) return;

  /* Periodic active set rebuild while in belt */
  if (driftActive) {
    if (++rebuildCounter >= DRIFT_REBUILD_INTERVAL) {
      rebuildCounter = 0;
      rebuildActiveSet(cameraPos.x, cameraPos.z, now, rotationTime);
    }
  } else {
    /* Camera left belt — deactivate everything */
    for (const [, rec] of activeSet) {
      if (!rec.deactivating) {
        rec.deactivating = true;
        rec.deactivationTime = now;
      }
    }
  }

  if (activeSet.size === 0) return;

  stepDrift(delta, now);
  resolveCollisions(now, rotationTime);
  flushBuffers();
}

export function dispose() {
  for (const [mesh, mat] of [[bigBoiMesh, bigBoiMat], [lilGuyMesh, lilGuyMat], [megaMesh, megaMat]]) {
    if (!mesh) continue;
    mesh.geometry.dispose();
    mat.uniforms.uSpriteSheet.value.dispose();
    mat.dispose();
  }
}
