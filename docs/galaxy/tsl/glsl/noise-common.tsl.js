/* Shared noise functions for galaxy procedural shaders.
   Imported by planet/star bake and detail shaders. */

// Three.js TSL r183 — manually patched from transpiler output

import {
	sub, sin, cos, vec3, Fn, dot, fract, floor, mul, vec4, float, add,
	Loop, If, Break, abs, clamp, pow, select, log, int, exp,
	max, sqrt, length
} from 'three/tsl';

export const uvToSphere = /*@__PURE__*/ Fn( ( [ uv ] ) => {

	const theta = uv.x.mul( 2.0 ).mul( 3.14159265359 );
	const phi = sub( 1.0, uv.y ).mul( 3.14159265359 );
	const sp = sin( phi );

	return vec3( sp.mul( cos( theta ) ), cos( phi ), sp.mul( sin( theta ) ) );

} );

export const hash33 = /*@__PURE__*/ Fn( ( [ p_immutable ] ) => {

	const p = p_immutable.toVar();
	p.assign( vec3( dot( p, vec3( 127.1, 311.7, 74.7 ) ), dot( p, vec3( 269.5, 183.3, 246.1 ) ), dot( p, vec3( 113.5, 271.9, 124.6 ) ) ) );

	return fract( sin( p ).mul( 43758.5453 ) ).mul( 2.0 ).sub( 1.0 );

} );

/* 3D gradient noise with analytical derivatives — returns vec4(value, dx, dy, dz) */

export const gnoised = /*@__PURE__*/ Fn( ( [ p ] ) => {

	const i = floor( p );
	const f = fract( p );
	const u = f.mul( f ).mul( sub( 3.0, mul( 2.0, f ) ) );
	const du = mul( 6.0, f ).mul( sub( 1.0, f ) );
	const n000 = dot( hash33( i ), f );
	const n100 = dot( hash33( i.add( vec3( 1, 0, 0 ) ) ), f.sub( vec3( 1, 0, 0 ) ) );
	const n010 = dot( hash33( i.add( vec3( 0, 1, 0 ) ) ), f.sub( vec3( 0, 1, 0 ) ) );
	const n110 = dot( hash33( i.add( vec3( 1, 1, 0 ) ) ), f.sub( vec3( 1, 1, 0 ) ) );
	const n001 = dot( hash33( i.add( vec3( 0, 0, 1 ) ) ), f.sub( vec3( 0, 0, 1 ) ) );
	const n101 = dot( hash33( i.add( vec3( 1, 0, 1 ) ) ), f.sub( vec3( 1, 0, 1 ) ) );
	const n011 = dot( hash33( i.add( vec3( 0, 1, 1 ) ) ), f.sub( vec3( 0, 1, 1 ) ) );
	const n111 = dot( hash33( i.add( vec3( 1, 1, 1 ) ) ), f.sub( vec3( 1, 1, 1 ) ) );
	const a = n000;
	const b = n100.sub( n000 );
	const c = n010.sub( n000 );
	const d = n001.sub( n000 );
	const e = n110.sub( n010 ).sub( b );
	const f0 = n101.sub( n001 ).sub( b );
	const g = n011.sub( n001 ).sub( c );
	const h = n111.sub( n011 ).sub( n101 ).add( n001 ).sub( e );
	const value = a.add( b.mul( u.x ) ).add( c.mul( u.y ) ).add( d.mul( u.z ) ).add( e.mul( u.x ).mul( u.y ) ).add( f0.mul( u.x ).mul( u.z ) ).add( g.mul( u.y ).mul( u.z ) ).add( h.mul( u.x ).mul( u.y ).mul( u.z ) );
	const deriv = du.mul( vec3( b.add( e.mul( u.y ) ).add( f0.mul( u.z ) ).add( h.mul( u.y ).mul( u.z ) ), c.add( e.mul( u.x ) ).add( g.mul( u.z ) ).add( h.mul( u.x ).mul( u.z ) ), d.add( f0.mul( u.x ) ).add( g.mul( u.y ) ).add( h.mul( u.x ).mul( u.y ) ) ) );

	return vec4( value, deriv.x, deriv.y, deriv.z );

} );

/* FBM with analytical derivatives — slopeness suppresses amplitude at steep slopes */

