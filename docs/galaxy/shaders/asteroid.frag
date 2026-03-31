precision highp float;

uniform sampler2D uSpriteSheet;
uniform sampler2D uLightmap;

varying vec2 vUv0;
varying vec2 vUv1;
varying float vBlend;
varying float vTint;
varying float vRadius;
varying vec2 vCanonicalXZ;

void main() {
  /* Cross-fade between current and next sprite frame */
  vec4 tex = mix(texture2D(uSpriteSheet, vUv0), texture2D(uSpriteSheet, vUv1), vBlend);
  if (tex.a < 0.35) discard;

  /* Sample galactic lightmap at canonical position (+-500 map units -> 0-1 UV) */
  vec2 lmUV = vCanonicalXZ / 1000.0 + 0.5;
  vec3 illum = texture2D(uLightmap, lmUV).rgb;

  float illumBright = dot(illum, vec3(0.299, 0.587, 0.114));
  vec3 baseTint = vec3(0.78, 0.72, 0.88);
  vec3 tint = mix(baseTint * 0.4, illum + baseTint * 0.15, smoothstep(0.02, 0.15, illumBright));

  vec3 color = tex.rgb * tint * vTint;

  /* Subtle rim brightening at silhouette edges — scattered galactic light */
  float rimFade = smoothstep(0.35, 0.6, tex.a);
  vec3 rimColor = illum * 0.25 + baseTint * 0.12;
  color = mix(rimColor + color * 0.5, color, rimFade);

  gl_FragColor = vec4(color, 1.0);
}
