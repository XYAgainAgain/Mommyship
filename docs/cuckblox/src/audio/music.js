// CUCKBLOX music: plays a song bundle exported from Sine Sculptor through its player, on the Tone.js the SFX
// already loaded. The shell says what it wants (play, pause, stop, level); this applies it once everything arrives.
import { COLS, VISIBLE_ROWS } from '../core/engine.js';
import { analyzeSong, keyAt, transposeAt, SONG_PPQ } from './key.js';

export const MAX_VOLUME = 10;

/** Steps of 3 dB, with 6 at -14 dB; 0 is off. */
const volumeDb = (volume) => -14 + (volume - 6) * 3;

// Muffling sweeps a low-pass from open (above hearing) down to this floor, exponentially so each step sounds even
const OPEN_HZ = 20000;
const MUFFLED_HZ = 400;
const MUFFLE_RAMP = 2.5;
const muffleHz = (amount) => OPEN_HZ * (MUFFLED_HZ / OPEN_HZ) ** amount;
// Under the pause menu the song carries on behind a closed door: this muffled, this much quieter, this quickly
export const HUSH_HZ = 700;
export const HUSH_DB = -6;
const HUSH_RAMP = 0.3;
const SILENT_DB = -100;

// What the music is doing to the sound, for the theme ambience to copy. The pause shape matches the player's own
// treatments ({ mode, muffleHz, fadeSeconds }) plus a level change in dB; the ending is a Sine Sculptor cue's action
const OPEN = Object.freeze({ phase: 'open' });
export const HUSH = Object.freeze({ phase: 'pause', mode: 'muffled', muffleHz: HUSH_HZ, fadeSeconds: HUSH_RAMP, db: HUSH_DB });
export const TAPE_STOP = Object.freeze({ action: 'tapeStop', seconds: 0.75 });

/** The song's game-over cue as { action, seconds }, the player's own default tape stop for a song without a cue
 *  list, or null when its list has none. The player matches the cue by name first, then id. */
function endingOf(bundle) {
  const cues = typeof bundle === 'object' ? bundle?.song?.cues : undefined;
  if (!Array.isArray(cues)) return TAPE_STOP;
  const cue = cues.find((c) => c?.name === 'game-over') ?? cues.find((c) => c?.id === 'game-over');
  if (!cue) return null;
  const seconds = Number.isFinite(cue.seconds) ? cue.seconds : 0;
  return { action: cue.action, seconds: cue.action === 'tapeStop' && seconds <= 0 ? TAPE_STOP.seconds : seconds };
}

/** Whether a player's dials() lists a dial, whether it reports names, { id } objects, or a map keyed by name. */
function hasDial(dials, name) {
  if (!dials) return false;
  if (Array.isArray(dials)) return dials.some((d) => (typeof d === 'string' ? d : d?.id ?? d?.name) === name);
  return Object.hasOwn(dials, name);
}

function valueAt(points, value) {
  if (!points?.length || !Number.isFinite(value)) return null;
  if (value <= points[0].x) return points[0].y;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    if (value > b.x) continue;
    return b.x === a.x ? b.y : a.y + (value - a.x) * (b.y - a.y) / (b.x - a.x);
  }
  return points.at(-1).y;
}

function tempoOf(bundle) {
  const song = bundle?.song ?? bundle;
  const base = Number(song?.bpm);
  const tempo = song?.rules?.tempo;
  const entry = Object.entries(bundle?.dials ?? {}).find(([, dial]) => dial?.id === tempo?.dialId);
  return { base: Number.isFinite(base) && base > 0 ? base : 120, dial: entry?.[0] ?? null, points: tempo?.points ?? null };
}

// What onGameEvent derives from play, sent to songs that list them; all rest at 0 between runs
const SIGNALS = ['height', 'combo', 'progress'];
const restingSignals = () => ({ height: 0, combo: 0, progress: 0 });
// A newer cue cancels one still waiting for its beat, so each moment sends only its biggest news the song defines
const CUE_PRIORITY = ['payout', 'level-up', 'back-to-back', 'special', 'clear'];

/** Board fullness 0–1, measured like the engine's critical check (column heights over the visible well). */
const heightOf = (game) => game.fill / (COLS * VISIBLE_ROWS);

