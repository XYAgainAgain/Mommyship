// Three.js Transpiler r183

import { uniform, varyingProperty, vec3, vec2, dot, sin, fract, Fn, floor, mul, sub, mix, float, Loop, normalize, vec4 } from 'three/tsl';

export const uTime = uniform( float( 0 ) );
const vWorldDir = varyingProperty( 'vec3', 'vWorldDir' );

export const hash = /*@__PURE__*/ Fn( ( [ p ] ) => {

	return fract( sin( dot( p, vec2( 127.1, 311.7 ) ) ).mul( 43758.5453123 ) );

} );

export const noise = /*@__PURE__*/ Fn( ( [ p ] ) => {

	const i = floor( p );
	const f = fract( p ).toVar();
	f.assign( f.mul( f ).mul( sub( 3.0, mul( 2.0, f ) ) ) );
	const a = hash( i );
	const b = hash( i.add( vec2( 1.0, 0.0 ) ) );
	const c = hash( i.add( vec2( 0.0, 1.0 ) ) );
	const d = hash( i.add( vec2( 1.0, 1.0 ) ) );

	return mix( mix( a, b, f.x ), mix( c, d, f.x ), f.y );

} );

export const fbm = /*@__PURE__*/ Fn( ( [ p_immutable ] ) => {

	const p = p_immutable.toVar();
	const val = float( 0.0 ).toVar();
	const amp = float( 0.5 ).toVar();

	Loop( { start: 0, end: 5 }, ( { i } ) => {

		val.addAssign( amp.mul( noise( p ) ) );
		p.mulAssign( 2.0 );
		amp.mulAssign( 0.5 );

	} );

	return val;

} );

export const main = /*@__PURE__*/ Fn( () => {

	const dir = normalize( vWorldDir );

	/* Procedural nebula wisps via FBM noise */
	const uv1 = dir.xy.mul( 3.0 );
	const uv2 = dir.yz.mul( 3.0 );
	const n1 = fbm( uv1.add( vec2( uTime.mul( 0.008 ), uTime.mul( 0.005 ) ) ) );
	const n2 = fbm( uv2.add( vec2( uTime.negate().mul( 0.006 ), uTime.mul( 0.009 ) ) ) );
	const nebula = n1.mul( n2 );

	const purplyBlack = vec3( 0.012, 0.012, 0.027 );
	const indigoWisp = vec3( 0.06, 0.03, 0.12 );
	const skyColor = mix( vec3( 0.0 ), purplyBlack, 0.8 ).add( indigoWisp.mul( nebula ).mul( 0.25 ) );
	return vec4( skyColor, 1.0 );

} );

// Wire to NodeMaterial:
//   material.colorNode = main();
