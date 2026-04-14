import * as THREE from 'three';
import { NodeMaterial, MeshBasicNodeMaterial } from 'three/webgpu';
import { uniform, float, int, vec3, mat3, Fn, length, exp, max, normalize, dot, Discard, If, varying, varyingProperty, positionLocal, uv, vec2, vec4 } from 'three/tsl';
import { main as planetDetailVert, uTime as vertUTime } from './tsl/vert/planet-detail.tsl.js';
import { main as planetDetailFrag, uTime as fragUTime } from './tsl/frag/planet-detail.tsl.js';
import { main as atmoVert } from './tsl/vert/planet-atmo.tsl.js';
import { main as atmoFrag, uTime as atmoUTime } from './tsl/frag/planet-atmo.tsl.js';
import { createRng } from './rng.js';
import { parsePlanetType, findParentStar, hashString } from './planet-params.js';

const DETAIL_SEGMENTS = 48;
const DETAIL_ROWS = 32;
const MARKER_RADIUS = 2.5;
const ACTIVATE_DIST = 18;
const POOL_SIZE = 12;
const MAX_ACTIVATE_PER_FRAME = 4;
const GLOW_SCALE = 1.8;

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

/* Inline TSL glow shader — billboard with light-biased radial falloff */
const vGlowUv = varying(vec2(), 'vGlowUv');
const glowVertNode = /*@__PURE__*/ Fn(() => {
  vGlowUv.assign(uv().mul(2.0).sub(1.0));
});
const vGlowUvRead = varyingProperty('vec2', 'vGlowUv');

function createGlowFragFn(pGlowColor, pGlowIntensity, pGlowLightDir, pGlowFadeIn) {
  return /*@__PURE__*/ Fn(() => {
    const r = length(vGlowUvRead);
    If(r.greaterThan(1.0), () => { Discard(); });
    const glow = exp(r.mul(r).mul(-3.5)).mul(0.6).add(exp(r.mul(r).mul(-1.2)).mul(0.2));
    const L = normalize(pGlowLightDir);
    const lightBias = max(0.0, dot(vGlowUvRead, L.xy).mul(0.4).add(0.6));
    const scaledGlow = glow.mul(lightBias).mul(pGlowIntensity).mul(pGlowFadeIn);
    return vec4(pGlowColor.mul(scaledGlow), 1.0);
  });
}

