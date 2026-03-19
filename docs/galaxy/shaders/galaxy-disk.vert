attribute float aSize;
attribute float aBrightness;
attribute float aRadius;

varying vec3 vColor;
varying float vBrightness;

uniform float uViewHeight;
uniform float uTime;

void main() {
  vColor = color;
  vBrightness = aBrightness;

  /* Rigid-body spin + core boost that decays before reaching arm territory */
  float coreBoost = 0.18 * exp(-aRadius * 0.05);
  float angularSpeed = 0.06 + 0.008 / (aRadius + 60.0) + coreBoost;
  float angle = uTime * angularSpeed;
  float cosA = cos(angle);
  float sinA = sin(angle);
  vec3 pos = position;
  pos.x = position.x * cosA - position.z * sinA;
  pos.z = position.x * sinA + position.z * cosA;

  vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = aSize * (uViewHeight / -mvPos.z);
  gl_PointSize = clamp(gl_PointSize, 0.5, 16.0);
  gl_Position = projectionMatrix * mvPos;
}
