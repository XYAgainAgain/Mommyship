// Mark the current TOC section — the first non-passed link is always the current one
function updateCurrentTocItem() {
  var toc = document.querySelector(".md-sidebar--secondary .md-nav");
  if (!toc) return;

  toc.querySelectorAll(".md-nav__link--current").forEach(function(el) {
    el.classList.remove("md-nav__link--current");
  });

  var links = toc.querySelectorAll(".md-nav__link");
  var foundPassed = false;
  for (var i = 0; i < links.length; i++) {
    if (links[i].classList.contains("md-nav__link--passed")) {
      foundPassed = true;
    } else if (foundPassed) {
      links[i].classList.add("md-nav__link--current");
      break;
    }
  }
}

var TEXT_SCALE_KEY = "mommyship-text-scale";
var TEXT_SCALE_DEFAULT = 1.0;
var TEXT_SCALE_MIN = 0.7;
var TEXT_SCALE_MAX = 1.5;
var TEXT_SCALE_STEP = 0.1;

function applyTextScale(scale) {
  document.documentElement.style.setProperty("--md-text-scale", scale);
}

function getTextScale() {
  try {
    var stored = localStorage.getItem(TEXT_SCALE_KEY);
    if (stored !== null) {
      var val = parseFloat(stored);
      if (!isNaN(val) && val >= TEXT_SCALE_MIN && val <= TEXT_SCALE_MAX) return val;
    }
  } catch (e) { /* localStorage unavailable */ }
  return TEXT_SCALE_DEFAULT;
}

/* Preserves scroll position across the font-size reflow */
function setTextScale(scale) {
  var header = document.querySelector(".md-header");
  var headerH = header ? header.offsetHeight : 0;
  var anchor = document.elementFromPoint(window.innerWidth / 2, headerH + 10);
  var oldTop = anchor ? anchor.getBoundingClientRect().top : 0;

  applyTextScale(scale);
  try { localStorage.setItem(TEXT_SCALE_KEY, scale.toString()); }
  catch (e) { /* localStorage unavailable */ }

  if (anchor) {
    window.scrollBy(0, anchor.getBoundingClientRect().top - oldTop);
  }
}

function adjustTextScale(action) {
  var current = getTextScale();
  if (action === "decrease") {
    current = Math.max(TEXT_SCALE_MIN, Math.round((current - TEXT_SCALE_STEP) * 10) / 10);
  } else if (action === "increase") {
    current = Math.min(TEXT_SCALE_MAX, Math.round((current + TEXT_SCALE_STEP) * 10) / 10);
  } else if (action === "reset") {
    current = TEXT_SCALE_DEFAULT;
  }
  setTextScale(current);
}

/* Bind once — header persists across instant navigation */
var textSizeRockerBound = false;

function bindTextSizeRocker() {
  if (textSizeRockerBound) return;
  var rocker = document.querySelector(".text-size-rocker");
  if (!rocker) return;
  textSizeRockerBound = true;

  rocker.addEventListener("click", function(e) {
    var btn = e.target.closest("[data-text-size]");
    if (!btn) return;
    adjustTextScale(btn.getAttribute("data-text-size"));
  });
}

var smoothScroll = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function getScrollBehavior() {
  return smoothScroll ? "smooth" : "auto";
}

function navigateSection(direction) {
  var header = document.querySelector(".md-header");
  var headerH = header ? header.offsetHeight : 0;
  var content = document.querySelector(".md-content");
  if (!content) { followPageLink(direction); return; }

  var headings = content.querySelectorAll("h1, h2, h3");
  if (headings.length === 0) { followPageLink(direction); return; }

  var scrollTop = window.scrollY + headerH;
  var maxScroll = document.documentElement.scrollHeight - window.innerHeight;

  if (direction === 1) {
    if (window.scrollY >= maxScroll - 10) {
      followPageLink(direction);
      return;
    }
    for (var i = 0; i < headings.length; i++) {
      var pos = headings[i].getBoundingClientRect().top + window.scrollY;
      if (pos > scrollTop + 10) {
        window.scrollTo({ top: pos - headerH, behavior: getScrollBehavior() });
        return;
      }
    }
    followPageLink(direction);
  } else {
    if (window.scrollY <= 10) {
      followPageLink(direction);
      return;
    }
    for (var i = headings.length - 1; i >= 0; i--) {
      var pos = headings[i].getBoundingClientRect().top + window.scrollY;
      if (pos < scrollTop - 30) {
        window.scrollTo({ top: pos - headerH, behavior: getScrollBehavior() });
        return;
      }
    }
    followPageLink(direction);
  }
}

