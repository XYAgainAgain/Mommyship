// Three.js Transpiler r183

import { add, attribute, cameraPosition, clamp, cos, cross, div, dot, exp, float, floor, Fn, fract, If, mix, mod, mul, normalize, positionLocal, sin, smoothstep, sub, varying, uniform, uv, vec2, vec3 } from 'three/tsl';

/* Per-instance attributes (from InstancedBufferAttribute) */

const aOffset = attribute( 'aOffset', 'vec3' );
const aScale = attribute( 'aScale', 'float' );
const aTimeOffset = attribute( 'aTimeOffset', 'float' );
const aRadius = attribute( 'aRadius', 'float' );
const aTint = attribute( 'aTint', 'float' );
const aAnimDir = attribute( 'aAnimDir', 'float' );

/* Shared across all asteroid populations */
export const uTime = uniform( float( 0 ) );
const vUv0 = varying( vec2(), 'vUv0' );
const vUv1 = varying( vec2(), 'vUv1' );
const vBlend = varying( float(), 'vBlend' );
const vTint = varying( float(), 'vTint' );
const vRadius = varying( float(), 'vRadius' );
const vTintColor = varying( vec3(), 'vTintColor' );
const vRimColor = varying( vec3(), 'vRimColor' );

/* Map a frame index to sprite sheet UVs for this quad corner */

export const frameUV = /*@__PURE__*/ Fn( ( [ frame_immutable, corner, columns, rows ] ) => {

	const frame = frame_immutable.toVar();
	frame.assign( floor( frame.add( 0.5 ) ) );

	/* snap to integer — mod can return 119.999 on some GPUs */

	const col = mod( frame, columns );
	const row = floor( frame.div( columns ) );
	const inset = corner.mul( 0.998 ).add( 0.001 );

	/* prevent mipmap bleed at cell edges */

	return vec2( col.add( inset.x ).div( columns ), sub( 1.0, row.add( sub( 1.0, inset.y ) ).div( rows ) ) );

} );

/* Per-population uniforms accepted as parameters (columns, rows, totalFrames, fps differ per population) */

export const main = /*@__PURE__*/ Fn( ( [ columns, rows, totalFrames, fps, lightmapTex ] ) => {

	/* Differential rotation — matches disk.js core boost (0.30) */

	const coreBoost = mul( 0.30, exp( aRadius.negate().mul( 0.05 ) ) );
	const angularSpeed = add( 0.06, div( 0.008, aRadius.add( 60.0 ) ) ).add( coreBoost );
	const angle = uTime.mul( angularSpeed );
	const cosA = cos( angle );
	const sinA = sin( angle );
	const worldPos = aOffset.toVar();
	worldPos.x.assign( aOffset.x.mul( cosA ).sub( aOffset.z.mul( sinA ) ) );
	worldPos.z.assign( aOffset.x.mul( sinA ).add( aOffset.z.mul( cosA ) ) );

	/* Billboard facing camera — computed from TSL cameraPosition built-in */

	const toCamera = normalize( cameraPosition.sub( worldPos ) );
	const camRight = normalize( cross( vec3( 0, 1, 0 ), toCamera ) );
	const camUp = cross( toCamera, camRight );
	const billboarded = worldPos.add( camRight.mul( positionLocal.x ).mul( aScale ) ).add( camUp.mul( positionLocal.y ).mul( aScale ) );

	/* Per-instance speed variation — derived from tint to decouple from aTimeOffset */

	const speed = add( 0.7, mul( 0.6, fract( aTint.mul( 7.919 ) ) ) );
	const rawFrame = uTime.add( aTimeOffset ).mul( fps ).mul( speed ).mul( aAnimDir ).toVar();
	rawFrame.addAssign( totalFrames.mul( 256.0 ) );

	/* keep positive — some GPUs have fract/mod quirks with negatives */

	const frame0 = mod( floor( rawFrame ), totalFrames );
	const frame1 = mod( frame0.add( aAnimDir ), totalFrames );
	vUv0.assign( frameUV( frame0, uv(), columns, rows ) );
	vUv1.assign( frameUV( frame1, uv(), columns, rows ) );

	/* Sharp crossfade: hold each frame ~85% of duration, transition over ~15% */

	const t = fract( rawFrame ).toVar();

	If( aAnimDir.lessThan( 0.0 ), () => {

		t.assign( sub( 1.0, t ) );

	} );

	/* fract counts wrong way for reversed playback */

	vBlend.assign( clamp( t.mul( t ).mul( t ).mul( t.mul( t.mul( 6.0 ).sub( 15.0 ) ).add( 10.0 ) ), 0.0, 1.0 ) );
	vTint.assign( aTint );
	vRadius.assign( aRadius );

	/* Lightmap sampled at canonical XZ (+-500 map units -> 0-1 UV). Constant across the quad, so
	   an explicit LOD-0 sample here is value-identical to the old per-fragment one. */

	const lmUV = aOffset.xz.div( 1000.0 ).add( 0.5 );
	const illum = lightmapTex.sample( lmUV ).level( 0 ).rgb;
	const illumBright = dot( illum, vec3( 0.299, 0.587, 0.114 ) );
	const baseTint = vec3( 0.78, 0.72, 0.88 );
	vTintColor.assign( mix( baseTint.mul( 0.4 ), illum.add( baseTint.mul( 0.15 ) ), smoothstep( 0.02, 0.15, illumBright ) ) );
	vRimColor.assign( illum.mul( 0.25 ).add( baseTint.mul( 0.12 ) ) );

	return billboarded;

} );

// Wire to NodeMaterial:
//   material.positionNode = main();
