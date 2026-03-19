precision highp float;

uniform float uTime;
varying vec3 vWorldDir;

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

float fbm(vec2 p) {
  float val = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 5; i++) {
    val += amp * noise(p);
    p *= 2.0;
    amp *= 0.5;
  }
  return val;
}

void main() {
  vec3 dir = normalize(vWorldDir);
  vec2 uv1 = dir.xy * 3.0;
  vec2 uv2 = dir.yz * 3.0;

  float n1 = fbm(uv1 + vec2(uTime * 0.008, uTime * 0.005));
  float n2 = fbm(uv2 + vec2(-uTime * 0.006, uTime * 0.009));
  float nebula = n1 * n2;

  /* Pure black base with very faint purply-indigo wisps */
  vec3 purplyBlack = vec3(0.012, 0.012, 0.027);
  vec3 indigoWisp  = vec3(0.06, 0.03, 0.12);
  vec3 color = mix(vec3(0.0), purplyBlack, 0.8) + indigoWisp * nebula * 0.25;

  gl_FragColor = vec4(color, 1.0);
}
