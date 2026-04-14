// Three.js TSL r183

import { add, cos, Discard, float, Fn, If, length, mul, sin, smoothstep, sub, varyingProperty, vec2, vec4 } from 'three/tsl';

const vUv = varyingProperty( 'vec2', 'vUv' );

/* All per-dome uniforms accepted as parameters so each dome instance
   can have its own texture, opacity, warp mode, etc. */

export const main = /*@__PURE__*/ Fn( ( [ texNode, noiseNode, timeNode, opacityNode, pulseStrengthNode, pulseSpeedNode, warpModeNode ] ) => {

	const centered = vUv.sub( 0.5 );
	const dist = length( centered ).mul( 2.0 );

	/* Donut fade: transparent at center (BH clearance), full mid-range, zero at edges */

	const innerFade = smoothstep( 0.04, 0.15, dist );
	const outerFade = sub( 1.0, smoothstep( 0.3, 1.0, dist ) );
	const fade = innerFade.mul( outerFade );

	If( fade.lessThan( 0.001 ), () => {

		Discard();

	} );

	const warpedUV = vUv.toVar();

	If( warpModeNode.equal( 0 ), () => {

		/* Sine-based warp: coprime frequencies for organic swirl */

		const t = timeNode;
		warpedUV.x.addAssign( sin( vUv.y.mul( 4.7 ).add( t.mul( 0.11 ) ) ).mul( cos( vUv.x.mul( 3.1 ).add( t.mul( 0.07 ) ) ) ).mul( 0.04 ) );
		warpedUV.y.addAssign( sin( vUv.x.mul( 5.3 ).add( t.mul( 0.13 ) ) ).mul( cos( vUv.y.mul( 2.9 ).add( t.mul( 0.09 ) ) ) ).mul( 0.04 ) );
		warpedUV.x.addAssign( sin( vUv.y.mul( 8.1 ).add( t.mul( 0.19 ) ) ).mul( 0.015 ) );
		warpedUV.y.addAssign( cos( vUv.x.mul( 7.3 ).add( t.mul( 0.17 ) ) ).mul( 0.015 ) );

	} ).Else( () => {

		/* Noise-based warp: scrolling Perlin offsets */

		const t = timeNode.mul( 0.03 );
		const noiseUV1 = vUv.mul( 1.5 ).add( vec2( t, t.mul( 0.7 ) ) );
		const noiseUV2 = vUv.mul( 2.3 ).add( vec2( t.negate().mul( 0.8 ), t.mul( 0.5 ) ) );
		const n1 = noiseNode.sample( noiseUV1 ).r;
		const n2 = noiseNode.sample( noiseUV2 ).r;
		warpedUV.addAssign( vec2( n1, n2 ).sub( 0.5 ).mul( 0.06 ) );

	} );

	const tex = texNode.sample( warpedUV );

	/* Luminosity pulse with second harmonic */

	const pulse = add( 1.0, pulseStrengthNode.mul( sin( timeNode.mul( pulseSpeedNode ) ) ) ).add( pulseStrengthNode.mul( 0.5 ).mul( sin( timeNode.mul( pulseSpeedNode ).mul( 1.7 ).add( 1.0 ) ) ) );
	const surfaceColor = tex.rgb.mul( fade ).mul( pulse );
	const alpha = fade.mul( opacityNode );

	/* Black pixels contribute nothing under additive blending */

	return vec4( surfaceColor.mul( alpha ), alpha );

} );
