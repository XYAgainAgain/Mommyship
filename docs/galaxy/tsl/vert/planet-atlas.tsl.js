// Three.js Transpiler r183

import { attribute, float, Fn, vertexColor, positionLocal, varying, uniform, uv, vec2, vec3, vec4 } from 'three/tsl';

/* aLayer/aCrossfade/aChurn packed into one vec3 to stay under WebGPU's 8 vertex buffer limit */
const aPackedInfo = attribute( 'aPackedInfo', 'vec3' );
const aAtmosphere = attribute( 'aAtmosphere', 'vec4' );
const aLightDir = attribute( 'aLightDir', 'vec3' );
export const vUv = varying( vec2(), 'vUv' );
export const vLayer = varying( float(), 'vLayer' );
export const vCrossfade = varying( float(), 'vCrossfade' );
export const vInstanceColor = varying( vec3(), 'vInstanceColor' );
export const vLightDir = varying( vec3(), 'vLightDir' );
export const vLocalPos = varying( vec3(), 'vLocalPos' );
export const vChurn = varying( float(), 'vChurn' );
export const vAtmosphere = varying( vec4(), 'vAtmosphere' );
export const vViewDir = varying( vec3(), 'vViewDir' );
export const uVisualScale = uniform( float( 0 ) );

export const main = /*@__PURE__*/ Fn( () => {

	vUv.assign( uv() );
	vLayer.assign( aPackedInfo.x );
	vCrossfade.assign( aPackedInfo.y );
	vInstanceColor.assign( vertexColor );

	/* Remaining varyings omitted while debug frag is active — add back when restoring real frag.
	   DO NOT assign positionLocal to a varying — it confuses TSL's clip-space codegen. */

	return positionLocal.mul( uVisualScale );

} );

// Wire to NodeMaterial (InstancedMesh — modelWorldMatrix applied automatically):
//   material.positionNode = main();
