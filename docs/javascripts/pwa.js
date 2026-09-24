/* Shared PWA runtime for the rules site and galaxy.html, loaded once per full page load;
   instant navigation keeps this instance alive instead of re-running it. */

const OPEN_PAGE_KEY = 'mommyship-open-page';
const GALAXY_CACHE = 'mommyship-galaxy';
/* Same synthetic entry sw.js keeps: the offline.json whose hashes the cache currently matches */
const GALAXY_LIST_KEY = '/galaxy/offline.json?applied';
const THEME_COLORS = { slate: '#8332ac', default: '#41ead4' };

const lsGet = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch { } };

const root = document.documentElement;
const isGalaxyPage = !!document.getElementById('gx-loading');

export function isStandalone() {
  return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches)
    || window.navigator.standalone === true;
}

export function getOpenPage() {
  const v = lsGet(OPEN_PAGE_KEY);
  return v === '2d' || v === '3d' ? v : 'home';
}

export function setOpenPage(v) {
  lsSet(OPEN_PAGE_KEY, v === '2d' || v === '3d' ? v : 'home');
}

export async function requestPersist() {
  try {
    if (navigator.storage && navigator.storage.persist) return await navigator.storage.persist();
  } catch { }
  return false;
}

/* Styles for the toast and badge live here so galaxy.html and the site share one look */
function injectStyles() {
  const css = `
.pwa-toast{position:fixed;left:50%;bottom:1rem;transform:translateX(-50%);z-index:9000;display:flex;gap:.6rem;align-items:center;
  padding:.55rem .9rem;border-radius:.4rem;font:600 .8rem/1.3 "League Spartan",system-ui,sans-serif;color:#fffaff;
  background:rgba(13,13,26,.94);border:1px solid rgba(246,121,229,.6);box-shadow:0 0 .6rem rgba(246,121,229,.35),0 .4rem 1.2rem rgba(0,0,0,.4)}
.pwa-toast button{font:inherit;color:#0d0d1a;background:#F679E5;border:0;border-radius:.3rem;padding:.35rem .7rem;cursor:pointer}
.pwa-toast button.pwa-toast__later{background:transparent;color:#fffaff;border:1px solid rgba(255,250,255,.35)}
.pwa-offline{position:fixed;left:.75rem;bottom:.75rem;z-index:9000;padding:.3rem .6rem;border-radius:999px;
  font:700 .65rem/1 "League Spartan",system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#0d0d1a;background:#f0a030;
  box-shadow:0 0 .5rem rgba(240,160,48,.5)}
html.pwa-galaxy .gx-status .pwa-offline{position:static;flex-shrink:0}
html.pwa-galaxy .pwa-toast{bottom:2.6rem}
@media (prefers-reduced-motion:no-preference){.pwa-toast{animation:pwa-rise .25s ease-out}}
@keyframes pwa-rise{from{opacity:0;transform:translate(-50%,.5rem)}to{opacity:1;transform:translate(-50%,0)}}`;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
}

/* Update toast */
let toastEl = null;
function showUpdateToast(waiting) {
  if (toastEl) return;
  toastEl = document.createElement('div');
  toastEl.className = 'pwa-toast';
  toastEl.setAttribute('role', 'status');
  toastEl.innerHTML = '<span>New Mommyship version ready.</span>'
    + '<button type="button" class="pwa-toast__reload">Reload</button>'
    + '<button type="button" class="pwa-toast__later">Later</button>';
  toastEl.querySelector('.pwa-toast__reload').addEventListener('click', () => {
    waiting.postMessage({ type: 'SKIP_WAITING' });
  });
  toastEl.querySelector('.pwa-toast__later').addEventListener('click', () => {
    toastEl.remove();
    toastEl = null;
  });
  document.body.appendChild(toastEl);
}

async function registerWorker() {
  if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
  try {
    const reg = await navigator.serviceWorker.register('/sw.js');
    if (reg.waiting && navigator.serviceWorker.controller) showUpdateToast(reg.waiting);
    reg.addEventListener('updatefound', () => {
      const nw = reg.installing;
      if (!nw) return;
      nw.addEventListener('statechange', () => {
        if (nw.state === 'installed' && navigator.serviceWorker.controller) showUpdateToast(nw);
      });
    });
    let reloading = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (reloading) return;
      reloading = true;
      location.reload();
    });
  } catch (e) {
    console.warn('Service worker registration failed:', e);
  }
}

