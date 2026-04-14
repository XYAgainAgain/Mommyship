// Three.js Transpiler r183

import { add, Discard, div, dot, float, Fn, If, max, mix, mul, smoothstep, texture, varying, varyingProperty, vec2, vec3, vec4 } from 'three/tsl';

/* Both textures accepted as parameters so each population can have its own sprite sheet */
const vUv0 = varyingProperty( 'vec2', 'vUv0' );
const vUv1 = varyingProperty( 'vec2', 'vUv1' );
const vBlend = varyingProperty( 'float', 'vBlend' );
const vTint = varyingProperty( 'float', 'vTint' );
const vRadius = varyingProperty( 'float', 'vRadius' );
const vCanonicalXZ = varyingProperty( 'vec2', 'vCanonicalXZ' );

export const main = /*@__PURE__*/ Fn( ( [ spriteSheet, lightmapTex ] ) => {

	/* Cross-fade between current and next sprite frame */

	const texA = spriteSheet.sample( vUv0 );
	const texB = spriteSheet.sample( vUv1 );
	const tex = mix( texA, texB, vBlend ).toVar();

	/* Use max alpha so blending between misaligned silhouettes can't dip below cutoff */

	tex.a.assign( max( texA.a, texB.a ) );

	If( tex.a.lessThan( 0.35 ), () => {

		Discard();

	} );

	/* Sample galactic lightmap at canonical position (+-500 map units -> 0-1 UV) */

	const lmUV = vCanonicalXZ.div( 1000.0 ).add( 0.5 );
	const illum = lightmapTex.sample( lmUV ).rgb;
	const illumBright = dot( illum, vec3( 0.299, 0.587, 0.114 ) );
	const baseTint = vec3( 0.78, 0.72, 0.88 );
	const tint = mix( baseTint.mul( 0.4 ), illum.add( baseTint.mul( 0.15 ) ), smoothstep( 0.02, 0.15, illumBright ) );
	const surfaceColor = tex.rgb.mul( tint ).mul( vTint ).toVar();

	/* Subtle rim brightening at silhouette edges — scattered galactic light */

	const rimFade = smoothstep( 0.35, 0.6, tex.a );
	const rimColor = illum.mul( 0.25 ).add( baseTint.mul( 0.12 ) );
	surfaceColor.assign( mix( rimColor.add( surfaceColor.mul( 0.5 ) ), surfaceColor, rimFade ) );
	return vec4( surfaceColor, 1.0 );

} );