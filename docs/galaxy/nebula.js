import * as THREE from 'three';
import { MeshBasicNodeMaterial } from 'three/webgpu';
import { cos, Discard, float, Fn, If, length, mix, mul, sin, smoothstep, uv, varyingProperty, vec2, vec3, vec4 } from 'three/tsl';
import { createRng } from './rng.js';

import { main as nebulaVert, uTime } from './tsl/vert/nebula.tsl.js';
import { main as nebulaFrag, hash, noise } from './tsl/frag/nebula.tsl.js';

const GALAXY_RADIUS = 450;
const SPIRAL_FACTOR = -5.0;
const MIN_RADIUS = 60;
const ARM_OFFSETS = [0, (Math.PI * 2) / 3, (Math.PI * 2 * 2) / 3];

/* Volumetric.js emission palette — shared so billboards match raymarched colors */
const VOL_EMISSION_COLORS = [
  { r: 0.85, g: 0.25, b: 0.55 },
  { r: 0.75, g: 0.20, b: 0.45 },
  { r: 0.90, g: 0.35, b: 0.60 },
  { r: 0.12, g: 0.35, b: 0.50 },
  { r: 0.25, g: 0.30, b: 0.70 },
  { r: 0.35, g: 0.12, b: 0.50 },
];

/* Volumetric.js dark palette — used only for placement generation (RNG sync) */
const VOL_DARK_COLORS = [
  { r: 0.55, g: 0.45, b: 0.60 },
  { r: 0.45, g: 0.50, b: 0.65 },
  { r: 0.60, g: 0.45, b: 0.55 },
];

/* Muted dust colors tuned for billboard multiply-blending */
const DARK_PALETTE = [
  { r: 0.18, g: 0.14, b: 0.20 },
  { r: 0.14, g: 0.16, b: 0.25 },
  { r: 0.20, g: 0.13, b: 0.17 },
  { r: 0.10, g: 0.13, b: 0.20 },
];

/* Hot pink H-alpha for flower highlights */
const FLOWER_PALETTE = [
  { r: 0.95, g: 0.30, b: 0.60 },
  { r: 0.90, g: 0.25, b: 0.50 },
  { r: 0.85, g: 0.35, b: 0.65 },
  { r: 0.80, g: 0.20, b: 0.55 },
];

