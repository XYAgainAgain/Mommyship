precision highp float;

uniform vec3 uCameraPos;

out vec3 vRayOrigin;
out vec3 vRayDir;

void main() {
  vec4 worldPos = modelMatrix * vec4(position, 1.0);

  /* Camera -> local space for raymarch in box's -0.5 to 0.5 range */
  mat4 invModel = inverse(modelMatrix);
  vec3 localCam = (invModel * vec4(uCameraPos, 1.0)).xyz;

  vRayOrigin = localCam;
  vRayDir = normalize(position - localCam);

  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
