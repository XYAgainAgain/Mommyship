/* Footer greebles: a seeded 1280×48 SVG strip of cable runs, modules, and circuit parts that tiles
   both ways. Each page load builds a fresh strip; a baked copy ships as the no-JS fallback. Looks rad! */

const W = 1280;
const LANE_Y = [8, 24, 40];
const HALF = 6.3;
const RUN_MIN = 24, RUN_MAX = 100;
const SHIFTS = [-W, 0, W];

let S = 0;
function rnd() {
  S = (S + 0x6D2B79F5) | 0;
  let t = Math.imul(S ^ (S >>> 15), 1 | S);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const uni = (a, b) => a + (b - a) * rnd();
const int = (a, b) => Math.floor(uni(a, b + 1));
const chance = p => rnd() < p;
const pick = a => a[Math.floor(rnd() * a.length)];
const mod = x => ((x % W) + W) % W;
function weighted(list) {
  let t = 0;
  for (const e of list) t += e.wt;
  let r = rnd() * t;
  for (const e of list) if ((r -= e.wt) < 0) return e;
  return list[list.length - 1];
}
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Output: one batched <path> per style layer keeps the file small. Every shape winds clockwise so
// overlapping tints in one layer merge instead of punching holes.
const LAYERS = [
  ['band', ' fill="#fff" fill-opacity=".22" stroke="none"'],
  ['tint', ' fill="#fff" fill-opacity=".22"'],
  ['tint2', ' fill="#fff" fill-opacity=".22"'],
  ['line', ''],
  ['fine', ' stroke-width=".6"'],
  ['dim', ' fill="#fff" fill-opacity=".55" stroke="none"'],
  ['solid', ' fill="#fff" stroke="none"'],
];
let buf, DX = 0, px = 0, py = 0;
const r1 = v => Math.round(v * 10) / 10;
const out = (layer, d) => { buf[layer] += d; };

function M(x, y) {
  px = r1(x + DX); py = r1(y);
  return 'M' + px + ' ' + py;
}
function L(x, y) {
  const nx = r1(x + DX), ny = r1(y), dx = r1(nx - px), dy = r1(ny - py);
  px = nx; py = ny;
  if (dy === 0) return 'h' + dx;
  if (dx === 0) return 'v' + dy;
  return 'l' + dx + (dy < 0 ? '' : ' ') + dy;
}
function poly(layer, pts, close) {
  let d = M(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) d += L(pts[i][0], pts[i][1]);
  out(layer, close ? d + 'z' : d);
}
const seg = (layer, x1, y1, x2, y2) => out(layer, M(x1, y1) + L(x2, y2));
const rect = (layer, x, y, w, h) => out(layer, M(x, y) + 'h' + r1(w) + 'v' + r1(h) + 'h' + r1(-w) + 'z');
function rrect(layer, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  if (r < 0.4) return rect(layer, x, y, w, h);
  const a = 'a' + r1(r) + ' ' + r1(r) + ' 0 0 1 ', q = r1(r);
  out(layer, M(x + r, y) + 'h' + r1(w - 2 * r) + a + q + ' ' + q + 'v' + r1(h - 2 * r) + a + -q + ' ' + q
    + 'h' + r1(2 * r - w) + a + -q + ' ' + -q + 'v' + r1(2 * r - h) + a + q + ' ' + -q + 'z');
}
function circle(layer, cx, cy, r) {
  const a = 'a' + r1(r) + ' ' + r1(r) + ' 0 1 1 ';
  out(layer, M(cx - r, cy) + a + r1(2 * r) + ' 0' + a + r1(-2 * r) + ' 0z');
}

// Anything within a stroke of either edge is drawn again one tile over, replaying the same RNG stream
function wrapped(x0, x1, fn) {
  const s = S;
  fn();
  const e = S;
  if (x1 > W - 1) { S = s; DX = -W; fn(); }
  if (x0 < 1) { S = s; DX = W; fn(); }
  DX = 0; S = e;
}

// Occupancy boxes (circular in x) keep detours, risers, and small parts from colliding. A 32px
// bucket ring keeps the first, un-JITted run fast.
const CELL = 32, NCELL = W / CELL;
let grid;
function forCells(x0, x1, fn) {
  const a = Math.floor(x0 / CELL), b = Math.min(Math.floor(x1 / CELL), a + NCELL - 1);
  for (let i = a; i <= b; i++) fn(grid[((i % NCELL) + NCELL) % NCELL]);
}
function claim(x0, y0, x1, y1, owner) {
  const box = { x0, y0, x1, y1, owner };
  forCells(x0, x1, cell => cell.push(box));
}
function free(x0, y0, x1, y1, skipA, skipB) {
  let ok = true;
  forCells(x0, x1, cell => {
    for (let i = 0; ok && i < cell.length; i++) {
      const b = cell[i];
      if (y1 <= b.y0 || y0 >= b.y1 || b.owner === skipA || b.owner === skipB) continue;
      if ((x1 > b.x0 && x0 < b.x1) || (x1 > b.x0 - W && x0 < b.x1 - W) || (x1 > b.x0 + W && x0 < b.x1 + W)) ok = false;
    }
  });
  return ok;
}

// Module parts

function gauge(cx, cy, r) {
  circle('line', cx, cy, r);
  let d = '';
  for (let i = 0; i < 5; i++) {
    const a = Math.PI * (0.8 + i * 0.35), c = Math.cos(a), s = Math.sin(a);
    d += M(cx + c * (r - 0.6), cy + s * (r - 0.6)) + L(cx + c * (r - 1.8), cy + s * (r - 1.8));
  }
  out('fine', d);
  const a = Math.PI * uni(0.8, 2.2);
  seg('line', cx, cy, cx + Math.cos(a) * (r - 1.4), cy + Math.sin(a) * (r - 1.4));
  circle('solid', cx, cy, 0.8);
}

function fanBlades(cx, cy, r) {
  circle('line', cx, cy, r);
  circle('line', cx, cy, r * 0.72);
  const n = pick([6, 7, 8, 9]);
  let d = '';
  for (let i = 0; i < n; i++) {
    const a0 = i * Math.PI * 2 / n, a1 = a0 + 0.5;
    d += M(cx + Math.cos(a0) * r * 0.28, cy + Math.sin(a0) * r * 0.28) + L(cx + Math.cos(a1) * r * 0.68, cy + Math.sin(a1) * r * 0.68);
  }
  out('line', d);
  circle('tint2', cx, cy, r * 0.26);
  circle('solid', cx, cy, Math.max(0.7, r * 0.1));
}

// Single-lane modules: a box centered on one lane, full height at both sides so plugs always land

function chip({ x, y, w, h }) {
  rrect('line', x, y, w, h, 1);
  const bx = x + 3, by = y + 3.2, bw = w - 6, bh = h - 6.4;
  rrect('tint', bx, by, bw, bh, 0.8);
  let d = '';
  for (let p = bx + 1.6; p <= bx + bw - 1.2; p += 2.4) d += M(p, by) + 'v-1.5' + M(p, by + bh) + 'v1.5';
  out('fine', d);
  circle('solid', bx + 1.6, by + 1.5, 0.55);
  rect('line', bx + bw * 0.32, by + bh * 0.25, bw * 0.36, bh * 0.5);
}

function caps({ x, y, w, h }) {
  rrect('line', x, y, w, h, 1);
  const n = Math.floor((w - 3) / 6), x0 = x + (w - n * 6 + 1.6) / 2;
  let d = '';
  for (let i = 0; i < n; i++) {
    const cx = x0 + i * 6;
    rrect('tint', cx, y + 1.8, 4.4, h - 4.6, 2.2);
    d += M(cx + 0.4, y + 4) + 'h3.6' + M(cx + 2.2, y + h - 2.8) + 'v1.6';
  }
  out('fine', d);
}

function heatsink({ x, y, w, h }) {
  rect('line', x, y, w, h);
  let d = '';
  for (let fx = x + 4; fx <= x + w - 3.5; fx += 2.8) d += M(fx, y + 1.8) + 'v' + r1(h - 3.6);
  out('line', d);
  circle('solid', x + 1.9, y + h / 2, 0.7);
  circle('solid', x + w - 1.9, y + h / 2, 0.7);
}

function coil({ x, y, w, h }) {
  rrect('tint', x, y, w, h, 2);
  const cy = y + h / 2, amp = h / 2 - 2.6;
  const pts = [[x + 3.5, cy]];
  const n = Math.floor((w - 7) / 3);
  for (let i = 0; i < n; i++) pts.push([x + 3.5 + i * 3 + 1.5, cy + (i % 2 ? -amp : amp)]);
  pts.push([x + w - 3.5, cy]);
  poly('line', pts);
  out('fine', M(x + 2.2, y + 1.6) + 'v' + r1(h - 3.2) + M(x + w - 2.2, y + 1.6) + 'v' + r1(h - 3.2));
}

function terminal({ x, y, w, h }) {
  rrect('tint', x, y, w, h, 1);
  const n = Math.max(1, Math.floor((w - 2) / 6)), x0 = x + (w - n * 6 + 1) / 2;
  let d = '';
  for (let i = 0; i < n; i++) {
    const cx = x0 + i * 6;
    rect('line', cx, y + 2, 5, 5);
    d += M(cx + 1.2, y + 5.8) + L(cx + 3.8, y + 3.2);
    circle('solid', cx + 2.5, y + h - 2.6, 0.6);
  }
  out('line', d);
}

function tank({ x, y, w, h }) {
  rect('tint', x, y, 3, h);
  rect('tint', x + w - 3, y, 3, h);
  const bh = h - 3, r = bh / 2, bx = x + 3, bw = w - 6;
  rrect('tint2', bx, y + 1.5, bw, bh, r);
  let d = '';
  const inner = bw - 2 * r;
  for (let i = 1; i <= 2; i++) d += M(bx + r + inner * i / 3, y + 1.5) + 'v' + r1(bh);
  out('line', d);
  circle('solid', bx + r, y + h / 2, 1);
}

function dataport({ x, y, w, h }) {
  rrect('tint', x, y, w, h, 1.5);
  rrect('line', x + 2, y + 2, w - 4, h * 0.45, 0.8);
  let d = '';
  for (let sx = x + 4; sx <= x + w - 4; sx += 3) d += M(sx, y + 3.2) + 'v' + r1(h * 0.45 - 2.4);
  out('fine', d);
  for (let i = 0; i < 3; i++) circle('solid', x + 4 + i * 3.6, y + h - 3, 0.8);
  if (w > 22) seg('line', x + 15, y + h - 3, x + w - 3, y + h - 3);
}

function gaugeBox({ x, y, w, h }) {
  rrect('tint', x, y, w, h, 1.5);
  gauge(x + w / 2, y + h / 2, h / 2 - 1.3);
}

function relay({ x, y, w, h }) {
  rect('tint', x, y, w, h);
  rect('line', x + 2, y + 2, w - 4, h - 4);
  const cx = x + w / 2, cy = y + h / 2;
  circle('line', cx, cy, 2.4);
  seg('fine', cx - 2.8, cy + 2.8, cx + 2.8, cy - 2.8);
  for (const [dx, dy] of [[3.6, 3.6], [w - 3.6, 3.6], [3.6, h - 3.6], [w - 3.6, h - 3.6]]) circle('solid', x + dx, y + dy, 0.55);
}

function vent({ x, y, w, h }) {
  rrect('line', x, y, w, h, 1.2);
  const lw = 7;
  rrect('tint', x + 2, y + 2, w - lw - 5, h - 4, 1);
  let d = '';
  for (let sx = x + 4; sx <= x + w - lw - 4.5; sx += 2.2) d += M(sx, y + 3.5) + 'v' + r1(h - 7);
  out('fine', d);
  rect('line', x + w - lw - 1.5, y + 3, lw - 1, 3.4);
  circle('solid', x + w - lw / 2 - 2, y + h - 3.6, 0.7);
}

function battery({ x, y, w, h }) {
  rect('line', x, y, w, h);
  const n = Math.floor((w - 4) / 10), x0 = x + (w - n * 10 + 1.4) / 2;
  let d = '';
  for (let i = 0; i < n; i++) {
    const cx = x0 + i * 10;
    rrect('tint', cx, y + 2, 7.6, h - 4, 1);
    rect('solid', cx + 7.6, y + h / 2 - 1.2, 1, 2.4);
    d += M(cx + 2.2, y + h / 2) + 'h3.2' + M(cx + 3.8, y + h / 2 - 1.6) + 'v3.2';
  }
  out('fine', d);
}

function fuse({ x, y, w, h }) {
  rrect('line', x, y, w, h, 1);
  rect('dim', x + 2, y + 3, 2.4, h - 6);
  rect('dim', x + w - 4.4, y + 3, 2.4, h - 6);
  rrect('tint', x + 4.4, y + 3.6, w - 8.8, h - 7.2, 2);
  const pts = [[x + 4.4, y + h / 2]];
  for (let fx = x + 6, i = 0; fx < x + w - 6; fx += 2, i++) pts.push([fx, y + h / 2 + (i % 2 ? -1 : 1)]);
  pts.push([x + w - 4.4, y + h / 2]);
  poly('fine', pts);
}

// Bare circuit board: pads on the edges where runs plug in, 45° traces fanning into a QFP
function board(m) {
  const { x, y, w, h, ports } = m;
  rrect('line', x, y, w, h, 1.5);
  if (h > 20) for (const [dx, dy] of [[2.6, 2.6], [w - 2.6, 2.6], [2.6, h - 2.6], [w - 2.6, h - 2.6]]) circle('fine', x + dx, y + dy, 1.1);
  const s = Math.min(h - 6, 18, w * 0.36);
  const cx = x + w * uni(0.42, 0.58), cy = y + h / 2, c0x = cx - s / 2, c0y = cy - s / 2;
  rect('tint', c0x, c0y, s, s);
  const np = Math.floor((s - 2) / 2) + 1, off = (s - (np - 1) * 2) / 2;
  const pins = [];
  let d = '';
  for (let j = 0; j < np; j++) {
    const p = off + j * 2;
    pins.push(p);
    d += M(c0x, c0y + p) + 'h-1.4' + M(c0x + s, c0y + p) + 'h1.4' + M(c0x + p, c0y) + 'v-1.4' + M(c0x + p, c0y + s) + 'v1.4';
  }
  out('fine', d);
  circle('solid', c0x + 1.6, c0y + 1.6, 0.55);
  rect('line', c0x + s * 0.3, c0y + s * 0.3, s * 0.4, s * 0.4);
  const pinYs = pins.map(p => c0y + p);
  fanIn(ports.L, x, c0x - 1.4, pinYs, 1);
  fanIn(ports.R, x + w, c0x + s + 1.4, pinYs, -1);
  for (const [list, ey, dir] of [[ports.T, y, 1], [ports.B, y + h, -1]]) {
    for (const rel of list) {
      seg('fine', x + rel, ey, x + rel, ey + dir * 3.2);
      circle('fine', x + rel, ey + dir * 4.1, 0.9);
    }
  }
  // A few chip pins escape to vias above and below, the way real boards fan out
  for (const dir of [-1, 1]) {
    const edge = dir < 0 ? c0y - 1.4 : c0y + s + 1.4;
    if ((dir < 0 ? edge - y : y + h - edge) < 6.5) continue;
    for (let i = 0; i < Math.min(3, np); i += 2) {
      const vx = c0x + pins[i + Math.floor((np - Math.min(3, np)) / 2)];
      const vy = edge + dir * 1.6;
      poly('fine', [[vx, edge], [vx, vy], [vx - 2, vy + dir * 2]]);
      circle('fine', vx - 2, vy + dir * 2.9, 0.9);
    }
  }
}

// Order-preserving 45° fan: every trace jogs from the same x, so sorted inputs never cross
function fanIn(ys, edgeX, pinX, pinYs, sgn) {
  if (!ys.length) return;
  ys = [...ys].sort((a, b) => a - b);
  const use = Math.min(ys.length, pinYs.length);
  const k0 = Math.floor((ys.length - use) / 2), j0 = Math.floor((pinYs.length - use) / 2);
  const xs = edgeX + sgn * 6;
  let d = '', lastVia = -Infinity;
  ys.forEach((y, i) => {
    rect('dim', sgn > 0 ? edgeX + 0.4 : edgeX - 2, y - 0.7, 1.6, 1.4);
    const j = i - k0;
    const ty = j >= 0 && j < use ? pinYs[j0 + j] : null;
    if (ty === null || Math.abs(ty - y) > Math.abs(pinX - xs) - 1) {
      d += M(edgeX, y) + L(edgeX + sgn * 3.4, y);
      if (y - lastVia < 2.2) circle('solid', edgeX + sgn * 3.4, y, 0.45);
      else { circle('fine', edgeX + sgn * 4.3, y, 0.9); lastVia = y; }
      return;
    }
    const dy = ty - y;
    d += M(edgeX, y) + L(xs, y) + L(xs + sgn * Math.abs(dy), ty) + L(pinX, ty);
  });
  out('fine', d);
}

// Tall modules: span two or three lanes

function panel({ x, y, w, h }) {
  rrect('tint', x, y, w, h, 2);
  rrect('line', x + 2, y + 2, w - 4, h - 4, 1);
  const gx = x + 5, gw = int(3, 6) * 3;
  let d = '';
  for (let i = 0; i < gw / 3; i++) d += M(gx + i * 3, y + 5) + 'v' + r1(h - 10);
  out('line', d);
  const dx = gx + gw + 4, n = Math.max(1, Math.floor((x + w - 6 - dx) / 9)), by = y + h * 0.36;
  for (let i = 0; i < n; i++) {
    const cx = dx + 4 + i * 9;
    if (chance(0.5)) { circle('line', cx, by, 2.6); circle('solid', cx, by, 0.9); }
    else rrect('tint2', cx - 3, by - 2.5, 6, 5, 0.8);
  }
  for (let i = 0; i < n * 2; i++) circle('solid', dx + 2 + i * 4.5, y + h - 5, 0.8);
}

function fanbox({ x, y, w, h }) {
  rrect('tint', x, y, w, h, 3);
  const r = Math.min(w, h) / 2 - 3;
  for (const [dx, dy] of [[2.4, 2.4], [w - 2.4, 2.4], [2.4, h - 2.4], [w - 2.4, h - 2.4]]) circle('solid', x + dx, y + dy, 0.9);
  fanBlades(x + w / 2, y + h / 2, r);
}

function junction({ x, y, w, h }) {
  rrect('tint', x, y, w, h, 2);
  rect('line', x + 3, y + 3, w - 6, h * 0.36);
  let d = '';
  for (let i = 0; i < 3; i++) d += M(x + 6, y + 6.5 + i * 2.8) + 'h' + r1(w - 12 - i * 5);
  out('fine', d);
  circle('line', x + 3.8, y + h - 4, 1.3);
  circle('line', x + w - 3.8, y + h - 4, 1.3);
  rrect('tint2', x + 6, y + h * 0.52, w - 12, h * 0.24, 1);
  for (let i = 0; i < Math.floor((w - 14) / 4); i++) circle('solid', x + 9 + i * 4, y + h * 0.64, 0.8);
}

// Stacked rack units, each with its own face
function rack({ x, y, w, h }) {
  rect('tint', x, y, w, h);
  out('line', M(x + 2.4, y) + 'v' + r1(h) + M(x + w - 2.4, y) + 'v' + r1(h));
  const n = Math.max(2, Math.min(5, Math.round(h / uni(9, 13))));
  const cuts = [y];
  for (let i = 1; i < n; i++) cuts.push(y + h * i / n + uni(-1.2, 1.2));
  cuts.push(y + h);
  const ix0 = x + 4.4, ix1 = x + w - 4.4;
  for (let i = 0; i < n; i++) {
    const u0 = cuts[i], u1 = cuts[i + 1], iy0 = u0 + 1.6, iy1 = u1 - 1.6, my = (u0 + u1) / 2;
    if (i) seg('line', x, u0, x + w, u0);
    circle('solid', x + 1.2, u0 + 2, 0.55);
    circle('solid', x + w - 1.2, u0 + 2, 0.55);
    const kind = pick(['vent', 'leds', 'knobs', 'handle', 'screen']);
    if (kind === 'vent') {
      let d = '';
      for (let vy = iy0 + 0.6; vy <= iy1 - 0.4; vy += 1.6) d += M(ix0 + 1, vy) + 'h' + r1(ix1 - ix0 - 2);
      out('fine', d);
    } else if (kind === 'leds') {
      for (let lx = ix0 + 1.5; lx <= ix1 - 5; lx += 3) circle('solid', lx, my, 0.65);
      circle('line', ix1 - 1.6, my, 1.3);
    } else if (kind === 'knobs') {
      const r = Math.min(2.6, (iy1 - iy0) / 2 - 0.3);
      for (let kx = ix0 + r + 1; kx <= ix1 - r; kx += 2 * r + 3) { circle('line', kx, my, r); circle('solid', kx, my, 0.6); }
    } else if (kind === 'handle') {
      rrect('line', ix0 + 2, my - 1.4, ix1 - ix0 - 4, 2.8, 1.4);
    } else {
      rect('tint2', ix0, iy0, ix1 - ix0, iy1 - iy0);
      const pts = [];
      for (let sx = ix0 + 1, k = 0; sx <= ix1 - 1; sx += 1.8, k++) pts.push([sx, my + (k % 2 ? -1 : 1) * Math.min(1.5, (iy1 - iy0) / 2 - 0.6)]);
      if (pts.length > 1) poly('fine', pts);
    }
  }
}

function vtank({ x, y, w, h }) {
  rect('line', x, y, w, h);
  const bx = x + 2, bw = w - 4, top = y + 2, bh = h - 4;
  rrect('tint', bx, top, bw, bh, bw / 2);
  const n = int(2, 3);
  let d = '';
  for (let i = 1; i <= n; i++) d += M(bx, top + bw / 2 + (bh - bw) * i / (n + 1)) + 'h' + r1(bw);
  out('line', d);
  const gh = (bh - bw) / (n + 1) - 2;
  if (gh >= 3) rect('fine', x + w / 2 - 1.2, top + bw / 2 + 1, 2.4, gh);
  for (const dy of [0.8, h - 2.2]) { rect('dim', x + 0.8, y + dy, 1.4, 1.4); rect('dim', x + w - 2.2, y + dy, 1.4, 1.4); }
}

function dials({ x, y, w, h }) {
  rrect('tint', x, y, w, h, 2);
  rrect('line', x + 1.8, y + 1.8, w - 3.6, h - 3.6, 1);
  const cols = Math.max(1, Math.floor((w - 4) / 15)), rows = Math.max(1, Math.floor((h - 4) / 14));
  const cw = (w - 4) / cols, ch = (h - 4) / rows;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = x + 2 + cw * (c + 0.5), cy = y + 2 + ch * (r + 0.5);
      if (chance(0.72)) gauge(cx, cy, Math.min(cw, ch) / 2 - 1.8);
      else {
        rrect('line', cx - 2, cy - 3.5, 4, 7, 1);
        seg('line', cx, cy, cx + 1.6, cy - 2.6);
        circle('solid', cx, cy, 0.7);
      }
    }
  }
}

