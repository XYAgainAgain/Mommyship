// Three.js Transpiler r183

import { Discard, Fn, If, dot, float, fract, int, max, mix, normalize, screenCoordinate, texture, uniform, varyingProperty, vec4 } from 'three/tsl';

/* Mirror of star-atlas: sample the DataArrayTexture with .depth(int) for the
   layer index, then crossfade with instance (faction) color. */
const vUv = varyingProperty( 'vec2', 'vUv' );
const vLayer = varyingProperty( 'float', 'vLayer' );
const vCrossfade = varyingProperty( 'float', 'vCrossfade' );
const vInstanceColor = varyingProperty( 'vec3', 'vInstanceColor' );
const vDetailFade = varyingProperty( 'float', 'vDetailFade' );
const vLightDir = varyingProperty( 'vec3', 'vLightDir' );
const vSphereNormal = varyingProperty( 'vec3', 'vSphereNormal' );

export const uAtlas = texture( null );
/* uTime kept as a no-op export — systems.js still drives .value each frame,
   and the churn pass will use it when churn is restored on atlas. */
export const uTime = uniform( float( 0 ) );

export const main = /*@__PURE__*/ Fn( () => {

	/* IGN (Jimenez 2014) complementary discard with the detail mesh —
	   each screen pixel draws from exactly one LOD surface, no alpha blend */
	const ign = fract( float( 52.9829189 ).mul(
		fract( float( 0.06711056 ).mul( screenCoordinate.x )
			.add( float( 0.00583715 ).mul( screenCoordinate.y ) ) ) ) );
	If( ign.lessThan( vDetailFade ), () => { Discard(); } );

	/* Round, don't truncate — see star-atlas.tsl.js (layer-flip wobble on Firefox) */
	const texColor = uAtlas.sample( vUv ).depth( int( vLayer.add( 0.5 ) ) ).rgb;

	/* Lambert ramps in with the detail fade only — unlit at map scale so dark-side
	   planets never vanish; by detail time the atlas already shows the terminator */
	const NdotL = max( 0.0, dot( normalize( vSphereNormal ), normalize( vLightDir ) ) );
	const shade = mix( 1.0, NdotL.mul( 0.88 ).add( 0.12 ), vDetailFade );

	const color = mix( vInstanceColor, texColor.mul( shade ), vCrossfade );
	return vec4( color, 1.0 );

} );
