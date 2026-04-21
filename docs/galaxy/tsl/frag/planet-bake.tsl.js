// Three.js Transpiler r183

import { abs, acos, add, atan, Break, clamp, Continue, cos, div, dot, exp, float, floor, Fn, fract, If, int, length, log, Loop, max, mix, mul, normalize, pow, Return, round, select, sin, smoothstep, sqrt, step, sub, uniform, varyingProperty, vec2, vec3, vec4 } from 'three/tsl';

const vUv = varyingProperty( 'vec2', 'vUv' );

export const uSeed = uniform( float( 0 ) );
export const uPlanetMode = uniform( int( 0 ) );
export const uSlopeness = uniform( float( 0 ) );
export const uOceanLevel = uniform( float( 0 ) );
export const uTemperature = uniform( float( 0 ) );
export const uCraterDensity = uniform( float( 0 ) );
export const uSpecular = uniform( float( 0 ) );
export const uBaseColor1 = uniform( vec3( 0, 0, 0 ) );
export const uBaseColor2 = uniform( vec3( 0, 0, 0 ) );
export const uBaseColor3 = uniform( vec3( 0, 0, 0 ) );
export const uAtmoIntensity = uniform( float( 0 ) );
export const uAtmoTint = uniform( vec3( 0, 0, 0 ) );

/* Gas */

export const uBandCount = uniform( float( 0 ) );
export const uWarpStrength = uniform( float( 0 ) );
export const uStormSize = uniform( float( 0 ) );

/* Exotic */

export const uCrackScale = uniform( float( 0 ) );
export const uSubsurfaceColor = uniform( vec3( 0, 0, 0 ) );
export const uEmissiveIntensity = uniform( float( 0 ) );
export const uEmissiveColor = uniform( vec3( 0, 0, 0 ) );
export const uBulbosity = uniform( float( 0 ) );
export const uCrystalMetric = uniform( int( 0 ) );

/* Rocky biome system */

export const uMoistureOffset = uniform( float( 0 ) );
export const uBiomeCount = uniform( float( 0 ) );

import {
	uvToSphere, hash33, gnoised, fbmd, fbm, ridgedFbm, gerstnerWave, blackbodyRGB,
	craterHash33, craterNoise, craterFbm, voronoi3, distMetric3D,
	cellNoise3D, cellNoise3DDelta, crystals3D, crystals3DDelta
} from '../glsl/noise-common.tsl.js';

/* Inline noise-common copies removed — now imported from ../glsl/noise-common.tsl.js */

/* Captured by each render function for the derivative pass */

const gDerivatives = vec3( 0.0 ).toVar();

/* Flow-field warp — adapted from colordodge's spherical coordinate displacement.
   Two noise values become polar angles that create a 3D offset vector,
   warping the base terrain into organic continent shapes. */

export const flowWarp = /*@__PURE__*/ Fn( ( [ p, s, strength ] ) => {

	const n1 = fbm( p.mul( 1.5 ).add( vec3( s.mul( 0.37 ), s.mul( 1.13 ), s.mul( 0.61 ) ) ), 0.3 );
	const n2 = fbm( p.mul( 1.5 ).add( vec3( s.mul( 1.83 ), s.mul( 0.29 ), s.mul( 1.47 ) ) ), 0.3 );
	const alpha = n1.mul( 6.2832 );
	const beta = n2.mul( 3.1416 );
	const offset = vec3( cos( alpha ).mul( cos( beta ) ), sin( beta ), sin( alpha ).mul( cos( beta ) ) );

	return p.add( offset.mul( strength ) );

} );

/* 6 Gerstner waves with seed-derived directions, frequencies, amplitudes.
   Big waves are slow broad swells; small waves are fast sharp chop.
   Returns vec4(height, tangent-plane derivative.xyz). */

export const gerstnerField = /*@__PURE__*/ Fn( ( [ sp, s, roughness ] ) => {

	/* Domain warp bends wave fronts so they're not perfect great circles */

	const warpOffset = gnoised( sp.mul( 4.0 ).add( vec3( s.mul( 0.7 ) ) ) ).yzw;
	const warpedSp = normalize( sp.add( warpOffset.mul( 0.07 ).mul( roughness ) ) );

	/* Slow noise modulates amplitude regionally — creates calm/rough patches */

	const ampMod = add( 0.55, mul( 0.45, fbm( sp.mul( 2.0 ).add( vec3( s.mul( 1.3 ) ) ), 0.3 ) ) );
	const totalH = float( 0.0 ).toVar();
	const totalD = vec3( 0.0 ).toVar();

	Loop( { start: 0, end: 6 }, ( { i } ) => {

		const fi = float( i );
		const a1 = fract( s.mul( 0.137 ) ).mul( 6.2832 ).add( fi.mul( 2.39996 ) );
		const a2 = acos( clamp( sub( 1.0, mul( 2.0, fi ).add( 1.0 ).div( 6.0 ) ).add( fract( s.mul( add( 0.293, fi.mul( 0.179 ) ) ) ).mul( 0.25 ) ).sub( 0.125 ), - 1.0, 1.0 ) );
		const dir = normalize( vec3( cos( a1 ).mul( sin( a2 ) ), cos( a2 ), sin( a1 ).mul( sin( a2 ) ) ) );
		const freq = add( 25.0, fi.mul( 25.0 ) ).mul( add( 0.8, fract( s.mul( add( 0.417, fi.mul( 0.031 ) ) ) ).mul( 0.4 ) ) );
		const amp = roughness.mul( ampMod ).mul( 0.35 ).div( add( 1.0, fi.mul( 0.6 ) ) );
		const steep = add( 0.3, fract( s.mul( add( 0.619, fi.mul( 0.043 ) ) ) ).mul( 0.5 ) );

		/* Per-wave phase noise breaks the lattice pattern from crossing waves */

		const phaseNoise = gnoised( sp.mul( add( 6.0, fi.mul( 4.0 ) ) ).add( vec3( s.mul( add( 0.5, fi.mul( 0.2 ) ) ) ) ) ).x.mul( 5.5 );
		const phase = fract( s.mul( add( 0.773, fi.mul( 0.089 ) ) ) ).mul( 6.2832 ).add( phaseNoise );
		const w = gerstnerWave( warpedSp, dir, freq, amp, steep, phase );
		totalH.addAssign( w.x );
		totalD.addAssign( w.yzw );

	} );

	return vec4( totalH, totalD.x, totalD.y, totalD.z );

} );

/* Shared ocean surface — used by both rocky (below waterline) and ocean subtypes.
   Gerstner waves provide both height and analytic derivatives directly. */

