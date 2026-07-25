// Three.js Transpiler r183

import { add, Discard, div, float, Fn, If, max, mix, mul, smoothstep, texture, varying, varyingProperty, vec2, vec4 } from 'three/tsl';

/* Sprite sheet accepted as a parameter so each population can have its own texture */
const vUv0 = varyingProperty( 'vec2', 'vUv0' );
const vUv1 = varyingProperty( 'vec2', 'vUv1' );
const vBlend = varyingProperty( 'float', 'vBlend' );
const vTint = varyingProperty( 'float', 'vTint' );
const vRadius = varyingProperty( 'float', 'vRadius' );
const vTintColor = varyingProperty( 'vec3', 'vTintColor' );
const vRimColor = varyingProperty( 'vec3', 'vRimColor' );

export const main = /*@__PURE__*/ Fn( ( [ spriteSheet ] ) => {

	/* Cross-fade between current and next sprite frame */

	const texA = spriteSheet.sample( vUv0 );
	const texB = spriteSheet.sample( vUv1 );
	const tex = mix( texA, texB, vBlend ).toVar();

	/* Use max alpha so blending between misaligned silhouettes can't dip below cutoff */

	tex.a.assign( max( texA.a, texB.a ) );

	If( tex.a.lessThan( 0.35 ), () => {

		Discard();

	} );

	const surfaceColor = tex.rgb.mul( vTintColor ).mul( vTint ).toVar();

	/* Subtle rim brightening at silhouette edges — scattered galactic light */

	const rimFade = smoothstep( 0.35, 0.6, tex.a );
	surfaceColor.assign( mix( vRimColor.add( surfaceColor.mul( 0.5 ) ), surfaceColor, rimFade ) );
	return vec4( surfaceColor, 1.0 );

} );