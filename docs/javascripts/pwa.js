/* Shared PWA runtime for the rules site and galaxy.html: service worker registration, the
   "new version" toast, offline badge, install prompt, on-open setting, and the galaxy
   offline download. Loaded once per full page load; instant navigation keeps it alive. */

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
html.pwa-galaxy .pwa-offline{bottom:2.6rem}
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
      document.body.appendChild(badge);
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

/* Install prompt. Chromium fires beforeinstallprompt; Firefox never does, so it gets the
   PWAsForFirefox guide instead. Both hide once the app is running installed. */
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  bindInstallButton();
});
window.addEventListener('appinstalled', () => {
  deferredPrompt = null;
  requestPersist();
  bindInstallButton();
});

export function canPromptInstall() { return !!deferredPrompt; }

export async function promptInstall() {
  if (!deferredPrompt) return null;
  const evt = deferredPrompt;
  deferredPrompt = null;
  evt.prompt();
  const choice = await evt.userChoice;
  bindInstallButton();
  return choice && choice.outcome;
}

function bindInstallButton() {
  const cta = document.getElementById('install-cta');
  if (!cta) return;
  const btn = document.getElementById('install-app');
  const guide = document.getElementById('install-firefox');
  const isFirefox = /Firefox\//.test(navigator.userAgent);
  if (isStandalone()) { cta.hidden = true; return; }
  if (deferredPrompt) {
    cta.hidden = false;
    btn.hidden = false;
    if (guide) guide.hidden = true;
    if (!btn._pwaBound) {
      btn._pwaBound = true;
      btn.addEventListener('click', () => { promptInstall(); });
    }
  } else if (isFirefox && guide) {
    cta.hidden = false;
    btn.hidden = true;
    guide.hidden = false;
  } else {
    cta.hidden = true;
  }
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
bindInstallButton();
registerWorker();

/* Instant navigation swaps the page body; rebind the homepage button when it appears */
(function bindDocumentStream() {
  if (window.document$) window.document$.subscribe(bindInstallButton);
  else if (!isGalaxyPage) setTimeout(bindDocumentStream, 250);
})();

/* Classic scripts (extra.js) reach the same API through the global */
window.mommyshipPWA = {
  isStandalone, getOpenPage, setOpenPage, requestPersist, canPromptInstall, promptInstall,
  keepAwake, getGalaxyOfflineStatus, downloadGalaxy
};
