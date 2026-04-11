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

/* Detail-only */
uniform float uTime;
uniform mat3  uRotation;
uniform vec3  uLightDir;
uniform float uLodDist;
uniform float uFadeIn;

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
  vec3 p = flowWarp(sp * 3.5, s, 0.25);
  vec4 hd = fbmd(p + vec3(s), uSlopeness);
  gDetailDerivs = hd.yzw;
  float height = hd.x * 0.5 + 0.5;
  float lat = abs(sp.y);
  float t = 0.02;

  /* Polar ice — shared by ocean and land paths */
  float polarNoise = fbm(sp * 4.0 + vec3(s * 1.7), 0.3) * 0.1;
  float coldness = 1.0 - smoothstep(0.35, 0.75, uTemperature);
  float iceLine = mix(0.97, 0.80, coldness);
  float polarIce = smoothstep(iceLine - 0.04, iceLine + 0.04, lat + polarNoise);
  vec3 iceColor = mix(vec3(0.78, 0.84, 0.90), vec3(0.92, 0.95, 0.98), polarNoise * 5.0 + 0.5);

  float oceanMask = 1.0 - smoothstep(uOceanLevel - t, uOceanLevel + t, height);
  gOceanMask = oceanMask;

  if (oceanMask > 0.01) {
    float depth = max(0.0, uOceanLevel - height);
    vec3 terrainDerivs = hd.yzw;
    vec3 oceanColor = oceanSurface(sp, s, depth, uWarpStrength);
    vec3 oceanDerivs = gDetailDerivs;

    if (polarIce > 0.01) {
      float iceGrain = gnoised(sp * 20.0 + vec3(s * 3.0)).x;
      vec3 ic = iceColor * (0.9 + iceGrain * 0.1);
      float iceOpacity = smoothstep(0.0, 0.3, polarIce);
      oceanColor = mix(oceanColor, ic, iceOpacity);
      gOceanMask *= 1.0 - iceOpacity;
      gDetailDerivs *= 1.0 - iceOpacity;
      gWaveHeight *= 1.0 - iceOpacity;
    }

    if (oceanMask > 0.99) return oceanColor;

    float ridge = ridgedFbm(sp * 5.0 + vec3(s * 0.7), 4.5, 2.1, 4);
    float terrain = ridgedFbm(sp * 8.0 + vec3(s * 1.3), 3.0, 2.3, 3);
    float elev = height - uOceanLevel;
    float terrainH = elev + ridge * 0.12 + terrain * 0.06;

    vec3 shoreColor = uBaseColor2 * vec3(1.3, 1.15, 0.8) + vec3(0.08, 0.06, 0.02);
    vec3 lowColor = uBaseColor2 * 1.1 + vec3(0.03);
    vec3 midColor = mix(uBaseColor2, uBaseColor3, 0.6) * 0.85;
    vec3 highColor = uBaseColor3 * 0.7 + vec3(0.05);

    vec3 landColor = shoreColor;
    landColor = mix(landColor, lowColor, smoothstep(0.02, 0.08, terrainH));
    landColor = mix(landColor, midColor, smoothstep(0.10, 0.18, terrainH));
    landColor = mix(landColor, highColor, smoothstep(0.22, 0.38, terrainH));
    landColor *= 0.70 + ridge * 0.30 + terrain * 0.15;

    float aridity = smoothstep(0.30, 0.65, uTemperature);
    if (aridity > 0.01) {
      vec3 sandColor = vec3(0.72, 0.60, 0.38);
      float equatorial = 1.0 - smoothstep(0.05, 0.50, lat);
      float sandNoise = fbm(sp * 5.0 + vec3(s * 0.9), 0.3) * 0.3 + 0.55;
      float dryHeight = 1.0 - smoothstep(0.0, 0.25, elev);
      landColor = mix(landColor, sandColor * (0.85 + terrain * 0.3), equatorial * aridity * sandNoise * dryHeight);
    }

    vec3 polar = mix(vec3(0.85, 0.9, 0.95), uBaseColor3, 0.3);
    float landPolar = smoothstep(0.55, 0.8, lat + polarNoise + height * 0.1) * coldness;
    landColor = mix(landColor, polar, landPolar);

    float slope = length(hd.yzw);
    landColor *= mix(1.0, 0.45, smoothstep(0.15, 1.2, slope * uSlopeness));

    gDetailDerivs = mix(terrainDerivs, oceanDerivs, oceanMask);
    return mix(landColor, oceanColor, oceanMask);
  }

  /* Pure land */
  float ridge = ridgedFbm(sp * 5.0 + vec3(s * 0.7), 4.5, 2.1, 4);
  float terrain = ridgedFbm(sp * 8.0 + vec3(s * 1.3), 3.0, 2.3, 3);
  float elev = height - uOceanLevel;
  float terrainH = elev + ridge * 0.12 + terrain * 0.06;

  vec3 shoreColor = uBaseColor2 * vec3(1.3, 1.15, 0.8) + vec3(0.08, 0.06, 0.02);
  vec3 lowColor = uBaseColor2 * 1.1 + vec3(0.03);
  vec3 midColor = mix(uBaseColor2, uBaseColor3, 0.6) * 0.85;
  vec3 highColor = uBaseColor3 * 0.7 + vec3(0.05);

  vec3 color = shoreColor;
  color = mix(color, lowColor, smoothstep(0.02, 0.08, terrainH));
  color = mix(color, midColor, smoothstep(0.10, 0.18, terrainH));
  color = mix(color, highColor, smoothstep(0.22, 0.38, terrainH));
  color *= 0.70 + ridge * 0.30 + terrain * 0.15;

  float aridity = smoothstep(0.30, 0.65, uTemperature);
  if (aridity > 0.01) {
    vec3 sandColor = vec3(0.72, 0.60, 0.38);
    float equatorial = 1.0 - smoothstep(0.05, 0.50, lat);
    float sandNoise = fbm(sp * 5.0 + vec3(s * 0.9), 0.3) * 0.3 + 0.55;
    float dryHeight = 1.0 - smoothstep(0.0, 0.25, elev);
    color = mix(color, sandColor * (0.85 + terrain * 0.3), equatorial * aridity * sandNoise * dryHeight);
  }

  vec3 polar = mix(vec3(0.85, 0.9, 0.95), uBaseColor3, 0.3);
  float landPolar = smoothstep(0.55, 0.8, lat + polarNoise + height * 0.1) * coldness;
  color = mix(color, polar, landPolar);

  float slope = length(hd.yzw);
  color *= mix(1.0, 0.45, smoothstep(0.15, 1.2, slope * uSlopeness));

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
  vec3 p = sp * uCrackScale;
  vec3 vor = voronoi3(p + vec3(s));
  float edge = smoothstep(0.0, 0.08, vor.y - vor.x);

  vec3 color = mix(uBaseColor1, uBaseColor2, vor.x * 0.4);
  color = mix(uSubsurfaceColor * 0.6, color, edge);

  float h = fbm(sp * 2.0 + vec3(s * 2.0), 0.3);
  color *= 0.82 + h * 0.35;

  return color;
}


