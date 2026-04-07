precision highp float;
precision highp sampler2DArray;

uniform sampler2DArray uAtlas;

in vec2 vUv;
flat in float vLayer;
in float vCrossfade;
in vec3 vInstanceColor;

out vec4 fragColor;

void main() {
  vec3 texColor = texture(uAtlas, vec3(vUv, vLayer)).rgb;
  vec3 color = mix(vInstanceColor, texColor, vCrossfade);
  fragColor = vec4(color, 1.0);
}
