import * as THREE from 'three';
import { MeshBasicNodeMaterial } from 'three/webgpu';
import { main as noiseBakeFrag } from './tsl/frag/noise-bake.tsl.js';

/* One-time render: full-screen quad with 3D periodic Perlin noise -> 128x128 texture.
   RepeatWrapping for seamless scrolling in the accretion disk shader. */

export async function bakeNoiseTexture(renderer) {
  const bakeScene = new THREE.Scene();
  const bakeCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
  bakeCam.position.z = 1;

  const mat = new MeshBasicNodeMaterial();
  mat.fragmentNode = noiseBakeFrag();
  mat.depthWrite = false;
  mat.depthTest = false;

  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
  quad.frustumCulled = false;
  bakeScene.add(quad);

  const rt = new THREE.RenderTarget(128, 128, {
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
