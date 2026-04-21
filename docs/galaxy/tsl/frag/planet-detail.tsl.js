// Three.js Transpiler r183

import { abs, acos, add, atan, Break, cameraPosition, clamp, Continue, cos, cross, div, dot, exp, float, floor, Fn, fract, If, int, length, log, Loop, mat3, max, min, mix, mul, normalize, positionWorld, pow, round, select, sin, smoothstep, sqrt, step, sub, uniform, varyingProperty, vec2, vec3, vec4 } from 'three/tsl';

const vLocalPos = varyingProperty( 'vec3', 'vLocalPos' );
/* uRotation-aware world normal; avoids stuck terminator from normalWorld. */
const vRotNormal = varyingProperty( 'vec3', 'vRotNormal' );

/* Shared across all detail instances */
export const uTime = uniform( float( 0 ) );

/* Per-instance uniforms accepted as parameters for multi-instance pool rendering */

import {
	uvToSphere, hash33, gnoised, fbmd, fbm, ridgedFbm, gerstnerWave, blackbodyRGB,
	craterHash33, craterNoise, craterFbm, voronoi3, distMetric3D,
	cellNoise3D, cellNoise3DDelta, crystals3D, crystals3DDelta
} from '../glsl/noise-common.tsl.js';

/* Inline noise-common copies removed — now imported from ../glsl/noise-common.tsl.js */

/* Captured by render functions for normal perturbation */

const gDetailDerivs = vec3( 0.0 ).toVar();

/* Gas: 0 = belt (dark, descending air), 1 = zone (bright, rising air with clouds) */

const gGasBandValue = float( 0.5 ).toVar();

/* Set by ocean-bearing render functions for specular masking in main() */

const gOceanMask = float( 0.0 ).toVar();
const gWaveHeight = float( 0.0 ).toVar();
const gIceCrackMask = float( 0.0 ).toVar();
const gVolcanicCrackMask = float( 0.0 ).toVar();
const gFungalVeinMask = float( 0.0 ).toVar();
const gFungalGlowMask = float( 0.0 ).toVar();
const gCrystalEdgeMask = float( 0.0 ).toVar();
const gCrystalGlowMask = float( 0.0 ).toVar();
const gBiomeRoughness = float( - 1.0 ).toVar();

/* -1 = not set, use uRoughness */

export const flowWarp = /*@__PURE__*/ Fn( ( [ p, s, strength ] ) => {

	const n1 = fbm( p.mul( 1.5 ).add( vec3( s.mul( 0.37 ), s.mul( 1.13 ), s.mul( 0.61 ) ) ), 0.3 );
	const n2 = fbm( p.mul( 1.5 ).add( vec3( s.mul( 1.83 ), s.mul( 0.29 ), s.mul( 1.47 ) ) ), 0.3 );
	const alpha = n1.mul( 6.2832 );
	const beta = n2.mul( 3.1416 );
	const offset = vec3( cos( alpha ).mul( cos( beta ) ), sin( beta ), sin( alpha ).mul( cos( beta ) ) );

	return p.add( offset.mul( strength ) );

} );

/* 6 Gerstner waves — mirrors bake version but with uTime-animated phase.
   Dispersion-correct: big waves scroll slowly, small waves fast (speed ~ sqrt(freq)). */

export const gerstnerField = /*@__PURE__*/ Fn( ( [ sp, s, roughness ] ) => {

	const warpOffset = gnoised( sp.mul( 4.0 ).add( vec3( s.mul( 0.7 ) ) ) ).yzw;
	const warpedSp = normalize( sp.add( warpOffset.mul( 0.07 ).mul( roughness ) ) );
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
		const phaseNoise = gnoised( sp.mul( add( 6.0, fi.mul( 4.0 ) ) ).add( vec3( s.mul( add( 0.5, fi.mul( 0.2 ) ) ) ) ) ).x.mul( 5.5 );
		const phase = fract( s.mul( add( 0.773, fi.mul( 0.089 ) ) ) ).mul( 6.2832 ).add( phaseNoise ).add( uTime.mul( sqrt( freq ) ).mul( 0.4 ) );
		const w = gerstnerWave( warpedSp, dir, freq, amp, steep, phase );
		totalH.addAssign( w.x );
		totalD.addAssign( w.yzw );

	} );

	return vec4( totalH, totalD.x, totalD.y, totalD.z );

} );

/* Shared ocean surface — Gerstner analytic derivatives, sets gDetailDerivs + gWaveHeight */

export const oceanSurface = /*@__PURE__*/ Fn( ( [ sp, s, depth, roughness, uBaseColor1 ] ) => {

	const gw = gerstnerField( sp, s, roughness );
	const waves = gw.x;
	gWaveHeight.assign( waves );
	gDetailDerivs.assign( gw.yzw );
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

	return surfaceColor;

} );

