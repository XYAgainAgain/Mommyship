// CUCKBLOX credits: earned per cleared line, spent on themes, paint, and tunes. Balances are whole cr; prices are kcr.
import { STOCK_PAINTS, KCR_PER_COLOR, themeById } from '../themes/themes.js';

export const CR_PER_LINE = 25;
export const SPECIAL_BONUS = 1.5;
export const SIGNING_DIVIDEND = 5000;
// Consistent's flat bonus every 100 blocks; it never grows, since C.U.C.K. would rather not pay it at all
export const BLOX_BONUS = 300;
export const BLOX_BONUS_EVERY = 100;

/** Credits for one clear: hazard pay rises with the speed level (faster in Marathon and Mega-Retro, whose levels climb;
 *  Consistent's never do), and Tetrises and T-spin multi-line clears pay more. */
export function clearCredits(lines, level, special, practice = false) {
  return Math.round(CR_PER_LINE * lines * (1 + level / (practice ? 20 : 15)) * (special ? SPECIAL_BONUS : 1));
}

/** Pay for an engine clear event in a mode. Retro has no T-spins, so only its Tetrises earn the bonus there. */
export function payForClear({ rows, special }, level, mode) {
  return clearCredits(rows.length, level, rows.length === 4 || (special && !mode.retro), !!mode.practice);
}

/** Consistent's bonus for an engine "hundredBlocks" callout; nothing in other modes. */
export function bloxBonus({ value }, mode) {
  return mode.practice && value > 0 && value % BLOX_BONUS_EVERY === 0 ? BLOX_BONUS : 0;
}

/** 475 → "475cr", 5000 → "5kcr", 12350 → "12.35kcr" (credits are always lowercase). */
export function formatCr(cr) {
  return cr < 1000 && cr > -1000 ? `${cr}cr` : `${+(cr / 1000).toFixed(2)}kcr`;
}

const hex = (c) => c.toLowerCase();

/** The wallet lives in the per-browser data. A first boot pays the signing dividend and lets the player keep whatever
 *  theme was already selected before credits existed, paint job included. */
export function ensureWallet(data) {
  const w = data.wallet;
  if (w && Number.isInteger(w.cr) && Array.isArray(w.themes) && Array.isArray(w.paints)) {
    // A wallet with no tune list gets an empty one rather than a reset
    w.tunes = Array.isArray(w.tunes) ? w.tunes.filter((x) => typeof x === 'string') : [];
    return w;
  }
  const selected = data.settings.theme;
  data.wallet = {
    cr: SIGNING_DIVIDEND,
    themes: selected && selected !== 'custom' && themeById(selected).kcr > 0 ? [selected] : [],
    paints: selected === 'custom' && data.settings.customColors ? [...new Set(Object.values(data.settings.customColors).map(hex))] : [],
    tunes: [],
  };
  return data.wallet;
}

export function ownsTheme(wallet, theme) {
  return theme.id === 'custom' || theme.kcr === 0 || wallet.themes.includes(theme.id);
}

/** Buys a theme if the balance covers it; returns whether it did. */
export function buyTheme(wallet, theme) {
  const cost = theme.kcr * 1000;
  if (ownsTheme(wallet, theme) || wallet.cr < cost) return false;
  wallet.cr -= cost;
  wallet.themes.push(theme.id);
  return true;
}

/** Colors a player already has: bought paints plus the stock paint of every theme they own. */
export function ownedPaints(wallet) {
  const owned = new Set(wallet.paints.map(hex));
  for (const [, color, id] of STOCK_PAINTS) if (id && ownsTheme(wallet, themeById(id))) owned.add(hex(color));
  return owned;
}

/** What a paint job would cost: only colors the player has never bought. */
export function paintQuote(wallet, colors) {
  const owned = ownedPaints(wallet);
  const fresh = [...new Set(Object.values(colors).map(hex))].filter((c) => !owned.has(c));
  return { fresh, cr: fresh.length * KCR_PER_COLOR * 1000 };
}

/** Pays for a paint job's new colors and keeps them forever; returns whether the balance covered it. */
export function buyPaint(wallet, colors) {
  const { fresh, cr } = paintQuote(wallet, colors);
  if (wallet.cr < cr) return false;
  wallet.cr -= cr;
  wallet.paints.push(...fresh);
  return true;
}

/** Tunes are { id, kcr }; a 0kcr tune is standard issue. */
export function ownsTune(wallet, tune) {
  return tune.kcr === 0 || wallet.tunes.includes(tune.id);
}

/** Buys a tune if the balance covers it; returns whether it did. */
export function buyTune(wallet, tune) {
  const cost = tune.kcr * 1000;
  if (ownsTune(wallet, tune) || wallet.cr < cost) return false;
  wallet.cr -= cost;
  wallet.tunes.push(tune.id);
  return true;
}
