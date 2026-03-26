import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const MAX_ORIGIN_DIST = 900;
const PAN_SPEED_WASD = 150;
const ROTATE_SPEED_QE = 1.5;

/* Keys that the galaxy map captures — prevents browser shortcuts like Ctrl+W */
const CAPTURED_KEYS = new Set([
  'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyQ', 'KeyE',
  'Space', 'ControlLeft', 'ControlRight',
  'ShiftLeft', 'ShiftRight'
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
  controls.zoomSpeed = 0.5;
  controls.rotateSpeed = 0.5;
  controls.panSpeed = 1.0;

  let museMode = false;
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
    /* Q/E orbit works in both normal and Muse Mode */
    const rotateDir = (keys['KeyE'] ? 1 : 0) - (keys['KeyQ'] ? 1 : 0);
    if (rotateDir) {
      const angle = rotateDir * ROTATE_SPEED_QE * delta;
      const offset = camera.position.clone().sub(controls.target);
      offset.applyAxisAngle(camera.up, angle);
      camera.position.copy(controls.target).add(offset);
    }

    if (museMode) return;

    const sprint = keys['ShiftLeft'] || keys['ShiftRight'] ? 1.75 : 1.0;
    const speed = PAN_SPEED_WASD * delta * sprint;

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
    if (keys['ControlLeft'] || keys['ControlRight']) _move.y -= 1;

    if (_move.lengthSq() > 0) {
      _move.normalize().multiplyScalar(speed);
      camera.position.add(_move);
      controls.target.add(_move);
    }
  }

  const _suckSph = new THREE.Spherical();

  function update(delta) {
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

  function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }

  return { camera, controls, update, resize, setMuseMode };
}
