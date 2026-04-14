// Three.js Transpiler r183

import { Discard, div, exp, float, Fn, fract, If, max, mix, mul, negate, pow, smoothstep, step, sub, varyingProperty, vec3, vec4 } from 'three/tsl';

const vTrailPos = varyingProperty( 'float', 'vTrailPos' );

/* All per-orbit uniforms accepted as parameters for multi-instance rendering */

export const main = /*@__PURE__*/ Fn( ( [ trailLength, attenuate, lucency, tracked, orbitColor, dashed ] ) => {

	If( vTrailPos.greaterThan( trailLength ), () => {

		Discard();

	} );

	const p = vTrailPos.div( max( trailLength, 0.001 ) );

	/* THRASTRO-style exponential trail fade from body position backward */

	const alpha = pow( exp( p.negate().mul( attenuate ) ), 2.0 ).mul( lucency ).toVar();

	/* Soft cutoff at trail end so it doesn't terminate abruptly */

	alpha.mulAssign( sub( 1.0, smoothstep( 0.85, 1.0, p ) ) );

	/* Tracked orbit pops, siblings recede */

	alpha.mulAssign( mix( 0.55, 1.0, step( 0.5, tracked ) ) );

	/* GPU-side dash pattern for moon-depth orbits */

	If( dashed.greaterThan( 0.5 ), () => {

		If( fract( vTrailPos.mul( 40.0 ) ).greaterThan( 0.55 ), () => {

			Discard();

		} );

	} );

	return vec4( orbitColor, alpha );

} );