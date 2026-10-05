// CUCKBLOX sound effects: short, fast-decay 8-bit blips synthesized live with Tone.js, in the music's key (A minor,
// Korobeiniki's, when nothing is playing). Tone loads in the background; sound unlocks on the first key or click.

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

export class Sound {
  /** @param {{ toneUrl: string, enabled?: boolean }} opts */
  constructor({ toneUrl, enabled = true }) {
    this.toneUrl = toneUrl;
    this.enabled = enabled;
    this.wanted = false;
    this.Tone = null;
    this.voices = null;
    this.loading = null;
    this.last = new Map();
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

  /** Call from a key or pointer handler: audio may only start after a user gesture. If Tone is still downloading,
   *  it starts on arrival, which browsers allow once the page has had a gesture. */
  unlock() {
    this.wanted = true;
    if (this.Tone) this.#start();
  }

  /** Fetches Tone.js once, as a classic script that defines window.Tone. */
  load() {
    if (this.loading) return this.loading;
    this.loading = new Promise((resolve) => {
      if (globalThis.Tone) return resolve();
      const s = document.createElement('script');
      s.src = this.toneUrl;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => resolve();
      document.head.append(s);
    }).then(() => {
      this.Tone = globalThis.Tone ?? null;
      if (this.Tone && this.wanted) this.#start();
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

  // Tone keeps its own context: handing it a native AudioContext breaks its node checks, so nothing ever builds
  #start() {
    if (this.Tone.getContext().state !== 'running') this.Tone.start();
    this.#build();
  }

  // Two Tone instruments cover everything: a square blip and a triangle tone, plus a drum-like thud and a noise hiss
  #build() {
    if (this.voices) return;
    const T = this.Tone;
    const env = (decay) => ({ attack: 0.001, decay, sustain: 0, release: 0.02 });
    this.voices = {
      blip: new T.PolySynth(T.Synth, { oscillator: { type: 'square' }, envelope: env(0.06), volume: -20 }).toDestination(),
      pulse: new T.PolySynth(T.Synth, { oscillator: { type: 'pulse', width: 0.25 }, envelope: env(0.09), volume: -19 }).toDestination(),
      tri: new T.PolySynth(T.Synth, { oscillator: { type: 'triangle' }, envelope: env(0.14), volume: -11 }).toDestination(),
      thud: new T.MembraneSynth({ pitchDecay: 0.035, octaves: 3, oscillator: { type: 'triangle' }, envelope: env(0.11), volume: -9 }).toDestination(),
      hiss: new T.NoiseSynth({ noise: { type: 'white' }, envelope: env(0.1), volume: -27 }).toDestination(),
    };
  }

  #ready() {
    return this.enabled && this.voices && this.Tone.getContext().state === 'running';
  }

  // Monophonic sources refuse two starts at the same instant, so every trigger on a voice is nudged past the last
  #time(voice, offset) {
    const t = Math.max(this.Tone.now() + offset, (this.last.get(voice) ?? 0) + 0.004);
    this.last.set(voice, t);
    return t;
  }

  #seq(voice, notes, step, velocity, length = 0.05) {
    if (!this.#ready()) return;
    const T = this.Tone;
    notes.forEach((n, i) => {
      const t = this.#time(voice, i * step);
      this.voices[voice].triggerAttackRelease(T.Frequency(n, 'midi').toFrequency(), length, t, velocity);
    });
  }

  #thud(note, velocity) {
    if (!this.#ready()) return;
    this.voices.thud.triggerAttackRelease(this.Tone.Frequency(note, 'midi').toFrequency(), 0.08, this.#time('thud', 0), velocity);
  }

  #hiss(length, velocity) {
    if (!this.#ready()) return;
    this.voices.hiss.triggerAttackRelease(length, this.#time('hiss', 0), velocity);
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
