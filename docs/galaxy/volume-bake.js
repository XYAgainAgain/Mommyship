import * as THREE from 'three';
import { createRng } from './rng.js';
import { STORES, volumeCacheKey, getEntry, putEntry } from './galaxy-cache.js';

const VOLUME_SEED = 31337;
const RESOLUTION = 128;

function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
function lerp(a, b, t) { return a + t * (b - a); }

function grad3d(hash, x, y, z) {
  const h = hash & 15;
  const u = h < 8 ? x : y;
  const v = h < 4 ? y : (h === 12 || h === 14 ? x : z);
  return ((h & 1) ? -u : u) + ((h & 2) ? -v : v);
}

function buildPermutationTable(rng) {
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  const perm = new Uint8Array(512);
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  return perm;
}

function perlin3d(x, y, z, perm) {
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;
  const Z = Math.floor(z) & 255;
  const xf = x - Math.floor(x);
  const yf = y - Math.floor(y);
  const zf = z - Math.floor(z);
  const u = fade(xf), v = fade(yf), w = fade(zf);

  const A  = perm[X] + Y;
  const AA = perm[A] + Z;
  const AB = perm[A + 1] + Z;
  const B  = perm[X + 1] + Y;
  const BA = perm[B] + Z;
  const BB = perm[B + 1] + Z;

  return lerp(
    lerp(
      lerp(grad3d(perm[AA],     xf,     yf,     zf),
           grad3d(perm[BA],     xf - 1, yf,     zf), u),
      lerp(grad3d(perm[AB],     xf,     yf - 1, zf),
           grad3d(perm[BB],     xf - 1, yf - 1, zf), u), v),
    lerp(
      lerp(grad3d(perm[AA + 1], xf,     yf,     zf - 1),
           grad3d(perm[BA + 1], xf - 1, yf,     zf - 1), u),
      lerp(grad3d(perm[AB + 1], xf,     yf - 1, zf - 1),
           grad3d(perm[BB + 1], xf - 1, yf - 1, zf - 1), u), v), w);
}

function fbm3d(x, y, z, perm, octaves, lacunarity, gain) {
  let value = 0, amplitude = 1, frequency = 1, maxVal = 0;
  for (let i = 0; i < octaves; i++) {
    value += amplitude * perlin3d(x * frequency, y * frequency, z * frequency, perm);
    maxVal += amplitude;
    amplitude *= gain;
    frequency *= lacunarity;
  }
  return value / maxVal;
}

function computeVolumeData(seed, res, frequency, octaves, lacunarity, gain) {
  const rng = createRng(seed);
  const perm = buildPermutationTable(rng);
  const data = new Uint8Array(res * res * res);

  for (let z = 0; z < res; z++) {
    for (let y = 0; y < res; y++) {
      for (let x = 0; x < res; x++) {
        const nx = (x / res) * frequency;
        const ny = (y / res) * frequency;
        const nz = (z / res) * frequency;
        const val = fbm3d(nx, ny, nz, perm, octaves, lacunarity, gain) * 0.5 + 0.5;
        data[z * res * res + y * res + x] = Math.floor(Math.max(0, Math.min(1, val)) * 255);
      }
    }
  }
  return data;
}

function dataToTexture(data, res) {
  const texture = new THREE.Data3DTexture(data, res, res, res);
  texture.format = THREE.RedFormat;
  texture.type = THREE.UnsignedByteType;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.wrapR = THREE.RepeatWrapping;
  texture.needsUpdate = true;
  return texture;
}

/* Bake seeded 3D FBM noise, checking IndexedDB cache first */
export async function bakeVolumeTexture(opts = {}) {
  const seed       = opts.seed ?? VOLUME_SEED;
  const res        = opts.resolution ?? RESOLUTION;
  const frequency  = opts.frequency ?? 4.0;
  const octaves    = opts.octaves ?? 5;
  const lacunarity = opts.lacunarity ?? 2.0;
  const gain       = opts.gain ?? 0.5;

  const key = volumeCacheKey(seed, res, frequency, octaves, lacunarity, gain);
  const cached = await getEntry(STORES.VOLUME, key);

  if (cached) {
    console.log('Volume texture: from cache');
    return dataToTexture(cached, res);
  }

  const data = computeVolumeData(seed, res, frequency, octaves, lacunarity, gain);
  putEntry(STORES.VOLUME, key, data);

  return dataToTexture(data, res);
}
