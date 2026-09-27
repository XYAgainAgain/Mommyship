import * as THREE from 'three';

/* Screenshot booth: ?booth=<bodyId>&size=<px>[&t=<rotationTime>] frames one body at a fixed
   on-screen diameter, lit from its parent star, so regression captures are repeatable. */
const SETTLE_FRAMES = 150;
const PHASE_LIT = 50 * Math.PI / 180;
const PHASE_SIDE = 90 * Math.PI / 180;

const _body = new THREE.Vector3();
const _toStar = new THREE.Vector3();
const _side = new THREE.Vector3();
const _dir = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);

export function parseBoothParams(search) {
  const params = new URLSearchParams(search);
  const id = params.get('booth');
  if (!id) return null;
  const size = Number(params.get('size'));
  const t = Number(params.get('t'));
  return {
    id,
    size: Number.isFinite(size) && size > 0 ? size : 150,
    t: Number.isFinite(t) ? t : 0
  };
}

export function createBooth(params, { systems, camera, controls, visualRadius }) {
  const bodies = systems.getData().bodies;
  let id = null, starId = null, size = 150, frames = 0;

  /* The runner retargets through this instead of reloading, which would re-pay the ~30 s boot */
  function set(nextId, nextSize) {
    window.__boothReady = false;
    window.__boothError = null;
    if (!bodies[nextId]) {
      id = null;
      window.__boothError = 'unknown body: ' + nextId;
      return false;
    }
    id = nextId;
    size = Number.isFinite(nextSize) && nextSize > 0 ? nextSize : 150;
    frames = 0;
    starId = bodies[id].parentId;
    while (starId && bodies[starId] && bodies[starId].type !== 'star') starId = bodies[starId].parentId;
    if (!bodies[starId]) starId = null;
    return true;
  }

  /* Called every frame after the camera update, so damping can never drift the framing */
  function place() {
    const wp = id && systems.getBodyWorldPos(id);
    if (!wp) return;
    _body.set(wp.x, wp.y, wp.z);

    /* Exact projected diameter for a sphere: r / sqrt(d² − r²) = (size / H) · tan(fov / 2) */
    const r = visualRadius(id);
    const k = (size / window.innerHeight) * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
    const dist = r * Math.sqrt(1 + 1 / (k * k));

    const sp = starId ? systems.getBodyWorldPos(starId) : null;
    let clearance = Infinity;
    if (sp) {
      _toStar.set(sp.x - wp.x, sp.y - wp.y, sp.z - wp.z);
      clearance = _toStar.length() - visualRadius(starId);
      _toStar.normalize();
    } else _toStar.set(0, 0, 1);
    /* Leaning toward the star shows a gibbous face, but a far camera on a tight orbit would
       end up inside or behind the star, so those views swing out to a half-lit side view */
    const phase = dist < 0.4 * clearance ? PHASE_LIT : PHASE_SIDE;

    _side.crossVectors(_toStar, _up);
    if (_side.lengthSq() < 1e-6) _side.set(1, 0, 0);
    _side.normalize();
    _dir.copy(_toStar).multiplyScalar(Math.cos(phase)).addScaledVector(_side, Math.sin(phase))
      .addScaledVector(_up, 0.3).normalize();

    camera.position.copy(_body).addScaledVector(_dir, dist);
    controls.target.copy(_body);
    camera.lookAt(_body);

    if (++frames === SETTLE_FRAMES) window.__boothReady = true;
  }

  document.body.classList.add('gx-booth');
  const style = document.createElement('style');
  style.textContent = 'body.gx-booth * { visibility: hidden !important; } body.gx-booth canvas { visibility: visible !important; }';
  document.head.appendChild(style);
  controls.enabled = false;

  set(params.id, params.size);
  window.__boothSet = set;
  return { place };
}
