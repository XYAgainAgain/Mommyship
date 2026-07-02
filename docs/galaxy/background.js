import * as THREE from 'three';
import { MeshBasicNodeMaterial } from 'three/webgpu';
import { createRng } from './rng.js';

import { main as skyboxFrag, uTime as skyboxUTime } from './tsl/frag/skybox.tsl.js';
import { main as skyboxVert } from './tsl/vert/skybox.tsl.js';
import { main as starfieldFrag } from './tsl/frag/starfield.tsl.js';
import { main as starfieldVert, uTime as starfieldUTime } from './tsl/vert/starfield.tsl.js';
import { main as galaxyFrag } from './tsl/frag/firmament-galaxy.tsl.js';
import { main as galaxyVert, uTime as galaxyUTime } from './tsl/vert/firmament-galaxy.tsl.js';

const SKYBOX_RADIUS = 650;
const PARTICLE_COUNT = 18000;
const STAR_SEED = 69;

/* Firmament seeds LOCKED IN! Don't change these! */
const FIRMAMENT_GAL_SEED = 1778;
const GAL = {
  count: 24, particles: 420, baseSize: 24, sizeVar: 1.5, distMin: 555, distMax: 645,
  maxArms: 6, turnsMin: 0.7, turnsMax: 2.0, flatten: 0.15, hueVar: 1.0, coreBoost: 0.8
};
const GAL_HUE_FAMILIES = [0.62, 0.72, 0.85, 0.48, 0.08, 0.55, 0.95, 0.13];

const STAR_PALETTE = [
  { r: 1.0,   g: 1.0,   b: 1.0,   w: 5   },
  { r: 0.863, g: 0.902, b: 1.0,   w: 2   },
  { r: 0.667, g: 0.749, b: 1.0,   w: 1   },
  { r: 1.0,   g: 0.957, b: 0.910, w: 2   },
  { r: 1.0,   g: 0.929, b: 0.592, w: 1.5 },
  { r: 1.0,   g: 0.769, b: 0.420, w: 1   },
  { r: 1.0,   g: 0.604, b: 0.361, w: 0.5 }
];

const totalWeight = STAR_PALETTE.reduce((sum, e) => sum + e.w, 0);
const cumulativeWeights = [];
let running = 0;
for (const entry of STAR_PALETTE) {
  running += entry.w;
  cumulativeWeights.push(running / totalWeight);
}

/* WebGPU has no variable-size point sprites — use instanced billboard quads instead */
function buildTwinkleGeometry() {
  const rng = createRng(STAR_SEED);

  function pickColor() {
    const r = rng.next();
    const idx = cumulativeWeights.findIndex(w => r <= w);
    return STAR_PALETTE[Math.max(0, idx)];
  }

  const offsets    = new Float32Array(PARTICLE_COUNT * 3);
  const colors     = new Float32Array(PARTICLE_COUNT * 3);
  const sizes      = new Float32Array(PARTICLE_COUNT);
  const brightness = new Float32Array(PARTICLE_COUNT);
  const phases     = new Float32Array(PARTICLE_COUNT);

  const r = SKYBOX_RADIUS - 5;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const theta = Math.acos(2 * rng.next() - 1);
    const phi   = rng.next() * Math.PI * 2;
    const sinT  = Math.sin(theta);

    offsets[i * 3]     = r * sinT * Math.cos(phi);
    offsets[i * 3 + 1] = r * Math.cos(theta);
    offsets[i * 3 + 2] = r * sinT * Math.sin(phi);

    const col = pickColor();
    colors[i * 3]     = col.r;
    colors[i * 3 + 1] = col.g;
    colors[i * 3 + 2] = col.b;

    sizes[i]      = 1.5 + rng.next() * 2.5;
    brightness[i] = 0.3 + rng.next() * 0.7;
    phases[i]     = rng.next();
  }

  const base = new THREE.PlaneGeometry(1, 1);
  const geo = new THREE.InstancedBufferGeometry();
  geo.index = base.index;
  geo.setAttribute('position', base.getAttribute('position'));
  geo.setAttribute('uv',       base.getAttribute('uv'));
  geo.setAttribute('normal',   base.getAttribute('normal'));

  geo.setAttribute('aOffset',     new THREE.InstancedBufferAttribute(offsets,    3));
  geo.setAttribute('color',       new THREE.InstancedBufferAttribute(colors,     3));
  geo.setAttribute('aSize',       new THREE.InstancedBufferAttribute(sizes,      1));
  geo.setAttribute('aBrightness', new THREE.InstancedBufferAttribute(brightness, 1));
  geo.setAttribute('aPhase',      new THREE.InstancedBufferAttribute(phases,     1));

  geo.instanceCount = PARTICLE_COUNT;
  return geo;
}

