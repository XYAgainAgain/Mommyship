// Three.js Transpiler r183

import { float, Fn, mix, texture, varyingProperty, vec2, vec3, vec4 } from 'three/tsl';

const vUv = varyingProperty( 'vec2', 'vUv' );
const vLayer = varyingProperty( 'float', 'vLayer' );
const vCrossfade = varyingProperty( 'float', 'vCrossfade' );
const vInstanceColor = varyingProperty( 'vec3', 'vInstanceColor' );

export const uAtlas = texture( null );

export const main = /*@__PURE__*/ Fn( () => {

	/* DEBUG — bright red to test atlas InstancedMesh pipeline */
	return vec4( 1.0, 0.0, 0.0, 1.0 );

} );