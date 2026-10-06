// A theme's ambient loop (Cozy Storm's rain behind the glass): one recording through a low-pass at a low level, on
// the audio context the sound effects already unlocked. Without one, or if anything fails, the theme stays silent.
import { HUSH_HZ, HUSH_DB } from './music.js';
import { dbToGain, rampParam, setParam } from './context.js';
import { MediaWatch } from './media-watch.js';

const FADE = 0.4;
const CUT = 0.05;
// Pressing RECREATE opens the menu's muffle over this long
const UNMUFFLE = 0.5;
// Sits this much lower under the music
const DUCK = 0.6;
// The menus preview the ambience half as muffled as the pause hush: halfway to its cutoff on a log scale, half its dip
const MENU_SHARE = 0.5;
const menuHz = (open) => open * (Math.min(open, HUSH_HZ) / open) ** MENU_SHARE;
// A tape stop slumps the rate to this share of normal, still sounding for this much of its length (Sine Sculptor's)
const TAPE_FLOOR = 0.02;
const TAPE_AUDIBLE = 0.7;
const TAPE_STEPS = 24;
// Firefox mutes media played slower than 0.25× (Chrome refuses under 0.0625×), so the slump stops there and fades out
const MIN_RATE = 0.25;

const ms = (seconds) => Math.max(0, seconds) * 1000;

export class ThemeAmbience {
  /** @param {{ baseUrl: string, enabled?: boolean, makeAudio?: () => HTMLAudioElement, setTimer?: Function, clearTimer?: Function }} opts */
  constructor({ baseUrl, enabled = true, makeAudio = () => new Audio(), setTimer = setTimeout, clearTimer = clearTimeout }) {
    this.baseUrl = baseUrl;
    this.enabled = enabled;
    this.makeAudio = makeAudio;
    this.setTimer = setTimer;
    this.clearTimer = clearTimer;
    this.context = null;
    this.spec = null;
    // One element and node chain per file for life, so a theme browsed past and back resumes rather than rebuilds
    this.graphs = new Map();
    this.graph = null;
    this.mode = 'menu';
    this.treatment = { phase: 'open' };
    this.hidden = false;
    this.ducked = false;
    // The last target applied ({ kind, level, hz, seconds }), how long the next unmuffle takes, and the ending's timer
    this.state = null;
    this.reopen = FADE;
    this.timer = null;
    this.endedFor = null;
  }

  /** The shared audio context (Tone's raw one until the Elementary player lands); null leaves the loop silent. */
  setContext(context) {
    this.context = context ?? null;
    this.#apply();
  }

  setEnabled(on) {
    this.enabled = on;
    this.#apply();
  }

  setDucked(on) {
    this.ducked = on;
    this.#apply();
  }

  /** A hidden tab stops the loop outright, whatever else is going on. */
  setHidden(on) {
    this.hidden = on;
    this.#apply();
  }

  /** 'menu' previews the loop half-muffled; 'run' copies whatever the music's treatment says. */
  setMode(mode) {
    if (mode === this.mode) return;
    if (mode === 'run' && this.mode === 'menu') this.reopen = UNMUFFLE;
    this.mode = mode;
    this.#apply();
  }

  /** The music's treatment ({ phase: 'open' | 'pause' | 'over', ... }), from Music#onTreatment. */
  follow(treatment) {
    if (treatment === this.treatment) return;
    if (this.treatment.phase === 'pause' && treatment.phase === 'open') this.reopen = this.treatment.fadeSeconds;
    this.treatment = treatment;
    this.#apply();
  }

  /** Retries a start the browser refused, for the first user gesture to call. */
  wake() {
    const g = this.graph;
    if (g && this.state?.kind === 'play' && !g.playing) this.#start(g);
  }

  /** The theme's ambience ({ file, lowpassHz, gain }), or null for none. */
  setSpec(spec) {
    const next = spec?.file ? spec : null;
    if (next?.file !== this.spec?.file && this.graph) {
      this.#cancelEnding();
      this.#silence(this.graph, CUT);
      this.graph = null;
      this.state = null;
    }
    this.spec = next;
    this.#apply();
  }

