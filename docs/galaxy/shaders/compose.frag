precision highp float;

uniform sampler2D uSpaceTexture;
uniform sampler2D uDistortionTexture;
uniform vec2 uBlackHolePosition;
uniform float uDistortionStrength;
uniform float uRGBShiftRadius;

varying vec2 vUv;

#define PI 3.1415926538

vec3 getRGBShiftedColor(sampler2D tex, vec2 uv, float radius) {
  vec3 angle = vec3(PI * 2.0 / 3.0, PI * 4.0 / 3.0, 0.0);
  vec3 color;
  color.r = texture2D(tex, uv + vec2(sin(angle.r), cos(angle.r)) * radius).r;
  color.g = texture2D(tex, uv + vec2(sin(angle.g), cos(angle.g)) * radius).g;
  color.b = texture2D(tex, uv + vec2(sin(angle.b), cos(angle.b)) * radius).b;
  return color;
}

void main() {
  float distortion = texture2D(uDistortionTexture, vUv).r;
  float intensity = distortion * uDistortionStrength;

  vec2 towardCenter = (vUv - uBlackHolePosition) * -intensity * 2.0;
  vec2 distortedUv = vUv + towardCenter;

  vec3 color = getRGBShiftedColor(uSpaceTexture, distortedUv, uRGBShiftRadius);
  gl_FragColor = vec4(color, 1.0);
}
