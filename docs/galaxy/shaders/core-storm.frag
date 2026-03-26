precision highp float;

uniform sampler2D uTexture;
uniform sampler2D uNoise;
uniform float uTime;
uniform float uOpacity;
uniform float uPulseStrength;
uniform float uPulseSpeed;
uniform int uWarpMode;

varying vec2 vUv;

void main() {
  vec2 centered = vUv - 0.5;
  float dist = length(centered) * 2.0;

  /* Donut fade: transparent at center (BH clearance), full mid-range, zero at edges */
  float innerFade = smoothstep(0.04, 0.15, dist);
  float outerFade = 1.0 - smoothstep(0.3, 1.0, dist);
  float fade = innerFade * outerFade;
  if (fade < 0.001) discard;

  vec2 uv = vUv;

  if (uWarpMode == 0) {
    /* Sine-based warp: coprime frequencies for organic swirl */
    float t = uTime;
    uv.x += sin(vUv.y * 4.7 + t * 0.11) * cos(vUv.x * 3.1 + t * 0.07) * 0.04;
    uv.y += sin(vUv.x * 5.3 + t * 0.13) * cos(vUv.y * 2.9 + t * 0.09) * 0.04;
    uv.x += sin(vUv.y * 8.1 + t * 0.19) * 0.015;
    uv.y += cos(vUv.x * 7.3 + t * 0.17) * 0.015;
  } else {
    /* Noise-based warp: scrolling Perlin offsets */
    float t = uTime * 0.03;
    vec2 noiseUV1 = vUv * 1.5 + vec2(t, t * 0.7);
    vec2 noiseUV2 = vUv * 2.3 + vec2(-t * 0.8, t * 0.5);
    float n1 = texture2D(uNoise, noiseUV1).r;
    float n2 = texture2D(uNoise, noiseUV2).r;
    uv += (vec2(n1, n2) - 0.5) * 0.06;
  }

  vec4 tex = texture2D(uTexture, uv);

  /* Luminosity pulse with second harmonic */
  float pulse = 1.0 + uPulseStrength * sin(uTime * uPulseSpeed)
              + uPulseStrength * 0.5 * sin(uTime * uPulseSpeed * 1.7 + 1.0);

  vec3 color = tex.rgb * fade * pulse;
  float alpha = fade * uOpacity;

  /* Black pixels contribute nothing under additive blending */
  gl_FragColor = vec4(color * alpha, alpha);
}
