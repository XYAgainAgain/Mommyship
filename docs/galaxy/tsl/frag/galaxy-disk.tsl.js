import { Discard, Fn, If, length, smoothstep, uv, varyingProperty, vec2, vec4 } from 'three/tsl';

const vColor      = varyingProperty( 'vec3',  'vColor' );
const vBrightness = varyingProperty( 'float', 'vBrightness' );

export const main = /*@__PURE__*/ Fn( () => {

	/* dist 0→0.5 matches gl_PointCoord range from the original GLSL */
	const dist = length( uv().sub( vec2( 0.5 ) ) );

	If( dist.greaterThan( 0.5 ), () => { Discard(); } );

	/* Original dual-smoothstep: tight bright core + faint glow halo */
	const core = smoothstep( 0.3, 0.05, dist );
	const glow = smoothstep( 0.5, 0.15, dist ).mul( 0.2 );
	const alpha = core.add( glow ).mul( vBrightness );
	return vec4( vColor, alpha );

} );
