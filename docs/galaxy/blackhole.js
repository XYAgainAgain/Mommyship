import * as THREE from 'three';
import { MeshBasicNodeMaterial } from 'three/webgpu';
import { uniform, float, Fn, length, mix, smoothstep, positionLocal, vec3, vec4 } from 'three/tsl';
import { bakeNoiseTexture } from './noise-bake.js';

import { main as discFrag, uTime as discUTime, uOpacity as discUOpacity, uNoiseTexture } from './tsl/frag/accretion-disc.tsl.js';

import { main as particleVert, uTime as particleUTime, uSize } from './tsl/vert/accretion-particles.tsl.js';
import { main as particleFrag, uOpacity as particleUOpacity } from './tsl/frag/accretion-particles.tsl.js';

/* 20% of outer radius — matches masshole's 1:5 inner gap ratio */
const DISC_INNER_RADIUS = 6;
const DISC_OUTER_RADIUS = 30;
const PARTICLE_COUNT = 50000;

function lodSmoothstep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/* Mid-LOD ring: inline TSL for the 5-stop radial gradient band.
   Computes radial position directly in frag from positionLocal — no vert needed. */
const uRingOpacity = uniform(float(1.0));
const ringFragNode = /*@__PURE__*/ Fn(() => {
  const radial = length(positionLocal.xy).sub(8.0).div(14.0);
  const c0 = vec3(1.0, 0.90, 0.97);
  const c1 = vec3(0.95, 0.30, 0.60);
  const c2 = vec3(0.12, 0.30, 0.55);
  const c3 = vec3(0.51, 0.20, 0.67);
  const c4 = vec3(0.80, 0.65, 0.30);
  const surfaceColor = mix(c0, c1, smoothstep(0.0, 0.15, radial)).toVar();
  surfaceColor.assign(mix(surfaceColor, c2, smoothstep(0.15, 0.35, radial)));
  surfaceColor.assign(mix(surfaceColor, c3, smoothstep(0.35, 0.60, radial)));
  surfaceColor.assign(mix(surfaceColor, c4, smoothstep(0.60, 0.90, radial)));
  const edgeFade = smoothstep(0.0, 0.15, radial).mul(smoothstep(1.0, 0.7, radial));
  return vec4(surfaceColor, edgeFade.mul(uRingOpacity));
});

