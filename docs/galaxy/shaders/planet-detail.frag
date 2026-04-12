precision highp float;

uniform float uSeed;
uniform int   uPlanetMode;
uniform float uSlopeness;
uniform float uOceanLevel;
uniform float uTemperature;
uniform float uCraterDensity;
uniform float uSpecular;
uniform vec3  uBaseColor1;
uniform vec3  uBaseColor2;
uniform vec3  uBaseColor3;
uniform float uAtmoIntensity;
uniform vec3  uAtmoTint;

/* Gas */
uniform float uBandCount;
uniform float uWarpStrength;
uniform float uStormSize;

/* Exotic */
uniform float uCrackScale;
uniform vec3  uSubsurfaceColor;
uniform float uEmissiveIntensity;
uniform vec3  uEmissiveColor;
uniform float uBulbosity;
uniform float uRoughness;
uniform float uMetalness;
uniform int   uCrystalMetric;

/* Rocky biome system */
uniform float uMoistureOffset;
uniform float uBiomeCount;

/* Detail-only */
uniform float uTime;
uniform mat3  uRotation;
uniform vec3  uLightDir;
uniform float uLodDist;
uniform float uFadeIn;
uniform float uOpacity;

/* Clouds + storms */
uniform float uCloudCover;
uniform vec3  uCloudColor;
uniform float uStorminess;

in vec3 vLocalPos;
in vec3 vNormal;
in vec3 vViewDir;
in vec2 vUv;

out vec4 fragColor;

/* @include noise-common */

/* Captured by render functions for normal perturbation */
vec3 gDetailDerivs = vec3(0.0);

/* Gas: 0 = belt (dark, descending air), 1 = zone (bright, rising air with clouds) */
float gGasBandValue = 0.5;

/* Set by ocean-bearing render functions for specular masking in main() */
float gOceanMask = 0.0;
float gWaveHeight = 0.0;
float gIceCrackMask = 0.0;
float gVolcanicCrackMask = 0.0;
float gFungalVeinMask = 0.0;
float gFungalGlowMask = 0.0;
float gCrystalEdgeMask = 0.0;
float gCrystalGlowMask = 0.0;
float gBiomeRoughness = -1.0; /* -1 = not set, use uRoughness */


vec3 flowWarp(vec3 p, float s, float strength) {
  float n1 = fbm(p * 1.5 + vec3(s * 0.37, s * 1.13, s * 0.61), 0.3);
  float n2 = fbm(p * 1.5 + vec3(s * 1.83, s * 0.29, s * 1.47), 0.3);
  float alpha = n1 * 6.2832;
  float beta = n2 * 3.1416;
  vec3 offset = vec3(cos(alpha) * cos(beta), sin(beta), sin(alpha) * cos(beta));
  return p + offset * strength;
}


/* 6 Gerstner waves — mirrors bake version but with uTime-animated phase.
   Dispersion-correct: big waves scroll slowly, small waves fast (speed ~ sqrt(freq)). */
vec4 gerstnerField(vec3 sp, float s, float roughness) {
  vec3 warpOffset = gnoised(sp * 4.0 + vec3(s * 0.7)).yzw;
  vec3 warpedSp = normalize(sp + warpOffset * 0.07 * roughness);

  float ampMod = 0.55 + 0.45 * fbm(sp * 2.0 + vec3(s * 1.3), 0.3);

  float totalH = 0.0;
  vec3 totalD = vec3(0.0);

  for (int i = 0; i < 6; i++) {
    float fi = float(i);

    float a1 = fract(s * 0.137) * 6.2832 + fi * 2.39996;
    float a2 = acos(clamp(1.0 - (2.0 * fi + 1.0) / 6.0 + fract(s * (0.293 + fi * 0.179)) * 0.25 - 0.125, -1.0, 1.0));
    vec3 dir = normalize(vec3(cos(a1)*sin(a2), cos(a2), sin(a1)*sin(a2)));

    float freq = (25.0 + fi * 25.0) * (0.8 + fract(s * (0.417 + fi * 0.031)) * 0.4);
    float amp = roughness * ampMod * 0.35 / (1.0 + fi * 0.6);
    float steep = 0.3 + fract(s * (0.619 + fi * 0.043)) * 0.5;

    float phaseNoise = gnoised(sp * (6.0 + fi * 4.0) + vec3(s * (0.5 + fi * 0.2))).x * 5.5;
    float phase = fract(s * (0.773 + fi * 0.089)) * 6.2832 + phaseNoise + uTime * sqrt(freq) * 0.4;

    vec4 w = gerstnerWave(warpedSp, dir, freq, amp, steep, phase);
    totalH += w.x;
    totalD += w.yzw;
  }

  return vec4(totalH, totalD);
}

/* Shared ocean surface — Gerstner analytic derivatives, sets gDetailDerivs + gWaveHeight */
vec3 oceanSurface(vec3 sp, float s, float depth, float roughness) {
  vec4 gw = gerstnerField(sp, s, roughness);
  float waves = gw.x;
  gWaveHeight = waves;
  gDetailDerivs = gw.yzw;

  vec3 shallow = uBaseColor1 * 1.1 + vec3(0.02, 0.04, 0.03);
  vec3 mid = uBaseColor1 * 0.65;
  vec3 deep = uBaseColor1 * 0.3;
  vec3 color = mix(shallow, mid, smoothstep(0.0, 0.15, depth));
  color = mix(color, deep, smoothstep(0.15, 0.35, depth));

  color *= 0.8 + waves * 0.5;

  float foam = smoothstep(0.3, 0.65, waves) * roughness * 2.0;
  color += vec3(foam * 0.15);

  float slope = length(gw.yzw);
  color *= mix(1.0, 0.5, smoothstep(0.2, 1.2, slope));

  float lat = abs(sp.y);
  vec3 polarTint = mix(uBaseColor1, vec3(0.5, 0.6, 0.7), 0.4);
  color = mix(color, polarTint, smoothstep(0.0, 0.7, lat) * 0.25);

  return color;
}


