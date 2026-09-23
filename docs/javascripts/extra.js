// Mark the TOC section being read. Zensical's scroll-spy flags it as the last passed link (--active),
// but also dims it with --passed, so we add our own class that the dim rule skips
function updateCurrentTocItem() {
  var toc = document.querySelector(".md-sidebar--secondary .md-nav");
  if (!toc) return;

  toc.querySelectorAll(".md-nav__link--current").forEach(function(el) {
    el.classList.remove("md-nav__link--current");
  });

  var active = toc.querySelector(".md-nav__link--active");
  if (active) active.classList.add("md-nav__link--current");
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

var scrollListenerBound = false;
var scrollTicking = false;

function onScrollThrottled() {
  if (scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(function() { updateCurrentTocItem(); scrollTicking = false; });
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

/* Tooltips for notation the abbr extension can't match: [+]/[-] aren't word characters, and
   credits and dice hug their number (100cr, 2d5), so its word boundaries never fire */
var NOTATION_SKIP = { CODE: 1, PRE: 1, SCRIPT: 1, STYLE: 1, ABBR: 1 };
var NOTATION_RE = /\[\+\]|\[-\]|(?<=\d)[kmb]?cr\b|\d+d5\b/g;
var NOTATION_TITLES = {
  "[+]": "Advantage \u2014 roll twice, take the better result",
  "[-]": "Disadvantage \u2014 roll twice, take the worse result",
  "cr": "Credits",
  "kcr": "Thousand credits",
  "mcr": "Million credits",
  "bcr": "Billion credits"
};

function notationTitle(token) {
  var dice = /^(\d+)d5$/.exec(token);
  if (!dice) return NOTATION_TITLES[token];
  return dice[1] === "1" ? "1d10 halved & rounded up" : dice[1] + "d10, each die halved & rounded up";
}

function wrapNotation() {
  /* Not bare .md-typeset: Zensical also puts that class on nav labels, which come first */
  var content = document.querySelector(".md-content__inner");
  if (!content) return;

  var walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT, {
    acceptNode: function(node) {
      if (NOTATION_SKIP[node.parentElement.tagName]) return NodeFilter.FILTER_REJECT;
      /* A /g regex's test() resumes from lastIndex, which would skip matches in later nodes */
      NOTATION_RE.lastIndex = 0;
      return NOTATION_RE.test(node.data) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  });

  var nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);

  nodes.forEach(function(textNode) {
    var frag = document.createDocumentFragment();
    var text = textNode.data;
    var lastIdx = 0;
    var match;
    NOTATION_RE.lastIndex = 0;
    while ((match = NOTATION_RE.exec(text)) !== null) {
      if (match.index > lastIdx) frag.appendChild(document.createTextNode(text.slice(lastIdx, match.index)));
      var abbr = document.createElement("abbr");
      abbr.setAttribute("data-title", notationTitle(match[0]));
      abbr.setAttribute("aria-description", notationTitle(match[0]));
      abbr.textContent = match[0];
      frag.appendChild(abbr);
      lastIdx = NOTATION_RE.lastIndex;
    }
    if (lastIdx < text.length) frag.appendChild(document.createTextNode(text.slice(lastIdx)));
    textNode.parentNode.replaceChild(frag, textNode);
  });
}

/* Our CSS tooltips replace Zensical's below-cursor ones. Swapping in a clone sheds the hover
   listener Zensical bound to the original, which would otherwise pop an empty tooltip */
function unifyAbbrTooltips() {
  document.querySelectorAll(".md-typeset abbr[title]").forEach(function(abbr) {
    var clean = abbr.cloneNode(true);
    clean.setAttribute("data-title", abbr.getAttribute("title"));
    /* The ::after tooltip is invisible to screen readers; this keeps the expansion announced */
    clean.setAttribute("aria-description", abbr.getAttribute("title"));
    clean.removeAttribute("title");
    abbr.replaceWith(clean);
  });
}

function applyQuickGuideWidth() {
  var path = window.location.pathname;
  var el = document.querySelector(".md-content");
  if (!el) return;
  if (path.includes("quick-guide")) {
    el.style.maxWidth = "40rem";
    el.style.margin = "0 auto";
  } else {
    el.style.maxWidth = "";
    el.style.margin = "";
  }
}

/* Markdown tables can't colspan, so the rulebook's title rows ("TRAVEL COSTS |  |  |") and
   sub-header bands ("MINOR REPAIRS | ———— | ————") arrive as one labeled cell plus padding.
   Merge each into a single full-width cell so the label centers over the whole table. */
function spanTableBands() {
  var FILLER = "————";
  var rows = document.querySelectorAll(".md-typeset table:not([class]) tr");
  for (var i = 0; i < rows.length; i++) {
    var cells = rows[i].children;
    if (cells.length < 2 || cells[0].hasAttribute("colspan")) continue;
    var label = cells[0].textContent.trim();
    if (!label) continue;
    /* Body rows must carry the filler: a data row that happens to end in blanks is not a band */
    var blankOk = rows[i].parentElement.tagName === "THEAD";
    var isBand = true;
    for (var j = 1; j < cells.length; j++) {
      var text = cells[j].textContent.trim();
      if (text !== FILLER && !(blankOk && text === "")) { isBand = false; break; }
    }
    if (!isBand) continue;
    cells[0].setAttribute("colspan", cells.length);
    cells[0].classList.add("table-band");
    while (cells.length > 1) rows[i].removeChild(cells[1]);
  }
}

/* The Galacticity and text-size groups live in a popover tray off the header sparkle button.
   Nodes are moved, not cloned, so their listeners and state come along. */
var TRAY_GROUPS = [".galacticity-control", ".text-size-rocker"];

function placeHeaderTray() {
  var tray = document.getElementById("header-tray");
  if (!tray) return;
  TRAY_GROUPS.forEach(function(sel) {
    var el = document.querySelector(sel);
    if (el && el.parentElement !== tray) tray.appendChild(el);
  });
}

/* Light dismiss backstop: some mobile browsers only close auto popovers on a real click, so
   any touch or scroll outside the tray closes it too */
document.addEventListener("pointerdown", function(e) {
  var tray = document.getElementById("header-tray");
  if (!tray || !tray.matches(":popover-open")) return;
  if (e.target.closest("#header-tray, .header-tray__toggle")) return;
  tray.hidePopover();
}, { passive: true });
/* Center the tray under its button; CSS anchor positioning isn't in Firefox yet. Runs on
   open and on resize so it tracks the button across breakpoints. */
function positionHeaderTray() {
  var tray = document.getElementById("header-tray");
  var toggle = document.querySelector(".header-tray__toggle");
  if (!tray || !toggle || !tray.matches(":popover-open")) return;
  var gutter = 8;
  var btn = toggle.getBoundingClientRect();
  var width = tray.offsetWidth;
  var left = btn.left + btn.width / 2 - width / 2;
  left = Math.max(gutter, Math.min(left, window.innerWidth - width - gutter));
  var header = document.querySelector(".md-header");
  var headerBottom = header ? header.getBoundingClientRect().bottom : btn.bottom;
  tray.style.left = left + "px";
  tray.style.top = (headerBottom + 8) + "px";
}
document.addEventListener("toggle", function(e) {
  if (e.target.id === "header-tray" && e.newState === "open") positionHeaderTray();
}, true);
window.addEventListener("resize", positionHeaderTray);

document$.subscribe(function() {
  updateCurrentTocItem();
  spanTableBands();
  placeHeaderTray();
  if (!scrollListenerBound) {
    scrollListenerBound = true;
    window.addEventListener("scroll", onScrollThrottled, { passive: true });
  }
  applyTextScale(getTextScale());
  bindTextSizeRocker();
  bindKeyboardShortcuts();
  handleNavBottom();
  wrapNotation();
  unifyAbbrTooltips();
  applyQuickGuideWidth();
  bindMassholeNav();
  bindFooterSplit();
});

/* Footer credits: the pipe only belongs between the halves while they share a line */
var footerSplitObserver = null;

function bindFooterSplit() {
  var credits = document.querySelector(".footer-credits");
  if (!credits || credits._splitBound) return;
  credits._splitBound = true;
  var parts = credits.querySelectorAll(".footer-credits__part");
  if (parts.length < 2) return;
  /* One observer for the session: instant navigation swaps in a new footer each page */
  if (footerSplitObserver) footerSplitObserver.disconnect();
  footerSplitObserver = new ResizeObserver(function() {
    credits.classList.toggle("footer-credits--split", parts[1].offsetTop > parts[0].offsetTop);
  });
  footerSplitObserver.observe(credits);
}

/* Header title click → Galaxy Map (Mommyship pages only) */
function bindMassholeNav() {
  if (document.querySelector('.osminok-ocean')) return;
  var topic = document.querySelector('.md-header__topic');
  if (!topic || topic._massholebound) return;
  topic.style.cursor = 'pointer';
  topic.addEventListener('click', function() {
    sessionStorage.setItem('mommyship-return-url', window.location.href);
    /* Absolute path: __config.base goes stale under navigation.instant and 404s from nested pages */
    window.location.href = '/galaxy.html';
  });
  topic._massholebound = true;
}
