// Three.js Transpiler r183

import { add, cos, Discard, dot, float, floor, Fn, fract, If, length, mix, mul, sin, smoothstep, sub, uv, varyingProperty, vec2, vec3, vec4 } from 'three/tsl';

const vColor = varyingProperty( 'vec3', 'vColor' );
const vBrightness = varyingProperty( 'float', 'vBrightness' );
const vStretch = varyingProperty( 'float', 'vStretch' );
const vAngle = varyingProperty( 'float', 'vAngle' );
const vPhase = varyingProperty( 'float', 'vPhase' );

export const hash = /*@__PURE__*/ Fn( ( [ p ] ) => {

	return fract( sin( dot( p, vec2( 127.1, 311.7 ) ) ).mul( 43758.5453123 ) );

} );

export const noise = /*@__PURE__*/ Fn( ( [ p ] ) => {

	const i = floor( p );
	const f = fract( p ).toVar();
	f.assign( f.mul( f ).mul( sub( 3.0, mul( 2.0, f ) ) ) );
	const a = hash( i );
	const b = hash( i.add( vec2( 1.0, 0.0 ) ) );
	const c = hash( i.add( vec2( 0.0, 1.0 ) ) );
	const d = hash( i.add( vec2( 1.0, 1.0 ) ) );

	return mix( mix( a, b, f.x ), mix( c, d, f.x ), f.y );

} );

export const main = /*@__PURE__*/ Fn( () => {

	const uvCoord = uv().sub( vec2( 0.5 ) );

	/* Rotate then stretch into ellipse */

	const cosA = cos( vAngle );
	const sinA = sin( vAngle );
	const rotated = vec2( uvCoord.x.mul( cosA ).sub( uvCoord.y.mul( sinA ) ), uvCoord.x.mul( sinA ).add( uvCoord.y.mul( cosA ) ) ).toVar();
	rotated.y.divAssign( vStretch );

	/* Noise-based edge warping for organic cloud shapes */

	const warp = noise( rotated.mul( 3.0 ).add( vPhase ) ).mul( 0.15 );
	const dist = length( rotated ).add( warp );

	If( dist.greaterThan( 0.5 ), () => {

		Discard();

	} );

	/* Premultiply alpha into RGB for screen blending */

	const alpha = smoothstep( 0.5, 0.0, dist ).toVar();
	alpha.mulAssign( alpha.mul( vBrightness ) );
	return vec4( vColor.mul( alpha ), alpha );

} );