// Three.js Transpiler r183

import { abs, acos, add, Break, clamp, Continue, cos, div, dot, exp, float, floor, Fn, fract, frontFacing, If, int, length, log, Loop, max, min, mix, mul, normalize, pow, property, Return, select, sin, smoothstep, sqrt, step, sub, uniform, varyingProperty, vec2, vec3, vec4 } from 'three/tsl';

const vSphereNormal = varyingProperty( 'vec3', 'vSphereNormal' );
const vViewDir = varyingProperty( 'vec3', 'vViewDir' );
const vLocalPos = varyingProperty( 'vec3', 'vLocalPos' );

/* Shared across all detail instances */
export const uTime = uniform( float( 0 ) );

/* Per-instance uniforms accepted as parameters */

import {
	uvToSphere, hash33, gnoised, fbmd, fbm, ridgedFbm, gerstnerWave, blackbodyRGB,
	craterHash33, craterNoise, craterFbm, voronoi3, distMetric3D,
	cellNoise3D, cellNoise3DDelta, crystals3D, crystals3DDelta
} from '../glsl/noise-common.tsl.js';

/* Inline noise-common copies removed — now imported from ../glsl/noise-common.tsl.js */

export const cloudLayer = /*@__PURE__*/ Fn( ( [ sp, s, cover, storminess, planetMode ] ) => {

	If( cover.lessThan( 0.01 ), () => {

		Return( float( 0.0 ) );

	} );

	const t = uTime.mul( add( 0.04, storminess.mul( 0.08 ) ) );
	const isGas = planetMode.equal( 2 );

	/* Gas giants: stretched horizontally for latitude-band streaks.
	     Rocky: isotropic scale for puffy pockets. */

	const cloudScale = select( isGas, vec3( 2.0, 5.0, 2.0 ), vec3( 2.8 ) );
	const p = sp.mul( cloudScale ).add( vec3( s.mul( 0.41 ), s.mul( 0.17 ), s.mul( 0.73 ) ) );
	const warpAmt = add( 0.15, storminess.mul( 0.9 ) );
	const wx = fbm( p.mul( 0.7 ).add( vec3( t.mul( 0.6 ), 0.0, t.mul( 0.3 ) ) ), 0.3 );
	const wy = fbm( p.mul( 0.7 ).add( vec3( 0.0, t.mul( 0.5 ), t.mul( - 0.4 ) ) ), 0.3 );
	const wz = fbm( p.mul( 0.7 ).add( vec3( t.mul( - 0.2 ), t.mul( 0.4 ), 0.0 ) ), 0.3 );

	/* Gas giants: suppress Y warp to keep streaks horizontal */

	const yDamp = select( isGas, 0.2, 1.0 );
	const warpedP = p.add( vec3( wx, wy.mul( yDamp ), wz ).mul( warpAmt ) ).add( vec3( t.mul( 0.5 ), 0.0, t.mul( 0.3 ) ) );
	const cloud = fbm( warpedP, 0.2 ).mul( 0.5 ).add( 0.5 ).toVar();
	cloud.addAssign( fbm( warpedP.mul( 2.3 ).add( vec3( s.mul( 1.1 ) ) ), 0.2 ).mul( 0.2 ) );
	cloud.addAssign( gnoised( warpedP.mul( 5.0 ).add( vec3( s.mul( 2.7 ) ) ) ).x.mul( 0.15 ) );
	cloud.addAssign( gnoised( warpedP.mul( 11.0 ).add( vec3( s.mul( 4.3 ) ) ) ).x.mul( 0.07 ) );
	const smoothEdge = add( 0.12, storminess.mul( 0.08 ) );
	cloud.assign( smoothstep( sub( 1.0, cover ), sub( 1.0, cover ).add( smoothEdge ), cloud ) );

	return clamp( cloud, 0.0, 0.9 );

} );

export const flashTint = /*@__PURE__*/ Fn( ( [ h, atmoTint ] ) => {

	const warm = vec3( 0.99, 0.93, 0.38 );
	const cool = vec3( 0.60, 0.97, 0.96 );
	const base = mix( cool, warm, h );

	return mix( base, atmoTint.mul( 2.5 ), 0.2 );

} );

/* Returns vec4(flashIntensity, flashColorR, flashColorG, flashColorB) —
   TSL Fn() can only return a single node, no out-params */
export const lightningFlash = /*@__PURE__*/ Fn( ( [ sp, s, storminess, atmoTint ] ) => {

	If( storminess.lessThan( 0.05 ), () => {

		Return( vec4( 0.0 ) );

	} );

	const flashOut = float( 0.0 ).toVar();
	const colorAccum = vec3( 0.0 ).toVar();
	const stepsPerSec = add( 3.0, storminess.mul( 5.0 ) );

	Loop( { start: 0, end: 4, name: 'k' }, ( { k } ) => {

		const fk = float( k );
		const period = add( 1.7, fk.mul( 0.85 ) );
		const cellTime = uTime.div( period );
		const quantStep = floor( cellTime.mul( stepsPerSec ) ).div( stepsPerSec );
		const cellSeed = s.add( fk.mul( 37.13 ) ).add( quantStep );
		const h1 = fract( sin( cellSeed.mul( 127.1 ).add( 311.7 ) ).mul( 43758.5 ) );
		const h2 = fract( sin( cellSeed.mul( 269.5 ).add( 183.3 ) ).mul( 43758.5 ) );
		const isActive = step( h1, storminess.mul( storminess ).mul( 0.9 ) );

		If( isActive.lessThan( 0.5 ), () => {

			Continue();

		} );

		const flashTheta = h1.mul( 6.2832 );
		const flashPhi = acos( mul( 2.0, h2 ).sub( 1.0 ) );
		const flashCenter = vec3( sin( flashPhi ).mul( cos( flashTheta ) ), cos( flashPhi ), sin( flashPhi ).mul( sin( flashTheta ) ) );
		const radius = add( 0.3, storminess.mul( 0.3 ) );
		const dist = length( sp.sub( flashCenter ) );
		const falloff = exp( dist.negate().mul( dist ).div( radius.mul( radius ) ) );
		const intensity = add( 0.5, h2.mul( 0.5 ) ).mul( storminess ).mul( 1.5 );
		const fracStep = fract( cellTime.mul( stepsPerSec ) );
		const flash = smoothstep( 0.0, 0.15, fracStep ).mul( smoothstep( 1.0, 0.5, fracStep ) );
		const contribution = falloff.mul( intensity ).mul( flash );
		flashOut.addAssign( contribution );
		colorAccum.addAssign( flashTint( h1.add( fk.mul( 0.25 ) ), atmoTint ).mul( contribution ) );

	} );

	flashOut.assign( clamp( flashOut, 0.0, 1.0 ) );
	const flashColor = clamp( colorAccum, 0.0, 1.5 );

	return vec4( flashOut, flashColor.x, flashColor.y, flashColor.z );

} );