export const oceanSurface = /*@__PURE__*/ Fn( ( [ sp, s, depth, roughness ] ) => {

	const gw = gerstnerField( sp, s, roughness );
	const waves = gw.x;
	gDerivatives.assign( gw.yzw );
	const shallow = uBaseColor1.mul( 1.1 ).add( vec3( 0.02, 0.04, 0.03 ) );
	const mid = uBaseColor1.mul( 0.65 );
	const deep = uBaseColor1.mul( 0.3 );
	const surfaceColor = mix( shallow, mid, smoothstep( 0.0, 0.15, depth ) ).toVar();
	surfaceColor.assign( mix( surfaceColor, deep, smoothstep( 0.15, 0.35, depth ) ) );
	surfaceColor.mulAssign( add( 0.8, waves.mul( 0.5 ) ) );
	const foam = smoothstep( 0.3, 0.65, waves ).mul( roughness ).mul( 2.0 );
	surfaceColor.addAssign( vec3( foam.mul( 0.15 ) ) );
	const slope = length( gw.yzw );
	surfaceColor.mulAssign( mix( 1.0, 0.5, smoothstep( 0.2, 1.2, slope ) ) );
	const lat = abs( sp.y );
	const polarTint = mix( uBaseColor1, vec3( 0.5, 0.6, 0.7 ), 0.4 );
	surfaceColor.assign( mix( surfaceColor, polarTint, smoothstep( 0.0, 0.7, lat ).mul( 0.25 ) ) );

	return vec4( surfaceColor, 0.0 );

} );

