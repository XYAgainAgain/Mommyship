import * as THREE from 'three';
import { loadShaderPair } from './shaders.js';
import { createRng } from './rng.js';

const GALAXY_SEED = 42;
const GALAXY_RADIUS = 450;
const PARTICLE_COUNT = 80000;
const MAJOR_ARM_COUNT = 3;
const MINOR_ARM_COUNT = 4;
const SPIRAL_FACTOR = -5.0;
const CORE_FRACTION = 0.08;
const INNER_DISK_FRACTION = 0.28;

/* Natural spectral colors — purple/indigo left to nebulae and black hole */
const PALETTE = {
  warm: [
    { r: 1.0,   g: 1.0,   b: 1.0,   w: 3   },
    { r: 1.0,   g: 0.957, b: 0.910, w: 3   },
    { r: 1.0,   g: 0.929, b: 0.592, w: 2.5 },
    { r: 1.0,   g: 0.769, b: 0.420, w: 2   },
    { r: 1.0,   g: 0.604, b: 0.361, w: 1   },
    { r: 0.863, g: 0.902, b: 1.0,   w: 0.5 }
  ],
  cool: [
    { r: 1.0,   g: 1.0,   b: 1.0,   w: 4   },
    { r: 0.863, g: 0.902, b: 1.0,   w: 3   },
    { r: 0.667, g: 0.749, b: 1.0,   w: 2   },
    { r: 0.75,  g: 0.7,   b: 1.0,   w: 1   },
    { r: 1.0,   g: 0.957, b: 0.910, w: 1   },
    { r: 1.0,   g: 0.929, b: 0.592, w: 0.3 }
  ],
  dim: [
    { r: 1.0,   g: 0.769, b: 0.420, w: 2   },
    { r: 1.0,   g: 0.604, b: 0.361, w: 2   },
    { r: 0.863, g: 0.902, b: 1.0,   w: 1   },
    { r: 1.0,   g: 1.0,   b: 1.0,   w: 1   },
    { r: 0.667, g: 0.749, b: 1.0,   w: 0.5 }
  ]
};

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

const warmTable = buildWeightTable(PALETTE.warm);
const coolTable = buildWeightTable(PALETTE.cool);
const dimTable  = buildWeightTable(PALETTE.dim);

/* Module-scoped RNG — set before each generation pass */
let rng;

function pickFromTable(table) {
  const r = rng.next();
  const idx = table.cumulative.findIndex(w => r <= w);
  return table.palette[Math.max(0, idx)];
}

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

function gaussRandom() {
  return rng.gauss();
}

function smoothstep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/* Arm definitions: 3 major + 6 minor (shorter, wispier, some with Y-offsets) */
const arms = [];
for (let i = 0; i < MAJOR_ARM_COUNT; i++) {
  arms.push({
    offset: i * (Math.PI * 2 / MAJOR_ARM_COUNT),
    widthScale: 1.0,
    densityScale: 1.0,
    maxRadius: 1.0,
    yOffset: 0
  });
}

const minorDefs = [
  /* Substantial inter-arm fillers (between the 3 majors) */
  { off: 1.05, w: 0.55, d: 0.45, rMax: 0.60, y:  0 },
  { off: 3.15, w: 0.5,  d: 0.4,  rMax: 0.55, y:  0 },
  { off: 5.25, w: 0.5,  d: 0.42, rMax: 0.58, y:  0 },
  /* Shorter spurs branching off near arm bases */
  { off: 0.4,  w: 0.4,  d: 0.35, rMax: 0.40, y:  1 },
  { off: 2.5,  w: 0.45, d: 0.35, rMax: 0.45, y: -1 },
  { off: 4.6,  w: 0.4,  d: 0.3,  rMax: 0.38, y:  2 },
  /* Wispy Y-offset trails — sell the 3D spin */
  { off: 0.7,  w: 0.3,  d: 0.25, rMax: 0.50, y:  5 },
  { off: 1.8,  w: 0.25, d: 0.2,  rMax: 0.42, y: -4 },
  { off: 3.6,  w: 0.3,  d: 0.25, rMax: 0.48, y:  6 },
  { off: 4.2,  w: 0.25, d: 0.2,  rMax: 0.35, y: -5 },
  { off: 5.6,  w: 0.3,  d: 0.22, rMax: 0.40, y:  4 },
  { off: 0.15, w: 0.2,  d: 0.18, rMax: 0.30, y: -6 }
];
for (const m of minorDefs) {
  arms.push({
    offset: m.off,
    widthScale: m.w,
    densityScale: m.d,
    maxRadius: m.rMax,
    yOffset: m.y
  });
}

