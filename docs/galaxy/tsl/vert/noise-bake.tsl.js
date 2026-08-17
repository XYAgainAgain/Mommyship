/* Fullscreen bake quad — passes UV to fragment stage.
   NodeMaterial default MVP handles gl_Position for the bake ortho camera. */

// Three.js TSL r183

// No vertex Fn needed — the default transform is correct for a
// PlaneGeometry(-1,-1,2,2) bake quad with an ortho(-1,1,1,-1) camera.
// Fragment stage reads uv() directly instead of routing through a varying.

// Wire to NodeMaterial:
//   No vertexNode or positionNode assignment needed.
