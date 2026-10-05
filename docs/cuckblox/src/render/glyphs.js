// Staryllic: C.U.C.K.'s translation layer glitching, so a letter or two in a UI word briefly shows its Cyrillic
// counterpart. Visual only and deterministic: the same string, time, and slot always give the same result.

// Phonetic counterparts only (P is the "p" sound, П), never look-alikes like R→Я; C, J, Q, W, X, and Y stay Latin
export const STARYLLIC = {
  A: 'А', B: 'Б', V: 'В', G: 'Г', D: 'Д', E: 'Е', Z: 'З', I: 'И', K: 'К', L: 'Л',
  M: 'М', N: 'Н', O: 'О', P: 'П', R: 'Р', S: 'С', T: 'Т', U: 'У', F: 'Ф', H: 'Х',
};
const LOWER = Object.fromEntries(Object.entries(STARYLLIC).map(([l, c]) => [l.toLowerCase(), c.toLowerCase()]));
const MAP = { ...STARYLLIC, ...LOWER };
// Departure Mono draws these Cyrillic letters pixel for pixel like their Latin twins, so swapping them shows nothing
export const TWINS = new Set(['A', 'E', 'M', 'O', 'T', 'a', 'e', 'o']);

// Tuning: how often each word glitches, how long a glitch lasts (seconds), and how many letters it swaps
export const GLITCHES_PER_MINUTE = 2;
export const GLITCH_MIN = 0.08;
export const GLITCH_MAX = 0.25;
// Half of all glitches stutter: the same letters swap again after a short gap, like a signal catching twice
export const DOUBLE_CHANCE = 0.5;
export const DOUBLE_GAP_MIN = 0.05;
export const DOUBLE_GAP_MAX = 0.15;
const LONGEST = 2 * GLITCH_MAX + DOUBLE_GAP_MAX;
export const LETTERS_PER_GLITCH = 2;
// Chance a glitch swaps its full LETTERS_PER_GLITCH rather than one letter
export const EXTRA_LETTER_CHANCE = 0.3;
// Rarer: a short word flips every letter it can
export const WORD_FLIP_CHANCE = 0.06;
export const WORD_FLIP_MAX = 5;
// Each word has a few fixed "weak letter" patterns, which keeps the sprite cache to a handful of variants per word
export const PATTERNS_PER_WORD = 3;
// Glitches are scheduled in windows and never straddle a boundary, so finding the next one stays a short scan
const WINDOW = 6;
const SCAN = 8;
const MIN_WORD = 2;
const UNITS = new Set(['cr', 'kcr']);
const TOKEN = /\{\w+\}/g;
const WORD = /[A-Za-z]+/g;
const DIGIT = /[0-9]/;

let enabled = true;
const never = new Set();
const parsed = new Map();
const PARSE_CACHE = 512;

/** The off switch a setting can flip later. */
export function setFlicker(on) {
  enabled = !!on;
}

export const flickerOn = () => enabled;

/** Strings that must always read exactly as written (prices, initials, player names). */
export function exempt(str) {
  never.add(str);
}

const mix = (a, b) => {
  let h = Math.imul(a ^ b, 0x9e3779b1);
  h ^= h >>> 15;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  return h >>> 0;
};
const unit = (h) => h / 4294967296;

function hashString(str, slot) {
  let h = 0x811c9dc5 ^ slot;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 0x01000193);
  return h >>> 0;
}

/** Picks n distinct entries of list, deterministically from seed. */
function pick(list, n, seed) {
  const pool = [...list];
  const out = [];
  for (let i = 0; i < n && pool.length; i++) out.push(pool.splice(mix(seed, i) % pool.length, 1)[0]);
  return out;
}

