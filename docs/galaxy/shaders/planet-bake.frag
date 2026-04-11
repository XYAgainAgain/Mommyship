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
uniform int   uCrystalMetric;

/* Rocky biome system */
uniform float uMoistureOffset;
uniform float uBiomeCount;

in vec2 vUv;
out vec4 fragColor;

/* @include noise-common */

/* Captured by each render function for the derivative pass */
vec3 gDerivatives = vec3(0.0);


/* Flow-field warp — adapted from colordodge's spherical coordinate displacement.
   Two noise values become polar angles that create a 3D offset vector,
   warping the base terrain into organic continent shapes. */
vec3 flowWarp(vec3 p, float s, float strength) {
  float n1 = fbm(p * 1.5 + vec3(s * 0.37, s * 1.13, s * 0.61), 0.3);
  float n2 = fbm(p * 1.5 + vec3(s * 1.83, s * 0.29, s * 1.47), 0.3);
  float alpha = n1 * 6.2832;
  float beta = n2 * 3.1416;
  vec3 offset = vec3(cos(alpha) * cos(beta), sin(beta), sin(alpha) * cos(beta));
  return p + offset * strength;
}


/* 6 Gerstner waves with seed-derived directions, frequencies, amplitudes.
   Big waves are slow broad swells; small waves are fast sharp chop.
   Returns vec4(height, tangent-plane derivative.xyz). */
vec4 gerstnerField(vec3 sp, float s, float roughness) {
  /* Domain warp bends wave fronts so they're not perfect great circles */
  vec3 warpOffset = gnoised(sp * 4.0 + vec3(s * 0.7)).yzw;
  vec3 warpedSp = normalize(sp + warpOffset * 0.07 * roughness);

  /* Slow noise modulates amplitude regionally — creates calm/rough patches */
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

    /* Per-wave phase noise breaks the lattice pattern from crossing waves */
    float phaseNoise = gnoised(sp * (6.0 + fi * 4.0) + vec3(s * (0.5 + fi * 0.2))).x * 5.5;
    float phase = fract(s * (0.773 + fi * 0.089)) * 6.2832 + phaseNoise;

    vec4 w = gerstnerWave(warpedSp, dir, freq, amp, steep, phase);
    totalH += w.x;
    totalD += w.yzw;
  }

  return vec4(totalH, totalD);
}

/* Shared ocean surface — used by both rocky (below waterline) and ocean subtypes.
   Gerstner waves provide both height and analytic derivatives directly. */
