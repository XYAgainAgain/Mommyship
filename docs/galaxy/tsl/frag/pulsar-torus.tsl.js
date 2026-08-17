// Three.js Transpiler r183

import { abs, add, cos, dot, float, floor, Fn, fract, Loop, max, mix, mul, negate, pow, sin, smoothstep, sub, uniform, varyingProperty, vec2, vec3, vec4 } from 'three/tsl';

const vUv = varyingProperty( 'vec2', 'vUv' );

/* Shared across all pulsar instances */
export const uTime = uniform( float( 0 ) );

/* Per-instance uniforms accepted as parameters */

export const hash33 = /*@__PURE__*/ Fn( ( [ p_immutable ] ) => {

	const p = p_immutable.toVar();
	p.assign( vec3( dot( p, vec3( 127.1, 311.7, 74.7 ) ), dot( p, vec3( 269.5, 183.3, 246.1 ) ), dot( p, vec3( 113.5, 271.9, 124.6 ) ) ) );

	return fract( sin( p ).mul( 43758.5453 ) ).mul( 2.0 ).sub( 1.0 );

} );

export const gnoise = /*@__PURE__*/ Fn( ( [ p ] ) => {

	const i = floor( p );
	const f = fract( p );
	const u = f.mul( f ).mul( sub( 3.0, mul( 2.0, f ) ) );

	return mix( mix( mix( dot( hash33( i ), f ), dot( hash33( i.add( vec3( 1, 0, 0 ) ) ), f.sub( vec3( 1, 0, 0 ) ) ), u.x ), mix( dot( hash33( i.add( vec3( 0, 1, 0 ) ) ), f.sub( vec3( 0, 1, 0 ) ) ), dot( hash33( i.add( vec3( 1, 1, 0 ) ) ), f.sub( vec3( 1, 1, 0 ) ) ), u.x ), u.y ), mix( mix( dot( hash33( i.add( vec3( 0, 0, 1 ) ) ), f.sub( vec3( 0, 0, 1 ) ) ), dot( hash33( i.add( vec3( 1, 0, 1 ) ) ), f.sub( vec3( 1, 0, 1 ) ) ), u.x ), mix( dot( hash33( i.add( vec3( 0, 1, 1 ) ) ), f.sub( vec3( 0, 1, 1 ) ) ), dot( hash33( i.add( vec3( 1, 1, 1 ) ) ), f.sub( vec3( 1, 1, 1 ) ) ), u.x ), u.y ), u.z );

} );

export const fbm3 = /*@__PURE__*/ Fn( ( [ p_immutable ] ) => {

	const p = p_immutable.toVar();
	const v = float( 0.0 ).toVar(), a = float( 0.5 ).toVar();

	Loop( { start: 0, end: 4 }, ( { i } ) => {

		v.addAssign( a.mul( gnoise( p ) ) );
		p.mulAssign( 2.17 );
		a.mulAssign( 0.45 );

	} );

	return v;

} );

