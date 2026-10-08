// Per-browser CUCKBLOX data: settings, personal bests, and the credits wallet (themes, paints, and tunes owned).
// Storage can be missing or throw (private windows, blocked site data), so every access is guarded.
import { practiceMaxStartLevel, MODES } from './engine.js';
import { ZONES } from '../themes/themes.js';

const KEY = 'cuckblox';
const RUN_KEY = 'cuckblox-run';
const RUN_VERSION = 1;
const SWIPES = ['none', 'hardDrop', 'hold', 'pause'];
const ZONE_KEYS = ZONES.flatMap((z) => z.keys.map(([key]) => key));
const HEX = /^#[0-9a-f]{6}$/i;
export const MAX_PAD_SIZE = 10;

const DEFAULTS = {
  settings: { ghost: false, fps: false, sfx: true, music: 5, tune: 'korobeiniki', shuffle: false, tube: true, fullscreen: true, theme: 'cuck-green', customColors: null, touch: { size: 2, invert: false, swipeUp: 'hardDrop', haptics: true, buzz: true, guide: false, holdButton: true, mouse: false } },
  bests: {},
  maxCombo: 0,
  last: { mode: 'marathon', marathonRotation: 'marathon', practiceRotation: 'practiceClassic', levels: {} },
};

const obj = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});
const bool = (v, d) => (typeof v === 'boolean' ? v : d);
const int = (v, d, lo = 0, hi = Number.MAX_SAFE_INTEGER) => (Number.isInteger(v) ? Math.min(hi, Math.max(lo, v)) : d);
const oneOf = (v, list, d) => (list.includes(v) ? v : d);

/** Every field checked against its expected shape; anything malformed falls back to its default instead of crashing boot. */
function normalize(raw) {
  const d = obj(raw);
  const s = obj(d.settings);
  const t = obj(s.touch);
  const l = obj(d.last);
  const colors = obj(s.customColors);
  const D = DEFAULTS.settings;
  const levels = {};
  for (const [mode, level] of Object.entries(obj(l.levels))) if (MODES[mode] && Number.isInteger(level)) levels[mode] = int(level, 0, 0, 19);
  const bests = {};
  for (const [board, b] of Object.entries(obj(d.bests))) {
    const r = obj(b);
    bests[board] = { score: int(r.score, 0), blocks: int(r.blocks, 0), lines: int(r.lines, 0) };
  }
  const w = obj(d.wallet);
  return {
    settings: {
      ghost: bool(s.ghost, D.ghost),
      fps: bool(s.fps, D.fps),
      sfx: bool(s.sfx, D.sfx),
      // A legacy boolean maps to the default volume (on) or 0 (off)
      music: typeof s.music === 'boolean' ? (s.music ? D.music : 0) : int(s.music, D.music, 0, 10),
      tune: typeof s.tune === 'string' ? s.tune : D.tune,
      shuffle: bool(s.shuffle, D.shuffle),
      tube: bool(s.tube, D.tube),
      fullscreen: bool(s.fullscreen, D.fullscreen),
      theme: typeof s.theme === 'string' ? s.theme : D.theme,
      customColors: ZONE_KEYS.every((k) => HEX.test(colors[k])) ? Object.fromEntries(ZONE_KEYS.map((k) => [k, colors[k]])) : null,
      touch: {
        // A legacy drag distance in px maps to the nearest size step
        size: int(t.size, Number.isInteger(t.threshold) ? Math.min(MAX_PAD_SIZE, Math.max(1, Math.round(t.threshold / 5))) : D.touch.size, 1, MAX_PAD_SIZE),
        invert: bool(t.invert, D.touch.invert),
        swipeUp: oneOf(t.swipeUp, SWIPES, D.touch.swipeUp),
        haptics: bool(t.haptics, D.touch.haptics),
        // A legacy single switch covered both, so a saved off keeps the gesture buzz off too
        buzz: bool(t.buzz, bool(t.haptics, D.touch.buzz)),
        guide: bool(t.guide, D.touch.guide),
        holdButton: bool(t.holdButton, D.touch.holdButton),
        mouse: bool(t.mouse, D.touch.mouse),
      },
    },
    bests,
    maxCombo: int(d.maxCombo, 0),
    last: {
      mode: oneOf(l.mode, Object.keys(MODES), DEFAULTS.last.mode),
      marathonRotation: oneOf(l.marathonRotation, ['marathon', 'marathonModern'], DEFAULTS.last.marathonRotation),
      practiceRotation: oneOf(l.practiceRotation, ['practiceClassic', 'practiceModern'], DEFAULTS.last.practiceRotation),
      levels,
    },
    // ensureWallet (credits.js) opens a fresh wallet when this is null; a missing tune list reads as empty
    wallet: Number.isInteger(w.cr) && Array.isArray(w.themes) && Array.isArray(w.paints)
      ? {
        cr: w.cr,
        themes: w.themes.filter((x) => typeof x === 'string'),
        paints: w.paints.filter((x) => HEX.test(x)).map((x) => x.toLowerCase()),
        tunes: Array.isArray(w.tunes) ? w.tunes.filter((x) => typeof x === 'string') : [],
      }
      : null,
  };
}

