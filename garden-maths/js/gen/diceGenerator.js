// DiceGenerator: chunky 3D-ish dice drawn with PIXI Graphics. Each die type
// has a distinct silhouette and colour; rollTo(v) tumbles the die with a
// value flicker before landing with a satisfying bounce.

import { tween, Ease } from '../core/tween.js';
import { makeText } from '../core/ui.js';

const OUTLINE = 0x1e1e46;

const STYLES = {
  4:  { fill: 0x7ac74f, dark: 0x4d9930 },
  6:  { fill: 0xf25c54, dark: 0xc93f38 },
  8:  { fill: 0x4cc9f0, dark: 0x2b9cc4 },
  10: { fill: 0xb07fe0, dark: 0x8b57bd },
};

function drawShape(g, sides, r, fill, dark) {
  if (sides === 4) {
    // triangle with a soft inner facet
    g.poly([0, -r * 1.1, r, r * 0.75, -r, r * 0.75]).fill(fill)
      .poly([0, -r * 1.1, r, r * 0.75, -r, r * 0.75]).stroke({ width: 6, color: OUTLINE, join: 'round' });
    g.poly([0, -r * 1.1, 0, r * 0.75, -r, r * 0.75]).fill({ color: dark, alpha: 0.35 });
  } else if (sides === 6) {
    g.roundRect(-r, -r, r * 2, r * 2, r * 0.3).fill(fill)
      .roundRect(-r, -r, r * 2, r * 2, r * 0.3).stroke({ width: 6, color: OUTLINE });
    g.roundRect(-r, -r, r * 0.7, r * 2, r * 0.3).fill({ color: dark, alpha: 0.3 });
  } else if (sides === 8) {
    // diamond (octahedron front face)
    g.poly([0, -r * 1.2, r, 0, 0, r * 1.2, -r, 0]).fill(fill)
      .poly([0, -r * 1.2, r, 0, 0, r * 1.2, -r, 0]).stroke({ width: 6, color: OUTLINE, join: 'round' });
    g.poly([0, -r * 1.2, 0, r * 1.2, -r, 0]).fill({ color: dark, alpha: 0.35 });
  } else {
    // D10 kite
    g.poly([0, -r * 1.25, r * 0.95, -r * 0.1, 0, r * 1.05, -r * 0.95, -r * 0.1]).fill(fill)
      .poly([0, -r * 1.25, r * 0.95, -r * 0.1, 0, r * 1.05, -r * 0.95, -r * 0.1]).stroke({ width: 6, color: OUTLINE, join: 'round' });
    g.poly([0, -r * 1.25, 0, r * 1.05, -r * 0.95, -r * 0.1]).fill({ color: dark, alpha: 0.35 });
  }
}

export function makeDie(sides, r = 52) {
  const c = new PIXI.Container();
  const { fill, dark } = STYLES[sides] || STYLES[6];
  const g = new PIXI.Graphics();
  drawShape(g, sides, r, fill, dark);
  const num = makeText('?', r * 0.95, { fill: 0xffffff, stroke: OUTLINE, strokeWidth: 6, shadow: false });
  num.anchor.set(0.5);
  if (sides === 4) num.y = r * 0.2;
  c.addChild(g, num);
  c.sides = sides;
  c.value = null;

  c.setValue = (v) => {
    c.value = v;
    num.text = String(v);
  };

  /** Tumble animation: spins, flickers values, lands on v with a bounce. */
  c.rollTo = async (v) => {
    const flicks = 7;
    const spin = { r: 0 };
    const spinT = tween(spin, { r: Math.PI * 4 }, flicks * 85 + 200, {
      ease: Ease.outCubic,
      onUpdate: () => { c.rotation = spin.r; },
    });
    for (let i = 0; i < flicks; i++) {
      num.text = String(1 + Math.floor(Math.random() * sides));
      const sc = 1 + Math.sin((i / flicks) * Math.PI) * 0.25;
      c.scale.set(sc);
      await tween({ t: 0 }, { t: 1 }, 85);
    }
    c.setValue(v);
    await spinT;
    c.rotation = 0;
    await tween(c.scale, { x: 1, y: 1 }, 260, { ease: Ease.outBack });
  };

  return c;
}
