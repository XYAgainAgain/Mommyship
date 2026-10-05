// Osminok Ocean: every run is a dive from the megastorm surface, sinking with each cleared line. The zones
// follow the Osminok lore depths; the renderer, scene, and soundscape all read them here.

export const METERS_PER_LINE = 100;
// The storm surface gets the first few lines to itself, sinking slowly to the plunge before the dive proper starts
export const SURFACE_LINES = 10;
/** Where the run leaves the storm and goes under: the splash, the muffled storm, and the first fading blocks. */
export const PLUNGE_DEPTH = 200;
// Settled blocks are at their faintest by the Living Trenches
const FAINTEST_DEPTH = 7000;

/** Zone ids in dive order, each starting at `from` meters. */
export const DIVE_ZONES = [
  { id: 'surface', from: 0 },
  { id: 'twilight', from: 200 },
  { id: 'midnight', from: 1000 },
  { id: 'vents', from: 3000 },
  { id: 'crushing', from: 4000 },
  { id: 'trenches', from: 7000 },
  { id: 'forgotten', from: 12000 },
  { id: 'unknowable', from: 20000 },
];

export function depthFor(lines) {
  if (lines <= SURFACE_LINES) return Math.round((lines * PLUNGE_DEPTH) / SURFACE_LINES);
  return PLUNGE_DEPTH + (lines - SURFACE_LINES) * METERS_PER_LINE;
}

/** The fewest lines that reach a depth. */
export function linesFor(depth) {
  if (depth <= PLUNGE_DEPTH) return Math.ceil((depth * SURFACE_LINES) / PLUNGE_DEPTH);
  return SURFACE_LINES + Math.ceil((depth - PLUNGE_DEPTH) / METERS_PER_LINE);
}

/** How much of a settled block's fill survives at a depth: solid above water, a faint wash by the Living Trenches. */
export const clarityAt = (depth) => 1 - 0.85 * Math.sqrt(Math.min(1, Math.max(0, depth - PLUNGE_DEPTH) / (FAINTEST_DEPTH - PLUNGE_DEPTH)));

/** Index into DIVE_ZONES for a depth in meters. */
export function zoneIndexAt(depth) {
  let i = 0;
  while (i + 1 < DIVE_ZONES.length && depth >= DIVE_ZONES[i + 1].from) i++;
  return i;
}
