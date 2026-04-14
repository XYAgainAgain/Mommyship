// Three.js Transpiler r183

import { Fn, normalize, positionLocal, varying, vec3 } from 'three/tsl';

const vNormal = varying( vec3(), 'vNormal' );
const vSphereNormal = varying( vec3(), 'vSphereNormal' );
const vViewDir = varying( vec3(), 'vViewDir' );
const vWorldPos = varying( vec3(), 'vWorldPos' );
const vLocalPos = varying( vec3(), 'vLocalPos' );

/* Per-instance uniforms accepted as parameters */

export const main = /*@__PURE__*/ Fn( ( [ uCloudRotation ] ) => {

	/* Only vLocalPos is set — modelWorldMatrix/mat3/cameraPosition break TSL WGSL codegen.
	   When the real frag is restored, vSphereNormal/vViewDir/vWorldPos will be computed
	   from positionWorld/normalWorld built-ins in the fragment shader instead. */
	vLocalPos.assign( uCloudRotation.mul( normalize( positionLocal ) ) );

	/* .xyz creates a derived node — returning positionLocal directly causes TSL
	   to generate empty builtinClipSpace when positionLocal is also used in a varying */
	return positionLocal.xyz;

} );

// Wire to NodeMaterial:
//   material.positionNode = main();
