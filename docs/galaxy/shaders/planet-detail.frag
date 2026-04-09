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

  float oceanMask = 1.0 - smoothstep(uOceanLevel - t, uOceanLevel + t, height);
  gOceanMask = oceanMask;

  if (oceanMask > 0.01) {
    float depth = max(0.0, uOceanLevel - height);
    vec3 terrainDerivs = hd.yzw;
    vec3 oceanColor = oceanSurface(sp, s, depth, uWarpStrength);
    vec3 oceanDerivs = gDetailDerivs;
    if (oceanMask > 0.99) return oceanColor;

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

    gDetailDerivs = mix(terrainDerivs, oceanDerivs, oceanMask);
    return mix(landColor, oceanColor, oceanMask);
  }

  /* Pure land */
  vec3 color = mix(uBaseColor1, uBaseColor2, 0.5);
  color = mix(color, uBaseColor2, smoothstep(uOceanLevel + 0.02, uOceanLevel + 0.12, height));
  color = mix(color, uBaseColor3, smoothstep(0.6, 0.75, height));

  float polarNoise = fbm(sp * 3.0 + vec3(s * 2.0), 0.3) * 0.12;
  float polarFactor = smoothstep(0.55, 0.8, lat + polarNoise + height * 0.1);
  polarFactor *= smoothstep(0.7, 0.3, uTemperature);
  vec3 polar = mix(vec3(0.85, 0.9, 0.95), uBaseColor3, 0.3);
  color = mix(color, polar, polarFactor);

  float slope = length(hd.yzw);
  color *= mix(1.0, 0.55, smoothstep(0.25, 1.5, slope * uSlopeness));

  return color;
}


vec3 renderBarren(vec3 sp, float s) {
  vec3 p = sp * 3.5;
  vec4 hd = fbmd(p + vec3(s), uSlopeness);
  gDetailDerivs = hd.yzw;
  float height = hd.x * 0.5 + 0.5;

  vec4 craterNoise = gnoised(sp * 12.0 + vec3(s * 1.7));
  float ridge = 1.0 - abs(craterNoise.x);
  ridge *= ridge;
  float ridge2 = 1.0 - abs(gnoised(sp * 6.0 + vec3(s * 3.1)).x);
  ridge2 *= ridge2;
  float craters = mix(ridge, ridge2, 0.4) * uCraterDensity;
  height = mix(height, height * (1.0 - craters * 0.35), uCraterDensity);

  float brightness = mix(0.4, 1.0, height);
  vec3 color = uBaseColor1 * brightness;
  color = mix(color, uBaseColor2 * brightness, smoothstep(0.4, 0.7, height) * 0.3);

  float slope = length(hd.yzw);
  color *= mix(1.0, 0.55, smoothstep(0.2, 1.2, slope * uSlopeness));

  return color;
}


