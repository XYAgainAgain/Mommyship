// CUCKBLOX shell: menus, the fixed-step loop, local bests, and the credits wallet around the engine and renderer.
import { Game, DT } from './core/engine.js';
import { Renderer, PULSE_LIFE } from './render/render.js';
import { KeyboardInput, GamepadInput, GameControls, HELD_ACTIONS } from './core/input.js';
import { loadData, saveData, syncData, withWallet, bestFor, maxStartLevel, recordRun, saveRun, loadRun, loadRunEarned, loadRunBonus, markRunBonus, savedRunBonus, clearRun, boardId, loadInitials, saveInitials, MAX_PAD_SIZE } from './core/store.js';
import { Sound } from './audio/audio.js';
import { Music, MAX_VOLUME } from './audio/music.js';
import { analyzeSong, circleOrder } from './audio/key.js';
import { OsminokSoundscape, OCEAN_THEME_ID } from './audio/osminok-audio.js';
import { ThemeAmbience } from './audio/ambience.js';
import { depthFor, DIVE_ZONES, PLUNGE_DEPTH } from './scenes/osminok.js';
import { TouchInput, SWIPE_UP, VIBRATION_MS, RUMBLE, vibrate } from './core/touch.js';
import { PRESETS, DEFAULT_THEME, customTheme, themeById, zoneColorsOf } from './themes/themes.js';
import { openPaintShop } from './themes/paint-shop.js';
import { TEXT, spoken, plain } from './text.js';
import { ensureWallet, ownsTheme, buyTheme, ownsTune, buyTune, paintQuote, buyPaint, payForClear, bloxBonus, formatCr } from './core/credits.js';
import { Leaderboard, BoardView, InitialsEntry, isPracticeBoard, eligible, offerInitials, within, submitOutcome, formatRow, rankedValue } from './online/leaderboard.js';
import { FIREBASE } from './online/firebase.js';
import { PERF, showViewportReadout } from './core/perf.js';

const MAX_FRAME = 0.1;
const GAME_OVER_PAUSE = 1.6;
// The longest the top-10 check and a submission may take before the game moves on and treats it as offline
const CHECK_MS = 8000;
const SUBMIT_MS = 10000;
const BANDS = [[0, 9], [10, 15], [16, 19]];

const FAMILIES = {
  marathon: { name: TEXT.mode.marathon, blurb: TEXT.setup.marathon },
  retro: { name: TEXT.mode.retro, blurb: TEXT.setup.retro },
  practice: { name: TEXT.mode.practice, blurb: TEXT.setup.practice },
};

const canvas = document.getElementById('screen');
canvas.setAttribute('aria-label', TEXT.say.canvas);
const live = document.getElementById('live');
const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
// Touch screens drop the title's keyboard hint even before the first tap, so the menu has room to stay large
const coarsePointer = matchMedia('(pointer: coarse)');
// Small screens never show the controls hint, whatever is plugged in, so a pad press can't reflow the title;
// Select on a pad opens the controls screen instead
const smallScreen = matchMedia('(max-width: 599.98px), (max-height: 599.98px)');
smallScreen.addEventListener('change', () => hintChanged());
const data = loadData();
const wallet = ensureWallet(data);
if (!ownsTheme(wallet, themeById(data.settings.theme, data.settings.customColors))) data.settings.theme = DEFAULT_THEME.id;
saveData(data);
const renderer = new Renderer(canvas, { reducedMotion: motionQuery.matches, theme: themeById(data.settings.theme, data.settings.customColors), maxDpr: PERF.dpr });
motionQuery.addEventListener('change', (e) => { renderer.reducedMotion = e.matches; renderer.invalidate(); });
renderer.showGhost = data.settings.ghost;
const controls = new GameControls();
const sound = new Sound({ enabled: data.settings.sfx });
// Each tune names the speed level its tempo was written for; only Marathon rides the level away from it, 5 BPM a step.
// kcr is the song shop price (0 is standard issue, 50 the most any tune costs); a new song is one more line here.
// Tune Select lists them cheapest first; the sort is stable, so the theme leads the freebies.
const TUNES = [
  { id: 'theme', name: TEXT.tunes.theme, bundle: './music/cuckblox-theme-a-side.song.json', homeLevel: 0, kcr: 0 },
  { id: 'korobeiniki', name: TEXT.tunes.korobeiniki, bundle: './music/Korobeiniki.song.json', homeLevel: 8, kcr: 0 },
  // homeLevel is where each song's tempo curve gives back its own bpm (Volga 69 at 0, the Minuet about 150 at 14)
  { id: 'volga-boatmen', name: TEXT.tunes.volgaBoatmen, bundle: './music/Volga%20Spacemen.song.json', homeLevel: 0, kcr: 0 },
  { id: 'minuet-type-c', name: TEXT.tunes.minuetTypeC, bundle: './music/Minuet%20(Type%20C).song.json', homeLevel: 14, kcr: 0 },
  { id: 'kalinka', name: TEXT.tunes.kalinka, bundle: './music/Kalinka.song.json', homeLevel: 12, kcr: 0 },
  { id: 'internationale', name: TEXT.tunes.internationale, bundle: './music/The%20Internationale.song.json', homeLevel: 0, kcr: 0 },
  { id: 'caramelldansen', name: TEXT.tunes.caramelldansen, bundle: './music/Caramelldansen.song.json', homeLevel: 0, kcr: 5 },
  { id: 'down-under', name: TEXT.tunes.downUnder, bundle: './music/Down%20Under.song.json', homeLevel: 0, kcr: 15 },
  { id: 'finally-landing', name: TEXT.tunes.finallyLanding, bundle: "./music/We're%20Finally%20Landing.song.json", homeLevel: 0, kcr: 20 },
  { id: 'anthem', name: TEXT.tunes.anthem, bundle: './music/Anthem%201-2.song.json', homeLevel: 0, kcr: 40 },
  { id: 'never-gonna', name: TEXT.tunes.neverGonna, bundle: './music/Never%20Gonna%20Give%20You%20Up.song.json', homeLevel: 0, kcr: 2 },
].sort((a, b) => a.kcr - b.kcr);
// The C.U.C.K. theme plays on the title and menus, and is also a free tune runs can pick or shuffle into. null keeps menus silent.
export const MENU_TUNE = { bundle: TUNES[0].bundle, homeLevel: 0 };
const tune = () => TUNES.find((t) => t.id === data.settings.tune) ?? TUNES.find((t) => t.id === 'korobeiniki');
const tunePrice = (t) => TEXT.themes.price(t.kcr);
if (!ownsTune(wallet, tune())) {
  data.settings.tune = TUNES[0].id;
  saveData(data);
}
// Song and player paths are from the game's root, one folder up from here
const GAME_ROOT = new URL('../', import.meta.url).href;
const music = new Music({ playerUrl: './vendor/sine-sculptor/sine-sculptor-elementary-player.js', bundleUrl: tune().bundle, base: GAME_ROOT, volume: data.settings.music });
const ocean = new OsminokSoundscape({ baseUrl: '../assets/audio/', enabled: data.settings.sfx });
const ambience = new ThemeAmbience({ baseUrl: './', enabled: data.settings.sfx });
// Ambience follows music, always: every pause treatment and game-over ending the song gets, the loop gets too
music.onTreatment((t) => ambience.follow(t));
// The blips play in whatever key the song is in at that moment
sound.followKey(() => music.currentKey());
const DEFAULT_MUSIC = 5;
// Shuffle: each owned tune's home key, learned by reading its bundle, and where the playing song was last frame
const tuneKeys = new Map();
const SHUFFLE_FADE_SECONDS = 1;
const SHUFFLE_LOOKAHEAD_SECONDS = 0.15;
const SHUFFLE_GAP_MS = 2500;
let shufflePhase = null;
let shuffleLoading = false;
let shuffleTried = false;
// Switching shuffle on keeps the current song for the next run instead of skipping straight past it
let shuffleHeld = true;
const tuneRow = (t = tune()) => (data.settings.shuffle ? 0 : TUNES.indexOf(t) + 1);
const musicLevel = () => (game && setup.family === 'marathon' ? game.level : tune().homeLevel);
const keyboard = new KeyboardInput(canvas, onControl);
const pad = new GamepadInput((c) => {
  if (c.down) {
    usePad(true);
    // Only works once the page has had a key or tap; until then the screen asks for one
    wakeAudio();
  }
  onControl(c);
});

let game = null;
let screen = 'title';
let selected = 0;
let screenTime = 0;
// Seconds after a screen opens during which confirms are ignored, so a press meant for the screen before can't land here
let confirmHold = 0;
const CONFIRM_HOLD = 0.4;
let lastRun = null;
let hitBoxes = [];
let menuModel = null;
// What the current run has banked so far, and the speed level its next clear is paid at
let runEarned = 0;
let payLevel = 0;
// The last block count Consistent's bonus paid for, and its spoken line until this lock's clear announcement goes out
let bonusAt = 0;
let bonusSay = null;
// The locked tune Tune Select is playing as a preview, or null while the player's own tune is the one loaded
let previewing = null;
let menuPlaying = false;
let buying = null;
// The finished run's leaderboard state: its entry, the top-10 verdict, the initials being typed, and how the submit went
let runBoard = null;
// Which board the rankings screen shows, and where its way back leads
const boardState = { family: 'marathon', modern: false, band: 0, monthly: false, from: 'title' };
const setup = {
  family: data.last.mode.startsWith('practice') ? 'practice' : data.last.mode.startsWith('marathon') ? 'marathon' : 'retro',
  rotation: { marathon: data.last.marathonRotation, practice: data.last.practiceRotation },
  level: 0,
};

