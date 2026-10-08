// CUCKBLOX Canvas2D renderer: Lightblocks' block animations (glow fades, slides, implosions, fly-ins) drawn as
// a hologram. It only listens to engine events and reads engine state; it never touches the rules.
import { COLS, ROWS, VISIBLE_ROWS, EMPTY, pieceTemplates } from '../core/engine.js';
import { DEFAULT_THEME, starAt } from '../themes/themes.js';
import { TEXT } from '../text.js';
import { flicker as glyphFlicker } from './glyphs.js';
import { DIVE_ZONES, depthFor, zoneIndexAt, clarityAt, PLUNGE_DEPTH } from '../scenes/osminok.js';

const MOVE_TIME = 1 / 30;
const ROTATE_TIME = 1 / 20;
const ENLIGHTEN_TIME = 0.2;
const DISLIGHTEN_TIME = 0.6;
const DIM_GLOW = 0.4;
const CONFLICT_GLOW = 0.8;
const NEXT_FLY_TIME = 0.5;
const PREVIEW_ALPHA = 0.5;
const ACTIVATE_TIME = 0.1;
const CLEAR_HOLD = 0.15;
const CLEAR_FADE = 0.2;
const ROW_DROP_TIME = 0.1;
const HOLD_MOVE_TIME = 0.1;
const HOLD_FADE_TIME = 0.5;
const PAUSE_FADE = 0.2;
const CALLOUT_OPACITY = 0.9;
const CALLOUT_SECONDS = 2;
// HUD labels glitch at a third of the usual Staryllic rate; values never do
const HUD_STARYLLIC = 0.3;
const GAME_OVER_CALLOUT_SECONDS = 10;
// A dive run names the zone it starts in this long after Go
const ZONE_CALLOUT_DELAY = 1;
// HUD numbers count up as Lightblocks' ScoreLabel does: score at 2,000 a second or faster to land within a second,
// lines at 100 a second; level changes and score gains of 1,000+ flash for a second (PlayScreen's score table)
const SCORE_COUNT_SPEED = 2000;
const SCORE_COUNT_MAX_TIME = 1;
const LINES_COUNT_SPEED = 100;
const EMPHASIS_TIME = 1;
const SCORE_EMPHASIS_GAIN = 1000;
// Special clears throw sparks from the cleared rows, Lightblocks' default explode.p in board cells (34 units each):
// 50 at once plus 750 a second tapering to none over 0.1 s, flying 44–53 cells a second under rising gravity
const SPARK_BURST = 50;
const SPARK_RATE = 750;
const SPARK_EMIT_TIME = 0.1;
const SPARK_SPEED = [1500 / 34, 1800 / 34];
const SPARK_LIFE = [0.3, 0.75, 1];
const SPARK_GRAVITY = 700 / 34;
const SPARK_SIZE = 50 / 34;
const SPARK_SPREAD = 30 / 34;
const SPARK_JITTER = 15 / 34;
const FONT = '"Departure Mono", ui-monospace, monospace';
// Starry themes: silver five-point stars with a lit-cobalt rim, the XYAgain pond eels' look
const STAR_SILVER = '#ebf0ff';
const STAR_RIM = '#5980ff';
const STAR_RADII = [0.24, 0.29, 0.34];
const STAR_INNER = 0.42;
const STAR_FLARE_TIME = 0.8;
// Osminok Ocean: a zone crossing dissolves the block palette in quarter steps, game over darkens the well, and
// 20 km down gets its own callout
const DIVE_FADE_TIME = 2;
const DIVE_FADE_STEPS = 4;
const LOST_DARKEN_TIME = 1.5;
const LOST_DARKNESS = 0.7;
const DEEPEST_CALLOUT = 20000;
const KM = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });
const WHOLE_KM = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

// A scene module loads only once a theme that uses it is picked, and the theme still renders if it's missing
const SCENES = {
  osminok: () => import('../scenes/osminok-scene.js').then((m) => m.OsminokScene),
  'cozy-storm': () => import('../scenes/cozy-storm.js').then((m) => m.CozyStormScene),
  adrift: () => import('../scenes/adrift.js').then((m) => m.AdriftScene),
};
const sceneModules = new Map();
function loadScene(kind) {
  if (!sceneModules.has(kind)) sceneModules.set(kind, (SCENES[kind]?.() ?? Promise.resolve(null)).then((S) => S ?? null, () => null));
  return sceneModules.get(kind);
}

const WORDMARK_TEXT = TEXT.title.wordmark;
const GLYPHS = {
  C: ['###', '#..', '#..', '#..', '###'],
  U: ['#.#', '#.#', '#.#', '#.#', '###'],
  K: ['#.#', '#.#', '##.', '#.#', '#.#'],
  B: ['##.', '#.#', '##.', '#.#', '##.'],
  L: ['#..', '#..', '#..', '#..', '###'],
  O: ['###', '#.#', '#.#', '#.#', '###'],
  X: ['#.#', '#.#', '.#.', '#.#', '#.#'],
};

// Menu icons, five rows tall: Marathon's rising stairs (it speeds up), Retro's crosshair (precision), Practice's equals
// (one speed), the rankings' bar chart, and shuffle's crossing arrows
export const ICONS = {
  marathon: ['....#', '...##', '..###', '.####', '#####'],
  retro: ['..#..', '.###.', '##.##', '.###.', '..#..'],
  practice: ['.....', '#####', '.....', '#####', '.....'],
  rankings: ['....#', '..#.#', '..#.#', '#.#.#', '#.#.#'],
  shuffle: ['##...##', '..#.##.', '...#...', '..#.##.', '##...##'],
};
// A menu's hint, and one that's about another row than the one lit
const HINT_ALPHA = 0.8;
const HINT_DIM = 0.3;

// Controller buttons for `{name}` tokens in menu text, drawn on Departure Mono's own pixel grid (a capital is 8 px
// tall, an advance 7 px wide). Each is 14×9: two character advances, top row one pixel above the capitals.
const PIXEL_LETTERS = {
  L: ['#..', '#..', '#..', '#..', '###'],
  R: ['##.', '#.#', '##.', '#.#', '#.#'],
  T: ['###', '.#.', '.#.', '.#.', '.#.'],
  B: ['##.', '#.#', '##.', '#.#', '##.'],
  A: ['.#.', '#.#', '###', '#.#', '#.#'],
  Y: ['#.#', '#.#', '.#.', '.#.', '.#.'],
};
const BLANK_ROW = '..............';
const BUMPER = [BLANK_ROW, '..##########..', ...Array(5).fill('.############.'), '..##########..', BLANK_ROW];
const TRIGGER = ['....######....', '..##########..', ...Array(7).fill('.############.')];
const FACE = ['..#####..', '.#######.', ...Array(5).fill('#########'), '.#######.', '..#####..'].map((r) => `..${r}...`);
/** Knocks a label out of a button's fill, its first letter at the given row and column. */
function knockout(shape, top, left, label) {
  const rows = shape.map((r) => [...r]);
  [...label].forEach((ch, i) => PIXEL_LETTERS[ch].forEach((line, y) => [...line].forEach((c, x) => {
    if (c === '#') rows[top + y][left + i * 5 + x] = '.';
  })));
  return rows.map((r) => r.join(''));
}
export const BUTTONS = {
  dpad: ['...###...', '...###...', '...###...', '#########', '####.####', '#########', '...###...', '...###...', '...###...'].map((r) => `..${r}...`),
  menu: ['..#####..', '.#######.', '##.....##', '#########', '##.....##', '#########', '##.....##', '.#######.', '..#####..'].map((r) => `..${r}...`),
  a: knockout(FACE, 2, 5, 'A'),
  b: knockout(FACE, 2, 5, 'B'),
  y: knockout(FACE, 2, 5, 'Y'),
  lb: knockout(BUMPER, 2, 3, 'LB'),
  rb: knockout(BUMPER, 2, 3, 'RB'),
  lt: knockout(TRIGGER, 3, 3, 'LT'),
  rt: knockout(TRIGGER, 3, 3, 'RT'),
};
const BUTTON_TOKEN = /\{(\w+)\}/g;
const BUTTON_ADVANCES = 2;

// A tap on the wordmark sends a glow ring outward: cells per second, ring half-width in cells, and lifetime
const PULSE_SPEED = 40;
const PULSE_BAND = 3;
export const PULSE_LIFE = 1;

const linear = (t) => t;
const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
const circleOut = (t) => Math.sqrt(1 - (t - 1) * (t - 1));

export const CALLOUT_TEXT = TEXT.callout;
const EMPHASIS = '**';
const WAVE = '*';
const DIM_MARK = '~';
const MARKER = /(\*\*|\*|~)/;
// A ~dimmed~ run draws at this share of its line's opacity
const DIM_RUN = 0.5;
// Waved letters bob by whole device pixels: height in font pixels, speed in radians a second, phase step per letter
const WAVE_HEIGHT = 1.25;
const WAVE_SPEED = 7;
const WAVE_STEP = 0.7;
// Text as measured: markers take no width, and button tokens count as the blank advances their glyph fills
const unmarked = (str) => str.replace(/[*~]/g, '').replace(BUTTON_TOKEN, ' '.repeat(BUTTON_ADVANCES));

/** Splits marked text into runs (**emphasis**, *wave*, ~dimmed~) and reports which markers are still open at the end. */
function markedRuns(str) {
  const runs = [];
  let bold = false;
  let wave = false;
  let dim = false;
  str.split(MARKER).forEach((part, i) => {
    if (i % 2) {
      if (part === EMPHASIS) bold = !bold;
      else if (part === DIM_MARK) dim = !dim;
      else wave = !wave;
    } else if (part) runs.push({ text: part, bold, wave, dim });
  });
  return { runs, bold, wave, dim };
}

const COMPACT = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });

// Theme preview for the picker: a small stack with a T dropping in, top row first
const SWATCH = ['....AAA...', '.....A....', 'XX....XXX.', 'XXX.XXXXXX', 'XXXXX.XXXX'];

class Tween {
  constructor(target, props, duration, ease, delay, onDone) {
    Object.assign(this, { target, props, duration, ease, delay, onDone, t: 0, from: null });
  }

  /** Returns true when finished. Start values are captured when the delay runs out, like libGDX actions. */
  update(dt) {
    if (this.cancelled) return true;
    if (this.delay > 0) {
      this.delay -= dt;
      if (this.delay > 0) return false;
      dt = -this.delay;
    }
    if (!this.from) {
      this.onStart?.();
      this.from = Object.fromEntries(Object.keys(this.props).map((k) => [k, this.target[k]]));
    }
    this.t += dt;
    const k = this.duration > 0 ? Math.min(1, this.t / this.duration) : 1;
    const e = this.ease(k);
    for (const [key, to] of Object.entries(this.props)) this.target[key] = k >= 1 ? to : this.from[key] + (to - this.from[key]) * e;
    if (k >= 1) {
      this.onDone?.();
      return true;
    }
    return false;
  }
}

class Block {
  constructor(type, x, y) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.alpha = 1;
    this.glow = DIM_GLOW;
    this.lit = false;
    this.move = null;
    this.tweens = [];
    this.dead = false;
  }

  /** Replaces any running slide, like BlockActor.setMoveAction. A delayed slide only takes over when it starts
   *  (Lightblocks schedules those on a Timer), so an in-flight hard drop lands before rows close up. */
  moveTo(x, y, duration, ease = linear, delay = 0) {
    const tween = new Tween(this, { x, y }, duration, ease, delay);
    const takeOver = () => {
      if (this.move && this.move !== tween) this.move.cancelled = true;
      this.move = tween;
    };
    if (delay > 0) tween.onStart = takeOver;
    else takeOver();
    this.tweens.push(tween);
  }

  alphaTo(alpha, duration, ease = linear, delay = 0, onDone) {
    this.tweens.push(new Tween(this, { alpha }, duration, ease, delay, onDone));
  }

  setLit(on, immediately = false) {
    if (this.lit !== on) {
      this.tweens = this.tweens.filter((t) => !('glow' in t.props));
      this.tweens.push(new Tween(this, { glow: on ? 1 : DIM_GLOW }, immediately ? 0 : on ? ENLIGHTEN_TIME : DISLIGHTEN_TIME, linear, 0));
    }
    this.lit = on;
  }

  /** A block in the way of a move flares and fades back. */
  flare() {
    if (this.lit) return;
    this.glow = CONFLICT_GLOW;
    this.lit = true;
    this.setLit(false);
  }

  update(dt) {
    if (!this.tweens.length) return;
    this.tweens = this.tweens.filter((t) => !t.update(dt) && !t.cancelled);
    if (this.move && !this.tweens.includes(this.move)) this.move = null;
  }
}

