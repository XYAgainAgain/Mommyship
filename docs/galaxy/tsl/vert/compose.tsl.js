// Three.js Transpiler r183

// compose.vert is a raw clip-space passthrough: gl_Position = vec4(position, 1.0).
// No projection matrix is applied. In the TSL migration this vertex shader has no logic
// to export — the fullscreen quad (PlaneGeometry 2x2) should be rendered with an
// OrthographicCamera(-1, 1, 1, -1) using NodeMaterial's default transform, OR the
// compositor should switch to WebGPURenderer's built-in post-processing stack which
// handles fullscreen quads natively.
//
// The vUv varying was a pure pass-through of uv — the fragment shader uses uv() directly.
//
// WIRING NOTE: no positionNode override is needed if the ortho camera and PlaneGeometry(2,2)
// are kept as-is. The default NodeMaterial MVP with that camera is a no-op in clip space.