export const renderRocky = /*@__PURE__*/ Fn( ( [ sp, s, uSlopeness, uTemperature, uMoistureOffset, uBiomeCount, uBaseColor1, uBaseColor2, uBaseColor3, uSubsurfaceColor, uOceanLevel, uWarpStrength ] ) => {

	const lat = abs( sp.y );

	/* Continent shapes — drives height for ocean/biome selection only.
	     Derivatives kept low so per-biome normals dominate surface texture. */

	const hd = fbmd( sp.mul( 3.5 ).add( vec3( s ) ), uSlopeness );
	gDetailDerivs.assign( hd.yzw.mul( 0.15 ) );
	const height = hd.x.mul( 0.5 ).add( 0.5 );
	const t = float( 0.02 );

	/* Temperature: latitude cosine + noise perturbation + uTemperature
	     0 (polar) → 1 (equatorial), noise makes boundaries wiggly */

	const noisePerturb = gnoised( sp.mul( 4.0 ).add( vec3( s.mul( 1.7 ) ) ) ).x;
	const temp = cos( lat.mul( 3.14159265359 ) ).mul( 0.5 ).add( 0.5 ).add( noisePerturb.mul( 0.15 ) ).add( uTemperature ).sub( 0.5 ).toVar();
	temp.assign( clamp( temp, 0.0, 1.0 ) );

	/* Moisture: separate FBM + Hadley cell approximation
	     Dip at ~25 deg latitude creates desert belts */

	const moistureFbm = fbm( sp.mul( 2.5 ).add( vec3( s.mul( 3.1 ), s.mul( 0.7 ), s.mul( 1.9 ) ) ), 0.4 ).mul( 0.5 ).add( 0.5 );
	const hadleyD = abs( lat ).sub( 0.4 );
	const hadley = sub( 1.0, mul( 0.4, exp( mul( - 8.0, hadleyD ).mul( hadleyD ) ) ) );
	const moisture = clamp( moistureFbm.mul( hadley ).add( uMoistureOffset ), 0.0, 1.0 );

	/* Elevation for alpine/mountain override */

	const elev = height;

	/* Biome weight system — 9 biomes, each claims a temp×moisture×elevation zone.
	     uBiomeCount controls how many are active (low = 2–4 large zones, high = all 9).
	     Weights computed via smoothstep zones, then normalized. */

	const biomeScale = add( 0.3, uBiomeCount.mul( 0.7 ) );

	/* Ice/tundra/boreal are NOT scaled by biomeScale — cold biomes always
	     present on cold planets regardless of uBiomeCount setting */
	/* 1. Ice/Polar — cold, any moisture */

	const iceW = smoothstep( 0.18, 0.08, temp ).toVar();

	/* Elevation override: above snowline → ice regardless of latitude */

	const snowline = add( 0.82, noisePerturb.mul( 0.03 ) );
	iceW.assign( max( iceW, smoothstep( snowline, snowline.add( 0.03 ), elev ) ) );

	/* 2. Tundra — cold-cool transition */

	const tundraW = smoothstep( 0.05, 0.18, temp ).mul( smoothstep( 0.35, 0.22, temp ) ).toVar();

	/* 3. Boreal/Dense Forest — cool + wet */

	const borealW = smoothstep( 0.15, 0.30, temp ).mul( smoothstep( 0.45, 0.30, temp ) ).mul( smoothstep( 0.35, 0.55, moisture ) ).toVar();

	/* 4. Temperate Forest — moderate + wet */

	const tempForestW = smoothstep( 0.30, 0.45, temp ).mul( smoothstep( 0.65, 0.50, temp ) ).mul( smoothstep( 0.40, 0.60, moisture ) ).mul( biomeScale ).toVar();

	/* 5. Grassland/Plains — broad moderate-temp catch-all for drier areas */

	const grassW = smoothstep( 0.18, 0.35, temp ).mul( smoothstep( 0.80, 0.60, temp ) ).mul( sub( 1.0, smoothstep( 0.55, 0.75, moisture ) ) ).mul( biomeScale ).toVar();

	/* 6. Sandy Desert — warm-hot + dry */

	const sandDesertW = smoothstep( 0.50, 0.65, temp ).mul( smoothstep( 0.35, 0.20, moisture ) ).mul( biomeScale ).toVar();

	/* 7. Rocky Desert/Badlands — warm + mid-dry */

	const rockyDesertW = smoothstep( 0.45, 0.60, temp ).mul( smoothstep( 0.75, 0.60, temp ) ).mul( smoothstep( 0.20, 0.35, moisture ) ).mul( sub( 1.0, smoothstep( 0.40, 0.55, moisture ) ) ).mul( biomeScale ).toVar();

	/* 8. Tropical/Jungle — hot + wet */

	const tropicalW = smoothstep( 0.60, 0.80, temp ).mul( smoothstep( 0.50, 0.70, moisture ) ).mul( biomeScale ).toVar();

	/* 9. Mountains/Alpine — elevation-gated, any temp/moisture */

	const alpineThresh = add( 0.72, noisePerturb.mul( 0.04 ) );
	const mountainW = smoothstep( alpineThresh, alpineThresh.add( 0.06 ), elev ).mul( biomeScale ).toVar();

	/* Grassland acts as catch-all — prevents black gaps in unclaimed zones */

	grassW.assign( max( grassW, mul( 0.08, biomeScale ) ) );

	/* Normalize weights */

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

	/* Each biome: distinct noise technique + domain warp for unique visual character.
	     Domain warping shifts input coords per-biome so even similar functions diverge. */

	const col1 = uBaseColor1, col2 = uBaseColor2, col3 = uBaseColor3;
	const colGrey = vec3( dot( col3, vec3( 0.3, 0.5, 0.2 ) ) ).mul( 0.7 ).add( vec3( 0.15 ) );
	const colWarm = col3.mul( vec3( 1.2, 1.0, 0.7 ) ).add( vec3( 0.08, 0.04, 0.0 ) );
	const biomeColor = vec3( 0.0 ).toVar();
	const biomeDerivs = vec3( 0.0 ).toVar();

	/* 1. Ice: ridgedFbm cracks — sharp, linear, high contrast */

	If( iceW.greaterThan( 0.01 ), () => {

		const crack = ridgedFbm( sp.mul( 8.0 ).add( vec3( s.mul( 2.3 ) ) ), 3.5, 2.1, 3 );
		const iceHd = fbmd( sp.mul( 4.0 ).add( vec3( s.mul( 2.3 ) ) ), 0.4 );
		const iceBase = mix( vec3( 0.92, 0.94, 0.98 ), uSubsurfaceColor, 0.10 );
		biomeColor.addAssign( iceW.mul( mix( iceBase, uSubsurfaceColor.mul( 0.4 ).add( vec3( 0.15 ) ), smoothstep( 0.5, 0.8, crack ) ) ) );
		biomeDerivs.addAssign( iceW.mul( iceHd.yzw ).mul( 0.5 ) );

	} );

	/* 2. Tundra: low-freq cellular noise for patchy polygonal ground */

	If( tundraW.greaterThan( 0.01 ), () => {

		const tunHd = fbmd( sp.mul( 3.0 ).add( vec3( s.mul( 0.5 ) ) ), 0.3 );
		const splotch = smoothstep( 0.15, 0.45, tunHd.x.mul( 0.5 ).add( 0.5 ) );
		const bare = colGrey.mul( 0.8 ).add( vec3( 0.05, 0.03, 0.02 ) );
		const lichen = mix( col2, colGrey, 0.6 ).mul( 0.5 );
		biomeColor.addAssign( tundraW.mul( mix( bare, lichen, splotch ) ) );
		biomeDerivs.addAssign( tundraW.mul( tunHd.yzw ).mul( 0.25 ) );

	} );

	/* 3. Boreal: ridgedFbm tree clusters — sharp-edged dark patches, not smooth blobs */

	If( borealW.greaterThan( 0.01 ), () => {

		const trees = ridgedFbm( sp.mul( 5.0 ).add( vec3( s.mul( 1.1 ) ) ), 2.5, 2.0, 3 );
		const borHd = fbmd( sp.mul( 5.0 ).add( vec3( s.mul( 1.1 ) ) ), 0.8 );
		const canopy = smoothstep( 0.35, 0.65, trees );
		const dark = col2.mul( 0.20 );
		const clearing = mix( colGrey, col2, 0.25 ).mul( 0.6 );
		biomeColor.addAssign( borealW.mul( mix( clearing, dark, canopy ) ) );
		biomeDerivs.addAssign( borealW.mul( borHd.yzw ).mul( 0.8 ) );

	} );

	/* 4. Temperate Forest: domain-warped fbmd for organic canopy clumps */

	If( tempForestW.greaterThan( 0.01 ), () => {

		const warpP = sp.mul( 8.0 ).add( vec3( s.mul( 1.7 ) ) );
		const warp = gnoised( warpP.mul( 0.4 ).add( vec3( s.mul( 0.3 ) ) ) ).yzw.mul( 0.6 );
		const canHd = fbmd( warpP.add( warp ), 0.9 );
		const tex = canHd.x.mul( 0.5 ).add( 0.5 );
		const shade = col2.mul( 0.30 ).add( col3.mul( 0.05 ) );
		const lit = col2.mul( 0.65 ).add( vec3( 0.04 ) );
		biomeColor.addAssign( tempForestW.mul( mix( shade, lit, tex ) ) );
		biomeDerivs.addAssign( tempForestW.mul( canHd.yzw ).mul( 1.0 ) );

	} );

	/* 5. Grassland: very low freq, smooth, warm — visually flat + bright */

	If( grassW.greaterThan( 0.01 ), () => {

		const grsHd = fbmd( sp.mul( 2.0 ).add( vec3( s.mul( 0.3 ) ) ), 0.2 );
		const roll = grsHd.x.mul( 0.5 ).add( 0.5 );
		const bright = colWarm.mul( 1.1 ).add( col2.mul( 0.3 ) );
		const shadow = mix( colWarm, col2, 0.4 ).mul( 0.7 );
		biomeColor.addAssign( grassW.mul( mix( shadow, bright, roll ) ) );
		biomeDerivs.addAssign( grassW.mul( grsHd.yzw ).mul( 0.15 ) );

	} );

	/* 6. Sandy Desert: anisotropic ridgedFbm dune stripes */

	If( sandDesertW.greaterThan( 0.01 ), () => {

		const duneP = sp.mul( vec3( 3.0, 12.0, 3.0 ) ).add( vec3( s.mul( 0.9 ) ) );
		const dunes = ridgedFbm( duneP, 3.0, 2.0, 3 );
		const duneHd = fbmd( duneP.mul( 0.7 ), 0.6 );
		const ridge = colWarm.mul( 1.3 ).add( vec3( 0.12, 0.08, 0.0 ) );
		const trough = colWarm.mul( 0.65 ).add( vec3( 0.02 ) );
		biomeColor.addAssign( sandDesertW.mul( mix( trough, ridge, smoothstep( 0.25, 0.65, dunes ) ) ) );
		biomeDerivs.addAssign( sandDesertW.mul( duneHd.yzw ).mul( 1.0 ) );

	} );

	/* 7. Rocky Desert/Badlands: pow-sharpened ridgedFbm for angular mesas */

	If( rockyDesertW.greaterThan( 0.01 ), () => {

		const mesa = ridgedFbm( sp.mul( 4.0 ).add( vec3( s.mul( 1.5 ) ) ), 3.5, 2.2, 4 ).toVar();
		mesa.assign( pow( max( 0.0, sub( 1.0, abs( mesa.sub( 0.5 ) ).mul( 2.0 ) ) ), 5.0 ) );
		const mesaHd = fbmd( sp.mul( 5.0 ).add( vec3( s.mul( 1.5 ) ) ), 1.2 );
		const plateau = colGrey.mul( 0.9 ).add( colWarm.mul( 0.2 ) );
		const cliff = colGrey.mul( 0.4 );
		biomeColor.addAssign( rockyDesertW.mul( mix( plateau, cliff, mesa ) ) );
		biomeDerivs.addAssign( rockyDesertW.mul( mesaHd.yzw ).mul( 1.2 ) );

	} );

	/* 8. Tropical: domain-warped ridgedFbm for tangled dense canopy */

	If( tropicalW.greaterThan( 0.01 ), () => {

		const junP = sp.mul( 7.0 ).add( vec3( s.mul( 2.1 ) ) );
		const junWarp = gnoised( junP.mul( 0.3 ).add( vec3( s.mul( 0.8 ) ) ) ).yzw.mul( 0.8 );
		const canopy = ridgedFbm( junP.add( junWarp ), 3.0, 2.1, 3 );
		const junHd = fbmd( junP.add( junWarp ), 0.9 );
		const deep = col2.mul( 0.15 );
		const top = col2.mul( 0.45 ).add( col1.mul( 0.06 ) );
		biomeColor.addAssign( tropicalW.mul( mix( deep, top, smoothstep( 0.3, 0.7, canopy ) ) ) );
		biomeDerivs.addAssign( tropicalW.mul( junHd.yzw ).mul( 1.1 ) );

	} );

	/* 9. Mountains: ridged FBM + steep slope darkening, mostly grey */

	If( mountainW.greaterThan( 0.01 ), () => {

		const mtRidge = ridgedFbm( sp.mul( 6.0 ).add( vec3( s.mul( 0.7 ) ) ), 4.5, 2.1, 4 );
		const mtHd = fbmd( sp.mul( 6.0 ).add( vec3( s.mul( 0.7 ) ) ), uSlopeness.mul( 1.5 ) );
		const rock = colGrey.mul( 0.55 ).add( col3.mul( 0.08 ) );
		const peak = vec3( 0.55, 0.52, 0.48 );
		const mtCol = mix( rock, peak, smoothstep( 0.3, 0.7, mtRidge ) ).toVar();
		const mtSlope = length( mtHd.yzw );
		mtCol.mulAssign( mix( 1.0, 0.35, smoothstep( 0.15, 1.0, mtSlope.mul( uSlopeness ) ) ) );
		biomeColor.addAssign( mountainW.mul( mtCol ) );
		biomeDerivs.addAssign( mountainW.mul( mtHd.yzw ).mul( 1.5 ) );

	} );

	gDetailDerivs.addAssign( biomeDerivs );

	/* Per-biome roughness */

	gBiomeRoughness.assign( iceW.mul( 0.15 ).add( tundraW.mul( 0.75 ) ).add( borealW.mul( 0.65 ) ).add( tempForestW.mul( 0.55 ) ).add( grassW.mul( 0.70 ) ).add( sandDesertW.mul( 0.85 ) ).add( rockyDesertW.mul( 0.90 ) ).add( tropicalW.mul( 0.50 ) ).add( mountainW.mul( 0.80 ) ) );
	const surfaceColor = biomeColor.toVar();

	/* Ocean handling — below ocean level */

	const oceanMask = sub( 1.0, smoothstep( uOceanLevel.sub( t ), uOceanLevel.add( t ), height ) );
	gOceanMask.assign( oceanMask );

	If( oceanMask.greaterThan( 0.01 ), () => {

		const depth = max( 0.0, uOceanLevel.sub( height ) );
		const terrainDerivs = gDetailDerivs;

		/* Dampen waves for rocky planets — land constrains fetch */

		const oceanColor = oceanSurface( sp, s, depth, uWarpStrength.mul( 0.4 ), uBaseColor1 ).toVar();
		const oceanDerivs = gDetailDerivs;

		/* Polar ice over ocean */

		If( iceW.greaterThan( 0.3 ), () => {

			const iceGrain = gnoised( sp.mul( 20.0 ).add( vec3( s.mul( 3.0 ) ) ) ).x;
			const iceBase = mix( vec3( 0.90, 0.93, 0.97 ), uSubsurfaceColor, 0.12 );
			const ic = iceBase.mul( add( 0.9, iceGrain.mul( 0.1 ) ) );
			const iceOpacity = smoothstep( 0.3, 0.7, iceW );
			oceanColor.assign( mix( oceanColor, ic, iceOpacity ) );
			gOceanMask.mulAssign( sub( 1.0, iceOpacity ) );
			gDetailDerivs.mulAssign( sub( 1.0, iceOpacity ) );
			gWaveHeight.mulAssign( sub( 1.0, iceOpacity ) );

		} );

		If( oceanMask.greaterThan( 0.99 ), () => {

			surfaceColor.assign( oceanColor );

		} ).Else( () => {

			gDetailDerivs.assign( mix( terrainDerivs, oceanDerivs, oceanMask ) );
			surfaceColor.assign( mix( surfaceColor, oceanColor, oceanMask ) );

		} );

	} ).Else( () => {

		/* Land slope darkening — only for non-ocean fragments */

		const slope = length( hd.yzw );
		surfaceColor.mulAssign( mix( 1.0, 0.55, smoothstep( 0.15, 1.2, slope.mul( uSlopeness ) ) ) );

	} );

	return surfaceColor;

} );

