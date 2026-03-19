import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const MAX_ORIGIN_DIST = 900;
const PAN_SPEED_WASD = 150;

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

  /* WASD keyboard movement */
  const keys = {};
  window.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    keys[e.code] = true;
  });
  window.addEventListener('keyup', e => { keys[e.code] = false; });
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
    const sprint = keys['ShiftLeft'] || keys['ShiftRight'] ? 1.75 : 1.0;
    const speed = PAN_SPEED_WASD * delta * sprint;

    camera.getWorldDirection(_forward);
    _forward.y = 0;
    _forward.normalize();
    _right.crossVectors(_forward, camera.up).normalize();

    _move.set(0, 0, 0);
    if (keys['KeyW']) _move.add(_forward);
    if (keys['KeyS']) _move.sub(_forward);
    if (keys['KeyD']) _move.add(_right);
    if (keys['KeyA']) _move.sub(_right);
    if (keys['Space']) _move.y += 1;
    if (keys['ControlLeft'] || keys['ControlRight']) _move.y -= 1;

    if (_move.lengthSq() === 0) return;
    _move.normalize().multiplyScalar(speed);
    camera.position.add(_move);
    controls.target.add(_move);
  }

  function update(delta) {
    handleKeyboard(delta);
    controls.update();
    enforceBounds();
  }

  function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }

  return { camera, controls, update, resize };
}
