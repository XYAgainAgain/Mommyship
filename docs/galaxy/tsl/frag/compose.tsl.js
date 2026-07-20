// Three.js Transpiler r183

import { texture, uniform, vec2, float, smoothstep, mix, length, step, max, Fn, vec4, uv } from 'three/tsl';


// Texture uniforms — assign render target textures to .value before rendering:
//   uSpaceTexture.value = spaceRT.texture;
export const uSpaceTexture = texture( null );
export const uSceneDepth = texture( null );

// BH clip-space depth — 0 disables the gate (everything lenses)
export const uBHDepth = uniform( float( 0 ) );

export const uBlackHolePosition = uniform( vec2( 0, 0 ) );
export const uDistortionStrength = uniform( float( 0 ) );

export const uBHScreenRadius = uniform( float( 0.1 ) );
export const uAspect = uniform( float( 1 ) );

// Einstein-lens tuning: rim pull, wide-tail pull (gravitational presence), secondary blend
export const uLensStrength = uniform( float( 0.6 ) );
export const uLensReach = uniform( float( 0.35 ) );
export const uSecondaryStrength = uniform( float( 0.18 ) );

// WebGPU render targets have row 0 at top vs PlaneGeometry's bottom-left UV origin, and this
// backend skips its usual auto-flip — so V is flipped manually via uv() (no varying needed).
export const main = /*@__PURE__*/ Fn( () => {

	const rawUV = uv();
	const screenUV = vec2( rawUV.x, rawUV.y.oneMinus() );

	/* Radial geometry in aspect-corrected screen space so the lens stays round. */
	const d = vec2( screenUV.x.sub( uBlackHolePosition.x ).mul( uAspect ), screenUV.y.sub( uBlackHolePosition.y ) );
	const s = length( d );
	const R = uBHScreenRadius;
	const dir = d.div( max( s, 1e-5 ) );
	const tang = vec2( dir.y.negate(), dir.x );

	/* Foreground occluders (planets, asteroids) must not warp — lens only pixels
	   whose scene depth sits at or behind the BH */
	const behindBH = step( uBHDepth, uSceneDepth.sample( screenUV ).r );

	/* Gravity-well pull: a sharp rim term plus a slow 1/s tail, so the warp owns a wide
	   circle around the hole instead of just the rim. Sqrt ramp brings it in early on
	   approach. Combined slope > 1 makes the remap non-monotonic — fold-over mirrors. */
	const ramp = uDistortionStrength.sqrt();
	const pull = R.mul( R ).mul( ramp ).mul(
		uLensStrength.div( s.add( R.mul( 0.35 ) ) )
			.add( uLensReach.div( s.add( R.mul( 2.5 ) ) ) ) );
	const innerGate = smoothstep( R.mul( 0.55 ), R, s );
	const bend = innerGate.mul( behindBH );
	const sSrc = s.sub( pull.mul( bend ) ).max( 0.0 );

	/* Pull strength drives tangential smear + dispersion — the lens magnifies tangentially,
	   so averaging along the ring turns pixel noise into smooth arcs instead of hatching. */
	const rim = pull.div( R.mul( 0.6 ) ).clamp( 0.0, 1.0 );
	const dT = rim.mul( R ).mul( 0.06 );

	const toUV = ( a ) => vec2( uBlackHolePosition.x.add( a.x.div( uAspect ) ), uBlackHolePosition.y.add( a.y ) )
		.clamp( vec2( 0.001 ), vec2( 0.999 ) );

	const srcA = dir.mul( sSrc );
	const primary = uSpaceTexture.sample( toUV( srcA ) ).rgb.mul( 2.0 )
		.add( uSpaceTexture.sample( toUV( srcA.add( tang.mul( dT ) ) ) ).rgb )
		.add( uSpaceTexture.sample( toUV( srcA.sub( tang.mul( dT ) ) ) ).rgb )
		.mul( 0.25 ).toVar();

	/* Chromatic dispersion along the radius (blue bends more), not in fixed screen
	   directions — directional shifts smear into rainbow bands at the rim. */
	const dR = rim.mul( 0.04 ).mul( bend );
	const rSamp = uSpaceTexture.sample( toUV( dir.mul( sSrc.mul( dR.add( 1.0 ) ) ) ) ).r;
	const bSamp = uSpaceTexture.sample( toUV( dir.mul( sSrc.mul( float( 1.0 ).sub( dR ) ) ) ) ).b;
	const cw = rim.mul( 0.7 ).mul( bend );
	primary.r.assign( mix( primary.r, rSamp, cw ) );
	primary.b.assign( mix( primary.b, bSamp, cw ) );

	/* Secondary image (Einstein-ring doubling): pixels hugging the rim mirror scenery from
	   the opposite side — inverted mapping, rim-adjacent pixels reach farthest out. */
	const sd = max( s.sub( R ), 0.0 );
	const band = R.mul( 0.4 );
	const t = smoothstep( 0.0, 1.0, sd.div( band ) );
	const m = R.mul( mix( 2.4, 1.02, t ) );
	const secA = dir.negate().mul( m );
	const secUV = toUV( secA );
	const secUV2 = toUV( secA.add( tang.mul( dT.add( R.mul( 0.01 ) ) ) ) );
	/* Mirror only true background: depth-gate at the mirrored UV, fade at screen edges. */
	const behindSec = step( uBHDepth, uSceneDepth.sample( secUV ).r );
	const edgeFade = smoothstep( 0.0, 0.03, secUV.x ).mul( smoothstep( 0.97, 1.0, secUV.x ).oneMinus() )
		.mul( smoothstep( 0.0, 0.03, secUV.y ) ).mul( smoothstep( 0.97, 1.0, secUV.y ).oneMinus() );
	/* Outer gate: the mirror belongs outside the photon ring — inside it would paint
	   ghost galaxy over the shadow where no light escapes. */
	const outerGate = smoothstep( R, R.mul( 1.12 ), s );
	const wSec = t.oneMinus().mul( outerGate ).mul( behindBH ).mul( behindSec ).mul( edgeFade )
		.mul( uSecondaryStrength ).mul( uDistortionStrength );
	const secCol = uSpaceTexture.sample( secUV ).rgb.add( uSpaceTexture.sample( secUV2 ).rgb ).mul( 0.5 );
	primary.addAssign( secCol.mul( wSec ) );

	return vec4( primary, 1.0 );

} );

// Wire: material.colorNode = main();
