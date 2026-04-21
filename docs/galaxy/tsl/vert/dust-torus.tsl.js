import { Fn, normalize, positionLocal, varyingProperty } from 'three/tsl';

const vRayOrigin = varyingProperty( 'vec3', 'vRayOrigin' );
const vRayDir = varyingProperty( 'vec3', 'vRayDir' );

/* uLocalCam fed JS-side; in-shader modelWorldMatrix breaks WGSL codegen here. */
export const main = /*@__PURE__*/ Fn( ( [ uLocalCam ] ) => {

	vRayOrigin.assign( uLocalCam );
	vRayDir.assign( normalize( positionLocal.sub( uLocalCam ) ) );

	return positionLocal;

} );