export const renderRocky = /*@__PURE__*/ Fn( ( [ sp, s ] ) => {

	const lat = abs( sp.y );

	/* Continent shapes — direct FBM, no flowWarp.
	     Derivatives scaled so per-biome normals show through */

	const hd = fbmd( sp.mul( 3.5 ).add( vec3( s ) ), uSlopeness );
	gDerivatives.assign( hd.yzw.mul( 0.15 ) );
	const height = hd.x.mul( 0.5 ).add( 0.5 );
	const t = float( 0.02 );

	/* Temperature axis */

	const noisePerturb = gnoised( sp.mul( 4.0 ).add( vec3( s.mul( 1.7 ) ) ) ).x;
	const temp = cos( lat.mul( 3.14159265359 ) ).mul( 0.5 ).add( 0.5 ).add( noisePerturb.mul( 0.15 ) ).add( uTemperature ).sub( 0.5 ).toVar();
	temp.assign( clamp( temp, 0.0, 1.0 ) );

	/* Moisture axis with Hadley cell approximation */

	const moistureFbm = fbm( sp.mul( 2.5 ).add( vec3( s.mul( 3.1 ), s.mul( 0.7 ), s.mul( 1.9 ) ) ), 0.4 ).mul( 0.5 ).add( 0.5 );
	const hadleyD = abs( lat ).sub( 0.4 );
	const hadley = sub( 1.0, mul( 0.4, exp( mul( - 8.0, hadleyD ).mul( hadleyD ) ) ) );
	const moisture = clamp( moistureFbm.mul( hadley ).add( uMoistureOffset ), 0.0, 1.0 );
	const elev = height;
	const biomeScale = add( 0.3, uBiomeCount.mul( 0.7 ) );

	/* Biome weights — same system as detail shader */

	const iceW = smoothstep( 0.18, 0.08, temp ).toVar();
	const snowline = add( 0.82, noisePerturb.mul( 0.03 ) );
	iceW.assign( max( iceW, smoothstep( snowline, snowline.add( 0.03 ), elev ) ) );
	const tundraW = smoothstep( 0.05, 0.18, temp ).mul( smoothstep( 0.35, 0.22, temp ) ).toVar();
	const borealW = smoothstep( 0.15, 0.30, temp ).mul( smoothstep( 0.45, 0.30, temp ) ).mul( smoothstep( 0.35, 0.55, moisture ) ).toVar();
	const tempForestW = smoothstep( 0.30, 0.45, temp ).mul( smoothstep( 0.65, 0.50, temp ) ).mul( smoothstep( 0.40, 0.60, moisture ) ).mul( biomeScale ).toVar();
	const grassW = smoothstep( 0.18, 0.35, temp ).mul( smoothstep( 0.80, 0.60, temp ) ).mul( sub( 1.0, smoothstep( 0.55, 0.75, moisture ) ) ).mul( biomeScale ).toVar();
	const sandDesertW = smoothstep( 0.50, 0.65, temp ).mul( smoothstep( 0.35, 0.20, moisture ) ).mul( biomeScale ).toVar();
	const rockyDesertW = smoothstep( 0.45, 0.60, temp ).mul( smoothstep( 0.75, 0.60, temp ) ).mul( smoothstep( 0.20, 0.35, moisture ) ).mul( sub( 1.0, smoothstep( 0.40, 0.55, moisture ) ) ).mul( biomeScale ).toVar();
	const tropicalW = smoothstep( 0.60, 0.80, temp ).mul( smoothstep( 0.50, 0.70, moisture ) ).mul( biomeScale ).toVar();
	const alpineThresh = add( 0.72, noisePerturb.mul( 0.04 ) );
	const mountainW = smoothstep( alpineThresh, alpineThresh.add( 0.06 ), elev ).mul( biomeScale ).toVar();

	/* Grassland acts as catch-all — prevents black gaps in unclaimed zones */

	grassW.assign( max( grassW, mul( 0.08, biomeScale ) ) );
	const totalW = iceW.add( tundraW ).add( borealW ).add( tempForestW ).add( grassW ).add( sandDesertW ).add( rockyDesertW ).add( tropicalW ).add( mountainW ).add( 0.001 );
	iceW.divAssign( totalW );
	tundraW.divAssign( totalW );
	borealW.divAssign( totalW );
	tempForestW.divAssign( totalW );
	grassW.divAssign( totalW );
	sandDesertW.divAssign( totalW );
	rockyDesertW.divAssign( totalW );
	tropicalW.divAssign( totalW );
	mountainW.divAssign( totalW );

	/* Matching detail shader biome colors — same techniques, fewer octaves */

	const col1 = uBaseColor1, col2 = uBaseColor2, col3 = uBaseColor3;
	const colGrey = vec3( dot( col3, vec3( 0.3, 0.5, 0.2 ) ) ).mul( 0.7 ).add( vec3( 0.15 ) );
	const colWarm = col3.mul( vec3( 1.2, 1.0, 0.7 ) ).add( vec3( 0.08, 0.04, 0.0 ) );
	const biomeColor = vec3( 0.0 ).toVar();

	If( iceW.greaterThan( 0.01 ), () => {

		const crack = ridgedFbm( sp.mul( 8.0 ).add( vec3( s.mul( 2.3 ) ) ), 3.5, 2.1, 2 );
		const iceBase = mix( vec3( 0.92, 0.94, 0.98 ), uSubsurfaceColor, 0.10 );
		biomeColor.addAssign( iceW.mul( mix( iceBase, uSubsurfaceColor.mul( 0.4 ).add( vec3( 0.15 ) ), smoothstep( 0.5, 0.8, crack ) ) ) );

	} );

	If( tundraW.greaterThan( 0.01 ), () => {

		const splotch = smoothstep( 0.15, 0.45, fbm( sp.mul( 3.0 ).add( vec3( s.mul( 0.5 ) ) ), 0.3 ).mul( 0.5 ).add( 0.5 ) );
		biomeColor.addAssign( tundraW.mul( mix( colGrey.mul( 0.8 ).add( vec3( 0.05, 0.03, 0.02 ) ), mix( col2, colGrey, 0.6 ).mul( 0.5 ), splotch ) ) );

	} );

	If( borealW.greaterThan( 0.01 ), () => {

		const trees = ridgedFbm( sp.mul( 5.0 ).add( vec3( s.mul( 1.1 ) ) ), 2.5, 2.0, 2 );
		const canopy = smoothstep( 0.35, 0.65, trees );
		biomeColor.addAssign( borealW.mul( mix( mix( colGrey, col2, 0.25 ).mul( 0.6 ), col2.mul( 0.20 ), canopy ) ) );

	} );

	If( tempForestW.greaterThan( 0.01 ), () => {

		const warpP = sp.mul( 8.0 ).add( vec3( s.mul( 1.7 ) ) );
		const warp = gnoised( warpP.mul( 0.4 ).add( vec3( s.mul( 0.3 ) ) ) ).yzw.mul( 0.6 );
		const tex = fbm( warpP.add( warp ), 0.9 ).mul( 0.5 ).add( 0.5 );
		biomeColor.addAssign( tempForestW.mul( mix( col2.mul( 0.30 ).add( col3.mul( 0.05 ) ), col2.mul( 0.65 ).add( vec3( 0.04 ) ), tex ) ) );

	} );

	If( grassW.greaterThan( 0.01 ), () => {

		const roll = fbm( sp.mul( 2.0 ).add( vec3( s.mul( 0.3 ) ) ), 0.2 ).mul( 0.5 ).add( 0.5 );
		biomeColor.addAssign( grassW.mul( mix( mix( colWarm, col2, 0.4 ).mul( 0.7 ), colWarm.mul( 1.1 ).add( col2.mul( 0.3 ) ), roll ) ) );

	} );

	If( sandDesertW.greaterThan( 0.01 ), () => {

		const duneP = sp.mul( vec3( 3.0, 12.0, 3.0 ) ).add( vec3( s.mul( 0.9 ) ) );
		const dunes = ridgedFbm( duneP, 3.0, 2.0, 2 );
		biomeColor.addAssign( sandDesertW.mul( mix( colWarm.mul( 0.65 ).add( vec3( 0.02 ) ), colWarm.mul( 1.3 ).add( vec3( 0.12, 0.08, 0.0 ) ), smoothstep( 0.25, 0.65, dunes ) ) ) );

	} );

	If( rockyDesertW.greaterThan( 0.01 ), () => {

		const mesa = ridgedFbm( sp.mul( 4.0 ).add( vec3( s.mul( 1.5 ) ) ), 3.5, 2.2, 3 ).toVar();
		mesa.assign( pow( max( 0.0, sub( 1.0, abs( mesa.sub( 0.5 ) ).mul( 2.0 ) ) ), 5.0 ) );
		biomeColor.addAssign( rockyDesertW.mul( mix( colGrey.mul( 0.9 ).add( colWarm.mul( 0.2 ) ), colGrey.mul( 0.4 ), mesa ) ) );

	} );

	If( tropicalW.greaterThan( 0.01 ), () => {

		const junP = sp.mul( 7.0 ).add( vec3( s.mul( 2.1 ) ) );
		const junWarp = gnoised( junP.mul( 0.3 ).add( vec3( s.mul( 0.8 ) ) ) ).yzw.mul( 0.8 );
		const canopy = ridgedFbm( junP.add( junWarp ), 3.0, 2.1, 2 );
		biomeColor.addAssign( tropicalW.mul( mix( col2.mul( 0.15 ), col2.mul( 0.45 ).add( col1.mul( 0.06 ) ), smoothstep( 0.3, 0.7, canopy ) ) ) );

	} );

	If( mountainW.greaterThan( 0.01 ), () => {

		const ridge = ridgedFbm( sp.mul( 6.0 ).add( vec3( s.mul( 0.7 ) ) ), 4.5, 2.1, 3 );
		biomeColor.addAssign( mountainW.mul( mix( colGrey.mul( 0.55 ).add( col3.mul( 0.08 ) ), vec3( 0.55, 0.52, 0.48 ), smoothstep( 0.3, 0.7, ridge ) ) ) );

	} );

	const surfaceColor = biomeColor.toVar();

	/* Result var + landOnly flag replaces two Return() calls — TSL Return()
	   inside single-branch If compiles to bare `return;` in WGSL, which is
	   invalid when the enclosing Fn has a declared return type. */
	const result = vec4( 0 ).toVar();
	const landOnly = float( 1.0 ).toVar();

	const oceanMask = sub( 1.0, smoothstep( uOceanLevel.sub( t ), uOceanLevel.add( t ), height ) );

	If( oceanMask.greaterThan( 0.01 ), () => {

		landOnly.assign( 0.0 );

		const depth = max( 0.0, uOceanLevel.sub( height ) );
		const terrainDerivs = hd.yzw;
		const oceanColor = oceanSurface( sp, s, depth, uWarpStrength.mul( 0.4 ) ).toVar();
		const oceanDerivs = gDerivatives;
		const iceOpacity = smoothstep( 0.3, 0.7, iceW );

		If( iceOpacity.greaterThan( 0.01 ), () => {

			const iceGrain = gnoised( sp.mul( 20.0 ).add( vec3( s.mul( 3.0 ) ) ) ).x;
			const iceBase = mix( vec3( 0.90, 0.93, 0.97 ), uSubsurfaceColor, 0.12 );
			const ic = iceBase.mul( add( 0.9, iceGrain.mul( 0.1 ) ) );
			oceanColor.assign( mix( oceanColor, ic, iceOpacity ) );

		} );

		const specAlpha = uSpecular.mul( oceanMask ).mul( sub( 1.0, iceOpacity ) );

		If( oceanMask.greaterThan( 0.99 ), () => {

			result.assign( vec4( oceanColor, specAlpha ) );

		} ).Else( () => {

			gDerivatives.assign( mix( terrainDerivs, oceanDerivs, oceanMask ) );
			result.assign( vec4( mix( surfaceColor, oceanColor, oceanMask ), specAlpha ) );

		} );

	} );

	If( landOnly.greaterThan( 0.5 ), () => {

		const slope = length( hd.yzw );
		surfaceColor.mulAssign( mix( 1.0, 0.55, smoothstep( 0.15, 1.2, slope.mul( uSlopeness ) ) ) );
		result.assign( vec4( surfaceColor, 0.0 ) );

	} );

	return result;

} );

