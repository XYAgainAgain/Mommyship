precision highp float;

uniform float uOpacity;

varying vec3 vColor;

void main() {
  float dist = length(gl_PointCoord - vec2(0.5));
  if (dist > 0.5) discard;

  gl_FragColor = vec4(vColor, 0.5 * uOpacity);
}