const SINGLE = [
  { wt: 3, w: [18, 30], draw: chip },
  { wt: 2, w: [24, 34], draw: caps },
  { wt: 2, w: [40, 88], draw: heatsink },
  { wt: 1.4, w: [24, 34], draw: coil },
  { wt: 2, w: [13, 26], draw: terminal },
  { wt: 1.8, w: [22, 40], draw: tank },
  { wt: 1.8, w: [26, 46], draw: dataport },
  { wt: 1.4, w: [15, 16], draw: gaugeBox },
  { wt: 1.4, w: [16, 22], draw: relay },
  { wt: 1.4, w: [30, 60], draw: vent },
  { wt: 1.2, w: [30, 48], draw: battery },
  { wt: 1.2, w: [18, 24], draw: fuse },
  { wt: 1.4, w: [40, 64], draw: board },
];

const TALL = [
  { wt: 2, spans: [[0, 1], [1, 2]], w: () => uni(56, 96), draw: panel },
  { wt: 1.6, spans: [[0, 1], [1, 2], [0, 2]], w: h => h, draw: fanbox },
  { wt: 1.2, spans: [[0, 2], [0, 1], [1, 2]], w: () => uni(28, 40), draw: junction },
  { wt: 2, spans: [[0, 1], [1, 2], [0, 2]], w: () => uni(60, 110), draw: board },
  { wt: 1.6, spans: [[0, 2], [0, 1], [1, 2]], w: () => uni(28, 44), draw: rack },
  { wt: 1.2, spans: [[0, 1], [1, 2], [0, 2]], w: () => uni(16, 22), draw: vtank },
  { wt: 1.2, spans: [[0, 1], [1, 2]], w: () => uni(34, 52), draw: dials },
];

