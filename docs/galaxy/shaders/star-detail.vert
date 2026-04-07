precision highp float;

uniform float uSeed;
uniform float uGranScale;
uniform float uSize;
uniform float uTime;
uniform float uBubbleAmp;
uniform mat3 uRotation;

out vec3 vLocalPos;
out vec3 vNormal;
out vec3 vViewDir;

/* Lightweight noise for vertex displacement — matches fragment shader's hash */
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
  vec3 n = normalize(normal);
  vLocalPos = position;

  /* Vertex displacement — noise in the same domain as the fragment shader */
  float s = fract(uSeed * 0.00000013) * 100.0;
  float sizeInv = 1.0 / max(uSize, 0.3);
  vec3 objNormal = normalize(position);
  vec3 rotated = uRotation * objNormal;
  vec3 np = rotated * uGranScale * sizeInv;

  /* Two octaves for organic shape — animated with slow time rotation */
  float angle = uTime * 0.008;
  float sa = sin(angle), ca = cos(angle);
  vec3 rp = vec3(np.x * ca - np.z * sa, np.y, np.x * sa + np.z * ca);
  float disp = gnoise(rp + vec3(s, s * 1.37, s * 0.71));
  disp += 0.45 * gnoise(rp * 2.17 + vec3(s * 2.31, s * 0.53, s * 1.91));
  disp *= uBubbleAmp;

  vec3 displaced = position + n * disp;

  vec4 worldPos = modelMatrix * vec4(displaced, 1.0);
  vNormal = normalize(normalMatrix * n);
  vViewDir = normalize(cameraPosition - worldPos.xyz);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}
