import * as THREE from 'three';
import {
  Fn, Loop, If, Break, Discard, select, float, vec2, vec3, vec4, mat3, uniform, texture,
  sin, cos, abs, min, max, clamp, mix, step, smoothstep, fract,
  dot, normalize, remapClamp, positionLocal, faceDirection, screenCoordinate
} from 'three/tsl';

/* Volumetric accretion disk: object-space raymarch with inverse-square ray-steering for the
   over/under wrap, ported from prashantkoirala465/Singularity (MIT). Unit-local space (disk in XZ, Y = pole); output is transparent so the galaxy shows through. */

/* sRGB hex → raw 0–1 vec3, authored as direct framebuffer values (galaxy renders LinearSRGBColorSpace,
   no sRGB encode). Vector3 not THREE.Color — avoids a cross-build node-type mismatch (bare `three` maps to three.module.js, separate from three/tsl). */
const hexVec = (hex) => new THREE.Vector3(
  parseInt(hex.slice(1, 3), 16) / 255,
  parseInt(hex.slice(3, 5), 16) / 255,
  parseInt(hex.slice(5, 7), 16) / 255
);

export const uLocalCam = uniform(new THREE.Vector3(0, 0, 0));
export const uTime = uniform(float(0));
export const uOpacity = uniform(float(1));
export const uNoiseTexture = texture(null);

export const uStepSize = uniform(float(0.0095));
export const uPower = uniform(float(0.17));
export const uWidth = uniform(float(0.05));
export const uOriginRadius = uniform(float(0.195));
export const uNoiseScale = uniform(float(0.95));
export const uNoiseFactor = uniform(float(0.03));
export const uSpeed = uniform(float(0.5));
export const uRampEmission = uniform(float(1.6));
export const uRampPos1 = uniform(float(0.04));
export const uRampPos2 = uniform(float(0.485));
export const uRampPos3 = uniform(float(0.93));
export const uRampCol1 = uniform(hexVec('#f9a4e3'));
export const uRampCol2 = uniform(hexVec('#2a0a47'));
export const uRampCol3 = uniform(hexVec('#6d6b27'));
export const uEmissionColor = uniform(hexVec('#311d5a'));
export const uRingStrength = uniform(float(0.6));
export const uRingRadius = uniform(float(0.23));
export const uRingWidth = uniform(float(0.025));
export const uDopplerAmp = uniform(float(0.5));
export const uDopplerPulse = uniform(float(0.2));
export const uDopplerPulseSpeed = uniform(float(1.5));
export const uMaxSteps = uniform(float(128));

/* LOD crossfade vs the far billboard: 1 = volumetric owns every pixel. */
export const uCrossFade = uniform(float(1));

/* IGN (Jimenez) — complementary discard splits each screen pixel between the far
   billboard and the volumetric, so the crossfade never double-exposes additively. */
export const ignPixel = /*@__PURE__*/ Fn(() => fract(float(52.9829189).mul(
  fract(float(0.06711056).mul(screenCoordinate.x)
    .add(float(0.00583715).mul(screenCoordinate.y))))));

const rotateAxis = /*@__PURE__*/ Fn(([axisIn, angleIn]) => {
  const angle = float(angleIn).toVar();
  const a = vec3(axisIn).toVar();
  const s = sin(angle), c = cos(angle), oc = float(1).sub(c);
  return mat3(
    oc.mul(a.x).mul(a.x).add(c),          oc.mul(a.x).mul(a.y).sub(a.z.mul(s)), oc.mul(a.z).mul(a.x).add(a.y.mul(s)),
    oc.mul(a.x).mul(a.y).add(a.z.mul(s)), oc.mul(a.y).mul(a.y).add(c),          oc.mul(a.y).mul(a.z).sub(a.x.mul(s)),
    oc.mul(a.z).mul(a.x).sub(a.y.mul(s)), oc.mul(a.y).mul(a.z).add(a.x.mul(s)), oc.mul(a.z).mul(a.z).add(c)
  );
});

const catmulRom = /*@__PURE__*/ Fn(([T, D, C, B, A]) => {
  return float(0.5).mul(
    float(2).mul(B)
      .add(A.negate().add(C).mul(T))
      .add(float(2).mul(A).sub(float(5).mul(B)).add(float(4).mul(C)).sub(D).mul(T).mul(T))
      .add(A.negate().add(float(3).mul(B)).sub(float(3).mul(C)).add(D).mul(T).mul(T).mul(T))
  );
});

/* 3-stop B-spline ramp, r184-safe (no Return inside single-branch If). */
export const ramp3 = /*@__PURE__*/ Fn(([T, A, B, C]) => {
  const iAB = T.sub(A.w).div(B.w.sub(A.w)).saturate();
  const iBC = T.sub(B.w).div(C.w.sub(B.w)).saturate();
  const cA = catmulRom(float(1).sub(iAB), A.xyz, A.xyz, B.xyz, C.xyz);
  const cB = catmulRom(iAB.sub(iBC), A.xyz, B.xyz, C.xyz, C.xyz);
  const out = vec3(C.xyz).toVar();
  If(T.lessThan(C.w), () => { out.assign(cB); });
  If(T.lessThan(B.w), () => { out.assign(cA); });
  return out;
});

