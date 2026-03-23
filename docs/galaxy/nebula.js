import * as THREE from 'three';
import { loadShader } from './shaders.js';
import { createRng } from './rng.js';

const NEBULA_SEED = 7777;
const GALAXY_RADIUS = 450;
const SPIRAL_FACTOR = -5.0;

/* Emission nebulae: diffuse arm-following haze */
const EMISSION_COUNT = 600;

/* Bright HII "flower" regions: distinct pink spots along arms */
const FLOWER_COUNT = 24;

/* Dark dust lanes: multiply-dimming on leading edge of arms */
const DARK_COUNT = 250;

/* H-alpha pink/magenta dominant, with OIII teal and reflection blue */
const EMISSION_PALETTE = [
  { r: 0.85, g: 0.25, b: 0.55, w: 4   },
  { r: 0.75, g: 0.20, b: 0.45, w: 3   },
  { r: 0.90, g: 0.35, b: 0.60, w: 2.5 },
  { r: 0.65, g: 0.15, b: 0.40, w: 2   },
  { r: 0.12, g: 0.35, b: 0.50, w: 1.5 },
  { r: 0.10, g: 0.40, b: 0.42, w: 1   },
  { r: 0.25, g: 0.30, b: 0.70, w: 1.5 },
  { r: 0.20, g: 0.25, b: 0.60, w: 1   },
  { r: 0.35, g: 0.12, b: 0.50, w: 1.5 },
  { r: 0.08, g: 0.12, b: 0.40, w: 1   },
];

/* Bright flower spots — hot pink H-alpha */
const FLOWER_PALETTE = [
  { r: 0.95, g: 0.30, b: 0.60, w: 4   },
  { r: 0.90, g: 0.25, b: 0.50, w: 3   },
  { r: 0.85, g: 0.35, b: 0.65, w: 2   },
  { r: 0.80, g: 0.20, b: 0.55, w: 1   },
];

/* Dark nebulae — muted dust colors */
const DARK_PALETTE = [
  { r: 0.18, g: 0.14, b: 0.20, w: 3   },
  { r: 0.14, g: 0.16, b: 0.25, w: 2   },
  { r: 0.20, g: 0.13, b: 0.17, w: 1.5 },
  { r: 0.10, g: 0.13, b: 0.20, w: 2   },
];

function buildWeightTable(palette) {
  const total = palette.reduce((s, e) => s + e.w, 0);
  const cumulative = [];
  let running = 0;
  for (const entry of palette) {
    running += entry.w;
    cumulative.push(running / total);
  }
  return { palette, cumulative };
}

const emissionTable = buildWeightTable(EMISSION_PALETTE);
const flowerTable = buildWeightTable(FLOWER_PALETTE);
const darkTable = buildWeightTable(DARK_PALETTE);

function hash2d(x, y) {
  let n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return n - Math.floor(n);
}

function valueNoise(x, y) {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const a = hash2d(ix, iy);
  const b = hash2d(ix + 1, iy);
  const c = hash2d(ix, iy + 1);
  const d = hash2d(ix + 1, iy + 1);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}

