import * as THREE from 'three';
import { loadShaderPair } from './shaders.js';
import { createRng } from './rng.js';
import { bakeVolumeTexture } from './volume-bake.js';

const VOLUMETRIC_SEED = 42069;
const GALAXY_RADIUS = 450;
const SPIRAL_FACTOR = -5.0;
const MIN_RADIUS = 60;

const EMISSION_COUNT = 30;
const DARK_COUNT = 12;

const LOD_FULL = 400;
const LOD_QUAD = 800;

const ARM_OFFSETS = [0, (Math.PI * 2) / 3, (Math.PI * 2 * 2) / 3];

const EMISSION_COLORS = [
  new THREE.Color(0.85, 0.25, 0.55),
  new THREE.Color(0.75, 0.20, 0.45),
  new THREE.Color(0.90, 0.35, 0.60),
  new THREE.Color(0.12, 0.35, 0.50),
  new THREE.Color(0.25, 0.30, 0.70),
  new THREE.Color(0.35, 0.12, 0.50),
];

/* MultiplyBlending dims the starfield without blackout */
const DARK_COLORS = [
  new THREE.Color(0.55, 0.45, 0.60),
  new THREE.Color(0.45, 0.50, 0.65),
  new THREE.Color(0.60, 0.45, 0.55),
];

