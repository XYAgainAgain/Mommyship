/* Osminok Ocean — bioluminescence, scroll effects, megastorm, and dive mode.
   Ecology pages: three bio layers with scroll-percentage zones.
   Dive page: depth-mapped zones, rain/alt-lightning, TOC depth meter, marine snow. */

var osminokCleanup = null;

document$.subscribe(function () {
  if (osminokCleanup) osminokCleanup();

  var ocean = document.querySelector('.osminok-ocean');
  if (!ocean) { osminokCleanup = null; return; }

  var isDive = !!document.querySelector('.osminok-dive');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
    subBtn.title = isDive ? 'Surface' : 'Dive';
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

  /* Dive: restyle "Back to top" as "Surface" with smooth scroll */
  var topBtn = null;
  if (isDive) {
    topBtn = document.querySelector('.md-top');
    if (topBtn) {
      /* Replace "Back to top" text node, keep the SVG arrow */
      topBtn.childNodes.forEach(function (n) {
        if (n.nodeType === 3 && n.textContent.trim()) n.textContent = '\n  Surface\n';
      });
      topBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, true);
    }
  }

  /* Bio layers — ecology uses scroll-percentage zones, dive uses depth-mapped */
  function makeBioLayer() {
    var el = document.createElement('div');
    el.className = 'osminok-bio';
    document.body.appendChild(el);
    return el;
  }

  var layers = [];
  if (isDive) {
    /* Phase 5: Depth-mapped zones with meter-based fade bands */
    layers = [
      { el: makeBioLayer(), pal: palettes.shallow, dive: true,
        fadeIn: [250, 350], peak: [400, 800], fadeOut: [800, 1200], rate: 0.06 },
      { el: makeBioLayer(), pal: palettes.twilight, dive: true,
        fadeIn: [800, 1200], peak: [1500, 3000], fadeOut: [3000, 4500], rate: 0.025 },
      { el: makeBioLayer(), pal: palettes.abyss, dive: true,
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
      { el: makeBioLayer(), start: 0.01, rate: 0.08, pal: palettes.shallow },
      { el: makeBioLayer(), start: 0.10, rate: 0.04, pal: palettes.twilight },
      { el: makeBioLayer(), start: 0.50, rate: 0.015, pal: palettes.abyss }
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
          raindrops.splice(i, 1);
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
          splashes.splice(i, 1);
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
        if (bolt.segments >= bolt.maxSegments) altBolts.splice(i, 1);
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
        delay: rand(0, 10000),
        iterations: Infinity,
        easing: 'linear'
      });

      snowContainer.appendChild(flake);
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
          el.style.marginInline = (h3Count * 1) + '%';
          squeezedEls.push(el);
        }
      });
    })();
  }

  var abyssFadeZone = 300;
  var abyssWaveOverhang = 150;
  var header = document.querySelector('.md-header');

  /* Phase 4: TOC depth meter — re-queries DOM each update to survive
     Material's instant-nav DOM manipulation. Only runs every 25m. */
  var lastTocDepth = -999;

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
        L.el.style.opacity = Math.min(Math.max(opacity, 0), 1).toFixed(2);
        L.el.style.transform = 'translateY(' + (-window.scrollY * L.rate).toFixed(0) + 'px)';
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
      }

      /* Phase 4: TOC depth meter — re-queries DOM each update to avoid stale refs.
         Quadratic falloff: bright at current depth, transparent at ±2000m. */
      if (Math.abs(depth - lastTocDepth) > 25) {
        lastTocDepth = depth;
        var tocLinks = document.querySelectorAll('.md-nav--secondary .md-nav__link');
        for (var i = 0; i < tocLinks.length; i++) {
          var href = tocLinks[i].getAttribute('href');
          if (!href || href.charAt(0) !== '#') continue;
          var slug = href.slice(1);
          var d = parseInt(slug);
          if (isNaN(d)) { if (slug === '_1') d = 12500; else continue; }
          var distance = Math.abs(depth - d);
          var t = Math.min(distance / 2000, 1);
          var op = 1 - t * t;
          tocLinks[i].style.setProperty('opacity', op.toFixed(2), 'important');
        }
      }
    } else {
      /* Ecology: scroll-percentage bio zones */
      for (var i = 0; i < layers.length; i++) {
        var L = layers[i];
        if (pct < L.start) {
          L.el.style.opacity = '0';
        } else {
          var progress = (pct - L.start) / (1 - L.start);
          L.el.style.opacity = Math.min(progress * 2.2, 1).toFixed(2);
        }
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
    if (stormAnimId) cancelAnimationFrame(stormAnimId);
    if (stormResizeHandler) window.removeEventListener('resize', stormResizeHandler);
    if (rainCanvas) rainCanvas.remove();
    if (subBtn) subBtn.remove();
    if (paletteForm) paletteForm.style.display = '';
    if (snowContainer) snowContainer.remove();
    /* Restore Back to Top button text */
    if (topBtn) {
      topBtn.childNodes.forEach(function (n) {
        if (n.nodeType === 3 && n.textContent.trim()) n.textContent = '\n  Back to top\n';
      });
    }
    /* Reset TOC link opacities */
    var tocCleanup = document.querySelectorAll('.md-nav--secondary .md-nav__link');
    for (var i = 0; i < tocCleanup.length; i++) tocCleanup[i].style.removeProperty('opacity');
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