/** Marathon and Practice each have a Classic and a Modern variant; Retro is Classic only. */
const VARIANTS = {
  marathon: { classic: 'marathon', modern: 'marathonModern' },
  practice: { classic: 'practiceClassic', modern: 'practiceModern' },
};

function familyOf(mode) {
  return mode.startsWith('practice') ? 'practice' : mode.startsWith('marathon') ? 'marathon' : 'retro';
}

function titleIndex(family) {
  return Object.keys(FAMILIES).indexOf(family) + (loadRun() ? 1 : 0);
}

function modeId() {
  return setup.rotation[setup.family] ?? setup.family;
}

function isModern() {
  return modeId().endsWith('Modern');
}

// Menu text is all caps on screen; screen readers get it in sentence case so short words aren't spelled out
function announce(text) {
  live.textContent = spoken(plain(text));
}

/** What a screen reader hears for a menu row; `say` overrides labels that caps would garble. */
function rowLabel(item) {
  return item.say ?? spoken(plain(item.label));
}

function invalidate() {
  uiDirty = true;
}

/** `index` is a row number, or a row's label so a way back still lands right after rows are added. */
function go(next, index = 0) {
  screen = next;
  confirmHold = 0;
  selected = typeof index === 'number' ? index : 0;
  menuScroll = 0;
  menuFollow = true;
  screenTime = 0;
  invalidate();
  menuModel = buildMenu();
  if (menuModel && typeof index === 'string') selected = Math.max(0, menuModel.items.findIndex((i) => i.label === index));
  if (menuModel) {
    const item = menuModel.items[selected];
    const lines = (menuModel.lines ?? []).filter((l) => l !== null).map((l) => spoken(plain(l)));
    announce([menuModel.title && spoken(plain(menuModel.title)), ...lines, item && rowLabel(item)].filter(Boolean).join('. '));
  }
  syncMenuMusic();
  // Tune Select starts on the player's own tune, playing, so arriving from the menu tune never drops to silence
  if (screen === 'tunes') menuModel?.items[selected]?.focus?.();
}

/** The menu tune plays wherever no run exists, except in Tune Select, which previews its highlighted tune instead. */
function syncMenuMusic() {
  const want = !!MENU_TUNE.bundle && !game && screen !== 'tunes' && screen !== 'buyTune';
  if (want === menuPlaying) return;
  menuPlaying = want;
  if (want) {
    music.setBundle(MENU_TUNE.bundle);
    music.setLevel(MENU_TUNE.homeLevel);
    music.play();
    return;
  }
  // Silent again with the player's own tune loaded, which is what a run's Go prompt and Tune Select expect
  music.stop();
  music.setBundle(tune().bundle);
  music.setLevel(tune().homeLevel);
}

// Menus

