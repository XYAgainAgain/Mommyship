import * as THREE from 'three';
import { loadShaderPair } from './shaders.js';
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
 * @param {THREE.WebGLRenderer} renderer
 * @param {Object} bodies - galaxyData.bodies keyed by ID
 * @returns {{ atlas: THREE.DataArrayTexture, layerMap: Map<string,number> }}
 */
export async function bakeStarAtlas(renderer, bodies) {
  const starIds = Object.keys(bodies).filter(id => bodies[id].type === 'star');
  if (starIds.length === 0) return { atlas: null, layerMap: new Map() };

  const { vert, frag } = await loadShaderPair('star-bake');

  const bakeMat = new THREE.ShaderMaterial({
    vertexShader: vert,
    fragmentShader: frag,
    glslVersion: THREE.GLSL3,
    uniforms: {
      uSeed:      { value: 0 },
      uLowTemp:   { value: 5200 },
      uHighTemp:  { value: 6000 },
      uGranScale: { value: 4.0 },
      uSpotAmp:   { value: 0.7 },
      uSlopeness: { value: 1.0 },
      uEmissive:  { value: 0.8 },
      uSize:      { value: 1.0 },
    },
    depthTest: false,
    depthWrite: false,
  });

  const copyMat = new THREE.ShaderMaterial({
    vertexShader: `out vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
    fragmentShader: `uniform sampler2D uSrc; in vec2 vUv; out vec4 fragColor; void main() { fragColor = texture(uSrc, vUv); }`,
    glslVersion: THREE.GLSL3,
    uniforms: { uSrc: { value: null } },
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
  const arrayRT = new THREE.WebGLArrayRenderTarget(ATLAS_SIZE, ATLAS_SIZE, starIds.length, rtOptions);

  /* Single-layer RT for reliable readPixels — avoids array texture layer issues */
  const tempRT = new THREE.WebGLRenderTarget(ATLAS_SIZE, ATLAS_SIZE, rtOptions);

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
      copyMat.uniforms.uSrc.value = tex;
      quad.material = copyMat;
      renderer.setRenderTarget(arrayRT, i);
      renderer.clear();
      renderer.render(bakeScene, bakeCam);
      tex.dispose();
      quad.material = bakeMat;
      cacheHits++;
    } else {
      bakeMat.uniforms.uSeed.value = seed;
      bakeMat.uniforms.uLowTemp.value = params.lowTemp;
      bakeMat.uniforms.uHighTemp.value = params.highTemp;
      bakeMat.uniforms.uGranScale.value = params.granScale;
      bakeMat.uniforms.uSpotAmp.value = params.spotAmp;
      bakeMat.uniforms.uSlopeness.value = params.slopeness;
      bakeMat.uniforms.uEmissive.value = params.emissive;
      bakeMat.uniforms.uSize.value = params.radius;

      renderer.setRenderTarget(tempRT);
      renderer.clear();
      renderer.render(bakeScene, bakeCam);

      renderer.readRenderTargetPixels(tempRT, 0, 0, ATLAS_SIZE, ATLAS_SIZE, readBuf);
      putEntry(STORES.STAR, key, new Uint16Array(readBuf));

      copyMat.uniforms.uSrc.value = tempRT.texture;
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