vec3 renderRocky(vec3 sp, float s) {
  float lat = abs(sp.y);

  /* Continent shapes — drives height for ocean/biome selection only.
     Derivatives kept low so per-biome normals dominate surface texture. */
  vec4 hd = fbmd(sp * 3.5 + vec3(s), uSlopeness);
  gDetailDerivs = hd.yzw * 0.15;
  float height = hd.x * 0.5 + 0.5;
  float t = 0.02;

  /* Temperature: latitude cosine + noise perturbation + uTemperature
     0 (polar) → 1 (equatorial), noise makes boundaries wiggly */
  float noisePerturb = gnoised(sp * 4.0 + vec3(s * 1.7)).x;
  float temp = cos(lat * PI) * 0.5 + 0.5 + noisePerturb * 0.15 + uTemperature - 0.5;
  temp = clamp(temp, 0.0, 1.0);

  /* Moisture: separate FBM + Hadley cell approximation
     Dip at ~25 deg latitude creates desert belts */
  float moistureFbm = fbm(sp * 2.5 + vec3(s * 3.1, s * 0.7, s * 1.9), 0.4) * 0.5 + 0.5;
  float hadleyD = abs(lat) - 0.4;
  float hadley = 1.0 - 0.4 * exp(-8.0 * hadleyD * hadleyD);
  float moisture = clamp(moistureFbm * hadley + uMoistureOffset, 0.0, 1.0);

  /* Elevation for alpine/mountain override */
  float elev = height;

  /* Biome weight system — 9 biomes, each claims a temp×moisture×elevation zone.
     uBiomeCount controls how many are active (low = 2–4 large zones, high = all 9).
     Weights computed via smoothstep zones, then normalized. */
  float biomeScale = 0.3 + uBiomeCount * 0.7;

  /* Ice/tundra/boreal are NOT scaled by biomeScale — cold biomes always
     present on cold planets regardless of uBiomeCount setting */
  /* 1. Ice/Polar — cold, any moisture */
  float iceW = smoothstep(0.18, 0.08, temp);
  /* Elevation override: above snowline → ice regardless of latitude */
  float snowline = 0.82 + noisePerturb * 0.03;
  iceW = max(iceW, smoothstep(snowline, snowline + 0.03, elev));

  /* 2. Tundra — cold-cool transition */
  float tundraW = smoothstep(0.05, 0.18, temp) * smoothstep(0.35, 0.22, temp);

  /* 3. Boreal/Dense Forest — cool + wet */
  float borealW = smoothstep(0.15, 0.30, temp) * smoothstep(0.45, 0.30, temp)
                * smoothstep(0.35, 0.55, moisture);

  /* 4. Temperate Forest — moderate + wet */
  float tempForestW = smoothstep(0.30, 0.45, temp) * smoothstep(0.65, 0.50, temp)
                    * smoothstep(0.40, 0.60, moisture) * biomeScale;

  /* 5. Grassland/Plains — broad moderate-temp catch-all for drier areas */
  float grassW = smoothstep(0.18, 0.35, temp) * smoothstep(0.80, 0.60, temp)
               * (1.0 - smoothstep(0.55, 0.75, moisture))
               * biomeScale;

  /* 6. Sandy Desert — warm-hot + dry */
  float sandDesertW = smoothstep(0.50, 0.65, temp) * smoothstep(0.35, 0.20, moisture)
                    * biomeScale;

  /* 7. Rocky Desert/Badlands — warm + mid-dry */
  float rockyDesertW = smoothstep(0.45, 0.60, temp) * smoothstep(0.75, 0.60, temp)
                     * smoothstep(0.20, 0.35, moisture) * (1.0 - smoothstep(0.40, 0.55, moisture))
                     * biomeScale;

  /* 8. Tropical/Jungle — hot + wet */
  float tropicalW = smoothstep(0.60, 0.80, temp) * smoothstep(0.50, 0.70, moisture)
                  * biomeScale;

  /* 9. Mountains/Alpine — elevation-gated, any temp/moisture */
  float alpineThresh = 0.72 + noisePerturb * 0.04;
  float mountainW = smoothstep(alpineThresh, alpineThresh + 0.06, elev) * biomeScale;

  /* Grassland acts as catch-all — prevents black gaps in unclaimed zones */
  grassW = max(grassW, 0.08 * biomeScale);

  /* Normalize weights */
  float totalW = iceW + tundraW + borealW + tempForestW + grassW
               + sandDesertW + rockyDesertW + tropicalW + mountainW + 0.001;
  iceW /= totalW; tundraW /= totalW; borealW /= totalW;
  tempForestW /= totalW; grassW /= totalW; sandDesertW /= totalW;
  rockyDesertW /= totalW; tropicalW /= totalW; mountainW /= totalW;

  /* Each biome: distinct noise technique + domain warp for unique visual character.
     Domain warping shifts input coords per-biome so even similar functions diverge. */
  vec3 col1 = uBaseColor1, col2 = uBaseColor2, col3 = uBaseColor3;
  vec3 colGrey = vec3(dot(col3, vec3(0.3, 0.5, 0.2))) * 0.7 + vec3(0.15);
  vec3 colWarm = col3 * vec3(1.2, 1.0, 0.7) + vec3(0.08, 0.04, 0.0);

  vec3 biomeColor = vec3(0.0);
  vec3 biomeDerivs = vec3(0.0);

  /* 1. Ice: ridgedFbm cracks — sharp, linear, high contrast */
  if (iceW > 0.01) {
    float crack = ridgedFbm(sp * 8.0 + vec3(s * 2.3), 3.5, 2.1, 3);
    vec4 iceHd = fbmd(sp * 4.0 + vec3(s * 2.3), 0.4);
    vec3 iceBase = mix(vec3(0.92, 0.94, 0.98), uSubsurfaceColor, 0.10);
    biomeColor += iceW * mix(iceBase, uSubsurfaceColor * 0.4 + vec3(0.15),
                             smoothstep(0.5, 0.8, crack));
    biomeDerivs += iceW * iceHd.yzw * 0.5;
  }

  /* 2. Tundra: low-freq cellular noise for patchy polygonal ground */
  if (tundraW > 0.01) {
    vec4 tunHd = fbmd(sp * 3.0 + vec3(s * 0.5), 0.3);
    float splotch = smoothstep(0.15, 0.45, tunHd.x * 0.5 + 0.5);
    vec3 bare = colGrey * 0.8 + vec3(0.05, 0.03, 0.02);
    vec3 lichen = mix(col2, colGrey, 0.6) * 0.5;
    biomeColor += tundraW * mix(bare, lichen, splotch);
    biomeDerivs += tundraW * tunHd.yzw * 0.25;
  }

  /* 3. Boreal: ridgedFbm tree clusters — sharp-edged dark patches, not smooth blobs */
  if (borealW > 0.01) {
    float trees = ridgedFbm(sp * 5.0 + vec3(s * 1.1), 2.5, 2.0, 3);
    vec4 borHd = fbmd(sp * 5.0 + vec3(s * 1.1), 0.8);
    float canopy = smoothstep(0.35, 0.65, trees);
    vec3 dark = col2 * 0.20;
    vec3 clearing = mix(colGrey, col2, 0.25) * 0.6;
    biomeColor += borealW * mix(clearing, dark, canopy);
    biomeDerivs += borealW * borHd.yzw * 0.8;
  }

  /* 4. Temperate Forest: domain-warped fbmd for organic canopy clumps */
  if (tempForestW > 0.01) {
    vec3 warpP = sp * 8.0 + vec3(s * 1.7);
    vec3 warp = gnoised(warpP * 0.4 + vec3(s * 0.3)).yzw * 0.6;
    vec4 canHd = fbmd(warpP + warp, 0.9);
    float tex = canHd.x * 0.5 + 0.5;
    vec3 shade = col2 * 0.30 + col3 * 0.05;
    vec3 lit = col2 * 0.65 + vec3(0.04);
    biomeColor += tempForestW * mix(shade, lit, tex);
    biomeDerivs += tempForestW * canHd.yzw * 1.0;
  }

  /* 5. Grassland: very low freq, smooth, warm — visually flat + bright */
  if (grassW > 0.01) {
    vec4 grsHd = fbmd(sp * 2.0 + vec3(s * 0.3), 0.2);
    float roll = grsHd.x * 0.5 + 0.5;
    vec3 bright = colWarm * 1.1 + col2 * 0.3;
    vec3 shadow = mix(colWarm, col2, 0.4) * 0.7;
    biomeColor += grassW * mix(shadow, bright, roll);
    biomeDerivs += grassW * grsHd.yzw * 0.15;
  }

  /* 6. Sandy Desert: anisotropic ridgedFbm dune stripes */
  if (sandDesertW > 0.01) {
    vec3 duneP = sp * vec3(3.0, 12.0, 3.0) + vec3(s * 0.9);
    float dunes = ridgedFbm(duneP, 3.0, 2.0, 3);
    vec4 duneHd = fbmd(duneP * 0.7, 0.6);
    vec3 ridge = colWarm * 1.3 + vec3(0.12, 0.08, 0.0);
    vec3 trough = colWarm * 0.65 + vec3(0.02);
    biomeColor += sandDesertW * mix(trough, ridge, smoothstep(0.25, 0.65, dunes));
    biomeDerivs += sandDesertW * duneHd.yzw * 1.0;
  }

  /* 7. Rocky Desert/Badlands: pow-sharpened ridgedFbm for angular mesas */
  if (rockyDesertW > 0.01) {
    float mesa = ridgedFbm(sp * 4.0 + vec3(s * 1.5), 3.5, 2.2, 4);
    mesa = pow(max(0.0, 1.0 - abs(mesa - 0.5) * 2.0), 5.0);
    vec4 mesaHd = fbmd(sp * 5.0 + vec3(s * 1.5), 1.2);
    vec3 plateau = colGrey * 0.9 + colWarm * 0.2;
    vec3 cliff = colGrey * 0.4;
    biomeColor += rockyDesertW * mix(plateau, cliff, mesa);
    biomeDerivs += rockyDesertW * mesaHd.yzw * 1.2;
  }

  /* 8. Tropical: domain-warped ridgedFbm for tangled dense canopy */
  if (tropicalW > 0.01) {
    vec3 junP = sp * 7.0 + vec3(s * 2.1);
    vec3 junWarp = gnoised(junP * 0.3 + vec3(s * 0.8)).yzw * 0.8;
    float canopy = ridgedFbm(junP + junWarp, 3.0, 2.1, 3);
    vec4 junHd = fbmd(junP + junWarp, 0.9);
    vec3 deep = col2 * 0.15;
    vec3 top = col2 * 0.45 + col1 * 0.06;
    biomeColor += tropicalW * mix(deep, top, smoothstep(0.3, 0.7, canopy));
    biomeDerivs += tropicalW * junHd.yzw * 1.1;
  }

  /* 9. Mountains: ridged FBM + steep slope darkening, mostly grey */
  if (mountainW > 0.01) {
    float mtRidge = ridgedFbm(sp * 6.0 + vec3(s * 0.7), 4.5, 2.1, 4);
    vec4 mtHd = fbmd(sp * 6.0 + vec3(s * 0.7), uSlopeness * 1.5);
    vec3 rock = colGrey * 0.55 + col3 * 0.08;
    vec3 peak = vec3(0.55, 0.52, 0.48);
    vec3 mtCol = mix(rock, peak, smoothstep(0.3, 0.7, mtRidge));
    float mtSlope = length(mtHd.yzw);
    mtCol *= mix(1.0, 0.35, smoothstep(0.15, 1.0, mtSlope * uSlopeness));
    biomeColor += mountainW * mtCol;
    biomeDerivs += mountainW * mtHd.yzw * 1.5;
  }

  gDetailDerivs += biomeDerivs;

  /* Per-biome roughness */
  gBiomeRoughness = iceW * 0.15 + tundraW * 0.75 + borealW * 0.65
                  + tempForestW * 0.55 + grassW * 0.70 + sandDesertW * 0.85
                  + rockyDesertW * 0.90 + tropicalW * 0.50 + mountainW * 0.80;

  vec3 color = biomeColor;

  /* Ocean handling — below ocean level */
  float oceanMask = 1.0 - smoothstep(uOceanLevel - t, uOceanLevel + t, height);
  gOceanMask = oceanMask;

  if (oceanMask > 0.01) {
    float depth = max(0.0, uOceanLevel - height);
    vec3 terrainDerivs = gDetailDerivs;

    /* Dampen waves for rocky planets — land constrains fetch */
    vec3 oceanColor = oceanSurface(sp, s, depth, uWarpStrength * 0.4);
    vec3 oceanDerivs = gDetailDerivs;

    /* Polar ice over ocean */
    if (iceW > 0.3) {
      float iceGrain = gnoised(sp * 20.0 + vec3(s * 3.0)).x;
      vec3 iceBase = mix(vec3(0.90, 0.93, 0.97), uSubsurfaceColor, 0.12);
      vec3 ic = iceBase * (0.9 + iceGrain * 0.1);
      float iceOpacity = smoothstep(0.3, 0.7, iceW);
      oceanColor = mix(oceanColor, ic, iceOpacity);
      gOceanMask *= 1.0 - iceOpacity;
      gDetailDerivs *= 1.0 - iceOpacity;
      gWaveHeight *= 1.0 - iceOpacity;
    }

    if (oceanMask > 0.99) return oceanColor;

    gDetailDerivs = mix(terrainDerivs, oceanDerivs, oceanMask);
    return mix(color, oceanColor, oceanMask);
  }

  /* Land slope darkening (global, on top of per-biome) */
  float slope = length(hd.yzw);
  color *= mix(1.0, 0.55, smoothstep(0.15, 1.2, slope * uSlopeness));

  return color;
}


