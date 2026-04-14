// Three.js TSL r183

import { add, attribute, cos, div, float, Fn, fract, If, mix, mul, positionView, pow, sin, smoothstep, sub, varying, uniform, vec3 } from 'three/tsl';

export const uTime = uniform( float( 0 ) );
export const uViewHeight = uniform( float( 0 ) );
export const uSize = uniform( float( 0 ) );
const aProgress = attribute( 'aProgress', 'float' );
const aSize = attribute( 'aSize', 'float' );
const aRandom = attribute( 'aRandom', 'float' );
export const vColor = varying( vec3(), 'vColor' );

/* Perspective point size — positionView.z reflects the computed orbit position */

export const computeSize = /*@__PURE__*/ Fn( () => {

	return aSize.mul( uSize ).mul( uViewHeight ).div( positionView.z.negate() );

} );

/* Orbital position from progress + color variety from per-particle hash */

export const main = /*@__PURE__*/ Fn( () => {

	const concentration = float( 0.05 );
	const outerProgress = smoothstep( 0.0, 1.0, aProgress ).toVar();
	outerProgress.assign( mix( concentration, outerProgress, pow( aRandom, 1.7 ) ) );
	const radius = add( 6.0, outerProgress.mul( 24.0 ) );
	const angle = outerProgress.sub( uTime.mul( sub( 1.0, outerProgress ) ).mul( 3.0 ) );
	const newPosition = vec3( sin( angle ).mul( radius ), 0.0, cos( angle ).mul( radius ) );

	const hash = fract( aRandom.mul( 127.1 ).add( aProgress.mul( 311.7 ) ) );

	const c0 = vec3( 1.0, 0.90, 0.97 );
	const c1 = vec3( 0.95, 0.30, 0.60 );
	const c2 = vec3( 0.12, 0.30, 0.55 );
	const c3 = vec3( 0.51, 0.20, 0.67 );
	const c4 = vec3( 0.80, 0.65, 0.30 );
	vColor.assign( mix( c0, c1, smoothstep( 0.0, 0.15, outerProgress ) ) );
	vColor.assign( mix( vColor, c2, smoothstep( 0.15, 0.35, outerProgress ) ) );
	vColor.assign( mix( vColor, c3, smoothstep( 0.35, 0.60, outerProgress ) ) );
	vColor.assign( mix( vColor, c4, smoothstep( 0.60, 0.90, outerProgress ) ) );

	const brightWhite = vec3( 1.0, 1.0, 1.0 );
	const warmGold = vec3( 1.0, 0.93, 0.59 );
	const coolBlue = vec3( 0.67, 0.75, 1.0 );
	const dimOrange = vec3( 1.0, 0.60, 0.36 );
	const debrisGrey = vec3( 0.35, 0.32, 0.30 );

	If( outerProgress.lessThan( 0.2 ), () => {

		If( hash.lessThan( 0.25 ), () => {

			vColor.assign( brightWhite );

		} ).ElseIf( hash.lessThan( 0.40 ), () => {

			vColor.assign( warmGold );

		} );

	} ).ElseIf( outerProgress.lessThan( 0.6 ), () => {

		If( hash.lessThan( 0.15 ), () => {

			vColor.assign( brightWhite );

		} ).ElseIf( hash.lessThan( 0.25 ), () => {

			vColor.assign( coolBlue );

		} ).ElseIf( hash.lessThan( 0.35 ), () => {

			vColor.assign( warmGold );

		} ).ElseIf( hash.lessThan( 0.42 ), () => {

			vColor.assign( dimOrange );

		} ).ElseIf( hash.lessThan( 0.50 ), () => {

			vColor.assign( c1 );

		} );

	} ).Else( () => {

		If( hash.lessThan( 0.20 ), () => {

			vColor.assign( debrisGrey );

		} ).ElseIf( hash.lessThan( 0.30 ), () => {

			vColor.assign( dimOrange.mul( 0.6 ) );

		} ).ElseIf( hash.lessThan( 0.38 ), () => {

			vColor.assign( coolBlue.mul( 0.5 ) );

		} );

	} );

	return newPosition;

} );

// Wire to PointsNodeMaterial:
//   material.positionNode = main();
//   material.sizeNode     = computeSize();
