// Three.js Transpiler r183

import { Fn, normalize, positionLocal, varying, vec3 } from 'three/tsl';

/* vSphereNormal: un-rotated outward sphere direction, used for lighting NdotL.
   The planet group has no rotation in world space, so local == world frame —
   TSL's normalWorld built-in was returning zero/garbage here (possibly because
   the vert never referenced normalLocal, starving the auto-varying setup). */
const vSphereNormal = varying( vec3(), 'vSphereNormal' );
const vLocalPos = varying( vec3(), 'vLocalPos' );

export const main = /*@__PURE__*/ Fn( ( [ uCloudRotation ] ) => {

	const sphereDir = normalize( positionLocal );
	vSphereNormal.assign( sphereDir );
	vLocalPos.assign( uCloudRotation.mul( sphereDir ) );

	/* .xyz prevents TSL from emitting empty builtinClipSpace when positionLocal
	   is also read into a varying above. */
	return positionLocal.xyz;

} );

// Wire to NodeMaterial:
//   material.positionNode = main( pCloudRotation );