export const fbmd = /*@__PURE__*/ Fn( ( [ p_immutable, slopeness ] ) => {

	const p = p_immutable.toVar();
	const v = float( 0.0 ).toVar();
	const a = float( 0.5 ).toVar();
	const derivative = vec3( 0.0 ).toVar();
	const freq = float( 1.0 ).toVar();

	Loop( { start: 0, end: 4 }, ( { i } ) => {

		const n = gnoised( p );
		const nx = n.x.div( add( 1.0, slopeness.mul( dot( derivative, derivative ) ) ) );
		v.addAssign( a.mul( nx ) );
		derivative.addAssign( a.mul( n.yzw ).mul( freq ) );
		freq.mulAssign( 2.17 );
		p.mulAssign( 2.17 );
		a.mulAssign( 0.45 );

	} );

	return vec4( v, derivative.x, derivative.y, derivative.z );

} );

/* Value-only FBM — cheaper, no derivative tracking */

export const fbm = /*@__PURE__*/ Fn( ( [ p_immutable, slopeness ] ) => {

	const p = p_immutable.toVar();
	const v = float( 0.0 ).toVar();
	const a = float( 0.5 ).toVar();
	const slopeAccum = float( 0.0 ).toVar();

	Loop( { start: 0, end: 4 }, ( { i } ) => {

		const n = gnoised( p );
		const nx = n.x.div( add( 1.0, slopeness.mul( slopeAccum ) ) );
		v.addAssign( a.mul( nx ) );
		slopeAccum.addAssign( dot( n.yzw, n.yzw ).mul( a ).mul( a ) );
		p.mulAssign( 2.17 );
		a.mulAssign( 0.45 );

	} );

	return v;

} );

/* Ridged FBM — sharp crests via folded noise, weight feedback so small
   waves ride on large ones. Returns 0–~1.2 (can overshoot slightly).
   Fixed upper bound loop for mobile WebGL2 driver portability. */

export const ridgedFbm = /*@__PURE__*/ Fn( ( [ p, freq_immutable, lacunarity, octaves ] ) => {

	const freq = freq_immutable.toVar();
	const sum = float( 0.0 ).toVar();
	const amp = float( 0.5 ).toVar();
	const weight = float( 1.0 ).toVar();

	Loop( { start: 0, end: 6 }, ( { i } ) => {

		If( i.greaterThanEqual( octaves ), () => {

			Break();

		} );

		const n = sub( 1.0, abs( gnoised( p.mul( freq ) ).x ) ).toVar();
		n.mulAssign( n );
		n.mulAssign( weight );
		weight.assign( clamp( n.mul( 2.0 ), 0.0, 1.0 ) );
		sum.addAssign( n.mul( amp ) );
		freq.mulAssign( lacunarity );
		amp.mulAssign( 0.45 );

	} );

	return sum;

} );

/* Single Gerstner wave on a unit sphere */

export const gerstnerWave = /*@__PURE__*/ Fn( ( [ sp, dir, freq, amp, steep, phase ] ) => {

	const dp = dot( dir, sp );
	const f = freq.mul( dp ).add( phase );
	const height = amp.mul( sin( f ) );
	const tangentDir = dir.sub( dp.mul( sp ) );
	const deriv = amp.mul( freq ).mul( cos( f ) ).mul( add( 1.0, steep ) ).mul( tangentDir );

	return vec4( height, deriv.x, deriv.y, deriv.z );

} );

/* Kelvin temperature → RGB — Tanner Helland algorithm, HDR uncapped to 5.0 */

export const blackbodyRGB = /*@__PURE__*/ Fn( ( [ kelvin ] ) => {

	const t = clamp( kelvin, 1000.0, 40000.0 ).div( 100.0 );
	const c = vec3( 0 ).toVar();
	c.r.assign( select( t.lessThanEqual( 66.0 ), 1.0, mul( 1.293, pow( t.sub( 60.0 ), - 0.1332 ) ) ) );
	c.g.assign( select( t.lessThanEqual( 66.0 ), mul( 0.390, log( t ) ).sub( 0.632 ), mul( 1.130, pow( t.sub( 60.0 ), - 0.0755 ) ) ) );
	c.b.assign( select( t.greaterThanEqual( 66.0 ), 1.0, select( t.lessThanEqual( 19.0 ), 0.0, mul( 0.543, log( t.sub( 10.0 ) ) ).sub( 1.196 ) ) ) );

	return clamp( c, 0.0, 5.0 );

} );

/* Crater hash — distinct from gradient noise hash33 so crater
   placement doesn't correlate with terrain features */