function buildMenu() {
  switch (screen) {
    case 'title': {
      const saved = loadRun();
      const resume = saved ? [{ label: TEXT.title.resume(FAMILIES[familyOf(saved.mode)].name), select: () => resumeSaved(saved) }] : [];
      const onOff = (v) => (v ? TEXT.title.on : TEXT.title.off);
      return {
        items: [
          ...resume,
          ...Object.entries(FAMILIES).map(([id, f]) => ({ label: f.name, icon: id, select: () => openSetup(id) })),
          { label: TEXT.board.open, icon: 'rankings', select: () => openBoards('title') },
          { label: TEXT.title.theme, select: () => go('themes') },
          { label: TEXT.title.tune, select: () => go('tunes', tuneRow()) },
          { label: TEXT.title.touch, select: () => go('touch') },
          { label: TEXT.title.sfx, say: TEXT.say.sfxLabel, value: onOff(data.settings.sfx), adjustable: true, adjust: toggleSfx, select: toggleSfx },
          { label: TEXT.title.music, value: data.settings.music || TEXT.title.off, adjustable: true, adjust: (d) => setMusic(data.settings.music + d), select: () => setMusic(data.settings.music ? 0 : DEFAULT_MUSIC) },
          { label: TEXT.title.tube, say: TEXT.say.tubeLabel, value: onOff(data.settings.tube), adjustable: true, adjust: toggleTube, select: toggleTube },
          ...(canFullscreen() ? [{ label: TEXT.title.fullscreen, value: onOff(data.settings.fullscreen), adjustable: true, adjust: toggleFullscreen, select: toggleFullscreen }] : []),
          { label: TEXT.title.ghost, value: onOff(data.settings.ghost), adjustable: true, adjust: toggleGhost, select: toggleGhost },
          { label: TEXT.title.fps, say: TEXT.say.fpsLabel, value: onOff(data.settings.fps), adjustable: true, adjust: toggleFps, select: toggleFps },
        ],
        lines: [TEXT.wallet.balance(formatCr(wallet.cr))],
        // Dividers between the modes, the settings, and the controls hint
        breaks: [resume.length + Object.keys(FAMILIES).length + 1],
        hintBreak: true,
        hint: smallScreen.matches ? undefined : usingPad ? TEXT.title.padHint : usingTouch || coarsePointer.matches ? undefined : TEXT.title.hint,
      };
    }
    case 'controls':
      return { title: TEXT.controls.title, items: [{ label: TEXT.setup.back, select: closeControls }], hint: TEXT.title.padHint, back: closeControls };
    case 'setup': {
      const mode = modeId();
      const best = bestFor(data, mode, setup.level);
      const max = maxStartLevel(data, mode);
      const lines = [FAMILIES[setup.family].blurb, null];
      if (VARIANTS[setup.family]) lines.push(isModern() ? TEXT.setup.modern : TEXT.setup.classic);
      lines.push(setup.family === 'practice' ? TEXT.setup.bestBlocks(best.blocks.toLocaleString('en-US')) : TEXT.setup.best(best.score.toLocaleString('en-US')));
      if (setup.family === 'practice' && max < 19) lines.push(TEXT.setup.locked(max + 1));
      const items = [{ label: TEXT.setup.level, value: setup.level, adjustable: true, adjust: (d) => setLevel(setup.level + d), select: startGame }];
      if (VARIANTS[setup.family]) {
        items.push({
          label: TEXT.setup.rotation,
          value: isModern() ? TEXT.setup.modernValue : TEXT.setup.classicValue,
          adjustable: true,
          adjust: toggleRotation,
          select: toggleRotation,
        });
      }
      items.push({ label: TEXT.setup.start, select: startGame }, { label: TEXT.setup.back, select: () => go('title', titleIndex(setup.family)) });
      return { title: FAMILIES[setup.family].name.toUpperCase(), lines, items, back: () => go('title', titleIndex(setup.family)) };
    }
    case 'themes': {
      const list = themeList();
      const current = renderer.theme;
      const i = Math.max(0, list.findIndex((t) => t.id === current.id));
      const swatchWidth = (w) => Math.min(w, renderer.layout.unit * 16);
      const back = () => {
        restoreAppliedTheme();
        go('title', TEXT.title.theme);
      };
      const owned = ownsTheme(wallet, current);
      const affordable = wallet.cr >= current.kcr * 1000;
      const buy = () => (affordable ? go('buy', 0) : announce(TEXT.wallet.broke));
      // Left and right only browse; confirming applies an owned theme or opens the purchase for a locked one
      const pick = (d) => browseTheme(list[(i + d + list.length) % list.length]);
      const choose = () => (owned ? applyTheme(current) : buy());
      const buyRow = owned ? [] : [{ label: affordable ? TEXT.wallet.buy(current.price) : TEXT.wallet.short(current.price), select: buy }];
      return {
        title: TEXT.themes.title,
        lines: [current.name, themeStatus(current), TEXT.themes.current(appliedTheme().name), TEXT.wallet.balance(formatCr(wallet.cr))],
        slot: {
          height: (w) => Math.floor(swatchWidth(w) / 10) * 5 + Math.max(1, Math.round(Math.floor(swatchWidth(w) / 10) / 9)) * 4,
          draw: (x, y, w) => renderer.drawThemeSwatch(current, x + (w - swatchWidth(w)) / 2, y, swatchWidth(w)),
        },
        items: [
          { label: TEXT.themes.row, value: TEXT.themes.of(i + 1, list.length), adjustable: true, adjust: pick, select: choose },
          ...buyRow,
          { label: TEXT.themes.customize, select: openCustomizer },
          { label: TEXT.setup.back, select: back },
        ],
        back,
      };
    }
    case 'buy': {
      const t = renderer.theme;
      const back = () => go('themes', 1);
      return {
        title: TEXT.wallet.buyTitle,
        lines: [t.name, t.price, TEXT.wallet.after(formatCr(wallet.cr - t.kcr * 1000))],
        items: [{ label: TEXT.wallet.confirm, select: () => purchase(t) }, { label: TEXT.setup.back, select: back }],
        back,
      };
    }
    case 'touch': {
      const t = data.settings.touch;
      const onOff = (v) => (v ? TEXT.touch.on : TEXT.touch.off);
      // The row being changed is always the selected one (keys, pads, and clicks all select it first)
      const set = (key, value) => {
        t[key] = value;
        saveData(data);
        refreshMenu();
        const item = menuModel.items[selected];
        announce(`${rowLabel(item)}, ${spoken(String(item.value))}`);
      };
      const swipeNames = TEXT.touch.swipeValues;
      const cycle = (d) => set('swipeUp', SWIPE_UP[(SWIPE_UP.indexOf(t.swipeUp) + d + SWIPE_UP.length) % SWIPE_UP.length]);
      const flip = (key) => () => set(key, !t[key]);
      return {
        title: TEXT.touch.title,
        lines: [TEXT.touch.help],
        items: [
          { label: TEXT.touch.swipe, value: swipeNames[t.swipeUp], adjustable: true, adjust: cycle, select: () => cycle(1) },
          { label: TEXT.touch.guide, value: onOff(t.guide), adjustable: true, adjust: flip('guide'), select: flip('guide') },
          { label: TEXT.touch.size, value: t.size, adjustable: true, adjust: (d) => set('size', Math.min(MAX_PAD_SIZE, Math.max(1, t.size + d))), select: () => {} },
          { label: TEXT.touch.invert, value: onOff(t.invert), adjustable: true, adjust: flip('invert'), select: flip('invert') },
          { label: TEXT.touch.holdButton, value: onOff(t.holdButton), adjustable: true, adjust: flip('holdButton'), select: flip('holdButton') },
          { label: TEXT.touch.vibration, value: onOff(t.haptics), adjustable: true, adjust: flip('haptics'), select: flip('haptics') },
          { label: TEXT.touch.buzz, value: onOff(t.buzz), adjustable: true, adjust: flip('buzz'), select: flip('buzz') },
          { label: TEXT.touch.mouse, value: onOff(t.mouse), adjustable: true, adjust: flip('mouse'), select: flip('mouse') },
          { label: TEXT.setup.back, select: () => go('title', TEXT.title.touch) },
        ],
        back: () => go('title', TEXT.title.touch),
      };
    }
    case 'tunes': {
      const back = () => {
        endPreview();
        go('title', TEXT.title.tune);
      };
      const row = (t) => {
        // Every highlighted tune plays, owned or not, so players can hear what they're picking
        if (ownsTune(wallet, t)) return { label: t.name, focus: () => previewTune(t), select: () => pickTune(t) };
        const affordable = wallet.cr >= t.kcr * 1000;
        return {
          label: t.name,
          value: affordable ? tunePrice(t) : TEXT.wallet.short(tunePrice(t)),
          focus: () => { previewTune(t); announce(TEXT.say.tunePreview(spoken(t.name), tunePrice(t))); },
          // A tap selects without highlighting first, so the preview starts here too
          select: () => {
            previewTune(t);
            if (affordable) { buying = t; go('buyTune', 0); }
            else announce(TEXT.wallet.broke);
          },
        };
      };
      return {
        title: TEXT.tunes.title,
        lines: [TEXT.tunes.current(tune().name), TEXT.wallet.balance(formatCr(wallet.cr))],
        items: [
          { label: TEXT.tunes.shuffle, icon: 'shuffle', value: data.settings.shuffle ? TEXT.title.on : TEXT.title.off, focus: endPreview, select: toggleShuffle },
          ...TUNES.map(row),
          { label: TEXT.setup.back, focus: endPreview, select: back },
        ],
        back,
      };
    }
    case 'buyTune': {
      const t = buying;
      if (!t) return null;
      const back = () => {
        go('tunes', TUNES.indexOf(t) + 1);
        announce(TEXT.say.tunePreview(spoken(t.name), tunePrice(t)));
      };
      return {
        title: TEXT.wallet.buyTitle,
        lines: [t.name, tunePrice(t), TEXT.wallet.after(formatCr(wallet.cr - t.kcr * 1000))],
        items: [{ label: TEXT.wallet.confirm, select: () => purchaseTune(t) }, { label: TEXT.setup.back, select: back }],
        back,
      };
    }
    case 'ready':
      return {
        title: FAMILIES[setup.family].name.toUpperCase(),
        lines: [(VARIANTS[setup.family] ? (isModern() ? TEXT.ready.modern : TEXT.ready.classic) : TEXT.ready.retro)(setup.level)],
        items: [{ label: TEXT.ready.go, select: resume }, { label: TEXT.menu.quit, select: quit }],
        back: quit,
      };
    case 'paused':
      return {
        title: TEXT.pause.title,
        items: [{ label: TEXT.pause.resume, select: resume }, { label: TEXT.pause.restart, select: restart }, { label: TEXT.menu.quit, select: quit }],
        back: resume,
      };
    case 'over': {
      const g = game;
      const lines = [TEXT.over.score(g.score.toLocaleString('en-US')), TEXT.over.stats(g.lines, g.level, g.blocks)];
      if (lastRun?.improved) lines.push(TEXT.over.best);
      lines.push(TEXT.wallet.earned(formatCr(runEarned)));
      const status = submitStatus();
      if (status) lines.push(status);
      return {
        title: TEXT.over.title,
        lines,
        items: [{ label: TEXT.over.again, select: restart }, { label: TEXT.board.open, select: () => openBoards('over') }, { label: TEXT.over.toTitle, select: quit }],
        back: quit,
      };
    }
    case 'initials': {
      const e = runBoard?.entry;
      if (!e) return null;
      // Every slot is three characters wide, so the row never shifts as the editing cursor comes and goes
      const glyphs = e.glyphs.map((g, i) => (e.editing && i === e.cursor ? `[**${g}**]` : ` ${g} `)).join('');
      const hint = e.editing ? TEXT.board.hintEdit : TEXT.board.hintBrowse;
      // The arrow rows are tap targets only, so keys and pads browse just the glyphs, SUBMIT, and ANONYMOUS
      return {
        lines: [TEXT.board.initials],
        items: [
          { label: TEXT.board.up, say: TEXT.say.glyphUp, nav: false, select: () => stepGlyph(1) },
          {
            label: glyphs,
            staryllic: 0,
            say: e.editing ? TEXT.say.initialsEdit(e.glyphs, e.cursor + 1) : TEXT.say.initials(e.glyphs),
            tap: (f) => editGlyphs(Math.min(2, Math.floor(f * 3))),
            select: () => (e.editing ? finishGlyphs() : editGlyphs(0)),
          },
          { label: TEXT.board.down, say: TEXT.say.glyphDown, nav: false, select: () => stepGlyph(-1) },
          { label: TEXT.board.submit, select: submitInitials },
          { label: TEXT.board.skip, select: skipInitials },
        ],
        hint: usingPad ? hint.pad : usingTouch ? hint.touch : hint.keys,
        hintBreak: true,
        // The browse hint is about the glyphs, so it dims while SUBMIT I.D. or REMAIN ANONYMOUS is lit
        hintRow: e.editing ? undefined : GLYPH_ROW,
        back: () => (e.editing ? stopEditing() : skipInitials()),
      };
    }
    case 'board': {
      const s = boardState;
      const board = currentBoard();
      const width = rowChars();
      const lines = boards.status === 'loading' ? [TEXT.board.loading]
        : boards.status === 'error' ? [TEXT.board.offline]
        : !boards.rows.length ? [TEXT.board.empty]
        : boards.rows.map((r, i) => (isMine(r) ? `**${formatRow(board, r, i + 1, width)}**` : formatRow(board, r, i + 1, width)));
      const families = Object.keys(FAMILIES);
      const cycle = (d) => { s.family = families[(families.indexOf(s.family) + d + families.length) % families.length]; loadBoard(); };
      const flipRotation = () => { s.modern = !s.modern; loadBoard(); };
      const stepBand = (d) => { s.band = (s.band + d + BANDS.length) % BANDS.length; loadBoard(); };
      const flipPeriod = () => { s.monthly = !s.monthly; loadBoard(); };
      const items = [{ label: TEXT.board.mode, value: plain(FAMILIES[s.family].name), adjustable: true, adjust: cycle, select: () => cycle(1) }];
      if (VARIANTS[s.family]) items.push({ label: TEXT.setup.rotation, value: s.modern ? TEXT.setup.modernValue : TEXT.setup.classicValue, adjustable: true, adjust: flipRotation, select: flipRotation });
      if (s.family === 'practice') items.push({ label: TEXT.board.levels, value: TEXT.board.band(...BANDS[s.band]), adjustable: true, adjust: stepBand, select: () => stepBand(1) });
      // The row names the other timeframe, like a tab; the title names the one on screen
      items.push({ label: s.monthly ? TEXT.board.allTime : TEXT.board.monthly, adjust: flipPeriod, select: flipPeriod });
      items.push({ label: TEXT.setup.back, select: closeBoards });
      // Initials and scores must read exactly, so the board rows never glitch
      return { title: s.monthly ? TEXT.board.monthly : TEXT.board.allTime, lines, lineStaryllic: 0, items, back: closeBoards };
    }
    default:
      return null;
  }
}

function refreshMenu() {
  menuModel = buildMenu();
  // A screen whose rows come and go (the rankings) must never leave the selection past its last row
  if (menuModel) selected = Math.min(selected, menuModel.items.length - 1);
  invalidate();
}

function toggleGhost() {
  data.settings.ghost = !data.settings.ghost;
  renderer.showGhost = data.settings.ghost;
  saveData(data);
  refreshMenu();
  announce(TEXT.say.ghost(data.settings.ghost));
}

