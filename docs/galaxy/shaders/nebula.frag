precision highp float;

varying vec3 vColor;
varying float vBrightness;
varying float vStretch;
varying float vAngle;
varying float vPhase;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

void main() {
  vec2 uv = gl_PointCoord - vec2(0.5);

  /* Rotate then stretch into ellipse */
  float cosA = cos(vAngle);
  float sinA = sin(vAngle);
  vec2 rotated = vec2(uv.x * cosA - uv.y * sinA, uv.x * sinA + uv.y * cosA);
  rotated.y /= vStretch;

  /* Noise-based edge warping for organic cloud shapes */
  float warp = noise(rotated * 3.0 + vPhase) * 0.15;
  float dist = length(rotated) + warp;

  if (dist > 0.5) discard;

  /* Premultiply alpha into RGB for screen blending */
  float alpha = smoothstep(0.5, 0.0, dist);
  alpha *= alpha * vBrightness;
  gl_FragColor = vec4(vColor * alpha, alpha);
}
