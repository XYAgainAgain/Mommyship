precision highp float;

/* Custom per-instance attributes (instanceMatrix/instanceColor injected by Three.js) */
in float aLayer;
in float aCrossfade;

uniform float uVisualScale;

out vec2 vUv;
flat out float vLayer;
out float vCrossfade;
out vec3 vInstanceColor;

void main() {
  vUv = uv;
  vLayer = aLayer;
  vCrossfade = aCrossfade;
  vInstanceColor = instanceColor;
  /* Shrink vertex positions so the rendered star is smaller than the raycast hitbox */
  gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position * uVisualScale, 1.0);
}
