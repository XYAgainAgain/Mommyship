import * as THREE from 'three';
import { WebGPURenderer } from 'three/webgpu';
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
  /* Y flipped to match compose shader's RT-corrected UV space */
  _bhScreen2.set(_bhScreen.x * 0.5 + 0.5, -_bhScreen.y * 0.5 + 0.5);
  return _bhScreen2;
}

const LOADING_MESSAGES = [
  'Spinning up the accretion disk...',
  'Scattering the stars...',
  'Shuffling tectonic plates...',
  'Jostling the volcanoes...',
  'Praying for acid rain...',
  'Tumble-drying the deserts...',
  'Poking the pulsar...',
  'Fluffing the clouds...',
  'Creating crop circles...',
  'Hand-polishing the hyperlanes...',
  'Shaking hands with alien neighbors...',
  'Pressing the big red button...',
  'Dropping out of warp...',
  'Discovering the Nice Constant™...',
  'Squashing space bugs...',
  'Nudging moons into coplanar orbits...',
  'Bribing Kepler for a better initial guess...',
  'Convincing photons to behave...',
  'Inflating the gas giants...',
  'Salting the oceans to taste...',
  'Winding up the elliptical orbits...',
  'Teaching the binary stars to waltz...',
  'Rolling planets around like marbles...',
  'Sprinkling in the rogue planets...',
  'Tuning the cosmic microwave background...',
  'Asking the black hole to hold still for a sec...',
  'Stress-testing the Roche limit...',
  'Hand-placing every single asteroid...',
  'Arguing with the Kepler solver...',
  'Double-checking Fuddruckers locations...',
  'Spackling the nebulae...',
  'Briefly resolving the Fermi paradox...',
  'Painting everything H-alpha pink...',
  'Threading the gaps between asteroids...',
  'Waking the Starsingers...',
  'Ignoring the check engine light...',
  'Reticulating the galactic spiral arms...',
  'Installing legally mandated advertisements...',
  'Confiscating illegal square protein patties...',
  'Checking the elasticity of spacetime...',
  'Feeding the fungal planets...',
  'Roughly aligning the ecliptic...',
  'Wibble-wobbling the axial tilts...',
  'Simulating several billion cycles real quick...',
  'Double-checking Newton-Raphson convergence...',
  'Seeding the habitable zones with fast casual dining experiences...',
  'Rounding up to the nearest parsec...',
  'Politely asking gravity to cooperate...',
  'Blaming the uncaring cosmos for our misfortunes...',
  'Dropping out of warp (for real this time)...',
];

function createLoadingTracker(totalSteps) {
  const progressEl = document.getElementById('gx-loading-progress');
  const textEl = document.getElementById('gx-loading-text');
  const headEl = document.getElementById('gx-loading-head');
  const circumference = 2 * Math.PI * 43;
  let step = 0;
  let current = 0;
  let target = 0;
  let rafId = 0;

  /* Shuffled deck — refills when exhausted so steps never outnumber messages */
  let deck = [];
  function nextMessage() {
    if (deck.length === 0) {
      deck = LOADING_MESSAGES.slice();
      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }
    }
    return deck.pop();
  }

  function tick() {
    current += (target - current) * 0.12;
    if (Math.abs(target - current) < 0.001) current = target;
    if (progressEl) progressEl.style.strokeDashoffset = circumference * (1 - current);
    if (headEl) headEl.style.transform = 'rotate(' + (current * 360) + 'deg)';
    if (current < target) rafId = requestAnimationFrame(tick);
  }

  return function advance() {
    step++;
    target = step / totalSteps;
    if (textEl) textEl.textContent = nextMessage();
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(tick);
  };
}

