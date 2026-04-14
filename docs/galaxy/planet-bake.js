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
} from './tsl/frag/planet-bake.tsl.js';
import { parsePlanetType, findParentStar } from './planet-params.js';
import { STORES, planetCacheKey, getEntry, putEntry } from './galaxy-cache.js';

const ATLAS_SIZE = 128;
const PIXELS = ATLAS_SIZE * ATLAS_SIZE * 4;

const _color = new THREE.Color();

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
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    type: THREE.HalfFloatType,
    generateMipmaps: false,
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
  const readBuf = new Uint16Array(PIXELS);

  const parentStarCache = new Map();
  for (const id of planetIds) {
    parentStarCache.set(id, findParentStar(id, bodies));
  }

  let cacheHits = 0;

  for (let i = 0; i < planetIds.length; i++) {
    const id = planetIds[i];
    const body = bodies[id];
    const parentStar = parentStarCache.get(id);
    const params = parsePlanetType(body, id, parentStar, bodies);

    layerMap.set(id, i);
    churnMap.set(id, params.churn || 0);
    paramsCache.set(id, params);

    const key = planetCacheKey(id, params);
    const cached = await getEntry(STORES.PLANET, key);

    if (cached) {
      /* Cache hit — write stored pixels into this atlas layer via copy quad */
      const tex = new THREE.DataTexture(cached, ATLAS_SIZE, ATLAS_SIZE, THREE.RGBAFormat, THREE.HalfFloatType);
      tex.needsUpdate = true;
      uCopySrc.value = tex;
      quad.material = copyMat;
      renderer.setRenderTarget(arrayRT, i);
      renderer.clear();
      renderer.render(bakeScene, bakeCam);
      tex.dispose();
      quad.material = bakeMat;
      cacheHits++;
    } else {
      /* Cache miss — bake to tempRT for reliable readback, then copy into atlas */
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

      renderer.setRenderTarget(tempRT);
      renderer.clear();
      renderer.render(bakeScene, bakeCam);

      try {
        await renderer.readRenderTargetPixelsAsync(tempRT, 0, 0, ATLAS_SIZE, ATLAS_SIZE, readBuf);
        putEntry(STORES.PLANET, key, new Uint16Array(readBuf));
      } catch (_) { /* WebGPU readback not yet supported — skip cache, atlas still works */ }

      /* Copy baked result into the atlas array layer */
      uCopySrc.value = tempRT.texture;
      quad.material = copyMat;
      renderer.setRenderTarget(arrayRT, i);
      renderer.clear();
      renderer.render(bakeScene, bakeCam);
      quad.material = bakeMat;
    }

    if (i % 8 === 7) await new Promise(r => setTimeout(r, 0));
  }

  renderer.setRenderTarget(prevRT);
  quad.geometry.dispose();
  bakeMat.dispose();
  copyMat.dispose();
  tempRT.dispose();

  if (cacheHits > 0) console.log(`Planet atlas: ${cacheHits}/${planetIds.length} from cache`);

  return { atlas: arrayRT.texture, layerMap, churnMap, paramsCache };
}
