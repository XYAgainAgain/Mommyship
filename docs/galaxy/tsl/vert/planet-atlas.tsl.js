// Three.js Transpiler r183

import { attribute, float, Fn, normalize, positionLocal, varying, uniform, uv, vec2, vec3, vertexColor } from 'three/tsl';

/* Atlas markers (distant InstancedMesh): per-instance color via vertexColor() built-in
   (setColorAt path), not attribute('color') (that's InstancedBufferGeometry's path). */
const aPackedInfo = attribute( 'aPackedInfo', 'vec4' );
/* Pre-rotated into instance-local space JS-side so the frag can light
   against the local sphere normal with no matrix work. */
const aLightDir = attribute( 'aLightDir', 'vec3' );
export const vUv = varying( vec2(), 'vUv' );
export const vLayer = varying( float(), 'vLayer' );
export const vCrossfade = varying( float(), 'vCrossfade' );
export const vInstanceColor = varying( vec3(), 'vInstanceColor' );
export const vDetailFade = varying( float(), 'vDetailFade' );
export const vLightDir = varying( vec3(), 'vLightDir' );
export const vSphereNormal = varying( vec3(), 'vSphereNormal' );
export const uVisualScale = uniform( float( 0 ) );

export const main = /*@__PURE__*/ Fn( () => {

	vUv.assign( uv() );
	vLayer.assign( aPackedInfo.x );
	vCrossfade.assign( aPackedInfo.y );
	vDetailFade.assign( aPackedInfo.w );
	vInstanceColor.assign( vertexColor() );
	vLightDir.assign( aLightDir );
	vSphereNormal.assign( normalize( positionLocal ) );

	return positionLocal.mul( uVisualScale );

} );

// Wire to NodeMaterial (InstancedMesh — modelWorldMatrix applied automatically):
//   material.positionNode = main();