function themeList() {
  return data.settings.customColors ? [...PRESETS, customTheme(data.settings.customColors)] : PRESETS;
}

/** The page around the canvas (letterbox, focus ring, paint shop) wears the theme too. */
function paintPage(theme) {
  const root = document.documentElement.style;
  root.setProperty('--void', theme.background);
  root.setProperty('--phosphor', theme.frame);
  root.setProperty('--text', theme.text);
}

/** Free themes say they're standard issue, bought ones say owned, and locked ones show their price. */
function themeStatus(theme) {
  if (!ownsTheme(wallet, theme)) return theme.sponsored ? TEXT.themes.sponsored(theme.price) : theme.price;
  return theme.kcr === 0 && theme.id !== 'custom' ? TEXT.themes.standardPrice : TEXT.wallet.owned;
}

/** Puts a theme on screen without saving it, so locked themes and unpaid paint jobs can be previewed. */
function showTheme(theme) {
  renderer.setTheme(theme);
  paintPage(theme);
  refreshMenu();
  syncOcean();
}

/** The theme the player has applied, whatever the picker is previewing. */
const appliedTheme = () => themeById(data.settings.theme, data.settings.customColors);

/** Previews a theme in the picker without applying it. */
function browseTheme(theme) {
  showTheme(theme);
  announce(TEXT.say.theme(theme.name, themeStatus(theme)));
}

/** Makes an owned theme the player's own. */
function applyTheme(theme) {
  if (!ownsTheme(wallet, theme)) return;
  data.settings.theme = theme.id;
  saveData(data);
  refreshMenu();
  announce(TEXT.say.themeApplied(theme.name));
}

/** Leaving the picker without choosing goes back to the applied theme. */
function restoreAppliedTheme() {
  if (renderer.theme.id !== data.settings.theme) showTheme(appliedTheme());
}

// Spending happens under the cross-tab wallet lock, after pulling in whatever another tab spent or earned
async function purchase(theme) {
  const bought = await withWallet(() => {
    syncData(data);
    if (!buyTheme(wallet, theme)) return false;
    data.settings.theme = theme.id;
    saveData(data);
    return true;
  });
  // A bought theme with an ambience starts its preview at once
  syncAmbience();
  if (screen !== 'buy') return refreshMenu();
  if (!bought) return go('themes', 1);
  go('themes', 0);
  announce(TEXT.say.bought(theme.name, formatCr(wallet.cr)));
}

// The paint job only previews while the shop is open; it is saved once Finished pays for its new colors
function openCustomizer() {
  const before = renderer.theme;
  const initial = zoneColorsOf(before);
  const preview = (colors) => showTheme(customTheme(colors));
  preview(initial);
  openPaintShop({
    initial,
    quote: (colors) => {
      const q = paintQuote(wallet, colors);
      return { ...q, text: TEXT.wallet.newPrice(formatCr(q.cr), q.fresh.length), balance: TEXT.wallet.balance(formatCr(wallet.cr)) };
    },
    onChange: preview,
    onFinish: (colors) => withWallet(() => {
      syncData(data);
      if (!buyPaint(wallet, colors)) return false;
      data.settings.customColors = colors;
      data.settings.theme = 'custom';
      saveData(data);
      showTheme(customTheme(colors));
      return true;
    }),
    onCancel: () => showTheme(before),
    onClose: () => { canvas.focus({ preventScroll: true }); refreshMenu(); },
  });
}

function toggleSfx() {
  data.settings.sfx = !data.settings.sfx;
  sound.setEnabled(data.settings.sfx);
  syncOcean();
  saveData(data);
  refreshMenu();
  announce(TEXT.say.sfx(data.settings.sfx));
}

function setMusic(volume) {
  const next = Math.min(MAX_VOLUME, Math.max(0, volume));
  if (next === data.settings.music) return;
  data.settings.music = next;
  music.setVolume(next);
  syncOcean();
  saveData(data);
  refreshMenu();
  announce(TEXT.say.music(next));
}

function pickTune(t) {
  if (!ownsTune(wallet, t)) return;
  data.settings.tune = t.id;
  data.settings.shuffle = false;
  saveData(data);
  // The pick keeps playing until the player leaves Tune Select
  if (previewing !== t.id) previewTune(t);
  refreshMenu();
  announce(TEXT.say.tune(spoken(t.name)));
}

/** Plays a highlighted tune from the top. Menus are otherwise silent, so the preview starts the music itself. */
function previewTune(t) {
  if (previewing === t.id) return;
  previewing = t.id;
  music.setBundle(t.bundle);
  music.setLevel(t.homeLevel);
  music.play();
}

/** Back to the player's own tune, silent until the screen after Tune Select brings the menu tune back. */
function endPreview() {
  if (!previewing) return;
  previewing = null;
  music.stop();
  music.setBundle(tune().bundle);
  music.setLevel(tune().homeLevel);
}

// The same wallet lock and sync as a theme purchase; a bought tune becomes the selected one
async function purchaseTune(t) {
  await withWallet(() => {
    syncData(data);
    // Another tab may have bought it meanwhile; either way it's this player's pick now
    if (!ownsTune(wallet, t) && !buyTune(wallet, t)) return false;
    data.settings.tune = t.id;
    saveData(data);
    return true;
  });
  // A tune just bought plays first, then the shuffle carries on from it
  shuffleHeld = true;
  if (data.settings.shuffle) learnTuneKeys();
  if (screen !== 'buyTune') return refreshMenu();
  go('tunes', TUNES.indexOf(t) + 1);
  // A failed buy can mean another tab already bought it, which is no reason to say the credits fell short
  announce(ownsTune(wallet, t) ? TEXT.say.bought(spoken(t.name), formatCr(wallet.cr)) : TEXT.wallet.broke);
}

function toggleShuffle() {
  data.settings.shuffle = !data.settings.shuffle;
  shuffleHeld = true;
  saveData(data);
  if (data.settings.shuffle) learnTuneKeys();
  refreshMenu();
  announce(TEXT.say.shuffle(data.settings.shuffle));
}

/** Reads each owned tune's bundle once for its home key; until a key is known, that song keeps its list place. */
async function learnTuneKeys() {
  for (const t of TUNES) {
    if (tuneKeys.has(t.id) || !ownsTune(wallet, t)) continue;
    // Claimed while in flight; a failed fetch lets go, so the next run tries again
    tuneKeys.set(t.id, null);
    try {
      const response = await fetch(new URL(t.bundle, GAME_ROOT));
      if (!response.ok) throw new Error(`bundle answered ${response.status}`);
      tuneKeys.set(t.id, analyzeSong(await response.json()).key);
    } catch {
      tuneKeys.delete(t.id);
    }
  }
}

/** Moves to the next owned tune around the circle of fifths, carrying the run's tempo level over. */
async function shuffleStep(instant = false) {
  if (shuffleLoading || music.isTransitioning()) return;
  const owned = TUNES.filter((t) => ownsTune(wallet, t)).map((t) => ({ id: t.id, key: tuneKeys.get(t.id) ?? null }));
  const order = circleOrder(owned, tune().id);
  const next = TUNES.find((t) => t.id === order[1]);
  if (!next) return;
  const level = game && setup.family === 'marathon' ? game.level : next.homeLevel;
  if (instant) {
    data.settings.tune = next.id;
    saveData(data);
    music.setBundle(next.bundle);
    music.setLevel(level);
    shufflePhase = null;
    return;
  }
  shuffleLoading = true;
  const started = await music.transitionTo(next.bundle, level, { fadeSeconds: SHUFFLE_FADE_SECONDS, gapMs: SHUFFLE_GAP_MS });
  shuffleLoading = false;
  if (!started) return;
  data.settings.tune = next.id;
  saveData(data);
  shufflePhase = null;
}

// Fade at the loop boundary when timing is available; phase-drop detection catches songs the player cannot time.
function watchShuffle() {
  if (!data.settings.shuffle || screen !== 'playing' || !game || game.gameOver) {
    shufflePhase = null;
    shuffleTried = false;
    return;
  }
  const phase = music.songPhase();
  const remaining = music.songSecondsRemaining();
  const wrapped = phase !== null && shufflePhase !== null && phase + 0.5 < shufflePhase;
  if (remaining !== null && remaining > SHUFFLE_FADE_SECONDS) shuffleTried = false;
  if (!music.isTransitioning() && !shuffleLoading && !shuffleTried && (wrapped || (remaining !== null && remaining <= SHUFFLE_FADE_SECONDS + SHUFFLE_LOOKAHEAD_SECONDS))) {
    shuffleTried = true;
    shuffleStep();
  }
  shufflePhase = phase;
}

function toggleFps() {
  data.settings.fps = !data.settings.fps;
  saveData(data);
  refreshMenu();
  announce(TEXT.say.fps(data.settings.fps));
}

/** The CRT look (scanlines, flicker, vignette, color fringing, curved glass) lives in CSS on the page. */
function applyTube() {
  document.body.classList.toggle('tube-off', !data.settings.tube);
}

function toggleTube() {
  data.settings.tube = !data.settings.tube;
  applyTube();
  saveData(data);
  refreshMenu();
  announce(TEXT.say.tube(data.settings.tube));
}

/** Phones and tablets only: a desktop has its own fullscreen key, and an iPhone has no fullscreen for pages. */
function canFullscreen() {
  return !!document.fullscreenEnabled && coarsePointer.matches;
}

