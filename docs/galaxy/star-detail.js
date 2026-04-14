import * as THREE from 'three';
import { MeshBasicNodeMaterial, NodeMaterial } from 'three/webgpu';
import { uniform, float, vec3, mat3 } from 'three/tsl';
import { main as starDetailVert, uTime as vertUTime } from './tsl/vert/star-detail.tsl.js';
import { main as starDetailFrag, uTime as fragUTime } from './tsl/frag/star-detail.tsl.js';
import { main as torusVert, uTime as torusVertUTime } from './tsl/vert/pulsar-torus.tsl.js';
import { main as torusFrag, uTime as torusFragUTime } from './tsl/frag/pulsar-torus.tsl.js';
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
 * @param {THREE.WebGPURenderer} renderer
 * @returns {{ update, container, dispose }}
 */
export async function createStarDetail(renderer) {
  const surfaceGeo = new THREE.SphereGeometry(MARKER_RADIUS, DETAIL_SEGMENTS, DETAIL_ROWS);
  /* Fat torus: r just under R so inner edge intersects the star at the poles.
     Ring in vertical plane (rotated 90 deg X) so lobes extend along rotation axis. */
  const torusGeo = new THREE.TorusGeometry(4, 3.95, 32, 64);

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
  /* Pulsar outer glow — blue-white halo */
  const pulsarGlowTex = bakeGradientTexture([
    [0, 'rgba(200,230,255,1.0)'], [0.12, 'rgba(170,220,255,0.85)'],
    [0.35, 'rgba(140,200,255,0.4)'], [0.6, 'rgba(120,180,255,0.12)'],
    [1, 'rgba(100,160,255,0)'],
  ]);
  /* Pulsar inner core — tight white-hot center */
  const pulsarCoreTex = bakeGradientTexture([
    [0, 'rgba(255,255,255,1.0)'], [0.2, 'rgba(240,248,255,0.9)'],
    [0.5, 'rgba(220,240,255,0.3)'], [0.75, 'rgba(200,230,255,0.05)'],
    [1, 'rgba(200,230,255,0)'],
  ]);

  /* Pool of detail mesh groups — each can render one star independently */
  const pool = [];
  for (let p = 0; p < POOL_SIZE; p++) {
    /* Per-instance TSL uniform nodes for surface shader */
    const pSeed = uniform(float(0));
    const pLowTemp = uniform(float(5200));
    const pHighTemp = uniform(float(6000));
    const pGranScale = uniform(float(4.0));
    const pSpotAmp = uniform(float(0.7));
    const pSize = uniform(float(1.0));
    const pSlopeness = uniform(float(1.0));
    const pEmissive = uniform(float(0.8));
    const pBubbleAmp = uniform(float(0.0));
    const pRotation = uniform(mat3());
    const pAtmoColor = uniform(vec3(1.0, 0.93, 0.67));
    const pAtmoIntensity = uniform(float(0.4));

    const mat = new NodeMaterial();
    mat.positionNode = starDetailVert(pSeed, pGranScale, pSize, pBubbleAmp, pRotation);
    mat.fragmentNode = starDetailFrag(pSeed, pLowTemp, pHighTemp, pGranScale, pSpotAmp, pSize, pSlopeness, pEmissive, pRotation, pAtmoColor, pAtmoIntensity);

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

    /* Per-instance TSL uniform nodes for pulsar torus */
    const pTorusSeed = uniform(float(0));
    const pTorusColor = uniform(vec3(0.67, 0.87, 1.0));
    const pTorusIntensity = uniform(float(2.0));

    const torusMat = new NodeMaterial();
    torusMat.positionNode = torusVert(pTorusSeed);
    torusMat.fragmentNode = torusFrag(pTorusSeed, pTorusColor, pTorusIntensity);
    torusMat.blending = THREE.AdditiveBlending;
    torusMat.depthWrite = false;
    torusMat.transparent = true;
    torusMat.side = THREE.DoubleSide;

    const torusMesh = new THREE.Mesh(torusGeo, torusMat);
    torusMesh.rotation.x = Math.PI / 2;
    torusMesh.visible = false;
    torusMesh.renderOrder = 4;

    const pulsarGlowMat = new THREE.SpriteMaterial({
      map: pulsarGlowTex, depthWrite: false, transparent: true,
      color: 0xaaddff,
    });
    const pulsarGlow = new THREE.Sprite(pulsarGlowMat);
    pulsarGlow.scale.setScalar(MARKER_RADIUS * 6.0);
    pulsarGlow.visible = false;
    pulsarGlow.renderOrder = 4;

    const pulsarCoreMat = new THREE.SpriteMaterial({
      map: pulsarCoreTex, depthWrite: false, transparent: true,
      color: 0xffffff,
    });
    const pulsarCore = new THREE.Sprite(pulsarCoreMat);
    pulsarCore.scale.setScalar(MARKER_RADIUS * 2.5);
    pulsarCore.visible = false;
    pulsarCore.renderOrder = 5;

    /* Only the surface mesh should intercept raycasts */
    corona.raycast = () => {};
    halo.raycast = () => {};
    torusMesh.raycast = () => {};
    pulsarGlow.raycast = () => {};
    pulsarCore.raycast = () => {};

    const group = new THREE.Group();
    group.add(halo);
    group.add(corona);
    group.add(mesh);
    group.add(torusMesh);
    group.add(pulsarGlow);
    group.add(pulsarCore);
    group.visible = false;
    group.renderOrder = 5;

    pool.push({
      group, mat, mesh, corona, halo, coronaMat: cMat, haloMat: hMat,
      torusMesh, torusMat, pulsarGlow, pulsarGlowMat, pulsarCore, pulsarCoreMat,
      bodyId: null, radius: 1.0, isPulsar: false, isWolfRayet: false,
      rotAxis: new THREE.Vector3(0, 1, 0), rotSpeed: 0.1,
      /* Per-instance uniform refs for direct .value access */
      pSeed, pLowTemp, pHighTemp, pGranScale, pSpotAmp, pSize, pSlopeness,
      pEmissive, pBubbleAmp, pRotation, pAtmoColor, pAtmoIntensity,
      pTorusSeed, pTorusColor, pTorusIntensity,
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

    entry.pSeed.value = seed;
    entry.pLowTemp.value = params.lowTemp;
    entry.pHighTemp.value = params.highTemp;
    entry.pGranScale.value = params.granScale;
    entry.pSpotAmp.value = params.spotAmp;
    entry.pSlopeness.value = params.slopeness;
    entry.pEmissive.value = params.emissive;
    entry.pSize.value = params.radius;
    entry.pBubbleAmp.value = params.bubbleAmp;
    const _c = new THREE.Color(params.atmoColor);
    entry.pAtmoColor.value.set(_c.r, _c.g, _c.b);
    entry.pAtmoIntensity.value = params.lumClass === 'V' ? 0.4 : 0.6;

    entry.coronaMat.color.set(params.atmoColor);
    entry.haloMat.color.set(params.atmoColor);
    entry.radius = params.radius;

    /* Exotic type flags */
    entry.isPulsar = !!params.isPulsar;
    entry.isWolfRayet = !!params.isWolfRayet;

    /* Pulsar: show dipole field torus + steady glow + white core */
    entry.torusMesh.visible = entry.isPulsar;
    entry.pulsarGlow.visible = entry.isPulsar;
    entry.pulsarCore.visible = entry.isPulsar;
    if (entry.isPulsar) {
      entry.pTorusSeed.value = seed;
      _c.set(params.atmoColor);
      entry.pTorusColor.value.set(_c.r, _c.g, _c.b);
    }

    /* Wolf-Rayet: boosted corona/halo opacity for enlarged glow */
    if (entry.isWolfRayet) {
      entry.coronaMat.opacity = 0.9;
      entry.haloMat.opacity = 0.6;
    }

    /* T Tauri: enhanced atmosphere for accretion envelope */
    if (params.isTTauri) entry.pAtmoIntensity.value = 0.7;

    const rng = createRng(seed + 555);
    const tiltRad = (5 + rng.next() * 25) * Math.PI / 180;
    const azimuth = rng.next() * Math.PI * 2;
    entry.rotAxis.set(
      Math.sin(tiltRad) * Math.cos(azimuth),
      Math.cos(tiltRad),
      Math.sin(tiltRad) * Math.sin(azimuth)
    ).normalize();
    entry.rotSpeed = entry.isPulsar ? 55.0 : 0.05 + rng.next() * 0.15;

    entry.bodyId = bodyId;
    entry.group.userData.bodyId = bodyId;
    entry.group.visible = true;
  }

  function deactivate(entry) {
    entry.bodyId = null;
    entry.group.userData.bodyId = null;
    entry.group.visible = false;
    entry.torusMesh.visible = false;
    entry.pulsarGlow.visible = false;
    entry.pulsarCore.visible = false;
    entry.isPulsar = false;
    entry.isWolfRayet = false;
    entry.coronaMat.opacity = 1.0;
    entry.haloMat.opacity = 1.0;
    entry.corona.scale.setScalar(MARKER_RADIUS * 2.2);
    entry.halo.scale.setScalar(MARKER_RADIUS * 4.0);
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
    /* Set shared uTime across all materials */
    vertUTime.value = rotationTime;
    fragUTime.value = rotationTime;
    torusVertUTime.value = rotationTime;
    torusFragUTime.value = rotationTime;

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
      entry.pRotation.value.copy(_rotMat3);

      /* Pulsar field torus: counter-scale + wobble around vertical axis */
      if (entry.isPulsar) {
        const gs = entry.group.scale.x;
        if (gs > 0) entry.torusMesh.scale.setScalar(1.0 / gs);
        const wobble = Math.sin(rotationTime * 0.25) * 0.08;
        entry.torusMesh.rotation.set(Math.PI / 2, wobble, 0);
      }

      /* Wolf-Rayet: breathing pulsation on enlarged corona/halo */
      if (entry.isWolfRayet) {
        const pulse = 1.0 + 0.15 * Math.sin(rotationTime * 4.0);
        entry.corona.scale.setScalar(MARKER_RADIUS * 5.5 * pulse);
        entry.halo.scale.setScalar(MARKER_RADIUS * 8.0 * pulse);
      }
    }

    return new Set(activeIds);
  }

  function dispose() {
    surfaceGeo.dispose();
    torusGeo.dispose();
    coronaTex.dispose();
    haloTex.dispose();
    pulsarGlowTex.dispose();
    pulsarCoreTex.dispose();
    for (const entry of pool) {
      entry.mat.dispose();
      entry.coronaMat.dispose();
      entry.haloMat.dispose();
      entry.torusMat.dispose();
      entry.pulsarGlowMat.dispose();
      entry.pulsarCoreMat.dispose();
    }
  }

  /* Invalidate one star — force re-activation with fresh params */
  function invalidateBody(bodyId) {
    for (const entry of pool) {
      if (entry.bodyId === bodyId) { deactivate(entry); break; }
    }
    activeIds.delete(bodyId);
  }

  return { update, container, dispose, invalidateBody };
}
