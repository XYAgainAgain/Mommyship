// Performance tradeoffs that cost a little of the look, all off by default. Any can be turned on for one page load
// with ?perf=, comma-separated: dpr:2 caps the canvas's pixel density, pixelated scales the canvas up unsmoothed,
// and nofringe drops the tube's red and blue fringe (a test of what that filter costs on a device, not a new look).
export const PERF_DEFAULTS = { dpr: Infinity, pixelated: false, nofringe: false };

/** The flags in effect, plus `label` (the ones turned on, as typed) for the FPS counter. */
export function perfFlags(search = globalThis.location?.search ?? '') {
  const flags = { ...PERF_DEFAULTS };
  const on = [];
  for (const part of (new URLSearchParams(search).get('perf') ?? '').split(',')) {
    const [name, value] = part.trim().toLowerCase().split(':');
    if (name === 'dpr' && Number(value) >= 1 && Number(value) <= 8) flags.dpr = Number(value);
    else if (name === 'pixelated' || name === 'nofringe') flags[name] = true;
    else continue;
    on.push(part.trim().toLowerCase());
  }
  return { ...flags, label: on.join(',') };
}

export const PERF = perfFlags();
