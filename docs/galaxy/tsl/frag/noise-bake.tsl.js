/* Bakes a 128×128 tileable 3D periodic Perlin noise texture.
   Each RGB channel samples a different Z-slice for uncorrelated patterns. */

// Three.js TSL r183 — manually patched from transpiler output

import { uv, floor, Fn, mul, sub, mod, vec3, fract, vec4, abs, step, dot, mix, float } from 'three/tsl';

/* Consolidated from vec3/vec4 overload — TSL infers types dynamically */

const mod289 = /*@__PURE__*/ Fn( ( [ x ] ) => {

	return x.sub( floor( x.mul( 1.0 / 289.0 ) ).mul( 289.0 ) );

} );

const permute = /*@__PURE__*/ Fn( ( [ x ] ) => {

	return mod289( x.mul( 34.0 ).add( 10.0 ).mul( x ) );

} );

const taylorInvSqrt = /*@__PURE__*/ Fn( ( [ r ] ) => {

	return sub( 1.79284291400159, mul( 0.85373472095314, r ) );

} );

const fade = /*@__PURE__*/ Fn( ( [ t ] ) => {

	return t.mul( t ).mul( t ).mul( t.mul( t.mul( 6.0 ).sub( 15.0 ) ).add( 10.0 ) );

} );

const perlin3dPeriodic = /*@__PURE__*/ Fn( ( [ P, rep ] ) => {

	const Pi0 = mod( floor( P ), rep ).toVar();
	const Pi1 = mod( Pi0.add( vec3( 1.0 ) ), rep ).toVar();
	Pi0.assign( mod289( Pi0 ) );
	Pi1.assign( mod289( Pi1 ) );
	const Pf0 = fract( P );
	const Pf1 = Pf0.sub( vec3( 1.0 ) );
	const ix = vec4( Pi0.x, Pi1.x, Pi0.x, Pi1.x );
	const iy = vec4( Pi0.y, Pi0.y, Pi1.y, Pi1.y );
	const iz0 = vec4( Pi0.z, Pi0.z, Pi0.z, Pi0.z );
	const iz1 = vec4( Pi1.z, Pi1.z, Pi1.z, Pi1.z );
	const ixy = permute( permute( ix ).add( iy ) );
	const ixy0 = permute( ixy.add( iz0 ) );
	const ixy1 = permute( ixy.add( iz1 ) );
	const gx0 = ixy0.mul( 1.0 / 7.0 ).toVar();
	const gy0 = fract( floor( gx0 ).mul( 1.0 / 7.0 ) ).sub( 0.5 ).toVar();
	gx0.assign( fract( gx0 ) );
	const gz0 = vec4( 0.5 ).sub( abs( gx0 ) ).sub( abs( gy0 ) );
	const sz0 = step( gz0, vec4( 0.0 ) );
	gx0.subAssign( sz0.mul( step( 0.0, gx0 ).sub( 0.5 ) ) );
	gy0.subAssign( sz0.mul( step( 0.0, gy0 ).sub( 0.5 ) ) );
	const gx1 = ixy1.mul( 1.0 / 7.0 ).toVar();
	const gy1 = fract( floor( gx1 ).mul( 1.0 / 7.0 ) ).sub( 0.5 ).toVar();
	gx1.assign( fract( gx1 ) );
	const gz1 = vec4( 0.5 ).sub( abs( gx1 ) ).sub( abs( gy1 ) );
	const sz1 = step( gz1, vec4( 0.0 ) );
	gx1.subAssign( sz1.mul( step( 0.0, gx1 ).sub( 0.5 ) ) );
	gy1.subAssign( sz1.mul( step( 0.0, gy1 ).sub( 0.5 ) ) );
	const g000 = vec3( gx0.x, gy0.x, gz0.x ).toVar();
	const g100 = vec3( gx0.y, gy0.y, gz0.y ).toVar();
	const g010 = vec3( gx0.z, gy0.z, gz0.z ).toVar();
	const g110 = vec3( gx0.w, gy0.w, gz0.w ).toVar();
	const g001 = vec3( gx1.x, gy1.x, gz1.x ).toVar();
	const g101 = vec3( gx1.y, gy1.y, gz1.y ).toVar();
	const g011 = vec3( gx1.z, gy1.z, gz1.z ).toVar();
	const g111 = vec3( gx1.w, gy1.w, gz1.w ).toVar();
	const norm0 = taylorInvSqrt( vec4( dot( g000, g000 ), dot( g010, g010 ), dot( g100, g100 ), dot( g110, g110 ) ) );
	g000.mulAssign( norm0.x );
	g010.mulAssign( norm0.y );
	g100.mulAssign( norm0.z );
	g110.mulAssign( norm0.w );
	const norm1 = taylorInvSqrt( vec4( dot( g001, g001 ), dot( g011, g011 ), dot( g101, g101 ), dot( g111, g111 ) ) );
	g001.mulAssign( norm1.x );
	g011.mulAssign( norm1.y );
	g101.mulAssign( norm1.z );
	g111.mulAssign( norm1.w );
	const n000 = dot( g000, Pf0 );
	const n100 = dot( g100, vec3( Pf1.x, Pf0.yz ) );
	const n010 = dot( g010, vec3( Pf0.x, Pf1.y, Pf0.z ) );
	const n110 = dot( g110, vec3( Pf1.xy, Pf0.z ) );
	const n001 = dot( g001, vec3( Pf0.xy, Pf1.z ) );
	const n101 = dot( g101, vec3( Pf1.x, Pf0.y, Pf1.z ) );
	const n011 = dot( g011, vec3( Pf0.x, Pf1.yz ) );
	const n111 = dot( g111, Pf1 );
	const fade_xyz = fade( Pf0 );
	const n_z = mix( vec4( n000, n100, n010, n110 ), vec4( n001, n101, n011, n111 ), fade_xyz.z );
	const n_yz = mix( n_z.xy, n_z.zw, fade_xyz.y );
	const n_xyz = mix( n_yz.x, n_yz.y, fade_xyz.x );

	return mul( 2.2, n_xyz );

} );

export const main = /*@__PURE__*/ Fn( () => {

	const freq = float( 8.0 );
	const uvCoord = uv();
	const noiseR = perlin3dPeriodic( vec3( uvCoord.mul( freq ), 123.456 ), vec3( freq ) ).mul( 0.5 ).add( 0.5 );
	const noiseG = perlin3dPeriodic( vec3( uvCoord.mul( freq ), 456.789 ), vec3( freq ) ).mul( 0.5 ).add( 0.5 );
	const noiseB = perlin3dPeriodic( vec3( uvCoord.mul( freq ), 789.123 ), vec3( freq ) ).mul( 0.5 ).add( 0.5 );
	return vec4( noiseR, noiseG, noiseB, 1.0 );

} );

// Wire to NodeMaterial:
//   material.colorNode = main();