function generateDiskParticles() {
  rng = createRng(GALAXY_SEED);
  const positions  = new Float32Array(PARTICLE_COUNT * 3);
  const colors     = new Float32Array(PARTICLE_COUNT * 3);
  const sizes      = new Float32Array(PARTICLE_COUNT);
  const brightness = new Float32Array(PARTICLE_COUNT);
  const radii      = new Float32Array(PARTICLE_COUNT);

  const coreRadius = CORE_FRACTION * GALAXY_RADIUS;
  const innerDiskRadius = INNER_DISK_FRACTION * GALAXY_RADIUS;
  let placed = 0;
  let attempts = 0;
  const maxAttempts = PARTICLE_COUNT * 30;

  while (placed < PARTICLE_COUNT && attempts < maxAttempts) {
    attempts++;

    const r = GALAXY_RADIUS * Math.pow(rng.next(), 0.45);
    if (r < 35) continue;
    const t = r / GALAXY_RADIUS;

    /* Pre-apply spiral offset so arms are spiral-shaped at t=0.
       This is the logarithmic spiral angle for this radius. */
    const spiralAngle = SPIRAL_FACTOR * Math.log(r / 10 + 1);

    const thetaBase = rng.next() * Math.PI * 2;
    const thetaScatter = gaussRandom() * 0.12 * t;
    const theta = thetaBase + thetaScatter;

    let density;
    let isArm = false;

    let bestArm = arms[0];

    if (r < coreRadius) {
      density = 1.0;
    } else if (r < innerDiskRadius) {
      /* Inner disk: smooth transition, arms emerging gently */
      const blend = (r - coreRadius) / (innerDiskRadius - coreRadius);
      const baseDensity = 1.0 - blend * 0.55;

      let bestArmDensity = 0;
      for (const arm of arms) {
        if (t > arm.maxRadius) continue;
        const armTheta = spiralAngle + arm.offset;
        const delta = angleDist(theta, armTheta);
        const width = 0.8 * arm.widthScale;
        const d = Math.exp(-0.5 * Math.pow(delta / width, 2));
        if (d * arm.densityScale > bestArmDensity) {
          bestArmDensity = d * arm.densityScale;
          bestArm = arm;
        }
      }

      density = baseDensity + bestArmDensity * blend * 0.3;
      isArm = bestArmDensity > 0.5 && blend > 0.5;
    } else {
      /* Outer disk: arms are the main structure */
      let bestArmDensity = 0;
      for (const arm of arms) {
        if (t > arm.maxRadius) continue;
        const armTheta = spiralAngle + arm.offset;
        const delta = angleDist(theta, armTheta);
        const width = (0.65 - 0.45 * t) * arm.widthScale;
        const d = Math.exp(-0.5 * Math.pow(delta / Math.max(width, 0.08), 2));
        if (d * arm.densityScale > bestArmDensity) {
          bestArmDensity = d * arm.densityScale;
          bestArm = arm;
        }
      }

      density = bestArmDensity;
      isArm = bestArmDensity > 0.3;

      /* Flocculent noise */
      const noiseVal = valueNoise(r * 0.012, theta * 0.5);
      const flocculentMask = smoothstep(0.2, 0.6, noiseVal);
      density *= 0.08 + 0.92 * flocculentMask;

      density = Math.max(density, 0.008);

      /* Outer edge fade */
      if (t > 0.7) density *= 1.0 - smoothstep(0.7, 1.0, t);
    }

    if (rng.next() > density) continue;

    /* Vertical spread: bulge at center, thin at edges, arm Y-offset */
    const bulge = Math.exp(-t * 3.5);
    const sigmaY = 1.2 + 18.0 * bulge;
    const armYShift = (bestArm.yOffset || 0) * t;
    const y = gaussRandom() * sigmaY + armYShift;

    positions[placed * 3]     = r * Math.cos(theta);
    positions[placed * 3 + 1] = y;
    positions[placed * 3 + 2] = r * Math.sin(theta);
    radii[placed] = r;

    let col;
    if (t < CORE_FRACTION) {
      col = pickFromTable(warmTable);
    } else if (t < INNER_DISK_FRACTION) {
      /* Gradual blend from warm core to cooler arms */
      const blend = (t - CORE_FRACTION) / (INNER_DISK_FRACTION - CORE_FRACTION);
      col = pickFromTable(rng.next() < (1.0 - blend * 0.7) ? warmTable : coolTable);
    } else if (isArm) {
      col = pickFromTable(coolTable);
    } else {
      col = pickFromTable(dimTable);
    }

    colors[placed * 3]     = col.r;
    colors[placed * 3 + 1] = col.g;
    colors[placed * 3 + 2] = col.b;

    const baseSize = 1.0 + rng.next() * 2.0;
    const edgeFade = t > 0.6 ? 1.0 - (t - 0.6) * 1.5 : 1.0;
    sizes[placed] = baseSize * Math.max(edgeFade, 0.3);

    let bright = 0.2 + rng.next() * 0.5;
    if (t < CORE_FRACTION) bright *= 1.0;
    else if (t < INNER_DISK_FRACTION) bright *= 0.9 - (t - CORE_FRACTION) * 0.3;
    else if (isArm) bright *= 0.85;
    else bright *= 0.55;
    brightness[placed] = Math.min(bright, 1.0);

    placed++;
  }

  const count = placed;
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position',    new THREE.BufferAttribute(positions.slice(0, count * 3), 3));
  geo.setAttribute('color',       new THREE.BufferAttribute(colors.slice(0, count * 3), 3));
  geo.setAttribute('aSize',       new THREE.BufferAttribute(sizes.slice(0, count), 1));
  geo.setAttribute('aBrightness', new THREE.BufferAttribute(brightness.slice(0, count), 1));
  geo.setAttribute('aRadius',     new THREE.BufferAttribute(radii.slice(0, count), 1));

  return { geo, count };
}

export async function createDisk(scene) {
  const { vert, frag } = await loadShaderPair('galaxy-disk');
  const { geo, count } = generateDiskParticles();

  const mat = new THREE.ShaderMaterial({
    vertexShader: vert,
    fragmentShader: frag,
    uniforms: {
      uViewHeight: { value: window.innerHeight },
      uTime: { value: 0 }
    },
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true
  });

  const mesh = new THREE.Points(geo, mat);
  scene.add(mesh);

  function update(delta, elapsed) {
    mat.uniforms.uViewHeight.value = window.innerHeight;
    mat.uniforms.uTime.value = elapsed;
  }

  return { mesh, update, count };
}