export class Music {
  /** @param {{ playerUrl: string, bundleUrl: string, base?: string, volume?: number }} opts volume runs 0 (off) to 10;
   *  both URLs resolve against base, the game's root */
  constructor({ playerUrl, bundleUrl, base = new URL('../../', import.meta.url).href, volume = 5 }) {
    this.base = base;
    this.playerUrl = playerUrl;
    this.bundleUrl = bundleUrl;
    this.volume = volume;
    this.player = null;
    this.loading = null;
    this.preloads = new Map();
    this.want = 'stopped';
    this.level = 0;
    this.muffle = 0;
    this.filter = null;
    this.songToken = 0;
    this.shell = null;
    this.depth = 0;
    // What the loaded song handles itself; version 1 bundles and older players handle neither
    this.ownPause = null;
    this.ownDepth = false;
    this.songDials = null;
    this.signals = restingSignals();
    // The run the signals describe, its level, and whether the engine just called a back-to-back
    this.game = null;
    this.runLevel = 0;
    this.backToBack = false;
    this.wantedCues = new Set();
    this.Tone = null;
    // The loaded song's key timeline, and whether its game-over ending is still playing out
    this.keys = null;
    this.tempo = null;
    this.transition = null;
    this.transitionEpoch = 0;
    this.ending = false;
    this.endingCue = TAPE_STOP;
    // A pause the hidden tab made, which must not wake up when a song arrives; and who is told about treatments
    this.hidden = false;
    this.treatment = OPEN;
    this.listeners = new Set();
  }

  /** Calls `fn` with the current treatment now and on every change; returns the unsubscribe. */
  onTreatment(fn) {
    this.listeners.add(fn);
    fn(this.treatment);
    return () => this.listeners.delete(fn);
  }

