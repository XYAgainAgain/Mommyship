import * as THREE from 'three';
import { loadShader, loadShaderPair } from './shaders.js';
import { createRng } from './rng.js';
import { parsePlanetType, findParentStar, hashString } from './planet-params.js';

const DETAIL_SEGMENTS = 48;
const DETAIL_ROWS = 32;
const MARKER_RADIUS = 2.5;
const ACTIVATE_DIST = 18;
const POOL_SIZE = 8;

/**
 * Creates the detail mesh manager for close-up planet/moon rendering.
 * Mirrors star-detail.js — pool of POOL_SIZE entries, selective activation.
 * @param {THREE.WebGLRenderer} renderer
 * @returns {{ update, container, dispose }}
 */
export async function createPlanetDetail(renderer) {
  const [{ vert, frag }, noiseSrc] = await Promise.all([
    loadShaderPair('planet-detail'),
    loadShader('galaxy/shaders/noise-common.glsl'),
  ]);
  const fullFrag = frag.replace('/* @include noise-common */', noiseSrc);

  const surfaceGeo = new THREE.SphereGeometry(MARKER_RADIUS, DETAIL_SEGMENTS, DETAIL_ROWS);

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
        uRotation:          { value: new THREE.Matrix3() },
        uLightDir:          { value: new THREE.Vector3(0, 1, 0) },
      },
    });

    const mesh = new THREE.Mesh(surfaceGeo, mat);
    mesh.scale.setScalar(0.95);

    /* Invisible hitbox for raycasting — matches visual scale */
    const hitboxGeo = new THREE.SphereGeometry(MARKER_RADIUS, 8, 6);
    const hitbox = new THREE.Mesh(hitboxGeo, new THREE.MeshBasicMaterial({
      visible: false, depthWrite: false,
    }));

    const group = new THREE.Group();
    group.add(mesh);
    group.add(hitbox);
    group.visible = false;
    group.renderOrder = 5;

    pool.push({
      group, mat, mesh, hitbox,
      bodyId: null, parentStarId: null, radius: 1.0,
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
  const activeIds = new Set();

  function activate(entry, bodyId, body, bodies) {
    const parentStar = findParentStar(bodyId, bodies);
    const params = parsePlanetType(body, bodyId, parentStar, bodies);
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
    u.uBandCount.value         = params.bandCount;
    u.uWarpStrength.value      = params.warpStrength;
    u.uStormSize.value         = params.stormSize;
    u.uCrackScale.value        = params.crackScale;
    u.uSubsurfaceColor.value.set(params.subsurfaceColor);
    u.uEmissiveIntensity.value = params.emissiveIntensity;
    u.uEmissiveColor.value.set(params.emissiveColor);
    u.uBulbosity.value         = params.bulbosity;
    u.uDisplacementAmp.value   = params.displacementAmp;

    entry.radius = params.radius;

    /* Cache parent star ID for per-frame light direction lookups */
    let sid = bodies[bodyId]?.parentId;
    while (sid && bodies[sid]?.type !== 'star') sid = bodies[sid]?.parentId;
    entry.parentStarId = sid || null;

    const rng = createRng(seed + 777);
    const tiltRad = (5 + rng.next() * 25) * Math.PI / 180;
    const azimuth = rng.next() * Math.PI * 2;
    entry.rotAxis.set(
      Math.sin(tiltRad) * Math.cos(azimuth),
      Math.cos(tiltRad),
      Math.sin(tiltRad) * Math.sin(azimuth)
    ).normalize();
    entry.rotSpeed = 0.03 + rng.next() * 0.08;

    entry.bodyId = bodyId;
    entry.group.userData.bodyId = bodyId;
    entry.group.visible = true;
  }

  function deactivate(entry) {
    entry.bodyId = null;
    entry.parentStarId = null;
    entry.group.userData.bodyId = null;
    entry.group.visible = false;
  }

  /* Find siblings of a body — all bodies sharing the same parent */
  function getSiblings(bodyId, bodies) {
    const parentId = bodies[bodyId]?.parentId;
    if (!parentId) return [];
    if (!cachedPlanetIds) {
      cachedPlanetIds = Object.keys(bodies).filter(id => {
        const t = bodies[id].type;
        return t === 'planet' || t === 'moon';
      });
    }
    return cachedPlanetIds.filter(id => id !== bodyId && bodies[id].parentId === parentId);
  }

  /**
   * Per-frame update — activates detail for tracked planet + nearest siblings.
   * @returns {Set<string>} active body IDs (caller hides their instanced versions)
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

    /* Build target list: anchor + all siblings, sorted closest-first, capped by pool */
    const targetIds = [];
    if (anchorId) {
      targetIds.push(anchorId);
      const siblings = getSiblings(anchorId, bodies);
      if (siblings.length > 0) {
        siblings.sort((a, b) => {
          const wa = bodyWorldPos.get(a), wb = bodyWorldPos.get(b);
          if (!wa) return 1;
          if (!wb) return -1;
          const da = (cameraPos.x - wa.x) ** 2 + (cameraPos.y - wa.y) ** 2 + (cameraPos.z - wa.z) ** 2;
          const db = (cameraPos.x - wb.x) ** 2 + (cameraPos.y - wb.y) ** 2 + (cameraPos.z - wb.z) ** 2;
          return da - db;
        });
        for (let i = 0; i < Math.min(POOL_SIZE - 1, siblings.length); i++) {
          targetIds.push(siblings[i]);
        }
      }
    }

    const desired = new Set(targetIds);

    /* Deactivate pool entries no longer needed */
    for (const entry of pool) {
      if (entry.bodyId && !desired.has(entry.bodyId)) {
        activeIds.delete(entry.bodyId);
        deactivate(entry);
      }
    }

    /* Activate new bodies from the pool */
    for (const id of targetIds) {
      if (activeIds.has(id)) continue;
      const freeEntry = pool.find(e => !e.bodyId);
      if (!freeEntry) break;
      activate(freeEntry, id, bodies[id], bodies);
      activeIds.add(id);
    }

    /* Update all active entries */
    for (const entry of pool) {
      if (!entry.bodyId) continue;
      const wp = bodyWorldPos.get(entry.bodyId);
      if (!wp) { activeIds.delete(entry.bodyId); deactivate(entry); continue; }

      entry.group.position.set(wp.x, wp.y, wp.z);
      const meta = bodyMeta?.get(entry.bodyId);
      if (meta) entry.group.scale.setScalar(meta.instanceScale * entry.radius);

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
        }
      }
    }

    return new Set(activeIds);
  }

  function dispose() {
    surfaceGeo.dispose();
    for (const entry of pool) {
      entry.mat.dispose();
      entry.hitbox.geometry.dispose();
      entry.hitbox.material.dispose();
    }
  }

  return { update, container, dispose };
}
