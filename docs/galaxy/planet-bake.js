import * as THREE from 'three';
import { MeshBasicNodeMaterial } from 'three/webgpu';
import { texture } from 'three/tsl';
import { main as bakeVert } from './tsl/vert/planet-bake.tsl.js';
import {
  main as bakeFrag, uSeed, uPlanetMode, uSlopeness, uOceanLevel,
  uTemperature, uCraterDensity, uSpecular, uBaseColor1, uBaseColor2,
  uBaseColor3, uAtmoIntensity, uAtmoTint, uBandCount, uWarpStrength,
  uStormSize, uCrackScale, uSubsurfaceColor, uEmissiveIntensity,
  uEmissiveColor, uBulbosity, uCrystalMetric, uMoistureOffset, uBiomeCount,
  uTerrainType, uCrackPattern,
} from './tsl/frag/planet-bake.tsl.js';
import { parsePlanetType, findParentStar } from './planet-params.js';

const ATLAS_SIZE = 256;
/* RGBA texels per body in the live-atlas param texture (layout in buildParamTexture) */
export const PARAM_TEXELS = 8;

const _color = new THREE.Color();

/* Per-body params → 8×N float texture for the live atlas shader — per-instance data
   can't ride vertex attributes (planetMarkers binds 7 of WebGPU's 8 buffer cap) */
