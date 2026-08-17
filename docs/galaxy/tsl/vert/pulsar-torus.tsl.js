// Three.js Transpiler r183

import { add, dot, float, floor, Fn, fract, mix, modelWorldMatrix, modelViewMatrix, mul, normalize, normalLocal, positionLocal, sin, sub, varying, uniform, uv, vec2, vec3, vec4 } from 'three/tsl';

const vUv = varying( vec2(), 'vUv' );
const vWorldPos = varying( vec3(), 'vWorldPos' );
const vNoise = varying( float(), 'vNoise' );

/* Shared across all pulsar instances */
export const uTime = uniform( float( 0 ) );

/* Per-instance uniforms accepted as parameters */

export const hash33 = /*@__PURE__*/ Fn( ( [ p_immutable ] ) => {

	const p = p_immutable.toVar();
	p.assign( vec3( dot( p, vec3( 127.1, 311.7, 74.7 ) ), dot( p, vec3( 269.5, 183.3, 246.1 ) ), dot( p, vec3( 113.5, 271.9, 124.6 ) ) ) );

	return fract( sin( p ).mul( 43758.5453 ) ).mul( 2.0 ).sub( 1.0 );

} );

export const gnoise = /*@__PURE__*/ Fn( ( [ p ] ) => {

	const i = floor( p );
	const f = fract( p );
	const u = f.mul( f ).mul( sub( 3.0, mul( 2.0, f ) ) );

	return mix( mix( mix( dot( hash33( i ), f ), dot( hash33( i.add( vec3( 1, 0, 0 ) ) ), f.sub( vec3( 1, 0, 0 ) ) ), u.x ), mix( dot( hash33( i.add( vec3( 0, 1, 0 ) ) ), f.sub( vec3( 0, 1, 0 ) ) ), dot( hash33( i.add( vec3( 1, 1, 0 ) ) ), f.sub( vec3( 1, 1, 0 ) ) ), u.x ), u.y ), mix( mix( dot( hash33( i.add( vec3( 0, 0, 1 ) ) ), f.sub( vec3( 0, 0, 1 ) ) ), dot( hash33( i.add( vec3( 1, 0, 1 ) ) ), f.sub( vec3( 1, 0, 1 ) ) ), u.x ), mix( dot( hash33( i.add( vec3( 0, 1, 1 ) ) ), f.sub( vec3( 0, 1, 1 ) ) ), dot( hash33( i.add( vec3( 1, 1, 1 ) ) ), f.sub( vec3( 1, 1, 1 ) ) ), u.x ), u.y ), u.z );

} );

export const main = /*@__PURE__*/ Fn( ( [ uSeed ] ) => {

	vUv.assign( uv() );
	const s = fract( uSeed.mul( 0.00000013 ) ).mul( 100.0 );
	const np = positionLocal.mul( 0.15 ).add( vec3( s ) );

	/* Mesh warping synced to spin — fast, jittery EM field distortion */

	const wobble = gnoise( np.add( vec3( uTime.mul( 1.2 ), uTime.mul( 0.8 ), uTime.mul( 0.9 ) ) ) ).toVar();
	wobble.addAssign( mul( 0.5, gnoise( np.mul( 2.3 ).add( vec3( uTime.mul( 2.0 ), uTime.mul( - 1.4 ), uTime.mul( 1.6 ) ) ) ) ) );
	wobble.mulAssign( 0.5 );
	vNoise.assign( wobble );
	const n = normalize( normalLocal );
	const displaced = positionLocal.add( n.mul( wobble ) );
	vWorldPos.assign( modelWorldMatrix.mul( vec4( displaced, 1.0 ) ).xyz );

	return displaced;

} );

// Wire to NodeMaterial:
//   material.positionNode = main();
