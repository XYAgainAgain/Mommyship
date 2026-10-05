// CUCKBLOX key finding: reads a Sine Sculptor song's pitched notes into a key timeline so the sound effects can play
// in whatever key the music is in. Pure and synchronous; a whole bundle takes a few milliseconds.

/** Sine Sculptor stores every song in 960 ticks per beat; a bundle's sourcePpq only remembers the imported MIDI's. */
export const SONG_PPQ = 960;

// Krumhansl-Kessler probe-tone profiles, tonic first
const MAJOR_PROFILE = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
// Load-time analysis budget: bars in the song, and bar crossings summed over every note
const MAX_BARS = 20000;
const MAX_WORK = 2_000_000;
const MINOR_PROFILE = [6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];
const NAMES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
const UNPITCHED_ROLES = new Set(['kit', 'perc']);

// Each bar is judged on the bars around it, then a key change costs this much correlation, so a passing chord
// (worth well under one bar of evidence) never flips the key and a real modulation of a few bars does
const WINDOW_BEFORE = 1;
const WINDOW_AFTER = 2;
const SWITCH_COST = 1;
const OPENING_BARS = 4;

export const keyName = (key) => (key ? `${NAMES[key.root]} ${key.mode}` : 'none');

const ticksPerBar = (ts) => Math.max(1, Math.round(((ts?.beats || 4) * SONG_PPQ * 4) / (ts?.unit || 4)));

/** Pearson correlation of a 12-bin histogram against a profile rotated to `root`; 0 for an empty histogram. */
function correlate(hist, profile, root) {
  let sx = 0;
  let sy = 0;
  for (let i = 0; i < 12; i++) {
    sx += hist[i];
    sy += profile[i];
  }
  const mx = sx / 12;
  const my = sy / 12;
  let num = 0;
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < 12; i++) {
    const x = hist[(i + root) % 12] - mx;
    const y = profile[i] - my;
    num += x * y;
    dx += x * x;
    dy += y * y;
  }
  return dx > 0 && dy > 0 ? num / Math.sqrt(dx * dy) : 0;
}

/** Scores for all 24 keys, majors first (index = root, then 12 + root for minors). */
function scores(hist) {
  const out = new Float64Array(24);
  for (let r = 0; r < 12; r++) {
    out[r] = correlate(hist, MAJOR_PROFILE, r);
    out[12 + r] = correlate(hist, MINOR_PROFILE, r);
  }
  return out;
}

const keyOf = (index) => ({ root: index % 12, mode: index < 12 ? 'major' : 'minor' });

/** Every pitched note as [startTick, endTick, pitchClass], skipping kits, percussion, mutes, and pattern clips. */
function pitchedNotes(bundle) {
  const song = bundle?.song ?? bundle;
  const kits = new Set((bundle?.instruments ?? []).filter((i) => i?.kit).map((i) => i.id));
  const out = [];
  for (const track of song?.tracks ?? []) {
    if (!track || track.mute || UNPITCHED_ROLES.has(track.role) || kits.has(track.instrumentId)) continue;
    for (const clip of track.clips ?? []) {
      // Pattern clips hold no notes of their own; Sine Sculptor's step patterns are drum lanes
      if (!clip || clip.patternId !== undefined) continue;
      const start = Number(clip.startTick) || 0;
      const length = Number(clip.lengthTicks) || Infinity;
      for (const n of clip.notes ?? []) {
        const tick = Number(n?.tick);
        const dur = Number(n?.durationTicks);
        const midi = Number(n?.midi);
        if (!Number.isFinite(tick) || !Number.isFinite(midi) || !(dur > 0) || tick < 0 || tick >= length) continue;
        out.push([start + tick, start + Math.min(tick + dur, length), ((Math.round(midi) % 12) + 12) % 12]);
      }
    }
  }
  return out;
}

/** One bar's correlation with one key, by key index. */
function barScore(bins, bar, k) {
  const profile = k < 12 ? MAJOR_PROFILE : MINOR_PROFILE;
  return correlate(bins.subarray(bar * 12, bar * 12 + 12), profile, k % 12);
}

