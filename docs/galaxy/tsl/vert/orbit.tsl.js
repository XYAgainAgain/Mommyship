// Three.js Transpiler r183

import { add, cos, float, Fn, mat3, max, mod, mul, positionLocal, sin, sqrt, sub, varying, uniform, vec3 } from 'three/tsl';

const vTrailPos = varying( float(), 'vTrailPos' );
const TWO_PI = float( 6.283185307179586 );

/* All per-orbit uniforms accepted as parameters for multi-instance rendering */

export const main = /*@__PURE__*/ Fn( ( [ a, e, orbitRotMat, trailStart ] ) => {

	const t = positionLocal.x;
	const E = t.mul( TWO_PI );
	const b = sqrt( max( 0.0, sub( 1.0, e.mul( e ) ) ) );
	const px = a.mul( cos( E ).sub( e ) );
	const py = a.mul( b ).mul( sin( E ) );
	const pos = orbitRotMat.mul( vec3( px, py, 0.0 ) );

	/* 0 = body's positionLocal (brightest), increases going backward along trail */

	vTrailPos.assign( mod( trailStart.sub( t ).add( 1.0 ), 1.0 ) );

	return pos;

} );

// Wire to NodeMaterial (LineSegments):
//   material.positionNode = main();