export const renderBarren = /*@__PURE__*/ Fn( ( [ sp, s ] ) => {

	const cp = sp.add( vec3( s.mul( 0.13 ), s.mul( 0.37 ), s.mul( 0.71 ) ) );
	const height = craterFbm( cp ).toVar();

	/* Finite-difference normals from crater height field */

	const eps = float( 0.013 );
	const hx = craterFbm( cp.add( vec3( eps, 0.0, 0.0 ) ) );
	const hy = craterFbm( cp.add( vec3( 0.0, eps, 0.0 ) ) );
	const hz = craterFbm( cp.add( vec3( 0.0, 0.0, eps ) ) );
	gDerivatives.assign( vec3( hx, hy, hz ).sub( height ).div( eps ) );

	/* Macro terrain variation so not every crater sits at the same base level */

	const macro = fbm( sp.mul( 1.5 ).add( vec3( s ) ), 0.3 ).mul( 0.15 );
	height.assign( height.mul( 0.85 ).add( macro ).add( 0.08 ) );
	const brightness = mix( 0.35, 1.0, height );
	const surfaceColor = uBaseColor1.mul( brightness ).toVar();
	surfaceColor.assign( mix( surfaceColor, uBaseColor2.mul( brightness ), smoothstep( 0.3, 0.7, height ).mul( 0.35 ) ) );
	const slope = length( gDerivatives );
	surfaceColor.mulAssign( mix( 1.0, 0.5, smoothstep( 1.0, 8.0, slope.mul( uSlopeness ) ) ) );

	/* Surface microdetail — pitting darkens into pores, grain breaks up smoothness */

	const pitting = gnoised( sp.mul( 30.0 ).add( vec3( s.mul( 2.3 ) ) ) ).x;
	surfaceColor.mulAssign( add( 0.82, pitting.mul( 0.18 ) ) );
	const grain = gnoised( sp.mul( 80.0 ).add( vec3( s.mul( 4.1 ) ) ) ).x;
	surfaceColor.mulAssign( add( 0.88, grain.mul( 0.12 ) ) );

	return vec4( surfaceColor, 0.0 );

} );

export const renderGas = /*@__PURE__*/ Fn( ( [ sp, s ] ) => {

	const lat = sp.y;
	const lon = atan( sp.z, sp.x );

	/* Curl-based band warp — divergence-free flow circles latitude lines */

	const lonP = vec3( sp.x.mul( 3.0 ), sp.y.mul( 0.5 ), sp.z.mul( 3.0 ) );
	const curlN = gnoised( lonP.add( vec3( s.mul( 0.7 ), 0.0, s.mul( 1.1 ) ) ) );
	const curlWarp = curlN.w.mul( sp.x ).sub( curlN.y.mul( sp.z ) );
	const meander1 = fbm( lonP.add( vec3( s, 0.0, s.mul( 0.7 ) ) ), 0.4 );
	const meander2 = fbm( lonP.add( vec3( meander1.mul( 0.5 ).add( s.mul( 2.1 ) ) ) ), 0.35 );
	const warpedLat = lat.add( curlWarp.mul( uWarpStrength ).mul( 0.4 ) ).add( meander2.mul( 2.0 ).sub( 1.0 ).mul( uWarpStrength ).mul( 0.6 ) ).toVar();

	/* Storm count from seed — probability cascade: 70%×1, 40%×2, 20%×3, 5%×4+ */

	const stormCount = int( 0 ).toVar();

	If( uStormSize.greaterThan( 0.01 ), () => {

		stormCount.assign( 1 );
		const sc = fract( s.mul( 0.557 ) );

		If( sc.lessThan( 0.40 ), () => {

			stormCount.assign( 2 );

		} );

		If( sc.lessThan( 0.20 ), () => {

			stormCount.assign( 3 );

		} );

		If( sc.lessThan( 0.05 ), () => {

			stormCount.assign( add( 3, int( fract( s.mul( 0.811 ) ).mul( 5.0 ) ) ).add( 1 ) );

		} );

	} );

	/* Storms DEFLECT bands — they warp warpedLat before band calculation,
	     so bands visibly flow around each vortex instead of being painted over */

	const stormEyeMask = float( 0.0 ).toVar();

	Loop( { start: 0, end: 8 }, ( { i } ) => {

		If( i.greaterThanEqual( stormCount ), () => {

			Break();

		} );

		const fi = float( i );
		const stormSeed = s.add( fi.mul( 17.31 ) );
		const center = vec2( fract( stormSeed.mul( 0.073 ) ).mul( 6.2832 ).sub( 3.1416 ), add( - 0.4, fract( stormSeed.mul( 0.031 ) ).mul( 0.8 ) ) );
		const R = uStormSize.mul( sub( 0.25, fi.mul( 0.025 ) ) );

		/* Noisy boundary — FBM perturbs the distance for turbulent edges */

		const dLon = lon.sub( center.x ).toVar();
		dLon.subAssign( round( dLon.div( 6.2832 ) ).mul( 6.2832 ) );
		const delta = vec2( dLon.mul( cos( center.y ) ), lat.sub( center.y ).mul( 2.0 ) );
		const r = length( delta );
		const rNoise = gnoised( sp.mul( 12.0 ).add( vec3( stormSeed.mul( 0.3 ) ) ) ).x.mul( R ).mul( 0.3 );
		const rNoisy = r.add( rNoise );
		const influence = sub( 1.0, smoothstep( R.mul( 0.5 ), R.mul( 1.3 ), rNoisy ) );

		If( influence.lessThan( 0.01 ), () => {

			Continue();

		} );

		/* Swirl deflection — rotate the latitude around the storm center */

		const ring = smoothstep( 0.0, R.mul( 0.7 ), r ).mul( sub( 1.0, smoothstep( R.mul( 0.85 ), R.mul( 1.2 ), r ) ) );
		const swirlAngle = atan( delta.y, delta.x ).add( ring.mul( sub( 4.5, fi.mul( 0.5 ) ) ) );
		const deflection = sin( swirlAngle ).mul( influence ).mul( R ).mul( 1.5 );
		warpedLat.addAssign( deflection );

		/* Track eye region for later coloring */

		const eyeDist = smoothstep( R.mul( 0.2 ), 0.0, rNoisy );
		stormEyeMask.assign( max( stormEyeMask, eyeDist.mul( influence ) ) );

	} );

	/* Kelvin-Helmholtz billows at band edges */

	const bandPhase = warpedLat.mul( uBandCount ).mul( 3.14159265359 );
	const edgeProximity = sub( 1.0, abs( cos( bandPhase ) ) ).toVar();
	edgeProximity.assign( smoothstep( 0.0, 0.4, edgeProximity ) );
	const kh = sin( lon.mul( 8.0 ).add( bandPhase.mul( 1.7 ) ) ).mul( edgeProximity ).toVar();
	kh.mulAssign( add( 0.5, mul( 0.5, fbm( sp.mul( 5.0 ).add( vec3( s.mul( 0.8 ) ) ), 0.3 ) ) ) );
	warpedLat.addAssign( kh.mul( uWarpStrength ).mul( 0.35 ) );

	/* Seed-derived band frequency multipliers */

	const f1 = add( 0.5, fract( s.mul( 0.137 ) ).mul( 0.5 ) );
	const f2 = add( 1.1, fract( s.mul( 0.293 ) ).mul( 0.6 ) );
	const f3 = add( 1.8, fract( s.mul( 0.419 ) ).mul( 0.8 ) );
	const band1 = sin( warpedLat.mul( uBandCount ).mul( f1 ).mul( 3.14159265359 ) ).mul( 0.6 );
	const band2 = sin( warpedLat.mul( uBandCount ).mul( f2 ).mul( 3.14159265359 ).add( 1.7 ) ).mul( 0.3 );
	const band3 = sin( warpedLat.mul( uBandCount ).mul( f3 ).mul( 3.14159265359 ).add( 3.1 ) ).mul( 0.1 );
	const bands = band1.add( band2 ).add( band3 ).mul( 0.5 ).add( 0.5 ).toVar();
	const turb = fbm( vec3( sp.x.mul( 6.0 ), sp.y.mul( 0.4 ), sp.z.mul( 6.0 ) ).add( vec3( s.mul( 1.7 ) ) ), 0.3 );
	bands.addAssign( turb.mul( add( 0.04, edgeProximity.mul( 0.12 ) ) ) );
	const surfaceColor = mix( uBaseColor1, uBaseColor2, smoothstep( 0.2, 0.5, bands ) ).toVar();
	surfaceColor.assign( mix( surfaceColor, uBaseColor3, smoothstep( 0.55, 0.85, bands ) ) );

	/* Storm eye coloring — applied after bands so the eye is visible */

	If( stormEyeMask.greaterThan( 0.01 ), () => {

		surfaceColor.assign( mix( surfaceColor, uBaseColor3.mul( 1.3 ), stormEyeMask.mul( 0.6 ) ) );

	} );

	surfaceColor.assign( mix( surfaceColor, uBaseColor2.mul( 0.85 ), edgeProximity.mul( 0.08 ) ) );
	const bandEdge = abs( cos( warpedLat.mul( uBandCount ).mul( 3.14159265359 ) ) );
	surfaceColor.mulAssign( add( 0.82, bandEdge.mul( 0.18 ) ) );
	gDerivatives.assign( curlN.yzw );
	const slope = length( curlN.yzw );
	surfaceColor.mulAssign( mix( 1.0, 0.7, smoothstep( 0.3, 1.2, slope.mul( uWarpStrength ) ) ) );

	/* Polar transition — gradual fade, band ghost bleeds through */

	const polarBlend = smoothstep( 0.45, 0.85, abs( lat ) );

	If( polarBlend.greaterThan( 0.01 ), () => {

		const polarNoise = fbm( sp.mul( 7.0 ).add( vec3( s.mul( 2.3 ) ) ), 0.5 );
		const bandGhost = sin( warpedLat.mul( uBandCount ).mul( f1 ).mul( 3.14159265359 ).mul( 0.5 ) ).mul( 0.15 );
		const polarColor = mix( uBaseColor1, uBaseColor2, polarNoise.mul( 0.35 ).add( bandGhost ).add( 0.35 ) ).toVar();
		polarColor.mulAssign( 0.88 );
		surfaceColor.assign( mix( surfaceColor, polarColor, polarBlend ) );

	} );

	return vec4( surfaceColor, 0.0 );

} );

