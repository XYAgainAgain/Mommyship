// Three.js Transpiler r183 — uses quad uv() instead of pointUV (WebGPU has no gl_PointCoord)

import { Discard, float, Fn, If, length, smoothstep, uv, varyingProperty, vec2, vec3, vec4 } from 'three/tsl';

const vColor      = varyingProperty( 'vec3',  'vColor' );
const vBrightness = varyingProperty( 'float', 'vBrightness' );

export const main = /*@__PURE__*/ Fn( () => {

	/* DEBUG — bright white disc to test starfield pipeline */
	const dist = length( uv().sub( vec2( 0.5 ) ) );
	If( dist.greaterThan( 0.5 ), () => { Discard(); } );
	return vec4( 1.0, 1.0, 1.0, smoothstep( 0.5, 0.1, dist ) );

} );

// Wire to MeshBasicNodeMaterial:
//   material.fragmentNode = main();
