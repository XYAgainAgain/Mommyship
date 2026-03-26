import * as THREE from 'three';
import { loadShaderPair } from './shaders.js';

/* One-time render: full-screen quad with 3D periodic Perlin noise -> 128x128 texture.
   RepeatWrapping for seamless scrolling in the accretion disk shader. */

export async function bakeNoiseTexture(renderer) {
  const { vert, frag } = await loadShaderPair('noise-bake');

  const bakeScene = new THREE.Scene();
  const bakeCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);

  const mat = new THREE.ShaderMaterial({
    vertexShader: vert,
    fragmentShader: frag,
    depthWrite: false,
    depthTest: false
  });

  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
  quad.frustumCulled = false;
  bakeScene.add(quad);

  const rt = new THREE.WebGLRenderTarget(128, 128, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    wrapS: THREE.RepeatWrapping,
    wrapT: THREE.RepeatWrapping,
    generateMipmaps: false
  });

  renderer.setRenderTarget(rt);
  renderer.render(bakeScene, bakeCam);
  renderer.setRenderTarget(null);

  /* Ensure wrapping is set on the texture itself (RT constructor may not propagate) */
  rt.texture.wrapS = THREE.RepeatWrapping;
  rt.texture.wrapT = THREE.RepeatWrapping;

  mat.dispose();
  quad.geometry.dispose();

  return rt.texture;
}
