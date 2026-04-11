/* IndexedDB cache for GPU-baked textures — planet/star atlases + 3D volume noise.
   Keyed by content hash so shader/param changes auto-invalidate stale entries. */

const DB_NAME = 'galaxy-cache';
const DB_VERSION = 1;
export const CACHE_VERSION = 5;

const STORES = {
  PLANET: 'planet-atlas',
  STAR:   'star-atlas',
  VOLUME: 'volume-3d',
};

let dbPromise = null;

function openDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      for (const name of Object.values(STORES)) {
        if (!db.objectStoreNames.contains(name)) db.createObjectStore(name);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => {
      console.warn('Galaxy cache DB failed to open:', req.error);
      dbPromise = null;
      reject(req.error);
    };
  });
  return dbPromise;
}

/* FNV-1a 32-bit — better avalanche than djb2 for cache key hashing */
function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}

/* Build a cache key from body ID + the params that affect baked output */
export function planetCacheKey(bodyId, params) {
  return fnv1a(JSON.stringify([
    CACHE_VERSION, bodyId, params.seed, params.mode, params.slopeness,
    params.oceanLevel, params.temperature, params.craterDensity, params.specular,
    params.baseColor1, params.baseColor2, params.baseColor3,
    params.atmosphereIntensity, params.atmosphereTint,
    params.bandCount, params.warpStrength, params.stormSize,
    params.crackScale, params.subsurfaceColor,
    params.emissiveIntensity, params.emissiveColor, params.bulbosity,
  ]));
}

export function starCacheKey(bodyId, params) {
  return fnv1a(JSON.stringify([
    CACHE_VERSION, bodyId, params.lowTemp, params.highTemp,
    params.granScale, params.spotAmp, params.slopeness,
    params.emissive, params.radius,
  ]));
}

export function volumeCacheKey(seed, resolution, frequency, octaves, lacunarity, gain) {
  return fnv1a(JSON.stringify([
    CACHE_VERSION, seed, resolution, frequency, octaves, lacunarity, gain,
  ]));
}


export async function getEntry(storeName, key) {
  try {
    const db = await openDB();
    const store = db.transaction(storeName, 'readonly').objectStore(storeName);
    return new Promise((resolve) => {
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => resolve(null);
    });
  } catch { return null; }
}

/* Fire-and-forget write — openDB is the only async step, then put() runs
   synchronously on the fresh transaction so it can't auto-commit early */
export async function putEntry(storeName, key, data) {
  try {
    const db = await openDB();
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).put(data, key);
  } catch (e) {
    console.warn('Galaxy cache write failed:', e);
  }
}

export async function clearStore(storeName) {
  try {
    const db = await openDB();
    db.transaction(storeName, 'readwrite').objectStore(storeName).clear();
  } catch {}
}

export async function clearAll() {
  try {
    const db = await openDB();
    const names = Object.values(STORES);
    const tx = db.transaction(names, 'readwrite');
    for (const name of names) tx.objectStore(name).clear();
  } catch {}
}

/* Convenience: delete the entire database (settings button / manual clear) */
export function deleteDatabase() {
  dbPromise = null;
  indexedDB.deleteDatabase(DB_NAME);
}

export { STORES };