// Filler parts for the channels: L and R are lead ends where traces attach

function resistor(x, y) {
  out('line', M(x, y + 1.5) + 'h2' + M(x + 10, y + 1.5) + 'h2');
  rrect('line', x + 2, y, 8, 3, 1.2);
  out('fine', M(x + 4.5, y) + 'v3' + M(x + 6.5, y) + 'v3');
}
function smd(x, y) {
  rect('dim', x, y, 2.4, 1.8);
  rect('dim', x + 4, y, 2.4, 1.8);
}
function soic(x, y) {
  rect('tint', x + 1.5, y + 1, 8, 3);
  out('fine', M(x, y + 2.5) + 'h1.5' + M(x + 9.5, y + 2.5) + 'h1.5' + M(x + 3, y + 1) + 'v-1' + M(x + 5.5, y + 1) + 'v-1'
    + M(x + 8, y + 1) + 'v-1' + M(x + 3, y + 4) + 'v1' + M(x + 5.5, y + 4) + 'v1' + M(x + 8, y + 4) + 'v1');
}
function led(x, y) {
  circle('line', x + 3, y + 2, 1.9);
  circle('solid', x + 3, y + 2, 0.8);
  out('fine', M(x, y + 2) + 'h1.1' + M(x + 4.9, y + 2) + 'h1.1');
}
function diode(x, y) {
  rect('line', x + 2, y, 5, 3);
  rect('solid', x + 5.4, y, 0.9, 3);
  out('fine', M(x, y + 1.5) + 'h2' + M(x + 7, y + 1.5) + 'h2');
}
function crystal(x, y) {
  rrect('tint', x + 1.5, y, 7, 3.6, 1.8);
  out('fine', M(x, y + 1.8) + 'h1.5' + M(x + 8.5, y + 1.8) + 'h1.5');
}
function testPad(x, y) {
  circle('line', x + 1.5, y + 1.5, 1.3);
}
function trimpot(x, y) {
  rect('line', x + 1, y, 4, 5);
  circle('fine', x + 3, y + 2.5, 1.4);
  out('fine', M(x + 2.2, y + 3.3) + L(x + 3.8, y + 1.7) + M(x, y + 2.5) + 'h1' + M(x + 5, y + 2.5) + 'h1');
}

