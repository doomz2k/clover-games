// ReefGenerator: builds a seeded coral-reef cluster - sandy mound, branching
// corals, brain corals, sea fans, swaying seaweed and scattered pebbles.
// Used full-width along scene floors and shrunk inside map nodes.

import { mulberry32, pick } from '../core/util.js';

function hsl(h, s, l) {
  h = ((h % 360) + 360) % 360; s /= 100; l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return (Math.round(f(0) * 255) << 16) | (Math.round(f(8) * 255) << 8) | Math.round(f(4) * 255);
}

const OUTLINE = 0x1e1e46;
const CORAL_HUES = [345, 15, 35, 285, 190, 55];

/**
 * makeReef(seed, width, height) -> container with tick(dt) for seaweed sway.
 * The reef sits on a sandy mound spanning `width`, with its base line at
 * y = 0 (place the container at the floor line).
 */
export function makeReef(seed, width = 1280, height = 190) {
  const rng = mulberry32(seed);
  const c = new PIXI.Container();

  // Sandy mound
  const sandCol = hsl(45 + rng() * 15, 45, 68);
  const sand = new PIXI.Graphics();
  sand.moveTo(-width / 2, height);
  sand.lineTo(-width / 2, 40);
  let x = -width / 2;
  while (x < width / 2) {
    const nx = x + 90 + rng() * 140;
    sand.quadraticCurveTo((x + nx) / 2, 40 - (10 + rng() * 26), Math.min(nx, width / 2), 40);
    x = nx;
  }
  sand.lineTo(width / 2, height);
  sand.closePath();
  sand.fill(sandCol);
  c.addChild(sand);

  const weeds = [];
  const items = Math.max(4, Math.floor(width / 150));

  for (let i = 0; i < items; i++) {
    const ix = -width / 2 + (i + 0.5) * (width / items) + (rng() - 0.5) * 60;
    const kind = pick(rng, ['branch', 'brain', 'weed', 'weed', 'fan', 'rock']);
    const hue = pick(rng, CORAL_HUES);

    if (kind === 'branch') {
      const g = new PIXI.Graphics();
      const col = hsl(hue, 70, 60);
      const h = 55 + rng() * 55;
      const branches = 3 + Math.floor(rng() * 3);
      for (let b = 0; b < branches; b++) {
        const bx = (b - branches / 2) * 12;
        g.moveTo(0, 20)
          .quadraticCurveTo(bx * 0.6, -h * 0.4, bx, -h * (0.6 + rng() * 0.4))
          .stroke({ width: 10 + rng() * 5, color: col, cap: 'round' });
      }
      g.moveTo(0, 26);
      g.x = ix; g.y = 26;
      c.addChild(g);
    } else if (kind === 'brain') {
      const g = new PIXI.Graphics();
      const col = hsl(hue, 60, 62);
      const r = 26 + rng() * 22;
      g.circle(0, 0, r).fill(col).stroke({ width: 4, color: OUTLINE });
      for (let w = 0; w < 3; w++) {
        g.moveTo(-r * 0.6, -r * 0.4 + w * r * 0.4)
          .quadraticCurveTo(0, -r * 0.6 + w * r * 0.4, r * 0.6, -r * 0.4 + w * r * 0.4)
          .stroke({ width: 3, color: hsl(hue, 60, 45) });
      }
      g.x = ix; g.y = 24 - r * 0.5;
      c.addChild(g);
    } else if (kind === 'weed') {
      const strands = 2 + Math.floor(rng() * 3);
      const weed = new PIXI.Container();
      for (let w = 0; w < strands; w++) {
        const g = new PIXI.Graphics();
        const h = 60 + rng() * 70;
        const lean = (rng() - 0.5) * 30;
        g.moveTo(0, 0)
          .quadraticCurveTo(lean, -h * 0.5, lean * 0.4, -h)
          .stroke({ width: 8 + rng() * 4, color: hsl(120 + rng() * 40, 55, 38 + rng() * 12), cap: 'round' });
        g.x = (w - strands / 2) * 12;
        weed.addChild(g);
      }
      weed.x = ix; weed.y = 30;
      weed._phase = rng() * Math.PI * 2;
      c.addChild(weed);
      weeds.push(weed);
    } else if (kind === 'fan') {
      const g = new PIXI.Graphics();
      const col = hsl(hue, 65, 58);
      const r = 34 + rng() * 22;
      for (let a = -2; a <= 2; a++) {
        g.moveTo(0, 20)
          .quadraticCurveTo(a * r * 0.3, -r * 0.4, a * r * 0.42, -r)
          .stroke({ width: 6, color: col, cap: 'round' });
      }
      g.x = ix; g.y = 16;
      c.addChild(g);
    } else { // rock
      const g = new PIXI.Graphics();
      const r = 18 + rng() * 18;
      g.circle(0, 0, r).fill(hsl(215, 15, 42)).stroke({ width: 4, color: OUTLINE });
      g.x = ix; g.y = 26 - r * 0.4;
      c.addChild(g);
    }
  }

  // A few pebbles + a tiny starfish accent
  const deco = new PIXI.Graphics();
  for (let i = 0; i < items; i++) {
    deco.circle(-width / 2 + rng() * width, 28 + rng() * 14, 3 + rng() * 4)
      .fill(hsl(45, 30, 55));
  }
  c.addChild(deco);

  let t = rng() * 10;
  c.tick = (dtMS) => {
    t += dtMS / 1000;
    for (const w of weeds) w.rotation = Math.sin(t * 1.1 + w._phase) * 0.06;
  };

  return c;
}