export async function createBlackHole(scene, renderer) {
  const noiseTexture = await bakeNoiseTexture(renderer);

  const group = new THREE.Group();

  /* No event horizon sphere — the dark center is created by lensing distortion
     collapsing UVs to a single point, exactly like the masshole reference. */

  const discGeo = new THREE.CylinderGeometry(DISC_OUTER_RADIUS, DISC_INNER_RADIUS, 0, 64, 10, true);
  uNoiseTexture.value = noiseTexture;
  const discMat = new MeshBasicNodeMaterial();
  discMat.fragmentNode = discFrag();
  discMat.side = THREE.DoubleSide;
  discMat.blending = THREE.AdditiveBlending;
  discMat.depthWrite = false;
  discMat.depthTest = false;
  discMat.transparent = true;
  const discMesh = new THREE.Mesh(discGeo, discMat);
  discMesh.renderOrder = 2;
  group.add(discMesh);

  const progresses = new Float32Array(PARTICLE_COUNT);
  const pSizes    = new Float32Array(PARTICLE_COUNT);
  const pRandoms  = new Float32Array(PARTICLE_COUNT);
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    progresses[i] = Math.random();
    pSizes[i]    = Math.random();
    pRandoms[i]  = Math.random();
  }
  /* Points → instanced quads: PlaneGeometry(1,1) template, per-instance orbit data.
     Billboard + world-space size in the vert; frag uses uv() instead of pointUV. */
  const particleGeo = new THREE.InstancedBufferGeometry();
  const basePlane = new THREE.PlaneGeometry(1, 1);
  particleGeo.setAttribute('position', basePlane.attributes.position);
  particleGeo.setAttribute('uv', basePlane.attributes.uv);
  particleGeo.setIndex(basePlane.index);
  particleGeo.instanceCount = PARTICLE_COUNT;
  particleGeo.setAttribute('aProgress', new THREE.InstancedBufferAttribute(progresses, 1));
  particleGeo.setAttribute('aSize',     new THREE.InstancedBufferAttribute(pSizes, 1));
  particleGeo.setAttribute('aRandom',   new THREE.InstancedBufferAttribute(pRandoms, 1));

  /* World-space radius per quad. Previous pixel-stable sprite scaling was
     uSize × viewHeight / viewZ; world-space scaling gives natural perspective falloff. */
  uSize.value = 0.12;
  const particleMat = new MeshBasicNodeMaterial();
  particleMat.positionNode = particleVert();
  particleMat.colorNode = particleFrag();
  particleMat.blending = THREE.AdditiveBlending;
  particleMat.depthWrite = false;
  particleMat.depthTest = false;
  particleMat.transparent = true;
  const particles = new THREE.Mesh(particleGeo, particleMat);
  particles.renderOrder = 3;
  particles.frustumCulled = false;
  group.add(particles);

  /* Far-LOD glow sprite — ring texture with transparent center for event horizon rim */
  const spriteCanvas = document.createElement('canvas');
  spriteCanvas.width = 64;
  spriteCanvas.height = 64;
  const ctx = spriteCanvas.getContext('2d');
  const cx = 32, cy = 32;

  /* Outer glow falloff */
  const outerGlow = ctx.createRadialGradient(cx, cy, 10, cx, cy, 32);
  outerGlow.addColorStop(0, 'rgba(131, 50, 172, 0.6)');
  outerGlow.addColorStop(0.5, 'rgba(54, 51, 255, 0.2)');
  outerGlow.addColorStop(1, 'rgba(54, 51, 255, 0)');
  ctx.fillStyle = outerGlow;
  ctx.fillRect(0, 0, 64, 64);

  /* Bright ring band — reads as Einstein ring / event horizon glow from far away */
  const ring = ctx.createRadialGradient(cx, cy, 0, cx, cy, 32);
  ring.addColorStop(0, 'rgba(0, 0, 0, 0)');
  ring.addColorStop(0.25, 'rgba(0, 0, 0, 0)');
  ring.addColorStop(0.32, 'rgba(246, 121, 229, 0.9)');
  ring.addColorStop(0.38, 'rgba(246, 121, 229, 0.9)');
  ring.addColorStop(0.5, 'rgba(131, 50, 172, 0.3)');
  ring.addColorStop(0.7, 'rgba(0, 0, 0, 0)');
  ring.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = ring;
  ctx.fillRect(0, 0, 64, 64);

  const spriteTexture = new THREE.CanvasTexture(spriteCanvas);
  const spriteMat = new THREE.SpriteMaterial({
    map: spriteTexture,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true
  });
  const glowSprite = new THREE.Sprite(spriteMat);
  glowSprite.scale.set(28, 28, 1);
  group.add(glowSprite);

  /* Opaque black disc — occludes stars at far LOD, fades out by lodFactor 0.25 */
  const occluderGeo = new THREE.CircleGeometry(5.5, 32);
  const occluderMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    depthWrite: true,
    depthTest: true
  });
  const occluder = new THREE.Mesh(occluderGeo, occluderMat);
  occluder.renderOrder = 1;
  group.add(occluder);

  /* Mid-LOD ring mesh — shows accretion disk orientation at medium distance.
     Flat in XZ like the real disk, uses radial gradient from vertex position. */
  const ringGeo = new THREE.RingGeometry(8, 22, 48);
  const ringMat = new MeshBasicNodeMaterial();
  ringMat.fragmentNode = ringFragNode();
  ringMat.side = THREE.DoubleSide;
  ringMat.blending = THREE.AdditiveBlending;
  ringMat.depthWrite = false;
  ringMat.depthTest = true;
  ringMat.transparent = true;
  const ringMesh = new THREE.Mesh(ringGeo, ringMat);
  ringMesh.rotation.x = Math.PI * 0.5;
  ringMesh.renderOrder = 1.5;
  ringMesh.visible = true;
  group.add(ringMesh);

  scene.add(group);

  function update(elapsed, lodFactor, camera) {
    discUTime.value = elapsed;
    particleUTime.value = elapsed + 9999;

    /* Glow sprite: fades out as real disk appears */
    glowSprite.material.opacity = 1 - lodFactor;
    glowSprite.visible = lodFactor < 0.99;

    /* Occluder: gone before real disk appears so they never coexist */
    occluder.quaternion.copy(camera.quaternion);
    const occluderOpacity = 1 - lodSmoothstep(0.1, 0.25, lodFactor);
    occluderMat.opacity = occluderOpacity;
    occluder.visible = occluderOpacity > 0.01;
    occluderMat.depthWrite = occluderOpacity > 0.5;

    /* Ring mesh: always visible at far range, bridges gap until real disk takes over */
    const ringOpacity = 1 - lodSmoothstep(0.3, 0.6, lodFactor);
    uRingOpacity.value = ringOpacity;
    ringMesh.visible = ringOpacity > 0.01;

    /* Real disk + particles: delayed start so occluder is fully gone first */
    const diskOpacity = lodSmoothstep(0.2, 0.8, lodFactor);
    discUOpacity.value = diskOpacity;
    particleUOpacity.value = diskOpacity;
    discMesh.visible = diskOpacity > 0.01;
    particles.visible = diskOpacity > 0.01;

    return { lodFactor };
  }

  /* No viewport-dependent uniforms after the quads conversion; kept as a stable
     API surface in case future LOD effects need it. */
  function resize() {}

  return { group, update, resize };
}