// The window looks ahead, so it hears a modulation coming a bar or two early; each change slides to the bar line
// that best splits the nearby bars between the old key and the new one, judged a bar at a time
function refineChanges(path, bins) {
  const bars = path.length;
  for (let b = 1; b < bars; b++) {
    if (path[b] === path[b - 1]) continue;
    const before = path[b - 1];
    const after = path[b];
    let lo = b;
    while (lo - 1 >= Math.max(1, b - WINDOW_AFTER) && path[lo - 1] === before) lo--;
    let hi = b;
    while (hi + 1 < bars && hi + 1 <= b + WINDOW_BEFORE && path[hi + 1] === after) hi++;
    let bestAt = b;
    let bestScore = -Infinity;
    for (let c = lo; c <= hi; c++) {
      let score = 0;
      for (let x = lo; x <= hi; x++) score += barScore(bins, x, x < c ? before : after);
      if (score > bestScore + 1e-9 || (Math.abs(score - bestScore) <= 1e-9 && Math.abs(c - b) < Math.abs(bestAt - b))) {
        bestScore = score;
        bestAt = c;
      }
    }
    for (let x = lo; x <= hi; x++) path[x] = x < bestAt ? before : after;
    b = Math.max(b, bestAt);
  }
}

/** Where the player's whole-song loop wraps: the last clip's end over every track, kits included, rounded up to a bar. */
function loopTicks(song, bar, notesEnd) {
  let end = notesEnd;
  for (const track of song?.tracks ?? []) {
    for (const clip of track?.clips ?? []) {
      const e = (Number(clip?.startTick) || 0) + (Number(clip?.lengthTicks) || 0);
      if (Number.isFinite(e)) end = Math.max(end, e);
    }
  }
  return Math.max(1, Math.ceil(end / bar)) * bar;
}

/** A song's transpose rule as { dial, points }, with the dial's name the player answers getDial() to. */
function transposeRule(bundle) {
  const rule = bundle?.song?.rules?.transpose;
  if (!rule?.points?.length) return null;
  const entry = Object.entries(bundle.dials ?? {}).find(([, d]) => d?.id === rule.dialId);
  return entry ? { dial: entry[0], points: rule.points } : null;
}

/** Semitones a transpose rule gives at a dial value: Sine Sculptor's straight-line curve, whole steps, ±24 at most. */
export function transposeAt(rule, value) {
  const pts = rule?.points;
  if (!pts?.length || !Number.isFinite(value)) return 0;
  let y = pts[pts.length - 1].y;
  if (value <= pts[0].x) y = pts[0].y;
  else {
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1];
      const b = pts[i];
      if (value > b.x) continue;
      y = b.x === a.x ? b.y : a.y + ((value - a.x) / (b.x - a.x)) * (b.y - a.y);
      break;
    }
  }
  return Number.isFinite(y) ? Math.max(-24, Math.min(24, Math.round(y))) : 0;
}

/**
 * The song's keys over its ticks: { segments: [{ fromTick, root, mode }], lengthTicks, key, transpose } where root is
 * a pitch class (0 = C), key is the one heard longest, and transpose is the song's dial-driven transpose rule if any.
 * Segments start on bar lines; a song with no pitched notes gets none.
 */