export class Renderer {
  constructor(canvas, { theme = DEFAULT_THEME, reducedMotion = false } = {}) {
    this.canvas = canvas;
    // Opaque: the page never shows through, so the compositor can skip blending the canvas
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.theme = theme;
    this.reducedMotion = reducedMotion;
    // Per-frame draw counters: stack redraws, glow sprites, and text sprites
    this.stats = { glow: 0, text: 0, stack: 0, stackMs: 0 };
    this._showGhost = false;
    // The shell sets this while the sideways touch HOLD button shows; it stands in for the HOLD label
    this.holdButton = false;
    this.time = 0;
    this.glowCache = new Map();
    this.starCache = new Map();
    this.starFlare = null;
    this.textCache = new Map();
    this.layers = null;
    this.overlay = null;
    this.stackLayer = null;
    this.stackCanvas = null;
    this.scratch = null;
    this.dirty = true;
    this.animating = false;
    this.waving = false;
    this.glyphNext = Infinity;
    this.themeStep = 0;
    this.themeT = 0;
    this.game = null;
    this.unsubscribe = null;
    this.layout = null;
    this.scene = null;
    this.sceneKind = null;
    this.sceneToken = null;
    this.sceneSprites = [];
    this.lostT = null;
    this.#seedDive();
    this.resize();
    this.#syncScene();
  }

  setTheme(theme) {
    this.theme = theme;
    // Forces the next update to start the new theme's animation at its own current frame
    this.themeStep = -1;
    this.themeT = 0;
    // Stars are dealt per theme, so blocks pick theirs again from the new one
    for (const b of this.matrix ?? []) if (b) b.star = undefined;
    this.#dropCaches();
    this.#seedDive();
    this.#syncScene();
  }

  /** Holds one backdrop scene while a theme with one is on, and drops it with its sprites on a theme with
   *  another scene or none. */
  #syncScene() {
    const kind = this.theme.scene ?? null;
    if (kind === this.sceneKind && (this.scene || this.sceneToken)) return;
    this.scene?.dispose?.();
    this.scene = null;
    this.sceneToken = null;
    for (const b of this.sceneSprites) b.close?.();
    this.sceneSprites = [];
    this.sceneKind = kind;
    if (!kind) return;
    const token = (this.sceneToken = {});
    loadScene(kind).then((Scene) => {
      if (!Scene || this.sceneToken !== token) return;
      this.scene = new Scene({ reducedMotion: this.reducedMotion, makeBitmap: (w, h, paint) => this.#sceneBitmap(w, h, paint) });
      if (this.game?.gameOver) this.scene.onGameOver();
      this.dirty = true;
    }).catch((err) => console.error(`The ${kind} scene failed to start; the theme carries on without it`, err));
  }

  /** Scene sprites come off the shared scratch canvas too, and are freed when the scene is dropped. */
  #sceneBitmap(w, h, paint) {
    // A closed ImageBitmap reports zero width, so ones the scene already freed can be forgotten
    if (this.sceneSprites.length > 256) this.sceneSprites = this.sceneSprites.filter((b) => b.width > 0);
    const b = this.#bitmap(w, h, paint);
    this.sceneSprites.push(b);
    return b;
  }

