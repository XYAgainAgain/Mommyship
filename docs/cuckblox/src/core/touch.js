// CUCKBLOX touch gestures, ported from Lightblocks' PlayGesturesInput: tap to rotate (screen half picks the
// direction), drag sideways to slide, drag down quickly to soft drop, optional swipe-up action.

const BORDER_FRACTION = 0.1;
const SOFT_DROP_WINDOW_MS = 300;
const GESTURE_GRACE = 0.1;

export const SWIPE_UP = ['none', 'hardDrop', 'hold', 'pause'];

/** Lightblocks' touch pad size: one setting for how big the pad draws and how far a drag must go, 5 CSS px a step. */
export const padPixels = (size) => size * 5;

export const VIBRATION_MS = { gesture: 20, drop: 80, clear: 150, special: 300 };
// How hard a gamepad rumbles for the same events, 0–1
export const RUMBLE = { drop: 0.25, clear: 0.55, special: 1 };

export function vibrate(ms) {
  try {
    navigator.vibrate?.(ms);
  } catch {
    // Some browsers throw without a recent user gesture; haptics are optional
  }
}

/** opts: surface (receives pointer events), settings() (live touch settings), active() (a game is in play),
 *  control(action, down), freeze(seconds) for the grace freeze, pause(), changed() when the panel moves,
 *  and holdHit(x, y) for whether a point lands on the on-screen Hold button. */
export class TouchInput {
  constructor(opts) {
    Object.assign(this, opts);
    this.pointerId = null;
    this.panel = null;
    this.reset();
    this.onDown = (e) => this.#down(e);
    this.onMove = (e) => this.#move(e);
    this.onUp = (e) => this.#up(e);
    this.onCancel = (e) => this.#up(e, true);
    this.surface.addEventListener('pointerdown', this.onDown);
    this.surface.addEventListener('pointermove', this.onMove);
    this.surface.addEventListener('pointerup', this.onUp);
    this.surface.addEventListener('pointercancel', this.onCancel);
  }

  reset() {
    this.valid = false;
    this.beganHorizontal = false;
    this.beganSoftDrop = false;
    this.didHardDrop = false;
    this.didHold = false;
    this.didSomething = false;
  }

  dispose() {
    this.surface.removeEventListener('pointerdown', this.onDown);
    this.surface.removeEventListener('pointermove', this.onMove);
    this.surface.removeEventListener('pointerup', this.onUp);
    this.surface.removeEventListener('pointercancel', this.onCancel);
  }

