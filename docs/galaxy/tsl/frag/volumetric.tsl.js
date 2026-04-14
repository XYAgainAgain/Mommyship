// Three.js Transpiler r183

import { abs, add, Break, cos, Discard, div, dot, exp, float, Fn, If, int, length, Loop, max, mix, mul, Return, sin, smoothstep, sqrt, sub, uniform, varyingProperty, vec2, vec3, vec4 } from 'three/tsl';

const vRayOrigin = varyingProperty( 'vec3', 'vRayOrigin' );
const vRayDir = varyingProperty( 'vec3', 'vRayDir' );

/* Shared across all volumetric instances */
export const uTime = uniform( float( 0 ) );

/* Ray-sphere intersection for unit sphere centered at origin (radius 0.5) */

export const intersectSphere = /*@__PURE__*/ Fn( ( [ origin, dir ] ) => {

	const b = dot( origin, dir );
	const c = dot( origin, origin ).sub( 0.25 );
	const disc = b.mul( b ).sub( c );

	If( disc.lessThan( 0.0 ), () => {

		Return( vec2( 1.0, - 1.0 ) );

	} );

	const sq = sqrt( disc );

	return vec2( b.negate().sub( sq ), b.negate().add( sq ) );

} );

/* Per-sphere uniforms accepted as parameters for multi-instance rendering */

export const main = /*@__PURE__*/ Fn( ( [ volTex, seedVal, color1, color2, densityVal, absorptionVal, brightnessVal, cameraDist, opacityVal ] ) => {

	const tHit = intersectSphere( vRayOrigin, vRayDir ).toVar();
	tHit.x.assign( max( tHit.x, 0.0 ) );

	If( tHit.x.greaterThan( tHit.y ), () => {

		Discard();

	} );

	/* 16–48 steps based on camera distance */

	const steps = int( mix( 16.0, 48.0, smoothstep( 800.0, 400.0, cameraDist ) ) );
	const rayLength = tHit.y.sub( tHit.x );
	const stepSize = rayLength.div( float( steps ) );
	const pos = vRayOrigin.add( vRayDir.mul( tHit.x ) ).toVar();
	const accumDensity = float( 0.0 ).toVar();
	const accumColor = vec3( 0.0 ).toVar();
	const t = uTime.add( seedVal.mul( 100.0 ) );

	Loop( { start: 0, end: 48 }, ( { i } ) => {

		If( i.greaterThanEqual( steps ), () => {

			Break();

		} );

		const samplePos = pos.add( 0.5 ).toVar();

		/* Billowing warp: coprime frequencies, reduced Y to stay in-plane */

		const warp = vec3(
			sin( samplePos.y.mul( 2.0 ).add( t.mul( 0.15 ) ) ).mul( cos( samplePos.z.mul( 1.7 ).add( t.mul( 0.11 ) ) ) ).mul( 0.08 )
				.add( sin( samplePos.z.mul( 5.1 ).add( t.mul( 0.23 ) ) ).mul( 0.03 ) ),
			sin( samplePos.z.mul( 2.3 ).add( t.mul( 0.13 ) ) ).mul( cos( samplePos.x.mul( 1.5 ).add( t.mul( 0.09 ) ) ) ).mul( 0.05 )
				.add( cos( samplePos.x.mul( 4.7 ).add( t.mul( 0.19 ) ) ).mul( 0.02 ) ),
			sin( samplePos.x.mul( 1.9 ).add( t.mul( 0.17 ) ) ).mul( cos( samplePos.y.mul( 2.1 ).add( t.mul( 0.12 ) ) ) ).mul( 0.08 )
				.add( sin( samplePos.y.mul( 5.5 ).add( t.mul( 0.21 ) ) ).mul( 0.03 ) )
		);
		samplePos.addAssign( warp );
		const density = volTex.sample( samplePos ).r.toVar();
		density.assign( smoothstep( 0.35, 0.75, density ) );

		/* Radial + Y edge fade: softens sphere boundary, keeps volumes flat in disk plane */

		const radialDist = length( pos.mul( 2.0 ) );
		const radialFade = sub( 1.0, smoothstep( 0.5, 1.0, radialDist ) );
		const yEdge = sub( 1.0, smoothstep( 0.3, 0.5, abs( pos.y.mul( 2.0 ) ) ) );
		density.mulAssign( radialFade.mul( yEdge ) );
		density.mulAssign( densityVal );
		const transmittance = exp( accumDensity.negate() );

		/* Center-to-edge color gradient */

		const localColor = mix( color1, color2, smoothstep( 0.2, 0.8, radialDist ) );
		accumColor.addAssign( localColor.mul( density ).mul( transmittance ).mul( stepSize ).mul( brightnessVal ) );
		accumDensity.addAssign( density.mul( stepSize ) );

		If( accumDensity.greaterThan( 4.0 ), () => {

			Break();

		} );

		pos.addAssign( vRayDir.mul( stepSize ) );

	} );

	const alpha = sub( 1.0, exp( accumDensity.negate() ) );

	/* Dark nebulae output a multiply tint; emission outputs additive color */

	If( absorptionVal.greaterThan( 0.5 ), () => {

		Return( vec4( mix( vec3( 1.0 ), color1, alpha.mul( opacityVal ) ), 1.0 ) );

	} ).Else( () => {

		Return( vec4( accumColor, alpha.mul( opacityVal ) ) );

	} );

	/* Fallback return — never reached, but tells TSL the function returns vec4 */
	return vec4( 0.0, 0.0, 0.0, 0.0 );

} );