export function analyzeSong(bundle) {
  const song = bundle?.song ?? bundle;
  const bar = ticksPerBar(song?.timeSignature);
  const notes = pitchedNotes(bundle);
  if (!notes.length) return { segments: [], lengthTicks: 0, key: null, transpose: null };
  let notesEnd = 0;
  for (const [, e] of notes) notesEnd = Math.max(notesEnd, e);
  const lengthTicks = loopTicks(song, bar, notesEnd);
  const bars = Math.ceil(notesEnd / bar);
  // This runs synchronously at load, so a pathological bundle gets no key following rather than a frozen tab
  let work = 0;
  for (const [s, e] of notes) work += Math.ceil(e / bar) - Math.floor(s / bar);
  if (bars > MAX_BARS || work > MAX_WORK) return { segments: [], lengthTicks, key: null, transpose: null };
  const bins = new Float64Array(bars * 12);
  const opening = new Float64Array(12);
  for (const [s, e, pc] of notes) {
    // A note held across bar lines counts in each bar for as long as it sounds there
    for (let b = Math.floor(s / bar); b < bars && b * bar < e; b++) {
      const overlap = (Math.min(e, (b + 1) * bar) - Math.max(s, b * bar)) / SONG_PPQ;
      bins[b * 12 + pc] += overlap;
      if (b < OPENING_BARS) opening[pc] += overlap;
    }
  }
  const openingScores = scores(opening);
  let openingIndex = 0;
  for (let k = 1; k < 24; k++) if (openingScores[k] > openingScores[openingIndex]) openingIndex = k;

  // Viterbi over 24 keys: each bar earns its window's correlation, each change pays SWITCH_COST
  const window = new Float64Array(12);
  let best = new Float64Array(24);
  const from = new Int8Array(bars * 24);
  for (let b = 0; b < bars; b++) {
    window.fill(0);
    for (let w = Math.max(0, b - WINDOW_BEFORE); w <= Math.min(bars - 1, b + WINDOW_AFTER); w++) {
      for (let i = 0; i < 12; i++) window[i] += bins[w * 12 + i];
    }
    const emit = scores(window);
    const next = new Float64Array(24);
    let leader = 0;
    for (let k = 1; k < 24; k++) if (best[k] > best[leader]) leader = k;
    for (let k = 0; k < 24; k++) {
      // The first bar leans on the opening phrase's key, so a lone pickup note doesn't start somewhere odd
      const stay = b === 0 ? (k === openingIndex ? SWITCH_COST / 2 : 0) : best[k];
      const jump = b === 0 ? -Infinity : best[leader] - SWITCH_COST;
      const fromSelf = stay >= jump;
      next[k] = (fromSelf ? stay : jump) + emit[k];
      from[b * 24 + k] = fromSelf ? k : leader;
    }
    best = next;
  }
  let k = 0;
  for (let i = 1; i < 24; i++) if (best[i] > best[k]) k = i;
  const path = new Int8Array(bars);
  for (let b = bars - 1; b >= 0; b--) {
    path[b] = k;
    k = from[b * 24 + k];
  }
  refineChanges(path, bins);
  const segments = [];
  const heard = new Float64Array(24);
  for (let b = 0; b < bars; b++) {
    heard[path[b]]++;
    if (b > 0 && path[b] === path[b - 1]) continue;
    segments.push({ fromTick: b * bar, ...keyOf(path[b]) });
  }
  // Ties go to the key heard first
  let longest = path[0];
  for (const { root, mode } of segments) {
    const i = (mode === 'minor' ? 12 : 0) + root;
    if (heard[i] > heard[longest]) longest = i;
  }
  return { segments, lengthTicks, key: keyOf(longest), transpose: transposeRule(bundle) };
}

/** The key sounding at a song tick (wrapped into the song's loop), or null for a timeline with no keys. */
export function keyAt(timeline, tick) {
  const segs = timeline?.segments;
  if (!segs?.length || !Number.isFinite(tick)) return null;
  const length = timeline.lengthTicks;
  let t = Math.max(0, tick);
  if (length > 0 && t >= length) t %= length;
  let lo = 0;
  let hi = segs.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (segs[mid].fromTick <= t) lo = mid;
    else hi = mid - 1;
  }
  const { root, mode } = segs[lo];
  return { root, mode };
}

/** A key's place on the circle of fifths, 0–11 clockwise from C; a minor key sits with its relative major. */
export const fifthsPosition = ({ root, mode }) => (((mode === 'minor' ? root + 3 : root) * 7) % 12);

/**
 * Shuffle order for `items` ([{ id, key }]): one fixed lap clockwise around the circle of fifths (keyless songs after
 * B, ties in list order), turned to begin at `startId`. Fixing the lap first means stepping from any song always
 * reaches every other one, even when keys tie or are unknown.
 */
export function circleOrder(items, startId) {
  const lap = items
    .map((item, index) => ({ item, index, d: item.key ? fifthsPosition(item.key) : 12 }))
    .sort((a, b) => a.d - b.d || a.index - b.index);
  const at = Math.max(0, lap.findIndex(({ item }) => item.id === startId));
  return [...lap.slice(at), ...lap.slice(0, at)].map(({ item }) => item.id);
}
