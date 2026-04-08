precision highp float;

uniform float uTime;
uniform float uSeed;

out vec2 vUv;
out vec3 vWorldPos;
out float vNoise;

vec3 hash33(vec3 p) {
  p = vec3(dot(p, vec3(127.1, 311.7, 74.7)),
           dot(p, vec3(269.5, 183.3, 246.1)),
           dot(p, vec3(113.5, 271.9, 124.6)));
  return fract(sin(p) * 43758.5453) * 2.0 - 1.0;
}

float gnoise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  vec3 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(dot(hash33(i), f),
                     dot(hash33(i + vec3(1, 0, 0)), f - vec3(1, 0, 0)), u.x),
                 mix(dot(hash33(i + vec3(0, 1, 0)), f - vec3(0, 1, 0)),
                     dot(hash33(i + vec3(1, 1, 0)), f - vec3(1, 1, 0)), u.x), u.y),
             mix(mix(dot(hash33(i + vec3(0, 0, 1)), f - vec3(0, 0, 1)),
                     dot(hash33(i + vec3(1, 0, 1)), f - vec3(1, 0, 1)), u.x),
                 mix(dot(hash33(i + vec3(0, 1, 1)), f - vec3(0, 1, 1)),
                     dot(hash33(i + vec3(1, 1, 1)), f - vec3(1, 1, 1)), u.x), u.y), u.z);
}

void main() {
  vUv = uv;
  float s = fract(uSeed * 0.00000013) * 100.0;
  vec3 np = position * 0.15 + vec3(s);

  /* Mesh warping synced to spin — fast, jittery EM field distortion */
  float wobble = gnoise(np + vec3(uTime * 1.2, uTime * 0.8, uTime * 0.9));
  wobble += 0.5 * gnoise(np * 2.3 + vec3(uTime * 2.0, uTime * -1.4, uTime * 1.6));
  wobble *= 0.5;
  vNoise = wobble;

  vec3 n = normalize(normal);
  vec3 displaced = position + n * wobble;

  vWorldPos = (modelMatrix * vec4(displaced, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}