const PARTS = [
  { wt: 3, w: 12, h: 3, L: [0, 1.5], R: [12, 1.5], draw: resistor },
  { wt: 3, w: 6.4, h: 1.8, L: [0, 0.9], R: [6.4, 0.9], draw: smd },
  { wt: 2, w: 11, h: 5, L: [0, 2.5], R: [11, 2.5], draw: soic },
  { wt: 1.5, w: 6, h: 4, L: [0, 2], R: [6, 2], draw: led },
  { wt: 1.5, w: 9, h: 3, L: [0, 1.5], R: [9, 1.5], draw: diode },
  { wt: 1, w: 10, h: 3.6, L: [0, 1.8], R: [10, 1.8], draw: crystal },
  { wt: 1.5, w: 3, h: 3, L: [1.5, 1.5], R: [1.5, 1.5], draw: testPad },
  { wt: 1, w: 6, h: 5, L: [0, 2.5], R: [6, 2.5], draw: trimpot },
];

// Cable runs: pad = sheath half-thickness beyond the outer wire, cap = plug half-height beyond it
const STYLE = {
  bare: { wt: 3, n: [2, 4], sp: 3, pad: 0, cap: 2, events: true, detour: true, tap: true, draw: drawBare },
  sheath: { wt: 3, n: [2, 4], sp: 2.4, pad: 1.8, cap: 2.6, events: true, detour: true, tap: true, draw: drawSheath },
  ribbon: { wt: 1.6, n: [5, 7], sp: 1.5, pad: 0, cap: 1.6, events: false, detour: true, tap: true, draw: drawRibbon },
  pipe: { wt: 1.3, n: [1, 1], sp: 0, pad: 3, cap: 5, events: false, detour: false, tap: false, draw: drawPipe },
  braid: { wt: 1.3, n: [1, 1], sp: 0, pad: 3.5, cap: 4.6, events: false, detour: false, tap: false, draw: drawBraid },
  pcb: { wt: 1.6, n: [2, 4], sp: 2.4, pad: 0, cap: 2, events: false, detour: true, tap: true, draw: drawPcb },
};
const STYLE_LIST = Object.entries(STYLE).map(([id, s]) => ({ id, wt: s.wt }));