function followPageLink(direction) {
  var rel = direction === 1 ? "next" : "prev";
  var link = document.querySelector('link[rel="' + rel + '"]');
  if (!link) return;
  var href = link.getAttribute("href");
  /* Going backward: land on last heading instead of top */
  if (direction === -1) href += "#__nav-bottom";
  window.location.href = href;
}

/* On page load, handle #__nav-bottom by scrolling to the last heading */
function handleNavBottom() {
  if (window.location.hash !== "#__nav-bottom") return;
  history.replaceState(null, "", window.location.pathname);
  var content = document.querySelector(".md-content");
  if (!content) return;
  var headings = content.querySelectorAll("h1, h2, h3");
  if (headings.length === 0) return;
  var last = headings[headings.length - 1];
  var header = document.querySelector(".md-header");
  var headerH = header ? header.offsetHeight : 0;
  var pos = last.getBoundingClientRect().top + window.scrollY;
  window.scrollTo({ top: pos - headerH, behavior: "auto" });
}

var keyboardShortcutsBound = false;

function bindKeyboardShortcuts() {
  if (keyboardShortcutsBound) return;
  keyboardShortcutsBound = true;

  document.addEventListener("keydown", function(e) {
    if (e.target.matches("input, textarea, select, [contenteditable]")) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    switch (e.key) {
      case "-":
        adjustTextScale("decrease");
        break;
      case "+":
      case "=":
        adjustTextScale("increase");
        break;
      case "0":
        adjustTextScale("reset");
        break;
      case "ArrowRight":
        e.preventDefault();
        navigateSection(1);
        break;
      case "ArrowLeft":
        e.preventDefault();
        navigateSection(-1);
        break;
    }
  });
}

/* Wrap [+] and [-] in <abbr> tooltips — abbr extension can't handle non-word chars */
var BRACKET_SKIP = { CODE: 1, PRE: 1, SCRIPT: 1, STYLE: 1, ABBR: 1 };
var BRACKET_RE = /\[\+\]|\[-\]/g;
var BRACKET_TITLES = {
  "[+]": "Advantage \u2014 roll twice, take the better result",
  "[-]": "Disadvantage \u2014 roll twice, take the worse result"
};

function wrapBracketNotation() {
  var content = document.querySelector(".md-typeset");
  if (!content) return;

  var walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT, {
    acceptNode: function(node) {
      if (BRACKET_SKIP[node.parentElement.tagName]) return NodeFilter.FILTER_REJECT;
      return BRACKET_RE.test(node.data) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  });

  var nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);

  nodes.forEach(function(textNode) {
    var frag = document.createDocumentFragment();
    var text = textNode.data;
    var lastIdx = 0;
    var match;
    BRACKET_RE.lastIndex = 0;
    while ((match = BRACKET_RE.exec(text)) !== null) {
      if (match.index > lastIdx) frag.appendChild(document.createTextNode(text.slice(lastIdx, match.index)));
      var abbr = document.createElement("abbr");
      abbr.setAttribute("data-title", BRACKET_TITLES[match[0]]);
      abbr.textContent = match[0];
      frag.appendChild(abbr);
      lastIdx = BRACKET_RE.lastIndex;
    }
    if (lastIdx < text.length) frag.appendChild(document.createTextNode(text.slice(lastIdx)));
    textNode.parentNode.replaceChild(frag, textNode);
  });
}