/** Chrome on Android holds a page to 60 Hz between touches unless it's fullscreen with a canvas inside. The request
 *  needs the tap or key that led here, so a pad press leaves the page as it is. */
function enterFullscreen() {
  if (!data.settings.fullscreen || !canFullscreen() || document.fullscreenElement) return;
  document.documentElement.requestFullscreen({ navigationUI: 'hide' }).catch(() => {});
}

function toggleFullscreen() {
  data.settings.fullscreen = !data.settings.fullscreen;
  if (data.settings.fullscreen) enterFullscreen();
  else if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  saveData(data);
  refreshMenu();
  announce(TEXT.say.fullscreen(data.settings.fullscreen));
}

function toggleRotation() {
  const v = VARIANTS[setup.family];
  setup.rotation[setup.family] = isModern() ? v.classic : v.modern;
  setLevel(setup.level);
  announce(TEXT.say.rotation(isModern()));
}

function setLevel(level) {
  const max = maxStartLevel(data, modeId());
  setup.level = Math.min(max, Math.max(0, level));
  refreshMenu();
  announce(TEXT.say.startLevel(setup.level));
}

function openSetup(family) {
  setup.family = family;
  setup.level = Math.min(data.last.levels[modeId()] ?? 0, maxStartLevel(data, modeId()));
  go('setup', 0);
}

// Game lifecycle

function startGame() {
  const mode = modeId();
  data.last.mode = mode;
  if (setup.family === 'marathon') data.last.marathonRotation = mode;
  if (setup.family === 'practice') data.last.practiceRotation = mode;
  data.last.levels[mode] = setup.level;
  saveData(data);
  const seed = crypto.getRandomValues(new Int32Array(1))[0];
  clearRun();
  const next = new Game({ mode, startLevel: setup.level, seed, best: bestFor(data, mode, setup.level) });
  begin(next);
}

/** Picks a saved run back up behind the same Go prompt a new run gets. */
function resumeSaved(snapshot) {
  let restored;
  try {
    restored = new Game({ snapshot });
  } catch {
    clearRun();
    refreshMenu();
    return;
  }
  setup.family = familyOf(restored.mode.id);
  if (VARIANTS[setup.family]) setup.rotation[setup.family] = restored.mode.id;
  setup.level = restored.startLevel;
  begin(restored);
  runEarned = loadRunEarned();
  bonusAt = loadRunBonus();
}

function begin(next) {
  game = next;
  enterFullscreen();
  if (data.settings.shuffle) learnTuneKeys();
  if (data.settings.shuffle && !shuffleHeld) shuffleStep(true);
  shuffleHeld = false;
  shufflePhase = null;
  shuffleTried = false;
  // The menu tune makes way before the run's start event, since its stop would wipe the dials that event sets
  syncMenuMusic();
  runEarned = 0;
  payLevel = game.level;
  bonusAt = 0;
  bonusSay = null;
  game.on((e) => {
    if (e.type === 'spawn') bonusSay = null;
    music.onGameEvent?.(e, game);
    // The one VIBRATION switch covers phones and gamepads alike
    const buzz = e.type === 'lock' ? 'drop' : e.type === 'clear' ? (e.special ? 'special' : 'clear') : null;
    if (buzz && data.settings.touch.haptics) {
      if (usingTouch) vibrate(VIBRATION_MS[buzz]);
      else if (usingPad) pad.rumble(VIBRATION_MS[buzz], RUMBLE[buzz]);
    }
    // Credits bank the moment lines clear, so quitting or closing the tab never loses them
    if (e.type === 'clear') {
      const cr = payForClear(e, payLevel, game.mode);
      wallet.cr += cr;
      runEarned += cr;
      saveData(data);
    }
    if (e.type === 'callout' && e.kind === 'hundredBlocks' && e.value > bonusAt) payBonus(e);
    if (e.type === 'clear') {
      payLevel = game.level;
      if (diving()) {
        ocean.setLines(game.lines);
        music.setMuffle(diveMuffle());
        music.setDepth(depthFor(game.lines));
      }
    }
    if (e.type === 'gameOver') onGameOver();
    else if (e.type === 'callout' && e.kind === 'level') {
      music.setLevel(musicLevel());
      announce(TEXT.say.level(e.value));
    }
    else if (e.type === 'clear') announce([TEXT.say.clear(e.rows.length, game.score.toLocaleString('en-US')), bonusSay].filter(Boolean).join(' '));
  });
  controls.attach(game);
  keyboard.clear();
  pad.clear();
  renderer.attach(game);
  sound.attach(game);
  // A new or restored run starts its music from the top once Go is pressed. The ambience waits under the Go prompt
  // as on the menus, set first so a restart from the pause menu never opens it up on the way there
  ambience.setMode('menu');
  music.stop();
  music.setLevel(musicLevel());
  // A restored run's dials should already sit at its board under the Go prompt, not wait for the first move
  music.onGameEvent?.({ type: 'start' }, game);
  ocean.stop();
  // Every run starts paused behind a Go prompt, then fades in with the usual resume freeze (GameModel.beginPaused)
  if (!game.paused) game.pause();
  renderer.setPaused(true, { immediately: true });
  accumulator = 0;
  go('ready');
  syncOcean();
}

/** Consistent's flat bonus, banked like line credits. The shell hears each callout before the renderer does, so
 *  `e.sub` is set in time for the renderer to show it under the BLOX line. */
function payBonus(e) {
  const cr = bloxBonus(e, game.mode);
  // A second tab resumed from the same save may already have paid this one
  if (!cr || savedRunBonus(game) >= e.value) return;
  bonusAt = e.value;
  wallet.cr += cr;
  runEarned += cr;
  saveData(data);
  markRunBonus(game, bonusAt, cr);
  const name = TEXT.callout.bonusName();
  e.sub = TEXT.callout.payout(name, formatCr(cr));
  bonusSay = TEXT.say.payout(spoken(name), formatCr(cr));
  announce(bonusSay);
  music.onGameEvent?.({ type: 'payout', cr }, game);
}

function onGameOver() {
  touch.cancel();
  clearRun();
  lastRun = { improved: recordRun(data, game) };
  checkBoard();
  controls.releaseAll();
  music.endRun();
  screen = 'over-wait';
  screenTime = 0;
  syncOcean();
  announce(TEXT.say.over(game.score));
}

// Leaderboard. The network is only touched when a run ends or someone opens the rankings.

let leaderboard = null;
function lb() {
  if (!leaderboard) {
    let storage = {};
    try {
      storage = globalThis.localStorage ?? {};
    } catch {
      // Blocked site data: the client keeps its queue and sign-in in memory for this session
    }
    leaderboard = new Leaderboard({ ...FIREBASE, storage, notice: () => announce(TEXT.say.boardDropped) });
  }
  return leaderboard;
}

const boards = new BoardView({ top: (board, opts) => lb().top(board, opts) }, {
  onChange: () => {
    if (screen !== 'board') return;
    refreshMenu();
    announceBoard();
  },
});

/** Sends whatever earlier runs left queued (offline, or a closed tab mid-send). */
function flushQueue() {
  if (lb().queue.length) lb().flush();
}

/** Starts the top-10 check for the run that just ended, alongside the game-over pause. */
function checkBoard() {
  const run = { board: boardId(game.mode.id, game.startLevel), score: game.score, lines: game.lines, blocks: game.blocks, startLevel: game.startLevel, playMs: Math.round((game.tick * 1000) / 120) };
  const r = { run, verdict: undefined, entry: null, outcome: null, id: null };
  runBoard = r;
  if (!eligible(run)) {
    r.verdict = 'no';
    return;
  }
  flushQueue();
  within(lb().placings(run.board, run), CHECK_MS, null).then((p) => {
    r.verdict = p ? (p.allTime || p.monthly ? 'yes' : 'no') : 'offline';
  });
}

/** After the game-over pause (and the check, or its timeout): the initials screen for a top-10 run, else the card. */
function afterGameOver() {
  const r = runBoard;
  if (r && offerInitials(r.verdict, lastRun?.improved)) {
    r.entry = new InitialsEntry(loadInitials() ?? 'AAA');
    go('initials', 1);
    // Players are often still hammering hard drop as they top out; that Space must not file AAA
    confirmHold = CONFIRM_HOLD;
  } else go('over');
}

// Row order in buildMenu's initials screen: ↑, the glyphs, ↓, SUBMIT I.D., REMAIN ANONYMOUS
const GLYPH_ROW = 1;
const SUBMIT_ROW = 3;

/** Starts editing (at `slot`, or wherever the cursor is) with the glyph row lit; true when it was browsing before. */
function startEditing(e, slot) {
  const entered = !e.editing;
  e.edit(slot);
  selected = GLYPH_ROW;
  return entered;
}

function glyphChanged(slot, entered = false) {
  const e = runBoard.entry;
  refreshMenu();
  // Entering editing says so, glyphs included; after that each change reads just the one glyph
  announce(entered ? rowLabel(menuModel.items[GLYPH_ROW]) : TEXT.say.glyph(e.glyphs[slot], slot + 1));
}

/** Edits from a slot: confirm on the glyph row starts at the first, a tap on a glyph starts on that one. */
function editGlyphs(slot) {
  const e = runBoard?.entry;
  if (!e) return;
  const entered = startEditing(e, slot);
  glyphChanged(e.cursor, entered);
}

