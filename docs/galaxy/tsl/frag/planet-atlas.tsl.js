// Three.js Transpiler r183

import { abs, add, Break, clamp, cos, div, dot, exp, float, floor, Fn, fract, If, increment, int, log, Loop, max, mix, mul, negate, normalize, pow, property, select, sin, smoothstep, sqrt, sub, texture, uniform, uv, varyingProperty, vec2, vec3, vec4 } from 'three/tsl';

const vUv = varyingProperty( 'vec2', 'vUv' );
const vCrossfade = varyingProperty( 'float', 'vCrossfade' );
const vInstanceColor = varyingProperty( 'vec3', 'vInstanceColor' );
const vLightDir = varyingProperty( 'vec3', 'vLightDir' );
const vLocalPos = varyingProperty( 'vec3', 'vLocalPos' );
const vChurn = varyingProperty( 'float', 'vChurn' );
const vViewDir = varyingProperty( 'vec3', 'vViewDir' );
const vAtmosphere = varyingProperty( 'vec4', 'vAtmosphere' );
const vLayer = varyingProperty( 'float', 'vLayer' );

export const uAtlas = texture( null );
export const uTime = uniform( float( 0 ) );

import {
	uvToSphere, hash33, gnoised, fbmd, fbm, ridgedFbm, gerstnerWave, blackbodyRGB,
	craterHash33, craterNoise, craterFbm, voronoi3, distMetric3D,
	cellNoise3D, cellNoise3DDelta, crystals3D, crystals3DDelta
} from '../glsl/noise-common.tsl.js';
/* Inline noise-common copies removed — now imported from ../glsl/noise-common.tsl.js */

export const main = /*@__PURE__*/ Fn( () => {

	/* DEBUG — bright green to test planet atlas pipeline */
	return vec4( 0.0, 1.0, 0.0, 1.0 );

	const N = normalize( vLocalPos );

	/* Geometry UVs — seamless because SphereGeometry has duplicate verts at the
	     back meridian, and the baked texture wraps (RepeatWrapping on X).
	     Stars use this exact approach with zero seams. */

	const uv = vUv.toVar();

	/* Animated surface churn for ocean/gas — gradient noise in 3D sphere space.
	     Using noise derivatives as displacement gives curl-like motion where each
	     point moves independently, creating roiling instead of latitude-band shearing. */

	If( vChurn.greaterThan( 0.01 ), () => {

		const t = uTime.mul( 0.3 );
		const cs = fract( vLayer.mul( 0.4327 ) ).mul( 6.2832 );
		const sp = N;
		const n = gnoised( sp.mul( 3.0 ).add( vec3( t.mul( 0.7 ).add( cs ), t.mul( 0.3 ), t.negate().mul( 0.5 ) ) ) );
		uv.x.addAssign( n.y.mul( 0.06 ).mul( vChurn ) );
		uv.y.addAssign( n.z.mul( 0.03 ).mul( vChurn ) );

	} );

	const texel = uAtlas.sample( vec3( uv, vLayer ) );
	const texColor = texel.rgb;

	/* Star-facing hemispherical lighting — wrap-light matches detail shader */

	const L = normalize( vLightDir );
	const V = normalize( vViewDir );
	const NdotL_raw = dot( N, L );
	const NdotL = max( 0.0, NdotL_raw.mul( 0.65 ).add( 0.35 ) );

	/* Alpha-driven shininess — approximates detail shader's per-subtype roughness */

	const H = normalize( L.add( V ) );
	const NdotH = max( 0.0, dot( N, H ) );
	const shininess = mix( 4.0, 64.0, texel.a );
	const spec = texel.a.mul( pow( NdotH, shininess ) ).mul( 0.5 );
	const litColor = texColor.mul( NdotL ).add( vec3( spec ) );
	const surfaceColor = mix( vInstanceColor, litColor, vCrossfade ).toVar();

	/* Fresnel rim atmosphere — 3-layer with tight bright limb, sun-masked */

	const NdotV_rim = max( 0.0, dot( N, normalize( vViewDir ) ) );
	const rimEdge = sub( 1.0, NdotV_rim );
	const rim = pow( rimEdge, 24.0 ).mul( 1.0 ).add( pow( rimEdge, 8.0 ).mul( 0.5 ) ).add( pow( rimEdge, 3.0 ).mul( 0.15 ) );
	const sunMask = smoothstep( - 0.2, 0.5, dot( N, L ) );
	const atmoDensity = vAtmosphere.w;

	/* Minimum reflected-light rim even on airless bodies */

	const rimGlow = atmoDensity.mul( rim ).mul( add( 0.15, sunMask.mul( 0.85 ) ) ).toVar();
	rimGlow.assign( max( rimGlow, pow( rimEdge, 10.0 ).mul( 0.06 ).mul( sunMask ) ) );
	surfaceColor.addAssign( vAtmosphere.xyz.mul( rimGlow ).mul( vCrossfade ) );
	return vec4( surfaceColor, 1.0 );

} );