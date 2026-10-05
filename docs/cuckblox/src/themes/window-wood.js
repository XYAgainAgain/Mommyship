// A dim, lamplit wooden window frame kept for any theme that wants it. It paints one
// backdrop-resolution plate: wood everywhere but the panes, which it leaves clear for whatever shows through.
import { Mulberry32 } from '../core/engine.js';

export const WOOD = { base: '#2e2016', lit: '#463122', shade: '#1d140d', lip: '#543b28', sill: '#3a281a', front: '#231810', grain: '#25190f' };
/** The lamplit knitwear blocks and terminal colors that suit this window, one block color per piece. */
export const LAMPLIT = {
  blocks: ['#f2b45c', '#d9714e', '#f3dcae', '#a3b886', '#d98f8f', '#e8c45e', '#c48a5a'],
  frame: '#e0a458',
  text: '#f6dfb5',
  background: '#130d09',
};

/** Paints the frame onto `p`. `layout` is `{ panes: [{ x0, x1, y0, y1 }], sill, width, height }` in backdrop pixels,
 *  with each pane's ranges half-open and its bars at least one pixel wide; `seed` scatters the grain. */
export function paintWoodWindow(p, { panes, sill, width: BW, height: BH }, seed) {
  // The scene seed's own offset, so a window painted from Cozy Storm's seed matches the original grain
  const rng = new Mulberry32(seed + 104729);
  const glass = (x, y) => x >= 0 && x < BW && y >= 0 && y < BH && panes.some((q) => x >= q.x0 && x < q.x1 && y >= q.y0 && y < q.y1);
  p.fillStyle = WOOD.base;
  p.fillRect(0, 0, BW, BH);
  for (const q of panes) p.clearRect(q.x0, q.y0, q.x1 - q.x0, q.y1 - q.y0);
  const wood = (color, x, y, w, h) => {
    p.fillStyle = color;
    p.fillRect(x, y, w, h);
  };
  for (const q of panes) {
    // Each bar catches the lamp on its top and left edges and falls into shade on the others
    wood(WOOD.lit, q.x0 - 1, q.y1, q.x1 - q.x0 + 2, 1);
    wood(WOOD.shade, q.x0 - 1, q.y0 - 1, q.x1 - q.x0 + 2, 1);
    wood(WOOD.lit, q.x1, q.y0, 1, q.y1 - q.y0);
    wood(WOOD.shade, q.x0 - 1, q.y0, 1, q.y1 - q.y0);
  }
  wood(WOOD.lip, 0, sill, BW, 1);
  wood(WOOD.sill, 0, sill + 1, BW, 2);
  wood(WOOD.shade, 0, sill + 3, BW, 1);
  wood(WOOD.front, 0, sill + 4, BW, BH - sill - 4);
  p.fillStyle = WOOD.grain;
  for (let i = 0; i < 70; i++) {
    const x = Math.floor(rng.next() * BW);
    const y = Math.floor(rng.next() * BH);
    if (!glass(x, y)) p.fillRect(x, y, 1, 1);
  }
  // The glass: a soft shadow under each pane's top and left lip, and two faint glare streaks
  p.fillStyle = '#0b0806';
  p.globalAlpha = 0.3;
  for (const q of panes) {
    p.fillRect(q.x0, q.y0, q.x1 - q.x0, 1);
    p.fillRect(q.x0, q.y0 + 1, 1, q.y1 - q.y0 - 1);
  }
  p.fillStyle = '#c8d4e0';
  for (const [x0, alpha] of [[34, 0.05], [41, 0.04]]) {
    p.globalAlpha = alpha;
    for (let y = 0; y < BH; y++) {
      const x = Math.round(x0 - y * 0.35);
      if (glass(x, y)) p.fillRect(x, y, 1, 1);
    }
  }
  p.globalAlpha = 1;
}
