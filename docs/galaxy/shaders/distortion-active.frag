precision highp float;

varying vec2 vUv;

float inverseLerp(float v, float minVal, float maxVal) {
  return (v - minVal) / (maxVal - minVal);
}

void main() {
  float dist = length(vUv - 0.5);
  /* 0.15 matches masshole — steep gradient so inner disk falls in high-distortion zone */
  float strength = clamp(inverseLerp(dist, 0.15, 0.0), 0.0, 1.0);
  strength = smoothstep(0.0, 1.0, strength);
  /* Fully opaque — primes the entire distortion RT as a base layer.
     The mask plane then sculpts it into a disc shape via alpha blending. */
  gl_FragColor = vec4(strength, 1.0, 1.0, 1.0);
}