export const renderBarren = /*@__PURE__*/ Fn( ( [ sp, s, uSlopeness, uBaseColor1, uBaseColor2 ] ) => {

	const cp = sp.add( vec3( s.mul( 0.13 ), s.mul( 0.37 ), s.mul( 0.71 ) ) );
	const height = craterFbm( cp ).toVar();
	const eps = float( 0.013 );
	const hx = craterFbm( cp.add( vec3( eps, 0.0, 0.0 ) ) );
	const hy = craterFbm( cp.add( vec3( 0.0, eps, 0.0 ) ) );
	const hz = craterFbm( cp.add( vec3( 0.0, 0.0, eps ) ) );
	gDetailDerivs.assign( vec3( hx, hy, hz ).sub( height ).div( eps ) );
	const macro = fbm( sp.mul( 1.5 ).add( vec3( s ) ), 0.3 ).mul( 0.15 );
	height.assign( height.mul( 0.85 ).add( macro ).add( 0.08 ) );
	const brightness = mix( 0.35, 1.0, height );
	const surfaceColor = uBaseColor1.mul( brightness ).toVar();
	surfaceColor.assign( mix( surfaceColor, uBaseColor2.mul( brightness ), smoothstep( 0.3, 0.7, height ).mul( 0.35 ) ) );
	const slope = length( gDetailDerivs );
	surfaceColor.mulAssign( mix( 1.0, 0.5, smoothstep( 1.0, 8.0, slope.mul( uSlopeness ) ) ) );
	const pitting = gnoised( sp.mul( 30.0 ).add( vec3( s.mul( 2.3 ) ) ) ).x;
	surfaceColor.mulAssign( add( 0.82, pitting.mul( 0.18 ) ) );
	const grain = gnoised( sp.mul( 80.0 ).add( vec3( s.mul( 4.1 ) ) ) ).x;
	surfaceColor.mulAssign( add( 0.88, grain.mul( 0.12 ) ) );

	return surfaceColor;

} );

