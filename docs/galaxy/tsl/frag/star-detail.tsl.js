// Three.js Transpiler r183

import { abs, add, Break, clamp, cos, cross, Discard, dot, float, Fn, fract, fwidth, If, length, Loop, max, mix, mod, mul, normalize, pow, screenCoordinate, select, sin, smoothstep, sqrt, sub, uniform, varyingProperty, vec3, vec4 } from 'three/tsl';

const vLocalPos = varyingProperty( 'vec3', 'vLocalPos' );
const vNormal = varyingProperty( 'vec3', 'vNormal' );
const vViewDir = varyingProperty( 'vec3', 'vViewDir' );

/* Shared across all detail instances */
export const uTime = uniform( float( 0 ) );

/* Shared surface-look tuning knobs, exposed on window.starTweak for live tweaking.
   Safe range 0–1 for all four; limbStrength > 1 sign-flips color at the limb. */
export const uLimbStrength = uniform( float( 0.45 ) );
export const uLimbTempDrop = uniform( float( 0.12 ) );
export const uShadeAmp = uniform( float( 0.6 ) );
export const uGlowBoost = uniform( float( 1.0 ) );

/* Turbulence knobs — defaults sit at full SDO drama, pull back live if it's too much.
   Bake reads the granule/filament/lane knobs at load; live tweaks only move detail. */
export const uSupergranuleScale = uniform( float( 1.0 ) );
export const uFilamentStrength = uniform( float( 0.55 ) );
export const uLaneStrength = uniform( float( 0.6 ) );
export const uChurnSpeed = uniform( float( 3.0 ) );
export const uPromIntensity = uniform( float( 1.0 ) );
export const uCmeRate = uniform( float( 1.0 ) );
/* Amplitude multiplier on the close-up-only octaves 4–5 — punchier micro-detail.
   Parity-safe: those octaves are gated to zero through the whole crossfade band. */
export const uDetailBoost = uniform( float( 1.8 ) );

/* Per-instance uniforms accepted as parameters for multi-instance pool rendering */

import { hash33, gnoised, blackbodyRGB } from '../glsl/noise-common.tsl.js';

/* Differential advection FBM: alternating per-octave rotation, speed rises with octave.
   Break() skips octaves past the gate, so time 0/gate 0 matches noise-common fbm exactly (bake parity). */

export const fbm = /*@__PURE__*/ Fn( ( [ p_immutable, slopeness, time, gate ] ) => {

	const p = p_immutable.toVar();
	const v = float( 0.0 ).toVar(), a = float( 0.5 ).toVar(), slopeAccum = float( 0.0 ).toVar();

	Loop( { start: 0, end: 6 }, ( { i } ) => {

		const fi = float( i );
		If( fi.greaterThanEqual( gate.mul( 2.0 ).add( 4.0 ) ), () => { Break(); } );
		const dirSign = sub( 1.0, mul( 2.0, mod( fi, 2.0 ) ) );
		const angle = time.mul( add( 0.006, mul( 0.005, fi ) ) ).mul( dirSign );
		const sa = sin( angle ), ca = cos( angle );
		const rp = vec3( p.x.mul( ca ).sub( p.z.mul( sa ) ), p.y, p.x.mul( sa ).add( p.z.mul( ca ) ) );
		const g = clamp( sub( add( gate.mul( 2.0 ), 4.0 ), fi ), 0.0, 1.0 );
		const boost = mix( 1.0, uDetailBoost, clamp( fi.sub( 3.0 ), 0.0, 1.0 ) );
		const n = gnoised( rp );
		const nx = n.x.div( add( 1.0, slopeness.mul( slopeAccum ) ) );
		v.addAssign( a.mul( nx ).mul( g ).mul( boost ) );
		slopeAccum.addAssign( dot( n.yzw, n.yzw ).mul( a ).mul( a ).mul( g ) );
		p.mulAssign( 2.17 );
		a.mulAssign( 0.45 );

	} );

	return v;

} );

/* Full FBM with derivative output — only needed for the final call (normal perturbation) */

