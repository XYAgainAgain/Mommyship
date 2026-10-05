// Osminok Ocean soundscape: the dive page's storm, depth beds, plunge, and creature passbys under the game, lightly
// bitcrushed to sit with the 8-bit effects. Beds stream through <audio> elements and only load as the dive nears them.
import { depthFor, PLUNGE_DEPTH } from '../scenes/osminok.js';

export const OCEAN_THEME_ID = 'osminok-ocean';

const BED_DB = -14;
const DUCK_DB = -9;
const CRUSH_BITS = 8;
const CRUSH_WET = 0.45;
const DEPTH_RAMP = 2.5;
const FADE = 0.4;
export const OVER_FADE = 4;
const LOOP_XFADE = 2;
// The second loop element only starts loading this long before the seam, so a bed never downloads twice up front
const LOOP_PREP = 20;
const MAX_ONE_SHOTS = 16;

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

const dbToGain = (db) => 10 ** (db / 20);

export class OsminokSoundscape {
  /** @param {{ baseUrl: string, enabled?: boolean, makeAudio?: () => HTMLAudioElement, random?: () => number }} opts */
  constructor({ baseUrl, enabled = true, makeAudio = () => new Audio(), random = Math.random }) {
    this.baseUrl = baseUrl;
    this.enabled = enabled;
    this.makeAudio = makeAudio;
    this.random = random;
    this.Tone = null;
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

  /** Hands over the Tone instance the sound effects already unlocked; without one the dive stays silent. */
  setTone(Tone) {
    this.Tone = Tone ?? null;
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

  /** Silences everything and rewinds. */
  stop() {
    this.#halt();
  }

  /** The pressure wins: a slow fade, then a stop. */
  gameOver() {
    if (this.want !== 'playing' && this.want !== 'paused') return;
    this.want = 'over';
    this.overLeft = OVER_FADE;
    this.graph?.master.gain.rampTo(0, OVER_FADE);
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
    this.graph.master.gain.rampTo(0, 0.05);
    for (const bed of this.graph.beds) {
      bed.xfade = 0;
      bed.voices.forEach((v, i) => {
        if (!v) return;
        v.el.pause();
        v.el.currentTime = 0;
        v.gain.gain.value = i === 0 ? 1 : 0;
      });
      // A bed that failed gets one fresh try per dive, on new elements
      if (bed.dead) {
        for (const v of bed.voices) v?.gain.disconnect();
        bed.voices = [null, null];
        bed.dead = false;
      }
      bed.active = 0;
      bed.playing = false;
    }
  }

  // A failed build (no worklets, an old browser) leaves the dive silent rather than taking the game down with it
  #build() {
    if (this.graph || this.broken || !this.Tone) return this.graph;
    const T = this.Tone;
    try {
      const master = new T.Gain(0);
      let crush;
      try {
        crush = new T.BitCrusher(CRUSH_BITS);
        crush.wet.value = CRUSH_WET;
      } catch {
        crush = new T.Gain(1);
      }
      master.connect(crush);
      crush.toDestination();
      const filter = new T.Filter(stormCutoff(0), 'lowpass');
      const beds = BEDS.map((spec, i) => {
        const gain = new T.Gain(0);
        gain.connect(master);
        return { spec, gain, input: i === 0 ? filter : gain, voices: [null, null], active: 0, xfade: 0, playing: false, dead: false };
      });
      filter.connect(beds[0].gain);
      this.graph = { master, crush, filter, beds };
    } catch (error) {
      this.broken = true;
      console.warn('CUCKBLOX ocean audio is unavailable:', error);
    }
    return this.graph;
  }

  // Each element gets one source node for life: a second createMediaElementSource on it would throw
  #voice(bed, i) {
    if (bed.voices[i] || bed.dead) return bed.voices[i];
    try {
      const T = this.Tone;
      const el = this.makeAudio();
      el.preload = 'auto';
      el.loop = true;
      // A failed seam spare just leaves the active element's own loop in charge; only the playing one kills the bed
      el.addEventListener?.('error', () => { if (bed.voices[bed.active]?.el === el) bed.dead = true; });
      el.src = this.baseUrl + bed.spec.file;
      const gain = new T.Gain(i === bed.active ? 1 : 0);
      T.connect(T.getContext().createMediaElementSource(el), gain);
      gain.connect(bed.input);
      bed.voices[i] = { el, gain };
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
    g.filter.frequency.rampTo(stormCutoff(this.depth), rampTime);
    g.master.gain.rampTo(playing ? dbToGain(BED_DB + (this.ducked ? DUCK_DB : 0)) : 0, FADE);
    g.beds.forEach((bed, i) => {
      if (shouldFetch(bed.spec, this.depth)) this.#voice(bed, bed.active);
      bed.gain.gain.rampTo(levels[i], rampTime);
      const voice = bed.voices[bed.active];
      const audible = playing && levels[i] > 0.01 && voice && !bed.dead;
      if (audible && !bed.playing) {
        voice.el.play()?.catch?.(() => {});
        bed.playing = true;
      } else if (!audible && bed.playing) {
        this.#pauseBed(bed);
      }
    });
    this.#warmShots();
  }

  #silence() {
    this.graph.master.gain.rampTo(0, 0.05);
    for (const bed of this.graph.beds) if (bed.playing) this.#pauseBed(bed);
  }