/* Offline badge */
function bindOfflineBadge() {
  let badge = null;
  const sync = () => {
    const off = navigator.onLine === false;
    if (off && !badge) {
      badge = document.createElement('div');
      badge.className = 'pwa-offline';
      badge.textContent = 'Offline';
      /* The galaxy's bottom-left corner belongs to the Navicomputer, so ride in its status bar */
      const controls = isGalaxyPage && document.getElementById('controls-toggle');
      if (controls) controls.after(badge);
      else document.body.appendChild(badge);
    } else if (!off && badge) {
      badge.remove();
      badge = null;
    }
  };
  window.addEventListener('online', sync);
  window.addEventListener('offline', sync);
  sync();
}

/* Title bar color follows the site's own light/dark toggle, which isn't the OS setting */
function bindThemeColor() {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) return;
  const sync = () => {
    const scheme = document.body.getAttribute('data-md-color-scheme')
      || root.getAttribute('data-md-color-scheme');
    if (!scheme) return;
    meta.setAttribute('content', THEME_COLORS[scheme] || THEME_COLORS.slate);
  };
  const opts = { attributes: true, attributeFilter: ['data-md-color-scheme'] };
  new MutationObserver(sync).observe(root, opts);
  if (document.body) new MutationObserver(sync).observe(document.body, opts);
  sync();
}

/* Install prompt and the homepage button row. Chromium fires beforeinstallprompt; everything
   else gets a short how-to panel matched to the detected (or picked) browser. */
const BROWSER_KEY = 'mommyship-browser';
const VARIANT_KEY = 'mommyship-icon-variant';
/* main.html's inline head script reads this key too, so the swap lands before Chromium looks */
const VARIANT_MANIFEST_KEY = 'mommyship-icon-manifest';
const DEFAULT_MANIFEST = '/manifest.webmanifest';
const DEFAULT_THUMB = '/assets/icons/icon-192.png';
const VARIANT_MANIFEST_RE = /^\/manifests\/[\w-]+\.webmanifest$/;
const WALLPAPER_RE = /^\/assets\/rules\/wallpapers\/[\w.-]+$/;
const HAS_POPOVER = 'popover' in HTMLElement.prototype;

const BROWSER_FAMILY = {
  chrome: 'chromium', edge: 'chromium', brave: 'chromium', vivaldi: 'chromium', opera: 'chromium',
  operagx: 'chromium', firefox: 'firefox', zen: 'firefox', librewolf: 'firefox',
  tor: 'firefox', safari: 'safari', duckduckgo: 'generic'
};

const lsDel = (k) => { try { localStorage.removeItem(k); } catch { } };

let deferredPrompt = null;
let promptAt = 0;
let installedNow = false;
let promptWaiters = [];
let manifestSwappedAt = 0;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  promptAt = Date.now();
  promptWaiters.splice(0).forEach((resolve) => resolve());
  bindInstallButton();
});
window.addEventListener('appinstalled', () => {
  deferredPrompt = null;
  installedNow = true;
  requestPersist();
  bindInstallButton();
});

export function canPromptInstall() { return hasFreshPrompt(); }

export async function promptInstall() {
  if (!deferredPrompt) return null;
  const evt = deferredPrompt;
  deferredPrompt = null;
  let outcome = null;
  try {
    await evt.prompt();
    const choice = await evt.userChoice;
    outcome = choice && choice.outcome;
  } catch { /* stale event (the manifest changed under it); callers fall back to the how-to */ }
  bindInstallButton();
  return outcome;
}

/* An event captured before the latest manifest swap is retired; only a newer one can prompt */
const hasFreshPrompt = () => !!deferredPrompt && promptAt >= manifestSwappedAt;

function waitForPrompt(ms) {
  return new Promise((resolve) => {
    promptWaiters.push(resolve);
    setTimeout(resolve, ms);
  });
}

function detectPlatform() {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  if (/Macintosh/.test(ua)) return 'mac';
  return 'desktop';
}

/* Brands first (Chromium forks that announce themselves), then UA tokens. Zen, LibreWolf, Tor, and
   Vivaldi mostly send a stock UA, so they land on Firefox or Chrome until picked by hand. */
