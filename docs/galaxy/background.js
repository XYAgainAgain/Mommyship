import * as THREE from 'three';
import { loadShaderPair } from './shaders.js';
import { createRng } from './rng.js';

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

function buildTwinkleGeometry() {
  const rng = createRng(STAR_SEED);

  function pickColor() {
    const r = rng.next();
    const idx = cumulativeWeights.findIndex(w => r <= w);
    return STAR_PALETTE[Math.max(0, idx)];
  }

  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const colors    = new Float32Array(PARTICLE_COUNT * 3);
  const sizes      = new Float32Array(PARTICLE_COUNT);
  const brightness = new Float32Array(PARTICLE_COUNT);
  const phases    = new Float32Array(PARTICLE_COUNT);

  const r = SKYBOX_RADIUS - 5;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const theta = Math.acos(2 * rng.next() - 1);
    const phi   = rng.next() * Math.PI * 2;
    const sinT  = Math.sin(theta);

    positions[i * 3]     = r * sinT * Math.cos(phi);
    positions[i * 3 + 1] = r * Math.cos(theta);
    positions[i * 3 + 2] = r * sinT * Math.sin(phi);

    const col = pickColor();
    colors[i * 3]     = col.r;
    colors[i * 3 + 1] = col.g;
    colors[i * 3 + 2] = col.b;

    sizes[i]      = 1.5 + rng.next() * 2.5;
    brightness[i] = 0.3 + rng.next() * 0.7;
    phases[i]     = rng.next();
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position',    new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color',       new THREE.BufferAttribute(colors,    3));
  geo.setAttribute('aSize',       new THREE.BufferAttribute(sizes,     1));
  geo.setAttribute('aBrightness', new THREE.BufferAttribute(brightness, 1));
  geo.setAttribute('aPhase',      new THREE.BufferAttribute(phases,    1));

  return geo;
}

export async function createBackground(scene) {
  const [skyboxShaders, starfieldShaders] = await Promise.all([
    loadShaderPair('skybox'),
    loadShaderPair('starfield')
  ]);

  /* Procedural skybox — no texture, just dark space with subtle nebula wisps */
  const skyboxUniforms = { uTime: { value: 0 } };

  const skyboxGeo = new THREE.SphereGeometry(SKYBOX_RADIUS, 64, 32);
  const skyboxMat = new THREE.ShaderMaterial({
    vertexShader:   skyboxShaders.vert,
    fragmentShader: skyboxShaders.frag,
    uniforms:       skyboxUniforms,
    side:           THREE.BackSide,
    depthWrite:     false
  });

  const skybox = new THREE.Mesh(skyboxGeo, skyboxMat);
  scene.add(skybox);

  /* Twinkle particles */
  const twinkleUniforms = {
    uViewHeight: { value: window.innerHeight },
    uTime:       { value: 0 }
  };

  const twinkleMat = new THREE.ShaderMaterial({
    vertexShader:   starfieldShaders.vert,
    fragmentShader: starfieldShaders.frag,
    uniforms:       twinkleUniforms,
    vertexColors:   true,
    blending:       THREE.AdditiveBlending,
    depthWrite:     false,
    transparent:    true
  });

  const twinkle = new THREE.Points(buildTwinkleGeometry(), twinkleMat);
  scene.add(twinkle);

  function update(time, cameraPos) {
    skyboxUniforms.uTime.value       = time;
    twinkleUniforms.uTime.value      = time;
    twinkleUniforms.uViewHeight.value = window.innerHeight;
    skybox.position.copy(cameraPos);
    twinkle.position.copy(cameraPos);
  }

  return { update };
}
