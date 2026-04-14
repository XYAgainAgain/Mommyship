// Three.js Transpiler r183

import { Fn, float, length, clamp, smoothstep, vec4, uv } from 'three/tsl';

// inverseLerp: maps v from [minVal, maxVal] range to [0, 1].
// Note: minVal=0.15, maxVal=0.0 in the call below is intentional — inverted range
// so that dist=0 (center) -> strength=1, dist=0.15 (edge) -> strength=0.
export const inverseLerp = /*@__PURE__*/ Fn( ( [ v, minVal, maxVal ] ) => {

	return v.sub( minVal ).div( maxVal.sub( minVal ) );

} );

// Uses uv() built-in — vUv was a pure UV pass-through, no varying() needed.
export const main = /*@__PURE__*/ Fn( () => {

	const screenUV = uv();
	const dist = length( screenUV.sub( 0.5 ) );

	/* 0.15 matches masshole — steep gradient so inner disk falls in high-distortion zone */

	const strength = clamp( inverseLerp( dist, float( 0.15 ), float( 0.0 ) ), 0.0, 1.0 ).toVar();
	strength.assign( smoothstep( 0.0, 1.0, strength ) );

	/* Fully opaque — primes the entire distortion RT as a base layer.
	   The mask plane then sculpts it into a disc shape via alpha blending. */

	return vec4( strength, 1.0, 1.0, 1.0 );

} );

// Wire: material.colorNode = main();