  // Where the loop should be: playing at a level behind a cutoff, silent, or running the music's game-over ending
  #target() {
    if (!this.enabled || !this.spec || this.hidden) return { kind: 'silent', seconds: CUT };
    const open = this.spec.lowpassHz;
    const level = this.spec.gain * (this.ducked ? DUCK : 1);
    if (this.mode === 'menu') return { kind: 'play', level: level * dbToGain(HUSH_DB * MENU_SHARE), hz: menuHz(open), seconds: FADE };
    // A menu-only loop hands over to the run's own soundscape as RECREATE starts it
    if (this.spec.menuOnly) return { kind: 'silent', seconds: UNMUFFLE };
    const t = this.treatment;
    if (t.phase === 'pause') {
      const hz = Math.min(open, t.muffleHz);
      if (t.mode === 'stop') return { kind: 'silent', seconds: CUT };
      if (t.mode === 'freeze') return { kind: 'silent', hz, seconds: t.fadeSeconds };
      return { kind: 'play', level: level * dbToGain(t.db ?? 0), hz, seconds: t.fadeSeconds };
    }
    // A jump to an ending section keeps the song going, so the loop does too
    if (t.phase === 'over' && t.action !== 'jump') return { kind: 'ending', action: t.action, level, seconds: t.seconds };
    return { kind: 'play', level, hz: open, seconds: this.reopen };
  }

  #build() {
    if (!this.context || !this.spec) return null;
    const known = this.graphs.get(this.spec.file);
    if (known) return known;
    try {
      const c = this.context;
      const filter = c.createBiquadFilter();
      filter.type = 'lowpass';
      setParam(c, filter.frequency, this.spec.lowpassHz);
      const gain = c.createGain();
      setParam(c, gain.gain, 0);
      filter.connect(gain);
      gain.connect(c.destination);
      const graph = { file: this.spec.file, el: null, source: null, filter, gain, playing: false, attempt: 0, failed: false, watch: new MediaWatch() };
      this.#element(graph);
      this.graphs.set(this.spec.file, graph);
      return graph;
    } catch (error) {
      console.warn('CUCKBLOX theme ambience is unavailable:', error);
      this.spec = null;
      return null;
    }
  }

  #apply() {
    const target = this.#target();
    const before = this.state;
    const same = before && ['kind', 'level', 'hz', 'action'].every((k) => before[k] === target[k]);
    // The ending runs once per game over: a re-sync mid-slump, or after it, changes nothing
    if (target.kind === 'ending' && this.endedFor === this.treatment) return;
    // Before the context there is nothing to change, so the state keeps the ramp it was first given
    if (same && (this.graph || !this.context)) return;
    this.#cancelEnding();
    // Only a loop that should sound builds its element; silence and endings act on one already there
    if (target.kind === 'play') this.graph = this.#build();
    const g = this.graph;
    this.state = target;
    if (target.kind === 'play') this.reopen = FADE;
    if (target.kind === 'ending') this.endedFor = this.treatment;
    if (!g) return;
    if (target.kind === 'ending') {
      this.#end(g, target);
      return;
    }
    if (target.hz) rampParam(this.context, g.filter.frequency, target.hz, Math.max(CUT, target.seconds), true);
    if (target.kind === 'silent') {
      this.#silence(g, target.seconds);
      return;
    }
    rampParam(this.context, g.gain.gain, target.level, Math.max(CUT, target.seconds));
    this.#start(g);
  }

  // One source node per element for life (a second createMediaElementSource on it would throw), so a stuck loop gets
  // a fresh element rather than a restart
  #element(g) {
    const el = this.makeAudio();
    el.preload = 'auto';
    el.loop = true;
    // A tape stop lowers the pitch with the speed, like the song's
    el.preservesPitch = false;
    el.addEventListener?.('error', () => { if (g.el === el) g.failed = true; });
    el.src = this.baseUrl + g.file;
    const source = this.context.createMediaElementSource(el);
    source.connect(g.filter);
    Object.assign(g, { el, source, failed: false });
  }

  /** Call every frame: a loop that should be sounding but has stopped moving is started again, then rebuilt. */
  update(dt) {
    const g = this.graph;
    if (!g) return;
    if (this.state?.kind !== 'play' || this.context.state !== 'running') {
      g.watch.reset();
      return;
    }
    const verdict = g.watch.check(g.el, dt, g.failed);
    if (!verdict) return;
    if (verdict === 'rebuild') {
      try {
        g.el.pause();
        g.el.removeAttribute?.('src');
        g.el.load?.();
        g.source.disconnect();
        this.#element(g);
      } catch (error) {
        console.warn('CUCKBLOX theme ambience could not restart:', error);
        return;
      }
    }
    g.playing = false;
    this.#start(g);
  }

  #start(g) {
    if (g.playing) return;
    g.playing = true;
    // A refused start (autoplay policy, a load hiccup) clears the flag so the next sync tries again; a refusal that
    // settles after a newer start leaves that one alone, or a later silence would skip pausing a live element
    const attempt = ++g.attempt;
    g.el.play()?.catch?.(() => { if (g.attempt === attempt) g.playing = false; });
  }

  // Fades out, then stops the element so a silent loop costs nothing
  #silence(g, seconds) {
    rampParam(this.context, g.gain.gain, 0, Math.max(CUT, seconds));
    if (!g.playing) return;
    const stop = () => {
      this.timer = null;
      g.el.pause();
      g.playing = false;
    };
    if (seconds <= CUT) stop();
    else this.timer = this.setTimer(stop, ms(seconds));
  }

  // The music's game-over cue, copied onto the element: a tape stop slumps its rate and fades the tail, a fade-out
  // just fades, and a stop cuts dead
  #end(g, { action, level, seconds }) {
    if (action === 'fadeOut') return this.#silence(g, seconds);
    if (action !== 'tapeStop' || !g.playing) return this.#silence(g, CUT);
    let step = 0;
    const tick = () => {
      step++;
      const p = step / TAPE_STEPS;
      if (p >= 1) {
        this.timer = null;
        g.el.pause();
        g.playing = false;
        this.#resetRate(g);
        return;
      }
      setRate(g.el, Math.max(MIN_RATE, 1 - (1 - TAPE_FLOOR) * p));
      if (p >= TAPE_AUDIBLE) rampParam(this.context, g.gain.gain, level * (1 - (p - TAPE_AUDIBLE) / (1 - TAPE_AUDIBLE)), seconds / TAPE_STEPS);
      this.timer = this.setTimer(tick, ms(seconds / TAPE_STEPS));
    };
    this.timer = this.setTimer(tick, ms(seconds / TAPE_STEPS));
  }

  // Any new target ends a slump or a pending pause, and the next sound always plays at full speed
  #cancelEnding() {
    if (this.timer !== null) this.clearTimer(this.timer);
    this.timer = null;
    for (const g of this.graphs.values()) this.#resetRate(g);
  }

  #resetRate(g) {
    if (g.el.playbackRate !== 1) setRate(g.el, 1);
  }
}

function setRate(el, rate) {
  try {
    el.playbackRate = rate;
  } catch {
    // A rate the browser refuses leaves the last one; the fade still silences the tail
  }
}
