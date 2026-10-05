// CUCKBLOX engine: the rules of Falling Lightblocks by Benjamin Schulte (Apache 2.0, see LICENSE-lightblocks),
// ported to a pure, deterministic module. Floats go through Math.fround so ticks match Lightblocks' Java floats.

const f = Math.fround;

export const COLS = 10;
export const ROWS = 22;
export const VISIBLE_ROWS = 20;
export const EMPTY = -1;
export const TICK_HZ = 120;
export const DT = f(1 / 120);
export const SAVE_VERSION = 1;
export const PIECE = Object.freeze({ I: 0, T: 1, L: 2, J: 3, Z: 4, S: 5, O: 6 });
export const PIECE_NAMES = 'ITLJZSO';

const SOFT_DROP_SPEED = f(30);
const FACTOR_SOFT = f(1);
const FACTOR_HARD = f(100);
const MAX_DROP_SCORE = f(2);
const REPEAT_START_OFFSET = f(0.3);
const REPEAT_INTERVAL = f(0.05);
const REMOVE_DELAY = f(0.15);
const PAUSE_FADE = f(0.2);
const ARE_FACTOR = f(0.015);
const LOCK_MOVES = 15;
const SCORE_CAP = 999999;
const CRITICAL_PERCENT = 70;

// Modern lock delay is 333 ms; Lightblocks used 500 (ModernFreezeModel.LOCK_DELAY)
export const MODERN_LOCK_DELAY_MS = 333;

export const MODES = Object.freeze({
  marathon: { id: 'marathon', srs: false, lockDelayMs: 0, hold: true, ghost: true, retro: false, practice: false },
  marathonModern: { id: 'marathonModern', srs: true, lockDelayMs: MODERN_LOCK_DELAY_MS, hold: true, ghost: true, retro: false, practice: false },
  retro: { id: 'retro', srs: false, lockDelayMs: 0, hold: false, ghost: false, retro: true, practice: false },
  practiceClassic: { id: 'practiceClassic', srs: false, lockDelayMs: 0, hold: true, ghost: true, retro: false, practice: true },
  practiceModern: { id: 'practiceModern', srs: true, lockDelayMs: MODERN_LOCK_DELAY_MS, hold: true, ghost: true, retro: false, practice: true },
});

const SPEEDS = [1.25, 1.4, 1.58, 1.8, 2.15, 2.6, 3.33, 4.6, 7.5, 10].map(f);

/** Gravity in cells per second for a level. */
export function gravityFor(level) {
  if (level < 10) return SPEEDS[level];
  if (level <= 12) return f(12);
  if (level <= 15) return f(15);
  if (level <= 18) return f(20);
  return level >= 29 ? f(60) : SOFT_DROP_SPEED;
}

/** Highest Practice start level unlocked by the best Marathon or Retro line count. */
export function practiceMaxStartLevel(bestMarathonLines) {
  return Math.min(19, Math.max(14, Math.trunc(bestMarathonLines / 10) + 1));
}

