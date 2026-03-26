import * as THREE from 'three';
import { loadShaderPair } from './shaders.js';
import { bakeVolumeTexture } from './volume-bake.js';

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

export async function createDustTorus(scene, renderer) {
  if (!renderer.capabilities.isWebGL2) {
    console.warn('Dust torus requires WebGL2');
    return { update() {} };
  }

  const [{ vert, frag }, volumeTex] = await Promise.all([
    loadShaderPair('dust-torus'),
    bakeVolumeTexture({ seed: 55555, frequency: 5.0, octaves: 5 }),
  ]);

  const loader = new THREE.TextureLoader();
  const lightmap = await loader.loadAsync('galaxy/textures/galaxy-lightmap.webp');
  lightmap.flipY = false;
  lightmap.wrapS = THREE.ClampToEdgeWrapping;
  lightmap.wrapT = THREE.ClampToEdgeWrapping;

  const tori = [];

  for (const def of TORUS_DEFS) {
    const geo = new THREE.BoxGeometry(1, 1, 1);

    const mat = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      glslVersion: THREE.GLSL3,
      uniforms: {
        uVolume:        { value: volumeTex },
        uLightmap:      { value: lightmap },
        uTime:          { value: 0 },
        uCameraDist:    { value: 1000 },
        uOpacity:       { value: 1.0 },
        uCameraPos:     { value: new THREE.Vector3() },
        uBoxScale:      { value: new THREE.Vector3(def.boxHalfXZ, def.boxHalfY, def.boxHalfXZ) },
        uMajorR:        { value: def.majorR },
        uMinorR:        { value: def.minorR },
        uYSquash:       { value: def.ySquash },
        uLightmapAngle: { value: 0 },
        uBaseColor:     { value: def.baseColor },
        uDensityScale:  { value: def.densityScale },
        uNoiseScale:    { value: def.noiseScale },
        uNoiseStrength: { value: def.noiseStrength },
        uWarpScale:     { value: def.warpScale },
        uSeed:          { value: def.seed },
        uMinSteps:      { value: def.minSteps },
        uMaxSteps:      { value: def.maxSteps },
      },
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      blending: THREE.AdditiveBlending,
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.scale.set(def.boxHalfXZ * 2, def.boxHalfY * 2, def.boxHalfXZ * 2);
    mesh.renderOrder = def.renderOrder;
    mesh.frustumCulled = false;
    scene.add(mesh);

    tori.push({ mesh, def });
  }

  function update(elapsed, rotationTime, camera, cinemaMode) {
    const galaxyAngle = -rotationTime * BASE_SPEED;

    for (const { mesh, def } of tori) {
      const torusAngle = -rotationTime * BASE_SPEED * def.speedFraction;
      mesh.rotation.y = torusAngle;

      const u = mesh.material.uniforms;
      u.uTime.value = elapsed;
      u.uCameraPos.value.copy(camera.position);
      u.uCameraDist.value = cinemaMode ? 0 : camera.position.length();
      u.uLightmapAngle.value = (torusAngle - galaxyAngle) * def.lightmapLag;
    }
  }

  return { update };
}