function angleDist(a, b) {
  let d = ((b - a) % (Math.PI * 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI;
  return Math.abs(d);
}

/* 3 major arms */
const arms = [];
for (let i = 0; i < 3; i++) {
  arms.push({ offset: i * (Math.PI * 2 / 3) });
}

function pickColor(rng, table) {
  const r = rng.next();
  const idx = table.cumulative.findIndex(w => r <= w);
  return table.palette[Math.max(0, idx)];
}

function generateParticles(count, rng, table, opts) {
  const positions  = new Float32Array(count * 3);
  const colors     = new Float32Array(count * 3);
  const sizes      = new Float32Array(count);
  const brightness = new Float32Array(count);
  const radii      = new Float32Array(count);
  const stretches  = new Float32Array(count);
  const angles     = new Float32Array(count);
  const phases     = new Float32Array(count);

  let placed = 0;
  let attempts = 0;

  while (placed < count && attempts < count * 60) {
    attempts++;

    const r = GALAXY_RADIUS * Math.pow(rng.next(), opts.radiusPow);
    const t = r / GALAXY_RADIUS;
    if (t < opts.minT || t > opts.maxT) continue;

    const spiralAngle = SPIRAL_FACTOR * Math.log(r / 10 + 1);
    const theta = rng.next() * Math.PI * 2;

    let bestDensity = 0;
    for (const arm of arms) {
      const armTheta = spiralAngle + arm.offset;
      let delta = angleDist(theta, armTheta);
      /* Dark nebulae offset toward leading edge of arm */
      if (opts.leadingEdge) {
        const signed = ((theta - armTheta) % (Math.PI * 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI;
        delta = Math.abs(signed + 0.15);
      }
      const width = (opts.armWidth - 0.3 * t);
      const d = Math.exp(-0.5 * Math.pow(delta / Math.max(width, 0.12), 2));
      if (d > bestDensity) bestDensity = d;
    }

    const noiseVal = valueNoise(r * 0.008 + (opts.noiseOffset || 0), theta * 0.3);
    let density = bestDensity * (0.1 + 0.9 * noiseVal);
    density = Math.max(density, opts.floorDensity);

    if (t > 0.8) density *= 1.0 - (t - 0.8) / 0.2;
    if (rng.next() > density) continue;

    /* Nebulae are FLATTER than the stellar disk — ~0.3× star thickness */
    const starSigmaY = 1.2 + 18.0 * Math.exp(-t * 3.5);
    const sigmaY = starSigmaY * (opts.yScale || 0.3);
    const y = rng.gauss() * sigmaY;

    positions[placed * 3]     = r * Math.cos(theta);
    positions[placed * 3 + 1] = y;
    positions[placed * 3 + 2] = r * Math.sin(theta);
    radii[placed] = r;

    const col = pickColor(rng, table);
    colors[placed * 3]     = col.r;
    colors[placed * 3 + 1] = col.g;
    colors[placed * 3 + 2] = col.b;

    sizes[placed] = opts.minSize + rng.next() * (opts.maxSize - opts.minSize);
    brightness[placed] = opts.minBright + rng.next() * (opts.maxBright - opts.minBright);
    stretches[placed] = 0.4 + rng.next() * 0.6;
    angles[placed] = rng.next() * Math.PI;
    phases[placed] = rng.next() * 100.0;

    placed++;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position',    new THREE.BufferAttribute(positions.slice(0, placed * 3), 3));
  geo.setAttribute('color',       new THREE.BufferAttribute(colors.slice(0, placed * 3), 3));
  geo.setAttribute('aSize',       new THREE.BufferAttribute(sizes.slice(0, placed), 1));
  geo.setAttribute('aBrightness', new THREE.BufferAttribute(brightness.slice(0, placed), 1));
  geo.setAttribute('aRadius',     new THREE.BufferAttribute(radii.slice(0, placed), 1));
  geo.setAttribute('aStretch',    new THREE.BufferAttribute(stretches.slice(0, placed), 1));
  geo.setAttribute('aAngle',      new THREE.BufferAttribute(angles.slice(0, placed), 1));
  geo.setAttribute('aPhase',      new THREE.BufferAttribute(phases.slice(0, placed), 1));

  return { geo, count: placed };
}

/* Multiply frag — same noise-warped ellipse shape, falloff in RGB */
const darkFrag = `
precision highp float;
varying vec3 vColor;
varying float vBrightness;
varying float vStretch;
varying float vAngle;
varying float vPhase;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

void main() {
  vec2 uv = gl_PointCoord - vec2(0.5);
  float cosA = cos(vAngle);
  float sinA = sin(vAngle);
  vec2 rotated = vec2(uv.x * cosA - uv.y * sinA, uv.x * sinA + uv.y * cosA);
  rotated.y /= vStretch;
  float warp = noise(rotated * 3.0 + vPhase) * 0.15;
  float dist = length(rotated) + warp;
  if (dist > 0.5) discard;
  float shape = smoothstep(0.5, 0.0, dist);
  shape *= shape;
  vec3 tint = mix(vec3(1.0), vColor, shape * vBrightness);
  gl_FragColor = vec4(tint, 1.0);
}
`;

export async function createNebula(scene) {
  const [nebulaVert, nebulaFrag] = await Promise.all([
    loadShader('galaxy/shaders/nebula.vert'),
    loadShader('galaxy/shaders/nebula.frag')
  ]);

  const rng = createRng(NEBULA_SEED);

  /* Diffuse emission haze — screen blended, mid-disk concentration */
  const emission = generateParticles(EMISSION_COUNT, rng, emissionTable, {
    radiusPow: 0.55,
    minT: 0.15,
    maxT: 0.80,
    armWidth: 0.8,
    floorDensity: 0.01,
    minSize: 25,
    maxSize: 70,
    minBright: 0.04,
    maxBright: 0.12,
    yScale: 0.3,
    noiseOffset: 0
  });

  const emissionMat = new THREE.ShaderMaterial({
    vertexShader: nebulaVert,
    fragmentShader: nebulaFrag,
    uniforms: {
      uViewHeight: { value: window.innerHeight },
      uTime: { value: 0 }
    },
    vertexColors: true,
    blending: THREE.CustomBlending,
    blendEquation: THREE.AddEquation,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneMinusSrcColorFactor,
    depthWrite: false,
    transparent: true
  });

  const emissionMesh = new THREE.Points(emission.geo, emissionMat);
  emissionMesh.renderOrder = -1;
  scene.add(emissionMesh);

  /* Bright HII "flower" regions — distinct pink spots, screen blended */
  const flowers = generateParticles(FLOWER_COUNT, rng, flowerTable, {
    radiusPow: 0.5,
    minT: 0.25,
    maxT: 0.70,
    armWidth: 0.5,
    floorDensity: 0.3,
    minSize: 10,
    maxSize: 22,
    minBright: 0.15,
    maxBright: 0.25,
    yScale: 0.15,
    noiseOffset: 42
  });

  const flowerMat = new THREE.ShaderMaterial({
    vertexShader: nebulaVert,
    fragmentShader: nebulaFrag,
    uniforms: {
      uViewHeight: { value: window.innerHeight },
      uTime: { value: 0 }
    },
    vertexColors: true,
    blending: THREE.CustomBlending,
    blendEquation: THREE.AddEquation,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneMinusSrcColorFactor,
    depthWrite: false,
    transparent: true
  });

  const flowerMesh = new THREE.Points(flowers.geo, flowerMat);
  flowerMesh.renderOrder = -1;
  scene.add(flowerMesh);

  /* Dark dust lanes — multiply-dims stars, leading edge of arms, outer disk only */
  const dark = generateParticles(DARK_COUNT, rng, darkTable, {
    radiusPow: 0.4,
    minT: 0.65,
    maxT: 0.95,
    armWidth: 0.6,
    floorDensity: 0.02,
    leadingEdge: true,
    minSize: 12,
    maxSize: 30,
    minBright: 0.25,
    maxBright: 0.5,
    yScale: 0.25,
    noiseOffset: 99
  });

  const darkMat = new THREE.ShaderMaterial({
    vertexShader: nebulaVert,
    fragmentShader: darkFrag,
    uniforms: {
      uViewHeight: { value: window.innerHeight },
      uTime: { value: 0 }
    },
    vertexColors: true,
    blending: THREE.MultiplyBlending,
    depthWrite: false,
    transparent: true
  });

  const darkMesh = new THREE.Points(dark.geo, darkMat);
  darkMesh.renderOrder = -2;
  scene.add(darkMesh);

  function update(delta, elapsed) {
    emissionMat.uniforms.uViewHeight.value = window.innerHeight;
    emissionMat.uniforms.uTime.value = elapsed;
    flowerMat.uniforms.uViewHeight.value = window.innerHeight;
    flowerMat.uniforms.uTime.value = elapsed;
    darkMat.uniforms.uViewHeight.value = window.innerHeight;
    darkMat.uniforms.uTime.value = elapsed;
  }

  return { emissionMesh, flowerMesh, darkMesh, update };
}
