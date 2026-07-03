// PlantGenerator: the three flower families, drawn with PIXI Graphics at
// each of the four growth stages, procedurally coloured by hue. The plant's
// origin is the base of its stem (the soil line); it grows upward.
//
// API: makePlant(family, hue, scale)
//   .stage / .setStage(n, animate)  - 0 seed, 1 sprout, 2 bud, 3 full bloom
//   .tick(dt)                       - gentle sway
//   .happySway() / .wilt()          - feedback animations
//   .bloomPulse()                   - golden pulse for celebrations

import { tween, Ease } from '../core/tween.js';
import { mulberry32 } from '../core/util.js';

function hsl(h, s, l) {
  h = ((h % 360) + 360) % 360; s /= 100; l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return (Math.round(f(0) * 255) << 16) | (Math.round(f(8) * 255) << 8) | Math.round(f(4) * 255);
}

const OUTLINE = 0x1e1e46;
const STEM = 0x4a8a3c;
const STEM_DARK = 0x3a6e2e;

export function makePlant(family, hue, s = 1) {
  const root = new PIXI.Container();
  const sway = new PIXI.Container(); // rotates around the base for swaying
  root.addChild(sway);
  let body = null;

  const petalCol = hsl(hue, 80, 60);
  const petalDark = hsl(hue, 80, 45);
  const petalLite = hsl(hue, 75, 74);

  function leaf(g, x, y, dir, size = 1) {
    g.moveTo(x, y)
      .quadraticCurveTo(x + 26 * dir * size, y - 14 * size, x + 34 * dir * size, y + 2 * size)
      .quadraticCurveTo(x + 20 * dir * size, y + 10 * size, x, y)
      .closePath()
      .fill(STEM)
      .stroke({ width: 4, color: OUTLINE });
  }

  function mound(g) {
    g.ellipse(0, 4, 34, 14).fill(0x5e3a20).stroke({ width: 4, color: OUTLINE });
  }

  function drawStage(stage) {
    const c = new PIXI.Container();
    const g = new PIXI.Graphics();
    c.addChild(g);

    if (stage === 0) {
      mound(g);
      g.circle(0, -4, 6).fill(0xb5793c).stroke({ width: 3.5, color: OUTLINE });
    } else if (stage === 1) {
      mound(g);
      g.moveTo(0, 0).quadraticCurveTo(3, -22, 0, -42).stroke({ width: 7, color: STEM, cap: 'round' });
      leaf(g, -2, -26, -1, 0.7);
      leaf(g, 2, -36, 1, 0.7);
      g.circle(0, -46, 7).fill(0x7ac74f).stroke({ width: 4, color: OUTLINE });
    } else if (stage === 2) {
      mound(g);
      g.moveTo(0, 0).quadraticCurveTo(4, -40, 0, -84).stroke({ width: 8, color: STEM, cap: 'round' });
      leaf(g, -2, -36, -1, 1);
      leaf(g, 2, -58, 1, 1);
      // closed bud
      g.moveTo(0, -80)
        .bezierCurveTo(-16, -92, -10, -116, 0, -120)
        .bezierCurveTo(10, -116, 16, -92, 0, -80)
        .fill(petalCol)
        .stroke({ width: 4.5, color: OUTLINE });
      g.moveTo(0, -84).quadraticCurveTo(-3, -100, 0, -114).stroke({ width: 3, color: petalDark });
      // sepals
      g.moveTo(-8, -84).quadraticCurveTo(0, -74, 8, -84).quadraticCurveTo(0, -92, -8, -84)
        .fill(STEM_DARK).stroke({ width: 3.5, color: OUTLINE });
    } else {
      // full bloom, per family
      mound(g);
      if (family === 'sunflower') {
        g.moveTo(0, 0).quadraticCurveTo(5, -60, 0, -128).stroke({ width: 9, color: STEM, cap: 'round' });
        leaf(g, -3, -46, -1, 1.2);
        leaf(g, 3, -78, 1, 1.2);
        const cx = 0, cy = -152;
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * Math.PI * 2;
          g.ellipse(cx + Math.cos(a) * 34, cy + Math.sin(a) * 34, 16, 9)
            .fill(i % 2 ? petalCol : petalLite);
        }
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * Math.PI * 2;
          g.ellipse(cx + Math.cos(a) * 34, cy + Math.sin(a) * 34, 16, 9)
            .stroke({ width: 3.5, color: OUTLINE });
        }
        g.circle(cx, cy, 22).fill(0x7a4a2b).stroke({ width: 4.5, color: OUTLINE });
        g.circle(cx - 6, cy - 6, 6).fill({ color: 0xb5793c, alpha: 0.8 });
      } else if (family === 'rose') {
        g.moveTo(0, 0).quadraticCurveTo(-4, -48, 0, -104).stroke({ width: 8, color: STEM, cap: 'round' });
        leaf(g, -2, -40, -1, 1);
        leaf(g, 2, -66, 1, 1);
        const cx = 0, cy = -128;
        // layered scalloped bloom
        for (let ring = 3; ring >= 1; ring--) {
          const r = ring * 11 + 4;
          const petals = 6 + ring * 2;
          for (let i = 0; i < petals; i++) {
            const a = (i / petals) * Math.PI * 2 + ring;
            g.circle(cx + Math.cos(a) * r * 0.72, cy + Math.sin(a) * r * 0.72, r * 0.55)
              .fill(ring === 1 ? petalLite : ring === 2 ? petalCol : petalDark);
          }
        }
        g.circle(cx, cy, 40).stroke({ width: 4.5, color: OUTLINE });
        g.circle(cx, cy, 8).fill(petalLite).stroke({ width: 3.5, color: OUTLINE });
      } else { // bell
        g.moveTo(0, 0).quadraticCurveTo(6, -60, -2, -108)
          .quadraticCurveTo(-8, -132, -34, -138)
          .stroke({ width: 8, color: STEM, cap: 'round' });
        leaf(g, 0, -42, 1, 1.1);
        leaf(g, -1, -70, -1, 0.9);
        // three hanging bells along the arc
        const bells = [[-34, -132], [-10, -122], [4, -100]];
        bells.forEach(([bx, by], i) => {
          g.moveTo(bx, by).lineTo(bx, by + 10).stroke({ width: 4, color: STEM_DARK, cap: 'round' });
          const w = 15 - i, h = 24 - i * 2;
          g.moveTo(bx - w * 0.55, by + 10)
            .quadraticCurveTo(bx - w, by + 10 + h * 0.7, bx - w * 0.8, by + 10 + h)
            .quadraticCurveTo(bx, by + 16 + h, bx + w * 0.8, by + 10 + h)
            .quadraticCurveTo(bx + w, by + 10 + h * 0.7, bx + w * 0.55, by + 10)
            .closePath()
            .fill(i === 1 ? petalLite : petalCol)
            .stroke({ width: 4, color: OUTLINE });
          g.circle(bx, by + 14 + h, 3.5).fill(petalDark).stroke({ width: 2.5, color: OUTLINE });
        });
      }
    }
    c.scale.set(s);
    return c;
  }

  root.stage = 0;
  body = drawStage(0);
  sway.addChild(body);

  root.setStage = (stage, animate = false) => {
    root.stage = stage;
    const next = drawStage(stage);
    sway.removeChild(body);
    body.destroy({ children: true });
    body = next;
    sway.addChild(body);
    if (animate) {
      body.scale.set(s * 0.55);
      return tween(body.scale, { x: s, y: s }, 500, { ease: Ease.outBack });
    }
    return Promise.resolve();
  };

  let busy = false; // suspends idle sway while a tween drives `sway`

  root.happySway = async () => {
    busy = true;
    for (const r of [0.12, -0.12, 0.07, -0.07, 0]) {
      await tween(sway, { rotation: r }, 110);
    }
    busy = false;
  };

  root.wilt = async () => {
    busy = true;
    await tween(sway, { rotation: -0.3 }, 450, { ease: Ease.inQuad });
    await tween(sway, { rotation: 0 }, 600, { ease: Ease.outQuad });
    busy = false;
  };

  root.bloomPulse = async () => {
    await tween(sway.scale, { x: 1.12, y: 1.12 }, 300, { ease: Ease.outQuad });
    await tween(sway.scale, { x: 1, y: 1 }, 300);
  };

  const rng = mulberry32((hue * 1000) | 0);
  let t = rng() * 10;
  root.tick = (dtMS) => {
    t += dtMS / 1000;
    // taller plants sway more
    if (!busy) sway.rotation = Math.sin(t * 1.4) * (0.015 + root.stage * 0.012);
  };

  return root;
}
