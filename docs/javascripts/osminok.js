/* Osminok Ocean — bioluminescence, scroll effects, megastorm, and dive mode.
   Ecology pages: three bio layers with scroll-percentage zones.
   Dive page: depth-mapped zones, rain/alt-lightning, TOC depth meter, marine snow. */

var osminokCleanup = null;

document$.subscribe(function () {
  if (osminokCleanup) osminokCleanup();

  var ocean = document.querySelector('.osminok-ocean');
  if (!ocean) { osminokCleanup = null; return; }

  var isDive = !!document.querySelector('.osminok-dive');
  /* Dive page IS the motion — no reduced-motion on that page */
  var reducedMotion = !isDive && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var vw = window.innerWidth;
  var vh = window.innerHeight;

  function rand(min, max) { return min + Math.random() * (max - min); }
  function randInt(min, max) { return Math.floor(rand(min, max + 1)); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function rgba(rgb, a) {
    return 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + a.toFixed(2) + ')';
  }

  /* Depth-zone color palettes */
  var palettes = {
    shallow: [
      [65, 234, 212],
      [100, 210, 230],
      [80, 200, 190],
      [120, 230, 200],
      [60, 180, 160]
    ],
    twilight: [
      [100, 130, 255],
      [131, 50, 172],
      [180, 100, 220],
      [80, 160, 255],
      [160, 80, 200]
    ],
    abyss: [
      [40, 40, 220],
      [180, 30, 60],
      [255, 120, 30],
      [200, 50, 180],
      [100, 20, 200],
      [255, 160, 50]
    ]
  };

  /* Phase 2: Submarine toggle — navigates between lore pages and dive */
  var subBtn = null;
  var paletteForm = null;
  (function setupSubmarineToggle() {
    var headerInner = document.querySelector('.md-header__inner');
    if (!headerInner) return;

    paletteForm = headerInner.querySelector('.md-header__option');
    if (paletteForm) paletteForm.style.display = 'none';

    subBtn = document.createElement('button');
    subBtn.className = 'submarine-toggle';
    subBtn.title = isDive ? 'GTFO' : 'Dive';
    subBtn.setAttribute('aria-label', subBtn.title);
    subBtn.innerHTML = '<span class="submarine-icon"></span>';

    headerInner.appendChild(subBtn);

    subBtn.addEventListener('click', function (e) {
      e.preventDefault();
      var base = window.location.pathname.replace(/\/osminok\/.*$/, '/osminok/');
      if (isDive) {
        var returnUrl = sessionStorage.getItem('osminok-dive-return');
        window.location.href = returnUrl || (base + 'ecology/');
      } else {
        sessionStorage.setItem('osminok-dive-return', window.location.href);
        window.location.href = base + 'dive/';
      }
    });
  })();

  /* Restyle "Back to top" as "Surface" on all Osminok pages */
  var topBtn = document.querySelector('.md-top');
  if (topBtn) {
    topBtn.childNodes.forEach(function (n) {
      if (n.nodeType === 3 && n.textContent.trim()) n.textContent = '\n  Surface\n';
    });
    if (isDive) {
      topBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        /* Ascend at 1000m/s (10,000px/s) so the scenery whizzes by */
        var startY = window.scrollY;
        var duration = (startY / 10000) * 1000;
        var startTime = null;
        function step(ts) {
          if (!startTime) startTime = ts;
          var t = Math.min((ts - startTime) / duration, 1);
          /* Ease-out so it decelerates approaching the surface */
          var ease = 1 - (1 - t) * (1 - t);
          window.scrollTo(0, startY * (1 - ease));
          if (t < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      }, true);
    }
  }

  /* Landing page — swirly stars canvas */
  var isLanding = !!document.querySelector('.osminok-landing');
  var starsAnimId = null;
  var flashTimers = [];
  if (isLanding && !reducedMotion) {
    (function () {
      var c = document.querySelector('.swirly-stars');
      if (!c) return;
      var sctx = c.getContext('2d');
      var sw = c.width = window.innerWidth;
      var sh = c.height = window.innerHeight;
      var maxStars = 1400;
      var stars = [];

      /* Matches the Mommyship starfield palette with identical weights */
      var starPalette = [
        {r: 255, g: 255, b: 255, w: 5},
        {r: 220, g: 230, b: 255, w: 2},
        {r: 170, g: 191, b: 255, w: 1},
        {r: 255, g: 244, b: 232, w: 2},
        {r: 255, g: 237, b: 151, w: 1.5},
        {r: 255, g: 196, b: 107, w: 1},
        {r: 255, g: 154, b: 92,  w: 0.5}
      ];
      var totalWeight = 0;
      for (var p = 0; p < starPalette.length; p++) totalWeight += starPalette[p].w;

      function pickColor() {
        var roll = Math.random() * totalWeight, cum = 0;
        for (var p = 0; p < starPalette.length; p++) {
          cum += starPalette[p].w;
          if (roll <= cum) return starPalette[p];
        }
        return starPalette[0];
      }

      /* Cache one gradient sprite per palette color */
      var sprites = {};
      function getSprite(col) {
        var key = col.r + ',' + col.g + ',' + col.b;
        if (sprites[key]) return sprites[key];
        var sc = document.createElement('canvas');
        var sx = sc.getContext('2d');
        sc.width = 100; sc.height = 100;
        var half = 50;
        var grad = sx.createRadialGradient(half, half, 0, half, half, half);
        grad.addColorStop(0.025, 'rgb(' + col.r + ',' + col.g + ',' + col.b + ')');
        grad.addColorStop(0.1, 'rgba(' + col.r + ',' + col.g + ',' + col.b + ',0.3)');
        grad.addColorStop(0.25, 'transparent');
        grad.addColorStop(1, 'transparent');
        sx.fillStyle = grad;
        sx.beginPath();
        sx.arc(half, half, half, 0, Math.PI * 2);
        sx.fill();
        sprites[key] = sc;
        return sc;
      }

      var maxOrbit = Math.round(Math.sqrt(sw * sw + sh * sh)) / 2;
      for (var i = 0; i < maxStars; i++) {
        var orbitR = rand(0, maxOrbit);
        var col = pickColor();
        stars.push({
          orbitR: orbitR,
          r: rand(60, orbitR || 60) / 12,
          ox: sw / 2, oy: sh / 2,
          t: rand(0, maxStars),
          speed: rand(0, orbitR || 1) / 200000,
          alpha: rand(0.2, 1),
          sprite: getSprite(col)
        });
      }

      function drawStars() {
        sctx.globalCompositeOperation = 'source-over';
        sctx.globalAlpha = 0.8;
        sctx.fillStyle = '#000';
        sctx.fillRect(0, 0, sw, sh);
        sctx.globalCompositeOperation = 'lighter';
        for (var i = 0; i < stars.length; i++) {
          var s = stars[i];
          var x = Math.sin(s.t) * s.orbitR + s.ox;
          var y = Math.cos(s.t) * s.orbitR + s.oy;
          var tw = randInt(0, 10);
          if (tw === 1 && s.alpha > 0) s.alpha -= 0.05;
          else if (tw === 2 && s.alpha < 1) s.alpha += 0.05;
          sctx.globalAlpha = s.alpha;
          sctx.drawImage(s.sprite, x - s.r / 2, y - s.r / 2, s.r, s.r);
          s.t += s.speed;
        }
        starsAnimId = requestAnimationFrame(drawStars);
      }
      drawStars();

      /* Lightning flashes on ring border — staccato pulses using storm colors */
      var ring = document.querySelector('.ring');
      var lightningColors = [
        'rgba(153, 247, 244, 0.6)',
        'rgba(212, 252, 255, 0.5)',
        'rgba(252, 255, 163, 0.5)',
        'rgba(252, 236, 96, 0.5)'
      ];
      var baseShadow = '0 0 10px 2px rgba(100, 210, 230, 0.12)';

      function flashRing() {
        if (!ring) return;
        var col = pick(lightningColors);
        var spread = randInt(15, 35);
        var blur = randInt(20, 45);
        ring.style.boxShadow = '0 0 ' + blur + 'px ' + spread + 'px ' + col;
        ring.style.transition = 'box-shadow 0.08s ease-in';
        flashTimers.push(setTimeout(function () {
          ring.style.boxShadow = baseShadow;
          ring.style.transition = 'box-shadow 0.5s ease-out';
        }, randInt(60, 150)));
        flashTimers.push(setTimeout(flashRing, randInt(800, 3500)));
      }
      flashTimers.push(setTimeout(flashRing, randInt(500, 2000)));
    })();
  }

  /* Bio layers — ecology uses scroll-percentage zones, dive uses depth-mapped */
  function makeBioLayer() {
    var el = document.createElement('div');
    el.className = 'osminok-bio';
    el.style.willChange = 'transform, opacity';
    el.style.contain = 'layout style paint';
    document.body.appendChild(el);
    return el;
  }

  var layers = [];
  if (isDive) {
    /* Phase 5: Depth-mapped zones with meter-based fade bands */
    layers = [
      { el: makeBioLayer(), pal: palettes.shallow, dive: true, hidden: false,
        fadeIn: [250, 350], peak: [400, 800], fadeOut: [800, 1200], rate: 0.06 },
      { el: makeBioLayer(), pal: palettes.twilight, dive: true, hidden: false,
        fadeIn: [800, 1200], peak: [1500, 3000], fadeOut: [3000, 4500], rate: 0.025 },
      { el: makeBioLayer(), pal: palettes.abyss, dive: true, hidden: false,
        fadeIn: [3500, 5000], peak: [5000, 10000], fadeOut: [10000, 12000], rate: 0.01 }
    ];
    if (!reducedMotion) {
      /* Sparser creature populations — spread across 12,000m of depth */
      populate(layers[0].el, layers[0].pal, {
        particles: { count: [50, 80], size: [2, 5], drift: [25, 50], alpha: [0.4, 0.8], blur: [2, 6], fast: true },
        chains:    { count: [6, 10], dots: [6, 12], spacing: [15, 22], amp: [10, 25], wl: [25, 50], undul: [4, 10], dotSize: [1.5, 3], dotAlpha: [0.4, 0.8], fast: true },
        clusters:  { count: [5, 8], dots: [5, 10], radius: 22, size: [2, 5], alpha: [0.4, 0.8], blur: [2, 7] },
        dashes:    { count: [15, 25], w: [4, 10], h: [1, 2], alpha: [0.3, 0.6] }
      });
      populate(layers[1].el, layers[1].pal, {
        particles: { count: [60, 100], size: [3, 6], drift: [30, 60], alpha: [0.5, 0.9], blur: [3, 9] },
        chains:    { count: [6, 10], dots: [12, 24], spacing: [20, 35], amp: [20, 50], wl: [40, 80], undul: [8, 20], dotSize: [2, 4], dotAlpha: [0.5, 0.9] },
        clusters:  { count: [5, 8], dots: [7, 16], radius: 38, size: [3, 7], alpha: [0.5, 0.9], blur: [4, 13] },
        dashes:    { count: [16, 28], w: [8, 20], h: [1.5, 3], alpha: [0.35, 0.7] },
        bells:     { count: [4, 7], size: [35, 70], alpha: [0.1, 0.28] }
      });
      populate(layers[2].el, layers[2].pal, {
        particles: { count: [18, 30], size: [4, 10], drift: [35, 80], alpha: [0.25, 0.65], blur: [5, 15] },
        chains:    { count: [3, 5], dots: [20, 38], spacing: [12, 20], amp: [30, 70], wl: [60, 120], undul: [12, 28], dotSize: [2.5, 5], dotAlpha: [0.3, 0.7] },
        clusters:  { count: [2, 4], dots: [12, 22], radius: 55, size: [4, 10], alpha: [0.3, 0.7], blur: [6, 18] },
        dashes:    { count: [6, 12], w: [12, 30], h: [2, 4], alpha: [0.15, 0.45] },
        lures:     { count: [2, 4], size: [6, 12], glow: [20, 40], alpha: [0.4, 0.8] },
        siphons:   { count: [1, 3], dots: [40, 70], spacing: [8, 14], amp: [40, 90], wl: [80, 160], dotSize: [3, 7], dotAlpha: [0.35, 0.75] }
      });
    }
  } else {
    layers = [
      { el: makeBioLayer(), start: 0.01, rate: 0.08, pal: palettes.shallow, hidden: false },
      { el: makeBioLayer(), start: 0.10, rate: 0.04, pal: palettes.twilight, hidden: false },
      { el: makeBioLayer(), start: 0.50, rate: 0.015, pal: palettes.abyss, hidden: false }
    ];
    if (!reducedMotion) {
      populate(layers[0].el, layers[0].pal, {
        particles: { count: [80, 120], size: [2, 5], drift: [25, 50], alpha: [0.4, 0.8], blur: [2, 6], fast: true },
        chains:    { count: [10, 15], dots: [6, 12], spacing: [15, 22], amp: [10, 25], wl: [25, 50], undul: [4, 10], dotSize: [1.5, 3], dotAlpha: [0.4, 0.8], fast: true },
        clusters:  { count: [8, 12], dots: [5, 10], radius: 22, size: [2, 5], alpha: [0.4, 0.8], blur: [2, 7] },
        dashes:    { count: [25, 40], w: [4, 10], h: [1, 2], alpha: [0.3, 0.6] }
      });
      populate(layers[1].el, layers[1].pal, {
        particles: { count: [100, 150], size: [3, 6], drift: [30, 60], alpha: [0.5, 0.9], blur: [3, 9] },
        chains:    { count: [10, 16], dots: [12, 24], spacing: [20, 35], amp: [20, 50], wl: [40, 80], undul: [8, 20], dotSize: [2, 4], dotAlpha: [0.5, 0.9] },
        clusters:  { count: [8, 12], dots: [7, 16], radius: 38, size: [3, 7], alpha: [0.5, 0.9], blur: [4, 13] },
        dashes:    { count: [28, 42], w: [8, 20], h: [1.5, 3], alpha: [0.35, 0.7] },
        bells:     { count: [6, 10], size: [35, 70], alpha: [0.1, 0.28] }
      });
      populate(layers[2].el, layers[2].pal, {
        particles: { count: [30, 45], size: [4, 10], drift: [35, 80], alpha: [0.25, 0.65], blur: [5, 15] },
        chains:    { count: [5, 8], dots: [20, 38], spacing: [12, 20], amp: [30, 70], wl: [60, 120], undul: [12, 28], dotSize: [2.5, 5], dotAlpha: [0.3, 0.7] },
        clusters:  { count: [3, 5], dots: [12, 22], radius: 55, size: [4, 10], alpha: [0.3, 0.7], blur: [6, 18] },
        dashes:    { count: [10, 18], w: [12, 30], h: [2, 4], alpha: [0.15, 0.45] },
        lures:     { count: [3, 6], size: [6, 12], glow: [20, 40], alpha: [0.4, 0.8] },
        siphons:   { count: [2, 4], dots: [40, 70], spacing: [8, 14], amp: [40, 90], wl: [80, 160], dotSize: [3, 7], dotAlpha: [0.35, 0.75] }
      });
    }
  }

  /* Megastorm canvas + Phase 3: rain and alt-lightning (dive only) */
  var stormCanvas = document.querySelector('.storm-canvas');
  var stormAnimId = null;
  var stormResizeHandler = null;

  if (stormCanvas && !reducedMotion) {
    var stormCtx = stormCanvas.getContext('2d');
    var stormClouds = [];

    /* Phase 3: Alt-lightning canvas (dive only) */
    var lightCanvas = isDive ? ocean.querySelector('.storm-light-canvas') : null;
    var lightCtx = null;
    var altBolts = [];
    var altFrameCount = 0;

    /* Phase 3: Rain particles (dive only) */
    var raindrops = [];
    var splashes = [];
    var RAIN_COLOR = 'hsla(210, 15%, 55%, 0.7)';
    var RAIN_SPAWN_RATE = 9;
    var WIND_AMP = 30;
    var WIND_PERIOD = 2.5;

    function makeRaindrop(w, h, scatter) {
      var speed = rand(6, 14) + 5;
      return {
        x: rand(0, w),
        y: scatter ? rand(-h, h) : rand(-50, 0),
        speed: speed,
        vx: rand(0, 2),
        swayJitter: rand(-0.15, 0.15),
        triggerY: rand(h * 0.85, h)
      };
    }

    function spawnSplash(x, y) {
      var count = randInt(3, 5);
      for (var i = 0; i < count; i++) {
        splashes.push({
          x: x, y: y,
          vx: rand(-2, 2),
          vy: rand(-4, 0),
          radius: rand(0.65, 2.25),
          alpha: 1
        });
      }
    }

    function initRain() {
      raindrops = [];
      splashes = [];
      var w = rainCanvas ? rainCanvas.width : stormCanvas.width;
      var h = rainCanvas ? rainCanvas.height : stormCanvas.height;
      for (var i = 0; i < 500; i++) {
        raindrops.push(makeRaindrop(w, h, true));
      }
    }

    function initStormClouds() {
      stormCanvas.width = stormCanvas.clientWidth;
      stormCanvas.height = stormCanvas.clientHeight;
      stormClouds = [];
      var x = 0;
      while (x < stormCanvas.width) {
        stormClouds.push({
          x: x, y: 0,
          size: randInt(0, 29),
          speed: randInt(1, 2),
          dir: Math.random() < 0.5 ? -1 : 1
        });
        x += randInt(1, 10);
      }
    }


    if (isDive && lightCanvas) {
      lightCtx = lightCanvas.getContext('2d');
    }

    function sizeLightCanvas() {
      if (!lightCanvas) return;
      var w = lightCanvas.clientWidth || lightCanvas.parentElement.clientWidth || vw;
      var h = lightCanvas.clientHeight || lightCanvas.parentElement.clientHeight || vh;
      if (w > 0 && h > 0) {
        lightCanvas.width = w;
        lightCanvas.height = h;
      }
    }

    /* Rain canvas — sits above waves (z:2) but below ::after fade (z:10) */
    var rainCanvas = null, rainCtx = null;
    if (isDive) {
      rainCanvas = document.createElement('canvas');
      rainCanvas.className = 'rain-canvas';
      stormCanvas.parentElement.appendChild(rainCanvas);
      rainCtx = rainCanvas.getContext('2d');
    }

    function sizeRainCanvas() {
      if (!rainCanvas) return;
      var w = rainCanvas.parentElement.clientWidth || vw;
      var h = rainCanvas.parentElement.clientHeight || vh;
      if (w > 0 && h > 0) { rainCanvas.width = w; rainCanvas.height = h; }
    }

    if (isDive && lightCanvas) {
      sizeLightCanvas();
      sizeRainCanvas();
      initRain();
    }

    function drawRoot(sx, sy, col) {
      var ex = sx + randInt(-15, 34), ey = sy + randInt(0, 29);
      var limit = randInt(0, 19);
      for (var i = 0; i < limit; i++) {
        stormCtx.beginPath();
        stormCtx.strokeStyle = col;
        stormCtx.lineWidth = 1;
        stormCtx.moveTo(sx, sy);
        stormCtx.lineTo(ex, ey);
        stormCtx.stroke();
        sx = ex; sy = ey;
        ex = sx + randInt(-15, 34);
        ey = sy + randInt(0, 29);
      }
    }

    function drawLightning(cloud, color) {
      stormCtx.fillStyle = 'rgba(255,255,255,0.006)';
      stormCtx.fillRect(0, 0, stormCanvas.width, stormCanvas.height);
      var sx = cloud.x, sy = cloud.y;
      var ex = sx + randInt(-15, 14), ey = sy + randInt(0, 29);
      var limit = randInt(0, stormCanvas.height);
      for (var i = 0; i < limit; i++) {
        stormCtx.beginPath();
        stormCtx.strokeStyle = color;
        stormCtx.lineWidth = 3;
        stormCtx.moveTo(sx, sy);
        stormCtx.lineTo(ex, ey);
        stormCtx.stroke();
        sx = ex; sy = ey;
        ex = sx + randInt(-15, 14);
        ey = sy + randInt(0, 29);
        if (Math.random() < 0.05) drawRoot(sx, sy, color);
      }
    }

    /* Phase 3: Rain drawing (drops + splashes on megastorm canvas) */
    function drawRain(ctx) {
      var w = ctx.canvas.width, h = ctx.canvas.height;
      var t = Date.now() / 1000;

      for (var s = 0; s < RAIN_SPAWN_RATE; s++) {
        raindrops.push(makeRaindrop(w, h, false));
      }

      /* Drops — fillRect sized by speed, with wind sway */
      ctx.fillStyle = RAIN_COLOR;
      for (var i = raindrops.length - 1; i >= 0; i--) {
        var d = raindrops[i];
        var globalWind = Math.sin(t * (Math.PI * 2 / WIND_PERIOD));
        var sway = WIND_AMP * (globalWind + d.swayJitter);
        var drawX = d.x + sway;
        ctx.fillRect(drawX, d.y, d.speed / 4, d.speed);
        d.x += d.vx;
        d.y += d.speed;
        if (d.y >= d.triggerY) {
          spawnSplash(drawX, d.y);
          raindrops[i] = raindrops[raindrops.length - 1];
          raindrops.pop();
        }
      }

      /* Splashes — small arcs that bounce up, shrink, and fade */
      var tau = Math.PI * 2;
      for (var i = splashes.length - 1; i >= 0; i--) {
        var sp = splashes[i];
        ctx.globalAlpha = sp.alpha;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, Math.max(sp.radius, 0), 0, tau);
        ctx.fill();
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.vy += 0.15;
        sp.radius -= 0.075;
        sp.alpha -= 0.005;
        if (sp.radius < 0) {
          splashes[i] = splashes[splashes.length - 1];
          splashes.pop();
        }
      }

      ctx.globalAlpha = 1;
    }

    /* Phase 3: Alt-lightning (destination-out fade on separate canvas).
       Bolts linger and glow — they're the slow, atmospheric counterpart
       to the megastorm's instant flashes. */
    function updateAltLightning(ctx) {
      var w = ctx.canvas.width, h = ctx.canvas.height;
      if (w === 0 || h === 0) return;

      /* Gentle fade — low erasure keeps bolts visible longer */
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,' + rand(0.005, 0.06).toFixed(3) + ')';
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';

      altFrameCount++;

      /* Spawn 1–3 bolts roughly every 2 seconds */
      if (altFrameCount % 120 < 1) {
        var boltCount = randInt(1, 3);
        for (var b = 0; b < boltCount; b++) {
          altBolts.push({
            x: rand(0, w),
            y: rand(-h * 0.15, h * 0.05),
            segments: 0,
            maxSegments: randInt(40, 55),
            lineWidth: pick([3, 6, 8]),
            color: pick(['rgba(153,247,244,0.6)', 'rgba(212,252,255,0.5)', 'rgba(252,255,163,0.5)', 'rgba(252,236,96,0.5)'])
          });
        }
        /* Sheet flash — brief atmospheric illumination */
        if (Math.random() < 0.4) {
          ctx.fillStyle = 'rgba(200,210,240,' + rand(0.03, 0.08).toFixed(3) + ')';
          ctx.fillRect(0, 0, w, h);
        }
      }

      /* Grow active bolts two segments per frame for snappier strikes.
         Glow simulated by drawing a wider, dimmer stroke behind the main one
         instead of using shadowBlur (which is CPU-rendered). */
      for (var i = altBolts.length - 1; i >= 0; i--) {
        var bolt = altBolts[i];
        for (var s = 0; s < 2 && bolt.segments < bolt.maxSegments; s++) {
          var nx = bolt.x + rand(-30, 30);
          var ny = bolt.y + rand(10, 25);
          /* Wide dim glow pass */
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(153,247,244,0.12)';
          ctx.lineWidth = bolt.lineWidth * 3;
          ctx.moveTo(bolt.x, bolt.y);
          ctx.lineTo(nx, ny);
          ctx.stroke();
          /* Sharp bright core */
          ctx.beginPath();
          ctx.strokeStyle = bolt.color;
          ctx.lineWidth = bolt.lineWidth;
          ctx.moveTo(bolt.x, bolt.y);
          ctx.lineTo(nx, ny);
          ctx.stroke();
          bolt.x = nx;
          bolt.y = ny;
          bolt.segments++;
        }
        if (bolt.segments >= bolt.maxSegments) {
          altBolts[i] = altBolts[altBolts.length - 1];
          altBolts.pop();
        }
      }
    }

    var lightningColors = ['#99f7f4', '#d4fcff', '#fcffa3', '#fcec60', '#fcd960'];

    function stormFrame() {
      if (document.hidden) { stormAnimId = requestAnimationFrame(stormFrame); return; }

      stormCtx.fillStyle = '#000';
      stormCtx.fillRect(0, 0, stormCanvas.width, stormCanvas.height);

      for (var i = 0; i < stormClouds.length; i++) {
        var c = stormClouds[i];
        stormCtx.beginPath();
        stormCtx.fillStyle = '#121926';
        stormCtx.arc(c.x, c.y - 1, c.size, 0, Math.PI * 2);
        stormCtx.fill();
        if (Math.random() < 0.0003) drawLightning(c, pick(lightningColors));
        if (c.x <= 0) c.dir = 1;
        else if (c.x >= stormCanvas.width) c.dir = -1;
        c.x += c.speed * c.dir;
      }

      /* Phase 3: Rain + alt-lightning on dive page */
      if (isDive) {
        if (rainCtx) {
          rainCtx.clearRect(0, 0, rainCanvas.width, rainCanvas.height);
          drawRain(rainCtx);
        }
        if (lightCtx) updateAltLightning(lightCtx);
      }

      stormAnimId = requestAnimationFrame(stormFrame);
    }

    initStormClouds();
    stormFrame();

    stormResizeHandler = function () {
      initStormClouds();
      if (isDive && lightCanvas) {
        sizeLightCanvas();
        sizeRainCanvas();
        initRain();
      }
    };
    window.addEventListener('resize', stormResizeHandler);
  }

  /* Phase 6: Marine snow — tiny falling dots, visible at all depths */
  var snowContainer = null;
  if (isDive && !reducedMotion) {
    snowContainer = document.createElement('div');
    snowContainer.className = 'marine-snow';
    snowContainer.style.willChange = 'transform, opacity';
    document.body.appendChild(snowContainer);

    for (var i = 0; i < 320; i++) {
      var flake = document.createElement('div');
      var size = rand(1.5, 7);
      var alpha = rand(0.2, 0.55);
      flake.style.cssText =
        'position:absolute;border-radius:50%;' +
        'left:' + rand(0, 100).toFixed(1) + '%;' +
        'width:' + size.toFixed(1) + 'px;height:' + size.toFixed(1) + 'px;' +
        'background:rgba(200,210,230,' + alpha.toFixed(2) + ');';

      /* Falling + lateral swoosh — sine-like side-to-side through the water column */
      var swayAmp = rand(40, 120);
      var swayDir = Math.random() < 0.5 ? 1 : -1;
      flake.animate([
        { transform: 'translateY(-10px) translateX(0)', opacity: 0 },
        { transform: 'translateY(' + (vh * 0.25).toFixed(0) + 'px) translateX(' + (swayAmp * swayDir).toFixed(0) + 'px)', opacity: alpha },
        { transform: 'translateY(' + (vh * 0.5).toFixed(0) + 'px) translateX(0)', opacity: alpha * 0.8 },
        { transform: 'translateY(' + (vh * 0.75).toFixed(0) + 'px) translateX(' + (-swayAmp * swayDir).toFixed(0) + 'px)', opacity: alpha * 0.5 },
        { transform: 'translateY(' + vh + 'px) translateX(0)', opacity: 0 }
      ], {
        duration: rand(8000, 22000),
        delay: -rand(0, 20000),
        iterations: Infinity,
        easing: 'linear'
      });

      snowContainer.appendChild(flake);
    }
  }

  /* Pseudo-random noise from layered sines at irrational-ratio frequencies —
     shared by bubbles (Phase 6b) and ?????? distortion (Phase 7) */
  function noise(t, seed) {
    return Math.sin(t * 1.7 + seed * 3.1) * 0.4
         + Math.sin(t * 0.9 + seed * 7.3) * 0.3
         + Math.sin(t * 2.3 + seed * 1.9) * 0.3;
  }

  /* Half-res canvases — soft particle effects don't need full pixel fill.
     ctx.scale maps drawing coordinates to viewport space so all math is unchanged. */
  var canvasScale = 0.5;

  /* Phase 6b: Bubbles — canvas overlay with formations.
     Solo bubbles + occasional streams, clusters, and rings.
     Count thins from surface to 10,000m with per-bubble opacity fade-out. */
  var bubbleCanvas = null;
  var bubbleCtx = null;
  var bubbles = [];
  var formations = [];
  var bubbleAnimId = null;
  if (isDive && !reducedMotion) {
    bubbleCanvas = document.createElement('canvas');
    bubbleCanvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:3;will-change:transform;';
    document.body.appendChild(bubbleCanvas);
    bubbleCanvas.width = Math.round(vw * canvasScale);
    bubbleCanvas.height = Math.round(vh * canvasScale);
    bubbleCtx = bubbleCanvas.getContext('2d');
    bubbleCtx.scale(canvasScale, canvasScale);

    function makeBubble() {
      return {
        x: Math.random() * vw,
        y: vh + Math.random() * 300,
        speed: 4 + Math.random() * 10,
        radius: 0.5 + Math.random() * 7.5,
        opacity: 0.05 + Math.random() * 0.25,
        maxDepth: Math.random() < 0.12 ? rand(14000, 18000) : Math.random() * 10000
      };
    }

    for (var bi = 0; bi < 100; bi++) bubbles.push(makeBubble());

    /* Formations spawn periodically — streams, clusters, and rings */
    var formationTimer = 0;
    var nextFormationDelay = rand(3000, 8000);
    function spawnFormation() {
      var type = Math.random();
      var cx = rand(vw * 0.1, vw * 0.9);
      var cy = vh + rand(50, 200);
      var f = { type: '', bubbles: [], maxDepth: rand(500, 18000), born: 0 };

      if (type < 0.4) {
        /* Stream — vertical column of 8–15 bubbles with staggered starts */
        f.type = 'stream';
        var count = randInt(8, 15);
        for (var si = 0; si < count; si++) {
          f.bubbles.push({
            x: cx + rand(-8, 8), y: cy + si * rand(15, 30),
            speed: 5 + Math.random() * 6,
            radius: 0.8 + Math.random() * 4,
            opacity: 0.06 + Math.random() * 0.2
          });
        }
      } else if (type < 0.75) {
        /* Cluster — tight radial group, like an exhaust burst */
        f.type = 'cluster';
        var dots = randInt(6, 14);
        for (var ci = 0; ci < dots; ci++) {
          var angle = Math.random() * Math.PI * 2;
          var dist = Math.random() * rand(12, 30);
          f.bubbles.push({
            x: cx + Math.cos(angle) * dist, y: cy + Math.sin(angle) * dist,
            speed: 3 + Math.random() * 8,
            radius: 0.5 + Math.random() * 5,
            opacity: 0.06 + Math.random() * 0.2
          });
        }
      } else {
        /* Ring — hollow ellipse of evenly-spaced bubbles */
        f.type = 'ring';
        var ringDots = randInt(10, 20);
        var ringRx = rand(20, 50);
        var ringRy = rand(14, 35);
        for (var ri = 0; ri < ringDots; ri++) {
          var a = (ri / ringDots) * Math.PI * 2;
          f.bubbles.push({
            x: cx + Math.cos(a) * ringRx, y: cy + Math.sin(a) * ringRy,
            speed: 4 + Math.random() * 5,
            radius: 0.6 + Math.random() * 3,
            opacity: 0.06 + Math.random() * 0.18
          });
        }
      }
      formations.push(f);
    }

    function drawOneBubble(b, t, seed, depthFade) {
      var wobbleX = noise(t * 0.8, seed) * 8;
      var wobbleY = noise(t * 0.7, seed + 5) * 3;
      var rx = Math.max(0.3, b.radius * (1 + noise(t * 0.5, seed + 70) * 0.55));
      var ry = Math.max(0.3, b.radius * (1 + noise(t * 0.6, seed + 80) * 0.55));
      var rot = noise(t * 0.4, seed + 90) * Math.PI;
      var alpha = b.opacity * depthFade;
      if (alpha < 0.005) return;
      bubbleCtx.beginPath();
      bubbleCtx.fillStyle = 'rgba(255,255,255,' + alpha.toFixed(3) + ')';
      bubbleCtx.ellipse(b.x + wobbleX, b.y + wobbleY, rx, ry, rot, 0, Math.PI * 2);
      bubbleCtx.fill();
    }

    function drawBubbles(currentDepth, now) {
      bubbleCtx.clearRect(0, 0, vw, vh);
      var t = now * 0.001;

      /* Solo bubbles */
      for (var i = 0; i < bubbles.length; i++) {
        var b = bubbles[i];
        /* Smooth fade over last 20% of bubble's depth range */
        var fadeZone = b.maxDepth * 0.2;
        var depthFade = currentDepth > b.maxDepth ? 0
          : currentDepth > b.maxDepth - fadeZone ? (b.maxDepth - currentDepth) / fadeZone : 1;
        if (depthFade <= 0) continue;
        drawOneBubble(b, t, i, depthFade);
        b.y -= b.speed;
        if (b.y <= -10) {
          var nb = makeBubble();
          bubbles[i].x = nb.x; bubbles[i].y = nb.y; bubbles[i].speed = nb.speed;
          bubbles[i].radius = nb.radius; bubbles[i].opacity = nb.opacity;
          bubbles[i].maxDepth = nb.maxDepth;
        }
      }

      /* Formations */
      for (var fi = formations.length - 1; fi >= 0; fi--) {
        var f = formations[fi];
        var fFadeZone = f.maxDepth * 0.2;
        var fDepthFade = currentDepth > f.maxDepth ? 0
          : currentDepth > f.maxDepth - fFadeZone ? (f.maxDepth - currentDepth) / fFadeZone : 1;
        var allGone = true;
        for (var fb = 0; fb < f.bubbles.length; fb++) {
          var fb2 = f.bubbles[fb];
          if (fb2.y > -10) allGone = false;
          if (fDepthFade <= 0) continue;
          drawOneBubble(fb2, t, fi * 100 + fb, fDepthFade);
          fb2.y -= fb2.speed;
        }
        if (allGone || fDepthFade <= 0) formations.splice(fi, 1);
      }

      /* Spawn new formations every 3–8 seconds */
      if (now - formationTimer > nextFormationDelay) {
        spawnFormation();
        formationTimer = now;
        nextFormationDelay = rand(3000, 8000);
      }
    }

    var lastBubbleMask = '';
    function bubbleLoop(now) {
      if (document.hidden) { bubbleAnimId = requestAnimationFrame(bubbleLoop); return; }
      var depth = window.scrollY / 10;
      /* Dynamic mask tracks ocean surface — 100px fade (bottom 10% of 0m div) */
      var surfaceOnScreen = vh * 0.66 - window.scrollY;
      var fadeStart = Math.max(0, surfaceOnScreen).toFixed(0);
      var fadeEnd = (Math.max(0, surfaceOnScreen) + 100).toFixed(0);
      var mask = 'linear-gradient(to bottom, transparent ' + fadeStart + 'px, black ' + fadeEnd + 'px)';
      if (mask !== lastBubbleMask) {
        bubbleCanvas.style.maskImage = mask;
        bubbleCanvas.style.webkitMaskImage = mask;
        lastBubbleMask = mask;
      }
      drawBubbles(depth, now);
      bubbleAnimId = requestAnimationFrame(bubbleLoop);
    }
    bubbleAnimId = requestAnimationFrame(bubbleLoop);
  }

  /* Phase 6c: Shimmerfish — mouse-following school, 200–3000m.
     Tapered streaks that flicker silver/green/teal. Gradually accumulate
     200–500m, scatter upward at 3000m, re-accumulate at 2× on scroll-back. */
  var fishCanvas = null;
  var fishCtx = null;
  var fish = [];
  var fishAnimId = null;
  var fishScattered = false;
  var fishWasScattered = false;
  var fishMousePos = [vw / 2, vh / 2];
  var fishMouseHandler = null;
  if (isDive && !reducedMotion) {
    fishCanvas = document.createElement('canvas');
    fishCanvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:4;will-change:transform;';
    document.body.appendChild(fishCanvas);
    fishCanvas.width = Math.round(vw * canvasScale);
    fishCanvas.height = Math.round(vh * canvasScale);
    fishCtx = fishCanvas.getContext('2d');
    fishCtx.scale(canvasScale, canvasScale);

    fishMouseHandler = function (e) { fishMousePos = [e.clientX, e.clientY]; };
    document.addEventListener('mousemove', fishMouseHandler);

    /* Shimmerfish color palette — silver/green/teal with per-fish noise flicker */
    var fishPalette = [
      [180, 200, 210],
      [160, 210, 195],
      [140, 195, 180],
      [170, 215, 200],
      [190, 210, 190]
    ];

    function makeFish(scatter) {
      var pal = fishPalette[Math.floor(Math.random() * fishPalette.length)];
      return {
        x: Math.random() * vw, y: Math.random() * vh,
        angle: Math.random() * 360,
        prevAngle: 0,
        newAngle: 0,
        speed: 3 + Math.random() * 3,
        speedMult: 1,
        size: 3 + Math.random() * 5,
        curve: rand(-2, 2),
        pull: rand(200, 450),
        strokeSpeed: randInt(8, 22),
        tick: 0,
        flash: 0,
        baseColor: pal,
        active: !scatter,
        scattered: false,
        scatterAngle: 0
      };
    }

    for (var fi = 0; fi < 100; fi++) fish.push(makeFish(false));

    function angleFromVector(x, y) {
      var a = Math.atan2(y, x) * 180 / Math.PI;
      return (a + 360) % 360;
    }

    function drawFish(f, t, idx) {
      var rad = f.angle * Math.PI / 180;
      var cosR = Math.cos(rad);
      var sinR = Math.sin(rad);
      var len = f.size * 2.5;
      var halfW = f.size * 0.4;
      var tipX = f.x + cosR * len;
      var tipY = f.y + sinR * len;
      var perpX = -sinR * halfW;
      var perpY = cosR * halfW;

      /* Direction-change flash — decays over ~15 frames */
      var flashBoost = f.flash > 0 ? f.flash : 0;
      if (f.flash > 0) f.flash -= 0.07;

      /* Color flicker — noise shifts RGB channels, flash spikes to silver */
      var flickR = f.baseColor[0] + noise(t * 1.2, idx) * 30 + flashBoost * 80;
      var flickG = f.baseColor[1] + noise(t * 0.9, idx + 20) * 25 + flashBoost * 70;
      var flickB = f.baseColor[2] + noise(t * 1.1, idx + 40) * 20 + flashBoost * 60;
      var flickA = 0.2 + (noise(t * 0.6, idx + 60) + 1) * 0.15 + flashBoost * 0.3;

      var r = Math.floor(Math.max(0, Math.min(255, flickR)));
      var g = Math.floor(Math.max(0, Math.min(255, flickG)));
      var b = Math.floor(Math.max(0, Math.min(255, flickB)));
      var a = Math.min(flickA, 0.85);

      /* Inner glow — larger, softer triangle behind the body */
      fishCtx.beginPath();
      fishCtx.moveTo(tipX, tipY);
      var glowW = halfW * 2.2;
      fishCtx.lineTo(f.x + sinR * glowW, f.y - cosR * glowW);
      fishCtx.lineTo(f.x - sinR * glowW, f.y + cosR * glowW);
      fishCtx.closePath();
      fishCtx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + (a * 0.15).toFixed(3) + ')';
      fishCtx.fill();

      /* Body */
      fishCtx.beginPath();
      fishCtx.moveTo(tipX, tipY);
      fishCtx.lineTo(f.x - perpX, f.y - perpY);
      fishCtx.lineTo(f.x + perpX, f.y + perpY);
      fishCtx.closePath();
      fishCtx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + a.toFixed(2) + ')';
      fishCtx.fill();
    }

    function updateFish(f, t, idx) {
      if (f.scattered) {
        var rad = f.scatterAngle * Math.PI / 180;
        f.x += Math.cos(rad) * f.speed * 4;
        f.y += Math.sin(rad) * f.speed * 4;
        return;
      }
      f.prevAngle = f.angle;
      f.tick++;
      /* Autonomous wandering — noise-driven angle drift */
      var wander = noise(t * 0.3, idx * 7) * 90;
      f.angle += f.curve;
      if (f.tick % f.strokeSpeed === 0) {
        /* Blend: 90% cursor influence, 10% wander — cohesive school */
        f.angle = f.newAngle * 0.9 + (f.angle + wander) * 0.1;
      }
      /* Detect direction change → trigger flash */
      var angleDelta = Math.abs(f.angle - f.prevAngle) % 360;
      if (angleDelta > 180) angleDelta = 360 - angleDelta;
      if (angleDelta > 15) f.flash = Math.min(1, angleDelta / 60);

      var rad = f.angle * Math.PI / 180;
      var move = f.speed * (0.5 + f.speedMult / f.pull);
      f.x += Math.cos(rad) * move;
      f.y += Math.sin(rad) * move;
      /* Wrap around viewport edges */
      if (f.x < -20) f.x = vw + 20;
      if (f.x > vw + 20) f.x = -20;
      if (f.y < -20) f.y = vh + 20;
      if (f.y > vh + 20) f.y = -20;
    }

    var lastFishMask = '';
    function fishLoop(now) {
      if (document.hidden) { fishAnimId = requestAnimationFrame(fishLoop); return; }
      var depth = window.scrollY / 10;
      var t = now * 0.001;
      fishCtx.clearRect(0, 0, vw, vh);

      /* Same surface mask as bubbles */
      var surfaceOnScreen = vh * 0.66 - window.scrollY;
      var fadeStart = Math.max(0, surfaceOnScreen).toFixed(0);
      var fadeEnd = (Math.max(0, surfaceOnScreen) + 100).toFixed(0);
      var mask = 'linear-gradient(to bottom, transparent ' + fadeStart + 'px, black ' + fadeEnd + 'px)';
      if (mask !== lastFishMask) {
        fishCanvas.style.maskImage = mask;
        fishCanvas.style.webkitMaskImage = mask;
        lastFishMask = mask;
      }

      /* Determine how many fish should be active based on depth */
      var targetCount;
      if (depth < 200) targetCount = 0;
      else if (depth < 500) targetCount = Math.floor(((depth - 200) / 300) * 100);
      else if (depth < 3000) targetCount = 100;
      else targetCount = 0;

      /* Scatter at 3000m — fish jet upward in random directions */
      if (depth >= 3000 && !fishScattered) {
        fishScattered = true;
        for (var si = 0; si < fish.length; si++) {
          if (!fish[si].active) continue;
          fish[si].scattered = true;
          fish[si].scatterAngle = rand(220, 320);
        }
      }

      /* Re-accumulate when scrolling back above 3000m (2× rate) */
      if (depth < 3000 && fishScattered) {
        fishScattered = false;
        fishWasScattered = true;
        for (var ri = 0; ri < fish.length; ri++) {
          fish[ri].scattered = false;
          fish[ri].active = false;
          fish[ri].x = Math.random() * vw;
          fish[ri].y = Math.random() * vh;
        }
      }

      /* Gradually activate/deactivate fish to match target */
      if (!fishScattered) {
        var activeCount = 0;
        for (var ci = 0; ci < fish.length; ci++) if (fish[ci].active) activeCount++;
        /* 2× activation rate when re-accumulating after scatter */
        var activateRate = fishWasScattered ? 2 : 1;
        if (activeCount < targetCount) {
          var toAdd = Math.min(activateRate, targetCount - activeCount);
          for (var ai = 0; ai < fish.length && toAdd > 0; ai++) {
            if (!fish[ai].active) { fish[ai].active = true; toAdd--; }
          }
        }
        if (fishWasScattered && activeCount >= targetCount) fishWasScattered = false;
      }

      /* Steer toward mouse + draw */
      for (var i = 0; i < fish.length; i++) {
        var f = fish[i];
        if (!f.active) continue;
        if (f.scattered) {
          updateFish(f, t, i);
          if (f.x < -50 || f.x > vw + 50 || f.y < -50 || f.y > vh + 50) {
            f.active = false;
            continue;
          }
          drawFish(f, t, i);
          continue;
        }
        var dx = fishMousePos[0] - f.x;
        var dy = fishMousePos[1] - f.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        /* Comfort zone — fish ignore cursor when within 80px, avoiding clustering */
        if (dist > 80) {
          f.newAngle = angleFromVector(dx, dy);
          f.speedMult = 1 + dist * 0.5;
        } else {
          f.speedMult = 1;
        }
        updateFish(f, t, i);
        drawFish(f, t, i);
      }

      fishAnimId = requestAnimationFrame(fishLoop);
    }
    fishAnimId = requestAnimationFrame(fishLoop);
  }

  /* Resize handler for dive canvases — keeps bubble/fish rendering crisp */
  var diveResizeHandler = null;
  if (isDive && !reducedMotion) {
    diveResizeHandler = function () {
      vw = window.innerWidth;
      vh = window.innerHeight;
      /* Resizing resets context state — setTransform avoids stacking scales */
      if (bubbleCanvas) {
        bubbleCanvas.width = Math.round(vw * canvasScale);
        bubbleCanvas.height = Math.round(vh * canvasScale);
        bubbleCtx.setTransform(canvasScale, 0, 0, canvasScale, 0, 0);
      }
      if (fishCanvas) {
        fishCanvas.width = Math.round(vw * canvasScale);
        fishCanvas.height = Math.round(vh * canvasScale);
        fishCtx.setTransform(canvasScale, 0, 0, canvasScale, 0, 0);
      }
      if (creatureCanvas) {
        creatureCanvas.width = Math.round(vw * creatureScale);
        creatureCanvas.height = Math.round(vh * creatureScale);
        creatureCtx.setTransform(creatureScale, 0, 0, creatureScale, 0, 0);
      }
    };
    window.addEventListener('resize', diveResizeHandler);
  }

  /* Creature canvas — shared by Longlightning, Darkmaws, Glowspirals,
     Thoughtwater, and algae blooms. Higher res than bubble/fish canvases
     because these creatures have fine detail (spiral paths, noise textures). */
  var creatureCanvas = null;
  var creatureCtx = null;
  var creatureAnimId = null;
  var creatureScale = 0.75;
  if (isDive && !reducedMotion) {
    creatureCanvas = document.createElement('canvas');
    creatureCanvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:2;will-change:transform;';
    document.body.appendChild(creatureCanvas);
    creatureCanvas.width = Math.round(vw * creatureScale);
    creatureCanvas.height = Math.round(vh * creatureScale);
    creatureCtx = creatureCanvas.getContext('2d');
    creatureCtx.scale(creatureScale, creatureScale);

    /* Color interpolation for Thoughtwater mood cycling */
    function lerpColor(a, b, t) {
      return [
        Math.round(a[0] + (b[0] - a[0]) * t),
        Math.round(a[1] + (b[1] - a[1]) * t),
        Math.round(a[2] + (b[2] - a[2]) * t)
      ];
    }

    /* Depth-to-opacity for creatures with min/max depth ranges */
    function depthAlpha(depth, minD, maxD) {
      var fadeIn = (maxD - minD) * 0.1;
      var fadeOut = (maxD - minD) * 0.1;
      if (depth < minD || depth > maxD) return 0;
      if (depth < minD + fadeIn) return (depth - minD) / fadeIn;
      if (depth > maxD - fadeOut) return (maxD - depth) / fadeOut;
      return 1;
    }

    /* Longlightning — bioluminescent eels */
    var eels = [];
    var nextEelTime = 0;

    function spawnEel(depth) {
      var params;
      if (depth < 1200) {
        params = { len: rand(80, 150), segs: randInt(12, 18), w: rand(2, 4),
          pal: palettes.shallow, speed: rand(300, 500), min: 200, max: 1200, interval: rand(2500, 5000) };
      } else if (depth < 4500) {
        params = { len: rand(250, 500), segs: randInt(20, 30), w: rand(3, 6),
          pal: palettes.twilight, speed: rand(180, 350), min: 800, max: 4500, interval: rand(6000, 12000) };
      } else {
        params = { len: rand(600, 1400), segs: randInt(35, 60), w: rand(4, 10),
          pal: palettes.abyss, speed: rand(120, 250), min: 3500, max: 11000, interval: rand(5000, 12000) };
      }
      var dir = Math.random() < 0.5 ? 1 : -1;
      /* Swim direction — mostly lateral but can angle diagonally or even steeply */
      var angle = dir > 0 ? rand(-0.7, 0.7) : rand(Math.PI - 0.7, Math.PI + 0.7);
      var startX = dir > 0 ? -params.len : vw + params.len;
      var startY = rand(vh * 0.1, vh * 0.9);
      var color = pick(params.pal);

      function makeEel(yOff, phaseOff) {
        var segments = [];
        for (var s = 0; s < params.segs; s++) segments.push({ x: startX, y: startY + yOff });
        return {
          segments: segments, speed: params.speed, width: params.w,
          color: color, waveAmp: rand(6, 14), waveFreq: rand(2, 4),
          angle: angle, direction: dir, age: 0, phaseOff: phaseOff,
          spacing: params.len / params.segs, baseAlpha: rand(0.65, 1.0),
          scale: 1, fleeing: false, partner: null,
          minDepth: params.min, maxDepth: params.max
        };
      }

      var primary = makeEel(0, 0);
      eels.push(primary);
      /* 40% chance of a mated pair — store cross-references */
      if (Math.random() < 0.4) {
        var mate = makeEel(rand(15, 30) * (Math.random() < 0.5 ? 1 : -1), rand(0.5, 1.5));
        primary.partner = mate;
        mate.partner = primary;
        eels.push(mate);
      }
      return params.interval;
    }

    function updateEels(depth, now) {
      var t = now * 0.001;
      if (now > nextEelTime && depth >= 200 && depth <= 11000) {
        var interval = spawnEel(depth);
        nextEelTime = now + interval;
      }

      for (var i = eels.length - 1; i >= 0; i--) {
        var e = eels[i];
        var da = depthAlpha(depth, e.minDepth, e.maxDepth);
        e.depthAlpha = e.depthAlpha !== undefined ? e.depthAlpha + (da - e.depthAlpha) * 0.05 : da;
        if (e.depthAlpha < 0.01 && da <= 0) { eels.splice(i, 1); continue; }

        /* Fleeing eels move 3× faster with bigger wiggles */
        var speedMult = e.fleeing ? 3 : 1;
        var ampMult = e.fleeing ? 2.5 : 1;

        var head = e.segments[0];
        var spd = e.speed * speedMult / 60;
        head.x += Math.cos(e.angle) * spd;
        head.y += Math.sin(e.angle) * spd;

        /* Full-body sine undulation — gentle wave propagates head→tail */
        var headY0 = head.y;
        for (var s = 0; s < e.segments.length; s++) {
          if (s === 0) {
            head.y += Math.sin(t * e.waveFreq + e.phaseOff) * e.waveAmp * ampMult * 0.04;
          } else {
            var prev = e.segments[s - 1];
            var cur = e.segments[s];
            var tdx = prev.x - cur.x;
            var tdy = prev.y - cur.y;
            var dist = Math.sqrt(tdx * tdx + tdy * tdy);
            if (dist > e.spacing) {
              var pull = (dist - e.spacing) / dist;
              cur.x += tdx * pull;
              cur.y += tdy * pull;
            }
            /* Perpendicular sine offset — relative to travel direction */
            var wavePhase = t * e.waveFreq + e.phaseOff - s * 0.3;
            var perpAmt = Math.sin(wavePhase) * e.waveAmp * ampMult * Math.min(s / 6, 1);
            var perpX = -Math.sin(e.angle) * perpAmt;
            var perpY = Math.cos(e.angle) * perpAmt;
            cur.x += (prev.x + perpX - cur.x) * 0.06;
            cur.y += (prev.y + perpY - cur.y) * 0.06;
          }
        }
        e.scale = 0.85 + Math.sin(t * 0.4 + e.phaseOff * 3) * 0.15;

        e.age++;
        /* Small chance of getting eaten — vanish suddenly, partner flees */
        if (!e.fleeing && e.age > 60 && Math.random() < 0.0003) {
          if (e.partner && eels.indexOf(e.partner) !== -1) {
            e.partner.fleeing = true;
            e.partner.partner = null;
          }
          eels.splice(i, 1);
          continue;
        }
        /* Only remove once head has crossed the far edge AND tail has followed.
           Generous y-bounds because angled eels travel vertically too. */
        var tail = e.segments[e.segments.length - 1];
        var headGone = (e.direction > 0 && head.x > vw + 50) || (e.direction < 0 && head.x < -50) ||
                       head.y > vh + 400 || head.y < -400;
        var tailGone = tail.x > vw + 200 || tail.x < -200 || tail.y > vh + 500 || tail.y < -500;
        if (headGone && tailGone) {
          eels.splice(i, 1);
          continue;
        }

        var edgeFade = 1;
        if (e.age < 30) edgeFade = e.age / 30;

        /* Draw with scale transform for approach/recede illusion */
        var alpha = e.depthAlpha * edgeFade * e.baseAlpha;
        if (alpha < 0.01) continue;
        /* Desaturate toward pale reddish-white with depth */
        var eelDepthFrac = Math.min(1, Math.max(0, (depth - 200) / 10800));
        var ec = e.color;
        var c = [
          Math.round(ec[0] + (210 - ec[0]) * eelDepthFrac * 0.6),
          Math.round(ec[1] + (190 - ec[1]) * eelDepthFrac * 0.7),
          Math.round(ec[2] + (200 - ec[2]) * eelDepthFrac * 0.5)
        ];
        var sc = e.scale || 1;
        var midX = (head.x + e.segments[e.segments.length - 1].x) * 0.5;
        var midY = (head.y + e.segments[e.segments.length - 1].y) * 0.5;
        creatureCtx.save();
        creatureCtx.translate(midX, midY);
        creatureCtx.scale(sc, sc);
        creatureCtx.translate(-midX, -midY);
        for (var pass = 0; pass < 2; pass++) {
          creatureCtx.beginPath();
          creatureCtx.moveTo(e.segments[0].x, e.segments[0].y);
          for (var s = 1; s < e.segments.length; s++) {
            creatureCtx.lineTo(e.segments[s].x, e.segments[s].y);
          }
          if (pass === 0) {
            creatureCtx.strokeStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (alpha * 0.15).toFixed(3) + ')';
            creatureCtx.lineWidth = e.width * 4 * sc;
          } else {
            creatureCtx.strokeStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (alpha * 0.7).toFixed(3) + ')';
            creatureCtx.lineWidth = e.width * sc;
          }
          creatureCtx.lineCap = 'round';
          creatureCtx.lineJoin = 'round';
          creatureCtx.stroke();
        }
        /* Eye — bright dot at head */
        creatureCtx.beginPath();
        creatureCtx.arc(head.x, head.y, e.width * 0.8 * sc, 0, Math.PI * 2);
        creatureCtx.fillStyle = 'rgba(' + Math.min(c[0] + 60, 255) + ',' + Math.min(c[1] + 60, 255) + ',' + Math.min(c[2] + 60, 255) + ',' + (alpha * 0.9).toFixed(3) + ')';
        creatureCtx.fill();
        creatureCtx.restore();
      }
    }

    /* Darkmaws — nearly invisible anglerfish; only the lure is visible.
       Pale silvery-blue, max 1 on screen, fishhook-shaped stalk. */
    var darkmaws = [];
    var nextDarkmawCheck = 0;
    var darkmawColor = [170, 190, 210];

    function spawnDarkmaw() {
      var dir = Math.random() < 0.5 ? 1 : -1;
      var bw = rand(700, 1200);
      /* Offset spawn so the lure (which extends forward) enters the viewport first */
      var stalk = bw * rand(0.5, 0.9);
      darkmaws.push({
        x: dir > 0 ? -(bw + stalk) : vw + bw + stalk, y: rand(vh * 0.15, vh * 0.85),
        vx: rand(10, 30) * dir / 60,
        bodyW: bw, bodyH: bw * rand(0.5, 0.6),
        alpha: 0, seed: Math.random() * 1000,
        stalkLen: stalk,
        lureAspect: rand(1.4, 1.8),
        lurePhase: Math.random() * 100,
        bobPhase: Math.random() * 100,
        minDepth: 3500, maxDepth: 11000
      });
    }

    function updateDarkmaws(depth, now) {
      var t = now * 0.001;
      var da = depthAlpha(depth, 3500, 11000);

      var daDeep = depthAlpha(depth, 9000, 11000);
      if (now > nextDarkmawCheck) {
        nextDarkmawCheck = now + 5000;
        /* Only 1 on screen at a time — territorial. Spawn from different zones. */
        if (darkmaws.length < 1) {
          if (daDeep > 0 && Math.random() < 0.4) {
            /* Massive deep-abyss variant — bigger and faster */
            var bw2 = rand(1400, 2400);
            var stalk2 = bw2 * rand(0.5, 0.9);
            darkmaws.push({
              x: -(bw2 + stalk2), y: rand(vh * 0.15, vh * 0.85),
              vx: rand(30, 60) / 60,
              bodyW: bw2, bodyH: bw2 * rand(0.5, 0.6),
              alpha: 0, seed: Math.random() * 1000,
              stalkLen: stalk2, lureAspect: rand(1.4, 1.8),
              lurePhase: Math.random() * 100,
              bobPhase: Math.random() * 100,
              minDepth: 9000, maxDepth: 11000
            });
          } else if (da > 0) {
            spawnDarkmaw();
          }
        }
      }

      for (var i = darkmaws.length - 1; i >= 0; i--) {
        var d = darkmaws[i];
        if (da <= 0) { darkmaws.splice(i, 1); continue; }

        d.x += d.vx;
        d.y += Math.sin(t * 0.3 + d.bobPhase) * 0.25;
        d.alpha += (da - d.alpha) * 0.02;

        if (d.x < -d.bodyW * 2 || d.x > vw + d.bodyW * 2) {
          darkmaws.splice(i, 1);
          continue;
        }

        if (d.alpha < 0.01) continue;
        var c = darkmawColor;
        var a = d.alpha;
        var facing = d.vx >= 0 ? 1 : -1;

        /* Partial front outline — just a hint of the jaw, very faint */
        creatureCtx.beginPath();
        var jawStart = -Math.PI * 0.3;
        var jawEnd = Math.PI * 0.3;
        for (var s = 0; s <= 12; s++) {
          var angle = jawStart + (s / 12) * (jawEnd - jawStart);
          var rx = d.bodyW * 0.5 * (1 + noise(angle * 2 + t * 0.4, d.seed) * 0.1);
          var ry = d.bodyH * 0.5 * (1 + noise(angle * 2 + t * 0.5, d.seed + 50) * 0.1);
          var px = d.x + Math.cos(angle) * rx * facing;
          var py = d.y + Math.sin(angle) * ry;
          if (s === 0) creatureCtx.moveTo(px, py);
          else creatureCtx.lineTo(px, py);
        }
        creatureCtx.strokeStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (a * 0.06).toFixed(3) + ')';
        creatureCtx.lineWidth = 1.5;
        creatureCtx.lineCap = 'round';
        creatureCtx.stroke();

        /* Fishhook lure stalk — extends forward then curves downward like a sideways J */
        var stalkBaseX = d.x + facing * d.bodyW * 0.4;
        var stalkBaseY = d.y - d.bodyH * 0.1;
        var lureSway = noise(t * 0.6, d.seed + 100) * 18;
        var lureWobbleY = noise(t * 0.4, d.seed + 120) * 12;
        /* Stalk goes forward-and-slightly-up, then hooks downward */
        var midX = stalkBaseX + facing * d.stalkLen * 0.5 + lureSway * 0.3;
        var midY = stalkBaseY - d.stalkLen * 0.15;
        var lureX = midX + facing * d.stalkLen * 0.1 + lureSway;
        var lureY = midY + d.stalkLen * 0.55 + lureWobbleY;

        creatureCtx.beginPath();
        creatureCtx.moveTo(stalkBaseX, stalkBaseY);
        creatureCtx.bezierCurveTo(
          stalkBaseX + facing * d.stalkLen * 0.3, stalkBaseY - d.stalkLen * 0.2,
          midX, midY,
          lureX, lureY
        );
        creatureCtx.strokeStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (a * 0.12).toFixed(3) + ')';
        creatureCtx.lineWidth = 1;
        creatureCtx.stroke();

        /* Lure blob — bigger, twitchier, actively hunting */
        var lurePulse = (noise(t * 2.5, d.lurePhase) + 1) * 0.5;
        /* Fast jitter — high-frequency noise for twitchy movement */
        var jitterX = noise(t * 4, d.lurePhase + 200) * 8;
        var jitterY = noise(t * 3.5, d.lurePhase + 250) * 6;
        lureX += jitterX;
        lureY += jitterY;
        var lureAlpha = a * (0.4 + lurePulse * 0.6);
        var lureW = 10 + lurePulse * 8;
        var lureH = lureW * d.lureAspect;

        /* Wide soft glow halo */
        creatureCtx.beginPath();
        creatureCtx.ellipse(lureX, lureY, lureW * 4, lureH * 3, 0, 0, Math.PI * 2);
        creatureCtx.fillStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (lureAlpha * 0.06).toFixed(3) + ')';
        creatureCtx.fill();
        /* Medium glow */
        creatureCtx.beginPath();
        creatureCtx.ellipse(lureX, lureY, lureW * 2.2, lureH * 1.8, 0, 0, Math.PI * 2);
        creatureCtx.fillStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (lureAlpha * 0.15).toFixed(3) + ')';
        creatureCtx.fill();
        /* Bright blobby core — noise-deformed ellipse */
        creatureCtx.beginPath();
        var lSteps = 16;
        for (var ls = 0; ls <= lSteps; ls++) {
          var la = (ls / lSteps) * Math.PI * 2;
          var lrx = lureW * (1 + noise(la * 3 + t * 1.5, d.lurePhase) * 0.25);
          var lry = lureH * (1 + noise(la * 3 + t * 1.2, d.lurePhase + 30) * 0.2);
          var lpx = lureX + Math.cos(la) * lrx;
          var lpy = lureY + Math.sin(la) * lry;
          if (ls === 0) creatureCtx.moveTo(lpx, lpy);
          else creatureCtx.lineTo(lpx, lpy);
        }
        creatureCtx.closePath();
        var lureGrad = creatureCtx.createRadialGradient(lureX, lureY - lureH * 0.2, 0, lureX, lureY, lureH);
        lureGrad.addColorStop(0, 'rgba(230, 240, 250,' + lureAlpha.toFixed(3) + ')');
        lureGrad.addColorStop(0.5, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (lureAlpha * 0.7).toFixed(3) + ')');
        lureGrad.addColorStop(1, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (lureAlpha * 0.2).toFixed(3) + ')');
        creatureCtx.fillStyle = lureGrad;
        creatureCtx.fill();
      }
    }

    /* Glowspirals — logarithmic spiral nautilus in small groups */
    var spiralGroups = [];
    var nextSpiralCheck = 0;

    function spawnSpiralGroup() {
      var cx = Math.random() < 0.5 ? -80 : vw + 80;
      var cy = rand(vh * 0.1, vh * 0.9);
      var dir = cx < 0 ? 1 : -1;
      var count = randInt(2, 4);
      var spirals = [];
      /* Distribute around a ring so shells don't overlap */
      var ringRadius = rand(50, 80);
      var angleStart = rand(0, Math.PI * 2);
      /* Shared orientation — all members face the same way (ballast-stabilized) */
      var groupRotation = rand(0, Math.PI * 2);
      var groupRotSpeed = rand(0.05, 0.15) * (Math.random() < 0.5 ? 1 : -1);
      for (var s = 0; s < count; s++) {
        var angle = angleStart + (s / count) * Math.PI * 2 + rand(-0.3, 0.3);
        spirals.push({
          offsetX: Math.cos(angle) * ringRadius + rand(-8, 8),
          offsetY: Math.sin(angle) * ringRadius + rand(-8, 8),
          size: rand(20, 45), bobPhase: rand(0, 10), seed: Math.random() * 1000
        });
      }
      /* Per-group color variation — randomly bluer or greener than base cyan */
      var colorShift = Math.random() < 0.5
        ? [rand(30, 65), rand(200, 234), rand(212, 240)]
        : [rand(65, 100), rand(234, 255), rand(180, 212)];
      spiralGroups.push({
        cx: cx, cy: cy, vx: rand(15, 40) * dir / 60, vy: rand(-8, 8) / 60,
        spirals: spirals, color: colorShift,
        groupRotation: groupRotation, groupRotSpeed: groupRotSpeed,
        minDepth: 200, maxDepth: 1200
      });
    }

    function drawSpiral(ctx, x, y, size, rotation, seed, color, alpha, t) {
      if (alpha < 0.01) return;
      var a = size * 0.08;
      var b = 0.18;
      var c = color;
      /* Subtle alpha variation via noise */
      var glowAlpha = alpha * (0.85 + noise(t * 0.3, seed) * 0.15);

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);

      /* Glow pass */
      ctx.beginPath();
      for (var th = 0.5; th < Math.PI * 4; th += 0.15) {
        var r = a * Math.exp(b * th);
        var px = Math.cos(th) * r;
        var py = Math.sin(th) * r;
        if (th < 0.6) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (glowAlpha * 0.15).toFixed(3) + ')';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.stroke();

      /* Bright core */
      ctx.beginPath();
      for (var th = 0.5; th < Math.PI * 4; th += 0.15) {
        var r = a * Math.exp(b * th);
        var px = Math.cos(th) * r;
        var py = Math.sin(th) * r;
        if (th < 0.6) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (glowAlpha * 0.6).toFixed(3) + ')';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      /* Bright dot at the spiral opening — the creature peering out */
      var openR = a * Math.exp(b * Math.PI * 4);
      var dotX = Math.cos(Math.PI * 4) * openR;
      var dotY = Math.sin(Math.PI * 4) * openR;
      ctx.beginPath();
      ctx.arc(dotX, dotY, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (glowAlpha * 0.9).toFixed(3) + ')';
      ctx.fill();

      ctx.restore();
    }

    function updateGlowspirals(depth, now) {
      var t = now * 0.001;
      var da = depthAlpha(depth, 200, 1200);

      if (now > nextSpiralCheck) {
        nextSpiralCheck = now + 3000;
        while (da > 0 && spiralGroups.length < 3) spawnSpiralGroup();
        if (da > 0 && spiralGroups.length < 5 && Math.random() < 0.4) spawnSpiralGroup();
      }

      for (var i = spiralGroups.length - 1; i >= 0; i--) {
        var g = spiralGroups[i];
        if (da <= 0) { spiralGroups.splice(i, 1); continue; }

        g.cx += g.vx;
        g.cy += g.vy;
        /* Glowspirals sometimes randomly turn around (they're kinda dumb) */
        if (Math.random() < 0.0008) { g.vx = -g.vx; g.vy = -g.vy; }
        /* Small chance one gets gobbled — group flees in the opposite direction */
        if (!g.fleeing && g.spirals.length > 1 && Math.random() < 0.0002) {
          g.spirals.splice(randInt(0, g.spirals.length - 1), 1);
          g.fleeing = true;
          g.vx = -g.vx * 3;
          g.vy = -g.vy * 3;
        }
        if (g.cx < -150 || g.cx > vw + 150) { spiralGroups.splice(i, 1); continue; }

        /* All members share the group's orientation */
        g.groupRotation += g.groupRotSpeed / 60;
        for (var s = 0; s < g.spirals.length; s++) {
          var sp = g.spirals[s];
          var bobY = Math.sin(t * 0.8 + sp.bobPhase) * 6;
          drawSpiral(creatureCtx,
            g.cx + sp.offsetX, g.cy + sp.offsetY + bobY,
            sp.size, g.groupRotation, sp.seed, g.color, da, t);
        }
      }
    }

    /* Thoughtwater — mood-shifting jellyfish clusters */
    var jellyClusters = [];
    var nextJellyCheck = 0;
    var moodColors = [
      [220, 60, 80],
      [80, 100, 255],
      [160, 60, 200]
    ];

    function spawnJellyCluster() {
      var cx = Math.random() < 0.5 ? -100 : vw + 100;
      var cy = rand(vh * 0.1, vh * 0.9);
      var dir = cx < 0 ? 1 : -1;
      var count = randInt(3, 5);
      var jellies = [];
      for (var j = 0; j < count; j++) {
        var tentCount = randInt(3, 5);
        var tents = [];
        for (var ti = 0; ti < tentCount; ti++) {
          tents.push({ segments: randInt(4, 6), seed: Math.random() * 1000 });
        }
        jellies.push({
          offsetX: rand(-60, 60), offsetY: rand(-45, 45),
          bellSize: rand(30, 60), contractPhase: rand(0, 10),
          contractSpeed: rand(0.8, 1.5), tentacles: tents
        });
      }
      jellyClusters.push({
        cx: cx, cy: cy, vx: rand(20, 50) * dir / 60, vy: rand(-5, 5) / 60,
        phaseOffset: Math.random() * 100, transitionDur: rand(8, 15),
        tilt: rand(-0.15, 0.15), tiltSpeed: rand(0.08, 0.2),
        jellies: jellies, minDepth: 800, maxDepth: 4500
      });
    }

    function updateThoughtwater(depth, now) {
      var t = now * 0.001;
      var da = depthAlpha(depth, 800, 4500);

      if (now > nextJellyCheck) {
        nextJellyCheck = now + 5000;
        while (da > 0 && jellyClusters.length < 2) spawnJellyCluster();
        if (da > 0 && jellyClusters.length < 4 && Math.random() < 0.25) spawnJellyCluster();
      }

      for (var i = jellyClusters.length - 1; i >= 0; i--) {
        var cl = jellyClusters[i];
        if (da <= 0) { jellyClusters.splice(i, 1); continue; }

        cl.cx += cl.vx;
        cl.cy += cl.vy;
        /* Small chance to veer slightly — favors current direction */
        if (Math.random() < 0.001) {
          cl.vx += (Math.random() - 0.3) * cl.vx * 0.5;
          cl.vy += (Math.random() - 0.5) * 0.3;
        }
        if (cl.cx < -200 || cl.cx > vw + 200) { jellyClusters.splice(i, 1); continue; }

        /* Synchronized mood color */
        var moodT = (t + cl.phaseOffset) % (moodColors.length * cl.transitionDur);
        var moodIdx = Math.floor(moodT / cl.transitionDur);
        var moodFrac = (moodT % cl.transitionDur) / cl.transitionDur;
        /* Smooth ease for color transitions */
        moodFrac = moodFrac * moodFrac * (3 - 2 * moodFrac);
        var mc = lerpColor(moodColors[moodIdx % 3], moodColors[(moodIdx + 1) % 3], moodFrac);

        /* Per-group tilt — whole cluster sways gently as if caught in a current */
        var groupTilt = cl.tilt + Math.sin(t * cl.tiltSpeed) * 0.08;
        creatureCtx.save();
        creatureCtx.translate(cl.cx, cl.cy);
        creatureCtx.rotate(groupTilt);
        creatureCtx.translate(-cl.cx, -cl.cy);

        for (var j = 0; j < cl.jellies.length; j++) {
          var jf = cl.jellies[j];
          var jx = cl.cx + jf.offsetX + noise(t * 0.2, j * 7) * 15;
          var jy = cl.cy + jf.offsetY + noise(t * 0.25, j * 11) * 10;

          /* Bell contraction */
          var contract = 0.7 + Math.sin(t * jf.contractSpeed + jf.contractPhase) * 0.15;
          var bw = jf.bellSize * 0.5;
          var bh = jf.bellSize * 0.35 * contract;

          /* Bell dome — top half of an ellipse via arc */
          var bellAlpha = da * 0.5;
          creatureCtx.beginPath();
          creatureCtx.ellipse(jx, jy, bw, bh, 0, Math.PI, 0, true);
          creatureCtx.closePath();
          var bellGrad = creatureCtx.createRadialGradient(jx, jy - bh * 0.3, 0, jx, jy, bw);
          bellGrad.addColorStop(0, 'rgba(' + mc[0] + ',' + mc[1] + ',' + mc[2] + ',' + (bellAlpha * 0.6).toFixed(3) + ')');
          bellGrad.addColorStop(0.7, 'rgba(' + mc[0] + ',' + mc[1] + ',' + mc[2] + ',' + (bellAlpha * 0.25).toFixed(3) + ')');
          bellGrad.addColorStop(1, 'rgba(' + mc[0] + ',' + mc[1] + ',' + mc[2] + ',' + (bellAlpha * 0.05).toFixed(3) + ')');
          creatureCtx.fillStyle = bellGrad;
          creatureCtx.fill();

          /* Tentacles — wavy lines trailing below the bell */
          for (var ti = 0; ti < jf.tentacles.length; ti++) {
            var tent = jf.tentacles[ti];
            var tentSpread = (ti / (jf.tentacles.length - 1 || 1) - 0.5) * bw * 1.4;
            creatureCtx.beginPath();
            var tx = jx + tentSpread;
            var ty = jy;
            creatureCtx.moveTo(tx, ty);
            for (var ts = 1; ts <= tent.segments; ts++) {
              var segLen = jf.bellSize * 0.25;
              tx += noise(t * 0.6 + ts * 0.5, tent.seed) * 8;
              ty += segLen;
              creatureCtx.lineTo(tx, ty);
            }
            creatureCtx.strokeStyle = 'rgba(' + mc[0] + ',' + mc[1] + ',' + mc[2] + ',' + (da * 0.25).toFixed(3) + ')';
            creatureCtx.lineWidth = 1.2;
            creatureCtx.lineCap = 'round';
            creatureCtx.stroke();
          }
        }
        creatureCtx.restore();
      }
    }

    /* Algae blooms — overlapping soft radial gradient circles whose positions
       drift via noise, creating organic nebula-like shapes without per-pixel work.
       Each bloom is a cluster of 6–12 "lobes" sharing one color. */
    var blooms = [];
    var nextBloomCheck = 0;

    function spawnBloom(depth) {
      var params;
      if (depth < 1200) {
        params = { size: rand(80, 140), lobes: randInt(6, 9), pal: palettes.shallow,
          min: 200, max: 1200, speed: rand(10, 25), drift: 0.5 };
      } else if (depth < 4500) {
        params = { size: rand(120, 200), lobes: randInt(7, 10), pal: palettes.twilight,
          min: 800, max: 4500, speed: rand(8, 18), drift: 0.35 };
      } else {
        params = { size: rand(150, 260), lobes: randInt(8, 12), pal: palettes.abyss,
          min: 3500, max: 11000, speed: rand(5, 12), drift: 0.25 };
      }
      var dir = Math.random() < 0.5 ? 1 : -1;
      var lobes = [];
      for (var l = 0; l < params.lobes; l++) {
        lobes.push({
          offsetX: rand(-params.size * 0.4, params.size * 0.4),
          offsetY: rand(-params.size * 0.3, params.size * 0.3),
          radius: rand(params.size * 0.3, params.size * 0.7),
          seed: Math.random() * 1000,
          alphaBase: rand(0.03, 0.1)
        });
      }
      blooms.push({
        x: dir > 0 ? -params.size : vw + params.size, y: rand(vh * 0.1, vh * 0.9),
        vx: params.speed * dir / 60, vy: rand(-2, 2) / 60,
        size: params.size, color: pick(params.pal), alpha: 0,
        seed: Math.random() * 1000, drift: params.drift,
        lobes: lobes, minDepth: params.min, maxDepth: params.max
      });
    }

    function updateBlooms(depth, now) {
      var t = now * 0.001;

      if (now > nextBloomCheck) {
        nextBloomCheck = now + 5000;
        if (depth >= 200 && depth <= 11000 && blooms.length < 3) spawnBloom(depth);
        if (depth >= 200 && depth <= 11000 && blooms.length < 5 && Math.random() < 0.3) spawnBloom(depth);
      }

      for (var i = blooms.length - 1; i >= 0; i--) {
        var b = blooms[i];
        var da = depthAlpha(depth, b.minDepth, b.maxDepth);
        if (da <= 0) { blooms.splice(i, 1); continue; }

        b.x += b.vx;
        b.y += b.vy;
        /* Algae drift randomly — they're the most free-floating */
        if (Math.random() < 0.002) {
          b.vx += (Math.random() - 0.4) * b.vx * 0.6;
          b.vy += (Math.random() - 0.5) * 0.5;
        }
        b.alpha += (da - b.alpha) * 0.02;

        if (b.x < -b.size * 3 || b.x > vw + b.size * 3) {
          blooms.splice(i, 1);
          continue;
        }
        if (b.alpha < 0.01) continue;

        /* Desaturate toward white as depth increases — deep algae are pale ghostly patches */
        var depthFrac = Math.min(1, Math.max(0, (depth - 200) / 10800));
        var bc = b.color;
        var c = [
          Math.round(bc[0] + (220 - bc[0]) * depthFrac * 0.7),
          Math.round(bc[1] + (225 - bc[1]) * depthFrac * 0.7),
          Math.round(bc[2] + (230 - bc[2]) * depthFrac * 0.7)
        ];
        /* More transparent overall, fading further with depth */
        var alphaScale = 0.6 - depthFrac * 0.3;

        for (var l = 0; l < b.lobes.length; l++) {
          var lb = b.lobes[l];
          /* Strong noise warping on positions — algae are free-floating */
          var lx = b.x + lb.offsetX + noise(t * b.drift, lb.seed) * b.size * 0.5;
          var ly = b.y + lb.offsetY + noise(t * b.drift * 0.8, lb.seed + 50) * b.size * 0.4;
          var lr = lb.radius * (1 + noise(t * 0.3, lb.seed + 100) * 0.35);
          var la = lb.alphaBase * b.alpha * alphaScale;

          var grad = creatureCtx.createRadialGradient(lx, ly, 0, lx, ly, lr);
          grad.addColorStop(0, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (la * 0.7).toFixed(3) + ')');
          grad.addColorStop(0.35, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (la * 0.3).toFixed(3) + ')');
          grad.addColorStop(1, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0)');
          creatureCtx.beginPath();
          creatureCtx.arc(lx, ly, lr, 0, Math.PI * 2);
          creatureCtx.fillStyle = grad;
          creatureCtx.fill();
        }
      }
    }

    /* Creature canvas rAF loop */
    var lastCreatureMask = '';
    function creatureLoop(now) {
      if (document.hidden) { creatureAnimId = requestAnimationFrame(creatureLoop); return; }
      var depth = window.scrollY / 10;
      creatureCtx.clearRect(0, 0, vw, vh);

      /* Surface mask — same as bubbles/shimmerfish */
      var surfaceOnScreen = vh * 0.66 - window.scrollY;
      var fadeStart = Math.max(0, surfaceOnScreen).toFixed(0);
      var fadeEnd = (Math.max(0, surfaceOnScreen) + 100).toFixed(0);
      var mask = 'linear-gradient(to bottom, transparent ' + fadeStart + 'px, black ' + fadeEnd + 'px)';
      if (mask !== lastCreatureMask) {
        creatureCanvas.style.maskImage = mask;
        creatureCanvas.style.webkitMaskImage = mask;
        lastCreatureMask = mask;
      }

      creatureCtx.save(); updateEels(depth, now); creatureCtx.restore();
      creatureCtx.save(); updateDarkmaws(depth, now); creatureCtx.restore();
      creatureCtx.save(); updateGlowspirals(depth, now); creatureCtx.restore();
      creatureCtx.save(); updateThoughtwater(depth, now); creatureCtx.restore();
      creatureCtx.save(); updateBlooms(depth, now); creatureCtx.restore();

      creatureAnimId = requestAnimationFrame(creatureLoop);
    }
    creatureAnimId = requestAnimationFrame(creatureLoop);
  }

  /* Phase 7: Abyss unknown — underwater distortion on the "??????" heading.
     Splits into per-character spans, then rAF applies sine wave flow (R→L)
     plus layered-sine noise for organic scale/skew jitter. */
  var abyssUnknownAnimId = null;
  if (isDive && !reducedMotion) {
    /* attr_list can't parse headings made entirely of punctuation */
    var unknownH3 = null;
    var h3s = document.querySelectorAll('h3');
    for (var hi = 0; hi < h3s.length; hi++) {
      if (/^\?{3,}/.test(h3s[hi].textContent.replace(/¶/g, '').trim())) { unknownH3 = h3s[hi]; break; }
    }
    if (unknownH3) {
      unknownH3.style.userSelect = 'none';
      var text = unknownH3.textContent.replace(/¶/g, '').trim();
      var permalink = unknownH3.querySelector('.headerlink');
      unknownH3.textContent = '';
      var charSpans = [];
      var dotEls = [];
      for (var ci = 0; ci < text.length; ci++) {
        var cs = document.createElement('span');
        cs.textContent = text[ci];
        cs.style.cssText = 'display:inline-block;position:relative;text-align:center;';
        unknownH3.appendChild(cs);
        charSpans.push(cs);
        /* Tiny glow dot aligned with the period of each ? glyph */
        var dot = document.createElement('span');
        dot.style.cssText = 'position:absolute;bottom:27.5%;left:25.3%;width:4.5px;height:4.5px;border-radius:50%;transform:translateX(-50%);opacity:0;pointer-events:none;';
        cs.appendChild(dot);
        dotEls.push(dot);
      }
      if (permalink) unknownH3.appendChild(permalink);

      /* Dot pulse state — 2–3 rapid sweeps in a random direction, long pause */
      var dotPulse = { active: false, start: 0, dir: 1, sweeps: 0 };
      var nextDotPulse = performance.now() + rand(2000, 5000);

      var unknownFrame = 0;
      function animateUnknown(now) {
        unknownFrame++;
        var t = now * 0.001;
        var updateGlow = unknownFrame % 3 === 0;
        for (var i = 0; i < charSpans.length; i++) {
          var phase = i * 0.8;
          var wave = Math.sin(t * 1.2 - phase) * 6;
          var sx = 1 + noise(t * 0.7, i) * 0.15;
          var sy = 1 + noise(t * 0.6, i + 10) * 0.2;
          var skewX = noise(t * 0.5, i + 20) * 8;
          var skewY = noise(t * 0.4, i + 30) * 4;
          var dx = noise(t * 0.8, i + 40) * 3;

          charSpans[i].style.transform =
            'translateY(' + wave.toFixed(1) + 'px) ' +
            'translateX(' + dx.toFixed(1) + 'px) ' +
            'scale(' + sx.toFixed(3) + ',' + sy.toFixed(3) + ') ' +
            'skew(' + skewX.toFixed(1) + 'deg,' + skewY.toFixed(1) + 'deg)';

          if (updateGlow) {
            var glowStr = (noise(t * 0.35, i + 50) + 1) * 0.5;
            var r1 = (15 + glowStr * 25).toFixed(0);
            var a1 = (0.08 + glowStr * 0.12).toFixed(2);
            var r2 = (40 + glowStr * 40).toFixed(0);
            var a2 = (0.03 + glowStr * 0.06).toFixed(2);
            charSpans[i].style.textShadow =
              '0 0 ' + r1 + 'px rgba(120,35,170,' + a1 + '),' +
              '0 0 ' + r2 + 'px rgba(90,20,130,' + a2 + ')';
          }
        }

        /* Bioluminescent dot pulse — sweeps across the ? dots in sequence */
        if (!dotPulse.active && now > nextDotPulse) {
          dotPulse.active = true;
          dotPulse.start = now;
          dotPulse.dir = Math.random() < 0.5 ? 1 : -1;
          dotPulse.sweeps = randInt(2, 3);
        }
        if (dotPulse.active) {
          var sweepDur = 450;
          var sweepGap = 350;
          var elapsed = now - dotPulse.start;
          var totalDur = dotPulse.sweeps * (sweepDur + sweepGap);
          if (elapsed > totalDur) {
            dotPulse.active = false;
            nextDotPulse = now + rand(3000, 9000);
            for (var di = 0; di < dotEls.length; di++) {
              dotEls[di].style.opacity = '0';
              dotEls[di].style.boxShadow = 'none';
            }
          } else {
            var sweepT = elapsed % (sweepDur + sweepGap);
            for (var di = 0; di < dotEls.length; di++) {
              var orderIdx = dotPulse.dir > 0 ? di : (dotEls.length - 1 - di);
              var stagger = orderIdx * (sweepDur / dotEls.length);
              var dotT = sweepT - stagger;
              var glow = (dotT > 0 && dotT < 280) ? Math.sin(dotT / 280 * Math.PI) : 0;
              if (glow > 0.01) {
                var ga = (glow * 0.8).toFixed(2);
                dotEls[di].style.opacity = '1';
                dotEls[di].style.background = 'rgba(180,100,230,' + ga + ')';
                dotEls[di].style.boxShadow =
                  '0 0 ' + (8 + glow * 12).toFixed(0) + 'px rgba(150,60,200,' + ga + '),' +
                  '0 0 ' + (14 + glow * 22).toFixed(0) + 'px rgba(120,35,170,' + (glow * 0.4).toFixed(2) + ')';
              } else {
                dotEls[di].style.opacity = '0';
                dotEls[di].style.background = 'none';
                dotEls[di].style.boxShadow = 'none';
              }
            }
          }
        }

        abyssUnknownAnimId = requestAnimationFrame(animateUnknown);
      }
      abyssUnknownAnimId = requestAnimationFrame(animateUnknown);
    }
  }

  var abyss = document.querySelector('.ocean-abyss');
  var abyssParent = null;
  var abyssNext = null;

  /* Pressure squeeze — 2% narrowing per h3 (ecology only) */
  var squeezedEls = [];
  if (!isDive) {
    (function () {
      var contentInner = document.querySelector('.md-content__inner');
      if (!contentInner) return;
      var children = contentInner.querySelectorAll(':scope > :not(.ocean-surface):not(.ocean-abyss):not(.osminok-ocean)');
      var h3Count = 0;
      children.forEach(function (el) {
        if (el.tagName === 'H3') h3Count++;
        if (h3Count > 0) {
          el.style.marginInline = (h3Count * 0.5) + '%';
          squeezedEls.push(el);
        }
      });
    })();
  }

  /* Predation system — any DOM creature can be eaten. Works on both
     dive and ecology pages. Wrappers (chains/clusters/siphons) get
     sequential wink-out; individual elements vanish instantly. */
  var eatTimers = [];
  var eatCheckInterval = null;
  if (!reducedMotion && layers.length > 0) {
    var nextEatTimes = [];
    for (var ei = 0; ei < layers.length; ei++) {
      nextEatTimes.push(Date.now() + rand(3000, 10000));
    }

    /* Fade out an element — cancel its animations first for the "lights out" look */
    function eatElement(el, duration) {
      var anims = el.getAnimations ? el.getAnimations() : [];
      for (var a = 0; a < anims.length; a++) anims[a].cancel();
      el.style.transition = 'opacity ' + duration + 'ms ease-out';
      el.style.opacity = '0';
    }

    /* Respawn a fresh replacement creature after a delay */
    function scheduleRespawn(layerEl, pal, deadEl, delay) {
      var tid = setTimeout(function() {
        if (deadEl.parentNode) deadEl.parentNode.removeChild(deadEl);
        /* Spawn one fresh replacement — particles are the simplest and most
           versatile stand-in regardless of original creature type */
        var dot = document.createElement('div');
        var size = rand(2, 8);
        var alpha = rand(0.3, 0.8);
        var blur = rand(2, 10);
        var color = pick(pal);
        dot.style.cssText =
          'position:absolute;border-radius:50%;' +
          'left:' + rand(0, vw).toFixed(0) + 'px;' +
          'top:' + rand(0, vh).toFixed(0) + 'px;' +
          'width:' + size.toFixed(1) + 'px;height:' + size.toFixed(1) + 'px;' +
          'background:' + rgba(color, alpha) + ';' +
          'box-shadow:0 0 ' + blur.toFixed(0) + 'px ' + rgba(color, alpha * 0.7) + ';' +
          'opacity:0;transition:opacity 2s ease-in;';
        layerEl.appendChild(dot);
        /* Fade in */
        requestAnimationFrame(function() { dot.style.opacity = '1'; });
        var dr = rand(20, 50);
        dot.animate([
          { translate: '0 0' },
          { translate: rand(-dr, dr).toFixed(0) + 'px ' + rand(-dr, dr).toFixed(0) + 'px' },
          { translate: rand(-dr, dr).toFixed(0) + 'px ' + rand(-dr, dr).toFixed(0) + 'px' },
          { translate: '0 0' }
        ], { duration: rand(10000, 22000), iterations: Infinity, easing: 'ease-in-out' });
        dot.animate([
          { opacity: alpha * 0.3, scale: '0.8' },
          { opacity: Math.min(alpha * 1.5, 0.9), scale: String(1 + rand(0.1, 0.4)) },
          { opacity: alpha * 0.3, scale: '0.8' }
        ], { duration: rand(2000, 5000), iterations: Infinity, easing: 'ease-in-out' });
      }, delay);
      eatTimers.push(tid);
    }

    function checkEat() {
      var now = Date.now();
      for (var li = 0; li < layers.length; li++) {
        if (now < nextEatTimes[li]) continue;
        /* Only eat from visible layers */
        if (layers[li].hidden) continue;
        nextEatTimes[li] = now + rand(3000, 10000);

        var container = layers[li].el;
        var children = container.children;
        if (children.length < 2) continue;
        var target = children[randInt(0, children.length - 1)];

        var isWrapper = target.children.length > 0;
        if (isWrapper) {
          /* Sequential wink-out — each child fades with a stagger */
          var dots = target.children;
          var stagger = rand(30, 60);
          for (var d = 0; d < dots.length; d++) {
            (function(el, delay) {
              var tid = setTimeout(function() { eatElement(el, 50); }, delay);
              eatTimers.push(tid);
            })(dots[d], d * stagger);
          }
          scheduleRespawn(container, layers[li].pal, target, rand(10000, 30000) + dots.length * stagger);
        } else {
          eatElement(target, 80);
          scheduleRespawn(container, layers[li].pal, target, rand(10000, 30000));
        }
      }
    }

    eatCheckInterval = setInterval(checkEat, 1000);
  }

  var abyssFadeZone = 300;
  var abyssWaveOverhang = 150;
  var header = document.querySelector('.md-header');

  /* Phase 4: TOC depth meter — cached once per page lifecycle (instant-nav
     reinits everything via document$.subscribe, so no stale refs). */
  var lastTocDepth = -999;
  var tocEntries = [];
  if (isDive) {
    var rawTocLinks = document.querySelectorAll('.md-nav--secondary .md-nav__link');
    for (var ti = 0; ti < rawTocLinks.length; ti++) {
      var tocHref = rawTocLinks[ti].getAttribute('href');
      if (!tocHref || tocHref.charAt(0) !== '#') continue;
      var tocSlug = tocHref.slice(1);
      var tocD = parseInt(tocSlug);
      if (isNaN(tocD)) { if (tocSlug === '_1') tocD = 12500; else continue; }
      tocEntries.push({ el: rawTocLinks[ti], depth: tocD });
    }
  }

  /* Dive Audio — scroll-reactive spatial audio with depth-mapped crossfades.
     All state lives inside the closure returned by initDiveAudio(). */
  var diveAudio = null;
  var audioBasePath = '../../assets/audio/';

  /* Double-buffer loop track — two <audio> elements crossfade at loop points
     so there's no click/gap at the seam */
  function createLoopTrack(ctx, src, outputNode) {
    var XFADE = 2.0;
    var elA = new Audio();
    var elB = new Audio();
    elA.preload = 'auto';
    elB.preload = 'auto';
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

    var ready = false;
    var pendingPlay = false;
    elA.addEventListener('canplaythrough', function() {
      ready = true;
      if (pendingPlay) { pendingPlay = false; doPlay(); }
    }, { once: true });

    function doPlay() {
      var el = active === 'A' ? elA : elB;
      var g = active === 'A' ? gainA : gainB;
      g.gain.value = 1;
      (active === 'A' ? gainB : gainA).gain.value = 0;
      crossfading = false;
      el.play().catch(function() {});
    }

    return {
      load: function() {
        elA.src = src;
        elB.src = src;
        elA.load();
        elB.load();
      },
      isReady: function() { return ready; },
      play: function() {
        if (!ready) { pendingPlay = true; return; }
        doPlay();
      },
      pause: function() {
        elA.pause();
        elB.pause();
        elA.currentTime = 0;
        elB.currentTime = 0;
        crossfading = false;
        active = 'A';
        gainA.gain.value = 1;
        gainB.gain.value = 0;
      },
      cleanup: function() {
        if (xfadeTimer) clearTimeout(xfadeTimer);
        elA.removeEventListener('timeupdate', onTimeUpdate);
        elB.removeEventListener('timeupdate', onTimeUpdate);
        elA.pause(); elB.pause();
        elA.src = ''; elB.src = '';
      }
    };
  }

  function initDiveAudio(initialVolume) {
    var ctx = new (window.AudioContext || window.webkitAudioContext)();
    ctx.resume();

    var masterGain = ctx.createGain();
    masterGain.gain.value = initialVolume;
    masterGain.connect(ctx.destination);

    /* Storm track — has a low-pass filter for the underwater transition */
    var stormFilter = ctx.createBiquadFilter();
    stormFilter.type = 'lowpass';
    stormFilter.frequency.value = 22050;
    var stormGain = ctx.createGain();
    stormGain.gain.value = 0;
    stormFilter.connect(stormGain);
    stormGain.connect(masterGain);
    var storm = createLoopTrack(ctx, audioBasePath + 'surface/OsminokMegastorm.ogg', stormFilter);

    /* Depth ambient tracks */
    var nearSurfGain = ctx.createGain();
    nearSurfGain.gain.value = 0;
    nearSurfGain.connect(masterGain);
    var nearSurf = createLoopTrack(ctx, audioBasePath + 'below/1-NearSurface.ogg', nearSurfGain);

    var lurkingGain = ctx.createGain();
    lurkingGain.gain.value = 0;
    lurkingGain.connect(masterGain);
    var lurking = createLoopTrack(ctx, audioBasePath + 'below/2-ThingsLurking.ogg', lurkingGain);

    var depthsGain = ctx.createGain();
    depthsGain.gain.value = 0;
    depthsGain.connect(masterGain);
    var depths = createLoopTrack(ctx, audioBasePath + 'below/3-DepthsBelow.ogg', depthsGain);

    var abyssGain = ctx.createGain();
    abyssGain.gain.value = 0;
    abyssGain.connect(masterGain);
    var abyss = createLoopTrack(ctx, audioBasePath + 'below/4-Abyss.ogg', abyssGain);

    /* Track play/pause state to avoid redundant calls */
    var tracks = [
      { loop: storm, gain: stormGain, playing: false },
      { loop: nearSurf, gain: nearSurfGain, playing: false },
      { loop: lurking, gain: lurkingGain, playing: false },
      { loop: depths, gain: depthsGain, playing: false },
      { loop: abyss, gain: abyssGain, playing: false }
    ];

    /* One-shot buffer storage */
    var buffers = {};
    var loading = {};

    function loadBuffer(key, url) {
      if (buffers[key] || loading[key]) return;
      loading[key] = true;
      fetch(url)
        .then(function(r) { return r.arrayBuffer(); })
        .then(function(buf) { return ctx.decodeAudioData(buf); })
        .then(function(decoded) { buffers[key] = decoded; })
        .catch(function() {})
        .then(function() { delete loading[key]; });
    }

    function playBuffer(key, dest) {
      var buf = buffers[key];
      if (!buf) return;
      var src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(dest || masterGain);
      src.start();
      return src;
    }

    /* One-shot state */
    var hasPlunged = false;
    var lastPlungeIdx = -1;
    var lastSurfacingIdx = -1;
    var lastSurfaceTime = 0;
    var lastPassbyDepth = 0;
    var nextPassbyDist = 500 + Math.random() * 1000;
    var lastAmbientPassby = Date.now();
    var nextAmbientInterval = rand(8000, 20000);
    var prevDepth = 0;

    /* Lazy load flags */
    var lurkingLoaded = false;
    var depthsLoaded = false;
    var abyssLoaded = false;

    /* Passby pool config — add new rows to extend.
       Overlapping depth ranges get weighted random selection. */
    var passbyPools = [
      { id: 'A', count: 18, min: 200,  max: 4000  },
      { id: 'B', count: 14, min: 3000, max: 7000  },
      { id: 'C', count: 13, min: 6000, max: 10000 },
      { id: 'D', count: 12, min: 9000, max: 11000 },
      { id: 'E', count: 7,  min: 200,  max: 11000 }
    ];

    function loadEarly() {
      nearSurf.load();
      passbyPools.forEach(function(p) {
        for (var i = 1; i <= p.count; i++)
          loadBuffer('Passby' + p.id + i, audioBasePath + 'passby/Passby' + p.id + i + '.ogg');
      });
    }

    /* Depth-to-gain mapping + one-shot triggers */
    /* Direct .value assignment avoids bloating the AudioParam automation
       timeline — at 60fps the per-frame changes are tiny enough to be click-free */
    var filterSlammed = false;

    function updateDepth(depth) {
      /* Storm: full at surface, gone by 500m */
      var stormVol = depth < 500 ? 1 - depth / 500 : 0;
      stormGain.gain.value = stormVol;

      /* Low-pass: wide open at surface, then gradual taper after the plunge slam.
         The slam itself fires in the plunge trigger below (hard cut to 400Hz). */
      if (!filterSlammed) {
        stormFilter.frequency.value = 22050;
      } else if (depth < 500) {
        stormFilter.frequency.value = 400 - (400 - 200) * (depth / 500);
      } else {
        stormFilter.frequency.value = 200;
      }

      /* NearSurface: fade in 100–400m, peak 400–800m, fade out 800–1200m */
      var nsVol;
      if (depth < 100) nsVol = 0;
      else if (depth < 400) nsVol = (depth - 100) / 300;
      else if (depth <= 800) nsVol = 1;
      else if (depth < 1200) nsVol = 1 - (depth - 800) / 400;
      else nsVol = 0;
      nearSurfGain.gain.value = nsVol;

      /* ThingsLurking: fade in 800–1200m, peak 1500–3000m, fade out 3000–4500m */
      var lkVol;
      if (depth < 800) lkVol = 0;
      else if (depth < 1200) lkVol = (depth - 800) / 400;
      else if (depth <= 3000) lkVol = 1;
      else if (depth < 4500) lkVol = 1 - (depth - 3000) / 1500;
      else lkVol = 0;
      lurkingGain.gain.value = lkVol;

      /* DepthsBelow: fade in 3500–5000m, peak 5000–10000m, fade out 10000–12000m */
      var dpVol;
      if (depth < 3500) dpVol = 0;
      else if (depth < 5000) dpVol = (depth - 3500) / 1500;
      else if (depth <= 10000) dpVol = 1;
      else if (depth < 12000) dpVol = 1 - (depth - 10000) / 2000;
      else dpVol = 0;
      depthsGain.gain.value = dpVol;

      /* Abyss: fade in 10000–12000m, peak 12000m+ */
      var abVol;
      if (depth < 10000) abVol = 0;
      else if (depth < 12000) abVol = (depth - 10000) / 2000;
      else abVol = 1;
      abyssGain.gain.value = abVol;

      /* Play/pause optimization — start/stop tracks based on audibility.
         Skip play() if the track hasn't buffered yet (isReady check). */
      var vols = [stormVol, nsVol, lkVol, dpVol, abVol];
      for (var i = 0; i < tracks.length; i++) {
        var audible = vols[i] > 0.01;
        if (audible && !tracks[i].playing && tracks[i].loop.isReady()) {
          tracks[i].loop.play();
          tracks[i].playing = true;
        } else if (!audible && tracks[i].playing) {
          tracks[i].loop.pause();
          tracks[i].playing = false;
        }
      }

      /* Lazy load deeper tracks well before their fade-in zones */
      if (!lurkingLoaded && depth > 100) {
        lurkingLoaded = true;
        lurking.load();
      }
      if (!depthsLoaded && depth > 1500) {
        depthsLoaded = true;
        depths.load();
      }
      if (!abyssLoaded && depth > 6000) {
        abyssLoaded = true;
        abyss.load();
      }

      /* Plunge one-shot — triggers at 50% of the surface zone for earlier impact */
      var surfacePx = vh * 0.5;
      if (!hasPlunged && window.scrollY > surfacePx) {
        hasPlunged = true;
        filterSlammed = true;
        /* SLAM the low-pass filter — hard cut, then updateDepth tapers gradually */
        stormFilter.frequency.cancelScheduledValues(ctx.currentTime);
        stormFilter.frequency.setTargetAtTime(400, ctx.currentTime, 0.05);
        var idx;
        do { idx = randInt(1, 4); } while (idx === lastPlungeIdx);
        lastPlungeIdx = idx;
        playBuffer('plunge' + idx, masterGain);
      }

      /* Surfacing one-shot — random 1-of-2, no repeat, with cooldown */
      if (hasPlunged && window.scrollY <= surfacePx && Date.now() - lastSurfaceTime > 3000) {
        lastSurfaceTime = Date.now();
        hasPlunged = false;
        filterSlammed = false;
        stormFilter.frequency.cancelScheduledValues(ctx.currentTime);
        var sIdx;
        do { sIdx = randInt(1, 2); } while (sIdx === lastSurfacingIdx);
        lastSurfacingIdx = sIdx;
        playBuffer('surfacing' + sIdx, masterGain);
      }

      /* Passby creatures — plays on both scroll directions + ambient random triggers */
      function tryPassby() {
        if (depth < 200) return;
        var eligible = [];
        var totalWeight = 0;
        for (var pi = 0; pi < passbyPools.length; pi++) {
          var pp = passbyPools[pi];
          if (pp.count < 1 || depth < pp.min || depth > pp.max) continue;
          var mid = (pp.min + pp.max) / 2;
          var half = (pp.max - pp.min) / 2;
          var w = 0.1 + 0.9 * (1 - Math.abs(depth - mid) / half);
          eligible.push({ pool: pp, weight: w });
          totalWeight += w;
        }
        if (eligible.length === 0) return;
        var roll = Math.random() * totalWeight;
        var picked = eligible[0].pool;
        for (var ei = 0; ei < eligible.length; ei++) {
          roll -= eligible[ei].weight;
          if (roll <= 0) { picked = eligible[ei].pool; break; }
        }
        var key = 'Passby' + picked.id + randInt(1, picked.count);
        var buf = buffers[key];
        if (!buf) return;
        var src = ctx.createBufferSource();
        src.buffer = buf;
        src.detune.value = (Math.random() - 0.5) * 600;
        var passbyVol = ctx.createGain();
        passbyVol.gain.value = 0.5 + Math.random() * 0.5;
        var pan = ctx.createStereoPanner();
        pan.pan.value = -0.8 + Math.random() * 1.6;
        src.connect(passbyVol);
        passbyVol.connect(pan);
        pan.connect(masterGain);
        src.start();
        src.onended = function() { passbyVol.disconnect(); pan.disconnect(); };
      }

      /* Scroll-triggered passbys — either direction */
      var depthDelta = Math.abs(depth - lastPassbyDepth);
      if (depthDelta >= nextPassbyDist) {
        lastPassbyDepth = depth;
        nextPassbyDist = 500 + Math.random() * 1000;
        tryPassby();
      }

      /* Ambient passbys — the ocean is always alive, even when you stop scrolling */
      if (Date.now() - lastAmbientPassby > nextAmbientInterval) {
        lastAmbientPassby = Date.now();
        nextAmbientInterval = rand(8000, 20000);
        tryPassby();
      }

      prevDepth = depth;
    }

    return {
      updateDepth: updateDepth,
      loadEarly: loadEarly,
      _buffers: buffers,
      _ctx: ctx,
      startStorm: function() {
        storm.load();
        storm.play();
        /* Gentle 2s ramp — the track opens with a huge thunderclap */
        stormGain.gain.setTargetAtTime(1, ctx.currentTime, 0.7);
        tracks[0].playing = true;
      },
      setVolume: function(v) {
        masterGain.gain.setTargetAtTime(v, ctx.currentTime, 0.1);
      },
      cleanup: function() {
        tracks.forEach(function(t) { t.loop.cleanup(); });
        if (ctx.state !== 'closed') ctx.close();
      }
    };
  }

  /* Overlay wiring — "Dive!" button starts audio, dismisses overlay */
  if (isDive) {
    var overlay = document.getElementById('dive-overlay');
    var diveBtn = document.getElementById('dive-btn');
    var volSlider = document.getElementById('dive-volume');

    if (overlay && diveBtn && volSlider) {
      /* Read saved volume */
      try { var savedVol = localStorage.getItem('mommyship-dive-volume'); }
      catch (e) { var savedVol = null; }
      if (savedVol !== null) volSlider.value = savedVol;

      /* Pre-fetch raw audio bytes while user reads overlay (Batch 1).
         Decoded later on the real AudioContext after "Dive!" click. */
      var prefetched = {};
      var prefetchFiles = {
        plunge1: 'surface/Plunge1.ogg', plunge2: 'surface/Plunge2.ogg',
        plunge3: 'surface/Plunge3.ogg', plunge4: 'surface/Plunge4.ogg',
        surfacing1: 'surface/Surfacing1.ogg',
        surfacing2: 'surface/Surfacing2.ogg'
      };
      Object.keys(prefetchFiles).forEach(function(key) {
        fetch(audioBasePath + prefetchFiles[key])
          .then(function(r) { return r.arrayBuffer(); })
          .then(function(buf) { prefetched[key] = buf; })
          .catch(function() {});
      });

      diveBtn.addEventListener('click', function() {
        var vol = parseInt(volSlider.value, 10) / 100;
        try { localStorage.setItem('mommyship-dive-volume', volSlider.value); }
        catch (e) { /* private browsing */ }

        diveAudio = initDiveAudio(vol);

        /* Decode pre-fetched buffers on the live AudioContext.
           Fallback re-fetch for any that haven't arrived yet. */
        Object.keys(prefetchFiles).forEach(function(key) {
          var raw = prefetched[key];
          if (raw) {
            delete prefetched[key];
            diveAudio._ctx.decodeAudioData(raw)
              .then(function(decoded) { diveAudio._buffers[key] = decoded; })
              .catch(function() {});
          } else if (!diveAudio._buffers[key]) {
            /* Pre-fetch still in flight or failed — re-fetch via the engine's loader */
            fetch(audioBasePath + prefetchFiles[key])
              .then(function(r) { return r.arrayBuffer(); })
              .then(function(buf) { return diveAudio._ctx.decodeAudioData(buf); })
              .then(function(decoded) { if (diveAudio) diveAudio._buffers[key] = decoded; })
              .catch(function() {});
          }
        });

        diveAudio.startStorm();
        diveAudio.loadEarly();

        /* Dismiss overlay */
        overlay.classList.add('dive-overlay--hidden');
        overlay.addEventListener('transitionend', function() {
          overlay.style.display = 'none';
        }, { once: true });

        /* Migrate volume slider to header */
        var headerInner = document.querySelector('.md-header__inner');
        if (headerInner && subBtn) {
          var headerVol = document.createElement('div');
          headerVol.className = 'dive-volume-header';
          var hSlider = document.createElement('input');
          hSlider.type = 'range';
          hSlider.min = '0';
          hSlider.max = '100';
          hSlider.value = volSlider.value;
          hSlider.setAttribute('aria-label', 'Dive volume');
          headerVol.appendChild(hSlider);
          /* Place after submarine button so all controls group together */
          subBtn.after(headerVol);

          hSlider.addEventListener('input', function() {
            var v = parseInt(hSlider.value, 10) / 100;
            if (diveAudio) diveAudio.setVolume(v);
            try { localStorage.setItem('mommyship-dive-volume', hSlider.value); }
            catch (e) { /* private browsing */ }
          });
        }
      });
    }

  }

  function onScroll() {
    var scrollMax = document.documentElement.scrollHeight - vh;
    var pct = scrollMax > 0 ? window.scrollY / scrollMax : 0;

    if (isDive) {
      /* Phase 5: Depth-mapped bio opacity + parallax */
      var depth = window.scrollY / 10;
      for (var i = 0; i < layers.length; i++) {
        var L = layers[i];
        var opacity;
        if (depth < L.fadeIn[0]) opacity = 0;
        else if (depth < L.fadeIn[1]) opacity = (depth - L.fadeIn[0]) / (L.fadeIn[1] - L.fadeIn[0]);
        else if (depth <= L.peak[1]) opacity = 1;
        else if (depth < L.fadeOut[1]) opacity = 1 - (depth - L.fadeOut[0]) / (L.fadeOut[1] - L.fadeOut[0]);
        else opacity = 0;
        /* Pull invisible layers out of the render tree so the compositor
           skips their ~550 child animations entirely */
        var visible = opacity > 0;
        if (!visible && !L.hidden) {
          L.el.style.display = 'none';
          L.hidden = true;
        } else if (visible && L.hidden) {
          L.el.style.display = '';
          L.hidden = false;
        }
        if (!L.hidden) {
          L.el.style.opacity = Math.min(Math.max(opacity, 0), 1).toFixed(2);
          L.el.style.transform = 'translateY(' + (-window.scrollY * L.rate).toFixed(0) + 'px)';
        }
      }

      /* Marine snow parallax + clip below ocean surface.
         Offset uses sine curve so it oscillates gently rather than
         accumulating off-screen at deep depths. */
      if (snowContainer) {
        var snowOff = Math.sin(window.scrollY * 0.0004) * vh * 0.15;
        snowContainer.style.transform = 'translateY(' + snowOff.toFixed(0) + 'px)';
        var surfacePx = vh * 0.66;
        var clipTop = Math.max(0, surfacePx - window.scrollY);
        snowContainer.style.clipPath = clipTop > 0 ? 'inset(' + clipTop.toFixed(0) + 'px 0 0 0)' : 'none';
        /* Fade in 100–500m, full 500–10,000m, fade out 10,000–12,000m */
        var snowFade;
        if (depth < 100) snowFade = 0;
        else if (depth < 500) snowFade = (depth - 100) / 400;
        else if (depth < 10000) snowFade = 1;
        else snowFade = Math.max(0.03, 1 - (depth - 10000) / 2000);
        snowContainer.style.opacity = snowFade.toFixed(2);
      }

      if (Math.abs(depth - lastTocDepth) > 25) {
        lastTocDepth = depth;
        for (var i = 0; i < tocEntries.length; i++) {
          var distance = Math.abs(depth - tocEntries[i].depth);
          var t = Math.min(distance / 2000, 1);
          tocEntries[i].el.style.setProperty('opacity', (1 - t * t).toFixed(2), 'important');
        }
      }

      if (diveAudio) diveAudio.updateDepth(depth);

      /* Submarine + volume fade toward ghost by shimmerfish scatter depth */
      if (subBtn) {
        var subAlpha = depth < 3000 ? 1 - (depth / 3000) * 0.85 : 0.15;
        subBtn.style.opacity = subAlpha.toFixed(2);
      }
      var hVol = document.querySelector('.dive-volume-header');
      if (hVol) {
        var volAlpha = depth < 3000 ? 0.3 - (depth / 3000) * 0.15 : 0.15;
        hVol.style.opacity = volAlpha.toFixed(2);
      }
    } else {
      /* Ecology: scroll-percentage bio zones */
      for (var i = 0; i < layers.length; i++) {
        var L = layers[i];
        var visible = pct >= L.start;
        if (!visible && !L.hidden) {
          L.el.style.display = 'none';
          L.hidden = true;
        } else if (visible && L.hidden) {
          L.el.style.display = '';
          L.hidden = false;
        }
        if (L.hidden) continue;
        var progress = (pct - L.start) / (1 - L.start);
        L.el.style.opacity = Math.min(progress * 2.2, 1).toFixed(2);
        var layerScroll = Math.max(window.scrollY - (L.start * scrollMax), 0);
        L.el.style.transform = 'translateY(' + (-layerScroll * L.rate).toFixed(0) + 'px)';
      }
    }

    /* Header fades to transparent — dive: by ~250m, ecology: by 80% scroll */
    if (header) {
      var headerAlpha;
      if (isDive) {
        headerAlpha = Math.max(1 - window.scrollY / 1000, 0) * 0.92;
      } else {
        headerAlpha = pct < 0.8 ? (1 - pct / 0.8) * 0.92 : 0;
      }
      header.style.setProperty('background', 'rgba(18,25,38,' + headerAlpha.toFixed(2) + ')', 'important');
      header.style.setProperty('border-bottom-color', 'rgba(40,55,75,' + (headerAlpha * 0.27).toFixed(2) + ')', 'important');
      var blurVal = headerAlpha > 0.01 ? 'blur(' + (headerAlpha * 10).toFixed(0) + 'px)' : 'none';
      header.style.setProperty('backdrop-filter', blurVal, 'important');
      header.style.setProperty('-webkit-backdrop-filter', blurVal, 'important');
    }

    /* Brightness ramp + abyss mask (ecology only — dive layers handle themselves) */
    if (!isDive) {
      var boost = 1;
      if (pct > 0.4) boost = 1 + ((pct - 0.4) / 0.6);
      var filt = boost > 1.01 ? 'brightness(' + boost.toFixed(2) + ')' : '';
      for (var i = 0; i < layers.length; i++) layers[i].el.style.filter = filt;
    }

    if (abyss) {
      var rect = abyss.getBoundingClientRect();
      var waveTop = rect.top - abyssWaveOverhang;
      if (waveTop < vh) {
        var fadeEnd = Math.max(waveTop, 0);
        var fadeStart = Math.max(fadeEnd - abyssFadeZone, 0);
        var grad = 'linear-gradient(to bottom, white ' + fadeStart + 'px, rgba(255,255,255,0) ' + fadeEnd + 'px)';
        for (var i = 0; i < layers.length; i++) {
          layers[i].el.style.maskImage = grad;
          layers[i].el.style.webkitMaskImage = grad;
        }
      } else {
        for (var i = 0; i < layers.length; i++) {
          layers[i].el.style.maskImage = '';
          layers[i].el.style.webkitMaskImage = '';
        }
      }
    }
  }

  /* rAF-throttled scroll */
  var scrollTicking = false;
  function onScrollThrottled() {
    if (!scrollTicking) {
      scrollTicking = true;
      requestAnimationFrame(function () { onScroll(); scrollTicking = false; });
    }
  }
  window.addEventListener('scroll', onScrollThrottled, { passive: true });
  onScroll();

  /* Cleanup — Material's instant navigation triggers this on page change */
  osminokCleanup = function () {
    for (var i = 0; i < layers.length; i++) layers[i].el.remove();
    window.removeEventListener('scroll', onScrollThrottled);
    squeezedEls.forEach(function (el) { el.style.marginInline = ''; });
    if (header) {
      header.style.removeProperty('background');
      header.style.removeProperty('border-bottom-color');
      header.style.removeProperty('backdrop-filter');
      header.style.removeProperty('-webkit-backdrop-filter');
    }
    if (starsAnimId) cancelAnimationFrame(starsAnimId);
    for (var ft = 0; ft < flashTimers.length; ft++) clearTimeout(flashTimers[ft]);
    if (stormAnimId) cancelAnimationFrame(stormAnimId);
    if (stormResizeHandler) window.removeEventListener('resize', stormResizeHandler);
    if (diveResizeHandler) window.removeEventListener('resize', diveResizeHandler);
    if (rainCanvas) rainCanvas.remove();
    if (subBtn) subBtn.remove();
    if (paletteForm) paletteForm.style.display = '';
    if (snowContainer) snowContainer.remove();
    if (bubbleAnimId) cancelAnimationFrame(bubbleAnimId);
    if (bubbleCanvas) bubbleCanvas.remove();
    if (fishAnimId) cancelAnimationFrame(fishAnimId);
    if (fishMouseHandler) document.removeEventListener('mousemove', fishMouseHandler);
    if (fishCanvas) fishCanvas.remove();
    if (abyssUnknownAnimId) cancelAnimationFrame(abyssUnknownAnimId);
    if (creatureAnimId) cancelAnimationFrame(creatureAnimId);
    if (creatureCanvas) creatureCanvas.remove();
    if (eatCheckInterval) clearInterval(eatCheckInterval);
    for (var et = 0; et < eatTimers.length; et++) clearTimeout(eatTimers[et]);
    /* Restore Back to Top button text */
    if (topBtn) {
      topBtn.childNodes.forEach(function (n) {
        if (n.nodeType === 3 && n.textContent.trim()) n.textContent = '\n  Back to top\n';
      });
    }
    for (var i = 0; i < tocEntries.length; i++) tocEntries[i].el.style.removeProperty('opacity');
    if (diveAudio) { diveAudio.cleanup(); diveAudio = null; }
    var diveOverlay = document.getElementById('dive-overlay');
    if (diveOverlay) diveOverlay.remove();
    var headerVol = document.querySelector('.dive-volume-header');
    if (headerVol) headerVol.remove();
  };

  /* Creature generation functions */
  function populate(container, pal, cfg) {
    genParticles(container, pal, cfg.particles);
    genChains(container, pal, cfg.chains);
    genClusters(container, pal, cfg.clusters);
    genDashes(container, pal, cfg.dashes);
    if (cfg.bells) genBells(container, pal, cfg.bells);
    if (cfg.lures) genLures(container, pal, cfg.lures);
    if (cfg.siphons) genSiphonophores(container, pal, cfg.siphons);
  }

  function genParticles(container, pal, p) {
    var count = randInt(p.count[0], p.count[1]);
    for (var i = 0; i < count; i++) {
      var dot = document.createElement('div');
      var size = rand(p.size[0], p.size[1]);
      var alpha = rand(p.alpha[0], p.alpha[1]);
      var blur = rand(p.blur[0], p.blur[1]);
      var color = pick(pal);
      dot.style.cssText =
        'position:absolute;border-radius:50%;' +
        'left:' + rand(0, vw).toFixed(0) + 'px;' +
        'top:' + rand(0, vh).toFixed(0) + 'px;' +
        'width:' + size.toFixed(1) + 'px;height:' + size.toFixed(1) + 'px;' +
        'background:' + rgba(color, alpha) + ';' +
        'box-shadow:0 0 ' + blur.toFixed(0) + 'px ' + rgba(color, alpha * 0.7) + ';';
      container.appendChild(dot);
      var dr = rand(p.drift[0], p.drift[1]);
      var driftDur = p.fast ? rand(6000, 14000) : rand(12000, 28000);
      dot.animate([
        { translate: '0 0' },
        { translate: rand(-dr, dr).toFixed(0) + 'px ' + rand(-dr, dr).toFixed(0) + 'px' },
        { translate: rand(-dr, dr).toFixed(0) + 'px ' + rand(-dr, dr).toFixed(0) + 'px' },
        { translate: rand(-dr, dr).toFixed(0) + 'px ' + rand(-dr, dr).toFixed(0) + 'px' },
        { translate: '0 0' }
      ], { duration: driftDur, iterations: Infinity, easing: 'ease-in-out' });
      var pulseDur = p.fast ? rand(1500, 3500) : rand(2500, 5500);
      dot.animate([
        { opacity: alpha * 0.4, scale: '0.8' },
        { opacity: Math.min(alpha * 1.5, 0.9), scale: String(1 + rand(0.1, 0.4)) },
        { opacity: alpha * 0.4, scale: '0.8' }
      ], { duration: pulseDur, iterations: Infinity, delay: rand(0, 3000), easing: 'ease-in-out' });
    }
  }

  function genChains(container, pal, c) {
    var chainCount = randInt(c.count[0], c.count[1]);
    for (var j = 0; j < chainCount; j++) {
      var chain = document.createElement('div');
      chain.style.cssText = 'position:absolute;left:0;top:0;';
      container.appendChild(chain);
      var startX = rand(-100, vw + 100);
      var startY = rand(50, vh - 50);
      var dotCount = randInt(c.dots[0], c.dots[1]);
      var wavelength = rand(c.wl[0], c.wl[1]);
      var amplitude = rand(c.amp[0], c.amp[1]);
      var angle = rand(0, Math.PI * 2);
      var spacing = rand(c.spacing[0], c.spacing[1]);
      var color = pick(pal);
      var chainDur = c.fast ? rand(8000, 16000) : rand(16000, 30000);
      chain.animate([
        { translate: '0 0', rotate: '0deg' },
        { translate: rand(20, 60).toFixed(0) + 'px ' + rand(-40, 30).toFixed(0) + 'px', rotate: rand(-4, 4).toFixed(1) + 'deg' },
        { translate: rand(-50, 30).toFixed(0) + 'px ' + rand(20, 50).toFixed(0) + 'px', rotate: rand(-4, 4).toFixed(1) + 'deg' },
        { translate: rand(-30, 40).toFixed(0) + 'px ' + rand(-30, 20).toFixed(0) + 'px', rotate: rand(-3, 3).toFixed(1) + 'deg' },
        { translate: '0 0', rotate: '0deg' }
      ], { duration: chainDur, iterations: Infinity, easing: 'ease-in-out' });
      var cosA = Math.cos(angle);
      var sinA = Math.sin(angle);
      var perpX = -sinA;
      var perpY = cosA;
      for (var d = 0; d < dotCount; d++) {
        var dot = document.createElement('div');
        var t = d * spacing;
        var sineOff = Math.sin(t / wavelength * Math.PI * 2) * amplitude;
        var lx = startX + t * cosA - sineOff * sinA;
        var ly = startY + t * sinA + sineOff * cosA;
        var ds = rand(c.dotSize[0], c.dotSize[1]);
        var da = rand(c.dotAlpha[0], c.dotAlpha[1]);
        dot.style.cssText =
          'position:absolute;border-radius:50%;' +
          'left:' + lx.toFixed(0) + 'px;top:' + ly.toFixed(0) + 'px;' +
          'width:' + ds.toFixed(1) + 'px;height:' + ds.toFixed(1) + 'px;' +
          'background:' + rgba(color, da) + ';' +
          'box-shadow:0 0 ' + rand(2, 5).toFixed(0) + 'px ' + rgba(color, da * 0.6) + ';';
        chain.appendChild(dot);
        var ua = rand(c.undul[0], c.undul[1]);
        var undulDur = c.fast ? rand(1500, 3000) : rand(2500, 4500);
        dot.animate([
          { translate: '0 0' },
          { translate: (perpX * ua).toFixed(1) + 'px ' + (perpY * ua).toFixed(1) + 'px' },
          { translate: '0 0' },
          { translate: (perpX * -ua).toFixed(1) + 'px ' + (perpY * -ua).toFixed(1) + 'px' },
          { translate: '0 0' }
        ], { duration: undulDur, iterations: Infinity, delay: d * rand(150, 300), easing: 'ease-in-out' });
        var chainPulseDur = c.fast ? rand(1200, 2500) : rand(2000, 3500);
        dot.animate([
          { opacity: da * 0.3, scale: '0.7' },
          { opacity: Math.min(da * 1.6, 0.95), scale: '1.3' },
          { opacity: da * 0.3, scale: '0.7' }
        ], { duration: chainPulseDur, iterations: Infinity, delay: d * rand(100, 250), easing: 'ease-in-out' });
      }
    }
  }

  function genClusters(container, pal, cl) {
    var count = randInt(cl.count[0], cl.count[1]);
    for (var j = 0; j < count; j++) {
      var cluster = document.createElement('div');
      cluster.style.cssText = 'position:absolute;left:0;top:0;';
      container.appendChild(cluster);
      var cx = rand(50, vw - 50);
      var cy = rand(50, vh - 50);
      var dots = randInt(cl.dots[0], cl.dots[1]);
      var color = pick(pal);
      cluster.animate([
        { translate: '0 0' },
        { translate: rand(-35, 35).toFixed(0) + 'px ' + rand(-35, 35).toFixed(0) + 'px' },
        { translate: rand(-30, 30).toFixed(0) + 'px ' + rand(-30, 30).toFixed(0) + 'px' },
        { translate: '0 0' }
      ], { duration: rand(10000, 22000), iterations: Infinity, easing: 'ease-in-out' });
      for (var d = 0; d < dots; d++) {
        var dot = document.createElement('div');
        var r = rand(0, cl.radius);
        var th = rand(0, Math.PI * 2);
        var size = rand(cl.size[0], cl.size[1]);
        var alpha = rand(cl.alpha[0], cl.alpha[1]);
        var blur = rand(cl.blur[0], cl.blur[1]);
        dot.style.cssText =
          'position:absolute;border-radius:50%;' +
          'left:' + (cx + Math.cos(th) * r).toFixed(0) + 'px;' +
          'top:' + (cy + Math.sin(th) * r).toFixed(0) + 'px;' +
          'width:' + size.toFixed(1) + 'px;height:' + size.toFixed(1) + 'px;' +
          'background:' + rgba(color, alpha) + ';' +
          'box-shadow:0 0 ' + blur.toFixed(0) + 'px ' + (blur * 0.4).toFixed(0) + 'px ' + rgba(color, alpha * 0.5) + ';';
        cluster.appendChild(dot);
        dot.animate([
          { opacity: alpha * 0.3, scale: '0.7' },
          { opacity: Math.min(alpha * 1.8, 1), scale: String(1 + rand(0.2, 0.6)) },
          { opacity: alpha * 0.3, scale: '0.7' }
        ], { duration: rand(2000, 5000), iterations: Infinity, delay: rand(0, 3000), easing: 'ease-in-out' });
      }
    }
  }

  function genDashes(container, pal, da) {
    var count = randInt(da.count[0], da.count[1]);
    for (var i = 0; i < count; i++) {
      var dash = document.createElement('div');
      var alpha = rand(da.alpha[0], da.alpha[1]);
      var color = pick(pal);
      dash.style.cssText =
        'position:absolute;border-radius:1px;' +
        'left:' + rand(0, vw).toFixed(0) + 'px;' +
        'top:' + rand(0, vh).toFixed(0) + 'px;' +
        'width:' + rand(da.w[0], da.w[1]).toFixed(0) + 'px;' +
        'height:' + rand(da.h[0], da.h[1]).toFixed(1) + 'px;' +
        'background:' + rgba(color, alpha) + ';' +
        'rotate:' + rand(0, 360).toFixed(0) + 'deg;';
      container.appendChild(dash);
      var dr = rand(20, 50);
      dash.animate([
        { translate: '0 0' },
        { translate: rand(-dr, dr).toFixed(0) + 'px ' + rand(-dr, dr).toFixed(0) + 'px' },
        { translate: rand(-dr, dr).toFixed(0) + 'px ' + rand(-dr, dr).toFixed(0) + 'px' },
        { translate: '0 0' }
      ], { duration: rand(14000, 26000), iterations: Infinity, easing: 'ease-in-out' });
      dash.animate([
        { opacity: alpha * 0.3 },
        { opacity: Math.min(alpha * 2, 0.7) },
        { opacity: alpha * 0.3 }
      ], { duration: rand(3000, 7000), iterations: Infinity, delay: rand(0, 4000), easing: 'ease-in-out' });
    }
  }

  function genBells(container, pal, b) {
    var count = randInt(b.count[0], b.count[1]);
    for (var i = 0; i < count; i++) {
      var bell = document.createElement('div');
      var size = rand(b.size[0], b.size[1]);
      var alpha = rand(b.alpha[0], b.alpha[1]);
      var color = pick(pal);
      bell.style.cssText =
        'position:absolute;border-radius:50%;' +
        'left:' + rand(50, vw - 50).toFixed(0) + 'px;' +
        'top:' + rand(50, vh - 50).toFixed(0) + 'px;' +
        'width:' + size.toFixed(0) + 'px;height:' + size.toFixed(0) + 'px;' +
        'background:radial-gradient(circle,' +
          rgba(color, alpha) + ' 0%,' +
          rgba(color, alpha * 0.3) + ' 50%,' +
          'transparent 70%);';
      container.appendChild(bell);
      var dr = rand(30, 70);
      bell.animate([
        { translate: '0 0', rotate: '0deg' },
        { translate: rand(-dr, dr).toFixed(0) + 'px ' + rand(-dr, 10).toFixed(0) + 'px', rotate: rand(-5, 5).toFixed(1) + 'deg' },
        { translate: rand(-dr, dr).toFixed(0) + 'px ' + rand(-dr, 10).toFixed(0) + 'px', rotate: rand(-5, 5).toFixed(1) + 'deg' },
        { translate: '0 0', rotate: '0deg' }
      ], { duration: rand(18000, 35000), iterations: Infinity, easing: 'ease-in-out' });
      bell.animate([
        { scale: '1 1', opacity: alpha * 0.4 },
        { scale: '1.1 0.65', opacity: Math.min(alpha * 3, 0.4) },
        { scale: '1 1', opacity: alpha * 0.4 }
      ], { duration: rand(3000, 5500), iterations: Infinity, delay: rand(0, 3000), easing: 'ease-in-out' });
    }
  }

  function genLures(container, pal, l) {
    var count = randInt(l.count[0], l.count[1]);
    for (var i = 0; i < count; i++) {
      var lure = document.createElement('div');
      var size = rand(l.size[0], l.size[1]);
      var glow = rand(l.glow[0], l.glow[1]);
      var alpha = rand(l.alpha[0], l.alpha[1]);
      var color = pick(pal);
      lure.style.cssText =
        'position:absolute;border-radius:50%;' +
        'left:' + rand(80, vw - 80).toFixed(0) + 'px;' +
        'top:' + rand(80, vh - 80).toFixed(0) + 'px;' +
        'width:' + size.toFixed(0) + 'px;height:' + size.toFixed(0) + 'px;' +
        'background:' + rgba(color, alpha) + ';' +
        'box-shadow:0 0 ' + glow.toFixed(0) + 'px ' + (glow * 0.5).toFixed(0) + 'px ' + rgba(color, alpha * 0.6) + ';';
      container.appendChild(lure);
      var swing = rand(15, 40);
      lure.animate([
        { translate: '0 0' },
        { translate: rand(-swing, swing).toFixed(0) + 'px ' + rand(5, 20).toFixed(0) + 'px' },
        { translate: rand(-swing, swing).toFixed(0) + 'px ' + rand(-10, 10).toFixed(0) + 'px' },
        { translate: '0 0' }
      ], { duration: rand(8000, 16000), iterations: Infinity, easing: 'ease-in-out' });
      lure.animate([
        { opacity: alpha * 0.1, scale: '0.8' },
        { opacity: alpha * 0.15, scale: '0.85' },
        { opacity: Math.min(alpha * 1.2, 0.95), scale: '1.5' },
        { opacity: alpha * 0.1, scale: '0.8' }
      ], { duration: rand(4000, 8000), iterations: Infinity, delay: rand(0, 5000), easing: 'ease-in-out' });
    }
  }

  function genSiphonophores(container, pal, s) {
    var count = randInt(s.count[0], s.count[1]);
    for (var j = 0; j < count; j++) {
      var siphon = document.createElement('div');
      siphon.style.cssText = 'position:absolute;left:0;top:0;';
      container.appendChild(siphon);
      var startX = rand(-200, vw + 200);
      var startY = rand(20, vh - 20);
      var dotCount = randInt(s.dots[0], s.dots[1]);
      var wavelength = rand(s.wl[0], s.wl[1]);
      var amplitude = rand(s.amp[0], s.amp[1]);
      var angle = rand(0, Math.PI * 2);
      var spacing = rand(s.spacing[0], s.spacing[1]);
      var color1 = pick(pal);
      var color2 = pick(pal);
      siphon.animate([
        { translate: '0 0', rotate: '0deg' },
        { translate: rand(30, 80).toFixed(0) + 'px ' + rand(-50, 40).toFixed(0) + 'px', rotate: rand(-3, 3).toFixed(1) + 'deg' },
        { translate: rand(-60, 40).toFixed(0) + 'px ' + rand(30, 70).toFixed(0) + 'px', rotate: rand(-3, 3).toFixed(1) + 'deg' },
        { translate: rand(-40, 50).toFixed(0) + 'px ' + rand(-40, 20).toFixed(0) + 'px', rotate: rand(-2, 2).toFixed(1) + 'deg' },
        { translate: '0 0', rotate: '0deg' }
      ], { duration: rand(25000, 45000), iterations: Infinity, easing: 'ease-in-out' });
      var cosA = Math.cos(angle);
      var sinA = Math.sin(angle);
      var perpX = -sinA;
      var perpY = cosA;
      for (var d = 0; d < dotCount; d++) {
        var dot = document.createElement('div');
        var t = d * spacing;
        var sineOff = Math.sin(t / wavelength * Math.PI * 2) * amplitude;
        var lx = startX + t * cosA - sineOff * sinA;
        var ly = startY + t * sinA + sineOff * cosA;
        var bodyPos = d / dotCount;
        var sizeMult = 1 + Math.sin(bodyPos * Math.PI) * 0.8;
        var ds = rand(s.dotSize[0], s.dotSize[1]) * sizeMult;
        var da = rand(s.dotAlpha[0], s.dotAlpha[1]);
        var color = d % 3 === 0 ? color2 : color1;
        var gw = Math.max(ds * 1.5, 4);
        dot.style.cssText =
          'position:absolute;border-radius:50%;' +
          'left:' + lx.toFixed(0) + 'px;top:' + ly.toFixed(0) + 'px;' +
          'width:' + ds.toFixed(1) + 'px;height:' + ds.toFixed(1) + 'px;' +
          'background:' + rgba(color, da) + ';' +
          'box-shadow:0 0 ' + gw.toFixed(0) + 'px ' + rgba(color, da * 0.5) + ';';
        siphon.appendChild(dot);
        var ua = rand(15, 35);
        dot.animate([
          { translate: '0 0' },
          { translate: (perpX * ua).toFixed(1) + 'px ' + (perpY * ua).toFixed(1) + 'px' },
          { translate: '0 0' },
          { translate: (perpX * -ua).toFixed(1) + 'px ' + (perpY * -ua).toFixed(1) + 'px' },
          { translate: '0 0' }
        ], { duration: rand(4000, 7000), iterations: Infinity, delay: d * rand(80, 180), easing: 'ease-in-out' });
        dot.animate([
          { opacity: da * 0.15, scale: '0.6' },
          { opacity: Math.min(da * 2, 0.95), scale: String(1.2 + rand(0.1, 0.5)) },
          { opacity: da * 0.15, scale: '0.6' }
        ], { duration: rand(2500, 4000), iterations: Infinity, delay: d * rand(60, 140), easing: 'ease-in-out' });
      }
    }
  }
});
