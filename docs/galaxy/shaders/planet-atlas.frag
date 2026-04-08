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

  /* Star-facing hemispherical lighting */
  vec3 L = normalize(vLightDir);
  float NdotL = dot(N, L);
  float lighting = smoothstep(-0.4, 0.5, NdotL) * 0.6 + 0.4;

  /* Specular hint on the lit side */
  float spec = texel.a * pow(max(0.0, NdotL), 8.0) * 0.35;

  vec3 litColor = texColor * lighting + vec3(spec);

  vec3 color = mix(vInstanceColor, litColor, vCrossfade);

  fragColor = vec4(color, 1.0);
}
