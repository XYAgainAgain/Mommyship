// Three.js Transpiler r183

import { abs, add, clamp, float, Fn, fract, length, mix, mul, smoothstep, sub, uniform, varyingProperty, vec3, vec4 } from 'three/tsl';

const vUv = varyingProperty( 'vec2', 'vUv' );

export const uSeed = uniform( float( 0 ) );
export const uLowTemp = uniform( float( 0 ) );
export const uHighTemp = uniform( float( 0 ) );
export const uGranScale = uniform( float( 0 ) );
export const uCellScale = uniform( float( 2.0 ) );
export const uSpotAmp = uniform( float( 0 ) );
export const uSize = uniform( float( 0 ) );
export const uSlopeness = uniform( float( 0 ) );
export const uEmissive = uniform( float( 0 ) );

import { uvToSphere, fbm, fbmd, fbmO, blackbodyRGB } from '../glsl/noise-common.tsl.js';
/* Shared knobs so bake constants can never drift from detail (bake samples them at load) */
import { uSupergranuleScale, uFilamentStrength, uLaneStrength } from './star-detail.tsl.js';

export const main = /*@__PURE__*/ Fn( () => {

	const spherePos = uvToSphere( vUv );
	const s = fract( uSeed.mul( 0.00000013 ) ).mul( 100.0 );

	/* Two-scale split mirrored from star-detail: fixed-frequency stipple,
	   supergranules scale with physical size */
	const pFine = spherePos.mul( uGranScale );
	const pCell = spherePos.mul( uCellScale ).mul( uSupergranuleScale );

	/* Domain warping for organic convection cells */

	const qx = fbm( pFine.add( vec3( s, s.mul( 1.37 ), s.mul( 0.71 ) ) ), uSlopeness );
	const qy = fbm( pFine.add( vec3( s.mul( 2.31 ), s.mul( 0.53 ), s.mul( 1.91 ) ) ), uSlopeness );
	const qz = fbm( pFine.add( vec3( s.mul( 3.17 ), s.mul( 0.89 ), s.mul( 2.43 ) ) ), uSlopeness );
	const q = vec3( qx, qy, qz );
	const rx = fbm( pFine.add( q.mul( 0.8 ) ).add( vec3( s.mul( 0.17 ).add( 1.7 ), s.mul( 1.13 ).add( 3.2 ), s.mul( 0.61 ).add( 4.5 ) ) ), uSlopeness );
	const ry = fbm( pFine.add( q.mul( 0.8 ) ).add( vec3( s.mul( 0.83 ).add( 5.1 ), s.mul( 0.29 ).add( 7.8 ), s.mul( 1.47 ).add( 2.1 ) ) ), uSlopeness );
	const rz = fbm( pFine.add( q.mul( 0.8 ) ).add( vec3( s.mul( 0.39 ).add( 8.3 ), s.mul( 1.71 ).add( 1.4 ), s.mul( 0.57 ).add( 6.7 ) ) ), uSlopeness );
	const r = vec3( rx.toVar(), ry, rz );
	const f = fbmd( pFine.add( r.mul( 0.6 ) ).add( vec3( s.mul( 0.41 ).add( 2.3 ) ) ), uSlopeness ).x;

	/* tempFactor block MUST stay term-for-term identical to star-detail.tsl.js
	   (this is its time-0, gate-0 twin) or the LOD crossfade pops */
	const superg = fbmO( pCell.add( vec3( s.mul( 1.61 ).add( 11.8 ), s.mul( 0.47 ).add( 3.9 ), s.mul( 2.23 ).add( 7.2 ) ) ), uSlopeness, float( 3.0 ) );
	const ridge = sub( 1.0, abs( fbm( pFine.mul( 0.55 ).add( vec3( s.mul( 0.93 ).add( 9.4 ), s.mul( 1.29 ).add( 5.6 ), s.mul( 0.71 ).add( 3.3 ) ) ), uSlopeness ).mul( 2.0 ) ) );
	const filament = smoothstep( 0.78, 0.97, ridge ).mul( uFilamentStrength );
	const cellEdge = length( q ).mul( uSpotAmp );
	const lane = smoothstep( 0.85, 1.5, cellEdge ).mul( uLaneStrength );
	const spotN = fbmO( spherePos.mul( 1.4 ).add( vec3( s.mul( 2.77 ).add( 1.9 ), s.mul( 1.03 ).add( 8.5 ), s.mul( 0.31 ).add( 4.4 ) ) ), uSlopeness, float( 3.0 ) );
	const spotThresh = sub( 0.52, uSpotAmp.mul( 0.05 ) );
	const umbra = smoothstep( spotThresh, spotThresh.add( 0.05 ), spotN );
	const penumbra = smoothstep( spotThresh.sub( 0.08 ), spotThresh.add( 0.03 ), spotN );
	const spotMask = umbra.mul( 0.65 ).add( penumbra.mul( 0.35 ) );

	const base = clamp( f.mul( 1.2 ).add( 0.5 ), 0.0, 1.0 );
	const brightPatch = clamp( r.x.mul( 0.6 ).add( 0.5 ), 0.0, 1.0 );
	const tempFactor = clamp( base.sub( cellEdge.mul( 0.8 ) ).add( brightPatch.mul( 0.4 ) ).sub( 0.15 )
		.add( superg.mul( 0.55 ) ).add( lane ).sub( filament ).sub( spotMask.mul( 0.5 ) ), 0.0, 1.0 ).toVar();
	tempFactor.assign( tempFactor.mul( tempFactor ).mul( sub( 3.0, mul( 2.0, tempFactor ) ) ) );
	const darken = sub( 1.0, filament.mul( 0.75 ) ).mul( sub( 1.0, spotMask.mul( 0.9 ) ) );

	const kelvin = mix( uLowTemp, uHighTemp, tempFactor );
	const surfaceColor = blackbodyRGB( kelvin ).toVar();

	/* HDR emissive boost — only the hottest 25% of cells clip to white */

	const emissive = smoothstep( 0.75, 1.0, tempFactor ).mul( uEmissive );
	surfaceColor.mulAssign( add( 1.0, emissive ) );
	surfaceColor.mulAssign( darken );
	return vec4( surfaceColor, 1.0 );

} );
