// Streamed loops stall in ways no event reports (a play() that never answers, a dropped download, a phone handing
// audio focus to another app), so whatever should be sounding is checked by whether it actually moves.

const FIRST_WAIT = 2;
const MAX_WAIT = 30;

function bufferedEnd(el) {
  try {
    const b = el.buffered;
    return b?.length ? b.end(b.length - 1) : 0;
  } catch {
    return 0;
  }
}

export class MediaWatch {
  constructor() {
    this.reset();
  }

  /** Forgets the element's history, for when it legitimately stops (paused, muted, silent) or is replaced. */
  reset() {
    this.time = NaN;
    this.buffered = NaN;
    this.still = 0;
    this.tries = 0;
  }

  /** Call every frame while `el` should be sounding (`failed` for one that errored or never got made). Answers
   *  'retry' (play it again), then 'rebuild' (a fresh element), waiting longer after each try; otherwise null. */
  check(el, dt, failed = false) {
    if (!failed) {
      const time = el.currentTime;
      const buffered = bufferedEnd(el);
      const playing = !el.paused && time !== this.time;
      // Still downloading its first stretch counts as progress, so a slow phone isn't restarted mid-fetch
      const loading = el.readyState < 3 && buffered !== this.buffered;
      this.time = time;
      this.buffered = buffered;
      if (playing) {
        this.still = 0;
        this.tries = 0;
        return null;
      }
      if (loading) {
        this.still = 0;
        return null;
      }
    }
    this.still += dt;
    if (this.still < Math.min(MAX_WAIT, FIRST_WAIT * 2 ** this.tries)) return null;
    this.still = 0;
    return this.tries++ === 0 && !failed && !el.error ? 'retry' : 'rebuild';
  }
}