// Block offsets [x, y] inside each piece's 4×4 box, y-up, indexed [piece][rotation]
const NRS = [
  [[[0, 1], [1, 1], [2, 1], [3, 1]], [[2, 0], [2, 1], [2, 2], [2, 3]]],
  [[[1, 0], [0, 1], [1, 1], [2, 1]], [[1, 0], [0, 1], [1, 1], [1, 2]], [[0, 1], [1, 1], [2, 1], [1, 2]], [[1, 0], [1, 1], [2, 1], [1, 2]]],
  [[[0, 0], [0, 1], [1, 1], [2, 1]], [[1, 0], [1, 1], [0, 2], [1, 2]], [[0, 1], [1, 1], [2, 1], [2, 2]], [[1, 0], [2, 0], [1, 1], [1, 2]]],
  [[[2, 0], [0, 1], [1, 1], [2, 1]], [[0, 0], [1, 0], [1, 1], [1, 2]], [[0, 1], [1, 1], [2, 1], [0, 2]], [[1, 0], [1, 1], [1, 2], [2, 2]]],
  [[[1, 0], [2, 0], [0, 1], [1, 1]], [[1, 0], [1, 1], [2, 1], [2, 2]]],
  [[[0, 0], [1, 0], [1, 1], [2, 1]], [[2, 0], [1, 1], [2, 1], [1, 2]]],
  [[[1, 0], [2, 0], [1, 1], [2, 1]]],
];
const SRS = [
  [[[0, 2], [1, 2], [2, 2], [3, 2]], [[2, 0], [2, 1], [2, 2], [2, 3]], [[0, 1], [1, 1], [2, 1], [3, 1]], [[1, 0], [1, 1], [1, 2], [1, 3]]],
  [[[0, 1], [1, 1], [2, 1], [1, 2]], [[1, 0], [1, 1], [2, 1], [1, 2]], [[1, 0], [0, 1], [1, 1], [2, 1]], [[1, 0], [0, 1], [1, 1], [1, 2]]],
  [[[0, 1], [1, 1], [2, 1], [2, 2]], [[1, 0], [2, 0], [1, 1], [1, 2]], [[0, 0], [0, 1], [1, 1], [2, 1]], [[1, 0], [1, 1], [0, 2], [1, 2]]],
  [[[0, 1], [1, 1], [2, 1], [0, 2]], [[1, 0], [1, 1], [1, 2], [2, 2]], [[2, 0], [0, 1], [1, 1], [2, 1]], [[0, 0], [1, 0], [1, 1], [1, 2]]],
  [[[1, 1], [2, 1], [0, 2], [1, 2]], [[1, 0], [1, 1], [2, 1], [2, 2]], [[1, 0], [2, 0], [0, 1], [1, 1]], [[0, 0], [0, 1], [1, 1], [1, 2]]],
  [[[0, 1], [1, 1], [1, 2], [2, 2]], [[2, 0], [1, 1], [2, 1], [1, 2]], [[0, 0], [1, 0], [1, 1], [2, 1]], [[1, 0], [0, 1], [1, 1], [0, 2]]],
  [[[1, 1], [2, 1], [1, 2], [2, 2]], [[1, 1], [2, 1], [1, 2], [2, 2]], [[1, 1], [2, 1], [1, 2], [2, 2]], [[1, 1], [2, 1], [1, 2], [2, 2]]],
];

export function pieceTemplates(type, srs) {
  return (srs ? SRS : NRS)[type];
}

/** SRS kick test i (0–3) for a rotation out of `rot`, as an [dx, dy] offset (Tetromino.getWallkickPosition). */
export function kickOffset(type, rot, cw, i) {
  let dx = 0;
  let dy = 0;
  if (type === PIECE.I) {
    const a = (rot === 0 && cw) || (rot === 3 && !cw);
    const b = (rot === 1 && !cw) || (rot === 2 && cw);
    const c = (rot === 1 && cw) || (rot === 0 && !cw);
    const d = (rot === 3 && cw) || (rot === 2 && !cw);
    const table = [
      [[-2, 0], [2, 0], [-1, 0], [1, 0]],
      [[1, 0], [-1, 0], [2, 0], [-2, 0]],
      [[2, -1], [-2, 1], [-1, 2], [1, -2]],
      [[1, 2], [-1, -2], [2, -1], [-2, 1]],
    ][i];
    [a, b, c, d].forEach((hit, k) => {
      if (hit) { dx += table[k][0]; dy += table[k][1]; }
    });
  } else {
    const a = (rot === 0 && cw) || (rot === 2 && !cw);
    const b = rot === 1;
    const c = (rot === 2 && cw) || (rot === 0 && !cw);
    const d = rot === 3;
    const table = [
      [[-1, 0], [1, 0], [1, 0], [-1, 0]],
      [[-1, 1], [1, -1], [1, 1], [-1, -1]],
      [[0, -2], [0, 2], [0, -2], [0, 2]],
      [[-1, -2], [1, 2], [1, -2], [-1, 2]],
    ][i];
    [a, b, c, d].forEach((hit, k) => {
      if (hit) { dx += table[k][0]; dy += table[k][1]; }
    });
  }
  return [dx, dy];
}

