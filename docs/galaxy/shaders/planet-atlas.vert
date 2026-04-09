precision highp float;

in float aLayer;
in float aCrossfade;
in vec3 aLightDir;
in float aChurn;
in vec4 aAtmosphere;

uniform float uVisualScale;

out vec2 vUv;
flat out float vLayer;
out float vCrossfade;
out vec3 vInstanceColor;
out vec3 vLightDir;
out vec3 vLocalPos;
out float vChurn;
flat out vec4 vAtmosphere;
out vec3 vViewDir;

void main() {
  vUv = uv;
  vLayer = aLayer;
  vCrossfade = aCrossfade;
  vInstanceColor = instanceColor;
  vLocalPos = position;
  vChurn = aChurn;
  vAtmosphere = aAtmosphere;

  /* Transform world-space light direction into the instance's rotated local frame
     so lighting stays star-facing as the mesh spins on its axis */
  mat3 instanceRot = mat3(instanceMatrix);
  vLightDir = transpose(instanceRot) * aLightDir;

  vec4 worldPos = instanceMatrix * vec4(position * uVisualScale, 1.0);
  vViewDir = normalize(cameraPosition - worldPos.xyz);

  gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position * uVisualScale, 1.0);
}
