// CUCKBLOX sound effects: short, fast-decay 8-bit blips synthesized live in plain Web Audio, in the music's key (A
// minor, Korobeiniki's, when nothing is playing). Sound unlocks on the first key or click.
import { createContext, dbToGain } from './context.js';

const HARMONIC_MINOR = [0, 2, 3, 5, 7, 8, 11];
const MAJOR = [0, 2, 4, 5, 7, 9, 11];
const A5 = 81;
const HOME = { root: A5, scale: HARMONIC_MINOR };

/** Where the blips sit for a key ({ root: 0–11, mode } or null): the root nearest A5, a tritone away going down so
 *  nothing gets shriller, on harmonic minor or major. */
export function sfxKey(key) {
  if (!key || !Number.isInteger(key.root)) return HOME;
  const shift = ((((key.root - 9) % 12) + 18) % 12) - 6;
  return { root: A5 + shift, scale: key.mode === 'major' ? MAJOR : HARMONIC_MINOR };
}

/** MIDI note `steps` scale degrees from the key's root (7 steps is an octave). */
export function degree(key, steps) {
  const octave = Math.floor(steps / 7);
  const i = ((steps % 7) + 7) % 7;
  return key.root + octave * 12 + key.scale[i];
}

const midiHz = (n) => 440 * 2 ** ((n - 69) / 12);

// The five voices: a waveform, a level, and how fast it decays. The thud mimics Tone's MembraneSynth,
// sweeping down from `octaves` times its note (a plain multiplier, as Tone does it)
export const VOICES = {
  blip: { wave: 'square', db: -20, decay: 0.06 },
  pulse: { wave: 'pulse', db: -19, decay: 0.09 },
  tri: { wave: 'triangle', db: -11, decay: 0.14 },
  thud: { wave: 'triangle', db: -9, decay: 0.11, octaves: 3, pitchDecay: 0.035 },
  hiss: { wave: 'noise', db: -27, decay: 0.1 },
};
const ATTACK = 0.001;
const RELEASE = 0.02;
// Tone's 0.25-width pulse (high 62.5% of each cycle), built band-limited so it doesn't alias
const PULSE_DUTY = 0.625;
const PULSE_HARMONICS = 64;

// Tone's exponential envelope stage: a target curve that holds at 90% of the span and draws straight to 0
const timeConstant = (span) => Math.log(span + 1) / Math.log(200);

// Schedules that stage from `from` at `start`, stopping at `until` and returning the level there, so a release can
// take over without cancelAndHoldAtTime (Firefox has none)
function approach(param, from, start, span, until) {
  const tc = timeConstant(span);
  const knee = start + 0.9 * span;
  const end = start + span;
  param.setTargetAtTime(0, start, tc);
  if (until <= knee) {
    const level = from * Math.exp(-(until - start) / tc);
    param.setValueAtTime(level, until);
    return level;
  }
  const kneeLevel = from * Math.exp(-(knee - start) / tc);
  param.setValueAtTime(kneeLevel, knee);
  if (until < end) {
    const level = (kneeLevel * (end - until)) / (end - knee);
    param.linearRampToValueAtTime(level, until);
    return level;
  }
  param.linearRampToValueAtTime(0, end);
  return 0;
}

/** Tone's envelope on a gain param: linear attack to `peak`, exponential decay to nothing, and a release at
 *  `releaseAt` if the decay hasn't finished. Returns the time it falls silent. */
export function scheduleEnvelope(param, start, peak, decay, releaseAt) {
  const attackEnd = start + ATTACK;
  param.setValueAtTime(0, start);
  param.linearRampToValueAtTime(peak, attackEnd);
  const decayEnd = attackEnd + decay;
  const cut = Math.max(releaseAt, attackEnd);
  if (cut >= decayEnd) {
    approach(param, peak, attackEnd, decay, Infinity);
    return decayEnd;
  }
  const level = approach(param, peak, attackEnd, decay, cut);
  approach(param, level, cut, RELEASE, Infinity);
  return cut + RELEASE;
}