function angleDist(a, b) {
  let d = ((b - a) % (Math.PI * 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI;
  return Math.abs(d);
}

/* Reproduces volumetric.js placement algorithm — same seed/params keep billboards aligned */
function generateVolPlacements(count, rng, opts) {
  const placements = [];
  let attempts = 0;

  while (placements.length < count && attempts < count * 20) {
    attempts++;
    const r = MIN_RADIUS + (GALAXY_RADIUS - MIN_RADIUS) * Math.pow(rng.next(), opts.radiusPow);
    const t = r / GALAXY_RADIUS;
    if (t < opts.minT || t > opts.maxT) continue;

    const armIndex = Math.floor(rng.next() * 3);
    const spiralAngle = SPIRAL_FACTOR * Math.log(r / 10 + 1);
    const armTheta = spiralAngle + ARM_OFFSETS[armIndex];
    let theta = armTheta + rng.gauss() * opts.armScatter;
    if (opts.leadingEdge) theta += 0.15;

    let best = 0;
    for (const offset of ARM_OFFSETS) {
      const d = Math.exp(-0.5 * Math.pow(angleDist(theta, spiralAngle + offset) / 0.6, 2));
      if (d > best) best = d;
    }
    if (best < 0.3) continue;

    const sigmaY = (1.2 + 18.0 * Math.exp(-t * 3.5)) * 0.2;
    const y = rng.gauss() * sigmaY;
    const x = r * Math.cos(theta);
    const z = r * Math.sin(theta);
    if (Math.sqrt(x * x + z * z) < MIN_RADIUS) continue;

    const scale = (opts.minScale + rng.next() * (opts.maxScale - opts.minScale)) * (0.7 + 0.3 * t);
    const color = opts.colors[Math.floor(rng.next() * opts.colors.length)];
    const color2 = opts.colors[Math.floor(rng.next() * opts.colors.length)];
    rng.next(); /* consume seed to stay in sync with volumetric.js */

    placements.push({ x, y, z, radius: r, scale, color, color2 });
  }
  return placements;
}

function armPos(r, armIdx) {
  const spiral = SPIRAL_FACTOR * Math.log(r / 10 + 1);
  const theta = spiral + ARM_OFFSETS[armIdx];
  return { x: r * Math.cos(theta), z: r * Math.sin(theta), radius: r };
}

/* Scatter billboard point sprites around volumetric sphere centers */
function scatterParticles(placements, perSphere, rng, opts) {
  const total = placements.length * perSphere;
  const positions  = new Float32Array(total * 3);
  const colors     = new Float32Array(total * 3);
  const packedA    = new Float32Array(total * 4);
  const anglePhase = new Float32Array(total * 2);

  let placed = 0;
  for (const p of placements) {
    for (let i = 0; i < perSphere; i++) {
      const scatter = p.scale * 0.35;
      positions[placed * 3]     = p.x + rng.gauss() * scatter;
      positions[placed * 3 + 1] = p.y + rng.gauss() * scatter * opts.ySquash;
      positions[placed * 3 + 2] = p.z + rng.gauss() * scatter;

      const blend = rng.next();
      colors[placed * 3]     = p.color.r * (1 - blend) + p.color2.r * blend;
      colors[placed * 3 + 1] = p.color.g * (1 - blend) + p.color2.g * blend;
      colors[placed * 3 + 2] = p.color.b * (1 - blend) + p.color2.b * blend;

      /* Pack size, brightness, radius, stretch into vec4 */
      packedA[placed * 4]     = opts.minSize + rng.next() * (opts.maxSize - opts.minSize);
      packedA[placed * 4 + 1] = opts.minBright + rng.next() * (opts.maxBright - opts.minBright);
      packedA[placed * 4 + 2] = p.radius;
      packedA[placed * 4 + 3] = 0.4 + rng.next() * 0.6;

      anglePhase[placed * 2]     = rng.next() * Math.PI;
      anglePhase[placed * 2 + 1] = rng.next() * 100.0;
      placed++;
    }
  }

  const base = new THREE.PlaneGeometry(1, 1);
  const geo = new THREE.InstancedBufferGeometry();
  geo.index = base.index;
  geo.setAttribute('position', base.getAttribute('position'));
  geo.setAttribute('uv',       base.getAttribute('uv'));
  geo.setAttribute('normal',   base.getAttribute('normal'));
  geo.setAttribute('aOffset',     new THREE.InstancedBufferAttribute(positions, 3));
  geo.setAttribute('color',       new THREE.InstancedBufferAttribute(colors, 3));
  geo.setAttribute('aPackedA',    new THREE.InstancedBufferAttribute(packedA, 4));
  geo.setAttribute('aAnglePhase', new THREE.InstancedBufferAttribute(anglePhase, 2));
  geo.instanceCount = placed;

  return { geo, count: placed };
}

/* Dark nebula frag — inline TSL for multiply-blended dust absorption.
   Uses hash/noise from the emission nebula frag since the algorithm is identical. */
const darkVColor = varyingProperty('vec3', 'vColor');
const darkVBrightness = varyingProperty('float', 'vBrightness');
const darkVStretch = varyingProperty('float', 'vStretch');
const darkVAngle = varyingProperty('float', 'vAngle');
const darkVPhase = varyingProperty('float', 'vPhase');

const darkFragNode = /*@__PURE__*/ Fn(() => {
  const uvCoord = uv().sub(vec2(0.5));
  const cosA = cos(darkVAngle);
  const sinA = sin(darkVAngle);
  const rotated = vec2(
    uvCoord.x.mul(cosA).sub(uvCoord.y.mul(sinA)),
    uvCoord.x.mul(sinA).add(uvCoord.y.mul(cosA))
  ).toVar();
  rotated.y.divAssign(darkVStretch);
  const warp = noise(rotated.mul(3.0).add(darkVPhase)).mul(0.15);
  const dist = length(rotated).add(warp);
  If(dist.greaterThan(0.5), () => { Discard(); });
  const shape = smoothstep(0.5, 0.0, dist).toVar();
  shape.mulAssign(shape);
  const tint = mix(vec3(1.0), darkVColor, shape.mul(darkVBrightness));
  return vec4(tint, 1.0);
});

export async function createNebula(scene) {
  /* Same seed as volumetric.js so billboard clusters align with raymarched spheres */
  const volRng = createRng(42069);

  const emissionPlacements = generateVolPlacements(30, volRng, {
    radiusPow: 0.5, minT: 0.08, maxT: 0.95,
    armScatter: 0.25, leadingEdge: false,
    minScale: 90, maxScale: 160,
    colors: VOL_EMISSION_COLORS
  });

  const darkPlacements = generateVolPlacements(12, volRng, {
    radiusPow: 0.4, minT: 0.30, maxT: 1.0,
    armScatter: 0.5, leadingEdge: false,
    minScale: 120, maxScale: 240,
    colors: VOL_DARK_COLORS
  });

  /* Broken Arm Nebula — hardcoded positions along Arm 2, matching volumetric.js */
  const brokenArmEmission = [
    { ...armPos(310, 2), y: -1, scale: 140,
      color: { r: 0.90, g: 0.30, b: 0.58 }, color2: { r: 0.25, g: 0.30, b: 0.70 } },
    { ...armPos(325, 2), y: 1, scale: 120,
      color: { r: 0.85, g: 0.25, b: 0.55 }, color2: { r: 0.35, g: 0.12, b: 0.50 } },
    { ...armPos(345, 2), y: 0, scale: 130,
      color: { r: 0.65, g: 0.22, b: 0.50 }, color2: { r: 0.12, g: 0.35, b: 0.50 } },
    { ...armPos(355, 2), y: -2, scale: 110,
      color: { r: 0.35, g: 0.28, b: 0.55 }, color2: { r: 0.12, g: 0.38, b: 0.52 } },
    { ...armPos(375, 2), y: 1, scale: 100,
      color: { r: 0.12, g: 0.35, b: 0.50 }, color2: { r: 0.08, g: 0.40, b: 0.45 } },
    { ...armPos(395, 2), y: 0, scale: 80,
      color: { r: 0.10, g: 0.38, b: 0.48 }, color2: { r: 0.20, g: 0.28, b: 0.60 } },
  ];

  const brokenArmDark = [
    { ...armPos(340, 2), y: -1, scale: 180,
      color: DARK_PALETTE[0], color2: DARK_PALETTE[1] },
    { ...armPos(370, 2), y: 0, scale: 150,
      color: DARK_PALETTE[1], color2: DARK_PALETTE[2] },
  ];

  const allEmission = [...emissionPlacements, ...brokenArmEmission];
  const allDark = [
    ...darkPlacements.map((p, i) => ({
      ...p,
      color: DARK_PALETTE[i % DARK_PALETTE.length],
      color2: DARK_PALETTE[(i + 1) % DARK_PALETTE.length]
    })),
    ...brokenArmDark
  ];

  /* Flower highlights — one bright spot per emission sphere in the mid-disk */
  const flowerPlacements = allEmission
    .filter(p => p.radius / GALAXY_RADIUS >= 0.25 && p.radius / GALAXY_RADIUS <= 0.70)
    .slice(0, 24)
    .map((p, i) => ({
      ...p,
      color: FLOWER_PALETTE[i % FLOWER_PALETTE.length],
      color2: FLOWER_PALETTE[(i + 1) % FLOWER_PALETTE.length]
    }));

  /* Scatter billboard particles around each volumetric sphere center */
  const scatterRng = createRng(7777);

  const emission = scatterParticles(allEmission, 17, scatterRng, {
    ySquash: 0.3,
    minSize: 25, maxSize: 70,
    minBright: 0.04, maxBright: 0.12
  });

  const flowers = scatterParticles(flowerPlacements, 1, scatterRng, {
    ySquash: 0.15,
    minSize: 10, maxSize: 22,
    minBright: 0.15, maxBright: 0.25
  });

  const dark = scatterParticles(allDark, 18, scatterRng, {
    ySquash: 0.25,
    minSize: 12, maxSize: 30,
    minBright: 0.25, maxBright: 0.5
  });

  /* Emission + flower: screen-style blending (additive with source color attenuation) */
  const emissionMat = new MeshBasicNodeMaterial();
  emissionMat.positionNode = nebulaVert();
  emissionMat.fragmentNode = nebulaFrag();
  emissionMat.blending = THREE.CustomBlending;
  emissionMat.blendEquation = THREE.AddEquation;
  emissionMat.blendSrc = THREE.OneFactor;
  emissionMat.blendDst = THREE.OneMinusSrcColorFactor;
  emissionMat.depthWrite = false;
  emissionMat.transparent = true;
  emissionMat.side = THREE.DoubleSide;

  const emissionMesh = new THREE.Mesh(emission.geo, emissionMat);
  emissionMesh.renderOrder = -1;
  emissionMesh.frustumCulled = false;
  scene.add(emissionMesh);

  const flowerMat = new MeshBasicNodeMaterial();
  flowerMat.positionNode = nebulaVert();
  flowerMat.fragmentNode = nebulaFrag();
  flowerMat.blending = THREE.CustomBlending;
  flowerMat.blendEquation = THREE.AddEquation;
  flowerMat.blendSrc = THREE.OneFactor;
  flowerMat.blendDst = THREE.OneMinusSrcColorFactor;
  flowerMat.depthWrite = false;
  flowerMat.transparent = true;
  flowerMat.side = THREE.DoubleSide;

  const flowerMesh = new THREE.Mesh(flowers.geo, flowerMat);
  flowerMesh.renderOrder = -1;
  flowerMesh.frustumCulled = false;
  scene.add(flowerMesh);

  /* Dark dust: multiply-blending dims the starfield behind */
  const darkMat = new MeshBasicNodeMaterial();
  darkMat.positionNode = nebulaVert();
  darkMat.fragmentNode = darkFragNode();
  darkMat.blending = THREE.MultiplyBlending;
  darkMat.premultipliedAlpha = true;
  darkMat.depthWrite = false;
  darkMat.transparent = true;
  darkMat.side = THREE.DoubleSide;

  const darkMesh = new THREE.Mesh(dark.geo, darkMat);
  darkMesh.renderOrder = -2;
  darkMesh.frustumCulled = false;
  scene.add(darkMesh);

  function update(delta, elapsed) {
    uTime.value = elapsed;
  }

  return { emissionMesh, flowerMesh, darkMesh, update };
}