export const renderOcean = /*@__PURE__*/ Fn( ( [ sp, s ] ) => {

	const p = flowWarp( sp.mul( 3.5 ), s, 0.25 );
	const hd = fbmd( p.add( vec3( s ) ), uSlopeness );
	const height = hd.x.mul( 0.5 ).add( 0.5 );
	const t = float( 0.02 );
	const depth = max( 0.0, uOceanLevel.sub( height ) );
	const isOcean = sub( 1.0, smoothstep( uOceanLevel.sub( t ), uOceanLevel.add( t ), height ) );
	const surfaceColor = oceanSurface( sp, s, depth, uWarpStrength ).toVar();

	/* Rare island peaks */

	If( isOcean.lessThan( 0.99 ), () => {

		const landColor = uBaseColor2.mul( 1.2 ).add( 0.1 ).toVar();
		const highland = uBaseColor3;
		landColor.assign( mix( landColor, highland, smoothstep( uOceanLevel.add( 0.05 ), uOceanLevel.add( 0.2 ), height ) ) );
		const slope = length( hd.yzw );
		landColor.mulAssign( mix( 1.0, 0.55, smoothstep( 0.25, 1.5, slope.mul( uSlopeness ) ) ) );
		surfaceColor.assign( mix( surfaceColor, landColor, sub( 1.0, isOcean ) ) );
		gDerivatives.assign( mix( gDerivatives, hd.yzw, sub( 1.0, isOcean ) ) );

	} );

	const spec = isOcean.mul( uSpecular ).mul( sub( 1.0, smoothstep( 0.0, 0.7, abs( sp.y ) ).mul( 0.5 ) ) ).toVar();

	/* Polar ice caps — freeze ocean at high latitudes on cold worlds */

	const lat = abs( sp.y );
	const polarNoise = fbm( sp.mul( 4.0 ).add( vec3( s.mul( 1.7 ) ) ), 0.3 ).mul( 0.1 );

	/* coldness sets how far caps extend; ice is fully opaque within that extent */

	const coldness = sub( 1.0, smoothstep( 0.35, 0.75, uTemperature ) );
	const iceLine = mix( 0.97, 0.80, coldness );
	const polarIce = smoothstep( iceLine.sub( 0.04 ), iceLine.add( 0.04 ), lat.add( polarNoise ) );

	If( polarIce.greaterThan( 0.01 ), () => {

		const iceColor = mix( vec3( 0.78, 0.84, 0.90 ), vec3( 0.92, 0.95, 0.98 ), polarNoise.mul( 5.0 ).add( 0.5 ) ).toVar();
		const iceGrain = gnoised( sp.mul( 20.0 ).add( vec3( s.mul( 3.0 ) ) ) ).x;
		iceColor.mulAssign( add( 0.9, iceGrain.mul( 0.1 ) ) );
		const iceOpacity = smoothstep( 0.0, 0.3, polarIce );
		surfaceColor.assign( mix( surfaceColor, iceColor, iceOpacity ) );
		spec.mulAssign( sub( 1.0, iceOpacity ) );

	} );

	return vec4( surfaceColor, spec );

} );

