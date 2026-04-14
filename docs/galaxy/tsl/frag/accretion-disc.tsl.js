// Three.js Transpiler r183

import { add, clamp, div, float, Fn, Loop, max, min, mix, mul, smoothstep, sub, texture, uniform, varyingProperty, vec2, vec3, vec4 } from 'three/tsl';

export const uTime = uniform( float( 0 ) );
export const uOpacity = uniform( float( 0 ) );
export const uNoiseTexture = texture( null );
const vUv = varyingProperty( 'vec2', 'vUv' );

export const inverseLerp = /*@__PURE__*/ Fn( ( [ v, minVal, maxVal ] ) => {

	return v.sub( minVal ).div( maxVal.sub( minVal ) );

} );

/* vUv.y = 0 at inner edge (near BH), 1 at outer edge */

export const diskGradient = /*@__PURE__*/ Fn( ( [ t ] ) => {

	const c0 = vec3( 1.0, 0.90, 0.97 );
	const c1 = vec3( 0.95, 0.30, 0.60 );
	const c2 = vec3( 0.12, 0.30, 0.55 );
	const c3 = vec3( 0.51, 0.20, 0.67 );
	const c4 = vec3( 0.80, 0.65, 0.30 );
	const surfaceColor = mix( c0, c1, smoothstep( 0.0, 0.15, t ) ).toVar();
	surfaceColor.assign( mix( surfaceColor, c2, smoothstep( 0.15, 0.35, t ) ) );
	surfaceColor.assign( mix( surfaceColor, c3, smoothstep( 0.35, 0.60, t ) ) );
	surfaceColor.assign( mix( surfaceColor, c4, smoothstep( 0.60, 0.90, t ) ) );

	return surfaceColor;

} );

export const main = /*@__PURE__*/ Fn( () => {

	const surfaceColor = vec4( 0.0 ).toVar();

	Loop( { start: 0, end: 3 }, ( { i } ) => {

		const layerOffset = float( i ).div( 2.0 );
		const intensity = sub( 1.0, vUv.y.sub( layerOffset ).mul( 3.0 ).mul( 0.5 ) ).toVar();
		intensity.assign( smoothstep( 0.0, 1.0, intensity ) );
		const layerUv = vUv.toVar();
		layerUv.y.mulAssign( 2.0 );
		layerUv.x.addAssign( uTime.div( float( i ).mul( 10.0 ).add( 1.0 ) ) );

		/* Gradient driven by radial position, with noise-warped streaks */

		const noiseIntensity = uNoiseTexture.sample( layerUv ).r;

		/* Warp the radial lookup slightly per layer for streaky banding */

		const warpedY = vUv.y.add( noiseIntensity.sub( 0.5 ).mul( 0.12 ).mul( add( 1.0, float( i ).mul( 0.3 ) ) ) );
		const ringColor = diskGradient( clamp( warpedY, 0.0, 1.0 ) ).toVar();

		/* Per-layer hue shift adds swirly color variety within bands */

		const hueShift = noiseIntensity.sub( 0.5 ).mul( 0.2 );
		ringColor.assign( max( vec3( ringColor.r.add( hueShift.mul( 0.4 ) ), ringColor.g.sub( hueShift.mul( 0.2 ) ), ringColor.b.add( hueShift.mul( 0.6 ) ) ), vec3( 0.0 ) ) );
		ringColor.mulAssign( noiseIntensity.mul( intensity ) );
		surfaceColor.rgb.addAssign( ringColor.mul( 0.45 ) );

	} );

	/* Edge attenuation at inner/outer boundaries */

	const edges = min( clamp( inverseLerp( vUv.y, 0.0, 0.02 ), 0.0, 1.0 ), clamp( inverseLerp( vUv.y, 1.0, 0.5 ), 0.0, 1.0 ) );
	surfaceColor.rgb.assign( mix( vec3( 0.0 ), surfaceColor.rgb, edges ) );
	surfaceColor.a.assign( uOpacity );
	return surfaceColor;

} );