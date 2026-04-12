/* Derive shader parameters from planet/moon body data.
   Shared by planet-bake.js and planet-detail.js for visual consistency.
   Every returned field maps 1:1 to a shader uniform and is overridable via body.visual. */

import { createRng } from './rng.js';

const MODE_MAP = { rocky: 0, barren: 1, gas: 2, ocean: 3, ice: 4, volcanic: 5, crystalline: 6, fungal: 7 };

const SIZE_SCALE = {
  XXXS: 0.3, XXS: 0.5, XS: 0.7, S: 0.85, M: 1.0, L: 1.3, XL: 1.6, XXL: 2.0, XXXL: 3.0,
};

/* Subtype weights by orbital zone — [rocky, barren, gas, ocean, ice, volcanic, crystalline, fungal] */
const ZONE_WEIGHTS = {
  inner:     [0.35, 0.25, 0.00, 0.05, 0.00, 0.25, 0.05, 0.05],
  habitable: [0.45, 0.10, 0.10, 0.20, 0.05, 0.02, 0.03, 0.05],
  outer:     [0.05, 0.15, 0.35, 0.05, 0.25, 0.05, 0.05, 0.05],
};
const MOON_WEIGHTS =   [0.10, 0.40, 0.00, 0.05, 0.30, 0.05, 0.05, 0.05];
const SUBTYPE_NAMES = ['rocky', 'barren', 'gas', 'ocean', 'ice', 'volcanic', 'crystalline', 'fungal'];

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return h;
}

/* Walk parentId chain to the ancestor star */
function findParentStar(bodyId, bodies) {
  let cur = bodies[bodyId]?.parentId;
  while (cur && bodies[cur]) {
    if (bodies[cur].type === 'star') return bodies[cur];
    cur = bodies[cur].parentId;
  }
  return null;
}

/* Pick a weighted random index */
function weightedPick(weights, rng) {
  const r = rng.next();
  let sum = 0;
  for (let i = 0; i < weights.length; i++) {
    sum += weights[i];
    if (r < sum) return i;
  }
  return weights.length - 1;
}

function hslToHex(h, s, l) {
  h = ((h % 1) + 1) % 1;
  s = Math.max(0, Math.min(1, s));
  l = Math.max(0, Math.min(1, l));
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h * 12) % 12;
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  const toHex = (v) => Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, '0');
  return '#' + toHex(f(0)) + toHex(f(8)) + toHex(f(4));
}

/* Derive a 3-color palette from a hex anchor color — used when visual.color exists */
function paletteFromAnchorColor(hex, rng, subtype) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }

  /* Tight variations around the anchor — stay within the color family.
     Vary lightness and saturation more than hue for cohesive look. */
  const hShift = 0.01 + rng.next() * 0.03;
  const sShift = rng.next() * 0.15;
  const lShift = 0.06 + rng.next() * 0.12;
  return {
    color1: hslToHex(h, s, l),
    color2: hslToHex(h + hShift, Math.min(0.9, s + sShift), Math.min(0.8, l + lShift)),
    color3: hslToHex(h - hShift * 0.5, s * 0.6, Math.min(0.85, l + lShift * 1.3)),
  };
}

/* Subtype-constrained hue ranges keep palettes believable */
const SUBTYPE_HUE_RANGES = {
  rocky:       [0.0, 1.0],
  barren:      [0.02, 0.12],
  gas:         null,
  ocean:       [0.5, 0.65],
  ice:         [0.5, 0.7],
  volcanic:    [0.0, 0.08],
  crystalline: null,
  fungal:      [0.20, 0.45],
};

