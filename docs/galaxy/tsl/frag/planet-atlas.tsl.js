// Three.js Transpiler r183

import { float, Fn, int, mix, texture, uniform, varyingProperty, vec4 } from 'three/tsl';

/* Mirror of star-atlas: sample the DataArrayTexture with .depth(int) for the
   layer index, then crossfade with instance (faction) color. Full procedural
   lighting / atmosphere rim from the GLSL frag is deferred — distant markers
   don't need per-pixel light, just the baked per-subtype silhouette. */
const vUv = varyingProperty( 'vec2', 'vUv' );
const vLayer = varyingProperty( 'float', 'vLayer' );
const vCrossfade = varyingProperty( 'float', 'vCrossfade' );
const vInstanceColor = varyingProperty( 'vec3', 'vInstanceColor' );

export const uAtlas = texture( null );
/* uTime kept as a no-op export — systems.js still drives .value each frame,
   and the churn pass will use it when lighting/atmo is restored on atlas. */
export const uTime = uniform( float( 0 ) );

export const main = /*@__PURE__*/ Fn( () => {

	const texColor = uAtlas.sample( vUv ).depth( int( vLayer ) ).rgb;
	const color = mix( vInstanceColor, texColor, vCrossfade );
	return vec4( color, 1.0 );

} );
