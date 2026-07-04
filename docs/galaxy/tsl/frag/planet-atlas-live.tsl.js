// Three.js r184 TSL

import { Discard, Fn, If, dot, float, fract, int, ivec2, max, mix, normalize, round, screenCoordinate, smoothstep, texture, uniform, varyingProperty, vec3, vec4 } from 'three/tsl';

import { uvToSphere } from '../glsl/noise-common.tsl.js';
import { uAtlas } from './planet-atlas.tsl.js';
import {
	renderRocky, renderBarren, renderGas, renderOcean,
	renderIce, renderVolcanic, renderCrystalline, renderFungal,
} from './planet-detail.tsl.js';

/* Live atlas: evaluates the SAME render functions as the detail mesh, per-fragment,
   with octave counts scaled by uQuality (0 → cheap, 1 → detail-identical), so the LOD
   crossfade dissolves between two evaluations of one algorithm. Per-body params come
   from a layer-indexed float texture (7 of 8 WebGPU vertex buffers already bound). */
const vUv = varyingProperty( 'vec2', 'vUv' );
const vLayer = varyingProperty( 'float', 'vLayer' );
const vCrossfade = varyingProperty( 'float', 'vCrossfade' );
const vInstanceColor = varyingProperty( 'vec3', 'vInstanceColor' );
const vDetailFade = varyingProperty( 'float', 'vDetailFade' );
const vLightDir = varyingProperty( 'vec3', 'vLightDir' );
const vSphereNormal = varyingProperty( 'vec3', 'vSphereNormal' );

/* Samplerless texel fetch — float32 textures are unfilterable-float on WebGPU and a
   sampler binding fails pipeline validation on Firefox (Chromium tolerates it) */
export const uParamTex = texture( null ).setSampler( false );
export const uQuality = uniform( float( 0 ) );

export const main = /*@__PURE__*/ Fn( () => {

	/* IGN (Jimenez 2014) complementary discard with the detail mesh —
	   each screen pixel draws from exactly one LOD surface, no alpha blend */
	const ign = fract( float( 52.9829189 ).mul(
		fract( float( 0.06711056 ).mul( screenCoordinate.x )
			.add( float( 0.00583715 ).mul( screenCoordinate.y ) ) ) ) );
	If( ign.lessThan( vDetailFade ), () => { Discard(); } );

	/* Map range keeps the display-ready baked look (raw detail albedo is unlit-dark);
	   live eval dissolves in near activation, where it must match the detail mesh */
	const baked = uAtlas.sample( vUv ).depth( int( vLayer.add( 0.5 ) ) ).rgb;
	const surfaceColor = baked.toVar();

	/* Layout must mirror buildParamTexture() in planet-bake.js */
	const layerI = int( vLayer.add( 0.5 ) );
	const t0 = uParamTex.sample( ivec2( int( 0 ), layerI ) );
	const t1 = uParamTex.sample( ivec2( int( 1 ), layerI ) );
	const t2 = uParamTex.sample( ivec2( int( 2 ), layerI ) );
	const t3 = uParamTex.sample( ivec2( int( 3 ), layerI ) );
	const t4 = uParamTex.sample( ivec2( int( 4 ), layerI ) );
	const t5 = uParamTex.sample( ivec2( int( 5 ), layerI ) );
	const t6 = uParamTex.sample( ivec2( int( 6 ), layerI ) );
	const t7 = uParamTex.sample( ivec2( int( 7 ), layerI ) );

	const seed = t0.x;
	const mode = int( round( t0.y ) );
	const slopeness = t0.z;
	const oceanLevel = t0.w;
	const temperature = t1.x;
	const craterDensity = t1.y;
	const moistureOffset = t1.z;
	const biomeCount = t1.w;
	const baseColor1 = t2.xyz;
	const warpStrength = t2.w;
	const baseColor2 = t3.xyz;
	const stormSize = t3.w;
	const baseColor3 = t4.xyz;
	const bandCount = t4.w;
	const subsurfaceColor = t5.xyz;
	const crackScale = t5.w;
	const emissiveColor = t6.xyz;
	const emissiveIntensity = t6.w;
	const bulbosity = t7.x;
	const crystalMetric = int( round( t7.y ) );
	const terrainType = int( round( t7.z ) );
	const crackPattern = int( round( t7.w ) );

	/* Live eval only inside the fade band — same sphere domain as the bake (geometry
	   UVs, seam-free), dissolving from the baked look into the detail-matching one */
	If( vDetailFade.greaterThan( 0.001 ), () => {
		const sp = uvToSphere( vUv );
		const s = fract( seed.mul( 0.00000013 ) ).mul( 100.0 );
		const live = vec3( 0.5 ).toVar();

		If( mode.equal( int( 0 ) ), () => {
			live.assign( renderRocky( sp, s, slopeness, temperature, moistureOffset, biomeCount, baseColor1, baseColor2, baseColor3, subsurfaceColor, oceanLevel, warpStrength, uQuality, terrainType ).xyz );
		} ).ElseIf( mode.equal( int( 1 ) ), () => {
			live.assign( renderBarren( sp, s, slopeness, baseColor1, baseColor2, uQuality, terrainType ).xyz );
		} ).ElseIf( mode.equal( int( 2 ) ), () => {
			live.assign( renderGas( sp, s, warpStrength, stormSize, bandCount, baseColor1, baseColor2, baseColor3, uQuality ).xyz );
		} ).ElseIf( mode.equal( int( 3 ) ), () => {
			live.assign( renderOcean( sp, s, slopeness, oceanLevel, warpStrength, baseColor1, baseColor2, baseColor3, temperature, uQuality ).xyz );
		} ).ElseIf( mode.equal( int( 4 ) ), () => {
			live.assign( renderIce( sp, s, crackScale, baseColor1, baseColor2, baseColor3, slopeness, subsurfaceColor, uQuality, terrainType ).xyz );
		} ).ElseIf( mode.equal( int( 5 ) ), () => {
			live.assign( renderVolcanic( sp, s, crackScale, craterDensity, baseColor1, baseColor2, baseColor3, temperature, slopeness, emissiveColor, emissiveIntensity, uQuality, terrainType, crackPattern ).xyz );
		} ).ElseIf( mode.equal( int( 6 ) ), () => {
			live.assign( renderCrystalline( sp, s, crackScale, crystalMetric, baseColor1, baseColor2, baseColor3, bulbosity, subsurfaceColor, uQuality ).xyz );
		} ).Else( () => {
			live.assign( renderFungal( sp, s, warpStrength, slopeness, baseColor1, baseColor2, baseColor3, subsurfaceColor, crackScale, uQuality ).xyz );
		} );

		surfaceColor.assign( mix( baked, live, smoothstep( 0.0, 0.35, vDetailFade ) ) );
	} );

	/* Lambert ramps in with the detail fade only — unlit at map scale so dark-side
	   planets never vanish; by detail time the atlas already shows the terminator */
	const NdotL = max( 0.0, dot( normalize( vSphereNormal ), normalize( vLightDir ) ) );
	const shade = mix( 1.0, NdotL.mul( 0.88 ).add( 0.12 ), vDetailFade );

	const color = mix( vInstanceColor, surfaceColor.mul( shade ), vCrossfade );
	return vec4( color, 1.0 );

} );
