attribute float aSize;
attribute float aBrightness;
attribute float aPhase;

varying vec3 vColor;
varying float vBrightness;

uniform float uViewHeight;
uniform float uTime;

void main() {
  vColor = color;
  /* Twinkle via sin wave offset by per-particle phase */
  float twinkle = 0.7 + 0.3 * sin(uTime * 2.0 + aPhase * 6.2831);
  vBrightness = aBrightness * twinkle;
  vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = aSize * (uViewHeight / -mvPos.z);
  gl_Position = projectionMatrix * mvPos;
}
