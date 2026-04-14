// Three.js Transpiler r183

import { add, clamp, cos, div, dot, float, floor, Fn, fract, length, log, Loop, max, mix, mul, pow, property, select, sin, smoothstep, sub, uniform, uv, varyingProperty, vec2, vec3, vec4 } from 'three/tsl';

const vUv = varyingProperty( 'vec2', 'vUv' );

export const uSeed = uniform( float( 0 ) );
export const uLowTemp = uniform( float( 0 ) );
export const uHighTemp = uniform( float( 0 ) );
export const uGranScale = uniform( float( 0 ) );
export const uSpotAmp = uniform( float( 0 ) );
export const uSize = uniform( float( 0 ) );
export const uSlopeness = uniform( float( 0 ) );
export const uEmissive = uniform( float( 0 ) );

import { uvToSphere, hash33, gnoised, fbmd, blackbodyRGB } from '../glsl/noise-common.tsl.js';

/* Inline noise-common copies removed — now imported from ../glsl/noise-common.tsl.js */

export const main = /*@__PURE__*/ Fn( () => {

	/* DEBUG — solid orange to test bake pipeline */
	return vec4( 1.0, 0.6, 0.2, 1.0 );

	const spherePos = uvToSphere( vUv );
	const s = fract( uSeed.mul( 0.00000013 ) ).mul( 100.0 );
	const sizeInv = div( 1.0, max( uSize, 0.3 ) );
	const p = spherePos.mul( uGranScale ).mul( sizeInv );

	/* Domain warping for organic convection cells */

	const qx = fbmd( p.add( vec3( s, s.mul( 1.37 ), s.mul( 0.71 ) ) ), uSlopeness ).x;
	const qy = fbmd( p.add( vec3( s.mul( 2.31 ), s.mul( 0.53 ), s.mul( 1.91 ) ) ), uSlopeness ).x;
	const qz = fbmd( p.add( vec3( s.mul( 3.17 ), s.mul( 0.89 ), s.mul( 2.43 ) ) ), uSlopeness ).x;
	const q = vec3( qx, qy, qz );
	const rx = fbmd( p.add( q.mul( 0.8 ) ).add( vec3( s.mul( 0.17 ).add( 1.7 ), s.mul( 1.13 ).add( 3.2 ), s.mul( 0.61 ).add( 4.5 ) ) ), uSlopeness ).x;
	const ry = fbmd( p.add( q.mul( 0.8 ) ).add( vec3( s.mul( 0.83 ).add( 5.1 ), s.mul( 0.29 ).add( 7.8 ), s.mul( 1.47 ).add( 2.1 ) ) ), uSlopeness ).x;
	const rz = fbmd( p.add( q.mul( 0.8 ) ).add( vec3( s.mul( 0.39 ).add( 8.3 ), s.mul( 1.71 ).add( 1.4 ), s.mul( 0.57 ).add( 6.7 ) ) ), uSlopeness ).x;
	const r = vec3( rx.toVar(), ry, rz );
	const f = fbmd( p.add( r.mul( 0.6 ) ).add( vec3( s.mul( 0.41 ).add( 2.3 ) ) ), uSlopeness ).x;
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
	return vec4( surfaceColor, 1.0 );

} );