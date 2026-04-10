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
  vec3 p = flowWarp(sp * 3.5, s, 0.25);

  vec4 hd = fbmd(p + vec3(s), uSlopeness);
  gDerivatives = hd.yzw;
  float height = hd.x * 0.5 + 0.5;
  float lat = abs(sp.y);
  float t = 0.02;

  float oceanMask = 1.0 - smoothstep(uOceanLevel - t, uOceanLevel + t, height);
  if (oceanMask > 0.01) {
    float depth = max(0.0, uOceanLevel - height);
    vec3 terrainDerivs = hd.yzw;
    vec3 oceanColor = oceanSurface(sp, s, depth, uWarpStrength);
    vec3 oceanDerivs = gDerivatives;

    if (oceanMask > 0.99) {
      float specAlpha = uSpecular * oceanMask;
      return vec4(oceanColor, specAlpha);
    }

    /* Shore transition — blend color and derivatives */
    vec3 lowland = uBaseColor2;
    vec3 highland = uBaseColor3;
    vec3 polar = mix(vec3(0.85, 0.9, 0.95), uBaseColor3, 0.3);

    vec3 landColor = lowland;
    landColor = mix(landColor, highland, smoothstep(0.6, 0.75, height));

    float polarNoise = fbm(sp * 3.0 + vec3(s * 2.0), 0.3) * 0.12;
    float polarFactor = smoothstep(0.55, 0.8, lat + polarNoise + height * 0.1);
    polarFactor *= smoothstep(0.7, 0.3, uTemperature);
    landColor = mix(landColor, polar, polarFactor);

    float slope = length(hd.yzw);
    landColor *= mix(1.0, 0.55, smoothstep(0.25, 1.5, slope * uSlopeness));

    vec3 color = mix(landColor, oceanColor, oceanMask);
    gDerivatives = mix(terrainDerivs, oceanDerivs, oceanMask);
    float specAlpha = uSpecular * oceanMask;
    return vec4(color, specAlpha);
  }

  /* Pure land path — no ocean visible */
  vec3 lowland = uBaseColor2;
  vec3 highland = uBaseColor3;
  vec3 polar = mix(vec3(0.85, 0.9, 0.95), uBaseColor3, 0.3);

  vec3 color = mix(uBaseColor1, uBaseColor2, 0.5);
  color = mix(color, lowland,  smoothstep(uOceanLevel + 0.02, uOceanLevel + 0.12, height));
  color = mix(color, highland, smoothstep(0.6, 0.75, height));

  float polarNoise = fbm(sp * 3.0 + vec3(s * 2.0), 0.3) * 0.12;
  float polarFactor = smoothstep(0.55, 0.8, lat + polarNoise + height * 0.1);
  polarFactor *= smoothstep(0.7, 0.3, uTemperature);
  color = mix(color, polar, polarFactor);

  float slope = length(hd.yzw);
  color *= mix(1.0, 0.55, smoothstep(0.25, 1.5, slope * uSlopeness));

  return vec4(color, 0.0);
}


vec4 renderBarren(vec3 sp, float s) {
  vec3 p = sp * 3.5;
  vec4 hd = fbmd(p + vec3(s), uSlopeness);
  gDerivatives = hd.yzw;
  float height = hd.x * 0.5 + 0.5;

  /* Crater overlay — ridged noise creates raised rims with depressed bowls */
  vec4 craterNoise = gnoised(sp * 12.0 + vec3(s * 1.7));
  float ridge = 1.0 - abs(craterNoise.x);
  ridge *= ridge;
  /* Second crater scale for variety */
  float ridge2 = 1.0 - abs(gnoised(sp * 6.0 + vec3(s * 3.1)).x);
  ridge2 *= ridge2;
  float craters = mix(ridge, ridge2, 0.4) * uCraterDensity;
  height = mix(height, height * (1.0 - craters * 0.35), uCraterDensity);

  /* Monochrome palette — single base color, height-modulated */
  float brightness = mix(0.4, 1.0, height);
  vec3 color = uBaseColor1 * brightness;

  /* Slight color variation from secondary tint */
  color = mix(color, uBaseColor2 * brightness, smoothstep(0.4, 0.7, height) * 0.3);

  /* Slopeness darkening */
  float slope = length(hd.yzw);
  color *= mix(1.0, 0.55, smoothstep(0.2, 1.2, slope * uSlopeness));

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
  /* Same terrain system as rocky but with high ocean level — most surface is water */
  vec3 p = flowWarp(sp * 3.5, s, 0.25);
  vec4 hd = fbmd(p + vec3(s), uSlopeness);
  float height = hd.x * 0.5 + 0.5;
  float t = 0.02;

  float depth = max(0.0, uOceanLevel - height);
  float isOcean = 1.0 - smoothstep(uOceanLevel - t, uOceanLevel + t, height);

  vec3 color = oceanSurface(sp, s, depth, uWarpStrength);

  /* Rare island peaks — emerge from the ocean like rocky terrain */
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

  return vec4(color, spec);
}


