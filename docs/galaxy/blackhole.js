import * as THREE from 'three';
import { loadShaderPair } from './shaders.js';
import { bakeNoiseTexture } from './noise-bake.js';

/* 20% of outer radius — matches masshole's 1:5 inner gap ratio */
const DISC_INNER_RADIUS = 6;
const DISC_OUTER_RADIUS = 30;
const PARTICLE_COUNT = 50000;

/* Accretion disk palette — matches site's dark mode accent colors */
/* Brighter inner color — goes near-white with additive blending (3 iterations) */
const INNER_COLOR = new THREE.Color('#FF90E0');
const MID_COLOR   = new THREE.Color('#8332ac');
const OUTER_COLOR = new THREE.Color('#3633ff');

function smoothstep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

export async function createBlackHole(scene, renderer) {
  const [discShaders, particleShaders, noiseTexture] = await Promise.all([
    loadShaderPair('accretion-disc'),
    loadShaderPair('accretion-particles'),
    bakeNoiseTexture(renderer)
  ]);

  const group = new THREE.Group();

  /* No event horizon sphere — the dark center is created by lensing distortion
     collapsing UVs to a single point, exactly like the masshole reference. */

  const discGeo = new THREE.CylinderGeometry(DISC_OUTER_RADIUS, DISC_INNER_RADIUS, 0, 64, 10, true);
  const discMat = new THREE.ShaderMaterial({
    vertexShader: discShaders.vert,
    fragmentShader: discShaders.frag,
    uniforms: {
      uTime:         { value: 0 },
      uOpacity:      { value: 1.0 },
      uNoiseTexture: { value: noiseTexture },
      uInnerColor:   { value: INNER_COLOR },
      uMidColor:     { value: MID_COLOR },
      uOuterColor:   { value: OUTER_COLOR }
    },
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false,
    transparent: true
  });
  const discMesh = new THREE.Mesh(discGeo, discMat);
  discMesh.renderOrder = 2;
  group.add(discMesh);

  const progresses = new Float32Array(PARTICLE_COUNT);
  const pSizes    = new Float32Array(PARTICLE_COUNT);
  const pRandoms  = new Float32Array(PARTICLE_COUNT);
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    progresses[i] = Math.random();
    pSizes[i]    = Math.random();
    pRandoms[i]  = Math.random();
  }
  const particleGeo = new THREE.BufferGeometry();
  /* Dummy position attribute — Three.js requires it for draw calls.
     Real orbit positions are computed in the vertex shader from aProgress. */
  particleGeo.setAttribute('position',  new THREE.BufferAttribute(new Float32Array(PARTICLE_COUNT * 3), 3));
  particleGeo.setAttribute('aProgress', new THREE.BufferAttribute(progresses, 1));
  particleGeo.setAttribute('aSize',     new THREE.BufferAttribute(pSizes, 1));
  particleGeo.setAttribute('aRandom',   new THREE.BufferAttribute(pRandoms, 1));

  const particleMat = new THREE.ShaderMaterial({
    vertexShader: particleShaders.vert,
    fragmentShader: particleShaders.frag,
    uniforms: {
      uTime:       { value: 0 },
      uOpacity:    { value: 1.0 },
      uViewHeight: { value: window.innerHeight },
      uSize:       { value: 0.09 },
    },
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false,
    transparent: true
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  particles.renderOrder = 3;
  particles.frustumCulled = false;
  group.add(particles);

  /* Far-LOD glow sprite — ring texture with transparent center for event horizon rim */
  const spriteCanvas = document.createElement('canvas');
  spriteCanvas.width = 64;
  spriteCanvas.height = 64;
  const ctx = spriteCanvas.getContext('2d');
  const cx = 32, cy = 32;

  /* Outer glow falloff */
  const outerGlow = ctx.createRadialGradient(cx, cy, 10, cx, cy, 32);
  outerGlow.addColorStop(0, 'rgba(131, 50, 172, 0.6)');
  outerGlow.addColorStop(0.5, 'rgba(54, 51, 255, 0.2)');
  outerGlow.addColorStop(1, 'rgba(54, 51, 255, 0)');
  ctx.fillStyle = outerGlow;
  ctx.fillRect(0, 0, 64, 64);

  /* Bright ring band — reads as Einstein ring / event horizon glow from far away */
  const ring = ctx.createRadialGradient(cx, cy, 0, cx, cy, 32);
  ring.addColorStop(0, 'rgba(0, 0, 0, 0)');
  ring.addColorStop(0.25, 'rgba(0, 0, 0, 0)');
  ring.addColorStop(0.32, 'rgba(246, 121, 229, 0.9)');
  ring.addColorStop(0.38, 'rgba(246, 121, 229, 0.9)');
  ring.addColorStop(0.5, 'rgba(131, 50, 172, 0.3)');
  ring.addColorStop(0.7, 'rgba(0, 0, 0, 0)');
  ring.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = ring;
  ctx.fillRect(0, 0, 64, 64);

  const spriteTexture = new THREE.CanvasTexture(spriteCanvas);
  const spriteMat = new THREE.SpriteMaterial({
    map: spriteTexture,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true
  });
  const glowSprite = new THREE.Sprite(spriteMat);
  glowSprite.scale.set(28, 28, 1);
  group.add(glowSprite);

  /* Opaque black disc — occludes stars at far LOD, fades out by lodFactor 0.25 */
  const occluderGeo = new THREE.CircleGeometry(5.5, 32);
  const occluderMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    depthWrite: true,
    depthTest: true
  });
  const occluder = new THREE.Mesh(occluderGeo, occluderMat);
  occluder.renderOrder = 1;
  group.add(occluder);

  /* Mid-LOD ring mesh — shows accretion disk orientation at medium distance.
     Flat in XZ like the real disk, uses radial gradient from vertex position. */
  const ringGeo = new THREE.RingGeometry(8, 22, 48);
  const ringMat = new THREE.ShaderMaterial({
    vertexShader: `
      varying float vRadial;
      void main() {
        /* Radial 0-1 from position, not UVs — RingGeometry UVs are positional, not radial */
        vRadial = (length(position.xy) - 8.0) / (22.0 - 8.0);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      precision highp float;
      uniform float uOpacity;
      varying float vRadial;
      void main() {
        vec3 c0 = vec3(1.0, 0.90, 0.97);
        vec3 c1 = vec3(0.95, 0.30, 0.60);
        vec3 c2 = vec3(0.12, 0.30, 0.55);
        vec3 c3 = vec3(0.51, 0.20, 0.67);
        vec3 c4 = vec3(0.80, 0.65, 0.30);
        vec3 color = mix(c0, c1, smoothstep(0.0, 0.15, vRadial));
        color = mix(color, c2, smoothstep(0.15, 0.35, vRadial));
        color = mix(color, c3, smoothstep(0.35, 0.60, vRadial));
        color = mix(color, c4, smoothstep(0.60, 0.90, vRadial));
        float edgeFade = smoothstep(0.0, 0.15, vRadial) * smoothstep(1.0, 0.7, vRadial);
        gl_FragColor = vec4(color, edgeFade * uOpacity);
      }
    `,
    uniforms: {
      uOpacity: { value: 1.0 }
    },
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: true,
    transparent: true
  });
  const ringMesh = new THREE.Mesh(ringGeo, ringMat);
  ringMesh.rotation.x = Math.PI * 0.5;
  ringMesh.renderOrder = 1.5;
  ringMesh.visible = true;
  group.add(ringMesh);

  scene.add(group);

  function update(elapsed, lodFactor, camera) {
    discMat.uniforms.uTime.value = elapsed;
    particleMat.uniforms.uTime.value = elapsed + 9999;

    /* Glow sprite: fades out as real disk appears */
    glowSprite.material.opacity = 1 - lodFactor;
    glowSprite.visible = lodFactor < 0.99;

    /* Occluder: gone before real disk appears so they never coexist */
    occluder.quaternion.copy(camera.quaternion);
    const occluderOpacity = 1 - smoothstep(0.1, 0.25, lodFactor);
    occluderMat.opacity = occluderOpacity;
    occluder.visible = occluderOpacity > 0.01;
    occluderMat.depthWrite = occluderOpacity > 0.5;

    /* Ring mesh: always visible at far range, bridges gap until real disk takes over */
    const ringOpacity = 1 - smoothstep(0.3, 0.6, lodFactor);
    ringMat.uniforms.uOpacity.value = ringOpacity;
    ringMesh.visible = ringOpacity > 0.01;

    /* Real disk + particles: delayed start so occluder is fully gone first */
    const diskOpacity = smoothstep(0.2, 0.8, lodFactor);
    discMat.uniforms.uOpacity.value = diskOpacity;
    particleMat.uniforms.uOpacity.value = diskOpacity;
    discMesh.visible = diskOpacity > 0.01;
    particles.visible = diskOpacity > 0.01;

    return { lodFactor };
  }

  function resize() {
    particleMat.uniforms.uViewHeight.value = window.innerHeight;
  }

  return { group, update, resize };
}
