import * as THREE from 'three';
import { createCamera } from './camera.js';
import { createBackground } from './background.js';
import { createDisk } from './disk.js';
import { createNebula } from './nebula.js';
import { createBlackHole } from './blackhole.js';
import { createCompositor } from './compositor.js';
import { createAudio } from './audio.js';
import { createVolumetric } from './volumetric.js';
import { createCoreStorm } from './core-storm.js';
import { createDustTorus } from './dust-torus.js';
import { createMuseAudio, preloadMuse } from './muse-audio.js';

/* Reusable vector for projecting BH position to screen space */
const _bhScreen = new THREE.Vector3();
const _bhScreen2 = new THREE.Vector2();

function computeLOD(camera) {
  const dist = camera.position.length();
  return Math.max(0, Math.min(1, (300 - dist) / 220));
}

function projectToScreen(camera) {
  _bhScreen.set(0, 0, 0);
  _bhScreen.project(camera);
  _bhScreen2.set(_bhScreen.x * 0.5 + 0.5, _bhScreen.y * 0.5 + 0.5);
  return _bhScreen2;
}

async function init() {
  const container = document.querySelector('.experience');

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000);
  renderer.autoClear = false;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const cam = createCamera(renderer);

  const clock = new THREE.Clock();

  const bg = await createBackground(scene);
  const disk = await createDisk(scene);
  const nebula = await createNebula(scene);
  const bh = await createBlackHole(scene, renderer);
  const compositor = await createCompositor(renderer);
  const audio = createAudio(cam.camera);
  const volumetric = await createVolumetric(scene, renderer);
  const coreStorm = await createCoreStorm(scene, renderer);
  const dustTorus = await createDustTorus(scene, renderer);

  /* Nebula toggle: both systems in memory, swap via localStorage */
  let volumetricActive = localStorage.getItem('mommyship-galaxy-volumetric') === 'true';
  const fancyCheckbox = document.getElementById('fancy-nebulae');
  fancyCheckbox.checked = volumetricActive;

  if (volumetricActive) {
    scene.remove(nebula.emissionMesh, nebula.flowerMesh, nebula.darkMesh);
    volumetric.addToScene();
  }

  /* Absolute Cinema: forces max LOD on everything — only available with Fancy Nebulae */
  let cinemaMode = false;
  const cinemaCheckbox = document.getElementById('absolute-cinema');
  const cinemaToggle = document.getElementById('cinema-toggle');

  function syncCinemaVisibility() {
    if (volumetricActive) {
      cinemaToggle.classList.add('visible');
    } else {
      cinemaToggle.classList.remove('visible');
      cinemaCheckbox.checked = false;
      cinemaMode = false;
      document.body.classList.remove('cinema-active');
    }
  }
  syncCinemaVisibility();

  cinemaCheckbox.addEventListener('change', () => {
    cinemaMode = cinemaCheckbox.checked;
    document.body.classList.toggle('cinema-active', cinemaMode);
  });

  fancyCheckbox.addEventListener('change', () => {
    volumetricActive = fancyCheckbox.checked;
    localStorage.setItem('mommyship-galaxy-volumetric', String(volumetricActive));
    syncCinemaVisibility();
    if (volumetricActive) {
      scene.remove(nebula.emissionMesh, nebula.flowerMesh, nebula.darkMesh);
      volumetric.addToScene();
    } else {
      volumetric.removeFromScene();
      scene.add(nebula.emissionMesh, nebula.flowerMesh, nebula.darkMesh);
    }
  });

  /* Pause rotation: freezes spin, billowing/BH/background keep going */
  let rotationPaused = false;
  let rotationTime = 0;
  const pauseCheckbox = document.getElementById('pause-rotation');
  pauseCheckbox.addEventListener('change', () => {
    rotationPaused = pauseCheckbox.checked;
  });

  /* Muse View: camera suck-in → orbit-only around BH → Muse plays */
  let museActive = false;
  const museAudio = createMuseAudio();
  const museCheckbox = document.getElementById('muse-mode');
  const museVolumeWrap = document.getElementById('muse-volume-wrap');
  const museVolumeSlider = document.getElementById('muse-volume');

  /* Lazy preload the song so it's cached and instant when needed */
  preloadMuse();

  museVolumeSlider.addEventListener('input', () => {
    museAudio.setVolume(parseInt(museVolumeSlider.value) / 100);
  });

  museCheckbox.addEventListener('change', () => {
    museActive = museCheckbox.checked;
    museVolumeWrap.classList.toggle('visible', museActive);
    cam.setMuseMode(museActive);

    if (museActive) {
      /* Fade drone out over ~400ms, then start Muse */
      audio.setGain(0);
      museAudio.setVolume(parseInt(museVolumeSlider.value) / 100);
      museAudio.start();
    } else {
      museAudio.stop();
      audio.setGain(1);
    }
  });

  /* Catch accidental Ctrl+W — browsers block preventDefault on it,
     but beforeunload triggers a "Leave site?" confirmation dialog */
  window.addEventListener('beforeunload', e => { e.preventDefault(); });

  window.addEventListener('resize', () => {
    cam.resize();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    compositor.resize();
    if (bh.resize) bh.resize();
  });

  /* Debug HUD — FPS + camera position */
  const hudEl = document.getElementById('gx-hud');
  let fpsFrames = 0, fpsTime = 0, fpsDisplay = 0;

  function animate() {
    requestAnimationFrame(animate);
    const delta = Math.min(clock.getDelta(), 0.1);
    const elapsed = clock.getElapsedTime();

    fpsFrames++;
    fpsTime += delta;
    if (fpsTime >= 0.5) {
      fpsDisplay = Math.round(fpsFrames / fpsTime);
      fpsFrames = 0;
      fpsTime = 0;
    }
    const cp = cam.camera.position;
    hudEl.textContent = (cinemaMode || museActive)
      ? `FPS: ${fpsDisplay}`
      : `FPS: ${fpsDisplay}\nX: ${cp.x.toFixed(1)}  Y: ${cp.y.toFixed(1)}  Z: ${cp.z.toFixed(1)}`;

    if (!rotationPaused) rotationTime += delta;

    cam.update(delta);
    bg.update(elapsed, cam.camera.position);
    disk.update(delta, rotationTime);
    nebula.update(delta, rotationTime);
    volumetric.update(delta, elapsed, rotationTime, cam.camera, cinemaMode);
    coreStorm.update(elapsed, rotationTime);
    dustTorus.update(elapsed, rotationTime, cam.camera, cinemaMode);
    audio.update();
    if (museActive) museAudio.updateDistance(cam.camera.position.length());

    const lodFactor = cinemaMode ? 1 : computeLOD(cam.camera);
    bh.update(elapsed, lodFactor, cam.camera);

    if (lodFactor > 0) {
      const screenPos = projectToScreen(cam.camera);
      compositor.render(scene, cam.camera, screenPos, lodFactor);
    } else {
      renderer.setRenderTarget(null);
      renderer.clear();
      renderer.render(scene, cam.camera);
    }
  }

  animate();
}

init().catch(err => {
  console.error('Galaxy init failed:', err);
  const el = document.querySelector('.experience');
  if (el) el.textContent = 'Failed to load galaxy map. Check console for details.';
});
