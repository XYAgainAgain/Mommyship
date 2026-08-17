/* Warp background — WebGPU/TSL port of the hyperspace warp lab, replacing the old
   box-shadow starfield. The Galacticity slider keeps its old contract: 0 hides,
   opacity + star density scale with it, 100 reveals JUMP (full warp envelope). */
import * as THREE from 'three/webgpu';
import {
  Fn, attribute, uniform, varyingProperty, positionLocal, uv,
  vec2, vec3, vec4, float, sin, cos, atan, mix, clamp, smoothstep, min, max, abs, fract, pow, length, dot,
  Break, Discard, If, Loop, mx_noise_float,
} from 'three/tsl';

const TAU = Math.PI * 2;
const NEBULA_SEED = crypto.getRandomValues(new Uint32Array(1))[0];
const GALACTICITY_KEY = 'mommyship-galacticity';
const GALACTICITY_DEFAULT = 40;
const REDUCED_MOTION = matchMedia('(prefers-reduced-motion: reduce)').matches;

const clampJS = (x, a, b) => x < a ? a : x > b ? b : x;
const lerp = (a, b, t) => a + (b - a) * t;
function smoothJS(a, b, x) { const t = clampJS((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
function mulberry32(seed) {
  let s = seed >>> 0;
  return function () {
    s |= 0; s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const STAR_PALETTE = [
  { r: 255, g: 255, b: 255, w: 5 }, { r: 220, g: 230, b: 255, w: 2 }, { r: 170, g: 191, b: 255, w: 1 },
  { r: 255, g: 244, b: 232, w: 2 }, { r: 255, g: 237, b: 151, w: 1.5 }, { r: 255, g: 196, b: 107, w: 1 },
  { r: 255, g: 154, b: 92, w: 0.5 },
];
const PALETTE_TOTAL = STAR_PALETTE.reduce((a, p) => a + p.w, 0);
function pickStarColor(rng) {
  let roll = rng() * PALETTE_TOTAL, c = 0;
  for (const p of STAR_PALETTE) { c += p.w; if (roll <= c) return p; }
  return STAR_PALETTE[0];
}
const GALAXY_TINTS = [[150, 180, 255], [255, 225, 170], [255, 180, 220], [200, 255, 240], [190, 200, 255]];
const LAYER_PAR = [0.7, 1.0, 1.6];
const LAYER_SIZE = [1.0, 1.5, 2.3];

/* Frozen to SamDefaults.txt from the warp lab — the lab remains the tuning surface */
const C = {
  seed: 6942069,
  starCount: 2500, flySpeed: 0.005, depthExp: 1, starSize: 2, brightness: 1.3,
  colorMix: 0.6, twinkle: 0.8, twinkleRate: 1.5, plateauFade: 0.15,
  warpPush: 1.5, streakLen: 500, streakGlowWidth: 6, streakCoreWidth: 1.5, warpSpeedMult: 20,
  galWarpBright: 0.1, galStreakGlowBright: 0.1, galStreakCoreBright: 0.75,
  nebWarpBlur: 2.5, nebWarpTwist: 1.5, nebTwistSpeed: -0.02,
  nebTwistSnap: 1, nebTwistFalloff: 4, nebWarpCondense: 0, nebWarpStretch: 2.9, nebWarpOctDrop: 2,
  nebWarpBright: 1.5, nebWarpSaturation: 1.5, nebSpiralArms: 1,
  jumpDuration: 10, warpAttack: 0.15, warpRelease: 0.13, depthEnvDip: 0.12,
  galCount: 10, galParticles: 420, galSpiralTurns: 1, galArms: 3, galDrift: 0.008, galSize: 50, galBright: 0.7, galSpin: 0.2,
  nebCount: 20, nebSize: 1200, nebBright: 0.5,
  coreGlow: 0.06, coreBlend: 'multiply',
};
if (REDUCED_MOTION) { C.flySpeed = 0; C.galDrift = 0; C.galSpin = 0; C.nebTwistSpeed = 0; }

const CORE_BLENDS = {
  add:      { kind: 0, pma: false, apply: (m) => { m.blending = THREE.AdditiveBlending; } },
  normal:   { kind: 0, pma: false, apply: (m) => { m.blending = THREE.NormalBlending; } },
  screen:   { kind: 1, pma: false, apply: (m) => { m.blending = THREE.CustomBlending; m.blendEquation = THREE.AddEquation; m.blendSrc = THREE.OneFactor; m.blendDst = THREE.OneMinusSrcColorFactor; } },
  subtract: { kind: 1, pma: true, apply: (m) => { m.blending = THREE.SubtractiveBlending; } },
  multiply: { kind: 2, pma: true, apply: (m) => { m.blending = THREE.MultiplyBlending; } },
};

const U = {
  uFly: uniform(0), uGalPhase: uniform(0), uWarp: uniform(0), uNebWarp: uniform(0),
  /* Trig phases accumulate JS-side, wrapped to TAU: WGSL only guarantees sin/cos
     precision below |x| ≈ 65536, and this runs for hours as a site background */
  uTwinklePhase: uniform(0), uGalSpinPhase: uniform(0), uNebTwistT: uniform(0),
  uMaxR: uniform(800), uDepthExp: uniform(C.depthExp), uStarSize: uniform(C.starSize),
  uBright: uniform(C.brightness), uColorMix: uniform(C.colorMix), uTwinkle: uniform(REDUCED_MOTION ? 0 : C.twinkle),
  uPlateau: uniform(C.plateauFade),
  uStreakLen: uniform(C.streakLen), uStreakGlowW: uniform(C.streakGlowWidth), uStreakCoreW: uniform(C.streakCoreWidth),
  uWarpPush: uniform(C.warpPush),
  uGalWarpBright: uniform(C.galWarpBright), uGalStreakGlowBright: uniform(C.galStreakGlowBright),
  uGalStreakCoreBright: uniform(C.galStreakCoreBright),
  uGalSize: uniform(C.galSize), uGalBright: uniform(C.galBright),
  uNebSize: uniform(C.nebSize), uNebBright: uniform(C.nebBright),
  uNebWarpBlur: uniform(C.nebWarpBlur), uNebWarpTwist: uniform(C.nebWarpTwist),
  uNebTwistSnap: uniform(C.nebTwistSnap),
  uNebTwistFalloff: uniform(C.nebTwistFalloff), uNebWarpCondense: uniform(C.nebWarpCondense),
  uNebWarpStretch: uniform(C.nebWarpStretch), uNebOctDrop: uniform(C.nebWarpOctDrop),
  uNebWarpBright: uniform(C.nebWarpBright), uNebWarpSaturation: uniform(C.nebWarpSaturation),
  uNebSpiralArms: uniform(C.nebSpiralArms),
  uNmsNebs: uniform(1),
  uNebRes1: uniform(1.75), uNebRes2: uniform(1.45), uNebResMix: uniform(1),
  uNebDomainWarp: uniform(0.3), uNebOctaves: uniform(4.25), uNebContrast: uniform(4.2),
  uNebColA: uniform(new THREE.Vector3(0.051, 0.051, 0.102)),
  uNebColB: uniform(new THREE.Vector3(0.275, 0.086, 0.663)),
  uNebColC: uniform(new THREE.Vector3(0.851, 0.263, 0.549)),
  uNebColD: uniform(new THREE.Vector3(0.122, 0.349, 0.502)),
  uCoreGlow: uniform(C.coreGlow), uGlowDiam: uniform(2000), uCoreBlendKind: uniform(0),
};

// Packed into vec4s: WebGPU caps a pipeline at 8 vertex buffers, one per attribute.
const aData0 = attribute('aData0', 'vec4');  // dir.xy, z0, par
const aData1 = attribute('aData1', 'vec4');  // size, bright, tw, _
const aColor = attribute('aColor', 'vec3');
const g0 = attribute('g0', 'vec4');          // dir.xy, z0, incl
const g1 = attribute('g1', 'vec4');          // rot, spinDir, phase, gB
const g2 = attribute('g2', 'vec4');          // la, lr, cosRot, sinRot
const aGColor = attribute('aGColor', 'vec3');
const n0 = attribute('n0', 'vec4');             // dir.xy, z0, stretch
const n1 = attribute('n1', 'vec4');             // phase, bright, sizeVar, _

const vLocal = varyingProperty('vec2', 'vLocal'), vHalfLen = varyingProperty('float', 'vHalfLen');
const vRadGlow = varyingProperty('float', 'vRadGlow'), vRadCore = varyingProperty('float', 'vRadCore');
const vAlpha = varyingProperty('float', 'vAlpha'), vColor = varyingProperty('vec3', 'vColor');
const vGLocal = varyingProperty('vec2', 'vGLocal'), vGHalfLen = varyingProperty('float', 'vGHalfLen');
const vGRadGlow = varyingProperty('float', 'vGRadGlow'), vGRadCore = varyingProperty('float', 'vGRadCore');
const vGPointRad = varyingProperty('float', 'vGPointRad');
const vGAlpha = varyingProperty('float', 'vGAlpha'), vGColor = varyingProperty('vec3', 'vGColor');
const vNAlpha = varyingProperty('float', 'vNAlpha'), vNPhase = varyingProperty('float', 'vNPhase');
const vNTubePos = varyingProperty('vec2', 'vNTubePos');
/* Per-instance constants hoisted to the vertex stage: cos/sin of the card phase and its
   color-jitter hash are identical for every fragment of a card */
const vNCosSin = varyingProperty('vec2', 'vNCosSin'), vNJitter = varyingProperty('float', 'vNJitter');

const starVert = Fn(() => {
  const dir = aData0.xy, z0 = aData0.z, par = aData0.w;
  const sizeBase = aData1.x, brightV = aData1.y, twV = aData1.z;
  const zc = fract(z0.add(U.uFly.mul(par)));
  const r = U.uMaxR.mul(pow(zc, U.uDepthExp)).mul(float(1).add(U.uWarp.mul(U.uWarpPush).mul(0.5)));
  const streak = U.uStreakLen.mul(U.uWarp).mul(zc.mul(0.85).add(0.15));
  const tailR = max(r.sub(streak), float(0));
  const halfLen = r.sub(tailR).mul(0.5);
  const center = dir.mul(r.add(tailR).mul(0.5));
  const size = sizeBase.mul(U.uStarSize).mul(zc.mul(0.55).add(0.45));
  const radGlow = min(size.mul(U.uStreakGlowW), float(26)).mul(0.5);
  const radCore = max(size.mul(U.uStreakCoreW).mul(0.5), float(0.6));
  const along = positionLocal.x.mul(halfLen.add(radGlow).mul(2));
  const perp = positionLocal.y.mul(radGlow.mul(2));
  const perpDir = vec2(dir.y.negate(), dir.x);
  const pos2 = center.add(dir.mul(along)).add(perpDir.mul(perp));

  vLocal.assign(vec2(along, perp));
  vHalfLen.assign(halfLen);
  vRadGlow.assign(radGlow);
  vRadCore.assign(radCore);

  const fadeIn = smoothstep(float(0), U.uPlateau, zc);
  const fadeOut = float(1).sub(smoothstep(float(1).sub(U.uPlateau), float(1), zc));
  const radial = smoothstep(float(0), float(50), r);
  const twRaw = float(0.5).add(float(0.5).mul(sin(U.uTwinklePhase.add(twV.mul(6.2831853)))));
  const tw = mix(float(1), twRaw, U.uTwinkle.mul(float(1).sub(U.uWarp)));
  vAlpha.assign(brightV.mul(U.uBright).mul(fadeIn).mul(fadeOut).mul(radial).mul(tw));
  vColor.assign(mix(vec3(1, 1, 1), aColor, U.uColorMix));

  return vec3(pos2.x, pos2.y, float(0));
});

const starFrag = Fn(() => {
  const cxp = clamp(vLocal.x, vHalfLen.negate(), vHalfLen);
  const d = length(vec2(vLocal.x.sub(cxp), vLocal.y));
  const glow = float(1).sub(smoothstep(float(0), vRadGlow, d));
  const core = float(1).sub(smoothstep(float(0), vRadCore, d));
  const a = clamp(glow.mul(0.18).add(core).mul(vAlpha), float(0), float(1));
  return vec4(vColor, a);
});

const galVert = Fn(() => {
  const gDir = g0.xy, gz0 = g0.z, gIncl = g0.w;
  const gSpinDir = g1.y, gPhase = g1.z, gB = g1.w;
  const la = g2.x, lr = g2.y;
  const gz = fract(gz0.add(U.uGalPhase));
  const center = gDir.mul(U.uMaxR.mul(gz));
  const gsize = U.uGalSize.mul(gz.mul(0.7).add(0.3));
  const spin = U.uGalSpinPhase.mul(gSpinDir).add(gPhase);
  /* cr/sr precomputed CPU-side into g2.zw — gRot is constant per galaxy */
  const cs = cos(spin), sn = sin(spin), cr = g2.z, sr = g2.w;
  const ax = cos(la).mul(lr), ay = sin(la).mul(lr).mul(gIncl);
  const sx = ax.mul(cs).sub(ay.mul(sn)), sy = ax.mul(sn).add(ay.mul(cs));
  const wx = sx.mul(cr).sub(sy.mul(sr)), wy = sx.mul(sr).add(sy.mul(cr));
  const ppos = center.add(vec2(wx, wy).mul(gsize));
  const psize = max(gsize.mul(0.02).mul(float(1.3).sub(lr)), float(1.5));
  const streak = U.uStreakLen.mul(U.uWarp).mul(gz.mul(0.85).add(0.15));
  const halfLen = min(streak, length(ppos)).mul(0.5);
  const streakCenter = ppos.sub(gDir.mul(halfLen));
  const warpRad = min(psize.mul(U.uStreakGlowW), float(26)).mul(0.5);
  const radGlow = mix(psize, warpRad, U.uWarp);
  const radCore = max(psize.mul(U.uStreakCoreW).mul(0.5), float(0.6));
  const along = positionLocal.x.mul(halfLen.add(radGlow).mul(2));
  const perp = positionLocal.y.mul(radGlow.mul(2));
  const perpDir = vec2(gDir.y.negate(), gDir.x);
  const pos2 = streakCenter.add(gDir.mul(along)).add(perpDir.mul(perp));

  vGLocal.assign(vec2(along, perp));
  vGHalfLen.assign(halfLen);
  vGRadGlow.assign(radGlow);
  vGRadCore.assign(radCore);
  vGPointRad.assign(psize);

  const fadeIn = smoothstep(float(0), float(0.14), gz);
  const fadeOut = float(1).sub(smoothstep(float(0.86), float(1), gz));
  vGAlpha.assign(U.uGalBright.mul(fadeIn).mul(fadeOut).mul(gB));
  vGColor.assign(aGColor);
  return vec3(pos2.x, pos2.y, float(0));
});

const galFrag = Fn(() => {
  const cxp = clamp(vGLocal.x, vGHalfLen.negate(), vGHalfLen);
  const d = length(vec2(vGLocal.x.sub(cxp), vGLocal.y));
  const point = float(1).sub(smoothstep(float(0), vGPointRad, d));
  const glow = float(1).sub(smoothstep(float(0), vGRadGlow, d));
  const core = float(1).sub(smoothstep(float(0), vGRadCore, d));
  const capsule = glow.mul(U.uGalStreakGlowBright).add(core.mul(U.uGalStreakCoreBright)).mul(U.uGalWarpBright);
  const a = clamp(mix(point, capsule, U.uWarp).mul(vGAlpha), float(0), float(1));
  return vec4(vGColor, a);
});

const nebulaCloud = Fn(([p, seed]) => {
  const n = mx_noise_float(p.add(seed));
  return sin(n.mul(7)).mul(0.5).add(0.5);
});

const nebulaCloudNoise = Fn(([pos, frq, seed]) => {
  const n = float(0).toVar();
  const gain = float(1).toVar();
  /* Warp sheds fine octaves: the stretched cards cover ~2× the pixels mid-jump, and the
     radial smear hides the detail anyway — pays for the stretch on fill-bound GPUs */
  const effOct = max(U.uNebOctaves.sub(U.uNebWarp.mul(U.uNebOctDrop)), float(1));
  Loop({ start: 0, end: 8 }, ({ i }) => {
    If(float(i).greaterThanEqual(effOct), () => { Break(); });
    const octWeight = clamp(effOct.sub(float(i)), float(0), float(1));
    n.addAssign(nebulaCloud(pos.mul(gain).div(frq), seed.add(float(i).mul(10))).mul(float(0.5).div(gain)).mul(octWeight));
    gain.mulAssign(2);
  });
  return n;
});

const nebulaSample = Fn(([rp, phase]) => {
  const p = vec3(rp.x, rp.y, phase.mul(0.13));
  const seed = vec3(phase);
  const c1 = nebulaCloudNoise(p, U.uNebRes1, seed);
  const c2 = nebulaCloudNoise(p.add(vec3(c1.mul(U.uNebDomainWarp))), U.uNebRes2, seed.add(310.4));
  const c3 = nebulaCloudNoise(p, U.uNebResMix, seed.add(661.384));
  return vec3(c1, c2, c3);
});

/* Dark layer never reads c3 — skipping its FBM stack cuts a third of that pass's noise cost */
const nebulaSampleDark = Fn(([rp, phase]) => {
  const p = vec3(rp.x, rp.y, phase.mul(0.13));
  const seed = vec3(phase);
  const c1 = nebulaCloudNoise(p, U.uNebRes1, seed);
  const c2 = nebulaCloudNoise(p.add(vec3(c1.mul(U.uNebDomainWarp))), U.uNebRes2, seed.add(310.4));
  return vec2(c1, c2);
});

const nmsRamp = Fn(([t]) => {
  const color = mix(vec3(0.0235, 0.0275, 0.0745), vec3(0.0667, 0.0824, 0.1843), smoothstep(0, 0.2, t)).toVar();
  color.assign(mix(color, vec3(0.1137, 0.2471, 0.5529), smoothstep(0.2, 0.4, t)));
  color.assign(mix(color, vec3(0.4392, 0.2941, 0.6667), smoothstep(0.4, 0.6, t)));
  color.assign(mix(color, vec3(0.6353, 0.3490, 0.8392), smoothstep(0.6, 0.8, t)));
  color.assign(mix(color, vec3(1, 0.3608, 0.5490), smoothstep(0.8, 1, t)));
  return color;
});

const warpNebulaUv = Fn(([p, tubePos]) => {
  const gateBase = smoothstep(float(0), U.uNebTwistSnap, U.uNebWarp);
  const gate = smoothstep(float(0), float(1), gateBase);
  const radius = clamp(length(tubePos), float(0), float(1));
  const radialWarp = pow(float(1).sub(radius), U.uNebTwistFalloff);
  const theta = atan(tubePos.y, tubePos.x.add(0.000001));
  const turns = U.uNebWarpTwist.add(U.uNebTwistT);
  const armPhase = theta.mul(U.uNebSpiralArms).sub(radius.mul(9)).add(U.uNebTwistT.mul(6.2831853));
  const armWave = sin(armPhase).mul(0.5).add(0.5);
  const angle = turns.mul(gate).mul(float(0.25).add(radialWarp.mul(0.75))).mul(float(0.55).add(armWave.mul(0.45))).mul(6.2831853);
  const cs = cos(angle), sn = sin(angle);
  const warpedTube = vec2(tubePos.x.mul(cs).sub(tubePos.y.mul(sn)), tubePos.x.mul(sn).add(tubePos.y.mul(cs)));
  const tubeOffset = warpedTube.sub(tubePos).mul(2.2);
  const condensed = p.mul(float(1).add(U.uNebWarpCondense.mul(gate).mul(radialWarp)));
  return condensed.add(tubeOffset);
});

const nebulaVert = Fn(() => {
  const baseDir = n0.xy, nz0 = n0.z, stretch = n0.w;
  const nz = fract(nz0.add(U.uGalPhase));
  const nebWarp = smoothstep(float(0), float(1), U.uNebWarp);
  const center = baseDir.mul(U.uMaxR.mul(nz));
  /* Geometric stretch (not blur): cards grow with warp so the twisted tube reaches the screen edges */
  const size = U.uNebSize.mul(n1.z).mul(nz.mul(0.7).add(0.3)).mul(mix(float(1), U.uNebWarpStretch, nebWarp));
  const streak = U.uStreakLen.mul(nebWarp).mul(nz.mul(0.85).add(0.15)).mul(U.uNebWarpBlur);
  const halfLen = min(streak, length(center)).mul(0.5);
  const streakCenter = center.sub(baseDir.mul(halfLen));
  const along = positionLocal.x.mul(halfLen.add(size).mul(2));
  const perp = positionLocal.y.mul(size.mul(stretch).mul(2));
  const perpDir = vec2(baseDir.y.negate(), baseDir.x);
  const pos2 = streakCenter.add(baseDir.mul(along)).add(perpDir.mul(perp));

  const fadeIn = smoothstep(float(0), float(0.18), nz);
  const fadeOut = float(1).sub(smoothstep(float(0.78), float(1), nz));
  vNAlpha.assign(U.uNebBright.mul(n1.y).mul(fadeIn).mul(fadeOut));
  vNPhase.assign(n1.x);
  vNCosSin.assign(vec2(cos(n1.x), sin(n1.x)));
  vNJitter.assign(fract(sin(n1.x.mul(12.9898)).mul(43758.5453)));
  vNTubePos.assign(pos2.div(U.uMaxR));
  return vec3(pos2.x, pos2.y, float(0));
});

const nebulaFrag = Fn(() => {
  const p = uv().sub(vec2(0.5)).mul(2);
  const cardRadius = max(abs(p.x), abs(p.y));
  const cardGuard = float(1).sub(smoothstep(float(0.78), float(0.98), cardRadius));
  /* Corners contribute nothing — bail before the FBM stacks run */
  If(cardGuard.lessThan(float(0.005)), () => { Discard(); });
  const cs = vNCosSin.x, sn = vNCosSin.y;
  const baseRp = vec2(p.x.mul(cs).sub(p.y.mul(sn)), p.x.mul(sn).add(p.y.mul(cs)));
  const rp = warpNebulaUv(baseRp, vNTubePos);
  const clouds = nebulaSample(rp, vNPhase);
  const c1 = clouds.x, c2 = clouds.y, c3 = clouds.z;
  const warpedDist = length(rp).add(c1.sub(0.5).mul(0.32));
  const edge = float(1).sub(smoothstep(float(0.58), float(1.12), warpedDist));
  const strength = pow(c2, U.uNebContrast).mul(2);
  const baseRamp = mix(mix(U.uNebColA, U.uNebColB, c3), mix(U.uNebColC, U.uNebColD, c3), c1);
  const jitter = vNJitter.sub(0.5).mul(0.12);
  const nmsColor = nmsRamp(clamp(c3.mul(0.55).add(c1.mul(0.45)).add(jitter), float(0), float(1)));
  const warpGate = smoothstep(float(0), float(1), U.uNebWarp);
  const nmsMix = warpGate.mul(U.uNmsNebs);
  const ramp = mix(baseRamp, nmsColor, nmsMix).toVar();
  const luminance = dot(ramp, vec3(0.2126, 0.7152, 0.0722));
  ramp.assign(mix(vec3(luminance), ramp, mix(float(1), U.uNebWarpSaturation, warpGate)));
  const boostedStrength = strength.mul(mix(float(1), U.uNebWarpBright, warpGate));
  const coverage = clamp(edge.mul(edge).mul(cardGuard).mul(vNAlpha), float(0), float(1));
  return vec4(ramp.mul(boostedStrength).mul(coverage), coverage);
});

const nebulaDarkFrag = Fn(() => {
  const p = uv().sub(vec2(0.5)).mul(2);
  const cardRadius = max(abs(p.x), abs(p.y));
  const cardGuard = float(1).sub(smoothstep(float(0.78), float(0.98), cardRadius));
  If(cardGuard.lessThan(float(0.005)), () => { Discard(); });
  const cs = vNCosSin.x, sn = vNCosSin.y;
  const baseRp = vec2(p.x.mul(cs).sub(p.y.mul(sn)), p.x.mul(sn).add(p.y.mul(cs)));
  const rp = warpNebulaUv(baseRp, vNTubePos);
  const clouds = nebulaSampleDark(rp, vNPhase);
  const c1 = clouds.x, c2 = clouds.y;
  const warpedDist = length(rp).add(c1.sub(0.5).mul(0.32));
  const edge = float(1).sub(smoothstep(float(0.52), float(1.08), warpedDist));
  const absorption = clamp(edge.mul(edge).mul(cardGuard).mul(pow(c2, U.uNebContrast)).mul(vNAlpha).mul(2.1), float(0), float(0.72));
  const nmsMix = smoothstep(float(0), float(1), U.uNebWarp).mul(U.uNmsNebs);
  const darkColor = mix(vec3(0.035, 0.025, 0.085), vec3(0.0235, 0.0275, 0.0745), nmsMix);
  const tint = mix(vec3(1), darkColor, absorption);
  return vec4(tint, 1);
});

const coreVert = Fn(() => vec3(positionLocal.x.mul(U.uGlowDiam), positionLocal.y.mul(U.uGlowDiam), float(0)));
const coreFrag = Fn(() => {
  const d = length(uv().sub(vec2(0.5, 0.5))).mul(2);
  const fall = float(1).sub(smoothstep(float(0), float(1), d));
  const inten = U.uCoreGlow.mul(float(0.5).add(U.uWarp.mul(0.5)));
  const s = clamp(fall.mul(fall).mul(inten), float(0), float(1));
  const color = vec3(0.46, 0.5, 0.78);
  /* kind 0 = alpha blends (add/normal), 1 = premultiplied rgb (screen/subtract), 2 = multiply (white = no-op) */
  const out = vec4(color, s).toVar();
  If(U.uCoreBlendKind.equal(float(1)), () => { out.assign(vec4(color.mul(s), 1)); });
  If(U.uCoreBlendKind.equal(float(2)), () => { out.assign(vec4(mix(vec3(1, 1, 1), color, s), 1)); });
  return out;
});

function additiveQuadMaterial(posNode, fragNode) {
  const m = new THREE.MeshBasicNodeMaterial();
  m.positionNode = posNode;
  m.fragmentNode = fragNode;
  m.transparent = true;
  m.blending = THREE.AdditiveBlending;
  m.depthTest = false;
  m.depthWrite = false;
  m.side = THREE.DoubleSide;
  return m;
}

function screenQuadMaterial(posNode, fragNode) {
  const m = new THREE.MeshBasicNodeMaterial();
  m.positionNode = posNode;
  m.fragmentNode = fragNode;
  m.transparent = true;
  m.blending = THREE.CustomBlending;
  m.blendEquation = THREE.AddEquation;
  m.blendSrc = THREE.OneFactor;
  m.blendDst = THREE.OneMinusSrcColorFactor;
  m.depthTest = false;
  m.depthWrite = false;
  m.side = THREE.DoubleSide;
  return m;
}

function multiplyQuadMaterial(posNode, fragNode) {
  const m = new THREE.MeshBasicNodeMaterial();
  m.positionNode = posNode;
  m.fragmentNode = fragNode;
  m.transparent = true;
  m.blending = THREE.MultiplyBlending;
  m.premultipliedAlpha = true;
  m.depthTest = false;
  m.depthWrite = false;
  m.side = THREE.DoubleSide;
  return m;
}

function makeInstanced(count, attrs) {
  const base = new THREE.PlaneGeometry(1, 1);
  const geo = new THREE.InstancedBufferGeometry();
  geo.index = base.index;
  geo.setAttribute('position', base.getAttribute('position'));
  geo.setAttribute('uv', base.getAttribute('uv'));
  geo.setAttribute('normal', base.getAttribute('normal'));
  for (const [name, size, arr] of attrs) geo.setAttribute(name, new THREE.InstancedBufferAttribute(arr, size));
  geo.instanceCount = count;
  return geo;
}

/* Galacticity scales star density: 25% of the tuned field at slider 1, full field at 100 */
function effectiveStarCount() {
  return Math.round(C.starCount * (0.25 + 0.75 * galacticity / 100));
}

function buildStarGeometry() {
  const rng = mulberry32(C.seed * 2 + 1);
  const N = effectiveStarCount();
  const d0 = new Float32Array(N * 4), d1 = new Float32Array(N * 4), col = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const roll = rng();
    const layer = roll < 0.55 ? 0 : roll < 0.85 ? 1 : 2;
    const ang = rng() * TAU;
    d0[i * 4] = Math.cos(ang); d0[i * 4 + 1] = Math.sin(ang); d0[i * 4 + 2] = rng(); d0[i * 4 + 3] = LAYER_PAR[layer];
    d1[i * 4] = LAYER_SIZE[layer]; d1[i * 4 + 1] = 0.3 + rng() * 0.7; d1[i * 4 + 2] = rng(); d1[i * 4 + 3] = 0;
    const c = pickStarColor(rng);
    col[i * 3] = c.r / 255; col[i * 3 + 1] = c.g / 255; col[i * 3 + 2] = c.b / 255;
  }
  return makeInstanced(N, [['aData0', 4, d0], ['aData1', 4, d1], ['aColor', 3, col]]);
}

function buildGalaxyGeometry() {
  const rng = mulberry32(C.seed * 7 + 3);
  const G = C.galCount, P = C.galParticles, N = G * P;
  const arms = Math.max(1, Math.round(C.galArms));
  const A0 = new Float32Array(N * 4), A1 = new Float32Array(N * 4), A2 = new Float32Array(N * 4), col = new Float32Array(N * 3);
  let idx = 0;
  for (let gi = 0; gi < G; gi++) {
    const ang = rng() * TAU, dx = Math.cos(ang), dy = Math.sin(ang);
    const gz0 = rng(), gIn = 0.18 + rng() * 0.72, gRo = rng() * TAU, gSp = rng() < 0.5 ? -1 : 1, gPh = rng() * TAU;
    const crJS = Math.cos(gRo), srJS = Math.sin(gRo);
    const tint = GALAXY_TINTS[(rng() * GALAXY_TINTS.length) | 0];
    for (let k = 0; k < P; k++) {
      const t = k / P, arm = k % arms;
      const angle = t * C.galSpiralTurns * TAU + arm * (TAU / arms) + (rng() - 0.5) * 0.4 * (1 - t);
      const radius = Math.pow(t, 0.85) * 0.95 + rng() * 0.05;
      const core = smoothJS(0.32, 0, t);
      A0[idx * 4] = dx; A0[idx * 4 + 1] = dy; A0[idx * 4 + 2] = gz0; A0[idx * 4 + 3] = gIn;
      A1[idx * 4] = gRo; A1[idx * 4 + 1] = gSp; A1[idx * 4 + 2] = gPh; A1[idx * 4 + 3] = (0.45 + rng() * 0.55) * (0.6 + core * 0.8);
      A2[idx * 4] = angle; A2[idx * 4 + 1] = radius; A2[idx * 4 + 2] = crJS; A2[idx * 4 + 3] = srJS;
      col[idx * 3] = lerp(tint[0], 255, core) / 255; col[idx * 3 + 1] = lerp(tint[1], 255, core) / 255; col[idx * 3 + 2] = lerp(tint[2], 255, core) / 255;
      idx++;
    }
  }
  return makeInstanced(N, [['g0', 4, A0], ['g1', 4, A1], ['g2', 4, A2], ['aGColor', 3, col]]);
}

function buildNebulaGeometry(seed, count, dark = false) {
  const rng = mulberry32(seed);
  const N = count;
  const A0 = new Float32Array(N * 4), A1 = new Float32Array(N * 4);
  for (let i = 0; i < N; i++) {
    const ang = rng() * TAU;
    A0[i * 4] = Math.cos(ang); A0[i * 4 + 1] = Math.sin(ang); A0[i * 4 + 2] = rng(); A0[i * 4 + 3] = 0.45 + rng() * 0.55;
    A1[i * 4] = rng() * TAU; A1[i * 4 + 1] = 0.55 + rng() * 0.45;
    A1[i * 4 + 2] = dark ? 0.85 + rng() * 0.5 : 0.75 + rng() * 0.5;
  }
  return makeInstanced(N, [['n0', 4, A0], ['n1', 4, A1]]);
}

/* State */
let renderer, scene, camera, canvas, starMesh, galaxyMesh, nebulaDarkMesh, nebulaMesh, coreMesh, coreMat;
let W = 0, H = 0, maxR = 0;
let flyPhase = 0, galPhase = 0, prev = 0;
let twinklePhase = 0, galSpinPhase = 0, nebTwistT = 0;
let nebWarpState = 0;
let initState = 'idle'; // idle | starting | ready | failed
let running = false;
let galacticity = GALACTICITY_DEFAULT;

const slider = document.getElementById('galacticity-slider');
const jumpBtn = document.getElementById('jump-btn');

function getGalacticity() {
  try {
    const stored = localStorage.getItem(GALACTICITY_KEY);
    if (stored !== null) {
      const val = parseInt(stored);
      if (!isNaN(val) && val >= 0 && val <= 100) return val;
    }
  } catch (e) { /* localStorage unavailable */ }
  return GALACTICITY_DEFAULT;
}
function setGalacticity(val) {
  try { localStorage.setItem(GALACTICITY_KEY, val.toString()); } catch (e) { /* unavailable */ }
}

const jump = { active: false, t0: 0 };
function envelopeWarp(now) {
  if (!jump.active) return 0;
  const t = (now - jump.t0) / (C.jumpDuration * 1000);
  if (t >= 1) { jump.active = false; endJumpUi(); return 0; }
  if (t < C.warpAttack) return smoothJS(0, C.warpAttack, t);
  if (t > 1 - C.warpRelease) return smoothJS(1, 1 - C.warpRelease, t);
  return 1;
}

/* Depth-curve envelope: snap toward exp 3 at jump start, glide home over the jump,
   small under-dip through the release window as the streaks retract */
function depthEnvelope(now) {
  if (!jump.active) return 0;
  const t = (now - jump.t0) / (C.jumpDuration * 1000);
  if (t <= 0 || t >= 1) return 0;
  const rise = smoothJS(0, 0.08, t);
  const glide = 1 - smoothJS(0.2, 1 - C.warpRelease, t);
  const relStart = 1 - C.warpRelease;
  const dip = t > relStart ? Math.sin(((t - relStart) / C.warpRelease) * Math.PI) * C.depthEnvDip : 0;
  return rise * glide - dip;
}

function startJump() {
  if (jump.active || initState !== 'ready') return;
  jump.active = true;
  jump.t0 = performance.now();
  if (slider) slider.disabled = true;
  if (jumpBtn) jumpBtn.disabled = true;
}
function endJumpUi() {
  if (slider) slider.disabled = false;
  if (jumpBtn) jumpBtn.disabled = false;
}

function applyCoreBlend() {
  const b = CORE_BLENDS[C.coreBlend] || CORE_BLENDS.add;
  /* r184 WebGPU refuses Subtractive/MultiplyBlending unless premultipliedAlpha is set */
  coreMat.premultipliedAlpha = b.pma;
  b.apply(coreMat);
  U.uCoreBlendKind.value = b.kind;
  coreMat.needsUpdate = true;
}

function onResize() {
  if (!renderer) return;
  W = window.innerWidth; H = window.innerHeight;
  renderer.setPixelRatio(1);
  renderer.setSize(W, H);
  camera.left = -W / 2; camera.right = W / 2; camera.top = H / 2; camera.bottom = -H / 2;
  camera.updateProjectionMatrix();
  maxR = Math.hypot(W, H) * 0.55;
  U.uMaxR.value = maxR;
  U.uGlowDiam.value = maxR * 2.4;
}

function loop() {
  const now = performance.now();
  const dt = clampJS((now - prev) / 1000, 0, 0.05);
  prev = now;

  const warp = envelopeWarp(now);
  U.uDepthExp.value = C.depthExp + (3 - C.depthExp) * depthEnvelope(now);
  const nebResponse = warp > nebWarpState ? 2.6 : 1.8;
  nebWarpState += (warp - nebWarpState) * (1 - Math.exp(-nebResponse * dt));
  if (Math.abs(warp - nebWarpState) < 0.0001) nebWarpState = warp;
  // Leave phases unbounded: the per-star aPar multiplier means modulo-wrapping would shift the field.
  flyPhase += C.flySpeed * (1 + warp * C.warpSpeedMult) * dt;
  galPhase += C.galDrift * (1 + warp * C.warpSpeedMult) * dt;
  twinklePhase = (twinklePhase + C.twinkleRate * dt) % TAU;
  galSpinPhase = (galSpinPhase + C.galSpin * dt) % TAU;
  /* Twist drift resets at idle: bounds the trig arg and makes every jump's spiral identical */
  nebTwistT = nebWarpState > 0.001 ? nebTwistT + C.nebTwistSpeed * dt : 0;
  U.uFly.value = flyPhase; U.uGalPhase.value = galPhase; U.uWarp.value = warp; U.uNebWarp.value = nebWarpState;
  U.uTwinklePhase.value = twinklePhase; U.uGalSpinPhase.value = galSpinPhase; U.uNebTwistT.value = nebTwistT;

  renderer.render(scene, camera);
}

async function initRenderer() {
  initState = 'starting';
  try {
    canvas = document.createElement('canvas');
    canvas.id = 'warp-bg';
    document.body.prepend(canvas);

    renderer = new THREE.WebGPURenderer({ canvas, antialias: true });
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    renderer.setClearColor(0x000000, 1);
    await renderer.init();

    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
    camera.position.z = 10;

    starMesh = new THREE.Mesh(buildStarGeometry(), additiveQuadMaterial(starVert(), starFrag()));
    galaxyMesh = new THREE.Mesh(buildGalaxyGeometry(), additiveQuadMaterial(galVert(), galFrag()));
    nebulaDarkMesh = new THREE.Mesh(
      buildNebulaGeometry(NEBULA_SEED ^ 0x9E3779B9, Math.ceil(C.nebCount * 0.55), true),
      multiplyQuadMaterial(nebulaVert(), nebulaDarkFrag()));
    nebulaMesh = new THREE.Mesh(buildNebulaGeometry(NEBULA_SEED, C.nebCount), screenQuadMaterial(nebulaVert(), nebulaFrag()));
    nebulaMesh.renderOrder = -1; nebulaDarkMesh.renderOrder = 2;
    coreMat = additiveQuadMaterial(coreVert(), coreFrag());
    applyCoreBlend();
    coreMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), coreMat);
    for (const m of [nebulaDarkMesh, nebulaMesh, starMesh, galaxyMesh, coreMesh]) { m.frustumCulled = false; scene.add(m); }

    onResize();
    window.addEventListener('resize', onResize);
    initState = 'ready';
    applyGalacticity(galacticity, false);
  } catch (e) {
    /* No WebGPU: no background, and the dead controls go away */
    initState = 'failed';
    if (canvas) canvas.remove();
    document.querySelectorAll('.galacticity-control').forEach((el) => { el.style.display = 'none'; });
    console.warn('Warp background disabled (WebGPU unavailable):', e && e.message ? e.message : e);
  }
}

let rebuildTimer = 0;
function applyGalacticity(val, rebuild) {
  galacticity = val;
  if (!canvas) return;
  canvas.style.opacity = (val / 100).toFixed(2);
  canvas.style.display = val === 0 ? 'none' : '';
  if (jumpBtn) jumpBtn.hidden = REDUCED_MOTION || val < 100;
  if (rebuild && starMesh) {
    clearTimeout(rebuildTimer);
    rebuildTimer = setTimeout(() => {
      starMesh.geometry.dispose();
      starMesh.geometry = buildStarGeometry();
    }, 250);
  }
  syncActive();
}

/* Render only while the canvas is actually visible: slider 0, light scheme, homepage,
   and ocean pages all park the loop via the same CSS-driven check */
function syncActive() {
  if (initState === 'idle' && wantsBackground()) { initRenderer(); return; }
  if (initState !== 'ready') return;
  /* navigation.instant morphs the whole body and drops JS-created nodes — re-attach.
     The element (and its WebGPU context) survives in JS; only the DOM link is lost. */
  if (!canvas.isConnected) document.body.prepend(canvas);
  const visible = galacticity > 0 && canvas.checkVisibility();
  if (visible && !running) {
    running = true;
    prev = performance.now();
    renderer.setAnimationLoop(loop);
  } else if (!visible && running) {
    running = false;
    renderer.setAnimationLoop(null);
  }
}

function wantsBackground() {
  if (galacticity === 0) return false;
  const scheme = document.body.getAttribute('data-md-color-scheme')
    || document.documentElement.getAttribute('data-md-color-scheme');
  if (scheme !== 'slate') return false;
  if (document.querySelector('.homepage-hero') || document.querySelector('.osminok-ocean')) return false;
  return true;
}

/* Wiring */
galacticity = getGalacticity();
if (slider) {
  slider.value = galacticity;
  slider.addEventListener('input', () => {
    const val = parseInt(slider.value);
    setGalacticity(val);
    applyGalacticity(val, true);
  });
}
if (jumpBtn) {
  jumpBtn.hidden = REDUCED_MOTION || galacticity < 100;
  jumpBtn.addEventListener('click', startJump);
}

/* Crossing the slider-hiding breakpoint hides/shows the canvas via CSS — re-check the loop */
matchMedia('(max-width: 29.984375em)').addEventListener('change', syncActive);

new MutationObserver(syncActive).observe(document.documentElement, {
  attributes: true, attributeFilter: ['data-md-color-scheme'],
});
new MutationObserver(syncActive).observe(document.body, {
  attributes: true, attributeFilter: ['data-md-color-scheme'],
});

/* navigation.instant swaps content without reloading this module — re-check visibility
   per page. document$ arrives with Material's bundle, which loads after this module. */
(function bindDocumentStream() {
  if (window.document$) window.document$.subscribe(() => syncActive());
  else setTimeout(bindDocumentStream, 250);
})();

syncActive();
