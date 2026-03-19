precision highp float;

varying vec3 vColor;
varying float vBrightness;

void main() {
  float dist = length(gl_PointCoord - vec2(0.5));
  if (dist > 0.5) discard;
  float alpha = smoothstep(0.5, 0.1, dist) * vBrightness;
  gl_FragColor = vec4(vColor, alpha);
}
