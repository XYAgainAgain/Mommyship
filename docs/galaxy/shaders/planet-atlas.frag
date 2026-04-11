precision highp float;
precision highp sampler2DArray;

uniform sampler2DArray uAtlas;
uniform float uTime;

in vec2 vUv;
flat in float vLayer;
in float vCrossfade;
in vec3 vInstanceColor;
in vec3 vLightDir;
in vec3 vLocalPos;
in float vChurn;
flat in vec4 vAtmosphere;
in vec3 vViewDir;

out vec4 fragColor;

/* @include noise-common */

void main() {
  vec3 N = normalize(vLocalPos);

  /* Geometry UVs — seamless because SphereGeometry has duplicate verts at the
     back meridian, and the baked texture wraps (RepeatWrapping on X).
     Stars use this exact approach with zero seams. */
  vec2 uv = vUv;

  /* Animated surface churn for ocean/gas — gradient noise in 3D sphere space.
     Using noise derivatives as displacement gives curl-like motion where each
     point moves independently, creating roiling instead of latitude-band shearing. */
  if (vChurn > 0.01) {
    float t = uTime * 0.3;
    float cs = fract(vLayer * 0.4327) * 6.2832;
    vec3 sp = N;

    vec4 n = gnoised(sp * 3.0 + vec3(t * 0.7 + cs, t * 0.3, -t * 0.5));
    uv.x += n.y * 0.06 * vChurn;
    uv.y += n.z * 0.03 * vChurn;
  }

  vec4 texel = texture(uAtlas, vec3(uv, vLayer));
  vec3 texColor = texel.rgb;

  /* Star-facing hemispherical lighting — wrap-light matches detail shader */
  vec3 L = normalize(vLightDir);
  vec3 V = normalize(vViewDir);
  float NdotL_raw = dot(N, L);
  float NdotL = max(0.0, NdotL_raw * 0.65 + 0.35);

  /* Alpha-driven shininess — approximates detail shader's per-subtype roughness */
  vec3 H = normalize(L + V);
  float NdotH = max(0.0, dot(N, H));
  float shininess = mix(4.0, 64.0, texel.a);
  float spec = texel.a * pow(NdotH, shininess) * 0.5;

  vec3 litColor = texColor * NdotL + vec3(spec);

  vec3 color = mix(vInstanceColor, litColor, vCrossfade);

  /* Fresnel rim atmosphere — 3-layer with tight bright limb, sun-masked */
  float NdotV_rim = max(0.0, dot(N, normalize(vViewDir)));
  float rimEdge = 1.0 - NdotV_rim;
  float rim = pow(rimEdge, 24.0) * 1.0 + pow(rimEdge, 8.0) * 0.5 + pow(rimEdge, 3.0) * 0.15;
  float sunMask = smoothstep(-0.2, 0.5, dot(N, L));
  float atmoDensity = vAtmosphere.w;
  /* Minimum reflected-light rim even on airless bodies */
  float rimGlow = atmoDensity * rim * (0.15 + sunMask * 0.85);
  rimGlow = max(rimGlow, pow(rimEdge, 10.0) * 0.06 * sunMask);
  color += vAtmosphere.xyz * rimGlow * vCrossfade;

  fragColor = vec4(color, 1.0);
}