// The ↑ and ↓ rows edit too, so a tap on one from browsing starts editing on the cursor's glyph
function stepGlyph(d) {
  const e = runBoard?.entry;
  if (!e) return;
  const entered = startEditing(e);
  e.step(d);
  glyphChanged(e.cursor, entered);
}

function moveGlyph(d) {
  const e = runBoard?.entry;
  if (!e?.editing) return;
  e.move(d);
  glyphChanged(e.cursor);
}

/** A typed letter or digit fills the slot under the cursor and moves on, starting from the first slot when it begins
 *  the editing; false when the key isn't a glyph. */
function typeGlyph(key) {
  const e = runBoard?.entry;
  if (!e) return false;
  const entered = startEditing(e, e.editing ? e.cursor : 0);
  const slot = e.cursor;
  if (!e.type(key)) {
    if (entered) e.done();
    return false;
  }
  glyphChanged(slot, entered);
  return true;
}

/** Confirm while editing: the name is set and SUBMIT I.D. lit, so a second confirm files it. */
function finishGlyphs() {
  const e = runBoard?.entry;
  if (!e) return;
  e.done();
  selected = SUBMIT_ROW;
  refreshMenu();
  announce(`${TEXT.say.initialsDone(e.glyphs)} ${rowLabel(menuModel.items[SUBMIT_ROW])}`);
}

/** Back while editing only stops editing, keeping the glyphs; a second back leaves the screen. */
function stopEditing() {
  const e = runBoard?.entry;
  if (!e) return;
  e.done();
  selected = GLYPH_ROW;
  refreshMenu();
  announce(rowLabel(menuModel.items[GLYPH_ROW]));
}

// One submission per run: the outcome is set before anything awaits, so a second confirm finds it taken
function submitInitials() {
  const r = runBoard;
  if (screen !== 'initials' || !r?.entry || r.outcome) return;
  const initials = r.entry.text;
  saveInitials(initials);
  r.outcome = 'sending';
  const sending = lb().submit({ ...r.run, initials });
  const settle = (result) => {
    r.outcome = submitOutcome(result);
    if (result?.id) r.id = result.id;
    boards.invalidate(r.run.board);
    if (runBoard === r && screen === 'over') {
      refreshMenu();
      announce(spoken(submitStatus()));
    }
  };
  within(sending, SUBMIT_MS, null).then(settle);
  // A submit slower than the timeout can still land, and the card catches up when it does
  sending.then((result) => { if (r.outcome === 'offline' && submitOutcome(result) !== 'offline') settle(result); }, () => {});
  go('over');
  // A double tap on SUBMIT must not land on the card's first row and restart
  confirmHold = CONFIRM_HOLD;
}

// Leaving mid-entry would lose the run's place on the board, so the browser asks first
window.addEventListener('beforeunload', (e) => {
  if (screen !== 'initials') return;
  e.preventDefault();
  e.returnValue = '';
});

function skipInitials() {
  if (screen !== 'initials') return;
  go('over');
  confirmHold = CONFIRM_HOLD;
}

/** The game-over card's line about this run's submission, or null when nothing was submitted. */
function submitStatus() {
  return { sending: TEXT.board.loading, sent: TEXT.board.sent, waiting: TEXT.board.queued, offline: TEXT.board.offline }[runBoard?.outcome] ?? null;
}

function currentBoard() {
  const s = boardState;
  if (s.family === 'retro') return 'retro';
  return boardId(VARIANTS[s.family][s.modern ? 'modern' : 'classic'], BANDS[s.band][0]);
}

const bandOf = (level) => Math.max(0, BANDS.findIndex(([lo, hi]) => level >= lo && level <= hi));

/** How many characters a board row gets: the menu's text width in the monospace font, less one for safety. Never
 *  below 13, the longest legal row once the rank drops (`SAM.1,000,000`, the blocks cap). */
function rowChars() {
  return Math.max(13, Math.floor((renderer.menuWidth() - renderer.layout.unit * 3) / renderer.measure('0')) - 1);
}

const isMine = (row) => (!!row.uid && row.uid === lb().uid) || (!!runBoard?.id && row.id === runBoard.id);

/** Opens the rankings on the board the player was last looking at: the finished run's, or the mode set up last. */
function openBoards(from) {
  const s = boardState;
  const fromRun = from === 'over' && game;
  const mode = fromRun ? game.mode.id : modeId();
  s.from = from;
  s.monthly = false;
  s.family = familyOf(mode);
  s.modern = mode.endsWith('Modern');
  s.band = bandOf(fromRun ? game.startLevel : setup.level);
  flushQueue();
  go('board', 0);
  loadBoard();
}

function loadBoard() {
  boards.open(currentBoard(), boardState.monthly);
}

function closeBoards() {
  boards.close();
  go(boardState.from === 'over' && game?.gameOver ? 'over' : 'title', TEXT.board.open);
}

/** The rankings read aloud as rank, initials, and score (or blox), never the dot runs. */
function announceBoard() {
  const s = boardState;
  const board = currentBoard();
  const name = [plain(FAMILIES[s.family].name), VARIANTS[s.family] && (s.modern ? TEXT.setup.modernValue : TEXT.setup.classicValue), s.family === 'practice' && `${TEXT.board.levels} ${TEXT.board.band(...BANDS[s.band])}`];
  const parts = [spoken(plain(menuModel.title)), name.filter(Boolean).map(spoken).join(', ')];
  if (boards.status === 'loading') parts.push(TEXT.say.boardLoading);
  else if (boards.status === 'error') parts.push(spoken(TEXT.board.offline));
  else if (!boards.rows.length) parts.push(spoken(TEXT.board.empty));
  else {
    boards.rows.forEach((r, i) => {
      const line = TEXT.say.boardRow(i + 1, [...r.initials], rankedValue(board, r).toLocaleString('en-US'), isPracticeBoard(board));
      parts.push(isMine(r) ? `${line}, ${TEXT.say.boardMine}` : line);
    });
  }
  announce(parts.join('. '));
}

/** Lets go of every held control; used when the page loses focus and key releases can no longer arrive. */
function releaseInputs() {
  controls.releaseAll();
  keyboard.clear();
  pad.clear();
}

// An explicit pause keeps held keys held, as Lightblocks does; releases made while paused still go through
function pause() {
  if (screen !== 'playing') return;
  sound.ui('pause');
  music.hush();
  game.pause();
  saveRun(game, runEarned, bonusAt);
  renderer.setPaused(true);
  go('paused');
  syncOcean();
}

function resume() {
  const starting = screen === 'ready';
  music.setLevel(musicLevel());
  music.play();
  // After play(), so the Go jingle already hears the song's opening key
  sound.ui('go');
  game.resume();
  renderer.setPaused(false);
  go('playing');
  syncOcean();
  if (starting) renderer.announceZone();
  announce(starting ? TEXT.say.start(spoken(plain(FAMILIES[setup.family].name)), setup.level) : TEXT.say.resumed);
}

/** The Osminok Ocean dive plays under a run while that theme is on; everything else silences it. */
const diving = () => !!game && renderer.theme.id === OCEAN_THEME_ID && ownsTheme(wallet, renderer.theme);

// The music sinks with the dive: open above water, faint from the plunge, deep under water by the Unknowable Deep
const diveMuffle = () => Math.sqrt(Math.min(1, Math.max(0, depthFor(game.lines) - PLUNGE_DEPTH) / (DIVE_ZONES.at(-1).from - PLUNGE_DEPTH)));

/** An owned theme's ambient loop, following the SFX setting: half-muffled on the menus and the Go prompt as a
 *  preview, then in a run it copies the music's treatments (so the over, initials, and rankings screens stay quiet). */
function syncAmbience() {
  ambience.setSpec(ownsTheme(wallet, renderer.theme) ? renderer.theme.ambience : null);
  ambience.setEnabled(data.settings.sfx);
  ambience.setDucked(data.settings.music > 0 && !!music.player);
  ambience.setMode(game && screen !== 'ready' ? 'run' : 'menu');
}

function syncOcean() {
  syncAmbience();
  if (!diving()) {
    ocean.stop();
    music.setMuffle(0);
    music.setDepth(0);
    return;
  }
  music.setMuffle(diveMuffle());
  music.setDepth(depthFor(game.lines));
  ocean.setLines(game.lines);
  ocean.setDucked(data.settings.music > 0 && !!music.player);
  ocean.setEnabled(data.settings.sfx);
  if (game.gameOver) ocean.gameOver();
  else if (screen === 'playing') ocean.play();
  else ocean.pause();
}

function loseFocus() {
  if (!game) return;
  touch.cancel();
  releaseInputs();
  pause();
  if (!game.gameOver) saveRun(game, runEarned, bonusAt);
}

function restart() {
  if (game && !game.gameOver) recordRun(data, game);
  startGame();
}

// Quitting abandons the run; only pausing, hiding the tab, or closing the page keeps it resumable
function quit() {
  if (game && !game.gameOver) recordRun(data, game);
  clearRun();
  game = null;
  controls.attach(null);
  renderer.detach();
  sound.detach();
  // The ambience goes back to its menu preview before the stop, so it never opens up on the way
  syncOcean();
  music.stop();
  go('title', titleIndex(setup.family));
}

// Input

