/* Limb prominences + seed-timed CMEs on an additive billboard sprite. Masked into RGB
   (alpha held at 1) so additive blending needs no opacity plumbing; LOD fade multiplies in via pFade. */

import { add, atan, clamp, cos, Discard, float, floor, Fn, fract, If, length, max, pow, sin, smoothstep, sub, uv, vec3, vec4 } from 'three/tsl';
import { gnoised, blackbodyRGB } from '../glsl/noise-common.tsl.js';
import { uTime, uPromIntensity, uCmeRate } from './star-detail.tsl.js';

/* Star disc edge in sprite space: mesh radius 2.175 over sprite half-extent 3.75 */
const DISC = 0.58;

export const main = /*@__PURE__*/ Fn( ( [ uSeed, uLowTemp, uFade ] ) => {

	const c = uv().mul( 2.0 ).sub( 1.0 );
	const rad = length( c );
	/* Quad corners past the falloff radius only ever add zero — skip the whole stack */
	If( rad.greaterThanEqual( 0.995 ), () => { Discard(); } );
	/* Epsilon keeps atan(0,0) at disc center from minting a NaN that survives ×0 */
	const ang = atan( c.y, c.x.add( 0.0000001 ) );
	const s = fract( uSeed.mul( 0.00000013 ) ).mul( 100.0 );

	/* Flames live just off the limb, decaying toward the sprite rim */
	const ringT = smoothstep( DISC - 0.03, DISC + 0.04, rad );
	const radFall = sub( 1.0, smoothstep( DISC, 1.0, rad ) ).toVar();
	const fall = pow( radFall, 1.6 );

	/* 2–4 readable tongues, one per quadrant with jittered angle + varied weight —
	   quadrant spacing + slow rim drift keep eruptions from owning a single side */
	const spin = floor( fract( s.mul( 0.517 ) ).mul( 2.0 ) ).mul( 2.0 ).sub( 1.0 );
	const drift = uTime.mul( 0.04 ).mul( spin );
	const hot = float( 0.0 ).toVar();
	for ( let k = 0; k < 4; k++ ) {
		const jit = fract( sin( s.mul( 13.7 ).add( float( k * 7.31 ) ) ).mul( 437.585 ) ).sub( 0.5 ).mul( 1.2 );
		const ak = jit.add( float( k * 1.5708 ) ).add( drift );
		const wk = fract( sin( s.mul( 7.93 ).add( float( k * 3.17 ) ) ).mul( 227.319 ) ).add( 0.35 );
		const align = cos( ang.sub( ak ) ).mul( 0.5 ).add( 0.5 );
		hot.addAssign( pow( align, 14.0 ).mul( wk ) );
	}

	/* Flame noise flowing radially outward — slow, arcing motion */
	const flameP = vec3( c.mul( 3.0 ), rad.mul( 5.0 ).sub( uTime.mul( 0.35 ) ) )
		.add( vec3( s.mul( 0.61 ), s.mul( 1.13 ), s.mul( 0.27 ) ) );
	const n1 = gnoised( flameP ).x;
	const n2 = gnoised( flameP.mul( 2.3 ).add( 17.1 ) ).x;
	const flame = clamp( n1.mul( 0.9 ).add( n2.mul( 0.5 ) ).add( 0.55 ), 0.0, 1.0 );

	const alpha = ringT.mul( fall ).mul( hot ).mul( flame ).mul( uPromIntensity ).toVar();

	/* Seed-offset eruption clock (~1/min at default rate) — stars desync naturally.
	   env ramps over a few seconds then fades; direction re-rolls per cycle. */
	const cyc = uTime.mul( uCmeRate ).div( 60.0 ).add( fract( s.mul( 0.731 ) ) );
	const ph = fract( cyc );
	/* Rate 0 must mean "no CMEs" — without the gate the clock freezes at the seed
	   offset and ~13% of stars hold a mid-eruption pose forever */
	const rateOn = smoothstep( 0.0, 0.01, uCmeRate );
	const env = smoothstep( 0.0, 0.025, ph ).mul( sub( 1.0, smoothstep( 0.05, 0.13, ph ) ) ).mul( rateOn );
	const aCme = fract( sin( floor( cyc ).add( s ).mul( 12.9898 ) ).mul( 43758.5453 ) ).mul( 6.28318 );
	const alignC = cos( ang.sub( aCme ) ).mul( 0.5 ).add( 0.5 );
	const cmeFall = pow( radFall, 0.5 );
	const cme = pow( alignC, 8.0 ).mul( env ).mul( cmeFall ).mul( ringT ).mul( flame.mul( 0.5 ).add( 0.5 ) );
	alpha.addAssign( cme.mul( uPromIntensity ).mul( 3.0 ) );

	/* Ejected plasma sits a step cooler than the photosphere */
	const col = blackbodyRGB( max( uLowTemp.mul( 0.85 ), 1200.0 ) ).mul( add( 1.0, cme.mul( 2.0 ) ) );

	return vec4( col.mul( clamp( alpha, 0.0, 2.5 ) ).mul( uFade ), 1.0 );

} );
