#define PI 3.1415926538

uniform float uTime;
uniform float uViewHeight;
uniform float uSize;

attribute float aProgress;
attribute float aSize;
attribute float aRandom;

varying vec3 vColor;

void main() {
  float concentration = 0.05;
  float outerProgress = smoothstep(0.0, 1.0, aProgress);
  outerProgress = mix(concentration, outerProgress, pow(aRandom, 1.7));
  float radius = 6.0 + outerProgress * 24.0;

  float angle = outerProgress - uTime * (1.0 - outerProgress) * 3.0;
  vec3 newPosition = vec3(sin(angle) * radius, 0.0, cos(angle) * radius);

  vec4 mvPos = modelViewMatrix * vec4(newPosition, 1.0);
  gl_Position = projectionMatrix * mvPos;

  gl_PointSize = aSize * uSize * uViewHeight;
  gl_PointSize *= (1.0 / -mvPos.z);

  /* Use aRandom as a per-particle hash for color variety */
  float hash = fract(aRandom * 127.1 + aProgress * 311.7);

  /* Disk gradient as base */
  vec3 c0 = vec3(1.0, 0.90, 0.97);
  vec3 c1 = vec3(0.95, 0.30, 0.60);
  vec3 c2 = vec3(0.12, 0.30, 0.55);
  vec3 c3 = vec3(0.51, 0.20, 0.67);
  vec3 c4 = vec3(0.80, 0.65, 0.30);
  vColor = mix(c0, c1, smoothstep(0.0, 0.15, outerProgress));
  vColor = mix(vColor, c2, smoothstep(0.15, 0.35, outerProgress));
  vColor = mix(vColor, c3, smoothstep(0.35, 0.60, outerProgress));
  vColor = mix(vColor, c4, smoothstep(0.60, 0.90, outerProgress));

  /* Star colors for streaking variety */
  vec3 brightWhite = vec3(1.0, 1.0, 1.0);
  vec3 warmGold    = vec3(1.0, 0.93, 0.59);
  vec3 coolBlue    = vec3(0.67, 0.75, 1.0);
  vec3 dimOrange   = vec3(1.0, 0.60, 0.36);
  vec3 debrisGrey  = vec3(0.35, 0.32, 0.30);

  /* Inner zone (0–0.2): 40% become bright white/gold streaks */
  if (outerProgress < 0.2) {
    if (hash < 0.25) vColor = brightWhite;
    else if (hash < 0.40) vColor = warmGold;
  }
  /* Teal/indigo zone (0.2–0.6): 50% become varied star colors */
  else if (outerProgress < 0.6) {
    if (hash < 0.15) vColor = brightWhite;
    else if (hash < 0.25) vColor = coolBlue;
    else if (hash < 0.35) vColor = warmGold;
    else if (hash < 0.42) vColor = dimOrange;
    else if (hash < 0.50) vColor = c1;
  }
  /* Outer zone (0.6–1.0): some debris grey, some dim stars */
  else {
    if (hash < 0.20) vColor = debrisGrey;
    else if (hash < 0.30) vColor = dimOrange * 0.6;
    else if (hash < 0.38) vColor = coolBlue * 0.5;
  }
}