function onControl({ game: action, menu, down, toggle }) {
  if (toggle === 'fps') { if (down) toggleFps(); return; }
  if (screen === 'playing') {
    if (action === 'pause') { if (down) pause(); return; }
    if (action) controls.handle(action, down);
    return;
  }
  if (screen === 'paused' || screen === 'ready') {
    // The pause control toggles, so Start or P never doubles as confirming a menu row
    if (action === 'pause') { if (down) resume(); return; }
    if (!down && HELD_ACTIONS.has(action)) controls.handle(action, false);
  }
  if (!down || !menuModel) return;
  // Editing initials claims the arrows (up and down change the glyph, left and right move); confirm and back go
  // through the rows below as usual, so the confirm hold still guards the press that starts editing
  if (screen === 'initials' && runBoard?.entry?.editing) {
    if (menu === 'up' || menu === 'down') { sound.ui('move'); stepGlyph(menu === 'up' ? 1 : -1); return; }
    if (menu === 'left' || menu === 'right') { sound.ui('move'); moveGlyph(menu === 'left' ? -1 : 1); return; }
  }
  if (menu === 'controls') {
    if (screen === 'title') { sound.ui('confirm'); openControls(); }
    else if (screen === 'controls') { sound.ui('back'); closeControls(); }
    return;
  }
  const items = menuModel.items;
  switch (menu) {
    case 'up': sound.ui('move'); select(nextRow(-1)); break;
    case 'down': sound.ui('move'); select(nextRow(1)); break;
    case 'left':
    case 'right':
      if (items[selected]?.adjust) { sound.ui('move'); items[selected].adjust(menu === 'left' ? -1 : 1); }
      break;
    case 'confirm': if (screenTime >= confirmHold) { sound.ui('confirm'); items[selected]?.select?.(); } break;
    case 'back': if (menuModel.back) { sound.ui('back'); menuModel.back(); } break;
  }
}

// The pad's controls, opened with Select from the title; going back lands on the row it was opened from
let controlsFrom = 0;
function openControls() {
  controlsFrom = selected;
  go('controls');
}
function closeControls() {
  go('title', controlsFrom);
}

/** The next row up or down, wrapping, past rows marked `nav: false`. */
function nextRow(d) {
  const items = menuModel.items;
  let i = selected;
  for (let n = 0; n < items.length; n++) {
    i = (i + d + items.length) % items.length;
    if (items[i].nav !== false) return i;
  }
  return selected;
}

function select(i, follow = true) {
  selected = i;
  menuFollow = follow;
  invalidate();
  const item = menuModel.items[i];
  announce(item.value !== undefined ? `${rowLabel(item)}, ${spoken(String(item.value))}` : rowLabel(item));
  item.focus?.();
}

function toCanvas(e) {
  const r = canvas.getBoundingClientRect();
  return [(e.clientX - r.left) * (canvas.width / r.width), (e.clientY - r.top) * (canvas.height / r.height)];
}

function hit(e) {
  const [x, y] = toCanvas(e);
  // Rows scrolled out of a tall menu's visible band can't be tapped through the art around it
  const band = renderer.lastMenu;
  if (band && (y < band.top || y > band.bottom)) return -1;
  return hitBoxes.findIndex((b) => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h);
}

const scrollable = () => menuModel && screen !== 'playing' && renderer.lastMenu?.maxScroll > 0;

canvas.addEventListener('pointerdown', (e) => {
  if (!scrollable()) return;
  drag = { y: toCanvas(e)[1], scroll: menuScroll, moved: false };
});

window.addEventListener('pointerup', () => {
  // A drag that scrolled shouldn't also count as a tap on whatever row it ended over
  if (drag?.moved) swallowClick = true;
  drag = null;
});

canvas.addEventListener('wheel', (e) => {
  if (!scrollable()) return;
  e.preventDefault();
  menuScroll += e.deltaY * (e.deltaMode === 1 ? renderer.layout.unit * 2.4 : renderer.layout.dpr);
  menuFollow = false;
  invalidate();
}, { passive: false });

canvas.addEventListener('pointermove', (e) => {
  if (drag) {
    const dy = toCanvas(e)[1] - drag.y;
    if (Math.abs(dy) > 8 * renderer.layout.dpr) drag.moved = true;
    if (drag.moved) {
      menuScroll = drag.scroll - dy;
      menuFollow = false;
      invalidate();
      return;
    }
  }
  // The initials screen's selection moves only by keys, pads, and taps, so the mouse can't pull it off the glyphs mid-edit
  if (!menuModel || e.pointerType !== 'mouse' || screen === 'initials') return;
  const i = hit(e);
  if (i >= 0 && i !== selected) select(i, false);
});

canvas.addEventListener('click', (e) => {
  canvas.focus({ preventScroll: true });
  if (swallowClick) {
    swallowClick = false;
    return;
  }
  if (screen === 'title' && lastMark) {
    const [x, y] = toCanvas(e);
    if (x >= lastMark.left && x <= lastMark.right && y >= lastMark.top && y <= lastMark.bottom) {
      wordmarkPulse = { col: (x - lastMark.left) / lastMark.cell, row: (y - lastMark.top) / lastMark.cell, at: screenTime };
      invalidate();
      return;
    }
  }
  if (!menuModel) return;
  const i = hit(e);
  if (i < 0 || screenTime < confirmHold) return;
  const item = menuModel.items[i];
  if (item.tap) {
    const [x] = toCanvas(e);
    sound.ui('move');
    return item.tap((x - hitBoxes[i].x) / hitBoxes[i].w);
  }
  if (screen !== 'initials') selected = i;
  invalidate();
  // Clicking an arrow, or the left or right third of an adjustable row, steps its value instead of selecting it
  if (item.adjust) {
    const [x] = toCanvas(e);
    const b = hitBoxes[i];
    const on = (span) => span && x >= span[0] && x <= span[1];
    if (on(b.arrows?.left)) return item.adjust(-1);
    if (on(b.arrows?.right)) return item.adjust(1);
    if (x < b.x + b.w / 3) return item.adjust(-1);
    if (x > b.x + (b.w * 2) / 3) return item.adjust(1);
  }
  sound.ui('confirm');
  item.select?.();
});

const holdButtonShown = () => data.settings.touch.holdButton && !!game?.mode.hold;
let usingTouch = false;
const touch = new TouchInput({
  surface: canvas,
  settings: () => data.settings.touch,
  active: () => screen === 'playing',
  control: (action, down) => controls.handle(action, down),
  freeze: (s) => game?.setInputFreeze(s),
  pause: () => pause(),
  changed: invalidate,
  holdHit: (x, y) => {
    // Only the strip actually on screen counts, so a tap can't hold through a button nobody can see
    const r = renderer.holdButton && renderer.holdButtonRect();
    return !!r && x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
  },
});
canvas.addEventListener('pointerdown', (e) => {
  usePad(false);
  const touchLike = e.pointerType !== 'mouse' || data.settings.touch.mouse;
  if (touchLike !== usingTouch) { usingTouch = touchLike; hintChanged(); }
});
window.addEventListener('keydown', () => {
  usePad(false);
  if (usingTouch) { usingTouch = false; hintChanged(); }
}, { capture: true });

// The title's controls hint follows whatever was used last: a pad press shows the button glyphs, keys or a tap don't
let usingPad = false;
function usePad(on) {
  if (on === usingPad) return;
  usingPad = on;
  hintChanged();
}

// The title's and the initials screen's hints follow the input in use
function hintChanged() {
  if (screen === 'title' || screen === 'initials') refreshMenu();
  else invalidate();
}
window.addEventListener('gamepaddisconnected', (e) => {
  const others = [...(navigator.getGamepads?.() ?? [])].filter((p) => p?.connected && p.mapping === 'standard' && p.index !== e.gamepad.index);
  if (!others.length) usePad(false);
});
canvas.addEventListener('contextmenu', (e) => { if (data.settings.touch.mouse) e.preventDefault(); });

// Audio may only start inside a user gesture, and a tap only counts as one when the finger lifts (pointerup or
// touchend), so every gesture event tries; the title's ambience preview may have been refused before, so it retries too
function wakeAudio() {
  sound.unlock();
  ambience.wake();
  ocean.wake();
}
for (const type of ['keydown', 'pointerdown', 'pointerup', 'touchend', 'mousedown']) window.addEventListener(type, wakeAudio, { capture: true });

// Another tab saved: take its credits, purchases, and bests so neither tab's progress erases the other's
window.addEventListener('storage', (e) => {
  if (e.key !== null && e.key !== 'cuckblox') return;
  syncData(data);
  refreshMenu();
  // A theme another tab bought may bring its ambience here too
  syncAmbience();
});

// The initials screen takes typed letters and digits (and Backspace, while editing) as glyphs. KeyboardInput claims only its own keys, so
// these are claimed here, on that screen alone; modifier combos and every other key pass through untouched.
canvas.addEventListener('keydown', (e) => {
  if (screen !== 'initials' || e.ctrlKey || e.metaKey || e.altKey) return;
  const glyph = /^[a-z0-9]$/i.test(e.key);
  if (!glyph && e.key !== 'Backspace') return;
  e.preventDefault();
  e.stopPropagation();
  // Rotate and hold (X, Z, C) are glyphs too, so one still held or hammered from the run must not start typing
  if (e.repeat || screenTime < confirmHold) return;
  if (glyph) {
    sound.ui('move');
    typeGlyph(e.key);
  } else if (runBoard?.entry?.editing) {
    sound.ui('move');
    moveGlyph(-1);
  }
});

