// Three.js Transpiler r183

import { add, attribute, cameraPosition, cos, cross, div, exp, float, Fn, normalize, positionLocal, sin, varying, uniform, vec3 } from 'three/tsl';

const aOffset     = attribute( 'aOffset',     'vec3' );
const aColor      = attribute( 'color',       'vec3' );
const aPackedA    = attribute( 'aPackedA',    'vec4' );
const aAnglePhase = attribute( 'aAnglePhase', 'vec2' );

export const vColor      = varying( vec3(),  'vColor' );
export const vBrightness = varying( float(), 'vBrightness' );
export const vStretch    = varying( float(), 'vStretch' );
export const vAngle      = varying( float(), 'vAngle' );
export const vPhase      = varying( float(), 'vPhase' );

export const uTime = uniform( float( 0 ) );

export const main = /*@__PURE__*/ Fn( () => {

	/* Unpack per-instance data */

	const aSize       = aPackedA.x;
	const aBrightness = aPackedA.y;
	const aRadius     = aPackedA.z;
	const aStretch    = aPackedA.w;
	const aAngle      = aAnglePhase.x;
	const aPhase      = aAnglePhase.y;

	vColor.assign( aColor );
	vBrightness.assign( aBrightness );
	vStretch.assign( aStretch );
	vAngle.assign( aAngle );
	vPhase.assign( aPhase );

	/* Differential rotation — lower coreBoost than disk stars so gas drifts slightly */

	const coreBoost = exp( aRadius.negate().mul( 0.05 ) ).mul( 0.18 );
	const angularSpeed = add( 0.06, div( 0.008, aRadius.add( 60.0 ) ) ).add( coreBoost );
	const angle = uTime.mul( angularSpeed );
	const cosA = cos( angle );
	const sinA = sin( angle );
	const pos = vec3(
		aOffset.x.mul( cosA ).sub( aOffset.z.mul( sinA ) ),
		aOffset.y,
		aOffset.x.mul( sinA ).add( aOffset.z.mul( cosA ) )
	);

	/* Billboard facing camera */

	const toCamera = normalize( cameraPosition.sub( pos ) );
	const right = normalize( cross( vec3( 0, 1, 0 ), toCamera ) );
	const up = cross( toCamera, right );

	const scale = aSize.mul( 4.0 );

	return pos
		.add( right.mul( positionLocal.x.mul( scale ) ) )
		.add( up.mul( positionLocal.y.mul( scale ) ) );

} );
