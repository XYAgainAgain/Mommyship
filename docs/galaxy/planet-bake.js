import * as THREE from 'three';
import { loadShader, loadShaderPair } from './shaders.js';
import { parsePlanetType, findParentStar } from './planet-params.js';

const ATLAS_SIZE = 128;

/**
 * Bake procedural planet/moon surfaces into a DataArrayTexture atlas.
 * Mirrors star-bake.js — same yield pattern, same RT format.
 * @param {THREE.WebGLRenderer} renderer
 * @param {Object} bodies — galaxyData.bodies keyed by ID
 * @returns {{ atlas: THREE.DataArrayTexture, layerMap: Map<string,number> }}
 */
export async function bakePlanetAtlas(renderer, bodies) {
  const planetIds = Object.keys(bodies).filter(id => {
    const t = bodies[id].type;
    return t === 'planet' || t === 'moon';
  });
  if (planetIds.length === 0) return { atlas: null, layerMap: new Map() };

  /* Load shaders + inject noise preamble */
  const [{ vert, frag }, noiseSrc] = await Promise.all([
    loadShaderPair('planet-bake'),
    loadShader('galaxy/shaders/noise-common.glsl'),
  ]);
  const fullFrag = frag.replace('/* @include noise-common */', noiseSrc);

  const bakeMat = new THREE.ShaderMaterial({
    vertexShader: vert,
    fragmentShader: fullFrag,
    glslVersion: THREE.GLSL3,
    uniforms: {
      uSeed:              { value: 0 },
      uPlanetMode:        { value: 0 },
      uOutputMode:        { value: 0 },
      uSlopeness:         { value: 1.0 },
      uOceanLevel:        { value: 0.3 },
      uTemperature:       { value: 0.5 },
      uCraterDensity:     { value: 0.0 },
      uSpecular:          { value: 0.0 },
      uBaseColor1:        { value: new THREE.Color() },
      uBaseColor2:        { value: new THREE.Color() },
      uBaseColor3:        { value: new THREE.Color() },
      uAtmoIntensity:     { value: 0.2 },
      uAtmoTint:          { value: new THREE.Color() },
      uBandCount:         { value: 8.0 },
      uWarpStrength:      { value: 0.0 },
      uStormSize:         { value: 0.0 },
      uCrackScale:        { value: 5.0 },
      uSubsurfaceColor:   { value: new THREE.Color() },
      uEmissiveIntensity: { value: 0.0 },
      uEmissiveColor:     { value: new THREE.Color() },
      uBulbosity:         { value: 0.0 },
    },
    depthTest: false,
    depthWrite: false,
  });

  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bakeMat);
  const bakeScene = new THREE.Scene();
  bakeScene.add(quad);
  const bakeCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const rtOptions = {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    type: THREE.HalfFloatType,
    generateMipmaps: false,
  };
  const arrayRT = new THREE.WebGLArrayRenderTarget(ATLAS_SIZE, ATLAS_SIZE, planetIds.length, rtOptions);
  /* RepeatWrapping on X for seamless longitude churn; clamp Y (poles don't wrap) */
  arrayRT.texture.wrapS = THREE.RepeatWrapping;

  const derivRT = new THREE.WebGLArrayRenderTarget(ATLAS_SIZE, ATLAS_SIZE, planetIds.length, rtOptions);
  derivRT.texture.wrapS = THREE.RepeatWrapping;

  const layerMap = new Map();
  const churnMap = new Map();
  const prevRT = renderer.getRenderTarget();

  /* Build parent-star lookup once — avoids walking the chain per body */
  const parentStarCache = new Map();
  for (const id of planetIds) {
    parentStarCache.set(id, findParentStar(id, bodies));
  }

  for (let i = 0; i < planetIds.length; i++) {
    const id = planetIds[i];
    const body = bodies[id];
    const parentStar = parentStarCache.get(id);
    const params = parsePlanetType(body, id, parentStar, bodies);

    const u = bakeMat.uniforms;
    u.uSeed.value              = params.seed;
    u.uPlanetMode.value        = params.mode;
    u.uSlopeness.value         = params.slopeness;
    u.uOceanLevel.value        = params.oceanLevel;
    u.uTemperature.value       = params.temperature;
    u.uCraterDensity.value     = params.craterDensity;
    u.uSpecular.value          = params.specular;
    u.uBaseColor1.value.set(params.baseColor1);
    u.uBaseColor2.value.set(params.baseColor2);
    u.uBaseColor3.value.set(params.baseColor3);
    u.uAtmoIntensity.value     = params.atmosphereIntensity;
    u.uAtmoTint.value.set(params.atmosphereTint);
    u.uBandCount.value         = params.bandCount;
    u.uWarpStrength.value      = params.warpStrength;
    u.uStormSize.value         = params.stormSize;
    u.uCrackScale.value        = params.crackScale;
    u.uSubsurfaceColor.value.set(params.subsurfaceColor);
    u.uEmissiveIntensity.value = params.emissiveIntensity;
    u.uEmissiveColor.value.set(params.emissiveColor);
    u.uBulbosity.value         = params.bulbosity;

    renderer.setRenderTarget(arrayRT, i);
    renderer.clear();
    renderer.render(bakeScene, bakeCam);

    layerMap.set(id, i);
    churnMap.set(id, params.churn || 0);

    if (i % 8 === 7) await new Promise(r => setTimeout(r, 0));
  }

  /* Second pass — derivative atlas for bump-mapped normals.
     Same uniforms, same render functions, just switches output channel. */
  bakeMat.uniforms.uOutputMode.value = 1;
  for (let i = 0; i < planetIds.length; i++) {
    const id = planetIds[i];
    const body = bodies[id];
    const parentStar = parentStarCache.get(id);
    const params = parsePlanetType(body, id, parentStar, bodies);

    const u = bakeMat.uniforms;
    u.uSeed.value              = params.seed;
    u.uPlanetMode.value        = params.mode;
    u.uSlopeness.value         = params.slopeness;
    u.uOceanLevel.value        = params.oceanLevel;
    u.uTemperature.value       = params.temperature;
    u.uCraterDensity.value     = params.craterDensity;
    u.uBaseColor1.value.set(params.baseColor1);
    u.uBaseColor2.value.set(params.baseColor2);
    u.uBaseColor3.value.set(params.baseColor3);
    u.uBandCount.value         = params.bandCount;
    u.uWarpStrength.value      = params.warpStrength;
    u.uStormSize.value         = params.stormSize;
    u.uCrackScale.value        = params.crackScale;
    u.uBulbosity.value         = params.bulbosity;

    renderer.setRenderTarget(derivRT, i);
    renderer.clear();
    renderer.render(bakeScene, bakeCam);

    if (i % 8 === 7) await new Promise(r => setTimeout(r, 0));
  }

  renderer.setRenderTarget(prevRT);
  quad.geometry.dispose();
  bakeMat.dispose();

  return { atlas: arrayRT.texture, derivAtlas: derivRT.texture, layerMap, churnMap };
}
