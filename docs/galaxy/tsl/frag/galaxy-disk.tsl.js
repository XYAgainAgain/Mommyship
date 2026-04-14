// Three.js Transpiler r183

import { Discard, Fn, If, length, smoothstep, uv, vec2, vec4 } from 'three/tsl';

export const main = /*@__PURE__*/ Fn( () => {

	const dist = length( uv().sub( vec2( 0.5 ) ) );

	If( dist.greaterThan( 0.5 ), () => {

		Discard();

	} );

	/* Warm white star with bright core + soft glow falloff */

	const core = smoothstep( 0.3, 0.05, dist );
	const glow = smoothstep( 0.5, 0.15, dist ).mul( 0.2 );
	const alpha = core.add( glow ).mul( 0.45 );
	return vec4( alpha, alpha.mul( 0.95 ), alpha.mul( 0.85 ), alpha );

} );