  #accepts(e) {
    return e.pointerType === 'touch' || e.pointerType === 'pen' || (e.pointerType === 'mouse' && this.settings().mouse);
  }

  /** A pointer event in surface coordinates. The surface's box is read once per touch, at its start, rather than on
   *  every move. */
  #local(e, fresh = false) {
    if (fresh || !this.rect) this.rect = this.surface.getBoundingClientRect();
    const r = this.rect;
    return { x: e.clientX - r.left, y: e.clientY - r.top, w: r.width, h: r.height };
  }

  #down(e) {
    if (!this.active() || !this.#accepts(e)) return;
    const p = this.#local(e, true);
    // The Hold button takes its own touches, even mid-gesture, as Lightblocks' button does
    if (e.button === 0 && this.holdHit?.(p.x, p.y)) {
      e.preventDefault();
      this.control('hold', true);
      this.#haptic();
      return;
    }
    if (this.pointerId !== null) return;
    // A right click pauses, like Lightblocks' desktop gestures
    if (e.pointerType === 'mouse' && e.button === 2) { this.pause(); return; }
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    // The top tenth of the screen is the pause strip, not the play surface
    if (p.y < p.h * BORDER_FRACTION) { this.pause(); return; }
    e.preventDefault();
    this.surface.setPointerCapture?.(e.pointerId);
    this.pointerId = e.pointerId;
    this.reset();
    this.valid = true;
    this.startX = p.x;
    this.startY = p.y;
    this.startTime = e.timeStamp;
    this.freeze(GESTURE_GRACE);
    const s = this.settings();
    this.panel = s.guide ? { x: p.x, y: p.y, cw: (p.x >= p.w / 2) !== s.invert, threshold: padPixels(s.size), showDrop: true } : null;
    this.changed();
  }

  #move(e) {
    if (e.pointerId !== this.pointerId || !this.valid) return;
    const s = this.settings();
    const t = padPixels(s.size);
    const p = this.#local(e);
    const dx = p.x - this.startX;
    const dy = p.y - this.startY;

    // Sideways slides need twice the distance while soft-dropping, so a drop isn't knocked sideways
    if (!this.didHardDrop) {
      const sideways = this.beganSoftDrop ? 2 * t : t;
      if (!this.beganHorizontal && Math.abs(dx) > sideways) {
        this.beganHorizontal = true;
        this.horizontal = dx < 0 ? 'left' : 'right';
        this.control(this.horizontal, true);
        this.#haptic();
      }
      if (this.beganHorizontal && Math.abs(dx) < sideways) this.#endHorizontal();
    }

    const elapsed = e.timeStamp - this.startTime;
    if (!this.beganHorizontal && dy > t && !this.beganSoftDrop && elapsed <= SOFT_DROP_WINDOW_MS) {
      this.beganSoftDrop = true;
      this.control('softDrop', true);
      this.#haptic();
    }
    if ((this.beganHorizontal || dy < t) && this.beganSoftDrop) {
      this.beganSoftDrop = false;
      this.control('softDrop', false);
    }

    const swipe = s.swipeUp;
    const factor = swipe === 'pause' ? 4 : 3;
    if (dy < -factor * t && swipe !== 'none') {
      if (swipe === 'pause') {
        this.#finish();
        this.pause();
        return;
      }
      if (swipe === 'hardDrop' && !this.didHardDrop && !this.beganHorizontal) {
        this.control('hardDrop', true);
        this.didHardDrop = true;
        this.#haptic();
      } else if (swipe === 'hold' && !this.didHold && !this.beganHorizontal) {
        // One Hold per swipe: a finger jittering above the line would otherwise fire it (and buzz) on every move
        this.control('hold', true);
        this.didHold = true;
        this.#haptic();
      }
    }

    // Any real drag cancels the tap (and the grace freeze) at once
    if (!this.didSomething && (Math.abs(dx) > t || Math.abs(dy) > t)) {
      this.freeze(0);
      this.didSomething = true;
    }
    if (this.panel) {
      this.panel.showDrop = this.beganSoftDrop || elapsed <= SOFT_DROP_WINDOW_MS;
      this.changed();
    }
  }

  #up(e, cancelled = false) {
    if (e.pointerId !== this.pointerId) return;
    if (this.valid) {
      this.freeze(0);
      if (!this.didSomething && !cancelled) {
        // Lightblocks picks the half from where the finger lifts, not where it landed
        const p = this.#local(e);
        this.control((p.x >= p.w / 2) !== this.settings().invert ? 'rotateCW' : 'rotateCCW', true);
        this.#haptic();
      }
    }
    this.#finish();
  }

  /** Lets go of everything this touch held, soft-drop flag included, so the next touch starts clean. */
  #finish() {
    if (this.didHardDrop) this.control('hardDrop', false);
    if (this.beganSoftDrop) this.control('softDrop', false);
    if (this.beganHorizontal) this.#endHorizontal();
    this.reset();
    this.pointerId = null;
    this.panel = null;
    this.changed();
  }

  #endHorizontal() {
    this.control(this.horizontal, false);
    this.beganHorizontal = false;
  }

  #haptic() {
    if (this.settings().buzz) vibrate(VIBRATION_MS.gesture);
  }

  /** Drops any touch in progress, e.g. when the game pauses. */
  cancel() {
    if (this.pointerId !== null) this.#finish();
  }
}