vec3 renderVolcanic(vec3 sp, float s) {
  vec3 p = sp * uCrackScale;
  vec3 vor = voronoi3(p + vec3(s));
  float crackWidth = smoothstep(0.07, 0.0, vor.y - vor.x);

  vec4 hd = fbmd(sp * 4.0 + vec3(s * 1.3), uSlopeness);
  gDetailDerivs = hd.yzw;
  vec3 surface = uBaseColor1 * (0.2 + hd.x * 0.35);

  float slope = length(hd.yzw);
  surface *= mix(1.0, 0.45, smoothstep(0.2, 1.0, slope * uSlopeness));

  vec3 glowColor = uEmissiveColor * (1.5 + uEmissiveIntensity);
  vec3 color = mix(surface, glowColor, crackWidth);

  return color;
}


vec3 renderCrystalline(vec3 sp, float s) {
  vec3 p = sp * uCrackScale;
  vec3 vor = voronoi3(p + vec3(s));

  float cellHue = fract(vor.z * 0.1337);
  vec3 cellColor = mix(uBaseColor1, uBaseColor2, cellHue);
  cellColor = mix(cellColor, uBaseColor3, step(0.7, cellHue));

  float edge = smoothstep(0.0, 0.03, vor.y - vor.x);
  vec3 edgeColor = cellColor * 0.3;
  vec3 color = mix(edgeColor, cellColor, edge);

  float glint = pow(max(0.0, 1.0 - vor.x * 2.0), 4.0) * uSpecular;
  color += vec3(glint * 0.3);

  return color;
}