export const renderGas = /*@__PURE__*/ Fn( ( [ sp, s, uWarpStrength, uStormSize, uBandCount, uBaseColor1, uBaseColor2, uBaseColor3 ] ) => {

	const lat = sp.y;
	const lon = atan( sp.z, sp.x );

	/* Curl-based band warp — divergence-free flow circles latitude lines */

	const lonP = vec3( sp.x.mul( 3.0 ), sp.y.mul( 0.5 ), sp.z.mul( 3.0 ) );
	const curlN = gnoised( lonP.add( vec3( s.mul( 0.7 ), 0.0, s.mul( 1.1 ) ) ) );
	const curlWarp = curlN.w.mul( sp.x ).sub( curlN.y.mul( sp.z ) );
	const meander1 = fbm( lonP.add( vec3( s, 0.0, s.mul( 0.7 ) ) ), 0.4 );
	const meander2 = fbm( lonP.add( vec3( meander1.mul( 0.5 ).add( s.mul( 2.1 ) ) ) ), 0.35 );
	const warpedLat = lat.add( curlWarp.mul( uWarpStrength ).mul( 0.4 ) ).add( meander2.mul( 2.0 ).sub( 1.0 ).mul( uWarpStrength ).mul( 0.6 ) ).toVar();

	/* Storm count from seed — probability cascade */

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

	/* Storms DEFLECT bands — warp warpedLat around each vortex */

	const stormEyeMask = float( 0.0 ).toVar();

	Loop( { start: 0, end: 8 }, ( { i } ) => {

		If( i.greaterThanEqual( stormCount ), () => {

			Break();

		} );

		const fi = float( i );
		const stormSeed = s.add( fi.mul( 17.31 ) );
		const center = vec2( fract( stormSeed.mul( 0.073 ) ).mul( 6.2832 ).sub( 3.1416 ), add( - 0.4, fract( stormSeed.mul( 0.031 ) ).mul( 0.8 ) ) );
		const R = uStormSize.mul( sub( 0.25, fi.mul( 0.025 ) ) );
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

		const ring = smoothstep( 0.0, R.mul( 0.7 ), r ).mul( sub( 1.0, smoothstep( R.mul( 0.85 ), R.mul( 1.2 ), r ) ) );
		const swirlAngle = atan( delta.y, delta.x ).add( ring.mul( sub( 4.5, fi.mul( 0.5 ) ) ) );
		const deflection = sin( swirlAngle ).mul( influence ).mul( R ).mul( 1.5 );
		warpedLat.addAssign( deflection );
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
	const f1 = add( 0.5, fract( s.mul( 0.137 ) ).mul( 0.5 ) );
	const f2 = add( 1.1, fract( s.mul( 0.293 ) ).mul( 0.6 ) );
	const f3 = add( 1.8, fract( s.mul( 0.419 ) ).mul( 0.8 ) );
	const band1 = sin( warpedLat.mul( uBandCount ).mul( f1 ).mul( 3.14159265359 ) ).mul( 0.6 );
	const band2 = sin( warpedLat.mul( uBandCount ).mul( f2 ).mul( 3.14159265359 ).add( 1.7 ) ).mul( 0.3 );
	const band3 = sin( warpedLat.mul( uBandCount ).mul( f3 ).mul( 3.14159265359 ).add( 3.1 ) ).mul( 0.1 );
	const bands = band1.add( band2 ).add( band3 ).mul( 0.5 ).add( 0.5 ).toVar();
	gGasBandValue.assign( bands );
	const turb = fbm( vec3( sp.x.mul( 6.0 ), sp.y.mul( 0.4 ), sp.z.mul( 6.0 ) ).add( vec3( s.mul( 1.7 ) ) ), 0.3 );
	bands.addAssign( turb.mul( add( 0.04, edgeProximity.mul( 0.12 ) ) ) );
	const surfaceColor = mix( uBaseColor1, uBaseColor2, smoothstep( 0.2, 0.5, bands ) ).toVar();
	surfaceColor.assign( mix( surfaceColor, uBaseColor3, smoothstep( 0.55, 0.85, bands ) ) );

	If( stormEyeMask.greaterThan( 0.01 ), () => {

		surfaceColor.assign( mix( surfaceColor, uBaseColor3.mul( 1.3 ), stormEyeMask.mul( 0.6 ) ) );

	} );

	surfaceColor.assign( mix( surfaceColor, uBaseColor2.mul( 0.85 ), edgeProximity.mul( 0.08 ) ) );
	const bandEdge = abs( cos( warpedLat.mul( uBandCount ).mul( 3.14159265359 ) ) );
	surfaceColor.mulAssign( add( 0.82, bandEdge.mul( 0.18 ) ) );
	gDetailDerivs.assign( curlN.yzw );
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

	return surfaceColor;

} );

export const renderOcean = /*@__PURE__*/ Fn( ( [ sp, s, uSlopeness, uOceanLevel, uWarpStrength, uBaseColor1, uBaseColor2, uBaseColor3, uTemperature ] ) => {

	const p = flowWarp( sp.mul( 3.5 ), s, 0.25 );
	const hd = fbmd( p.add( vec3( s ) ), uSlopeness );
	const height = hd.x.mul( 0.5 ).add( 0.5 );
	const t = float( 0.02 );
	const depth = max( 0.0, uOceanLevel.sub( height ) );
	const isOcean = sub( 1.0, smoothstep( uOceanLevel.sub( t ), uOceanLevel.add( t ), height ) );
	gOceanMask.assign( isOcean );
	const surfaceColor = oceanSurface( sp, s, depth, uWarpStrength, uBaseColor1 ).toVar();

	If( isOcean.lessThan( 0.99 ), () => {

		const landColor = uBaseColor2.mul( 1.2 ).add( 0.1 ).toVar();
		landColor.assign( mix( landColor, uBaseColor3, smoothstep( uOceanLevel.add( 0.05 ), uOceanLevel.add( 0.2 ), height ) ) );
		const slope = length( hd.yzw );
		landColor.mulAssign( mix( 1.0, 0.55, smoothstep( 0.25, 1.5, slope.mul( uSlopeness ) ) ) );
		surfaceColor.assign( mix( surfaceColor, landColor, sub( 1.0, isOcean ) ) );
		gDetailDerivs.assign( mix( gDetailDerivs, hd.yzw, sub( 1.0, isOcean ) ) );

	} );

	/* Polar ice caps */

	const lat = abs( sp.y );
	const polarNoise = fbm( sp.mul( 4.0 ).add( vec3( s.mul( 1.7 ) ) ), 0.3 ).mul( 0.1 );
	const coldness = sub( 1.0, smoothstep( 0.35, 0.75, uTemperature ) );
	const iceLine = mix( 0.97, 0.80, coldness );
	const polarIce = smoothstep( iceLine.sub( 0.04 ), iceLine.add( 0.04 ), lat.add( polarNoise ) );

	If( polarIce.greaterThan( 0.01 ), () => {

		const iceColor = mix( vec3( 0.78, 0.84, 0.90 ), vec3( 0.92, 0.95, 0.98 ), polarNoise.mul( 5.0 ).add( 0.5 ) ).toVar();
		const iceGrain = gnoised( sp.mul( 20.0 ).add( vec3( s.mul( 3.0 ) ) ) ).x;
		iceColor.mulAssign( add( 0.9, iceGrain.mul( 0.1 ) ) );
		const iceOpacity = smoothstep( 0.0, 0.3, polarIce );
		surfaceColor.assign( mix( surfaceColor, iceColor, iceOpacity ) );
		gOceanMask.mulAssign( sub( 1.0, iceOpacity ) );

		/* Kill wave derivatives under ice so bump normals don't ripple */

		gDetailDerivs.mulAssign( sub( 1.0, iceOpacity ) );
		gWaveHeight.mulAssign( sub( 1.0, iceOpacity ) );

	} );

	return surfaceColor;

} );

export const renderIce = /*@__PURE__*/ Fn( ( [ sp, s, uCrackScale, uBaseColor1, uBaseColor2, uBaseColor3, uSlopeness, uSubsurfaceColor ] ) => {

	const off = vec3( s.mul( 0.13 ), s.mul( 0.37 ), s.mul( 0.71 ) );
	const bigCracks = ridgedFbm( sp.mul( 1.5 ).add( off ), uCrackScale.mul( 0.4 ), 2.1, 3 );
	const medCracks = ridgedFbm( sp.mul( 3.5 ).add( off.mul( 1.7 ) ), uCrackScale.mul( 0.8 ), 2.3, 4 );
	const fineCracks = ridgedFbm( sp.mul( 8.0 ).add( off.mul( 2.3 ) ), uCrackScale.mul( 1.2 ), 2.0, 3 );
	const threshVar = fbm( sp.mul( 2.0 ).add( vec3( s ) ), 0.3 ).mul( 0.08 );
	const cracks = smoothstep( add( 0.55, threshVar ), 0.80, bigCracks ).mul( 0.6 ).add( smoothstep( 0.60, 0.82, medCracks ).mul( 0.3 ) ).add( smoothstep( 0.65, 0.85, fineCracks ).mul( 0.15 ) ).toVar();
	cracks.assign( clamp( cracks, 0.0, 1.0 ) );
	const height = ridgedFbm( sp.mul( 2.5 ).add( off.mul( 0.5 ) ), 3.0, 2.2, 4 ).mul( 0.35 ).add( fbm( sp.mul( 1.5 ).add( vec3( s.mul( 2.0 ) ) ), 0.3 ).mul( 0.65 ) );
	const eps = float( 0.015 );
	const hx = ridgedFbm( sp.add( vec3( eps, 0.0, 0.0 ) ).mul( 2.5 ).add( off.mul( 0.5 ) ), 3.0, 2.2, 4 ).mul( 0.35 ).add( fbm( sp.add( vec3( eps, 0.0, 0.0 ) ).mul( 1.5 ).add( vec3( s.mul( 2.0 ) ) ), 0.3 ).mul( 0.65 ) );
	const hy = ridgedFbm( sp.add( vec3( 0.0, eps, 0.0 ) ).mul( 2.5 ).add( off.mul( 0.5 ) ), 3.0, 2.2, 4 ).mul( 0.35 ).add( fbm( sp.add( vec3( 0.0, eps, 0.0 ) ).mul( 1.5 ).add( vec3( s.mul( 2.0 ) ) ), 0.3 ).mul( 0.65 ) );
	const hz = ridgedFbm( sp.add( vec3( 0.0, 0.0, eps ) ).mul( 2.5 ).add( off.mul( 0.5 ) ), 3.0, 2.2, 4 ).mul( 0.35 ).add( fbm( sp.add( vec3( 0.0, 0.0, eps ) ).mul( 1.5 ).add( vec3( s.mul( 2.0 ) ) ), 0.3 ).mul( 0.65 ) );
	gDetailDerivs.assign( vec3( hx, hy, hz ).sub( height ).div( eps ) );
	const plateVar = fbm( sp.mul( 3.0 ).add( vec3( s.mul( 3.7 ) ) ), 0.3 );
	const surfaceColor = mix( uBaseColor1, uBaseColor2, plateVar.mul( 0.35 ).add( 0.3 ) ).toVar();
	surfaceColor.assign( mix( surfaceColor, uBaseColor3, smoothstep( 0.4, 0.7, height ).mul( 0.25 ) ) );
	surfaceColor.mulAssign( add( 0.85, clamp( height, 0.0, 1.0 ).mul( 0.25 ) ) );
	const slope = length( gDetailDerivs );
	surfaceColor.mulAssign( mix( 1.0, 0.75, smoothstep( 0.15, 1.0, slope.mul( uSlopeness ) ) ) );
	const crackColor = uSubsurfaceColor.mul( 0.7 );
	surfaceColor.assign( mix( surfaceColor, crackColor, cracks ) );
	gIceCrackMask.assign( cracks );

	return surfaceColor;

} );

export const renderVolcanic = /*@__PURE__*/ Fn( ( [ sp, s, uCrackScale, uCraterDensity, uBaseColor1, uBaseColor2, uBaseColor3, uTemperature, uSlopeness, uEmissiveColor, uEmissiveIntensity ] ) => {

	const off = vec3( s.mul( 0.17 ), s.mul( 0.41 ), s.mul( 0.63 ) );

	/* Lava churn — warp crack coordinates so fissures ooze and shift */

	const churnT = uTime.mul( 0.15 );
	const churnOff = vec3( fbm( sp.mul( 1.5 ).add( vec3( churnT, 0.0, s ) ), 0.3 ).mul( 0.12 ), 0.0, fbm( sp.mul( 1.5 ).add( vec3( s, churnT.mul( 0.7 ), 0.0 ) ), 0.3 ).mul( 0.12 ) );
	const bigFissures = ridgedFbm( sp.mul( 1.8 ).add( off ).add( churnOff ), uCrackScale.mul( 0.5 ), 2.1, 3 );
	const medFissures = ridgedFbm( sp.mul( 4.0 ).add( off.mul( 1.5 ) ).add( churnOff ), uCrackScale.mul( 0.9 ), 2.3, 4 );
	const fineFissures = ridgedFbm( sp.mul( 9.0 ).add( off.mul( 2.1 ) ), uCrackScale.mul( 1.3 ), 2.0, 3 );
	const height = ridgedFbm( sp.mul( 2.5 ).add( off.mul( 0.5 ) ), 3.5, 2.2, 4 ).mul( 0.55 ).add( fbm( sp.mul( 1.5 ).add( vec3( s.mul( 2.0 ) ) ), 0.3 ).mul( 0.45 ) ).toVar();
	const caldera = smoothstep( 0.5, 0.8, height ).mul( 0.25 );
	const threshVar = fbm( sp.mul( 2.0 ).add( vec3( s.mul( 0.7 ) ) ), 0.3 ).mul( 0.06 );
	const cracks = smoothstep( add( 0.62, threshVar ), 0.85, bigFissures ).mul( 0.55 ).add( smoothstep( 0.65, 0.87, medFissures ).mul( 0.30 ) ).add( smoothstep( 0.70, 0.88, fineFissures ).mul( 0.15 ) ).add( caldera ).toVar();
	cracks.assign( clamp( cracks, 0.0, 1.0 ) );
	const craters = craterFbm( sp.mul( 1.2 ).add( off.mul( 0.3 ) ) );
	const craterBlend = uCraterDensity.mul( 0.3 );
	height.assign( mix( height, craters, craterBlend ) );

	/* Skip craterFbm in finite-diff — too expensive per-frame (375 loops × 3 axes) */

	const eps = float( 0.015 );
	const hx = ridgedFbm( sp.add( vec3( eps, 0.0, 0.0 ) ).mul( 2.5 ).add( off.mul( 0.5 ) ), 3.5, 2.2, 4 ).mul( 0.55 ).add( fbm( sp.add( vec3( eps, 0.0, 0.0 ) ).mul( 1.5 ).add( vec3( s.mul( 2.0 ) ) ), 0.3 ).mul( 0.45 ) );
	const hy = ridgedFbm( sp.add( vec3( 0.0, eps, 0.0 ) ).mul( 2.5 ).add( off.mul( 0.5 ) ), 3.5, 2.2, 4 ).mul( 0.55 ).add( fbm( sp.add( vec3( 0.0, eps, 0.0 ) ).mul( 1.5 ).add( vec3( s.mul( 2.0 ) ) ), 0.3 ).mul( 0.45 ) );
	const hz = ridgedFbm( sp.add( vec3( 0.0, 0.0, eps ) ).mul( 2.5 ).add( off.mul( 0.5 ) ), 3.5, 2.2, 4 ).mul( 0.55 ).add( fbm( sp.add( vec3( 0.0, 0.0, eps ) ).mul( 1.5 ).add( vec3( s.mul( 2.0 ) ) ), 0.3 ).mul( 0.45 ) );
	gDetailDerivs.assign( vec3( hx, hy, hz ).sub( height ).div( eps ) );
	const plateVar = fbm( sp.mul( 3.0 ).add( vec3( s.mul( 2.9 ) ) ), 0.3 );
	const rock = mix( uBaseColor1, uBaseColor2, plateVar.mul( 0.3 ).add( 0.35 ) ).toVar();
	rock.assign( mix( rock, uBaseColor3, smoothstep( 0.5, 0.8, height ).mul( 0.2 ) ) );
	const darkening = select( uTemperature.greaterThan( 0.5 ), 0.25, 0.85 );
	const heightRange = select( uTemperature.greaterThan( 0.5 ), 0.35, 0.15 );
	rock.mulAssign( darkening.add( clamp( height, 0.0, 1.0 ).mul( heightRange ) ) );
	const slope = length( gDetailDerivs );
	const slopeDark = select( uTemperature.greaterThan( 0.5 ), 0.5, 0.82 );
	rock.mulAssign( mix( 1.0, slopeDark, smoothstep( 0.15, 1.0, slope.mul( uSlopeness ) ) ) );
	const pitting = gnoised( sp.mul( 25.0 ).add( vec3( s.mul( 2.3 ) ) ) ).x;
	const pitAmt = select( uTemperature.greaterThan( 0.5 ), 0.15, 0.06 );
	rock.mulAssign( sub( 1.0, pitAmt ).add( pitting.mul( pitAmt ) ) );
	const hotEdge = smoothstep( 0.0, 0.6, cracks );
	const edgeTint = select( uTemperature.greaterThan( 0.5 ), vec3( 1.0, 0.85, 0.3 ), vec3( 0.6, 0.9, 1.0 ) );
	const midTint = select( uTemperature.greaterThan( 0.5 ), vec3( 1.0, 0.55, 0.1 ), vec3( 0.3, 0.7, 0.95 ) );
	const lavaCore = uEmissiveColor.mul( add( 1.2, uEmissiveIntensity ) );
	const lavaMid = mix( uEmissiveColor, midTint, 0.4 ).mul( add( 0.9, uEmissiveIntensity ) );
	const lavaEdge = mix( uEmissiveColor, edgeTint, 0.5 ).mul( uEmissiveIntensity );
	const streaks = fbm( sp.mul( 6.0 ).add( vec3( s.mul( 1.7 ) ) ), 0.4 );
	const lavaColor = mix( lavaEdge, lavaMid, smoothstep( 0.2, 0.5, hotEdge ) ).toVar();
	lavaColor.assign( mix( lavaColor, lavaCore, smoothstep( 0.5, 0.9, hotEdge ) ) );
	lavaColor.addAssign( edgeTint.mul( streaks ).mul( 0.15 ).mul( cracks ) );
	const surfaceColor = mix( rock, lavaColor, cracks );
	gVolcanicCrackMask.assign( cracks );

	return surfaceColor;

} );

export const renderCrystalline = /*@__PURE__*/ Fn( ( [ sp, s, uCrackScale, uCrystalMetric, uBaseColor1, uBaseColor2, uBaseColor3, uBulbosity, uSubsurfaceColor ] ) => {

	const p = sp.mul( uCrackScale ).add( vec3( s ) );

	/* Primary crystal layer — dual-cell intersection creates cleavage planes */

	const crystalDelta = vec3( 0.0 ).toVar();
	const cr = crystals3D( p, 0.85, uCrystalMetric, s, crystalDelta );
	const crystalVal = cr.x;
	const f1 = cr.y;
	const cellId = cr.z;
	const edgeDist = cr.w;

	/* Secondary layer at finer scale for internal fracture detail */

	const cr2 = crystals3D( p.mul( 2.3 ).add( vec3( s.mul( 0.7 ) ) ), 0.85, uCrystalMetric, s.add( 11.0 ) );

	/* Per-cell color — tight hue variation + per-crystal brightness/saturation */

	const cellHue = fract( sin( cellId.mul( 127.1 ) ).mul( 43758.5453 ) );
	const cellColor = mix( uBaseColor1, uBaseColor2, smoothstep( 0.28, 0.38, cellHue ) ).toVar();
	cellColor.assign( mix( cellColor, uBaseColor3, smoothstep( 0.62, 0.72, cellHue ) ) );
	const cellBright = fract( sin( cellId.mul( 43.7 ) ).mul( 12345.6789 ) );
	cellColor.mulAssign( add( 0.82, cellBright.mul( 0.36 ) ) );

	/* Growth banding from dual-layer crystal value — angular contours instead
	     of circular f1 rings, since the two-cell intersection is inherently sharp. */

	const bandNoise = fbm( sp.mul( 3.0 ).add( vec3( s ) ), 0.2 ).mul( 0.15 );
	const bandPattern = fract( crystalVal.mul( 6.0 ).add( cr2.x.mul( 3.0 ) ).add( bandNoise ) );
	const band = smoothstep( 0.0, 0.3, bandPattern ).mul( smoothstep( 1.0, 0.5, bandPattern ) );
	const bandBright = mix( 0.85, 1.15, band );

	/* uBulbosity > 0.5 → bright cores, dark edges; < 0.5 → dark cores, bright edges */

	const radialGrad = smoothstep( 0.0, 0.5, crystalVal );
	const coreDark = mix( bandBright, bandBright.mul( 0.78 ), radialGrad.mul( step( uBulbosity, 0.5 ) ) );
	const coreLight = mix( bandBright.mul( 0.78 ), bandBright, radialGrad.mul( step( 0.5, uBulbosity ) ) );
	const brightness = mix( coreDark, coreLight, step( 0.5, uBulbosity ) );
	cellColor.mulAssign( brightness );

	/* Sharp facet edges — primary cleavage + secondary fractures */

	const primaryEdge = smoothstep( 0.0, 0.04, edgeDist );
	const secondaryEdge = smoothstep( 0.0, 0.06, cr2.w );
	const combinedEdge = primaryEdge.mul( mix( 1.0, secondaryEdge, 0.4 ) );

	/* Edge tinting — subsurface color shows at boundaries */

	const edgeColor = mix( cellColor.mul( 0.35 ), uSubsurfaceColor.mul( 0.4 ), 0.5 );
	const surfaceColor = mix( edgeColor, cellColor, combinedEdge ).toVar();
	const glowMask = sub( 1.0, primaryEdge ).add( sub( 1.0, secondaryEdge ).mul( 0.3 ) ).toVar();
	glowMask.assign( clamp( glowMask, 0.0, 1.0 ) );
	gCrystalEdgeMask.assign( sub( 1.0, combinedEdge ) );
	gCrystalGlowMask.assign( glowMask );

	/* Crystal interior — secondary pattern modulates brightness */

	const interior = crystalVal.mul( 0.5 ).add( cr2.x.mul( 0.3 ) );
	surfaceColor.mulAssign( add( 0.92, interior.mul( 0.2 ) ) );

	/* Derivatives from primary cell for normal perturbation */

	gDetailDerivs.assign( crystalDelta.mul( 2.5 ) );

	return surfaceColor;

} );

export const renderFungal = /*@__PURE__*/ Fn( ( [ sp, s, uWarpStrength, uSlopeness, uBaseColor1, uBaseColor2, uBaseColor3, uSubsurfaceColor, uCrackScale ] ) => {

	/* Dual flow-warped terrain — colordodge-derived organic continent shapes */

	const wp1 = flowWarp( sp.mul( 2.5 ), s, uWarpStrength );
	const wp2 = flowWarp( sp.mul( 1.8 ), s.add( 7.31 ), uWarpStrength.mul( 0.7 ) );
	const hd1 = fbmd( wp1.add( vec3( s.mul( 0.31 ) ) ), uSlopeness );
	const terrain1 = clamp( hd1.x.mul( 0.5 ).add( 0.5 ).sub( 0.5 ).mul( 2.0 ).add( 0.5 ), 0.0, 1.0 );
	const terrain2 = fbm( wp2.add( vec3( s.mul( 1.73 ) ) ), 0.3 ).mul( 0.5 ).add( 0.5 );
	gDetailDerivs.assign( hd1.yzw );
	const height = terrain1.mul( 0.65 ).add( terrain2.mul( 0.35 ) );

	/* Dual-noise color mapping — wide hue rotation between colors creates
	     colordodge-style splotch variety. 4th color synthesized from complement
	     of color1+color3 midpoint for extra variety without a new uniform. */

	const color4 = uBaseColor1.add( uBaseColor3 ).mul( 0.5 ).toVar();
	color4.assign( vec3( 1.0 ).sub( color4 ) );
	color4.assign( mix( color4, uBaseColor2, 0.3 ) );
	const surfaceColor = mix( uBaseColor1, uBaseColor2, smoothstep( 0.15, 0.50, terrain1 ) ).toVar();
	surfaceColor.assign( mix( surfaceColor, uBaseColor3, smoothstep( 0.45, 0.80, terrain2 ) ) );
	const crossNoise = terrain1.mul( 0.6 ).add( terrain2.mul( 0.4 ) );
	surfaceColor.assign( mix( surfaceColor, color4, smoothstep( 0.55, 0.85, crossNoise ).mul( 0.45 ) ) );
	surfaceColor.mulAssign( add( 0.75, height.mul( 0.35 ) ) );

	/* Water pools in terrain lows — higher threshold = more coverage */

	const poolDepth = max( 0.0, sub( 0.45, height ) );
	const poolMask = smoothstep( 0.0, 0.12, poolDepth );

	If( poolMask.greaterThan( 0.01 ), () => {

		const poolColor = uSubsurfaceColor.mul( 0.6 ).add( uBaseColor1.mul( 0.2 ) );
		surfaceColor.assign( mix( surfaceColor, poolColor, poolMask.mul( 0.7 ) ) );

	} );

	gOceanMask.assign( poolMask );

	/* Mycelium network — domain-warped ridgedFbm for organic branching */

	const veinOff = vec3( s.mul( 0.17 ), s.mul( 0.41 ), s.mul( 0.63 ) );
	const churnT = uTime.mul( 0.04 );
	const animOff = vec3( fbm( sp.mul( 0.8 ).add( vec3( churnT, 0.0, s ) ), 0.3 ).mul( 0.06 ), 0.0, fbm( sp.mul( 0.8 ).add( vec3( s, churnT.mul( 0.6 ), 0.0 ) ), 0.3 ).mul( 0.06 ) );

	/* Route veins through terrain via fbm domain warp */

	const veinWarpN1 = fbm( sp.mul( uCrackScale ).mul( 0.7 ).add( vec3( s.mul( 0.9 ) ) ), 0.3 );
	const veinWarpN2 = fbm( sp.mul( uCrackScale ).mul( 0.7 ).add( vec3( s.mul( 1.6 ) ) ), 0.3 );
	const veinWarped = sp.mul( uCrackScale ).add( vec3( veinWarpN1, 0.0, veinWarpN2 ).mul( 0.4 ) ).add( animOff );
	const primaryVeins = ridgedFbm( veinWarped.add( veinOff ), 2.5, 2.1, 3 );
	const secondaryVeins = ridgedFbm( sp.mul( uCrackScale ).mul( 2.3 ).add( veinOff.mul( 1.7 ) ).add( animOff ), 1.8, 2.3, 4 );
	const threshVar = fbm( sp.mul( 1.5 ).add( vec3( s ) ), 0.3 ).mul( 0.06 );
	const veins = smoothstep( add( 0.75, threshVar ), 0.92, primaryVeins ).mul( 0.6 ).add( smoothstep( 0.78, 0.93, secondaryVeins ).mul( 0.3 ) ).toVar();
	veins.assign( clamp( veins, 0.0, 1.0 ) );

	/* Bioluminescent pulse traveling along vein ridges */

	const pulseFreq = add( 8.0, fract( s.mul( 0.37 ) ).mul( 12.0 ) );
	const pulseSpeed = add( 0.8, fract( s.mul( 0.71 ) ).mul( 1.2 ) );
	const pulse = sin( primaryVeins.mul( pulseFreq ).sub( uTime.mul( pulseSpeed ) ) ).mul( 0.5 ).add( 0.5 ).toVar();
	pulse.assign( smoothstep( 0.4, 0.9, pulse ).mul( veins ) );
	gFungalVeinMask.assign( veins );
	gFungalGlowMask.assign( pulse );

	/* Dark substrate between veins */

	surfaceColor.assign( mix( surfaceColor, uSubsurfaceColor.mul( 0.15 ), veins.mul( 0.5 ) ) );

	/* Slope darkening from terrain derivatives */

	const slope = length( gDetailDerivs );
	surfaceColor.mulAssign( mix( 1.0, 0.6, smoothstep( 0.15, 1.0, slope.mul( uSlopeness ) ) ) );

	return surfaceColor;

} );

/* Cook-Torrance GGX BRDF — replaces old wrap+Blinn-Phong */

export const DistributionGGX = /*@__PURE__*/ Fn( ( [ NdotH, roughness ] ) => {

	const a = roughness.mul( roughness );
	const a2 = a.mul( a );
	const d = NdotH.mul( NdotH ).mul( a2.sub( 1.0 ) ).add( 1.0 );

	return a2.div( max( mul( 3.14159265359, d ).mul( d ), 1e-7 ) );

} );

export const GeometrySchlickGGX = /*@__PURE__*/ Fn( ( [ NdotV, roughness ] ) => {

	const r = roughness.add( 1.0 );
	const k = r.mul( r ).div( 8.0 );

	return NdotV.div( NdotV.mul( sub( 1.0, k ) ).add( k ) );

} );

export const GeometrySmith = /*@__PURE__*/ Fn( ( [ NdotV, NdotL, roughness ] ) => {

	return GeometrySchlickGGX( max( NdotV, 0.001 ), roughness ).mul( GeometrySchlickGGX( max( NdotL, 0.001 ), roughness ) );

} );

export const fresnelSchlick = /*@__PURE__*/ Fn( ( [ cosTheta, F0 ] ) => {

	return F0.add( sub( 1.0, F0 ).mul( pow( clamp( sub( 1.0, cosTheta ), 0.0, 1.0 ), 5.0 ) ) );

} );

export const main = /*@__PURE__*/ Fn( ( [
	uSeed, uPlanetMode, uSlopeness, uOceanLevel, uTemperature, uCraterDensity, uSpecular,
	uBaseColor1, uBaseColor2, uBaseColor3, uAtmoIntensity, uAtmoTint,
	uBandCount, uWarpStrength, uStormSize,
	uCrackScale, uSubsurfaceColor, uEmissiveIntensity, uEmissiveColor, uBulbosity,
	uRoughness, uMetalness, uCrystalMetric, uMoistureOffset, uBiomeCount,
	uRotation, uLightDir, uLodDist, uFadeIn, uOpacity,
	uCloudCover, uCloudColor, uStorminess
] ) => {

	/* vLocalPos is body-local — texture sticks to surface, geometry rotation is separate */

	const rotated = normalize( vLocalPos );
	const s = fract( uSeed.mul( 0.00000013 ) ).mul( 100.0 );

	/* LOD tiers — 0 = closest, 1 = at activation boundary.
	     Features fade in progressively as camera approaches. */

	const lod = smoothstep( 6.0, 16.0, uLodDist );
	const lodClose = lod.lessThan( 0.5 );
	const lodMedium = lod.lessThan( 0.75 );

	/* Animated churn for gas/ocean — skip at far LOD */

	const sp = rotated.toVar();

	If( lodMedium, () => {

		const churnT = uTime.mul( 0.25 );
		const churnN = gnoised( sp.mul( 3.0 ).add( vec3( churnT.mul( 0.7 ), churnT.mul( 0.3 ), churnT.negate().mul( 0.5 ) ) ) );
		const churnAmt = float( uPlanetMode.equal( 2 ).or( uPlanetMode.equal( 3 ) ) ).mul( 0.07 );
		sp.x.addAssign( churnN.y.mul( churnAmt ) );
		sp.z.addAssign( churnN.z.mul( churnAmt ) );

	} );

	gDetailDerivs.assign( vec3( 0.0 ) );
	gOceanMask.assign( 0.0 );
	gWaveHeight.assign( 0.0 );
	gIceCrackMask.assign( 0.0 );
	gVolcanicCrackMask.assign( 0.0 );
	gFungalVeinMask.assign( 0.0 );
	gFungalGlowMask.assign( 0.0 );
	gCrystalEdgeMask.assign( 0.0 );
	gCrystalGlowMask.assign( 0.0 );
	gBiomeRoughness.assign( - 1.0 );
	const surfaceColor = vec3( 0.0 ).toVar();

	If( uPlanetMode.equal( 0 ), () => {

		surfaceColor.assign( renderRocky( sp, s, uSlopeness, uTemperature, uMoistureOffset, uBiomeCount, uBaseColor1, uBaseColor2, uBaseColor3, uSubsurfaceColor, uOceanLevel, uWarpStrength ) );

	} ).ElseIf( uPlanetMode.equal( 1 ), () => {

		surfaceColor.assign( renderBarren( sp, s, uSlopeness, uBaseColor1, uBaseColor2 ) );

	} ).ElseIf( uPlanetMode.equal( 2 ), () => {

		surfaceColor.assign( renderGas( sp, s, uWarpStrength, uStormSize, uBandCount, uBaseColor1, uBaseColor2, uBaseColor3 ) );

	} ).ElseIf( uPlanetMode.equal( 3 ), () => {

		surfaceColor.assign( renderOcean( sp, s, uSlopeness, uOceanLevel, uWarpStrength, uBaseColor1, uBaseColor2, uBaseColor3, uTemperature ) );

	} ).ElseIf( uPlanetMode.equal( 4 ), () => {

		surfaceColor.assign( renderIce( sp, s, uCrackScale, uBaseColor1, uBaseColor2, uBaseColor3, uSlopeness, uSubsurfaceColor ) );

	} ).ElseIf( uPlanetMode.equal( 5 ), () => {

		surfaceColor.assign( renderVolcanic( sp, s, uCrackScale, uCraterDensity, uBaseColor1, uBaseColor2, uBaseColor3, uTemperature, uSlopeness, uEmissiveColor, uEmissiveIntensity ) );

	} ).ElseIf( uPlanetMode.equal( 6 ), () => {

		surfaceColor.assign( renderCrystalline( sp, s, uCrackScale, uCrystalMetric, uBaseColor1, uBaseColor2, uBaseColor3, uBulbosity, uSubsurfaceColor ) );

	} ).ElseIf( uPlanetMode.equal( 7 ), () => {

		surfaceColor.assign( renderFungal( sp, s, uWarpStrength, uSlopeness, uBaseColor1, uBaseColor2, uBaseColor3, uSubsurfaceColor, uCrackScale ) );

	} ).Else( () => {

		surfaceColor.assign( vec3( 0.5 ) );

	} );

	/* High-freq detail — expensive, only at close range */

	const isFluid = uPlanetMode.equal( 2 ).or( uPlanetMode.equal( 3 ) );

	If( lodMedium, () => {

		const hp = sp.mul( 18.0 ).add( vec3( s.mul( 0.73 ) ) );
		const fn1 = gnoised( hp );
		const fine2 = float( 0.0 ).toVar();

		If( lodClose, () => {

			fine2.assign( gnoised( hp.mul( 2.37 ).add( vec3( s.mul( 1.91 ) ) ) ).x );

		} );

		const fineDetail = fn1.x.mul( 0.5 ).add( fine2.mul( 0.25 ) );

		If( isFluid, () => {

			surfaceColor.addAssign( uBaseColor2.sub( uBaseColor1 ).mul( fineDetail ).mul( 0.06 ).mul( gOceanMask ) );

		} ).Else( () => {

			surfaceColor.mulAssign( add( 1.0, fineDetail.mul( 0.12 ) ) );

		} );

		gDetailDerivs.addAssign( fn1.yzw.mul( 0.3 ) );

	} );

	const N = normalize( vRotNormal );
	const V = normalize( cameraPosition.sub( positionWorld ) );

	/* Analytical sphere tangent — continuous at poles, no binary switch seam */

	const T = vec3( N.z.negate().toVar(), 0.0, N.x ).toVar();
	const tLen = length( T );
	T.assign( select( tLen.greaterThan( 0.001 ), T.div( tLen ), vec3( 1.0, 0.0, 0.0 ) ) );
	const B = cross( N, T );
	const derivLen = length( gDetailDerivs );

	/* Bump fades out at far LOD so it matches the flat atlas shading */
	/* Rocky/crystalline/fungal get stronger bump for terrain character */

	const bumpCap = select( uPlanetMode.equal( 0 ).or( uPlanetMode.equal( 6 ) ).or( uPlanetMode.equal( 7 ) ), 1.0, 0.35 );
	const bumpMul = select( uPlanetMode.equal( 0 ).or( uPlanetMode.equal( 6 ) ).or( uPlanetMode.equal( 7 ) ), 0.7, 0.25 );
	const bumpStrength = min( bumpCap, derivLen.mul( bumpMul ) ).mul( sub( 1.0, lod ) ).mul( uFadeIn );
	const perturbedN = normalize( N.sub( bumpStrength.mul( gDetailDerivs.x.mul( T ).add( gDetailDerivs.y.mul( B ) ) ) ) );
	const L = normalize( uLightDir );

	/* Per-subtype roughness — masks modulate base uRoughness per-fragment */

	const effectiveRoughness = uRoughness.toVar();

	/* Rocky biome-driven roughness overrides base when set */

	If( gBiomeRoughness.greaterThanEqual( 0.0 ), () => {

		effectiveRoughness.assign( gBiomeRoughness );

	} );

	If( uPlanetMode.equal( 0 ).or( uPlanetMode.equal( 3 ) ), () => {

		effectiveRoughness.assign( mix( effectiveRoughness, 0.04, gOceanMask ) );

	} );

	If( uPlanetMode.equal( 4 ), () => {

		effectiveRoughness.assign( mix( uRoughness, 0.9, gIceCrackMask ) );

	} );

	If( uPlanetMode.equal( 5 ), () => {

		effectiveRoughness.assign( mix( uRoughness, 0.04, gVolcanicCrackMask.mul( 0.5 ) ) );

	} );

	If( uPlanetMode.equal( 6 ), () => {

		effectiveRoughness.assign( mix( uRoughness, 0.5, gCrystalEdgeMask ) );

	} );

	If( uPlanetMode.equal( 7 ), () => {

		effectiveRoughness.assign( mix( uRoughness, 0.15, gFungalVeinMask.mul( 0.6 ) ) );
		effectiveRoughness.assign( mix( effectiveRoughness, 0.04, gOceanMask ) );

	} );

	/* Wrap-light NdotL — shifts terminator softward so small spheres
	     don't get knife-edge shadow boundaries */

	const NdotL_raw = dot( perturbedN, L );
	const NdotL = max( 0.0, NdotL_raw.mul( 0.65 ).add( 0.35 ) );
	const H = normalize( L.add( V ) );
	const NdotH = max( 0.0, dot( perturbedN, H ) );
	const NdotV = max( 0.0, dot( perturbedN, V ) );
	const HdotV = max( 0.0, dot( H, V ) );

	/* Cook-Torrance GGX specular */

	const albedo = surfaceColor;
	const F0 = mix( vec3( 0.04 ), albedo, uMetalness );
	const F = fresnelSchlick( HdotV, F0 );
	const D = DistributionGGX( NdotH, effectiveRoughness );
	const G = GeometrySmith( NdotV, NdotL, effectiveRoughness );
	const specular = D.mul( G ).mul( F ).div( max( mul( 4.0, NdotV ).mul( NdotL ), 0.001 ) );

	/* Energy-conserving diffuse — metals have no diffuse.
	     Skip /PI normalization: we have one directional light, no environment
	     map, so the PI divisor just makes everything too dark. */

	const kD = vec3( 1.0 ).sub( F ).mul( sub( 1.0, uMetalness ) );
	surfaceColor.assign( kD.mul( albedo ).add( specular ).mul( NdotL ) );

	/* Ambient floor — uses albedo so dark side stays readable */

	surfaceColor.addAssign( kD.mul( albedo ).mul( 0.12 ) );

	/* Crystalline — boosted ambient (gems scatter light internally) + edge glow */

	If( uPlanetMode.equal( 6 ), () => {

		surfaceColor.addAssign( albedo.mul( 0.15 ) );
		surfaceColor.addAssign( uSubsurfaceColor.mul( gCrystalGlowMask ).mul( uEmissiveIntensity ).mul( 0.5 ) );

	} );

	/* Volcanic emissive — additive glow unaffected by lighting */

	If( uPlanetMode.equal( 5 ), () => {

		const lavaGlow = uEmissiveColor.mul( gVolcanicCrackMask ).mul( uEmissiveIntensity ).mul( 0.6 );
		surfaceColor.addAssign( lavaGlow );

	} );

	If( uPlanetMode.equal( 7 ), () => {

		surfaceColor.addAssign( uEmissiveColor.mul( gFungalVeinMask ).mul( uEmissiveIntensity ).mul( 0.4 ) );
		surfaceColor.addAssign( uEmissiveColor.mul( 1.8 ).mul( gFungalGlowMask ).mul( uEmissiveIntensity ) );

	} );

	const alpha = uFadeIn.toVar();

	If( uOpacity.greaterThanEqual( 0.0 ), () => {

		alpha.mulAssign( uOpacity );

	} ).ElseIf( uPlanetMode.equal( 6 ), () => {

		const bodyTransp = fract( s.mul( 0.137 ) ).toVar();
		bodyTransp.mulAssign( bodyTransp );
		alpha.mulAssign( mix( sub( 1.0, bodyTransp.mul( 0.03 ) ), sub( 1.0, bodyTransp.mul( 0.10 ) ), gCrystalEdgeMask ) );

	} );

	return vec4( surfaceColor, alpha );

} );