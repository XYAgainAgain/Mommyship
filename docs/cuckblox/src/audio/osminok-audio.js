// Osminok Ocean soundscape: the dive page's storm, depth beds, plunge, and creature passbys under the game, lightly
// bitcrushed to sit with the 8-bit effects. Beds stream through <audio> elements and only load as the dive nears them.
import { depthFor, PLUNGE_DEPTH } from '../scenes/osminok.js';
import { dbToGain, rampParam, setParam } from './context.js';
import { MediaWatch } from './media-watch.js';

export const OCEAN_THEME_ID = 'osminok-ocean';

const BED_DB = -14;
const DUCK_DB = -9;
const CRUSH_BITS = 8;
const CRUSH_WET = 0.45;
// 4096 segments over -1..1 put every rounding edge of the 8-bit steps exactly on a curve point
const CRUSH_POINTS = 4097;
const DEPTH_RAMP = 2.5;
const FADE = 0.4;
export const OVER_FADE = 4;
const LOOP_XFADE = 2;
// The second loop element only starts loading this long before the seam, so a bed never downloads twice up front
const LOOP_PREP = 20;
const MAX_ONE_SHOTS = 16;
const SHOT_RETRY_MS = 30000;
const SEAM_DEADLINE = 3;

const ramp = (rise, top, fall, end) => (d) => (d < rise ? 0 : d < top ? (d - rise) / (top - rise) : end === undefined || d <= fall ? 1 : d < end ? 1 - (d - fall) / (end - fall) : 0);

/** The dive page's beds and gain curves, in meters. A bed fetches once the dive passes `fetchFrom` and still needs it. */
export const BEDS = [
  // Above water it's all storm; after the plunge it fades out over 500 m as Near Surface rises
  { id: 'storm', file: 'surface/OsminokMegastorm.ogg', fetchFrom: 0, silentFrom: PLUNGE_DEPTH + 500, level: (d) => Math.max(0, Math.min(1, 1 - (d - PLUNGE_DEPTH) / 500)) },
  { id: 'near', file: 'below/1-NearSurface.ogg', fetchFrom: 0, silentFrom: 1200, level: ramp(PLUNGE_DEPTH, PLUNGE_DEPTH + 300, 800, 1200) },
  { id: 'lurking', file: 'below/2-ThingsLurking.ogg', fetchFrom: 200, silentFrom: 4500, level: ramp(800, 1200, 3000, 4500) },
  { id: 'depths', file: 'below/3-DepthsBelow.ogg', fetchFrom: 2000, silentFrom: 12000, level: ramp(3500, 5000, 10000, 12000) },
  { id: 'abyss', file: 'below/4-Abyss.ogg', fetchFrom: 7000, silentFrom: Infinity, level: ramp(10000, 12000) },
];

export const bedLevels = (depth) => BEDS.map((b) => b.level(depth));
export const shouldFetch = (bed, depth) => depth >= bed.fetchFrom && depth < bed.silentFrom;

/** Open above water, then muffled from the plunge: 400 Hz, tapering to 200 Hz 500 m further down. */
export const stormCutoff = (depth) => (depth < PLUNGE_DEPTH ? 20000 : 400 - 200 * Math.min(1, (depth - PLUNGE_DEPTH) / 500));

// The dive page's pools stop at 11 km; deeper dives keep hearing the deepest ones
export const PASSBY_POOLS = [
  { id: 'A', count: 18, min: 200, max: 4000 },
  { id: 'B', count: 14, min: 3000, max: 7000 },
  { id: 'C', count: 13, min: 6000, max: 10000 },
  { id: 'D', count: 12, min: 9000, max: 11000 },
  { id: 'E', count: 7, min: 200, max: 11000 },
];
const POOL_FLOOR = 11000;

/** Pools a passby can come from at this depth, weighted toward the middle of each pool's range. */
export function passbyWeights(depth) {
  const d = Math.min(depth, POOL_FLOOR);
  if (depth < 200) return [];
  return PASSBY_POOLS.filter((p) => d >= p.min && d <= p.max).map((pool) => {
    const mid = (pool.min + pool.max) / 2;
    const half = (pool.max - pool.min) / 2;
    return { pool, weight: 0.1 + 0.9 * (1 - Math.abs(d - mid) / half) };
  });
}

