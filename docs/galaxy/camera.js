import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const MAX_ORIGIN_DIST = 900;
const PAN_SPEED_WASD = 150;
const ROTATE_SPEED_QE = 1.5;

/* Keys that the galaxy map captures — prevents browser shortcuts like Ctrl+W */
const CAPTURED_KEYS = new Set([
  'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyQ', 'KeyE', 'KeyC',
  'Space', 'ShiftLeft', 'ShiftRight'
]);

/* Reusable vectors — avoids per-frame allocation in the render loop */
const _forward = new THREE.Vector3();
const _right   = new THREE.Vector3();
const _move    = new THREE.Vector3();

export function createCamera(renderer) {
  const camera = new THREE.PerspectiveCamera(
    60, window.innerWidth / window.innerHeight, 0.1, 3000
  );
  camera.position.set(0, 350, 550);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.zoomSpeed = 0.8;
  controls.rotateSpeed = 0.5;
  controls.panSpeed = 1.0;

  const TRACK_MIN_DIST_BASE = 0.5;
  const TRACK_SPEED_RAMP = 60;

  let museMode = false;
  let trackMode = false;
  let trackMinDist = TRACK_MIN_DIST_BASE;
  let museAnim = null;
  let museExit = null;
  let preMuse = null;

  /* 120 BPM, audio at 2730ms — land one quarter note (500ms) before the downbeat */
  const SUCK_DURATION = 2230;
  const SUCK_TARGET_DIST = 1;
  const SUCK_REVOLUTIONS = 1.5;

  const keys = {};
  window.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (CAPTURED_KEYS.has(e.code)) e.preventDefault();
    keys[e.code] = true;
  });
  window.addEventListener('keyup', e => {
    if (CAPTURED_KEYS.has(e.code)) e.preventDefault();
    keys[e.code] = false;
  });
  /* Clear stuck keys when window loses focus (alt-tab, click away, etc.) */
  window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; });

  function enforceBounds() {
    const dist = camera.position.length();
    if (dist > MAX_ORIGIN_DIST) {
      camera.position.setLength(MAX_ORIGIN_DIST);
    }
    const targetDist = controls.target.length();
    if (targetDist > MAX_ORIGIN_DIST * 0.8) {
      controls.target.setLength(MAX_ORIGIN_DIST * 0.8);
    }
  }

  function handleKeyboard(delta) {
    /* Gentle keyboard-only damping when tracking — halved so it stays responsive */
    const trackDist = trackMode ? camera.position.distanceTo(controls.target) : 0;
    const trackDamp = trackMode ? Math.max(0.5, Math.min(1, trackDist / (TRACK_SPEED_RAMP * 0.35))) : 1;

    /* Horizontal orbit: Q/E always, A/D when tracking */
    const orbitDir = (keys['KeyE'] ? 1 : 0) - (keys['KeyQ'] ? 1 : 0)
      + (trackMode ? (keys['KeyD'] ? 1 : 0) - (keys['KeyA'] ? 1 : 0) : 0);
    if (orbitDir) {
      const angle = orbitDir * ROTATE_SPEED_QE * delta * trackDamp;
      const offset = camera.position.clone().sub(controls.target);
      offset.applyAxisAngle(camera.up, angle);
      camera.position.copy(controls.target).add(offset);
    }

    /* Vertical orbit: Space/C when tracking */
    if (trackMode) {
      const vertDir = (keys['Space'] ? 1 : 0) - (keys['KeyC'] ? 1 : 0);
      if (vertDir) {
        const angle = vertDir * ROTATE_SPEED_QE * delta * trackDamp;
        const offset = camera.position.clone().sub(controls.target);
        _forward.crossVectors(offset, camera.up).normalize();
        offset.applyAxisAngle(_forward, angle);
        const polar = offset.angleTo(camera.up);
        if (polar > 0.1 && polar < Math.PI - 0.1)
          camera.position.copy(controls.target).add(offset);
      }
    }

    if (museMode) return;

    const sprint = keys['ShiftLeft'] || keys['ShiftRight'] ? 1.75 : 1.0;
    const speed = PAN_SPEED_WASD * delta * sprint;

    if (trackMode) {
      /* W/S dolly toward/away from target */
      const dolly = (keys['KeyW'] ? 1 : 0) - (keys['KeyS'] ? 1 : 0);
      if (dolly) {
        const offset = camera.position.clone().sub(controls.target);
        const dist = offset.length();
        const newDist = Math.max(trackMinDist, dist - dolly * speed * 0.5 * trackDamp);
        offset.setLength(newDist);
        camera.position.copy(controls.target).add(offset);
      }
    } else {
      camera.getWorldDirection(_forward);
      _forward.y = 0;
      if (_forward.lengthSq() < 0.001) {
        const az = controls.getAzimuthalAngle();
        _forward.set(-Math.sin(az), 0, -Math.cos(az));
      }
      _forward.normalize();
      _right.crossVectors(_forward, camera.up).normalize();

      _move.set(0, 0, 0);
      if (keys['KeyW']) _move.add(_forward);
      if (keys['KeyS']) _move.sub(_forward);
      if (keys['KeyD']) _move.add(_right);
      if (keys['KeyA']) _move.sub(_right);
      if (keys['Space']) _move.y += 1;
      if (keys['KeyC']) _move.y -= 1;

      if (_move.lengthSq() > 0) {
        _move.normalize().multiplyScalar(speed);
        camera.position.add(_move);
        controls.target.add(_move);
      }
    }
  }

  const _suckSph = new THREE.Spherical();

  function update(delta) {
    updateFly();

    if (museAnim) {
      const raw = Math.min(1, (performance.now() - museAnim.start) / SUCK_DURATION);

      /* Linear zoom — smooth constant pull toward the singularity */
      const r = museAnim.startR + (SUCK_TARGET_DIST - museAnim.startR) * raw;
      /* Quadratic spin — angular velocity ramps up as you fall deeper */
      const spin = raw * raw * SUCK_REVOLUTIONS * Math.PI * 2;
      const theta = museAnim.startTheta - spin;

      _suckSph.set(r, museAnim.startPhi, theta);
      camera.position.setFromSpherical(_suckSph);
      controls.target.set(0, 0, 0);

      if (raw >= 1) {
        museAnim = null;
        controls.enabled = true;
        controls.minDistance = 0.5;
        controls.maxDistance = 40;
      }
    }

    if (museExit) {
      const raw = Math.min(1, (performance.now() - museExit.start) / 1000);
      const t = raw * (2 - raw);
      camera.position.lerpVectors(museExit.from, museExit.to, t);
      controls.target.lerpVectors(museExit.fromTarget, museExit.toTarget, t);
      if (raw >= 1) {
        museExit = null;
        controls.enabled = true;
      }
    }

    if (museMode) controls.target.set(0, 0, 0);

    handleKeyboard(delta);
    controls.update();
    enforceBounds();
  }

  function setMuseMode(enabled) {
    museMode = enabled;
    if (enabled) {
      preMuse = {
        pos: camera.position.clone(),
        target: controls.target.clone(),
        minDist: controls.minDistance,
        maxDist: controls.maxDistance
      };
      controls.enablePan = false;
      /* Disable controls entirely during the spiral so they don't clamp mid-animation */
      controls.enabled = false;

      const sph = new THREE.Spherical().setFromVector3(camera.position);
      museAnim = {
        startR: sph.radius,
        startPhi: sph.phi,
        startTheta: sph.theta,
        start: performance.now()
      };
    } else {
      museAnim = null;
      controls.enablePan = true;
      controls.minDistance = preMuse ? preMuse.minDist : 0;
      controls.maxDistance = preMuse ? preMuse.maxDist : Infinity;

      if (preMuse) {
        controls.enabled = false;
        museExit = {
          from: camera.position.clone(),
          to: preMuse.pos,
          fromTarget: controls.target.clone(),
          toTarget: preMuse.target,
          start: performance.now()
        };
        preMuse = null;
      }
    }
  }

  /* Smooth fly-to animation for search/selection.
     When tracking is active, we only animate the camera offset (distance + direction)
     toward the target — the tracking code in galaxy.js handles controls.target. */
  let flyAnim = null;

  function flyTo(target, distance) {
    if (museMode) return;
    const d = distance || 30;
    /* Offset from the NEW target (not current controls.target, which may be a different body) */
    const startOffset = camera.position.clone().sub(target);
    const endOffset = startOffset.clone().normalize().multiplyScalar(d);

    flyAnim = {
      startOffset,
      endOffset,
      targetPos: target.clone(),
      startTarget: controls.target.clone(),
      start: performance.now(),
      duration: 1200
    };
  }

  function updateFly() {
    if (!flyAnim) return;
    const raw = (performance.now() - flyAnim.start) / flyAnim.duration;
    const t = raw >= 1 ? 1 : raw * raw * (3 - 2 * raw);

    /* Interpolate the offset vector */
    const offset = flyAnim.startOffset.clone().lerp(flyAnim.endOffset, t);

    if (trackMode) {
      /* Tracking updates controls.target each frame — just position the camera relative to it */
      camera.position.copy(controls.target).add(offset);
    } else {
      /* No tracking — also lerp the target itself */
      controls.target.lerpVectors(flyAnim.startTarget, flyAnim.targetPos, t);
      camera.position.copy(controls.target).add(offset);
    }

    if (raw >= 1) flyAnim = null;
  }

  function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }

  function setTrackMode(v, bodyRadius) {
    trackMode = v;
    if (v) {
      /* Keyboard dolly floor scales with body size, but scroll wheel is unrestricted */
      trackMinDist = Math.max(TRACK_MIN_DIST_BASE, (bodyRadius || 2) * 0.5);
      controls.minDistance = 0;
    } else if (!museMode) {
      trackMinDist = TRACK_MIN_DIST_BASE;
      controls.minDistance = 0;
    }
  }

  /* M3 snap: animate to a canonical 30° overhead orbit at a comfortable distance */
  function snapToOrbit() {
    if (!trackMode || museMode || flyAnim) return;
    const target = controls.target;
    const dist = Math.max(trackMinDist * 2.5, 15);
    const phi = Math.PI / 6;
    const theta = camera.position.clone().sub(target);
    const currentTheta = Math.atan2(theta.x, theta.z);
    const endOffset = new THREE.Vector3(
      dist * Math.cos(phi) * Math.sin(currentTheta),
      dist * Math.sin(phi),
      dist * Math.cos(phi) * Math.cos(currentTheta)
    );
    flyAnim = {
      startOffset: camera.position.clone().sub(target),
      endOffset,
      targetPos: target.clone(),
      startTarget: target.clone(),
      start: performance.now(),
      duration: 600
    };
  }

  function flyHome() {
    if (museMode) return;
    const homePos = new THREE.Vector3(0, 350, 550);
    flyAnim = {
      startOffset: camera.position.clone().sub(controls.target),
      endOffset: homePos.clone(),
      targetPos: new THREE.Vector3(0, 0, 0),
      startTarget: controls.target.clone(),
      start: performance.now(),
      duration: 1200
    };
  }

  return { camera, controls, update, resize, setMuseMode, setTrackMode, flyTo, flyHome, snapToOrbit };
}
