// Three.js Transpiler r183

import { add, dot, float, floor, Fn, fract, mat3, mix, mul, normalize, normalLocal, positionLocal, sin, sub, varying, uniform, uv, vec2, vec3, vec4 } from 'three/tsl';

const vLocalPos = varying( vec3(), 'vLocalPos' );
const vNormal = varying( vec3(), 'vNormal' );
const vViewDir = varying( vec3(), 'vViewDir' );
const vUv = varying( vec2(), 'vUv' );
/* uRotation-aware world normal; TSL's normalWorld ignores our in-shader rotation. */
const vRotNormal = varying( vec3(), 'vRotNormal' );

/* Shared across all detail instances */
export const uTime = uniform( float( 0 ) );

/* Per-instance uniforms accepted as parameters for multi-instance pool rendering */

/* Lightweight noise for vertex displacement */

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

export const main = /*@__PURE__*/ Fn( ( [ uSeed, uDisplacementAmp, uLumpiness, uRotation ] ) => {

	const n = normalize( normalLocal );
	vUv.assign( uv() );
	const s = fract( uSeed.mul( 0.00000013 ) ).mul( 100.0 );
	const objNormal = normalize( positionLocal );

	/* All displacement from body-local coords so geometry is static per seed */

	const np = objNormal.mul( 3.5 );
	const disp = gnoise( np.add( vec3( s, s.mul( 1.37 ), s.mul( 0.71 ) ) ) ).toVar();
	disp.addAssign( mul( 0.4, gnoise( np.mul( 2.3 ).add( vec3( s.mul( 2.31 ), s.mul( 0.53 ), s.mul( 1.91 ) ) ) ) ) );
	disp.mulAssign( uDisplacementAmp );
	const lump = gnoise( objNormal.mul( 1.2 ).add( vec3( s.mul( 0.43 ), s.mul( 0.91 ), s.mul( 0.17 ) ) ) ).toVar();
	lump.addAssign( mul( 0.5, gnoise( objNormal.mul( 2.5 ).add( vec3( s.mul( 1.63 ), s.mul( 0.29 ), s.mul( 1.07 ) ) ) ) ) );
	disp.addAssign( lump.mul( uLumpiness ) );
	const displaced = positionLocal.add( n.mul( disp ) );

	/* Fragment gets body-local pos for texture — craters stick to surface */

	vLocalPos.assign( displaced );

	/* Rotate the rigid shape for visual spin */

	const rotDisplaced = uRotation.mul( displaced );
	vRotNormal.assign( uRotation.mul( objNormal ) );

	return rotDisplaced;

} );

// Wire to NodeMaterial:
//   material.positionNode = main();
