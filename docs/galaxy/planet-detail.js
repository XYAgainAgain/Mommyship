import * as THREE from 'three';
import { NodeMaterial, MeshBasicNodeMaterial } from 'three/webgpu';
import { uniform, float, int, vec3, mat3, Fn, length, exp, max, normalize, dot, Discard, If, varying, varyingProperty, positionLocal, uv, vec2, vec4 } from 'three/tsl';
import { main as planetDetailVert, uTime as vertUTime } from './tsl/vert/planet-detail.tsl.js';
import { main as planetDetailFrag, uTime as fragUTime } from './tsl/frag/planet-detail.tsl.js';
import { main as atmoVert } from './tsl/vert/planet-atmo.tsl.js';
import { main as atmoFrag, uTime as atmoUTime } from './tsl/frag/planet-atmo.tsl.js';
import { uPxGrid, uPxLevels, uPxDither, uPxStar, uPxStarRange, uPxPlanetRange, uPxNoSnap, uPxNoFlat } from './tsl/pixel.tsl.js';
import { createRng } from './rng.js';
import { parsePlanetType, findParentStar, hashString } from './planet-params.js';

const DETAIL_SEGMENTS = 48;
const DETAIL_ROWS = 32;
const MARKER_RADIUS = 2.5;
const POOL_SIZE = 12;
/* Cinema grows the pool past POOL_SIZE to fit a whole system; entries persist */
const POOL_HARD_CAP = 40;
const MAX_ACTIVATE_PER_FRAME = 4;
const GLOW_SCALE = 1.8;

/* Apparent size = visualRadius/dist (radians). Tuned by feel at 1.5× the original
   bands: a depth-1 planet (visualRadius 0.6) fades in from ~27u, full by ~22u. */
export const SIZE_FULL = 0.0267;
export const SIZE_ACTIVATE = 0.0222;
export const SIZE_RELEASE = 0.0178;

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

/* Pixel-art opt-in test: window.pixelTweak.bodies is 'all' or a list of body-ID prefixes */
function pxMatches(id) {
  const b = globalThis.pixelTweak?.bodies;
  return b === 'all' ? true : Array.isArray(b) && b.some(p => id.startsWith(p));
}

/* Uniform, not a literal: an inlined 1.0 makes mix(2,4,q) all-literal, and Firefox's
   Naga rejects abstract-typed expressions outside const contexts (Chrome tolerates) */
const uDetailQuality = uniform(float(1.0));

/* Inline TSL glow shader — billboard with light-biased radial falloff */
const vGlowUv = varying(vec2(), 'vGlowUv');
/* Must return a position: vertexNode/void here emitted `builtinClipSpace = ;`
   (invalid WGSL), so the glow pipeline never compiled. Needs JS billboarding when re-enabled. */
