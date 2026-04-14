import * as THREE from 'three';
import { MeshBasicNodeMaterial } from 'three/webgpu';
import { createRng } from './rng.js';

import { main as skyboxFrag, uTime as skyboxUTime } from './tsl/frag/skybox.tsl.js';
import { main as skyboxVert } from './tsl/vert/skybox.tsl.js';
import { main as starfieldFrag } from './tsl/frag/starfield.tsl.js';
import { main as starfieldVert, uTime as starfieldUTime } from './tsl/vert/starfield.tsl.js';

const SKYBOX_RADIUS = 650;
const PARTICLE_COUNT = 18000;
const STAR_SEED = 69;

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
  console.log('DEBUG starfield: ' + PARTICLE_COUNT + ' instanced quads, mat #' + twinkleMat.id);

  function update(time, cameraPos) {
    skyboxUTime.value = time;
    starfieldUTime.value = time;
    skybox.position.copy(cameraPos);
    twinkle.position.copy(cameraPos);
  }

  return { update };
}
