// Three.js r184 TSL

import { abs, asin, atan, clamp, cos, float, floor, Fn, max, mod, select, sin, sqrt, uniform, vec3 } from 'three/tsl';

/* Pixel-art prototype stage (deep-fold grammar): lat-long texel snap on the sample
   direction + posterize with per-texel checker dither. Knobs on window.pixelTweak. */

export const uPxGrid = uniform( float( 1024.0 ) );    /* texels around the equator */
export const uPxLevels = uniform( float( 5.0 ) );     /* posterize levels per channel */
export const uPxDither = uniform( float( 0.15 ) );    /* fraction of each band boundary that dithers */
export const uPxStar = uniform( float( 0.0 ) );       /* global star toggle (pixelTweak.stars) */
export const uPxStarRange = uniform( float( 4.0 ) );  /* HDR ceiling normalized before star posterize */
/* SDR-only: planet HDR excess (lava, fungal glow) bypasses posterize at the call site */
export const uPxPlanetRange = uniform( float( 1.0 ) );

/* Debug isolation toggles (pixelTweak.noSnap/.noFlat) — prototype scaffolding */
export const uPxNoSnap = uniform( float( 0.0 ) );
export const uPxNoFlat = uniform( float( 0.0 ) );

/* Texel checker parity, set by pxSnapDir, read by pxPosterize — same global-toVar
   pattern as gDetailDerivs (TSL Fn has single return) */
export const gPxChecker = float( 0.0 ).toVar();

/* Quantize a unit direction to the center of its lat-long texel */
export const pxSnapDir = /*@__PURE__*/ Fn( ( [ d ] ) => {

	/* Snap the knob to an even count — odd grids tear the ±π seam and break checker parity there */
	const gridN = max( floor( uPxGrid.mul( 0.5 ) ), 2.0 ).mul( 2.0 );
	const texel = float( 6.28318530718 ).div( gridN );
	/* atan(z, 0) at the exact poles is indeterminate in WGSL — nudge x off zero */
	const dx = select( abs( d.x ).greaterThan( 1e-5 ), d.x, float( 1e-5 ) );
	const lon = atan( d.z, dx );
	const lat = asin( clamp( d.y, - 1.0, 1.0 ) );
	const iLon = floor( lon.div( texel ) );
	const iLat = floor( lat.div( texel ) );
	gPxChecker.assign( mod( iLon.add( iLat ), 2.0 ) );
	const cLon = iLon.add( 0.5 ).mul( texel );
	const cLat = iLat.add( 0.5 ).mul( texel );

	return vec3( cos( cLat ).mul( cos( cLon ) ), sin( cLat ), cos( cLat ).mul( sin( cLon ) ) );

} );

/* Quantize brightness (HSV value) to uPxLevels bands, preserving hue and saturation —
   per-channel RGB snapping washes everything toward grey. Checker parity shifts the
   rounding threshold so values near a band boundary dither */
export const pxPosterize = /*@__PURE__*/ Fn( ( [ col, range ] ) => {

	const bands = max( uPxLevels, 2.0 ).sub( 1.0 );
	const c = clamp( col.div( range ), 0.0, 1.0 );
	const v = max( max( c.r, c.g ), max( c.b, 1e-4 ) );
	/* Quantize sqrt(v), not v — linear bands crowd all the dim planet shades into
	   band 0 (pure black blobs); gamma-space bands are perceptually even */
	const vg = sqrt( v );
	/* ±uPxDither/2 around the rounding threshold — zone width = uPxDither of one band */
	const jitter = gPxChecker.sub( 0.5 ).mul( uPxDither );
	const q = clamp( floor( vg.mul( bands ).add( 0.5 ).add( jitter ) ).div( bands ), 0.0, 1.0 );

	return c.mul( q.mul( q ).div( v ) ).mul( range );

} );
