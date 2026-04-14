import * as THREE from 'three';
import { MeshBasicNodeMaterial } from 'three/webgpu';
import { texture } from 'three/tsl';
import { main as bakeVert } from './tsl/vert/star-bake.tsl.js';
import {
  main as bakeFrag, uSeed, uLowTemp, uHighTemp,
  uGranScale, uSpotAmp, uSize, uSlopeness, uEmissive,
} from './tsl/frag/star-bake.tsl.js';
import { parseMK } from './star-params.js';
import { STORES, starCacheKey, getEntry, putEntry } from './galaxy-cache.js';

const ATLAS_SIZE = 128;
const PIXELS = ATLAS_SIZE * ATLAS_SIZE * 4;

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return h;
}

/**
 * Bake procedural star surfaces into a DataArrayTexture atlas.
 * Checks IndexedDB cache per star — skips GPU bake on hit.
 * @param {THREE.WebGPURenderer} renderer
 * @param {Object} bodies - galaxyData.bodies keyed by ID
 * @returns {{ atlas: THREE.DataArrayTexture, layerMap: Map<string,number> }}
 */
export async function bakeStarAtlas(renderer, bodies) {
  const starIds = Object.keys(bodies).filter(id => bodies[id].type === 'star');
  if (starIds.length === 0) return { atlas: null, layerMap: new Map() };

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
  const arrayRT = new THREE.WebGLArrayRenderTarget(ATLAS_SIZE, ATLAS_SIZE, starIds.length, rtOptions);

  /* Single-layer RT for reliable readPixels — avoids array texture layer issues */
  const tempRT = new THREE.RenderTarget(ATLAS_SIZE, ATLAS_SIZE, rtOptions);

  const layerMap = new Map();
  const prevRT = renderer.getRenderTarget();
  const readBuf = new Uint16Array(PIXELS);
  let cacheHits = 0;

  for (let i = 0; i < starIds.length; i++) {
    const id = starIds[i];
    const body = bodies[id];
    const params = parseMK(body.spectralClass, body.visual?.size);
    const seed = hashString(id);

    layerMap.set(id, i);

    const key = starCacheKey(id, params);
    const cached = await getEntry(STORES.STAR, key);

    if (cached) {
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
      uSeed.value = seed;
      uLowTemp.value = params.lowTemp;
      uHighTemp.value = params.highTemp;
      uGranScale.value = params.granScale;
      uSpotAmp.value = params.spotAmp;
      uSlopeness.value = params.slopeness;
      uEmissive.value = params.emissive;
      uSize.value = params.radius;

      renderer.setRenderTarget(tempRT);
      renderer.clear();
      try { renderer.render(bakeScene, bakeCam); }
      catch (e) { if (i === 0) console.error('Star bake render failed:', e.message); }

      try {
        await renderer.readRenderTargetPixelsAsync(tempRT, 0, 0, ATLAS_SIZE, ATLAS_SIZE, readBuf);
        putEntry(STORES.STAR, key, new Uint16Array(readBuf));
      } catch (_) { /* WebGPU readback not yet supported — skip cache, atlas still works */ }

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

  if (cacheHits > 0) console.log(`Star atlas: ${cacheHits}/${starIds.length} from cache`);

  return { atlas: arrayRT.texture, layerMap };
}