vec3 oceanSurface(vec3 sp, float s, float depth, float roughness) {
  vec4 gw = gerstnerField(sp, s, roughness);
  float waves = gw.x;
  gDerivatives = gw.yzw;

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


vec4 renderRocky(vec3 sp, float s) {
  float lat = abs(sp.y);

  /* Continent shapes — direct FBM, no flowWarp.
     Derivatives scaled so per-biome normals show through */
  vec4 hd = fbmd(sp * 3.5 + vec3(s), uSlopeness);
  gDerivatives = hd.yzw * 0.15;
  float height = hd.x * 0.5 + 0.5;
  float t = 0.02;

  /* Temperature axis */
  float noisePerturb = gnoised(sp * 4.0 + vec3(s * 1.7)).x;
  float temp = cos(lat * PI) * 0.5 + 0.5 + noisePerturb * 0.15 + uTemperature - 0.5;
  temp = clamp(temp, 0.0, 1.0);

  /* Moisture axis with Hadley cell approximation */
  float moistureFbm = fbm(sp * 2.5 + vec3(s * 3.1, s * 0.7, s * 1.9), 0.4) * 0.5 + 0.5;
  float hadleyD = abs(lat) - 0.4;
  float hadley = 1.0 - 0.4 * exp(-8.0 * hadleyD * hadleyD);
  float moisture = clamp(moistureFbm * hadley + uMoistureOffset, 0.0, 1.0);

  float elev = height;
  float biomeScale = 0.3 + uBiomeCount * 0.7;

  /* Biome weights — same system as detail shader */
  float iceW = smoothstep(0.18, 0.08, temp);
  float snowline = 0.82 + noisePerturb * 0.03;
  iceW = max(iceW, smoothstep(snowline, snowline + 0.03, elev));

  float tundraW = smoothstep(0.05, 0.18, temp) * smoothstep(0.35, 0.22, temp);
  float borealW = smoothstep(0.15, 0.30, temp) * smoothstep(0.45, 0.30, temp)
                * smoothstep(0.35, 0.55, moisture);
  float tempForestW = smoothstep(0.30, 0.45, temp) * smoothstep(0.65, 0.50, temp)
                    * smoothstep(0.40, 0.60, moisture) * biomeScale;
  float grassW = smoothstep(0.18, 0.35, temp) * smoothstep(0.80, 0.60, temp)
               * (1.0 - smoothstep(0.55, 0.75, moisture))
               * biomeScale;
  float sandDesertW = smoothstep(0.50, 0.65, temp) * smoothstep(0.35, 0.20, moisture)
                    * biomeScale;
  float rockyDesertW = smoothstep(0.45, 0.60, temp) * smoothstep(0.75, 0.60, temp)
                     * smoothstep(0.20, 0.35, moisture) * (1.0 - smoothstep(0.40, 0.55, moisture))
                     * biomeScale;
  float tropicalW = smoothstep(0.60, 0.80, temp) * smoothstep(0.50, 0.70, moisture)
                  * biomeScale;
  float alpineThresh = 0.72 + noisePerturb * 0.04;
  float mountainW = smoothstep(alpineThresh, alpineThresh + 0.06, elev) * biomeScale;

  /* Grassland acts as catch-all — prevents black gaps in unclaimed zones */
  grassW = max(grassW, 0.08 * biomeScale);

  float totalW = iceW + tundraW + borealW + tempForestW + grassW
               + sandDesertW + rockyDesertW + tropicalW + mountainW + 0.001;
  iceW /= totalW; tundraW /= totalW; borealW /= totalW;
  tempForestW /= totalW; grassW /= totalW; sandDesertW /= totalW;
  rockyDesertW /= totalW; tropicalW /= totalW; mountainW /= totalW;

  /* Matching detail shader biome colors — same techniques, fewer octaves */
  vec3 col1 = uBaseColor1, col2 = uBaseColor2, col3 = uBaseColor3;
  vec3 colGrey = vec3(dot(col3, vec3(0.3, 0.5, 0.2))) * 0.7 + vec3(0.15);
  vec3 colWarm = col3 * vec3(1.2, 1.0, 0.7) + vec3(0.08, 0.04, 0.0);
  vec3 biomeColor = vec3(0.0);

  if (iceW > 0.01) {
    float crack = ridgedFbm(sp * 8.0 + vec3(s * 2.3), 3.5, 2.1, 2);
    vec3 iceBase = mix(vec3(0.92, 0.94, 0.98), uSubsurfaceColor, 0.10);
    biomeColor += iceW * mix(iceBase, uSubsurfaceColor * 0.4 + vec3(0.15),
                             smoothstep(0.5, 0.8, crack));
  }
  if (tundraW > 0.01) {
    float splotch = smoothstep(0.15, 0.45, fbm(sp * 3.0 + vec3(s * 0.5), 0.3) * 0.5 + 0.5);
    biomeColor += tundraW * mix(colGrey * 0.8 + vec3(0.05, 0.03, 0.02),
                                mix(col2, colGrey, 0.6) * 0.5, splotch);
  }
  if (borealW > 0.01) {
    float trees = ridgedFbm(sp * 5.0 + vec3(s * 1.1), 2.5, 2.0, 2);
    float canopy = smoothstep(0.35, 0.65, trees);
    biomeColor += borealW * mix(mix(colGrey, col2, 0.25) * 0.6, col2 * 0.20, canopy);
  }
  if (tempForestW > 0.01) {
    vec3 warpP = sp * 8.0 + vec3(s * 1.7);
    vec3 warp = gnoised(warpP * 0.4 + vec3(s * 0.3)).yzw * 0.6;
    float tex = fbm(warpP + warp, 0.9) * 0.5 + 0.5;
    biomeColor += tempForestW * mix(col2 * 0.30 + col3 * 0.05, col2 * 0.65 + vec3(0.04), tex);
  }
  if (grassW > 0.01) {
    float roll = fbm(sp * 2.0 + vec3(s * 0.3), 0.2) * 0.5 + 0.5;
    biomeColor += grassW * mix(mix(colWarm, col2, 0.4) * 0.7,
                               colWarm * 1.1 + col2 * 0.3, roll);
  }
  if (sandDesertW > 0.01) {
    vec3 duneP = sp * vec3(3.0, 12.0, 3.0) + vec3(s * 0.9);
    float dunes = ridgedFbm(duneP, 3.0, 2.0, 2);
    biomeColor += sandDesertW * mix(colWarm * 0.65 + vec3(0.02),
                                    colWarm * 1.3 + vec3(0.12, 0.08, 0.0),
                                    smoothstep(0.25, 0.65, dunes));
  }
  if (rockyDesertW > 0.01) {
    float mesa = ridgedFbm(sp * 4.0 + vec3(s * 1.5), 3.5, 2.2, 3);
    mesa = pow(max(0.0, 1.0 - abs(mesa - 0.5) * 2.0), 5.0);
    biomeColor += rockyDesertW * mix(colGrey * 0.9 + colWarm * 0.2, colGrey * 0.4, mesa);
  }
  if (tropicalW > 0.01) {
    vec3 junP = sp * 7.0 + vec3(s * 2.1);
    vec3 junWarp = gnoised(junP * 0.3 + vec3(s * 0.8)).yzw * 0.8;
    float canopy = ridgedFbm(junP + junWarp, 3.0, 2.1, 2);
    biomeColor += tropicalW * mix(col2 * 0.15, col2 * 0.45 + col1 * 0.06,
                                  smoothstep(0.3, 0.7, canopy));
  }
  if (mountainW > 0.01) {
    float ridge = ridgedFbm(sp * 6.0 + vec3(s * 0.7), 4.5, 2.1, 3);
    biomeColor += mountainW * mix(colGrey * 0.55 + col3 * 0.08,
                                  vec3(0.55, 0.52, 0.48),
                                  smoothstep(0.3, 0.7, ridge));
  }

  vec3 color = biomeColor;

  /* Ocean */
  float oceanMask = 1.0 - smoothstep(uOceanLevel - t, uOceanLevel + t, height);
  if (oceanMask > 0.01) {
    float depth = max(0.0, uOceanLevel - height);
    vec3 terrainDerivs = hd.yzw;
    vec3 oceanColor = oceanSurface(sp, s, depth, uWarpStrength * 0.4);
    vec3 oceanDerivs = gDerivatives;

    /* Polar ice over ocean */
    float iceOpacity = smoothstep(0.3, 0.7, iceW);
    if (iceOpacity > 0.01) {
      float iceGrain = gnoised(sp * 20.0 + vec3(s * 3.0)).x;
      vec3 iceBase = mix(vec3(0.90, 0.93, 0.97), uSubsurfaceColor, 0.12);
      vec3 ic = iceBase * (0.9 + iceGrain * 0.1);
      oceanColor = mix(oceanColor, ic, iceOpacity);
    }

    if (oceanMask > 0.99) {
      float specAlpha = uSpecular * oceanMask * (1.0 - iceOpacity);
      return vec4(oceanColor, specAlpha);
    }

    gDerivatives = mix(terrainDerivs, oceanDerivs, oceanMask);
    float specAlpha = uSpecular * oceanMask * (1.0 - iceOpacity);
    return vec4(mix(color, oceanColor, oceanMask), specAlpha);
  }

  /* Land slope darkening */
  float slope = length(hd.yzw);
  color *= mix(1.0, 0.55, smoothstep(0.15, 1.2, slope * uSlopeness));

  return vec4(color, 0.0);
}


vec4 renderBarren(vec3 sp, float s) {
  vec3 cp = sp + vec3(s * 0.13, s * 0.37, s * 0.71);

  float height = craterFbm(cp);

  /* Finite-difference normals from crater height field */
  float eps = 0.013;
  float hx = craterFbm(cp + vec3(eps, 0.0, 0.0));
  float hy = craterFbm(cp + vec3(0.0, eps, 0.0));
  float hz = craterFbm(cp + vec3(0.0, 0.0, eps));
  gDerivatives = (vec3(hx, hy, hz) - height) / eps;

  /* Macro terrain variation so not every crater sits at the same base level */
  float macro = fbm(sp * 1.5 + vec3(s), 0.3) * 0.15;
  height = height * 0.85 + macro + 0.08;

  float brightness = mix(0.35, 1.0, height);
  vec3 color = uBaseColor1 * brightness;
  color = mix(color, uBaseColor2 * brightness, smoothstep(0.3, 0.7, height) * 0.35);

  float slope = length(gDerivatives);
  color *= mix(1.0, 0.5, smoothstep(1.0, 8.0, slope * uSlopeness));

  /* Surface microdetail — pitting darkens into pores, grain breaks up smoothness */
  float pitting = gnoised(sp * 30.0 + vec3(s * 2.3)).x;
  color *= 0.82 + pitting * 0.18;
  float grain = gnoised(sp * 80.0 + vec3(s * 4.1)).x;
  color *= 0.88 + grain * 0.12;

  return vec4(color, 0.0);
}


vec4 renderGas(vec3 sp, float s) {
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

  /* Storm count from seed — probability cascade: 70%×1, 40%×2, 20%×3, 5%×4+ */
  int stormCount = 0;
  if (uStormSize > 0.01) {
    stormCount = 1;
    float sc = fract(s * 0.557);
    if (sc < 0.40) stormCount = 2;
    if (sc < 0.20) stormCount = 3;
    if (sc < 0.05) stormCount = 3 + int(fract(s * 0.811) * 5.0) + 1;
  }

  /* Storms DEFLECT bands — they warp warpedLat before band calculation,
     so bands visibly flow around each vortex instead of being painted over */
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
    /* Noisy boundary — FBM perturbs the distance for turbulent edges */
    float dLon = lon - center.x;
    dLon -= round(dLon / 6.2832) * 6.2832;
    vec2 delta = vec2(dLon * cos(center.y), (lat - center.y) * 2.0);
    float r = length(delta);
    float rNoise = gnoised(sp * 12.0 + vec3(stormSeed * 0.3)).x * R * 0.3;
    float rNoisy = r + rNoise;

    float influence = 1.0 - smoothstep(R * 0.5, R * 1.3, rNoisy);
    if (influence < 0.01) continue;

    /* Swirl deflection — rotate the latitude around the storm center */
    float ring = smoothstep(0.0, R * 0.7, r) * (1.0 - smoothstep(R * 0.85, R * 1.2, r));
    float swirlAngle = atan(delta.y, delta.x) + ring * (4.5 - fi * 0.5);
    float deflection = sin(swirlAngle) * influence * R * 1.5;
    warpedLat += deflection;

    /* Track eye region for later coloring */
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

  /* Seed-derived band frequency multipliers */
  float f1 = 0.5 + fract(s * 0.137) * 0.5;
  float f2 = 1.1 + fract(s * 0.293) * 0.6;
  float f3 = 1.8 + fract(s * 0.419) * 0.8;
  float band1 = sin(warpedLat * uBandCount * f1 * PI) * 0.6;
  float band2 = sin(warpedLat * uBandCount * f2 * PI + 1.7) * 0.3;
  float band3 = sin(warpedLat * uBandCount * f3 * PI + 3.1) * 0.1;
  float bands = (band1 + band2 + band3) * 0.5 + 0.5;

  float turb = fbm(vec3(sp.x * 6.0, sp.y * 0.4, sp.z * 6.0) + vec3(s * 1.7), 0.3);
  bands += turb * (0.04 + edgeProximity * 0.12);

  vec3 color = mix(uBaseColor1, uBaseColor2, smoothstep(0.2, 0.5, bands));
  color = mix(color, uBaseColor3, smoothstep(0.55, 0.85, bands));

  /* Storm eye coloring — applied after bands so the eye is visible */
  if (stormEyeMask > 0.01)
    color = mix(color, uBaseColor3 * 1.3, stormEyeMask * 0.6);

  color = mix(color, uBaseColor2 * 0.85, edgeProximity * 0.08);

  float bandEdge = abs(cos(warpedLat * uBandCount * PI));
  color *= 0.82 + bandEdge * 0.18;

  gDerivatives = curlN.yzw;
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

  return vec4(color, 0.0);
}


vec4 renderOcean(vec3 sp, float s) {
  vec3 p = flowWarp(sp * 3.5, s, 0.25);
  vec4 hd = fbmd(p + vec3(s), uSlopeness);
  float height = hd.x * 0.5 + 0.5;
  float t = 0.02;

  float depth = max(0.0, uOceanLevel - height);
  float isOcean = 1.0 - smoothstep(uOceanLevel - t, uOceanLevel + t, height);

  vec3 color = oceanSurface(sp, s, depth, uWarpStrength);

  /* Rare island peaks */
  if (isOcean < 0.99) {
    vec3 landColor = uBaseColor2 * 1.2 + 0.1;
    vec3 highland = uBaseColor3;
    landColor = mix(landColor, highland, smoothstep(uOceanLevel + 0.05, uOceanLevel + 0.2, height));

    float slope = length(hd.yzw);
    landColor *= mix(1.0, 0.55, smoothstep(0.25, 1.5, slope * uSlopeness));

    color = mix(color, landColor, 1.0 - isOcean);
    gDerivatives = mix(gDerivatives, hd.yzw, 1.0 - isOcean);
  }

  float spec = isOcean * uSpecular * (1.0 - smoothstep(0.0, 0.7, abs(sp.y)) * 0.5);

  /* Polar ice caps — freeze ocean at high latitudes on cold worlds */
  float lat = abs(sp.y);
  float polarNoise = fbm(sp * 4.0 + vec3(s * 1.7), 0.3) * 0.1;
  /* coldness sets how far caps extend; ice is fully opaque within that extent */
  float coldness = 1.0 - smoothstep(0.35, 0.75, uTemperature);
  float iceLine = mix(0.97, 0.80, coldness);
  float polarIce = smoothstep(iceLine - 0.04, iceLine + 0.04, lat + polarNoise);

  if (polarIce > 0.01) {
    vec3 iceColor = mix(vec3(0.78, 0.84, 0.90), vec3(0.92, 0.95, 0.98), polarNoise * 5.0 + 0.5);
    float iceGrain = gnoised(sp * 20.0 + vec3(s * 3.0)).x;
    iceColor *= 0.9 + iceGrain * 0.1;
    float iceOpacity = smoothstep(0.0, 0.3, polarIce);
    color = mix(color, iceColor, iceOpacity);
    spec *= 1.0 - iceOpacity;
  }

  return vec4(color, spec);
}


vec4 renderIce(vec3 sp, float s) {
  vec3 off = vec3(s * 0.13, s * 0.37, s * 0.71);

  /* Multi-scale ridged cracks — Europa-style linear lineae */
  float bigCracks   = ridgedFbm(sp * 1.5 + off, uCrackScale * 0.4, 2.1, 3);
  float medCracks   = ridgedFbm(sp * 3.5 + off * 1.7, uCrackScale * 0.8, 2.3, 4);
  float fineCracks  = ridgedFbm(sp * 8.0 + off * 2.3, uCrackScale * 1.2, 2.0, 3);

  /* Noise-modulated crack threshold so widths vary across the surface */
  /* ridgedFbm peaks near 1.0 at ridge crests — high thresholds isolate thin crack lines */
  float threshVar = fbm(sp * 2.0 + vec3(s), 0.3) * 0.08;
  float cracks = smoothstep(0.55 + threshVar, 0.80, bigCracks) * 0.6
               + smoothstep(0.60, 0.82, medCracks) * 0.3
               + smoothstep(0.65, 0.85, fineCracks) * 0.15;
  cracks = clamp(cracks, 0.0, 1.0);

  /* Terrain height — mostly gentle with occasional ridged highlands */
  float height = ridgedFbm(sp * 2.5 + off * 0.5, 3.0, 2.2, 4) * 0.35
               + fbm(sp * 1.5 + vec3(s * 2.0), 0.3) * 0.65;

  /* Finite-diff normals for lighting response */
  float eps = 0.015;
  float hx = ridgedFbm((sp + vec3(eps, 0.0, 0.0)) * 2.5 + off * 0.5, 3.0, 2.2, 4) * 0.35
           + fbm((sp + vec3(eps, 0.0, 0.0)) * 1.5 + vec3(s * 2.0), 0.3) * 0.65;
  float hy = ridgedFbm((sp + vec3(0.0, eps, 0.0)) * 2.5 + off * 0.5, 3.0, 2.2, 4) * 0.35
           + fbm((sp + vec3(0.0, eps, 0.0)) * 1.5 + vec3(s * 2.0), 0.3) * 0.65;
  float hz = ridgedFbm((sp + vec3(0.0, 0.0, eps)) * 2.5 + off * 0.5, 3.0, 2.2, 4) * 0.35
           + fbm((sp + vec3(0.0, 0.0, eps)) * 1.5 + vec3(s * 2.0), 0.3) * 0.65;
  gDerivatives = (vec3(hx, hy, hz) - height) / eps;

  /* High-albedo surface with subtle plate-to-plate hue variation */
  float plateVar = fbm(sp * 3.0 + vec3(s * 3.7), 0.3);
  vec3 color = mix(uBaseColor1, uBaseColor2, plateVar * 0.35 + 0.3);
  color = mix(color, uBaseColor3, smoothstep(0.4, 0.7, height) * 0.25);

  color *= 0.85 + clamp(height, 0.0, 1.0) * 0.25;

  /* Slope darkening on ridged terrain */
  float slope = length(gDerivatives);
  color *= mix(1.0, 0.75, smoothstep(0.15, 1.0, slope * uSlopeness));

  vec3 crackColor = uSubsurfaceColor * 0.7;
  color = mix(color, crackColor, cracks);

  /* Specular: high on flat ice plates, killed in cracks */
  float spec = uSpecular * (1.0 - cracks * 0.8);
  return vec4(color, spec);
}


vec4 renderVolcanic(vec3 sp, float s) {
  vec3 off = vec3(s * 0.17, s * 0.41, s * 0.63);

  /* Multi-scale ridged cracks — lava fissures at 3 frequencies */
  float bigFissures  = ridgedFbm(sp * 1.8 + off, uCrackScale * 0.5, 2.1, 3);
  float medFissures  = ridgedFbm(sp * 4.0 + off * 1.5, uCrackScale * 0.9, 2.3, 4);
  float fineFissures = ridgedFbm(sp * 9.0 + off * 2.1, uCrackScale * 1.3, 2.0, 3);

  /* Rocky terrain height — more ridged than ice, rougher surface */
  float height = ridgedFbm(sp * 2.5 + off * 0.5, 3.5, 2.2, 4) * 0.55
               + fbm(sp * 1.5 + vec3(s * 2.0), 0.3) * 0.45;

  /* Height-boosted cracks — peaks become active calderas */
  float caldera = smoothstep(0.5, 0.8, height) * 0.25;
  float threshVar = fbm(sp * 2.0 + vec3(s * 0.7), 0.3) * 0.06;
  float cracks = smoothstep(0.62 + threshVar, 0.85, bigFissures) * 0.55
               + smoothstep(0.65, 0.87, medFissures) * 0.30
               + smoothstep(0.70, 0.88, fineFissures) * 0.15
               + caldera;
  cracks = clamp(cracks, 0.0, 1.0);

  /* Crater overlay — sparse impacts on the rock */
  float craters = craterFbm(sp * 1.2 + off * 0.3);
  float craterBlend = uCraterDensity * 0.3;
  height = mix(height, craters, craterBlend);

  /* Finite-diff normals */
  float eps = 0.015;
  float hx = ridgedFbm((sp + vec3(eps, 0.0, 0.0)) * 2.5 + off * 0.5, 3.5, 2.2, 4) * 0.55
           + fbm((sp + vec3(eps, 0.0, 0.0)) * 1.5 + vec3(s * 2.0), 0.3) * 0.45;
  hx = mix(hx, craterFbm((sp + vec3(eps, 0.0, 0.0)) * 1.2 + off * 0.3), craterBlend);
  float hy = ridgedFbm((sp + vec3(0.0, eps, 0.0)) * 2.5 + off * 0.5, 3.5, 2.2, 4) * 0.55
           + fbm((sp + vec3(0.0, eps, 0.0)) * 1.5 + vec3(s * 2.0), 0.3) * 0.45;
  hy = mix(hy, craterFbm((sp + vec3(0.0, eps, 0.0)) * 1.2 + off * 0.3), craterBlend);
  float hz = ridgedFbm((sp + vec3(0.0, 0.0, eps)) * 2.5 + off * 0.5, 3.5, 2.2, 4) * 0.55
           + fbm((sp + vec3(0.0, 0.0, eps)) * 1.5 + vec3(s * 2.0), 0.3) * 0.45;
  hz = mix(hz, craterFbm((sp + vec3(0.0, 0.0, eps)) * 1.2 + off * 0.3), craterBlend);
  gDerivatives = (vec3(hx, hy, hz) - height) / eps;

  float plateVar = fbm(sp * 3.0 + vec3(s * 2.9), 0.3);
  vec3 rock = mix(uBaseColor1, uBaseColor2, plateVar * 0.3 + 0.35);
  rock = mix(rock, uBaseColor3, smoothstep(0.5, 0.8, height) * 0.2);
  /* Hot volcanic = very dark rock, cryo = bright icy surface */
  float darkening = uTemperature > 0.5 ? 0.25 : 0.85;
  float heightRange = uTemperature > 0.5 ? 0.35 : 0.15;
  rock *= darkening + clamp(height, 0.0, 1.0) * heightRange;

  float slope = length(gDerivatives);
  float slopeDark = uTemperature > 0.5 ? 0.5 : 0.82;
  rock *= mix(1.0, slopeDark, smoothstep(0.15, 1.0, slope * uSlopeness));

  float pitting = gnoised(sp * 25.0 + vec3(s * 2.3)).x;
  float pitAmt = uTemperature > 0.5 ? 0.15 : 0.06;
  rock *= (1.0 - pitAmt) + pitting * pitAmt;

  /* Emissive lava — multi-tone: core, mid, edge + noise streaks for variety */
  float hotEdge = smoothstep(0.0, 0.6, cracks);
  vec3 edgeTint = uTemperature > 0.5 ? vec3(1.0, 0.85, 0.3) : vec3(0.6, 0.9, 1.0);
  vec3 midTint  = uTemperature > 0.5 ? vec3(1.0, 0.55, 0.1) : vec3(0.3, 0.7, 0.95);
  vec3 lavaCore = uEmissiveColor * (1.2 + uEmissiveIntensity);
  vec3 lavaMid  = mix(uEmissiveColor, midTint, 0.4) * (0.9 + uEmissiveIntensity);
  vec3 lavaEdge = mix(uEmissiveColor, edgeTint, 0.5) * uEmissiveIntensity;
  /* Noise-driven streaks break up the uniform glow */
  float streaks = fbm(sp * 6.0 + vec3(s * 1.7), 0.4);
  vec3 lavaColor = mix(lavaEdge, lavaMid, smoothstep(0.2, 0.5, hotEdge));
  lavaColor = mix(lavaColor, lavaCore, smoothstep(0.5, 0.9, hotEdge));
  lavaColor += edgeTint * streaks * 0.15 * cracks;
  vec3 color = mix(rock, lavaColor, cracks);

  float emAlpha = cracks * uEmissiveIntensity;
  return vec4(color, emAlpha);
}


vec4 renderCrystalline(vec3 sp, float s) {
  vec3 p = sp * uCrackScale + vec3(s);

  vec4 cr = crystals3D(p, 0.85, uCrystalMetric, s);
  float crystalVal = cr.x;
  float f1 = cr.y;
  float cellId = cr.z;
  float edgeDist = cr.w;

  vec4 cr2 = crystals3D(p * 2.3 + vec3(s * 0.7), 0.85, uCrystalMetric, s + 11.0);

  float cellHue = fract(sin(cellId * 127.1) * 43758.5453);
  vec3 cellColor = mix(uBaseColor1, uBaseColor2, smoothstep(0.28, 0.38, cellHue));
  cellColor = mix(cellColor, uBaseColor3, smoothstep(0.62, 0.72, cellHue));
  float cellBright = fract(sin(cellId * 43.7) * 12345.6789);
  cellColor *= 0.82 + cellBright * 0.36;

  /* Growth banding from dual-layer crystal value — angular contours */
  float bandPattern = fract(crystalVal * 6.0 + cr2.x * 3.0 + fbm(sp * 3.0 + vec3(s), 0.2) * 0.15);
  float band = smoothstep(0.0, 0.3, bandPattern) * smoothstep(1.0, 0.5, bandPattern);
  float bandBright = mix(0.85, 1.15, band);
  float radialGrad = smoothstep(0.0, 0.5, crystalVal);
  float coreDark = mix(bandBright, bandBright * 0.78, radialGrad * step(uBulbosity, 0.5));
  float coreLight = mix(bandBright * 0.78, bandBright, radialGrad * step(0.5, uBulbosity));
  cellColor *= mix(coreDark, coreLight, step(0.5, uBulbosity));

  float primaryEdge = smoothstep(0.0, 0.04, edgeDist);
  float secondaryEdge = smoothstep(0.0, 0.06, cr2.w);
  float combinedEdge = primaryEdge * mix(1.0, secondaryEdge, 0.4);

  vec3 edgeColor = mix(cellColor * 0.35, uSubsurfaceColor * 0.4, 0.5);
  vec3 color = mix(edgeColor, cellColor, combinedEdge);
  float interior = crystalVal * 0.5 + cr2.x * 0.3;
  color *= 0.92 + interior * 0.2;

  /* Alpha encodes edge glow intensity for atlas specular hint */
  float edgeGlow = (1.0 - combinedEdge) * uEmissiveIntensity;
  return vec4(color, uSpecular * combinedEdge + edgeGlow * 0.3);
}


vec4 renderFungal(vec3 sp, float s) {
  /* Dual flow-warped terrain — matches detail shader approach */
  vec3 wp1 = flowWarp(sp * 2.5, s, uWarpStrength);
  vec3 wp2 = flowWarp(sp * 1.8, s + 7.31, uWarpStrength * 0.7);

  vec4 hd1 = fbmd(wp1 + vec3(s * 0.31), uSlopeness);
  gDerivatives = hd1.yzw;
  float terrain1 = clamp((hd1.x * 0.5 + 0.5 - 0.5) * 2.0 + 0.5, 0.0, 1.0);
  float terrain2 = fbm(wp2 + vec3(s * 1.73), 0.3) * 0.5 + 0.5;
  float height = terrain1 * 0.65 + terrain2 * 0.35;

  /* Dual-noise color mapping — 4th color synthesized from complement */
  vec3 color4 = (uBaseColor1 + uBaseColor3) * 0.5;
  color4 = vec3(1.0) - color4;
  color4 = mix(color4, uBaseColor2, 0.3);

  vec3 color = mix(uBaseColor1, uBaseColor2, smoothstep(0.15, 0.50, terrain1));
  color = mix(color, uBaseColor3, smoothstep(0.45, 0.80, terrain2));
  float crossNoise = terrain1 * 0.6 + terrain2 * 0.4;
  color = mix(color, color4, smoothstep(0.55, 0.85, crossNoise) * 0.45);
  color *= 0.75 + height * 0.35;

  /* Water pools in terrain lows */
  float poolMask = smoothstep(0.0, 0.12, max(0.0, 0.45 - height));
  if (poolMask > 0.01) {
    vec3 poolColor = uSubsurfaceColor * 0.6 + uBaseColor1 * 0.2;
    color = mix(color, poolColor, poolMask * 0.7);
  }

  /* Static mycelium network (no uTime in bake) */
  vec3 veinOff = vec3(s * 0.17, s * 0.41, s * 0.63);
  float veinWarpN1 = fbm(sp * uCrackScale * 0.7 + vec3(s * 0.9), 0.3);
  float veinWarpN2 = fbm(sp * uCrackScale * 0.7 + vec3(s * 1.6), 0.3);
  vec3 veinWarped = sp * uCrackScale + vec3(veinWarpN1, 0.0, veinWarpN2) * 0.4;

  float primaryVeins = ridgedFbm(veinWarped + veinOff, 2.5, 2.1, 3);
  float secondaryVeins = ridgedFbm(sp * uCrackScale * 2.3 + veinOff * 1.7, 1.8, 2.3, 4);

  float threshVar = fbm(sp * 1.5 + vec3(s), 0.3) * 0.06;
  float veins = smoothstep(0.75 + threshVar, 0.92, primaryVeins) * 0.6
              + smoothstep(0.78, 0.93, secondaryVeins) * 0.3;
  veins = clamp(veins, 0.0, 1.0);

  color = mix(color, uSubsurfaceColor * 0.15, veins * 0.5);

  float slope = length(gDerivatives);
  color *= mix(1.0, 0.6, smoothstep(0.15, 1.0, slope * uSlopeness));

  /* Alpha encodes vein emissive for atlas */
  return vec4(color, veins * uEmissiveIntensity);
}


void main() {
  vec3 sp = uvToSphere(vUv);
  float s = fract(uSeed * 0.00000013) * 100.0;

  /* Reset derivatives — voronoi-based subtypes leave this at zero */
  gDerivatives = vec3(0.0);

  vec4 result;
  if (uPlanetMode == 0)      result = renderRocky(sp, s);
  else if (uPlanetMode == 1) result = renderBarren(sp, s);
  else if (uPlanetMode == 2) result = renderGas(sp, s);
  else if (uPlanetMode == 3) result = renderOcean(sp, s);
  else if (uPlanetMode == 4) result = renderIce(sp, s);
  else if (uPlanetMode == 5) result = renderVolcanic(sp, s);
  else if (uPlanetMode == 6) result = renderCrystalline(sp, s);
  else if (uPlanetMode == 7) result = renderFungal(sp, s);
  else                       result = vec4(vec3(0.5), 0.0);

  /* Bake atmosphere rim hint at UV edges (equirectangular pole = sphere limb) */
  float sinPhi = sin(vUv.y * PI);
  float rimDist = max(0.0, 1.0 - sinPhi * 1.5);
  float rim = pow(rimDist, 3.0) * uAtmoIntensity * 0.4;
  result.rgb += uAtmoTint * rim;

  fragColor = result;
}
