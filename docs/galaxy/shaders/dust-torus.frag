precision highp float;
precision highp sampler3D;

uniform sampler3D uVolume;
uniform sampler2D uLightmap;
uniform float uTime;
uniform float uCameraDist;
uniform float uOpacity;

uniform vec3  uBoxScale;
uniform float uMajorR;
uniform float uMinorR;
uniform float uYSquash;

uniform float uLightmapAngle;
uniform vec3  uBaseColor;
uniform float uDensityScale;

uniform float uNoiseScale;
uniform float uNoiseStrength;
uniform float uWarpScale;
uniform float uSeed;

uniform float uMinSteps;
uniform float uMaxSteps;

in vec3 vRayOrigin;
in vec3 vRayDir;

out vec4 fragColor;

vec2 intersectBox(vec3 origin, vec3 dir) {
  vec3 inv = 1.0 / dir;
  vec3 t0 = (-0.5 - origin) * inv;
  vec3 t1 = ( 0.5 - origin) * inv;
  vec3 mn = min(t0, t1);
  vec3 mx = max(t0, t1);
  return vec2(max(max(mn.x, mn.y), mn.z),
              min(min(mx.x, mx.y), mx.z));
}

float torusSDF(vec3 p) {
  vec3 q = vec3(p.x, p.y / uYSquash, p.z);
  vec2 t = vec2(length(q.xz) - uMajorR, q.y);
  return length(t) - uMinorR;
}

void main() {
  vec2 tHit = intersectBox(vRayOrigin, vRayDir);
  tHit.x = max(tHit.x, 0.0);

  if (tHit.x > tHit.y) discard;

  int steps = int(mix(uMinSteps, uMaxSteps, smoothstep(1200.0, 400.0, uCameraDist)));

  float rayLength = tHit.y - tHit.x;
  float stepSize = rayLength / float(steps);
  vec3 pos = vRayOrigin + vRayDir * tHit.x;

  float accumDensity = 0.0;
  vec3 accumColor = vec3(0.0);

  float ca = cos(uLightmapAngle);
  float sa = sin(uLightmapAngle);

  float worldStep = stepSize * length(uBoxScale) * 2.0;

  /* Jitter ray start to break up banding at grazing angles */
  float jitter = fract(sin(dot(vRayOrigin.xz, vec2(12.9898, 78.233))) * 43758.5453);
  pos += vRayDir * stepSize * jitter;

  float warpT = uTime * 0.03 + uSeed * 50.0;

  for (int i = 0; i < 32; i++) {
    if (i >= steps) break;

    vec3 worldPos = pos * uBoxScale * 2.0;

    /* Spiral-following warp with counter-rotating layers */
    float rad = length(worldPos.xz);
    float theta = atan(worldPos.z, worldPos.x);
    float spiralPhase = -5.0 * log(rad / 10.0 + 1.0);
    float ws = uWarpScale;

    vec3 warped = worldPos;
    /* Layer 1: follows spiral structure, rotates with it */
    float s1 = sin(spiralPhase + theta * 2.0 + warpT) * 6.0 * ws;
    float c1 = cos(spiralPhase + theta * 2.0 + warpT * 0.7) * 6.0 * ws;
    /* Layer 2: counter-rotating for turbulence */
    float s2 = sin(spiralPhase * 0.7 - theta * 1.5 + warpT * 1.3) * 4.0 * ws;
    float c2 = cos(spiralPhase * 0.7 - theta * 1.5 + warpT * 0.9) * 4.0 * ws;
    /* Layer 3: radial ripple */
    float s3 = sin(rad * 0.04 + warpT * 0.5) * 3.0 * ws;
    float c3 = cos(rad * 0.035 + warpT * 0.6) * 3.0 * ws;

    warped.x += s1 + s2 + s3;
    warped.z += c1 + c2 + c3;

    float d = torusSDF(warped);

    if (d < 0.0) {
      float coreDist = clamp(-d / uMinorR, 0.0, 1.0);

      /* Edge gradient: smooth falloff near torus boundary */
      float edgeFade = smoothstep(0.0, 0.4, coreDist);
      float density = edgeFade;

      /* 3D noise — higher smoothstep threshold for sparser, patchier structure */
      if (uNoiseStrength > 0.01) {
        vec3 noiseCoord = warped * uNoiseScale * 0.01 + vec3(uSeed * 100.0);
        noiseCoord.xz += vec2(sin(warpT * 1.7), cos(warpT * 1.3)) * 2.0;
        float noise = texture(uVolume, noiseCoord).r;
        noise = smoothstep(0.38, 0.78, noise);
        density *= mix(1.0, noise, uNoiseStrength);
      }

      density *= uDensityScale;

      /* Lightmap illumination (unwarped position for stable light tracking) */
      vec2 galaxyXZ = vec2(worldPos.x * ca - worldPos.z * sa,
                           worldPos.x * sa + worldPos.z * ca);
      vec2 lmUV = galaxyXZ / 1000.0 + 0.5;
      vec3 illum = texture(uLightmap, lmUV).rgb;

      float illumBright = dot(illum, vec3(0.299, 0.587, 0.114));
      vec3 dustColor = mix(uBaseColor * 0.25,
                           illum + uBaseColor * 0.25,
                           smoothstep(0.02, 0.15, illumBright));

      float scaledDensity = density * 0.006;

      float transmittance = exp(-accumDensity);
      accumColor += dustColor * scaledDensity * transmittance * worldStep;
      accumDensity += scaledDensity * worldStep;

      if (accumDensity > 3.0) break;
    }

    pos += vRayDir * stepSize;
  }

  float alpha = 1.0 - exp(-accumDensity);
  fragColor = vec4(accumColor, alpha * uOpacity);
}
