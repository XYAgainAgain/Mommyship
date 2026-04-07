import * as THREE from 'three';
import { loadShaderPair } from './shaders.js';
import { parseMK } from './star-params.js';
const ATLAS_SIZE = 128;

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return h;
}

/**
 * Bake procedural star surfaces into a DataArrayTexture atlas.
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

  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bakeMat);
  const bakeScene = new THREE.Scene();
  bakeScene.add(quad);
  const bakeCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  /* HalfFloatType preserves HDR overbright values from emissive boost */
  const arrayRT = new THREE.WebGLArrayRenderTarget(ATLAS_SIZE, ATLAS_SIZE, starIds.length, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    type: THREE.HalfFloatType,
    generateMipmaps: false,
  });

  const layerMap = new Map();
  const prevRT = renderer.getRenderTarget();

  for (let i = 0; i < starIds.length; i++) {
    const id = starIds[i];
    const body = bodies[id];
    const params = parseMK(body.spectralClass, body.visual?.size);
    const seed = hashString(id);

    bakeMat.uniforms.uSeed.value = seed;
    bakeMat.uniforms.uLowTemp.value = params.lowTemp;
    bakeMat.uniforms.uHighTemp.value = params.highTemp;
    bakeMat.uniforms.uGranScale.value = params.granScale;
    bakeMat.uniforms.uSpotAmp.value = params.spotAmp;
    bakeMat.uniforms.uSlopeness.value = params.slopeness;
    bakeMat.uniforms.uEmissive.value = params.emissive;
    bakeMat.uniforms.uSize.value = params.radius;

    renderer.setRenderTarget(arrayRT, i);
    renderer.clear();
    renderer.render(bakeScene, bakeCam);

    layerMap.set(id, i);

    /* Yield every 8 stars to keep loading screen responsive */
    if (i % 8 === 7) await new Promise(r => setTimeout(r, 0));
  }

  renderer.setRenderTarget(prevRT);

  quad.geometry.dispose();
  bakeMat.dispose();

  return { atlas: arrayRT.texture, layerMap };
}
