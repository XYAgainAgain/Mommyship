precision highp float;

uniform float uTrailLength;
uniform float uAttenuate;
uniform float uLucency;
uniform float uTracked;
uniform vec3  uColor;
uniform float uDashed;

in float vTrailPos;

out vec4 fragColor;

void main() {
  if (vTrailPos > uTrailLength) discard;

  float p = vTrailPos / max(uTrailLength, 0.001);

  /* THRASTRO-style exponential trail fade from body position backward */
  float alpha = pow(exp(-p * uAttenuate), 2.0) * uLucency;

  /* Soft cutoff at trail end so it doesn't terminate abruptly */
  alpha *= 1.0 - smoothstep(0.85, 1.0, p);

  /* Tracked orbit pops, siblings recede */
  alpha *= mix(0.55, 1.0, step(0.5, uTracked));

  /* GPU-side dash pattern for moon-depth orbits */
  if (uDashed > 0.5) {
    if (fract(vTrailPos * 40.0) > 0.55) discard;
  }

  fragColor = vec4(uColor, alpha);
}
