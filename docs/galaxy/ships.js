import * as THREE from 'three';
import { MeshBasicNodeMaterial } from 'three/webgpu';
import {
  attribute, cameraPosition, cos, cross, Discard, dot, Fn, float, If, length, max, min, mix,
  normalize, positionLocal, sin, smoothstep, step, texture, uniform, uv, varying,
  varyingProperty, vec2, vec3, vec4
} from 'three/tsl';
import { createRng } from './rng.js';

/* Asset naming: exportAtlas downloads shipyard-hull-atlas.png, -engine-atlas.png, and
   -atlas-meta.json (browser dup-download adds -1/-2). Loader anchors on the meta trio, probing suffixes until 404 (empty folder = clean no-op). */
const SHIPS_DIR = 'galaxy/textures/ships/';
const META_BASE = 'shipyard-atlas-meta';
const HULL_BASE = 'shipyard-hull-atlas';
const ENGINE_BASE = 'shipyard-engine-atlas';
const CUSTOM_MANIFEST = SHIPS_DIR + 'custom/manifest.json';
const MAX_SHEETS = 32;

/* Tuned traffic constants (shipyard-settings.json `traffic` block). Lab units are
   screen-space px; WORLD_SCALE ports the spatial ones to galaxy world units (lab fixture
   scene ~1000px, galaxy lanes ~1/5 that). Ship pixel scale + core falloff are galaxy-native. */
const GLOBAL_RATE = 3.0;    // hyperlane rate only (shuttles have their own economics)
const CLASS_MIX_CURVE = 0.15;
const JUMP_SHARPNESS = 9.0;
const FLASH_INTENSITY = 0.2;
const DWELL_MIN = 1.0, DWELL_MAX = 30.0;
const CUSTOM_RATE = 0.01;
const WORLD_SCALE = 0.2;
const SPEED_MIN = 50 * WORLD_SCALE, SPEED_MAX = 200 * WORLD_SCALE;
const LANE_HALF = (21 * WORLD_SCALE) / 2;      // halved from the lab's 42: hug the drawn ribbon
const LANE_SCATTER = 20 * WORLD_SCALE;         // gaussian lateral scatter
const MAX_CORE_DIST = 420;                     // core-distance falloff span (root stars max ~390)
const SHIP_PIXEL_SCALE = 0.015;                // atlas px → world size; primary size-tuning knob
const MAX_PER_LANE = 60;
const TRAFFIC_SEED = 0x5f3d;
const CLASS_IDS = ['C-0', 'C-I', 'C-II', 'C-III', 'C-IV', 'C-V'];

const SHEET_CAPACITY = 600;    // per-sheet instance ceiling
const SHIP_STRETCH = 0.6;      // hull elongation at full jump speed (1 + this at plateau)
const TRAIL_LEN = 6.0;         // trail-quad length at full speed, in sprite widths
const TRAIL_OPACITY = 0.85;    // additive strength at the nozzle end of the trail
/* Star avoidance sphere = MARKER_RADIUS (2.5, mirrors systems.js) × star instanceScale × K.
   Ships arc over the limb instead of flying through the photosphere. */
const STAR_MARKER_R = 2.5;
const STAR_AVOID_K = 2.0;
const SHUTTLE_TRAFFIC_MIN = 0.05;  // below this system traffic mult, no local shuttles at all
const DERELICT_SPIN_MIN = 0.03, DERELICT_SPIN_MAX = 0.1;  // rad/s — sluggish tumble, ~1–3 min/rev
const UV_INSET = 0.5;          // half-texel guard so NearestFilter can't grab a neighbour cell
const LIGHTMAP_STRENGTH = 0.5; // lerp flat-grey ↔ lightmap-lit
const ALPHA_CUTOFF = 0.35;

/* In-system shuttles + free traders. Both live in a reserved slot block on one
   designated "off-lane" sheet, so capacity accounting stays a single number (see pickOffLaneHandle). */
const SHUTTLE_POOL_SIZE = 36;          // recycled across whichever system is camera-near, not per-system
const SHUTTLE_TRAVEL_MIN = 6, SHUTTLE_TRAVEL_MAX = 14;   // seconds, fixed nominal hop duration
const SHUTTLE_DWELL_MIN = 1, SHUTTLE_DWELL_MAX = 4;      // short dwell, they're not gas stations either
const SHUTTLE_EASE_K = 3.0;            // gentler than lane JUMP_SHARPNESS — no hard warp plateau
const SHUTTLE_SEED = 0x53d1;

const TRADER_COUNT = 69;
const TRADER_SPEED_MIN = SPEED_MIN * 0.2, TRADER_SPEED_MAX = SPEED_MIN * 0.4;  // well under lane speed
const TRADER_DWELL_MIN = 20, TRADER_DWELL_MAX = 60;      // long-haul, long dwell
const TRADER_EASE_K = 6.0;
const TRADER_SEED = 0x7a1e;
/* Bow away from the chord's own closest approach to the SMBH, not the midpoint's bearing
   (near-dead-center chords have no stable midpoint direction). BOW_SAFETY compensates a
   quadratic bezier only realizing ~half the control offset at its own closest point. */
const BOW_MARGIN = 40, BOW_FLAT = 15, BOW_SAFETY = 2.2;

const OFFLANE_RESERVE = SHUTTLE_POOL_SIZE + TRADER_COUNT;  // slots reserved on the off-lane sheet

/* Peak of easeJump's ds/du for a given sharpness; normalizes instantaneous speed to [0,1]. */
const easePeak = (k) => (k < 0.05 ? 1 : k / (2 * Math.tanh(k * 0.5)));
const JUMP_PEAK = easePeak(JUMP_SHARPNESS);
const SHUTTLE_PEAK = easePeak(SHUTTLE_EASE_K);
const TRADER_PEAK = easePeak(TRADER_EASE_K);

/* Derelicts. Locations are runtime-randomized each load by design, so a per-load rng,
   NOT the deterministic traffic seed. */
const TAU = Math.PI * 2;
const DERELICTS_DIR = SHIPS_DIR + 'derelicts/';
const DERELICT_COUNT = 420;
const DERELICT_PARKED = 294;            // ~70% embedded in the asteroid belt
const DERELICT_ORBITERS = 42;           // ~10% orbiting isolated-system bodies (rest drift)
const DERELICT_GREY_MIN = 0.35, DERELICT_GREY_MAX = 0.6;  // darker than traffic's 0.55–1.0
/* Wrecks sit beside 4-unit boulders; at raw ship scale they vanish among the rocks. */
const DERELICT_SCALE_MIN = 0.8, DERELICT_SCALE_MAX = 2;  // per-wreck random size spread
const DERELICT_DETAIL_ALPHA = 0.3;      // dimmed rust/window/cold-engine composite over the hull
/* Asteroid belt annulus (mirrors asteroids.js consts; that file is read-only, duplicated by intent). */
const BELT_INNER = 100, BELT_OUTER = 220, BELT_PEAK_LO = 140, BELT_PEAK_HI = 180;
const PARK_DRIFT_AMP = 0.3;             // micro-wander, well under an asteroid width
const BH_EXCLUSION = 35;                // SMBH keep-out; drifters start clear of it
const DRIFT_MIN_R = BH_EXCLUSION + 20, DRIFT_MAX_R = 400;
const ORBIT_R_MIN = 2, ORBIT_R_MAX = 5;

/* Packing, 7 of 8 vertex buffers (plane position+uv eat 2): aPos [xyz, scale],
   aSprite [UV window], aTint [grey, isCustom, flash, aspect H/W], aMotion [unit velocity
   dir xyz, w = speed 0–1 moving OR spin rad when dir zero], aTrailV [nozzle-row V, −1 = probe]. */

const uLightmapStrength = uniform(float(LIGHTMAP_STRENGTH));

/* Writers assigned in the vertex Fn; readers reconnect by name in the fragment Fns
   (the two Fns are separate node graphs, so the varyingProperty read side is required). */
const vSpriteUV = varying(vec2(), 'vShipSpriteUV');
const vWorldXZ = varying(vec2(), 'vShipWorldXZ');
const vGrey = varying(float(), 'vShipGrey');
const vFlags = varying(float(), 'vShipFlags');
const vFlash = varying(float(), 'vShipFlash');
const vTrail = varying(float(), 'vShipTrail');
const vTrailSpan = varying(float(), 'vShipTrailSpan');
const rSpriteUV = varyingProperty('vec2', 'vShipSpriteUV');
const rWorldXZ = varyingProperty('vec2', 'vShipWorldXZ');
const rGrey = varyingProperty('float', 'vShipGrey');
const rFlags = varyingProperty('float', 'vShipFlags');
const rFlash = varyingProperty('float', 'vShipFlash');
const rTrail = varyingProperty('float', 'vShipTrail');
const rTrailSpan = varyingProperty('float', 'vShipTrailSpan');

let sceneRef = null;
let hullMeshes = [];
let engineMeshes = [];
let instanceHandles = [];
const sharedPlane = new THREE.PlaneGeometry(1, 1);

let sysApi = null;
let trafficShips = [];
let trafficReady = false;
let shipsVisible = true;

/* Derelicts live on their own hull-only handles (no engine mesh, no lane traffic),
   kept out of instanceHandles so buildTraffic never spawns lane ships onto them. */
let derelictHandles = [];
let derelictShips = [];
let derelictReady = false;

/* Off-lane populations (shuttles + traders) share one regular sheet's reserved slot
   block — see pickOffLaneHandle. Shuttle pool state resets whenever the LOD focus changes. */
let offLaneHandle = null;
let shuttlePool = [];
let shuttleBodyIds = [];
let shuttleFocusRoot = null;
let shuttleActive = false;
let traderShips = [];
let tradersReady = false;

/* Camera-facing billboard, cloned from asteroid.tsl.js:57-62. aPos is already world-space
   (canonical→rotated conversion already applied), so no rotation here. Hull AND engine share this exact transform — any divergence detaches the detail layer. */
