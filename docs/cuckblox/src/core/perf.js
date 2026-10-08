// Performance tradeoffs that cost a little of the look, all off by default, plus one diagnostic. Any can be turned on for
// one page load with ?perf=, comma-separated: dpr:2 caps the canvas's pixel density, pixelated scales it up unsmoothed,
// nofringe drops the tube's red and blue fringe (to test what it costs), and viewport lists the page's height readings.
export const PERF_DEFAULTS = { dpr: Infinity, pixelated: false, nofringe: false, viewport: false };

/** The flags in effect, plus `label` (the ones turned on, as typed) for the FPS counter. */
export function perfFlags(search = globalThis.location?.search ?? '') {
  const flags = { ...PERF_DEFAULTS };
  const on = [];
  for (const part of (new URLSearchParams(search).get('perf') ?? '').split(',')) {
    const [name, value] = part.trim().toLowerCase().split(':');
    if (name === 'dpr' && Number(value) >= 1 && Number(value) <= 8) flags.dpr = Number(value);
    else if (name === 'pixelated' || name === 'nofringe' || name === 'viewport') flags[name] = true;
    else continue;
    on.push(part.trim().toLowerCase());
  }
  return { ...flags, label: on.join(',') };
}

export const PERF = perfFlags();

/** A fixed, invisible box sized by `css`, for reading values JavaScript can't ask for directly (env(), dvh). */
export function probe(css) {
  const el = document.createElement('div');
  el.setAttribute('aria-hidden', 'true');
  el.style.cssText = `position: fixed; top: 0; left: 0; width: 0; visibility: hidden; pointer-events: none; ${css}`;
  document.body.append(el);
  return el;
}

/** The safe-area insets in px, read off a probe padded by env(). */
export function readInsets(el) {
  const cs = getComputedStyle(el);
  return { top: parseFloat(cs.paddingTop), right: parseFloat(cs.paddingRight), bottom: parseFloat(cs.paddingBottom), left: parseFloat(cs.paddingLeft) };
}

export const INSET_CSS = 'padding: env(safe-area-inset-top, 0px) env(safe-area-inset-right, 0px) env(safe-area-inset-bottom, 0px) env(safe-area-inset-left, 0px);';

/** ?perf=viewport: every reading that decides the terminal's height, at the top of the page since the bottom is what gets cut off. */
export function showViewportReadout(target) {
  const insetProbe = probe(INSET_CSS);
  const units = Object.fromEntries(['dvh', 'svh', 'lvh'].map((u) => [u, probe(`height: 100${u};`)]));
  const fixedBox = probe('inset: 0; width: auto;');
  const box = document.createElement('pre');
  box.setAttribute('aria-hidden', 'true');
  box.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; z-index: 2147483647; margin: 0; pointer-events: none; '
    + 'padding: calc(env(safe-area-inset-top, 0px) + 4px) 8px 4px calc(env(safe-area-inset-left, 0px) + 8px); '
    + 'font: 12px/1.35 ui-monospace, monospace; color: #fff; background: rgb(0 0 0 / 0.8); white-space: pre-wrap;';
  document.body.append(box);
  const px = (n) => `${Math.round(n * 100) / 100}`;
  const update = () => {
    const vv = window.visualViewport;
    const i = readInsets(insetProbe);
    const h = (u) => px(units[u].getBoundingClientRect().height);
    box.textContent = [
      `innerHeight ${px(innerHeight)}  vv.height ${vv ? px(vv.height) : '-'}  vv.offsetTop ${vv ? px(vv.offsetTop) : '-'}  clientHeight ${px(document.documentElement.clientHeight)}`,
      `100dvh ${h('dvh')}  100svh ${h('svh')}  100lvh ${h('lvh')}  fixed inset:0 ${px(fixedBox.getBoundingClientRect().height)}`,
      `inset T ${px(i.top)} R ${px(i.right)} B ${px(i.bottom)} L ${px(i.left)}`,
      `screen.height ${screen.height}  availHeight ${screen.availHeight}  dpr ${px(devicePixelRatio)}  standalone ${matchMedia('(display-mode: standalone)').matches}`,
      `terminal ${px(target.getBoundingClientRect().height)}  --viewport-h ${document.documentElement.style.getPropertyValue('--viewport-h') || 'unset'}`,
    ].join('\n');
  };
  update();
  // Polled as well as event-driven, since an inset can change with no resize event at all
  setInterval(update, 500);
  window.addEventListener('resize', update);
  window.visualViewport?.addEventListener('resize', update);
  window.visualViewport?.addEventListener('scroll', update);
}
