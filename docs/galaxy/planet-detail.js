import * as THREE from 'three';
import { loadShader, loadShaderPair } from './shaders.js';
import { createRng } from './rng.js';
import { parsePlanetType, findParentStar, hashString } from './planet-params.js';

const DETAIL_SEGMENTS = 48;
const DETAIL_ROWS = 32;
const MARKER_RADIUS = 2.5;
const ACTIVATE_DIST = 18;
const POOL_SIZE = 12;
const MAX_ACTIVATE_PER_FRAME = 4;
const GLOW_SCALE = 2.8;

const GLOW_VERT = `
precision highp float;
out vec2 vUv;
void main() {
  vUv = uv * 2.0 - 1.0;
  vec4 mvPos = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  vec2 scale = vec2(length(modelMatrix[0].xyz), length(modelMatrix[1].xyz));
  mvPos.xy += position.xy * scale;
  gl_Position = projectionMatrix * mvPos;
}`;

const GLOW_FRAG = `
precision highp float;
uniform vec3 uGlowColor;
uniform float uGlowIntensity;
uniform vec3 uLightDir;
uniform float uFadeIn;
in vec2 vUv;
out vec4 fragColor;
void main() {
  float r = length(vUv);
  if (r > 1.0) discard;
  /* Soft radial falloff — Gaussian-ish */
  float glow = exp(-r * r * 3.5) * 0.6 + exp(-r * r * 1.2) * 0.2;
  /* Project light direction into screen space to shift the glow center.
     Brighter toward the sun, dimmer on shadow side. */
  vec3 L = normalize(uLightDir);
  vec3 camL = normalize((viewMatrix * vec4(L, 0.0)).xyz);
  float lightBias = dot(vUv, camL.xy) * 0.4 + 0.6;
  lightBias = max(0.0, lightBias);
  glow *= lightBias * uGlowIntensity * uFadeIn;
  fragColor = vec4(uGlowColor * glow, 1.0);
}`;


/**
 * Creates the detail mesh manager for close-up planet/moon rendering.
 * Mirrors star-detail.js — pool of POOL_SIZE entries, selective activation.
 * @param {THREE.WebGLRenderer} renderer
 * @returns {{ update, container, dispose }}
 */
/* Per-subtype atmosphere scale — thick for gas, thin for rocky, skip for airless */
function computeAtmoDensity(params) {
  if (params.atmosphereIntensity < 0.1) return 1.0;
  const sub = params.subtype || '';
  switch (sub) {
    case 'gas':      return 1.03 + params.atmosphereIntensity * 0.03;
    case 'ocean':    return 1.02 + params.atmosphereIntensity * 0.02;
    case 'rocky':    return 1.02 + params.atmosphereIntensity * 0.015;
    case 'volcanic': return 1.02 + params.atmosphereIntensity * 0.015;
    case 'fungal':   return 1.02 + params.atmosphereIntensity * 0.01;
    default:         return 1.02;
  }
}