/* HSL palette generation — subtype-aware hue constraints */
function generatePalette(rng, temperature, subtype) {
  const hueRange = SUBTYPE_HUE_RANGES[subtype];
  let baseHue;
  if (subtype === 'gas') {
    /* Gas giants: wide palette — Jupiter amber, Saturn gold, Neptune teal,
       Uranus cyan, exotic lavender/sage. Temperature biases but doesn't lock. */
    const gasHues = temperature > 0.5
      ? [0.02, 0.06, 0.08, 0.12, 0.05, 0.10]   /* warm: red → amber → gold */
      : [0.48, 0.55, 0.60, 0.65, 0.72, 0.42];   /* cool: teal → blue → lavender → sage */
    baseHue = gasHues[Math.floor(rng.next() * gasHues.length)] + (rng.next() - 0.5) * 0.04;
  } else if (subtype === 'crystalline') {
    /* Gem families: ruby/garnet, emerald, sapphire, amethyst, citrine, aquamarine */
    const gemHues = [
      0.0, 0.33, 0.6, 0.78, 0.10, 0.48,
      0.85, 0.25, 0.72, 0.08, 0.38, 0.55,
    ];
    baseHue = gemHues[Math.floor(rng.next() * gemHues.length)] + (rng.next() - 0.5) * 0.06;
  } else if (hueRange) {
    baseHue = hueRange[0] + rng.next() * (hueRange[1] - hueRange[0]);
  } else {
    baseHue = rng.next();
  }

  /* Gas giants need tighter hue spread so bands stay in the same color family.
     Fungal gets colordodge-style wide rotation for wild splotch variety. */
  const colorAngle = subtype === 'gas'
    ? 0.02 + rng.next() * 0.06
    : subtype === 'fungal'
    ? 0.15 + rng.next() * 0.25
    : subtype === 'crystalline'
    ? (rng.next() < 0.18
      ? 0.10 + rng.next() * 0.15   /* ~18% fluorite-style multi-hue */
      : 0.02 + rng.next() * 0.05)  /* typical: tight hue band */
    : 0.04 + rng.next() * 0.12;

  /* Subtype-specific saturation and lightness */
  let baseSat, baseLit;
  switch (subtype) {
    case 'barren':
      baseSat = 0.15 + rng.next() * 0.2;
      baseLit = 0.35 + rng.next() * 0.25;
      break;
    case 'ocean':
      baseSat = 0.4 + rng.next() * 0.3;
      baseLit = 0.3 + rng.next() * 0.2;
      break;
    case 'ice':
      baseSat = 0.04 + rng.next() * 0.08;
      baseLit = 0.85 + rng.next() * 0.08;
      break;
    case 'gas':
      /* Warm = muted amber/cream (Jupiter/Saturn), cold = richer blue-green (Neptune) */
      baseSat = temperature > 0.5
        ? 0.15 + rng.next() * 0.2
        : 0.25 + rng.next() * 0.2;
      baseLit = temperature > 0.5
        ? 0.50 + rng.next() * 0.2
        : 0.35 + rng.next() * 0.2;
      break;
    case 'volcanic':
      if (temperature <= 0.5) {
        /* Cryo volcanic — nearly identical to ice planets, just with glowing cracks */
        baseSat = 0.04 + rng.next() * 0.06;
        baseLit = 0.84 + rng.next() * 0.08;
      } else {
        baseSat = 0.08 + rng.next() * 0.12;
        baseLit = 0.10 + rng.next() * 0.08;
      }
      break;
    case 'crystalline':
      baseSat = 0.55 + rng.next() * 0.35;
      baseLit = 0.50 + rng.next() * 0.20;
      break;
    case 'fungal':
      baseSat = 0.35 + rng.next() * 0.35;
      baseLit = 0.30 + rng.next() * 0.2;
      break;
    default:
      baseSat = 0.3 + rng.next() * 0.4;
      baseLit = 0.35 + rng.next() * 0.25;
  }

  const tempShift = (temperature - 0.5) * 0.08;

  return {
    color1: hslToHex(baseHue + tempShift, baseSat, baseLit),
    color2: hslToHex(baseHue + colorAngle + tempShift, baseSat * 0.85, baseLit + 0.12),
    color3: hslToHex(baseHue - colorAngle + tempShift, baseSat * 0.7, baseLit + 0.2),
  };
}

/* Infer orbital zone from order + star temperature */
function inferZone(body, parentStar) {
  const order = body.orbital?.order ?? 3;
  if (!parentStar) return 'habitable';

  /* Hot stars push habitable zone outward */
  const spectral = (parentStar.spectralClass || '').charAt(0);
  const hotStarShift = 'OBA'.includes(spectral) ? 1 : 0;

  if (order <= 2 + hotStarShift) return 'inner';
  if (order <= 4 + hotStarShift) return 'habitable';
  return 'outer';
}