export const renderIce = /*@__PURE__*/ Fn( ( [ sp, s ] ) => {

	const off = vec3( s.mul( 0.13 ), s.mul( 0.37 ), s.mul( 0.71 ) );

	/* Multi-scale ridged cracks — Europa-style linear lineae */

	const bigCracks = ridgedFbm( sp.mul( 1.5 ).add( off ), uCrackScale.mul( 0.4 ), 2.1, 3 );
	const medCracks = ridgedFbm( sp.mul( 3.5 ).add( off.mul( 1.7 ) ), uCrackScale.mul( 0.8 ), 2.3, 4 );
	const fineCracks = ridgedFbm( sp.mul( 8.0 ).add( off.mul( 2.3 ) ), uCrackScale.mul( 1.2 ), 2.0, 3 );

	/* Noise-modulated crack threshold so widths vary across the surface */
	/* ridgedFbm peaks near 1.0 at ridge crests — high thresholds isolate thin crack lines */

	const threshVar = fbm( sp.mul( 2.0 ).add( vec3( s ) ), 0.3 ).mul( 0.08 );
	const cracks = smoothstep( add( 0.55, threshVar ), 0.80, bigCracks ).mul( 0.6 ).add( smoothstep( 0.60, 0.82, medCracks ).mul( 0.3 ) ).add( smoothstep( 0.65, 0.85, fineCracks ).mul( 0.15 ) ).toVar();
	cracks.assign( clamp( cracks, 0.0, 1.0 ) );

	/* Terrain height — mostly gentle with occasional ridged highlands */

	const height = ridgedFbm( sp.mul( 2.5 ).add( off.mul( 0.5 ) ), 3.0, 2.2, 4 ).mul( 0.35 ).add( fbm( sp.mul( 1.5 ).add( vec3( s.mul( 2.0 ) ) ), 0.3 ).mul( 0.65 ) );

	/* Finite-diff normals for lighting response */

	const eps = float( 0.015 );
	const hx = ridgedFbm( sp.add( vec3( eps, 0.0, 0.0 ) ).mul( 2.5 ).add( off.mul( 0.5 ) ), 3.0, 2.2, 4 ).mul( 0.35 ).add( fbm( sp.add( vec3( eps, 0.0, 0.0 ) ).mul( 1.5 ).add( vec3( s.mul( 2.0 ) ) ), 0.3 ).mul( 0.65 ) );
	const hy = ridgedFbm( sp.add( vec3( 0.0, eps, 0.0 ) ).mul( 2.5 ).add( off.mul( 0.5 ) ), 3.0, 2.2, 4 ).mul( 0.35 ).add( fbm( sp.add( vec3( 0.0, eps, 0.0 ) ).mul( 1.5 ).add( vec3( s.mul( 2.0 ) ) ), 0.3 ).mul( 0.65 ) );
	const hz = ridgedFbm( sp.add( vec3( 0.0, 0.0, eps ) ).mul( 2.5 ).add( off.mul( 0.5 ) ), 3.0, 2.2, 4 ).mul( 0.35 ).add( fbm( sp.add( vec3( 0.0, 0.0, eps ) ).mul( 1.5 ).add( vec3( s.mul( 2.0 ) ) ), 0.3 ).mul( 0.65 ) );
	gDerivatives.assign( vec3( hx, hy, hz ).sub( height ).div( eps ) );

	/* High-albedo surface with subtle plate-to-plate hue variation */

	const plateVar = fbm( sp.mul( 3.0 ).add( vec3( s.mul( 3.7 ) ) ), 0.3 );
	const surfaceColor = mix( uBaseColor1, uBaseColor2, plateVar.mul( 0.35 ).add( 0.3 ) ).toVar();
	surfaceColor.assign( mix( surfaceColor, uBaseColor3, smoothstep( 0.4, 0.7, height ).mul( 0.25 ) ) );
	surfaceColor.mulAssign( add( 0.85, clamp( height, 0.0, 1.0 ).mul( 0.25 ) ) );

	/* Slope darkening on ridged terrain */

	const slope = length( gDerivatives );
	surfaceColor.mulAssign( mix( 1.0, 0.75, smoothstep( 0.15, 1.0, slope.mul( uSlopeness ) ) ) );
	const crackColor = uSubsurfaceColor.mul( 0.7 );
	surfaceColor.assign( mix( surfaceColor, crackColor, cracks ) );

	/* Specular: high on flat ice plates, killed in cracks */

	const spec = uSpecular.mul( sub( 1.0, cracks.mul( 0.8 ) ) );

	return vec4( surfaceColor, spec );

} );

