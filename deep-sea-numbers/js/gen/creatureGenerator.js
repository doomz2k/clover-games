// CreatureGenerator: builds a friendly sea creature PIXI.Container from a
// seed. Seed drives body shape, colour scheme, eye count, fin style and
// pattern. Every creature is unmistakably friendly: huge eyes, round shapes,
// permanent smile. Exposes tick() for idle swimming animation and
// setMood()/jump()/wobble()/celebrate() hooks, mirroring the Space Phonics
// alien API so the scenes can drive either.

import { mulberry32, pick } from '../core/util.js';
import { tween, Ease } from '../core/tween.js';

function hsl(h, s, l) {
  h = ((h % 360) + 360) % 360; s /= 100; l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return (Math.round(f(0) * 255) << 16) | (Math.round(f(8) * 255) << 8) | Math.round(f(4) * 255);
}

const OUTLINE = 0x1e1e46;

export function makeCreature(seed, size = 120) {
  const rng = mulberry32(seed);
  const root = new PIXI.Container();
  const s = size / 100;

  const hue = rng() * 360;
  const bodyCol = hsl(hue, 70 + rng() * 20, 55 + rng() * 12);
  const darkCol = hsl(hue, 75, 38);
  const bellyCol = hsl(hue + 30, 65, 74);
  const finCol = hsl(hue + 18, 75, 48);

  const bodyShape = pick(rng, ['round', 'oval', 'tall', 'blob']);
  const eyeCount = pick(rng, [1, 2, 2, 2, 3]);
  const pattern = pick(rng, ['none', 'stripes', 'spots', 'spots']);

  const M = {
    round: { rx: 40, ry: 40, cy: 0 },
    oval:  { rx: 46, ry: 34, cy: 2 },
    tall:  { rx: 34, ry: 46, cy: 0 },
    blob:  { rx: 42, ry: 38, cy: 4 },
  }[bodyShape];

  // --- Tail fin (behind body, wiggles) ---
  const tail = new PIXI.Container();
  const tailG = new PIXI.Graphics()
    .poly([0, 0, 24 * s, -16 * s, 20 * s, 0, 24 * s, 16 * s])
    .fill(finCol)
    .poly([0, 0, 24 * s, -16 * s, 20 * s, 0, 24 * s, 16 * s])
    .stroke({ width: 4 * s, color: OUTLINE, join: 'round' });
  tail.addChild(tailG);
  tail.x = M.rx * 0.92 * s;
  tail.y = M.cy * s;
  root.addChild(tail);

  // --- Side fins ---
  const fins = [];
  const finCount = pick(rng, [1, 2]);
  const finLayer = new PIXI.Container();
  for (let i = 0; i < finCount; i++) {
    const fin = new PIXI.Container();
    const g = new PIXI.Graphics()
      .poly([0, 0, 16 * s, 10 * s, 4 * s, 18 * s])
      .fill(finCol)
      .poly([0, 0, 16 * s, 10 * s, 4 * s, 18 * s])
      .stroke({ width: 3.5 * s, color: OUTLINE, join: 'round' });
    fin.addChild(g);
    fin.x = (i === 0 ? 4 : -14) * s;
    fin.y = (M.cy + M.ry * 0.45) * s;
    fin.baseRot = 0.25;
    finLayer.addChild(fin);
    fins.push(fin);
  }
  root.addChild(finLayer);

  // --- Body ---
  const bodyWrap = new PIXI.Container();
  const body = new PIXI.Graphics()
    .ellipse(0, M.cy * s, M.rx * s, M.ry * s)
    .fill(bodyCol)
    .stroke({ width: 4.5 * s, color: OUTLINE });
  body.ellipse(-M.rx * 0.15 * s, (M.cy + M.ry * 0.42) * s, M.rx * 0.55 * s, M.ry * 0.38 * s).fill(bellyCol);
  bodyWrap.addChild(body);

  // Pattern
  if (pattern === 'stripes') {
    const p = new PIXI.Graphics();
    for (let i = 0; i < 3; i++) {
      const x = (-M.rx * 0.45 + i * M.rx * 0.42) * s;
      p.moveTo(x, (M.cy - M.ry * 0.85) * s)
        .quadraticCurveTo(x + 6 * s, M.cy * s, x, (M.cy + M.ry * 0.5) * s)
        .stroke({ width: 7 * s, color: darkCol, cap: 'round' });
    }
    p.alpha = 0.55;
    bodyWrap.addChild(p);
  } else if (pattern === 'spots') {
    const p = new PIXI.Graphics();
    const n = 3 + Math.floor(rng() * 4);
    for (let i = 0; i < n; i++) {
      const a = rng() * Math.PI * 2;
      const d = rng() * 0.6 + 0.15;
      p.circle(Math.cos(a) * M.rx * d * s, (M.cy + Math.sin(a) * M.ry * d) * s, (3.5 + rng() * 3.5) * s)
        .fill({ color: darkCol, alpha: 0.5 });
    }
    bodyWrap.addChild(p);
  }

  // Dorsal fin
  if (rng() < 0.7) {
    const dorsal = new PIXI.Graphics()
      .poly([-10 * s, (M.cy - M.ry * 0.92) * s, 4 * s, (M.cy - M.ry - 16) * s, 12 * s, (M.cy - M.ry * 0.85) * s])
      .fill(finCol)
      .poly([-10 * s, (M.cy - M.ry * 0.92) * s, 4 * s, (M.cy - M.ry - 16) * s, 12 * s, (M.cy - M.ry * 0.85) * s])
      .stroke({ width: 3.5 * s, color: OUTLINE, join: 'round' });
    bodyWrap.addChild(dorsal);
  }

  // --- Eyes ---
  const eyeR = (eyeCount === 1 ? 14 : eyeCount === 2 ? 10.5 : 8) * s;
  const eyeY = (M.cy - M.ry * 0.28) * s;
  const spread = M.rx * 0.45 * s;
  const eyePositions = {
    1: [[-M.rx * 0.25 * s, eyeY]],
    2: [[-spread, eyeY], [spread * 0.35, eyeY]],
    3: [[-spread, eyeY], [-spread * 0.1, eyeY - 4 * s], [spread * 0.7, eyeY]],
  }[eyeCount];
  const eyes = [];
  for (const [ex, ey] of eyePositions) {
    const eye = new PIXI.Container();
    const white = new PIXI.Graphics().circle(0, 0, eyeR).fill(0xffffff).stroke({ width: 3.5 * s, color: OUTLINE });
    const pupil = new PIXI.Graphics().circle(0, 0, eyeR * 0.45).fill(OUTLINE);
    pupil.y = eyeR * 0.1;
    const glint = new PIXI.Graphics().circle(eyeR * 0.15, -eyeR * 0.15, eyeR * 0.16).fill(0xffffff);
    eye.addChild(white, pupil, glint);
    eye.x = ex; eye.y = ey;
    bodyWrap.addChild(eye);
    eyes.push(eye);
  }

  // --- Mouth ---
  const mouth = new PIXI.Graphics();
  const mouthY = (M.cy + M.ry * 0.28) * s;
  const mouthX = -M.rx * 0.2 * s;
  const mw = M.rx * 0.4 * s;
  function drawMouth(mood) {
    mouth.clear();
    if (mood === 'sad') {
      mouth.moveTo(mouthX - mw * 0.7, mouthY + 6 * s)
        .quadraticCurveTo(mouthX, mouthY - 6 * s, mouthX + mw * 0.7, mouthY + 6 * s)
        .stroke({ width: 4.5 * s, color: OUTLINE, cap: 'round' });
    } else if (mood === 'happy' || mood === 'celebrate') {
      mouth.moveTo(mouthX - mw, mouthY)
        .quadraticCurveTo(mouthX, mouthY + 16 * s, mouthX + mw, mouthY)
        .closePath()
        .fill(0x7c2d3e)
        .stroke({ width: 4.5 * s, color: OUTLINE, join: 'round', cap: 'round' });
    } else {
      mouth.moveTo(mouthX - mw * 0.8, mouthY)
        .quadraticCurveTo(mouthX, mouthY + 9 * s, mouthX + mw * 0.8, mouthY)
        .stroke({ width: 4.5 * s, color: OUTLINE, cap: 'round' });
    }
  }
  drawMouth('idle');
  bodyWrap.addChild(mouth);
  root.addChild(bodyWrap);

  // --- Animation state (same public API as the Space Phonics alien) ---
  let t = rng() * 100;
  let blinkTimer = 1.5 + rng() * 3;
  let mood = 'idle';
  let wiggleBoost = 0;
  let busy = false;

  const eyeScaleFor = (m) => (m === 'celebrate' ? 1.25 : m === 'sad' ? 0.9 : 1);

  root.setMood = (m) => {
    mood = m;
    drawMouth(m);
    if (m === 'happy' || m === 'celebrate') wiggleBoost = 1;
    for (const eye of eyes) {
      const target = eyeScaleFor(m);
      tween(eye.scale, { x: target, y: target }, 200, { ease: Ease.outBack });
    }
  };

  root.jump = async (height = 26 * s) => {
    busy = true;
    await tween(bodyWrap, { y: -height }, 180, { ease: Ease.outQuad });
    await tween(bodyWrap, { y: 0 }, 280, { ease: Ease.outBounce });
    busy = false;
  };

  root.celebrate = async () => {
    busy = true;
    root.setMood('celebrate');
    await tween(bodyWrap, { y: -40 * s, rotation: Math.PI * 2 }, 550, { ease: Ease.outQuad });
    bodyWrap.rotation = 0;
    await tween(bodyWrap, { y: 0 }, 350, { ease: Ease.outBounce });
    busy = false;
    await root.jump(20 * s);
    await root.jump(28 * s);
  };

  root.wobble = async () => {
    busy = true;
    root.setMood('sad');
    for (const r of [-0.12, 0.12, -0.08, 0.08, 0]) await tween(bodyWrap, { rotation: r }, 90);
    busy = false;
  };

  root.tick = (dtMS) => {
    const dt = dtMS / 1000;
    t += dt;
    if (!busy) bodyWrap.y = Math.sin(t * 1.8) * 4 * s;
    tail.rotation = Math.sin(t * 5) * (0.18 + wiggleBoost * 0.3);
    blinkTimer -= dt;
    if (blinkTimer <= 0) {
      blinkTimer = 2 + rng() * 3.5;
      for (const eye of eyes) {
        tween(eye.scale, { y: 0.08 }, 70).then(() => tween(eye.scale, { y: eyeScaleFor(mood) }, 90));
      }
    }
    wiggleBoost = Math.max(0, wiggleBoost - dt * 0.8);
    fins.forEach((fin, i) => {
      fin.rotation = fin.baseRot + Math.sin(t * 4 + i * 1.7) * (0.15 + wiggleBoost * 0.3);
    });
  };

  return root;
}
