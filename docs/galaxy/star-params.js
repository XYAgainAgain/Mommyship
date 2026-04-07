/* Derive shader parameters from Morgan-Keenan spectral classification strings.
   Shared by star-bake.js and star-detail.js so both use identical mappings. */

/* Base temperature for each spectral letter at subtype 0 and 9 */
const SPECTRAL_TEMP = {
  O: [50000, 30000], B: [30000, 10000], A: [10000, 7500],
  F: [7500, 6000],   G: [6000, 5200],   K: [5200, 3700],
  M: [3700, 2400],   L: [2400, 1300],
};

/* Luminosity class → relative radius multiplier and granulation scale factor */
/* Radius multipliers are subtle — "noticeably bigger" not "galaxy-eating" */
const LUMINOSITY = {
  I:   { radius: 2.5, granMul: 0.8 },
  II:  { radius: 2.0, granMul: 0.85 },
  III: { radius: 1.6, granMul: 0.9 },
  IV:  { radius: 1.2, granMul: 0.95 },
  V:   { radius: 1.0, granMul: 1.0 },
};

/* Atmosphere color by spectral letter */
const ATMO_COLORS = {
  O: '#aaccff', B: '#99bbff', A: '#ddeeff', F: '#fff8e0',
  G: '#ffeeaa', K: '#ffcc77', M: '#ff9966', L: '#cc6644',
};

/**
 * Parse a MK string like "M4V", "B3III", "DA2", "G4IV+L2V" into shader params.
 * @param {string} raw - spectralClass from galaxy.json
 * @param {number} visualSize - body.visual.size (0.5–3.0), used as fallback
 * @returns {{ lowTemp, highTemp, granScale, spotAmp, slopeness, emissive, bubbleAmp, radius, atmoColor, lumClass }}
 */
export function parseMK(raw, visualSize) {
  if (!raw) return defaults(visualSize);
  const s = raw.trim().toUpperCase();

  /* Binary — use the primary (first component) */
  const primary = s.includes('+') ? s.split('+')[0] : s;

  /* White dwarf special case */
  if (primary.startsWith('DA')) {
    return {
      lowTemp: 8000, highTemp: 40000,
      granScale: 6.0, spotAmp: 0.3, slopeness: 0.7, bubbleAmp: 0.02,
      radius: 0.3, atmoColor: '#eeeeff', lumClass: 'V', emissive: 1.8,
    };
  }

  const letter = primary.charAt(0);
  const temps = SPECTRAL_TEMP[letter];
  if (!temps) return defaults(visualSize);

  /* Subtype digit (0–9), default 5 */
  const subtypeMatch = primary.match(/[0-9]/);
  const subtype = subtypeMatch ? parseInt(subtypeMatch[0]) : 5;

  /* Luminosity class (I, II, III, IV, V), default V */
  const lumMatch = primary.match(/(I{1,3}|IV|V)$/);
  const lumStr = lumMatch ? lumMatch[0] : 'V';
  const lum = LUMINOSITY[lumStr] || LUMINOSITY.V;

  /* Interpolate temperature within the spectral letter range */
  const t = subtype / 9.0;
  const baseTemp = temps[0] + (temps[1] - temps[0]) * t;

  /* Widen the range for visual contrast — ±25% around the base */
  const spread = baseTemp * 0.25;
  const lowTemp = Math.max(1000, baseTemp - spread);
  const highTemp = baseTemp + spread;

  /* Granulation scale — giants have larger cells, dwarfs have tighter cells */
  const baseGran = { O: 5.0, B: 4.5, A: 4.0, F: 4.0, G: 4.0, K: 3.5, M: 3.0, L: 2.5 }[letter] || 4.0;
  const granScale = baseGran * lum.granMul;

  /* Spot amplitude — cooler stars have more spots, giants have dramatic ones */
  const baseSpot = { O: 0.7, B: 0.8, A: 0.9, F: 1.0, G: 1.2, K: 1.5, M: 1.8, L: 1.0 }[letter] || 1.2;
  const spotAmp = Math.min(2.0, baseSpot * (lumStr === 'V' ? 1.0 : 1.5));

  /* Slopeness — controls convection ridge darkness. Cool stars get more dramatic ridges */
  const baseSlopeness = { O: 1.0, B: 1.2, A: 1.3, F: 1.5, G: 1.8, K: 2.2, M: 2.6, L: 2.8 }[letter] || 1.8;
  const giantBonus = (lumStr !== 'V' && lumStr !== 'IV') ? 0.4 : 0.0;
  const slopeness = baseSlopeness + giantBonus;

  /* Emissive — HDR overbright on hottest granulation cells */
  const emissive = { O: 2.0, B: 2.0, A: 1.5, F: 1.3, G: 1.3, K: 1.0, M: 1.0, L: 0.6 }[letter] || 1.3;

  /* Vertex bubbling — convection cells physically raise the surface */
  const baseBubble = { O: 0.04, B: 0.05, A: 0.06, F: 0.08, G: 0.10, K: 0.14, M: 0.18, L: 0.12 }[letter] || 0.10;
  const bubbleAmp = baseBubble * (lumStr === 'V' ? 1.0 : 1.5);

  /* Radius for mesh scale — luminosity class only, visual.size reserved for noise */
  const radius = lum.radius;

  return {
    lowTemp, highTemp, granScale, spotAmp, slopeness, emissive, bubbleAmp, radius,
    atmoColor: ATMO_COLORS[letter] || '#ffeeaa',
    lumClass: lumStr,
  };
}

function defaults(visualSize) {
  return {
    lowTemp: 4200, highTemp: 5800,
    granScale: 4.0, spotAmp: 0.9, slopeness: 1.3, emissive: 1.0, bubbleAmp: 0.10,
    radius: visualSize || 1.0,
    atmoColor: '#ffeeaa', lumClass: 'V',
  };
}
