precision highp float;

uniform float uDomeHeight;

varying vec2 vUv;

void main() {
  vUv = uv;

  /* Parabolic dome: peaks at center, zero at edges */
  float r = length(position.xz) * 2.0;
  vec3 pos = position;
  pos.y += uDomeHeight * max(0.0, 1.0 - r * r);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