export const main = /*@__PURE__*/ Fn( ( [ uSeed, uColor, uIntensity ] ) => {

	const PI = float( 3.14159265 );
	const s = fract( uSeed.mul( 0.00000013 ) ).mul( 100.0 );
	const ringAngle = vUv.x.mul( 2.0 ).mul( PI );
	const tubeAngle = vUv.y.mul( 2.0 ).mul( PI );

	/* Noise torus uses r=1 so frequency stays uniform pole-to-equator
	     (real geometry has r=3.95 ≈ R, giving 160× frequency gradient) */

	const noisePos = vec3( add( 4.0, cos( tubeAngle ) ).mul( cos( ringAngle ) ), sin( tubeAngle ), add( 4.0, cos( tubeAngle ) ).mul( sin( ringAngle ) ) );
	const inner = cos( tubeAngle ).negate();
	const np = noisePos.mul( 0.5 ).add( vec3( s ) );

	/* Noisy pole boundary — smoothstep kills the hard max(0) cliff */

	const poleNoise = gnoise( np.mul( 3.0 ).add( vec3( uTime.mul( 0.8 ), uTime.mul( 0.5 ), uTime.mul( - 0.6 ) ) ) );
	const noisyInner = inner.add( poleNoise.mul( 0.2 ) );
	const softPole = smoothstep( - 0.15, 0.3, noisyInner );
	const poleGlow = pow( softPole, 1.8 );
	const poleCore = pow( softPole, 5.0 );
	const arc1 = fbm3( np.add( vec3( uTime.mul( 0.06 ), 0.0, uTime.mul( 0.04 ) ) ) );
	const arc2 = fbm3( np.mul( 1.7 ).add( vec3( 0.0, uTime.mul( - 0.05 ), uTime.mul( 0.07 ) ) ) );
	const arc3 = gnoise( np.mul( 2.5 ).add( vec3( uTime.mul( 0.1 ), uTime.mul( 0.06 ), 0.0 ) ) );
	const ridges = pow( sub( 1.0, abs( arc1 ) ), 3.5 ).mul( 1.3 );
	const ridges2 = pow( sub( 1.0, abs( arc2 ) ), 4.0 ).mul( 0.9 );
	const detail = pow( sub( 1.0, abs( arc3 ) ), 3.0 ).mul( 0.5 );
	const pattern = ridges.add( ridges2 ).add( detail );

	/* Tube falloff — arcs erupt from poles and mostly fade before reaching
	     the outer equator. Softer curve + noise bridges let ~20% of arcs
	     make it all the way across. */

	const outerRaw = smoothstep( - 0.15, 0.8, inner );
	const bridgeNoise = gnoise( np.mul( 0.8 ).add( vec3( uTime.mul( 0.12 ), 0.0, uTime.mul( 0.09 ) ) ) );
	const bridge = smoothstep( 0.15, 0.55, bridgeNoise ).mul( 0.65 );
	const tubeFade = max( 0.06, outerRaw.add( bridge ) );

	/* Many small spatial gates at high harmonics */

	const warp = gnoise( np.mul( 0.5 ).add( vec3( uTime.mul( 0.08 ) ) ) ).mul( 2.0 );
	const wa = ringAngle.add( warp );
	const g1 = pow( max( 0.0, sin( wa.mul( 5.0 ).add( uTime.mul( 4.0 ) ) ) ), 1.5 );
	const g2 = pow( max( 0.0, sin( wa.mul( 7.0 ).sub( uTime.mul( 3.0 ) ).add( 1.3 ) ) ), 1.5 );
	const g3 = pow( max( 0.0, sin( wa.mul( 4.0 ).add( uTime.mul( 5.5 ) ).add( 2.8 ) ) ), 2.0 );
	const g4 = pow( max( 0.0, sin( wa.mul( 6.0 ).sub( uTime.mul( 2.5 ) ).add( 4.1 ) ) ), 2.0 );
	const spatialGate = max( max( g1, g2 ), max( g3, g4 ) );

	/* Global pulse — rapid, regular, never fully dark (floor 0.35) */

	const pulse = add( 0.35, sin( uTime.mul( 6.0 ) ).mul( 0.2 ) ).add( sin( uTime.mul( 10.0 ).add( 1.5 ) ).mul( 0.12 ) ).add( pow( max( 0.0, sin( uTime.mul( 4.5 ) ) ), 3.0 ).mul( 0.3 ) );

	/* Pole energy — always present, rapid flicker on top */

	const poleBase = poleGlow.mul( 1.5 );
	const poleFlicker = poleCore.mul( 2.5 ).mul( add( 0.7, mul( 0.3, sin( uTime.mul( 12.0 ) ) ) ) );

	/* Zap crackle — heavy in mid-tube dissipation zone + poles */

	const dissipateZone = smoothstep( 0.05, 0.4, outerRaw ).mul( sub( 1.0, outerRaw.mul( 0.6 ) ) );
	const zapNoise = gnoise( np.mul( 5.0 ).add( vec3( uTime.mul( 2.5 ), uTime.mul( 1.8 ), uTime.mul( - 2.0 ) ) ) );
	const zap = pow( max( 0.0, zapNoise ), 1.8 );
	const zapGate = pow( max( 0.0, sin( uTime.mul( 20.0 ).add( ringAngle.mul( 6.0 ) ) ) ), 2.0 );
	const zap2 = pow( max( 0.0, gnoise( np.mul( 7.0 ).add( vec3( uTime.mul( - 1.5 ), uTime.mul( 2.8 ), uTime.mul( 1.2 ) ) ) ) ), 2.0 );
	const zapGate2 = pow( max( 0.0, sin( uTime.mul( 28.0 ).add( ringAngle.mul( 5.0 ) ).add( 1.5 ) ) ), 2.0 );
	const zapFlash = zap.mul( zapGate ).add( zap2.mul( zapGate2 ) ).mul( 2.5 ).mul( max( poleGlow, max( dissipateZone, 0.15 ) ) );

	/* Combine: ridges × tube falloff × ring gate × pulse + pole energy + crackle */

	const gatedPattern = pattern.mul( tubeFade ).mul( mix( 0.08, 1.0, spatialGate ) ).mul( mix( 0.55, 1.0, poleGlow ) );
	const brightness = gatedPattern.mul( pulse ).add( poleBase ).add( poleFlicker ).add( zapFlash ).mul( uIntensity );
	const alpha = smoothstep( 0.06, 0.35, brightness ).mul( 0.85 );
	return vec4( uColor.mul( brightness ), alpha );

} );