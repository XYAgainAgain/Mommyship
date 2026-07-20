import {
  Fn, If, Discard, float, vec2, vec4, uniform, positionLocal,
  sin, cos, abs, max, mix, smoothstep, length, sign
} from 'three/tsl';

import {
  ramp3, ignPixel, uCrossFade, uTime, uNoiseTexture, uSpeed, uNoiseScale,
  uRampCol1, uRampCol2, uRampCol3, uRampPos1, uRampPos2, uRampPos3,
  uRingRadius, uRingWidth, uRingStrength, uEmissionColor
} from './blackhole-volumetric.tsl.js';

/* Far-LOD billboard replacing the volumetric raymarch at distance — same unit space, palette,
   ramp, and swirl phase so the crossfade lands on an identical look; coverage-blended so dark lanes still occlude the core. */

/* Signed sine of camera elevation above the disk plane (camY / dist). */
export const uSinElev = uniform(float(1));

export const main = /*@__PURE__*/ Fn(() => {
  /* Complement of the volumetric's discard: each pixel shows exactly one LOD. */
  If(ignPixel().lessThan(uCrossFade), () => { Discard(); });

  /* ±1 local units = disk outer radius, the volumetric sphere's unit space. */
  const p = positionLocal.xy.mul(2.0);
  const r = length(p);

  const elevSign = sign(uSinElev.add(1.0e-5));
  const minor = max(abs(uSinElev), 0.06);

  /* Disk-plane coords recovered from the billboard projection (ellipse un-squash). */
  const pd = vec2(p.x, p.y.div(minor));
  const rd = length(pd);

  /* Same swirl phase as the volumetric so the arms rotate in sync across the crossfade. */
  const phase = rd.mul(-4.27).add(uTime.mul(uSpeed));
  const cs = cos(phase);
  const sn = sin(phase);
  const rot = vec2(pd.x.mul(cs).sub(pd.y.mul(sn)), pd.x.mul(sn).add(pd.y.mul(cs)));
  const noiseVal = uNoiseTexture.sample(rot.mul(uNoiseScale)).x;

  /* Near half of the disk faces the viewer; blends to the full ellipse seen top-down.
     Reversed-edge smoothstep is avoided throughout — undefined in the GLSL fallback. */
  const nearMask = smoothstep(-0.1, 0.1, p.y.mul(elevSign)).oneMinus();
  const topDown = smoothstep(0.5, 0.9, abs(uSinElev));
  const diskMask = mix(nearMask, float(1.0), topDown);

  const rampInput = rd.add(noiseVal.sub(0.6).mul(0.35));
  const diskCol = ramp3(rampInput, vec4(uRampCol1, uRampPos1), vec4(uRampCol2, uRampPos2), vec4(uRampCol3, uRampPos3))
    .add(uEmissionColor.mul(0.5));
  const diskAlpha = smoothstep(0.55, 1.0, rd).oneMinus()
    .mul(smoothstep(uRingRadius.mul(0.95), uRingRadius.mul(1.35), rd))
    .mul(noiseVal.mul(0.5).add(0.55).saturate())
    .mul(diskMask);

  /* Photon ring — always circular, view-independent. */
  const ringI = smoothstep(float(0.0), uRingWidth.mul(2.2), abs(r.sub(uRingRadius))).oneMinus().mul(uRingStrength).mul(1.4);

  /* Far-side wrap: the hidden half of the disk lenses into an arc over the hole.
     Strongest edge-on, gone top-down. */
  const wrapBand = smoothstep(float(0.0), uRingRadius.mul(0.55), abs(r.sub(uRingRadius.mul(1.25)))).oneMinus();
  const farMask = float(1.0).sub(nearMask);
  const wrapI = wrapBand.mul(farMask).mul(float(1.0).sub(topDown)).mul(0.85);

  /* Soft outer glow so the hole reads at extreme distance. */
  const glowI = smoothstep(uRingRadius, float(1.0), r).oneMinus().mul(0.10);

  const col = diskCol.mul(diskAlpha)
    .add(uRampCol1.mul(ringI))
    .add(mix(uRampCol1, uRampCol2, 0.35).mul(wrapI))
    .add(mix(uRampCol2, uEmissionColor, 0.5).mul(glowI).mul(3.0));

  /* Coverage for normal blending; un-premultiply so the weighted sum above survives
     the blend equation unchanged. Glow contributes little coverage — it adds light. */
  const aOut = diskAlpha.add(ringI).add(wrapI).add(glowI.mul(0.5)).saturate();
  return vec4(col.div(max(aOut, 0.001)), aOut);
});
