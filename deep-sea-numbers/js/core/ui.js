// Shared UI kit for Deep Sea Numbers: text styles, chunky buttons, answer
// cards, plus the layered ocean background with rising bubbles, drifting
// fish silhouettes and surface light rays. The map scrolls VERTICALLY
// (diving deeper), so parallax here is on the y axis.

import { rand, randPick, lerp, clamp } from './util.js';
import { tween, Ease } from './tween.js';
import { sfxTap } from './audio.js';

export const FONT = 'Fredoka One';
export const COLORS = {
  deep: 0x06294e,
  gold: 0xffd75e,
  goldDark: 0xb8860b,
  cardFill: 0x0c3560,
  cardBorder: 0x3d8fc9,
  text: 0xffffff,
  good: 0x7ac74f,
  bad: 0xf25c54,
};

export function makeText(text, size, opts = {}) {
  return new PIXI.Text({
    text,
    style: {
      fontFamily: FONT,
      fontSize: size,
      fill: opts.fill ?? COLORS.text,
      align: 'center',
      dropShadow: opts.shadow === false ? false : {
        color: 0x000000, alpha: 0.4, blur: 4, distance: 3, angle: Math.PI / 3,
      },
      wordWrap: !!opts.wrap,
      wordWrapWidth: opts.wrap || 0,
      ...(opts.stroke ? { stroke: { color: opts.stroke, width: opts.strokeWidth ?? 6 } } : {}),
    },
  });
}

export function makeButton(label, { width = 280, height = 84, fill = COLORS.gold, edge = COLORS.goldDark, textColor = 0x06294e, fontSize = 34 } = {}) {
  const c = new PIXI.Container();
  const shadow = new PIXI.Graphics().roundRect(-width / 2, -height / 2 + 7, width, height, height / 2).fill(edge);
  const face = new PIXI.Graphics().roundRect(-width / 2, -height / 2, width, height, height / 2).fill(fill);
  const txt = makeText(label, fontSize, { fill: textColor, shadow: false });
  txt.anchor.set(0.5);
  c.addChild(shadow, face, txt);
  c.face = face;
  c.label_ = txt;
  c.eventMode = 'static';
  c.cursor = 'pointer';
  c.on('pointerdown', () => { face.y = 5; txt.y = 5; });
  const up = () => { face.y = 0; txt.y = 0; };
  c.on('pointerup', up);
  c.on('pointerupoutside', up);
  c.on('pointertap', () => sfxTap());
  return c;
}

export function makeCard(width, height, { fill = COLORS.cardFill, border = COLORS.cardBorder } = {}) {
  const c = new PIXI.Container();
  const shadow = new PIXI.Graphics().roundRect(-width / 2 + 5, -height / 2 + 9, width, height, 26).fill({ color: 0x000000, alpha: 0.35 });
  const bg = new PIXI.Graphics()
    .roundRect(-width / 2, -height / 2, width, height, 26).fill(fill)
    .roundRect(-width / 2, -height / 2, width, height, 26).stroke({ width: 6, color: border });
  const sheen = new PIXI.Graphics()
    .roundRect(-width / 2 + 8, -height / 2 + 8, width - 16, height * 0.42, 20)
    .fill({ color: 0xffffff, alpha: 0.07 });
  c.addChild(shadow, bg, sheen);
  c.cardW = width;
  c.cardH = height;
  c.setBorder = (color, w = 6) => {
    bg.clear();
    bg.roundRect(-width / 2, -height / 2, width, height, 26).fill(fill)
      .roundRect(-width / 2, -height / 2, width, height, 26).stroke({ width: w, color });
  };
  return c;
}

export function popIn(obj, delay = 0, duration = 350) {
  const sx = obj.scale.x, sy = obj.scale.y;
  obj.scale.set(0.01);
  return tween(obj.scale, { x: sx, y: sy }, duration, { delay, ease: Ease.outBack });
}

// ---------------------------------------------------------------------------
// Ocean background
// ---------------------------------------------------------------------------

const SURFACE = [0x2a, 0xa4, 0xd8];
const ABYSS = [0x01, 0x0c, 0x1d];

function waterColor(t) {
  t = clamp(t, 0, 1);
  // ease toward dark so the top third feels bright
  const k = t * t * 0.85 + t * 0.15;
  return (Math.round(lerp(SURFACE[0], ABYSS[0], k)) << 16)
    | (Math.round(lerp(SURFACE[1], ABYSS[1], k)) << 8)
    | Math.round(lerp(SURFACE[2], ABYSS[2], k));
}

/**
 * makeOcean(viewW, viewH, worldHeight, { depthT })
 * worldHeight > 0: scrollable dive map; setScroll(y) parallax-scrolls layers.
 * worldHeight = 0: fixed scene backdrop; depthT (0..1) picks how deep the
 * water colours are.
 * Returns { container, tick(dt), setScroll(y) }.
 */