/** Mulberry32 with readable state, so a saved run resumes the exact same piece stream. */
export class Mulberry32 {
  constructor(seed) {
    this.state = seed | 0;
  }

  next() {
    const s = (this.state = (this.state + 0x6d2b79f5) | 0);
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Inclusive integer range, like libGDX MathUtils.random(min, max). */
  int(min, max) {
    return min + Math.floor(this.next() * (max - min + 1));
  }
}

class BagDrawer {
  constructor(rng, saved) {
    this.rng = rng;
    this.queue = saved ? [...saved.queue] : [];
  }

  next() {
    if (this.queue.length < 1) this.refill();
    return this.queue.shift();
  }

  // Full Fisher–Yates; Lightblocks stopped two short (i < size - 2), skewing the bag's last two pieces
  refill() {
    const q = this.queue;
    const start = q.length;
    for (let i = 0; i < 7; i++) q.push(i);
    for (let i = start; i < q.length - 1; i++) {
      const j = this.rng.int(i, q.length - 1);
      [q[i], q[j]] = [q[j], q[i]];
    }
  }

  save() {
    return { kind: 'bag', queue: [...this.queue] };
  }
}

// NES: roll 0–7; a 7 or a repeat of the last piece rerolls once over 0–6
class NesDrawer {
  constructor(rng, saved) {
    this.rng = rng;
    this.last = saved ? saved.last : -1;
  }

  next() {
    let n = this.rng.int(0, 7);
    if (n === 7 || n === this.last) n = this.rng.int(0, 6);
    this.last = n;
    return n;
  }

  save() {
    return { kind: 'nes', last: this.last };
  }
}

class SequenceDrawer {
  constructor(seq, saved) {
    this.seq = [...seq];
    this.i = saved ? saved.i : 0;
  }

  next() {
    return this.seq[this.i++ % this.seq.length];
  }

  save() {
    return { kind: 'sequence', seq: [...this.seq], i: this.i };
  }
}

function newPiece(type) {
  return { type, x: COLS / 2 - 2, y: VISIBLE_ROWS - 2, rot: 0, lastMove: 0, lowestY: VISIBLE_ROWS - 2, lockCount: 0 };
}

const HELD_ACTIONS = new Set(['left', 'right', 'softDrop', 'hardDrop']);

export class Game {
  /** opts: mode, startLevel, seed, sequence (a fixed piece order), best (this board's bests; maxCombo is
   *  all-time across modes, as in Lightblocks), onEvent, and snapshot (a serialize() result to resume). */
  constructor(opts = {}) {
    this.listeners = opts.onEvent ? [opts.onEvent] : [];
    if (opts.snapshot) {
      this.#restore(opts.snapshot);
      return;
    }
    const mode = MODES[opts.mode ?? 'marathon'];
    if (!mode) throw new Error(`Unknown mode: ${opts.mode}`);
    this.mode = mode;
    this.startLevel = Math.max(0, opts.startLevel | 0);
    this.seed = (opts.seed ?? Date.now()) | 0;
    this.rng = new Mulberry32(this.seed);
    this.drawer = opts.sequence ? new SequenceDrawer(opts.sequence) : mode.retro ? new NesDrawer(this.rng) : new BagDrawer(this.rng);
    this.board = new Int8Array(COLS * ROWS).fill(EMPTY);

    this.score = 0;
    this.lines = 0;
    this.blocks = 0;
    this.dropScore = f(0);
    this.combo = -1;
    this.lastClearSpecial = false;
    this.seconds = 0;
    this.secondFraction = f(0);

    this.distanceRemainder = f(0);
    this.freeze = f(0);
    this.inputFreeze = f(0);
    this.lastMovementMs = 0;
    this.hold = -1;
    this.noDropSinceHold = false;
    this.gameOver = false;
    this.paused = false;
    this.critical = false;
    this.isBest = false;
    const b = opts.best ?? {};
    this.best = { score: b.score ?? 0, blocks: b.blocks ?? 0, lines: b.lines ?? 0, maxCombo: b.maxCombo ?? 0 };
    this.tick = 0;
    this.#resetInputs();
    this.currentSpeed = gravityFor(this.level);

    this.active = null;
    this.next = newPiece(this.drawer.next());
    this.#activateNext();
  }

