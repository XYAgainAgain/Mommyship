/* Rules pages go network-first, so a fresh push isn't stuck behind a cached copy; big
   galaxy files and fonts go cache-first, re-downloading only when the build's hash list changes. */

/* Stamped by .github/scripts/pwa-build.py at deploy; stays "dev" under zensical serve */
const BUILD = '__BUILD__';

const SHELL_CACHE = 'mommyship-shell-' + BUILD;
const RUNTIME_CACHE = 'mommyship-runtime-' + BUILD;
const GALAXY_CACHE = 'mommyship-galaxy';
const AUDIO_CACHE = 'mommyship-audio';
const KEEP = new Set([SHELL_CACHE, RUNTIME_CACHE, GALAXY_CACHE, AUDIO_CACHE]);

/* Synthetic entry inside the galaxy cache holding the last-applied offline.json */
const GALAXY_LIST_KEY = '/galaxy/offline.json?applied';

/* Bare minimum when precache.json is missing (dev server), so the launcher still works offline */
const SHELL_FALLBACK = ['/', '/launch.html', '/manifest.webmanifest', '/galaxy.html'];

/* Past this the cached page wins; the next load refreshes it. A flaky venue connection
   beats a spinner, at the cost of one possibly stale view. */
const HTML_TIMEOUT_MS = 6000;

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL_CACHE);
    let list = SHELL_FALLBACK;
    try {
      const res = await fetch('/precache.json', { cache: 'no-store' });
      if (res.ok) list = (await res.json()).files;
    } catch (e) { /* dev server: no post-build lists */ }
    /* One bad URL must not fail the whole install; addAll is all-or-nothing */
    await Promise.all(list.map(async (url) => {
      try {
        const res = await fetch(url, { cache: 'no-store' });
        if (res.ok) await cache.put(url, res);
      } catch (e) { /* skip */ }
    }));
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((n) => n.startsWith('mommyship-') && !KEEP.has(n)).map((n) => caches.delete(n)));
    await reconcileGalaxyCache();
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  const msg = event.data || {};
  if (msg.type === 'SKIP_WAITING') self.skipWaiting();
});

/* Drop galaxy files whose hash changed or that vanished from the new build's list, so
   cache-first can never pin a stale texture or module after a deploy */
async function reconcileGalaxyCache() {
  let fresh;
  try {
    const res = await fetch('/galaxy/offline.json', { cache: 'no-store' });
    if (!res.ok) return;
    fresh = await res.json();
  } catch (e) { return; }
  const cache = await caches.open(GALAXY_CACHE);
  const prevRes = await cache.match(GALAXY_LIST_KEY);
  const prev = prevRes ? await prevRes.json() : null;
  if (prev && prev.build === fresh.build) return;
  if (prev) {
    const freshHash = new Map(fresh.files.map((f) => [f.url, f.hash]));
    await Promise.all(prev.files.map(async (f) => {
      if (freshHash.get(f.url) !== f.hash) await cache.delete(f.url);
    }));
  } else {
    /* Entries with no recorded hashes can't be trusted after a deploy */
    await Promise.all((await cache.keys()).map((k) => cache.delete(k)));
  }
  await cache.put(GALAXY_LIST_KEY, new Response(JSON.stringify(fresh), { headers: { 'Content-Type': 'application/json' } }));
}

/* Routing */
/* Instant navigation fetches pages with a plain Accept, so the path shape counts too */
const isHTML = (req, path) => req.mode === 'navigate' || /\/$|\.html$/.test(path)
  || (req.headers.get('accept') || '').includes('text/html');
const isAudio = (path) => /\.(ogg|mp3|wav|m4a|opus)$/i.test(path);
const isGalaxyStatic = (path) => (path.startsWith('/galaxy/') && !isAudio(path)) || path.startsWith('/vendor/');
/* Galaxy code is small and changes with every push: network-first while online */
const isGalaxyCode = (path) => path.startsWith('/galaxy/') && /\.(js|css|json)$/.test(path);
/* The site's own scripts and styles aren't hashed; serving them stale would pair new pages with old code */
const isSiteCode = (path) => path.startsWith('/javascripts/') || path.startsWith('/stylesheets/') || path.startsWith('/cuckblox/');
const isImmutable = (path) => path.startsWith('/assets/javascripts/') || path.startsWith('/assets/stylesheets/')
  || path.startsWith('/assets/fonts/') || path.startsWith('/assets/icons/');

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  const path = url.pathname;
  /* Big one-off downloads (rules ZIP, wallpapers) stay out of every cache; a stale latest.zip would outlive a version bump */
  if (path.startsWith('/downloads/') || path.startsWith('/assets/rules/')) return;

  if (isAudio(path)) { event.respondWith(audioResponse(event)); return; }
  if (isHTML(req, path)) { event.respondWith(networkFirst(event, SHELL_CACHE, true)); return; }
  if (isGalaxyCode(path)) { event.respondWith(networkFirst(event, GALAXY_CACHE, false)); return; }
  if (isGalaxyStatic(path)) { event.respondWith(cacheFirst(event, GALAXY_CACHE)); return; }
  if (isSiteCode(path)) { event.respondWith(networkFirst(event, SHELL_CACHE, false)); return; }
  if (isImmutable(path)) { event.respondWith(cacheFirst(event, SHELL_CACHE)); return; }
  event.respondWith(staleWhileRevalidate(event, RUNTIME_CACHE));
});