const shipVert = /*@__PURE__*/ Fn(() => {
  const aPos = attribute('aPos', 'vec4');
  const aSprite = attribute('aSprite', 'vec4');
  const aTint = attribute('aTint', 'vec4');
  const aMotion = attribute('aMotion', 'vec4');

  const worldPos = aPos.xyz.toVar();
  const scale = aPos.w;
  const aspect = aTint.w;   // sprite H/W; keeps non-square hulls from squashing on the unit quad
  /* Guarded: camera exactly at a ship (pre-first-update zeroed slots) zeroes this vector,
     and bare normalize() would NaN-vanish every spherical-billboard ship. */
  const toCam = cameraPosition.sub(worldPos).toVar();
  const toCamera = toCam.div(max(length(toCam), 1e-5)).toVar();
  const camCross = cross(vec3(0, 1, 0), toCamera).toVar();
  const camRight = camCross.div(max(length(camCross), 1e-5)).toVar();
  const camUp = cross(toCamera, camRight);

  const p0 = vec2(positionLocal.x, positionLocal.y.mul(aspect)).toVar();

  /* Flying ships use a CYLINDRICAL billboard: the spine locks to the world motion axis (nose
     at the destination) and only swivels around it to face camera — the air-freshener-on-fishing-line model. Derelicts (zero dir, w = spin) stay spherical. */
  const m = aMotion.xyz.toVar();
  const mLen = length(m).toVar();
  const hasDir = smoothstep(0.1, 0.5, mLen).toVar();
  const axis = m.div(max(mLen, 1e-5)).toVar();
  const toCam = cameraPosition.sub(worldPos).toVar();
  const crossAT = cross(axis, toCam).toVar();
  const cLen = length(crossAT).toVar();
  const rightA = crossAT.div(max(cLen, 1e-5)).toVar();

  /* Head-on, the camera-swivel basis collapses; blend to a world-up basis that KEEPS the
     spine on the route axis — ships never turn to face the camera, they just stop swiveling. */
  const axialOK = smoothstep(0.02, 0.08, cLen.div(max(length(toCam), 1e-5))).toVar();
  const rightUp = cross(axis, vec3(0.0, 1.0, 0.0)).toVar();
  const rightSafe = rightUp.div(max(length(rightUp), 1e-4)).toVar();
  /* Guarded normalize: for derelicts (zero dir) both bases are zero vectors, and a bare
     normalize() NaNs — which mix(a, NaN, 0) does NOT rescue, nuking every vertex. */
  const rightMix = mix(rightSafe, rightA, axialOK).toVar();
  const rightUsed = rightMix.div(max(length(rightMix), 1e-5)).toVar();

  const speedN = aMotion.w.mul(hasDir).toVar();
  const stretch = speedN.mul(SHIP_STRETCH).add(1.0);
  const offAxial = rightUsed.mul(p0.x).add(axis.mul(p0.y.mul(stretch)));

  const ca = cos(aMotion.w), sa = sin(aMotion.w);
  const pSpin = vec2(p0.x.mul(ca).sub(p0.y.mul(sa)), p0.x.mul(sa).add(p0.y.mul(ca)));
  const offSpherical = camRight.mul(pSpin.x).add(camUp.mul(pSpin.y));

  const billboarded = worldPos.add(mix(offSpherical, offAxial, hasDir).mul(scale));

  vSpriteUV.assign(aSprite.xy.add(uv().mul(aSprite.zw)));
  vWorldXZ.assign(worldPos.xz);
  vGrey.assign(aTint.x);
  vFlags.assign(aTint.y);
  vFlash.assign(aTint.z);
  return billboarded;
});

/* Trail: a separate quad hung off the ship's stretched tail, streaking backward along the
   motion axis in the same cylindrical frame as the hull. Its UVs sample the engine sheet's nozzle band, so each engine cluster leaves its own colored streak. */
const trailVert = /*@__PURE__*/ Fn(() => {
  const aPos = attribute('aPos', 'vec4');
  const aSprite = attribute('aSprite', 'vec4');
  const aTint = attribute('aTint', 'vec4');
  const aMotion = attribute('aMotion', 'vec4');

  const worldPos = aPos.xyz.toVar();
  const scale = aPos.w;
  const aspect = aTint.w;

  const m = aMotion.xyz.toVar();
  const mLen = length(m).toVar();
  const hasDir = smoothstep(0.1, 0.5, mLen).toVar();
  const axis = m.div(max(mLen, 1e-5)).toVar();
  const toCam = cameraPosition.sub(worldPos).toVar();
  const crossAT = cross(axis, toCam).toVar();
  const cLen = length(crossAT).toVar();
  const axialOK = smoothstep(0.02, 0.08, cLen.div(max(length(toCam), 1e-5))).toVar();
  const rightA = crossAT.div(max(cLen, 1e-5)).toVar();

  /* Head-on the trail points at/away from the camera anyway, so it SHRINKS (sel) rather
     than blending bases — a basis blend here twisted the ribbon into bent smears. */
  const sel = hasDir.mul(axialOK).toVar();
  const speedN = aMotion.w.mul(sel).toVar();
  const t = uv().y.oneMinus().toVar();   // 0 at the ship's tail, 1 at the trail's far end
  const tailStart = float(0.5).mul(aspect).mul(speedN.mul(SHIP_STRETCH).add(1.0)).mul(sel);
  const lenT = speedN.mul(TRAIL_LEN);
  const width = float(1.0).sub(t.mul(0.6)).mul(sel);

  const off = rightA.mul(positionLocal.x.mul(width))
    .sub(axis.mul(tailStart.add(t.mul(lenT))));
  const billboarded = worldPos.add(off.mul(scale));

  // Exact per-sprite nozzle row when the atlas meta provides it; legacy probe band otherwise.
  const aTrailV = attribute('aTrailV', 'float');
  const vBand = mix(aSprite.y.add(aSprite.w.mul(0.05)), aTrailV, step(0.0, aTrailV));
  vSpriteUV.assign(vec2(aSprite.x.add(uv().x.mul(aSprite.z)), vBand));
  vTrailSpan.assign(aSprite.w);
  vTrail.assign(t);
  return billboarded;
});

/* Sample the nozzle band; probe upward twice for sprites without exact bounds, skipping
   near-black outline pixels (they add nothing to an additive trail). */
const trailFrag = /*@__PURE__*/ Fn(([engineTexNode]) => {
  const u = rSpriteUV.x;
  const v0 = rSpriteUV.y;
  const c = engineTexNode.sample(rSpriteUV).toVar();
  const dud = () => c.a.lessThan(ALPHA_CUTOFF).or(dot(c.rgb, vec3(1.0, 1.0, 1.0)).lessThan(0.25));
  If(dud(), () => { c.assign(engineTexNode.sample(vec2(u, v0.add(rTrailSpan.mul(0.09))))); });
  If(dud(), () => { c.assign(engineTexNode.sample(vec2(u, v0.add(rTrailSpan.mul(0.18))))); });
  If(dud(), () => { Discard(); });
  const fall = rTrail.oneMinus();
  return vec4(c.rgb.mul(fall.mul(fall)).mul(TRAIL_OPACITY), 1.0);
});

/* Hull: per-ship grey × in-shader galaxy-lightmap at live world XZ (asteroid.frag block).
   Customs (vFlags=1) never darken below authored color, only brighten in lit zones. */
const shipHullFrag = /*@__PURE__*/ Fn(([hullTexNode, lightmapNode]) => {
  const tex = hullTexNode.sample(rSpriteUV).toVar();
  If(tex.a.lessThan(ALPHA_CUTOFF), () => { Discard(); });

  const lmUV = rWorldXZ.div(1000.0).add(0.5);
  const illum = lightmapNode.sample(lmUV).rgb;
  const illumBright = dot(illum, vec3(0.299, 0.587, 0.114));
  const baseTint = vec3(rGrey, rGrey, rGrey);
  const litTint = mix(baseTint.mul(0.4), illum.add(baseTint.mul(0.15)), smoothstep(0.02, 0.15, illumBright));
  const regularTint = mix(baseTint, litTint, uLightmapStrength);
  const customTint = max(vec3(1.0, 1.0, 1.0), illum.add(0.15));
  const finalTint = mix(regularTint, customTint, rFlags);
  const lit = tex.rgb.mul(finalTint).add(vec3(rFlash, rFlash, rFlash));
  return vec4(lit, 1.0);
});

/* Engine/detail layer: additive, never tinted, never lightmapped. The lab bakes a glow
   layer too but exportAtlas ships only hull+engine, so the engine sheet IS the bloom source. */
const shipEngineFrag = /*@__PURE__*/ Fn(([engineTexNode]) => {
  const tex = engineTexNode.sample(rSpriteUV).toVar();
  If(tex.a.lessThan(ALPHA_CUTOFF), () => { Discard(); });
  return vec4(tex.rgb, 1.0);
});