export class Sound {
  /** @param {{ enabled?: boolean }} opts */
  constructor({ enabled = true } = {}) {
    this.enabled = enabled;
    this.wanted = false;
    this.context = null;
    this.waves = null;
    this.loading = null;
    this.unsubscribe = null;
    this.hardDropping = false;
    this.keySource = null;
  }

  /** Where the current key comes from (the music's currentKey()); each sound reads it once as it starts. */
  followKey(source) {
    this.keySource = typeof source === 'function' ? source : null;
  }

  // Scale steps to MIDI notes, asking for the key on first use only, so one sound never straddles a key change.
  // Any trouble asking falls back to A minor: a broken song can only cost the key, never a sound
  #notes() {
    let key = null;
    return (steps) => {
      if (!key) {
        try {
          key = sfxKey(this.keySource?.());
        } catch {
          key = HOME;
        }
      }
      return steps.map((d) => degree(key, d));
    };
  }

  /** Call from a key or pointer handler: audio may only start after a user gesture. A call that beats load() takes
   *  effect once the context exists, which browsers allow once the page has had a gesture. */
  unlock() {
    this.wanted = true;
    if (this.context) this.#start();
  }

  /** Makes the context every sound shares, once; resolves when it exists (or Web Audio turns out to be missing). */
  load() {
    this.loading ??= Promise.resolve().then(() => {
      this.context = createContext();
      if (this.context && this.wanted) this.#start();
    });
    return this.loading;
  }

  setEnabled(on) {
    this.enabled = on;
  }

  attach(game) {
    this.unsubscribe?.();
    this.unsubscribe = game.on((e) => this.#onGame(e, game));
    this.hardDropping = false;
  }

  detach() {
    this.unsubscribe?.();
    this.unsubscribe = null;
  }

  /** Menu and flow sounds: move, confirm, back, go, pause. */
  ui(kind) {
    if (!this.#ready()) return;
    const at = this.#notes();
    switch (kind) {
      case 'move': this.#seq('blip', at([0]), 0.03, 0.35); break;
      case 'confirm': this.#seq('blip', at([4, 7]), 0.04, 0.5); break;
      case 'back': this.#seq('blip', at([4, 0]), 0.04, 0.45); break;
      case 'go': this.#seq('tri', at([-7, -5, -3, 0]), 0.06, 0.8); break;
      case 'pause': this.#seq('tri', at([0, -3]), 0.06, 0.6); break;
    }
  }

  // A context that refuses to resume (no gesture yet) stays suspended, and #ready keeps every sound quiet until it runs
  #start() {
    if (this.context.state !== 'running') this.context.resume()?.catch?.(() => {});
    this.#build();
  }

  // The pulse's waveform and the hiss's noise are made once; every note is its own short-lived source
  #build() {
    if (this.waves) return;
    const c = this.context;
    try {
      const real = new Float32Array(PULSE_HARMONICS + 1);
      for (let n = 1; n <= PULSE_HARMONICS; n++) real[n] = (4 * Math.sin(Math.PI * n * PULSE_DUTY)) / (Math.PI * n);
      const pulse = c.createPeriodicWave(real, new Float32Array(PULSE_HARMONICS + 1), { disableNormalization: true });
      const noise = c.createBuffer(1, c.sampleRate, c.sampleRate);
      const data = noise.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      this.waves = { pulse, noise };
    } catch (error) {
      console.warn('CUCKBLOX sound effects are unavailable:', error);
    }
  }

  #ready() {
    return this.enabled && !!this.waves && this.context.state === 'running';
  }

  // One note on one voice: its sources through their own envelope, all let go once they end
  #note(voice, note, at, velocity, length) {
    const c = this.context;
    const v = VOICES[voice];
    const nodes = [];
    try {
      const env = c.createGain();
      nodes.push(env);
      env.connect(c.destination);
      const end = scheduleEnvelope(env.gain, at, velocity * dbToGain(v.db), v.decay, at + length);
      const sources = v.wave === 'noise' ? [this.#noise(env, nodes)] : this.#tones(v, note, at, env, nodes);
      // Every source stops at the same instant, so the first to end lets the whole note go
      sources[0].onended = () => {
        for (const n of nodes) n.disconnect();
      };
      for (const src of sources) {
        if (v.wave === 'noise') src.start(at, Math.random() * (this.waves.noise.duration - 0.01));
        else src.start(at);
        src.stop(end);
      }
    } catch (error) {
      for (const n of nodes) n.disconnect();
      console.warn('CUCKBLOX sound effect skipped:', error);
    }
  }

  #noise(env, nodes) {
    const src = this.context.createBufferSource();
    src.buffer = this.waves.noise;
    src.loop = true;
    src.connect(env);
    nodes.push(src);
    return src;
  }

  #tones(v, note, at, env, nodes) {
    const c = this.context;
    const hz = midiHz(note);
    const osc = (into) => {
      const o = c.createOscillator();
      o.frequency.setValueAtTime(v.octaves ? hz * v.octaves : hz, at);
      if (v.octaves) o.frequency.exponentialRampToValueAtTime(hz, at + v.pitchDecay);
      o.connect(into);
      nodes.push(o);
      return o;
    };
    const o = osc(env);
    if (v.wave === 'pulse') o.setPeriodicWave(this.waves.pulse);
    else o.type = v.wave;
    return [o];
  }

  #seq(voice, notes, step, velocity, length = 0.05) {
    if (!this.#ready()) return;
    const now = this.context.currentTime;
    notes.forEach((n, i) => this.#note(voice, n, now + i * step, velocity, length));
  }

  #thud(note, velocity) {
    if (!this.#ready()) return;
    this.#note('thud', note, this.context.currentTime, velocity, 0.08);
  }

  #hiss(length, velocity) {
    if (!this.#ready()) return;
    this.#note('hiss', null, this.context.currentTime, velocity, length);
  }

  #onGame(e, game) {
    if (e.type === 'move' && !e.dx && e.drop >= 100) this.hardDropping = true;
    if (!this.#ready()) {
      if (e.type === 'lock') this.hardDropping = false;
      return;
    }
    const at = this.#notes();
    switch (e.type) {
      case 'move':
        if (e.dx) this.#seq('blip', at([4]), 0, 0.3, 0.02);
        break;
      case 'rotate':
        this.#seq('blip', at([0, 2]), 0.025, 0.45, 0.025);
        break;
      case 'lock':
        // Low thuds from the key's root too, four and three octaves down
        this.#thud(at([this.hardDropping ? -28 : -21])[0], this.hardDropping ? 1 : 0.6);
        if (this.hardDropping) this.#hiss(0.05, 0.5);
        this.hardDropping = false;
        break;
      case 'clear': {
        const n = e.rows.length;
        // Combos climb the scale; louder for more lines, like Lightblocks' 0.4 + lines × 0.2
        const lift = Math.max(0, game.combo);
        if (e.special) {
          this.#seq('pulse', at([0, 2, 4, 6, 7, 9, 11].map((d) => d + lift)), 0.035, 0.9, 0.08);
          this.#hiss(0.25, 0.6);
        } else {
          const notes = at([0, 2, 4, 7].slice(0, n + 1).map((d) => d + lift));
          this.#seq('pulse', notes, 0.045, Math.min(1, 0.4 + n * 0.2), 0.06);
        }
        break;
      }
      case 'hold':
        this.#seq('tri', at([-3, -7]), 0.05, 0.5);
        break;
      case 'callout':
        if (e.kind === 'level') this.#seq('tri', at([-7, -5, -3, 0]), 0.07, 0.8, 0.09);
        else if (e.kind === 'tSpin') this.#seq('blip', at([-1, 0, 7]), 0.04, 0.6);
        break;
      case 'gameOver':
        this.#seq('tri', at([-7, -8, -9, -10, -12, -14]), 0.13, 0.8, 0.14);
        this.#thud(at([-31])[0], 1);
        break;
    }
  }
}
