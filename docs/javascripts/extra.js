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

document$.subscribe(function() {
  updateCurrentTocItem();
  window.addEventListener("scroll", updateCurrentTocItem, { passive: true });
  applyTextScale(getTextScale());
  bindTextSizeRocker();
  bindKeyboardShortcuts();
  handleNavBottom();
  wrapBracketNotation();
  unifyAbbrTooltips();
});