/* Replace Material's below-cursor tooltips with our CSS above-cursor tooltips */
function unifyAbbrTooltips() {
  document.querySelectorAll(".md-typeset abbr").forEach(function(abbr) {
    if (abbr.hasAttribute("data-title")) return;

    /* Material places an md-tooltip2 sibling after each <abbr> it processes */
    var sibling = abbr.nextElementSibling;
    if (sibling && sibling.classList.contains("md-tooltip2")) {
      var inner = sibling.querySelector(".md-tooltip2__inner");
      if (inner) abbr.setAttribute("data-title", inner.textContent.trim());
      sibling.remove();
    }

    /* Catch any <abbr> that Material hasn't reached yet */
    if (abbr.hasAttribute("title") && !abbr.hasAttribute("data-title")) {
      abbr.setAttribute("data-title", abbr.getAttribute("title"));
      abbr.removeAttribute("title");
    }
  });
}

/* Starfield — box-shadow stars expanding outward from center */
var STARFIELD_DEFAULT = 40;
var GALACTICITY_KEY = "mommyship-galacticity";
var MAX_STARS_PER_LAYER = 120;

/* Stellar color palette — weighted toward white, colorful ones are rarer */
var STAR_PALETTE = [
  {r: 255, g: 255, b: 255, w: 5},   // White (A-type, most common)
  {r: 220, g: 230, b: 255, w: 2},   // Blue-white (B-type)
  {r: 170, g: 191, b: 255, w: 1},   // Blue (O-type, rare)
  {r: 255, g: 244, b: 232, w: 2},   // Yellow-white (F-type)
  {r: 255, g: 237, b: 151, w: 1.5}, // Yellow (G-type, sun-like)
  {r: 255, g: 196, b: 107, w: 1},   // Orange (K-type)
  {r: 255, g: 154, b: 92,  w: 0.5}  // Red-orange (M-type, rare)
];

function pickStarColor() {
  var totalWeight = 0;
  for (var i = 0; i < STAR_PALETTE.length; i++) totalWeight += STAR_PALETTE[i].w;
  var roll = Math.random() * totalWeight;
  var cumulative = 0;
  for (var i = 0; i < STAR_PALETTE.length; i++) {
    cumulative += STAR_PALETTE[i].w;
    if (roll <= cumulative) return STAR_PALETTE[i];
  }
  return STAR_PALETTE[0];
}

/* Pre-generate a pool of stars for one layer (called once at init) */
function generateStarPool(count, maxSize) {
  var pool = [];
  var spread = Math.max(window.innerWidth, window.innerHeight) * 1.5;
  for (var i = 0; i < count; i++) {
    pool.push({
      x: Math.round((Math.random() - 0.5) * spread),
      y: Math.round((Math.random() - 0.5) * spread),
      size: Math.random() < 0.25 ? maxSize : Math.max(1, maxSize - 1),
      brightness: 0.3 + Math.random() * 0.7,
      color: pickStarColor(),
      /* Assign each star to a twinkle group (0, 1, or 2) */
      twinkleGroup: Math.floor(Math.random() * 3)
    });
  }
  return pool;
}

/* Build box-shadow string from a star pool, using only the first `count` stars */
function buildShadowString(pool, count, colorMix) {
  var shadows = [];
  var n = Math.min(count, pool.length);
  for (var i = 0; i < n; i++) {
    var s = pool[i];
    /* Blend between white and assigned color based on colorMix (0=white, 1=full color) */
    var r = Math.round(255 + (s.color.r - 255) * colorMix);
    var g = Math.round(255 + (s.color.g - 255) * colorMix);
    var b = Math.round(255 + (s.color.b - 255) * colorMix);
    shadows.push(
      s.x + "px " + s.y + "px 0 " + s.size + "px rgba(" + r + "," + g + "," + b + "," + s.brightness.toFixed(2) + ")"
    );
  }
  return shadows.join(",");
}

/* Build shadow string for one twinkle group */
function buildTwinkleGroupShadow(pool, count, colorMix, group) {
  var shadows = [];
  var n = Math.min(count, pool.length);
  for (var i = 0; i < n; i++) {
    if (pool[i].twinkleGroup !== group) continue;
    var s = pool[i];
    var r = Math.round(255 + (s.color.r - 255) * colorMix);
    var g = Math.round(255 + (s.color.g - 255) * colorMix);
    var b = Math.round(255 + (s.color.b - 255) * colorMix);
    shadows.push(
      s.x + "px " + s.y + "px 0 " + s.size + "px rgba(" + r + "," + g + "," + b + "," + (s.brightness * s.size * 0.4).toFixed(2) + ")"
    );
  }
  return shadows.join(",");
}

