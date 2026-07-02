import { clamp, float, Fn, length, smoothstep, uv, varyingProperty, vec2, vec4 } from 'three/tsl';

const vGAlpha = varyingProperty( 'float', 'vGAlpha' );
const vGColor = varyingProperty( 'vec3', 'vGColor' );

export const main = /*@__PURE__*/ Fn( () => {

	const d = length( uv().sub( vec2( 0.5 ) ) ).mul( 2 );
	const fall = float( 1 ).sub( smoothstep( float( 0 ), float( 1 ), d ) );

	/* Non-premult; Additive's SrcAlpha factor would double-dip a premult output. */
	return vec4( vGColor, clamp( fall.mul( vGAlpha ), float( 0 ), float( 1 ) ) );

} );