const whiteNoise2D = (c) => fract(sin(dot(c, vec2(12.9898, 78.233))).mul(43758.5453));
const len3 = /*@__PURE__*/ Fn(([v]) => v.x.mul(v.x).add(v.y.mul(v.y)).add(v.z.mul(v.z)).sqrt());
const smoothRange = /*@__PURE__*/ Fn(([value, inMin, inMax, outMin, outMax]) => {
  const t = clamp(value.sub(inMin).div(inMax.sub(inMin)), 0, 1);
  return mix(outMin, outMax, t.mul(t).mul(float(3).sub(t.mul(2))));
});

export const main = /*@__PURE__*/ Fn(() => {
  If(ignPixel().greaterThanEqual(uCrossFade), () => { Discard(); });

  const objCoords = positionLocal.mul(vec3(1, 1, -1)).xzy;
  const isBackface = step(0.0, faceDirection.negate());
  const camObj = uLocalCam.mul(vec3(1, 1, -1)).xzy;
  const startCoords = mix(objCoords, camObj, isBackface);

  const viewLocal = normalize(uLocalCam.sub(positionLocal)).mul(vec3(1, 1, -1)).xzy;
  const rayDir = viewLocal.negate().toVar();

  const jitter = rayDir.mul(whiteNoise2D(objCoords.xy).mul(uNoiseFactor));
  const rayPos = startCoords.sub(jitter).toVar();

  const colorAcc = vec3(0).toVar();
  const alphaAcc = float(0).toVar();
  const entered = float(0).toVar();

  Loop(128, ({ i }) => {
    /* LOD cap: JS lowers uMaxSteps with distance (stepSize scales up to still cross the
       sphere), so far/small black holes march fewer steps. */
    If(float(i).greaterThanEqual(uMaxSteps), () => { Break(); });

    const rLen = len3(rayPos);
    /* Volume-exit early-out: once the ray has entered the sphere and left it (rLen>1), the
       steering fade is 0, so it flies straight out with no disk left to sample. */
    If(rLen.lessThan(0.999), () => { entered.assign(1.0); });
    If(rLen.greaterThan(1.001).and(entered.greaterThan(0.5)), () => { Break(); });

    const steerMag = uStepSize.mul(uPower).div(rLen.mul(rLen));
    const fade = remapClamp(rLen, 1.0, 0.5, 0.0, 1.0);
    const steeredDir = rayDir.sub(normalize(rayPos).mul(steerMag.mul(fade))).normalize();

    const advance = rayDir.mul(uStepSize);
    rayPos.addAssign(advance);

    const xyLen = len3(rayPos.mul(vec3(1, 1, 0)));
    const rotPhase = xyLen.mul(-4.27).add(uTime.mul(uSpeed));
    const nuv = rayPos.mul(rotateAxis(vec3(0, 0, 1), rotPhase)).mul(uNoiseScale);

    const bandEnds = vec3(uWidth.negate(), 0.0, uWidth);
    const dz = bandEnds.sub(vec3(rayPos.z));
    const zBand = max(uWidth.sub(dz.mul(dz).div(uWidth)).div(uWidth), 0.0);

    const noiseAmpLen = len3(uNoiseTexture.sample(nuv.xy).xyz.mul(zBand));
    const noiseNrmLen = len3(uNoiseTexture.sample(nuv.xy.mul(1.002)).xyz.mul(zBand));

    const rampInput = xyLen
      .add(noiseAmpLen.sub(0.78).mul(1.5))
      .add(noiseAmpLen.sub(noiseNrmLen).mul(19.75));

    const baseCol = ramp3(rampInput, vec4(uRampCol1, uRampPos1), vec4(uRampCol2, uRampPos2), vec4(uRampCol3, uRampPos3));
    const emissiveCol = baseCol.mul(uRampEmission).add(uEmissionColor).toVar();

    const ring = float(1).sub(smoothstep(0.0, uRingWidth, abs(xyLen.sub(uRingRadius)))).mul(uRingStrength);
    emissiveCol.addAssign(uRampCol1.mul(ring));

    const radial = normalize(vec3(rayPos.x, rayPos.y, 0).add(vec3(1e-4, 0, 0)));
    const tangent = vec3(radial.y.negate(), radial.x, 0);
    const beamAmt = uDopplerAmp.add(sin(uTime.mul(uDopplerPulseSpeed)).mul(uDopplerPulse));
    emissiveCol.mulAssign(max(float(1).add(tangent.dot(rayDir).mul(beamAmt)), 0.0));

    const inCore = len3(rayPos).lessThan(uOriginRadius);
    const coreF = select(inCore, float(1), float(0));
    const shadedCol = mix(emissiveCol, vec3(0), coreF);

    const aNoise = noiseAmpLen.sub(0.75).mul(-0.60);
    const aRadial = smoothRange(xyLen, 1.0, 0.0, 0.0, 1.0);
    const aBand = smoothRange(abs(rayPos.z).add(aNoise), uWidth, float(0), float(0), aRadial);
    const alphaLocal = mix(aBand, float(1), coreF);

    const weight = alphaAcc.oneMinus().mul(alphaLocal);
    colorAcc.assign(mix(colorAcc, shadedCol, weight));
    alphaAcc.assign(mix(alphaAcc, float(1), alphaLocal));

    /* Front-to-back saturation early-out: once opaque, later samples contribute ~0. */
    If(alphaAcc.greaterThan(0.99), () => { Break(); });

    rayPos.addAssign(advance);
    rayDir.assign(steeredDir);
  });

  return vec4(colorAcc, alphaAcc.mul(uOpacity));
});
