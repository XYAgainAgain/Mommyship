attribute float aSize;
attribute float aBrightness;
attribute float aRadius;
attribute float aStretch;
attribute float aAngle;
attribute float aPhase;

varying vec3 vColor;
varying float vBrightness;
varying float vStretch;
varying float vAngle;
varying float vPhase;

uniform float uViewHeight;
uniform float uTime;

void main() {
  vColor = color;
  vBrightness = aBrightness;
  vStretch = aStretch;
  vAngle = aAngle;
  vPhase = aPhase;

  /* Differential rotation — lower coreBoost than disk stars (0.18 vs 0.30) so gas drifts slightly */
  float coreBoost = 0.18 * exp(-aRadius * 0.05);
  float angularSpeed = 0.06 + 0.008 / (aRadius + 60.0) + coreBoost;
  float angle = uTime * angularSpeed;
  float cosA = cos(angle);
  float sinA = sin(angle);
  vec3 pos = position;
  pos.x = position.x * cosA - position.z * sinA;
  pos.z = position.x * sinA + position.z * cosA;

  vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
  /* Scale by inverse stretch to ensure the ellipse fits within the point sprite */
  gl_PointSize = aSize * (uViewHeight / -mvPos.z) / aStretch;
  gl_PointSize = clamp(gl_PointSize, 1.0, 200.0);
  gl_Position = projectionMatrix * mvPos;
}