export async function createPlanetDetail(renderer) {
  const surfaceGeo = new THREE.SphereGeometry(MARKER_RADIUS, DETAIL_SEGMENTS, DETAIL_ROWS);
  /* Match surface tessellation — the limb silhouette needs smooth geometry */
  const atmoGeo = new THREE.SphereGeometry(MARKER_RADIUS, DETAIL_SEGMENTS, DETAIL_ROWS);

  const pool = [];
  for (let p = 0; p < POOL_SIZE; p++) {
    /* Per-instance TSL uniform nodes for surface shader */
    const pSeed = uniform(float(0));
    const pPlanetMode = uniform(int(0));
    const pSlopeness = uniform(float(1.0));
    const pOceanLevel = uniform(float(0.3));
    const pTemperature = uniform(float(0.5));
    const pCraterDensity = uniform(float(0.0));
    const pSpecular = uniform(float(0.0));
    const pBaseColor1 = uniform(vec3(0, 0, 0));
    const pBaseColor2 = uniform(vec3(0, 0, 0));
    const pBaseColor3 = uniform(vec3(0, 0, 0));
    const pAtmoIntensity = uniform(float(0.2));
    const pAtmoTint = uniform(vec3(0, 0, 0));
    const pBandCount = uniform(float(8.0));
    const pWarpStrength = uniform(float(0.0));
    const pStormSize = uniform(float(0.0));
    const pCrackScale = uniform(float(5.0));
    const pSubsurfaceColor = uniform(vec3(0, 0, 0));
    const pEmissiveIntensity = uniform(float(0.0));
    const pEmissiveColor = uniform(vec3(0, 0, 0));
    const pBulbosity = uniform(float(0.0));
    const pRoughness = uniform(float(0.7));
    const pMetalness = uniform(float(0.0));
    const pCrystalMetric = uniform(int(0));
    const pMoistureOffset = uniform(float(0.0));
    const pBiomeCount = uniform(float(0.5));
    const pRotation = uniform(mat3());
    const pLightDir = uniform(vec3(0, 1, 0));
    const pLodDist = uniform(float(18.0));
    const pFadeIn = uniform(float(1.0));
    const pOpacity = uniform(float(-1.0));
    const pCloudCover = uniform(float(0.0));
    const pCloudColor = uniform(vec3(1, 1, 1));
    const pStorminess = uniform(float(0.0));
    const pDisplacementAmp = uniform(float(0.03));
    const pLumpiness = uniform(float(0.0));

    const mat = new NodeMaterial();
    mat.positionNode = planetDetailVert(pSeed, pDisplacementAmp, pLumpiness, pRotation);
    mat.fragmentNode = planetDetailFrag(
      pSeed, pPlanetMode, pSlopeness, pOceanLevel, pTemperature, pCraterDensity, pSpecular,
      pBaseColor1, pBaseColor2, pBaseColor3, pAtmoIntensity, pAtmoTint,
      pBandCount, pWarpStrength, pStormSize,
      pCrackScale, pSubsurfaceColor, pEmissiveIntensity, pEmissiveColor, pBulbosity,
      pRoughness, pMetalness, pCrystalMetric, pMoistureOffset, pBiomeCount,
      pRotation, pLightDir, pLodDist, pFadeIn, pOpacity,
      pCloudCover, pCloudColor, pStorminess
    );
    mat.transparent = true;

    const mesh = new THREE.Mesh(surfaceGeo, mat);
    mesh.scale.setScalar(0.95);

    /* Invisible hitbox for raycasting — matches visual scale */
    const hitboxGeo = new THREE.SphereGeometry(MARKER_RADIUS, 8, 6);
    const hitbox = new THREE.Mesh(hitboxGeo, new THREE.MeshBasicMaterial({
      visible: false, depthWrite: false,
    }));

    /* Per-instance atmosphere uniforms */
    const pAtmoTintA = uniform(vec3(0, 0, 0));
    const pAtmoIntensityA = uniform(float(0.2));
    const pAtmoLightDir = uniform(vec3(0, 1, 0));
    const pAtmoFadeIn = uniform(float(1.0));
    const pAtmoCloudCover = uniform(float(0.0));
    const pAtmoCloudColor = uniform(vec3(1, 1, 1));
    const pAtmoStorminess = uniform(float(0.0));
    const pAtmoSeed = uniform(float(0));
    const pAtmoPlanetMode = uniform(int(0));
    const pAtmoBandCount = uniform(float(8.0));
    const pCloudRotation = uniform(mat3());

    const atmoMat = new NodeMaterial();
    atmoMat.positionNode = atmoVert(pCloudRotation);
    atmoMat.fragmentNode = atmoFrag(
      pAtmoTintA, pAtmoIntensityA, pAtmoLightDir, pAtmoFadeIn,
      pAtmoCloudCover, pAtmoCloudColor, pAtmoStorminess,
      pAtmoSeed, pAtmoPlanetMode, pAtmoBandCount
    );
    atmoMat.transparent = true;
    atmoMat.blending = THREE.CustomBlending;
    atmoMat.blendSrc = THREE.OneFactor;
    atmoMat.blendDst = THREE.OneMinusSrcAlphaFactor;
    atmoMat.blendSrcAlpha = THREE.OneFactor;
    atmoMat.blendDstAlpha = THREE.OneMinusSrcAlphaFactor;
    atmoMat.depthWrite = false;
    atmoMat.depthTest = true;
    atmoMat.side = THREE.DoubleSide;

    const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
    atmoMesh.renderOrder = 6;
    atmoMesh.visible = false;
    atmoMesh.raycast = () => {};

    /* Per-instance glow uniforms + inline TSL glow material */
    const pGlowColor = uniform(vec3(0, 0, 0));
    const pGlowIntensity = uniform(float(0.3));
    const pGlowLightDir = uniform(vec3(0, 1, 0));
    const pGlowFadeIn = uniform(float(1.0));

    const glowMat = new MeshBasicNodeMaterial();
    glowMat.vertexNode = glowVertNode();
    glowMat.fragmentNode = createGlowFragFn(pGlowColor, pGlowIntensity, pGlowLightDir, pGlowFadeIn)();
    glowMat.transparent = true;
    glowMat.blending = THREE.AdditiveBlending;
    glowMat.depthWrite = false;
    glowMat.depthTest = false;

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
      /* Surface uniform refs */
      pSeed, pPlanetMode, pSlopeness, pOceanLevel, pTemperature, pCraterDensity,
      pSpecular, pBaseColor1, pBaseColor2, pBaseColor3, pAtmoIntensity, pAtmoTint,
      pBandCount, pWarpStrength, pStormSize, pCrackScale, pSubsurfaceColor,
      pEmissiveIntensity, pEmissiveColor, pBulbosity, pRoughness, pMetalness,
      pCrystalMetric, pMoistureOffset, pBiomeCount, pRotation, pLightDir,
      pLodDist, pFadeIn, pOpacity, pCloudCover, pCloudColor, pStorminess,
      pDisplacementAmp, pLumpiness,
      /* Atmo uniform refs */
      pAtmoTintA, pAtmoIntensityA, pAtmoLightDir, pAtmoFadeIn,
      pAtmoCloudCover, pAtmoCloudColor, pAtmoStorminess, pAtmoSeed,
      pAtmoPlanetMode, pAtmoBandCount, pCloudRotation,
      /* Glow uniform refs */
      pGlowColor, pGlowIntensity, pGlowLightDir, pGlowFadeIn,
    });
  }

  const _rotQuat = new THREE.Quaternion();
  const _rotMat3 = new THREE.Matrix3();
  const _rotMat4 = new THREE.Matrix4();
  const _lightDir = new THREE.Vector3();
  const _color = new THREE.Color();

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

    entry.pSeed.value              = seed;
    entry.pPlanetMode.value        = params.mode;
    entry.pSlopeness.value         = params.slopeness;
    entry.pOceanLevel.value        = params.oceanLevel;
    entry.pTemperature.value       = params.temperature;
    entry.pCraterDensity.value     = params.craterDensity;
    entry.pSpecular.value          = params.specular;
    _color.set(params.baseColor1);
    entry.pBaseColor1.value.set(_color.r, _color.g, _color.b);
    _color.set(params.baseColor2);
    entry.pBaseColor2.value.set(_color.r, _color.g, _color.b);
    _color.set(params.baseColor3);
    entry.pBaseColor3.value.set(_color.r, _color.g, _color.b);
    entry.pAtmoIntensity.value     = params.atmosphereIntensity;
    _color.set(params.atmosphereTint);
    entry.pAtmoTint.value.set(_color.r, _color.g, _color.b);
    entry.pCloudCover.value        = params.cloudCover ?? 0;
    _color.set(params.cloudColor ?? '#ffffff');
    entry.pCloudColor.value.set(_color.r, _color.g, _color.b);
    entry.pStorminess.value        = params.storminess ?? 0;
    entry.pBandCount.value         = params.bandCount;
    entry.pWarpStrength.value      = params.warpStrength;
    entry.pStormSize.value         = params.stormSize;
    entry.pCrackScale.value        = params.crackScale;
    _color.set(params.subsurfaceColor);
    entry.pSubsurfaceColor.value.set(_color.r, _color.g, _color.b);
    entry.pEmissiveIntensity.value = params.emissiveIntensity;
    _color.set(params.emissiveColor);
    entry.pEmissiveColor.value.set(_color.r, _color.g, _color.b);
    entry.pBulbosity.value         = params.bulbosity;
    entry.pDisplacementAmp.value   = params.displacementAmp;
    entry.pLumpiness.value         = params.lumpiness || 0.0;
    entry.pRoughness.value         = params.roughness ?? 0.7;
    entry.pMetalness.value         = params.metalness ?? 0.0;
    entry.pCrystalMetric.value     = params.crystalMetric ?? 0;
    entry.pMoistureOffset.value    = params.moistureOffset ?? 0.0;
    entry.pBiomeCount.value        = params.biomeCount ?? 0.5;
    entry.pOpacity.value           = params.opacity ?? 1.0;

    entry.radius = params.radius;

    /* Atmosphere shell */
    const ad = computeAtmoDensity(params);
    entry.atmoDensity = ad;
    _color.set(params.atmosphereTint);
    entry.pAtmoTintA.value.set(_color.r, _color.g, _color.b);
    entry.pAtmoIntensityA.value = params.atmosphereIntensity;
    entry.pAtmoCloudCover.value = params.cloudCover ?? 0;
    _color.set(params.cloudColor ?? '#ffffff');
    entry.pAtmoCloudColor.value.set(_color.r, _color.g, _color.b);
    entry.pAtmoStorminess.value = params.storminess ?? 0;
    entry.pAtmoSeed.value = hashString(bodyId);
    entry.pAtmoPlanetMode.value = params.mode;
    entry.pAtmoBandCount.value = params.bandCount;
    entry.atmoMesh.visible = params.atmosphereIntensity >= 0.1 || (params.cloudCover ?? 0) > 0.01;

    /* Outer glow — disabled pending WebGPU depth fix (shows through planet) */
    entry.glowMesh.visible = false;

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

  /* Build parent->children index once, then O(1) lookups */
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
   * @returns {Map<string, number>} bodyId -> fade (0-1); caller keeps atlas visible until fade > 0.99
   */
  function update(trackedId, cameraPos, bodyWorldPos, galaxyData, rotationTime, bodyMeta) {
    /* Set shared uTime across all materials */
    vertUTime.value = rotationTime;
    fragUTime.value = rotationTime;
    atmoUTime.value = rotationTime;

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

      /* Camera distance -> LOD + fade-in opacity */
      const dx = cameraPos.x - wp.x, dy = cameraPos.y - wp.y, dz = cameraPos.z - wp.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      entry.pLodDist.value = dist;
      /* Fade from 0->1 over a 3-unit band inside the activation boundary */
      const fade = Math.min(1, Math.max(0, (ACTIVATE_DIST - dist) / 3.0));
      entry.pFadeIn.value = fade;
      entry.mat.depthWrite = fade > 0.99;

      /* Axial rotation */
      _rotQuat.setFromAxisAngle(entry.rotAxis, entry.rotSpeed * rotationTime);
      _rotMat4.makeRotationFromQuaternion(_rotQuat);
      _rotMat3.setFromMatrix4(_rotMat4);
      entry.pRotation.value.copy(_rotMat3);

      /* Light direction from parent star — ID cached at activation */
      if (entry.parentStarId) {
        const starWp = bodyWorldPos.get(entry.parentStarId);
        if (starWp) {
          _lightDir.set(starWp.x - wp.x, starWp.y - wp.y, starWp.z - wp.z).normalize();
          entry.pLightDir.value.copy(_lightDir);
          if (entry.atmoMesh.visible)
            entry.pAtmoLightDir.value.copy(_lightDir);
          if (entry.glowMesh.visible)
            entry.pGlowLightDir.value.copy(_lightDir);
        }
      }

      /* Atmosphere shell — scale, fade, cloud rotation */
      if (entry.atmoMesh.visible) {
        entry.atmoMesh.scale.setScalar(0.95 * entry.atmoDensity);
        entry.pAtmoFadeIn.value = fade;
        /* Clouds drift at 70% of surface rotation speed for visible parallax */
        _rotQuat.setFromAxisAngle(entry.rotAxis, entry.rotSpeed * 0.7 * rotationTime);
        _rotMat4.makeRotationFromQuaternion(_rotQuat);
        _rotMat3.setFromMatrix4(_rotMat4);
        entry.pCloudRotation.value.copy(_rotMat3);
      }
      /* Glow sprite — wider halo behind the atmo mesh */
      if (entry.glowMesh.visible) {
        entry.glowMesh.scale.setScalar(MARKER_RADIUS * 2.0 * GLOW_SCALE);
        entry.pGlowFadeIn.value = fade;
      }
    }

    /* Return map of bodyId -> fade (0-1). Caller keeps atlas visible when fade < 1. */
    const fadeMap = new Map();
    for (const entry of pool) {
      if (entry.bodyId) fadeMap.set(entry.bodyId, entry.pFadeIn.value);
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

  /* Invalidate just one body — deactivate its pool entry so it re-activates with fresh params */
  function invalidateBody(bodyId) {
    if (paramsCache) paramsCache.delete(bodyId);
    for (const entry of pool) {
      if (entry.bodyId === bodyId) { deactivate(entry); break; }
    }
    activeIds.delete(bodyId);
    cachedPlanetIds = null;
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

  return { update, container, dispose, setParamsCache, invalidateCaches, invalidateBody };
}
