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
import { createSystems } from './systems.js';
import * as asteroids from './asteroids.js';
import * as ui from './galaxy-ui.js';
import { createPerfMonitor } from './perf-monitor.js';

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

  /* 12k → 8k → 4k based on GPU max texture dimension */
  const maxTex = renderer.capabilities.maxTextureSize;
  const tier = maxTex >= 16384 ? '12k' : maxTex >= 8192 ? '8k' : '4k';
  const lightmapUrl = 'galaxy/textures/galaxy-lightmap-' + tier + '.webp';

  const lightmapImg = document.getElementById('lightmap-img');
  if (lightmapImg) lightmapImg.src = lightmapUrl;

  const lightmap = await new THREE.TextureLoader().loadAsync(lightmapUrl);
  lightmap.flipY = false;
  lightmap.wrapS = THREE.ClampToEdgeWrapping;
  lightmap.wrapT = THREE.ClampToEdgeWrapping;

  const bg = await createBackground(scene);
  const disk = await createDisk(scene);
  const nebula = await createNebula(scene);
  const bh = await createBlackHole(scene, renderer);
  const compositor = await createCompositor(renderer);
  const audio = createAudio(cam.camera);
  const volumetric = await createVolumetric(scene, renderer);
  const coreStorm = await createCoreStorm(scene, renderer);
  const dustTorus = await createDustTorus(scene, renderer, lightmap);

  const systems = await createSystems(scene, cam.camera, renderer);
  await asteroids.init(scene, systems.getData(), lightmap);

  /* Volume — controls drone gain when Muse is off, Muse volume when on */
  let masterVolume = 0.5;
  const volumeSlider = document.getElementById('volume-slider');

  function applyVolume() {
    if (museActive) {
      audio.setGain(0);
      museAudio.setVolume(masterVolume);
    } else {
      audio.setGain(masterVolume);
    }
  }

  volumeSlider.addEventListener('input', () => {
    masterVolume = parseInt(volumeSlider.value) / 100;
    applyVolume();
  });

  /* Fancy Nebulae toggle */
  let volumetricActive = localStorage.getItem('mommyship-galaxy-volumetric') === 'true';
  const fancyCheckbox = document.getElementById('fancy-nebulae');
  fancyCheckbox.checked = volumetricActive;

  if (volumetricActive) {
    scene.remove(nebula.emissionMesh, nebula.flowerMesh, nebula.darkMesh);
    volumetric.addToScene();
  }

  /* Absolute Cinema */
  let cinemaMode = false;
  const cinemaCheckbox = document.getElementById('absolute-cinema');

  cinemaCheckbox.addEventListener('change', () => {
    if (cinemaCheckbox.checked && !volumetricActive) {
      fancyCheckbox.checked = true;
      fancyCheckbox.dispatchEvent(new Event('change'));
    }
    cinemaMode = cinemaCheckbox.checked;
    perfMonitor.setBypass(cinemaMode || museActive);
  });

  fancyCheckbox.addEventListener('change', () => {
    volumetricActive = fancyCheckbox.checked;
    localStorage.setItem('mommyship-galaxy-volumetric', String(volumetricActive));
    /* Turn off Cinema if Fancy is disabled */
    if (!volumetricActive && cinemaMode) {
      cinemaCheckbox.checked = false;
      cinemaMode = false;
    }
    if (volumetricActive) {
      scene.remove(nebula.emissionMesh, nebula.flowerMesh, nebula.darkMesh);
      volumetric.addToScene();
    } else {
      volumetric.removeFromScene();
      scene.add(nebula.emissionMesh, nebula.flowerMesh, nebula.darkMesh);
    }
  });

  /* Adaptive performance monitor — degrades quality settings when frame times spike */
  let compositorForced = false;
  const perfMonitor = createPerfMonitor((level, direction, p95) => {
    const dpr = level >= 2 ? 1.0 : level >= 1 ? 1.5 : Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(dpr);

    if (level >= 3 && volumetricActive) {
      fancyCheckbox.checked = false;
      fancyCheckbox.dispatchEvent(new Event('change'));
    }

    compositorForced = level >= 4;

    if (direction === 'degrade') {
      console.log('Perf watchdog: degraded to Q' + level + ' (p95: ' + p95.toFixed(1) + 'ms)');
    } else {
      console.log('Perf watchdog: restored to Q' + level + ' (p95: ' + p95.toFixed(1) + 'ms)');
    }
  });

  /* Respect user overrides — if they re-enable Fancy after watchdog disabled it */
  fancyCheckbox.addEventListener('change', () => {
    if (fancyCheckbox.checked && perfMonitor.getLevel() >= 3) perfMonitor.userOverride();
  });

  /* Pause — galactic rotation only */
  let rotationPaused = false;
  let rotationTime = 0;
  const pauseBtn = document.getElementById('btn-pause');

  pauseBtn.addEventListener('click', () => {
    rotationPaused = !rotationPaused;
    pauseBtn.classList.toggle('active', rotationPaused);
    pauseBtn.textContent = rotationPaused ? 'Resume' : 'Pause';
  });

  /* Muse Mode */
  let museActive = false;
  const museAudio = createMuseAudio();
  const museBtn = document.getElementById('btn-muse');

  preloadMuse();
  applyVolume();

  museBtn.addEventListener('click', () => {
    museActive = !museActive;
    museBtn.classList.toggle('active', museActive);
    cam.setMuseMode(museActive);

    if (museActive) {
      trackedId = null;
      trackedLastPos = null;
      cam.controls.enablePan = true;
      cam.setTrackMode(false);
      systems.hideOrbits();
      museAudio.setVolume(masterVolume);
      museAudio.start();
      audio.setGain(0);
    } else {
      museAudio.stop();
      audio.setGain(masterVolume);
    }
    systems.setClickDisabled(museActive);
    systems.setMuseActive(museActive);
    perfMonitor.setBypass(cinemaMode || museActive);
  });

  /* HUD — show/hide based on settings */
  const hudEl = document.getElementById('gx-hud');
  const showCoordsCheckbox = document.getElementById('show-coords');
  const showFpsCheckbox = document.getElementById('show-fps');

  /* Confirmation dialog on any navigation away */
  window.addEventListener('beforeunload', e => { e.preventDefault(); });

  window.addEventListener('resize', () => {
    cam.resize();
    renderer.setSize(window.innerWidth, window.innerHeight);
    /* Respect watchdog's current pixel ratio cap */
    const level = perfMonitor.getLevel();
    const dpr = level >= 2 ? 1.0 : level >= 1 ? 1.5 : Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(dpr);
    compositor.resize();
    if (bh.resize) bh.resize();
    systems.resize();
  });

  /* Scale bar */
  const NICE_CONSTANT = 69;
  const NICE_DISTANCES = [
    1, 2, 5, 10, 20, 50, 69, 100, 200, 500,
    1000, 2000, 4000, 7000, 10000, 20000, 40000, 62100
  ];
  const scaleBarEl = document.getElementById('scale-bar');
  const scaleBarLine = document.getElementById('scale-bar-line');
  const scaleBarLabel = document.getElementById('scale-bar-label');
  let scaleBarFrame = 0;

  function updateScaleBar() {
    const dist = cam.camera.position.distanceTo(cam.controls.target);
    const vFov = cam.camera.fov * (Math.PI / 180);
    const visibleWidth = 2 * dist * Math.tan(vFov / 2) * cam.camera.aspect;
    const totalLy = visibleWidth * NICE_CONSTANT;
    const lyPerPx = totalLy / window.innerWidth;
    const maxBarPx = window.innerWidth * 0.5;

    let bestLy = null;
    for (let i = NICE_DISTANCES.length - 1; i >= 0; i--) {
      if (NICE_DISTANCES[i] / lyPerPx <= maxBarPx) {
        bestLy = NICE_DISTANCES[i];
        break;
      }
    }

    if (!bestLy) {
      scaleBarEl.style.visibility = 'hidden';
      return;
    }

    scaleBarEl.style.visibility = 'visible';
    scaleBarLine.style.width = Math.round(bestLy / lyPerPx) + 'px';
    scaleBarLabel.textContent = bestLy === 69
      ? '69 ly (1 map unit)'
      : bestLy.toLocaleString() + ' ly';
  }

  /* Camera dirty tracking — skip per-frame work when nothing has changed */
  const lastCamPos = new THREE.Vector3();
  const lastCamQuat = new THREE.Quaternion();

  /* FPS tracking */
  let fpsFrames = 0, fpsTime = 0, fpsDisplay = 0;
  let hudDirty = true;

  let lastFrameTime = performance.now();

  function animate() {
    requestAnimationFrame(animate);

    const now = performance.now();
    perfMonitor.sample(now - lastFrameTime);
    lastFrameTime = now;

    const delta = Math.min(clock.getDelta(), 0.1);

    fpsFrames++;
    fpsTime += delta;
    if (fpsTime >= 0.5) {
      fpsDisplay = Math.round(fpsFrames / fpsTime);
      fpsFrames = 0;
      fpsTime = 0;
      hudDirty = true;
    }

    if (hudDirty) { updateHUD(); hudDirty = false; }

    /* Skip 3D rendering in 2D mode */
    if (ui.getViewMode() === '2d') return;

    const elapsed = clock.getElapsedTime();

    if (!rotationPaused) rotationTime += delta;

    cam.update(delta);

    const cameraMoved = !lastCamPos.equals(cam.camera.position)
                     || !lastCamQuat.equals(cam.camera.quaternion);
    const worldDirty = cameraMoved || !rotationPaused;
    if (cameraMoved) {
      lastCamPos.copy(cam.camera.position);
      lastCamQuat.copy(cam.camera.quaternion);
      hudDirty = true;
    }

    if (++scaleBarFrame >= 10) {
      scaleBarFrame = 0;
      updateScaleBar();
    }
    bg.update(elapsed, cam.camera.position);
    disk.update(delta, rotationTime);
    nebula.update(delta, rotationTime);
    volumetric.update(delta, elapsed, rotationTime, cam.camera, cinemaMode);
    coreStorm.update(elapsed, rotationTime);
    dustTorus.update(elapsed, rotationTime, cam.camera, cinemaMode);
    asteroids.update(delta, rotationTime, cam.camera.position);
    audio.update();
    if (museActive) museAudio.updateDistance(cam.camera.position.length());

    const lodFactor = compositorForced ? 0 : cinemaMode ? 1 : computeLOD(cam.camera);
    bh.update(elapsed, lodFactor, cam.camera);

    systems.update(delta, rotationTime, lodFactor, worldDirty, trackedId);

    /* Camera follows tracked body */
    if (trackedId) {
      const wp = systems.getBodyWorldPos(trackedId);
      if (wp) {
        if (trackedLastPos) {
          cam.camera.position.x += wp.x - trackedLastPos.x;
          cam.camera.position.y += wp.y - trackedLastPos.y;
          cam.camera.position.z += wp.z - trackedLastPos.z;
        }
        cam.controls.target.set(wp.x, wp.y, wp.z);
        trackedLastPos = { x: wp.x, y: wp.y, z: wp.z };
      } else {
        trackedId = null;
        trackedLastPos = null;
        cam.controls.enablePan = true;
        cam.setTrackMode(false);
        systems.hideOrbits();
      }
    }

    if (lodFactor > 0) {
      const screenPos = projectToScreen(cam.camera);
      compositor.render(scene, cam.camera, screenPos, lodFactor, systems.markerScene);
    } else {
      renderer.setRenderTarget(null);
      renderer.clear();
      renderer.render(scene, cam.camera);
      renderer.render(systems.markerScene, cam.camera);
    }

    if (worldDirty || systems.needsLabelRender) {
      systems.labelRenderer.render(scene, cam.camera);
      systems.needsLabelRender = false;
    }
  }

  function updateHUD() {
    const showCoords = showCoordsCheckbox.checked;
    const showFps = showFpsCheckbox.checked;

    if (!showCoords && !showFps) {
      hudEl.style.display = 'none';
      return;
    }

    hudEl.style.display = '';
    const cp = cam.camera.position;
    let text = '';
    if (showFps) {
      text += 'FPS: ' + fpsDisplay;
      const ql = perfMonitor.getLevel();
      if (ql > 0) text += ' \u00b7 Q' + ql;
    }
    if (showCoords && !cinemaMode && !museActive) {
      if (text) text += '\n';
      text += 'X: ' + cp.x.toFixed(1) + '  Y: ' + cp.y.toFixed(1) + '  Z: ' + cp.z.toFixed(1);
    }
    hudEl.textContent = text;
  }

  let trackedId = null;
  let trackedLastPos = null;

  systems.initClickDetection(renderer.domElement, (result) => {
    if (museActive) return;

    /* Right-click: track/untrack */
    if (result.button === 2) {
      if (result.type === 'select') {
        trackedId = result.bodyId;
        trackedLastPos = null;
        cam.controls.enablePan = false;
        cam.setTrackMode(true);
        systems.showOrbitsForBody(result.bodyId);
      } else {
        trackedId = null;
        trackedLastPos = null;
        cam.controls.enablePan = true;
        cam.setTrackMode(false);
        systems.hideOrbits();
      }
      return;
    }

    /* Left-click: select/deselect — route through UI */
    if (result?.type === 'select') {
      ui.selectBody(result.bodyId);
    } else if (result?.type === 'deselect') {
      ui.deselectBody();
    }
  });

  /* Initialize UI with galaxy data */
  ui.init(systems.getData(), {
    onSelect: (id, body) => {
      systems.setSelectedId(id);
    },
    onDeselect: () => {
      systems.setSelectedId(null);
    },
    onViewChange: (mode) => {
      if (mode === '2d') {
        audio.setGain(0);
      } else if (!museActive) {
        audio.setGain(masterVolume);
      }
    },
    onFlyTo: (id) => {
      if (museActive) return;
      const wp = systems.getBodyWorldPos(id);
      if (!wp) return;
      const target = new THREE.Vector3(wp.x, wp.y, wp.z);
      cam.flyTo(target);
      trackedId = id;
      trackedLastPos = { x: wp.x, y: wp.y, z: wp.z };
      cam.controls.enablePan = false;
      cam.setTrackMode(true);
      systems.showOrbitsForBody(id);
    },
    onResetView: () => {
      if (museActive) return;
      trackedId = null;
      trackedLastPos = null;
      cam.controls.enablePan = true;
      cam.setTrackMode(false);
      systems.hideOrbits();
      systems.setSelectedId(null);
      cam.flyTo(new THREE.Vector3(0, 0, 0), 550);
    }
  });

  updateScaleBar();
  animate();

  /* Dismiss loading overlay */
  const loadingEl = document.getElementById('gx-loading');
  if (loadingEl) {
    loadingEl.classList.add('fade-out');
    loadingEl.addEventListener('transitionend', () => loadingEl.remove());
  }
}

init().catch(err => {
  console.error('Galaxy init failed:', err);
  const el = document.querySelector('.experience');
  if (el) el.textContent = 'Failed to load galaxy map. Check console for details.';
});
