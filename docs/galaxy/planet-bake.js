import * as THREE from 'three';
import { loadShader, loadShaderPair } from './shaders.js';
import { parsePlanetType, findParentStar } from './planet-params.js';
import { STORES, planetCacheKey, getEntry, putEntry } from './galaxy-cache.js';

const ATLAS_SIZE = 128;
const PIXELS = ATLAS_SIZE * ATLAS_SIZE * 4;

/**
 * Bake procedural planet/moon surfaces into a DataArrayTexture atlas.
 * Checks IndexedDB cache per body — skips GPU bake on hit.
 * @param {THREE.WebGLRenderer} renderer
 * @param {Object} bodies — galaxyData.bodies keyed by ID
 * @returns {{ atlas, layerMap, churnMap, paramsCache }}
 */
export async function bakePlanetAtlas(renderer, bodies) {
  const planetIds = Object.keys(bodies).filter(id => {
    const t = bodies[id].type;
    return t === 'planet' || t === 'moon';
  });
  if (planetIds.length === 0) return { atlas: null, layerMap: new Map() };

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

  /* Pass-through material for writing cached textures into the atlas */
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
  const arrayRT = new THREE.WebGLArrayRenderTarget(ATLAS_SIZE, ATLAS_SIZE, planetIds.length, rtOptions);
  arrayRT.texture.wrapS = THREE.RepeatWrapping;

  /* Single-layer RT for reliable readPixels — reading from WebGLArrayRenderTarget
     layers directly is unreliable (layer attachment may not persist through readback) */
  const tempRT = new THREE.WebGLRenderTarget(ATLAS_SIZE, ATLAS_SIZE, rtOptions);

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
      copyMat.uniforms.uSrc.value = tex;
      quad.material = copyMat;
      renderer.setRenderTarget(arrayRT, i);
      renderer.clear();
      renderer.render(bakeScene, bakeCam);
      tex.dispose();
      quad.material = bakeMat;
      cacheHits++;
    } else {
      /* Cache miss — bake to tempRT for reliable readback, then copy into atlas */
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

      renderer.setRenderTarget(tempRT);
      renderer.clear();
      renderer.render(bakeScene, bakeCam);

      renderer.readRenderTargetPixels(tempRT, 0, 0, ATLAS_SIZE, ATLAS_SIZE, readBuf);
      putEntry(STORES.PLANET, key, new Uint16Array(readBuf));

      /* Copy baked result into the atlas array layer */
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

  if (cacheHits > 0) console.log(`Planet atlas: ${cacheHits}/${planetIds.length} from cache`);

  return { atlas: arrayRT.texture, layerMap, churnMap, paramsCache };
}