// Wire path at offset o from the lane center. Detour jogs shift per wire by o·tan(22.5°) so
// parallel wires keep their spacing through the 45° bends.
function pathAt(R, o) {
  const y = R.c + o;
  if (!R.detour) return [[R.x0, y], [R.x1, y]];
  const { b0, b1, dy } = R.detour, k = o * Math.sign(dy) * 0.414, j0 = b0 - k, j1 = b1 + k, a = Math.abs(dy);
  return [[R.x0, y], [j0, y], [j0 + a, y + dy], [j1 - a, y + dy], [j1, y], [R.x1, y]];
}
function extentAt(R, x) {
  let lo = Infinity, hi = -Infinity;
  for (const s of R.slots) if (x >= s.a - 0.01 && x <= s.b + 0.01) { lo = Math.min(lo, s.o); hi = Math.max(hi, s.o); }
  return lo === Infinity ? null : [lo, hi];
}
const allExtent = R => [R.slots[0].o, R.slots[R.slots.length - 1].o];

function drawBare(R) {
  const c = R.c;
  for (const s of R.slots) {
    if (R.detour) poly('line', pathAt(R, s.o));
    else seg('line', s.a, c + s.o, s.b, c + s.o);
  }
  for (const [xe, left] of [[R.x0, true], [R.x1, false]]) {
    const [lo, hi] = extentAt(R, xe);
    rrect('tint', left ? xe : xe - 4, c + lo - 2, 4, hi - lo + 4, 1);
  }
  for (const cx of R.clamps) {
    const [lo, hi] = extentAt(R, cx);
    rrect('dim', cx - 1.5, c + lo - 1.8, 3, hi - lo + 3.6, 0.6);
  }
  for (const e of R.events) {
    const [lo, hi] = allExtent(R);
    rrect('dim', e.s - 1.3, c + lo - 1.8, 2.6, hi - lo + 3.6, 0.6);
  }
}

function drawSheath(R) {
  const c = R.c, pad = 1.8;
  if (R.detour) {
    const [lo, hi] = allExtent(R);
    const top = pathAt(R, lo - pad), bot = pathAt(R, hi + pad);
    poly('band', top.concat([...bot].reverse()), true);
    poly('line', top);
    poly('line', bot);
    for (const s of R.slots) poly('fine', pathAt(R, s.o));
  } else {
    const xs = [R.x0, ...R.events.map(e => e.s).sort((a, b) => a - b), R.x1];
    for (let i = 0; i < xs.length - 1; i++) {
      const [lo, hi] = extentAt(R, (xs[i] + xs[i + 1]) / 2);
      const w = xs[i + 1] - xs[i];
      rect('band', xs[i], c + lo - pad, w, hi - lo + 2 * pad);
      out('line', M(xs[i], c + lo - pad) + 'h' + r1(w) + M(xs[i], c + hi + pad) + 'h' + r1(w));
    }
    for (const s of R.slots) seg('fine', s.a, c + s.o, s.b, c + s.o);
  }
  for (const [xe, sgn] of [[R.x0, 1], [R.x1, -1]]) {
    const [lo, hi] = extentAt(R, xe), t = c + lo - pad, b = c + hi + pad;
    const pts = [[xe, t - 0.8], [xe + sgn * 3, t - 0.8], [xe + sgn * 5.5, t], [xe + sgn * 5.5, b], [xe + sgn * 3, b + 0.8], [xe, b + 0.8]];
    poly('tint', sgn > 0 ? pts : pts.reverse(), true);
  }
  for (const cx of R.clamps) {
    const [lo, hi] = extentAt(R, cx);
    rect('line', cx - 0.6, c + lo - pad - 0.9, 1.2, hi - lo + 2 * pad + 1.8);
  }
  for (const e of R.events) {
    const [lo, hi] = allExtent(R);
    rrect('tint', e.s - 2.8, c + lo - pad - 1, 5.6, hi - lo + 2 * pad + 2, 1);
  }
}

function drawRibbon(R) {
  const c = R.c, n = R.slots.length;
  R.slots.forEach((s, i) => poly(i === 0 || i === n - 1 ? 'line' : 'fine', pathAt(R, s.o)));
  const [lo, hi] = allExtent(R);
  for (const [xe, left] of [[R.x0, true], [R.x1, false]]) {
    const x = left ? xe : xe - 5;
    rect('tint', x, c + lo - 1.6, 5, hi - lo + 3.2);
    seg('fine', x + 2.5, c + lo - 0.6, x + 2.5, c + hi + 0.6);
  }
  for (const cx of R.clamps) rrect('tint', cx - 3.5, c + lo - 1.7, 7, hi - lo + 3.4, 1.6);
}

