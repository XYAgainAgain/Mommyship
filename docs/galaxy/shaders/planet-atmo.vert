precision highp float;

uniform mat3 uCloudRotation;

out vec3 vNormal;
out vec3 vSphereNormal;
out vec3 vViewDir;
out vec3 vWorldPos;
out vec3 vLocalPos;

void main() {
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vWorldPos = worldPos.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  /* Analytical sphere normal — smoother than the mesh normal attribute at low tessellation */
  vSphereNormal = normalize(mat3(modelMatrix) * normalize(position.xyz));
  vViewDir = normalize(cameraPosition - worldPos.xyz);
  vLocalPos = uCloudRotation * normalize(position);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
