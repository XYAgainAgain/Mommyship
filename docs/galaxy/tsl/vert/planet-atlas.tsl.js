// Three.js Transpiler r183

import { attribute, float, Fn, positionLocal, varying, uniform, uv, vec2, vec3, vertexColor } from 'three/tsl';

/* Atlas markers (distant InstancedMesh): per-instance color via vertexColor built-in
   (setColorAt path), not attribute('color') (that's InstancedBufferGeometry's path).
   aAtmosphere/aLightDir are wired on geometry in systems.js for future atlas-frag
   features (lighting tint, atmo glow) — not read here while the frag is color-only. */
const aPackedInfo = attribute( 'aPackedInfo', 'vec3' );
export const vUv = varying( vec2(), 'vUv' );
export const vLayer = varying( float(), 'vLayer' );
export const vCrossfade = varying( float(), 'vCrossfade' );
export const vInstanceColor = varying( vec3(), 'vInstanceColor' );
export const uVisualScale = uniform( float( 0 ) );

export const main = /*@__PURE__*/ Fn( () => {

	vUv.assign( uv() );
	vLayer.assign( aPackedInfo.x );
	vCrossfade.assign( aPackedInfo.y );
	vInstanceColor.assign( vertexColor );

	return positionLocal.mul( uVisualScale );

} );

// Wire to NodeMaterial (InstancedMesh — modelWorldMatrix applied automatically):
//   material.positionNode = main();