async function init() {
  const container = document.querySelector('.experience');
  const progress = createLoadingTracker(13);

  const renderer = new WebGPURenderer({ antialias: true });
  /* All galaxy shaders are custom fragmentNode — bypass sRGB gamma encode to match
     WebGL's raw gl_FragColor output (colors were authored for direct framebuffer write) */
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000);
  renderer.autoClear = false;
  container.appendChild(renderer.domElement);
  await renderer.init();

  /* DEBUG — intercept shader compilation to log WGSL source on failure */
  const gpuDevice = renderer.backend?.device;
  if (gpuDevice) {
    const origCreateShaderModule = gpuDevice.createShaderModule.bind(gpuDevice);
    gpuDevice.createShaderModule = function(descriptor) {
      const module = origCreateShaderModule(descriptor);
      module.getCompilationInfo().then(info => {
        const errors = info.messages.filter(m => m.type === 'error');
        if (errors.length > 0) {
          const label = descriptor.label || 'unknown';
          console.group('WGSL ERROR: ' + label);
          errors.forEach(e => console.error('Line ' + e.lineNum + ':' + e.linePos + ' — ' + e.message));
          const lines = (descriptor.code || '').split('\n');
          errors.forEach(e => {
            const start = Math.max(0, e.lineNum - 3);
            const end = Math.min(lines.length, e.lineNum + 2);
            console.log('--- Near line ' + e.lineNum + ' ---');
            for (let i = start; i < end; i++)
              console.log((i + 1 === e.lineNum ? '>>> ' : '    ') + (i + 1) + ': ' + lines[i]);
          });
          console.groupEnd();
        }
      });
      return module;
    };
    console.log('DEBUG: WebGPU shader error hook installed');
  }

  const scene = new THREE.Scene();
  const cam = createCamera(renderer);

  const timer = new THREE.Timer();
  timer.connect(document);

  /* 12k → 8k → 4k based on GPU max texture dimension */
  const maxTex = renderer.backend?.device?.limits?.maxTextureDimension2D ?? 16384;
  const tier = maxTex >= 16384 ? '12k' : maxTex >= 8192 ? '8k' : '4k';
  const lightmapUrl = 'galaxy/textures/galaxy-lightmap-' + tier + '.webp';

  const lightmapImg = document.getElementById('lightmap-img');
  if (lightmapImg) lightmapImg.src = lightmapUrl;

  progress();
  const lightmap = await new THREE.TextureLoader().loadAsync(lightmapUrl);
  lightmap.flipY = false;
  lightmap.wrapS = THREE.ClampToEdgeWrapping;
  lightmap.wrapT = THREE.ClampToEdgeWrapping;

  progress();
  const bg = await createBackground(scene);
  progress();
  const disk = await createDisk(scene);
  progress();
  const nebula = await createNebula(scene);
  progress();
  const bh = await createBlackHole(scene, renderer);
  progress();
  const compositor = await createCompositor(renderer);
  progress();
  const audio = createAudio(cam.camera);
  progress();
  const volumetric = await createVolumetric(scene, renderer);
  progress();
  const coreStorm = await createCoreStorm(scene, renderer);
  progress();
  const dustTorus = await createDustTorus(scene, renderer, lightmap);

  progress();
  const systems = await createSystems(scene, cam.camera, renderer);
  progress();
  await asteroids.init(scene, systems.getData(), lightmap);
  progress();

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
    if (muted) { muted = false; volumeLabel.classList.remove('gx-muted'); }
    applyVolume();
  });

  /* Click "Volume" label to toggle mute */
  const volumeLabel = document.getElementById('volume-label');
  let muted = false;
  let preMuteVolume = masterVolume;
  volumeLabel.addEventListener('click', () => {
    muted = !muted;
    if (muted) {
      preMuteVolume = masterVolume;
      masterVolume = 0;
      volumeSlider.value = 0;
    } else {
      masterVolume = preMuteVolume || 0.5;
      volumeSlider.value = Math.round(masterVolume * 100);
    }
    volumeLabel.classList.toggle('gx-muted', muted);
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

  /* T=0 — reset galactic rotation to initial state and pause */
  const t0Btn = document.getElementById('btn-t0');
  if (t0Btn) t0Btn.addEventListener('click', () => {
    rotationTime = 0;
    rotationPaused = true;
    pauseBtn.classList.add('active');
    pauseBtn.textContent = 'Resume';
    t0Btn.classList.add('active');
    setTimeout(() => t0Btn.classList.remove('active'), 300);
  });

  /* FOV slider — horizontal FOV display, persisted to localStorage */
  const DEFAULT_HFOV = 90;
  const fovSlider = document.getElementById('fov-slider');
  const fovVal = document.getElementById('fov-val');
  const fovReset = document.getElementById('fov-reset');

  function setHFov(hfov) {
    const vfov = 2 * Math.atan(Math.tan(hfov * Math.PI / 360) / cam.camera.aspect) * 180 / Math.PI;
    cam.camera.fov = vfov;
    cam.camera.updateProjectionMatrix();
    if (fovVal) fovVal.textContent = Math.round(hfov) + '\u00B0';
    if (fovSlider) fovSlider.value = hfov;
  }

  const savedFov = localStorage.getItem('mommyship-galaxy-fov');
  if (savedFov) setHFov(parseFloat(savedFov));

  if (fovSlider) fovSlider.addEventListener('input', () => {
    const hfov = parseInt(fovSlider.value, 10);
    setHFov(hfov);
    localStorage.setItem('mommyship-galaxy-fov', String(hfov));
  });

  if (fovReset) fovReset.addEventListener('click', () => {
    setHFov(DEFAULT_HFOV);
    localStorage.removeItem('mommyship-galaxy-fov');
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
      ui.setTracking(false);
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
    /* Recalculate vFOV from stored hFOV since aspect changed */
    const curHfov = localStorage.getItem('mommyship-galaxy-fov');
    if (curHfov) setHFov(parseFloat(curHfov));
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

  function animate(timestamp) {
    const now = performance.now();
    perfMonitor.sample(now - lastFrameTime);
    lastFrameTime = now;

    timer.update(timestamp);
    const delta = Math.min(timer.getDelta(), 0.1);

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

    const elapsed = timer.getElapsed();

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
    asteroids.update(delta, rotationTime, cam.camera.position, cam.camera);
    audio.update();
    if (museActive) museAudio.updateDistance(cam.camera.position.length());

    const lodFactor = compositorForced ? 0 : cinemaMode ? 1 : computeLOD(cam.camera);
    bh.update(rotationTime, lodFactor, cam.camera);

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
        ui.setTracking(false);
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

  /* World-space visual radius for a body (for zoom clamping) */
  function bodyVisualRadius(id) {
    const meta = systems.getBodyMeta(id);
    if (!meta) return 2;
    const extraScale = meta.mkRadius || meta.planetRadius || 1;
    return 2.5 * meta.instanceScale * extraScale;
  }

  systems.initClickDetection(renderer.domElement, (result) => {
    if (museActive) return;

    /* Right-click: track/untrack */
    if (result.button === 2) {
      if (result.type === 'select') {
        trackedId = result.bodyId;
        trackedLastPos = null;
        cam.controls.enablePan = false;
        cam.setTrackMode(true, bodyVisualRadius(result.bodyId));
        ui.setTracking(true);
        systems.showOrbitsForBody(result.bodyId);
      } else {
        trackedId = null;
        trackedLastPos = null;
        cam.controls.enablePan = true;
        cam.setTrackMode(false);
        ui.setTracking(false);
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

  /* M3 (middle click): snap to default orbit view while tracking */
  renderer.domElement.addEventListener('pointerdown', (e) => {
    if (e.button === 1 && trackedId) {
      e.preventDefault();
      e.stopPropagation();
      cam.snapToOrbit();
    }
  }, true);

  /* Initialize UI with galaxy data + systems reference for editor mode */
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
      cam.setTrackMode(true, bodyVisualRadius(id));
      ui.setTracking(true);
      systems.showOrbitsForBody(id);
    },
    onResetView: () => {
      if (museActive) return;
      trackedId = null;
      trackedLastPos = null;
      cam.controls.enablePan = true;
      cam.setTrackMode(false);
      ui.setTracking(false);
      systems.hideOrbits();
      systems.setSelectedId(null);
      cam.flyHome();
    }
  }, systems);

  /* Pre-compile all shaders */
  console.group('DEBUG: Scene materials at compileAsync');
  scene.traverse(obj => {
    if (obj.material) {
      const m = obj.material;
      const type = m.type || m.constructor?.name || 'unknown';
      const nodes = [
        m.positionNode ? 'pos' : '',
        m.vertexNode ? 'vert' : '',
        m.fragmentNode ? 'frag' : '',
        m.sizeNode ? 'size' : '',
      ].filter(Boolean).join('+');
      console.log(type + ' #' + m.id + ' [' + nodes + '] on ' + (obj.constructor?.name || '?') + (obj.visible ? '' : ' (hidden)'));
    }
  });
  console.groupEnd();
  await renderer.compileAsync(scene, cam.camera);
  await systems.warmUpShaders(renderer, cam.camera);

  updateScaleBar();
  renderer.setAnimationLoop(animate);

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
