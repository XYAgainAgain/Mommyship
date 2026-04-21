// Three.js Transpiler r183 — rewritten for instanced billboard quads (WebGPU has no point sprites)

import { attribute, cross, float, Fn, normalize, positionLocal, sin, uniform, varyingProperty, vec3 } from 'three/tsl';

const aOffset     = attribute( 'aOffset',     'vec3' );
const aColor      = attribute( 'color',       'vec3' );
const aSize       = attribute( 'aSize',       'float' );
const aBrightness = attribute( 'aBrightness', 'float' );
const aPhase      = attribute( 'aPhase',      'float' );

export const vColor      = varyingProperty( 'vec3',  'vColor' );
export const vBrightness = varyingProperty( 'float', 'vBrightness' );

export const uTime = uniform( float( 0 ) );

export const main = /*@__PURE__*/ Fn( () => {

	vColor.assign( aColor );

	/* Twinkle via sin wave offset by per-particle phase */

	const twinkle = float( 0.7 ).add( float( 0.3 ).mul( sin( uTime.mul( 2.0 ).add( aPhase.mul( 6.2831 ) ) ) ) );
	vBrightness.assign( aBrightness.mul( twinkle ) );

	/* Spherical billboard — quad faces the camera sitting at the sphere's center */
	const forward = normalize( aOffset );
	const right = normalize( cross( vec3( 0, 1, 0 ), forward ) );
	const up = cross( forward, right );

	/* Constant world scale — starfield sits on the fixed-radius skybox sphere. */
	const scale = aSize.mul( 0.6 );

	return aOffset.add( right.mul( positionLocal.x.mul( scale ) ) ).add( up.mul( positionLocal.y.mul( scale ) ) );

} );

// Wire to MeshBasicNodeMaterial (InstancedBufferGeometry with PlaneGeometry quad):
//   material.positionNode = main();
