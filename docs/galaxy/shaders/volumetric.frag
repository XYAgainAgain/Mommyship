precision highp float;
precision highp sampler3D;

uniform sampler3D uVolume;
uniform float uTime;
uniform float uSeed;
uniform vec3  uColor;
uniform vec3  uColor2;
uniform float uDensity;
uniform float uAbsorption;
uniform float uBrightness;
uniform float uCameraDist;
uniform float uOpacity;

in vec3 vRayOrigin;
in vec3 vRayDir;

out vec4 fragColor;

/* Ray-sphere intersection for unit sphere centered at origin (radius 0.5) */
vec2 intersectSphere(vec3 origin, vec3 dir) {
  float b = dot(origin, dir);
  float c = dot(origin, origin) - 0.25;
  float disc = b * b - c;
  if (disc < 0.0) return vec2(1.0, -1.0);
  float sq = sqrt(disc);
  return vec2(-b - sq, -b + sq);
}

void main() {
  vec2 tHit = intersectSphere(vRayOrigin, vRayDir);
  tHit.x = max(tHit.x, 0.0);

  if (tHit.x > tHit.y) discard;

  /* 16–48 steps based on camera distance */
  int steps = int(mix(16.0, 48.0, smoothstep(800.0, 400.0, uCameraDist)));

  float rayLength = tHit.y - tHit.x;
  float stepSize = rayLength / float(steps);
  vec3 pos = vRayOrigin + vRayDir * tHit.x;

  float accumDensity = 0.0;
  vec3 accumColor = vec3(0.0);
  float t = uTime + uSeed * 100.0;

  for (int i = 0; i < 48; i++) {
    if (i >= steps) break;

    vec3 samplePos = pos + 0.5;

    /* Billowing warp: coprime frequencies, reduced Y to stay in-plane */
    vec3 warp;
    warp.x = sin(samplePos.y * 2.0 + t * 0.15)
           * cos(samplePos.z * 1.7 + t * 0.11) * 0.08;
    warp.y = sin(samplePos.z * 2.3 + t * 0.13)
           * cos(samplePos.x * 1.5 + t * 0.09) * 0.05;
    warp.z = sin(samplePos.x * 1.9 + t * 0.17)
           * cos(samplePos.y * 2.1 + t * 0.12) * 0.08;

    warp.x += sin(samplePos.z * 5.1 + t * 0.23) * 0.03;
    warp.y += cos(samplePos.x * 4.7 + t * 0.19) * 0.02;
    warp.z += sin(samplePos.y * 5.5 + t * 0.21) * 0.03;

    samplePos += warp;

    float density = texture(uVolume, samplePos).r;
    density = smoothstep(0.35, 0.75, density);

    /* Radial + Y edge fade: softens sphere boundary, keeps volumes flat in disk plane */
    float radialDist = length(pos * 2.0);
    float radialFade = 1.0 - smoothstep(0.5, 1.0, radialDist);
    float yEdge = 1.0 - smoothstep(0.3, 0.5, abs(pos.y * 2.0));
    density *= radialFade * yEdge;

    density *= uDensity;

    float transmittance = exp(-accumDensity);

    /* Center-to-edge color gradient */
    vec3 localColor = mix(uColor, uColor2, smoothstep(0.2, 0.8, radialDist));

    accumColor += localColor * density * transmittance * stepSize * uBrightness;
    accumDensity += density * stepSize;

    if (accumDensity > 4.0) break;

    pos += vRayDir * stepSize;
  }

  float alpha = 1.0 - exp(-accumDensity);

  /* Dark nebulae output a multiply tint; emission outputs additive color */
  if (uAbsorption > 0.5) {
    fragColor = vec4(mix(vec3(1.0), uColor, alpha * uOpacity), 1.0);
  } else {
    fragColor = vec4(accumColor, alpha * uOpacity);
  }
}