vec3 renderFungal(vec3 sp, float s) {
  vec3 warpedP = sp * uCrackScale;
  float wx = fbm(warpedP + vec3(s * 0.7), 0.3);
  float wz = fbm(warpedP + vec3(s * 1.3), 0.3);
  warpedP += vec3(wx, 0.0, wz) * uBulbosity;

  vec3 vor = voronoi3(warpedP + vec3(s));
  float edge = smoothstep(0.0, 0.06, vor.y - vor.x);

  float cellHue = fract(vor.z * 0.0731);
  vec3 color = mix(uBaseColor1, uBaseColor2, cellHue);
  color = mix(color, uBaseColor3, smoothstep(0.5, 0.8, cellHue));

  vec3 networkColor = uBaseColor1 * 0.2;
  color = mix(networkColor, color, edge);

  float glow = smoothstep(0.2, 0.0, vor.x) * uEmissiveIntensity;
  color += uEmissiveColor * glow;

  return color;
}

/* Clouds and lightning moved to the atmo shell mesh (planet-atmo.frag) */

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
  bool isVoronoi = (uPlanetMode == 4 || uPlanetMode == 5 || uPlanetMode == 6 || uPlanetMode == 7);
  if (lodMedium && !isVoronoi) {
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
  float bumpStrength = min(0.35, derivLen * 0.25) * (1.0 - lod);
  vec3 perturbedN = normalize(N - bumpStrength * (gDetailDerivs.x * T + gDetailDerivs.y * B));

  vec3 L = normalize(uLightDir);
  float NdotL = dot(perturbedN, L);
  float lighting = smoothstep(-0.4, 0.5, NdotL) * 0.65 + 0.35;

  /* Clouds are now on the atmo shell mesh (front face) */
  float specMask = 0.0;
  if (uPlanetMode == 0 || uPlanetMode == 3) specMask = uSpecular * gOceanMask;
  if (uPlanetMode == 4 || uPlanetMode == 6) specMask = uSpecular * 0.5;
  if (uPlanetMode == 0 || uPlanetMode == 3) specMask *= 0.7 + gWaveHeight * 0.6 * gOceanMask;
  vec3 H = normalize(L + V);
  float NdotH = max(0.0, dot(perturbedN, H));
  float spec = specMask * pow(NdotH, 32.0) * 0.6;

  color = color * lighting + vec3(spec);



  if (uPlanetMode == 5) {
    vec3 p = sp * uCrackScale;
    vec3 vor = voronoi3(p + vec3(s));
    float crackGlow = smoothstep(0.07, 0.0, vor.y - vor.x) * uEmissiveIntensity;
    color += uEmissiveColor * crackGlow * 0.5;
  }
  if (uPlanetMode == 7) {
    vec3 warpedP = sp * uCrackScale;
    float wx = fbm(warpedP + vec3(s * 0.7), 0.3);
    float wz = fbm(warpedP + vec3(s * 1.3), 0.3);
    warpedP += vec3(wx, 0.0, wz) * uBulbosity;
    vec3 vor = voronoi3(warpedP + vec3(s));
    float glow = smoothstep(0.2, 0.0, vor.x) * uEmissiveIntensity;
    color += uEmissiveColor * glow * 0.5;
  }

  fragColor = vec4(color, uFadeIn);
}