/** An element's play() as a promise, whether the browser returns one, nothing, or throws. */
function playing(el) {
  try {
    return Promise.resolve(el.play());
  } catch (error) {
    return Promise.reject(error);
  }
}

async function fetchFile(url, signal) {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.arrayBuffer();
}

/** Tone's BitCrusher rounding as a WaveShaper curve: steps of 0.5^(bits - 1), halves rounded up. */
function crushCurve(bits) {
  const step = 0.5 ** (bits - 1);
  const curve = new Float32Array(CRUSH_POINTS);
  for (let i = 0; i < CRUSH_POINTS; i++) curve[i] = step * Math.floor(((i / (CRUSH_POINTS - 1)) * 2 - 1) / step + 0.5);
  return curve;
}

// Releases an element for good: no sound, no download, no node left in the graph
function dropVoice(v) {
  v.el.pause();
  v.el.removeAttribute?.('src');
  v.el.load?.();
  v.source.disconnect();
  v.gain.disconnect();
}

export class OsminokSoundscape {
  /** @param {{ baseUrl: string, enabled?: boolean, makeAudio?: () => HTMLAudioElement, random?: () => number, fetchBytes?: (url: string, signal?: AbortSignal) => Promise<ArrayBuffer> }} opts */
  constructor({ baseUrl, enabled = true, makeAudio = () => new Audio(), random = Math.random, fetchBytes = fetchFile }) {
    this.baseUrl = baseUrl;
    this.enabled = enabled;
    this.makeAudio = makeAudio;
    this.random = random;
    this.fetchBytes = fetchBytes;
    this.context = null;
    this.graph = null;
    this.broken = false;
    this.want = 'stopped';
    this.ducked = false;
    this.depth = 0;
    this.overLeft = 0;
    this.passbyIn = 0;
    this.passbyAt = 0;
    this.passbyGap = 0;
    this.lastPlunge = -1;
    this.nextPlunge = -1;
    this.shots = new Map();
  }

  /** Hands over the audio context the sound effects already unlocked; without one the dive stays silent. */
  setContext(context) {
    // Built nodes belong to their context for life, so a later handover can't strand them
    if (!this.graph) this.context = context ?? null;
    this.#apply(FADE);
  }

  setEnabled(on) {
    this.enabled = on;
    this.#apply(FADE);
  }

  /** Sits lower while the music plays. */
  setDucked(on) {
    if (on === this.ducked) return;
    this.ducked = on;
    this.#apply(FADE);
  }

  setLines(lines) {
    const depth = depthFor(lines);
    if (depth === this.depth) return;
    const plunging = this.depth < PLUNGE_DEPTH && depth >= PLUNGE_DEPTH;
    this.depth = depth;
    if (plunging && this.want === 'playing') this.#plunge();
    if (this.want === 'playing' && depth - this.passbyAt >= this.passbyGap) {
      this.passbyAt = depth;
      this.passbyGap = this.#between(500, 1500);
      this.#passby();
    }
    this.#apply(DEPTH_RAMP);
  }

  /** Starts or carries on. */
  play() {
    if (this.want === 'over') this.#halt();
    if (this.want !== 'playing') {
      this.want = 'playing';
      this.passbyIn = this.#between(8, 20);
      this.passbyAt = this.depth;
      this.passbyGap = this.#between(500, 1500);
    }
    this.#apply(FADE);
  }

  pause() {
    if (this.want === 'over') return;
    this.want = 'paused';
    this.#apply(FADE);
  }

  /** Retries any bed the browser refused to start, for the first user gesture to call. */
  wake() {
    if (this.want !== 'playing' || !this.enabled || !this.graph) return;
    const levels = bedLevels(this.depth);
    this.graph.beds.forEach((bed, i) => {
      const voice = bed.voices[bed.active];
      if (!bed.playing && voice && !bed.dead && levels[i] > 0.01) this.#startBed(bed, voice);
    });
  }

