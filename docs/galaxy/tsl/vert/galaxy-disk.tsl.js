import { add, attribute, cameraPosition, clamp, cos, cross, div, exp, float, Fn, length, normalize, positionLocal, sin, varyingProperty, uniform, vec3 } from 'three/tsl';

const aOffset     = attribute( 'aOffset',     'vec3' );
const aColor      = attribute( 'color',       'vec3' );
const aSize       = attribute( 'aSize',       'float' );
const aBrightness = attribute( 'aBrightness', 'float' );
const aRadius     = attribute( 'aRadius',     'float' );

/* vertexColor built-in returns zero with InstancedBufferGeometry, so we read the attribute explicitly */
export const vColor      = varyingProperty( 'vec3',  'vColor' );
export const vBrightness = varyingProperty( 'float', 'vBrightness' );

export const uTime = uniform( float( 0 ) );

export const main = /*@__PURE__*/ Fn( () => {

	vColor.assign( aColor );
	vBrightness.assign( aBrightness );

	const coreBoost = exp( aRadius.negate().mul( 0.05 ) ).mul( 0.30 );
	const angularSpeed = add( 0.06, div( 0.008, aRadius.add( 60.0 ) ) ).add( coreBoost );
	const angle = uTime.mul( angularSpeed );
	const cosA = cos( angle );
	const sinA = sin( angle );
	const pos = vec3(
		aOffset.x.mul( cosA ).sub( aOffset.z.mul( sinA ) ),
		aOffset.y,
		aOffset.x.mul( sinA ).add( aOffset.z.mul( cosA ) )
	);

	const toCamVec = cameraPosition.sub( pos );
	const toCamera = normalize( toCamVec );
	const right = normalize( cross( vec3( 0, 1, 0 ), toCamera ) );
	const up = cross( toCamera, right );

	/* World scale ∝ distance keeps screen size constant (replaces gl_PointSize).
	   Max clamp prevents white-wash blowout at overview distances. */
	const distToCam = length( toCamVec );
	const screenScale = aSize.mul( distToCam ).mul( 0.004 );
	const scale = clamp( screenScale, aSize.mul( 0.06 ), float( 2.5 ) );

	return pos
		.add( right.mul( positionLocal.x.mul( scale ) ) )
		.add( up.mul( positionLocal.y.mul( scale ) ) );

} );