vec3 renderBarren(vec3 sp, float s) {
  vec3 cp = sp + vec3(s * 0.13, s * 0.37, s * 0.71);

  float height = craterFbm(cp);

  float eps = 0.013;
  float hx = craterFbm(cp + vec3(eps, 0.0, 0.0));
  float hy = craterFbm(cp + vec3(0.0, eps, 0.0));
  float hz = craterFbm(cp + vec3(0.0, 0.0, eps));
  gDetailDerivs = (vec3(hx, hy, hz) - height) / eps;

  float macro = fbm(sp * 1.5 + vec3(s), 0.3) * 0.15;
  height = height * 0.85 + macro + 0.08;

  float brightness = mix(0.35, 1.0, height);
  vec3 color = uBaseColor1 * brightness;
  color = mix(color, uBaseColor2 * brightness, smoothstep(0.3, 0.7, height) * 0.35);

  float slope = length(gDetailDerivs);
  color *= mix(1.0, 0.5, smoothstep(1.0, 8.0, slope * uSlopeness));

  float pitting = gnoised(sp * 30.0 + vec3(s * 2.3)).x;
  color *= 0.82 + pitting * 0.18;
  float grain = gnoised(sp * 80.0 + vec3(s * 4.1)).x;
  color *= 0.88 + grain * 0.12;

  return color;
}