  /** Silences everything and rewinds. */
  stop() {
    this.#halt();
  }

  /** The pressure wins: a slow fade, then a stop. */
  gameOver() {
    if (this.want !== 'playing' && this.want !== 'paused') return;
    this.want = 'over';
    this.overLeft = OVER_FADE;
    if (this.graph) rampParam(this.context, this.graph.master.gain, 0, OVER_FADE);
  }

  /** Call every frame: loop seams, passby timing, and the game-over fade run off it. */
  update(dt) {
    if (this.want === 'stopped' || !this.graph) return;
    if (this.want === 'over') {
      this.overLeft -= dt;
      if (this.overLeft <= 0) this.stop();
      return;
    }
    if (this.want !== 'playing' || !this.enabled) return;
    for (const bed of this.graph.beds) this.#loopCheck(bed, dt);
    this.#watchBeds(dt);
    this.passbyIn -= dt;
    if (this.passbyIn <= 0) {
      this.passbyIn = this.#between(8, 20);
      this.#passby();
    }
  }

  #between(lo, hi) {
    return lo + this.random() * (hi - lo);
  }

  #halt() {
    this.want = 'stopped';
    this.overLeft = 0;
    if (!this.graph) return;
    rampParam(this.context, this.graph.master.gain, 0, 0.05);
    for (const bed of this.graph.beds) {
      bed.xfade = 0;
      bed.voices.forEach((v, i) => {
        if (!v) return;
        v.el.pause();
        v.el.currentTime = 0;
        setParam(this.context, v.gain.gain, i === 0 ? 1 : 0);
      });
      // A bed that failed gets one fresh try per dive, on new elements
      if (bed.dead) {
        for (const v of bed.voices) {
          v?.source.disconnect();
          v?.gain.disconnect();
        }
        bed.voices = [null, null];
        bed.dead = false;
      }
      bed.active = 0;
      bed.playing = false;
      this.#forgetStarts(bed);
    }
  }

  // A failed build (an old browser, a closed context) leaves the dive silent rather than taking the game down with it
  #build() {
    if (this.graph || this.broken || !this.context) return this.graph;
    const ctx = this.context;
    try {
      const master = ctx.createGain();
      setParam(ctx, master.gain, 0);
      const crush = this.#crusher();
      master.connect(crush.dry);
      if (crush.shaper) master.connect(crush.shaper);
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      setParam(ctx, filter.frequency, stormCutoff(0));
      const beds = BEDS.map((spec, i) => {
        const gain = ctx.createGain();
        setParam(ctx, gain.gain, 0);
        gain.connect(master);
        return { spec, gain, input: i === 0 ? filter : gain, voices: [null, null], active: 0, xfade: 0, playing: false, dead: false, attempt: 0, priming: false, primeLeft: 0, seamRefused: false, watch: new MediaWatch() };
      });
      filter.connect(beds[0].gain);
      this.graph = { master, crush, filter, beds };
    } catch (error) {
      this.broken = true;
      console.warn('CUCKBLOX ocean audio is unavailable:', error);
    }
    return this.graph;
  }

  // Tone's BitCrusher crossfades dry and wet at equal power, so 45% wet weighs cos and sin of 0.45 * pi/2.
  // Without a WaveShaper the dry gain alone passes everything through at full level.
  #crusher() {
    const ctx = this.context;
    const dry = ctx.createGain();
    try {
      const shaper = ctx.createWaveShaper();
      shaper.curve = crushCurve(CRUSH_BITS);
      shaper.oversample = 'none';
      const wet = ctx.createGain();
      setParam(ctx, dry.gain, Math.cos((CRUSH_WET * Math.PI) / 2));
      setParam(ctx, wet.gain, Math.sin((CRUSH_WET * Math.PI) / 2));
      shaper.connect(wet);
      wet.connect(ctx.destination);
      dry.connect(ctx.destination);
      return { dry, shaper, wet };
    } catch {
      setParam(ctx, dry.gain, 1);
      dry.connect(ctx.destination);
      return { dry, shaper: null, wet: null };
    }
  }

  // Each element gets one source node for life: a second createMediaElementSource on it would throw
  #voice(bed, i) {
    if (bed.voices[i] || bed.dead) return bed.voices[i];
    try {
      const ctx = this.context;
      const el = this.makeAudio();
      el.preload = 'auto';
      el.loop = true;
      // A failed seam spare just leaves the active element's own loop in charge; only the playing one kills the bed
      el.addEventListener?.('error', () => { if (bed.voices[bed.active]?.el === el) bed.dead = true; });
      el.src = this.baseUrl + bed.spec.file;
      const gain = ctx.createGain();
      setParam(ctx, gain.gain, i === bed.active ? 1 : 0);
      const source = ctx.createMediaElementSource(el);
      source.connect(gain);
      gain.connect(bed.input);
      bed.voices[i] = { el, source, gain };
    } catch (error) {
      bed.dead = true;
      console.warn('CUCKBLOX ocean bed failed:', bed.spec.file, error);
    }
    return bed.voices[i];
  }

  #apply(rampTime) {
    if (this.want === 'stopped' || !this.enabled) {
      if (this.graph) this.#silence();
      return;
    }
    if (this.want === 'over' || !this.#build()) return;
    const g = this.graph;
    const playing = this.want === 'playing';
    const levels = bedLevels(this.depth);
    rampParam(this.context, g.filter.frequency, stormCutoff(this.depth), rampTime, true);
    rampParam(this.context, g.master.gain, playing ? dbToGain(BED_DB + (this.ducked ? DUCK_DB : 0)) : 0, FADE);
    g.beds.forEach((bed, i) => {
      if (shouldFetch(bed.spec, this.depth)) this.#voice(bed, bed.active);
      rampParam(this.context, bed.gain.gain, levels[i], rampTime);
      const voice = bed.voices[bed.active];
      const audible = playing && levels[i] > 0.01 && voice && !bed.dead;
      if (audible && !bed.playing) {
        this.#startBed(bed, voice);
      } else if (!audible && bed.playing) {
        this.#pauseBed(bed);
      }
    });
    this.#warmShots();
  }

  #silence() {
    rampParam(this.context, this.graph.master.gain, 0, 0.05);
    for (const bed of this.graph.beds) if (bed.playing) this.#pauseBed(bed);
  }

  // Pausing mid-seam settles the swap first, so a resume plays one element, not two
  #pauseBed(bed) {
    if (bed.xfade > 0) this.#finishSeam(bed);
    for (const v of bed.voices) v?.el.pause();
    bed.playing = false;
    this.#forgetStarts(bed);
  }

  // A refused start (autoplay policy, a load hiccup) unmarks the bed so the next sync or gesture tries again; a refusal
  // that settles after a newer start or a pause leaves that one alone
  #startBed(bed, voice) {
    bed.playing = true;
    const attempt = ++bed.attempt;
    playing(voice.el).catch(() => { if (bed.attempt === attempt) bed.playing = false; });
  }

  // Any start still settling belongs to a bed that has since paused or rewound
  #forgetStarts(bed) {
    bed.attempt++;
    bed.priming = false;
    bed.seamRefused = false;
    bed.watch.reset();
  }

  // Any bed that should be heard but has stopped moving (an error, a stalled download, a start the browser never
  // answered) is started again, then rebuilt on fresh elements, so a run never stays silent
  #watchBeds(dt) {
    if (this.context.state !== 'running') return;
    const levels = bedLevels(this.depth);
    this.graph.beds.forEach((bed, i) => {
      const voice = bed.voices[bed.active];
      if (levels[i] <= 0.01 || bed.xfade > 0 || bed.priming || (!voice && !bed.dead)) {
        bed.watch.reset();
        return;
      }
      const verdict = bed.watch.check(voice?.el, dt, bed.dead || !voice);
      if (verdict === 'retry') this.#startBed(bed, voice);
      else if (verdict === 'rebuild') this.#rebuildBed(bed);
    });
  }

  // The watch's tries survive the rebuild, so a file that keeps failing is retried less and less often
  #rebuildBed(bed) {
    for (const v of bed.voices) if (v) dropVoice(v);
    bed.voices = [null, null];
    bed.active = 0;
    bed.xfade = 0;
    bed.dead = false;
    bed.playing = false;
    bed.attempt++;
    bed.priming = false;
    bed.seamRefused = false;
    const voice = this.#voice(bed, 0);
    if (voice) this.#startBed(bed, voice);
  }

  #loopCheck(bed, dt) {
    const voice = bed.voices[bed.active];
    if (!bed.playing || !voice) return;
    if (bed.priming) {
      bed.primeLeft -= dt;
      if (bed.primeLeft > 0) return;
      // A spare whose start never answers gives up this seam and is dropped, so the next lap tries a fresh one
      const other = 1 - bed.active;
      if (bed.voices[other]) dropVoice(bed.voices[other]);
      bed.voices[other] = null;
      bed.attempt++;
      bed.priming = false;
      bed.seamRefused = true;
      return;
    }
    if (bed.xfade > 0) {
      bed.xfade -= dt;
      if (bed.xfade <= 0) this.#finishSeam(bed);
      return;
    }
    const { duration, currentTime } = voice.el;
    if (!Number.isFinite(duration) || duration <= LOOP_XFADE * 2) return;
    const left = duration - currentTime;
    if (left > LOOP_XFADE) bed.seamRefused = false;
    const other = 1 - bed.active;
    if (left < LOOP_PREP) this.#voice(bed, other);
    const next = bed.voices[other];
    // Not buffered in time, or refused this lap: the active element's own loop carries the seam instead
    if (left > LOOP_XFADE || bed.priming || bed.seamRefused || !next || next.el.readyState < 3) return;
    this.#beginSeam(bed, voice, next);
  }

  // The crossfade waits for the spare to really start, so a refused one never fades the bed into silence
  #beginSeam(bed, voice, next) {
    next.el.currentTime = 0;
    bed.priming = true;
    bed.primeLeft = SEAM_DEADLINE;
    const attempt = ++bed.attempt;
    playing(next.el).then(() => {
      if (bed.attempt !== attempt) return;
      bed.priming = false;
      rampParam(this.context, voice.gain.gain, 0, LOOP_XFADE);
      rampParam(this.context, next.gain.gain, 1, LOOP_XFADE);
      bed.xfade = LOOP_XFADE;
    }, () => {
      if (bed.attempt !== attempt) return;
      bed.priming = false;
      bed.seamRefused = true;
      next.el.pause();
    });
  }

  #finishSeam(bed) {
    const old = bed.voices[bed.active];
    bed.active = 1 - bed.active;
    bed.xfade = 0;
    old.el.pause();
    old.el.currentTime = 0;
    setParam(this.context, old.gain.gain, 0);
    setParam(this.context, bed.voices[bed.active].gain.gain, 1);
  }

  /** A cached one-shot, fetched and decoded once; `play` sounds it once ready, if the dive is still going. */
  #shot(file, play) {
    let shot = this.shots.get(file);
    // A file that failed or never arrived (a dropped connection, a stalled server) is fetched again once it has rested
    if (shot && !shot.loaded && performance.now() - (shot.failed ? shot.failedAt : shot.startedAt) >= SHOT_RETRY_MS) {
      shot.abort?.abort();
      this.shots.delete(file);
      shot = null;
    }
    if (!shot) {
      const abort = typeof AbortController === 'function' ? new AbortController() : null;
      shot = { buffer: null, loaded: false, failed: false, pending: null, active: new Set(), abort, startedAt: performance.now() };
      this.shots.set(file, shot);
      this.#trimShots();
      const ctx = this.context;
      // The executor runs now, so the fetch starts at once and a synchronous throw still lands as a failure
      new Promise((resolve) => resolve(this.fetchBytes(this.baseUrl + file, abort?.signal)))
        .then((bytes) => ctx.decodeAudioData(bytes))
        .then((buffer) => {
          shot.buffer = buffer;
          shot.loaded = true;
          const pending = shot.pending;
          shot.pending = null;
          if (pending && performance.now() - pending.at < 1500) pending.fn();
        }, () => {
          shot.failed = true;
          shot.failedAt = performance.now();
          shot.pending = null;
        });
    }
    if (play && !shot.failed) {
      const fn = () => this.#fire(shot, play);
      if (shot.loaded) fn();
      else shot.pending = { fn, at: performance.now() };
    }
    return shot;
  }

  // A suspended context would bank one-shots and play them all at once on resume, so they're skipped instead
  #fire(shot, { rate, gain, pan }) {
    if (this.want !== 'playing' || !this.enabled || !this.graph || this.context.state !== 'running') return;
    const ctx = this.context;
    const nodes = [];
    try {
      const source = ctx.createBufferSource();
      nodes.push(source);
      source.buffer = shot.buffer;
      source.playbackRate.value = rate;
      const level = ctx.createGain();
      nodes.push(level);
      level.gain.value = gain;
      const panner = ctx.createStereoPanner();
      nodes.push(panner);
      panner.pan.value = pan;
      source.connect(level);
      level.connect(panner);
      panner.connect(this.graph.master);
      source.onended = () => {
        shot.active.delete(source);
        for (const node of nodes) node.disconnect();
      };
      source.start();
      shot.active.add(source);
    } catch (error) {
      for (const node of nodes) node.disconnect();
      console.warn('CUCKBLOX ocean one-shot skipped:', error);
    }
  }

  // Decoded one-shots are kept to a handful so a long dive never holds every passby in memory
  #trimShots() {
    for (const [file, shot] of this.shots) {
      if (this.shots.size <= MAX_ONE_SHOTS) return;
      if (!shot.loaded || shot.active.size) continue;
      this.shots.delete(file);
    }
  }

  #pick(n, last = -1) {
    let i;
    do i = 1 + Math.floor(this.random() * n); while (n > 1 && i === last);
    return i;
  }

  // The next plunge and a couple of files from each pool coming into range load ahead of time
  #warmShots() {
    if (this.nextPlunge < 0) this.nextPlunge = this.#pick(4, this.lastPlunge);
    if (this.depth < PLUNGE_DEPTH) this.#shot(`surface/Plunge${this.nextPlunge}.ogg`);
    for (const pool of PASSBY_POOLS) {
      const d = Math.min(this.depth, POOL_FLOOR);
      if (d <= pool.min - 500 || d > pool.max) continue;
      const warm = [...this.shots.keys()].filter((f) => f.startsWith(`passby/Passby${pool.id}`)).length;
      for (let k = warm; k < 2; k++) this.#shot(`passby/Passby${pool.id}${this.#pick(pool.count)}.ogg`);
    }
  }

  #plunge() {
    if (!this.graph || !this.enabled) return;
    const i = this.nextPlunge < 0 ? this.#pick(4, this.lastPlunge) : this.nextPlunge;
    this.lastPlunge = i;
    this.nextPlunge = -1;
    this.#shot(`surface/Plunge${i}.ogg`, { rate: 1, gain: 1, pan: 0 });
  }

  #passby() {
    if (!this.graph || !this.enabled || this.want !== 'playing') return;
    const eligible = passbyWeights(this.depth);
    if (!eligible.length) return;
    let roll = this.random() * eligible.reduce((s, e) => s + e.weight, 0);
    let pool = eligible[0].pool;
    for (const e of eligible) {
      roll -= e.weight;
      if (roll <= 0) { pool = e.pool; break; }
    }
    const loaded = [...this.shots.entries()].filter(([f, s]) => s.loaded && f.startsWith(`passby/Passby${pool.id}`));
    // Play something already decoded when there is one, and fetch a new file for variety until a few are cached
    const file = loaded.length ? loaded[Math.floor(this.random() * loaded.length)][0] : `passby/Passby${pool.id}${this.#pick(pool.count)}.ogg`;
    if (loaded.length < 3) this.#shot(`passby/Passby${pool.id}${this.#pick(pool.count)}.ogg`);
    const cents = (this.random() - 0.5) * 600;
    const gain = 0.5 + this.random() * 0.5;
    const pan = -0.8 + this.random() * 1.6;
    this.#shot(file, { rate: 2 ** (cents / 1200), gain, pan });
  }
}
