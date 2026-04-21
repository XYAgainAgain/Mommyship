import * as THREE from 'three';
import { MeshBasicNodeMaterial } from 'three/webgpu';
import { uniform, texture, float, vec3 } from 'three/tsl';
import { bakeVolumeTexture } from './volume-bake.js';

import { main as dustTorusVert } from './tsl/vert/dust-torus.tsl.js';
import { main as dustTorusFrag, uVolume, uLightmap, uTime, uCameraDist, uOpacity } from './tsl/frag/dust-torus.tsl.js';

const BASE_SPEED = 0.061;

const TORUS_DEFS = [
  {
    name: 'inner',
    majorR: 220, minorR: 140,
    ySquash: 0.15,
    boxHalfXZ: 360, boxHalfY: 21,
    speedFraction: 0.95,
    /* 1.0 = lightmap perfectly tracks galaxy rotation; lower = drift (outer tori are too diffuse to need exact tracking) */
    lightmapLag: 1.0,
    baseColor: new THREE.Color(0.45, 0.40, 0.30),
    densityScale: 0.7,
    noiseScale: 3.0, noiseStrength: 0.7,
    warpScale: 0.5,
    seed: 0.123,
    renderOrder: -3.0,
    minSteps: 16, maxSteps: 32,
  },
  {
    name: 'gasket',
    majorR: 350, minorR: 150,
    ySquash: 0.18,
    boxHalfXZ: 500, boxHalfY: 27,
    speedFraction: 0.85,
    lightmapLag: 0.7,
    baseColor: new THREE.Color(0.25, 0.22, 0.40),
    densityScale: 0.28,
    noiseScale: 2.5, noiseStrength: 0.7,
    warpScale: 1.0,
    seed: 0.456,
    renderOrder: -3.5,
    minSteps: 16, maxSteps: 32,
  },
  {
    name: 'fluffy',
    majorR: 550, minorR: 170,
    ySquash: 0.40,
    boxHalfXZ: 720, boxHalfY: 68,
    speedFraction: 0.70,
    lightmapLag: 0.4,
    baseColor: new THREE.Color(0.18, 0.15, 0.35),
    densityScale: 0.18,
    noiseScale: 1.8, noiseStrength: 0.6,
    warpScale: 1.8,
    seed: 0.789,
    renderOrder: -4.0,
    minSteps: 12, maxSteps: 24,
  },
];

export async function createDustTorus(scene, renderer, lightmap) {
  const volumeTex = await bakeVolumeTexture({ seed: 55555, frequency: 5.0, octaves: 5 });

  /* Shared uniforms — set .value once, affects all 3 tori */
  uVolume.value = volumeTex;
  uLightmap.value = lightmap;
  uOpacity.value = 1.0;

  const _tmpCamLocal = new THREE.Vector3();
  const tori = [];

  for (const def of TORUS_DEFS) {
    const geo = new THREE.BoxGeometry(1, 1, 1);

    /* Per-torus uniform nodes — each torus gets its own set */
    const pBoxScale = uniform(vec3(def.boxHalfXZ, def.boxHalfY, def.boxHalfXZ));
    const pMajorR = uniform(float(def.majorR));
    const pMinorR = uniform(float(def.minorR));
    const pYSquash = uniform(float(def.ySquash));
    const pLightmapAngle = uniform(float(0));
    const pBaseColor = uniform(vec3(def.baseColor.r, def.baseColor.g, def.baseColor.b));
    const pDensityScale = uniform(float(def.densityScale));
    const pNoiseScale = uniform(float(def.noiseScale));
    const pNoiseStrength = uniform(float(def.noiseStrength));
    const pWarpScale = uniform(float(def.warpScale));
    const pSeed = uniform(float(def.seed));
    const pMinSteps = uniform(float(def.minSteps));
    const pMaxSteps = uniform(float(def.maxSteps));

    const pLocalCam = uniform(new THREE.Vector3(0, 0, 0));

    const mat = new MeshBasicNodeMaterial();
    mat.positionNode = dustTorusVert(pLocalCam);
    mat.fragmentNode = dustTorusFrag(
      pBoxScale, pMajorR, pMinorR, pYSquash, pLightmapAngle,
      pBaseColor, pDensityScale, pNoiseScale, pNoiseStrength,
      pWarpScale, pSeed, pMinSteps, pMaxSteps
    );
    mat.side = THREE.BackSide;
    mat.transparent = true;
    mat.depthWrite = false;
    mat.depthTest = true;
    mat.blending = THREE.AdditiveBlending;

    const mesh = new THREE.Mesh(geo, mat);
    mesh.scale.set(def.boxHalfXZ * 2, def.boxHalfY * 2, def.boxHalfXZ * 2);
    mesh.renderOrder = def.renderOrder;
    mesh.frustumCulled = false;
    scene.add(mesh);

    tori.push({ mesh, def, pLightmapAngle, pLocalCam });
  }

  function update(elapsed, rotationTime, camera, cinemaMode) {
    const galaxyAngle = -rotationTime * BASE_SPEED;

    uTime.value = elapsed;
    uCameraDist.value = cinemaMode ? 0 : camera.position.length();

    for (const { mesh, def, pLightmapAngle, pLocalCam } of tori) {
      const torusAngle = -rotationTime * BASE_SPEED * def.speedFraction;
      mesh.rotation.y = torusAngle;
      pLightmapAngle.value = (torusAngle - galaxyAngle) * def.lightmapLag;
      /* Each torus has its own rotation; can't share one local-cam. */
      mesh.updateMatrixWorld();
      _tmpCamLocal.copy(camera.position);
      mesh.worldToLocal(_tmpCamLocal);
      pLocalCam.value.copy(_tmpCamLocal);
    }
  }

  return { update };
}