function drawPipe(R) {
  const { c, x0, x1 } = R, len = x1 - x0;
  rect('band', x0, c - 3, len, 6);
  out('line', M(x0, c - 3) + 'h' + r1(len) + M(x0, c + 3) + 'h' + r1(len));
  if (len > 14) seg('fine', x0 + 5, c - 1.3, x1 - 5, c - 1.3);
  for (let rx = x0 + uni(8, 12); rx < x1 - 8; rx += uni(10, 16)) rect('tint', rx - 0.8, c - 4, 1.6, 8);
  for (const fx of [x0, x1 - 2.4]) {
    rect('tint', fx, c - 5, 2.4, 10);
    circle('solid', fx + 1.2, c - 3.9, 0.55);
    circle('solid', fx + 1.2, c + 3.9, 0.55);
  }
}

function drawBraid(R) {
  const { c, x0, x1 } = R, len = x1 - x0;
  rect('band', x0, c - 3.5, len, 7);
  out('line', M(x0, c - 3.5) + 'h' + r1(len) + M(x0, c + 3.5) + 'h' + r1(len));
  const a = x0 + 5, n = Math.floor((x1 - 5 - a) / 4);
  if (n > 0) {
    let d1 = M(a, c - 3.5), d2 = M(a, c + 3.5);
    d1 += 'l2 7l2-7'.repeat(n);
    d2 += 'l2-7l2 7'.repeat(n);
    out('fine', d1 + d2);
  }
  for (const [xe, left] of [[x0, true], [x1, false]]) {
    rect('tint', left ? xe : xe - 4, c - 4.6, 4, 9.2);
    rect('dim', left ? xe + 4 : xe - 5.4, c - 3.5, 1.4, 7);
  }
}

function drawPcb(R) {
  const c = R.c;
  for (const s of R.slots) {
    const pts = pathAt(R, s.o);
    poly('fine', pts);
    if (R.detour) circle('fine', pts[2][0], pts[2][1], 0.9);
  }
  const [lo, hi] = allExtent(R);
  for (const [xe, left] of [[R.x0, true], [R.x1, false]]) {
    rect('tint', left ? xe : xe - 3, c + lo - 2, 3, hi - lo + 4);
    for (const s of R.slots) rect('dim', left ? xe + 3.4 : xe - 5, c + s.o - 0.7, 1.6, 1.4);
  }
  for (const st of R.stubs) {
    seg('fine', st.x, st.y0, st.x, st.y1);
    rect('dim', st.x - 0.9, st.dir > 0 ? st.y1 : st.y1 - 1.3, 1.8, 1.3);
    rect('dim', st.x - 0.9, st.dir > 0 ? st.y1 + 2.2 : st.y1 - 3.5, 1.8, 1.3);
  }
}

function drawRiser(r) {
  for (const pts of r.wires) poly('line', pts);
  rect('tint', r.nubX0, r.nubY, r.nubX1 - r.nubX0, 1.6);
}

// Placement

function addModule(mods, m) {
  m.ports = { L: [], R: [], T: [], B: [] };
  mods.push(m);
  claim(m.x - 1.5, m.y - 1, m.x + m.w + 1.5, m.y + m.h + 1, m);
}

function placeModules() {
  const mods = [];
  const nTall = int(4, 6), step = W / nTall, base = uni(0, W);
  for (let i = 0; i < nTall; i++) {
    const t = weighted(TALL);
    const [lo, hi] = pick(t.spans);
    const y = LANE_Y[lo] - HALF, h = LANE_Y[hi] + HALF - y, w = Math.round(t.w(h));
    addModule(mods, { x: mod(base + (i + uni(-0.15, 0.15)) * step - w / 2), y, w, h, lo, hi, draw: t.draw });
  }
  for (let lane = 0; lane < 3; lane++) {
    const single = () => {
      const t = weighted(SINGLE);
      return { w: Math.round(uni(t.w[0], t.w[1])), draw: t.draw };
    };
    let nodes = mods.filter(m => m.lo <= lane && m.hi >= lane).sort((a, b) => a.x - b.x);
    if (!nodes.length) {
      const s = single();
      addModule(mods, { x: uni(0, W), y: LANE_Y[lane] - HALF, w: s.w, h: 2 * HALF, lo: lane, hi: lane, draw: s.draw });
      nodes = [mods[mods.length - 1]];
    }
    nodes.forEach((m, i) => {
      let x = m.x + m.w;
      const g1 = i === nodes.length - 1 ? nodes[0].x + W : nodes[i + 1].x;
      while (g1 - x > RUN_MAX) {
        const s = single(), room = g1 - x - s.w - RUN_MIN;
        if (room < RUN_MIN) break;
        const run = uni(RUN_MIN, Math.min(RUN_MAX, room));
        addModule(mods, { x: mod(x + run), y: LANE_Y[lane] - HALF, w: s.w, h: 2 * HALF, lo: lane, hi: lane, draw: s.draw });
        x += run + s.w;
      }
    });
  }
  return mods;
}

function buildRuns(mods) {
  const lanes = [[], [], []];
  for (let lane = 0; lane < 3; lane++) {
    const nodes = mods.filter(m => m.lo <= lane && m.hi >= lane).sort((a, b) => a.x - b.x);
    let prevStyle = null;
    nodes.forEach((left, i) => {
      const right = nodes[(i + 1) % nodes.length];
      let x0 = left.x + left.w, x1 = right.x + (i === nodes.length - 1 ? W : 0);
      if (x0 >= W) { x0 -= W; x1 -= W; }
      const short = x1 - x0 < 30;
      let id = short ? 'bare' : weighted(STYLE_LIST).id;
      if (id === prevStyle && !short) id = weighted(STYLE_LIST).id;
      prevStyle = id;
      const st = STYLE[id], n = int(st.n[0], st.n[1]);
      const slots = [];
      for (let j = 0; j < n; j++) slots.push({ o: (j - (n - 1) / 2) * st.sp, a: x0, b: x1 });
      const R = { lane, c: LANE_Y[lane], x0, x1, left, right, style: id, slots, events: [], detour: null, noTap: [], clamps: [], stubs: [], risers: [], short };
      const lo = slots[0].o - st.pad, hi = slots[n - 1].o + st.pad;
      claim(x0, R.c + lo - 1, x1, R.c + hi + 1, R);
      const pc = Math.max(st.cap, st.pad + 1.2) + 0.6;
      claim(x0, R.c + slots[0].o - pc, x0 + 6, R.c + slots[n - 1].o + pc, R);
      claim(x1 - 6, R.c + slots[0].o - pc, x1, R.c + slots[n - 1].o + pc, R);
      lanes[lane].push(R);
    });
  }
  return lanes;
}

