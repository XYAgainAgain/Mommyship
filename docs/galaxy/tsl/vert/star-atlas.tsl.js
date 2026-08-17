// Three.js Transpiler r183

import { attribute, float, Fn, positionLocal, varying, uniform, uv, vec2, vec3, vertexColor } from 'three/tsl';

/* InstancedMesh.setColorAt uses the vertexColor TSL built-in (different from InstancedBufferGeometry, which fails on vertexColor) */
const aLayer = attribute( 'aLayer', 'float' );
const aCrossfade = attribute( 'aCrossfade', 'float' );
const aDetailFade = attribute( 'aDetailFade', 'float' );
export const vUv = varying( vec2(), 'vUv' );
export const vLayer = varying( float(), 'vLayer' );
export const vCrossfade = varying( float(), 'vCrossfade' );
export const vDetailFade = varying( float(), 'vDetailFade' );
export const vInstanceColor = varying( vec3(), 'vInstanceColor' );
export const uVisualScale = uniform( float( 0 ) );

export const main = /*@__PURE__*/ Fn( () => {

	vUv.assign( uv() );
	vLayer.assign( aLayer );
	vCrossfade.assign( aCrossfade );
	vDetailFade.assign( aDetailFade );
	vInstanceColor.assign( vertexColor() );

	/* Shrink vertex positions so the rendered star is smaller than the raycast hitbox */

	return positionLocal.mul( uVisualScale );

} );

// Wire to NodeMaterial (InstancedMesh — objectWorldMatrix applied automatically):
//   material.positionNode = main();
