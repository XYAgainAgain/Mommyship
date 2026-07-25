import * as THREE from 'three';
import { MeshBasicNodeMaterial } from 'three/webgpu';

import { main as composeFrag, uSpaceTexture, uSceneDepth, uBHDepth, uBlackHolePosition, uDistortionStrength, uBHScreenRadius, uAspect,
  uLensStrength, uLensReach, uSecondaryStrength, uEdgeMargin, uReachFloor, uEaseStart, uEaseEnd, uMuseWarp } from './tsl/frag/compose.tsl.js';

/* Multi-pass BH-lensing pipeline: scene → spaceRT, then a quad composites the Einstein-lens
   remap + chromatic aberration — pure math, no extra distortion RT. Skipped when LOD = 0. */

const PHOTON_RING_RADIUS = 6.9; /* photon ring = uRingRadius 0.23 × 30 sphere scale */

const _origin = new THREE.Vector3();
const _edge = new THREE.Vector3();
const _camUp = new THREE.Vector3();
const _camFwd = new THREE.Vector3();

export async function createCompositor(renderer) {
  const orthoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
  orthoCamera.position.z = 1;
  const composeScene = new THREE.Scene();

  /* Render target — created lazily on first LOD > 0 */
  let spaceRT = null;
  let rtsReady = false;

  const composeMat = new MeshBasicNodeMaterial();
  composeMat.fragmentNode = composeFrag();
  composeMat.depthWrite = false;
  composeMat.depthTest = false;

  uBlackHolePosition.value.set(0.5, 0.5);
  uDistortionStrength.value = 0.0;

  /* Live lens-tuning knobs, e.g. lensTweak.lensReach.value = 0.5 — see compose.tsl.js for what each does */
  if (typeof window !== 'undefined') {
    window.lensTweak = {
      lensStrength: uLensStrength, lensReach: uLensReach, secondaryStrength: uSecondaryStrength,
      edgeMargin: uEdgeMargin, reachFloor: uReachFloor, easeStart: uEaseStart, easeEnd: uEaseEnd,
      museWarp: uMuseWarp, // Muse-only smear bypass; 0-1 sane, up to ~1.5 before edge streaks
    };
  }

  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), composeMat);
  quad.frustumCulled = false;
  composeScene.add(quad);

  function ensureRTs() {
    if (rtsReady) return;
    const w = renderer.domElement.width;
    const h = renderer.domElement.height;

    /* Match the canvas path's MSAA (antialias: true → 4) so crossing the LOD threshold
       into the compositor doesn't silently drop antialiasing. */
    spaceRT = new THREE.RenderTarget(w, h, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      samples: 4
    });
    /* Depth readable by the compose pass for the lensing gate; setSize resizes it */
    spaceRT.depthTexture = new THREE.DepthTexture(w, h);
    uSceneDepth.value = spaceRT.depthTexture;

    uSpaceTexture.value = spaceRT.texture;
    rtsReady = true;
  }

  function resize() {
    if (!rtsReady) return;
    const w = renderer.domElement.width;
    const h = renderer.domElement.height;
    spaceRT.setSize(w, h);
  }

  /* lensLod: true distance-based LOD for warp strength. Cinema forces lodFactor to 1 for
     pipeline quality; the lens must not inherit that or the galaxy view warps full-tilt. */
  function render(scene, camera, bhScreenPos, lodFactor, markerScene, lensLod) {
    ensureRTs();

    uBlackHolePosition.value.copy(bhScreenPos);
    uDistortionStrength.value = lensLod ?? lodFactor;

    /* Project the photon-ring radius to a screen-space (y-UV) radius so the lensing hugs the photon
       ring (not the disk's outer rim) and scales with distance. Clamped for the inside (Muse) case. */
    _camUp.setFromMatrixColumn(camera.matrixWorld, 1);
    _origin.set(0, 0, 0).project(camera);
    _edge.copy(_camUp).multiplyScalar(PHOTON_RING_RADIUS).project(camera);
    uBHScreenRadius.value = Math.min(2.0, Math.max(0.02, Math.abs(_edge.y - _origin.y) * 0.5));
    uAspect.value = renderer.domElement.width / renderer.domElement.height;

    /* Inside the core: gate off (0 = lens everything). BH behind the camera: project()
       wraps the origin back on-screen, so push the gate past the far plane instead. */
    _camFwd.setFromMatrixColumn(camera.matrixWorld, 2).negate();
    const bhBehind = _camFwd.dot(camera.position) > 0;
    uBHDepth.value = camera.position.lengthSq() < 64 ? 0
      : bhBehind ? 2
      : Math.min(1, Math.max(0, _origin.z));

    /* Pass 1: entire galaxy scene → spaceRT */
    renderer.setRenderTarget(spaceRT);
    renderer.clear();
    renderer.render(scene, camera);

    /* Pass 1b: markers into same RT so they get UV-distorted by the BH.
       Depth is NOT cleared — asteroid depth occludes markers behind them */
    if (markerScene) {
      renderer.render(markerScene, camera);
    }

    /* Pass 2: composition quad → screen */
    renderer.setRenderTarget(null);
    renderer.clear();
    renderer.render(composeScene, orthoCamera);
  }

  return { render, resize, composeMat, setMuseWarp: (v) => { uMuseWarp.value = v; } };
}