const QUAD_VERT = `
precision highp float;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const QUAD_FRAG = `
precision highp float;
uniform vec3 uColor;
uniform float uOpacity;
varying vec2 vUv;
void main() {
  vec2 centered = vUv - 0.5;
  float dist = length(centered) * 2.0;
  float alpha = exp(-dist * dist * 3.0) * uOpacity;
  if (alpha < 0.005) discard;
  gl_FragColor = vec4(uColor * alpha, alpha);
}`;

const QUAD_FRAG_DARK = `
precision highp float;
uniform vec3 uColor;
uniform float uOpacity;
varying vec2 vUv;
void main() {
  vec2 centered = vUv - 0.5;
  float dist = length(centered) * 2.0;
  float strength = exp(-dist * dist * 3.0) * uOpacity;
  if (strength < 0.005) discard;
  vec3 tint = mix(vec3(1.0), uColor, strength);
  gl_FragColor = vec4(tint, 1.0);
}`;

function angleDist(a, b) {
  let d = ((b - a) % (Math.PI * 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI;
  return Math.abs(d);
}

function generatePlacements(count, rng, opts) {
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

    let bestArmDensity = 0;
    for (const offset of ARM_OFFSETS) {
      const at = spiralAngle + offset;
      const delta = angleDist(theta, at);
      const d = Math.exp(-0.5 * Math.pow(delta / 0.6, 2));
      if (d > bestArmDensity) bestArmDensity = d;
    }
    if (bestArmDensity < 0.3) continue;

    const starSigmaY = 1.2 + 18.0 * Math.exp(-t * 3.5);
    const y = rng.gauss() * starSigmaY * 0.2;

    const x = r * Math.cos(theta);
    const z = r * Math.sin(theta);
    if (Math.sqrt(x * x + z * z) < MIN_RADIUS) continue;

    const baseScale = opts.minScale + rng.next() * (opts.maxScale - opts.minScale);
    const scale = baseScale * (0.7 + 0.3 * t);

    const colorIdx = Math.floor(rng.next() * opts.colors.length);
    const color = opts.colors[colorIdx];
    const color2Idx = Math.floor(rng.next() * opts.colors.length);
    const color2 = opts.colors[color2Idx];
    const seed = rng.next();

    placements.push({
      x, y, z, radius: r, theta, scale, color, color2, seed,
      density: opts.density,
      absorption: opts.absorption,
      brightness: opts.brightness,
      isDark: opts.isDark
    });
  }

  return placements;
}

function smoothstep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/* Position along a spiral arm at given radius */
function armPos(r, armIdx) {
  const spiral = SPIRAL_FACTOR * Math.log(r / 10 + 1);
  const theta = spiral + ARM_OFFSETS[armIdx];
  return { x: r * Math.cos(theta), z: r * Math.sin(theta), radius: r, theta };
}

export async function createVolumetric(scene, renderer) {
  if (!renderer.capabilities.isWebGL2) {
    console.warn('Volumetric nebulae require WebGL2');
    return { update() {}, addToScene() {}, removeFromScene() {} };
  }

  const { vert, frag } = await loadShaderPair('volumetric');
  const rng = createRng(VOLUMETRIC_SEED);

  const volumeTex1 = bakeVolumeTexture({ seed: 31337, frequency: 4.0, octaves: 5 });
  const volumeTex2 = bakeVolumeTexture({ seed: 80085, frequency: 3.0, octaves: 4 });

  /* Sphere container for raymarch; BackSide rendering handles fly-through */
  const sphereGeo = new THREE.SphereGeometry(0.5, 16, 12);
  const quadGeo = new THREE.PlaneGeometry(1, 1);

  const emissionPlacements = generatePlacements(EMISSION_COUNT, rng, {
    radiusPow: 0.5,
    minT: 0.08,
    maxT: 0.95,
    armScatter: 0.25,
    leadingEdge: false,
    minScale: 90,
    maxScale: 160,
    colors: EMISSION_COLORS,
    density: 1.8,
    absorption: 0.0,
    brightness: 1.2,
    isDark: false
  });

  const darkPlacements = generatePlacements(DARK_COUNT, rng, {
    radiusPow: 0.4,
    minT: 0.30,
    maxT: 1.0,
    armScatter: 0.5,
    leadingEdge: false,
    minScale: 120,
    maxScale: 240,
    colors: DARK_COLORS,
    density: 2.0,
    absorption: 1.0,
    brightness: 0.0,
    isDark: true
  });

  /* Broken Arm Nebula: overlapping spheres on Arm 2's outer tip.
     Color flows hot pink/blue (thick end) → teal/indigo (thin end). */
  const brokenArm = [
    /* Thick end: hot pink + blue */
    { ...armPos(310, 2), y: -1, scale: 140,
      color: new THREE.Color(0.90, 0.30, 0.58),
      color2: new THREE.Color(0.25, 0.30, 0.70),
      seed: 0.101, density: 2.0, absorption: 0.0, brightness: 1.4, isDark: false },
    { ...armPos(325, 2), y: 1, scale: 120,
      color: new THREE.Color(0.85, 0.25, 0.55),
      color2: new THREE.Color(0.35, 0.12, 0.50),
      seed: 0.202, density: 1.8, absorption: 0.0, brightness: 1.3, isDark: false },
    /* Elbow: pink bleeds into teal */
    { ...armPos(345, 2), y: 0, scale: 130,
      color: new THREE.Color(0.65, 0.22, 0.50),
      color2: new THREE.Color(0.12, 0.35, 0.50),
      seed: 0.303, density: 1.8, absorption: 0.0, brightness: 1.3, isDark: false },
    { ...armPos(355, 2), y: -2, scale: 110,
      color: new THREE.Color(0.35, 0.28, 0.55),
      color2: new THREE.Color(0.12, 0.38, 0.52),
      seed: 0.404, density: 1.6, absorption: 0.0, brightness: 1.2, isDark: false },
    /* Thin end: teal/indigo, cooler and diffuse */
    { ...armPos(375, 2), y: 1, scale: 100,
      color: new THREE.Color(0.12, 0.35, 0.50),
      color2: new THREE.Color(0.08, 0.40, 0.45),
      seed: 0.505, density: 1.5, absorption: 0.0, brightness: 1.1, isDark: false },
    { ...armPos(395, 2), y: 0, scale: 80,
      color: new THREE.Color(0.10, 0.38, 0.48),
      color2: new THREE.Color(0.20, 0.28, 0.60),
      seed: 0.606, density: 1.4, absorption: 0.0, brightness: 1.0, isDark: false },
    /* Dark dust in the elbow */
    { ...armPos(340, 2), y: -1, scale: 180,
      color: new THREE.Color(0.55, 0.45, 0.60),
      color2: new THREE.Color(0.50, 0.42, 0.55),
      seed: 0.707, density: 2.0, absorption: 1.0, brightness: 0.0, isDark: true },
    { ...armPos(370, 2), y: 0, scale: 150,
      color: new THREE.Color(0.45, 0.50, 0.65),
      color2: new THREE.Color(0.60, 0.45, 0.55),
      seed: 0.808, density: 1.8, absorption: 1.0, brightness: 0.0, isDark: true },
  ];

  const allPlacements = [...emissionPlacements, ...darkPlacements, ...brokenArm];
  const volumes = [];

  for (let i = 0; i < allPlacements.length; i++) {
    const p = allPlacements[i];
    const tex = (i % 2 === 0) ? volumeTex1 : volumeTex2;

    const mat = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      uniforms: {
        uVolume:     { value: tex },
        uTime:       { value: 0 },
        uSeed:       { value: p.seed },
        uColor:      { value: p.color },
        uColor2:     { value: p.color2 },
        uDensity:    { value: p.density },
        uAbsorption: { value: p.absorption },
        uBrightness: { value: p.brightness },
        uCameraDist: { value: 1000 },
        uOpacity:    { value: 1.0 },
        uCameraPos:  { value: new THREE.Vector3() }
      },
      glslVersion: THREE.GLSL3,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      blending: p.isDark ? THREE.MultiplyBlending : THREE.AdditiveBlending
    });

    const sphere = new THREE.Mesh(sphereGeo, mat);
    sphere.position.set(p.x, p.y, p.z);

    const ySquash = p.isDark ? 0.25 : 0.35;
    sphere.scale.set(p.scale, p.scale * ySquash, p.scale);
    sphere.renderOrder = p.isDark ? 0.5 : -1.5;
    sphere.frustumCulled = false;

    const quadMat = new THREE.ShaderMaterial({
      vertexShader: QUAD_VERT,
      fragmentShader: p.isDark ? QUAD_FRAG_DARK : QUAD_FRAG,
      uniforms: {
        uColor:   { value: p.color },
        uOpacity: { value: 0.0 }
      },
      transparent: true,
      depthWrite: false,
      depthTest: true,
      blending: p.isDark ? THREE.MultiplyBlending : THREE.AdditiveBlending
    });

    const quad = new THREE.Mesh(quadGeo, quadMat);
    quad.position.set(p.x, p.y, p.z);
    quad.scale.set(p.scale, p.scale, 1);
    quad.renderOrder = p.isDark ? 0.5 : -1.5;
    quad.frustumCulled = true;

    volumes.push({
      sphere, quad,
      baseTheta: p.theta,
      radius: p.radius,
      baseY: p.y,
      boxInScene: false,
      quadInScene: false
    });
  }

  let active = false;

  function addToScene() {
    active = true;
  }

  function removeFromScene() {
    active = false;
    for (const v of volumes) {
      if (v.boxInScene) { scene.remove(v.sphere); v.boxInScene = false; }
      if (v.quadInScene) { scene.remove(v.quad); v.quadInScene = false; }
    }
  }

  function update(delta, elapsed, rotationTime, camera, cinemaMode) {
    if (!active) return;

    for (const v of volumes) {
      const r = v.radius;
      const coreBoost = 0.18 * Math.exp(-r * 0.05);
      const angularSpeed = 0.06 + 0.008 / (r + 60) + coreBoost;
      const angle = rotationTime * angularSpeed;

      const newTheta = v.baseTheta + angle;
      const px = r * Math.cos(newTheta);
      const pz = r * Math.sin(newTheta);

      v.sphere.position.set(px, v.baseY, pz);
      v.quad.position.set(px, v.baseY, pz);

      v.quad.quaternion.copy(camera.quaternion);

      const dist = camera.position.distanceTo(v.sphere.position);

      v.sphere.material.uniforms.uTime.value = elapsed;
      v.sphere.material.uniforms.uCameraPos.value.copy(camera.position);
      v.sphere.material.uniforms.uCameraDist.value = cinemaMode ? 0 : dist;

      /* Cinema mode: full raymarch on every volume, no quad fallback */
      if (cinemaMode) {
        v.sphere.material.uniforms.uOpacity.value = 1.0;
        if (!v.boxInScene) { scene.add(v.sphere); v.boxInScene = true; }
        if (v.quadInScene) { scene.remove(v.quad); v.quadInScene = false; }
        continue;
      }

      if (dist < LOD_FULL) {
        v.sphere.material.uniforms.uOpacity.value = 1.0;
        if (!v.boxInScene) { scene.add(v.sphere); v.boxInScene = true; }
        if (v.quadInScene) { scene.remove(v.quad); v.quadInScene = false; }
      } else if (dist < LOD_QUAD) {
        const t = smoothstep(LOD_FULL, LOD_QUAD, dist);
        v.sphere.material.uniforms.uOpacity.value = 1.0 - t;
        v.quad.material.uniforms.uOpacity.value = t * 0.6;
        if (!v.boxInScene) { scene.add(v.sphere); v.boxInScene = true; }
        if (!v.quadInScene) { scene.add(v.quad); v.quadInScene = true; }
      } else {
        v.quad.material.uniforms.uOpacity.value = 0.6;
        if (v.boxInScene) { scene.remove(v.sphere); v.boxInScene = false; }
        if (!v.quadInScene) { scene.add(v.quad); v.quadInScene = true; }
      }
    }
  }

  return { update, addToScene, removeFromScene };
}
