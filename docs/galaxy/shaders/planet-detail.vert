precision highp float;

uniform float uSeed;
uniform float uTime;
uniform float uDisplacementAmp;
uniform float uLumpiness;
uniform mat3 uRotation;

out vec3 vLocalPos;
out vec3 vNormal;
out vec3 vViewDir;
out vec2 vUv;

/* Lightweight noise for vertex displacement */
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
  vUv = uv;

  float s = fract(uSeed * 0.00000013) * 100.0;
  vec3 objNormal = normalize(position);

  /* All displacement from body-local coords so geometry is static per seed */
  vec3 np = objNormal * 3.5;
  float disp = gnoise(np + vec3(s, s * 1.37, s * 0.71));
  disp += 0.4 * gnoise(np * 2.3 + vec3(s * 2.31, s * 0.53, s * 1.91));
  disp *= uDisplacementAmp;

  float lump = gnoise(objNormal * 1.2 + vec3(s * 0.43, s * 0.91, s * 0.17));
  lump += 0.5 * gnoise(objNormal * 2.5 + vec3(s * 1.63, s * 0.29, s * 1.07));
  disp += lump * uLumpiness;

  vec3 displaced = position + n * disp;

  /* Fragment gets body-local pos for texture — craters stick to surface */
  vLocalPos = displaced;

  /* Rotate the rigid shape for visual spin */
  vec3 rotDisplaced = uRotation * displaced;
  vec3 rotNormal = normalize(uRotation * n);

  vec4 worldPos = modelMatrix * vec4(rotDisplaced, 1.0);
  vNormal = normalize(mat3(modelMatrix) * rotNormal);
  vViewDir = normalize(cameraPosition - worldPos.xyz);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(rotDisplaced, 1.0);
}
