import * as THREE from 'three';
import { loadShaderPair, loadShader } from './shaders.js';

/* Multi-pass composition pipeline for black hole lensing.
   When active: scene → spaceRT, distortion planes → distortionRT,
   full-screen quad composites with UV displacement + chromatic aberration.
   When LOD = 0 (camera far away), none of this runs. */

/* 60 matches masshole's 2:1 distortion-to-disk ratio (disk outer = 30) */
const DISTORTION_SCALE = 60;

export async function createCompositor(renderer) {
  const [composeShaders, distortionVert, activeFrag, maskFrag] = await Promise.all([
    loadShaderPair('compose'),
    loadShader('galaxy/shaders/distortion-common.vert'),
    loadShader('galaxy/shaders/distortion-active.frag'),
    loadShader('galaxy/shaders/distortion-mask.frag')
  ]);

  const orthoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
  orthoCamera.position.z = 1;
  const composeScene = new THREE.Scene();
  const distortionScene = new THREE.Scene();

  /* Active distortion plane — faces camera each frame, radial gradient */
  const activeMat = new THREE.ShaderMaterial({
    vertexShader: distortionVert,
    fragmentShader: activeFrag,
    side: THREE.DoubleSide,
    transparent: true
  });
  const activePlane = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1), activeMat
  );
  activePlane.scale.set(DISTORTION_SCALE, DISTORTION_SCALE, DISTORTION_SCALE);
  distortionScene.add(activePlane);

  /* Mask plane — lies flat in XZ, shapes distortion into a disc */
  const maskMat = new THREE.ShaderMaterial({
    vertexShader: distortionVert,
    fragmentShader: maskFrag,
    side: THREE.DoubleSide,
    transparent: true
  });
  const maskPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1), maskMat
  );
  maskPlane.scale.set(DISTORTION_SCALE, DISTORTION_SCALE, DISTORTION_SCALE);
  maskPlane.rotation.x = Math.PI * 0.5;
  distortionScene.add(maskPlane);

  /* Render targets — created lazily on first LOD > 0 */
  let spaceRT = null;
  let distortionRT = null;
  let rtsReady = false;

  const composeMat = new THREE.ShaderMaterial({
    vertexShader: composeShaders.vert,
    fragmentShader: composeShaders.frag,
    uniforms: {
      uSpaceTexture:       { value: null },
      uDistortionTexture:  { value: null },
      uBlackHolePosition:  { value: new THREE.Vector2(0.5, 0.5) },
      uDistortionStrength: { value: 0.0 },
      uRGBShiftRadius:     { value: 0.00001 }
    },
    depthWrite: false,
    depthTest: false
  });

  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), composeMat);
  quad.frustumCulled = false;
  composeScene.add(quad);

  function ensureRTs() {
    if (rtsReady) return;
    const w = renderer.domElement.width;
    const h = renderer.domElement.height;

    spaceRT = new THREE.WebGLRenderTarget(w, h, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter
    });
    distortionRT = new THREE.WebGLRenderTarget(
      Math.floor(w * 0.5), Math.floor(h * 0.5), {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter
      }
    );

    composeMat.uniforms.uSpaceTexture.value = spaceRT.texture;
    composeMat.uniforms.uDistortionTexture.value = distortionRT.texture;
    rtsReady = true;
  }

  function resize() {
    if (!rtsReady) return;
    const w = renderer.domElement.width;
    const h = renderer.domElement.height;
    spaceRT.setSize(w, h);
    distortionRT.setSize(Math.floor(w * 0.5), Math.floor(h * 0.5));
  }

  function render(scene, camera, bhScreenPos, lodFactor) {
    ensureRTs();

    composeMat.uniforms.uBlackHolePosition.value.copy(bhScreenPos);
    composeMat.uniforms.uDistortionStrength.value = lodFactor;

    /* Active plane tracks camera so lensing works from any angle */
    activePlane.lookAt(camera.position);

    /* Pass 1: entire galaxy scene → spaceRT */
    renderer.setRenderTarget(spaceRT);
    renderer.clear();
    renderer.render(scene, camera);

    /* Pass 2: distortion planes → distortionRT */
    renderer.setRenderTarget(distortionRT);
    renderer.clear();
    renderer.render(distortionScene, camera);

    /* Pass 3: composition quad → screen */
    renderer.setRenderTarget(null);
    renderer.clear();
    renderer.render(composeScene, orthoCamera);
  }

  return { render, resize, distortionScene, composeMat };
}
