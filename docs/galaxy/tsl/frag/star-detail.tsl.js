// Three.js Transpiler r183

import { abs, add, clamp, cos, cross, div, dot, float, floor, Fn, fract, length, log, Loop, mat3, max, mix, mul, normalize, pow, select, sin, smoothstep, sqrt, sub, uniform, varyingProperty, vec3, vec4 } from 'three/tsl';

const vLocalPos = varyingProperty( 'vec3', 'vLocalPos' );
const vNormal = varyingProperty( 'vec3', 'vNormal' );
const vViewDir = varyingProperty( 'vec3', 'vViewDir' );

/* Shared across all detail instances */
export const uTime = uniform( float( 0 ) );

/* Per-instance uniforms accepted as parameters for multi-instance pool rendering */

import { hash33, gnoised, blackbodyRGB } from '../glsl/noise-common.tsl.js';

/* hash33 and gnoised imported from shared noise-common — removed inline copies.
   fbm/fbmd below are star-detail-specific (3-param time-aware variants). */

/* Inline noise-common copies removed — now imported from ../glsl/noise-common.tsl.js */

/* Value-only FBM — slopeness + time rotation, skips derivative accumulation */

export const fbm = /*@__PURE__*/ Fn( ( [ p_immutable, slopeness, time ] ) => {

	const p = p_immutable.toVar();
	const v = float( 0.0 ).toVar(), a = float( 0.5 ).toVar(), slopeAccum = float( 0.0 ).toVar();

	Loop( { start: 0, end: 4 }, ( { i } ) => {

		const angle = time.mul( add( 0.008, mul( 0.003, float( i ) ) ) );
		const sa = sin( angle ), ca = cos( angle );
		const rp = vec3( p.x.mul( ca ).sub( p.z.mul( sa ) ), p.y, p.x.mul( sa ).add( p.z.mul( ca ) ) );
		const n = gnoised( rp );
		const nx = n.x.div( add( 1.0, slopeness.mul( slopeAccum ) ) );
		v.addAssign( a.mul( nx ) );
		slopeAccum.addAssign( dot( n.yzw, n.yzw ).mul( a ).mul( a ) );
		p.mulAssign( 2.17 );
		a.mulAssign( 0.45 );

	} );

	return v;

} );

/* Full FBM with derivative output — only needed for the final call (normal perturbation) */

export const fbmd = /*@__PURE__*/ Fn( ( [ p_immutable, slopeness, time ] ) => {

	const p = p_immutable.toVar();
	const v = float( 0.0 ).toVar(), a = float( 0.5 ).toVar();
	const derivative = vec3( 0.0 ).toVar();
	const freq = float( 1.0 ).toVar();

	Loop( { start: 0, end: 4 }, ( { i } ) => {

		const angle = time.mul( add( 0.008, mul( 0.003, float( i ) ) ) );
		const sa = sin( angle ), ca = cos( angle );
		const rp = vec3( p.x.mul( ca ).sub( p.z.mul( sa ) ), p.y, p.x.mul( sa ).add( p.z.mul( ca ) ) );
		const n = gnoised( rp );
		const nx = n.x.div( add( 1.0, slopeness.mul( dot( derivative, derivative ) ) ) );
		v.addAssign( a.mul( nx ) );
		derivative.addAssign( a.mul( n.yzw ).mul( freq ) );
		freq.mulAssign( 2.17 );
		p.mulAssign( 2.17 );
		a.mulAssign( 0.45 );

	} );

	return vec4( v, derivative.x, derivative.y, derivative.z );

} );

/* blackbodyRGB imported from shared noise-common — removed inline copy */