async function probeJSON(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function texFromImage(img) {
  const tex = new THREE.Texture(img);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
}

/* Atlas cell → UV window. flipY (TextureLoader/Texture default true) puts image-top at v=1,
   so a ship spanning image rows [py0, py0+shipH] flips into [vBot, vTop]. */
function computeWindow(meta, size, classId, i) {
  const c = meta.classes[classId];
  const pad = meta.pad || 0;
  const px0 = pad + i * (c.shipW + pad);
  const py0 = c.rowY[0];
  const W = size.w, H = size.h;
  const uBase = (px0 + UV_INSET) / W;
  const uSpan = (c.shipW - 2 * UV_INSET) / W;
  const vTop = 1 - (py0 + UV_INSET) / H;
  const vBot = 1 - (py0 + c.shipH - UV_INSET) / H;
  return [uBase, vBot, uSpan, vTop - vBot];
}

/* Custom PNGs pack into their own runtime canvas atlas laid out left-to-right. */
async function loadCustomSheet() {
  const manifest = await probeJSON(CUSTOM_MANIFEST);
  const names = manifest?.ships;
  if (!Array.isArray(names) || names.length === 0) return null;

  const imgs = [];
  for (const name of names) {
    try { imgs.push(await loadImage(SHIPS_DIR + 'custom/' + name)); }
    catch { console.warn('ships: custom image failed to load:', name); }
  }
  if (imgs.length === 0) return null;

  const pad = 1;
  const H = imgs.reduce((m, im) => Math.max(m, im.height), 0) + pad * 2;
  const W = imgs.reduce((a, im) => a + im.width + pad, pad);
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const windows = [];
  let x = pad;
  for (const im of imgs) {
    ctx.drawImage(im, x, pad);
    const uBase = (x + UV_INSET) / W;
    const uSpan = (im.width - 2 * UV_INSET) / W;
    const vTop = 1 - (pad + UV_INSET) / H;
    const vBot = 1 - (pad + im.height - UV_INSET) / H;
    windows.push([uBase, vBot, uSpan, vTop - vBot]);
    x += im.width + pad;
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;

  return { hullTex: tex, engineTex: null, isCustom: true, size: { w: W, h: H }, customWindows: windows };
}

function buildInstancedGeometry() {
  const g = new THREE.InstancedBufferGeometry();
  g.index = sharedPlane.index;
  g.attributes.position = sharedPlane.attributes.position;
  g.attributes.uv = sharedPlane.attributes.uv;
  return g;
}

/* One hull InstancedMesh (+ engine mesh if the sheet has an engine texture) per atlas sheet;
   extra draw calls beat a sampler2DArray (r184 WGSL codegen bug). Each geometry gets its OWN
   attribute objects — sharing one across geometries ghost-lags the engine overlay a frame behind the hull. */
function buildSheetMeshes(sheet, lightmap) {
  const cap = SHEET_CAPACITY;
  const posArr = new Float32Array(cap * 4);
  const spriteArr = new Float32Array(cap * 4);
  const tintArr = new Float32Array(cap * 4);
  const motionArr = new Float32Array(cap * 4);
  const trailArr = new Float32Array(cap);   // per-sprite exact nozzle-row V; -1 = probe fallback
  trailArr.fill(-1);

  const posAttrs = [], spriteAttrs = [], tintAttrs = [], motionAttrs = [], trailAttrs = [];
  const attach = (geo) => {
    const mk = (arr, n) => {
      const a = new THREE.InstancedBufferAttribute(arr, n);
      a.setUsage(THREE.DynamicDrawUsage);
      return a;
    };
    const p = mk(posArr, 4), s = mk(spriteArr, 4), t = mk(tintArr, 4), m = mk(motionArr, 4), tr = mk(trailArr, 1);
    geo.setAttribute('aPos', p);
    geo.setAttribute('aSprite', s);
    geo.setAttribute('aTint', t);
    geo.setAttribute('aMotion', m);
    geo.setAttribute('aTrailV', tr);
    posAttrs.push(p); spriteAttrs.push(s); tintAttrs.push(t); motionAttrs.push(m); trailAttrs.push(tr);
  };

  const hullGeo = buildInstancedGeometry();
  attach(hullGeo);
  hullGeo.instanceCount = 0;

  const hullMat = new MeshBasicNodeMaterial();
  hullMat.positionNode = shipVert();
  hullMat.fragmentNode = shipHullFrag(texture(sheet.hullTex), texture(lightmap));
  hullMat.side = THREE.DoubleSide;
  hullMat.depthWrite = true;
  hullMat.depthTest = true;
  hullMat.transparent = false;
  hullMat.polygonOffset = true;
  hullMat.polygonOffsetFactor = 1;
  hullMat.polygonOffsetUnits = 1;

  const hullMesh = new THREE.Mesh(hullGeo, hullMat);
  hullMesh.frustumCulled = false;
  sceneRef.add(hullMesh);
  hullMeshes.push(hullMesh);

  let engineGeo = null;
  if (sheet.engineTex) {
    engineGeo = buildInstancedGeometry();
    attach(engineGeo);
    engineGeo.instanceCount = 0;

    const engineMat = new MeshBasicNodeMaterial();
    engineMat.positionNode = shipVert();
    engineMat.fragmentNode = shipEngineFrag(texture(sheet.engineTex));
    engineMat.side = THREE.DoubleSide;
    engineMat.depthWrite = false;
    engineMat.depthTest = true;
    engineMat.transparent = true;
    engineMat.blending = THREE.AdditiveBlending;

    const engineMesh = new THREE.Mesh(engineGeo, engineMat);
    engineMesh.frustumCulled = false;
    sceneRef.add(engineMesh);
    engineMeshes.push(engineMesh);

    // Trail quad rides the same instance data; degenerate (zero-area) when a ship is idle.
    const trailGeo = buildInstancedGeometry();
    attach(trailGeo);
    trailGeo.instanceCount = 0;

    const trailMat = new MeshBasicNodeMaterial();
    trailMat.positionNode = trailVert();
    trailMat.fragmentNode = trailFrag(texture(sheet.engineTex));
    trailMat.side = THREE.DoubleSide;
    trailMat.depthWrite = false;
    trailMat.depthTest = true;
    trailMat.transparent = true;
    trailMat.blending = THREE.AdditiveBlending;

    const trailMesh = new THREE.Mesh(trailGeo, trailMat);
    trailMesh.frustumCulled = false;
    sceneRef.add(trailMesh);
    engineMeshes.push(trailMesh);
    engineGeo.trailGeo = trailGeo;
  }

  const setCount = (n) => {
    hullGeo.instanceCount = n;
    if (engineGeo) {
      engineGeo.instanceCount = n;
      engineGeo.trailGeo.instanceCount = n;
    }
  };

  const mark = (list) => { for (const a of list) a.needsUpdate = true; };
  return {
    sheet, hullGeo, engineGeo, capacity: cap,
    posArr, spriteArr, tintArr, motionArr, trailArr, setCount,
    dirtyPos: () => mark(posAttrs),
    dirtySprite: () => { mark(spriteAttrs); mark(trailAttrs); },
    dirtyTint: () => mark(tintAttrs),
    dirtyMotion: () => mark(motionAttrs)
  };
}

/* Exact nozzle-row V from the atlas meta's per-sprite engine bounds (bottom pixel row of the
   engine box, atlas space, flipY). Returns -1 when the meta has no bounds — shader probes. */
function nozzleV(meta, size, classId, shipIdx) {
  const eb = meta.classes[classId]?.engineBounds?.[shipIdx];
  if (!eb) return -1;
  return 1 - (eb.y + eb.h - 0.5) / size.h;
}

const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
const lerp = (a, b, t) => a + (b - a) * t;
/* CPU-side; plain `smoothstep` would collide with the three/tsl import above. */
function smoothstepCPU(e0, e1, x) {
  const t = clamp((x - e0) / (e1 - e0 || 1e-6), 0, 1);
  return t * t * (3 - 2 * t);
}

/* Jump ease (ported from the lab): slow sublight ends, fast hyperspace plateau mid-lane.
   Scratch object, no per-frame allocation; e.v = ds/du drives the flash timing. */
const EASE = { s: 0, v: 1 };
const ROT = { x: 0, z: 0 };   // canonicalToRotatedInto scratch; valid until the next call
const ANC1 = { x: 0, y: 0, z: 0 }, ANC2 = { x: 0, y: 0, z: 0 };   // high-anchor scratch
const TURN_RATE = 6;          // 1/s exponential nose-turn smoothing; higher = snappier
let lastWt = 0;
let turnSmooth = 1;
function easeJump(u, k) {
  if (k < 0.05) { EASE.s = u; EASE.v = 1; return EASE; }
  const th = Math.tanh(k * 0.5), t = Math.tanh((u - 0.5) * k);
  EASE.s = 0.5 + t / (2 * th);
  EASE.v = k * (1 - t * t) / (2 * th);
  return EASE;
}

/* Busy lanes skew toward big freighters, rim lanes toward C-0/C-I (lab pickClassIdx). */
function pickClassIdx(laneBusy, rng) {
  const w = [];
  for (let c = 0; c < 6; c++) {
    const mix = lerp(1 - c / 5, c / 5, laneBusy);
    w[c] = Math.pow(Math.max(0.001, mix), CLASS_MIX_CURVE * 3 + 0.2);
  }
  const tot = w.reduce((a, b) => a + b, 0);
  let r = rng.next() * tot;
  for (let c = 0; c < 6; c++) { r -= w[c]; if (r <= 0) return c; }
  return 5;
}

/* GnG endpoint check on a resolved dock id. GnGs are gas stations — ships top off
   and leave, so their dwell is drastically shortened at draw time. */
function isGnG(id) {
  const b = sysApi.getData().bodies[id];
  return !!b && id.startsWith('gas-n-gripe') && b.type === 'station';
}

/* Ships NEVER dock at stars. Per system: dock = outermost station, else outermost planet/moon.
   Lane traffic needs a station dock or ≥2 dockables (lone-body and NJ-12-style deathtrap systems get traders only); a standalone station is always lane-valid. */
let dockTarget = new Map();
let dockCount = new Map();
let starAvoid = new Map();
let xBoost = new Map();
function buildDockTargets() {
  const bodies = sysApi.getData().bodies;
  dockTarget = new Map();
  dockCount = new Map();
  starAvoid = new Map();
  xBoost = new Map();
  for (const id in bodies) {
    const b = bodies[id];
    // X-Class bodies (blood-sport venues etc.) each boost their system's traffic 50%.
    if (b.class === 'X' || b.stats?.class === 'X') {
      const xr = rootOf(bodies, id);
      xBoost.set(xr, (xBoost.get(xr) || 0) + 1);
    }
    if (b.type === 'star') {
      const bm = sysApi.getBodyMeta(id);
      if (bm) starAvoid.set(id, STAR_MARKER_R * bm.instanceScale * STAR_AVOID_K);
      continue;
    }
    // Destroyed worlds are off-limits to every ship, no matter how scenic the devouring.
    if (b.tags?.includes('destroyed')) continue;
    const dockable = b.type === 'station' || ((b.type === 'planet' || b.type === 'moon') && b.parentId);
    if (!dockable) continue;
    const r = rootOf(bodies, id);
    dockCount.set(r, (dockCount.get(r) || 0) + 1);
    const cur = dockTarget.get(r);
    // Stations beat planets/moons; within a kind, last-declared wins (outermost by data order).
    if (!cur || b.type === 'station' || bodies[cur].type !== 'station') dockTarget.set(r, id);
  }
}

function xMultOf(rootId) {
  return Math.pow(1.5, xBoost.get(rootId) || 0);
}

/* Arc a ship over a star's limb: push it radially out to the avoidance sphere, scaled by a
   window that releases at the route's ends (docks legitimately orbit inside the sphere) — mid-route the ship rides the sphere surface, which IS the top of the arc. */
function arcOverStar(pos, base, starId, w) {
  const avoidR = starAvoid.get(starId);
  if (!avoidR || w <= 0) return;
  const S = sysApi.getBodyWorldPos(starId);
  if (!S) return;
  const dx = pos[base] - S.x, dz = pos[base + 2] - S.z;
  const d = Math.hypot(dx, dz);
  if (d >= avoidR) return;
  const push = (avoidR - d) * w;
  if (d < 1e-3) { pos[base] += push; return; }
  pos[base] += (dx / d) * push;
  pos[base + 2] += (dz / d) * push;
}
function dockFor(id) {
  return dockTarget.get(rootOf(sysApi.getData().bodies, id)) || null;
}

/* Per-system traffic multiplier, editable in galaxy.json as stats.traffic on the root star
   (1 = normal, 0.01 = ghost town). Logic rules (no stars, no destroyed) stay in code. */
function trafficMultOf(rootId) {
  const t = sysApi.getData().bodies[rootId]?.stats?.traffic;
  return t == null ? 1 : t;
}
/* Lane endpoint resolution: a station always docks; multi-body systems dock at the best
   planet/moon; lone-body systems get traders only; dockless systems get HIGH ANCHOR — ships hold at the star's avoidance-sphere limb instead of skipping the lane. */
function laneDockValid(id) {
  const bodies = sysApi.getData().bodies;
  const root = rootOf(bodies, id);
  const d = dockTarget.get(root);
  if (!d) return starAvoid.has(root) ? { id: root, anchor: true } : null;
  if (bodies[d].type !== 'station' && (dockCount.get(root) || 0) < 2) return null;
  return { id: d, anchor: false };
}

/* World position of a high-anchor point: the star's limb nearest the far endpoint. */
function anchorInto(out, starId, tx, tz) {
  const S = sysApi.getBodyWorldPos(starId);
  if (!S) return null;
  const R = starAvoid.get(starId) || 3;
  const dx = tx - S.x, dz = tz - S.z;
  const d = Math.hypot(dx, dz) || 1;
  out.x = S.x + (dx / d) * R;
  out.y = S.y;
  out.z = S.z + (dz / d) * R;
  return out;
}

/* Per-endpoint dwell: normal draws lerp(min,max); a GnG endpoint gets ~50% zero dwell,
   else 0.1× the range. Both draws are always consumed so GnG-ness never reshuffles the stream. */
function dwellFor(isGng, magDraw, gngDraw) {
  const base = lerp(DWELL_MIN, DWELL_MAX, magDraw);
  if (!isGng) return base;
  return gngDraw < 0.5 ? 0 : base * 0.1;
}

/* Walk parentId chain to a body's depth-0 root (star or landmark). Shared by system
   population, isolated-body search, and shuttle/trader system resolution. */
function rootOf(bodies, id) {
  let cur = id, guard = 0;
  while (bodies[cur] && bodies[cur].parentId && guard++ < 16) cur = bodies[cur].parentId;
  return cur;
}

/* Sum stats.population up to each depth-0 root; systems = root stars, normalized to [0,1].
   The per-root map is stashed for shuttle density and the uninhabited-endpoint lane cut. */
let sysPopByRoot = new Map();
let sysMaxPop = 0;
function buildSystemList() {
  const bodies = sysApi.getData().bodies;
  sysPopByRoot = new Map();
  for (const id in bodies) {
    const p = bodies[id]?.stats?.population;
    if (p == null) continue;
    const r = rootOf(bodies, id);
    sysPopByRoot.set(r, (sysPopByRoot.get(r) || 0) + p);
  }
  sysMaxPop = 0;
  for (const v of sysPopByRoot.values()) if (v > sysMaxPop) sysMaxPop = v;
  const list = [];
  for (const id in bodies) {
    const b = bodies[id];
    if (!b.position || b.parentId || b.type !== 'star') continue;
    list.push({ x: b.position.x, z: b.position.z, pop: sysMaxPop > 0 ? (sysPopByRoot.get(id) || 0) / sysMaxPop : 0 });
  }
  return list;
}

/* Per-lane density: nearest-3 system mean pop × core-distance mult (2× close → 0.25× far),
   evaluated at the lane midpoint; count = rate × avg lane occupancy (one-way travel + one dwell). */
function buildLaneDensity(sysList, snapshot) {
  const hyperlanes = Object.values(sysApi.getData().hyperlanes);
  const avgSpeed = Math.max(1, (SPEED_MIN + SPEED_MAX) / 2);
  const avgDwell = (DWELL_MIN + DWELL_MAX) / 2;
  const lanes = [];
  for (const hl of hyperlanes) {
    const dockA = laneDockValid(hl.fromId);
    const dockB = laneDockValid(hl.toId);
    if (!dockA || !dockB) continue;
    const a = snapshot.get(dockA.id);
    const b = snapshot.get(dockB.id);
    if (!a || !b) continue;
    const mx = (a.x + b.x) / 2, mz = (a.z + b.z) / 2;
    const near = sysList
      .map((s) => ({ d: (s.x - mx) * (s.x - mx) + (s.z - mz) * (s.z - mz), p: s.pop }))
      .sort((p, q) => p.d - q.d).slice(0, 3);
    const meanPop = near.reduce((s, o) => s + o.p, 0) / Math.max(1, near.length);
    const base = meanPop * GLOBAL_RATE;
    const dCore = Math.hypot(mx, mz);
    const mult = lerp(1.25, 0.75, smoothstepCPU(0, MAX_CORE_DIST, dCore));
    const rootA = rootOf(sysApi.getData().bodies, hl.fromId);
    const rootB = rootOf(sysApi.getData().bodies, hl.toId);
    /* People go where people are: uninhabited endpoints lose 80% of their visitors. Station
       docks (GnG waypoints) are pass-through infrastructure and exempt; X-Class venues pull crowds no matter how remote. */
    const bods = sysApi.getData().bodies;
    const ghostA = bods[dockA.id].type !== 'station' && !sysPopByRoot.get(rootA) ? 0.2 : 1;
    const ghostB = bods[dockB.id].type !== 'station' && !sysPopByRoot.get(rootB) ? 0.2 : 1;
    const eff = base * mult * trafficMultOf(rootA) * trafficMultOf(rootB) * ghostA * ghostB
      * xMultOf(rootA) * xMultOf(rootB);
    const len = Math.hypot(b.x - a.x, b.z - a.z);
    const count = clamp(Math.round(eff * (len / avgSpeed + avgDwell)), 0, MAX_PER_LANE);
    lanes.push({ dockA, dockB, rootA, rootB, len, eff, count });
  }
  return lanes;
}

/* Precompute all lane traffic: per-ship init draws (deterministic; one seeded stream per lane,
   ships pull sequentially), sheet/slot assignment (C-V→C-0 layering), static sprite/tint attributes. Positions are written live in update(). No-op cleanly when no regular sheet exists. */
function buildTraffic() {
  const regular = instanceHandles.filter((h) => !h.sheet.isCustom);
  const customHandle = instanceHandles.find((h) => h.sheet.isCustom) || null;
  if (regular.length === 0) return;

  const sysList = buildSystemList();
  if (sysList.length === 0) return;
  const snapshot = sysApi.flattenPositions(0);
  const lanes = buildLaneDensity(sysList, snapshot);
  const maxEff = Math.max(1e-6, ...lanes.map((l) => l.eff));

  const pending = [];
  lanes.forEach((lane, li) => {
    if (lane.count === 0) return;
    const laneBusy = clamp(lane.eff / maxEff, 0, 1);
    const gngA = isGnG(lane.dockA.id);
    const gngB = isGnG(lane.dockB.id);
    const rng = createRng((TRAFFIC_SEED ^ Math.imul(li + 1, 40503)) | 0);
    for (let k = 0; k < lane.count; k++) {
      const cidx = pickClassIdx(laneBusy, rng);
      const dir = rng.next() < 0.5 ? 1 : -1;
      const offBase = rng.gauss() * LANE_SCATTER;
      const grey = 0.55 + rng.next() * 0.45;
      const speed = lerp(SPEED_MIN, SPEED_MAX, rng.next());
      const dwellA = dwellFor(gngA, rng.next(), rng.next());
      const dwellB = dwellFor(gngB, rng.next(), rng.next());
      const customD = rng.next(), customPick = rng.next();
      const sheetDraw = rng.next(), shipDraw = rng.next();
      const phase = rng.next();

      let handle, win, isCustom, aspect, nozV = -1;
      if (customHandle && customD < CUSTOM_RATE) {
        const wins = customHandle.sheet.customWindows;
        const wi = Math.min(wins.length - 1, (customPick * wins.length) | 0);
        win = wins[wi];
        const size = customHandle.sheet.size;
        aspect = (win[3] * size.h) / Math.max(1e-3, win[2] * size.w);
        handle = customHandle; isCustom = 1;
      } else {
        handle = regular[Math.min(regular.length - 1, (sheetDraw * regular.length) | 0)];
        const meta = handle.sheet.meta;
        const keys = CLASS_IDS.filter((id) => meta.classes[id]);
        const classId = keys.length ? keys[Math.min(keys.length - 1, cidx)] : Object.keys(meta.classes)[0];
        const c = meta.classes[classId];
        const shipIdx = Math.min((c.count || 1) - 1, (shipDraw * (c.count || 1)) | 0);
        win = computeWindow(meta, handle.sheet.size, classId, shipIdx);
        aspect = c.shipH / Math.max(1, c.shipW);
        nozV = nozzleV(meta, handle.sheet.size, classId, shipIdx);
        isCustom = 0;
      }
      const worldWidth = win[2] * handle.sheet.size.w * SHIP_PIXEL_SCALE;
      pending.push({
        cidx, handle, nozV, fromDock: lane.dockA.id, toDock: lane.dockB.id,
        fromAnchor: lane.dockA.anchor, toAnchor: lane.dockB.anchor,
        starA: lane.rootA, starB: lane.rootB,
        dir, offBase, speed, travel: lane.len / speed, dwellA, dwellB, phase,
        scale: worldWidth, win, grey, isCustom, aspect
      });
    }
  });

  // Draw largest class first (bottom), smallest last (top); stable within equal cidx.
  pending.sort((a, b) => b.cidx - a.cidx);

  /* Off-lane slots [0, OFFLANE_RESERVE) on the designated sheet are pre-claimed so lane
     traffic never writes into shuttle/trader territory (see pickOffLaneHandle). */
  const perSheet = new Map();
  if (offLaneHandle) perSheet.set(offLaneHandle, offLaneHandle.reserved || 0);
  for (const p of pending) {
    const h = p.handle;
    const used = perSheet.get(h) || 0;
    if (used >= h.capacity) continue;
    const slot = used; perSheet.set(h, used + 1);
    const base = slot * 4;
    h.posArr[base] = 0; h.posArr[base + 1] = 0; h.posArr[base + 2] = 0; h.posArr[base + 3] = 0;
    h.spriteArr.set(p.win, base);
    h.trailArr[slot] = p.nozV;
    h.tintArr[base] = p.grey; h.tintArr[base + 1] = p.isCustom;
    h.tintArr[base + 2] = 0; h.tintArr[base + 3] = p.aspect;
    trafficShips.push({
      handle: h, slot, fromDock: p.fromDock, toDock: p.toDock,
      fromAnchor: p.fromAnchor, toAnchor: p.toAnchor, starA: p.starA, starB: p.starB,
      dir: p.dir, offBase: p.offBase, travel: p.travel, dwellA: p.dwellA, dwellB: p.dwellB,
      phase: p.phase, scale: p.scale, lx: 0, ly: 0, lz: 0, sx: 0, sy: 0, sz: 0, hidden: true
    });
  }

  for (const [h, n] of perSheet) {
    h.setCount(n);
    h.dirtySprite(); h.dirtyTint(); h.dirtyPos();
  }
  trafficReady = trafficShips.length > 0;
}

/* First regular (non-custom) sheet takes the reserved off-lane block. Deterministic pick
   (not random) keeps shuttle/trader sprite sourcing stable across loads. */
function pickOffLaneHandle() {
  offLaneHandle = instanceHandles.find((h) => !h.sheet.isCustom) || null;
  if (offLaneHandle) offLaneHandle.reserved = OFFLANE_RESERVE;
}

/* Tiny string hash so a body id can seed an rng stream (Mulberry32 wants a numeric seed). */
function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

/* Write one off-lane slot's static sprite/tint (window, grey, aspect); flash (aTint.z) is
   left at its zero default — neither shuttles nor traders jump-flash. Returns world scale. */
function packOffLaneSlot(slot, classPool, rng) {
  const meta = offLaneHandle.sheet.meta;
  const keys = classPool.filter((id) => meta.classes[id]);
  const pool = keys.length ? keys : Object.keys(meta.classes);
  const classId = pool[Math.min(pool.length - 1, (rng.next() * pool.length) | 0)];
  const c = meta.classes[classId];
  const shipIdx = Math.min((c.count || 1) - 1, (rng.next() * (c.count || 1)) | 0);
  const win = computeWindow(meta, offLaneHandle.sheet.size, classId, shipIdx);
  const base = slot * 4;
  offLaneHandle.spriteArr.set(win, base);
  offLaneHandle.trailArr[slot] = nozzleV(meta, offLaneHandle.sheet.size, classId, shipIdx);
  offLaneHandle.tintArr[base] = 0.55 + rng.next() * 0.45;
  offLaneHandle.tintArr[base + 1] = 0;
  offLaneHandle.tintArr[base + 3] = c.shipH / Math.max(1, c.shipW);
  return win[2] * offLaneHandle.sheet.size.w * SHIP_PIXEL_SCALE;
}

/* Non-star, non-destroyed bodies whose parentId chain roots at rootId. Stars are excluded
   on purpose: ships dock at planets, moons, and stations, never suns or dead worlds. */
function getSystemBodyIds(rootId) {
  const bodies = sysApi.getData().bodies;
  const ids = [];
  for (const id in bodies) {
    if (bodies[id].type === 'star' || bodies[id].tags?.includes('destroyed')) continue;
    if (id === rootId || rootOf(bodies, id) === rootId) ids.push(id);
  }
  return ids;
}

/* Reseed the pool onto a newly-focused system: each shuttle gets a fixed home body; its destination
   rotates through the system's other bodies once per full out-and-back cycle, computed purely from the world clock (no stored lap counter, no per-frame alloc). */
function reseedShuttlePool(rootId) {
  shuttleBodyIds = getSystemBodyIds(rootId);
  shuttlePool = [];
  /* Zero every slot up front — a bailout below (too few bodies) must not leave the PREVIOUS
     system's ships frozen on screen once this function stops driving their positions. */
  if (offLaneHandle) {
    for (let i = 0; i < SHUTTLE_POOL_SIZE; i++) offLaneHandle.posArr[i * 4 + 3] = 0;
    offLaneHandle.dirtyPos();
  }
  // Quiet systems (data-tuned stats.traffic) get no local shuttles — long-haul traders only.
  if (!offLaneHandle || shuttleBodyIds.length < 2 || trafficMultOf(rootId) < SHUTTLE_TRAFFIC_MIN) {
    shuttleActive = false;
    return;
  }

  /* Same economics as the lanes, applied locally: population × core proximity × how many
     occupied worlds there are to shuttle between. Core systems bustle, rim systems idle. */
  const bodies = sysApi.getData().bodies;
  let occupied = 0;
  for (const id of shuttleBodyIds) if (bodies[id]?.stats?.population > 0) occupied++;
  const popNorm = sysMaxPop > 0 ? (sysPopByRoot.get(rootId) || 0) / sysMaxPop : 0;
  const rp = bodies[rootId]?.position;
  const coreMult = lerp(1.25, 0.75, smoothstepCPU(0, MAX_CORE_DIST, rp ? Math.hypot(rp.x, rp.z) : MAX_CORE_DIST));
  const active = clamp(Math.round(
    SHUTTLE_POOL_SIZE * (coreMult / 1.25) * (0.2 + 0.8 * popNorm) * Math.min(1, occupied / 3)
    * trafficMultOf(rootId) * xMultOf(rootId)
  ), 0, SHUTTLE_POOL_SIZE);
  if (active === 0) { shuttleActive = false; return; }

  const rng = createRng((SHUTTLE_SEED ^ Math.imul(hashStr(rootId) + 1, 40503)) | 0);
  for (let i = 0; i < active; i++) {
    const scale = packOffLaneSlot(i, ['C-0', 'C-I'], rng);
    shuttlePool.push({
      slot: i,
      baseIdx: (rng.next() * shuttleBodyIds.length) | 0,
      travel: lerp(SHUTTLE_TRAVEL_MIN, SHUTTLE_TRAVEL_MAX, rng.next()),
      dwell: lerp(SHUTTLE_DWELL_MIN, SHUTTLE_DWELL_MAX, rng.next()),
      phase: rng.next(),
      scale, lx: 0, ly: 0, lz: 0, sx: 0, sy: 0, sz: 0, hidden: true
    });
  }
  offLaneHandle.dirtySprite();
  offLaneHandle.dirtyTint();
  shuttleActive = true;
}

function hideShuttlePool() {
  shuttleActive = false;
  shuttleBodyIds = [];
  shuttlePool = [];
  if (!offLaneHandle) return;
  for (let i = 0; i < SHUTTLE_POOL_SIZE; i++) offLaneHandle.posArr[i * 4 + 3] = 0;
  offLaneHandle.dirtyPos();
}

/* LOD gate: reseed only when the camera-focused system changes (rare); the per-frame cost is just
   SHUTTLE_POOL_SIZE motion updates. No focused system hides the pool; a system-swap snaps ships to the new pair instantly — acceptable at shuttle scale. */
function updateShuttlePool(wt) {
  if (!offLaneHandle) return;
  const focusedId = sysApi.getFocusedSystemId ? sysApi.getFocusedSystemId() : null;
  const rootId = focusedId ? rootOf(sysApi.getData().bodies, focusedId) : null;
  if (rootId !== shuttleFocusRoot) {
    shuttleFocusRoot = rootId;
    if (rootId) reseedShuttlePool(rootId); else hideShuttlePool();
  }
  if (!shuttleActive) return;

  const pos = offLaneHandle.posArr;
  const n = shuttleBodyIds.length;
  for (let i = 0; i < shuttlePool.length; i++) {
    const o = shuttlePool[i];
    const period = 2 * o.travel + 2 * o.dwell;
    const ttTotal = wt + o.phase * period;
    const lap = Math.floor(ttTotal / period);
    const destIdx = (o.baseIdx + 1 + (lap % Math.max(1, n - 1))) % n;
    const A = sysApi.getBodyWorldPos(shuttleBodyIds[o.baseIdx]);
    const B = sysApi.getBodyWorldPos(shuttleBodyIds[destIdx]);
    const base = o.slot * 4;
    if (!A || !B) { pos[base + 3] = 0; o.hidden = true; continue; }

    const tt = ttTotal % period;
    let headingOut, ul;
    if (tt < o.travel) { headingOut = true; ul = tt / o.travel; }
    else if (tt < o.travel + o.dwell) { pos[base + 3] = 0; o.hidden = true; continue; }
    else if (tt < 2 * o.travel + o.dwell) { headingOut = false; ul = (tt - o.travel - o.dwell) / o.travel; }
    else { pos[base + 3] = 0; o.hidden = true; continue; }

    easeJump(ul, SHUTTLE_EASE_K);
    const u = headingOut ? EASE.s : 1 - EASE.s;
    pos[base] = A.x + (B.x - A.x) * u;
    pos[base + 1] = A.y + (B.y - A.y) * u;
    pos[base + 2] = A.z + (B.z - A.z) * u;
    pos[base + 3] = o.scale * smoothstepCPU(0, 0.06, ul) * (1 - smoothstepCPU(0.94, 1, ul));
    arcOverStar(pos, base, shuttleFocusRoot, smoothstepCPU(0, 0.2, ul) * (1 - smoothstepCPU(0.8, 1, ul)));

    const mot = offLaneHandle.motionArr;
    const mdx = pos[base] - o.lx, mdy = pos[base + 1] - o.ly, mdz = pos[base + 2] - o.lz;
    const md = Math.hypot(mdx, mdy, mdz);
    let tx3, ty3, tz3;
    if (!o.hidden && md > 1e-6) { tx3 = mdx / md; ty3 = mdy / md; tz3 = mdz / md; }
    else {
      const hx = B.x - A.x, hy = B.y - A.y, hz = B.z - A.z;
      const hl = Math.hypot(hx, hy, hz) || 1;
      const sgn = headingOut ? 1 : -1;
      tx3 = (hx / hl) * sgn; ty3 = (hy / hl) * sgn; tz3 = (hz / hl) * sgn;
    }
    if (o.hidden) { o.sx = tx3; o.sy = ty3; o.sz = tz3; }
    else {
      o.sx += (tx3 - o.sx) * turnSmooth;
      o.sy += (ty3 - o.sy) * turnSmooth;
      o.sz += (tz3 - o.sz) * turnSmooth;
      const sl = Math.hypot(o.sx, o.sy, o.sz);
      if (sl > 1e-4) { o.sx /= sl; o.sy /= sl; o.sz /= sl; }
      else { o.sx = tx3; o.sy = ty3; o.sz = tz3; }
    }
    mot[base] = o.sx; mot[base + 1] = o.sy; mot[base + 2] = o.sz;
    mot[base + 3] = Math.min(1, EASE.v / SHUTTLE_PEAK) * 0.4;
    o.lx = pos[base]; o.ly = pos[base + 1]; o.lz = pos[base + 2];
    o.hidden = false;
  }
  offLaneHandle.dirtyPos();
  offLaneHandle.dirtyMotion();
}

/* d0/dir = the chord's closest approach to the origin and its outward bearing (see BOW_* above). */
function traderControlPoint(A, B) {
  const dx = B.x - A.x, dz = B.z - A.z, len2 = dx * dx + dz * dz;
  let t0 = len2 > 1e-9 ? -(A.x * dx + A.z * dz) / len2 : 0;
  t0 = clamp(t0, 0, 1);
  const px = A.x + t0 * dx, pz = A.z + t0 * dz;
  const d0 = Math.hypot(px, pz);
  let dirX, dirZ;
  if (d0 > 1e-3) { dirX = px / d0; dirZ = pz / d0; }
  else { const len = Math.sqrt(len2) || 1; dirX = -dz / len; dirZ = dx / len; }
  const shortfall = Math.max(0, (BH_EXCLUSION + BOW_MARGIN) - d0);
  const push = shortfall * BOW_SAFETY + BOW_FLAT;
  const mx = (A.x + B.x) / 2, mz = (A.z + B.z) / 2;
  return { x: mx + dirX * push, y: (A.y + B.y) / 2, z: mz + dirZ * push };
}

/* Sampled once at build time to size travel duration from actual route length (long-haul,
   long dwell — reused verbatim from lane traffic's dwell-and-return period math). */
function bezierArcLength(A, C, B) {
  const STEPS = 16;
  let len = 0, px = A.x, py = A.y, pz = A.z;
  for (let i = 1; i <= STEPS; i++) {
    const t = i / STEPS, u = 1 - t;
    const x = u * u * A.x + 2 * u * t * C.x + t * t * B.x;
    const y = u * u * A.y + 2 * u * t * C.y + t * t * B.y;
    const z = u * u * A.z + 2 * u * t * C.z + t * t * B.z;
    len += Math.hypot(x - px, y - py, z - pz);
    px = x; py = y; pz = z;
  }
  return len;
}

/* Fixed count, deterministic seed: routes are picked once here, not re-rolled per load beyond
   the seeded rng stream. Pairs are system-to-system with NO shared hyperlane (that's the point). */
function buildTraders() {
  traderShips = [];
  if (!offLaneHandle || !sysApi) return;
  const bodies = sysApi.getData().bodies;
  const roots = [];
  for (const id in bodies) {
    const b = bodies[id];
    if (b.type === 'star' && !b.parentId && b.position) roots.push(id);
  }
  if (roots.length < 2) return;

  const linked = new Set();
  for (const hl of Object.values(sysApi.getData().hyperlanes)) {
    const a = rootOf(bodies, hl.fromId), b = rootOf(bodies, hl.toId);
    linked.add(a + '|' + b); linked.add(b + '|' + a);
  }
  // Traders may visit lone-body systems but still never dock at a star: both ends need a dock.
  const candidates = [];
  for (let i = 0; i < roots.length; i++) {
    for (let j = i + 1; j < roots.length; j++) {
      if (linked.has(roots[i] + '|' + roots[j])) continue;
      if (!dockTarget.get(roots[i]) || !dockTarget.get(roots[j])) continue;
      candidates.push([roots[i], roots[j]]);
    }
  }
  if (candidates.length === 0) return;

  const rng = createRng(TRADER_SEED);
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = (rng.next() * (i + 1)) | 0;
    const tmp = candidates[i]; candidates[i] = candidates[j]; candidates[j] = tmp;
  }
  const n = Math.min(TRADER_COUNT, candidates.length);

  for (let i = 0; i < n; i++) {
    const [fromRoot, toRoot] = candidates[i];
    const A = bodies[fromRoot].position, B = bodies[toRoot].position;
    const ctrl = traderControlPoint(A, B);
    const pathLen = bezierArcLength(A, ctrl, B);
    const speed = lerp(TRADER_SPEED_MIN, TRADER_SPEED_MAX, rng.next());
    const scale = packOffLaneSlot(SHUTTLE_POOL_SIZE + i, ['C-I', 'C-II', 'C-III'], rng);
    traderShips.push({
      slot: SHUTTLE_POOL_SIZE + i, fromDock: dockTarget.get(fromRoot), toDock: dockTarget.get(toRoot),
      starA: fromRoot, starB: toRoot, ctrl,
      travel: pathLen / Math.max(0.01, speed),
      dwellA: lerp(TRADER_DWELL_MIN, TRADER_DWELL_MAX, rng.next()),
      dwellB: lerp(TRADER_DWELL_MIN, TRADER_DWELL_MAX, rng.next()),
      dir: rng.next() < 0.5 ? 1 : -1,
      phase: rng.next(),
      scale, lx: 0, ly: 0, lz: 0, sx: 0, sy: 0, sz: 0, hidden: true
    });
  }
  offLaneHandle.dirtySprite();
  offLaneHandle.dirtyTint();
  tradersReady = traderShips.length > 0;
}

/* Same dwell-and-return period math as lane traffic, but position rides a quadratic bezier through
   the bow control point. o.ctrl lives in CANONICAL (unrotated) space, so it is swirled every frame to stay aligned with the differentially-rotating endpoints. */
function updateTraders(wt) {
  if (!tradersReady || !offLaneHandle) return;
  const pos = offLaneHandle.posArr;
  for (let i = 0; i < traderShips.length; i++) {
    const o = traderShips[i];
    const A = sysApi.getBodyWorldPos(o.fromDock);
    const B = sysApi.getBodyWorldPos(o.toDock);
    const base = o.slot * 4;
    if (!A || !B) { pos[base + 3] = 0; o.hidden = true; continue; }
    const ctrl = sysApi.canonicalToRotatedInto(ROT, o.ctrl.x, o.ctrl.z, wt);

    const period = 2 * o.travel + o.dwellA + o.dwellB;
    const startOff = o.dir < 0 ? o.travel + o.dwellB : 0;
    const tt = (startOff + o.phase * period + wt) % period;

    let headingAB, ul;
    if (tt < o.travel) { headingAB = true; ul = tt / o.travel; }
    else if (tt < o.travel + o.dwellB) { pos[base + 3] = 0; o.hidden = true; continue; }
    else if (tt < 2 * o.travel + o.dwellB) { headingAB = false; ul = (tt - o.travel - o.dwellB) / o.travel; }
    else { pos[base + 3] = 0; o.hidden = true; continue; }

    easeJump(ul, TRADER_EASE_K);
    const t = headingAB ? EASE.s : 1 - EASE.s;
    const u = 1 - t;
    pos[base] = u * u * A.x + 2 * u * t * ctrl.x + t * t * B.x;
    pos[base + 1] = u * u * A.y + 2 * u * t * o.ctrl.y + t * t * B.y;
    pos[base + 2] = u * u * A.z + 2 * u * t * ctrl.z + t * t * B.z;
    pos[base + 3] = o.scale * smoothstepCPU(0, 0.04, ul) * (1 - smoothstepCPU(0.96, 1, ul));
    const arcW = smoothstepCPU(0, 0.15, ul) * (1 - smoothstepCPU(0.85, 1, ul));
    arcOverStar(pos, base, o.starA, arcW);
    arcOverStar(pos, base, o.starB, arcW);

    const mot = offLaneHandle.motionArr;
    const mdx = pos[base] - o.lx, mdy = pos[base + 1] - o.ly, mdz = pos[base + 2] - o.lz;
    const md = Math.hypot(mdx, mdy, mdz);
    let tx3, ty3, tz3;
    if (!o.hidden && md > 1e-6) { tx3 = mdx / md; ty3 = mdy / md; tz3 = mdz / md; }
    else {
      const hx = B.x - A.x, hy = B.y - A.y, hz = B.z - A.z;
      const hl = Math.hypot(hx, hy, hz) || 1;
      const sgn = headingAB ? 1 : -1;
      tx3 = (hx / hl) * sgn; ty3 = (hy / hl) * sgn; tz3 = (hz / hl) * sgn;
    }
    if (o.hidden) { o.sx = tx3; o.sy = ty3; o.sz = tz3; }
    else {
      o.sx += (tx3 - o.sx) * turnSmooth;
      o.sy += (ty3 - o.sy) * turnSmooth;
      o.sz += (tz3 - o.sz) * turnSmooth;
      const sl = Math.hypot(o.sx, o.sy, o.sz);
      if (sl > 1e-4) { o.sx /= sl; o.sy /= sl; o.sz /= sl; }
      else { o.sx = tx3; o.sy = ty3; o.sz = tz3; }
    }
    mot[base] = o.sx; mot[base + 1] = o.sy; mot[base + 2] = o.sz;
    mot[base + 3] = Math.min(1, EASE.v / TRADER_PEAK) * 0.5;
    o.lx = pos[base]; o.ly = pos[base + 1]; o.lz = pos[base + 2];
    o.hidden = false;
  }
  offLaneHandle.dirtyPos();
  offLaneHandle.dirtyMotion();
}

/* Bake the detail layer (rust, windows, cold-engine tint) dimmed onto the monochrome hull so
   wrecks read as battered without any additive glow pass. Layout is shared with the hull atlas, so a straight 0,0 draw stays aligned; the shader's alpha cutoff clips faint stray halos. */
function compositeDerelictHull(hullImg, detailImg) {
  const canvas = document.createElement('canvas');
  canvas.width = hullImg.width; canvas.height = hullImg.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(hullImg, 0, 0);
  ctx.globalAlpha = DERELICT_DETAIL_ALPHA;
  ctx.drawImage(detailImg, 0, 0);
  ctx.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  return tex;
}

/* Dedicated max-wear trios in derelicts/, same probe-until-404 discovery as the main folder.
   Hull-only: the detail PNG is composited in, never instanced as a live engine layer. */
async function loadDerelictSheets() {
  const sheets = [];
  for (let i = 0; i < MAX_SHEETS; i++) {
    const suffix = i === 0 ? '' : '-' + i;
    const meta = await probeJSON(DERELICTS_DIR + META_BASE + suffix + '.json');
    if (!meta) break;
    try {
      const hullImg = await loadImage(DERELICTS_DIR + HULL_BASE + suffix + '.png');
      let detailImg = null;
      try { detailImg = await loadImage(DERELICTS_DIR + ENGINE_BASE + suffix + '.png'); } catch {}
      const hullTex = detailImg ? compositeDerelictHull(hullImg, detailImg) : texFromImage(hullImg);
      sheets.push({ hullTex, engineTex: null, isCustom: false, meta, size: { w: hullImg.width, h: hullImg.height } });
    } catch {
      console.warn('ships: derelict atlas trio incomplete for suffix', suffix || '(none)');
    }
  }
  return sheets;
}

/* Root stars ranked by nearest-neighbour distance; the most isolated get an orbiting
   planet/moon as a derelict anchor, plus a canonical fallback point. */
function findIsolatedBodies(rng, want) {
  const bodies = sysApi.getData().bodies;
  const roots = [];
  for (const id in bodies) {
    const b = bodies[id];
    if (b.type === 'star' && !b.parentId && b.position) roots.push({ id, x: b.position.x, z: b.position.z, iso: Infinity });
  }
  for (const r of roots) {
    for (const o of roots) {
      if (o === r) continue;
      const dx = o.x - r.x, dz = o.z - r.z, d = dx * dx + dz * dz;
      if (d < r.iso) r.iso = d;
    }
  }
  roots.sort((a, b) => b.iso - a.iso);

  const result = [];
  for (const r of roots) {
    if (result.length >= want) break;
    const kids = [];
    for (const id in bodies) {
      const b = bodies[id];
      if (!b.parentId) continue;
      if (b.tags?.includes('destroyed')) continue;
      if (rootOf(bodies, id) === r.id && (b.type === 'planet' || b.type === 'moon')) kids.push(id);
    }
    // No planet/moon kids: skip the system — a wreck hugging a bare star breaks the no-stars rule.
    if (kids.length === 0) continue;
    const parentId = kids[Math.min(kids.length - 1, (rng.next() * kids.length) | 0)];
    result.push({ parentId, fbx: r.x, fbz: r.z });
  }
  return result;
}

/* Scatter the wrecks: majority parked in the belt (ride its exact rotation via canonicalToRotated),
   the rest slow open-swirl drifters + a few orbiting isolated bodies. Own rng stream, own handles. */
function buildDerelicts() {
  if (derelictHandles.length === 0) return;
  const rng = createRng((Math.floor(Math.random() * 0xffffffff)) | 0);
  const perSheet = new Map();

  const packDerelict = (motion) => {
    const handle = derelictHandles[Math.min(derelictHandles.length - 1, (rng.next() * derelictHandles.length) | 0)];
    const meta = handle.sheet.meta;
    const keys = CLASS_IDS.filter((id) => meta.classes[id]);
    const classId = keys.length ? keys[Math.min(keys.length - 1, (rng.next() * keys.length) | 0)] : Object.keys(meta.classes)[0];
    const c = meta.classes[classId];
    const shipIdx = Math.min((c.count || 1) - 1, (rng.next() * (c.count || 1)) | 0);
    const win = computeWindow(meta, handle.sheet.size, classId, shipIdx);
    const used = perSheet.get(handle) || 0;
    if (used >= handle.capacity) return;
    perSheet.set(handle, used + 1);
    const base = used * 4;
    handle.posArr[base] = 0; handle.posArr[base + 1] = 0; handle.posArr[base + 2] = 0; handle.posArr[base + 3] = 0;
    handle.spriteArr.set(win, base);
    handle.tintArr[base] = DERELICT_GREY_MIN + rng.next() * (DERELICT_GREY_MAX - DERELICT_GREY_MIN);
    handle.tintArr[base + 1] = 0; handle.tintArr[base + 2] = 0;
    handle.tintArr[base + 3] = c.shipH / Math.max(1, c.shipW);
    motion.handle = handle;
    motion.slot = used;
    motion.scale = win[2] * handle.sheet.size.w * SHIP_PIXEL_SCALE
      * lerp(DERELICT_SCALE_MIN, DERELICT_SCALE_MAX, rng.next());
    motion.sp = (rng.next() < 0.5 ? -1 : 1) * lerp(DERELICT_SPIN_MIN, DERELICT_SPIN_MAX, rng.next());
    motion.sph = rng.next() * TAU;
    derelictShips.push(motion);
  };

  /* One canon-guaranteed hulk being slowly shredded in Blue Watcher's lunar swarm; the wider
     orbit threads it through the moon shells. Counts against the drifter share, total stays 420. */
  let guaranteed = 0;
  const bodies = sysApi ? sysApi.getData().bodies : null;
  if (bodies && bodies['osminok-iv']) {
    const os = bodies['osminok'];
    packDerelict({
      mode: 'orbiter', parentId: 'osminok-iv',
      fbx: os?.position?.x || 0, fbz: os?.position?.z || 0,
      orbR: 4 + rng.next() * 4, orbW: 0.03 + rng.next() * 0.05,
      ph0: rng.next() * TAU, yOff: (rng.next() - 0.5) * 2
    });
    guaranteed = 1;
  }

  const iso = sysApi ? findIsolatedBodies(rng, DERELICT_ORBITERS) : [];
  const orbiterN = Math.min(DERELICT_ORBITERS, iso.length);
  const drifterN = DERELICT_COUNT - DERELICT_PARKED - orbiterN - guaranteed;

  for (let i = 0; i < DERELICT_PARKED; i++) {
    const r = BELT_INNER + (BELT_OUTER - BELT_INNER) * Math.pow(rng.next(), 0.7);
    const th = rng.next() * TAU;
    const rd = smoothstepCPU(BELT_INNER, BELT_PEAK_LO, r) * (1 - smoothstepCPU(BELT_PEAK_HI, BELT_OUTER, r));
    /* The rock layer is optically thick (~8 occluders per sightline), so wrecks co-planar with it
       are invisible. Most float above/below the rubble as silhouettes; a quarter stay buried in-plane as close-range salvage finds. */
    const buried = rng.next() < 0.25;
    const y = buried
      ? rng.gauss() * (3 + 5 * rd)
      : (rng.next() < 0.5 ? -1 : 1) * (18 + rng.next() * 14) + rng.gauss() * 2;
    packDerelict({
      mode: 'parked', cx: r * Math.cos(th), cz: r * Math.sin(th), y,
      ph0: rng.next() * TAU, ph1: rng.next() * TAU, ph2: rng.next() * TAU
    });
  }

  for (let i = 0; i < drifterN; i++) {
    const r = DRIFT_MIN_R + (DRIFT_MAX_R - DRIFT_MIN_R) * Math.pow(rng.next(), 0.6);
    const th = rng.next() * TAU;
    const sp = 0.05 + rng.next() * 0.1, dth = rng.next() * TAU;
    packDerelict({
      mode: 'drifter', cx: r * Math.cos(th), cz: r * Math.sin(th), y: rng.gauss() * 4,
      vx: Math.cos(dth) * sp, vz: Math.sin(dth) * sp, vy: (rng.next() - 0.5) * 0.04
    });
  }

  for (let i = 0; i < orbiterN; i++) {
    packDerelict({
      mode: 'orbiter', parentId: iso[i].parentId, fbx: iso[i].fbx, fbz: iso[i].fbz,
      orbR: ORBIT_R_MIN + rng.next() * (ORBIT_R_MAX - ORBIT_R_MIN),
      orbW: 0.05 + rng.next() * 0.1, ph0: rng.next() * TAU, yOff: (rng.next() - 0.5) * 3
    });
  }

  for (const [h, n] of perSheet) {
    h.setCount(n);
    h.dirtySprite(); h.dirtyTint(); h.dirtyPos();
  }
  derelictReady = derelictShips.length > 0;
}

export async function init(scene, lightmapTexture, systemsApi) {
  sceneRef = scene;
  sysApi = systemsApi;
  const found = [];

  for (let i = 0; i < MAX_SHEETS; i++) {
    const suffix = i === 0 ? '' : '-' + i;
    const meta = await probeJSON(SHIPS_DIR + META_BASE + suffix + '.json');
    if (!meta) break;
    try {
      const hullImg = await loadImage(SHIPS_DIR + HULL_BASE + suffix + '.png');
      const engineImg = await loadImage(SHIPS_DIR + ENGINE_BASE + suffix + '.png');
      found.push({
        hullTex: texFromImage(hullImg),
        engineTex: texFromImage(engineImg),
        isCustom: false,
        meta,
        size: { w: hullImg.width, h: hullImg.height }
      });
    } catch {
      console.warn('ships: atlas trio incomplete for suffix', suffix || '(none)');
    }
  }

  const custom = await loadCustomSheet();
  if (custom) found.push(custom);

  const derelictSheets = await loadDerelictSheets();
  if (found.length === 0 && derelictSheets.length === 0) return;

  for (const sheet of found) instanceHandles.push(buildSheetMeshes(sheet, lightmapTexture));
  pickOffLaneHandle();
  if (sysApi) buildDockTargets();
  if (sysApi) buildTraffic();
  if (sysApi) buildTraders();
  /* buildTraffic() only claims the reserved block if it reaches its perSheet seeding step
     (early-returns on empty sysList skip it entirely) — make sure it's covered regardless. */
  if (offLaneHandle && offLaneHandle.hullGeo.instanceCount < OFFLANE_RESERVE) {
    offLaneHandle.setCount(OFFLANE_RESERVE);
  }

  /* Empty derelicts/ folder → sample the main hull sheets, same dead-engine (hull-only) treatment. */
  let wreckSheets = derelictSheets;
  if (wreckSheets.length === 0) {
    wreckSheets = found
      .filter((s) => !s.isCustom)
      .map((s) => ({ hullTex: s.hullTex, engineTex: null, isCustom: false, meta: s.meta, size: s.size }));
  }
  for (const sheet of wreckSheets) derelictHandles.push(buildSheetMeshes(sheet, lightmapTexture));
  if (sysApi) buildDerelicts();

  const total = found.filter((s) => !s.isCustom).length;
  console.log(`Ships: ${total} atlas + ${derelictSheets.length} derelict sheet(s)${custom ? ' + custom' : ''} loaded (fallback: ${derelictSheets.length === 0}), ${trafficShips.length} vessel(s), ${derelictShips.length} derelict(s), ${traderShips.length} trader(s)`);
}

/* Position every active ship along its (live, moving) lane. Dock world positions are re-read each
   frame, so orbiting endpoints track. Docked ships park at scale 0 (degenerate quad, no billboard cost). Zero allocation in the loop: scratch EASE + scalars. */
export function update(elapsed, rotationTime) {
  if (instanceHandles.length === 0 && derelictHandles.length === 0) return;
  if (!shipsVisible) return;
  /* All motion runs on the world clock (rotationTime): PAUSE freezes the fleet, T=0 resets it.
     Phase offsets keep ships mid-flight at time zero, so the galaxy never loads empty. */
  const wt = rotationTime || 0;
  const dtw = Math.min(Math.max(wt - lastWt, 0), 0.1);
  lastWt = wt;
  turnSmooth = 1 - Math.exp(-dtw * TURN_RATE);

  if (derelictReady) updateDerelicts(wt);
  updateShuttlePool(wt);
  updateTraders(wt);
  if (!trafficReady) return;

  for (let i = 0; i < trafficShips.length; i++) {
    const o = trafficShips[i];
    const base = o.slot * 4;
    const pos = o.handle.posArr, tint = o.handle.tintArr;
    let A = sysApi.getBodyWorldPos(o.fromDock);
    let B = sysApi.getBodyWorldPos(o.toDock);
    if (!A || !B) { pos[base + 3] = 0; o.hidden = true; continue; }
    if (o.fromAnchor) A = anchorInto(ANC1, o.fromDock, B.x, B.z) || A;
    if (o.toAnchor) B = anchorInto(ANC2, o.toDock, A.x, A.z) || B;

    const dx = B.x - A.x, dy = B.y - A.y, dz = B.z - A.z;
    const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (len < 1e-3) { pos[base + 3] = 0; o.hidden = true; continue; }

    /* travel is FIXED at build time: recomputing it from live (orbiting) endpoints made the
       whole cycle clock breathe every frame, which read as ship jitter. */
    const travel = o.travel;
    const period = 2 * travel + o.dwellA + o.dwellB;
    const startOff = o.dir < 0 ? travel + o.dwellB : 0;
    const tt = (startOff + o.phase * period + wt) % period;

    let headingAB, ul;
    if (tt < travel) { headingAB = true; ul = tt / travel; }
    else if (tt < travel + o.dwellB) { pos[base + 3] = 0; o.hidden = true; continue; }
    else if (tt < 2 * travel + o.dwellB) { headingAB = false; ul = (tt - travel - o.dwellB) / travel; }
    else { pos[base + 3] = 0; o.hidden = true; continue; }

    easeJump(ul, JUMP_SHARPNESS);
    const u = headingAB ? EASE.s : 1 - EASE.s;
    const ux = dx / len, uy = dy / len, uz = dz / len;
    // Lateral offset perpendicular in the galactic plane; side follows heading for two-way lanes.
    let px = -uz, pz = ux;
    let pl = Math.sqrt(px * px + pz * pz);
    if (pl < 1e-4) { px = 1; pz = 0; pl = 1; }
    px /= pl; pz /= pl;
    // Taper to zero at both docks so ships arrive AT the port instead of vanishing beside it.
    const taper = smoothstepCPU(0, 0.12, ul) * (1 - smoothstepCPU(0.88, 1, ul));
    const off = ((headingAB ? 1 : -1) * LANE_HALF + o.offBase) * taper;

    pos[base] = A.x + ux * len * u + px * off;
    pos[base + 1] = A.y + uy * len * u;
    pos[base + 2] = A.z + uz * len * u + pz * off;
    // Materialize/dematerialize at the docks instead of popping in and out.
    pos[base + 3] = o.scale * smoothstepCPU(0, 0.04, ul) * (1 - smoothstepCPU(0.96, 1, ul));
    const arcW = smoothstepCPU(0, 0.15, ul) * (1 - smoothstepCPU(0.85, 1, ul));
    arcOverStar(pos, base, o.starA, arcW);
    arcOverStar(pos, base, o.starB, arcW);

    /* Orient by ACTUAL frame-to-frame motion (includes arcs, taper convergence, avoidance),
       exponentially smoothed so docking maneuvers turn the nose instead of snapping it. */
    const mot = o.handle.motionArr;
    const mdx = pos[base] - o.lx, mdy = pos[base + 1] - o.ly, mdz = pos[base + 2] - o.lz;
    const md = Math.hypot(mdx, mdy, mdz);
    let tx3, ty3, tz3;
    if (!o.hidden && md > 1e-5) { tx3 = mdx / md; ty3 = mdy / md; tz3 = mdz / md; }
    else {
      const sgn = headingAB ? 1 : -1;
      tx3 = ux * sgn; ty3 = uy * sgn; tz3 = uz * sgn;
    }
    if (o.hidden) { o.sx = tx3; o.sy = ty3; o.sz = tz3; }
    else {
      o.sx += (tx3 - o.sx) * turnSmooth;
      o.sy += (ty3 - o.sy) * turnSmooth;
      o.sz += (tz3 - o.sz) * turnSmooth;
      const sl = Math.hypot(o.sx, o.sy, o.sz);
      if (sl > 1e-4) { o.sx /= sl; o.sy /= sl; o.sz /= sl; }
      else { o.sx = tx3; o.sy = ty3; o.sz = tz3; }
    }
    mot[base] = o.sx; mot[base + 1] = o.sy; mot[base + 2] = o.sz;
    mot[base + 3] = Math.min(1, EASE.v / JUMP_PEAK);
    o.lx = pos[base]; o.ly = pos[base + 1]; o.lz = pos[base + 2];
    o.hidden = false;

    // Jump flash: tight gaussian bumps near leg entry/exit read as a warp blink, not a strobe.
    if (FLASH_INTENSITY > 0) {
      const d1 = (ul - 0.1) / 0.03, d2 = (ul - 0.9) / 0.03;
      const fl = Math.exp(-d1 * d1) + Math.exp(-d2 * d2);
      tint[base + 2] = fl > 0.03 ? Math.min(1, fl * FLASH_INTENSITY) : 0;
    }
  }

  for (let s = 0; s < instanceHandles.length; s++) {
    instanceHandles[s].dirtyPos();
    instanceHandles[s].dirtyMotion();
    if (FLASH_INTENSITY > 0) instanceHandles[s].dirtyTint();
  }
}

/* Parked wrecks ride the belt's exact rotation (systems.angularSpeed == asteroids') plus a tiny
   micro-wander; drifters add a slow canonical drift; orbiters track a live body, falling back to a swirled canonical point if the parent is missing (no NaN). Trivial per-frame cost at this count. */
function updateDerelicts(wt) {
  for (let i = 0; i < derelictShips.length; i++) {
    const o = derelictShips[i];
    const pos = o.handle.posArr;
    const base = o.slot * 4;
    let wx, wy, wz;

    if (o.mode === 'parked') {
      const rot = sysApi.canonicalToRotatedInto(ROT, o.cx, o.cz, wt);
      wx = rot.x + Math.sin(wt * 0.40 + o.ph0) * PARK_DRIFT_AMP;
      wy = o.y + Math.sin(wt * 0.30 + o.ph1) * PARK_DRIFT_AMP;
      wz = rot.z + Math.cos(wt * 0.35 + o.ph2) * PARK_DRIFT_AMP;
    } else if (o.mode === 'drifter') {
      const rot = sysApi.canonicalToRotatedInto(ROT, o.cx + o.vx * wt, o.cz + o.vz * wt, wt);
      wx = rot.x; wy = o.y + o.vy * wt; wz = rot.z;
    } else {
      const P = sysApi.getBodyWorldPos(o.parentId);
      if (P) {
        const a = wt * o.orbW + o.ph0;
        wx = P.x + Math.cos(a) * o.orbR; wy = P.y + o.yOff; wz = P.z + Math.sin(a) * o.orbR;
      } else {
        const rot = sysApi.canonicalToRotatedInto(ROT, o.fbx, o.fbz, wt);
        wx = rot.x; wy = o.yOff; wz = rot.z;
      }
    }

    pos[base] = wx; pos[base + 1] = wy; pos[base + 2] = wz; pos[base + 3] = o.scale;
    // Wrap the spin angle: unbounded wt × spin loses float32 precision over long sessions.
    o.handle.motionArr[base + 3] = (wt * o.sp + o.sph) % TAU;
  }
  for (let h = 0; h < derelictHandles.length; h++) {
    derelictHandles[h].dirtyPos();
    derelictHandles[h].dirtyMotion();
  }
}

export function setVisible(v) {
  shipsVisible = v;
  for (const m of hullMeshes) m.visible = v;
  for (const m of engineMeshes) m.visible = v;
}

/* External write surface: one handle per sheet. Write into the Float32 arrays, call the matching
   dirty*() helper, then setCount(activeInstances). Regular sheets expose sheet.meta (+ computeWindow); custom sheets expose sheet.customWindows. */
export function getInstanceArrays() {
  return instanceHandles;
}

export { computeWindow };

export function dispose() {
  for (const m of [...hullMeshes, ...engineMeshes]) {
    sceneRef?.remove(m);
    m.geometry.dispose();
    m.material.dispose();
  }
  hullMeshes = [];
  engineMeshes = [];
  instanceHandles = [];
  trafficShips = [];
  trafficReady = false;
  derelictHandles = [];
  derelictShips = [];
  derelictReady = false;
  offLaneHandle = null;
  shuttlePool = [];
  shuttleBodyIds = [];
  shuttleFocusRoot = null;
  shuttleActive = false;
  traderShips = [];
  tradersReady = false;
}