  /** Starts the dive palette at the game's current zone with no crossfade, so restores and theme switches stay quiet. */
  #seedDive() {
    const zone = zoneIndexAt(depthFor(this.game?.lines ?? 0));
    this.dive = { zone, from: zone, t: DIVE_FADE_TIME };
    this.divePalette = { zone, from: zone, fade: 1 };
  }

  /** What the scene reads each frame: zoneT is progress through the zone (0 in the open-ended last one), and lost
   *  (0–1) is how far the game-over darkening has run. */
  #diveState() {
    const depth = depthFor(this.game?.lines ?? 0);
    const zone = zoneIndexAt(depth);
    const from = DIVE_ZONES[zone].from;
    const to = DIVE_ZONES[zone + 1]?.from;
    const lost = this.game && this.lostT !== null ? Math.min(1, this.lostT / LOST_DARKEN_TIME) : 0;
    return { depth, zone, zoneT: to ? (depth - from) / (to - from) : 0, time: this.time, lost };
  }

  #updateDive(dt) {
    const d = this.dive;
    if (d.t < DIVE_FADE_TIME) {
      d.t += dt;
      const fade = Math.min(DIVE_FADE_STEPS, Math.floor((d.t / DIVE_FADE_TIME) * DIVE_FADE_STEPS)) / DIVE_FADE_STEPS;
      const p = this.divePalette;
      if (p.zone !== d.zone || p.from !== d.from || p.fade !== fade) {
        this.divePalette = { zone: d.zone, from: d.from, fade };
        this.dirty = true;
      }
    }
    if (this.lostT !== null && this.lostT < LOST_DARKEN_TIME) this.lostT += dt;
  }

  /** What a scene reads each frame: the dive for Osminok, just the clock for any other. */
  #sceneState() {
    return this.theme.dive ? this.#diveState() : { time: this.time, level: this.game?.level ?? 0, playing: !!this.game && !this.gameOver && !this.paused };
  }

  #updateScene(dt) {
    if (!this.scene) return;
    // reducedMotion can flip live when the system setting changes
    if (this.scene.reducedMotion !== this.reducedMotion) this.scene.setReducedMotion(this.reducedMotion);
    this.scene.update(dt, this.#sceneState());
  }

  #dropCaches() {
    this.#evict(this.glowCache);
    this.#evict(this.textCache);
    this.#evict(this.starCache);
    this.layers?.grid.columns.close?.();
    this.layers?.grid.rows.close?.();
    this.layers?.frame.close?.();
    this.overlay?.close?.();
    this.layers = null;
    this.overlay = null;
    this.stackLayer = null;
    this.dirty = true;
  }

  /** Frees a sprite cache's bitmaps now instead of whenever garbage collection gets to them. */
  #evict(cache) {
    for (const s of cache.values()) (s.img ?? s).close?.();
    cache.clear();
  }

  /** Builds the picture from the game's current state and follows its events from here on. */
  attach(game) {
    this.unsubscribe?.();
    this.game = game;
    this.matrix = new Array(COLS * ROWS).fill(null);
    this.dying = [];
    this.preview = [];
    this.holdBlocks = [];
    this.ghost = [];
    this.callouts = [];
    this.callout = null;
    this.zoneCall = null;
    this.sparks = [];
    this.sparkEmit = null;
    this.starFlare = null;
    this.hud = { score: game.score, scoreF: game.score, scoreTarget: game.score, scoreSpeed: SCORE_COUNT_SPEED, lines: game.lines, linesF: game.lines, level: game.level, scoreEmph: null, levelEmph: null, at: null };
    this.critical = game.critical;
    this.boardAlpha = 1;
    this.boardFade = null;
    this.gameOver = game.gameOver;
    this.lostT = game.gameOver ? LOST_DARKEN_TIME : null;
    this.#seedDive();
    // Every attach is a new dive for the scene; the splash waits for the run to go under
    this.scene?.reset({ plunge: false });
    if (game.gameOver) this.scene?.onGameOver();
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const c = game.cell(x, y);
        if (c !== EMPTY) this.matrix[y * COLS + x] = new Block(c, x, y);
      }
    }
    for (const [x, y] of game.activeBlocks()) {
      const b = new Block(game.active.type, x, y);
      b.setLit(true, true);
      this.matrix[y * COLS + x] = b;
    }
    this.#showNext(game.next.type, false);
    if (game.hold >= 0) {
      this.holdBlocks = this.#holdTargets(game.hold).map(([x, y]) => {
        const b = new Block(game.hold, x, y);
        b.alpha = PREVIEW_ALPHA;
        return b;
      });
    }
    this.#placeGhost(true);
    this.unsubscribe = game.on((e) => this.#onEvent(e));
    this.dirty = true;
  }

  detach() {
    this.unsubscribe?.();
    this.unsubscribe = null;
    this.game = null;
    // Back on the title the ocean comes back to life instead of staying in its game-over gloom
    this.scene?.reset({ plunge: false });
    this.dirty = true;
  }

  /** Fades the board, previews included, out while paused so nobody plans moves on a frozen screen. */
  setPaused(paused, { immediately = false } = {}) {
    this.paused = paused;
    this.boardFade = new Tween(this, { boardAlpha: paused ? 0 : 1 }, immediately ? 0 : PAUSE_FADE, linear, 0);
    if (immediately) this.boardFade.update(0);
    this.dirty = true;
  }

  resize() {
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const rect = this.canvas.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width * dpr));
    const h = Math.max(1, Math.round(rect.height * dpr));
    if (this.canvas.width !== w) this.canvas.width = w;
    if (this.canvas.height !== h) this.canvas.height = h;
    this.layout = computeLayout(w, h, dpr);
    const L = this.layout;
    this.wellRect = { x: L.wellX, y: L.wellY, w: COLS * L.C, h: VISIBLE_ROWS * L.C, cell: L.C };
    this.#dropCaches();
    if (this.game) this.#snapSideBlocks();
  }

  /** Advances animations and notes whether anything moved, so idle frames can skip drawing. */
  update(dt) {
    this.time += dt;
    let busy = false;
    if (this.boardFade) {
      busy = true;
      if (this.boardFade.update(dt)) this.boardFade = null;
    }
    if (this.game) {
      const step = (b) => {
        if (b && b.tweens.length) {
          busy = true;
          b.update(dt);
        }
      };
      for (const b of this.matrix) {
        if (!b || !b.tweens.length) continue;
        busy = true;
        b.update(dt);
      }
      this.preview.forEach(step);
      this.holdBlocks.forEach(step);
      this.dying.forEach(step);
      this.ghost.forEach(step);
      if (this.dying.length) this.dying = this.dying.filter((b) => !b.dead);
      if (this.callout && this.#updateCallout(dt)) busy = true;
      if (this.critical && !this.reducedMotion) busy = true;
      if (this.zoneCall !== null && this.time >= this.zoneCall) {
        this.zoneCall = null;
        if (this.dive) this.#queueCallout(TEXT.osminok.zones[this.dive.zone], CALLOUT_SECONDS);
      }
      if (this.#updateHud()) busy = true;
      if (this.#updateSparks(dt)) busy = true;
    }
    if (this.starFlare) {
      busy = true;
      this.starFlare.t += dt;
      if (this.starFlare.t >= STAR_FLARE_TIME) {
        this.starFlare = null;
        this.dirty = true;
      }
    }
    // Scene backdrops move at full frame rate, so a theme with one draws every frame, menus included
    if (this.theme.scene) {
      busy = true;
      if (this.theme.dive) this.#updateDive(dt);
      this.#updateScene(dt);
    }
    // Animated wraps advance at their own frame rate (and hold still for reduced motion)
    const fps = this.reducedMotion ? 0 : this.theme.fps;
    if (fps) {
      const step = Math.floor(this.time * fps);
      if (step !== this.themeStep) {
        this.themeStep = step;
        this.themeT = step / fps;
        this.dirty = true;
      }
    }
    this.animating = busy;
  }

  // Events

  #onEvent(e) {
    this.dirty = true;
    switch (e.type) {
      case 'spawn': this.#onSpawn(e); break;
      case 'move': this.#onMove(e); break;
      case 'rotate': this.#onRotate(e); break;
      case 'lock': for (const [x, y] of e.blocks) this.#at(x, y)?.setLit(false); break;
      case 'conflict': this.#at(e.x, e.y)?.flare(); break;
      case 'clear': this.#onClear(e); break;
      case 'hold': this.#onHold(e); break;
      case 'callout': {
        // Game over leaves the words to the DO BETTER card; only Osminok's dive calls out how deep it was lost
        if (e.kind === 'gameOver') {
          if (this.theme.dive) this.#queueCallout(TEXT.osminok.lostAt(depthFor(this.game.lines).toLocaleString('en-US')), GAME_OVER_CALLOUT_SECONDS, null);
          break;
        }
        // The shell can hang a sub-line on a callout first (Consistent's payout under its BLOX line)
        this.#queueCallout(CALLOUT_TEXT[e.kind]?.(e.value) ?? e.kind, CALLOUT_SECONDS, e.sub ?? null);
        break;
      }
      case 'critical': this.critical = e.on; break;
      case 'gameOver': this.gameOver = true; this.ghost = []; this.lostT = 0; this.scene?.onGameOver(); break;
    }
  }

  /** Decorative slides (previews flying in, Hold, implosions, rows closing) snap into place for reduced motion;
   *  the falling piece's own moves keep their short tweens so control stays readable. */
  #motion(seconds) {
    return this.reducedMotion ? 0 : seconds;
  }

  #at(x, y) {
    return this.matrix[y * COLS + x] ?? null;
  }

  #take(blocks) {
    return blocks.map(([x, y]) => {
      const b = this.matrix[y * COLS + x];
      this.matrix[y * COLS + x] = null;
      return b;
    });
  }

  #put(blocks, actors, duration, ease) {
    blocks.forEach(([x, y], i) => {
      const b = actors[i];
      if (!b) return;
      b.moveTo(x, y, duration, ease);
      this.matrix[y * COLS + x] = b;
    });
  }

  #onSpawn(e) {
    if (this.preview.length) {
      const actors = this.preview;
      this.preview = [];
      actors.forEach((b) => { b.tweens = b.tweens.filter((t) => t === b.move); b.alphaTo(1, ACTIVATE_TIME); });
      this.#put(e.blocks, actors, this.#motion(ACTIVATE_TIME), fade);
      actors.forEach((b) => b.setLit(true));
    } else {
      e.blocks.forEach(([x, y]) => {
        const b = new Block(e.piece, x, y);
        b.setLit(true, true);
        this.matrix[y * COLS + x] = b;
      });
    }
    this.#showNext(e.next, true);
    this.#placeGhost(false);
  }

  #onMove(e) {
    const actors = this.#take(e.from);
    this.#put(e.from.map(([x, y]) => [x + e.dx, y + e.dy]), actors, MOVE_TIME, linear);
    this.#placeGhost(false);
  }

  #onRotate(e) {
    const actors = this.#take(e.from);
    this.#put(this.game.activeBlocks(), actors, ROTATE_TIME, linear);
    this.#placeGhost(false);
  }

  #onClear({ rows, special }) {
    if (this.theme.dive) this.#onDiveClear(rows);
    // Osminok's clears bring their own light, bolts and rings, instead of sparks
    else if (special && !this.reducedMotion) this.sparkEmit = { t: 0, x: COLS / 2, y: Math.min(...rows) + rows.length / 2, carry: 0 };
    // Other scenes hear the clear too, rows counted from the top of the well like the dive's
    if (!this.theme.dive) this.scene?.onClear?.({ rows: rows.map((y) => VISIBLE_ROWS - 1 - y), lines: rows.length, special: !!special });
    // Every star on the board flares with the clear: a quarter-strength flare per line
    if (this.theme.stars) {
      // A clear during a flare picks up from where the stars are now and still lands on a whole fifth of a turn
      const step = (2 * Math.PI) / 5;
      const now = this.#flareState();
      const base = now.turn % step;
      this.starFlare = { t: 0, k: rows.length / 4, from: now.flare, base, target: (base > 1e-6 ? step : 0) + rows.length * step };
    }
    const moveSource = Array.from({ length: ROWS }, (_, i) => i);
    for (let i = rows.length - 1; i >= 0; i--) {
      const y = rows[i];
      for (let x = 0; x < COLS; x++) {
        const b = this.matrix[y * COLS + x];
        this.matrix[y * COLS + x] = null;
        if (!b) continue;
        // A piece can lock and clear before any frame deals it a star
        if (b.star === undefined && this.theme.stars) b.star = starAt(x, y, this.theme.stars.density);
        b.setLit(true);
        // Special clears implode to one point; three-line clears pull each row to its own center
        // Reduced motion keeps the fade but skips the implosion
        if (special && !this.reducedMotion) b.moveTo(4.5, rows[0] - 0.5 + rows.length / 2, CLEAR_HOLD, fade);
        else if (rows.length >= 3 && !this.reducedMotion) b.moveTo(4.5, y, CLEAR_HOLD, fade);
        b.alphaTo(0, CLEAR_FADE, linear, CLEAR_HOLD, () => { b.dead = true; });
        this.dying.push(b);
      }
      for (let higher = y; higher < ROWS; higher++) moveSource[higher] = higher < ROWS - 1 ? moveSource[higher + 1] : -1;
    }
    for (let i = 0; i < ROWS; i++) {
      const from = moveSource[i];
      if (from < 0 || from === i) continue;
      for (let x = 0; x < COLS; x++) {
        const b = this.matrix[from * COLS + x];
        this.matrix[from * COLS + x] = null;
        this.matrix[i * COLS + x] = b;
        if (b) b.moveTo(x, i, this.#motion(ROW_DROP_TIME), linear, CLEAR_HOLD);
      }
    }
  }

  /** Names the dive zone shortly after a run starts; does nothing outside a dive theme. */
  announceZone() {
    if (this.game && this.theme.dive) this.zoneCall = this.time + ZONE_CALLOUT_DELAY;
  }

  /** Rolls the HUD numbers toward the game's and times their flashes; true while anything is still moving. */
  #updateHud() {
    const h = this.hud;
    const g = this.game;
    const dt = h.at === null ? 0 : this.time - h.at;
    h.at = this.time;
    if (g.score !== h.scoreTarget) {
      if (Math.abs(g.score - h.scoreTarget) >= SCORE_EMPHASIS_GAIN && !this.#emphasis(h.scoreEmph)) h.scoreEmph = this.time;
      h.scoreTarget = g.score;
      h.scoreSpeed = Math.max(SCORE_COUNT_SPEED, Math.abs(g.score - h.scoreF) / SCORE_COUNT_MAX_TIME);
    }
    if (g.level !== h.level) {
      if (!this.#emphasis(h.levelEmph)) h.levelEmph = this.time;
      h.level = g.level;
    }
    const toward = (from, to, step) => (from < to ? Math.min(to, from + step) : Math.max(to, from - step));
    h.scoreF = toward(h.scoreF, g.score, h.scoreSpeed * dt);
    h.linesF = toward(h.linesF, g.lines, LINES_COUNT_SPEED * dt);
    h.score = Math.trunc(h.scoreF);
    h.lines = Math.trunc(h.linesF);
    return h.score !== g.score || h.lines !== g.lines || this.#emphasis(h.scoreEmph) > 0 || this.#emphasis(h.levelEmph) > 0;
  }

  /** How strongly a flash that started at `start` still shows, 1 fading to 0. */
  #emphasis(start) {
    return start === null ? 0 : Math.max(0, 1 - (this.time - start) / EMPHASIS_TIME);
  }

  #updateSparks(dt) {
    const e = this.sparkEmit;
    if (e) {
      // libGDX scales each new spark's life down as the emitter runs: full, then 37% by 44%, then none
      const p = Math.min(1, e.t / SPARK_EMIT_TIME);
      const lifeScale = p < 0.44 ? 1 - (0.63 * p) / 0.44 : 0.37 * (1 - (p - 0.44) / 0.56);
      let count = e.t === 0 ? SPARK_BURST : 0;
      e.carry += SPARK_RATE * (1 - p) * dt;
      count += Math.floor(e.carry);
      e.carry %= 1;
      for (let i = 0; i < count; i++) this.#spark(e.x, e.y, lifeScale);
      e.t += dt;
      if (e.t >= SPARK_EMIT_TIME) this.sparkEmit = null;
    }
    if (!this.sparks.length) return !!e;
    for (const s of this.sparks) {
      s.age += dt;
      const t = s.age / s.life;
      const pull = SPARK_GRAVITY * (t < 0.55 ? 0.35 + (0.57 * t) / 0.55 : 0.92 + (0.02 * (t - 0.55)) / 0.45);
      s.vy -= pull * dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
    }
    this.sparks = this.sparks.filter((s) => s.age < s.life);
    return true;
  }

  #spark(x, y, lifeScale) {
    const angle = Math.random() * 2 * Math.PI;
    const speed = SPARK_SPEED[0] + Math.random() * (SPARK_SPEED[1] - SPARK_SPEED[0]);
    const high = SPARK_LIFE[1] + Math.random() * (SPARK_LIFE[2] - SPARK_LIFE[1]);
    this.sparks.push({
      x: x + (Math.random() - 0.5) * SPARK_SPREAD + (Math.random() * 2 - 1) * SPARK_JITTER,
      y: y + (Math.random() - 0.5) * SPARK_SPREAD,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      age: 0,
      life: SPARK_LIFE[0] + (high - SPARK_LIFE[0]) * lifeScale,
    });
  }

  /** Additive glows like block-light.png, fading in to 91% by a third of their life and out by the end. */
  #drawSparks(groupAlpha) {
    if (!this.sparks.length) return;
    const { ctx, layout: L } = this;
    // Sparks burn in the terminal's frame color, as Lightblocks' burst takes its skin's accent
    const sprite = this.#glowSprite(this.theme.frame);
    // A glow sprite spans 2.2 cells around its block, so this sizes the whole glow to the spark
    const scale = SPARK_SIZE / 2.2;
    const w = sprite.width * scale;
    const h = sprite.height * scale;
    const bottom = L.wellY + VISIBLE_ROWS * L.C;
    ctx.globalCompositeOperation = 'lighter';
    for (const s of this.sparks) {
      const t = s.age / s.life;
      const a = t < 0.34 ? 0.37 + (0.54 * t) / 0.34 : t < 0.79 ? 0.91 - (0.31 * (t - 0.34)) / 0.45 : 0.6 * (1 - (t - 0.79) / 0.21);
      ctx.globalAlpha = a * groupAlpha;
      ctx.drawImage(sprite, L.wellX + s.x * L.C - w / 2, bottom - s.y * L.C - h / 2, w, h);
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
  }

  /** Cleared lines sink the dive: a new zone dissolves in with its callout, and the scene gets the clear. */
  #onDiveClear(rows) {
    const depth = depthFor(this.game.lines);
    const before = depthFor(this.game.lines - rows.length);
    const zone = zoneIndexAt(depth);
    if (zone !== this.dive.zone) {
      this.dive = { zone, from: this.dive.zone, t: 0 };
      this.#queueCallout(TEXT.osminok.zones[zone], CALLOUT_SECONDS);
    }
    if (before < DEEPEST_CALLOUT && depth >= DEEPEST_CALLOUT) this.#queueCallout(TEXT.osminok.deepest(), CALLOUT_SECONDS);
    if (before < PLUNGE_DEPTH && depth >= PLUNGE_DEPTH) this.scene?.plunge();
    // The scene counts rows from the top of the well; the engine counts from the floor
    this.scene?.onClear({ rows: rows.map((y) => VISIBLE_ROWS - 1 - y), lines: rows.length, depth });
  }

  #onHold({ held, from, swapped, blocks }) {
    const outgoing = this.#take(from);
    const oldHold = this.holdBlocks;
    const targets = this.#holdTargets(held);
    outgoing.forEach((b, i) => {
      if (!b) return;
      b.moveTo(targets[i][0], targets[i][1], this.#motion(HOLD_MOVE_TIME), fade);
      b.alphaTo(PREVIEW_ALPHA, HOLD_FADE_TIME, fade);
      b.setLit(false);
    });
    this.holdBlocks = outgoing.filter(Boolean);
    if (swapped && blocks) {
      oldHold.forEach((b) => b.alphaTo(1, ACTIVATE_TIME));
      this.#put(blocks, oldHold, this.#motion(HOLD_MOVE_TIME), fade);
      this.#placeGhost(false);
    }
  }

  // Preview, hold, ghost

  #relative(type) {
    return pieceTemplates(type, this.game.mode.srs)[0];
  }

  // SRS pieces sit a row higher in their boxes, so previews come down one
  #nextTargets(type) {
    const o = this.layout.next;
    const dy = this.game.mode.srs ? -1 : 0;
    return this.#relative(type).map(([x, y]) => [o.x + x, o.y + y + dy]);
  }

  #holdTargets(type) {
    const o = this.layout.hold;
    const dy = this.game.mode.srs ? -1 : 0;
    return this.#relative(type).map(([x, y]) => [o.x + x, o.y + y + dy]);
  }

  // A new preview flies in block by block from alternating screen edges
  #showNext(type, animate) {
    const targets = this.#nextTargets(type);
    const edges = this.layout.edgesInCells;
    this.preview = targets.map(([x, y], i) => {
      if (!animate) {
        const b = new Block(type, x, y);
        b.alpha = PREVIEW_ALPHA;
        return b;
      }
      const b = new Block(type, i === 0 || i === 2 ? edges.left - 1 : edges.right + 1, i >= 2 ? edges.bottom : edges.top);
      b.alpha = 0;
      b.moveTo(x, y, this.#motion(NEXT_FLY_TIME), fade);
      b.alphaTo(PREVIEW_ALPHA, NEXT_FLY_TIME, fade);
      return b;
    });
  }

  #snapSideBlocks() {
    if (this.preview.length) {
      this.#nextTargets(this.preview[0].type).forEach(([x, y], i) => { const b = this.preview[i]; b.move = null; b.tweens = []; b.x = x; b.y = y; b.alpha = PREVIEW_ALPHA; });
    }
    if (this.holdBlocks.length) {
      this.#holdTargets(this.holdBlocks[0].type).forEach(([x, y], i) => { const b = this.holdBlocks[i]; b.move = null; b.tweens = []; b.x = x; b.y = y; b.alpha = PREVIEW_ALPHA; });
    }
  }

  #placeGhost(immediately) {
    const g = this.game;
    if (!g || g.gameOver || !g.mode.ghost) { this.ghost = []; return; }
    const d = g.ghostDistance();
    const blocks = g.activeBlocks();
    if (this.ghost.length !== blocks.length) this.ghost = blocks.map(([x, y]) => new Block(-1, x, y - d));
    blocks.forEach(([x, y], i) => {
      const gb = this.ghost[i];
      if (immediately) { gb.x = x; gb.y = y - d; } else gb.moveTo(x, y - d, d > 4 ? 0.1 : MOVE_TIME, fade);
    });
  }

  // Callouts rise from the bottom of the well, then later ones fade in where the label sits

  /** `sub` is a smaller line that rides under the callout (Osminok's final depth). */
  #queueCallout(text, duration, sub = null) {
    if (!this.callout) this.callout = { text, t: 0, first: true, duration, sub };
    else this.callouts.push({ text, duration, sub });
  }

  /** Advances the callout; returns false while it holds still, so a long "GAME OVER" doesn't force redraws. */
  #updateCallout(dt) {
    const c = this.callout;
    c.t += dt;
    const total = c.first ? 0.2 + 1 + Math.max(c.duration - 1, 0) + 0.3 : 0.2 + c.duration + 0.3;
    if (c.t >= total) {
      const next = this.callouts.shift();
      this.callout = next ? { ...next, t: 0, first: false, y: this.calloutY } : null;
      return true;
    }
    const still = c.first ? c.t > 1.2 && c.t < total - 0.3 : c.t > 0.2 && c.t < total - 0.3;
    return !still;
  }

  // Drawing. Anything with a blur (glows, text bloom, the frame) is rendered once into a cached sprite and
  // blitted after that, and nothing redraws unless something on screen changed.

  /** True when the next draw() would change the picture; the shell skips the frame otherwise. */
  get needsDraw() {
    return this.dirty || this.animating || this.waving || this.time >= this.glyphNext;
  }

  invalidate() {
    this.dirty = true;
  }

  get showGhost() {
    return this._showGhost;
  }

  set showGhost(on) {
    this._showGhost = on;
    this.dirty = true;
  }

  draw() {
    const { ctx, theme } = this;
    const { width: W, height: H } = this.canvas;
    this.dirty = false;
    // Set again by any waved text this draw, so a wave on screen keeps frames coming
    this.waving = false;
    // Lowered by every text() this frame, the shell's menus included (they draw after this returns)
    this.glyphNext = Infinity;
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.fillStyle = theme.background;
    ctx.fillRect(0, 0, W, H);
    const dive = theme.dive ? this.#diveState() : null;
    const sceneState = this.scene && theme.scene ? dive ?? this.#sceneState() : null;
    if (sceneState) this.#drawScene('drawBackdrop', sceneState);
    if (!this.game) return;

    const a = this.boardAlpha;
    // The pressure wins: the water darkens behind the still-lit blocks (the scene darkens its own backdrop)
    if (dive?.lost && !this.scene) {
      const w = this.wellRect;
      ctx.globalAlpha = LOST_DARKNESS * fade(dive.lost);
      ctx.fillStyle = '#000000';
      ctx.fillRect(w.x, w.y, w.w, w.h);
      ctx.globalAlpha = 1;
    }
    if (a > 0.001) {
      this.#drawWell(a);
      if (this.showGhost && this.ghost.length) this.#drawGhost(a);
      // Settled, unlit blocks are drawn once into a cached layer; only moving or glowing blocks draw each frame
      const settled = [];
      const moving = [...this.dying];
      const active = new Set(this.game.activeBlocks().map(([x, y]) => y * COLS + x));
      for (const b of this.dying) b.zone = 'stack';
      for (const b of [...this.preview, ...this.holdBlocks]) b.zone = 'active';
      this.matrix.forEach((b, i) => {
        if (!b) return;
        b.zone = active.has(i) && !this.gameOver ? 'active' : 'stack';
        if (!b.tweens.length && !b.lit && b.alpha === 1 && b.glow === DIM_GLOW) settled.push(b);
        else moving.push(b);
      });
      this.#drawStack(settled, a);
      this.#drawBlocks([...moving, ...this.preview, ...this.holdBlocks], a);
      if (theme.stars) this.#drawStars(a);
      if (sceneState) this.#drawScene('drawEffects', sceneState);
      this.#drawSparks(a);
    }
    this.#drawHud();
    if (a > 0.001) this.#drawCallout(a);
  }

  /** Scene drawing is fenced off so whatever canvas state it leaves behind can't leak into the game. */
  #drawScene(method, dive) {
    this.ctx.save();
    this.scene[method](this.ctx, this.wellRect, dive);
    this.ctx.restore();
  }

  #toScreen(x, y) {
    const L = this.layout;
    return [L.wellX + x * L.C, L.wellY + (VISIBLE_ROWS - 1 - y) * L.C];
  }

  #makeCanvas(w, h) {
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.ceil(w));
    c.height = Math.max(1, Math.ceil(h));
    return c;
  }

  /** A still image painted on one shared scratch canvas and kept as an ImageBitmap. Firefox caps how many
   *  GPU canvases a page may hold and drops the rest to slow software drawing, so sprites must not be canvases. */
  #bitmap(w, h, paint) {
    const W = Math.max(1, Math.ceil(w));
    const H = Math.max(1, Math.ceil(h));
    if (typeof OffscreenCanvas === 'undefined') {
      const c = this.#makeCanvas(W, H);
      paint(c.getContext('2d'));
      return c;
    }
    this.scratch ??= new OffscreenCanvas(W, H);
    const s = this.scratch;
    if (s.width !== W) s.width = W;
    if (s.height !== H) s.height = H;
    const g = s.getContext('2d');
    // Setting the width, even to itself, also clears the canvas and its drawing state
    if (g.reset) g.reset();
    else s.width = W;
    paint(g);
    return s.transferToImageBitmap();
  }

  /** Grid and glowing frame, each rendered once per size and theme. Both are almost empty, so each draw blits only
   *  their lit parts: the grid's lines as thin strips, the frame's glow as three bands. */
  #wellLayers() {
    if (this.layers) return this.layers;
    const { theme, layout: L } = this;
    const w = COLS * L.C;
    const h = VISIBLE_ROWS * L.C;
    const xs = Array.from({ length: COLS - 1 }, (_, i) => Math.round((i + 1) * L.C));
    const ys = Array.from({ length: VISIBLE_ROWS - 1 }, (_, i) => Math.round((i + 1) * L.C));
    const full = this.#bitmap(w, h, (g) => {
      g.strokeStyle = theme.grid;
      g.lineWidth = 1;
      g.beginPath();
      for (const x of xs) { g.moveTo(x + 0.5, 0); g.lineTo(x + 0.5, h); }
      for (const y of ys) { g.moveTo(0, y + 0.5); g.lineTo(w, y + 0.5); }
      g.stroke();
    });
    // The stroked grid's lit pixels are copied into two tiny bitmaps, a 1 px strip per line, so they keep whatever
    // the browser drew (crossings come out lit once or twice depending on the rasterizer). Columns keep the
    // crossings and rows leave them out, so every pixel is blitted exactly once
    const columns = this.#bitmap(xs.length, h, (g) => xs.forEach((x, i) => g.drawImage(full, x, 0, 1, h, i, 0, 1, h)));
    const rows = this.#bitmap(w, ys.length, (g) => {
      ys.forEach((y, i) => g.drawImage(full, 0, y, w, 1, 0, i, w, 1));
      for (const x of xs) g.clearRect(x, 0, 1, ys.length);
    });
    full.close?.();
    const grid = { columns, rows, xs, ys };

    const lw = Math.max(2, Math.round(L.C / 12));
    const m = Math.ceil(L.C * 1.2);
    const W = w + 2 * m;
    const H = h + m * 2;
    const blur = L.C * 0.4;
    const frame = this.#bitmap(W, H, (f) => {
      f.strokeStyle = theme.frame;
      f.lineWidth = lw;
      f.shadowColor = theme.frame;
      f.shadowBlur = blur;
      f.beginPath();
      f.moveTo(m - lw, m - L.C * 0.5);
      f.lineTo(m - lw, m + h + lw);
      f.lineTo(m + w + lw, m + h + lw);
      f.lineTo(m + w + lw, m - L.C * 0.5);
      f.stroke();
    });
    this.layers = { grid, frame, bands: frameBands(m, w, h, lw, blur), margin: m };
    return this.layers;
  }

  #drawWell(groupAlpha) {
    const { ctx, layout: L } = this;
    const { grid, frame, bands, margin } = this.#wellLayers();
    const w = COLS * L.C;
    const h = VISIBLE_ROWS * L.C;
    ctx.globalAlpha = groupAlpha;
    grid.xs.forEach((x, i) => ctx.drawImage(grid.columns, i, 0, 1, h, L.wellX + x, L.wellY, 1, h));
    grid.ys.forEach((y, i) => ctx.drawImage(grid.rows, 0, i, w, 1, L.wellX, L.wellY + y, w, 1));
    let frameAlpha = 0.55;
    if (this.critical) frameAlpha = this.reducedMotion ? 0.95 : 0.7 + 0.3 * Math.sin(this.time * 7);
    ctx.globalAlpha = frameAlpha * groupAlpha;
    const x = L.wellX - margin;
    const y = L.wellY - margin;
    // 1:1 at whole pixels, so each band lands exactly as that part of a full blit would
    for (const [sx, sy, sw, sh] of bands) ctx.drawImage(frame, sx, sy, sw, sh, x + sx, y + sy, sw, sh);
    ctx.globalAlpha = 1;
  }

  #drawGhost(a) {
    const { ctx, theme, layout: L } = this;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = theme.ghost;
    ctx.lineWidth = Math.max(1, Math.round(L.C / 16));
    ctx.setLineDash([Math.max(2, L.C / 6), Math.max(2, L.C / 8)]);
    const inset = L.C * 0.12;
    for (const g of this.ghost) {
      const [sx, sy] = this.#toScreen(g.x, g.y);
      ctx.strokeRect(sx + inset, sy + inset, L.C - 2 * inset, L.C - 2 * inset);
    }
    ctx.restore();
  }

  #drawStack(settled, groupAlpha) {
    const { layout: L } = this;
    // Room for a glow sprite (half-width 1.1C × boost) centered half a cell inside the well's edge, plus 0.1C slack
    const m = Math.ceil(L.C * Math.max(0.7, 1.1 * (this.theme.glowBoost ?? 1) - 0.4));
    const ox = L.wellX - m;
    const oy = L.wellY - 2 * L.C - m;
    // Settled blocks never move without a tween, so the same blocks in the same order mean the same picture
    const prev = this.stackLayer?.blocks;
    // Osminok's settled blocks thin out the deeper the dive goes, so the ocean shows through the stack
    const clarity = this.theme.dive && this.game ? Math.round(clarityAt(depthFor(this.game.lines)) * 100) / 100 : 1;
    const same = prev && this.stackLayer.step === this.themeStep && this.stackLayer.palette === this.divePalette && this.stackLayer.clarity === clarity && prev.length === settled.length && prev.every((b, i) => b === settled[i]);
    if (!same) {
      const t0 = performance.now();
      // The one canvas that changes often, so it's reused (and resized) rather than replaced
      const w = COLS * L.C + 2 * m;
      const h = ROWS * L.C + 2 * m;
      const layer = (this.stackCanvas ??= this.#makeCanvas(w, h));
      if (layer.width !== w) layer.width = w;
      if (layer.height !== h) layer.height = h;
      const lctx = layer.getContext('2d');
      lctx.clearRect(0, 0, layer.width, layer.height);
      this.#drawBlocks(settled, 1, lctx, ox, oy, clarity);
      // Everything above the highest settled block's glow stays clear, so the blit starts there; a pixel of slack
      // covers glows that land between pixels
      let high = -1;
      for (const b of settled) high = Math.max(high, b.y);
      const top = high < 0 ? h : Math.max(0, Math.floor((ROWS - 1 - high) * L.C + m + (L.C - this.#glowSize(L.C)) / 2) - 1);
      this.stackLayer = { canvas: layer, blocks: settled, step: this.themeStep, palette: this.divePalette, clarity, top };
      this.stats.stack++;
      this.stats.stackMs += performance.now() - t0;
    }
    const { canvas, top } = this.stackLayer;
    if (top >= canvas.height) return;
    this.ctx.globalAlpha = groupAlpha;
    this.ctx.drawImage(canvas, 0, top, canvas.width, canvas.height - top, ox, oy + top, canvas.width, canvas.height - top);
    this.ctx.globalAlpha = 1;
  }

  #starSprite(size, C) {
    const key = `${size}|${C}`;
    let s = this.starCache.get(key);
    if (s) return s;
    const r = C * STAR_RADII[size];
    const rim = Math.max(1, C * 0.06);
    const S = Math.ceil(2 * (r + rim) + C * 0.4);
    s = this.#bitmap(S, S, (g) => {
      g.translate(S / 2, S / 2);
      g.beginPath();
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 5;
        const d = i % 2 ? r * STAR_INNER : r;
        g.lineTo(Math.cos(a) * d, Math.sin(a) * d);
      }
      g.closePath();
      g.lineJoin = 'round';
      g.shadowColor = STAR_RIM;
      g.shadowBlur = C * 0.15;
      g.strokeStyle = STAR_RIM;
      g.lineWidth = rim * 2;
      g.stroke();
      g.shadowBlur = 0;
      g.fillStyle = STAR_SILVER;
      g.fill();
    });
    this.starCache.set(key, s);
    return s;
  }

  /** One star centered at (cx, cy); `flare` adds a second, additive copy on top. */
  #drawStar(ctx, cx, cy, C, star, alpha, angle, scale, flare = 0) {
    const sprite = this.#starSprite(star.size, C);
    const half = (sprite.width * scale) / 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.globalAlpha = Math.min(1, alpha);
    ctx.drawImage(sprite, -half, -half, half * 2, half * 2);
    if (flare > 0.01) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = Math.min(1, flare * 0.8);
      ctx.drawImage(sprite, -half, -half, half * 2, half * 2);
    }
    ctx.restore();
  }

  #twinkle(star, t) {
    return this.reducedMotion ? 1 : 1 - star.depth * (Math.sin(t * star.rate * Math.PI * 2 + star.phase) * 0.5 + 0.5);
  }

  /** How bright and how far turned the stars are right now: a flare rises fast from wherever the last one left off,
   *  then fades, while the turn eases out onto its target. */
  #flareState() {
    const f = this.starFlare;
    if (!f) return { flare: 0, turn: 0 };
    const p = Math.min(1, f.t / STAR_FLARE_TIME);
    const flare = p < 0.15 ? f.from + (f.k - f.from) * (p / 0.15) : f.k * (1 - fade((p - 0.15) / 0.85));
    return { flare, turn: this.reducedMotion ? 0 : f.base + (f.target - f.base) * circleOut(p) };
  }

  /** A block is dealt its star from the board cell where it settles and keeps it through row drops and its clear,
   *  so stars never pop on or off mid-slide. Falling pieces carry none; the pattern appears as you stack. */
  #drawStars(groupAlpha) {
    const { ctx, theme, layout: L } = this;
    const C = L.C;
    const { flare, turn } = this.#flareState();
    const scale = 1 + (this.reducedMotion ? 0 : 0.8 * flare);
    const active = new Set(this.gameOver ? [] : this.game.activeBlocks().map(([x, y]) => y * COLS + x));
    this.matrix.forEach((b, i) => {
      if (b && b.star === undefined && !active.has(i)) b.star = starAt(i % COLS, Math.floor(i / COLS), theme.stars.density);
    });
    for (const b of [...this.matrix, ...this.dying]) {
      if (!b?.star || b.y >= VISIBLE_ROWS - 0.5) continue;
      const [sx, sy] = this.#toScreen(b.x, b.y);
      const a = b.alpha * groupAlpha;
      this.#drawStar(ctx, sx + C / 2, sy + C / 2, C, b.star, a * this.#twinkle(b.star, this.themeT), b.star.spin + turn, scale, flare * a);
    }
    ctx.globalAlpha = 1;
  }

  /** Bodies first, then every glow on top additively, as Lightblocks' BlockGroup draws its two passes. Below full
   *  `clarity` the fill and glow fade but a solid outline stays, so a block never disappears. */
  #drawBlocks(blocks, groupAlpha, ctx = this.ctx, ox = 0, oy = 0, clarity = 1) {
    const { theme, layout: L } = this;
    const C = L.C;
    const pad = Math.max(1, Math.round(C / 17));
    const core = C * 0.24;
    const outline = Math.max(1, Math.round(C / 12));
    // Glow fades slower than the fill, so deep blocks still read as living light
    const glowClarity = 0.3 + 0.7 * clarity;
    ctx.globalCompositeOperation = 'source-over';
    for (const b of blocks) {
      const alpha = b.alpha * groupAlpha;
      if (alpha <= 0.002) continue;
      const [px, py] = this.#toScreen(b.x, b.y);
      const sx = px - ox;
      const sy = py - oy;
      const color = theme.body(b.type, Math.round(b.x), Math.round(b.y), b.zone, this.themeT, this.divePalette);
      ctx.globalAlpha = alpha * 0.9 * clarity;
      ctx.fillStyle = color;
      ctx.fillRect(sx + pad, sy + pad, C - 2 * pad, C - 2 * pad);
      ctx.globalAlpha = alpha * 0.45 * clarity;
      ctx.fillStyle = theme.background;
      ctx.fillRect(sx + core, sy + core, C - 2 * core, C - 2 * core);
      if (clarity < 1) {
        ctx.globalAlpha = alpha * 0.9;
        ctx.strokeStyle = color;
        ctx.lineWidth = outline;
        ctx.strokeRect(sx + pad + outline / 2, sy + pad + outline / 2, C - 2 * pad - outline, C - 2 * pad - outline);
      }
    }
    ctx.globalCompositeOperation = 'lighter';
    for (const b of blocks) {
      const alpha = b.alpha * groupAlpha * b.glow;
      if (alpha <= 0.002) continue;
      const [px, py] = this.#toScreen(b.x, b.y);
      const sx = px - ox;
      const sy = py - oy;
      const sprite = this.#glowSprite(theme.glow(b.type, Math.round(b.x), Math.round(b.y), b.zone, this.themeT, this.divePalette));
      ctx.globalAlpha = alpha * 0.6 * glowClarity;
      ctx.drawImage(sprite, sx + C / 2 - sprite.width / 2, sy + C / 2 - sprite.height / 2);
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
  }

  #glowSprite(color, size = this.layout.C) {
    const boost = this.theme.glowBoost ?? 1;
    const key = `${color}|${size}|${boost}`;
    let s = this.glowCache.get(key);
    if (s) return s;
    // Animated themes must not grow this forever; a full cache simply starts over
    if (this.glowCache.size >= 96) this.#evict(this.glowCache);
    const C = size;
    const S = this.#glowSize(C);
    s = this.#bitmap(S, S, (g) => {
      const m = S / 2;
      g.shadowColor = color;
      g.shadowBlur = C * 0.45 * boost;
      g.fillStyle = color;
      g.globalAlpha = 0.8;
      // A boosted theme stacks the blurred fill for a wider, hotter halo in the same shade
      for (let pass = 0; pass < Math.ceil(boost); pass++) g.fillRect(m - C * 0.44, m - C * 0.44, C * 0.88, C * 0.88);
      g.globalAlpha = 1;
      g.shadowBlur = 0;
      g.globalCompositeOperation = 'lighter';
      g.fillStyle = 'rgba(255, 255, 255, 0.35)';
      g.fillRect(m - C * 0.2, m - C * 0.2, C * 0.4, C * 0.4);
    });
    this.glowCache.set(key, s);
    this.stats.glow++;
    return s;
  }

  /** A glow sprite's side for a block of size C. */
  #glowSize(C) {
    return Math.ceil(C * 2.2 * (this.theme.glowBoost ?? 1));
  }

  /** The width every menu panel gets, so title art can line up with it. */
  menuWidth() {
    const L = this.layout;
    return Math.min(L.W - L.unit * 2, Math.max(COLS * L.C + L.unit * 4, L.unit * 26));
  }

  /** Font sizes snap to the font's 11 px pixel grid so the pixel letters stay crisp. */
  fontPx(size) {
    return this.#fontPx(size);
  }

  #fontPx(size) {
    return Math.max(11, Math.round((this.layout.unit * size) / 11) * 11);
  }

  #font(px) {
    return `${px}px ${FONT}`;
  }

  measure(str, size = 1) {
    const { ctx } = this;
    ctx.save();
    ctx.font = this.#font(this.#fontPx(size));
    const w = ctx.measureText(str).width;
    ctx.restore();
    return w;
  }

  /** The largest size, up to `size` and never below 1, at which str fits in maxWidth. */
  fitSize(str, maxWidth, size) {
    const step = 11 / this.layout.unit;
    let s = size;
    while (s > 1 && this.measure(str, s) > maxWidth) s -= step;
    return Math.max(1, s);
  }

  /** Splits text into lines no wider than maxWidth at the given size, also breaking at every newline. Emphasis
   *  markers are closed and reopened around each break so every line stands on its own. */
  wrap(str, maxWidth, size = 1) {
    const out = [];
    for (const paragraph of str.split('\n')) {
      let line = '';
      for (const word of paragraph.split(' ')) {
        const test = line ? `${line} ${word}` : word;
        if (line && this.measure(unmarked(test), size) > maxWidth) { out.push(line); line = word; } else line = test;
      }
      out.push(line);
    }
    let open = { bold: false, wave: false, dim: false };
    return out.map((l) => {
      const line = (open.bold ? EMPHASIS : '') + (open.wave ? WAVE : '') + (open.dim ? DIM_MARK : '') + l;
      const { bold, wave, dim } = markedRuns(line);
      open = { bold, wave, dim };
      return line + (dim ? DIM_MARK : '') + (wave ? WAVE : '') + (bold ? EMPHASIS : '');
    });
  }

  /** A centered line whose `{name}` tokens draw as controller button glyphs in `glyphColor`. */
  #buttonLine(line, cx, y, style, glyphColor) {
    const runs = line.split(BUTTON_TOKEN);
    if (runs.length === 1) return this.text(line, cx, y, { ...style, align: 'center' });
    const { ctx } = this;
    // Whole font pixels, so the glyphs land on the same grid as the letters around them
    const px = this.#fontPx(1) / 11;
    let x = Math.round(cx - this.measure(unmarked(line)) / 2);
    ctx.beginPath();
    runs.forEach((run, i) => {
      if (i % 2 === 0) {
        this.text(run, x, y, { ...style, align: 'left' });
        x += this.measure(run);
        return;
      }
      BUTTONS[run]?.forEach((row, r) => [...row].forEach((c, col) => {
        if (c === '#') ctx.rect(x + col * px, Math.round(y) + (r - 9) * px, px, px);
      }));
      x += BUTTON_ADVANCES * 7 * px;
    });
    ctx.globalAlpha = style.alpha ?? 1;
    ctx.fillStyle = glyphColor;
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  /** A centered line whose **marked** runs draw with the `marked` text options (the canvas stand-in for bold) and
   *  whose *waved* runs bob letter by letter, old RuneScape style. Reduced motion holds the wave still. */
  #markedLine(line, cx, y, plainStyle, marked) {
    const { runs } = markedRuns(line);
    if (runs.length === 1 && !runs[0].bold && !runs[0].wave && !runs[0].dim) return this.text(runs[0].text, cx, y, { ...plainStyle, align: 'center' });
    const size = plainStyle.size ?? 1;
    const px = this.#fontPx(size) / 11;
    let x = cx - this.measure(unmarked(line), size) / 2;
    let letter = 0;
    for (const run of runs) {
      const style = { ...plainStyle, ...(run.bold ? marked : {}), align: 'left' };
      if (run.dim) style.alpha = (style.alpha ?? 1) * DIM_RUN;
      const width = this.measure(run.text, size);
      if (run.wave && !this.reducedMotion) {
        const chars = [...run.text];
        const advance = width / chars.length;
        chars.forEach((ch, i) => {
          const lift = WAVE_HEIGHT * Math.sin(this.time * WAVE_SPEED - letter++ * WAVE_STEP);
          if (ch !== ' ') this.text(ch, x + i * advance, y - lift * px, style);
        });
        this.waving = true;
      } else this.text(run.text, x, y, style);
      x += width;
    }
  }

  /** A string rendered once, bloom and outline included, then reused until the text or size changes. */
  #textSprite(str, px, color, glow, outline, spacing = 0, bold = false) {
    const key = `${px}|${color}|${glow}|${outline}|${spacing}|${bold}|${str}`;
    let s = this.textCache.get(key);
    if (s) {
      // Recently used text moves to the back of the line, so counting HUD numbers only push out stale strings
      this.textCache.delete(key);
      this.textCache.set(key, s);
      return s;
    }
    if (this.textCache.size >= 400) {
      const [oldest, sprite] = this.textCache.entries().next().value;
      sprite.img.close?.();
      this.textCache.delete(oldest);
    }
    const probe = this.ctx;
    probe.save();
    probe.font = this.#font(px);
    const m = probe.measureText(str);
    probe.restore();
    const ascent = Math.ceil(m.actualBoundingBoxAscent ?? px * 0.8);
    const descent = Math.ceil(m.actualBoundingBoxDescent ?? px * 0.25);
    const blur = px * glow;
    const stroke = outline ? Math.max(2, Math.round(px * 0.28)) : 0;
    const pad = Math.ceil(blur * 1.6 + stroke + 2);
    const chars = [...str];
    const boldShift = bold ? Math.max(1, Math.round(px / 11)) : 0;
    const width = m.width + spacing * Math.max(0, chars.length - 1) + boldShift;
    // The font is monospaced, so spaced text is each character at its own advance plus the extra gap
    const advance = m.width / Math.max(1, chars.length) + spacing;
    const strike = (g, fn, dx) => {
      if (!spacing) return g[fn](str, pad + dx, pad + ascent);
      chars.forEach((ch, i) => g[fn](ch, pad + dx + i * advance, pad + ascent));
    };
    const draw = (g, fn) => {
      strike(g, fn, 0);
      if (boldShift) strike(g, fn, boldShift);
    };
    const img = this.#bitmap(width + pad * 2, ascent + descent + pad * 2, (g) => {
      g.font = this.#font(px);
      g.textBaseline = 'alphabetic';
      if (outline) {
        g.strokeStyle = outline;
        g.lineWidth = stroke;
        g.lineJoin = 'round';
        draw(g, 'strokeText');
      }
      g.fillStyle = color;
      if (blur > 0) { g.shadowColor = color; g.shadowBlur = blur; }
      draw(g, 'fillText');
    });
    s = { img, width, ascent, pad };
    this.textCache.set(key, s);
    this.stats.text++;
    return s;
  }

  /** Text on the 11 px pixel grid with a phosphor bloom; y is the baseline. `spacing` adds that many pixels between
   *  characters, for stretching a line to an exact width. */
  text(str, x, y, { size = 1, align = 'left', color = this.theme.text, glow = 0.6, alpha = 1, outline = null, spacing = 0, bold = false, staryllic = 1 } = {}) {
    if (!str) return;
    // The translation layer glitches only in the drawn glyphs; layout and hit boxes keep the Latin string
    const { text: shown, next } = glyphFlicker(str, this.time, { rate: this.reducedMotion ? 0 : staryllic });
    if (next < this.glyphNext) this.glyphNext = next;
    const { img, width, ascent, pad } = this.#textSprite(shown, this.#fontPx(size), color, glow, outline, Math.round(spacing), bold);
    const ox = align === 'center' ? width / 2 : align === 'right' ? width : 0;
    const { ctx } = this;
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, Math.round(x - ox) - pad, Math.round(y) - ascent - pad);
    ctx.globalAlpha = 1;
  }

  #drawHud() {
    const { layout: L, game: g, theme } = this;
    const fmt = (n) => n.toLocaleString('en-US');
    // Each stat as [label key, value, then ever shorter values a narrow portrait column falls back to]
    const stat = (key, n) => [key, fmt(n), COMPACT.format(n)];
    const h = this.hud;
    const rows = [stat('score', h.score), stat('lines', h.lines), stat('level', g.level)];
    const flash = { score: this.#emphasis(h.scoreEmph), level: this.#emphasis(h.levelEmph) };
    if (g.mode.practice) rows.push(stat('blocks', g.blocks));
    if (theme.dive) {
      const km = depthFor(g.lines) / 1000;
      rows.push(['depth', TEXT.osminok.meters(fmt(km * 1000)), TEXT.osminok.km(KM.format(km)), TEXT.osminok.kmTight((km < 10 ? KM : WHOLE_KM).format(km))]);
    }
    this.text(TEXT.hud.next, L.nextLabel.x, L.nextLabel.y, { color: theme.dimText, glow: 0.3, staryllic: HUD_STARYLLIC });
    if (g.mode.hold && !this.holdButton) this.text(TEXT.hud.hold, L.holdLabel.x, L.holdLabel.y, { color: theme.dimText, glow: 0.3, staryllic: HUD_STARYLLIC });
    if (L.portrait) {
      const colW = (COLS * L.C) / rows.length;
      const fits = (s) => this.measure(s) <= colW * 0.94;
      // Text never shrinks below the phone floor: labels abbreviate together, values step down to 1.2M style
      const labels = rows.every(([key]) => fits(TEXT.hud[key])) ? TEXT.hud : TEXT.hudShort;
      rows.forEach(([key, ...values], i) => {
        const x = L.wellX + colW * (i + 0.5);
        const shown = values.find(fits) ?? values.at(-1);
        this.text(labels[key], x, L.statsLabelY, { align: 'center', color: theme.dimText, glow: 0.3, staryllic: HUD_STARYLLIC });
        this.text(shown, x, L.statsValueY, { align: 'center' });
        if (flash[key]) this.text(shown, x, L.statsValueY, { align: 'center', color: theme.calloutText, glow: 0.9, alpha: flash[key] });
      });
    } else {
      // One size for every value, shrunk only when the widest would spill out of the side panel
      const size = Math.min(...rows.map(([, v]) => this.fitSize(v, L.statsWidth, 2)));
      rows.forEach(([key, v], i) => {
        const y = L.statsY + i * L.unit * (2.4 + size);
        this.text(TEXT.hud[key], L.statsX, y, { color: theme.dimText, glow: 0.3, staryllic: HUD_STARYLLIC });
        this.text(v, L.statsX, y + L.unit * (0.4 + size), { size });
        if (flash[key]) this.text(v, L.statsX, y + L.unit * (0.4 + size), { size, color: theme.calloutText, glow: 0.9, alpha: flash[key] });
      });
    }
  }

  #drawCallout(boardAlpha) {
    const c = this.callout;
    if (!c) return;
    const { layout: L, theme } = this;
    let rise;
    let alpha;
    if (c.first) {
      const t = c.t;
      if (t < 0.2) rise = -1 + 2 * circleOut(t / 0.2);
      else if (t < 1.2) rise = 1 + (t - 0.2);
      else rise = 2;
      const fadeStart = 1.2 + Math.max(c.duration - 1, 0);
      alpha = t < fadeStart ? 1 : 1 - fade(Math.min(1, (t - fadeStart) / 0.3));
      this.calloutY = rise;
    } else {
      rise = c.y ?? 2;
      const t = c.t;
      alpha = t < 0.2 ? fade(t / 0.2) : t < 0.2 + c.duration ? 1 : 1 - fade(Math.min(1, (t - 0.2 - c.duration) / 0.3));
    }
    const [, sy] = this.#toScreen(0, rise);
    // Near-white with a dark outline so callouts read over a full stack; long ones shrink to fit the well
    if (c.fitFor !== L) {
      c.fitFor = L;
      c.size = this.fitSize(unmarked(c.text), COLS * L.C * 0.96, 2);
      if (c.sub) c.subSize = this.fitSize(c.sub, COLS * L.C * 0.96, 1);
    }
    // A marked word in a callout takes the theme's own color with a stronger bloom
    this.#markedLine(c.text, L.wellX + (COLS * L.C) / 2, sy, {
      size: c.size, alpha: alpha * CALLOUT_OPACITY * boardAlpha, glow: 0.5, color: theme.calloutText, outline: theme.calloutOutline,
    }, { color: theme.text, glow: 0.9 });
    if (c.sub) {
      this.text(c.sub, L.wellX + (COLS * L.C) / 2, sy + this.#fontPx(c.subSize) * 1.8, {
        size: c.subSize, align: 'center', alpha: alpha * CALLOUT_OPACITY * boardAlpha, glow: 0.5, color: theme.calloutText, outline: theme.calloutOutline,
      });
    }
  }

  /** Menu panel over the well. Items are { label, value?, adjustable? }; returns their hit boxes in canvas pixels. */
  #menuMetrics({ title, lines = [], items = [], hint, slot, breaks = [], hintBreak = false }) {
    const L = this.layout;
    const unit = L.unit;
    // Rows stay at least 44 CSS px tall so they work as touch targets
    const rowH = Math.max(unit * 2.4, 44 * L.dpr);
    const width = this.menuWidth();
    const breakH = unit * 1.2;
    const dividers = breaks.filter((i) => i > 0 && i < items.length).length + (hint && hintBreak ? 1 : 0);
    // A null line is a divider, like `breaks` between rows
    const wrapped = lines.flatMap((l) => (l === null ? [null] : this.wrap(l, width - unit * 3)));
    const lineBreaks = wrapped.filter((l) => l === null).length;
    const hintLines = hint ? this.wrap(hint, width - unit * 3) : [];
    const titleH = title ? unit * 3.6 : 0;
    const slotH = slot ? slot.height(width - unit * 4) + unit : 0;
    // Where the first row starts, measured from the panel's top edge
    const rowsTop = unit * 1.5 + titleH + (wrapped.length - lineBreaks) * unit * 1.9 + lineBreaks * breakH + (wrapped.length ? unit : 0) + slotH;
    const height = rowsTop - unit * 1.5 + items.length * rowH + dividers * breakH + hintLines.length * unit * 1.7 + (hint ? unit : 0) + unit * 2;
    return { rowH, width, breakH, wrapped, hintLines, titleH, slotH, rowsTop, height };
  }

  /** How tall a menu panel would be, so a screen can lay out art around it. */
  menuHeight(menu) {
    return this.#menuMetrics(menu).height;
  }

  /** `breaks` puts dividers above those rows (`hintBreak` above the hint), and a `hintRow` dims the hint unless that
   *  row is selected. A panel too tall for its room scrolls by `scroll`, `follow` keeps the selected row in view, and
   *  `lastMenu` reports the offset and visible band for hit tests. */
  drawMenu(menu) {
    const { title, items = [], selected = 0, hint, hintRow, top, slot, breaks = [], hintBreak = false, scroll = 0, follow = true, lineStaryllic = 1 } = menu;
    const { ctx, theme, layout: L } = this;
    const unit = L.unit;
    const { rowH, width, breakH, wrapped: lines, hintLines, titleH, slotH, rowsTop, height } = this.#menuMetrics(menu);
    const x0 = Math.round((L.W - width) / 2);
    const regionBottom = L.H - unit * 0.5;
    // However little room the art leaves, at least two rows stay visible and usable, even if the panel overlaps it
    const regionTop = Math.min(top ?? unit, regionBottom - rowH * 2);
    const room = regionBottom - regionTop;
    let y0;
    let offset = 0;
    let maxScroll = 0;
    if (top === undefined && height <= L.H - unit * 2) y0 = Math.round((L.H - height) / 2);
    else if (height <= room) y0 = Math.round(regionTop);
    else {
      maxScroll = height - room;
      offset = Math.min(maxScroll, Math.max(0, scroll));
      if (follow && items.length) {
        const selTop = rowsTop + selected * rowH + breaks.filter((i) => i > 0 && i <= selected).length * breakH;
        if (selTop - offset < unit) offset = selTop - unit;
        if (selTop + rowH - offset > room - unit) offset = selTop + rowH - room + unit;
        offset = Math.min(maxScroll, Math.max(0, offset));
      }
      y0 = Math.round(regionTop - offset);
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, regionTop, L.W, room);
      ctx.clip();
    }
    this.lastMenu = { scroll: offset, maxScroll, top: maxScroll ? regionTop : y0, bottom: maxScroll ? regionBottom : y0 + height };
    const lw = Math.max(2, Math.round(L.C / 14));
    ctx.globalAlpha = 0.88;
    ctx.fillStyle = theme.background;
    ctx.fillRect(x0, y0, width, height);
    // A wide faint stroke under a thin one stands in for a blurred glow, at a fraction of the cost
    ctx.strokeStyle = theme.frame;
    ctx.globalAlpha = 0.12;
    ctx.lineWidth = lw * 4;
    ctx.strokeRect(x0, y0, width, height);
    ctx.globalAlpha = 0.6;
    ctx.lineWidth = lw;
    ctx.strokeRect(x0, y0, width, height);
    ctx.globalAlpha = 1;

    const cx = x0 + width / 2;
    let y = y0 + unit * 1.5;
    if (title) {
      this.#markedLine(title, cx, y + unit * 2, { size: this.fitSize(unmarked(title), width - unit * 3, 2), glow: 0.8 }, { bold: true, glow: 1 });
      y += titleH;
    }
    const divider = () => {
      const w = Math.round(width * 0.5);
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = theme.frame;
      ctx.fillRect(Math.round(cx - w / 2), Math.round(y + breakH / 2), w, Math.max(1, Math.round(L.dpr)));
      ctx.globalAlpha = 1;
      y += breakH;
    };
    for (const line of lines) {
      if (line === null) {
        divider();
        continue;
      }
      this.#markedLine(line, cx, y + unit, { color: theme.dimText, glow: 0.3, staryllic: lineStaryllic }, { color: theme.text, glow: 0.6 });
      y += unit * 1.9;
    }
    if (lines.length) y += unit;
    if (slot) {
      slot.draw(x0 + unit * 2, y, width - unit * 4);
      y += slotH;
    }
    const boxes = items.map((item, i) => {
      if (i > 0 && breaks.includes(i)) divider();
      const on = i === selected;
      const label = item.value !== undefined ? `${item.label}  ${item.adjustable ? `← ${item.value} →` : item.value}` : item.label;
      if (on) {
        ctx.globalAlpha = 0.16;
        ctx.fillStyle = theme.frame;
        ctx.fillRect(x0 + unit, y, width - unit * 2, rowH - unit * 0.3);
        ctx.globalAlpha = 1;
      }
      const shown = on && !item.icon ? `■ ${label}` : label;
      const color = on ? theme.text : theme.dimText;
      const baseline = y + rowH * 0.62;
      // Emphasis on a row keeps the row's own color and goes bold, so the selected row still stands out
      this.#markedLine(shown, cx, baseline, { color, glow: on ? 0.7 : 0.2, staryllic: item.staryllic ?? 1 }, { bold: true, glow: on ? 0.9 : 0.35 });
      if (item.icon) this.#drawIcon(ICONS[item.icon], cx - this.measure(unmarked(shown)) / 2 - unit * 0.8, baseline, color);
      const box = { x: x0, y, w: width, h: rowH };
      // Where the ← → of an adjustable value sit, a character wider each side so they're easy to hit
      if (item.adjustable && item.value !== undefined) {
        const text = unmarked(shown);
        const advance = this.measure(text) / text.length;
        const start = cx - (advance * text.length) / 2;
        const around = (i) => [start + (i - 1) * advance, start + (i + 2) * advance];
        box.arrows = { left: around(text.indexOf('←')), right: around(text.lastIndexOf('→')) };
      }
      y += rowH;
      return box;
    });
    if (hint && hintBreak) divider();
    const hintAlpha = hintRow === undefined || hintRow === selected ? HINT_ALPHA : HINT_DIM;
    hintLines.forEach((h, i) => this.#buttonLine(h, cx, y + unit * (1.8 + i * 1.7), { color: theme.dimText, glow: 0, alpha: hintAlpha }, theme.text));
    if (maxScroll) {
      ctx.restore();
      // Little triangles at the panel's edges say there's more above or below
      const tri = (yTip, up) => {
        const w = unit * 0.7;
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = theme.text;
        ctx.beginPath();
        ctx.moveTo(cx, yTip);
        ctx.lineTo(cx - w, yTip + (up ? w : -w));
        ctx.lineTo(cx + w, yTip + (up ? w : -w));
        ctx.fill();
        ctx.globalAlpha = 1;
      };
      if (offset > 0) tri(regionTop + unit * 0.3, true);
      if (offset < maxScroll) tri(regionBottom - unit * 0.3, false);
    }
    return boxes;
  }

  /** A pixel icon, five rows tall, whose right edge sits at `right`, sized to the menu text's cap height on that baseline. */
  #drawIcon(icon, right, baseline, color) {
    if (!icon) return;
    const { ctx } = this;
    const cell = Math.max(2, Math.round((this.#fontPx(1) * 0.7) / 5));
    const x0 = Math.round(right - cell * icon[0].length);
    const y0 = Math.round(baseline - cell * 5);
    ctx.fillStyle = color;
    icon.forEach((row, r) => [...row].forEach((c, col) => {
      if (c === '#') ctx.fillRect(x0 + col * cell, y0 + r * cell, cell, cell);
    }));
  }

  /** The wordmark's block size for a given width budget and height cap, so a screen can plan around it. */
  wordmarkCell(maxWidth, maxCell = Infinity) {
    const cols = WORDMARK_TEXT.length * 4 - 1;
    return Math.max(4, Math.floor(Math.min(maxWidth / cols, this.layout.H / 15, maxCell)));
  }

  /** The title wordmark, built from lit blocks that switch on in a sweep (instantly with reduced motion). `pulse`
   *  ({ col, row, age } in wordmark cells and seconds) adds a glow ring spreading from a tap. */
  drawWordmark(cx, cy, maxWidth, sinceShown, pulse = null, maxCell = Infinity) {
    const cols = WORDMARK_TEXT.length * 4 - 1;
    const cell = this.wordmarkCell(maxWidth, maxCell);
    const x0 = Math.round(cx - (cols * cell) / 2);
    const y0 = Math.round(cy - (5 * cell) / 2);
    const { ctx, theme } = this;
    const pad = Math.max(1, Math.round(cell / 9));
    [...WORDMARK_TEXT].forEach((ch, li) => {
      GLYPHS[ch].forEach((row, ry) => [...row].forEach((c, rx) => {
        if (c !== '#') return;
        const col = li * 4 + rx;
        const on = this.reducedMotion ? 1 : Math.min(1, Math.max(0, (sinceShown - col * 0.025) / 0.2));
        if (on <= 0) return;
        let glow = this.reducedMotion ? 0.7 : 0.55 + 0.45 * Math.max(0, 1 - (sinceShown - col * 0.025 - 0.2) / 0.6);
        if (pulse && pulse.age < PULSE_LIFE) {
          const fadeOut = 1 - pulse.age / PULSE_LIFE;
          // Reduced motion gets the brightening without the travelling ring
          const ring = this.reducedMotion ? 1 : Math.max(0, 1 - Math.abs(Math.hypot(col - pulse.col, ry - pulse.row) - pulse.age * PULSE_SPEED) / PULSE_BAND);
          glow += 0.6 * ring * fadeOut;
        }
        const sx = x0 + col * cell;
        const sy = y0 + ry * cell;
        ctx.globalAlpha = on * 0.9;
        ctx.fillStyle = theme.body(li % 7, col, 4 - ry, 'active', this.themeT);
        ctx.fillRect(sx + pad, sy + pad, cell - 2 * pad, cell - 2 * pad);
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = Math.min(1, on * glow * 0.6);
        const sprite = this.#glowSprite(theme.glow(li % 7, col, 4 - ry, 'active', this.themeT), cell);
        ctx.drawImage(sprite, sx + cell / 2 - sprite.width / 2, sy + cell / 2 - sprite.height / 2);
        ctx.globalCompositeOperation = 'source-over';
      }));
    });
    ctx.globalAlpha = 1;
    return { left: x0, right: x0 + cols * cell, top: y0, bottom: y0 + 5 * cell, cell, animating: !this.reducedMotion && sinceShown < cols * 0.025 + 0.8 };
  }

  /** A small sample of a theme for the picker: settled stack, a lit falling T, and the well frame. */
  drawThemeSwatch(theme, x, y, width) {
    const { ctx } = this;
    const cell = Math.floor(width / COLS);
    const x0 = Math.round(x + (width - cell * COLS) / 2);
    const pad = Math.max(1, Math.round(cell / 9));
    const t = this.reducedMotion || !theme.fps ? 0 : Math.floor(this.time * theme.fps) / theme.fps;
    ctx.fillStyle = theme.background;
    ctx.fillRect(x0 - pad * 2, y - pad * 2, cell * COLS + pad * 4, cell * SWATCH.length + pad * 4);
    ctx.strokeStyle = theme.frame;
    ctx.globalAlpha = 0.6;
    ctx.lineWidth = Math.max(1, pad);
    ctx.strokeRect(x0 - pad * 2, y - pad * 2, cell * COLS + pad * 4, cell * SWATCH.length + pad * 4);
    const cells = [];
    SWATCH.forEach((row, r) => [...row].forEach((c, col) => {
      if (c === '.') return;
      // Board coordinates from the bottom so board-space wraps show their lower rows
      cells.push({ col, r, by: SWATCH.length - 1 - r, zone: c === 'A' ? 'active' : 'stack', type: c === 'A' ? 1 : (col + r) % 7 });
    }));
    for (const b of cells) {
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = theme.body(b.type, b.col, b.by, b.zone, t);
      ctx.fillRect(x0 + b.col * cell + pad, y + b.r * cell + pad, cell - 2 * pad, cell - 2 * pad);
    }
    ctx.globalCompositeOperation = 'lighter';
    for (const b of cells) {
      const sprite = this.#glowSprite(theme.glow(b.type, b.col, b.by, b.zone, t), cell);
      ctx.globalAlpha = (b.zone === 'active' ? 1 : DIM_GLOW) * 0.6;
      ctx.drawImage(sprite, x0 + b.col * cell + cell / 2 - sprite.width / 2, y + b.r * cell + cell / 2 - sprite.height / 2);
    }
    ctx.globalCompositeOperation = 'source-over';
    if (theme.stars) {
      for (const b of cells) {
        const star = starAt(b.col, b.by, theme.stars.density);
        if (star) this.#drawStar(ctx, x0 + b.col * cell + cell / 2, y + b.r * cell + cell / 2, cell, star, 0.9 * this.#twinkle(star, t), star.spin, 1);
      }
    }
    ctx.globalAlpha = 1;
    return { height: cell * SWATCH.length + pad * 4 };
  }

  /** The touch guide under a finger: rotate arrow at the touch point, slide arrows at the drag threshold. */
  drawTouchPanel(panel) {
    const { ctx, theme, layout: L } = this;
    const k = L.dpr;
    const x = panel.x * k;
    const y = panel.y * k;
    const t = panel.threshold * k;
    const r = Math.max(10 * k, t * 0.45);
    const color = panel.cw ? theme.text : theme.dimText;
    ctx.save();
    ctx.globalAlpha = 0.75;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = Math.max(2, 2.5 * k);
    // A three-quarter arc with an arrowhead pointing the way the tap will turn the piece
    const start = panel.cw ? -Math.PI * 0.75 : -Math.PI * 0.25;
    const end = panel.cw ? Math.PI * 0.75 : Math.PI * 1.25;
    ctx.beginPath();
    ctx.arc(x, y, r, start, end, !panel.cw ? true : false);
    ctx.stroke();
    const hx = x + r * Math.cos(end);
    const hy = y + r * Math.sin(end);
    const dir = panel.cw ? end + Math.PI / 2 : end - Math.PI / 2;
    const a = r * 0.55;
    ctx.beginPath();
    ctx.moveTo(hx + Math.cos(dir) * a * 0.6, hy + Math.sin(dir) * a * 0.6);
    ctx.lineTo(hx + Math.cos(dir + 2.4) * a * 0.6, hy + Math.sin(dir + 2.4) * a * 0.6);
    ctx.lineTo(hx + Math.cos(dir - 2.4) * a * 0.6, hy + Math.sin(dir - 2.4) * a * 0.6);
    ctx.fill();
    ctx.restore();
    const glyph = { color, glow: 0.4, outline: theme.calloutOutline, alpha: 0.8 };
    this.text('←', x - t - r * 0.2, y + L.unit * 0.4, { ...glyph, align: 'right' });
    this.text('→', x + t + r * 0.2, y + L.unit * 0.4, { ...glyph, align: 'left' });
    if (panel.showDrop) this.text('↓', x, y + t + L.unit * 1.2, { ...glyph, align: 'center' });
  }

  /** The on-screen Hold button, in CSS px like pointer events: Lightblocks' strip right of the well, four cells tall
   *  from the well's top (from under the Next preview in landscape) out to the screen edge. */
  holdButtonRect() {
    const L = this.layout;
    if (!L) return null;
    const right = L.wellX + COLS * L.C;
    const gap = Math.min(L.C * 0.5, Math.max(0, (L.W - right - this.#fontPx(1)) / 3));
    const x = right + gap;
    const top = L.portrait ? L.wellY : L.wellY + L.C * 5;
    const w = Math.max(1, Math.min(L.C * 3, L.W - x - gap));
    const k = L.dpr;
    return { x: x / k, y: top / k, w: w / k, h: (L.C * 4) / k };
  }

  /** A big sideways HOLD reading down the strip, with no frame around it. */
  drawHoldButton() {
    const r = this.holdButtonRect();
    if (!r) return;
    const { ctx, theme, layout: L } = this;
    const k = L.dpr;
    const str = TEXT.hud.hold;
    let size = this.fitSize(str, r.h * k * 0.85, 2);
    while (size > 1 && this.#fontPx(size) > r.w * k * 0.85) size -= 11 / L.unit;
    ctx.save();
    ctx.translate(Math.round((r.x + r.w / 2) * k), Math.round((r.y + r.h / 2) * k));
    ctx.rotate(Math.PI / 2);
    this.text(str, 0, this.#fontPx(size) * 0.35, { size, align: 'center', color: theme.text, glow: 0.4, alpha: 0.85, staryllic: HUD_STARYLLIC });
    ctx.restore();
  }

  /** A pause button in the top strip, shown once someone plays by touch. */
  drawPauseButton() {
    const { ctx, theme, layout: L } = this;
    const s = Math.max(14 * L.dpr, L.unit * 0.9);
    const x = L.W - s * 2.2;
    const y = Math.min(L.H * 0.1 - s * 1.2, s * 1.1);
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = theme.text;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(s * 0.35), Math.round(s));
    ctx.fillRect(Math.round(x + s * 0.65), Math.round(y), Math.round(s * 0.35), Math.round(s));
    ctx.globalAlpha = 1;
  }

  /** Scanlines and vignette in one cached layer, for hosts that can't overlay CSS (a cockpit texture).
   *  Pages should use the CSS overlay instead; it costs the canvas nothing. */
  drawHologramPass() {
    const { ctx } = this;
    const { width: W, height: H } = this.canvas;
    this.overlay ??= this.#bitmap(W, H, (o) => {
      const step = Math.max(3, Math.round(this.layout.C / 9));
      o.fillStyle = 'rgba(0, 0, 0, 0.28)';
      for (let y = 0; y < H; y += step) o.fillRect(0, y, W, Math.max(1, Math.floor(step / 3)));
      const v = o.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75);
      v.addColorStop(0, 'rgba(0, 0, 0, 0)');
      v.addColorStop(1, 'rgba(0, 0, 0, 0.55)');
      o.fillStyle = v;
      o.fillRect(0, 0, W, H);
    });
    ctx.globalAlpha = 1;
    ctx.drawImage(this.overlay, 0, 0);
  }
}

/** Smallest text size, in CSS px, by the screen's short side: phones and tablets are read from farther away. */
export function textTargetCss(shortSideCss) {
  if (shortSideCss < 600) return 16;
  if (shortSideCss < 1024) return 18;
  return 14;
}

/** The frame bitmap's nonempty parts as [sx, sy, sw, sh] bands (left side, right side, bottom between them). Each
 *  reaches four blur sigmas past its stroke, beyond where browsers cut the blur off, so what's skipped is empty.
 *  Computed rather than read back, since a readback pushes the shared scratch canvas off the GPU. */
function frameBands(m, w, h, lw, blur) {
  const W = w + 2 * m;
  const H = h + 2 * m;
  const reach = Math.ceil(lw / 2 + 4 * (blur / 2)) + 2;
  const left = Math.min(W, Math.ceil(m - lw + reach));
  const right = Math.max(left, Math.floor(m + w + lw - reach));
  const bottom = Math.max(0, Math.floor(m + h + lw - reach));
  if (right <= left) return [[0, 0, W, H]];
  return [[0, 0, left, H], [right, 0, W - right, H], [left, bottom, right - left, H - bottom]];
}

/** Lays the screen out in board cells. Landscape puts stats and Hold left of the well and Next right of it;
 *  portrait stacks a stats row and the Hold/Next row above the well, like Lightblocks. */
export function computeLayout(W, H, dpr = 1) {
  const portrait = W / H < 0.95;
  const gridUnit = (cssPx) => Math.max(11, Math.ceil((cssPx * dpr) / 11) * 11);
  const minUnit = gridUnit(textTargetCss(Math.min(W, H) / dpr));
  const header = (u) => u * 5.2;
  let C;
  let unit;
  if (portrait) {
    // Header rows: stats label and value, then the preview labels, then a 2.4-cell preview row. Each side of the well
    // keeps a line and a half of text clear, so the sideways touch HOLD always fits on narrow phones
    const fit = (u) => Math.max(8, Math.floor(Math.min((H * 0.95 - header(u)) / 22.4, (W * 0.98 - u * 3) / 10)));
    C = fit(minUnit);
    unit = Math.max(minUnit, Math.floor((C * 0.5) / 11) * 11);
    C = fit(unit);
  } else {
    C = Math.max(8, Math.floor(Math.min((H * 0.92) / 21, (W * 0.96) / 22)));
    unit = Math.max(minUnit, Math.floor((C * 0.5) / 11) * 11);
  }
  const wellW = COLS * C;
  const wellH = VISIBLE_ROWS * C;
  const wellX = Math.round((W - wellW) / 2);
  const L = { W, H, C, unit, dpr, portrait, wellX };
  if (portrait) {
    const top = Math.round((H - header(unit) - C * 22.4) / 2);
    L.statsLabelY = top + unit * 1.1;
    L.statsValueY = L.statsLabelY + unit * 1.5;
    const previewLabelY = L.statsValueY + unit * 2.0;
    const previewTop = previewLabelY + unit * 0.6;
    L.wellY = Math.round(previewTop + C * 2.4);
    // A preview's upper row lines up with previewTop
    const originY = VISIBLE_ROWS - 2 + (L.wellY - previewTop) / C;
    // Hold sits 4.5 cells left of Next on the preview row, as Lightblocks lays out portrait
    L.hold = { x: 1.5, y: originY };
    L.next = { x: 6, y: originY };
    L.holdLabel = { x: wellX + 1.5 * C, y: previewLabelY };
    L.nextLabel = { x: wellX + 6 * C, y: previewLabelY };
  } else {
    L.wellY = Math.round((H - wellH) / 2 + C * 0.3);
    const screenY = (cellY) => L.wellY + (VISIBLE_ROWS - 1 - cellY) * C;
    L.next = { x: COLS + 1.5, y: 16 };
    L.hold = { x: -5.5, y: 16 };
    L.nextLabel = { x: wellX + L.next.x * C, y: screenY(L.next.y + 2.6) };
    L.holdLabel = { x: wellX + L.hold.x * C, y: screenY(L.hold.y + 2.6) };
    L.statsX = wellX - C * 5.5;
    L.statsWidth = C * 5.2;
    L.statsY = L.wellY + C * 7.5;
  }
  const wellY = L.wellY;
  // Screen edges in board cells, for the next-piece fly-in
  L.edgesInCells = {
    left: -wellX / C,
    right: (W - wellX) / C,
    top: VISIBLE_ROWS - 1 + wellY / C,
    bottom: VISIBLE_ROWS - 1 - (H - wellY) / C,
  };
  return L;
}