const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (x) => x < 0 ? 0 : x > 1 ? 1 : x;

function hslToRgb(h, s, l) {
  const f = (n) => {
    const k = (n + h * 12) % 12;
    return l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return [f(0), f(8), f(4)];
}

/* Distant firmament galaxies: spiral particle quads on the far sphere, packed vec4
   attributes (gA0 center+spinRate, gA1 rest offset+size, gA2 axis+brightness). */
function buildGalaxyGeometry() {
  const rng = createRng(FIRMAMENT_GAL_SEED * 7 + 3);
  const TAU = Math.PI * 2;
  const G = GAL.count, P = GAL.particles, N = G * P;
  const A0 = new Float32Array(N * 4), A1 = new Float32Array(N * 4), A2 = new Float32Array(N * 4);
  const col = new Float32Array(N * 3);
  let idx = 0;
  for (let gi = 0; gi < G; gi++) {
    const theta = Math.acos(2 * rng.next() - 1);
    const phi = rng.next() * TAU;
    const dist = lerp(GAL.distMin, GAL.distMax, rng.next());
    const cx = dist * Math.sin(theta) * Math.cos(phi);
    const cy = dist * Math.cos(theta);
    const cz = dist * Math.sin(theta) * Math.sin(phi);
    const size = GAL.baseSize * (1 - GAL.sizeVar * 0.6 + Math.pow(rng.next(), 1.5) * GAL.sizeVar * 1.6);
    const arms = rng.next() < 0.45 ? 2 : 1 + Math.floor(rng.next() * GAL.maxArms);
    const turns = lerp(GAL.turnsMin, GAL.turnsMax, rng.next());
    const flatten = 1 - GAL.flatten * rng.next();
    const spinRate = (rng.next() < 0.5 ? -1 : 1) * (0.5 + rng.next());
    const ax = rng.gauss(), ay = rng.gauss(), az = rng.gauss();
    const al = Math.hypot(ax, ay, az) || 1;
    const nx = ax / al, ny = ay / al, nz = az / al;
    const ref = Math.abs(ny) > 0.9 ? [1, 0, 0] : [0, 1, 0];
    let e1x = ref[1] * nz - ref[2] * ny, e1y = ref[2] * nx - ref[0] * nz, e1z = ref[0] * ny - ref[1] * nx;
    const e1l = Math.hypot(e1x, e1y, e1z) || 1;
    e1x /= e1l; e1y /= e1l; e1z /= e1l;
    const e2x = ny * e1z - nz * e1y, e2y = nz * e1x - nx * e1z, e2z = nx * e1y - ny * e1x;
    const baseHue = GAL_HUE_FAMILIES[(rng.next() * GAL_HUE_FAMILIES.length) | 0];
    const hueA = (baseHue + (rng.next() - 0.5) * 0.12 * GAL.hueVar + 1) % 1;
    const hueB = (hueA + (rng.next() - 0.5) * 0.35 * GAL.hueVar + 1) % 1;
    const sat = 0.3 + rng.next() * 0.45 * GAL.hueVar;
    const innerCol = hslToRgb(hueA, sat, 0.72);
    const outerCol = hslToRgb(hueB, sat * 0.85, 0.6);
    for (let k = 0; k < P; k++) {
      const t = k / P, arm = k % arms;
      const angle = t * turns * TAU + arm * (TAU / arms) + (rng.next() - 0.5) * 0.4 * (1 - t);
      const radius = (Math.pow(t, 0.85) * 0.95 + rng.next() * 0.05) * size;
      const core = clamp01(1 - t / 0.32);
      const px = Math.cos(angle) * radius, py = Math.sin(angle) * radius * flatten;
      const pz = rng.gauss() * size * 0.02 * (1 - t * 0.7);
      A0[idx * 4] = cx; A0[idx * 4 + 1] = cy; A0[idx * 4 + 2] = cz; A0[idx * 4 + 3] = spinRate;
      A1[idx * 4] = px * e1x + py * e2x + pz * nx;
      A1[idx * 4 + 1] = px * e1y + py * e2y + pz * ny;
      A1[idx * 4 + 2] = px * e1z + py * e2z + pz * nz;
      A1[idx * 4 + 3] = Math.max(size * 0.02 * (1.3 - t), 0.9);
      A2[idx * 4] = nx; A2[idx * 4 + 1] = ny; A2[idx * 4 + 2] = nz;
      A2[idx * 4 + 3] = (0.45 + rng.next() * 0.55) * (0.6 + core * 0.8);
      const wh = core * GAL.coreBoost;
      col[idx * 3]     = clamp01(lerp(lerp(innerCol[0], outerCol[0], t), 1, wh));
      col[idx * 3 + 1] = clamp01(lerp(lerp(innerCol[1], outerCol[1], t), 1, wh));
      col[idx * 3 + 2] = clamp01(lerp(lerp(innerCol[2], outerCol[2], t), 1, wh));
      idx++;
    }
  }
  const base = new THREE.PlaneGeometry(1, 1);
  const geo = new THREE.InstancedBufferGeometry();
  geo.index = base.index;
  geo.setAttribute('position', base.getAttribute('position'));
  geo.setAttribute('uv', base.getAttribute('uv'));
  geo.setAttribute('normal', base.getAttribute('normal'));
  geo.setAttribute('gA0', new THREE.InstancedBufferAttribute(A0, 4));
  geo.setAttribute('gA1', new THREE.InstancedBufferAttribute(A1, 4));
  geo.setAttribute('gA2', new THREE.InstancedBufferAttribute(A2, 4));
  geo.setAttribute('gCol', new THREE.InstancedBufferAttribute(col, 3));
  geo.instanceCount = N;
  return geo;
}

export async function createBackground(scene) {
  const skyboxGeo = new THREE.SphereGeometry(SKYBOX_RADIUS, 64, 32);
  const skyboxMat = new MeshBasicNodeMaterial();
  skyboxMat.positionNode = skyboxVert();
  skyboxMat.fragmentNode = skyboxFrag();
  skyboxMat.side = THREE.BackSide;
  skyboxMat.depthWrite = false;

  const skybox = new THREE.Mesh(skyboxGeo, skyboxMat);
  scene.add(skybox);

  /* Instanced billboard quads — replaces THREE.Points which are 1px on WebGPU */
  const twinkleMat = new MeshBasicNodeMaterial();
  twinkleMat.positionNode = starfieldVert();
  twinkleMat.fragmentNode = starfieldFrag();
  twinkleMat.blending = THREE.AdditiveBlending;
  twinkleMat.depthWrite = false;
  twinkleMat.transparent = true;
  twinkleMat.side = THREE.DoubleSide;

  const twinkleGeo = buildTwinkleGeometry();
  const twinkle = new THREE.Mesh(twinkleGeo, twinkleMat);
  twinkle.frustumCulled = false;
  scene.add(twinkle);

  /* depthTest ON — foreground must occlude the firmament */
  const galaxyMat = new MeshBasicNodeMaterial();
  galaxyMat.positionNode = galaxyVert();
  galaxyMat.fragmentNode = galaxyFrag();
  galaxyMat.blending = THREE.AdditiveBlending;
  galaxyMat.depthWrite = false;
  galaxyMat.transparent = true;
  galaxyMat.side = THREE.DoubleSide;

  const galaxies = new THREE.Mesh(buildGalaxyGeometry(), galaxyMat);
  galaxies.frustumCulled = false;
  scene.add(galaxies);

  function update(time, cameraPos) {
    skyboxUTime.value = time;
    starfieldUTime.value = time;
    galaxyUTime.value = time;
    skybox.position.copy(cameraPos);
    twinkle.position.copy(cameraPos);
    galaxies.position.copy(cameraPos);
  }

  return { update };
}
