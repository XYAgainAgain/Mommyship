// Three.js Transpiler r183

import { add, atan, Break, clamp, cos, Discard, div, dot, exp, float, Fn, fract, If, int, length, log, Loop, max, min, mix, mul, negate, sin, smoothstep, sub, texture, texture3D, uniform, varyingProperty, vec2, vec3, vec4 } from 'three/tsl';

const vRayOrigin = varyingProperty( 'vec3', 'vRayOrigin' );
const vRayDir = varyingProperty( 'vec3', 'vRayDir' );

/* Shared across all torus instances — set once per frame */
export const uVolume = texture3D( null );
export const uLightmap = texture( null );
export const uTime = uniform( float( 0 ) );
export const uCameraDist = uniform( float( 0 ) );
export const uOpacity = uniform( float( 0 ) );

export const intersectBox = /*@__PURE__*/ Fn( ( [ origin, dir ] ) => {

	const inv = div( 1.0, dir );
	const t0 = sub( - 0.5, origin ).mul( inv );
	const t1 = sub( 0.5, origin ).mul( inv );
	const mn = min( t0, t1 );
	const mx = max( t0, t1 );

	return vec2( max( max( mn.x, mn.y ), mn.z ), min( min( mx.x, mx.y ), mx.z ) );

} );

export const torusSDF = /*@__PURE__*/ Fn( ( [ p, ySquash, majorR, minorR ] ) => {

	const q = vec3( p.x, p.y.div( ySquash ), p.z );
	const t = vec2( length( q.xz ).sub( majorR ), q.y );

	return length( t ).sub( minorR );

} );

/* All per-torus uniforms accepted as parameters so each torus instance
   can have its own geometry, density, color, etc. */

export const main = /*@__PURE__*/ Fn( ( [ boxScale, majorR, minorR, ySquash, lightmapAngle, baseColor, densityScale, noiseScale, noiseStrength, warpScale, seed, minSteps, maxSteps ] ) => {

	const tHit = intersectBox( vRayOrigin, vRayDir ).toVar();
	tHit.x.assign( max( tHit.x, 0.0 ) );

	If( tHit.x.greaterThan( tHit.y ), () => {

		Discard();

	} );

	const steps = int( mix( minSteps, maxSteps, smoothstep( 1200.0, 400.0, uCameraDist ) ) );
	const rayLength = tHit.y.sub( tHit.x );
	const stepSize = rayLength.div( float( steps ) );
	const pos = vRayOrigin.add( vRayDir.mul( tHit.x ) ).toVar();
	const accumDensity = float( 0.0 ).toVar();
	const accumColor = vec3( 0.0 ).toVar();
	const ca = cos( lightmapAngle );
	const sa = sin( lightmapAngle );
	const worldStep = stepSize.mul( length( boxScale ) ).mul( 2.0 );

	/* Jitter ray start to break up banding at grazing angles */

	const jitter = fract( sin( dot( vRayOrigin.xz, vec2( 12.9898, 78.233 ) ) ).mul( 43758.5453 ) );
	pos.addAssign( vRayDir.mul( stepSize ).mul( jitter ) );
	const warpT = uTime.mul( 0.03 ).add( seed.mul( 50.0 ) );

	Loop( { start: 0, end: 32 }, ( { i } ) => {

		If( i.greaterThanEqual( steps ), () => {

			Break();

		} );

		const worldPos = pos.mul( boxScale ).mul( 2.0 );

		/* Spiral-following warp with counter-rotating layers */

		const rad = length( worldPos.xz );
		const theta = atan( worldPos.z, worldPos.x );
		const spiralPhase = mul( - 5.0, log( rad.div( 10.0 ).add( 1.0 ) ) );
		const ws = warpScale;
		const warped = worldPos.toVar();

		/* Layer 1: follows spiral structure, rotates with it */

		const s1 = sin( spiralPhase.add( theta.mul( 2.0 ) ).add( warpT ) ).mul( 6.0 ).mul( ws );
		const c1 = cos( spiralPhase.add( theta.mul( 2.0 ) ).add( warpT.mul( 0.7 ) ) ).mul( 6.0 ).mul( ws );

		/* Layer 2: counter-rotating for turbulence */

		const s2 = sin( spiralPhase.mul( 0.7 ).sub( theta.mul( 1.5 ) ).add( warpT.mul( 1.3 ) ) ).mul( 4.0 ).mul( ws );
		const c2 = cos( spiralPhase.mul( 0.7 ).sub( theta.mul( 1.5 ) ).add( warpT.mul( 0.9 ) ) ).mul( 4.0 ).mul( ws );

		/* Layer 3: radial ripple */

		const s3 = sin( rad.mul( 0.04 ).add( warpT.mul( 0.5 ) ) ).mul( 3.0 ).mul( ws );
		const c3 = cos( rad.mul( 0.035 ).add( warpT.mul( 0.6 ) ) ).mul( 3.0 ).mul( ws );
		warped.x.addAssign( s1.add( s2 ).add( s3 ) );
		warped.z.addAssign( c1.add( c2 ).add( c3 ) );
		const d = torusSDF( warped, ySquash, majorR, minorR );

		If( d.lessThan( 0.0 ), () => {

			const coreDist = clamp( d.negate().div( minorR ), 0.0, 1.0 );

			/* Edge gradient: smooth falloff near torus boundary */

			const edgeFade = smoothstep( 0.0, 0.4, coreDist );
			const density = edgeFade.toVar();

			/* 3D noise — higher smoothstep threshold for sparser, patchier structure */

			If( noiseStrength.greaterThan( 0.01 ), () => {

				const noiseCoord = warped.mul( noiseScale ).mul( 0.01 ).add( vec3( seed.mul( 100.0 ) ) ).toVar();
				noiseCoord.xz.addAssign( vec2( sin( warpT.mul( 1.7 ) ), cos( warpT.mul( 1.3 ) ) ).mul( 2.0 ) );
				const noise = uVolume.sample( noiseCoord ).r.toVar();
				noise.assign( smoothstep( 0.38, 0.78, noise ) );
				density.mulAssign( mix( 1.0, noise, noiseStrength ) );

			} );

			density.mulAssign( densityScale );

			/* Lightmap illumination (unwarped position for stable light tracking) */

			const galaxyXZ = vec2( worldPos.x.mul( ca ).sub( worldPos.z.mul( sa ) ), worldPos.x.mul( sa ).add( worldPos.z.mul( ca ) ) );
			const lmUV = galaxyXZ.div( 1000.0 ).add( 0.5 );
			const illum = uLightmap.sample( lmUV ).rgb;
			const illumBright = dot( illum, vec3( 0.299, 0.587, 0.114 ) );
			const dustColor = mix( baseColor.mul( 0.25 ), illum.add( baseColor.mul( 0.25 ) ), smoothstep( 0.02, 0.15, illumBright ) );
			const scaledDensity = density.mul( 0.006 );
			const transmittance = exp( accumDensity.negate() );
			accumColor.addAssign( dustColor.mul( scaledDensity ).mul( transmittance ).mul( worldStep ) );
			accumDensity.addAssign( scaledDensity.mul( worldStep ) );

			If( accumDensity.greaterThan( 3.0 ), () => {

				Break();

			} );

		} );

		pos.addAssign( vRayDir.mul( stepSize ) );

	} );

	const alpha = sub( 1.0, exp( accumDensity.negate() ) );
	return vec4( accumColor, alpha.mul( uOpacity ) );

} );