  #treat(treatment) {
    this.treatment = treatment;
    for (const fn of [...this.listeners]) {
      try {
        fn(treatment);
      } catch (error) {
        console.warn('CUCKBLOX music treatment listener failed:', error);
      }
    }
  }

  // Silent music or a song without its own pause leaves the game's hush, so anything copying it never skips a pause
  #pauseTreatment() {
    return this.volume > 0 && this.ownPause ? { phase: 'pause', db: 0, ...this.ownPause } : HUSH;
  }

  /** Fetches the player and the song once Tone exists. A failure leaves the game silent, never broken. */
  load(Tone) {
    if (!Tone) return Promise.resolve();
    this.Tone ??= Tone;
    this.loading ??= (async () => {
      try {
        const { createPlayer } = await import(new URL(this.playerUrl, this.base).href);
        // Without a filter the song plays straight to the speakers, just never muffled
        try {
          this.filter = new Tone.Filter({ type: 'lowpass', frequency: muffleHz(this.muffle), Q: Math.SQRT1_2 }).toDestination();
        } catch (error) {
          console.warn('CUCKBLOX music filter is unavailable:', error);
        }
        const player = createPlayer(Tone, {
          volumeDb: volumeDb(this.volume || 1),
          destination: this.filter ?? undefined,
          onError: (message, error) => console.warn(message, error),
        });
        this.shell = player;
        await this.#loadSong(player);
      } catch (error) {
        console.warn('CUCKBLOX music is unavailable:', error);
      }
    })();
    return this.loading;
  }

  /** Fetches a bundle ahead of a shuffle change without disturbing the song that is playing. */
  preloadBundle(url) {
    const href = new URL(url, this.base).href;
    let preload = this.preloads.get(href);
    if (!preload) {
      preload = fetch(href).then(async (response) => {
        if (!response.ok) throw new Error(`song bundle answered ${response.status}`);
        const text = await response.text();
        try {
          return JSON.parse(text);
        } catch {
          return text;
        }
      });
      this.preloads.set(href, preload);
      preload.catch(() => this.preloads.delete(href));
    }
    return preload;
  }

  /** Swaps the song; the new one starts from the top the next time music plays. */
  setBundle(url) {
    if (url === this.bundleUrl) return;
    this.#cancelTransition();
    this.bundleUrl = url;
    // The player shell outlives a song that failed to load, so another tune can still be picked
    const player = this.shell;
    if (!player) return;
    // The old song carries on until the new one arrives, so a slow fetch never drops to silence
    this.#loadSong(player).catch((error) => console.warn('CUCKBLOX tune is unavailable:', error));
  }

  /** Fades out, waits in silence, then launches a preloaded song. Returns false if it cannot begin. */
  async transitionTo(url, level, { fadeSeconds = 1, gapMs = 2500 } = {}) {
    const epoch = ++this.transitionEpoch;
    let bundle;
    try {
      bundle = await this.preloadBundle(url);
    } catch (error) {
      console.warn('CUCKBLOX tune is unavailable:', error);
      return false;
    }
    if (epoch !== this.transitionEpoch || this.want !== 'playing' || this.hidden || this.volume <= 0 || !this.player || this.transition) return false;
    const transition = { url, bundle, level, timer: null };
    this.transition = transition;
    const startFade = () => {
      if (this.transition !== transition) return;
      this.player.setVolume(SILENT_DB, fadeSeconds);
      transition.timer = setTimeout(() => {
        transition.timer = setTimeout(() => this.#finishTransition(transition), gapMs);
      }, fadeSeconds * 1000);
    };
    const remaining = this.songSecondsRemaining();
    const leadMs = Number.isFinite(remaining) ? Math.max(0, (remaining - fadeSeconds) * 1000) : 0;
    if (leadMs > 0) transition.timer = setTimeout(startFade, leadMs);
    else startFade();
    return true;
  }

  // Only the newest request lands, so picking tunes quickly never ends on a stale one
  async #loadSong(player) {
    const token = ++this.songToken;
    const bundle = await this.preloadBundle(this.bundleUrl);
    if (token !== this.songToken) return;
    this.#installSong(player, bundle);
  }

  #finishTransition(transition) {
    if (this.transition !== transition || this.want !== 'playing' || this.hidden) return;
    this.transition = null;
    this.bundleUrl = transition.url;
    this.level = transition.level;
    this.#installSong(this.player, transition.bundle);
  }

  #cancelTransition() {
    this.transitionEpoch++;
    const transition = this.transition;
    if (!transition) return;
    clearTimeout(transition.timer);
    this.transition = null;
    if (this.volume > 0) this.player?.setVolume(volumeDb(this.volume), HUSH_RAMP);
  }

  #installSong(player, bundle) {
    player.stop();
    const result = player.load(bundle);
    if (!result.ok) throw new Error(result.error);
    this.keys = this.#analyze(bundle);
    this.tempo = tempoOf(bundle);
    this.ending = false;
    this.endingCue = endingOf(bundle);
    this.ownPause = player.pauseTreatment?.() ?? null;
    this.songDials = player.dials?.() ?? null;
    this.ownDepth = hasDial(this.songDials, 'depth');
    this.player = player;
    // A song that lands under the pause menu brings its own pause, so the hush and the treatment follow it
    if (this.treatment.phase === 'pause') {
      if (!this.hidden && this.want !== 'stopped') this.want = this.filter && !this.ownPause ? 'hushed' : 'paused';
      this.#treat(this.#pauseTreatment());
    }
    // A song switched mid-run starts from the run's state rather than gliding up from its defaults
    this.#sendSignals(true);
    this.#apply();
  }

  /** 0 stops the music; coming back from 0 mid-run starts the song from the top. */
  setVolume(volume) {
    this.#cancelTransition();
    this.volume = Math.min(MAX_VOLUME, Math.max(0, Math.round(volume)));
    this.#apply();
  }

  /** The speed level that sets the tempo; the bundle clamps it to its own range. */
  setLevel(level) {
    this.level = level;
    this.player?.setDial('level', level);
  }

  /** Dive depth in meters, for songs with their own depth rule; songs without one get setMuffle's filter instead. */
  setDepth(meters) {
    this.depth = meters;
    if (this.ownDepth) this.player?.setDial('depth', meters);
  }

  /** 0 plays the song open, 1 fully muffled, as if heard through deep water; changes glide rather than jump. */
  setMuffle(amount) {
    const next = Math.min(1, Math.max(0, amount));
    if (next === this.muffle) return;
    this.muffle = next;
    this.#shape(MUFFLE_RAMP);
  }

  /** Starts from the top, or carries on from a pause. */
  play() {
    this.want = 'playing';
    this.ending = false;
    this.hidden = false;
    this.#apply();
    this.#treat(OPEN);
  }

  /** The pause menu's sound: the song's own pause treatment if it brings one, otherwise it keeps going muffled and
   *  quieter behind the game's filter (or simply pauses without one). */
  hush() {
    this.#cancelTransition();
    this.hidden = false;
    // Told even while the song is silent or stopped, so the ambience still takes the pause
    if (this.want !== 'stopped') {
      this.want = this.filter && !this.ownPause ? 'hushed' : 'paused';
      this.#apply();
    }
    this.#treat(this.#pauseTreatment());
  }

  /** Stops time in the song, for when nobody can hear it anyway (a hidden tab). */
  pause() {
    this.#cancelTransition();
    if (this.want === 'playing' || this.want === 'hushed') this.want = 'paused';
    this.hidden = true;
    this.#apply();
  }

  stop() {
    this.#halt();
    this.#treat(OPEN);
  }

  #halt() {
    this.#cancelTransition();
    this.want = 'stopped';
    this.hidden = false;
    this.ending = false;
    // Every stop ends or restarts a run, so the next event (from whichever game) resyncs everything
    this.game = null;
    this.signals = restingSignals();
    this.backToBack = false;
    this.#sendSignals(true);
    this.#apply();
  }

  /** Game over: the song plays its own ending (Sine Sculptor's 0.75 s tape stop by default) if it has one, else stops.
   *  The treatment names that ending, or the default tape stop when the music is silent or has none. */
  endRun() {
    this.#cancelTransition();
    let ending = false;
    try {
      ending = this.want === 'playing' && this.volume > 0 && !!this.player?.cue?.('game-over');
    } catch (error) {
      console.warn('CUCKBLOX music ending failed:', error);
    }
    this.#treat({ phase: 'over', ...((ending && this.endingCue) || TAPE_STOP) });
    if (!ending) {
      this.#halt();
      return;
    }
    // The cue owns the player now; the next play() or stop() takes it back
    this.want = 'stopped';
    this.ending = true;
    this.game = null;
    this.signals = restingSignals();
    this.backToBack = false;
  }

  /** The key the music is in right now, { root: 0–11 (0 = C), mode: 'major' | 'minor' }, or null while no song is
   *  heard (off, stopped, loading, or frozen under the pause menu). Never throws. */
  currentKey() {
    try {
      const keys = this.keys;
      const player = this.player;
      if (!keys?.segments.length || !player || !this.#audible()) return null;
      // The player owns the Transport and runs it in song ticks, looping the whole song, so its ticks are the song's
      const transport = this.Tone?.getTransport?.();
      if (!transport) return null;
      const ppq = transport.PPQ > 0 ? transport.PPQ : SONG_PPQ;
      const key = keyAt(keys, transport.getTicksAtTime(transport.immediate()) * (SONG_PPQ / ppq));
      if (!key) return null;
      const shift = keys.transpose ? transposeAt(keys.transpose, player.getDial?.(keys.transpose.dial)) : 0;
      return shift ? { root: (((key.root + shift) % 12) + 12) % 12, mode: key.mode } : key;
    } catch {
      return null;
    }
  }

  /** How far through its loop the song is, 0–1, or null when nothing audible is playing or its length is unknown. */
  songPhase() {
    try {
      const length = this.keys?.lengthTicks;
      if (!length || !this.player || !this.#audible()) return null;
      const ticks = this.player.getPositionTicks?.();
      if (!Number.isFinite(ticks)) return null;
      return ((ticks % length) + length) % length / length;
    } catch {
      return null;
    }
  }

  /** Whether a shuffle fade or its silent gap owns the current song. */
  isTransitioning() {
    return !!this.transition;
  }

  /** Seconds until the loop point at the song's current tempo, or null when the player cannot report it. */
  songSecondsRemaining() {
    try {
      const length = this.keys?.lengthTicks;
      const ticks = this.player?.getPositionTicks?.();
      if (!length || !Number.isFinite(ticks) || !this.#audible()) return null;
      const tempo = this.tempo;
      const bpm = tempo?.dial ? valueAt(tempo.points, this.player.getDial?.(tempo.dial)) : tempo?.base;
      if (!Number.isFinite(bpm) || bpm <= 0) return null;
      const at = ((ticks % length) + length) % length;
      return (length - at || length) * 60 / (bpm * SONG_PPQ);
    } catch {
      return null;
    }
  }

  // Playing or hushed, a song whose own pause keeps playing, or the game-over ending until the player stops
  #audible() {
    if (this.volume <= 0 || this.player.getState?.() === 'stopped') return false;
    if (this.want === 'playing' || this.want === 'hushed') return true;
    if (this.want === 'paused') return this.ownPause?.mode === 'muffled';
    return this.ending;
  }

  // A song the key finder can't read leaves the sound effects in A minor, never the music broken
  #analyze(bundle) {
    try {
      return typeof bundle === 'object' ? analyzeSong(bundle) : null;
    } catch (error) {
      console.warn('CUCKBLOX could not find the key of this tune:', error);
      return null;
    }
  }

  /** Every engine event, plus the shell's own { type: 'payout' }; turns play into dials and cues for the song. */
  onGameEvent(event, game) {
    try {
      this.#onGameEvent(event, game);
    } catch (error) {
      console.warn('CUCKBLOX music missed a game event:', error);
    }
  }

  #onGameEvent(event, game) {
    if (!event) return;
    // A finished game's last events (after the shell's stop) must not wake the signals back up
    if (game && game !== this.game && !game.gameOver) this.#follow(game);
    switch (event.type) {
      case 'spawn':
        // Spawns come after every lock and its clears, so the board has settled
        if (game) this.#signal('height', heightOf(game));
        break;
      case 'combo':
        this.#signal('combo', Math.max(0, event.height));
        break;
      case 'callout':
        // The engine's own call, so Retro (no back-to-backs) and the rule that only clears break a chain both hold
        if (event.kind === 'double') this.backToBack = true;
        break;
      case 'clear': {
        const special = !!event.special;
        const backToBack = special && this.backToBack;
        this.backToBack = false;
        let levelUp = false;
        if (game) {
          this.#signal('progress', game.lines % 10);
          levelUp = game.level > this.runLevel;
          this.runLevel = game.level;
        }
        this.#cue('clear');
        if (special) this.#cue('special');
        if (backToBack) this.#cue('back-to-back');
        if (levelUp) this.#cue('level-up');
        break;
      }
      case 'payout':
        this.#cue('payout');
        break;
    }
  }

  // A new or restored run: pick up wherever it stands, jumping rather than gliding there
  #follow(game) {
    this.game = game;
    this.runLevel = game.level;
    this.backToBack = false;
    const or0 = (v) => (Number.isFinite(v) ? v : 0);
    this.signals = { height: or0(heightOf(game)), combo: Math.max(0, or0(game.combo)), progress: or0(game.lines % 10) };
    this.#sendSignals(true);
  }

  #signal(name, value) {
    if (!Number.isFinite(value) || this.signals[name] === value) return;
    this.signals[name] = value;
    if (hasDial(this.songDials, name)) this.player?.setDial(name, value);
  }

  #sendSignals(jump = false) {
    const player = this.player;
    if (!player) return;
    for (const name of SIGNALS) {
      if (hasDial(this.songDials, name)) player.setDial(name, this.signals[name], jump ? { jump: true } : undefined);
    }
  }

  // Gathers a moment's cues (a clear and the shell's payout arrive in either order) and sends one after it
  #cue(name) {
    if (this.wantedCues.size === 0) queueMicrotask(() => this.#flushCues());
    this.wantedCues.add(name);
  }

  // cue() answers false for a name the song lacks, so the next one down gets its turn; held or silent music skips all
  #flushCues() {
    const wanted = this.wantedCues;
    this.wantedCues = new Set();
    try {
      const player = this.player;
      if (!player?.cue || this.want !== 'playing' || this.volume <= 0) return;
      for (const name of CUE_PRIORITY) if (wanted.has(name) && player.cue(name)) return;
    } catch (error) {
      console.warn('CUCKBLOX music cue failed:', error);
    }
  }

  #apply() {
    const player = this.player;
    if (!player) return;
    player.setDial('level', this.level);
    if (this.ownDepth) player.setDial('depth', this.depth);
    const want = this.volume > 0 ? this.want : 'stopped';
    this.#shape(HUSH_RAMP);
    if (want === 'playing' || want === 'hushed') player.play();
    else if (want === 'paused') player.pause();
    else player.stop();
  }

  // The dive and the pause menu each close the low-pass; whichever is lower wins
  #shape(ramp) {
    const hushed = this.want === 'hushed';
    const dive = this.ownDepth ? OPEN_HZ : muffleHz(this.muffle);
    this.filter?.frequency.exponentialRampTo(Math.min(dive, hushed ? HUSH_HZ : OPEN_HZ), ramp);
    if (this.volume > 0 && !this.transition) this.player?.setVolume(volumeDb(this.volume) + (hushed ? HUSH_DB : 0));
  }
}
