varying vec3 vWorldDir;

void main() {
  /* World-space direction for FBM noise sampling in frag */
  vWorldDir = normalize(position);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