export const main = /*@__PURE__*/ Fn( ( [ uSeed, uLowTemp, uHighTemp, uGranScale, uSpotAmp, uSize, uSlopeness, uEmissive, uRotation, uAtmosphereColor, uAtmosphereIntensity ] ) => {

	const objNormal = normalize( vLocalPos );
	const rotated = uRotation.mul( objNormal );
	const s = fract( uSeed.mul( 0.00000013 ) ).mul( 100.0 );
	const sizeInv = div( 1.0, max( uSize, 0.3 ) );
	const p = rotated.mul( uGranScale ).mul( sizeInv );

	/* Domain warping — each layer gets a different time scale for organic morphing */

	const qx = fbm( p.add( vec3( s, s.mul( 1.37 ), s.mul( 0.71 ) ) ), uSlopeness, uTime.mul( 1.0 ) );
	const qy = fbm( p.add( vec3( s.mul( 2.31 ), s.mul( 0.53 ), s.mul( 1.91 ) ) ), uSlopeness, uTime.mul( 1.0 ) );
	const qz = fbm( p.add( vec3( s.mul( 3.17 ), s.mul( 0.89 ), s.mul( 2.43 ) ) ), uSlopeness, uTime.mul( 1.0 ) );
	const q = vec3( qx, qy, qz );
	const rx = fbm( p.add( q.mul( 0.8 ) ).add( vec3( s.mul( 0.17 ).add( 1.7 ), s.mul( 1.13 ).add( 3.2 ), s.mul( 0.61 ).add( 4.5 ) ) ), uSlopeness, uTime.mul( 0.7 ) );
	const ry = fbm( p.add( q.mul( 0.8 ) ).add( vec3( s.mul( 0.83 ).add( 5.1 ), s.mul( 0.29 ).add( 7.8 ), s.mul( 1.47 ).add( 2.1 ) ) ), uSlopeness, uTime.mul( 0.7 ) );
	const rz = fbm( p.add( q.mul( 0.8 ) ).add( vec3( s.mul( 0.39 ).add( 8.3 ), s.mul( 1.71 ).add( 1.4 ), s.mul( 0.57 ).add( 6.7 ) ) ), uSlopeness, uTime.mul( 0.7 ) );
	const r = vec3( rx.toVar(), ry, rz );
	const finalNoise = fbmd( p.add( r.mul( 0.6 ) ).add( vec3( s.mul( 0.41 ).add( 2.3 ) ) ), uSlopeness, uTime.mul( 0.5 ) );
	const f = finalNoise.x;
	const noiseDeriv = finalNoise.yzw;
	const base = clamp( f.mul( 1.2 ).add( 0.5 ), 0.0, 1.0 );
	const cellEdge = length( q ).mul( uSpotAmp );
	const brightPatch = clamp( r.x.mul( 0.6 ).add( 0.5 ), 0.0, 1.0 );
	const tempFactor = clamp( base.sub( cellEdge.mul( 0.8 ) ).add( brightPatch.mul( 0.4 ) ).sub( 0.15 ), 0.0, 1.0 ).toVar();
	tempFactor.assign( tempFactor.mul( tempFactor ).mul( sub( 3.0, mul( 2.0, tempFactor ) ) ) );
	const kelvin = mix( uLowTemp, uHighTemp, tempFactor );
	const surfaceColor = blackbodyRGB( kelvin ).toVar();

	/* HDR emissive boost — only the hottest 25% of cells clip to white */

	const emissive = smoothstep( 0.75, 1.0, tempFactor ).mul( uEmissive );
	surfaceColor.mulAssign( add( 1.0, emissive ) );

	/* Perturb normal with noise derivatives for surface depth illusion */

	const N = normalize( vNormal );
	const V = normalize( vViewDir );
	const up = select( abs( N.y ).lessThan( 0.999 ), vec3( 0.0, 1.0, 0.0 ), vec3( 1.0, 0.0, 0.0 ) );
	const T = normalize( cross( up, N ) );
	const B = cross( N, T );
	const perturbedN = normalize( N.sub( mul( 0.15, noiseDeriv.x.mul( T ).add( noiseDeriv.y.mul( B ) ) ) ) );
	const NdotV = max( 0.0, dot( perturbedN, V ) );

	/* sqrt spreads the darkening more gradually across the disc */

	surfaceColor.mulAssign( mix( 0.55, 1.0, sqrt( NdotV ) ) );

	/* Rim glow uses smooth geometric normal — stays clean at edges */

	const rimNdotV = max( 0.0, dot( N, V ) );
	const rimFactor = pow( sub( 1.0, rimNdotV ), 4.0 );
	surfaceColor.addAssign( uAtmosphereColor.mul( uAtmosphereIntensity ).mul( rimFactor ) );
	return vec4( surfaceColor, 1.0 );

} );