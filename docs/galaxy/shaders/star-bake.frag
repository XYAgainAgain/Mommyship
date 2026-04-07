precision highp float;

uniform float uSeed;
uniform float uLowTemp;
uniform float uHighTemp;
uniform float uGranScale;
uniform float uSpotAmp;
uniform float uSize;
uniform float uSlopeness;
uniform float uEmissive;

in vec2 vUv;
out vec4 fragColor;

#define PI 3.14159265359

vec3 uvToSphere(vec2 uv) {
  float theta = uv.x * 2.0 * PI;
  float phi = (1.0 - uv.y) * PI;
  float sp = sin(phi);
  return vec3(sp * cos(theta), cos(phi), sp * sin(theta));
}

/* Hash-based 3D gradient noise — tiles at all scales, no texture needed */
vec3 hash33(vec3 p) {
  p = vec3(dot(p, vec3(127.1, 311.7, 74.7)),
           dot(p, vec3(269.5, 183.3, 246.1)),
           dot(p, vec3(113.5, 271.9, 124.6)));
  return fract(sin(p) * 43758.5453) * 2.0 - 1.0;
}

/* 3D gradient noise with analytical derivatives — returns vec4(value, dx, dy, dz) */
vec4 gnoised(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  vec3 u = f * f * (3.0 - 2.0 * f);
  vec3 du = 6.0 * f * (1.0 - f);

  /* 8 corner dot products */
  float n000 = dot(hash33(i), f);
  float n100 = dot(hash33(i + vec3(1, 0, 0)), f - vec3(1, 0, 0));
  float n010 = dot(hash33(i + vec3(0, 1, 0)), f - vec3(0, 1, 0));
  float n110 = dot(hash33(i + vec3(1, 1, 0)), f - vec3(1, 1, 0));
  float n001 = dot(hash33(i + vec3(0, 0, 1)), f - vec3(0, 0, 1));
  float n101 = dot(hash33(i + vec3(1, 0, 1)), f - vec3(1, 0, 1));
  float n011 = dot(hash33(i + vec3(0, 1, 1)), f - vec3(0, 1, 1));
  float n111 = dot(hash33(i + vec3(1, 1, 1)), f - vec3(1, 1, 1));

  /* Trilinear interpolation coefficients for derivative chain rule */
  float a = n000;
  float b = n100 - n000;
  float c = n010 - n000;
  float d = n001 - n000;
  float e = n110 - n010 - b;
  float f0 = n101 - n001 - b;
  float g = n011 - n001 - c;
  float h = n111 - n011 - n101 + n001 - e;

  float value = a + b * u.x + c * u.y + d * u.z
              + e * u.x * u.y + f0 * u.x * u.z + g * u.y * u.z
              + h * u.x * u.y * u.z;

  vec3 deriv = du * vec3(
    b + e * u.y + f0 * u.z + h * u.y * u.z,
    c + e * u.x + g * u.z + h * u.x * u.z,
    d + f0 * u.x + g * u.y + h * u.x * u.y
  );

  return vec4(value, deriv);
}

/* FBM with analytical derivatives and slopeness — suppresses amplitude at steep slopes */
vec4 fbmd(vec3 p, float slopeness) {
  float v = 0.0, a = 0.5;
  vec3 derivative = vec3(0.0);
  float freq = 1.0;
  for (int i = 0; i < 4; i++) {
    vec4 n = gnoised(p);
    /* Suppress amplitude where accumulated slope is high → dark cell ridges */
    n.x /= (1.0 + slopeness * dot(derivative, derivative));
    v += a * n.x;
    derivative += a * n.yzw * freq;
    freq *= 2.17;
    p *= 2.17;
    a *= 0.45;
  }
  return vec4(v, derivative);
}

vec3 blackbodyRGB(float kelvin) {
  float t = clamp(kelvin, 1000.0, 40000.0) / 100.0;
  vec3 c;
  c.r = t <= 66.0 ? 1.0 : 1.293 * pow(t - 60.0, -0.1332);
  c.g = t <= 66.0
    ? 0.390 * log(t) - 0.632
    : 1.130 * pow(t - 60.0, -0.0755);
  c.b = t >= 66.0 ? 1.0
    : t <= 19.0 ? 0.0
    : 0.543 * log(t - 10.0) - 1.196;
  return clamp(c, 0.0, 5.0);
}

void main() {
  vec3 spherePos = uvToSphere(vUv);
  float s = fract(uSeed * 0.00000013) * 100.0;
  float sizeInv = 1.0 / max(uSize, 0.3);
  vec3 p = spherePos * uGranScale * sizeInv;

  /* Domain warping for organic convection cells */
  float qx = fbmd(p + vec3(s, s * 1.37, s * 0.71), uSlopeness).x;
  float qy = fbmd(p + vec3(s * 2.31, s * 0.53, s * 1.91), uSlopeness).x;
  float qz = fbmd(p + vec3(s * 3.17, s * 0.89, s * 2.43), uSlopeness).x;
  vec3 q = vec3(qx, qy, qz);

  float rx = fbmd(p + q * 0.8 + vec3(s * 0.17 + 1.7, s * 1.13 + 3.2, s * 0.61 + 4.5), uSlopeness).x;
  float ry = fbmd(p + q * 0.8 + vec3(s * 0.83 + 5.1, s * 0.29 + 7.8, s * 1.47 + 2.1), uSlopeness).x;
  float rz = fbmd(p + q * 0.8 + vec3(s * 0.39 + 8.3, s * 1.71 + 1.4, s * 0.57 + 6.7), uSlopeness).x;
  vec3 r = vec3(rx, ry, rz);

  float f = fbmd(p + r * 0.6 + vec3(s * 0.41 + 2.3), uSlopeness).x;

  float base = clamp(f * 1.2 + 0.5, 0.0, 1.0);
  float cellEdge = length(q) * uSpotAmp;
  float brightPatch = clamp(r.x * 0.6 + 0.5, 0.0, 1.0);

  float tempFactor = clamp(base - cellEdge * 0.8 + brightPatch * 0.4 - 0.15, 0.0, 1.0);
  tempFactor = tempFactor * tempFactor * (3.0 - 2.0 * tempFactor);
  float kelvin = mix(uLowTemp, uHighTemp, tempFactor);
  vec3 color = blackbodyRGB(kelvin);

  /* HDR emissive boost — only the hottest 25% of cells clip to white */
  float emissive = smoothstep(0.75, 1.0, tempFactor) * uEmissive;
  color *= (1.0 + emissive);

  fragColor = vec4(color, 1.0);
}
