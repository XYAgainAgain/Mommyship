import { uniform, varyingProperty, vec3, vec4, float, Fn, normalize } from 'three/tsl';
import { colordodgeNebula } from './colordodge.tsl.js';

export const uTime = uniform( float( 0 ) );
const vWorldDir = varyingProperty( 'vec3', 'vWorldDir' );

/* Uniforms not literals so they stay tunable & Naga-safe. */
const u = {
  res1: uniform( float( 1.75 ) ), res2: uniform( float( 1.45 ) ), resMix: uniform( float( 1.0 ) ),
  warp: uniform( float( 0.3 ) ), octaves: uniform( float( 4.25 ) ), contrast: uniform( float( 4.2 ) ),
  intensity: uniform( float( 0.42 ) ), seed: uniform( float( 42069 ) ),
  colA: uniform( vec3( 0.0510, 0.0510, 0.1020 ) ),
  colB: uniform( vec3( 0.2745, 0.0863, 0.6627 ) ),
  colC: uniform( vec3( 0.8510, 0.2627, 0.5490 ) ),
  colD: uniform( vec3( 0.1216, 0.3490, 0.5020 ) ),
};
const uDrift = uniform( float( 0.013 ) );

const nebula = colordodgeNebula( u );

export const main = /*@__PURE__*/ Fn( () => {

	const dir = normalize( vWorldDir );
	const drift = uTime.mul( uDrift );
	const p = dir.add( vec3( drift, drift.mul( 0.7 ), drift.negate().mul( 0.5 ) ) );

	return vec4( nebula( p ), 1.0 );

} );

// Wire to NodeMaterial:
//   material.colorNode = main();
