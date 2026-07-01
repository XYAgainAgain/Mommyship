import * as THREE from 'three';
import { MeshBasicNodeMaterial } from 'three/webgpu';
import { uniform, float, Fn, length, mix, smoothstep, positionLocal, vec3, vec4 } from 'three/tsl';

import { main as bhVolFrag, uLocalCam as volLocalCam, uTime as volTime, uOpacity as volOpacity, uNoiseTexture as volNoiseTex, uStepSize as volStepSize, uMaxSteps as volMaxSteps } from './tsl/frag/blackhole-volumetric.tsl.js';

const DISC_OUTER_RADIUS = 30;

/* Volumetric-disk raymarch LOD. BASE_STEP is the approved-look step size at MAX_STEPS;
   step count ramps down with distance to keep far/small black holes cheap. */
const BH_VOL_BASE_STEP = 0.0095;
const BH_VOL_MAX_STEPS = 128;
const BH_VOL_MIN_STEPS = 48;

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
  const group = new THREE.Group();

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

  /* Bright ring band — reads as Einstein ring/event horizon glow from far away */
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

  /* Black depth disc just under the photon ring (6.6 vs 6.9): the volumetric black hides it
     while it depth-occludes markers/lanes/stars behind the hole. */
  const occluderGeo = new THREE.CircleGeometry(5.5, 32);
  const occluderMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    depthWrite: true,
    depthTest: true
  });
  const occluder = new THREE.Mesh(occluderGeo, occluderMat);
  occluder.scale.setScalar(1.2);
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
  group.add(ringMesh);

  /* Volumetric-sphere disk — single-material raymarch in unit-local space,
     unit sphere scaled to the disk outer radius. */
  const volNoise = await new THREE.TextureLoader().loadAsync('galaxy/textures/noise_deep.png');
  volNoise.wrapS = volNoise.wrapT = THREE.RepeatWrapping;
  volNoise.colorSpace = THREE.NoColorSpace;
  volNoiseTex.value = volNoise;
  const volMat = new MeshBasicNodeMaterial();
  volMat.fragmentNode = bhVolFrag();
  volMat.side = THREE.DoubleSide;
  volMat.transparent = true;
  volMat.depthWrite = false;
  volMat.depthTest = false;
  const volMesh = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 64), volMat);
  volMesh.scale.setScalar(DISC_OUTER_RADIUS);
  volMesh.renderOrder = 2;
  volMesh.frustumCulled = false;
  group.add(volMesh);

  const _volCam = new THREE.Vector3();

  scene.add(group);

  function update(elapsed, lodFactor, camera) {
    /* Glow sprite: fades out as real disk appears */
    glowSprite.material.opacity = 1 - lodFactor;
    glowSprite.visible = lodFactor < 0.99;

    /* Occluder off as the camera enters the core (Muse) → galaxy shows through */
    occluder.quaternion.copy(camera.quaternion);
    occluder.visible = camera.position.length() > 8;

    /* Ring mesh: always visible at far range, bridges gap until real disk takes over */
    const ringOpacity = 1 - lodSmoothstep(0.3, 0.6, lodFactor);
    uRingOpacity.value = ringOpacity;
    ringMesh.visible = ringOpacity > 0.01;

    /* Disk: delayed start so the far-LOD elements hand off first */
    const diskOpacity = lodSmoothstep(0.2, 0.8, lodFactor);
    volTime.value = elapsed;
    volMesh.updateMatrixWorld();
    _volCam.copy(camera.position);
    volMesh.worldToLocal(_volCam);
    volLocalCam.value.copy(_volCam);
    /* Fade the whole disk out as the camera enters the core (Muse) so the galaxy shows through
       instead of the dense disk center flooding the screen. */
    const insideFade = Math.min(1, Math.max(0, (camera.position.length() - 4) / 8));
    volOpacity.value = diskOpacity * insideFade;
    /* Step-count LOD: full steps up close (approved look, Cinema/Muse), fewer far+small;
       stepSize scales up inversely so the ray still crosses the whole sphere. */
    const q = lodSmoothstep(0.2, 1.0, lodFactor);
    const steps = Math.round(BH_VOL_MIN_STEPS + (BH_VOL_MAX_STEPS - BH_VOL_MIN_STEPS) * q);
    volMaxSteps.value = steps;
    volStepSize.value = BH_VOL_BASE_STEP * (BH_VOL_MAX_STEPS / steps);
    volMesh.visible = volOpacity.value > 0.01;

    return { lodFactor };
  }

  /* No viewport-dependent uniforms after the quads conversion; kept as a stable
     API surface in case future LOD effects need it. */
  function resize() {}

  return { group, update, resize };
}
