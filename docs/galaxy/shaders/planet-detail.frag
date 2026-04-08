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

in vec3 vLocalPos;
in vec3 vNormal;
in vec3 vViewDir;
in vec2 vUv;

out vec4 fragColor;

/* @include noise-common */

/* Captured by render functions for normal perturbation */
vec3 gDetailDerivs = vec3(0.0);


/* Flow-field warp — same as bake shader */
vec3 flowWarp(vec3 p, float s, float strength) {
  float n1 = fbm(p * 1.5 + vec3(s * 0.37, s * 1.13, s * 0.61), 0.3);
  float n2 = fbm(p * 1.5 + vec3(s * 1.83, s * 0.29, s * 1.47), 0.3);
  float alpha = n1 * 6.2832;
  float beta = n2 * 3.1416;
  vec3 offset = vec3(cos(alpha) * cos(beta), sin(beta), sin(alpha) * cos(beta));
  return p + offset * strength;
}


vec3 renderRocky(vec3 sp, float s) {
  vec3 p = flowWarp(sp * 3.5, s, 0.25);
  vec4 hd = fbmd(p + vec3(s), uSlopeness);
  gDetailDerivs = hd.yzw;
  float height = hd.x * 0.5 + 0.5;
  float lat = abs(sp.y);

  float landHeight = height - uOceanLevel;
  float flattenedHeight = landHeight < 0.0
    ? landHeight / 3.0 + uOceanLevel
    : height;

  float h = flattenedHeight;
  float t = 0.02;

  vec3 deepOcean = uBaseColor1 * 0.3;
  vec3 shallowOcean = uBaseColor1 * 0.6;
  vec3 shore = mix(uBaseColor1, uBaseColor2, 0.5);
  vec3 lowland = uBaseColor2;
  vec3 highland = uBaseColor3;
  vec3 polar = mix(vec3(0.85, 0.9, 0.95), uBaseColor3, 0.3);

  vec3 color = deepOcean;
  color = mix(color, shallowOcean, smoothstep(uOceanLevel - 0.12, uOceanLevel - 0.03, h));
  color = mix(color, shore,        smoothstep(uOceanLevel - t, uOceanLevel + t, h));
  color = mix(color, lowland,      smoothstep(uOceanLevel + 0.02, uOceanLevel + 0.12, h));
  color = mix(color, highland,     smoothstep(0.6, 0.75, h));

  float polarNoise = fbm(sp * 3.0 + vec3(s * 2.0), 0.3) * 0.12;
  float polarFactor = smoothstep(0.55, 0.8, lat + polarNoise + height * 0.1);
  polarFactor *= smoothstep(0.7, 0.3, uTemperature);
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
  vec3 p = sp * 2.5;
  float qx = fbm(p + vec3(s * 0.37, s * 1.13, s * 0.61), 0.6);
  float qy = fbm(p + vec3(s * 1.83, s * 0.29, s * 1.47), 0.6);
  float qz = fbm(p + vec3(s * 0.93, s * 2.11, s * 0.17), 0.6);
  vec3 q = vec3(qx, qy, qz) * 2.0 - 1.0;

  vec3 np = p + q * 1.5;
  float rx = fbm(np + vec3(s * 2.37, s * 0.53, s * 1.71), 0.7);
  float ry = fbm(np + vec3(s * 0.67, s * 1.89, s * 0.33), 0.7);
  vec3 r = vec3(rx, ry, rx - ry) * 2.0 - 1.0;

  vec3 rp = np + r * 1.3;
  float sx = fbm(rp + vec3(s * 3.1, s * 0.41, s * 1.9), 0.5);
  float sy = fbm(rp + vec3(s * 0.19, s * 2.7, s * 0.83), 0.5);
  vec3 sw = vec3(sx, sy, sx + sy) * 2.0 - 1.0;

  vec4 hd = fbmd(p + sw * 0.8, 0.8);
  gDetailDerivs = hd.yzw;
  float depthNoise = hd.x * 0.5 + 0.5;

  float lat = abs(sp.y);
  float latBand = smoothstep(0.0, 0.7, lat);

  vec3 shallowWarm = uBaseColor1 * 1.1 + vec3(0.02, 0.04, 0.03);
  vec3 midOcean = uBaseColor1 * 0.7;
  vec3 deepCold = uBaseColor1 * 0.35;

  vec3 color = mix(shallowWarm, midOcean, smoothstep(0.25, 0.5, depthNoise));
  color = mix(color, deepCold, smoothstep(0.5, 0.75, depthNoise));

  vec3 polarTint = mix(uBaseColor1, vec3(0.5, 0.6, 0.7), 0.4);
  color = mix(color, polarTint, latBand * 0.3);

  float stormIntensity = length(q) * 0.3 + length(r) * 0.25 + length(sw) * 0.2;
  float whitecaps = pow(max(0.0, stormIntensity), 2.5);
  color += vec3(whitecaps * 0.1);

  float slope = length(hd.yzw);
  color *= mix(1.0, 0.45, smoothstep(0.2, 1.2, slope));

  float landHeight = depthNoise - uOceanLevel * 1.8 + 0.4;
  float land = smoothstep(0.85, 0.9, landHeight);
  color = mix(color, uBaseColor2 * 1.3 + 0.15, land);

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

  /* Ocean/ice specular highlight */
  float specMask = 0.0;
  if (uPlanetMode == 0) specMask = uSpecular * max(0.0, 1.0 - smoothstep(uOceanLevel - 0.02, uOceanLevel + 0.04, 0.5));
  if (uPlanetMode == 3) specMask = uSpecular;
  if (uPlanetMode == 4 || uPlanetMode == 6) specMask = uSpecular * 0.5;
  float spec = specMask * pow(max(0.0, NdotL), 12.0) * 0.4;

  color = color * lighting + vec3(spec);

  /* Fresnel rim atmosphere — pow(1 - NdotV, 4) */
  float NdotV = max(0.0, dot(N, V));
  float rimFactor = pow(1.0 - NdotV, 4.0);
  color += uAtmoTint * uAtmoIntensity * rimFactor;

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