export const main = /*@__PURE__*/ Fn( ( [ uAtmoTint, uAtmoIntensity, uLightDir, uFadeIn, uCloudCover, uCloudColor, uStorminess, uSeed, uPlanetMode, uBandCount ] ) => {

	/* DEBUG — faint tinted shell. TSL Return(value) compiles to bare `return;` in WGSL
	   inside single-branch If blocks. Restore real shader via result-variable pattern. */
	return vec4( 0.3, 0.5, 0.8, 0.08 );

	/* Analytical sphere normal from vertex position — smoother than the mesh normal
	     attribute at low tessellation, avoids triangular artifacts in high-exponent Fresnel */

	const N = normalize( vSphereNormal );
	const V = normalize( vViewDir );
	const L = normalize( uLightDir );
	const NdotV = max( 0.0, dot( N, V ) );
	const edge = sub( 1.0, NdotV );
	const NdotL = dot( N, L );

	If( frontFacing.not(), () => {

		/* BACK FACE — atmosphere Fresnel glow (alpha=0 → pure additive via blend factors) */

		const atmo = pow( edge, 48.0 ).mul( 1.2 ).add( pow( edge, 12.0 ).mul( 0.7 ) ).add( pow( edge, 4.0 ).mul( 0.4 ) ).add( pow( edge, 1.8 ).mul( 0.1 ) );
		const sunMask = smoothstep( - 0.1, 0.4, NdotL );
		const terminator = smoothstep( 0.0, 0.3, NdotL ).mul( sub( 1.0, smoothstep( 0.3, 0.7, NdotL ) ) );
		const litGlow = atmo.mul( add( 0.03, sunMask.mul( 0.97 ) ).add( terminator.mul( 0.4 ) ) );
		const scatter = pow( max( 0.0, dot( V, L.negate() ) ), 5.0 ).mul( edge ).mul( 0.5 );
		const glow = uAtmoIntensity.mul( litGlow.add( scatter ) ).toVar();
		glow.assign( min( glow, 0.85 ).mul( uFadeIn ) );
		Return( vec4( uAtmoTint.mul( glow ), 0.0 ) );

	} );

	/* FRONT FACE — cloud layer (premultiplied alpha → occluding via blend factors) */

	const s = fract( uSeed.mul( 0.00000013 ) ).mul( 100.0 );
	const sp = vLocalPos;
	const cloudAlpha = cloudLayer( sp, s, uCloudCover, uStorminess, uPlanetMode ).toVar();

	/* Gas giants: clouds concentrate in zones (bright bands), thin over belts */

	If( uPlanetMode.equal( 2 ).and( cloudAlpha.greaterThan( 0.0 ) ), () => {

		const gasBand = sin( sp.y.mul( uBandCount ).mul( 0.7 ).mul( 3.14159265359 ) ).mul( 0.5 ).add( 0.5 );
		cloudAlpha.mulAssign( mix( 0.2, 1.0, gasBand ) );

	} );

	/* Wider limb fade — clouds thin out well before the atmosphere rim.
	     No discard — premultiplied alpha handles near-zero fragments cleanly
	     without creating hard triangle-aligned edges at the transition. */

	cloudAlpha.mulAssign( smoothstep( 0.05, 0.35, NdotV ) );
	const cloudLit = smoothstep( - 0.3, 0.5, NdotL ).mul( 0.7 ).add( 0.3 );
	const litCloud = uCloudColor.mul( cloudLit ).toVar();
	litCloud.addAssign( uCloudColor.mul( pow( NdotV, 4.0 ) ).mul( 0.15 ) );

	/* Lightning flashes through the cloud cover — skip for fungal (spore haze, not storms) */

	If( uStorminess.greaterThan( 0.05 ).and( cloudAlpha.greaterThan( 0.1 ) ).and( uPlanetMode.notEqual( 7 ) ), () => {

		const flashResult = lightningFlash( sp, s, uStorminess, uAtmoTint );
		litCloud.addAssign( flashResult.yzw.mul( flashResult.x ) );

	} );

	cloudAlpha.mulAssign( uFadeIn );

	/* Premultiplied alpha: color × alpha, then blend factors (ONE, ONE_MINUS_SRC_ALPHA)
	     produce correct occlusion of the surface below */

	return vec4( litCloud.mul( cloudAlpha ), cloudAlpha );

} );