precision highp float;

uniform vec3 uColor;
uniform float uIntensity;
uniform float uTime;
uniform float uSeed;

in vec2 vUv;
in vec3 vWorldPos;
in float vNoise;

out vec4 fragColor;

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

float fbm3(vec3 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * gnoise(p);
    p *= 2.17;
    a *= 0.45;
  }
  return v;
}

void main() {
  float PI = 3.14159265;
  float s = fract(uSeed * 0.00000013) * 100.0;

  float ringAngle = vUv.x * 2.0 * PI;
  float tubeAngle = vUv.y * 2.0 * PI;

  /* Noise torus uses r=1 so frequency stays uniform pole-to-equator
     (real geometry has r=3.95 ≈ R, giving 160× frequency gradient) */
  vec3 noisePos = vec3(
    (4.0 + cos(tubeAngle)) * cos(ringAngle),
    sin(tubeAngle),
    (4.0 + cos(tubeAngle)) * sin(ringAngle)
  );

  float inner = -cos(tubeAngle);

  vec3 np = noisePos * 0.5 + vec3(s);

  /* Noisy pole boundary — smoothstep kills the hard max(0) cliff */
  float poleNoise = gnoise(np * 3.0 + vec3(uTime * 0.8, uTime * 0.5, uTime * -0.6));
  float noisyInner = inner + poleNoise * 0.2;
  float softPole = smoothstep(-0.15, 0.3, noisyInner);
  float poleGlow = pow(softPole, 1.8);
  float poleCore = pow(softPole, 5.0);
  float arc1 = fbm3(np + vec3(uTime * 0.06, 0.0, uTime * 0.04));
  float arc2 = fbm3(np * 1.7 + vec3(0.0, uTime * -0.05, uTime * 0.07));
  float arc3 = gnoise(np * 2.5 + vec3(uTime * 0.1, uTime * 0.06, 0.0));

  float ridges  = pow(1.0 - abs(arc1), 3.5) * 1.3;
  float ridges2 = pow(1.0 - abs(arc2), 4.0) * 0.9;
  float detail  = pow(1.0 - abs(arc3), 3.0) * 0.5;
  float pattern = ridges + ridges2 + detail;

  /* Tube falloff — arcs erupt from poles and mostly fade before reaching
     the outer equator. Softer curve + noise bridges let ~20% of arcs
     make it all the way across. */
  float outerRaw = smoothstep(-0.15, 0.8, inner);
  float bridgeNoise = gnoise(np * 0.8 + vec3(uTime * 0.12, 0.0, uTime * 0.09));
  float bridge = smoothstep(0.15, 0.55, bridgeNoise) * 0.65;
  float tubeFade = max(0.06, outerRaw + bridge);

  /* Many small spatial gates at high harmonics */
  float warp = gnoise(np * 0.5 + vec3(uTime * 0.08)) * 2.0;
  float wa = ringAngle + warp;
  float g1 = pow(max(0.0, sin(wa * 5.0 + uTime * 4.0)), 1.5);
  float g2 = pow(max(0.0, sin(wa * 7.0 - uTime * 3.0 + 1.3)), 1.5);
  float g3 = pow(max(0.0, sin(wa * 4.0 + uTime * 5.5 + 2.8)), 2.0);
  float g4 = pow(max(0.0, sin(wa * 6.0 - uTime * 2.5 + 4.1)), 2.0);
  float spatialGate = max(max(g1, g2), max(g3, g4));

  /* Global pulse — rapid, regular, never fully dark (floor 0.35) */
  float pulse = 0.35
    + sin(uTime * 6.0) * 0.2
    + sin(uTime * 10.0 + 1.5) * 0.12
    + pow(max(0.0, sin(uTime * 4.5)), 3.0) * 0.3;

  /* Pole energy — always present, rapid flicker on top */
  float poleBase = poleGlow * 1.5;
  float poleFlicker = poleCore * 2.5 * (0.7 + 0.3 * sin(uTime * 12.0));

  /* Zap crackle — heavy in mid-tube dissipation zone + poles */
  float dissipateZone = smoothstep(0.05, 0.4, outerRaw) * (1.0 - outerRaw * 0.6);
  float zapNoise = gnoise(np * 5.0 + vec3(uTime * 2.5, uTime * 1.8, uTime * -2.0));
  float zap = pow(max(0.0, zapNoise), 1.8);
  float zapGate = pow(max(0.0, sin(uTime * 20.0 + ringAngle * 6.0)), 2.0);
  float zap2 = pow(max(0.0, gnoise(np * 7.0 + vec3(uTime * -1.5, uTime * 2.8, uTime * 1.2))), 2.0);
  float zapGate2 = pow(max(0.0, sin(uTime * 28.0 + ringAngle * 5.0 + 1.5)), 2.0);
  float zapFlash = (zap * zapGate + zap2 * zapGate2) * 2.5 * max(poleGlow, max(dissipateZone, 0.15));

  /* Combine: ridges × tube falloff × ring gate × pulse + pole energy + crackle */
  float gatedPattern = pattern * tubeFade * mix(0.08, 1.0, spatialGate) * mix(0.55, 1.0, poleGlow);
  float brightness = (gatedPattern * pulse + poleBase + poleFlicker + zapFlash) * uIntensity;

  float alpha = smoothstep(0.06, 0.35, brightness) * 0.85;

  fragColor = vec4(uColor * brightness, alpha);
}
