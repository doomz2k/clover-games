// Shared UI kit: text styles, chunky buttons, answer cards, and the
// multi-layer parallax starfield used behind every scene.

import { rand } from './util.js';
import { tween, Ease } from './tween.js';
import { sfxTap } from './audio.js';

export const FONT = 'Fredoka One';
export const COLORS = {
  space: 0x0a0a2e,
  gold: 0xffd75e,
  goldDark: 0xb8860b,
  cardFill: 0x1c1c54,
  cardBorder: 0x5e5ecf,
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

/** Big tappable pill button with a fake 3D shadow edge. */
export function makeButton(label, { width = 280, height = 84, fill = COLORS.gold, edge = COLORS.goldDark, textColor = 0x0a0a2e, fontSize = 34 } = {}) {
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

/**
 * Answer/stimulus card: rounded rect with a soft vertical sheen, thick
 * coloured border and a drop shadow (drawn, so no external filter package).
 */
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

/** Pop-in helper used all over: scale from 0 with a back ease. */
export function popIn(obj, delay = 0, duration = 350) {
  const sx = obj.scale.x, sy = obj.scale.y;
  obj.scale.set(0.01);
  return tween(obj.scale, { x: sx, y: sy }, duration, { delay, ease: Ease.outBack });
}

/**
 * Multi-layer parallax starfield.
 *   layers[0] - blurred nebula blobs, slowest
 *   layers[1] - dim small stars
 *   layers[2] - bright foreground stars, fastest
 * Returns { container, tick(dt), setScroll(x) }. Stars twinkle via alpha.
 * Content is generated across `worldWidth` so the map can scroll through it.
 */
export function makeStarfield(viewW, viewH, worldWidth = viewW) {
  const container = new PIXI.Container();
  const layerDefs = [
    { factor: 0.15, kind: 'nebula' },
    { factor: 0.4, kind: 'stars', count: Math.floor(worldWidth / 14), size: [1, 2.2], alpha: 0.55 },
    { factor: 0.85, kind: 'stars', count: Math.floor(worldWidth / 22), size: [1.8, 3.6], alpha: 1 },
  ];
  const layers = [];
  const twinklers = [];

  for (const def of layerDefs) {
    const layer = new PIXI.Container();
    const span = worldWidth * def.factor + viewW * 2;
    if (def.kind === 'nebula') {
      // soft blobs from stacked translucent circles - cheaper than BlurFilter
      const g = new PIXI.Graphics();
      const blobs = Math.max(4, Math.floor(span / 320));
      const hues = [0x2b1a5e, 0x1a2b5e, 0x3d1a52, 0x16355c, 0x421a3e];
      for (let i = 0; i < blobs; i++) {
        const cx = rand() * span, cy = rand() * viewH;
        const r = 110 + rand() * 180;
        const color = hues[i % hues.length];
        for (let k = 5; k >= 1; k--) {
          g.circle(cx, cy, r * (k / 5)).fill({ color, alpha: 0.11 });
        }
      }
      layer.addChild(g);
    } else {
      const g = new PIXI.Graphics();
      for (let i = 0; i < def.count; i++) {
        g.circle(rand() * span, rand() * viewH, def.size[0] + rand() * (def.size[1] - def.size[0]))
          .fill(rand() < 0.12 ? 0xbfe8f9 : 0xffffff);
      }
      g.alpha = def.alpha;
      layer.addChild(g);
      // A handful of individually twinkling star sprites on top.
      for (let i = 0; i < Math.floor(def.count / 6); i++) {
        const tw = new PIXI.Graphics().circle(0, 0, def.size[1]).fill(0xffffff);
        tw.x = rand() * span;
        tw.y = rand() * viewH;
        tw._phase = rand() * Math.PI * 2;
        tw._speed = 1 + rand() * 2.5;
        layer.addChild(tw);
        twinklers.push(tw);
      }
    }
    layer._factor = def.factor;
    container.addChild(layer);
    layers.push(layer);
  }

  let t = 0;
  return {
    container,
    tick(dtMS) {
      t += dtMS / 1000;
      for (const tw of twinklers) tw.alpha = 0.35 + (Math.sin(t * tw._speed + tw._phase) + 1) * 0.325;
    },
    setScroll(x) {
      for (const layer of layers) layer.x = -x * layer._factor;
    },
  };
}