  on(fn) {
    this.listeners.push(fn);
    return () => { this.listeners = this.listeners.filter((l) => l !== fn); };
  }

  get level() {
    return this.mode.practice ? this.startLevel : Math.max(this.startLevel, Math.trunc(this.lines / 10));
  }

  get timeMs() {
    return this.seconds * 1000 + Math.trunc(f(this.secondFraction * 1000));
  }

  get canHold() {
    return this.mode.hold && !this.noDropSinceHold && !this.gameOver;
  }

  get fill() {
    let fill = COLS * VISIBLE_ROWS;
    for (let x = 0; x < COLS; x++) {
      for (let y = VISIBLE_ROWS - 1; y >= 0 && this.board[y * COLS + x] === EMPTY; y--) fill--;
    }
    return fill;
  }

  cell(x, y) {
    return this.board[y * COLS + x];
  }

  /** -1 off the board, 1 occupied, 0 free (Gameboard.isValidCoordinate). */
  cellState(x, y) {
    if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return -1;
    return this.board[y * COLS + x] === EMPTY ? 0 : 1;
  }

  blocksOf(p, x = p.x, y = p.y, rot = p.rot) {
    return this.#templates(p.type)[this.#norm(p.type, rot)].map(([bx, by]) => [bx + x, by + y]);
  }

  activeBlocks() {
    return this.active ? this.blocksOf(this.active) : [];
  }

  ghostDistance() {
    const p = this.active;
    if (!p) return 0;
    let i = 1;
    for (; i <= ROWS; i++) if (!this.#valid(p, p.x, p.y - i, p.rot)) break;
    return i - 1;
  }

  /** Input. Actions: left, right, softDrop, hardDrop, rotateCW, rotateCCW, hold. */
  press(action) {
    if (this.gameOver) return;
    switch (action) {
      case 'left':
      case 'right':
        if (action === 'left') this.movingLeft = 2;
        else this.movingRight = 2;
        this.movingCountdown = REPEAT_START_OFFSET;
        break;
      case 'softDrop': this.#setSoftDrop(FACTOR_SOFT); break;
      case 'hardDrop': this.#setSoftDrop(FACTOR_HARD); break;
      case 'rotateCW': this.inputRotate = 1; break;
      case 'rotateCCW': this.inputRotate = -1; break;
      case 'hold': this.#holdActive(); break;
      default: throw new Error(`Unknown action: ${action}`);
    }
    if (HELD_ACTIONS.has(action)) {
      this.pressTick[action] = this.tick;
      this.deferredRelease.delete(action);
    }
  }

  /** A release landing before any tick ran since its press waits one tick, so every press gets a turn. */
  release(action) {
    if (!HELD_ACTIONS.has(action)) return;
    if (this.pressTick[action] === this.tick) this.deferredRelease.add(action);
    else this.#applyRelease(action);
  }

  /** One-shot sideways step for touch flicks (inputDoOneHorizontalMove). */
  moveOnce(isLeft) {
    this.movingLeft = isLeft ? 3 : 0;
    this.movingRight = isLeft ? 0 : 3;
  }

  /** Touch grace freeze; set, not added, so it can be cancelled with 0. */
  setInputFreeze(seconds) {
    this.inputFreeze = f(seconds);
  }

  releaseAll() {
    this.#resetInputs();
  }

  pause() {
    this.paused = true;
  }

  /** Unpausing freezes play while the board fades back in, and drops any rotate pressed while paused. */
  resume({ immediate = false } = {}) {
    if (!this.paused) return;
    this.paused = false;
    if (!immediate) this.freeze = f(Math.max(PAUSE_FADE, this.freeze));
    this.inputRotate = 0;
  }

  /** Advance one fixed 1/120 s tick. */
  step() {
    if (this.paused) return;
    this.tick++;
    this.#update(DT);
    if (this.deferredRelease.size) {
      for (const a of this.deferredRelease) this.#applyRelease(a);
      this.deferredRelease.clear();
    }
  }

  serialize() {
    return {
      v: SAVE_VERSION,
      mode: this.mode.id,
      startLevel: this.startLevel,
      seed: this.seed,
      rng: this.rng.state,
      drawer: this.drawer.save(),
      board: Array.from(this.board),
      active: this.active && { ...this.active },
      next: this.next.type,
      hold: this.hold,
      noDropSinceHold: this.noDropSinceHold,
      score: this.score,
      lines: this.lines,
      blocks: this.blocks,
      dropScore: this.dropScore,
      combo: this.combo,
      lastClearSpecial: this.lastClearSpecial,
      seconds: this.seconds,
      secondFraction: this.secondFraction,
      distanceRemainder: this.distanceRemainder,
      freeze: this.freeze,
      inputFreeze: this.inputFreeze,
      lastMovementMs: this.lastMovementMs,
      gameOver: this.gameOver,
      critical: this.critical,
      isBest: this.isBest,
      best: { ...this.best },
      tick: this.tick,
    };
  }

  #restore(s) {
    if (s.v !== SAVE_VERSION) throw new Error(`Unsupported save version: ${s.v}`);
    this.mode = MODES[s.mode];
    if (!this.mode) throw new Error(`Unknown mode: ${s.mode}`);
    this.startLevel = s.startLevel;
    this.seed = s.seed;
    this.rng = new Mulberry32(0);
    this.rng.state = s.rng;
    const d = s.drawer;
    this.drawer = d.kind === 'sequence' ? new SequenceDrawer(d.seq, d) : d.kind === 'nes' ? new NesDrawer(this.rng, d) : new BagDrawer(this.rng, d);
    this.board = Int8Array.from(s.board);
    this.active = s.active && { ...s.active };
    this.next = newPiece(s.next);
    for (const k of ['hold', 'noDropSinceHold', 'score', 'lines', 'blocks', 'combo', 'lastClearSpecial', 'seconds',
      'lastMovementMs', 'gameOver', 'critical', 'isBest', 'tick']) this[k] = s[k];
    for (const k of ['dropScore', 'secondFraction', 'distanceRemainder', 'freeze', 'inputFreeze']) this[k] = f(s[k]);
    this.best = { ...s.best };
    this.currentSpeed = gravityFor(this.level);
    this.#resetInputs();
    this.paused = true;
  }