/* Canvas hyperspace — draws actual radial lines instead of box-shadow dot trails */
function getHyperspaceCanvas() {
  var canvas = document.getElementById("hyperspace-canvas");
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.id = "hyperspace-canvas";
    canvas.style.cssText = "position:fixed;inset:0;z-index:-1;pointer-events:none;display:none;";
    document.body.appendChild(canvas);
  }
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  return canvas;
}

/* Collect all stars from all pools into one flat array for canvas drawing */
function getHyperspaceStars() {
  var stars = [];
  for (var depth = 1; depth <= 3; depth++) {
    var keys = [depth + "a", depth + "b", depth + "c"];
    for (var k = 0; k < keys.length; k++) {
      var pool = starPools[keys[k]];
      if (!pool) continue;
      for (var i = 0; i < pool.length; i++) {
        stars.push(pool[i]);
      }
    }
  }
  return stars;
}

/* Star pools — A/B/C each get independent pools for maximum randomness */
var starPools = {};
var LAYER_C_THRESHOLD = 66;

function createStarfield() {
  if (document.getElementById("starfield")) return;
  var container = document.createElement("div");
  container.id = "starfield";
  var maxSizes = [2, 1.5, 1];
  var copies = ["a", "b", "c"];
  var copyClasses = ["", "stars-layer--b", "stars-layer--c"];
  for (var depth = 1; depth <= 3; depth++) {
    for (var c = 0; c < copies.length; c++) {
      var key = depth + copies[c];
      starPools[key] = generateStarPool(MAX_STARS_PER_LAYER, maxSizes[depth - 1]);

      var layer = document.createElement("div");
      layer.className = "stars-layer" + (copyClasses[c] ? " " + copyClasses[c] : "");
      layer.setAttribute("data-depth", depth);
      layer.setAttribute("data-pool", key);
      container.appendChild(layer);
    }

    /* Twinkle groups use the A pool (synced to A's expand timing) */
    for (var g = 0; g < 3; g++) {
      var tw = document.createElement("div");
      tw.className = "stars-layer stars-twinkle stars-twinkle--" + g;
      tw.setAttribute("data-depth", depth);
      tw.setAttribute("data-pool", depth + "a");
      tw.setAttribute("data-twinkle", g);
      container.appendChild(tw);
    }
  }
  document.body.prepend(container);
}

function updateStarfield(intensity) {
  var sf = document.getElementById("starfield");
  if (!sf) return;

  if (intensity === 0) { sf.style.display = "none"; return; }
  sf.style.display = "";
  sf.style.opacity = intensity / 100;

  var fraction = intensity / 100;
  var baseCount = Math.max(20, Math.round(30 + fraction * 90));
  var countMultipliers = [1, 0.8, 0.6];
  var colorMix = Math.max(0, (fraction - 0.3) / 0.7);
  var baseSpeeds = [40, 70, 100];
  var speedFactor = 1 + fraction;
  var showC = intensity >= LAYER_C_THRESHOLD;

  /* Update base layers — each reads its own pool */
  var baseLayers = sf.querySelectorAll(".stars-layer:not(.stars-twinkle)");
  for (var i = 0; i < baseLayers.length; i++) {
    var isC = baseLayers[i].classList.contains("stars-layer--c");
    if (isC && !showC) { baseLayers[i].style.boxShadow = "none"; continue; }

    var depthIdx = parseInt(baseLayers[i].getAttribute("data-depth")) - 1;
    var poolKey = baseLayers[i].getAttribute("data-pool");
    var count = Math.round(baseCount * countMultipliers[depthIdx]);
    var pool = starPools[poolKey];
    if (pool) baseLayers[i].style.boxShadow = buildShadowString(pool, count, colorMix);
    baseLayers[i].style.animationDuration = (baseSpeeds[depthIdx] / speedFactor) + "s";
  }

  /* Update twinkle overlay groups */
  var twinkleLayers = sf.querySelectorAll(".stars-twinkle");
  for (var i = 0; i < twinkleLayers.length; i++) {
    var depthIdx = parseInt(twinkleLayers[i].getAttribute("data-depth")) - 1;
    var poolKey = twinkleLayers[i].getAttribute("data-pool");
    var group = parseInt(twinkleLayers[i].getAttribute("data-twinkle"));
    var count = Math.round(baseCount * countMultipliers[depthIdx]);
    var pool = starPools[poolKey];
    if (pool) twinkleLayers[i].style.boxShadow = buildTwinkleGroupShadow(pool, count, colorMix, group);
    twinkleLayers[i].style.animationDuration = (baseSpeeds[depthIdx] / speedFactor) + "s";
  }
}

