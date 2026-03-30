/* Per-instance attributes (from InstancedBufferAttribute) */
attribute vec3 aOffset;
attribute float aScale;
attribute float aTimeOffset;
attribute float aRadius;
attribute float aTint;

uniform float uTime;
uniform float uColumns;
uniform float uRows;
uniform float uTotalFrames;
uniform float uFPS;

varying vec2 vUv;
varying float vTint;
varying float vRadius;
varying vec2 vCanonicalXZ;

void main() {
  /* Differential rotation — matches disk.js core boost (0.30) */
  float coreBoost = 0.30 * exp(-aRadius * 0.05);
  float angularSpeed = 0.06 + 0.008 / (aRadius + 60.0) + coreBoost;
  float angle = uTime * angularSpeed;
  float cosA = cos(angle);
  float sinA = sin(angle);
  vec3 worldPos = aOffset;
  worldPos.x = aOffset.x * cosA - aOffset.z * sinA;
  worldPos.z = aOffset.x * sinA + aOffset.z * cosA;

  /* Billboard: extract camera right/up from view matrix */
  vec3 camRight = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
  vec3 camUp    = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);

  /* position.xy is the quad corner (-0.5 to 0.5 from PlaneGeometry) */
  vec3 billboarded = worldPos
    + camRight * position.x * aScale
    + camUp    * position.y * aScale;

  /* Sprite sheet UV animation */
  float frame = mod(floor((uTime + aTimeOffset) * uFPS), uTotalFrames);
  float col = mod(frame, uColumns);
  float row = floor(frame / uColumns);
  vUv.x = (col + uv.x) / uColumns;
  vUv.y = 1.0 - (row + (1.0 - uv.y)) / uRows;

  vTint = aTint;
  vRadius = aRadius;
  vCanonicalXZ = aOffset.xz;

  gl_Position = projectionMatrix * viewMatrix * vec4(billboarded, 1.0);
}