vec3 renderGas(vec3 sp, float s) {
  float lat = sp.y;
  float lon = atan(sp.z, sp.x);

  /* Curl-based band warp — divergence-free flow circles latitude lines */
  vec3 lonP = vec3(sp.x * 3.0, sp.y * 0.5, sp.z * 3.0);
  vec4 curlN = gnoised(lonP + vec3(s * 0.7, 0.0, s * 1.1));
  float curlWarp = (curlN.w * sp.x - curlN.y * sp.z);
  float meander1 = fbm(lonP + vec3(s, 0.0, s * 0.7), 0.4);
  float meander2 = fbm(lonP + vec3(meander1 * 0.5 + s * 2.1), 0.35);
  float warpedLat = lat
    + curlWarp * uWarpStrength * 0.4
    + (meander2 * 2.0 - 1.0) * uWarpStrength * 0.6;

  /* Storm count from seed — probability cascade */
  int stormCount = 0;
  if (uStormSize > 0.01) {
    stormCount = 1;
    float sc = fract(s * 0.557);
    if (sc < 0.40) stormCount = 2;
    if (sc < 0.20) stormCount = 3;
    if (sc < 0.05) stormCount = 3 + int(fract(s * 0.811) * 5.0) + 1;
  }

  /* Storms DEFLECT bands — warp warpedLat around each vortex */
  float stormEyeMask = 0.0;
  for (int i = 0; i < 8; i++) {
    if (i >= stormCount) break;
    float fi = float(i);
    float stormSeed = s + fi * 17.31;

    vec2 center = vec2(
      fract(stormSeed * 0.073) * 6.2832 - 3.1416,
      -0.4 + fract(stormSeed * 0.031) * 0.8
    );
    float R = uStormSize * (0.25 - fi * 0.025);
    float dLon = lon - center.x;
    dLon -= round(dLon / 6.2832) * 6.2832;
    vec2 delta = vec2(dLon * cos(center.y), (lat - center.y) * 2.0);
    float r = length(delta);
    float rNoise = gnoised(sp * 12.0 + vec3(stormSeed * 0.3)).x * R * 0.3;
    float rNoisy = r + rNoise;

    float influence = 1.0 - smoothstep(R * 0.5, R * 1.3, rNoisy);
    if (influence < 0.01) continue;

    float ring = smoothstep(0.0, R * 0.7, r) * (1.0 - smoothstep(R * 0.85, R * 1.2, r));
    float swirlAngle = atan(delta.y, delta.x) + ring * (4.5 - fi * 0.5);
    float deflection = sin(swirlAngle) * influence * R * 1.5;
    warpedLat += deflection;

    float eyeDist = smoothstep(R * 0.2, 0.0, rNoisy);
    stormEyeMask = max(stormEyeMask, eyeDist * influence);
  }

  /* Kelvin-Helmholtz billows at band edges */
  float bandPhase = warpedLat * uBandCount * PI;
  float edgeProximity = 1.0 - abs(cos(bandPhase));
  edgeProximity = smoothstep(0.0, 0.4, edgeProximity);
  float kh = sin(lon * 8.0 + bandPhase * 1.7) * edgeProximity;
  kh *= 0.5 + 0.5 * fbm(sp * 5.0 + vec3(s * 0.8), 0.3);
  warpedLat += kh * uWarpStrength * 0.35;

  float f1 = 0.5 + fract(s * 0.137) * 0.5;
  float f2 = 1.1 + fract(s * 0.293) * 0.6;
  float f3 = 1.8 + fract(s * 0.419) * 0.8;
  float band1 = sin(warpedLat * uBandCount * f1 * PI) * 0.6;
  float band2 = sin(warpedLat * uBandCount * f2 * PI + 1.7) * 0.3;
  float band3 = sin(warpedLat * uBandCount * f3 * PI + 3.1) * 0.1;
  float bands = (band1 + band2 + band3) * 0.5 + 0.5;
  gGasBandValue = bands;

  float turb = fbm(vec3(sp.x * 6.0, sp.y * 0.4, sp.z * 6.0) + vec3(s * 1.7), 0.3);
  bands += turb * (0.04 + edgeProximity * 0.12);

  vec3 color = mix(uBaseColor1, uBaseColor2, smoothstep(0.2, 0.5, bands));
  color = mix(color, uBaseColor3, smoothstep(0.55, 0.85, bands));

  if (stormEyeMask > 0.01)
    color = mix(color, uBaseColor3 * 1.3, stormEyeMask * 0.6);

  color = mix(color, uBaseColor2 * 0.85, edgeProximity * 0.08);

  float bandEdge = abs(cos(warpedLat * uBandCount * PI));
  color *= 0.82 + bandEdge * 0.18;

  gDetailDerivs = curlN.yzw;
  float slope = length(curlN.yzw);
  color *= mix(1.0, 0.7, smoothstep(0.3, 1.2, slope * uWarpStrength));

  /* Polar transition — gradual fade, band ghost bleeds through */
  float polarBlend = smoothstep(0.45, 0.85, abs(lat));
  if (polarBlend > 0.01) {
    float polarNoise = fbm(sp * 7.0 + vec3(s * 2.3), 0.5);
    float bandGhost = sin(warpedLat * uBandCount * f1 * PI * 0.5) * 0.15;
    vec3 polarColor = mix(uBaseColor1, uBaseColor2, polarNoise * 0.35 + bandGhost + 0.35);
    polarColor *= 0.88;
    color = mix(color, polarColor, polarBlend);
  }

  return color;
}


