// Three.js Transpiler r183

import { Fn, modelWorldMatrixInverse, normalize, positionLocal, varying, uniform, vec3, vec4 } from 'three/tsl';

const vRayOrigin = varying( vec3(), 'vRayOrigin' );
const vRayDir = varying( vec3(), 'vRayDir' );

export const uCameraPos = uniform( vec3( 0, 0, 0 ) );

export const main = /*@__PURE__*/ Fn( () => {

	/* Camera → local space for raymarch in box's -0.5 to 0.5 range */

	const localCam = modelWorldMatrixInverse.mul( vec4( uCameraPos, 1.0 ) ).xyz;
	vRayOrigin.assign( localCam );
	vRayDir.assign( normalize( positionLocal.sub( localCam ) ) );

	return positionLocal;

} );

// Wire to NodeMaterial:
//   material.vertexNode = main();
// No positionNode needed — default MVP handles the box geometry correctly.
