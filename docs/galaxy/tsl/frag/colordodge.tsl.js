import { Break, clamp, float, Fn, If, Loop, mix, mx_noise_float, pow, sin, vec3 } from 'three/tsl';

/* Colordodge nebula core! Every param is a tunable node: skybox, auroras, gas bands, etc. */

export const cloudCD = /*@__PURE__*/ Fn(([p, seed]) => {
  return sin(mx_noise_float(p.add(seed)).mul(7.0)).mul(0.5).add(0.5);
});

/* Fixed 8-iteration stack; fractional `octaves` fades the tail. Constant loop bounds
   on purpose — dynamic uniform bounds risk Firefox/Naga rejection. */
export const cloudNoiseCD = /*@__PURE__*/ Fn(([pos, frq, seed, octaves]) => {
  const n = float(0).toVar();
  const gain = float(1).toVar();
  Loop({ start: 0, end: 8 }, ({ i }) => {
    If(float(i).greaterThanEqual(octaves), () => { Break(); });
    const w = clamp(octaves.sub(float(i)), float(0), float(1));
    n.addAssign(cloudCD(pos.mul(gain).div(frq), seed.add(float(i).mul(10.0))).mul(float(0.5).div(gain)).mul(w));
    gain.mulAssign(2.0);
  });
  return n;
});

/* Full generator: c1 domain-warps c2, then c3/c1 index a bilinear 4-corner color ramp
   (replaces the original's nebulaeMap texture). `u` is an object of nodes:
   { res1, res2, resMix, warp, octaves, contrast, intensity, seed, colA, colB, colC, colD }.
   Returns an Fn taking a direction/position vec3 and yielding a vec3 color. */
export function colordodgeNebula(u) {
  return Fn(([dir]) => {
    const c1 = cloudNoiseCD(dir, u.res1, u.seed, u.octaves);
    const c2 = cloudNoiseCD(dir.add(vec3(c1.mul(u.warp))), u.res2, u.seed.add(310.4), u.octaves);
    const c3 = cloudNoiseCD(dir, u.resMix, u.seed.add(661.384), u.octaves);
    const strength = pow(c2, u.contrast).mul(2.0);
    const ramp = mix(mix(u.colA, u.colB, c3), mix(u.colC, u.colD, c3), c1);
    return ramp.mul(strength).mul(u.intensity);
  });
}
