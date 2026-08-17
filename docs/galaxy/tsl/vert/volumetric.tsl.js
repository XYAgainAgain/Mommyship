// Three.js Transpiler r183

import { Fn, normalize, positionLocal, varying, vec3 } from 'three/tsl';

/* Raymarch origin/direction in the sphere's own local space. The camera →
   local transform is computed JS-side (see volumetric.js per-frame update)
   and passed in as a per-material uniform — doing it with
   modelWorldMatrixInverse inside a positionNode trips TSL's WGSL codegen
   (empty builtinClipSpace). */
const vRayOrigin = varying( vec3(), 'vRayOrigin' );
const vRayDir = varying( vec3(), 'vRayDir' );

export const main = /*@__PURE__*/ Fn( ( [ uLocalCam ] ) => {

	vRayOrigin.assign( uLocalCam );
	vRayDir.assign( normalize( positionLocal.sub( uLocalCam ) ) );

	return positionLocal;

} );

// Wire to NodeMaterial:
//   material.positionNode = main( pLocalCam );
