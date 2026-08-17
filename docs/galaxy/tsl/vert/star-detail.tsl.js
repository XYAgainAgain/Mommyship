// Three.js Transpiler r183

import { add, cameraPosition, cos, div, dot, float, floor, Fn, fract, mat3, max, mix, modelWorldMatrix, modelViewMatrix, mul, normalize, normalLocal, modelNormalMatrix, positionLocal, sin, sub, varying, uniform, vec3, vec4 } from 'three/tsl';

const vLocalPos = varying( vec3(), 'vLocalPos' );
const vNormal = varying( vec3(), 'vNormal' );
const vViewDir = varying( vec3(), 'vViewDir' );

/* Shared across all detail instances */
export const uTime = uniform( float( 0 ) );

/* Per-instance uniforms accepted as parameters for multi-instance pool rendering */

/* Lightweight noise for vertex displacement — matches fragment shader's hash */

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

export const main = /*@__PURE__*/ Fn( ( [ uSeed, uGranScale, uSize, uBubbleAmp, uRotation ] ) => {

	const n = normalize( normalLocal );
	vLocalPos.assign( positionLocal );

	/* Vertex displacement — noise in the same domain as the fragment shader */

	const s = fract( uSeed.mul( 0.00000013 ) ).mul( 100.0 );
	const sizeInv = div( 1.0, max( uSize, 0.3 ) );
	const objNormal = normalize( positionLocal );
	const rotated = uRotation.mul( objNormal );
	const np = rotated.mul( uGranScale ).mul( sizeInv );

	/* Two octaves for organic shape — animated with slow time rotation */

	const angle = uTime.mul( 0.008 );
	const sa = sin( angle ), ca = cos( angle );
	const rp = vec3( np.x.mul( ca ).sub( np.z.mul( sa ) ), np.y, np.x.mul( sa ).add( np.z.mul( ca ) ) );
	const disp = gnoise( rp.add( vec3( s, s.mul( 1.37 ), s.mul( 0.71 ) ) ) ).toVar();
	disp.addAssign( mul( 0.45, gnoise( rp.mul( 2.17 ).add( vec3( s.mul( 2.31 ), s.mul( 0.53 ), s.mul( 1.91 ) ) ) ) ) );
	disp.mulAssign( uBubbleAmp );
	const displaced = positionLocal.add( n.mul( disp ) );
	const worldPos = modelWorldMatrix.mul( vec4( displaced, 1.0 ) );
	vNormal.assign( normalize( modelNormalMatrix.mul( n ) ) );
	vViewDir.assign( normalize( cameraPosition.sub( worldPos.xyz ) ) );

	return displaced;

} );

// Wire to NodeMaterial:
//   material.positionNode = main();
