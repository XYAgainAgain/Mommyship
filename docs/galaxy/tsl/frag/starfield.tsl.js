import { Discard, Fn, If, length, smoothstep, uv, varyingProperty, vec2, vec4 } from 'three/tsl';

const vColor      = varyingProperty( 'vec3',  'vColor' );
const vBrightness = varyingProperty( 'float', 'vBrightness' );

export const main = /*@__PURE__*/ Fn( () => {

	const dist = length( uv().sub( vec2( 0.5 ) ) );
	If( dist.greaterThan( 0.5 ), () => { Discard(); } );

	/* Non-premult; Additive's SrcAlpha factor would double-dip a premult output. */
	const alpha = smoothstep( 0.5, 0.1, dist ).mul( vBrightness );
	return vec4( vColor, alpha );

} );
