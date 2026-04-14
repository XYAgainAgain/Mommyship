// Three.js Transpiler r183

// distortion-common.vert applies the full MVP transform:
//   gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0)
// This is exactly what NodeMaterial does by default — no positionNode override is needed.
//
// The vUv varying was a pure pass-through of uv — fragment shaders use uv() directly.
//
// WIRING NOTE: no exports needed from this file. Both distortion materials (activeMat,
// maskMat) use the default NodeMaterial vertex transform. No positionNode assignment.
