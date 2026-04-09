precision highp float;

uniform float uA;
uniform float uE;
/* Precomputed rotation from perifocal → ecliptic (Y-up) via Ω, ω, i.
   Avoids 6 trig calls per vertex for values that are uniform-constant. */
uniform mat3 uOrbitMat;

/* Trail animation — body's current parametric position (0–1 around orbit) */
uniform float uTrailStart;

out float vTrailPos;

const float PI2 = 6.283185307179586;

void main() {
  float t = position.x;
  float E = t * PI2;

  float b = sqrt(max(0.0, 1.0 - uE * uE));
  float px = uA * (cos(E) - uE);
  float py = uA * b * sin(E);

  vec3 pos = uOrbitMat * vec3(px, py, 0.0);

  /* 0 = body's position (brightest), increases going backward along trail */
  vTrailPos = mod(uTrailStart - t + 1.0, 1.0);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