canvas.addEventListener('blur', loseFocus);
// A hidden tab pauses the run like any lost focus, and stops the song outright rather than muffling it
document.addEventListener('visibilitychange', () => {
  sound.setHidden(document.hidden);
  ambience.setHidden(document.hidden);
  if (document.hidden) {
    loseFocus();
    music.pause();
  } else if (screen === 'paused') music.hush();
  else if (previewing || menuPlaying) music.play();
});
window.addEventListener('pagehide', () => {
  loseFocus();
  music.pause();
  ambience.setHidden(true);
  sound.setHidden(true);
});
// A page restored from the back-forward cache gets its loop and its audio back
window.addEventListener('pageshow', () => {
  ambience.setHidden(!!document.hidden);
  sound.setHidden(!!document.hidden);
});
new ResizeObserver(() => {
  renderer.resize();
  // Board rows are padded to the panel's width, so they're rebuilt when it changes
  if (screen === 'board') refreshMenu();
  invalidate();
}).observe(canvas);
// A new pixel density (zoom, another monitor, a phone preset) can keep the CSS size, so ResizeObserver never fires
function watchPixelRatio() {
  matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`).addEventListener('change', () => {
    renderer.resize();
    invalidate();
    watchPixelRatio();
  }, { once: true });
}
watchPixelRatio();

// Loop. The canvas is only redrawn when the renderer or the menus changed; most frames of play draw nothing.

let accumulator = 0;
let last = performance.now();
let uiDirty = true;
let titleAnimating = false;
// The title wordmark's last drawn box, for taps, and the glow ring a tap sent out
let lastMark = null;
let wordmarkPulse = null;
// Menus taller than the screen scroll: by keys (following the selection), by dragging, or by the wheel
let menuScroll = 0;
let menuFollow = true;
let drag = null;
let swallowClick = false;
const perf = { frames: 0, draws: 0, drawMs: 0, since: 0, text: '', prev: 0, worst: 0, worsts: [] };

function updateFps(now) {
  perf.frames++;
  if (perf.prev) perf.worst = Math.max(perf.worst, now - perf.prev);
  perf.prev = now;
  if (now - perf.since < 500) return;
  const secs = (now - perf.since) / 1000;
  // LOW is the slowest single frame of the last three seconds, so short hitches show up
  perf.worsts = [...perf.worsts.slice(-5), perf.worst];
  perf.worst = 0;
  const low = Math.round(1000 / Math.max(...perf.worsts, 1));
  const text = `${Math.round(perf.frames / secs)} FPS  LOW ${low}  ${Math.round(perf.draws / secs)} DRAWS  ${(perf.draws ? perf.drawMs / perf.draws : 0).toFixed(1)} MS`;
  Object.assign(perf, { frames: 0, draws: 0, drawMs: 0, since: now });
  if (data.settings.fps && text !== perf.text) invalidate();
  perf.text = text;
}

function frame(now) {
  // Long gaps (hidden tab, stalls) are dropped rather than fast-forwarded
  const raw = now - last;
  const dt = Math.min(MAX_FRAME, Math.max(0, raw / 1000));
  last = now;
  pad.poll();
  watchShuffle();
  if (screen === 'playing') {
    accumulator += dt;
    while (accumulator >= DT && screen === 'playing') {
      game.step();
      accumulator -= DT;
    }
  }
  screenTime += dt;
  // The game-over pause also waits out the top-10 check, which settles or times out within CHECK_MS
  if (screen === 'over-wait' && screenTime >= GAME_OVER_PAUSE && (runBoard?.verdict !== undefined || screenTime >= GAME_OVER_PAUSE + CHECK_MS / 1000)) afterGameOver();

  renderer.update(dt);
  ocean.update(dt);
  ambience.update(dt);
  updateFps(now);
  if (renderer.needsDraw || uiDirty || titleAnimating) {
    const t0 = performance.now();
    drawFrame();
    uiDirty = false;
    perf.draws++;
    perf.drawMs += performance.now() - t0;
  }
  requestAnimationFrame(frame);
}


function drawFrame() {
  renderer.holdButton = screen === 'playing' && usingTouch && holdButtonShown();
  renderer.draw();
  hitBoxes = [];
  titleAnimating = false;
  const L = renderer.layout;
  if (screen === 'title') {
    // The wordmark runs wider than the menu panel and the tagline spans the panel exactly. On short screens the art
    // shrinks and moves up to make room, and if the menu still doesn't fit, it scrolls below the tagline.
    const panel = renderer.menuWidth();
    const pulse = wordmarkPulse && { ...wordmarkPulse, age: screenTime - wordmarkPulse.at };
    if (pulse && pulse.age >= PULSE_LIFE) wordmarkPulse = null;
    const tagSize = renderer.fitSize(TEXT.title.tagline, panel, 4);
    const markWidth = Math.min(L.W * 0.86, panel * 1.6);
    const below = L.unit * 2.8 + renderer.fontPx(tagSize) * 0.8 + renderer.menuHeight(menuModel);
    let cell = renderer.wordmarkCell(markWidth);
    // The art and menu sit as one block, centered with equal room above and below
    let markTop = (L.H - cell * 5 - below) / 2;
    if (markTop < L.unit) {
      cell = renderer.wordmarkCell(markWidth, Math.floor((L.H - L.unit * 2 - below) / 5));
      markTop = L.unit;
    }
    const mark = renderer.drawWordmark(L.W / 2, markTop + cell * 2.5, markWidth, screenTime, wordmarkPulse && pulse, cell);
    lastMark = mark;
    titleAnimating = mark.animating || !!wordmarkPulse;
    const tagBaseline = mark.bottom + L.unit * 1.2 + renderer.fontPx(tagSize) * 0.8;
    const tagSpacing = Math.max(0, (panel - renderer.measure(TEXT.title.tagline, tagSize)) / Math.max(1, [...TEXT.title.tagline].length - 1));
    renderer.text(TEXT.title.tagline, L.W / 2, tagBaseline, { size: tagSize, align: 'center', color: renderer.theme.text, glow: 0.5, spacing: tagSpacing, bold: true });
    hitBoxes = renderer.drawMenu({ ...menuModel, selected, top: tagBaseline + L.unit * 1.6, scroll: menuScroll, follow: menuFollow });
    menuScroll = renderer.lastMenu.scroll;
  } else if (menuModel && screen !== 'playing') {
    hitBoxes = renderer.drawMenu({ ...menuModel, selected, scroll: menuScroll, follow: menuFollow });
    menuScroll = renderer.lastMenu.scroll;
  } else {
    renderer.lastMenu = null;
  }
  if (screen === 'playing') {
    if (touch.panel) renderer.drawTouchPanel(touch.panel);
    if (usingTouch) renderer.drawPauseButton();
    if (renderer.holdButton) renderer.drawHoldButton();
  }
  // The theme picker's swatch animates with wraps that move
  if (screen === 'themes' && renderer.theme.fps && !renderer.reducedMotion) titleAnimating = true;
  // Bottom-left, outlined, so it never sits on the stats
  if (data.settings.fps && perf.text) {
    const look = { color: renderer.theme.dimText, glow: 0, outline: renderer.theme.calloutOutline, staryllic: 0 };
    const y = L.H - L.unit * 0.6;
    renderer.text(perf.text, L.unit * 0.6, y, look);
    // Any ?perf= flags in effect get the line above, so a screenshot says what was tested and portrait still fits it
    if (PERF.label) renderer.text(PERF.label.toUpperCase(), L.unit * 0.6, y - renderer.fontPx(1) * 1.5, look);
  }
  if (sound.blocked && (data.settings.sfx || data.settings.music > 0)) {
    // On its own strip of background, since on a phone it lands across the menu frame
    const w = renderer.measure(TEXT.audioBlocked) + L.unit;
    const h = renderer.fontPx(1) * 1.6;
    const y = L.H - L.unit * 0.6;
    renderer.ctx.fillStyle = renderer.theme.background;
    renderer.ctx.fillRect(Math.round((L.W - w) / 2), Math.round(y - h * 0.8), Math.round(w), Math.round(h));
    renderer.text(TEXT.audioBlocked, L.W / 2, y, { align: 'center', color: renderer.theme.text, glow: 0.4 });
  }
}

async function boot() {
  try {
    await Promise.race([document.fonts.load('22px "Departure Mono"'), new Promise((r) => setTimeout(r, 1500))]);
  } catch {
    // Fall back to the monospace stack
  }
  paintPage(renderer.theme);
  applyTube();
  document.body.classList.toggle('perf-pixelated', PERF.pixelated);
  document.body.classList.toggle('perf-nofringe', PERF.nofringe);
  if (PERF.viewport) showViewportReadout(canvas);
  renderer.resize();
  go('title', Math.max(0, titleIndex(setup.family)));
  // The title previews an owned theme's ambience as soon as the audio context exists
  syncAmbience();
  canvas.focus({ preventScroll: true });
  requestAnimationFrame((t) => { last = t; frame(t); });
  // Audio starts after the first frame so it never delays the picture; the one context carries every sound
  setTimeout(() => sound.load().then(() => {
    // The sound prompt comes and goes with the context
    sound.context?.addEventListener?.('statechange', invalidate);
    ocean.setContext(sound.context);
    ambience.setContext(sound.context);
    syncOcean();
    return music.load(sound.context);
  }).then(syncOcean), 0);
}

boot();