function detectBrowser(platform) {
  const ua = navigator.userAgent;
  if (platform === 'ios') {
    if (/CriOS\//.test(ua)) return 'chrome';
    if (/FxiOS\//.test(ua)) return 'firefox';
    if (/EdgiOS\//.test(ua)) return 'edge';
    if (/OPiOS\/|OPT\//.test(ua)) return 'opera';
    if (/Ddg\//.test(ua)) return 'duckduckgo';
    return 'safari';
  }
  if (navigator.brave) return 'brave';
  const brands = ((navigator.userAgentData && navigator.userAgentData.brands) || []).map((b) => b.brand);
  if (brands.includes('Microsoft Edge')) return 'edge';
  if (brands.includes('Opera GX')) return 'operagx';
  if (brands.includes('Opera')) return 'opera';
  if (brands.includes('Brave')) return 'brave';
  if (brands.includes('DuckDuckGo')) return 'duckduckgo';
  if (/Vivaldi\//.test(ua)) return 'vivaldi';
  if (/Edg(A|iOS)?\//.test(ua)) return 'edge';
  if (/OPR\//.test(ua)) return 'opera';
  if (/Ddg\//.test(ua)) return 'duckduckgo';
  if (/LibreWolf/.test(ua)) return 'librewolf';
  if (/Firefox\//.test(ua)) return 'firefox';
  if (/Chrome\//.test(ua)) return 'chrome';
  if (/Safari\//.test(ua) && /Version\//.test(ua)) return 'safari';
  return 'generic';
}

function pickedBrowser() {
  const v = lsGet(BROWSER_KEY);
  return v && Object.hasOwn(BROWSER_FAMILY, v) ? v : null;
}

function browserLabel(key) {
  const label = document.querySelector(`.home-picker__item[data-browser="${key}"] .home-picker__logo + span`);
  return label ? label.textContent.trim() : '';
}

/* The panel follows the browser shown on the button (picked beats detected); only the device
   decides between desktop and phone steps, since every iOS browser installs the Safari way */
function installFlow(browser, platform) {
  if (platform === 'ios') return 'ios';
  const family = BROWSER_FAMILY[browser] || 'generic';
  if (family === 'firefox') return platform === 'android' ? 'firefox-android' : 'firefox';
  if (family === 'chromium') return platform === 'android' ? 'chromium-android' : 'chromium';
  if (family === 'safari') return platform === 'android' ? 'generic' : 'safari-mac';
  return 'generic';
}

/* Icon variants: every variant manifest shares the root manifest's id, start_url, and scope, so
   swapping the link only changes which icons the browser installs */
function storedManifest() {
  const m = lsGet(VARIANT_MANIFEST_KEY);
  return m && VARIANT_MANIFEST_RE.test(m) ? m : DEFAULT_MANIFEST;
}

/* Chromium re-reads a changed manifest link live: it retires the pending install event and fires
   a fresh beforeinstallprompt once the new manifest checks out (onPanelInstall waits for it) */
function applyManifest(path) {
  const link = document.querySelector('link[rel="manifest"]');
  if (!link) return;
  const target = new URL(path, location.href).href;
  if (link.href === target) return;
  link.href = target;
  manifestSwappedAt = Date.now();
}

let variantsPromise = null;
let variantList = null;
function loadVariants() {
  if (!variantsPromise) {
    variantsPromise = fetch('/manifests/index.json', { cache: 'no-cache' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => (d && Array.isArray(d.variants)
        ? d.variants.filter((v) => v && /^[\w-]+$/.test(v.id) && VARIANT_MANIFEST_RE.test(v.manifest))
        : null))
      .catch(() => null)
      .then((list) => {
        /* A variant that left the build falls back to the default; a failed fetch (offline) keeps it */
        const stored = lsGet(VARIANT_KEY);
        if (list && stored && !list.some((v) => v.id === stored)) selectVariant(null);
        variantList = list;
        return list;
      });
  }
  return variantsPromise;
}

function selectVariant(v) {
  if (v && v.id) {
    lsSet(VARIANT_KEY, v.id);
    lsSet(VARIANT_MANIFEST_KEY, v.manifest);
  } else {
    lsDel(VARIANT_KEY);
    lsDel(VARIANT_MANIFEST_KEY);
  }
  applyManifest(storedManifest());
  bindInstallButton();
}

const hasWallpaper = (v) => typeof v.wallpaper === 'string' && WALLPAPER_RE.test(v.wallpaper);

/* The install panel's top section: icon choices before installing, only the wallpapers after */
function renderVariants(list, landed) {
  const wrap = document.getElementById('icon-variants');
  if (!wrap) return;
  const mode = landed ? 'landed' : 'install';
  /* Rebuilding on every refresh would drop keyboard focus from the thumbnail just picked */
  if (wrap._list === list && wrap.dataset.mode === mode) return;
  wrap._list = list;
  wrap.dataset.mode = mode;
  const opts = !list ? [] : landed ? list.filter(hasWallpaper)
    : [{ id: '', name: 'Default', thumb: DEFAULT_THUMB }].concat(list);
  const row = wrap.querySelector('.home-variants__row');
  wrap.hidden = landed ? !opts.length : !(list && list.length);
  wrap.querySelector('.home-pop__heading').textContent = landed ? 'Grab a wallpaper' : 'Pick your app icon';
  wrap.querySelector('.home-variants__note').hidden = landed;
  row.setAttribute('aria-label', landed ? 'Wallpapers' : 'App icon');
  if (wrap.hidden) {
    row.replaceChildren();
    return;
  }
  const glyph = document.querySelector('.home-btn--download .home-btn__logo svg');
  row.replaceChildren(...opts.map((v) => {
    const name = v.name || v.id;
    const cell = document.createElement('div');
    cell.className = 'home-variant-cell';
    const img = document.createElement('img');
    img.src = typeof v.thumb === 'string' && v.thumb.startsWith('/assets/icons/') ? v.thumb : DEFAULT_THUMB;
    img.alt = '';
    img.decoding = 'async';
    const thumb = document.createElement(landed ? 'span' : 'button');
    thumb.className = landed ? 'home-variant home-variant--static' : 'home-variant';
    thumb.append(img);
    if (!landed) {
      thumb.type = 'button';
      thumb.dataset.variant = v.id;
      thumb.title = name;
      thumb.setAttribute('aria-label', name);
      thumb.addEventListener('click', () => selectVariant(v));
    }
    cell.append(thumb);
    if (hasWallpaper(v)) {
      const a = document.createElement('a');
      a.className = 'home-variant__wall';
      a.href = v.wallpaper;
      a.download = '';
      const size = v.wallpaper.match(/(\d+)x(\d+)\.\w+$/i);
      a.setAttribute('aria-label', `Download the ${name} wallpaper` + (size ? ` (${size[1]}×${size[2]})` : ''));
      if (glyph) {
        const icon = glyph.cloneNode(true);
        icon.setAttribute('aria-hidden', 'true');
        a.append(icon);
      }
      a.append('Wallpaper');
      cell.append(a);
    }
    return cell;
  }));
  syncVariantPressed();
}

function syncVariantPressed() {
  const current = lsGet(VARIANT_KEY) || '';
  document.querySelectorAll('button.home-variant').forEach((b) => {
    b.setAttribute('aria-pressed', String(b.dataset.variant === current));
  });
}

/* Popovers: the how-to panel and the browser picker, placed under their buttons in page
   coordinates so they scroll with the card on phones */
const POP_ANCHORS = {
  'install-help': 'install-app', 'browser-picker': 'browser-picker-toggle', 'pwa-info': 'pwa-info-toggle'
};

const isPopOpen = (pop) => (HAS_POPOVER ? pop.matches(':popover-open') : pop.classList.contains('is-open'));

function openPop(pop) {
  if (isPopOpen(pop)) return;
  if (HAS_POPOVER) pop.showPopover();
  else pop.classList.add('is-open');
}

function closePop(pop) {
  if (!pop || !isPopOpen(pop)) return;
  if (HAS_POPOVER) pop.hidePopover();
  else pop.classList.remove('is-open');
}

function positionPop(pop) {
  const anchor = document.getElementById(POP_ANCHORS[pop.id]);
  if (!HAS_POPOVER || !anchor || !isPopOpen(pop)) return;
  const gutter = 8;
  const r = anchor.getBoundingClientRect();
  const w = pop.offsetWidth, h = pop.offsetHeight;
  const left = Math.max(gutter, Math.min(r.left + r.width / 2 - w / 2, window.innerWidth - w - gutter));
  let top = r.bottom + 6;
  if (top + h > window.innerHeight - gutter && r.top - 6 - h > gutter) top = r.top - 6 - h;
  pop.style.inset = 'auto';
  pop.style.margin = '0';
  pop.style.left = (left + window.scrollX) + 'px';
  pop.style.top = (top + window.scrollY) + 'px';
}

/* toggle fires a task after the popover shows, so hide it until it has been placed */
document.addEventListener('beforetoggle', (e) => {
  if (POP_ANCHORS[e.target.id] && e.newState === 'open') e.target.style.visibility = 'hidden';
}, true);
document.addEventListener('toggle', (e) => {
  const pop = e.target;
  if (!(pop instanceof HTMLElement) || !POP_ANCHORS[pop.id] || e.newState !== 'open') return;
  positionPop(pop);
  pop.style.visibility = '';
  if (pop.id === 'browser-picker') {
    const target = pop.querySelector('[aria-pressed="true"]') || pop.querySelector('button');
    if (target) target.focus({ preventScroll: true });
  } else {
    pop.focus({ preventScroll: true });
  }
}, true);
window.addEventListener('resize', () => {
  Object.keys(POP_ANCHORS).forEach((id) => {
    const pop = document.getElementById(id);
    if (pop) positionPop(pop);
  });
});
/* Light-dismiss backstop, same as the header tray: some mobile browsers only close on a real click */
document.addEventListener('pointerdown', (e) => {
  Object.entries(POP_ANCHORS).forEach(([id, anchorId]) => {
    const pop = document.getElementById(id);
    if (!pop || !isPopOpen(pop)) return;
    if (pop.contains(e.target) || e.target.closest('#' + anchorId)) return;
    closePop(pop);
  });
}, { passive: true });

async function onPanelInstall(e) {
  const btn = e.currentTarget;
  const help = document.getElementById('install-help');
  btn.disabled = true;
  try {
    /* Right after an icon swap Chromium is still re-checking the new manifest; wait for its fresh event */
    if (!hasFreshPrompt() && promptAt < manifestSwappedAt && Date.now() - manifestSwappedAt < 5000) {
      await waitForPrompt(2000);
    }
    if (hasFreshPrompt()) {
      await promptInstall();
    } else {
      deferredPrompt = null;
      bindInstallButton();
    }
  } finally {
    btn.disabled = false;
  }
  /* A dismissed or retired prompt swaps this button for the address-bar hint; keep focus in the panel */
  if (btn.closest('[hidden]') && help && isPopOpen(help)) help.focus({ preventScroll: true });
}

function logoFor(key) {
  if (key === 'landed') {
    const tpl = document.getElementById('home-landed-logo');
    return tpl && tpl.content.firstElementChild ? tpl.content.firstElementChild.cloneNode(true) : null;
  }
  const src = document.querySelector(`.home-picker__item[data-browser="${key}"] svg`);
  if (!src) return null;
  const svg = src.cloneNode(true);
  svg.querySelectorAll('title').forEach((t) => t.remove());
  return svg;
}

function bindRow(row) {
  row._pwaBound = true;
  const btn = document.getElementById('install-app');
  const picker = document.getElementById('browser-picker');
  const toggle = document.getElementById('browser-picker-toggle');
  const help = document.getElementById('install-help');
  if (!HAS_POPOVER) {
    const info = [document.getElementById('pwa-info-toggle'), document.getElementById('pwa-info')];
    [[btn, help], [toggle, picker], info].forEach(([opener, pop]) => {
      if (opener && pop) opener.addEventListener('click', () => (isPopOpen(pop) ? closePop(pop) : openPop(pop)));
    });
  }
  if (picker) {
    picker.addEventListener('click', (e) => {
      const item = e.target.closest('[data-browser]');
      if (!item) return;
      if (item.dataset.browser === 'auto') lsDel(BROWSER_KEY);
      else lsSet(BROWSER_KEY, item.dataset.browser);
      closePop(picker);
      if (toggle) toggle.focus({ preventScroll: true });
      bindInstallButton();
    });
  }
  const copy = document.querySelector('#install-help .home-pop__copy');
  if (copy) copy.addEventListener('click', copyIconUrl);
  const install = document.querySelector('#install-help .home-pop__install');
  if (install) install.addEventListener('click', onPanelInstall);
  loadVariants().then(() => bindInstallButton());
}

let copiedTimer = 0;
async function copyIconUrl() {
  const src = document.querySelector('#install-help .home-pop__icon-src');
  const status = document.querySelector('#install-help .home-pop__copied');
  if (!src || !status) return;
  try {
    await navigator.clipboard.writeText(src.textContent);
    status.textContent = 'Copied!';
  } catch {
    /* No clipboard access (permissions, insecure origin): select it for a manual copy instead */
    const range = document.createRange();
    range.selectNodeContents(src);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    status.textContent = 'Selected; press Ctrl+C';
  }
  clearTimeout(copiedTimer);
  copiedTimer = setTimeout(() => { status.textContent = ''; }, 2000);
}

function bindInstallButton() {
  const row = document.getElementById('home-buttons');
  const btn = document.getElementById('install-app');
  if (!row || !btn) return;
  if (!row._pwaBound) bindRow(row);
  const installed = installedNow || isStandalone();
  const platform = detectPlatform();
  const picked = pickedBrowser();
  const browser = picked || detectBrowser(platform);
  const flow = installFlow(browser, platform);

  const key = installed ? 'landed' : browser;
  const logo = btn.querySelector('.home-btn__logo');
  if (logo && logo.dataset.logo !== key) {
    const svg = logoFor(key);
    logo.replaceChildren(...(svg ? [svg] : []));
    logo.dataset.logo = key;
  }
  btn.querySelector('.home-btn__label').textContent = installed ? 'Mommyship Has Landed' : 'Install Mommyship PWA';
  btn.classList.toggle('home-btn--landed', installed);
  /* Installed, the panel only offers wallpapers, so with none to offer the badge stays inert */
  btn.disabled = installed && !(variantList && variantList.some(hasWallpaper));
  if (HAS_POPOVER && !btn.disabled) btn.setAttribute('popovertarget', 'install-help');
  else btn.removeAttribute('popovertarget');

  const help = document.getElementById('install-help');
  if (help) {
    const mode = installed ? 'landed' : 'install';
    if (help.dataset.mode && help.dataset.mode !== mode) closePop(help);
    help.dataset.mode = mode;
    help.setAttribute('aria-label', installed ? 'Mommyship wallpapers' : 'Install Mommyship');
    /* A held event (even one retired by an icon swap) gets the Install button, which waits for a fresh one */
    const shown = installed ? '' : deferredPrompt ? 'prompt' : flow;
    help.querySelectorAll('[data-flow]').forEach((el) => { el.hidden = el.dataset.flow !== shown; });
    /* Zen, LibreWolf, and Tor use the Firefox steps under their own name */
    const foxName = BROWSER_FAMILY[browser] === 'firefox' ? browserLabel(browser) || 'Firefox' : 'Firefox';
    help.querySelectorAll('.home-pop__browser-name').forEach((el) => { el.textContent = foxName; });
    /* PWAsForFirefox pre-fills from the page's manifest but takes a custom icon via its Icon URL field */
    const iconBox = help.querySelector('.home-pop__icon-url');
    const stored = lsGet(VARIANT_KEY);
    const vid = stored && /^[\w-]+$/.test(stored) ? stored : null;
    if (iconBox) {
      iconBox.hidden = !vid;
      if (vid) {
        const v = variantList && variantList.find((x) => x.id === vid);
        help.querySelector('.home-pop__variant-name').textContent = (v && v.name) || vid;
        help.querySelector('.home-pop__icon-src').textContent = `${location.origin}/assets/icons/${vid}/icon-512.png`;
      }
    }
    renderVariants(variantList, installed);
    if (isPopOpen(help)) positionPop(help);
  }

  const toggle = document.getElementById('browser-picker-toggle');
  if (toggle) {
    toggle.hidden = installed;
    const name = browserLabel(browser);
    toggle.setAttribute('aria-label', name ? `Not your browser? Showing ${name}` : 'Not your browser?');
  }
  document.querySelectorAll('.home-picker [data-browser]').forEach((b) => {
    b.setAttribute('aria-pressed', String(b.dataset.browser === (picked || 'auto')));
  });
  syncVariantPressed();
}

/* Screen Wake Lock for the map monitor; re-acquired whenever the tab comes back */
let wakeLock = null;
export function keepAwake() {
  if (!('wakeLock' in navigator)) return;
  const acquire = async () => {
    if (document.visibilityState !== 'visible' || wakeLock) return;
    try {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => { wakeLock = null; });
    } catch { /* denied on battery saver etc.; nothing to do */ }
  };
  document.addEventListener('visibilitychange', acquire);
  acquire();
}

/* Galaxy offline download: everything in offline.json that isn't cached yet, four at a time.
   Runs in the page, not the worker, so progress is trivial to report. */
export async function getGalaxyOfflineStatus() {
  if (!('caches' in window)) return null;
  let list;
  try {
    const res = await fetch('/galaxy/offline.json', { cache: 'no-store' });
    if (!res.ok) return null;
    list = await res.json();
  } catch { return null; }
  const cache = await caches.open(GALAXY_CACHE);
  await reconcileGalaxyCache(cache, list);
  const keys = new Set((await cache.keys()).map((r) => new URL(r.url).pathname));
  let cachedBytes = 0, totalBytes = 0, missing = [];
  for (const f of list.files) {
    totalBytes += f.size;
    if (keys.has(f.url)) cachedBytes += f.size;
    else missing.push(f);
  }
  return { list, missing, cachedBytes, totalBytes, complete: missing.length === 0 };
}

/* Mirrors the worker's activate-time sweep so a page that fetches a newer offline.json before
   the new worker takes over doesn't count old files (same path, different hash) as saved */
async function reconcileGalaxyCache(cache, fresh) {
  const prevRes = await cache.match(GALAXY_LIST_KEY);
  const prev = prevRes ? await prevRes.json() : null;
  if (prev && prev.build === fresh.build) return;
  if (prev) {
    const freshHash = new Map(fresh.files.map((f) => [f.url, f.hash]));
    await Promise.all(prev.files.map(async (f) => {
      if (freshHash.get(f.url) !== f.hash) await cache.delete(f.url);
    }));
  } else {
    await Promise.all((await cache.keys()).map((k) => cache.delete(k)));
  }
  await cache.put(GALAXY_LIST_KEY, new Response(JSON.stringify(fresh), { headers: { 'Content-Type': 'application/json' } }));
}

export async function downloadGalaxy(onProgress) {
  const status = await getGalaxyOfflineStatus();
  if (!status) throw new Error('Offline list unavailable (build step missing?)');
  await requestPersist();
  const cache = await caches.open(GALAXY_CACHE);
  let done = status.cachedBytes;
  const total = status.totalBytes;
  const queue = status.missing.slice();
  let failed = 0;
  const report = () => { if (onProgress) onProgress({ done, total, failed }); };
  report();
  const worker = async () => {
    while (queue.length) {
      const f = queue.shift();
      try {
        const res = await fetch(f.url, { cache: 'no-store' });
        if (!res.ok) throw new Error(res.status);
        await cache.put(f.url, res);
        done += f.size;
      } catch {
        failed++;
      }
      report();
    }
  };
  await Promise.all([worker(), worker(), worker(), worker()]);
  return { done, total, failed };
}

/* Boot */
injectStyles();
if (isGalaxyPage) root.classList.add('pwa-galaxy');
if (isStandalone()) root.classList.add('pwa-standalone');
bindOfflineBadge();
bindThemeColor();
syncManifest();
bindInstallButton();
registerWorker();

/* Instant navigation swaps the body and diffs the head, which puts the default manifest link
   back; re-apply the picked icon and rebind the homepage row when it appears */
function syncManifest() {
  applyManifest(storedManifest());
  if (storedManifest() !== DEFAULT_MANIFEST) loadVariants();
}
(function bindDocumentStream() {
  if (window.document$) window.document$.subscribe(() => { syncManifest(); bindInstallButton(); });
  else if (!isGalaxyPage) setTimeout(bindDocumentStream, 250);
})();

/* Classic scripts (extra.js) reach the same API through the global */
window.mommyshipPWA = {
  isStandalone, getOpenPage, setOpenPage, requestPersist, canPromptInstall, promptInstall,
  keepAwake, getGalaxyOfflineStatus, downloadGalaxy
};