vec3 renderOcean(vec3 sp, float s) {
  vec3 p = flowWarp(sp * 3.5, s, 0.25);
  vec4 hd = fbmd(p + vec3(s), uSlopeness);
  float height = hd.x * 0.5 + 0.5;
  float t = 0.02;

  float depth = max(0.0, uOceanLevel - height);
  float isOcean = 1.0 - smoothstep(uOceanLevel - t, uOceanLevel + t, height);
  gOceanMask = isOcean;

  vec3 color = oceanSurface(sp, s, depth, uWarpStrength);

  if (isOcean < 0.99) {
    vec3 landColor = uBaseColor2 * 1.2 + 0.1;
    landColor = mix(landColor, uBaseColor3, smoothstep(uOceanLevel + 0.05, uOceanLevel + 0.2, height));

    float slope = length(hd.yzw);
    landColor *= mix(1.0, 0.55, smoothstep(0.25, 1.5, slope * uSlopeness));

    color = mix(color, landColor, 1.0 - isOcean);
    gDetailDerivs = mix(gDetailDerivs, hd.yzw, 1.0 - isOcean);
  }

  /* Polar ice caps */
  float lat = abs(sp.y);
  float polarNoise = fbm(sp * 4.0 + vec3(s * 1.7), 0.3) * 0.1;
  float coldness = 1.0 - smoothstep(0.35, 0.75, uTemperature);
  float iceLine = mix(0.97, 0.80, coldness);
  float polarIce = smoothstep(iceLine - 0.04, iceLine + 0.04, lat + polarNoise);

  if (polarIce > 0.01) {
    vec3 iceColor = mix(vec3(0.78, 0.84, 0.90), vec3(0.92, 0.95, 0.98), polarNoise * 5.0 + 0.5);
    float iceGrain = gnoised(sp * 20.0 + vec3(s * 3.0)).x;
    iceColor *= 0.9 + iceGrain * 0.1;
    float iceOpacity = smoothstep(0.0, 0.3, polarIce);
    color = mix(color, iceColor, iceOpacity);
    gOceanMask *= 1.0 - iceOpacity;
    /* Kill wave derivatives under ice so bump normals don't ripple */
    gDetailDerivs *= 1.0 - iceOpacity;
    gWaveHeight *= 1.0 - iceOpacity;
  }

  return color;
}


vec3 renderIce(vec3 sp, float s) {
  vec3 off = vec3(s * 0.13, s * 0.37, s * 0.71);

  float bigCracks   = ridgedFbm(sp * 1.5 + off, uCrackScale * 0.4, 2.1, 3);
  float medCracks   = ridgedFbm(sp * 3.5 + off * 1.7, uCrackScale * 0.8, 2.3, 4);
  float fineCracks  = ridgedFbm(sp * 8.0 + off * 2.3, uCrackScale * 1.2, 2.0, 3);

  float threshVar = fbm(sp * 2.0 + vec3(s), 0.3) * 0.08;
  float cracks = smoothstep(0.55 + threshVar, 0.80, bigCracks) * 0.6
               + smoothstep(0.60, 0.82, medCracks) * 0.3
               + smoothstep(0.65, 0.85, fineCracks) * 0.15;
  cracks = clamp(cracks, 0.0, 1.0);

  float height = ridgedFbm(sp * 2.5 + off * 0.5, 3.0, 2.2, 4) * 0.35
               + fbm(sp * 1.5 + vec3(s * 2.0), 0.3) * 0.65;

  float eps = 0.015;
  float hx = ridgedFbm((sp + vec3(eps, 0.0, 0.0)) * 2.5 + off * 0.5, 3.0, 2.2, 4) * 0.35
           + fbm((sp + vec3(eps, 0.0, 0.0)) * 1.5 + vec3(s * 2.0), 0.3) * 0.65;
  float hy = ridgedFbm((sp + vec3(0.0, eps, 0.0)) * 2.5 + off * 0.5, 3.0, 2.2, 4) * 0.35
           + fbm((sp + vec3(0.0, eps, 0.0)) * 1.5 + vec3(s * 2.0), 0.3) * 0.65;
  float hz = ridgedFbm((sp + vec3(0.0, 0.0, eps)) * 2.5 + off * 0.5, 3.0, 2.2, 4) * 0.35
           + fbm((sp + vec3(0.0, 0.0, eps)) * 1.5 + vec3(s * 2.0), 0.3) * 0.65;
  gDetailDerivs = (vec3(hx, hy, hz) - height) / eps;

  float plateVar = fbm(sp * 3.0 + vec3(s * 3.7), 0.3);
  vec3 color = mix(uBaseColor1, uBaseColor2, plateVar * 0.35 + 0.3);
  color = mix(color, uBaseColor3, smoothstep(0.4, 0.7, height) * 0.25);

  color *= 0.85 + clamp(height, 0.0, 1.0) * 0.25;

  float slope = length(gDetailDerivs);
  color *= mix(1.0, 0.75, smoothstep(0.15, 1.0, slope * uSlopeness));

  vec3 crackColor = uSubsurfaceColor * 0.7;
  color = mix(color, crackColor, cracks);

  gIceCrackMask = cracks;
  return color;
}