const glowVertNode = /*@__PURE__*/ Fn(() => {
  vGlowUv.assign(uv().mul(2.0).sub(1.0));
  return positionLocal;
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

  /* Live pixel-art knobs, e.g. pixelTweak.levels.value = 8 */
  if (typeof window !== 'undefined') {
    window.pixelTweak = {
      /* body-ID prefixes to pixelate, or 'all'; stars is a global 0/1 uniform toggle */
      bodies: ['steepborto', 'los-kuaran'],
      stars: uPxStar, grid: uPxGrid, levels: uPxLevels, dither: uPxDither,
      starRange: uPxStarRange, planetRange: uPxPlanetRange,
      noSnap: uPxNoSnap, noFlat: uPxNoFlat,
    };
  }

  const pool = [];
  const container = new THREE.Group();

  /* Factory so cinema mode can lazily grow the pool beyond POOL_SIZE */
  function makePoolEntry() {
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
    /* THREE.Vector3 value (not TSL vec3()) so .value.copy() actually mutates —
       uniform() wrapping a TSL vec3 freezes .value as a node. */
    const pLightDir = uniform(new THREE.Vector3(0, 1, 0));
    const pLodDist = uniform(float(18.0));
    const pFadeIn = uniform(float(1.0));
    const pOpacity = uniform(float(-1.0));
    const pCloudCover = uniform(float(0.0));
    const pCloudColor = uniform(vec3(1, 1, 1));
    const pStorminess = uniform(float(0.0));
    const pDisplacementAmp = uniform(float(0.03));
    const pLumpiness = uniform(float(0.0));
    const pTerrainType = uniform(int(1));
    const pCrackPattern = uniform(int(0));
    const pPxOn = uniform(float(0));

    const mat = new NodeMaterial();
    mat.positionNode = planetDetailVert(pSeed, pDisplacementAmp, pLumpiness, pRotation, pFadeIn);
    mat.fragmentNode = planetDetailFrag(
      pSeed, pPlanetMode, pSlopeness, pOceanLevel, pTemperature, pCraterDensity, pSpecular,
      pBaseColor1, pBaseColor2, pBaseColor3, pAtmoIntensity, pAtmoTint,
      pBandCount, pWarpStrength, pStormSize,
      pCrackScale, pSubsurfaceColor, pEmissiveIntensity, pEmissiveColor, pBulbosity,
      pRoughness, pMetalness, pCrystalMetric, pMoistureOffset, pBiomeCount,
      pRotation, pLightDir, pLodDist, pFadeIn, pOpacity,
      pCloudCover, pCloudColor, pStorminess, uDetailQuality, pTerrainType, pCrackPattern,
      pPxOn
    );
    mat.transparent = true;
    /* IGN (interleaved gradient noise) crossfade keeps pixels opaque, so depth
       stays valid through the fade */
    mat.depthWrite = true;

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
    const pAtmoLightDir = uniform(new THREE.Vector3(0, 1, 0));
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
      pAtmoSeed, pAtmoPlanetMode, pAtmoBandCount, pPxOn
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
    const pGlowLightDir = uniform(new THREE.Vector3(0, 1, 0));
    const pGlowFadeIn = uniform(float(1.0));

    const glowMat = new MeshBasicNodeMaterial();
    glowMat.positionNode = glowVertNode();
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

    const entry = {
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
      pDisplacementAmp, pLumpiness, pTerrainType, pCrackPattern, pPxOn,
      /* Atmo uniform refs */
      pAtmoTintA, pAtmoIntensityA, pAtmoLightDir, pAtmoFadeIn,
      pAtmoCloudCover, pAtmoCloudColor, pAtmoStorminess, pAtmoSeed,
      pAtmoPlanetMode, pAtmoBandCount, pCloudRotation,
      /* Glow uniform refs */
      pGlowColor, pGlowIntensity, pGlowLightDir, pGlowFadeIn,
    };
    pool.push(entry);
    container.add(entry.group);
    return entry;
  }

  for (let p = 0; p < POOL_SIZE; p++) makePoolEntry();

  const _rotQuat = new THREE.Quaternion();
  const _rotMat3 = new THREE.Matrix3();
  const _rotMat4 = new THREE.Matrix4();
  const _lightDir = new THREE.Vector3();
  const _color = new THREE.Color();

  let cachedPlanetIds = null;
  let paramsCache = null;
  const activeIds = new Set();
  const activationQueue = [];
  const lastAppSizes = new Map();

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
    entry.pTerrainType.value       = params.terrainType ?? 1;
    entry.pCrackPattern.value      = params.crackPattern ?? 0;
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

    entry.isCrystalline = params.mode === 6;

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

  /* Every planet/moon sharing the tracked body's top ancestor (handles binaries) */
  function gatherCinemaSystem(trackedId, bodies) {
    const rootOf = (id) => {
      let a = id, guard = 0;
      while (bodies[a]?.parentId && bodies[bodies[a].parentId] && guard++ < 16) a = bodies[a].parentId;
      return a;
    };
    const root = rootOf(trackedId);
    if (!cachedPlanetIds) {
      cachedPlanetIds = Object.keys(bodies).filter(id => {
        const t = bodies[id].type;
        return t === 'planet' || t === 'moon';
      });
    }
    _cinemaSystem.clear();
    for (const id of cachedPlanetIds) {
      if (rootOf(id) === root) _cinemaSystem.add(id);
    }
    return _cinemaSystem;
  }

  /* Reused per-frame scratch — update() runs every rotating frame, so no fresh allocations */
  const _candidates = [];
  const _desired = new Set();
  const _fadeMap = new Map();
  const _cinemaSystem = new Set();

  /**
   * Per-frame update — activates detail for the largest on-screen planets/moons.
   * @returns {Map<string, number>} bodyId → fade (0–1); caller keeps atlas visible until fade > 0.99
   */
  function update(trackedId, cameraPos, bodyWorldPos, galaxyData, rotationTime, bodyMeta, cinemaMode) {
    /* Set shared uTime across all materials */
    vertUTime.value = rotationTime;
    fragUTime.value = rotationTime;
    atmoUTime.value = rotationTime;

    const bodies = galaxyData.bodies;
    if (!cachedPlanetIds) {
      cachedPlanetIds = Object.keys(bodies).filter(id => {
        const t = bodies[id].type;
        return t === 'planet' || t === 'moon';
      });
    }

    /* Apparent size (visualRadius/dist) drives both selection and fade */
    lastAppSizes.clear();
    _candidates.length = 0;
    for (const id of cachedPlanetIds) {
      const wp = bodyWorldPos.get(id);
      if (!wp) continue;
      const meta = bodyMeta?.get(id);
      if (!meta) continue;
      const dx = cameraPos.x - wp.x, dy = cameraPos.y - wp.y, dz = cameraPos.z - wp.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1e-6;
      const visualRadius = MARKER_RADIUS * meta.instanceScale * (meta.planetRadius || 1);
      const appSize = visualRadius / dist;
      lastAppSizes.set(id, appSize);
      /* Hysteresis: active bodies hold their slot down to the lower release size */
      const threshold = activeIds.has(id) ? SIZE_RELEASE : SIZE_ACTIVATE;
      if (appSize > threshold) _candidates.push(id);
    }

    const cinemaSystem = (cinemaMode && trackedId) ? gatherCinemaSystem(trackedId, bodies) : null;

    /* Selection: whole tracked system in cinema, else the biggest N on screen */
    _desired.clear();
    const desired = _desired;
    if (cinemaSystem) {
      for (const id of cinemaSystem) desired.add(id);
    } else {
      const tt = bodies[trackedId]?.type;
      if (trackedId && (tt === 'planet' || tt === 'moon')) desired.add(trackedId);
      /* Rank hysteresis: actives get a 15% size bonus so a marginally bigger
         newcomer can't thrash the pool cutoff frame-to-frame */
      _candidates.sort((a, b) =>
        lastAppSizes.get(b) * (activeIds.has(b) ? 1.15 : 1) -
        lastAppSizes.get(a) * (activeIds.has(a) ? 1.15 : 1));
      for (const id of _candidates) {
        if (desired.size >= POOL_SIZE) break;
        desired.add(id);
      }
    }

    /* Per-frame activation budget, doubled while filling a cinema system */
    const budget = cinemaSystem ? MAX_ACTIVATE_PER_FRAME * 2 : MAX_ACTIVATE_PER_FRAME;

    /* Grow pool on demand for oversized cinema systems (persists, capped).
       Throttled to the budget so graph builds spread across frames, not one hitch. */
    if (cinemaSystem) {
      let grown = 0;
      while (pool.length < desired.size && pool.length < POOL_HARD_CAP && grown < budget) {
        makePoolEntry();
        grown++;
      }
    }

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
    for (const id of desired) {
      if (activeIds.has(id) || activationQueue.includes(id)) continue;
      activationQueue.push(id);
    }

    /* Drain queue with the per-frame budget computed above */
    let activated = 0;
    while (activationQueue.length > 0 && activated < budget) {
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

      entry.pPxOn.value = pxMatches(entry.bodyId) ? 1 : 0;

      entry.group.position.set(wp.x, wp.y, wp.z);
      const meta = bodyMeta?.get(entry.bodyId);
      if (meta) entry.group.scale.setScalar(meta.instanceScale * entry.radius);

      /* Camera distance drives the shader LOD; fade comes from apparent size */
      const dx = cameraPos.x - wp.x, dy = cameraPos.y - wp.y, dz = cameraPos.z - wp.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      entry.pLodDist.value = dist;
      let fade;
      if (cinemaSystem && cinemaSystem.has(entry.bodyId)) {
        fade = 1.0;
      } else {
        const appSize = lastAppSizes.get(entry.bodyId) ?? 0;
        fade = Math.min(1, Math.max(0, (appSize - SIZE_ACTIVATE) / (SIZE_FULL - SIZE_ACTIVATE)));
      }
      entry.pFadeIn.value = fade;
      /* Crystalline facets have real sub-1 alpha unrelated to the crossfade —
         only they defer depth writes until fully faded in */
      entry.mat.depthWrite = !entry.isCrystalline || fade > 0.99;

      /* Axial rotation */
      _rotQuat.setFromAxisAngle(entry.rotAxis, entry.rotSpeed * rotationTime);
      _rotMat4.makeRotationFromQuaternion(_rotQuat);
      _rotMat3.setFromMatrix4(_rotMat4);
      entry.pRotation.value.copy(_rotMat3);

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

    /* Return map of bodyId → fade (0–1). Caller keeps atlas visible when fade < 1.
       Reused scratch: consumed synchronously by systems.js within the same frame. */
    _fadeMap.clear();
    for (const entry of pool) {
      if (entry.bodyId) _fadeMap.set(entry.bodyId, entry.pFadeIn.value);
    }
    return _fadeMap;
  }

  function invalidateCaches() {
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