export const fbmd = /*@__PURE__*/ Fn( ( [ p_immutable, slopeness, time, gate ] ) => {

	const p = p_immutable.toVar();
	const v = float( 0.0 ).toVar(), a = float( 0.5 ).toVar();
	const derivative = vec3( 0.0 ).toVar();
	const freq = float( 1.0 ).toVar();

	Loop( { start: 0, end: 6 }, ( { i } ) => {

		const fi = float( i );
		If( fi.greaterThanEqual( gate.mul( 2.0 ).add( 4.0 ) ), () => { Break(); } );
		const dirSign = sub( 1.0, mul( 2.0, mod( fi, 2.0 ) ) );
		const angle = time.mul( add( 0.006, mul( 0.005, fi ) ) ).mul( dirSign );
		const sa = sin( angle ), ca = cos( angle );
		const rp = vec3( p.x.mul( ca ).sub( p.z.mul( sa ) ), p.y, p.x.mul( sa ).add( p.z.mul( ca ) ) );
		const g = clamp( sub( add( gate.mul( 2.0 ), 4.0 ), fi ), 0.0, 1.0 );
		const boost = mix( 1.0, uDetailBoost, clamp( fi.sub( 3.0 ), 0.0, 1.0 ) );
		const n = gnoised( rp );
		const nx = n.x.div( add( 1.0, slopeness.mul( dot( derivative, derivative ) ) ) );
		v.addAssign( a.mul( nx ).mul( g ).mul( boost ) );
		derivative.addAssign( a.mul( n.yzw ).mul( freq ).mul( g ).mul( boost ) );
		freq.mulAssign( 2.17 );
		p.mulAssign( 2.17 );
		a.mulAssign( 0.45 );

	} );

	return vec4( v, derivative.x, derivative.y, derivative.z );

} );

