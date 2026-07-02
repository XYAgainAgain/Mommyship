import { abs, attribute, cos, cross, dot, float, Fn, mix, normalize, positionLocal, sin, step, uniform, varyingProperty, vec3 } from 'three/tsl';

export const uTime = uniform( float( 0 ) );
export const uSpin = uniform( float( 0.07 ) );
export const uBright = uniform( float( 0.85 ) );

// Packed into vec4s: WebGPU caps a pipeline at 8 vertex buffers.
const gA0 = attribute( 'gA0', 'vec4' );  // galaxy center xyz, spinRate
const gA1 = attribute( 'gA1', 'vec4' );  // particle rest offset xyz, quad size
const gA2 = attribute( 'gA2', 'vec4' );  // spin axis xyz, brightness
const gCol = attribute( 'gCol', 'vec3' );

export const vGAlpha = varyingProperty( 'float', 'vGAlpha' );
export const vGColor = varyingProperty( 'vec3', 'vGColor' );

export const main = /*@__PURE__*/ Fn( () => {

	const center = gA0.xyz, spinRate = gA0.w;
	const rel = gA1.xyz, qSize = gA1.w;
	const axis = gA2.xyz, bright = gA2.w;

	/* Rodrigues rotation of the rest offset around the galaxy's own axis */
	const ang = uTime.mul( uSpin ).mul( spinRate );
	const c = cos( ang ), s = sin( ang );
	const rot = rel.mul( c ).add( cross( axis, rel ).mul( s ) ).add( axis.mul( dot( axis, rel ) ).mul( float( 1 ).sub( c ) ) );
	const world = center.add( rot );

	/* Mesh follows the camera, so local space IS camera-relative — normalize(world) is the
	   view direction (same convention as starfield.tsl.js). */
	const forward = normalize( world );
	const upRef = mix( vec3( 0, 1, 0 ), vec3( 1, 0, 0 ), step( 0.99, abs( forward.y ) ) );
	const right = normalize( cross( upRef, forward ) );
	const up = cross( forward, right );

	vGAlpha.assign( bright.mul( uBright ) );
	vGColor.assign( gCol );

	return world.add( right.mul( positionLocal.x.mul( qSize ) ) ).add( up.mul( positionLocal.y.mul( qSize ) ) );

} );
