// Three.js Transpiler r183

import { texture, uniform, vec2, vec3, float, sin, cos, Fn, vec4, uv } from 'three/tsl';


// Texture uniforms — assign render target textures to .value before rendering:
//   uSpaceTexture.value = spaceRT.texture;
//   uDistortionTexture.value = distortionRT.texture;
export const uSpaceTexture = texture( null );
export const uDistortionTexture = texture( null );

export const uBlackHolePosition = uniform( vec2( 0, 0 ) );
export const uDistortionStrength = uniform( float( 0 ) );
export const uRGBShiftRadius = uniform( float( 0 ) );

// PI angle constants inlined from original #define — evaluated at module load time.
const ANGLE_R = float( Math.PI * 2.0 / 3.0 );
const ANGLE_G = float( Math.PI * 4.0 / 3.0 );
// angle.b = 0.0 in original GLSL, so sin(0)=0, cos(0)=1 — offset is purely in Y.
const ANGLE_B_OFFSET = vec2( 0.0, 1.0 );

// Closes over uSpaceTexture rather than accepting a sampler param — TSL Fn parameters
// don't support texture node types. The original GLSL accepted a sampler2D arg but was
// only ever called with uSpaceTexture, so closing over it is semantically equivalent.
// Renamed param 'uv' -> 'uvCoord' to avoid shadowing the TSL built-in uv().
// Renamed internal 'color' -> 'outColor' to avoid shadowing the TSL built-in color().
export const getRGBShiftedColor = /*@__PURE__*/ Fn( ( [ uvCoord, radius ] ) => {

	const outColor = vec3( 0 ).toVar();
	outColor.r.assign( uSpaceTexture.sample( uvCoord.add( vec2( sin( ANGLE_R ), cos( ANGLE_R ) ).mul( radius ) ) ).r );
	outColor.g.assign( uSpaceTexture.sample( uvCoord.add( vec2( sin( ANGLE_G ), cos( ANGLE_G ) ).mul( radius ) ) ).g );
	outColor.b.assign( uSpaceTexture.sample( uvCoord.add( ANGLE_B_OFFSET.mul( radius ) ) ).b );

	return outColor;

} );

// Uses uv() built-in — vUv was a pure UV pass-through, no varying() needed.
// WebGPU render targets store row 0 at top; PlaneGeometry UVs have (0,0) at bottom-left.
// WGSL backend skips the auto-flip (isFlipY → false), so we flip V manually.
export const main = /*@__PURE__*/ Fn( () => {

	const rawUV = uv();
	const screenUV = vec2( rawUV.x, rawUV.y.oneMinus() );
	const distortion = uDistortionTexture.sample( screenUV ).r;
	const intensity = distortion.mul( uDistortionStrength );
	const towardCenter = screenUV.sub( uBlackHolePosition ).mul( intensity.negate() ).mul( 2.0 );
	const distortedUV = screenUV.add( towardCenter );
	const outColor = getRGBShiftedColor( distortedUV, uRGBShiftRadius );
	return vec4( outColor, 1.0 );

} );

// Wire: material.colorNode = main();