vec4 renderIce(vec3 sp, float s) {
  vec3 p = sp * uCrackScale;
  vec3 vor = voronoi3(p + vec3(s));

  /* Edge distance — thin at cell boundaries = cracks */
  float edge = smoothstep(0.0, 0.08, vor.y - vor.x);

  /* High-albedo base with slight variation */
  vec3 color = mix(uBaseColor1, uBaseColor2, vor.x * 0.4);

  /* Subsurface blue in cracks */
  color = mix(uSubsurfaceColor * 0.6, color, edge);

  /* Subtle height variation */
  float h = fbm(sp * 2.0 + vec3(s * 2.0), 0.3);
  color *= 0.82 + h * 0.35;

  return vec4(color, uSpecular * edge);
}


vec4 renderVolcanic(vec3 sp, float s) {
  vec3 p = sp * uCrackScale;
  vec3 vor = voronoi3(p + vec3(s));
  float crackWidth = smoothstep(0.07, 0.0, vor.y - vor.x);

  /* Dark rocky surface */
  vec4 hd = fbmd(sp * 4.0 + vec3(s * 1.3), uSlopeness);
  gDerivatives = hd.yzw;
  vec3 surface = uBaseColor1 * (0.2 + hd.x * 0.35);

  /* Slopeness on surface */
  float slope = length(hd.yzw);
  surface *= mix(1.0, 0.45, smoothstep(0.2, 1.0, slope * uSlopeness));

  /* Emissive glow in cracks — temperature drives magma vs cryo palette */
  vec3 glowColor = uEmissiveColor * (1.5 + uEmissiveIntensity);
  vec3 color = mix(surface, glowColor, crackWidth);

  /* Encode emissive strength in alpha for the emissive pass */
  float emAlpha = crackWidth * uEmissiveIntensity;

  return vec4(color, emAlpha);
}


vec4 renderCrystalline(vec3 sp, float s) {
  vec3 p = sp * uCrackScale;
  vec3 vor = voronoi3(p + vec3(s));

  /* Faceted look — each cell gets a distinct color based on cell ID */
  float cellHue = fract(vor.z * 0.1337);
  vec3 cellColor = mix(uBaseColor1, uBaseColor2, cellHue);
  cellColor = mix(cellColor, uBaseColor3, step(0.7, cellHue));

  /* Sharp edges between facets */
  float edge = smoothstep(0.0, 0.03, vor.y - vor.x);
  vec3 edgeColor = cellColor * 0.3;
  vec3 color = mix(edgeColor, cellColor, edge);

  /* Glassy specular highlight baked as brightness variation */
  float glint = pow(max(0.0, 1.0 - vor.x * 2.0), 4.0) * uSpecular;
  color += vec3(glint * 0.3);

  return vec4(color, uSpecular * edge);
}


vec4 renderFungal(vec3 sp, float s) {
  /* Domain-warped Voronoi for organic bulbous shapes */
  vec3 warpedP = sp * uCrackScale;
  float wx = fbm(warpedP + vec3(s * 0.7), 0.3);
  float wz = fbm(warpedP + vec3(s * 1.3), 0.3);
  warpedP += vec3(wx, 0.0, wz) * uBulbosity;

  vec3 vor = voronoi3(warpedP + vec3(s));

  /* Bulbous cell interiors — bright centers, dark edges */
  float bulge = smoothstep(0.3, 0.0, vor.x) * uBulbosity;
  float edge = smoothstep(0.0, 0.06, vor.y - vor.x);

  /* Alien palette — cell ID drives color variation */
  float cellHue = fract(vor.z * 0.0731);
  vec3 color = mix(uBaseColor1, uBaseColor2, cellHue);
  color = mix(color, uBaseColor3, smoothstep(0.5, 0.8, cellHue));

  /* Mycelium network in the edges */
  vec3 networkColor = uBaseColor1 * 0.2;
  color = mix(networkColor, color, edge);

  /* Bioluminescent highlights at cell centers */
  float glow = smoothstep(0.2, 0.0, vor.x) * uEmissiveIntensity;
  color += uEmissiveColor * glow;

  return vec4(color, glow);
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