export function makeOcean(viewW, viewH, worldHeight = 0, { depthT = 0 } = {}) {
  const container = new PIXI.Container();
  const totalH = worldHeight + viewH;

  // --- gradient water (factor 1) ---
  const grad = new PIXI.Graphics();
  const bands = 24;
  for (let i = 0; i < bands; i++) {
    const t0 = i / bands;
    const from = worldHeight > 0 ? t0 : lerp(depthT * 0.75, depthT * 0.75 + 0.25, t0);
    grad.rect(0, t0 * totalH, viewW, totalH / bands + 2).fill(waterColor(from));
  }
  container.addChild(grad);

  // --- light rays near the surface ---
  const rays = new PIXI.Container();
  if (worldHeight === 0 ? depthT < 0.35 : true) {
    for (let i = 0; i < 5; i++) {
      const ray = new PIXI.Graphics()
        .poly([0, 0, 90 + rand() * 60, 0, 220 + rand() * 120, viewH * 0.9, 70, viewH * 0.9])
        .fill({ color: 0xffffff, alpha: 0.05 + rand() * 0.04 });
      ray.x = (i / 5) * viewW + rand() * 120;
      ray.y = -20;
      ray.rotation = 0.12 + rand() * 0.1;
      ray._phase = rand() * Math.PI * 2;
      rays.addChild(ray);
    }
  }
  container.addChild(rays);

  // --- far fish silhouettes (factor 0.35) ---
  const farLayer = new PIXI.Container();
  const silhouettes = [];
  const silCount = Math.max(4, Math.floor(totalH / 260));
  for (let i = 0; i < silCount; i++) {
    const f = new PIXI.Graphics();
    const s = 14 + rand() * 22;
    f.ellipse(0, 0, s, s * 0.55).fill({ color: 0x0a2c4e, alpha: 0.5 });
    f.poly([s * 0.8, 0, s * 1.5, -s * 0.5, s * 1.5, s * 0.5]).fill({ color: 0x0a2c4e, alpha: 0.5 });
    f.x = rand() * viewW;
    f.y = rand() * (worldHeight > 0 ? worldHeight * 0.35 + viewH : viewH);
    f._speed = (8 + rand() * 18) * (rand() < 0.5 ? 1 : -1);
    f.scale.x = f._speed > 0 ? -1 : 1; // nose forward
    farLayer.addChild(f);
    silhouettes.push(f);
  }
  container.addChild(farLayer);

  // --- rising bubbles, two parallax layers ---
  const bubbleLayers = [];
  for (const factor of [0.6, 0.95]) {
    const layer = new PIXI.Container();
    const span = (worldHeight > 0 ? worldHeight * factor : 0) + viewH * 1.4;
    const bubbles = [];
    const n = Math.floor(span / (factor > 0.8 ? 46 : 64));
    for (let i = 0; i < n; i++) {
      const b = new PIXI.Graphics();
      const r = factor > 0.8 ? 3 + rand() * 5 : 2 + rand() * 3;
      b.circle(0, 0, r).stroke({ width: 2, color: 0xffffff, alpha: 0.5 });
      b.circle(-r * 0.3, -r * 0.3, r * 0.3).fill({ color: 0xffffff, alpha: 0.5 });
      b.x = rand() * viewW;
      b.y = rand() * span;
      b._speed = 14 + rand() * 26;
      b._sway = rand() * Math.PI * 2;
      b._span = span;
      layer.addChild(b);
      bubbles.push(b);
    }
    layer._factor = factor;
    layer._bubbles = bubbles;
    container.addChild(layer);
    bubbleLayers.push(layer);
  }

  farLayer._factor = 0.35;
  rays._factor = 1;
  grad._factor = 1;

  let t = 0;
  return {
    container,
    tick(dtMS) {
      const dt = dtMS / 1000;
      t += dt;
      for (const f of silhouettes) {
        f.x += f._speed * dt;
        if (f.x > viewW + 60) f.x = -60;
        if (f.x < -60) f.x = viewW + 60;
      }
      for (const layer of bubbleLayers) {
        for (const b of layer._bubbles) {
          b.y -= b._speed * dt;
          b.x += Math.sin(t * 1.4 + b._sway) * 0.25;
          if (b.y < -20) { b.y = b._span; b.x = rand() * viewW; }
        }
      }
      let i = 0;
      for (const ray of rays.children) {
        ray.alpha = 0.7 + Math.sin(t * 0.7 + ray._phase) * 0.3;
        i++;
      }
    },
    setScroll(y) {
      grad.y = -y;
      rays.y = -y;
      farLayer.y = -y * farLayer._factor;
      for (const layer of bubbleLayers) layer.y = -y * layer._factor;
    },
  };
}
