// Three.js Transpiler r183

import { Discard, float, Fn, If, length, mul, pointUV, sub, varying, uniform, varyingProperty, vec2, vec3, vec4 } from 'three/tsl';

export const uOpacity = uniform( float( 0 ) );
const vColor = varyingProperty( 'vec3', 'vColor' );

export const main = /*@__PURE__*/ Fn( () => {

	const dist = length( pointUV.sub( vec2( 0.5 ) ) );

	If( dist.greaterThan( 0.5 ), () => {

		Discard();

	} );

	return vec4( vColor, mul( 0.5, uOpacity ) );

} );