vec3 renderVolcanic(vec3 sp, float s) {
  vec3 off = vec3(s * 0.17, s * 0.41, s * 0.63);

  /* Lava churn — warp crack coordinates so fissures ooze and shift */
  float churnT = uTime * 0.15;
  vec3 churnOff = vec3(
    fbm(sp * 1.5 + vec3(churnT, 0.0, s), 0.3) * 0.12,
    0.0,
    fbm(sp * 1.5 + vec3(s, churnT * 0.7, 0.0), 0.3) * 0.12
  );

  float bigFissures  = ridgedFbm(sp * 1.8 + off + churnOff, uCrackScale * 0.5, 2.1, 3);
  float medFissures  = ridgedFbm(sp * 4.0 + off * 1.5 + churnOff, uCrackScale * 0.9, 2.3, 4);
  float fineFissures = ridgedFbm(sp * 9.0 + off * 2.1, uCrackScale * 1.3, 2.0, 3);

  float height = ridgedFbm(sp * 2.5 + off * 0.5, 3.5, 2.2, 4) * 0.55
               + fbm(sp * 1.5 + vec3(s * 2.0), 0.3) * 0.45;

  float caldera = smoothstep(0.5, 0.8, height) * 0.25;
  float threshVar = fbm(sp * 2.0 + vec3(s * 0.7), 0.3) * 0.06;
  float cracks = smoothstep(0.62 + threshVar, 0.85, bigFissures) * 0.55
               + smoothstep(0.65, 0.87, medFissures) * 0.30
               + smoothstep(0.70, 0.88, fineFissures) * 0.15
               + caldera;
  cracks = clamp(cracks, 0.0, 1.0);

  float craters = craterFbm(sp * 1.2 + off * 0.3);
  float craterBlend = uCraterDensity * 0.3;
  height = mix(height, craters, craterBlend);

  /* Skip craterFbm in finite-diff — too expensive per-frame (375 loops × 3 axes) */
  float eps = 0.015;
  float hx = ridgedFbm((sp + vec3(eps, 0.0, 0.0)) * 2.5 + off * 0.5, 3.5, 2.2, 4) * 0.55
           + fbm((sp + vec3(eps, 0.0, 0.0)) * 1.5 + vec3(s * 2.0), 0.3) * 0.45;
  float hy = ridgedFbm((sp + vec3(0.0, eps, 0.0)) * 2.5 + off * 0.5, 3.5, 2.2, 4) * 0.55
           + fbm((sp + vec3(0.0, eps, 0.0)) * 1.5 + vec3(s * 2.0), 0.3) * 0.45;
  float hz = ridgedFbm((sp + vec3(0.0, 0.0, eps)) * 2.5 + off * 0.5, 3.5, 2.2, 4) * 0.55
           + fbm((sp + vec3(0.0, 0.0, eps)) * 1.5 + vec3(s * 2.0), 0.3) * 0.45;
  gDetailDerivs = (vec3(hx, hy, hz) - height) / eps;

  float plateVar = fbm(sp * 3.0 + vec3(s * 2.9), 0.3);
  vec3 rock = mix(uBaseColor1, uBaseColor2, plateVar * 0.3 + 0.35);
  rock = mix(rock, uBaseColor3, smoothstep(0.5, 0.8, height) * 0.2);
  float darkening = uTemperature > 0.5 ? 0.25 : 0.85;
  float heightRange = uTemperature > 0.5 ? 0.35 : 0.15;
  rock *= darkening + clamp(height, 0.0, 1.0) * heightRange;

  float slope = length(gDetailDerivs);
  float slopeDark = uTemperature > 0.5 ? 0.5 : 0.82;
  rock *= mix(1.0, slopeDark, smoothstep(0.15, 1.0, slope * uSlopeness));

  float pitting = gnoised(sp * 25.0 + vec3(s * 2.3)).x;
  float pitAmt = uTemperature > 0.5 ? 0.15 : 0.06;
  rock *= (1.0 - pitAmt) + pitting * pitAmt;

  float hotEdge = smoothstep(0.0, 0.6, cracks);
  vec3 edgeTint = uTemperature > 0.5 ? vec3(1.0, 0.85, 0.3) : vec3(0.6, 0.9, 1.0);
  vec3 midTint  = uTemperature > 0.5 ? vec3(1.0, 0.55, 0.1) : vec3(0.3, 0.7, 0.95);
  vec3 lavaCore = uEmissiveColor * (1.2 + uEmissiveIntensity);
  vec3 lavaMid  = mix(uEmissiveColor, midTint, 0.4) * (0.9 + uEmissiveIntensity);
  vec3 lavaEdge = mix(uEmissiveColor, edgeTint, 0.5) * uEmissiveIntensity;
  float streaks = fbm(sp * 6.0 + vec3(s * 1.7), 0.4);
  vec3 lavaColor = mix(lavaEdge, lavaMid, smoothstep(0.2, 0.5, hotEdge));
  lavaColor = mix(lavaColor, lavaCore, smoothstep(0.5, 0.9, hotEdge));
  lavaColor += edgeTint * streaks * 0.15 * cracks;
  vec3 color = mix(rock, lavaColor, cracks);

  gVolcanicCrackMask = cracks;
  return color;
}


vec3 renderCrystalline(vec3 sp, float s) {
  vec3 p = sp * uCrackScale + vec3(s);

  /* Primary crystal layer — dual-cell intersection creates cleavage planes */
  vec3 crystalDelta;
  vec4 cr = crystals3D(p, 0.85, uCrystalMetric, s, crystalDelta);
  float crystalVal = cr.x;
  float f1 = cr.y;
  float cellId = cr.z;
  float edgeDist = cr.w;

  /* Secondary layer at finer scale for internal fracture detail */
  vec4 cr2 = crystals3D(p * 2.3 + vec3(s * 0.7), 0.85, uCrystalMetric, s + 11.0);

  /* Per-cell color — tight hue variation + per-crystal brightness/saturation */
  float cellHue = fract(sin(cellId * 127.1) * 43758.5453);
  vec3 cellColor = mix(uBaseColor1, uBaseColor2, smoothstep(0.28, 0.38, cellHue));
  cellColor = mix(cellColor, uBaseColor3, smoothstep(0.62, 0.72, cellHue));
  float cellBright = fract(sin(cellId * 43.7) * 12345.6789);
  cellColor *= 0.82 + cellBright * 0.36;

  /* Growth banding from dual-layer crystal value — angular contours instead
     of circular f1 rings, since the two-cell intersection is inherently sharp. */
  float bandNoise = fbm(sp * 3.0 + vec3(s), 0.2) * 0.15;
  float bandPattern = fract(crystalVal * 6.0 + cr2.x * 3.0 + bandNoise);
  float band = smoothstep(0.0, 0.3, bandPattern) * smoothstep(1.0, 0.5, bandPattern);
  float bandBright = mix(0.85, 1.15, band);
  /* uBulbosity > 0.5 → bright cores, dark edges; < 0.5 → dark cores, bright edges */
  float radialGrad = smoothstep(0.0, 0.5, crystalVal);
  float coreDark = mix(bandBright, bandBright * 0.78, radialGrad * step(uBulbosity, 0.5));
  float coreLight = mix(bandBright * 0.78, bandBright, radialGrad * step(0.5, uBulbosity));
  float brightness = mix(coreDark, coreLight, step(0.5, uBulbosity));
  cellColor *= brightness;

  /* Sharp facet edges — primary cleavage + secondary fractures */
  float primaryEdge = smoothstep(0.0, 0.04, edgeDist);
  float secondaryEdge = smoothstep(0.0, 0.06, cr2.w);
  float combinedEdge = primaryEdge * mix(1.0, secondaryEdge, 0.4);

  /* Edge tinting — subsurface color shows at boundaries */
  vec3 edgeColor = mix(cellColor * 0.35, uSubsurfaceColor * 0.4, 0.5);
  vec3 color = mix(edgeColor, cellColor, combinedEdge);

  float glowMask = (1.0 - primaryEdge) + (1.0 - secondaryEdge) * 0.3;
  glowMask = clamp(glowMask, 0.0, 1.0);
  gCrystalEdgeMask = 1.0 - combinedEdge;
  gCrystalGlowMask = glowMask;

  /* Crystal interior — secondary pattern modulates brightness */
  float interior = crystalVal * 0.5 + cr2.x * 0.3;
  color *= 0.92 + interior * 0.2;

  /* Derivatives from primary cell for normal perturbation */
  gDetailDerivs = crystalDelta * 2.5;

  return color;
}


