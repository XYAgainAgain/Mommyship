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

function createAsteroidMesh(cfg, shaders, rng, exclusionZones, lightmap, megaMode) {
  const { offsets, radii, tints, timeOffsets, placed } = megaMode
    ? generateMegaPositions(cfg.count, rng, exclusionZones)
    : generatePositions(cfg.count, rng, exclusionZones);

  /* Per-instance scale */
  const scaleArr = new Float32Array(placed);
  for (let i = 0; i < placed; i++)
    scaleArr[i] = cfg.sizeMin + (cfg.sizeMax - cfg.sizeMin) * rng.next();

  const geo = new THREE.PlaneGeometry(1, 1);
  const instGeo = new THREE.InstancedBufferGeometry();
  instGeo.index = geo.index;
  instGeo.attributes.position = geo.attributes.position;
  instGeo.attributes.uv = geo.attributes.uv;
  instGeo.instanceCount = placed;

  instGeo.setAttribute('aOffset',
    new THREE.InstancedBufferAttribute(offsets.slice(0, placed * 3), 3));
  instGeo.setAttribute('aScale',
    new THREE.InstancedBufferAttribute(scaleArr, 1));
  instGeo.setAttribute('aTimeOffset',
    new THREE.InstancedBufferAttribute(timeOffsets.slice(0, placed), 1));
  instGeo.setAttribute('aRadius',
    new THREE.InstancedBufferAttribute(radii.slice(0, placed), 1));
  instGeo.setAttribute('aTint',
    new THREE.InstancedBufferAttribute(tints.slice(0, placed), 1));

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
  return { mesh, mat, count: placed };
}

export async function init(scene, data) {
  initPerlin(42069);
  const shaders = await loadShaderPair('asteroid');
  const exclusionZones = buildExclusionZones(data);

  const loader = new THREE.TextureLoader();
  const lightmap = await loader.loadAsync('galaxy/textures/galaxy-lightmap.webp');
  lightmap.flipY = false;
  lightmap.wrapS = THREE.ClampToEdgeWrapping;
  lightmap.wrapT = THREE.ClampToEdgeWrapping;

  const bigRng = createRng(hashString(BIGBOI.seed));
  const big = createAsteroidMesh(BIGBOI, shaders, bigRng, exclusionZones, lightmap, false);
  bigBoiMesh = big.mesh;
  bigBoiMat = big.mat;
  scene.add(bigBoiMesh);

  const lilRng = createRng(typeof LILGUY.seed === 'number'
    ? LILGUY.seed : hashString(LILGUY.seed));
  const lil = createAsteroidMesh(LILGUY, shaders, lilRng, exclusionZones, lightmap, false);
  lilGuyMesh = lil.mesh;
  lilGuyMat = lil.mat;
  scene.add(lilGuyMesh);

  const megaRng = createRng(hashString(MEGA.seed));
  const mega = createAsteroidMesh(MEGA, shaders, megaRng, exclusionZones, lightmap, true);
  megaMesh = mega.mesh;
  megaMat = mega.mat;
  scene.add(megaMesh);

  console.log(`Asteroids: ${big.count} BigBoi + ${lil.count} LilGuy + ${mega.count} Mega = ${big.count + lil.count + mega.count} total`);
}

export function update(_delta, rotationTime) {
  if (bigBoiMat) bigBoiMat.uniforms.uTime.value = rotationTime;
  if (lilGuyMat) lilGuyMat.uniforms.uTime.value = rotationTime;
  if (megaMat) megaMat.uniforms.uTime.value = rotationTime;
}

export function dispose() {
  for (const [mesh, mat] of [[bigBoiMesh, bigBoiMat], [lilGuyMesh, lilGuyMat], [megaMesh, megaMat]]) {
    if (!mesh) continue;
    mesh.geometry.dispose();
    mat.uniforms.uSpriteSheet.value.dispose();
    mat.dispose();
  }
}
