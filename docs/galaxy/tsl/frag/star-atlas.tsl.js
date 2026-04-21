// Three.js Transpiler r183

import { Fn, int, mix, texture, varyingProperty, vec4 } from 'three/tsl';

/* Atlas is a DataArrayTexture (from WebGLArrayRenderTarget.texture). TSL r184
   uses .depth(int) to set the layer index on array textures — this is the
   canonical replacement for GLSL's texture(sampler2DArray, vec3(uv, layer)). */
const vUv = varyingProperty( 'vec2', 'vUv' );
const vLayer = varyingProperty( 'float', 'vLayer' );
const vCrossfade = varyingProperty( 'float', 'vCrossfade' );
const vInstanceColor = varyingProperty( 'vec3', 'vInstanceColor' );

export const uAtlas = texture( null );

export const main = /*@__PURE__*/ Fn( () => {

	const texColor = uAtlas.sample( vUv ).depth( int( vLayer ) ).rgb;
	const color = mix( vInstanceColor, texColor, vCrossfade );
	return vec4( color, 1.0 );

} );