function getColorScheme() {
  return document.body.getAttribute("data-md-color-scheme")
    || document.documentElement.getAttribute("data-md-color-scheme");
}

function getGalacticity() {
  try {
    var stored = localStorage.getItem(GALACTICITY_KEY);
    if (stored !== null) {
      var val = parseInt(stored);
      if (!isNaN(val) && val >= 0 && val <= 100) return val;
    }
  } catch (e) { /* localStorage unavailable */ }
  return STARFIELD_DEFAULT;
}

function setGalacticity(val) {
  try { localStorage.setItem(GALACTICITY_KEY, val.toString()); }
  catch (e) { /* localStorage unavailable */ }
}

var starfieldInitialized = false;

function initStarfield() {
  if (starfieldInitialized) return;
  if (getColorScheme() !== "slate") return;
  if (document.querySelector(".homepage-hero")) return;

  starfieldInitialized = true;
  createStarfield();
  var saved = getGalacticity();
  updateStarfield(saved);
  var slider = document.getElementById("galacticity-slider");
  if (slider) slider.value = saved;
  var jumpBtn = document.getElementById("jump-btn");
  if (jumpBtn) jumpBtn.hidden = saved < 100;
}

var galacticityBound = false;

function bindGalacticity() {
  if (galacticityBound) return;
  var slider = document.getElementById("galacticity-slider");
  var jumpBtn = document.getElementById("jump-btn");
  if (!slider) return;
  galacticityBound = true;

  slider.addEventListener("input", function() {
    var val = parseInt(slider.value);
    updateStarfield(val);
    setGalacticity(val);
    if (jumpBtn) jumpBtn.hidden = val < 100;
  });

  if (jumpBtn) {
    jumpBtn.addEventListener("click", triggerHyperspace);
  }
}