vec3 renderFungal(vec3 sp, float s) {
  /* Dual flow-warped terrain — colordodge-derived organic continent shapes */
  vec3 wp1 = flowWarp(sp * 2.5, s, uWarpStrength);
  vec3 wp2 = flowWarp(sp * 1.8, s + 7.31, uWarpStrength * 0.7);

  vec4 hd1 = fbmd(wp1 + vec3(s * 0.31), uSlopeness);
  float terrain1 = clamp((hd1.x * 0.5 + 0.5 - 0.5) * 2.0 + 0.5, 0.0, 1.0);
  float terrain2 = fbm(wp2 + vec3(s * 1.73), 0.3) * 0.5 + 0.5;
  gDetailDerivs = hd1.yzw;

  float height = terrain1 * 0.65 + terrain2 * 0.35;

  /* Dual-noise color mapping — wide hue rotation between colors creates
     colordodge-style splotch variety. 4th color synthesized from complement
     of color1+color3 midpoint for extra variety without a new uniform. */
  vec3 color4 = (uBaseColor1 + uBaseColor3) * 0.5;
  color4 = vec3(1.0) - color4;
  color4 = mix(color4, uBaseColor2, 0.3);

  vec3 color = mix(uBaseColor1, uBaseColor2, smoothstep(0.15, 0.50, terrain1));
  color = mix(color, uBaseColor3, smoothstep(0.45, 0.80, terrain2));
  float crossNoise = terrain1 * 0.6 + terrain2 * 0.4;
  color = mix(color, color4, smoothstep(0.55, 0.85, crossNoise) * 0.45);
  color *= 0.75 + height * 0.35;

  /* Water pools in terrain lows — higher threshold = more coverage */
  float poolDepth = max(0.0, 0.45 - height);
  float poolMask = smoothstep(0.0, 0.12, poolDepth);
  if (poolMask > 0.01) {
    vec3 poolColor = uSubsurfaceColor * 0.6 + uBaseColor1 * 0.2;
    color = mix(color, poolColor, poolMask * 0.7);
  }
  gOceanMask = poolMask;

  /* Mycelium network — domain-warped ridgedFbm for organic branching */
  vec3 veinOff = vec3(s * 0.17, s * 0.41, s * 0.63);
  float churnT = uTime * 0.04;
  vec3 animOff = vec3(
    fbm(sp * 0.8 + vec3(churnT, 0.0, s), 0.3) * 0.06,
    0.0,
    fbm(sp * 0.8 + vec3(s, churnT * 0.6, 0.0), 0.3) * 0.06
  );

  /* Route veins through terrain via fbm domain warp */
  float veinWarpN1 = fbm(sp * uCrackScale * 0.7 + vec3(s * 0.9), 0.3);
  float veinWarpN2 = fbm(sp * uCrackScale * 0.7 + vec3(s * 1.6), 0.3);
  vec3 veinWarped = sp * uCrackScale + vec3(veinWarpN1, 0.0, veinWarpN2) * 0.4 + animOff;

  float primaryVeins = ridgedFbm(veinWarped + veinOff, 2.5, 2.1, 3);
  float secondaryVeins = ridgedFbm(sp * uCrackScale * 2.3 + veinOff * 1.7 + animOff, 1.8, 2.3, 4);

  float threshVar = fbm(sp * 1.5 + vec3(s), 0.3) * 0.06;
  float veins = smoothstep(0.75 + threshVar, 0.92, primaryVeins) * 0.6
              + smoothstep(0.78, 0.93, secondaryVeins) * 0.3;
  veins = clamp(veins, 0.0, 1.0);

  /* Bioluminescent pulse traveling along vein ridges */
  float pulseFreq = 8.0 + fract(s * 0.37) * 12.0;
  float pulseSpeed = 0.8 + fract(s * 0.71) * 1.2;
  float pulse = sin(primaryVeins * pulseFreq - uTime * pulseSpeed) * 0.5 + 0.5;
  pulse = smoothstep(0.4, 0.9, pulse) * veins;
  gFungalVeinMask = veins;
  gFungalGlowMask = pulse;

  /* Dark substrate between veins */
  color = mix(color, uSubsurfaceColor * 0.15, veins * 0.5);

  /* Slope darkening from terrain derivatives */
  float slope = length(gDetailDerivs);
  color *= mix(1.0, 0.6, smoothstep(0.15, 1.0, slope * uSlopeness));

  return color;
}

/* Cook-Torrance GGX BRDF — replaces old wrap+Blinn-Phong */
float DistributionGGX(float NdotH, float roughness) {
  float a  = roughness * roughness;
  float a2 = a * a;
  float d  = NdotH * NdotH * (a2 - 1.0) + 1.0;
  return a2 / max(PI * d * d, 1e-7);
}

float GeometrySchlickGGX(float NdotV, float roughness) {
  float r = roughness + 1.0;
  float k = (r * r) / 8.0;
  return NdotV / (NdotV * (1.0 - k) + k);
}

float GeometrySmith(float NdotV, float NdotL, float roughness) {
  return GeometrySchlickGGX(max(NdotV, 0.001), roughness)
       * GeometrySchlickGGX(max(NdotL, 0.001), roughness);
}

vec3 fresnelSchlick(float cosTheta, vec3 F0) {
  return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}