vec3 renderGas(vec3 sp, float s) {
  float lat = sp.y;

  vec3 lonP = vec3(sp.x * 3.0, sp.y * 0.5, sp.z * 3.0);
  float wobble1 = fbm(lonP + vec3(s, 0.0, s * 0.7), 0.4);
  float wobble2 = fbm(lonP * 1.7 + vec3(s * 1.3, 0.0, s * 0.3), 0.3);
  float warpedLat = lat
    + (wobble1 * 2.0 - 1.0) * uWarpStrength * 0.6
    + (wobble2 * 2.0 - 1.0) * uWarpStrength * 0.25;

  float band1 = sin(warpedLat * uBandCount * 0.7 * PI) * 0.6;
  float band2 = sin(warpedLat * uBandCount * 1.3 * PI + 1.7) * 0.3;
  float band3 = sin(warpedLat * uBandCount * 2.1 * PI + 3.1) * 0.1;
  float bands = (band1 + band2 + band3) * 0.5 + 0.5;

  float turb = fbm(sp * 8.0 + vec3(s * 1.7), 0.3);
  bands += turb * 0.08;

  vec3 color = mix(uBaseColor1, uBaseColor2, smoothstep(0.2, 0.5, bands));
  color = mix(color, uBaseColor3, smoothstep(0.55, 0.85, bands));

  float bandEdge = abs(cos(warpedLat * uBandCount * PI));
  color *= 0.82 + bandEdge * 0.18;

  vec4 slopeN = gnoised(lonP + vec3(s, 0.0, s * 0.7));
  gDetailDerivs = slopeN.yzw;
  float slope = length(slopeN.yzw);
  color *= mix(1.0, 0.7, smoothstep(0.3, 1.2, slope * uWarpStrength));

  if (uStormSize > 0.01) {
    vec2 stormCenter = vec2(fract(s * 0.073) * 3.0 - 1.5, 0.15 + fract(s * 0.031) * 0.3);
    float stormDist = length(vec2(
      atan(sp.z, sp.x) / PI - stormCenter.x,
      (lat - stormCenter.y) * 3.0
    ));
    float storm = smoothstep(uStormSize * 0.15, 0.0, stormDist);
    float swirl = fbm(sp * 6.0 + vec3(s * 3.0), 0.4);
    color = mix(color, uBaseColor3 * 1.2, storm * (0.5 + swirl * 0.5));
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

/* Domain-warped 3D FBM cloud coverage.
   Warp strength scales with uStorminess — violent storms = swirly distorted shapes. */
float cloudLayer(vec3 sp, float s, float cover) {
  if (cover < 0.01) return 0.0;

  /* Stormy planets roil faster — 1× base up to 3× at max storminess */
  float t = uTime * (0.04 + uStorminess * 0.08);
  vec3 p = sp * 2.8 + vec3(s * 0.41, s * 0.17, s * 0.73);

  float warpAmt = 0.15 + uStorminess * 0.9;
  float wx = fbm(p * 0.7 + vec3(t * 0.6, 0.0, t * 0.3), 0.3);
  float wy = fbm(p * 0.7 + vec3(0.0, t * 0.5, t * -0.4), 0.3);
  float wz = fbm(p * 0.7 + vec3(t * -0.2, t * 0.4, 0.0), 0.3);
  vec3 warpedP = p + vec3(wx, wy, wz) * warpAmt + vec3(t * 0.5, 0.0, t * 0.3);

  /* Base shape + two high-freq detail octaves for crisp, textured edges */
  float cloud = fbm(warpedP, 0.2) * 0.5 + 0.5;
  cloud += fbm(warpedP * 2.3 + vec3(s * 1.1), 0.2) * 0.2;
  cloud += gnoised(warpedP * 5.0 + vec3(s * 2.7)).x * 0.15;
  cloud += gnoised(warpedP * 11.0 + vec3(s * 4.3)).x * 0.07;

  float smoothEdge = 0.12 + uStorminess * 0.08;
  cloud = smoothstep(1.0 - cover, 1.0 - cover + smoothEdge, cloud);
  return clamp(cloud, 0.0, 0.9);
}

/* Per-flash color derived from seed — warm↔cool spectrum tinted by atmosphere.
   Osminok's teal atmo tint pulls flashes toward cyan/yellow range naturally. */
vec3 flashTint(float h) {
  vec3 warm = vec3(0.99, 0.93, 0.38);
  vec3 cool = vec3(0.60, 0.97, 0.96);
  vec3 base = mix(cool, warm, h);
  return mix(base, uAtmoTint * 2.5, 0.2);
}

/* Lightning — time-quantized emissive patches through the cloud layer.
   4 independent cells with staggered periods so flashes overlap naturally. */
float lightningFlash(vec3 sp, float s, float storminess, out vec3 flashColor) {
  flashColor = vec3(0.0);
  if (storminess < 0.05) return 0.0;

  float flashOut = 0.0;
  vec3 colorAccum = vec3(0.0);

  /* Higher storminess → faster flash rate (3–8 steps/sec) */
  float stepsPerSec = 3.0 + storminess * 5.0;

  for (int k = 0; k < 4; k++) {
    float fk = float(k);
    float period = 1.7 + fk * 0.85;
    float cellTime = uTime / period;
    float quantStep = floor(cellTime * stepsPerSec) / stepsPerSec;

    float cellSeed = s + fk * 37.13 + quantStep;
    float h1 = fract(sin(cellSeed * 127.1 + 311.7) * 43758.5);
    float h2 = fract(sin(cellSeed * 269.5 + 183.3) * 43758.5);
    /* At storminess=1, nearly every step fires (0.9 probability) */
    float isActive = step(h1, storminess * storminess * 0.9);

    float flashTheta = h1 * 6.2832;
    float flashPhi = acos(2.0 * h2 - 1.0);
    vec3 flashCenter = vec3(sin(flashPhi) * cos(flashTheta), cos(flashPhi), sin(flashPhi) * sin(flashTheta));

    float radius = 0.3 + storminess * 0.3;
    float dist = length(sp - flashCenter);
    float falloff = exp(-dist * dist / (radius * radius));

    float intensity = (0.5 + h2 * 0.5) * storminess * 1.5;

    float fracStep = fract(cellTime * stepsPerSec);
    float flash = smoothstep(0.0, 0.15, fracStep) * smoothstep(1.0, 0.5, fracStep);

    float contribution = falloff * intensity * flash * isActive;
    flashOut += contribution;
    colorAccum += flashTint(h1 + fk * 0.25) * contribution;
  }

  flashOut = clamp(flashOut, 0.0, 1.0);
  flashColor = clamp(colorAccum, 0.0, 1.5);
  return flashOut;
}

void main() {
  vec3 objNormal = normalize(vLocalPos);
  vec3 rotated = uRotation * objNormal;
  float s = fract(uSeed * 0.00000013) * 100.0;

  /* Animated churn for gas/ocean — stronger than atlas version */
  vec3 sp = rotated;
  float churnT = uTime * 0.25;
  vec4 churnN = gnoised(sp * 3.0 + vec3(churnT * 0.7, churnT * 0.3, -churnT * 0.5));
  float churnAmt = float(uPlanetMode == 2 || uPlanetMode == 3) * 0.07;
  sp.x += churnN.y * churnAmt;
  sp.z += churnN.z * churnAmt;

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

  /* High-frequency detail — 2 extra octaves beyond what the 128px bake captures.
     Solid surfaces get darkening grain; gas/ocean get color variation. */
  bool isFluid = (uPlanetMode == 2 || uPlanetMode == 3);
  bool isVoronoi = (uPlanetMode == 4 || uPlanetMode == 5 || uPlanetMode == 6 || uPlanetMode == 7);
  if (!isVoronoi) {
    vec3 hp = sp * 18.0 + vec3(s * 0.73);
    vec4 fn1 = gnoised(hp);
    float fine2 = gnoised(hp * 2.37 + vec3(s * 1.91)).x;
    float fineDetail = fn1.x * 0.5 + fine2 * 0.25;
    if (isFluid) {
      color += (uBaseColor2 - uBaseColor1) * fineDetail * 0.06;
    } else {
      color *= 1.0 + fineDetail * 0.12;
    }
    gDetailDerivs += fn1.yzw * 0.3;
  }

  /* Normal perturbation from procedural derivatives — full resolution, no atlas gridding */
  vec3 N = normalize(vNormal);
  vec3 V = normalize(vViewDir);
  vec3 up = abs(N.y) < 0.999 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
  vec3 T = normalize(cross(up, N));
  vec3 B = cross(N, T);
  /* Voronoi subtypes leave gDetailDerivs at zero → unperturbed geometric normals */
  float derivLen = length(gDetailDerivs);
  float bumpStrength = min(0.35, derivLen * 0.25);
  vec3 perturbedN = normalize(N - bumpStrength * (gDetailDerivs.x * T + gDetailDerivs.y * B));

  /* Directional lighting from parent star */
  vec3 L = normalize(uLightDir);
  float NdotL = dot(perturbedN, L);
  float lighting = smoothstep(-0.4, 0.5, NdotL) * 0.65 + 0.35;

  /* Compute cloud coverage early — needed to suppress surface specular under clouds */
  float cloudAlpha = cloudLayer(sp, s, uCloudCover);

  /* Blinn-Phong specular — ocean uses gOceanMask + crest-height weighting.
     Attenuated under clouds so wave glints don't bleed through. */
  float specMask = 0.0;
  if (uPlanetMode == 0 || uPlanetMode == 3) specMask = uSpecular * gOceanMask;
  if (uPlanetMode == 4 || uPlanetMode == 6) specMask = uSpecular * 0.5;
  if (uPlanetMode == 0 || uPlanetMode == 3) specMask *= 0.7 + gWaveHeight * 0.6;
  specMask *= 1.0 - cloudAlpha;
  vec3 H = normalize(L + V);
  float NdotH = max(0.0, dot(perturbedN, H));
  float spec = specMask * pow(NdotH, 32.0) * 0.6;

  /* Also flatten surface bump detail under clouds — the normal perturbation
     from ocean waves shouldn't warp the lighting through a cloud layer */
  vec3 cloudedN = mix(perturbedN, N, cloudAlpha * 0.8);

  color = color * lighting + vec3(spec);

  /* jsulpis 4-layer Fresnel atmosphere with sun-side masking.
     Razor-thin bright limb + wider scatter layers. Even airless bodies
     get a subtle reflected-light rim (the 0.15 floor). */
  float NdotV = max(0.0, dot(N, V));
  float edge = 1.0 - NdotV;
  float atmo = 0.0;
  atmo += pow(edge, 64.0) * 1.2;
  atmo += pow(edge, 16.0) * 0.6;
  atmo += pow(edge, 6.0)  * 0.3;
  atmo += pow(edge, 2.5)  * 0.15;
  float sunMask = smoothstep(-0.2, 0.5, dot(N, L));
  float rimGlow = uAtmoIntensity * atmo * (0.15 + sunMask * 0.85);
  /* Minimum reflected-light rim for all bodies, even airless */
  rimGlow = max(rimGlow, pow(edge, 12.0) * 0.08 * sunMask);
  color += uAtmoTint * rimGlow;

  /* Cloud layer — above terrain, below emissive glow */
  if (cloudAlpha > 0.0) {
    float cloudLit = smoothstep(-0.3, 0.5, dot(cloudedN, L)) * 0.7 + 0.3;
    vec3 litCloud = uCloudColor * cloudLit;
    litCloud += uCloudColor * pow(NdotV, 4.0) * 0.15;
    color = mix(color, litCloud, cloudAlpha);
  }

  /* Lightning — emissive flash through cloud cover */
  if (uStorminess > 0.05 && cloudAlpha > 0.1) {
    vec3 flashColor;
    float flash = lightningFlash(sp, s, uStorminess, flashColor);
    color += flashColor * flash * cloudAlpha;
  }

  /* Volcanic/fungal emissive glow not affected by lighting */
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

  fragColor = vec4(color, 1.0);
}
