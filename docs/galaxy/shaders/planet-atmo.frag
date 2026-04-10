precision highp float;

uniform vec3  uAtmoTint;
uniform float uAtmoIntensity;
uniform vec3  uLightDir;
uniform float uFadeIn;

/* Cloud uniforms */
uniform float uCloudCover;
uniform vec3  uCloudColor;
uniform float uStorminess;
uniform float uTime;
uniform float uSeed;
uniform int   uPlanetMode;
uniform float uBandCount;

in vec3 vNormal;
in vec3 vSphereNormal;
in vec3 vViewDir;
in vec3 vWorldPos;
in vec3 vLocalPos;

out vec4 fragColor;

/* @include noise-common */

float cloudLayer(vec3 sp, float s, float cover) {
  if (cover < 0.01) return 0.0;

  float t = uTime * (0.04 + uStorminess * 0.08);
  vec3 p = sp * 2.8 + vec3(s * 0.41, s * 0.17, s * 0.73);

  float warpAmt = 0.15 + uStorminess * 0.9;
  float wx = fbm(p * 0.7 + vec3(t * 0.6, 0.0, t * 0.3), 0.3);
  float wy = fbm(p * 0.7 + vec3(0.0, t * 0.5, t * -0.4), 0.3);
  float wz = fbm(p * 0.7 + vec3(t * -0.2, t * 0.4, 0.0), 0.3);
  vec3 warpedP = p + vec3(wx, wy, wz) * warpAmt + vec3(t * 0.5, 0.0, t * 0.3);

  float cloud = fbm(warpedP, 0.2) * 0.5 + 0.5;
  cloud += fbm(warpedP * 2.3 + vec3(s * 1.1), 0.2) * 0.2;
  cloud += gnoised(warpedP * 5.0 + vec3(s * 2.7)).x * 0.15;
  cloud += gnoised(warpedP * 11.0 + vec3(s * 4.3)).x * 0.07;

  float smoothEdge = 0.12 + uStorminess * 0.08;
  cloud = smoothstep(1.0 - cover, 1.0 - cover + smoothEdge, cloud);
  return clamp(cloud, 0.0, 0.9);
}

vec3 flashTint(float h) {
  vec3 warm = vec3(0.99, 0.93, 0.38);
  vec3 cool = vec3(0.60, 0.97, 0.96);
  vec3 base = mix(cool, warm, h);
  return mix(base, uAtmoTint * 2.5, 0.2);
}

float lightningFlash(vec3 sp, float s, float storminess, out vec3 flashColor) {
  flashColor = vec3(0.0);
  if (storminess < 0.05) return 0.0;

  float flashOut = 0.0;
  vec3 colorAccum = vec3(0.0);
  float stepsPerSec = 3.0 + storminess * 5.0;

  for (int k = 0; k < 4; k++) {
    float fk = float(k);
    float period = 1.7 + fk * 0.85;
    float cellTime = uTime / period;
    float quantStep = floor(cellTime * stepsPerSec) / stepsPerSec;

    float cellSeed = s + fk * 37.13 + quantStep;
    float h1 = fract(sin(cellSeed * 127.1 + 311.7) * 43758.5);
    float h2 = fract(sin(cellSeed * 269.5 + 183.3) * 43758.5);
    float isActive = step(h1, storminess * storminess * 0.9);
    if (isActive < 0.5) continue;

    float flashTheta = h1 * 6.2832;
    float flashPhi = acos(2.0 * h2 - 1.0);
    vec3 flashCenter = vec3(sin(flashPhi) * cos(flashTheta), cos(flashPhi), sin(flashPhi) * sin(flashTheta));

    float radius = 0.3 + storminess * 0.3;
    float dist = length(sp - flashCenter);
    float falloff = exp(-dist * dist / (radius * radius));
    float intensity = (0.5 + h2 * 0.5) * storminess * 1.5;

    float fracStep = fract(cellTime * stepsPerSec);
    float flash = smoothstep(0.0, 0.15, fracStep) * smoothstep(1.0, 0.5, fracStep);

    float contribution = falloff * intensity * flash;
    flashOut += contribution;
    colorAccum += flashTint(h1 + fk * 0.25) * contribution;
  }

  flashOut = clamp(flashOut, 0.0, 1.0);
  flashColor = clamp(colorAccum, 0.0, 1.5);
  return flashOut;
}

void main() {
  /* Analytical sphere normal from vertex position — smoother than the mesh normal
     attribute at low tessellation, avoids triangular artifacts in high-exponent Fresnel */
  vec3 N = normalize(vSphereNormal);
  vec3 V = normalize(vViewDir);
  vec3 L = normalize(uLightDir);

  float NdotV = max(0.0, dot(N, V));
  float edge = 1.0 - NdotV;
  float NdotL = dot(N, L);

  if (!gl_FrontFacing) {
    /* BACK FACE — atmosphere Fresnel glow (alpha=0 → pure additive via blend factors) */
    float atmo = pow(edge, 48.0) * 1.2
               + pow(edge, 12.0) * 0.7
               + pow(edge, 4.0)  * 0.4
               + pow(edge, 1.8)  * 0.1;

    float sunMask = smoothstep(-0.1, 0.4, NdotL);
    float terminator = smoothstep(0.0, 0.3, NdotL) * (1.0 - smoothstep(0.3, 0.7, NdotL));
    float litGlow = atmo * (0.03 + sunMask * 0.97 + terminator * 0.4);

    float scatter = pow(max(0.0, dot(V, -L)), 5.0) * edge * 0.5;
    float glow = uAtmoIntensity * (litGlow + scatter);
    glow = min(glow, 0.85) * uFadeIn;

    fragColor = vec4(uAtmoTint * glow, 0.0);
    return;
  }

  /* FRONT FACE — cloud layer (premultiplied alpha → occluding via blend factors) */
  float s = fract(uSeed * 0.00000013) * 100.0;
  vec3 sp = vLocalPos;

  float cloudAlpha = cloudLayer(sp, s, uCloudCover);

  /* Gas giants: clouds concentrate in zones (bright bands), thin over belts */
  if (uPlanetMode == 2 && cloudAlpha > 0.0) {
    float gasBand = sin(sp.y * uBandCount * 0.7 * PI) * 0.5 + 0.5;
    cloudAlpha *= mix(0.2, 1.0, gasBand);
  }

  /* Wider limb fade — clouds thin out well before the atmosphere rim.
     No discard — premultiplied alpha handles near-zero fragments cleanly
     without creating hard triangle-aligned edges at the transition. */
  cloudAlpha *= smoothstep(0.05, 0.35, NdotV);

  float cloudLit = smoothstep(-0.3, 0.5, NdotL) * 0.7 + 0.3;
  vec3 litCloud = uCloudColor * cloudLit;
  litCloud += uCloudColor * pow(NdotV, 4.0) * 0.15;

  /* Lightning flashes through the cloud cover */
  if (uStorminess > 0.05 && cloudAlpha > 0.1) {
    vec3 flashColor;
    float flash = lightningFlash(sp, s, uStorminess, flashColor);
    litCloud += flashColor * flash;
  }

  cloudAlpha *= uFadeIn;
  /* Premultiplied alpha: color × alpha, then blend factors (ONE, ONE_MINUS_SRC_ALPHA)
     produce correct occlusion of the surface below */
  fragColor = vec4(litCloud * cloudAlpha, cloudAlpha);
}
