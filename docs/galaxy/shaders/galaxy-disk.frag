precision highp float;

varying vec3 vColor;
varying float vBrightness;

void main() {
  float dist = length(gl_PointCoord - vec2(0.5));
  if (dist > 0.5) discard;

  /* Defined bright center that reads as a star, not a blob */
  float core = smoothstep(0.3, 0.05, dist);
  float glow = smoothstep(0.5, 0.15, dist) * 0.2;
  float alpha = (core + glow) * vBrightness;

  gl_FragColor = vec4(vColor, alpha);
}
