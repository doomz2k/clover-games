// BugGenerator: the cute-but-troublesome pests that crawl the soil layer,
// and the helpful ladybird that carries them away.

import { mulberry32 } from '../core/util.js';
import { tween, Ease } from '../core/tween.js';

const OUTLINE = 0x1e1e46;
const BUG_COLORS = [0xb07fe0, 0x5a9e9e, 0x9e8a5a, 0x7f8ae0, 0xc98ab5];

/**
 * makePest(seed) - googly-eyed round bug with a wobbly walk cycle.
 * Patrols between patrolMin/patrolMax once those are set; tick(dt) drives it.
 */
export function makePest(seed = 1) {
  const rng = mulberry32(seed * 7919 + 13);
  const c = new PIXI.Container();
  const col = BUG_COLORS[Math.floor(rng() * BUG_COLORS.length)];

  const legs = new PIXI.Graphics();
  const body = new PIXI.Container();
  const g = new PIXI.Graphics();
  g.ellipse(0, 0, 16, 13).fill(col).stroke({ width: 3.5, color: OUTLINE });
  g.circle(-14, -4, 8).fill(col).stroke({ width: 3.5, color: OUTLINE });
  // antennae
  g.moveTo(-18, -9).quadraticCurveTo(-24, -16, -22, -20).stroke({ width: 2.5, color: OUTLINE, cap: 'round' });
  g.circle(-22, -21, 2).fill(OUTLINE);
  body.addChild(g);
  // googly eyes
  const eyeL = new PIXI.Graphics().circle(0, 0, 4.5).fill(0xffffff).stroke({ width: 2, color: OUTLINE });
  eyeL.circle(1, 0.5, 2).fill(OUTLINE);
  eyeL.x = -16; eyeL.y = -6;
  const eyeR = new PIXI.Graphics().circle(0, 0, 4.5).fill(0xffffff).stroke({ width: 2, color: OUTLINE });
  eyeR.circle(1, 0.5, 2).fill(OUTLINE);
  eyeR.x = -10; eyeR.y = -7;
  body.addChild(eyeL, eyeR);
  c.addChild(legs, body);

  let t = rng() * 10;
  let dir = rng() < 0.5 ? 1 : -1;
  const speed = 16 + rng() * 14;
  c.patrolMin = 0;
  c.patrolMax = 100;
  c.walking = true;

  c.tick = (dtMS) => {
    const dt = dtMS / 1000;
    t += dt;
    if (c.walking) {
      c.x += dir * speed * dt;
      if (c.x > c.patrolMax) { dir = -1; }
      if (c.x < c.patrolMin) { dir = 1; }
      body.scale.x = dir < 0 ? 1 : -1;
      body.rotation = Math.sin(t * 9) * 0.09;
      body.y = -Math.abs(Math.sin(t * 9)) * 2;
    }
    legs.clear();
    for (let i = -1; i <= 1; i++) {
      const wig = Math.sin(t * 9 + i * 2) * 3;
      legs.moveTo(i * 8 - 2, 6).lineTo(i * 8 - 4 + wig, 14).stroke({ width: 2.5, color: OUTLINE, cap: 'round' });
    }
  };

  /** Pop: squash and vanish (used when the ladybird gets it). */
  c.pop = async () => {
    c.walking = false;
    await tween(c.scale, { x: 1.3, y: 0.5 }, 120);
    await tween(c.scale, { x: 0.01, y: 0.01 }, 160, { ease: Ease.inQuad });
    c.visible = false;
  };

  return c;
}

/** makeLadybird() - swoops in, grabs a pest, carries it off. */
export function makeLadybird() {
  const c = new PIXI.Container();
  const g = new PIXI.Graphics();
  // wings/dome
  g.circle(0, 0, 16).fill(0xf25c54).stroke({ width: 3.5, color: OUTLINE });
  g.moveTo(0, -16).lineTo(0, 14).stroke({ width: 3, color: OUTLINE });
  g.circle(-7, -5, 3.5).fill(OUTLINE);
  g.circle(7, -3, 3.5).fill(OUTLINE);
  g.circle(-5, 7, 3).fill(OUTLINE);
  g.circle(6, 8, 3).fill(OUTLINE);
  // head
  g.circle(0, -17, 7).fill(0x3a3a5e).stroke({ width: 3, color: OUTLINE });
  g.circle(-3, -19, 2).fill(0xffffff);
  g.circle(3, -19, 2).fill(0xffffff);
  c.addChild(g);

  let t = 0;
  c.tick = (dtMS) => {
    t += dtMS / 1000;
    g.y = Math.sin(t * 12) * 1.5; // busy little hover
  };

  /**
   * Swoop from off-screen to (x, y), linger, then exit carrying the catch.
   * The caller pops the pest at the moment of contact.
   */
  c.swoop = async (fromX, fromY, x, y, onGrab) => {
    c.x = fromX; c.y = fromY;
    c.visible = true;
    const state = { t: 0 };
    await tween(state, { t: 1 }, 700, {
      ease: Ease.inOutQuad,
      onUpdate: () => {
        c.x = fromX + (x - fromX) * state.t;
        c.y = fromY + (y - fromY) * state.t - Math.sin(state.t * Math.PI) * 120;
      },
    });
    await onGrab?.();
    await tween(c, { y: -80, x: x + 160 }, 700, { ease: Ease.inQuad });
    c.visible = false;
  };

  return c;
}