export const main = /*@__PURE__*/ Fn( ( [ uSeed, uLowTemp, uHighTemp, uGranScale, uCellScale, uSpotAmp, uSize, uSlopeness, uEmissive, uRotation, uAtmosphereColor, uAtmosphereIntensity, uFade, uGate ] ) => {

	/* IGN dither complementary to star-atlas.tsl.js — detail keeps ign < fade */
	const ign = fract( float( 52.9829189 ).mul(
		fract( float( 0.06711056 ).mul( screenCoordinate.x )
			.add( float( 0.00583715 ).mul( screenCoordinate.y ) ) ) ) );
	If( ign.greaterThanEqual( uFade ), () => { Discard(); } );

	const objNormal = normalize( vLocalPos );
	const rotated = uRotation.mul( objNormal );
	const s = fract( uSeed.mul( 0.00000013 ) ).mul( 100.0 );

	/* Two-scale split: fine granulation at fixed angular frequency (crisp at any size),
	   supergranules scale with physical size — a giant shows MORE cells, not blur */
	const pFine = rotated.mul( uGranScale );
	const pCell = rotated.mul( uCellScale ).mul( uSupergranuleScale );
	const tt = uTime.mul( uChurnSpeed );

	/* Top-octave AA — fade octaves 4–5 before their cells shrink under a pixel */
	const fw = length( fwidth( pFine ) );
	const gate = uGate.mul( sub( 1.0, smoothstep( 0.005, 0.012, fw ) ) );

	const N = normalize( vNormal );
	const V = normalize( vViewDir );
	const mu = max( 0.0, dot( N, V ) );

	/* Spicule fuzz, scaled by uGate: close-up the limb gets high-freq bites + rim roughening.
	   Must gate off at crossfade distance — ungated 40× noise is sparkle on a small disc. */
	const spicA = tt.mul( 0.05 );
	const spSa = sin( spicA ), spCa = cos( spicA );
	const spP = vec3( rotated.x.mul( spCa ).sub( rotated.z.mul( spSa ) ), rotated.y, rotated.x.mul( spSa ).add( rotated.z.mul( spCa ) ) );
	const spic = gnoised( spP.mul( 40.0 ).add( vec3( s.mul( 3.13 ).add( 6.1 ) ) ) ).x.mul( uGate );
	If( mu.lessThan( spic.mul( 0.05 ).add( uGate.mul( 0.018 ) ) ), () => { Discard(); } );

	/* Domain warping gives each layer its own time scale for organic morphing. q stays
	   4-octave (extra octaves die after 2 warps); r/final take half gate — that's where stipple shows. */

	const qx = fbm( pFine.add( vec3( s, s.mul( 1.37 ), s.mul( 0.71 ) ) ), uSlopeness, tt.mul( 1.0 ), float( 0.0 ) );
	const qy = fbm( pFine.add( vec3( s.mul( 2.31 ), s.mul( 0.53 ), s.mul( 1.91 ) ) ), uSlopeness, tt.mul( 1.0 ), float( 0.0 ) );
	const qz = fbm( pFine.add( vec3( s.mul( 3.17 ), s.mul( 0.89 ), s.mul( 2.43 ) ) ), uSlopeness, tt.mul( 1.0 ), float( 0.0 ) );
	const q = vec3( qx, qy, qz );
	const halfGate = gate.mul( 0.5 );
	const rx = fbm( pFine.add( q.mul( 0.8 ) ).add( vec3( s.mul( 0.17 ).add( 1.7 ), s.mul( 1.13 ).add( 3.2 ), s.mul( 0.61 ).add( 4.5 ) ) ), uSlopeness, tt.mul( 0.7 ), halfGate );
	const ry = fbm( pFine.add( q.mul( 0.8 ) ).add( vec3( s.mul( 0.83 ).add( 5.1 ), s.mul( 0.29 ).add( 7.8 ), s.mul( 1.47 ).add( 2.1 ) ) ), uSlopeness, tt.mul( 0.7 ), halfGate );
	const rz = fbm( pFine.add( q.mul( 0.8 ) ).add( vec3( s.mul( 0.39 ).add( 8.3 ), s.mul( 1.71 ).add( 1.4 ), s.mul( 0.57 ).add( 6.7 ) ) ), uSlopeness, tt.mul( 0.7 ), halfGate );
	const r = vec3( rx.toVar(), ry, rz );
	const finalNoise = fbmd( pFine.add( r.mul( 0.6 ) ).add( vec3( s.mul( 0.41 ).add( 2.3 ) ) ), uSlopeness, tt.mul( 0.5 ), halfGate );
	const f = finalNoise.x;
	const noiseDeriv = finalNoise.yzw;

	/* tempFactor MUST match star-bake.tsl.js term-for-term. Layer times are hard 0 — don't
	   "restore" them: advected low-freq layers would drift off the static atlas and double-expose
	   at the crossfade after minutes. Motion instead comes from sway, zeroed by uGate in the fade band. */
	const sway = vec3( sin( tt.mul( 0.11 ) ), sin( tt.mul( 0.07 ).add( 2.1 ) ), cos( tt.mul( 0.09 ) ) ).mul( uGate.mul( 0.22 ) );
	/* gate −0.5 caps these low-freq layers at 3 octaves, twin of the bake's fbmO(3) */
	const superg = fbm( pCell.add( sway.mul( 0.5 ) ).add( vec3( s.mul( 1.61 ).add( 11.8 ), s.mul( 0.47 ).add( 3.9 ), s.mul( 2.23 ).add( 7.2 ) ) ), uSlopeness, float( 0.0 ), float( -0.5 ) );
	const ridge = sub( 1.0, abs( fbm( pFine.mul( 0.55 ).add( sway ).add( vec3( s.mul( 0.93 ).add( 9.4 ), s.mul( 1.29 ).add( 5.6 ), s.mul( 0.71 ).add( 3.3 ) ) ), uSlopeness, float( 0.0 ), float( 0.0 ) ).mul( 2.0 ) ) );
	const filament = smoothstep( 0.78, 0.97, ridge ).mul( uFilamentStrength );
	const cellEdge = length( q ).mul( uSpotAmp );
	const lane = smoothstep( 0.85, 1.5, cellEdge ).mul( uLaneStrength );
	const spotN = fbm( rotated.mul( 1.4 ).add( sway.mul( 0.3 ) ).add( vec3( s.mul( 2.77 ).add( 1.9 ), s.mul( 1.03 ).add( 8.5 ), s.mul( 0.31 ).add( 4.4 ) ) ), uSlopeness, float( 0.0 ), float( -0.5 ) );
	const spotThresh = sub( 0.52, uSpotAmp.mul( 0.05 ) );
	const umbra = smoothstep( spotThresh, spotThresh.add( 0.05 ), spotN );
	const penumbra = smoothstep( spotThresh.sub( 0.08 ), spotThresh.add( 0.03 ), spotN );
	const spotMask = umbra.mul( 0.65 ).add( penumbra.mul( 0.35 ) );

	const base = clamp( f.mul( 1.2 ).add( 0.5 ), 0.0, 1.0 );
	const brightPatch = clamp( r.x.mul( 0.6 ).add( 0.5 ), 0.0, 1.0 );
	const tempFactor = clamp( base.sub( cellEdge.mul( 0.8 ) ).add( brightPatch.mul( 0.4 ) ).sub( 0.15 )
		.add( superg.mul( 0.55 ) ).add( lane ).sub( filament ).sub( spotMask.mul( 0.5 ) ), 0.0, 1.0 ).toVar();
	tempFactor.assign( tempFactor.mul( tempFactor ).mul( sub( 3.0, mul( 2.0, tempFactor ) ) ) );

	/* Filaments and umbrae go near-black, not just cooler — brightness kill on top
	   of the temp drop; penumbra rides the wider smoothstep band as gray fringe */
	const darken = sub( 1.0, filament.mul( 0.75 ) ).mul( sub( 1.0, spotMask.mul( 0.9 ) ) );

	/* Limb cooling: disc-edge sightlines exit through cooler, shallower gas —
	   the redder rim sells "glowing volume" over "lit ball" */
	const kelvin = mix( uLowTemp, uHighTemp, tempFactor )
		.mul( mix( sub( 1.0, uLimbTempDrop ), 1.0, sqrt( mu ) ) );
	const surfaceColor = blackbodyRGB( kelvin ).toVar();

	/* HDR emissive boost — only the hottest 25% of cells clip to white */

	const emissive = smoothstep( 0.75, 1.0, tempFactor ).mul( uEmissive );
	surfaceColor.mulAssign( add( 1.0, emissive ) );
	surfaceColor.mulAssign( darken );

	/* Perturb normal with noise derivatives for surface depth illusion */

	const up = select( abs( N.y ).lessThan( 0.999 ), vec3( 0.0, 1.0, 0.0 ), vec3( 1.0, 0.0, 0.0 ) );
	const T = normalize( cross( up, N ) );
	const B = cross( N, T );
	const perturbedN = normalize( N.sub( add( 0.15, uGate.mul( 0.15 ) ).mul( noiseDeriv.x.mul( T ).add( noiseDeriv.y.mul( B ) ) ) ) );
	const muP = max( 0.0, dot( perturbedN, V ) );

	/* Relief splits from limb darkening: only bumps tipping away from view should darken —
	   full perturbed-NdotV shading would read as specular sheen instead of surface relief. */
	surfaceColor.mulAssign( sub( 1.0, uShadeAmp.mul( clamp( mu.sub( muP ), 0.0, 1.0 ) ) ) );

	/* Limb darkening on the smooth geometric normal, sqrt-spread across the disc */

	surfaceColor.mulAssign( sub( 1.0, uLimbStrength.mul( sub( 1.0, sqrt( mu ) ) ) ) );
	surfaceColor.mulAssign( uGlowBoost );

	/* Rim glow uses smooth geometric normal — spicule noise roughens the edge band */

	const rimFactor = pow( sub( 1.0, mu ), 4.0 ).mul( add( 1.0, spic.mul( sub( 1.0, mu ) ).mul( 1.5 ) ) );
	surfaceColor.addAssign( uAtmosphereColor.mul( uAtmosphereIntensity ).mul( rimFactor ) );
	return vec4( surfaceColor, 1.0 );

} );
