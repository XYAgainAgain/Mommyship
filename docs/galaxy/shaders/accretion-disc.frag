precision highp float;

uniform float uTime;
uniform float uOpacity;
uniform sampler2D uNoiseTexture;
uniform vec3 uInnerColor;
uniform vec3 uMidColor;
uniform vec3 uOuterColor;

varying vec2 vUv;

float inverseLerp(float v, float minVal, float maxVal) {
  return (v - minVal) / (maxVal - minVal);
}

vec3 blendAdd(vec3 base, vec3 blend) {
  return min(base + blend, vec3(1.0));
}

void main() {
  vec4 color = vec4(0.0);
  float iterations = 3.0;

  for (float i = 0.0; i < 3.0; i++) {
    float progress = i / (iterations - 1.0);

    float intensity = 1.0 - ((vUv.y - progress) * iterations) * 0.5;
    intensity = smoothstep(0.0, 1.0, intensity);

    vec2 uv = vUv;
    uv.y *= 2.0;
    uv.x += uTime / ((i * 10.0) + 1.0);

    /* Color blend: inner pink -> mid purple -> outer blue */
    vec3 ringColor = mix(uInnerColor, uMidColor, smoothstep(0.0, 0.5, progress));
    ringColor = mix(ringColor, uOuterColor, smoothstep(0.5, 1.0, progress));

    float noiseIntensity = texture2D(uNoiseTexture, uv).r;
    ringColor = mix(vec3(0.0), ringColor, noiseIntensity * intensity);
    color.rgb = blendAdd(color.rgb, ringColor);
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