function readRaw() {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? 'null');
  } catch {
    return null;
  }
}

// What this tab last read from or wrote to storage; another tab's changes are whatever differs from it now
let synced = null;
const clone = (d) => JSON.parse(JSON.stringify(d));

export function loadData() {
  const data = normalize(readRaw());
  synced = clone(data);
  return data;
}

const isPracticeBoard = (board) => board.startsWith('practice');

/** The better of two records for a board, by the same rule recordRun uses; lines always keep the max. */
function betterBest(board, a, b) {
  if (!a) return b;
  if (!b) return a;
  const bWins = isPracticeBoard(board) ? b.blocks > a.blocks || (b.blocks === a.blocks && b.score > a.score) : b.score > a.score;
  const win = bWins ? b : a;
  return isPracticeBoard(board)
    ? { score: win.score, blocks: win.blocks, lines: Math.max(a.lines, b.lines) }
    : { score: Math.max(a.score, b.score), blocks: Math.max(a.blocks, b.blocks), lines: Math.max(a.lines, b.lines) };
}

/** Folds another tab's saved progress into `data` in place (credits, purchases, better bests); settings stay this tab's. */
function mergeStored(data, stored) {
  const ours = data.wallet;
  const theirs = stored.wallet;
  if (theirs && ours) {
    const delta = ours.cr - (synced?.wallet?.cr ?? ours.cr);
    // A wallet another tab opened first wins over this tab's fresh one; its dividend was already paid there
    ours.cr = Math.max(0, theirs.cr + (synced?.wallet ? delta : 0));
    ours.themes = [...new Set([...theirs.themes, ...ours.themes])];
    ours.paints = [...new Set([...theirs.paints, ...ours.paints])];
    ours.tunes = [...new Set([...theirs.tunes, ...(ours.tunes ?? [])])];
  } else if (theirs) {
    data.wallet = theirs;
  }
  for (const board of new Set([...Object.keys(stored.bests), ...Object.keys(data.bests)])) {
    data.bests[board] = betterBest(board, stored.bests[board], data.bests[board]);
  }
  data.maxCombo = Math.max(data.maxCombo, stored.maxCombo);
}

/** Saves after merging in whatever another open tab saved since this one last synced, so neither erases the other. */
export function saveData(data) {
  const raw = readRaw();
  if (raw) mergeStored(data, normalize(raw));
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // Unsaved bests are better than a crash
  }
  synced = clone(data);
}

/** Pulls another tab's saved progress into this tab (call on the storage event, and before spending). */
export function syncData(data) {
  const raw = readRaw();
  if (!raw) return;
  mergeStored(data, normalize(raw));
  synced = clone(data);
}

/** Runs a spend under a lock every tab shares: the merge sums changes, so two unlocked debits could overdraw. */
export function withWallet(fn) {
  const locks = globalThis.navigator?.locks;
  return locks ? locks.request('cuckblox-wallet', fn) : Promise.resolve().then(fn);
}

/** Saves an unfinished run (snapshot between engine ticks) with what it banked and the last block milestone it paid,
 *  so a resumed run's game-over card and bonuses carry on correctly. */
export function saveRun(game, earned = 0, bonusAt = 0) {
  try {
    localStorage.setItem(RUN_KEY, JSON.stringify({ v: RUN_VERSION, savedAt: Date.now(), snapshot: game.serialize(), earned, bonusAt }));
  } catch {
    // Without storage the run just isn't resumable
  }
}