  #emit(type, data) {
    const ev = { type, tick: this.tick, ...data };
    for (const l of this.listeners) l(ev);
  }

  #callout(kind, value) {
    this.#emit('callout', { kind, value });
  }

  #resetInputs() {
    this.softDropFactor = f(0);
    this.inputRotate = 0;
    this.movingLeft = 0;
    this.movingRight = 0;
    this.someMovementDone = false;
    this.movingCountdown = f(0);
    this.pressTick = {};
    this.deferredRelease = new Set();
  }

  #applyRelease(action) {
    switch (action) {
      case 'left': this.movingLeft = 0; this.movingCountdown = f(0); break;
      case 'right': this.movingRight = 0; this.movingCountdown = f(0); break;
      case 'softDrop':
      case 'hardDrop': this.#setSoftDrop(f(0)); break;
    }
  }

  // Retro caps every drop request at soft drop, so the hard drop key soft-drops instead (RetroMarathonModel)
  #setSoftDrop(factor) {
    this.softDropFactor = this.mode.retro ? f(Math.min(factor, FACTOR_SOFT)) : factor;
  }

  #templates(type) {
    return pieceTemplates(type, this.mode.srs);
  }

  #norm(type, rot) {
    const n = this.#templates(type).length;
    if (rot < 0) rot += n;
    return rot % n;
  }

  #valid(p, x, y, rot) {
    for (const [bx, by] of this.#templates(p.type)[this.#norm(p.type, rot)]) {
      if (this.cellState(bx + x, by + y) !== 0) return false;
    }
    return true;
  }

  #possibleMove(horizontal, distance) {
    const p = this.active;
    const sign = distance < 0 ? -1 : 1;
    for (let i = 1; i <= Math.abs(distance); i++) {
      const x = p.x + (horizontal ? i * sign : 0);
      const y = p.y + (horizontal ? 0 : i * sign);
      if (!this.#valid(p, x, y, p.rot)) return (i - 1) * sign;
    }
    return distance;
  }

  #incLockDelayCount(count) {
    const p = this.active;
    if (p.y < p.lowestY) {
      p.lockCount = 0;
      p.lowestY = p.y;
    }
    p.lockCount += count;
  }

  #incTime(delta) {
    this.secondFraction = f(this.secondFraction + delta);
    while (this.secondFraction > 1) {
      this.seconds++;
      this.secondFraction = f(this.secondFraction - 1);
    }
  }

  #update(delta) {
    if (this.gameOver) return;
    if (this.freeze > 0) this.freeze = f(this.freeze - delta);
    if (this.inputFreeze > 0) this.inputFreeze = f(this.inputFreeze - delta);
    if (this.freeze > 0 || this.inputFreeze > 0) return;

    if (this.inputRotate !== 0) {
      this.#rotate(this.inputRotate > 0);
      this.inputRotate = 0;
    }

    if (this.movingLeft >= 3 || this.movingRight >= 3) {
      this.#moveHorizontal(this.movingLeft > 0 ? -1 : 1);
      this.movingLeft = 0;
      this.movingRight = 0;
    }

    // Left and right held together move nothing
    if ((this.movingLeft > 0 && this.movingRight === 0) || (this.movingLeft === 0 && this.movingRight > 0)) {
      if (this.movingLeft >= 2 || this.movingRight >= 2) {
        this.movingCountdown = REPEAT_START_OFFSET;
        this.someMovementDone = false;
        if (this.movingLeft > 0) this.movingLeft = 1;
        else this.movingRight = 1;
      } else {
        this.movingCountdown = f(this.movingCountdown - delta);
      }
      if (this.movingCountdown <= 0 || !this.someMovementDone) {
        if (this.#moveHorizontal(this.movingLeft > 0 ? -1 : 1)) {
          this.movingCountdown = f(this.movingCountdown + REPEAT_INTERVAL);
          this.someMovementDone = true;
        } else {
          // A blocked slide stays charged and goes the instant the path opens
          this.movingCountdown = f(0);
        }
      }
    }

    this.#incTime(delta);
    const speed = Math.max(f(SOFT_DROP_SPEED * this.softDropFactor), this.currentSpeed);
    this.distanceRemainder = f(this.distanceRemainder + f(delta * speed));
    if (this.distanceRemainder >= 1) this.#moveDown(Math.trunc(this.distanceRemainder));
  }

  #moveDown(distance) {
    const p = this.active;
    const maxDistance = -this.#possibleMove(false, -distance);
    if (maxDistance > 0) {
      const from = this.blocksOf(p);
      p.y -= maxDistance;
      p.lastMove = 0;
      this.#emit('move', { dx: 0, dy: -maxDistance, from, drop: this.softDropFactor });
    }
    if (f(SOFT_DROP_SPEED * this.softDropFactor) > this.currentSpeed) {
      this.dropScore = f(this.dropScore + f(maxDistance * Math.min(this.softDropFactor, MAX_DROP_SCORE)));
    }
    if (maxDistance < distance) {
      const lockDelay = this.mode.lockDelayMs;
      if (lockDelay <= 0 || this.softDropFactor >= FACTOR_HARD || p.lockCount >= LOCK_MOVES
        || this.timeMs - this.lastMovementMs >= lockDelay) {
        this.#dropActive();
      } else {
        this.distanceRemainder = f(0);
      }
    } else {
      this.distanceRemainder = f(this.distanceRemainder - distance);
      this.lastMovementMs = this.timeMs;
      this.#incLockDelayCount(0);
    }
  }

  #moveHorizontal(distance) {
    if (distance === 0) return false;
    const p = this.active;
    const maxDistance = this.#possibleMove(true, distance);
    if (maxDistance !== 0) {
      const from = this.blocksOf(p);
      p.x += maxDistance;
      p.lastMove = 0;
      this.lastMovementMs = this.timeMs;
      this.#incLockDelayCount(Math.abs(maxDistance));
      this.#emit('move', { dx: maxDistance, dy: 0, from });
    }
    if (maxDistance !== distance) {
      const sign = distance > 0 ? 1 : -1;
      for (const [x, y] of this.blocksOf(p)) {
        if (this.cellState(x + sign, y) === 1) this.#emit('conflict', { x: x + sign, y });
      }
    }
    return maxDistance !== 0;
  }

  #rotate(cw) {
    const p = this.active;
    const newRot = p.rot + (cw ? 1 : -1);
    let ok = this.#valid(p, p.x, p.y, newRot);
    let kick = null;
    if (!ok && this.mode.srs && p.type !== PIECE.O) {
      const cur = this.#norm(p.type, p.rot);
      for (let i = 0; i <= 3 && !ok; i++) {
        const [dx, dy] = kickOffset(p.type, cur, cw, i);
        kick = [p.x + dx, p.y + dy];
        ok = this.#valid(p, kick[0], kick[1], newRot);
      }
    }
    if (!ok) return;
    const from = this.blocksOf(p);
    if (kick) [p.x, p.y] = kick;
    const r = this.#norm(p.type, newRot);
    // An O's rotation "succeeds" without changing anything; it still counts as a move for lock delay
    if (p.rot !== r) {
      p.rot = r;
      p.lastMove = 1;
    }
    this.lastMovementMs = this.timeMs;
    this.#incLockDelayCount(1);
    this.#emit('rotate', { cw, from, kicked: kick !== null });
  }

  #dropActive() {
    const p = this.active;
    const blocks = this.blocksOf(p);
    for (const [x, y] of blocks) this.board[y * COLS + x] = p.type;
    this.#emit('lock', { piece: p.type, blocks });
    this.noDropSinceHold = false;

    // T-spin: last action a rotation and 3+ diagonal neighbors of the center blocked (walls, floor, ceiling count)
    let tSpin = p.type === PIECE.T && p.lastMove === 1;
    if (tSpin) {
      const cx = p.x + 1;
      const cy = p.y + 1;
      const corners = [[1, 1], [-1, -1], [-1, 1], [1, -1]];
      tSpin = corners.filter(([dx, dy]) => this.cellState(cx + dx, cy + dy) !== 0).length >= 3;
    }

    const levelBefore = this.level;
    const { rows, special } = this.#removeFullLines(tSpin);
    const removed = rows.length;

    const comboHeight = this.#setCombo(removed > 0);
    this.#emit('combo', { height: comboHeight });
    const newMaxCombo = comboHeight > this.best.maxCombo;
    if (newMaxCombo) this.best.maxCombo = comboHeight;
    if ((newMaxCombo && comboHeight >= 3) || comboHeight >= 5) this.#callout('combo', comboHeight);

    const gained = this.#flushScore();
    if (tSpin && removed < 2) this.#callout('tSpin');

    const critical = Math.trunc((this.fill * 100) / (COLS * VISIBLE_ROWS)) >= CRITICAL_PERCENT;
    if (critical !== this.critical) {
      this.critical = critical;
      this.#emit('critical', { on: critical });
    }

    if (removed > 0) {
      if (this.level !== levelBefore) this.#callout('level', this.level);
      else if (Math.trunc(this.lines / 10) > Math.trunc((this.lines - removed) / 10)) {
        this.#callout('tenLines', Math.trunc(this.lines / 10) * 10);
      }
    }

    if (Math.trunc(this.blocks / 100) > Math.trunc((this.blocks - 1) / 100)) this.#callout('hundredBlocks', this.blocks);

    if (this.#updateBest()) {
      if (!this.isBest) this.#callout('newBest');
      this.isBest = true;
    }
    this.#emit('score', { gained });

    if (removed > 0) {
      this.freeze = f(Math.max(REMOVE_DELAY, this.freeze));
      this.#emit('clear', { rows, special });
    }

    // Entry delay: the higher the piece locked, the longer the pause before the next one
    this.freeze = f(f(Math.max(0, this.freeze)) + f(ARE_FACTOR * f(10 + f(p.y / 2))));
    this.#activateNext();
  }

  #removeFullLines(tSpin) {
    const rows = [];
    for (let y = 0; y < ROWS; y++) {
      let full = true;
      for (let x = 0; x < COLS && full; x++) full = this.board[y * COLS + x] !== EMPTY;
      if (full) rows.push(y);
    }
    const n = rows.length;
    // Decided before Retro's scoring override, so a Retro T-spin double still gets the special clear animation
    const special = n === 4 || (n >= 2 && tSpin);
    if (n > 0) {
      for (let i = n - 1; i >= 0; i--) {
        this.board.copyWithin(rows[i] * COLS, (rows[i] + 1) * COLS);
        this.board.fill(EMPTY, (ROWS - 1) * COLS);
      }
      if (this.#incClearedLines(n, special, tSpin)) this.#callout('double');
      this.currentSpeed = gravityFor(this.level);
    } else if (tSpin && !this.mode.retro) {
      this.dropScore = f(this.dropScore + this.#scoreFactor() * 150);
    }
    return { rows, special };
  }

  #scoreFactor() {
    return this.mode.practice ? 1 : this.level + 1;
  }

  #incClearedLines(n, special, tSpin) {
    if (this.mode.retro) {
      special = false;
      tSpin = false;
    }
    const backToBack = special && this.lastClearSpecial;
    const base = [0, tSpin ? 300 : 40, tSpin ? 1200 : 100, tSpin ? 1200 : 300, 1200][n] ?? 0;
    let points = f(this.#scoreFactor() * base);
    if (backToBack) points = f(points * f(1.5));
    this.dropScore = f(this.dropScore + points);
    this.lastClearSpecial = special;
    this.lines += n;
    return backToBack;
  }

  #setCombo(cleared) {
    if (cleared && !this.mode.retro) {
      this.combo++;
      this.dropScore = f(this.dropScore + this.#scoreFactor() * 50 * this.combo);
    } else {
      this.combo = -1;
    }
    return this.combo;
  }

  #flushScore() {
    const gained = Math.trunc(this.dropScore);
    this.score += gained;
    if (!this.mode.practice) this.score = Math.min(this.score, SCORE_CAP);
    this.dropScore = f(0);
    return gained;
  }

  // BestScore.setBestScores: ties count as a new best, and only nontrivial runs get the callout
  #updateBest() {
    const b = this.best;
    b.lines = Math.max(b.lines, this.lines);
    const blocksUp = this.blocks >= b.blocks;
    b.blocks = Math.max(b.blocks, this.blocks);
    const scoreUp = this.score >= b.score;
    b.score = Math.max(b.score, this.score);
    return this.mode.practice ? blocksUp && this.blocks > 100 : scoreUp && this.score > 10000;
  }

  #activateNext() {
    this.active = this.next;
    this.next = newPiece(this.drawer.next());
    this.#emit('spawn', { piece: this.active.type, next: this.next.type, blocks: this.blocksOf(this.active) });
    this.#resetForNewPiece();
    if (!this.gameOver) this.blocks++;
  }

  #resetForNewPiece() {
    this.softDropFactor = f(0);
    this.distanceRemainder = f(0);
    if (!this.#valid(this.active, this.active.x, this.active.y, this.active.rot)) this.#setGameOver();
  }

  #setGameOver() {
    this.gameOver = true;
    this.#callout('gameOver');
    this.#emit('gameOver', {});
  }

  // Lightblocks' hold also wiped combo, back-to-back, and unbanked drop points; CUCKBLOX keeps them
  #holdActive() {
    if (!this.canHold) return false;
    const from = this.blocksOf(this.active);
    if (this.hold < 0) {
      this.hold = this.active.type;
      this.#emit('hold', { held: this.hold, from, swapped: false });
      this.#activateNext();
    } else {
      const outgoing = this.active.type;
      this.active = newPiece(this.hold);
      this.hold = outgoing;
      this.#emit('hold', { held: this.hold, from, swapped: true, blocks: this.blocksOf(this.active) });
      this.#resetForNewPiece();
    }
    this.noDropSinceHold = true;
    return true;
  }
}