export const craterHash33 = /*@__PURE__*/ Fn( ( [ p3_immutable ] ) => {

	const p3 = p3_immutable.toVar();
	p3.assign( fract( p3.mul( vec3( 0.1031, 0.1030, 0.0973 ) ) ) );
	p3.addAssign( dot( p3, p3.yxz.add( 19.19 ) ) );

	return fract( p3.xxy.add( p3.yxx ).mul( p3.zyx ) );

} );

/* Weighted sinusoidal crater field — sin(2*PI*sqrt(d)) naturally produces
   bowl + raised rim + decay in one expression. 5×5×5 neighbor search.
   Transpiler destroyed the triple-nested loop — manually rewritten. */

export const craterNoise = /*@__PURE__*/ Fn( ( [ x ] ) => {

	const p = floor( x );
	const f = fract( x );
	const va = float( 0.0 ).toVar();
	const wt = float( 0.0 ).toVar();
	const TWO_PI = float( 2.0 * Math.PI );

	Loop( { start: int( - 2 ), end: int( 2 ), condition: '<=' }, ( { i: li } ) => {
		Loop( { start: int( - 2 ), end: int( 2 ), condition: '<=' }, ( { i: lj } ) => {
			Loop( { start: int( - 2 ), end: int( 2 ), condition: '<=' }, ( { i: lk } ) => {

				const g = vec3( float( li ), float( lj ), float( lk ) );
				const o = craterHash33( p.add( g ) ).mul( 0.8 );
				const d = length( f.sub( g ).sub( o ) );
				const w = exp( d.mul( - 4.0 ) );
				va.addAssign( w.mul( sin( TWO_PI.mul( sqrt( d ) ) ) ) );
				wt.addAssign( w );

			} );
		} );
	} );

	return abs( va.div( wt ) );

} );

/* Multi-scale crater field with exponential compression for contrast */

export const craterFbm = /*@__PURE__*/ Fn( ( [ x ] ) => {

	const c = craterNoise( x.mul( 1.5 ) ).mul( 0.9 ).add( craterNoise( x.mul( 4.0 ) ).mul( 0.5 ) ).add( craterNoise( x.mul( 11.0 ) ).mul( 0.3 ) );

	return exp( c.negate().add( 0.05 ) );

} );

/* 3D Voronoi — returns vec3(F1, F2, cellId).
   Transpiler destroyed the triple-nested loop — manually rewritten. */

export const voronoi3 = /*@__PURE__*/ Fn( ( [ p ] ) => {

	const gi = floor( p );
	const f = fract( p );
	const F1 = float( 1e5 ).toVar();
	const F2 = float( 1e5 ).toVar();
	const id = float( 0.0 ).toVar();

	Loop( { start: int( - 1 ), end: int( 1 ), condition: '<=' }, ( { i: lx } ) => {
		Loop( { start: int( - 1 ), end: int( 1 ), condition: '<=' }, ( { i: ly } ) => {
			Loop( { start: int( - 1 ), end: int( 1 ), condition: '<=' }, ( { i: lz } ) => {

				const g = vec3( float( lx ), float( ly ), float( lz ) );
				const o = hash33( gi.add( g ) ).mul( 0.5 ).add( 0.5 );
				const r = g.add( o ).sub( f );
				const d = dot( r, r );

				If( d.lessThan( F1 ), () => {

					F2.assign( F1 );
					F1.assign( d );
					id.assign( dot( gi.add( g ), vec3( 7.0, 157.0, 113.0 ) ) );

				} ).ElseIf( d.lessThan( F2 ), () => {

					F2.assign( d );

				} );

			} );
		} );
	} );

	return vec3( sqrt( F1 ), sqrt( F2 ), id );

} );

/* 3D distance metric — 0: euclidean (squared), 1: manhattan,
   2: chebyshev, 3: triangular (hex XY + Z).
   Uses assignment pattern instead of early returns for TSL safety. */

export const distMetric3D = /*@__PURE__*/ Fn( ( [ r, metric ] ) => {

	const a = abs( r );
	const result = dot( r, r ).toVar();

	If( metric.equal( 1 ), () => {

		result.assign( a.x.add( a.y ).add( a.z ) );

	} ).ElseIf( metric.equal( 2 ), () => {

		result.assign( max( a.x, max( a.y, a.z ) ) );

	} ).ElseIf( metric.equal( 3 ), () => {

		result.assign( max( a.x.mul( 0.866025 ).add( r.y.mul( 0.5 ) ), max( r.y.negate(), a.z ) ) );

	} );

	return result;

} );