  // Pausing mid-seam settles the swap first, so a resume plays one element, not two
  #pauseBed(bed) {
    if (bed.xfade > 0) this.#finishSeam(bed);
    for (const v of bed.voices) v?.el.pause();
    bed.playing = false;
  }

  #loopCheck(bed, dt) {
    const voice = bed.voices[bed.active];
    if (!bed.playing || !voice) return;
    if (bed.xfade > 0) {
      bed.xfade -= dt;
      if (bed.xfade <= 0) this.#finishSeam(bed);
      return;
    }
    const { duration, currentTime } = voice.el;
    if (!Number.isFinite(duration) || duration <= LOOP_XFADE * 2) return;
    const left = duration - currentTime;
    const other = 1 - bed.active;
    if (left < LOOP_PREP) this.#voice(bed, other);
    const next = bed.voices[other];
    // Not buffered in time: the active element's own loop carries the seam instead
    if (left > LOOP_XFADE || !next || next.el.readyState < 3) return;
    next.el.currentTime = 0;
    next.el.play()?.catch?.(() => {});
    voice.gain.gain.rampTo(0, LOOP_XFADE);
    next.gain.gain.rampTo(1, LOOP_XFADE);
    bed.xfade = LOOP_XFADE;
  }

  #finishSeam(bed) {
    const old = bed.voices[bed.active];
    bed.active = 1 - bed.active;
    bed.xfade = 0;
    old.el.pause();
    old.el.currentTime = 0;
    old.gain.gain.value = 0;
    bed.voices[bed.active].gain.gain.value = 1;
  }

  /** A cached one-shot; `whenReady` plays it once loaded, if the dive is still going. */
  #shot(file, whenReady) {
    let shot = this.shots.get(file);
    if (!shot) {
      const T = this.Tone;
      try {
        const panner = new T.Panner(0);
        panner.connect(this.graph.master);
        shot = { panner, loaded: false, failed: false, pending: null, player: null };
        shot.player = new T.Player({
          url: this.baseUrl + file,
          onload: () => {
            shot.loaded = true;
            const pending = shot.pending;
            shot.pending = null;
            if (pending && performance.now() - pending.at < 1500) pending.fn();
          },
          onerror: () => { shot.failed = true; },
        }).connect(panner);
      } catch (error) {
        console.warn('CUCKBLOX ocean one-shot failed:', file, error);
        return null;
      }
      this.shots.set(file, shot);
      this.#trimShots();
    }
    if (whenReady && !shot.failed) {
      const fn = () => this.#fire(shot, whenReady);
      if (shot.loaded) fn();
      else shot.pending = { fn, at: performance.now() };
    }
    return shot;
  }

  // Tone's start() throws while the context is still suspended, and that throw would land mid-resume in the shell
  #fire(shot, setUp) {
    if (this.want !== 'playing' || !this.enabled || this.Tone.getContext().state !== 'running') return;
    try {
      setUp(shot);
      shot.player.start();
    } catch (error) {
      console.warn('CUCKBLOX ocean one-shot skipped:', error);
    }
  }

  // Decoded one-shots are kept to a handful so a long dive never holds every passby in memory
  #trimShots() {
    for (const [file, shot] of this.shots) {
      if (this.shots.size <= MAX_ONE_SHOTS) return;
      if (!shot.loaded || shot.player.state === 'started') continue;
      shot.player.dispose();
      shot.panner.dispose();
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
    this.#shot(`surface/Plunge${i}.ogg`, (shot) => {
      shot.panner.pan.value = 0;
      shot.player.playbackRate = 1;
      shot.player.volume.value = 0;
    });
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
    this.#shot(file, (shot) => {
      shot.panner.pan.value = pan;
      shot.player.playbackRate = 2 ** (cents / 1200);
      shot.player.volume.value = 20 * Math.log10(gain);
    });
  }
}
