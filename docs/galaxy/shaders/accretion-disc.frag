precision highp float;

uniform float uTime;
uniform float uOpacity;
uniform sampler2D uNoiseTexture;

varying vec2 vUv;

float inverseLerp(float v, float minVal, float maxVal) {
  return (v - minVal) / (maxVal - minVal);
}

/* vUv.y = 0 at inner edge (near BH), 1 at outer edge */
vec3 diskGradient(float t) {
  vec3 c0 = vec3(1.0, 0.90, 0.97);
  vec3 c1 = vec3(0.95, 0.30, 0.60);
  vec3 c2 = vec3(0.12, 0.30, 0.55);
  vec3 c3 = vec3(0.51, 0.20, 0.67);
  vec3 c4 = vec3(0.80, 0.65, 0.30);

  vec3 color = mix(c0, c1, smoothstep(0.0, 0.15, t));
  color = mix(color, c2, smoothstep(0.15, 0.35, t));
  color = mix(color, c3, smoothstep(0.35, 0.60, t));
  color = mix(color, c4, smoothstep(0.60, 0.90, t));
  return color;
}

void main() {
  vec4 color = vec4(0.0);

  for (float i = 0.0; i < 3.0; i++) {
    float layerOffset = i / 2.0;

    float intensity = 1.0 - ((vUv.y - layerOffset) * 3.0) * 0.5;
    intensity = smoothstep(0.0, 1.0, intensity);

    vec2 uv = vUv;
    uv.y *= 2.0;
    uv.x += uTime / ((i * 10.0) + 1.0);

    /* Gradient driven by radial position, with noise-warped streaks */
    float noiseIntensity = texture2D(uNoiseTexture, uv).r;

    /* Warp the radial lookup slightly per layer for streaky banding */
    float warpedY = vUv.y + (noiseIntensity - 0.5) * 0.12 * (1.0 + i * 0.3);
    vec3 ringColor = diskGradient(clamp(warpedY, 0.0, 1.0));

    /* Per-layer hue shift adds swirly color variety within bands */
    float hueShift = (noiseIntensity - 0.5) * 0.2;
    ringColor = max(vec3(
      ringColor.r + hueShift * 0.4,
      ringColor.g - hueShift * 0.2,
      ringColor.b + hueShift * 0.6
    ), vec3(0.0));

    ringColor *= noiseIntensity * intensity;
    color.rgb += ringColor * 0.45;
  }

  /* Edge attenuation at inner/outer boundaries */
  float edges = min(
    clamp(inverseLerp(vUv.y, 0.0, 0.02), 0.0, 1.0),
    clamp(inverseLerp(vUv.y, 1.0, 0.5), 0.0, 1.0)
  );
  color.rgb = mix(vec3(0.0), color.rgb, edges);
  color.a = uOpacity;

  gl_FragColor = color;
}