// Risers: peel the outer wires off a run, drop them 45° into the channel, and plug them into a
// module on the neighboring lane (or the reverse, merging in). Wire counts change at the collar.
function tryRiser(R, dir, k, mods) {
  const c = R.c;
  const peel = dir > 0 ? R.slots.slice(-k).reverse() : R.slots.slice(0, k);
  const rows = peel.map((_, j) => c + dir * (6.8 - 2.2 * j));
  const D = peel.map((s, j) => Math.abs(rows[j] - (c + s.o)));
  const maxD = Math.max(...D), spread = 2.2 * (k - 1);
  const targets = shuffle(mods.filter(m => dir > 0 ? m.lo === R.lane + 1 : m.hi === R.lane - 1));
  for (const m of targets) {
    for (const sh of SHIFTS) {
      const mx = m.x + sh;
      for (const mode of shuffle([1, -1])) {
        // mode 1: split, lane wire ends at s and the riser heads right; -1: merge from the left
        const lo = Math.max(mx + 4 + (mode < 0 ? spread : 0), R.x0 + 14);
        const hi = Math.min(mx + m.w - 4 - (mode > 0 ? spread : 0), R.x1 - 14);
        if (hi < lo) continue;
        const xt = uni(lo, hi);
        const sLo = mode > 0 ? Math.max(R.x0 + 12, xt - 70) : xt + maxD + 3;
        const sHi = mode > 0 ? xt - maxD - 3 : Math.min(R.x1 - 12, xt + 70);
        if (sHi < sLo) continue;
        const s = uni(sLo, sHi);
        const edge = dir > 0 ? m.y - 1.6 : m.y + m.h + 1.6;
        const xts = peel.map((_, j) => xt + mode * 2.2 * j);
        const x0 = Math.min(s, ...xts) - 1.5, x1 = Math.max(s, ...xts) + 1.5;
        const y0 = dir > 0 ? c + 2 : Math.min(...rows) - 1, y1 = dir > 0 ? Math.max(...rows) + 1 : c - 2;
        if (!free(x0, y0, x1, y1, R, m)) continue;
        const wires = peel.map((sl, j) => {
          const y = c + sl.o, pts = [[s, y], [s + mode * D[j], rows[j]], [xts[j], rows[j]], [xts[j], edge]];
          if (mode > 0) sl.b = s; else { sl.a = s; pts.reverse(); }
          return pts;
        });
        const riser = { wires, nubX0: Math.min(...xts) - 1.3, nubX1: Math.max(...xts) + 1.3, nubY: dir > 0 ? m.y - 1.6 : m.y + m.h, x0, x1 };
        claim(x0, y0, x1, y1, riser);
        R.events.push({ s });
        R.risers.push(riser);
        R.noTap.push([s - 7, s + 7]);
        m.ports[dir > 0 ? 'T' : 'B'].push(...xts.map(v => v - mx));
        return true;
      }
    }
  }
  return false;
}

function addDetour(R) {
  const st = STYLE[R.style], len = R.x1 - R.x0;
  const [lo, hi] = allExtent(R);
  const dirs = R.lane === 0 ? [1] : R.lane === 2 ? [-1] : shuffle([1, -1]);
  for (const dir of dirs) {
    const dy = dir * (R.style === 'pcb' ? uni(3, 5) : pick([4, 5]));
    const b0 = R.x0 + uni(0.15, 0.4) * len, b1 = Math.min(b0 + uni(0.25, 0.45) * len, R.x1 - 12);
    const km = Math.max(Math.abs(lo), Math.abs(hi)) * 0.414 + 2;
    const y0 = R.c + Math.min(lo, lo + dy) - st.pad - 1.2, y1 = R.c + Math.max(hi, hi + dy) + st.pad + 1.2;
    if (b1 - b0 < 12 || !free(b0 - km, y0, b1 + km, y1, R)) continue;
    R.detour = { b0, b1, dy };
    claim(b0 - km, y0, b1 + km, y1, R);
    R.noTap.push([b0 - km - 4, b1 + km + 4]);
    return;
  }
}

const blocked = (R, x, pad) => R.noTap.some(([a, b]) => x > a - pad && x < b + pad);

function addClamps(R) {
  if (R.style === 'pipe' || R.style === 'braid' || R.short) return;
  const n = R.style === 'pcb' ? 0 : int(0, 2);
  for (let i = 0; i < n; i++) {
    const x = uni(R.x0 + 12, R.x1 - 12);
    if (R.x1 - R.x0 < 40 || blocked(R, x, 5)) continue;
    R.clamps.push(x);
    R.noTap.push([x - 4.5, x + 4.5]);
  }
  if (R.style !== 'pcb') return;
  for (let i = int(1, 2); i > 0; i--) {
    const x = uni(R.x0 + 10, R.x1 - 10);
    const dir = R.lane === 0 ? 1 : R.lane === 2 ? -1 : pick([1, -1]);
    const [lo, hi] = allExtent(R);
    const y0 = R.c + (dir > 0 ? hi : lo), y1 = y0 + dir * 2.2;
    const bx0 = x - 1.8, bx1 = x + 1.8, by0 = Math.min(y0, y1 + dir * 3.6) - 0.6, by1 = Math.max(y0, y1 + dir * 3.6) + 0.6;
    if (blocked(R, x, 3) || !free(bx0, dir > 0 ? y0 + 0.8 : by0, bx1, dir > 0 ? by1 : y0 - 0.8, R)) continue;
    R.stubs.push({ x, y0, y1, dir });
    R.noTap.push([x - 4, x + 4]);
    claim(bx0, by0, bx1, by1, R);
  }
}

// Tap point on a run's facing edge, or null where the run is busy (plugs, bends, collars, clamps)
function edgeAt(runs, x, dir) {
  for (const R of runs) {
    for (const sh of SHIFTS) {
      const xr = x + sh;
      if (xr < R.x0 + 8 || xr > R.x1 - 8) continue;
      if (!STYLE[R.style].tap || blocked(R, xr, 0)) return null;
      const e = extentAt(R, xr);
      if (!e) return null;
      const pad = STYLE[R.style].pad;
      return { y: R.c + (dir > 0 ? e[1] + pad : e[0] - pad), run: R };
    }
  }
  return null;
}