/* Pages are keyed without their query so galaxy.html?view=2d finds the cached galaxy.html */
function cacheKey(req) {
  if (!req.url.includes('?')) return req;
  return new Request(req.url.split('?')[0], { headers: req.headers, mode: 'same-origin' });
}

async function fromAnyCache(req) {
  return (await caches.match(cacheKey(req))) || null;
}

/* The worker may be killed once respondWith settles; waitUntil keeps it alive for the write */
function store(event, cacheName, req, res) {
  event.waitUntil(caches.open(cacheName).then((c) => c.put(cacheKey(req), res)).catch(() => {}));
}

async function networkFirst(event, cacheName, offlinePage) {
  const req = event.request;
  if (!navigator.onLine) {
    const hit = await fromAnyCache(req);
    if (hit) return hit;
  }
  try {
    const res = await fetchWithTimeout(req, HTML_TIMEOUT_MS);
    if (res.ok) store(event, cacheName, req, res.clone());
    return res;
  } catch {
    const hit = await fromAnyCache(req);
    if (hit) return hit;
  }
  /* Timed out with nothing cached: a slow answer beats none, and a real outage fails fast here */
  try {
    const res = await fetch(req);
    if (res.ok) store(event, cacheName, req, res.clone());
    return res;
  } catch (e) {
    if (offlinePage) return offlineResponse();
    throw e;
  }
}

async function cacheFirst(event, cacheName) {
  const req = event.request;
  const hit = await fromAnyCache(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok) store(event, cacheName, req, res.clone());
  return res;
}

async function staleWhileRevalidate(event, cacheName) {
  const req = event.request;
  const hit = await fromAnyCache(req);
  const refresh = fetch(req).then((res) => {
    if (res.ok) store(event, cacheName, req, res.clone());
    return res;
  }).catch(() => null);
  if (hit) { event.waitUntil(refresh); return hit; }
  const res = await refresh;
  if (res) return res;
  return Response.error();
}

function fetchWithTimeout(req, ms) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), ms);
  return fetch(req, { signal: ctl.signal }).finally(() => clearTimeout(timer));
}

/* Audio: cached whole on first play. <audio> elements ask in byte ranges, which the Cache API can't store, so one
   full download per file answers every range it can while it runs, then lands in the cache for later plays to slice. */
const audioFills = new Map();
/* How far past the download's front an ask still waits for it rather than going to the network */
const FILL_REACH = 512 * 1024;

async function audioResponse(event) {
  const req = event.request;
  const url = req.url;
  const range = parseRange(req.headers.get('range'));
  try {
    const cache = await caches.open(AUDIO_CACHE);
    let fill = audioFills.get(url);
    if (!fill) {
      const full = await cache.match(url);
      if (full) return range ? await audioSlice(full, range) : full;
      fill = audioFills.get(url) || startFill(event, cache, url);
    }
    if (!(await fill.ready)) return await passthrough(req);
    const span = range ? resolveRange(range, fill.total) : { start: 0, end: fill.total - 1 };
    if (!span) return unsatisfiable(fill.total);
    /* Further on than the download has reached (a seek ahead, or the file's end read for its length): the network
       answers that sooner, and the element comes back for the rest at a point the download already holds */
    if (span.start > fill.received + FILL_REACH) return await passthrough(req);
    const body = fillStream(fill, span.start, span.end);
    if (!range) return new Response(body, { headers: { 'Content-Type': fill.type, 'Content-Length': String(fill.total) } });
    return new Response(body, { status: 206, headers: rangeHeaders(fill.type, span.start, span.end, fill.total) });
  } catch (e) {
    return Response.error();
  }
}

/* Downloads the whole file once, keeping its bytes for any range asked for meanwhile. `ready` resolves to the fill,
   or to null when the answer can't be shared (not a plain 200 of known length), so asks go to the network instead. */