void main() {
  /* vLocalPos is body-local — texture sticks to surface, geometry rotation is separate */
  vec3 rotated = normalize(vLocalPos);
  float s = fract(uSeed * 0.00000013) * 100.0;

  /* LOD tiers — 0 = closest, 1 = at activation boundary.
     Features fade in progressively as camera approaches. */
  float lod = smoothstep(6.0, 16.0, uLodDist);
  bool lodClose   = lod < 0.5;
  bool lodMedium  = lod < 0.75;

  /* Animated churn for gas/ocean — skip at far LOD */
  vec3 sp = rotated;
  if (lodMedium) {
    float churnT = uTime * 0.25;
    vec4 churnN = gnoised(sp * 3.0 + vec3(churnT * 0.7, churnT * 0.3, -churnT * 0.5));
    float churnAmt = float(uPlanetMode == 2 || uPlanetMode == 3) * 0.07;
    sp.x += churnN.y * churnAmt;
    sp.z += churnN.z * churnAmt;
  }

  gDetailDerivs = vec3(0.0);
  gOceanMask = 0.0;
  gWaveHeight = 0.0;
  gIceCrackMask = 0.0;
  gVolcanicCrackMask = 0.0;
  gFungalVeinMask = 0.0;
  gFungalGlowMask = 0.0;
  gCrystalEdgeMask = 0.0;
  gCrystalGlowMask = 0.0;
  gBiomeRoughness = -1.0;

  vec3 color;
  if (uPlanetMode == 0)      color = renderRocky(sp, s);
  else if (uPlanetMode == 1) color = renderBarren(sp, s);
  else if (uPlanetMode == 2) color = renderGas(sp, s);
  else if (uPlanetMode == 3) color = renderOcean(sp, s);
  else if (uPlanetMode == 4) color = renderIce(sp, s);
  else if (uPlanetMode == 5) color = renderVolcanic(sp, s);
  else if (uPlanetMode == 6) color = renderCrystalline(sp, s);
  else if (uPlanetMode == 7) color = renderFungal(sp, s);
  else                       color = vec3(0.5);

  /* High-freq detail — expensive, only at close range */
  bool isFluid = (uPlanetMode == 2 || uPlanetMode == 3);
  if (lodMedium) {
    vec3 hp = sp * 18.0 + vec3(s * 0.73);
    vec4 fn1 = gnoised(hp);
    float fine2 = 0.0;
    if (lodClose) fine2 = gnoised(hp * 2.37 + vec3(s * 1.91)).x;
    float fineDetail = fn1.x * 0.5 + fine2 * 0.25;
    if (isFluid) {
      color += (uBaseColor2 - uBaseColor1) * fineDetail * 0.06 * gOceanMask;
    } else {
      color *= 1.0 + fineDetail * 0.12;
    }
    gDetailDerivs += fn1.yzw * 0.3;
  }

  vec3 N = normalize(vNormal);
  vec3 V = normalize(vViewDir);
  /* Analytical sphere tangent — continuous at poles, no binary switch seam */
  vec3 T = vec3(-N.z, 0.0, N.x);
  float tLen = length(T);
  T = tLen > 0.001 ? T / tLen : vec3(1.0, 0.0, 0.0);
  vec3 B = cross(N, T);
  float derivLen = length(gDetailDerivs);
  /* Bump fades out at far LOD so it matches the flat atlas shading */
  /* Rocky/crystalline/fungal get stronger bump for terrain character */
  float bumpCap = (uPlanetMode == 0 || uPlanetMode == 6 || uPlanetMode == 7) ? 1.0 : 0.35;
  float bumpMul = (uPlanetMode == 0 || uPlanetMode == 6 || uPlanetMode == 7) ? 0.7 : 0.25;
  float bumpStrength = min(bumpCap, derivLen * bumpMul) * (1.0 - lod);
  vec3 perturbedN = normalize(N - bumpStrength * (gDetailDerivs.x * T + gDetailDerivs.y * B));

  vec3 L = normalize(uLightDir);

  /* Per-subtype roughness — masks modulate base uRoughness per-fragment */
  float effectiveRoughness = uRoughness;
  /* Rocky biome-driven roughness overrides base when set */
  if (gBiomeRoughness >= 0.0)
    effectiveRoughness = gBiomeRoughness;
  if (uPlanetMode == 0 || uPlanetMode == 3)
    effectiveRoughness = mix(effectiveRoughness, 0.04, gOceanMask);
  if (uPlanetMode == 4)
    effectiveRoughness = mix(uRoughness, 0.9, gIceCrackMask);
  if (uPlanetMode == 5)
    effectiveRoughness = mix(uRoughness, 0.04, gVolcanicCrackMask * 0.5);
  if (uPlanetMode == 6)
    effectiveRoughness = mix(uRoughness, 0.5, gCrystalEdgeMask);
  if (uPlanetMode == 7) {
    effectiveRoughness = mix(uRoughness, 0.15, gFungalVeinMask * 0.6);
    effectiveRoughness = mix(effectiveRoughness, 0.04, gOceanMask);
  }

  /* Wrap-light NdotL — shifts terminator softward so small spheres
     don't get knife-edge shadow boundaries */
  float NdotL_raw = dot(perturbedN, L);
  float NdotL = max(0.0, NdotL_raw * 0.65 + 0.35);

  vec3 H = normalize(L + V);
  float NdotH = max(0.0, dot(perturbedN, H));
  float NdotV = max(0.0, dot(perturbedN, V));
  float HdotV = max(0.0, dot(H, V));

  /* Cook-Torrance GGX specular */
  vec3 albedo = color;
  vec3 F0 = mix(vec3(0.04), albedo, uMetalness);
  vec3 F  = fresnelSchlick(HdotV, F0);
  float D = DistributionGGX(NdotH, effectiveRoughness);
  float G = GeometrySmith(NdotV, NdotL, effectiveRoughness);

  vec3 specular = (D * G * F) / max(4.0 * NdotV * NdotL, 0.001);

  /* Energy-conserving diffuse — metals have no diffuse.
     Skip /PI normalization: we have one directional light, no environment
     map, so the PI divisor just makes everything too dark. */
  vec3 kD = (vec3(1.0) - F) * (1.0 - uMetalness);
  color = (kD * albedo + specular) * NdotL;

  /* Ambient floor — uses albedo so dark side stays readable */
  color += kD * albedo * 0.12;



  /* Crystalline — boosted ambient (gems scatter light internally) + edge glow */
  if (uPlanetMode == 6) {
    color += albedo * 0.15;
    color += uSubsurfaceColor * gCrystalGlowMask * uEmissiveIntensity * 0.5;
  }
  /* Volcanic emissive — additive glow unaffected by lighting */
  if (uPlanetMode == 5) {
    vec3 lavaGlow = uEmissiveColor * gVolcanicCrackMask * uEmissiveIntensity * 0.6;
    color += lavaGlow;
  }
  if (uPlanetMode == 7) {
    color += uEmissiveColor * gFungalVeinMask * uEmissiveIntensity * 0.4;
    color += uEmissiveColor * 1.8 * gFungalGlowMask * uEmissiveIntensity;
  }

  float alpha = uFadeIn;
  if (uOpacity >= 0.0) {
    /* Explicit opacity override — bypasses crystal transparency */
    alpha *= uOpacity;
  } else if (uPlanetMode == 6) {
    /* Default crystal transparency: per-body random, squared to skew opaque */
    float bodyTransp = fract(s * 0.137);
    bodyTransp *= bodyTransp;
    alpha *= mix(1.0 - bodyTransp * 0.03, 1.0 - bodyTransp * 0.10, gCrystalEdgeMask);
  }
  fragColor = vec4(color, alpha);
}
