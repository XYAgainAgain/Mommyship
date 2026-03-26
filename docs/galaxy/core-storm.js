import * as THREE from 'three';
import { loadShaderPair } from './shaders.js';
import { bakeNoiseTexture } from './noise-bake.js';

/* Disk rotation formula at r~100 — representative mid-field speed */
const BASE_SPEED = 0.061;
const DOME_HEIGHT = 12;
const SUBDIVS = 64;

export async function createCoreStorm(scene, renderer) {
  const [{ vert, frag }, noiseTex] = await Promise.all([
    loadShaderPair('core-storm'),
    bakeNoiseTexture(renderer)
  ]);

  const loader = new THREE.TextureLoader();
  const [shroudTex, gravityTex] = await Promise.all([
    loader.loadAsync('galaxy/textures/shroud_storm_color.webp')
      .catch(e => { throw new Error('Core storm: shroud texture failed'); }),
    loader.loadAsync('galaxy/textures/gravity_storm_color.webp')
      .catch(e => { throw new Error('Core storm: gravity texture failed'); })
  ]);

  for (const tex of [shroudTex, gravityTex]) {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
  }

  function createDome(texture, opts) {
    const geo = new THREE.PlaneGeometry(1, 1, SUBDIVS, SUBDIVS);
    geo.rotateX(-Math.PI / 2);

    const mat = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      uniforms: {
        uTexture:       { value: texture },
        uNoise:         { value: noiseTex },
        uTime:          { value: 0 },
        uDomeHeight:    { value: opts.domeHeight },
        uOpacity:       { value: opts.opacity },
        uPulseStrength: { value: opts.pulseStrength },
        uPulseSpeed:    { value: opts.pulseSpeed },
        uWarpMode:      { value: opts.warpMode }
      },
      transparent: true,
      depthWrite: false,
      depthTest: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.scale.set(opts.scale, 1, opts.scale);
    mesh.renderOrder = opts.renderOrder;
    mesh.frustumCulled = false;
    return mesh;
  }

  /* Galactic Uncrustable: two domes per texture, edges meeting at y=0 */
  const shroudTop = createDome(shroudTex, {
    scale: 875, domeHeight: DOME_HEIGHT, opacity: 0.3,
    pulseStrength: 0.1, pulseSpeed: 0.3,
    warpMode: 0, renderOrder: -1
  });
  const shroudBottom = createDome(shroudTex, {
    scale: 875, domeHeight: -DOME_HEIGHT, opacity: 0.3,
    pulseStrength: 0.1, pulseSpeed: 0.3,
    warpMode: 0, renderOrder: -1
  });

  const gravityTop = createDome(gravityTex, {
    scale: 788, domeHeight: DOME_HEIGHT, opacity: 0.4,
    pulseStrength: 0.08, pulseSpeed: 0.23,
    warpMode: 1, renderOrder: -0.5
  });
  const gravityBottom = createDome(gravityTex, {
    scale: 788, domeHeight: -DOME_HEIGHT, opacity: 0.4,
    pulseStrength: 0.08, pulseSpeed: 0.23,
    warpMode: 1, renderOrder: -0.5
  });

  const meshes = [shroudTop, shroudBottom, gravityTop, gravityBottom];
  for (const m of meshes) scene.add(m);

  function update(elapsed, rotationTime) {
    const shroudAngle = -rotationTime * BASE_SPEED * 0.9;
    const gravityAngle = -rotationTime * BASE_SPEED * 1.1;

    shroudTop.rotation.y = shroudAngle;
    shroudBottom.rotation.y = shroudAngle;
    gravityTop.rotation.y = gravityAngle;
    gravityBottom.rotation.y = gravityAngle;

    for (const m of meshes) {
      m.material.uniforms.uTime.value = elapsed;
    }
  }

  return { update };
}
