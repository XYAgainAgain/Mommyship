// Three.js Transpiler r183

import { add, attribute, cameraPosition, cos, cross, div, exp, float, Fn, normalize, positionLocal, sin, varying, uniform, vec3, vertexColor } from 'three/tsl';

const aOffset     = attribute( 'aOffset',     'vec3' );
const aSize       = attribute( 'aSize',       'float' );
const aBrightness = attribute( 'aBrightness', 'float' );
const aRadius     = attribute( 'aRadius',     'float' );

export const vColor      = varying( vec3(),  'vColor' );
export const vBrightness = varying( float(), 'vBrightness' );

export const uTime = uniform( float( 0 ) );

export const main = /*@__PURE__*/ Fn( () => {

	vColor.assign( vertexColor );
	vBrightness.assign( aBrightness );

	/* Rigid-body Y-axis rotation with radial speed + core boost */

	const coreBoost = exp( aRadius.negate().mul( 0.05 ) ).mul( 0.30 );
	const angularSpeed = add( 0.06, div( 0.008, aRadius.add( 60.0 ) ) ).add( coreBoost );
	const angle = uTime.mul( angularSpeed );
	const cosA = cos( angle );
	const sinA = sin( angle );
	const pos = vec3(
		aOffset.x.mul( cosA ).sub( aOffset.z.mul( sinA ) ),
		aOffset.y,
		aOffset.x.mul( sinA ).add( aOffset.z.mul( cosA ) )
	);

	/* Billboard facing camera — computed per-vertex from TSL cameraPosition built-in */

	const toCamera = normalize( cameraPosition.sub( pos ) );
	const right = normalize( cross( vec3( 0, 1, 0 ), toCamera ) );
	const up = cross( toCamera, right );

	const scale = aSize.mul( 3.0 );

	return pos
		.add( right.mul( positionLocal.x.mul( scale ) ) )
		.add( up.mul( positionLocal.y.mul( scale ) ) );

} );
