#define PI 3.1415926538

uniform float uTime;
uniform float uViewHeight;
uniform float uSize;
uniform vec3 uInnerColor;
uniform vec3 uOuterColor;

attribute float aProgress;
attribute float aSize;
attribute float aRandom;

varying vec3 vColor;

void main() {
  float concentration = 0.05;
  float outerProgress = smoothstep(0.0, 1.0, aProgress);
  outerProgress = mix(concentration, outerProgress, pow(aRandom, 1.7));
  float radius = 6.0 + outerProgress * 24.0;

  float angle = outerProgress - uTime * (1.0 - outerProgress) * 3.0;
  vec3 newPosition = vec3(sin(angle) * radius, 0.0, cos(angle) * radius);

  vec4 mvPos = modelViewMatrix * vec4(newPosition, 1.0);
  gl_Position = projectionMatrix * mvPos;

  gl_PointSize = aSize * uSize * uViewHeight;
  gl_PointSize *= (1.0 / -mvPos.z);

  vColor = mix(uInnerColor, uOuterColor, outerProgress);
}
