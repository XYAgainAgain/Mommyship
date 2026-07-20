import * as THREE from 'three';
import { MeshBasicNodeMaterial } from 'three/webgpu';
import { Fn, If, Discard, uniform, float, vec4 } from 'three/tsl';

import { main as bhVolFrag, ignPixel, uLocalCam as volLocalCam, uTime as volTime, uOpacity as volOpacity, uNoiseTexture as volNoiseTex, uStepSize as volStepSize, uMaxSteps as volMaxSteps, uCrossFade } from './tsl/frag/blackhole-volumetric.tsl.js';
import { main as bhFarFrag, uSinElev } from './tsl/frag/blackhole-far.tsl.js';

const DISC_OUTER_RADIUS = 30;
const OCCLUDER_RADIUS = 6.9;

/* IGN-dithered black: discarded pixels skip the depth write too, so occlusion
   melts away statistically instead of popping when the disc toggles. */
const uOccFade = uniform(float(1));
const occFragNode = /*@__PURE__*/ Fn(() => {
  If(ignPixel().greaterThanEqual(uOccFade), () => { Discard(); });
  return vec4(0, 0, 0, 1);
});

/* Volumetric-disk raymarch LOD. BASE_STEP is the approved-look step size at MAX_STEPS;
   step count ramps down with distance to keep far/small black holes cheap. */
const BH_VOL_BASE_STEP = 0.0095;
const BH_VOL_MAX_STEPS = 128;
const BH_VOL_MIN_STEPS = 48;

function lodSmoothstep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

export async function createBlackHole(scene, renderer) {
  const group = new THREE.Group();

  /* Black depth disc at the photon ring radius: covers the ray-steering-darkened zone,
     edge hides under the bright ring, depth-occludes markers/lanes/stars behind the hole. */
  const occluderGeo = new THREE.CircleGeometry(OCCLUDER_RADIUS, 48);
  const occluderMat = new MeshBasicNodeMaterial();
  occluderMat.fragmentNode = occFragNode();
  occluderMat.depthWrite = true;
  occluderMat.depthTest = true;
  const occluder = new THREE.Mesh(occluderGeo, occluderMat);
  occluder.renderOrder = 1;
  group.add(occluder);

  /* Shared noise texture — volumetric raymarch and far billboard sample the same node. */
  const volNoise = await new THREE.TextureLoader().loadAsync('galaxy/textures/noise_deep.png');
  volNoise.wrapS = volNoise.wrapT = THREE.RepeatWrapping;
  volNoise.colorSpace = THREE.NoColorSpace;
  volNoiseTex.value = volNoise;

  /* Far-LOD billboard: analytic disk + ring + wrap arc, IGN-dither crossfaded with the
     volumetric (complementary discards). Normal-blended coverage so dark lanes still occlude the core. */
  const farMat = new MeshBasicNodeMaterial();
  farMat.fragmentNode = bhFarFrag();
  farMat.transparent = true;
  farMat.depthWrite = false;
  farMat.depthTest = true;
  const farQuad = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), farMat);
  farQuad.scale.setScalar(DISC_OUTER_RADIUS * 2);
  farQuad.renderOrder = 1.5;
  farQuad.frustumCulled = false;
  group.add(farQuad);

  /* Volumetric-sphere disk — single-material raymarch in unit-local space,
     unit sphere scaled to the disk outer radius. */
  const volMat = new MeshBasicNodeMaterial();
  volMat.fragmentNode = bhVolFrag();
  volMat.side = THREE.DoubleSide;
  volMat.transparent = true;
  volMat.depthWrite = false;
  // depthTest on: nearer scene objects (ships!) must occlude the disk instead of being painted over.
  volMat.depthTest = true;
  const volMesh = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 64), volMat);
  volMesh.scale.setScalar(DISC_OUTER_RADIUS);
  volMesh.renderOrder = 2;
  volMesh.frustumCulled = false;
  group.add(volMesh);

  const _volCam = new THREE.Vector3();

  scene.add(group);

  function update(elapsed, lodFactor, camera) {
    /* A flat disc matches the sphere silhouette only from afar — apparent radius grows
       as R/√(1−(R/d)²), else markers peek as crescents. */
    occluder.quaternion.copy(camera.quaternion);
    const occDist = camera.position.length();
    const occRatio = Math.min(OCCLUDER_RADIUS / Math.max(occDist, 1e-3), 0.94);
    occluder.scale.setScalar(1 / Math.sqrt(1 - occRatio * occRatio));

    /* IGN crossfade: one uniform drives both discards — far billboard owns the pixels
       the volumetric gives up, so the handoff never double-exposes. Snapped to exact
       0/1 outside the band so a hidden mesh never strands discarded pixels unowned. */
    /* Band sits far out (dist ≈ 234–278) where the BH is small on screen — a close-in
       dither band gets magnified by the lens into visible spokes. */
    let xf = lodSmoothstep(0.1, 0.35, lodFactor);
    xf = xf > 0.999 ? 1 : xf < 0.001 ? 0 : xf;
    uCrossFade.value = xf;
    farQuad.quaternion.copy(camera.quaternion);
    uSinElev.value = camera.position.y / Math.max(occDist, 1e-3);
    farQuad.visible = xf < 1;

    volTime.value = elapsed;
    volMesh.updateMatrixWorld();
    _volCam.copy(camera.position);
    volMesh.worldToLocal(_volCam);
    volLocalCam.value.copy(_volCam);
    /* Fade the whole disk out as the camera enters the core (Muse) so the galaxy shows through
       instead of the dense disk center flooding the screen. */
    const insideFade = Math.min(1, Math.max(0, (camera.position.length() - 4) / 8));
    volOpacity.value = insideFade;
    /* Occlusion melts on the same ramp as the disk — one "falling in" transition. */
    uOccFade.value = insideFade;
    occluder.visible = insideFade > 0.001;
    /* Step-count LOD: full steps up close (approved look, Cinema/Muse), fewer far+small;
       stepSize scales up inversely so the ray still crosses the whole sphere. */
    const q = lodSmoothstep(0.2, 1.0, lodFactor);
    const steps = Math.round(BH_VOL_MIN_STEPS + (BH_VOL_MAX_STEPS - BH_VOL_MIN_STEPS) * q);
    volMaxSteps.value = steps;
    volStepSize.value = BH_VOL_BASE_STEP * (BH_VOL_MAX_STEPS / steps);
    volMesh.visible = xf > 0 && insideFade > 0.001;

    return { lodFactor };
  }

  /* No viewport-dependent uniforms right now; kept as a stable API surface
     in case future LOD effects need it. */
  function resize() {}

  return { group, update, resize };
}