/* Auto-assign subtype when body.subtype is null */
function inferSubtype(body, parentStar, rng) {
  const isMoon = body.type === 'moon';
  if (isMoon) return SUBTYPE_NAMES[weightedPick(MOON_WEIGHTS, rng)];

  const zone = inferZone(body, parentStar);
  return SUBTYPE_NAMES[weightedPick(ZONE_WEIGHTS[zone], rng)];
}

/* Star temperature estimate from spectral class for lighting/palette context */
function starTemperatureEstimate(parentStar) {
  if (!parentStar?.spectralClass) return 5500;
  const letter = parentStar.spectralClass.charAt(0).toUpperCase();
  return { O: 35000, B: 20000, A: 8500, F: 6500, G: 5500, K: 4500, M: 3000, L: 1800 }[letter] || 5500;
}

/**
 * @param {Object} body — body entry from galaxy.json
 * @param {Object|null} parentStar — nearest ancestor star (found via findParentStar)
 * @param {Object} bodies — full bodies map
 * @returns {Object} flat uniform set for bake + detail shaders
 */
export function parsePlanetType(body, bodyId, parentStar, bodies) {
  const seed = hashString(bodyId || '');
  const rng = createRng(seed);
  const vis = body.visual || {};

  /* Subtype: explicit or auto-inferred */
  const subtype = body.subtype || inferSubtype(body, parentStar, rng);
  const mode = MODE_MAP[subtype] ?? 0;

  /* Size: stats.size (T-shirt from XLSX) takes priority, then visual.size */
  let radius = 1.0;
  const sizeVal = body.stats?.size ?? vis.size;
  if (sizeVal && typeof sizeVal === 'string') {
    radius = SIZE_SCALE[sizeVal.toUpperCase()] ?? 1.0;
  } else if (typeof sizeVal === 'number') {
    radius = sizeVal;
  }

  /* Temperature context — 0 = frozen, 1 = molten.
     Inner orbits are always hot; outer orbits scale with star luminosity. */
  const starTemp = starTemperatureEstimate(parentStar);
  const orbitalOrder = body.orbital?.order ?? 3;
  const starFactor = (starTemp - 3000) / 7000;
  const distanceCooling = orbitalOrder * 0.15;
  const baseTemp = Math.max(0, Math.min(1,
    0.85 - distanceCooling + starFactor * 0.2 + rng.next() * 0.1
  ));
  /* For gas giants with a visual.color, infer temperature from color warmth */
  let inferredTemp = baseTemp;
  if (subtype === 'gas' && vis.color && !vis.temperature) {
    const cr = parseInt(vis.color.slice(1, 3), 16) / 255;
    const cb = parseInt(vis.color.slice(5, 7), 16) / 255;
    inferredTemp = Math.max(0, Math.min(1, 0.3 + (cr - cb) * 0.7));
  }
  const temperature = vis.temperature ?? inferredTemp;

  /* Generate palette — if visual.color exists, anchor the palette to it;
     otherwise auto-generate from seed + temperature + subtype */
  let palette;
  if (vis.color) {
    palette = paletteFromAnchorColor(vis.color, createRng(seed + 42), subtype);
  } else {
    palette = generatePalette(createRng(seed + 42), temperature, subtype);
  }

  /* Subtype-specific defaults */
  const subtypeDefaults = getSubtypeDefaults(subtype, rng, temperature);

  /* Merge: subtype defaults → palette → visual overrides (overrides win) */
  const result = {
    mode,
    seed,
    subtype,
    radius,
    temperature,
    toxic: vis.toxic === true,

    slopeness:           vis.slopeness ?? subtypeDefaults.slopeness,
    oceanLevel:          vis.oceanLevel ?? subtypeDefaults.oceanLevel,
    craterDensity:       vis.craterDensity ?? subtypeDefaults.craterDensity,
    specular:            vis.specular ?? subtypeDefaults.specular,
    displacementAmp:     vis.displacementAmp ?? subtypeDefaults.displacementAmp,
    lumpiness:           vis.lumpiness ?? subtypeDefaults.lumpiness ?? 0.0,

    baseColor1:          vis.baseColor1 ?? palette.color1,
    baseColor2:          vis.baseColor2 ?? palette.color2,
    baseColor3:          vis.baseColor3 ?? palette.color3,

    atmosphereTint:      vis.atmosphereTint ?? subtypeDefaults.atmosphereTint,
    atmosphereIntensity: vis.atmosphereIntensity ?? subtypeDefaults.atmosphereIntensity,

    cloudCover:          vis.cloudCover ?? subtypeDefaults.cloudCover,
    cloudColor:          vis.cloudColor ?? subtypeDefaults.cloudColor,
    storminess:          vis.storminess ?? subtypeDefaults.storminess,

    /* Gas giant params */
    bandCount:           vis.bandCount ?? subtypeDefaults.bandCount,
    warpStrength:        vis.warpStrength ?? subtypeDefaults.warpStrength,
    stormSize:           vis.stormSize ?? subtypeDefaults.stormSize,

    /* Exotic params */
    crackScale:          vis.crackScale ?? subtypeDefaults.crackScale,
    subsurfaceColor:     vis.subsurfaceColor ?? subtypeDefaults.subsurfaceColor,
    emissiveIntensity:   vis.emissiveIntensity ?? subtypeDefaults.emissiveIntensity,
    emissiveColor:       vis.emissiveColor ?? subtypeDefaults.emissiveColor,
    bulbosity:           vis.bulbosity ?? subtypeDefaults.bulbosity,
    churn:               vis.churn ?? subtypeDefaults.churn,
    roughness:           vis.roughness ?? subtypeDefaults.roughness,
    metalness:           vis.metalness ?? subtypeDefaults.metalness,
    crystalMetric:       vis.crystalMetric ?? subtypeDefaults.crystalMetric ?? 0,
    moistureOffset:      vis.moistureOffset ?? subtypeDefaults.moistureOffset ?? 0.0,
    biomeCount:          vis.biomeCount ?? subtypeDefaults.biomeCount ?? 0.5,
    opacity:             vis.opacity ?? -1.0,
  };

  /* Toxicity tints the atmosphere */
  if (result.toxic) {
    result.atmosphereTint = vis.atmosphereTint ?? '#88cc22';
    result.atmosphereIntensity = Math.max(result.atmosphereIntensity, 0.4);
  }

  /* Barren moons get lumpier shapes — farther orbital order = wobblier */
  if (subtype === 'barren' && body.type === 'moon' && vis.lumpiness == null) {
    const order = body.orbital?.order ?? 3;
    result.lumpiness = 0.18 + order * 0.07 + rng.next() * 0.15;
  }

  return result;
}

