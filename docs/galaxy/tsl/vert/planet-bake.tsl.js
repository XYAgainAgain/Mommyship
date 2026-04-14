// Three.js Transpiler r183

import { Fn, varying, uv, vec2, positionLocal } from 'three/tsl';

const vUv = varying( vec2(), 'vUv' );

export const main = /*@__PURE__*/ Fn( () => {

	vUv.assign( uv() );

	return positionLocal;

} );

// Wire to NodeMaterial:
//   material.vertexNode = main();
// No positionNode needed — default MVP handles the bake quad.