export const renderVolcanic = /*@__PURE__*/ Fn( ( [ sp, s ] ) => {

	const off = vec3( s.mul( 0.17 ), s.mul( 0.41 ), s.mul( 0.63 ) );

	/* Multi-scale ridged cracks — lava fissures at 3 frequencies */

	const bigFissures = ridgedFbm( sp.mul( 1.8 ).add( off ), uCrackScale.mul( 0.5 ), 2.1, 3 );
	const medFissures = ridgedFbm( sp.mul( 4.0 ).add( off.mul( 1.5 ) ), uCrackScale.mul( 0.9 ), 2.3, 4 );
	const fineFissures = ridgedFbm( sp.mul( 9.0 ).add( off.mul( 2.1 ) ), uCrackScale.mul( 1.3 ), 2.0, 3 );

	/* Rocky terrain height — more ridged than ice, rougher surface */

	const height = ridgedFbm( sp.mul( 2.5 ).add( off.mul( 0.5 ) ), 3.5, 2.2, 4 ).mul( 0.55 ).add( fbm( sp.mul( 1.5 ).add( vec3( s.mul( 2.0 ) ) ), 0.3 ).mul( 0.45 ) ).toVar();

	/* Height-boosted cracks — peaks become active calderas */

	const caldera = smoothstep( 0.5, 0.8, height ).mul( 0.25 );
	const threshVar = fbm( sp.mul( 2.0 ).add( vec3( s.mul( 0.7 ) ) ), 0.3 ).mul( 0.06 );
	const cracks = smoothstep( add( 0.62, threshVar ), 0.85, bigFissures ).mul( 0.55 ).add( smoothstep( 0.65, 0.87, medFissures ).mul( 0.30 ) ).add( smoothstep( 0.70, 0.88, fineFissures ).mul( 0.15 ) ).add( caldera ).toVar();
	cracks.assign( clamp( cracks, 0.0, 1.0 ) );

	/* Crater overlay — sparse impacts on the rock */

	const craters = craterFbm( sp.mul( 1.2 ).add( off.mul( 0.3 ) ) );
	const craterBlend = uCraterDensity.mul( 0.3 );
	height.assign( mix( height, craters, craterBlend ) );

	/* Finite-diff normals */

	const eps = float( 0.015 );
	const hx = ridgedFbm( sp.add( vec3( eps, 0.0, 0.0 ) ).mul( 2.5 ).add( off.mul( 0.5 ) ), 3.5, 2.2, 4 ).mul( 0.55 ).add( fbm( sp.add( vec3( eps, 0.0, 0.0 ) ).mul( 1.5 ).add( vec3( s.mul( 2.0 ) ) ), 0.3 ).mul( 0.45 ) ).toVar();
	hx.assign( mix( hx, craterFbm( sp.add( vec3( eps, 0.0, 0.0 ) ).mul( 1.2 ).add( off.mul( 0.3 ) ) ), craterBlend ) );
	const hy = ridgedFbm( sp.add( vec3( 0.0, eps, 0.0 ) ).mul( 2.5 ).add( off.mul( 0.5 ) ), 3.5, 2.2, 4 ).mul( 0.55 ).add( fbm( sp.add( vec3( 0.0, eps, 0.0 ) ).mul( 1.5 ).add( vec3( s.mul( 2.0 ) ) ), 0.3 ).mul( 0.45 ) ).toVar();
	hy.assign( mix( hy, craterFbm( sp.add( vec3( 0.0, eps, 0.0 ) ).mul( 1.2 ).add( off.mul( 0.3 ) ) ), craterBlend ) );
	const hz = ridgedFbm( sp.add( vec3( 0.0, 0.0, eps ) ).mul( 2.5 ).add( off.mul( 0.5 ) ), 3.5, 2.2, 4 ).mul( 0.55 ).add( fbm( sp.add( vec3( 0.0, 0.0, eps ) ).mul( 1.5 ).add( vec3( s.mul( 2.0 ) ) ), 0.3 ).mul( 0.45 ) ).toVar();
	hz.assign( mix( hz, craterFbm( sp.add( vec3( 0.0, 0.0, eps ) ).mul( 1.2 ).add( off.mul( 0.3 ) ) ), craterBlend ) );
	gDerivatives.assign( vec3( hx, hy, hz ).sub( height ).div( eps ) );
	const plateVar = fbm( sp.mul( 3.0 ).add( vec3( s.mul( 2.9 ) ) ), 0.3 );
	const rock = mix( uBaseColor1, uBaseColor2, plateVar.mul( 0.3 ).add( 0.35 ) ).toVar();
	rock.assign( mix( rock, uBaseColor3, smoothstep( 0.5, 0.8, height ).mul( 0.2 ) ) );

	/* Hot volcanic = very dark rock, cryo = bright icy surface */

	const darkening = select( uTemperature.greaterThan( 0.5 ), 0.25, 0.85 );
	const heightRange = select( uTemperature.greaterThan( 0.5 ), 0.35, 0.15 );
	rock.mulAssign( darkening.add( clamp( height, 0.0, 1.0 ).mul( heightRange ) ) );
	const slope = length( gDerivatives );
	const slopeDark = select( uTemperature.greaterThan( 0.5 ), 0.5, 0.82 );
	rock.mulAssign( mix( 1.0, slopeDark, smoothstep( 0.15, 1.0, slope.mul( uSlopeness ) ) ) );
	const pitting = gnoised( sp.mul( 25.0 ).add( vec3( s.mul( 2.3 ) ) ) ).x;
	const pitAmt = select( uTemperature.greaterThan( 0.5 ), 0.15, 0.06 );
	rock.mulAssign( sub( 1.0, pitAmt ).add( pitting.mul( pitAmt ) ) );

	/* Emissive lava — multi-tone: core, mid, edge + noise streaks for variety */

	const hotEdge = smoothstep( 0.0, 0.6, cracks );
	const edgeTint = select( uTemperature.greaterThan( 0.5 ), vec3( 1.0, 0.85, 0.3 ), vec3( 0.6, 0.9, 1.0 ) );
	const midTint = select( uTemperature.greaterThan( 0.5 ), vec3( 1.0, 0.55, 0.1 ), vec3( 0.3, 0.7, 0.95 ) );
	const lavaCore = uEmissiveColor.mul( add( 1.2, uEmissiveIntensity ) );
	const lavaMid = mix( uEmissiveColor, midTint, 0.4 ).mul( add( 0.9, uEmissiveIntensity ) );
	const lavaEdge = mix( uEmissiveColor, edgeTint, 0.5 ).mul( uEmissiveIntensity );

	/* Noise-driven streaks break up the uniform glow */

	const streaks = fbm( sp.mul( 6.0 ).add( vec3( s.mul( 1.7 ) ) ), 0.4 );
	const lavaColor = mix( lavaEdge, lavaMid, smoothstep( 0.2, 0.5, hotEdge ) ).toVar();
	lavaColor.assign( mix( lavaColor, lavaCore, smoothstep( 0.5, 0.9, hotEdge ) ) );
	lavaColor.addAssign( edgeTint.mul( streaks ).mul( 0.15 ).mul( cracks ) );
	const surfaceColor = mix( rock, lavaColor, cracks );
	const emAlpha = cracks.mul( uEmissiveIntensity );

	return vec4( surfaceColor, emAlpha );

} );

export const renderCrystalline = /*@__PURE__*/ Fn( ( [ sp, s ] ) => {

	const p = sp.mul( uCrackScale ).add( vec3( s ) );
	const cr = crystals3D( p, 0.85, uCrystalMetric, s );
	const crystalVal = cr.x;
	const f1 = cr.y;
	const cellId = cr.z;
	const edgeDist = cr.w;
	const cr2 = crystals3D( p.mul( 2.3 ).add( vec3( s.mul( 0.7 ) ) ), 0.85, uCrystalMetric, s.add( 11.0 ) );
	const cellHue = fract( sin( cellId.mul( 127.1 ) ).mul( 43758.5453 ) );
	const cellColor = mix( uBaseColor1, uBaseColor2, smoothstep( 0.28, 0.38, cellHue ) ).toVar();
	cellColor.assign( mix( cellColor, uBaseColor3, smoothstep( 0.62, 0.72, cellHue ) ) );
	const cellBright = fract( sin( cellId.mul( 43.7 ) ).mul( 12345.6789 ) );
	cellColor.mulAssign( add( 0.82, cellBright.mul( 0.36 ) ) );

	/* Growth banding from dual-layer crystal value — angular contours */

	const bandPattern = fract( crystalVal.mul( 6.0 ).add( cr2.x.mul( 3.0 ) ).add( fbm( sp.mul( 3.0 ).add( vec3( s ) ), 0.2 ).mul( 0.15 ) ) );
	const band = smoothstep( 0.0, 0.3, bandPattern ).mul( smoothstep( 1.0, 0.5, bandPattern ) );
	const bandBright = mix( 0.85, 1.15, band );
	const radialGrad = smoothstep( 0.0, 0.5, crystalVal );
	const coreDark = mix( bandBright, bandBright.mul( 0.78 ), radialGrad.mul( step( uBulbosity, 0.5 ) ) );
	const coreLight = mix( bandBright.mul( 0.78 ), bandBright, radialGrad.mul( step( 0.5, uBulbosity ) ) );
	cellColor.mulAssign( mix( coreDark, coreLight, step( 0.5, uBulbosity ) ) );
	const primaryEdge = smoothstep( 0.0, 0.04, edgeDist );
	const secondaryEdge = smoothstep( 0.0, 0.06, cr2.w );
	const combinedEdge = primaryEdge.mul( mix( 1.0, secondaryEdge, 0.4 ) );
	const edgeColor = mix( cellColor.mul( 0.35 ), uSubsurfaceColor.mul( 0.4 ), 0.5 );
	const surfaceColor = mix( edgeColor, cellColor, combinedEdge ).toVar();
	const interior = crystalVal.mul( 0.5 ).add( cr2.x.mul( 0.3 ) );
	surfaceColor.mulAssign( add( 0.92, interior.mul( 0.2 ) ) );

	/* Alpha encodes edge glow intensity for atlas specular hint */

	const edgeGlow = sub( 1.0, combinedEdge ).mul( uEmissiveIntensity );

	return vec4( surfaceColor, uSpecular.mul( combinedEdge ).add( edgeGlow.mul( 0.3 ) ) );

} );

