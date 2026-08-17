// Three.js Transpiler r183

import { varying, vec3, normalize, positionLocal, Fn } from 'three/tsl';

export const vWorldDir = varying( vec3(), 'vWorldDir' );

export const main = /*@__PURE__*/ Fn( () => {

	/* World-space direction for FBM noise sampling in frag */

	vWorldDir.assign( normalize( positionLocal ) );

	return positionLocal;

} );

// Wire to NodeMaterial:
//   material.vertexNode = main();
// positionNode is not needed — Three.js default MVP handles gl_Position correctly.
