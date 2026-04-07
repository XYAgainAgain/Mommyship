import * as THREE from 'three';
import { loadShaderPair } from './shaders.js';
import { createRng } from './rng.js';
import { parseMK } from './star-params.js';

const DETAIL_SEGMENTS = 64;
const DETAIL_ROWS = 48;
const MARKER_RADIUS = 2.5;
const ACTIVATE_DIST = 25;
const POOL_SIZE = 4;

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return h;
}

/* Bake shared sprite textures once — all pool entries reuse them */
function bakeGradientTexture(stops) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  for (const [pos, color] of stops) grad.addColorStop(pos, color);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(canvas);
}

/**
 * Creates the detail mesh manager for close-up star rendering.
 * Supports multiple concurrent detail meshes via a pool of POOL_SIZE entries.
 * @param {THREE.WebGLRenderer} renderer
 * @returns {{ update, container, dispose }}
 */
export async function createStarDetail(renderer) {
  const { vert, frag } = await loadShaderPair('star-detail');
  const surfaceGeo = new THREE.SphereGeometry(MARKER_RADIUS, DETAIL_SEGMENTS, DETAIL_ROWS);

  /* Shared sprite textures */
  const coronaTex = bakeGradientTexture([
    [0, 'rgba(255,255,255,0.9)'], [0.2, 'rgba(255,245,220,0.7)'],
    [0.45, 'rgba(255,220,180,0.35)'], [0.7, 'rgba(255,180,130,0.10)'],
    [1, 'rgba(255,150,100,0)'],
  ]);
  const haloTex = bakeGradientTexture([
    [0, 'rgba(255,240,210,0.20)'], [0.3, 'rgba(255,210,160,0.10)'],
    [0.6, 'rgba(255,180,130,0.04)'], [1, 'rgba(255,150,100,0)'],
  ]);

  /* Pool of detail mesh groups — each can render one star independently */
  const pool = [];
  for (let p = 0; p < POOL_SIZE; p++) {
    const mat = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      glslVersion: THREE.GLSL3,
      uniforms: {
        uSeed:               { value: 0 },
        uLowTemp:            { value: 5200 },
        uHighTemp:           { value: 6000 },
        uGranScale:          { value: 4.0 },
        uSpotAmp:            { value: 0.7 },
        uSlopeness:          { value: 1.0 },
        uEmissive:           { value: 0.8 },
        uSize:               { value: 1.0 },
        uBubbleAmp:          { value: 0.0 },
        uTime:               { value: 0 },
        uRotation:           { value: new THREE.Matrix3() },
        uAtmosphereColor:    { value: new THREE.Color('#ffeeaa') },
        uAtmosphereIntensity:{ value: 0.4 },
      },
    });

    const mesh = new THREE.Mesh(surfaceGeo, mat);
    mesh.scale.setScalar(0.87);

    const cMat = new THREE.SpriteMaterial({
      map: coronaTex, blending: THREE.AdditiveBlending,
      depthWrite: false, transparent: true, color: 0xffeeaa,
    });
    const corona = new THREE.Sprite(cMat);
    corona.scale.setScalar(MARKER_RADIUS * 2.2);
    corona.renderOrder = 4;

    const hMat = new THREE.SpriteMaterial({
      map: haloTex, blending: THREE.AdditiveBlending,
      depthWrite: false, transparent: true, color: 0xffeeaa,
    });
    const halo = new THREE.Sprite(hMat);
    halo.scale.setScalar(MARKER_RADIUS * 4.0);
    halo.renderOrder = 3;

    const group = new THREE.Group();
    group.add(halo);
    group.add(corona);
    group.add(mesh);
    group.visible = false;
    group.renderOrder = 5;

    pool.push({
      group, mat, mesh, coronaMat: cMat, haloMat: hMat,
      bodyId: null, radius: 1.0,
      rotAxis: new THREE.Vector3(0, 1, 0), rotSpeed: 0.1,
    });
  }

  /* Shared scratch objects for rotation math */
  const _rotQuat = new THREE.Quaternion();
  const _rotMat3 = new THREE.Matrix3();
  const _rotMat4 = new THREE.Matrix4();

  /* Container group holds all pool entries — add this to the scene */
  const container = new THREE.Group();
  for (const entry of pool) container.add(entry.group);

  let cachedStarIds = null;
  const activeIds = new Set();

  function activate(entry, bodyId, body) {
    const params = parseMK(body.spectralClass, body.visual?.size);
    const seed = hashString(bodyId);
    const u = entry.mat.uniforms;

    u.uSeed.value = seed;
    u.uLowTemp.value = params.lowTemp;
    u.uHighTemp.value = params.highTemp;
    u.uGranScale.value = params.granScale;
    u.uSpotAmp.value = params.spotAmp;
    u.uSlopeness.value = params.slopeness;
    u.uEmissive.value = params.emissive;
    u.uSize.value = params.radius;
    u.uBubbleAmp.value = params.bubbleAmp;
    u.uAtmosphereColor.value.set(params.atmoColor);
    u.uAtmosphereIntensity.value = params.lumClass === 'V' ? 0.4 : 0.6;

    entry.coronaMat.color.set(params.atmoColor);
    entry.haloMat.color.set(params.atmoColor);
    entry.radius = params.radius;

    const rng = createRng(seed + 555);
    const tiltRad = (5 + rng.next() * 25) * Math.PI / 180;
    const azimuth = rng.next() * Math.PI * 2;
    entry.rotAxis.set(
      Math.sin(tiltRad) * Math.cos(azimuth),
      Math.cos(tiltRad),
      Math.sin(tiltRad) * Math.sin(azimuth)
    ).normalize();
    entry.rotSpeed = 0.05 + rng.next() * 0.15;

    entry.bodyId = bodyId;
    entry.group.userData.bodyId = bodyId;
    entry.group.visible = true;
  }

  function deactivate(entry) {
    entry.bodyId = null;
    entry.group.userData.bodyId = null;
    entry.group.visible = false;
  }

  /* Find all stars in the same system as targetId (handles nested hierarchies) */
  function getSystemStars(targetId, bodies) {
    let rootId = targetId;
    while (bodies[rootId]?.parentId && bodies[bodies[rootId].parentId]?.type === 'star') {
      rootId = bodies[rootId].parentId;
    }
    if (!cachedStarIds) {
      cachedStarIds = Object.keys(bodies).filter(id => bodies[id].type === 'star');
    }
    /* BFS from root to find all descendant stars */
    const family = [rootId];
    const queue = [rootId];
    while (queue.length > 0) {
      const parentId = queue.shift();
      for (const id of cachedStarIds) {
        if (bodies[id].parentId === parentId && !family.includes(id)) {
          family.push(id);
          queue.push(id);
        }
      }
    }
    return family;
  }

  /**
   * Per-frame update — activates detail for all stars in the nearest system.
   * @returns {Set<string>} active body IDs (caller hides their instanced versions)
   */
  function update(trackedId, cameraPos, bodyWorldPos, galaxyData, rotationTime, bodyMeta) {
    let anchorId = null;

    /* If tracking a star, use it as anchor */
    if (trackedId && galaxyData.bodies[trackedId]?.type === 'star') {
      anchorId = trackedId;
    }

    /* Otherwise find closest star by proximity */
    if (!anchorId) {
      if (!cachedStarIds) {
        cachedStarIds = Object.keys(galaxyData.bodies).filter(id => galaxyData.bodies[id].type === 'star');
      }
      let closestDistSq = ACTIVATE_DIST * ACTIVATE_DIST;
      for (const id of cachedStarIds) {
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

    /* Determine which stars need detail */
    const targetIds = anchorId
      ? getSystemStars(anchorId, galaxyData.bodies)
      : [];

    /* Build set of desired IDs for fast lookup */
    const desired = new Set(targetIds);

    /* Deactivate pool entries no longer needed */
    for (const entry of pool) {
      if (entry.bodyId && !desired.has(entry.bodyId)) {
        activeIds.delete(entry.bodyId);
        deactivate(entry);
      }
    }

    /* Activate new stars from the pool */
    for (const id of targetIds) {
      if (activeIds.has(id)) continue;
      const freeEntry = pool.find(e => !e.bodyId);
      if (!freeEntry) break;
      activate(freeEntry, id, galaxyData.bodies[id]);
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

      _rotQuat.setFromAxisAngle(entry.rotAxis, entry.rotSpeed * rotationTime);
      _rotMat4.makeRotationFromQuaternion(_rotQuat);
      _rotMat3.setFromMatrix4(_rotMat4);
      entry.mat.uniforms.uRotation.value.copy(_rotMat3);
      entry.mat.uniforms.uTime.value = rotationTime;
    }

    return new Set(activeIds);
  }

  function dispose() {
    surfaceGeo.dispose();
    coronaTex.dispose();
    haloTex.dispose();
    for (const entry of pool) {
      entry.mat.dispose();
      entry.coronaMat.dispose();
      entry.haloMat.dispose();
    }
  }

  return { update, container, dispose };
}
