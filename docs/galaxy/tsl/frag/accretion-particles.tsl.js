// Three.js Transpiler r183

import { Discard, float, Fn, If, length, mul, uv, uniform, varyingProperty, vec2, vec4 } from 'three/tsl';

/* Converted from Points → InstancedBufferGeometry quads. WebGPU has no
   variable-size point sprites, so pointUV/gl_PointCoord isn't available.
   PlaneGeometry(1,1) UVs span 0→1, so the same center-dist math works. */
export const uOpacity = uniform( float( 0 ) );
const vColor = varyingProperty( 'vec3', 'vColor' );

export const main = /*@__PURE__*/ Fn( () => {

	const dist = length( uv().sub( vec2( 0.5 ) ) );

	If( dist.greaterThan( 0.5 ), () => {

		Discard();

	} );

	return vec4( vColor, mul( 0.5, uOpacity ) );

} );
