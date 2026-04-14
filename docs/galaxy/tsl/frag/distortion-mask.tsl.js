// Three.js Transpiler r183

import { Fn, float, length, clamp, smoothstep, vec4, uv } from 'three/tsl';

// inverseLerp: maps v from [minVal, maxVal] range to [0, 1].
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

	/* Alpha edge fade to shape distortion into a disc */

	const alpha = smoothstep( 0.0, 1.0, clamp( inverseLerp( dist, float( 0.5 ), float( 0.4 ) ), 0.0, 1.0 ) );
	return vec4( strength, 0.0, 0.0, alpha );

} );

// Wire: material.colorNode = main();