export const renderFungal = /*@__PURE__*/ Fn( ( [ sp, s ] ) => {

	/* Dual flow-warped terrain — matches detail shader approach */

	const wp1 = flowWarp( sp.mul( 2.5 ), s, uWarpStrength );
	const wp2 = flowWarp( sp.mul( 1.8 ), s.add( 7.31 ), uWarpStrength.mul( 0.7 ) );
	const hd1 = fbmd( wp1.add( vec3( s.mul( 0.31 ) ) ), uSlopeness );
	gDerivatives.assign( hd1.yzw );
	const terrain1 = clamp( hd1.x.mul( 0.5 ).add( 0.5 ).sub( 0.5 ).mul( 2.0 ).add( 0.5 ), 0.0, 1.0 );
	const terrain2 = fbm( wp2.add( vec3( s.mul( 1.73 ) ) ), 0.3 ).mul( 0.5 ).add( 0.5 );
	const height = terrain1.mul( 0.65 ).add( terrain2.mul( 0.35 ) );

	/* Dual-noise color mapping — 4th color synthesized from complement */

	const color4 = uBaseColor1.add( uBaseColor3 ).mul( 0.5 ).toVar();
	color4.assign( vec3( 1.0 ).sub( color4 ) );
	color4.assign( mix( color4, uBaseColor2, 0.3 ) );
	const surfaceColor = mix( uBaseColor1, uBaseColor2, smoothstep( 0.15, 0.50, terrain1 ) ).toVar();
	surfaceColor.assign( mix( surfaceColor, uBaseColor3, smoothstep( 0.45, 0.80, terrain2 ) ) );
	const crossNoise = terrain1.mul( 0.6 ).add( terrain2.mul( 0.4 ) );
	surfaceColor.assign( mix( surfaceColor, color4, smoothstep( 0.55, 0.85, crossNoise ).mul( 0.45 ) ) );
	surfaceColor.mulAssign( add( 0.75, height.mul( 0.35 ) ) );

	/* Water pools in terrain lows */

	const poolMask = smoothstep( 0.0, 0.12, max( 0.0, sub( 0.45, height ) ) );

	If( poolMask.greaterThan( 0.01 ), () => {

		const poolColor = uSubsurfaceColor.mul( 0.6 ).add( uBaseColor1.mul( 0.2 ) );
		surfaceColor.assign( mix( surfaceColor, poolColor, poolMask.mul( 0.7 ) ) );

	} );

	/* Static mycelium network (no uTime in bake) */

	const veinOff = vec3( s.mul( 0.17 ), s.mul( 0.41 ), s.mul( 0.63 ) );
	const veinWarpN1 = fbm( sp.mul( uCrackScale ).mul( 0.7 ).add( vec3( s.mul( 0.9 ) ) ), 0.3 );
	const veinWarpN2 = fbm( sp.mul( uCrackScale ).mul( 0.7 ).add( vec3( s.mul( 1.6 ) ) ), 0.3 );
	const veinWarped = sp.mul( uCrackScale ).add( vec3( veinWarpN1, 0.0, veinWarpN2 ).mul( 0.4 ) );
	const primaryVeins = ridgedFbm( veinWarped.add( veinOff ), 2.5, 2.1, 3 );
	const secondaryVeins = ridgedFbm( sp.mul( uCrackScale ).mul( 2.3 ).add( veinOff.mul( 1.7 ) ), 1.8, 2.3, 4 );
	const threshVar = fbm( sp.mul( 1.5 ).add( vec3( s ) ), 0.3 ).mul( 0.06 );
	const veins = smoothstep( add( 0.75, threshVar ), 0.92, primaryVeins ).mul( 0.6 ).add( smoothstep( 0.78, 0.93, secondaryVeins ).mul( 0.3 ) ).toVar();
	veins.assign( clamp( veins, 0.0, 1.0 ) );
	surfaceColor.assign( mix( surfaceColor, uSubsurfaceColor.mul( 0.15 ), veins.mul( 0.5 ) ) );
	const slope = length( gDerivatives );
	surfaceColor.mulAssign( mix( 1.0, 0.6, smoothstep( 0.15, 1.0, slope.mul( uSlopeness ) ) ) );

	/* Alpha encodes vein emissive for atlas */


	return vec4( surfaceColor, veins.mul( uEmissiveIntensity ) );

} );

export const main = /*@__PURE__*/ Fn( () => {

	const sp = uvToSphere( vUv );
	const s = fract( uSeed.mul( 0.00000013 ) ).mul( 100.0 );

	/* Reset derivatives — voronoi-based subtypes leave this at zero */

	gDerivatives.assign( vec3( 0.0 ) );
	const result = vec4( 0.0 ).toVar();

	If( uPlanetMode.equal( 0 ), () => {

		result.assign( renderRocky( sp, s ) );

	} ).ElseIf( uPlanetMode.equal( 1 ), () => {

		result.assign( renderBarren( sp, s ) );

	} ).ElseIf( uPlanetMode.equal( 2 ), () => {

		result.assign( renderGas( sp, s ) );

	} ).ElseIf( uPlanetMode.equal( 3 ), () => {

		result.assign( renderOcean( sp, s ) );

	} ).ElseIf( uPlanetMode.equal( 4 ), () => {

		result.assign( renderIce( sp, s ) );

	} ).ElseIf( uPlanetMode.equal( 5 ), () => {

		result.assign( renderVolcanic( sp, s ) );

	} ).ElseIf( uPlanetMode.equal( 6 ), () => {

		result.assign( renderCrystalline( sp, s ) );

	} ).ElseIf( uPlanetMode.equal( 7 ), () => {

		result.assign( renderFungal( sp, s ) );

	} ).Else( () => {

		result.assign( vec4( vec3( 0.5 ), 0.0 ) );

	} );

	/* Bake atmosphere rim hint at UV edges (equirectangular pole = sphere limb) */

	const sinPhi = sin( vUv.y.mul( 3.14159265359 ) );
	const rimDist = max( 0.0, sub( 1.0, sinPhi.mul( 1.5 ) ) );
	const rim = pow( rimDist, 3.0 ).mul( uAtmoIntensity ).mul( 0.4 );
	result.rgb.addAssign( uAtmoTint.mul( rim ) );
	return result;

} );