function startFill(event, cache, url) {
  const fill = { chunks: [], received: 0, total: 0, type: 'audio/ogg', failed: false, wake: [] };
  const wakeAll = () => { for (const wake of fill.wake.splice(0)) wake(); };
  let settle;
  fill.ready = new Promise((resolve) => { settle = resolve; });
  audioFills.set(url, fill);
  event.waitUntil((async () => {
    try {
      const res = await fetch(url);
      const total = Number(res.headers.get('content-length'));
      if (res.status !== 200 || !(total > 0) || res.headers.get('content-encoding')) {
        if (res.body) res.body.cancel().catch(() => {});
        settle(null);
        return;
      }
      fill.total = total;
      fill.type = res.headers.get('content-type') || fill.type;
      settle(fill);
      const reader = res.body.getReader();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        fill.chunks.push(value);
        fill.received += value.byteLength;
        wakeAll();
      }
      if (fill.received !== total) throw new Error('audio download cut short');
      const blob = new Blob(fill.chunks, { type: fill.type });
      await cache.put(url, new Response(blob, { headers: { 'Content-Type': fill.type, 'Content-Length': String(total) } })).catch(() => {});
    } catch (e) {
      fill.failed = true;
      settle(null);
    } finally {
      audioFills.delete(url);
      wakeAll();
    }
  })());
  return fill;
}

/* Bytes start–end of a fill as they arrive, one stored chunk per pull so a paused element holds nothing extra */
function fillStream(fill, start, end) {
  let at = start;
  let index = 0;
  let base = 0;
  let cancelled = false;
  return new ReadableStream({
    async pull(controller) {
      while (at >= fill.received && !fill.failed && !cancelled) await new Promise((wake) => fill.wake.push(wake));
      if (cancelled) return;
      if (at >= fill.received) {
        controller.error(new Error('audio download failed'));
        return;
      }
      while (base + fill.chunks[index].byteLength <= at) base += fill.chunks[index++].byteLength;
      const chunk = fill.chunks[index];
      const piece = chunk.subarray(at - base, Math.min(chunk.byteLength, end + 1 - base));
      controller.enqueue(piece);
      at += piece.byteLength;
      if (at > end) controller.close();
    },
    cancel() {
      cancelled = true;
    }
  });
}

/* Chrome refuses a media element whose ranges mix the worker's own responses with network ones, so these are rewrapped */
async function passthrough(req) {
  const res = await fetch(req);
  if (!res.body) return res;
  const headers = new Headers(res.headers);
  /* The body arrives already decoded */
  if (headers.has('content-encoding')) {
    headers.delete('content-encoding');
    headers.delete('content-length');
  }
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
}

/* { start, end } from a single-range header, either side null when left open (start null is a suffix); null otherwise */
function parseRange(header) {
  const m = /^bytes=(\d*)-(\d*)$/.exec(header || '');
  if (!m || (!m[1] && !m[2])) return null;
  return { start: m[1] ? parseInt(m[1], 10) : null, end: m[2] ? parseInt(m[2], 10) : null };
}

/* The range as inclusive byte offsets inside a file of `total` bytes, or null when none of it is there */
function resolveRange(range, total) {
  if (range.start === null) return range.end > 0 ? { start: Math.max(0, total - range.end), end: total - 1 } : null;
  const end = range.end === null ? total - 1 : Math.min(range.end, total - 1);
  return range.start > end ? null : { start: range.start, end };
}

const unsatisfiable = (total) => new Response(null, { status: 416, headers: { 'Content-Range': 'bytes */' + total } });

/* A Blob slice stays on disk where the browser keeps it there, so a seek never reads the whole file into memory */
async function audioSlice(full, range) {
  const blob = await full.blob();
  const span = resolveRange(range, blob.size);
  if (!span) return unsatisfiable(blob.size);
  const type = full.headers.get('Content-Type') || 'audio/ogg';
  return new Response(blob.slice(span.start, span.end + 1), { status: 206, headers: rangeHeaders(type, span.start, span.end, blob.size) });
}

function rangeHeaders(type, start, end, total) {
  return {
    'Content-Type': type,
    'Content-Range': 'bytes ' + start + '-' + end + '/' + total,
    'Content-Length': String(end - start + 1),
    'Accept-Ranges': 'bytes'
  };
}

function offlineResponse() {
  const html = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">'
    + '<meta name="viewport" content="width=device-width, initial-scale=1"><title>Offline</title>'
    + '<style>html{background:#0d0d1a;color:#fffaff;font-family:system-ui,sans-serif}'
    + 'body{display:grid;place-items:center;min-height:100vh;margin:0;text-align:center;padding:1rem}'
    + 'a{color:#F679E5}</style></head><body><div><h1>Offline</h1>'
    + '<p>This page isn’t saved on this device yet.</p><p><a href="/">Back to the rules</a></p></div></body></html>';
  return new Response(html, { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