function readRun() {
  try {
    const run = JSON.parse(localStorage.getItem(RUN_KEY) ?? 'null');
    return run?.v === RUN_VERSION && run.snapshot && !run.snapshot.gameOver ? run : null;
  } catch {
    return null;
  }
}

/** The saved run's engine snapshot, or null when there is none or it can't be read. */
export function loadRun() {
  return readRun()?.snapshot ?? null;
}

/** Credits the saved run had banked (0 when the save doesn't record them). */
export function loadRunEarned() {
  return int(readRun()?.earned, 0);
}

/** The last block count the saved run's bonus paid for (0 when the save doesn't record it). */
export function loadRunBonus() {
  return int(readRun()?.bonusAt, 0);
}

const sameRun = (run, game) => !!run && run.snapshot.seed === game.seed && run.snapshot.mode === game.mode.id;

/** The last milestone this run's save says was paid, which another tab playing the same save may have moved on. */
export function savedRunBonus(game) {
  const run = readRun();
  return sameRun(run, game) ? int(run.bonusAt, 0) : 0;
}

/** Marks a mid-run bonus on that run's older save, so resuming it (after a crash, or in a second tab) can't pay the
 *  same milestone twice and its earned total still counts the bonus. */
export function markRunBonus(game, bonusAt, cr = 0) {
  const run = readRun();
  if (!sameRun(run, game) || int(run.bonusAt, 0) >= bonusAt) return;
  try {
    localStorage.setItem(RUN_KEY, JSON.stringify({ ...run, bonusAt, earned: int(run.earned, 0) + cr }));
  } catch {
    // Without storage there is no older save to protect
  }
}

export function clearRun() {
  try {
    localStorage.removeItem(RUN_KEY);
  } catch {
    // Nothing to clear
  }
}

const INITIALS_KEY = 'cuckblox-initials';

/** The last initials this browser entered, so the next top-10 run starts from them (null when none or unreadable). */
export function loadInitials() {
  try {
    const v = localStorage.getItem(INITIALS_KEY);
    return /^[A-Z0-9]{3}$/.test(v ?? '') ? v : null;
  } catch {
    return null;
  }
}

export function saveInitials(initials) {
  try {
    localStorage.setItem(INITIALS_KEY, initials);
  } catch {
    // The next entry just starts from AAA
  }
}

/** Leaderboard-style board id: Practice splits into three speed bands. */
export function boardId(mode, startLevel) {
  if (!mode.startsWith('practice')) return mode;
  const band = startLevel <= 9 ? '0-9' : startLevel <= 15 ? '10-15' : '16-19';
  return `${mode}-${band}`;
}

export function bestFor(data, mode, startLevel) {
  const b = data.bests[boardId(mode, startLevel)];
  return { score: b?.score | 0, blocks: b?.blocks | 0, lines: b?.lines | 0, maxCombo: data.maxCombo };
}

export function maxStartLevel(data, mode) {
  if (!mode.startsWith('practice')) return 9;
  const lines = Math.max(data.bests.marathon?.lines | 0, data.bests.marathonModern?.lines | 0, data.bests.retro?.lines | 0);
  return practiceMaxStartLevel(lines);
}

/** Records a finished (or abandoned) run; returns true when it beat the board's stored best. */
export function recordRun(data, game) {
  const id = boardId(game.mode.id, game.startLevel);
  const old = data.bests[id] ?? { score: 0, blocks: 0, lines: 0 };
  // Practice ranks by blocks with score as the tiebreaker, like the global boards
  const improved = game.mode.practice
    ? game.blocks > old.blocks || (game.blocks === old.blocks && game.score > old.score)
    : game.score > old.score;
  // A Practice record keeps one run's blocks and score together so the tiebreaker stays honest
  data.bests[id] = game.mode.practice
    ? { ...(improved ? { score: game.score, blocks: game.blocks } : { score: old.score, blocks: old.blocks }), lines: Math.max(old.lines, game.lines) }
    : { score: Math.max(old.score, game.score), blocks: Math.max(old.blocks, game.blocks), lines: Math.max(old.lines, game.lines) };
  data.maxCombo = Math.max(data.maxCombo, game.best.maxCombo);
  saveData(data);
  return improved;
}
