/* Shared noise functions for galaxy procedural shaders.
   Injected into planet/star shaders via @include marker replacement. */

#define PI 3.14159265359

vec3 uvToSphere(vec2 uv) {
  float theta = uv.x * 2.0 * PI;
  float phi = (1.0 - uv.y) * PI;
  float sp = sin(phi);
  return vec3(sp * cos(theta), cos(phi), sp * sin(theta));
}

vec3 hash33(vec3 p) {
  p = vec3(dot(p, vec3(127.1, 311.7, 74.7)),
           dot(p, vec3(269.5, 183.3, 246.1)),
           dot(p, vec3(113.5, 271.9, 124.6)));
  return fract(sin(p) * 43758.5453) * 2.0 - 1.0;
}

/* 3D gradient noise with analytical derivatives */
vec4 gnoised(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  vec3 u = f * f * (3.0 - 2.0 * f);
  vec3 du = 6.0 * f * (1.0 - f);

  float n000 = dot(hash33(i), f);
  float n100 = dot(hash33(i + vec3(1, 0, 0)), f - vec3(1, 0, 0));
  float n010 = dot(hash33(i + vec3(0, 1, 0)), f - vec3(0, 1, 0));
  float n110 = dot(hash33(i + vec3(1, 1, 0)), f - vec3(1, 1, 0));
  float n001 = dot(hash33(i + vec3(0, 0, 1)), f - vec3(0, 0, 1));
  float n101 = dot(hash33(i + vec3(1, 0, 1)), f - vec3(1, 0, 1));
  float n011 = dot(hash33(i + vec3(0, 1, 1)), f - vec3(0, 1, 1));
  float n111 = dot(hash33(i + vec3(1, 1, 1)), f - vec3(1, 1, 1));

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

/* FBM with analytical derivatives — slopeness suppresses amplitude at steep slopes */
vec4 fbmd(vec3 p, float slopeness) {
  float v = 0.0, a = 0.5;
  vec3 derivative = vec3(0.0);
  float freq = 1.0;
  for (int i = 0; i < 4; i++) {
    vec4 n = gnoised(p);
    n.x /= (1.0 + slopeness * dot(derivative, derivative));
    v += a * n.x;
    derivative += a * n.yzw * freq;
    freq *= 2.17;
    p *= 2.17;
    a *= 0.45;
  }
  return vec4(v, derivative);
}

/* Value-only FBM — cheaper, no derivative tracking */
float fbm(vec3 p, float slopeness) {
  float v = 0.0, a = 0.5, slopeAccum = 0.0;
  for (int i = 0; i < 4; i++) {
    vec4 n = gnoised(p);
    n.x /= (1.0 + slopeness * slopeAccum);
    v += a * n.x;
    slopeAccum += dot(n.yzw, n.yzw) * a * a;
    p *= 2.17;
    a *= 0.45;
  }
  return v;
}

/* Ridged FBM — sharp crests via folded noise, weight feedback so small
   waves ride on large ones. Returns 0–~1.2 (can overshoot slightly).
   Fixed upper bound loop for mobile WebGL2 driver portability. */
float ridgedFbm(vec3 p, float freq, float lacunarity, int octaves) {
  float sum = 0.0, amp = 0.5, weight = 1.0;
  for (int i = 0; i < 6; i++) {
    if (i >= octaves) break;
    float n = 1.0 - abs(gnoised(p * freq).x);
    n *= n;
    n *= weight;
    weight = clamp(n * 2.0, 0.0, 1.0);
    sum += n * amp;
    freq *= lacunarity;
    amp *= 0.45;
  }
  return sum;
}

/* Single Gerstner wave on a unit sphere. Phase uses dot(dir, sp) so wave
   fronts are great circles perpendicular to dir. Tangent-plane projection
   makes waves naturally fade at the direction's poles. Returns vec4(height,
   tangent-plane derivative.xyz) with analytic gradient — no finite differences.
   Steepness amplifies the normal beyond geometric height, faking the horizontal
   displacement that real Gerstner does via vertex push. */
vec4 gerstnerWave(vec3 sp, vec3 dir, float freq, float amp, float steep, float phase) {
  float dp = dot(dir, sp);
  float f = freq * dp + phase;
  float height = amp * sin(f);
  vec3 tangentDir = dir - dp * sp;
  vec3 deriv = amp * freq * cos(f) * (1.0 + steep) * tangentDir;
  return vec4(height, deriv);
}

/* Kelvin temperature to RGB — Tanner Helland algorithm, HDR uncapped to 5.0 */
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

/* 3D Voronoi — returns vec3(F1, F2, cellId)
   F1 = distance to nearest cell center, F2 = second nearest.
   F2-F1 gives edge distance (small at edges, large inside cells). */
vec3 voronoi3(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  float F1 = 1e5, F2 = 1e5;
  float id = 0.0;
  for (int x = -1; x <= 1; x++)
  for (int y = -1; y <= 1; y++)
  for (int z = -1; z <= 1; z++) {
    vec3 g = vec3(float(x), float(y), float(z));
    vec3 o = hash33(i + g) * 0.5 + 0.5;
    vec3 r = g + o - f;
    float d = dot(r, r);
    if (d < F1) {
      F2 = F1;
      F1 = d;
      id = dot(i + g, vec3(7.0, 157.0, 113.0));
    } else if (d < F2) {
      F2 = d;
    }
  }
  return vec3(sqrt(F1), sqrt(F2), id);
}
