// AlienGenerator: builds a friendly alien PIXI.Container from a seed.
// Seed drives body shape, colour scheme, eye count (1-4), limb count and
// antenna style. Every alien is unmistakably friendly: huge eyes, round
// shapes, permanent smile. Exposes tick() for idle animation and
// setMood()/jump()/celebrate() hooks for the game to drive reactions.

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

export function makeAlien(seed, size = 120) {
  const rng = mulberry32(seed);
  const root = new PIXI.Container();
  const s = size / 100; // all geometry authored on a ~100 unit grid

  const hue = rng() * 360;
  const bodyCol = hsl(hue, 65 + rng() * 25, 55 + rng() * 12);
  const darkCol = hsl(hue, 70, 38);
  const bellyCol = hsl(hue + 25, 60, 72);

  const bodyShape = pick(rng, ['round', 'bean', 'tall', 'squat']);
  const eyeCount = 1 + Math.floor(rng() * 4);
  const limbCount = pick(rng, [2, 2, 3, 4]);
  const antennaStyle = pick(rng, ['none', 'ball', 'ball', 'double', 'zigzag']);

  // Body metrics per shape (half-width, half-height, y-centre).
  const M = {
    round: { rx: 42, ry: 42, cy: 0 },
    bean:  { rx: 38, ry: 46, cy: 2 },
    tall:  { rx: 32, ry: 50, cy: 0 },
    squat: { rx: 48, ry: 34, cy: 6 },
  }[bodyShape];

  // --- Limbs (behind the body) ---
  const limbs = [];
  const limbLayer = new PIXI.Container();
  for (let i = 0; i < limbCount; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const row = Math.floor(i / 2); // arms then legs
    const limb = new PIXI.Container();
    const len = (26 + rng() * 12) * s;
    const g = new PIXI.Graphics()
      .moveTo(0, 0).lineTo(0, len)
      .stroke({ width: 11 * s, color: bodyCol, cap: 'round' })
      .circle(0, len, 8 * s).fill(bodyCol).stroke({ width: 3.5 * s, color: OUTLINE });
    limb.addChild(g);
    limb.x = side * M.rx * 0.85 * s;
    limb.y = (M.cy + (row === 0 ? 2 : M.ry * 0.55)) * s;
    limb.baseRot = side * (row === 0 ? 1.9 : 0.35); // arms out, legs down
    limb.rotation = limb.baseRot;
    limb.side = side;
    limbLayer.addChild(limb);
    limbs.push(limb);
  }
  root.addChild(limbLayer);

  // --- Body (bobbed as one unit with the face) ---
  const bodyWrap = new PIXI.Container();
  const body = new PIXI.Graphics()
    .ellipse(0, M.cy * s, M.rx * s, M.ry * s)
    .fill(bodyCol)
    .stroke({ width: 4.5 * s, color: OUTLINE });
  body.ellipse(0, (M.cy + M.ry * 0.42) * s, M.rx * 0.55 * s, M.ry * 0.4 * s).fill(bellyCol);
  bodyWrap.addChild(body);

  // --- Antennae ---
  if (antennaStyle !== 'none') {
    const ant = new PIXI.Graphics();
    const topY = (M.cy - M.ry) * s;
    const mk = (x0, lean) => {
      if (antennaStyle === 'zigzag') {
        ant.moveTo(x0, topY).lineTo(x0 + 6 * s * lean, topY - 12 * s)
          .lineTo(x0 - 2 * s * lean, topY - 20 * s)
          .stroke({ width: 4 * s, color: OUTLINE, cap: 'round', join: 'round' });
        ant.circle(x0 - 2 * s * lean, topY - 22 * s, 5 * s).fill(hsl(hue + 140, 90, 65)).stroke({ width: 3 * s, color: OUTLINE });
      } else {
        ant.moveTo(x0, topY).quadraticCurveTo(x0 + 8 * s * lean, topY - 14 * s, x0 + 3 * s * lean, topY - 22 * s)
          .stroke({ width: 4 * s, color: OUTLINE, cap: 'round' });
        ant.circle(x0 + 3 * s * lean, topY - 24 * s, 5.5 * s).fill(hsl(hue + 140, 90, 65)).stroke({ width: 3 * s, color: OUTLINE });
      }
    };
    if (antennaStyle === 'double') { mk(-12 * s, -1); mk(12 * s, 1); }
    else mk(0, rng() < 0.5 ? -1 : 1);
    bodyWrap.addChild(ant);
  }

  // --- Eyes ---
  const eyeLayer = new PIXI.Container();
  const eyeR = (eyeCount === 1 ? 15 : eyeCount === 2 ? 11 : 8.5) * s;
  const eyeY = (M.cy - M.ry * 0.3) * s;
  const spread = M.rx * 0.52 * s;
  const eyePositions = {
    1: [[0, eyeY]],
    2: [[-spread * 0.8, eyeY], [spread * 0.8, eyeY]],
    3: [[-spread, eyeY], [0, eyeY - 6 * s], [spread, eyeY]],
    4: [[-spread, eyeY - 5 * s], [-spread * 0.35, eyeY + 3 * s], [spread * 0.35, eyeY - 5 * s], [spread, eyeY + 3 * s]],
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
    eyeLayer.addChild(eye);
    eyes.push(eye);
  }
  bodyWrap.addChild(eyeLayer);

  // --- Mouth (redrawn per mood) ---
  const mouth = new PIXI.Graphics();
  const mouthY = (M.cy + M.ry * 0.22) * s;
  const mw = M.rx * 0.5 * s;
  function drawMouth(mood) {
    mouth.clear();
    if (mood === 'sad') {
      mouth.moveTo(-mw * 0.7, mouthY + 6 * s)
        .quadraticCurveTo(0, mouthY - 6 * s, mw * 0.7, mouthY + 6 * s)
        .stroke({ width: 4.5 * s, color: OUTLINE, cap: 'round' });
    } else if (mood === 'happy' || mood === 'celebrate') {
      mouth.moveTo(-mw, mouthY)
        .quadraticCurveTo(0, mouthY + 18 * s, mw, mouthY)
        .closePath()
        .fill(0x7c2d3e)
        .stroke({ width: 4.5 * s, color: OUTLINE, join: 'round', cap: 'round' });
    } else { // idle smile
      mouth.moveTo(-mw * 0.8, mouthY)
        .quadraticCurveTo(0, mouthY + 10 * s, mw * 0.8, mouthY)
        .stroke({ width: 4.5 * s, color: OUTLINE, cap: 'round' });
    }
  }
  drawMouth('idle');
  bodyWrap.addChild(mouth);
  root.addChild(bodyWrap);

  // --- Animation state ---
  let t = rng() * 100;
  let blinkTimer = 1.5 + rng() * 3;
  let mood = 'idle';
  let wiggleBoost = 0;

  root.setMood = (m) => {
    mood = m;
    drawMouth(m);
    if (m === 'happy' || m === 'celebrate') wiggleBoost = 1;
    for (const eye of eyes) {
      const target = m === 'celebrate' ? 1.25 : m === 'sad' ? 0.9 : 1;
      tween(eye.scale, { x: target, y: target }, 200, { ease: Ease.outBack });
    }
  };

  let busy = false; // suspends the idle bob while a tween drives bodyWrap

  // Quick happy hop (correct answers, greetings).
  root.jump = async (height = 26 * s) => {
    busy = true;
    const y0 = 0;
    await tween(bodyWrap, { y: y0 - height }, 180, { ease: Ease.outQuad });
    await tween(bodyWrap, { y: y0 }, 280, { ease: Ease.outBounce });
    busy = false;
  };

  // Full celebration: jump + spin + arms up. Used on successful delivery.
  root.celebrate = async () => {
    busy = true;
    root.setMood('celebrate');
    for (const limb of limbs) {
      tween(limb, { rotation: limb.side * 2.6 }, 250, { ease: Ease.outBack });
    }
    await tween(bodyWrap, { y: -40 * s, rotation: Math.PI * 2 }, 550, { ease: Ease.outQuad });
    bodyWrap.rotation = 0;
    await tween(bodyWrap, { y: 0 }, 350, { ease: Ease.outBounce });
    busy = false;
    await root.jump(20 * s);
    await root.jump(28 * s);
  };

  // Worried wobble (wrong answers).
  root.wobble = async () => {
    busy = true;
    root.setMood('sad');
    const seq = [-0.12, 0.12, -0.08, 0.08, 0];
    for (const r of seq) await tween(bodyWrap, { rotation: r }, 90);
    busy = false;
  };

  root.tick = (dtMS) => {
    const dt = dtMS / 1000;
    t += dt;
    // gentle bob
    if (!busy) bodyWrap.y = Math.sin(t * 2.2) * 3 * s;
    // blink
    blinkTimer -= dt;
    if (blinkTimer <= 0) {
      blinkTimer = 2 + rng() * 3.5;
      for (const eye of eyes) {
        tween(eye.scale, { y: 0.08 }, 70).then(() => tween(eye.scale, { y: eyeScaleFor(mood) }, 90));
      }
    }
    // limb wiggle
    wiggleBoost = Math.max(0, wiggleBoost - dt * 0.8);
    limbs.forEach((limb, i) => {
      limb.rotation = limb.baseRot + Math.sin(t * 3 + i * 1.7) * (0.08 + wiggleBoost * 0.35) * limb.side;
    });
  };

  function eyeScaleFor(m) {
    return m === 'celebrate' ? 1.25 : m === 'sad' ? 0.9 : 1;
  }

  return root;
}
