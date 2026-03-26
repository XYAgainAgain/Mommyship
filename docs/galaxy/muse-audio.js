var XFADE = 2.0;
var MUSE_PATH = 'assets/audio/Muse - Supermassive Black Hole.ogg';
var IR_PATHS = [
  'assets/audio/ir/ShortDecay.ogg',
  'assets/audio/ir/MedDecay.ogg',
  'assets/audio/ir/LongDecay.ogg',
  'assets/audio/ir/EchoBounce.ogg'
];

/* Matches Muse Mode zoom range (0.5–40) */
var IR_NEAR = 0.5;
var IR_FAR = 40;
var MAX_WET = 0.85;

/* Preload element — browser caches the file so loop track loads instantly */
var preloadEl = new Audio();
preloadEl.preload = 'auto';

export function preloadMuse() {
  preloadEl.src = MUSE_PATH;
}

export function createMuseAudio() {
  var ctx = null;
  var masterGain = null;
  var dryGain = null;
  var irGains = null;
  var loopTrack = null;
  var playing = false;
  var sliderVolume = 0.5;

  function init() {
    if (ctx) return;
    ctx = new AudioContext();

    masterGain = ctx.createGain();
    masterGain.gain.value = sliderVolume;
    masterGain.connect(ctx.destination);

    dryGain = ctx.createGain();
    dryGain.connect(masterGain);

    loopTrack = createLoopTrack(ctx, MUSE_PATH, dryGain);

    irGains = IR_PATHS.map(function() {
      var g = ctx.createGain();
      g.gain.value = 0;
      g.connect(masterGain);
      return g;
    });

    IR_PATHS.forEach(function(url, i) {
      fetch(url)
        .then(function(r) { return r.arrayBuffer(); })
        .then(function(buf) { return ctx.decodeAudioData(buf); })
        .then(function(decoded) {
          var conv = ctx.createConvolver();
          conv.buffer = decoded;
          loopTrack.connectSource(conv);
          conv.connect(irGains[i]);
        })
        .catch(function() {});
    });
  }

  function start() {
    init();
    if (playing) return;
    playing = true;
    if (ctx.state === 'suspended') ctx.resume();
    masterGain.gain.setTargetAtTime(sliderVolume, ctx.currentTime, 0.05);
    loopTrack.restart();
  }

  function stop() {
    if (!playing || !ctx) return;
    playing = false;
    /* Quick fade out so it doesn't pop */
    masterGain.gain.setTargetAtTime(0, ctx.currentTime, 0.15);
    setTimeout(function() {
      if (!playing && loopTrack) loopTrack.pause();
    }, 800);
  }

  function setVolume(v) {
    sliderVolume = v;
    if (ctx && playing) {
      masterGain.gain.setTargetAtTime(v, ctx.currentTime, 0.05);
    }
  }

  function updateDistance(dist) {
    if (!ctx || !playing || !irGains) return;

    var now = ctx.currentTime;
    var smooth = 0.08;

    /* Far = echoey (several light years out), close = crisp (at the singularity) */
    var t = Math.max(0, Math.min(1, (dist - IR_NEAR) / (IR_FAR - IR_NEAR)));
    var wet = t * MAX_WET;

    /* Additive send: dry stays constant, reverb layers on top — avoids
       volume drops when IRs are still loading or wet is high */
    var pos = t * 3;
    var lo = Math.min(Math.floor(pos), 3);
    var hi = Math.min(lo + 1, 3);
    var blend = pos - lo;

    for (var i = 0; i < 4; i++) {
      var irVol = 0;
      if (i === lo) irVol += (1 - blend) * wet;
      if (i === hi) irVol += blend * wet;
      irGains[i].gain.setTargetAtTime(irVol, now, smooth);
    }
  }

  return { start, stop, setVolume, updateDistance };
}

/* A/B crossfade loop — same pattern as audio.js */
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
    restart: function() {
      elA.pause(); elB.pause();
      elA.currentTime = 0; elB.currentTime = 0;
      gainA.gain.value = 1; gainB.gain.value = 0;
      active = 'A'; crossfading = false;
      if (xfadeTimer) { clearTimeout(xfadeTimer); xfadeTimer = null; }
      elA.play().catch(function() {});
    },
    pause: function() {
      elA.pause();
      elB.pause();
      if (xfadeTimer) { clearTimeout(xfadeTimer); xfadeTimer = null; }
      crossfading = false;
    },
    connectSource: function(node) {
      srcA.connect(node);
      srcB.connect(node);
    }
  };
}