export function buildParamTexture(planetIds, paramsCache) {
  const rows = planetIds.length;
  const data = new Float32Array(PARAM_TEXELS * 4 * rows);
  const c = _color;
  for (let i = 0; i < rows; i++) {
    const p = paramsCache.get(planetIds[i]);
    if (!p) continue;
    const o = i * PARAM_TEXELS * 4;
    data[o]      = p.seed;
    data[o + 1]  = p.mode;
    data[o + 2]  = p.slopeness;
    data[o + 3]  = p.oceanLevel;
    data[o + 4]  = p.temperature;
    data[o + 5]  = p.craterDensity;
    data[o + 6]  = p.moistureOffset ?? 0.0;
    data[o + 7]  = p.biomeCount ?? 0.5;
    c.set(p.baseColor1);       data[o + 8]  = c.r; data[o + 9]  = c.g; data[o + 10] = c.b;
    data[o + 11] = p.warpStrength;
    c.set(p.baseColor2);       data[o + 12] = c.r; data[o + 13] = c.g; data[o + 14] = c.b;
    data[o + 15] = p.stormSize;
    c.set(p.baseColor3);       data[o + 16] = c.r; data[o + 17] = c.g; data[o + 18] = c.b;
    data[o + 19] = p.bandCount;
    c.set(p.subsurfaceColor);  data[o + 20] = c.r; data[o + 21] = c.g; data[o + 22] = c.b;
    data[o + 23] = p.crackScale;
    c.set(p.emissiveColor);    data[o + 24] = c.r; data[o + 25] = c.g; data[o + 26] = c.b;
    data[o + 27] = p.emissiveIntensity;
    data[o + 28] = p.bulbosity;
    data[o + 29] = p.crystalMetric ?? 0;
    data[o + 30] = p.terrainType ?? 1;
    data[o + 31] = p.crackPattern ?? 0;
  }
  const tex = new THREE.DataTexture(data, PARAM_TEXELS, rows, THREE.RGBAFormat, THREE.FloatType);
  /* float32 is unfilterable-float on WebGPU — Nearest keeps the sampler non-filtering */
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Bake procedural planet/moon surfaces into a DataArrayTexture atlas.
 * Checks IndexedDB cache per body — skips GPU bake on hit.
 * @param {THREE.WebGPURenderer} renderer
 * @param {Object} bodies — galaxyData.bodies keyed by ID
 * @returns {{ atlas, layerMap, churnMap, paramsCache }}
 */
export async function bakePlanetAtlas(renderer, bodies) {
  const planetIds = Object.keys(bodies).filter(id => {
    const t = bodies[id].type;
    return t === 'planet' || t === 'moon';
  });
  if (planetIds.length === 0) return { atlas: null, layerMap: new Map() };

  const bakeMat = new MeshBasicNodeMaterial();
  bakeMat.positionNode = bakeVert();
  bakeMat.fragmentNode = bakeFrag();
  bakeMat.depthTest = false;
  bakeMat.depthWrite = false;

  /* Passthrough copy material — texture(null) auto-samples at geometry UV */
  const uCopySrc = texture(null);
  const copyMat = new MeshBasicNodeMaterial();
  copyMat.fragmentNode = uCopySrc;
  copyMat.depthTest = false;
  copyMat.depthWrite = false;

  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bakeMat);
  const bakeScene = new THREE.Scene();
  bakeScene.add(quad);
  const bakeCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const rtOptions = {
    minFilter: THREE.LinearMipmapLinearFilter,
    magFilter: THREE.LinearFilter,
    type: THREE.HalfFloatType,
    generateMipmaps: true,
  };
  const arrayRT = new THREE.WebGLArrayRenderTarget(ATLAS_SIZE, ATLAS_SIZE, planetIds.length, rtOptions);
  arrayRT.texture.wrapS = THREE.RepeatWrapping;

  /* Single-layer RT for reliable readPixels — reading from ArrayRenderTarget
     layers directly is unreliable (layer attachment may not persist through readback) */
  const tempRT = new THREE.RenderTarget(ATLAS_SIZE, ATLAS_SIZE, rtOptions);

  const layerMap = new Map();
  const churnMap = new Map();
  const paramsCache = new Map();
  const prevRT = renderer.getRenderTarget();

  const parentStarCache = new Map();
  for (const id of planetIds) {
    parentStarCache.set(id, findParentStar(id, bodies));
  }

  /* finally, not catch: a throw mid-bake must still unbind the RT and free tempRT */
  try {
    for (let i = 0; i < planetIds.length; i++) {
      const id = planetIds[i];
      const body = bodies[id];
      const parentStar = parentStarCache.get(id);
      const params = parsePlanetType(body, id, parentStar, bodies);

      layerMap.set(id, i);
      churnMap.set(id, params.churn || 0);
      paramsCache.set(id, params);

      uSeed.value              = params.seed;
      uPlanetMode.value        = params.mode;
      uSlopeness.value         = params.slopeness;
      uOceanLevel.value        = params.oceanLevel;
      uTemperature.value       = params.temperature;
      uCraterDensity.value     = params.craterDensity;
      uSpecular.value          = params.specular;
      _color.set(params.baseColor1);
      uBaseColor1.value.set(_color.r, _color.g, _color.b);
      _color.set(params.baseColor2);
      uBaseColor2.value.set(_color.r, _color.g, _color.b);
      _color.set(params.baseColor3);
      uBaseColor3.value.set(_color.r, _color.g, _color.b);
      uAtmoIntensity.value     = params.atmosphereIntensity;
      _color.set(params.atmosphereTint);
      uAtmoTint.value.set(_color.r, _color.g, _color.b);
      uBandCount.value         = params.bandCount;
      uWarpStrength.value      = params.warpStrength;
      uStormSize.value         = params.stormSize;
      uCrackScale.value        = params.crackScale;
      _color.set(params.subsurfaceColor);
      uSubsurfaceColor.value.set(_color.r, _color.g, _color.b);
      uEmissiveIntensity.value = params.emissiveIntensity;
      _color.set(params.emissiveColor);
      uEmissiveColor.value.set(_color.r, _color.g, _color.b);
      uBulbosity.value         = params.bulbosity;
      uCrystalMetric.value     = params.crystalMetric ?? 0;
      uMoistureOffset.value    = params.moistureOffset ?? 0.0;
      uBiomeCount.value        = params.biomeCount ?? 0.5;
      uTerrainType.value       = params.terrainType ?? 1;
      uCrackPattern.value      = params.crackPattern ?? 0;

      renderer.setRenderTarget(tempRT);
      renderer.clear();
      renderer.render(bakeScene, bakeCam);

      /* Copy baked result into the atlas array layer */
      uCopySrc.value = tempRT.texture;
      quad.material = copyMat;
      renderer.setRenderTarget(arrayRT, i);
      renderer.clear();
      renderer.render(bakeScene, bakeCam);
      quad.material = bakeMat;

      if (i % 8 === 7) await new Promise(r => setTimeout(r, 0));
    }
  } finally {
    renderer.setRenderTarget(prevRT);
    quad.geometry.dispose();
    bakeMat.dispose();
    copyMat.dispose();
    tempRT.dispose();
  }

  /* WebGPU never auto-generates array RT mips — without this, mips 1+ stay
     zero and distant planets alias into checkerboard shimmer */
  try { renderer.backend.generateMipmaps(arrayRT.texture); }
  catch (e) { console.warn('Planet atlas mip generation failed:', e); }

  return { atlas: arrayRT.texture, layerMap, churnMap, paramsCache };
}