/* Metric-aware 3D cellular noise — returns vec4(F1, F2, cellId, 0).
   GLSL out-param removed; delta is available via cellNoise3DDelta().
   Transpiler destroyed the triple-nested loop — manually rewritten. */

export const cellNoise3D = /*@__PURE__*/ Fn( ( [ p, jitter, metric, seed ] ) => {

	const gi = floor( p );
	const f = fract( p );
	const F1 = float( 1e5 ).toVar();
	const F2 = float( 1e5 ).toVar();
	const id = float( 0.0 ).toVar();

	Loop( { start: int( - 1 ), end: int( 1 ), condition: '<=' }, ( { i: lx } ) => {
		Loop( { start: int( - 1 ), end: int( 1 ), condition: '<=' }, ( { i: ly } ) => {
			Loop( { start: int( - 1 ), end: int( 1 ), condition: '<=' }, ( { i: lz } ) => {

				const g = vec3( float( lx ), float( ly ), float( lz ) );
				const o = hash33( gi.add( g ).add( vec3( seed ) ) ).mul( 0.5 ).add( 0.5 );
				const r = g.add( o.mul( jitter ) ).add( sub( 1.0, jitter ).mul( 0.5 ) ).sub( f );
				const d = distMetric3D( r, metric );

				If( d.lessThan( F1 ), () => {

					F2.assign( F1 );
					F1.assign( d );
					id.assign( dot( gi.add( g ), vec3( 7.0, 157.0, 113.0 ) ) );

				} ).ElseIf( d.lessThan( F2 ), () => {

					F2.assign( d );

				} );

			} );
		} );
	} );

	const sqrtF1 = select( metric.equal( 0 ), sqrt( F1 ), F1 );
	const sqrtF2 = select( metric.equal( 0 ), sqrt( F2 ), F2 );

	return vec4( sqrtF1, sqrtF2, id, 0.0 );

} );

/* Nearest-cell delta for normal perturbation — companion to cellNoise3D.
   Separate function because TSL Fn can only return one node. */

export const cellNoise3DDelta = /*@__PURE__*/ Fn( ( [ p, jitter, metric, seed ] ) => {

	const gi = floor( p );
	const f = fract( p );
	const F1 = float( 1e5 ).toVar();
	const delta = vec3( 0.0 ).toVar();

	Loop( { start: int( - 1 ), end: int( 1 ), condition: '<=' }, ( { i: lx } ) => {
		Loop( { start: int( - 1 ), end: int( 1 ), condition: '<=' }, ( { i: ly } ) => {
			Loop( { start: int( - 1 ), end: int( 1 ), condition: '<=' }, ( { i: lz } ) => {

				const g = vec3( float( lx ), float( ly ), float( lz ) );
				const o = hash33( gi.add( g ).add( vec3( seed ) ) ).mul( 0.5 ).add( 0.5 );
				const r = g.add( o.mul( jitter ) ).add( sub( 1.0, jitter ).mul( 0.5 ) ).sub( f );
				const d = distMetric3D( r, metric );

				If( d.lessThan( F1 ), () => {

					F1.assign( d );
					delta.assign( r );

				} );

			} );
		} );
	} );

	return delta;

} );

/* Dual-layer crystal pattern — overlays two cellular noise fields at
   different seeds. Returns vec4(crystalVal, F1, cellId, edgeWidth).
   GLSL out-param removed; delta available via crystals3DDelta(). */

export const crystals3D = /*@__PURE__*/ Fn( ( [ p, jitter, metric, seed ] ) => {

	const c0 = cellNoise3D( p, jitter, metric, seed );
	const c1 = cellNoise3D( p, jitter, metric, seed.add( 23.0 ) );

	const useC1 = c1.x.lessThan( c0.x );
	const pri = select( useC1, c1, c0 );
	const crystalVal = abs( c0.x.sub( c1.x ) );

	return vec4( crystalVal, pri.x, pri.z, pri.y.sub( pri.x ) );

} );

/* Crystal delta — nearest-cell offset of the primary (closer) layer */

export const crystals3DDelta = /*@__PURE__*/ Fn( ( [ p, jitter, metric, seed ] ) => {

	const c0 = cellNoise3D( p, jitter, metric, seed );
	const c1 = cellNoise3D( p, jitter, metric, seed.add( 23.0 ) );
	const d0 = cellNoise3DDelta( p, jitter, metric, seed );
	const d1 = cellNoise3DDelta( p, jitter, metric, seed.add( 23.0 ) );

	return select( c1.x.lessThan( c0.x ), d1, d0 );

} );
