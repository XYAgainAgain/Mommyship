// CUCKBLOX input adapters. Each physical control carries two meanings: what it does in play, and what it
// does in menus. The shell decides which one applies; adapters only report presses and releases.

/** Keyboard: event.code → { game, menu }. */
export const KEYS = {
  ArrowLeft: { game: 'left', menu: 'left' },
  ArrowRight: { game: 'right', menu: 'right' },
  ArrowDown: { game: 'softDrop', menu: 'down' },
  ArrowUp: { game: 'rotateCW', menu: 'up' },
  KeyX: { game: 'rotateCW', menu: null },
  KeyZ: { game: 'rotateCCW', menu: null },
  Space: { game: 'hardDrop', menu: 'confirm' },
  KeyC: { game: 'hold', menu: null },
  ShiftLeft: { game: 'hold', menu: null },
  ShiftRight: { game: 'hold', menu: null },
  Escape: { game: 'pause', menu: 'back' },
  KeyP: { game: 'pause', menu: null },
  Enter: { game: null, menu: 'confirm' },
  Backquote: { game: null, menu: null, toggle: 'fps' },
  NumpadEnter: { game: null, menu: 'confirm' },
};

/** Standard-mapping gamepad: control id → { game, menu, test(pad, wasDown) }. */
const STICK = 0.5;
const TRIGGER_PULL = 0.4;
const TRIGGER_LET_GO = 0.2;
const btn = (i) => (p) => !!p.buttons[i]?.pressed;
// Triggers are analog and every press spins, so they let go lower than they press: a half-pull can't chatter
const trigger = (i) => (p, was) => (p.buttons[i]?.value ?? 0) > (was ? TRIGGER_LET_GO : TRIGGER_PULL);
export const PAD = {
  left: { game: 'left', menu: 'left', test: (p) => btn(14)(p) || p.axes[0] < -STICK },
  right: { game: 'right', menu: 'right', test: (p) => btn(15)(p) || p.axes[0] > STICK },
  down: { game: 'softDrop', menu: 'down', test: (p) => btn(13)(p) || p.axes[1] > STICK },
  dpadUp: { game: 'hardDrop', menu: 'up', test: btn(12) },
  stickUp: { game: null, menu: 'up', test: (p) => p.axes[1] < -STICK },
  a: { game: 'rotateCW', menu: 'confirm', test: btn(0) },
  b: { game: 'rotateCCW', menu: 'back', test: btn(1) },
  y: { game: 'hold', menu: null, test: btn(3) },
  lb: { game: 'hardDrop', menu: null, test: btn(4) },
  rb: { game: 'hold', menu: null, test: btn(5) },
  lt: { game: 'rotateCCW', menu: null, test: trigger(6) },
  rt: { game: 'rotateCW', menu: null, test: trigger(7) },
  start: { game: 'pause', menu: 'confirm', test: btn(9) },
};

export class KeyboardInput {
  /** @param {HTMLElement} target focusable game surface; @param {(c: {game, menu, down}) => void} onControl */
  constructor(target, onControl) {
    this.target = target;
    this.onControl = onControl;
    this.held = new Set();
    this.onKeyDown = (e) => {
      const c = KEYS[e.code];
      if (!c) return;
      // Claimed keys never scroll the page or reach the site's own shortcuts
      e.preventDefault();
      e.stopPropagation();
      if (e.repeat || this.held.has(e.code)) return;
      this.held.add(e.code);
      onControl({ ...c, down: true });
    };
    this.onKeyUp = (e) => {
      const c = KEYS[e.code];
      if (!c) return;
      e.preventDefault();
      e.stopPropagation();
      if (!this.held.delete(e.code)) return;
      onControl({ ...c, down: false });
    };
    target.addEventListener('keydown', this.onKeyDown);
    target.addEventListener('keyup', this.onKeyUp);
  }

  /** Lets go of everything without reporting releases (the shell resets its own state). */
  clear() {
    this.held.clear();
  }

  dispose() {
    this.target.removeEventListener('keydown', this.onKeyDown);
    this.target.removeEventListener('keyup', this.onKeyUp);
  }
}

export class GamepadInput {
  constructor(onControl) {
    this.onControl = onControl;
    this.state = new Map();
  }

  /** Call once per frame; reports edges for every connected standard-mapping pad. */
  poll() {
    if (!navigator.getGamepads) return;
    const seen = new Set();
    for (const pad of navigator.getGamepads()) {
      if (!pad || !pad.connected || pad.mapping !== 'standard') continue;
      seen.add(String(pad.index));
      for (const [id, c] of Object.entries(PAD)) {
        const key = `${pad.index}:${id}`;
        const was = !!this.state.get(key);
        const now = c.test(pad, was);
        if (now === was) continue;
        this.state.set(key, now);
        this.onControl({ game: c.game, menu: c.menu, down: now });
      }
    }
    // A pad that vanishes mid-press must let go of everything it was holding
    for (const [key, down] of this.state) {
      const [index, id] = key.split(':');
      if (seen.has(index)) continue;
      this.state.delete(key);
      if (down) this.onControl({ game: PAD[id].game, menu: PAD[id].menu, down: false });
    }
  }

  clear() {
    for (const k of this.state.keys()) this.state.set(k, true);
  }
}

export const HELD_ACTIONS = new Set(['left', 'right', 'softDrop', 'hardDrop']);

/** Feeds game actions to the engine. Held actions count overlapping sources (two keys, a key plus a pad) so the
 *  engine sees one press and one release; rotate and hold pass every press through, as in Lightblocks. */
export class GameControls {
  constructor() {
    this.game = null;
    this.counts = new Map();
  }

  attach(game) {
    this.game = game;
    this.counts.clear();
  }

  handle(action, down) {
    if (!this.game) return;
    if (!HELD_ACTIONS.has(action)) {
      if (down) this.game.press(action);
      return;
    }
    const n = this.counts.get(action) ?? 0;
    if (down) {
      this.counts.set(action, n + 1);
      if (n === 0) this.game.press(action);
    } else if (n > 0) {
      this.counts.set(action, n - 1);
      if (n === 1) this.game.release(action);
    }
  }

  releaseAll() {
    this.counts.clear();
    this.game?.releaseAll();
  }
}