function getSubtypeDefaults(subtype, rng, temperature) {
  const base = {
    slopeness: 1.0, oceanLevel: -1.0, craterDensity: 0.0, specular: 0.0,
    displacementAmp: 0.03, atmosphereTint: '#88aacc', atmosphereIntensity: 0.2,
    cloudCover: 0.0, cloudColor: '#ffffff', storminess: 0.0,
    bandCount: 0, warpStrength: 0.0, stormSize: 0.0,
    crackScale: 5.0, subsurfaceColor: '#335588', emissiveIntensity: 0.0,
    emissiveColor: '#000000', bulbosity: 0.0, churn: 0.0,
    roughness: 0.7, metalness: 0.0,
    moistureOffset: 0.0, biomeCount: 0.5,
  };

  switch (subtype) {
    case 'rocky': {
      /* Cloud variety — wet worlds get heavier coverage, dry worlds get wispy */
      const moist = rng.next();
      const cloudRoll = rng.next();
      const cloudHeavy = cloudRoll > 0.7;
      const cloudLight = cloudRoll < 0.2;
      const cc = cloudHeavy ? 0.45 + rng.next() * 0.2
               : cloudLight ? 0.05 + rng.next() * 0.15
               : 0.20 + rng.next() * 0.25;
      /* Cloud color varies: warm worlds get amber tint, cold get blue-grey */
      const cloudHue = temperature > 0.6 ? 0.08 + rng.next() * 0.05
                     : temperature < 0.35 ? 0.58 + rng.next() * 0.05
                     : 0.55 + rng.next() * 0.1;
      const cloudSat = 0.02 + rng.next() * 0.12;
      const cloudLit = 0.88 + rng.next() * 0.08;
      return { ...base,
        slopeness: 1.2 + rng.next() * 0.8,
        oceanLevel: 0.2 + rng.next() * 0.35,
        specular: 0.4,
        warpStrength: 0.05 + rng.next() * 0.1,
        displacementAmp: 0.03 + rng.next() * 0.02,
        atmosphereTint: '#6699cc',
        atmosphereIntensity: 0.25 + rng.next() * 0.15,
        cloudCover: cc,
        cloudColor: hslToHex(cloudHue, cloudSat, cloudLit),
        storminess: cloudHeavy ? 0.2 + rng.next() * 0.25
                  : 0.05 + rng.next() * 0.15,
        roughness: 0.7 + rng.next() * 0.2,
        moistureOffset: (moist - 0.5) * 0.6,
        biomeCount: 0.4 + rng.next() * 0.6,
      };
    }

    case 'barren':
      return { ...base,
        slopeness: 0.8 + rng.next() * 0.5,
        craterDensity: 0.5 + rng.next() * 0.4,
        displacementAmp: 0.04 + rng.next() * 0.04,
        lumpiness: 0.08 + rng.next() * 0.08,
        atmosphereTint: '#887766',
        atmosphereIntensity: 0.0,
        roughness: 0.8 + rng.next() * 0.15,
      };

    case 'gas': {
      /* Storm variety — some giants have many small storms, some have one big one */
      const stormRoll = rng.next();
      const stSize = stormRoll < 0.15 ? 0.0                    /* 15%: no storms */
                   : stormRoll < 0.40 ? 0.2 + rng.next() * 0.3 /* 25%: small storms */
                   : stormRoll < 0.75 ? 0.4 + rng.next() * 0.4 /* 35%: medium storms */
                   : 0.7 + rng.next() * 0.3;                   /* 25%: Great Red Spot scale */
      /* Cloud color from the palette hue rather than binary */
      const gasCloudHue = temperature > 0.5
        ? 0.06 + rng.next() * 0.06   /* warm: cream/amber */
        : 0.55 + rng.next() * 0.1;   /* cool: blue-grey */
      const gasCloudSat = 0.05 + rng.next() * 0.15;
      const gasCloudLit = 0.82 + rng.next() * 0.12;
      return { ...base,
        slopeness: 0.4 + rng.next() * 0.3,
        bandCount: 4 + Math.floor(rng.next() * 10),
        warpStrength: 0.1 + rng.next() * 0.15,
        stormSize: stSize,
        atmosphereTint: temperature > 0.5 ? '#cc8844' : '#4488cc',
        atmosphereIntensity: 0.3 + rng.next() * 0.2,
        displacementAmp: 0.0,
        churn: 0.6 + rng.next() * 0.3,
        cloudCover: 0.20 + rng.next() * 0.50,
        cloudColor: hslToHex(gasCloudHue, gasCloudSat, gasCloudLit),
        storminess: 0.2 + rng.next() * 0.4,
        roughness: 0.6 + rng.next() * 0.2,
      };
    }

    case 'ocean':
      return { ...base,
        slopeness: 0.8 + rng.next() * 0.4,
        oceanLevel: 0.8 + rng.next() * 0.15,
        specular: 0.7 + rng.next() * 0.3,
        warpStrength: 0.4 + rng.next() * 0.5,
        atmosphereTint: '#5588aa',
        atmosphereIntensity: 0.35 + rng.next() * 0.15,
        churn: 0.8 + rng.next() * 0.2,
        displacementAmp: 0.01,
        cloudCover: 0.35 + rng.next() * 0.2,
        cloudColor: '#d8e8f0',
        storminess: 0.2 + rng.next() * 0.3,
        roughness: 0.05 + rng.next() * 0.1,
      };

    case 'ice':
      return { ...base,
        slopeness: 0.5 + rng.next() * 0.5,
        crackScale: 1.5 + rng.next() * 2.5,
        subsurfaceColor: '#2288aa',
        specular: 0.55 + rng.next() * 0.35,
        atmosphereTint: '#aabbcc',
        atmosphereIntensity: 0.1 + rng.next() * 0.1,
        cloudCover: 0.15 + rng.next() * 0.2,
        cloudColor: '#ccddf0',
        storminess: rng.next() * 0.1,
        roughness: 0.1 + rng.next() * 0.2,
      };

    case 'volcanic': {
      /* Real lava hues: 0.0 = deep red (700C), 0.05 = orange (1000C), 0.1 = yellow (1200C) */
      /* Hot: deep red (0.0) → orange (0.05) → yellow (0.08)
         Cryo: teal (0.48) → cyan (0.50) → aquamarine (0.53) */
      const lavaHue = temperature > 0.5
        ? 0.0 + rng.next() * 0.08
        : 0.47 + rng.next() * 0.07;
      const lavaSat = temperature > 0.5
        ? 0.85 + rng.next() * 0.15
        : 0.60 + rng.next() * 0.25;
      const lavaLit = temperature > 0.5
        ? 0.45 + rng.next() * 0.15
        : 0.50 + rng.next() * 0.15;
      const emColor = hslToHex(lavaHue, lavaSat, lavaLit);
      const autoAtmo = temperature > 0.5
        ? hslToHex(lavaHue, 0.4, 0.25)
        : '#556677';
      return { ...base,
        slopeness: 0.8 + rng.next() * 0.6,
        crackScale: 1.5 + rng.next() * 2.0,
        craterDensity: 0.3 + rng.next() * 0.4,
        displacementAmp: 0.02 + rng.next() * 0.03,
        lumpiness: 0.04 + rng.next() * 0.06,
        emissiveIntensity: 0.6 + rng.next() * 0.4,
        emissiveColor: emColor,
        atmosphereTint: autoAtmo,
        atmosphereIntensity: 0.25 + rng.next() * 0.2,
        cloudCover: 0.35 + rng.next() * 0.30,
        cloudColor: temperature > 0.5 ? '#332820' : '#8899a8',
        storminess: 0.5 + rng.next() * 0.4,
        roughness: 0.6 + rng.next() * 0.2,
      };
    }

    case 'crystalline': {
      /* 0 = euclidean (round), 1 = manhattan (star), 2 = chebyshev (square), 3 = triangular (hex) */
      const metric = Math.floor(rng.next() * 4);
      const subHue = rng.next();
      const subColor = hslToHex(subHue, 0.5 + rng.next() * 0.3, 0.55 + rng.next() * 0.2);
      return { ...base,
        slopeness: 0.3 + rng.next() * 0.4,
        crackScale: (sizeClass => sizeClass < 0.33
          ? 1.5 + rng.next() * 2.0
          : sizeClass < 0.66 ? 4.0 + rng.next() * 4.0
          : 10.0 + rng.next() * 10.0)(rng.next()),
        specular: 0.8 + rng.next() * 0.2,
        bulbosity: rng.next(),
        crystalMetric: metric,
        subsurfaceColor: subColor,
        emissiveIntensity: 0.3 + rng.next() * 0.5,
        emissiveColor: subColor,
        atmosphereTint: '#aaccee',
        atmosphereIntensity: 0.08 + rng.next() * 0.12,
        roughness: 0.03 + rng.next() * 0.12,
        metalness: 0.02 + rng.next() * 0.15,
      };
    }

    case 'fungal': {
      const emHue = [0.48, 0.25, 0.12][Math.floor(rng.next() * 3)];
      const emColor = hslToHex(emHue, 0.8 + rng.next() * 0.2, 0.5 + rng.next() * 0.15);
      return { ...base,
        slopeness: 0.6 + rng.next() * 0.4,
        warpStrength: 0.3 + rng.next() * 0.2,
        crackScale: 3.5 + rng.next() * 3.0,
        bulbosity: 0.3 + rng.next() * 0.4,
        emissiveIntensity: 0.4 + rng.next() * 0.5,
        emissiveColor: emColor,
        subsurfaceColor: emColor,
        atmosphereTint: hslToHex(0.3 + rng.next() * 0.1, 0.4, 0.35),
        atmosphereIntensity: 0.3 + rng.next() * 0.2,
        cloudCover: 0.3 + rng.next() * 0.15,
        cloudColor: hslToHex(0.28 + rng.next() * 0.1, 0.3, 0.4),
        storminess: 0.25 + rng.next() * 0.15,
        roughness: 0.3 + rng.next() * 0.2,
        metalness: 0.15 + rng.next() * 0.2,
      };
    }

    default:
      return base;
  }
}

/* Utility for external callers to find the parent star */
export { findParentStar, hashString };
