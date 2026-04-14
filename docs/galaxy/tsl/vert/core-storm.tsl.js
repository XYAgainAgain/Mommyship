// Three.js TSL r183

import { float, Fn, length, max, positionLocal, sub, varying, uv, vec2 } from 'three/tsl';

const vUv = varying( vec2(), 'vUv' );

/* Accepts domeHeight as parameter for per-dome instancing */

export const main = /*@__PURE__*/ Fn( ( [ domeHeight ] ) => {

	vUv.assign( uv() );

	/* Parabolic dome: peaks at center, zero at edges */

	const r = length( positionLocal.xz ).mul( 2.0 );
	const pos = positionLocal.toVar();
	pos.y.addAssign( domeHeight.mul( max( 0.0, sub( 1.0, r.mul( r ) ) ) ) );

	return pos;

} );