function tryTap(lanes, ch, part, x, y, owner) {
  const opts = [];
  for (const lead of ['L', 'R']) for (const up of [true, false]) opts.push([lead, up]);
  for (const [lead, up] of shuffle(opts)) {
    const lx = x + part[lead][0], ly = y + part[lead][1];
    const sh = chance(0.45) ? pick([-2, 2]) : 0;
    const hit = edgeAt(lanes[up ? ch : ch + 1], lx + sh, up ? 1 : -1);
    if (!hit) continue;
    const v = Math.sign(hit.y - ly), dist = Math.abs(hit.y - ly);
    if (dist < 1.2 || (sh && dist < 1.4 + Math.abs(sh) + 1.2)) continue;
    const pts = sh
      ? [[lx, ly], [lx, ly + v * 1.4], [lx + sh, ly + v * (1.4 + Math.abs(sh))], [lx + sh, hit.y]]
      : [[lx, ly], [lx, hit.y]];
    const x0 = Math.min(lx, lx + sh) - 0.7, x1 = Math.max(lx, lx + sh) + 0.7;
    if (!free(x0, Math.min(ly, hit.y) + 0.4, x1, Math.max(ly, hit.y) - 0.4, hit.run, owner)) continue;
    return { pts, x0, x1, y0: Math.min(ly, hit.y), y1: Math.max(ly, hit.y), dot: [lx + sh, hit.y], via: sh ? pts[2] : null };
  }
  return null;
}

function tryChain(prev, part, x, y, owner) {
  if (!prev) return null;
  const [rx, ry] = prev.pt, lx = x + part.L[0], ly = y + part.L[1];
  const dx = lx - rx, dy = ly - ry;
  if (dx < 2 || dx > 22 || Math.abs(dy) > dx - 2) return null;
  const mid = rx + (dx - Math.abs(dy)) / 2;
  const pts = Math.abs(dy) < 0.6 ? [[rx, ry], [lx, ry]] : [[rx, ry], [mid, ry], [mid + Math.abs(dy), ly], [lx, ly]];
  const y0 = Math.min(ry, ly) - 0.5, y1 = Math.max(ry, ly) + 0.5;
  if (!free(rx + 0.3, y0, lx - 0.3, y1, prev.owner, owner)) return null;
  return { pts, x0: rx, x1: lx, y0, y1 };
}

function placeParts(lanes) {
  const draws = [];
  for (let ch = 0; ch < 2; ch++) {
    const yLo = LANE_Y[ch] + 3, yHi = LANE_Y[ch + 1] - 3;
    // Denser stretches with chained parts read as exposed board
    const zones = [];
    for (let i = int(1, 2); i > 0; i--) { const a = uni(0, W - 160); zones.push([a, a + uni(70, 160)]); }
    let x = uni(2, 10), prev = null;
    while (x < W - 2) {
      const pcb = zones.some(([a, b]) => x >= a && x <= b);
      const part = weighted(PARTS);
      const y = uni(yLo, yHi - part.h);
      const owner = {};
      if (!free(x - 1, y - 0.8, x + part.w + 1, y + part.h + 0.8)) { x += uni(2, 5); continue; }
      const chainFirst = chance(pcb ? 0.85 : 0.35);
      const conn = chainFirst
        ? tryChain(prev, part, x, y, owner) || tryTap(lanes, ch, part, x, y, owner)
        : tryTap(lanes, ch, part, x, y, owner) || tryChain(prev, part, x, y, owner);
      if (!conn) { x += uni(2, 5); continue; }
      claim(x - 1, y - 0.8, x + part.w + 1, y + part.h + 0.8, owner);
      claim(conn.x0, conn.y0, conn.x1, conn.y1, owner);
      draws.push({ part, x, y, conn });
      prev = { pt: [x + part.R[0], y + part.R[1]], owner };
      x += part.w + (pcb ? uni(2, 7) : uni(4, 16));
    }
  }
  return draws;
}

function drawPart({ part, x, y, conn }) {
  part.draw(x, y);
  circle('solid', x + part.L[0], y + part.L[1], 0.5);
  if (part.R[0] !== part.L[0]) circle('solid', x + part.R[0], y + part.R[1], 0.5);
  poly('fine', conn.pts);
  if (conn.dot) circle('solid', conn.dot[0], conn.dot[1], 0.85);
  if (conn.via) circle('fine', conn.via[0], conn.via[1], 0.8);
}

export function generateGreebles(seed) {
  S = seed | 0;
  DX = 0;
  grid = Array.from({ length: NCELL }, () => []);
  buf = Object.fromEntries(LAYERS.map(([k]) => [k, '']));

  const mods = placeModules();
  const lanes = buildRuns(mods);
  const runs = lanes.flat();
  for (const R of runs) {
    const st = STYLE[R.style];
    if (!st.events || R.x1 - R.x0 < 60) continue;
    let spare = R.slots.length - 1;
    for (const dir of R.lane === 0 ? [1] : R.lane === 2 ? [-1] : shuffle([1, -1])) {
      if (spare < 1 || !chance(0.5)) continue;
      const k = spare >= 2 && R.slots.length >= 3 && chance(0.35) ? 2 : 1;
      if (tryRiser(R, dir, k, mods)) spare -= k;
    }
  }
  for (const R of runs) if (STYLE[R.style].detour && !R.events.length && !R.short && R.x1 - R.x0 > 56 && (R.style === 'pcb' || chance(0.6))) addDetour(R);
  for (const R of runs) addClamps(R);
  // Ports tell boards where to land their edge traces
  for (const R of runs) {
    for (const s of R.slots) {
      if (s.a <= R.x0 + 0.01) R.left.ports.R.push(R.c + s.o);
      if (s.b >= R.x1 - 0.01) R.right.ports.L.push(R.c + s.o);
    }
  }
  const parts = placeParts(lanes);

  for (const m of mods) wrapped(m.x, m.x + m.w, () => m.draw(m));
  for (const R of runs) {
    wrapped(R.x0, R.x1, () => STYLE[R.style].draw(R));
    for (const r of R.risers) wrapped(r.x0, r.x1, () => drawRiser(r));
  }
  for (const p of parts) wrapped(Math.min(p.x, p.conn.x0) - 1, Math.max(p.x + p.part.w, p.conn.x1) + 1, () => drawPart(p));

  let svg = '<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="48" viewBox="0 0 1280 48" fill="none" stroke="#fff" stroke-width=".8" stroke-linecap="round" stroke-linejoin="round">\n';
  for (const [k, attr] of LAYERS) {
    if (buf[k]) svg += '<path' + attr + ' d="' + buf[k].replace(/([^\d.])0\./g, '$1.') + '"/>\n';
  }
  return svg + '</svg>\n';
}

if (typeof document !== 'undefined') {
  try {
    const seed = crypto.getRandomValues(new Uint32Array(1))[0];
    const url = URL.createObjectURL(new Blob([generateGreebles(seed)], { type: 'image/svg+xml' }));
    document.documentElement.style.setProperty('--footer-greebles', `url("${url}")`);
    // Exposed so a favorite layout can be baked into the static fallback
    document.documentElement.dataset.greebleSeed = seed;
  } catch (err) {
    document.documentElement.dataset.greebles = 'static';
    console.warn('Footer greebles fell back to the static strip:', err);
  }
}