/** The words of str that may glitch, each with its swappable positions and fixed patterns. */
function parse(str, slot) {
  const key = `${slot}|${str}`;
  let words = parsed.get(key);
  if (words) return words;
  const hash = hashString(str, slot);
  const tokens = [...str.matchAll(TOKEN)].map((m) => [m.index, m.index + m[0].length]);
  words = [];
  for (const m of str.matchAll(WORD)) {
    const start = m.index;
    const end = start + m[0].length;
    if (m[0].length < MIN_WORD || UNITS.has(m[0].toLowerCase())) continue;
    // Letters glued to a number are a unit or a compact count (25kcr, 1.2K), part of the value
    if (DIGIT.test(str[start - 1] ?? '') || DIGIT.test(str[end] ?? '')) continue;
    if (tokens.some(([a, b]) => start < b && end > a)) continue;
    const spots = [];
    for (let i = start; i < end; i++) if (MAP[str[i]] && !TWINS.has(str[i])) spots.push(i);
    if (!spots.length) continue;
    const seed = mix(hash, words.length + 1);
    const patterns = [];
    for (let p = 0; p < PATTERNS_PER_WORD; p++) {
      const s = mix(seed, 0x51ed + p);
      const n = unit(mix(s, 1)) < EXTRA_LETTER_CHANCE ? LETTERS_PER_GLITCH : 1;
      patterns.push(pick(spots, n, s));
    }
    words.push({ seed, patterns, flip: m[0].length <= WORD_FLIP_MAX ? spots : null });
  }
  if (parsed.size >= PARSE_CACHE) parsed.clear();
  parsed.set(key, words);
  return words;
}

/** The glitch a word has in window k, if any: one or two [start, end) bursts in seconds and the positions they swap. */
function glitchIn(word, k, chance) {
  const h = mix(word.seed, k);
  if (unit(h) >= chance) return null;
  const length = (n) => GLITCH_MIN + unit(mix(h, n)) * (GLITCH_MAX - GLITCH_MIN);
  // Room is kept for a stutter either way, so every burst ends inside its window
  const start = k * WINDOW + unit(mix(h, 1)) * (WINDOW - LONGEST);
  const bursts = [[start, start + length(2)]];
  if (unit(mix(h, 5)) < DOUBLE_CHANCE) {
    const again = bursts[0][1] + DOUBLE_GAP_MIN + unit(mix(h, 6)) * (DOUBLE_GAP_MAX - DOUBLE_GAP_MIN);
    bursts.push([again, again + length(7)]);
  }
  const flip = word.flip && unit(mix(h, 3)) < WORD_FLIP_CHANCE;
  return { bursts, spots: flip ? word.flip : word.patterns[mix(h, 4) % word.patterns.length] };
}

const STILL = (str) => ({ text: str, next: Infinity });

/** What to draw for str at `time` seconds, and the next time that changes (always later than `time`, Infinity
 *  when it never will). `rate` scales the glitch rate (0 is off); `slot` desyncs identical strings. */
export function flicker(str, time, { slot = 0, rate = 1 } = {}) {
  if (!enabled || !(rate > 0) || !str || str.length < MIN_WORD || !Number.isFinite(time) || never.has(str)) return STILL(str);
  const words = parse(str, slot);
  if (!words.length) return STILL(str);
  const chance = Math.min(1, (GLITCHES_PER_MINUTE * rate * WINDOW) / 60);
  const k = Math.floor(time / WINDOW);
  let next = (k + SCAN + 1) * WINDOW;
  let chars = null;
  for (const word of words) {
    for (let j = 0; j <= SCAN; j++) {
      const g = glitchIn(word, k + j, chance);
      const burst = g?.bursts.find(([, end]) => time < end);
      if (!burst) continue;
      if (time >= burst[0]) {
        chars ??= str.split('');
        for (const i of g.spots) chars[i] = MAP[str[i]];
        next = Math.min(next, burst[1]);
      } else next = Math.min(next, burst[0]);
      break;
    }
  }
  return { text: chars ? chars.join('') : str, next };
}

/** Just the string to draw. */
export const glyphs = (str, time, opts) => flicker(str, time, opts).text;

/** Just the next time the drawn string changes. */
export const nextChange = (str, time, opts) => flicker(str, time, opts).next;
