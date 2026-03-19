/* Mulberry32 — fast seeded 32-bit PRNG with good distribution */
export function createRng(seed) {
  let s = seed | 0;
  function next() {
    s |= 0; s = s + 0x6D2B79F5 | 0;
    var t = Math.imul(s ^ s >>> 15, 1 | s);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
  /* Box-Muller transform for Gaussian distribution */
  function gauss() {
    var u, v;
    do { u = next(); } while (u === 0);
    v = next();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
  return { next, gauss };
}
