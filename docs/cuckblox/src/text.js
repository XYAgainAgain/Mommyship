// Every word CUCKBLOX shows or speaks, keyed by stable text IDs. Ezpz replacement! :)
// Menu text marks a forced line break with \n, emphasis with **…**, and a letter-by-letter wave with *…*.

/** Picks a random line each call, never one of the last two shown (or the last one, for a list that short). */
export function rotation(list) {
  const lines = [...new Set(list)];
  if (!lines.length) throw new Error('rotation needs at least one line');
  const recent = [];
  const avoid = Math.min(2, lines.length - 1);
  return () => {
    const pool = lines.filter((l) => !recent.slice(recent.length - avoid).includes(l));
    const pick = pool[Math.floor(Math.random() * pool.length)];
    recent.push(pick);
    if (recent.length > 2) recent.shift();
    return pick;
  };
}

export const TEXT = {
  callout: {
    level: (v) => `LEVEL ${v}`,
    tenLines: (v) => `${v} LINES`,
    hundredBlocks: (v) => `${v} BLOX`,
    // Consistent's bonus rides under the BLOX callout
    bonusName: rotation(['PERFORMANCE BONUS', 'SHAREHOLDER PAYOUT', 'FAMILY INHERITANCE', 'INSURANCE CLAIM', 'CLERICAL ERROR', 'SEVERANCE ADVANCE', 'DEATH BENEFIT', 'ONE-TIME PAYMENT', 'UNCLAIMED WAGES', 'RETENTION STIPEND', 'GOODWILL GESTURE', 'TAXABLE INCENTIVE', 'SECRET LOTTERY']),
    payout: (name, cr) => `${name} +${cr}`,
    tSpin: () => 'BE CAREFUL!',
    double: rotation(['EFFICIENT', 'ADEQUATE', 'OPTIMAL', 'PRODUCTIVE', 'COMPLIANT', 'SATISFACTORY', 'ON SCHEDULE', 'WITHIN NORMS', 'AS EXPECTED', 'THAT WILL DO', 'NO LOLLYGAGGING']),
    combo: (v) => `*CUCKOMBO ${v}*`,
    newBest: () => 'SO YOU **CAN** WORK HARDER',
  },
  // Shown while the browser holds sound back; a gamepad press can't release it
  audioBlocked: 'TAP OR PRESS A KEY FOR SOUND',
  title: {
    wordmark: 'CUCKBLOX',
    tagline: 'C.U.C.K. RECREATION TERMINAL',
    resume: (mode) => `CONTINUE ${mode}?`,
    ghost: 'HOLO PIECE',
    sfx: 'SFX VOL',
    music: 'MUSIC VOL',
    tune: 'TUNE SELECT',
    touch: 'TOUCH CONTROLS',
    theme: 'TERMINAL CUSTOMIZATION',
    fps: 'SHOW FPS',
    on: 'ON',
    off: 'OFF',
    hint: '←↓↑→ ZX = move/rotate\nSPACE = drop\nC SHIFT = hold\nESC P = pause',
    // {name} draws that controller button's glyph, two characters wide
    padHint: '{dpad} = move | {menu} = pause\n{lt}{rt} {a}{b} = spin\n{lb} {dpad}↑ = drop\n{rb}{y} = hold',
    tube: 'TUBE FX',
    fullscreen: 'FULLSCREEN',
  },
  tunes: {
    title: 'TUNE SELECT',
    current: (name) => `NOW PLAYING: ${name}`,
    korobeiniki: 'KOROBEINIKI',
    volgaBoatmen: 'VOLGA SPACEMEN',
    minuetTypeC: 'MINUET (TYPE C)',
    anthem: 'ANTHEM PART ONE & TWO',
    neverGonna: 'NEVER GONNA GIVE YOU UP',
    kalinka: 'KALINKA',
    internationale: 'THE INTERNATIONALE',
    caramelldansen: 'CARAMELLDANSEN',
    finallyLanding: "WE'RE FINALLY LANDING",
    downUnder: 'DOWN UNDER',
    theme: 'CUCKBLOX THEME A-SIDE',
    shuffle: 'SHUFFLE ALL OWNED',
  },
  mode: {
    marathon: '**MARATHON**',
    retro: '**MEGA-RETRO**',
    practice: '**CONSISTENT**',
  },
  setup: {
    marathon: 'EVERY 10 LINES, YOUR HARD WORK\nIS REWARDED WITH YET MORE WORK',
    retro: 'UNFORGIVING PRECISION:\nNO HOLD, NO HARD DROP, NO HOLO.',
    practice: 'ONE SPEED. RANKED BY BLOX. VOTED #1 MOST CALMING RECREATION.',
    classic: 'CLASSIC: **HARDSHIP BEGETS STRENGTH.**\nBLOX FIT WHERE THEY FIT\n&\nLAND WHERE THEY LAND.',
    modern: 'MODERN: **ADAPTABILITY BEGETS GROWTH.**\nBLOX CAN ADJUST\n&\nSO CAN YOU.',
    best: (v) => `QUOTA REACHED: ${v}`,
    bestBlocks: (v) => `CONSISTENT QUOTA: ${v}`,
    locked: (v) => `LEVELS ${v}–19 WILL BE AVAILABLE AFTER SUFFICIENT MARATHON LABOR`,
    level: 'MINIMUM LEVEL',
    rotation: 'ROTATION',
    classicValue: 'CLASSIC',
    modernValue: 'MODERN',
    start: '*BEGIN RECREATION*',
    back: 'GO BACK',
  },
  ready: {
    classic: (level) => `**HARDSHIP**, LEVEL ${level}`,
    modern: (level) => `**ADAPTATION**, LEVEL ${level}`,
    retro: (level) => `LEVEL ${level}`,
    go: 'RECREATE',
  },
  menu: { quit: 'RETREAT' },
  pause: { title: 'MANDATED BREAK', resume: 'BACK TO IT', restart: 'REDO YOUR LABOR' },
  over: {
    title: 'DO BETTER',
    score: (v) => `SCORE ${v}`,
    stats: (lines, level, blocks) => `LINES ${lines}   LEVEL ${level}   BLOX ${blocks}`,
    best: '**NEW QUOTA FIXED**',
    again: 'CONTINUE LABOR',
    toTitle: 'RETREAT',
  },
  controls: { title: 'CONTROLS' },
  hud: { score: 'SCORE', lines: 'LINES', level: 'LEVEL', blocks: 'BLOX', next: 'NEXT', hold: 'HOLD', depth: 'DEPTH' },
  // Portrait phones swap to these when the full labels would run into each other
  hudShort: { score: 'SCR', lines: 'LNS', level: 'LVL', blocks: 'BLX', depth: 'DEPTH' },
  // Osminok Ocean's dive: zone names in DIVE_ZONES order (zone-entry callouts), the depth readout, and its game over
  osminok: {
    zones: ['THE MEGASTORM', 'TWILIGHT SHELVES', 'MIDNIGHT PLAINS', 'VENT GARDENS', 'CRUSHING DEEP', 'LIVING TRENCHES', 'FORGOTTEN DEPTHS', 'THE UNKNOWABLE DEEP'],
    meters: (v) => `${v} m`,
    km: (v) => `${v} km`,
    kmTight: (v) => `${v}km`,
    deepest: () => '20 KM DOWN',
    lostAt: (v) => `LOST AT ${v} m`,
  },
  themes: {
    title: 'TERMINAL CUSTOMIZATION',
    row: 'THEME',
    of: (i, n) => `${i} OF ${n}`,
    customize: 'CUSTOMIZE COLORS',
    // The applied theme, so backing out of a preview shows what stays
    current: (name) => `CURRENT: ${name}`,
    standardPrice: 'STANDARD ISSUE',
    price: (kcr) => `${kcr}kcr`,
    // Gas-N-Gripe's price line; ~ ~ draws the tag dimmed
    sponsored: (price) => `${price} ~(SPONSORED)~`,
    customPrice: (total, each) => `${total}kcr (${each}kcr PER UNIQUE COLOR)`,
  },
  paint: {
    title: 'CUSTOMIZE TERMINAL',
    hint: 'OBSERVE CHANGES LIVE. ESC SAVES YOUR CREDITS.',
    zones: ['FALLING PIECE', 'SETTLED BLOX', 'WELL & HOLO', 'DISPLAY'],
    fields: ['BLOCK', 'GLOW', 'BLOCK', 'DIM GLOW', 'WELL FRAME', 'HOLO PIECE', 'BACKGROUND TINT', 'TEXT & SCORE'],
    done: 'FINISHED',
    cancel: 'CANCEL',
    trademark: 'RED 7™ IS A TRADEMARK OF REBORN ROBOTICS',
    shade: 'SHADE',
    hue: 'HUE',
    hex: 'HEX',
    stock: 'STOCK PAINTS',
  },
  touch: {
    title: 'TOUCH CONTROLS',
    help: 'TAP TO ROTATE (RIGHT HALF TURNS SPINWARD). DRAG L/R TO SLIDE, DRAG DOWN QUICKLY TO SOFT DROP. TAP THE TOP EDGE TO PAUSE.',
    swipe: 'SWIPE UP',
    swipeValues: { none: 'NOTHING', hardDrop: 'HARD DROP', hold: 'HOLD', pause: 'PAUSE' },
    size: 'TOUCH PAD SIZE',
    invert: 'INVERT TAPS',
    vibration: 'VROOM VROOM',
    buzz: 'GESTURE BUZZ',
    guide: 'VIRTUAL TOUCH PAD',
    holdButton: 'HOLD BUTTON',
    mouse: 'MOUSE = TOUCH',
    on: 'ON',
    off: 'OFF',
  },
  // Credits system
  wallet: {
    balance: (cr) => `BALANCE ${cr}`,
    owned: 'OWNED',
    buy: (price) => `BUY FOR ${price}`,
    short: (price) => `NEED ${price}`,
    buyTitle: 'PURCHASE',
    after: (cr) => `BALANCE AFTER ${cr}`,
    confirm: 'CONFIRM',
    earned: (cr) => `EARNED ${cr}`,
    newPrice: (total, colors) => `PRICE ${total} (${colors} UNIQUE ${colors === 1 ? 'COLOR' : 'COLORS'} AT 25kcr EACH)`,
    broke: 'INSUFFICIENT CREDS',
  },
  // The global leaderboard: initials entry and the board views
  board: {
    initials: '*EXEMPLARY PERFORMANCE.* ENTER 3-GLYPH I.D. TO MOTIVATE OTHERS.',
    offline: 'SUBSPACE COMMS FAILED! RETURN TO C.U.C.K. SPACE TO RECONNECT',
    allTime: 'SINCE CYCLE 0',
    monthly: 'LAST NARGON',
    open: 'PERF. REVIEWS',
    up: '↑',
    down: '↓',
    submit: 'SUBMIT I.D.',
    skip: 'REMAIN ANONYMOUS',
    sent: 'I.D. FILED. OTHERS MOTIVATED.',
    queued: 'I.D. QUEUED FOR TRANSMISSION',
    mode: 'MODE',
    levels: 'LEVELS',
    band: (lo, hi) => `${lo}–${hi}`,
    loading: 'AWAITING SUBSPACE RELAY',
    empty: 'NO LABOR ON FILE',
    // Initials screen hints for browsing the rows and for editing the glyphs, per input; both keep two lines
    hintBrowse: { keys: 'ENTER = EDIT I.D.\nESC = REMAIN ANONYMOUS', pad: '{a} = EDIT I.D.\n{b} = REMAIN ANONYMOUS', touch: 'TAP A GLYPH\nTO EDIT YOUR I.D.' },
    hintEdit: { keys: '↑↓ = GLYPH | ←→ = SLOT\nENTER = DONE', pad: '{dpad} = GLYPH & SLOT\n{a} = DONE | {b} = BACK', touch: 'TAP ↑ ↓ TO CHANGE IT,\nTHEN SUBMIT I.D.' },
  },
  // Spoken only. Menus are read from their on-screen text, except where caps would garble it (SFX, FPS).
  say: {
    start: (mode, level) => `${mode}, level ${level}. Go.`,
    resumed: 'Resumed',
    level: (v) => `Level ${v}`,
    clear: (lines, score) => (lines === 1 ? `1 line. Score ${score}.` : `${lines} lines. Score ${score}.`),
    over: (score) => `Game over. Score ${score}.`,
    ghost: (on) => `Holo piece ${on ? 'on' : 'off'}`,
    sfx: (on) => `Sound effects ${on ? 'on' : 'off'}`,
    music: (volume) => (volume ? `Music volume ${volume}` : 'Music off'),
    tune: (name) => `Now playing ${name}`,
    shuffle: (on) => (on ? 'Shuffle on: owned tunes play in turn around the circle of fifths' : 'Shuffle off'),
    fps: (on) => `FPS counter ${on ? 'on' : 'off'}`,
    sfxLabel: 'Sound effects',
    fpsLabel: 'FPS counter',
    tubeLabel: 'Tube effects',
    tube: (on) => `Tube effects ${on ? 'on' : 'off'}`,
    fullscreen: (on) => `Fullscreen ${on ? 'on' : 'off'}`,
    rotation: (modern) => `Rotation ${modern ? 'Modern' : 'Classic'}`,
    startLevel: (v) => `Start level ${v}`,
    theme: (name, price) => `${name}, ${price}`,
    themeApplied: (name) => `${name} applied`,
    shade: (hex, s, v) => `${hex}, saturation ${s}, brightness ${v}`,
    bought: (name, balance) => `${name} purchased. Balance ${balance}.`,
    payout: (name, cr) => `${name}, plus ${cr}.`,
    tunePreview: (name, price) => `Previewing ${name}, ${price}`,
    // Glyphs are spaced so a reader spells initials out instead of guessing at a word
    initials: (glyphs) => `Initials ${glyphs.join(' ')}. Confirm to edit them.`,
    initialsEdit: (glyphs, slot) => `Editing initials ${glyphs.join(' ')}, glyph ${slot} of 3. Up and down change it, left and right move, confirm when done.`,
    initialsDone: (glyphs) => `Initials ${glyphs.join(' ')} set.`,
    glyph: (glyph, slot) => `${glyph}, glyph ${slot}`,
    glyphUp: 'Next glyph',
    glyphDown: 'Previous glyph',
    boardLoading: 'Loading rankings',
    boardRow: (rank, glyphs, value, blocks) => `${rank}, ${glyphs.join(' ')}, ${value}${blocks ? ' blox' : ''}`,
    boardMine: 'yours',
    boardDropped: 'A queued score was turned down by the leaderboard and dropped.',
    canvas: 'CUCKBLOX, a falling-block game. Arrow keys move and rotate, Space drops, C holds, Escape pauses. Backquote or tilde shows the frame counter.',
  },
};

/** Sentence case for speech, so screen readers don't spell out all-caps words. */
export function spoken(text) {
  return text === text.toUpperCase() ? text.charAt(0) + text.slice(1).toLowerCase() : text;
}

/** Drops the emphasis, wave, and dim markers and line breaks for anything that reads text plainly (speech, measuring). */
export function plain(text) {
  return text.replace(/[*~]/g, '').replaceAll('\n', ' ');
}
