var XFADE = 2.0;
var MAX_VOL = 0.75;
var MIN_VOL = 0.025;
var MIN_DIST = 20;
var MAX_DIST = 900;
var SRC_PATH = 'galaxy/audio/HopefulHole.ogg';

export function createAudio(camera) {
  var ctx = null;
  var masterGain = null;
  var loopTrack = null;
  var started = false;

  function initOnGesture() {
    if (started) return;
    started = true;
    ctx = new AudioContext();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0;
    masterGain.connect(ctx.destination);
    loopTrack = createLoopTrack(ctx, SRC_PATH, masterGain);
    loopTrack.play();
  }

  /* Web Audio requires user gesture — attach to common interactions */
  var gestureEvents = ['click', 'keydown', 'pointerdown'];
  gestureEvents.forEach(function(evt) {
    window.addEventListener(evt, initOnGesture, { once: true });
  });

  var externalGain = 1.0;

  function setGain(v) {
    externalGain = v;
    /* Apply immediately — update() won't run in 2D mode */
    if (masterGain && v === 0) masterGain.gain.value = 0;
  }

  function update() {
    if (!ctx || ctx.state === 'suspended') return;
    var dist = camera.position.length();
    var t = Math.max(0, Math.min(1, (dist - MIN_DIST) / (MAX_DIST - MIN_DIST)));
    var vol = MIN_VOL + (MAX_VOL - MIN_VOL) * Math.pow(1 - t, 2);
    masterGain.gain.value = vol * externalGain;
  }

  return { update, setGain };
}

function createLoopTrack(ctx, src, outputNode) {
  var elA = new Audio();
  var elB = new Audio();
  elA.preload = 'auto';
  elB.preload = 'auto';
  elA.src = src;
  elB.src = src;

  var srcA = ctx.createMediaElementSource(elA);
  var srcB = ctx.createMediaElementSource(elB);
  var gainA = ctx.createGain();
  var gainB = ctx.createGain();
  gainA.gain.value = 1;
  gainB.gain.value = 0;
  srcA.connect(gainA);
  srcB.connect(gainB);
  gainA.connect(outputNode);
  gainB.connect(outputNode);

  var active = 'A';
  var crossfading = false;
  var xfadeTimer = null;

  function onTimeUpdate() {
    if (crossfading) return;
    var el = active === 'A' ? elA : elB;
    if (!el.duration || el.duration === Infinity) return;
    if (el.currentTime >= el.duration - XFADE) startCrossfade();
  }

  function startCrossfade() {
    crossfading = true;
    var now = ctx.currentTime;
    var fadingOut, fadingIn, gOut, gIn;
    if (active === 'A') {
      fadingOut = elA; fadingIn = elB; gOut = gainA; gIn = gainB;
    } else {
      fadingOut = elB; fadingIn = elA; gOut = gainB; gIn = gainA;
    }

    fadingIn.currentTime = 0;
    fadingIn.play().catch(function() {});

    /* Exponential ramp — time constant = XFADE/4 reaches ~98% in XFADE seconds */
    gOut.gain.setTargetAtTime(0, now, XFADE / 4);
    gIn.gain.setTargetAtTime(1, now, XFADE / 4);

    xfadeTimer = setTimeout(function() {
      xfadeTimer = null;
      fadingOut.pause();
      fadingOut.currentTime = 0;
      active = active === 'A' ? 'B' : 'A';
      crossfading = false;
    }, XFADE * 1000 + 200);
  }

  elA.addEventListener('timeupdate', onTimeUpdate);
  elB.addEventListener('timeupdate', onTimeUpdate);

  return {
    play: function() { elA.play().catch(function() {}); },
    pause: function() {
      elA.pause();
      elB.pause();
      if (xfadeTimer) { clearTimeout(xfadeTimer); xfadeTimer = null; }
      crossfading = false;
    }
  };
}