export async function createPlanetDetail(renderer) {
  const [{ vert, frag }, noiseSrc, atmoShaders] = await Promise.all([
    loadShaderPair('planet-detail'),
    loadShader('galaxy/shaders/noise-common.glsl'),
    loadShaderPair('planet-atmo'),
  ]);
  const fullFrag = frag.replace('/* @include noise-common */', noiseSrc);
  const atmoFullFrag = atmoShaders.frag.replace('/* @include noise-common */', noiseSrc);

  const surfaceGeo = new THREE.SphereGeometry(MARKER_RADIUS, DETAIL_SEGMENTS, DETAIL_ROWS);
  /* Match surface tessellation — the limb silhouette needs smooth geometry, not just normals */
  const atmoGeo = new THREE.SphereGeometry(MARKER_RADIUS, DETAIL_SEGMENTS, DETAIL_ROWS);

  const pool = [];
  for (let p = 0; p < POOL_SIZE; p++) {
    const mat = new THREE.ShaderMaterial({
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
        uCloudCover:        { value: 0.0 },
        uCloudColor:        { value: new THREE.Color(1, 1, 1) },
        uStorminess:        { value: 0.0 },
        uBandCount:         { value: 8.0 },
        uWarpStrength:      { value: 0.0 },
        uStormSize:         { value: 0.0 },
        uCrackScale:        { value: 5.0 },
        uSubsurfaceColor:   { value: new THREE.Color() },
        uEmissiveIntensity: { value: 0.0 },
        uEmissiveColor:     { value: new THREE.Color() },
        uBulbosity:         { value: 0.0 },
        uTime:              { value: 0 },
        uDisplacementAmp:   { value: 0.03 },
        uLumpiness:         { value: 0.0 },
        uRotation:          { value: new THREE.Matrix3() },
        uLightDir:          { value: new THREE.Vector3(0, 1, 0) },
        uLodDist:           { value: 18.0 },
        uFadeIn:            { value: 1.0 },
      },
      transparent: true,
    });

    const mesh = new THREE.Mesh(surfaceGeo, mat);
    mesh.scale.setScalar(0.95);

    /* Invisible hitbox for raycasting — matches visual scale */
    const hitboxGeo = new THREE.SphereGeometry(MARKER_RADIUS, 8, 6);
    const hitbox = new THREE.Mesh(hitboxGeo, new THREE.MeshBasicMaterial({
      visible: false, depthWrite: false,
    }));

    const atmoMat = new THREE.ShaderMaterial({
      vertexShader: atmoShaders.vert,
      fragmentShader: atmoFullFrag,
      glslVersion: THREE.GLSL3,
      uniforms: {
        uAtmoTint:       { value: new THREE.Color() },
        uAtmoIntensity:  { value: 0.2 },
        uLightDir:       { value: new THREE.Vector3(0, 1, 0) },
        uFadeIn:         { value: 1.0 },
        uCloudCover:     { value: 0.0 },
        uCloudColor:     { value: new THREE.Color(1, 1, 1) },
        uStorminess:     { value: 0.0 },
        uTime:           { value: 0.0 },
        uSeed:           { value: 0.0 },
        uPlanetMode:     { value: 0 },
        uBandCount:      { value: 8.0 },
        uCloudRotation:  { value: new THREE.Matrix3() },
      },
      transparent: true,
      blending: THREE.CustomBlending,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneMinusSrcAlphaFactor,
      blendSrcAlpha: THREE.OneFactor,
      blendDstAlpha: THREE.OneMinusSrcAlphaFactor,
      depthWrite: false,
      depthTest: true,
      side: THREE.DoubleSide,
    });
    const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
    atmoMesh.renderOrder = 6;
    atmoMesh.visible = false;
    atmoMesh.raycast = () => {};

    const glowMat = new THREE.ShaderMaterial({
      vertexShader: GLOW_VERT,
      fragmentShader: GLOW_FRAG,
      glslVersion: THREE.GLSL3,
      uniforms: {
        uGlowColor:     { value: new THREE.Color() },
        uGlowIntensity: { value: 0.3 },
        uLightDir:       { value: new THREE.Vector3(0, 1, 0) },
        uFadeIn:         { value: 1.0 },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
    });
    const glowPlane = new THREE.PlaneGeometry(1, 1);
    const glowMesh = new THREE.Mesh(glowPlane, glowMat);
    glowMesh.renderOrder = 4;
    glowMesh.visible = false;
    glowMesh.raycast = () => {};

    const group = new THREE.Group();
    group.add(mesh);
    group.add(atmoMesh);
    group.add(glowMesh);
    group.add(hitbox);
    group.visible = false;
    group.renderOrder = 5;

    pool.push({
      group, mat, mesh, hitbox, atmoMat, atmoMesh, glowMat, glowMesh,
      bodyId: null, parentStarId: null, radius: 1.0,
      atmoDensity: 1.03,
      rotAxis: new THREE.Vector3(0, 1, 0), rotSpeed: 0.1,
    });
  }

  const _rotQuat = new THREE.Quaternion();
  const _rotMat3 = new THREE.Matrix3();
  const _rotMat4 = new THREE.Matrix4();
  const _lightDir = new THREE.Vector3();

  const container = new THREE.Group();
  for (const entry of pool) container.add(entry.group);

  let cachedPlanetIds = null;
  let siblingIndex = null;
  let paramsCache = null;
  const activeIds = new Set();
  const activationQueue = [];

  function setParamsCache(cache) { paramsCache = cache; }

  function activate(entry, bodyId, body, bodies) {
    const cached = paramsCache?.get(bodyId);
    const params = cached || parsePlanetType(body, bodyId, findParentStar(bodyId, bodies), bodies);
    const seed = hashString(bodyId);
    const u = entry.mat.uniforms;

    u.uSeed.value              = seed;
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
    u.uCloudCover.value        = params.cloudCover ?? 0;
    u.uCloudColor.value.set(params.cloudColor ?? '#ffffff');
    u.uStorminess.value        = params.storminess ?? 0;
    u.uBandCount.value         = params.bandCount;
    u.uWarpStrength.value      = params.warpStrength;
    u.uStormSize.value         = params.stormSize;
    u.uCrackScale.value        = params.crackScale;
    u.uSubsurfaceColor.value.set(params.subsurfaceColor);
    u.uEmissiveIntensity.value = params.emissiveIntensity;
    u.uEmissiveColor.value.set(params.emissiveColor);
    u.uBulbosity.value         = params.bulbosity;
    u.uDisplacementAmp.value   = params.displacementAmp;
    u.uLumpiness.value         = params.lumpiness || 0.0;

    entry.radius = params.radius;

    /* Atmosphere shell — visible only for bodies with meaningful atmosphere */
    const ad = computeAtmoDensity(params);
    entry.atmoDensity = ad;
    entry.atmoMat.uniforms.uAtmoTint.value.set(params.atmosphereTint);
    entry.atmoMat.uniforms.uAtmoIntensity.value = params.atmosphereIntensity;
    entry.atmoMat.uniforms.uCloudCover.value = params.cloudCover ?? 0;
    entry.atmoMat.uniforms.uCloudColor.value.set(params.cloudColor ?? '#ffffff');
    entry.atmoMat.uniforms.uStorminess.value = params.storminess ?? 0;
    entry.atmoMat.uniforms.uSeed.value = hashString(bodyId);
    entry.atmoMat.uniforms.uPlanetMode.value = params.mode;
    entry.atmoMat.uniforms.uBandCount.value = params.bandCount;
    /* Show shell if body has atmosphere OR clouds */
    entry.atmoMesh.visible = params.atmosphereIntensity >= 0.1 || (params.cloudCover ?? 0) > 0.01;

    /* Outer glow sprite — matches atmosphere color, directional */
    const hasAtmo = params.atmosphereIntensity >= 0.1;
    entry.glowMat.uniforms.uGlowColor.value.set(params.atmosphereTint);
    entry.glowMat.uniforms.uGlowIntensity.value = hasAtmo ? params.atmosphereIntensity * 0.5 : 0;
    entry.glowMesh.visible = hasAtmo;

    /* Cache parent star ID for per-frame light direction lookups */
    let sid = bodies[bodyId]?.parentId;
    while (sid && bodies[sid]?.type !== 'star') sid = bodies[sid]?.parentId;
    entry.parentStarId = sid || null;

    const rng = createRng(seed + 777);
    const isLumpy = (params.lumpiness || 0) > 0.05;
    const tiltDeg = isLumpy ? 15 + rng.next() * 75 : 5 + rng.next() * 25;
    const tiltRad = tiltDeg * Math.PI / 180;
    const azimuth = rng.next() * Math.PI * 2;
    entry.rotAxis.set(
      Math.sin(tiltRad) * Math.cos(azimuth),
      Math.cos(tiltRad),
      Math.sin(tiltRad) * Math.sin(azimuth)
    ).normalize();
    entry.rotSpeed = isLumpy ? 0.06 + rng.next() * 0.18 : 0.03 + rng.next() * 0.08;

    entry.bodyId = bodyId;
    entry.group.userData.bodyId = bodyId;
    entry.group.visible = true;
  }

  function deactivate(entry) {
    entry.bodyId = null;
    entry.parentStarId = null;
    entry.group.userData.bodyId = null;
    entry.group.visible = false;
    entry.atmoMesh.visible = false;
    entry.glowMesh.visible = false;
  }

  /* Build parent→children index once, then O(1) lookups */
  function ensureSiblingIndex(bodies) {
    if (siblingIndex) return;
    siblingIndex = new Map();
    for (const [id, body] of Object.entries(bodies)) {
      const t = body.type;
      if (t !== 'planet' && t !== 'moon') continue;
      const pid = body.parentId;
      if (!pid) continue;
      let arr = siblingIndex.get(pid);
      if (!arr) { arr = []; siblingIndex.set(pid, arr); }
      arr.push(id);
    }
  }

  function getSiblings(bodyId, bodies) {
    const parentId = bodies[bodyId]?.parentId;
    if (!parentId) return [];
    ensureSiblingIndex(bodies);
    const children = siblingIndex.get(parentId);
    if (!children) return [];
    return children.filter(id => id !== bodyId);
  }

  function getChildren(bodyId, bodies) {
    ensureSiblingIndex(bodies);
    return siblingIndex.get(bodyId) || [];
  }

  /**
   * Per-frame update — activates detail for tracked planet + nearest siblings.
   * @returns {Map<string, number>} bodyId → fade (0–1); caller keeps atlas visible until fade > 0.99
   */
  function update(trackedId, cameraPos, bodyWorldPos, galaxyData, rotationTime, bodyMeta) {
    let anchorId = null;
    const bodies = galaxyData.bodies;

    /* If tracking a planet/moon, use it as anchor */
    if (trackedId) {
      const t = bodies[trackedId]?.type;
      if (t === 'planet' || t === 'moon') anchorId = trackedId;
    }

    /* Otherwise find closest planet/moon by proximity */
    if (!anchorId) {
      if (!cachedPlanetIds) {
        cachedPlanetIds = Object.keys(bodies).filter(id => {
          const t = bodies[id].type;
          return t === 'planet' || t === 'moon';
        });
      }
      let closestDistSq = ACTIVATE_DIST * ACTIVATE_DIST;
      for (const id of cachedPlanetIds) {
        const wp = bodyWorldPos.get(id);
        if (!wp) continue;
        const dx = cameraPos.x - wp.x, dy = cameraPos.y - wp.y, dz = cameraPos.z - wp.z;
        const distSq = dx * dx + dy * dy + dz * dz;
        if (distSq < closestDistSq) {
          closestDistSq = distSq;
          anchorId = id;
        }
      }
    }

    /* Build target list: anchor + siblings + anchor's children, closest-first, capped by pool */
    const targetIds = [];
    if (anchorId) {
      targetIds.push(anchorId);

      const distSq = (id) => {
        const w = bodyWorldPos.get(id);
        if (!w) return 1e9;
        return (cameraPos.x - w.x) ** 2 + (cameraPos.y - w.y) ** 2 + (cameraPos.z - w.z) ** 2;
      };

      /* Collect parent + siblings + children, dedupe, sort by distance */
      const candidates = new Set();
      const parentId = bodies[anchorId]?.parentId;
      if (parentId && (bodies[parentId]?.type === 'planet' || bodies[parentId]?.type === 'moon'))
        candidates.add(parentId);
      for (const id of getSiblings(anchorId, bodies)) candidates.add(id);
      for (const id of getChildren(anchorId, bodies)) candidates.add(id);

      const sorted = [...candidates].sort((a, b) => distSq(a) - distSq(b));
      for (let i = 0; i < Math.min(POOL_SIZE - 1, sorted.length); i++) {
        targetIds.push(sorted[i]);
      }
    }

    const desired = new Set(targetIds);

    /* Deactivate pool entries no longer needed (immediate — no perf cost) */
    for (const entry of pool) {
      if (entry.bodyId && !desired.has(entry.bodyId)) {
        activeIds.delete(entry.bodyId);
        deactivate(entry);
      }
    }

    /* Flush stale queue entries that are no longer desired */
    for (let i = activationQueue.length - 1; i >= 0; i--) {
      if (!desired.has(activationQueue[i])) activationQueue.splice(i, 1);
    }

    /* Enqueue new bodies that aren't active or already queued */
    for (const id of targetIds) {
      if (activeIds.has(id) || activationQueue.includes(id)) continue;
      activationQueue.push(id);
    }

    /* Drain queue with per-frame budget */
    let activated = 0;
    while (activationQueue.length > 0 && activated < MAX_ACTIVATE_PER_FRAME) {
      const id = activationQueue.shift();
      if (activeIds.has(id)) continue;
      const freeEntry = pool.find(e => !e.bodyId);
      if (!freeEntry) break;
      activate(freeEntry, id, bodies[id], bodies);
      activeIds.add(id);
      activated++;
    }

    /* Update all active entries */
    for (const entry of pool) {
      if (!entry.bodyId) continue;
      const wp = bodyWorldPos.get(entry.bodyId);
      if (!wp) { activeIds.delete(entry.bodyId); deactivate(entry); continue; }

      entry.group.position.set(wp.x, wp.y, wp.z);
      const meta = bodyMeta?.get(entry.bodyId);
      if (meta) entry.group.scale.setScalar(meta.instanceScale * entry.radius);

      /* Camera distance → LOD + fade-in opacity */
      const dx = cameraPos.x - wp.x, dy = cameraPos.y - wp.y, dz = cameraPos.z - wp.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      entry.mat.uniforms.uLodDist.value = dist;
      /* Fade from 0→1 over a 3-unit band inside the activation boundary */
      const fade = Math.min(1, Math.max(0, (ACTIVATE_DIST - dist) / 3.0));
      entry.mat.uniforms.uFadeIn.value = fade;
      entry.mat.depthWrite = fade > 0.99;

      /* Axial rotation */
      _rotQuat.setFromAxisAngle(entry.rotAxis, entry.rotSpeed * rotationTime);
      _rotMat4.makeRotationFromQuaternion(_rotQuat);
      _rotMat3.setFromMatrix4(_rotMat4);
      entry.mat.uniforms.uRotation.value.copy(_rotMat3);
      entry.mat.uniforms.uTime.value = rotationTime;

      /* Light direction from parent star — ID cached at activation */
      if (entry.parentStarId) {
        const starWp = bodyWorldPos.get(entry.parentStarId);
        if (starWp) {
          _lightDir.set(starWp.x - wp.x, starWp.y - wp.y, starWp.z - wp.z).normalize();
          entry.mat.uniforms.uLightDir.value.copy(_lightDir);
          if (entry.atmoMesh.visible)
            entry.atmoMat.uniforms.uLightDir.value.copy(_lightDir);
          if (entry.glowMesh.visible)
            entry.glowMat.uniforms.uLightDir.value.copy(_lightDir);
        }
      }

      /* Atmosphere shell — scale, fade, time, cloud rotation */
      if (entry.atmoMesh.visible) {
        entry.atmoMesh.scale.setScalar(0.95 * entry.atmoDensity);
        entry.atmoMat.uniforms.uFadeIn.value = fade;
        entry.atmoMat.uniforms.uTime.value = rotationTime;
        /* Clouds drift at 70% of surface rotation speed for visible parallax */
        _rotQuat.setFromAxisAngle(entry.rotAxis, entry.rotSpeed * 0.7 * rotationTime);
        _rotMat4.makeRotationFromQuaternion(_rotQuat);
        _rotMat3.setFromMatrix4(_rotMat4);
        entry.atmoMat.uniforms.uCloudRotation.value.copy(_rotMat3);
      }
      /* Glow sprite — wider halo behind the atmo mesh */
      if (entry.glowMesh.visible) {
        entry.glowMesh.scale.setScalar(MARKER_RADIUS * 2.0 * GLOW_SCALE);
        entry.glowMat.uniforms.uFadeIn.value = fade;
      }
    }

    /* Return map of bodyId → fade (0–1). Caller keeps atlas visible when fade < 1. */
    const fadeMap = new Map();
    for (const entry of pool) {
      if (entry.bodyId) fadeMap.set(entry.bodyId, entry.mat.uniforms.uFadeIn.value);
    }
    return fadeMap;
  }

  function invalidateCaches() {
    siblingIndex = null;
    cachedPlanetIds = null;
    paramsCache = null;
    activationQueue.length = 0;
    /* Force re-activation so pool entries pick up fresh params after rebake */
    for (const entry of pool) {
      if (entry.bodyId) deactivate(entry);
    }
    activeIds.clear();
  }

  function dispose() {
    surfaceGeo.dispose();
    atmoGeo.dispose();
    for (const entry of pool) {
      entry.mat.dispose();
      entry.atmoMat.dispose();
      entry.glowMat.dispose();
      entry.glowMesh.geometry.dispose();
      entry.hitbox.geometry.dispose();
      entry.hitbox.material.dispose();
    }
  }

  return { update, container, dispose, setParamsCache, invalidateCaches };
}