function triggerHyperspace() {
  var sf = document.getElementById("starfield");
  var slider = document.getElementById("galacticity-slider");
  var jumpBtn = document.getElementById("jump-btn");
  if (!sf || sf.classList.contains("hyperspace")) return;

  if (slider) slider.disabled = true;
  if (jumpBtn) jumpBtn.disabled = true;
  sf.classList.add("hyperspace");

  var canvas = getHyperspaceCanvas();
  var ctx = canvas.getContext("2d");
  var w = canvas.width;
  var h = canvas.height;
  var cx = w / 2;
  var cy = h / 2;
  canvas.style.display = "block";

  var stars = getHyperspaceStars();
  var lastRefresh = 0;
  var startTime = performance.now();
  var prevTime = startTime;
  var duration = 15000;
  var totalDist = 0;

  function drawFrame(now) {
    var elapsed = now - startTime;
    var dt = (now - prevTime) / 1000;
    prevTime = now;
    var t = Math.min(elapsed / duration, 1);

    /* Pick up newly-rendered stars every 500ms */
    if (elapsed - lastRefresh > 500) {
      stars = getHyperspaceStars();
      lastRefresh = elapsed;
    }

    /* Black fill each frame */
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h);

    /* Speed: ramp to 10, decelerate last 15% */
    var speed = t < 0.85
      ? 1 + t * 10
      : 11 - (t - 0.85) / 0.15 * 11;
    if (speed < 0.1) speed = 0.1;
    totalDist += speed * dt * 0.15;
    var scale = 0.8 + totalDist;

    /* Streaks grow until 75%, then shrink back for "dropping out" feel */
    var maxStreak = 3 + Math.pow(Math.min(t, 0.75) / 0.75, 0.5) * 450;
    var streakLen = t < 0.75
      ? maxStreak
      : maxStreak * (1 - Math.pow((t - 0.75) / 0.25, 1.5));
    if (streakLen < 2) streakLen = 2;
    var brightness = 0.7 + t * 1.3;

    /* Fade out: last 15% — canvas fades, starfield re-emerges underneath */
    if (t > 0.85) {
      var fadeT = (t - 0.85) / 0.15;
      canvas.style.opacity = (1 - fadeT * fadeT).toFixed(2);
      if (sf.classList.contains("hyperspace")) {
        sf.classList.remove("hyperspace");
        updateStarfield(slider ? parseInt(slider.value) : 100);
      }
    }

    /* Draw stars — two passes per star for glow (wide+faint then narrow+bright) */
    ctx.globalCompositeOperation = "lighter";
    ctx.shadowBlur = 0;
    var maxR = Math.max(w, h) * 0.75;
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var baseDist = Math.sqrt(s.x * s.x + s.y * s.y);
      if (baseDist < 1) continue;
      var angle = Math.atan2(s.y, s.x);
      var cosA = Math.cos(angle);
      var sinA = Math.sin(angle);

      /* Offset each star's phase by index for even radial distribution */
      var r = (baseDist * scale + i * maxR / stars.length) % maxR;
      var sx = cx + cosA * r;
      var sy = cy + sinA * r;
      if (sx < -80 || sx > w + 80 || sy < -80 || sy > h + 80) continue;

      var radialFade = Math.min(1, r / 60);
      var cr = s.color.r;
      var cg = s.color.g;
      var cb = s.color.b;
      var a = Math.min(1, s.brightness * brightness * radialFade);
      var tx = sx - cosA * streakLen;
      var ty = sy - sinA * streakLen;

      /* Glow pass: wide, faint */
      ctx.strokeStyle = "rgba(" + cr + "," + cg + "," + cb + "," + (a * 0.2).toFixed(2) + ")";
      ctx.lineWidth = s.size * 12;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(tx, ty);
      ctx.stroke();

      /* Core pass: narrow, bright */
      ctx.strokeStyle = "rgba(" + cr + "," + cg + "," + cb + "," + a.toFixed(2) + ")";
      ctx.lineWidth = s.size * 1.5;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(tx, ty);
      ctx.stroke();
    }

    if (t < 1) {
      requestAnimationFrame(drawFrame);
    } else {
      endHyperspace();
    }
  }

  function endHyperspace() {
    canvas.style.display = "none";
    canvas.style.opacity = "";
    /* Starfield should already be visible from the fade-out phase */
    sf.classList.remove("hyperspace");
    var val = slider ? parseInt(slider.value) : 100;
    updateStarfield(val);
    if (slider) slider.disabled = false;
    if (jumpBtn) jumpBtn.disabled = false;
  }

  requestAnimationFrame(drawFrame);
}

/* React to dark/light mode toggle */
var schemeObserverBound = false;

function watchColorScheme() {
  if (schemeObserverBound) return;
  schemeObserverBound = true;

  new MutationObserver(function() {
    var sf = document.getElementById("starfield");
    if (getColorScheme() === "slate") {
      if (!sf && !document.querySelector(".homepage-hero")) {
        starfieldInitialized = false;
        initStarfield();
        var slider = document.getElementById("galacticity-slider");
        if (slider) updateStarfield(parseInt(slider.value));
      } else if (sf) {
        sf.style.display = "";
      }
    } else if (sf) {
      sf.style.display = "none";
    }
  }).observe(document.documentElement, {
    attributes: true, attributeFilter: ["data-md-color-scheme"]
  });
}

document$.subscribe(function() {
  updateCurrentTocItem();
  window.addEventListener("scroll", updateCurrentTocItem, { passive: true });
  applyTextScale(getTextScale());
  bindTextSizeRocker();
  bindKeyboardShortcuts();
  handleNavBottom();
  wrapBracketNotation();
  unifyAbbrTooltips();
  initStarfield();
  bindGalacticity();
  watchColorScheme();
});
