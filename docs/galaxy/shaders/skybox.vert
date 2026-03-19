varying vec3 vWorldDir;

void main() {
  /* Pass world-space direction for equirectangular UV computation in frag */
  vWorldDir = normalize(position);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
