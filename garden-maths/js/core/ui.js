// Shared UI kit for Garden Maths (warm cream cards, soft green borders,
// gold accents) plus the layered garden backdrop: time-of-day sky, distant
// hills, soil layer and swaying foreground grass.

import { rand, lerp, clamp } from './util.js';
import { tween, Ease } from './tween.js';
import { sfxTap } from './audio.js';

export const FONT = 'Fredoka One';
export const COLORS = {
  ink: 0x2e3d1a,
  gold: 0xffd75e,
  goldDark: 0xb8860b,
  cardFill: 0xfdf6e9,
  cardBorder: 0x7ac74f,
  cardBorderDark: 0x4d9930,
  text: 0x2e3d1a,
  good: 0x7ac74f,
  bad: 0xf25c54,
};

export function makeText(text, size, opts = {}) {
  return new PIXI.Text({
    text,
    style: {
      fontFamily: FONT,
      fontSize: size,
      fill: opts.fill ?? 0xffffff,
      align: 'center',
      dropShadow: opts.shadow === false ? false : {
        color: 0x000000, alpha: 0.35, blur: 4, distance: 3, angle: Math.PI / 3,
      },
      wordWrap: !!opts.wrap,
      wordWrapWidth: opts.wrap || 0,
      ...(opts.stroke ? { stroke: { color: opts.stroke, width: opts.strokeWidth ?? 6 } } : {}),
    },
  });
}

export function makeButton(label, { width = 280, height = 84, fill = COLORS.gold, edge = COLORS.goldDark, textColor = COLORS.ink, fontSize = 34 } = {}) {
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
  c.on('pointerover', () => tween(c.scale, { x: 1.06, y: 1.06 }, 120));
  c.on('pointerout', () => tween(c.scale, { x: 1, y: 1 }, 120));
  c.on('pointertap', () => sfxTap());
  c.setEnabled = (on) => {
    c.eventMode = on ? 'static' : 'none';
    c.alpha = on ? 1 : 0.5;
  };
  return c;
}

/** Warm cream answer/sum card with soft green border. */
export function makeCard(width, height, { fill = COLORS.cardFill, border = COLORS.cardBorder } = {}) {
  const c = new PIXI.Container();
  const shadow = new PIXI.Graphics().roundRect(-width / 2 + 4, -height / 2 + 8, width, height, 24).fill({ color: 0x000000, alpha: 0.25 });
  const bg = new PIXI.Graphics()
    .roundRect(-width / 2, -height / 2, width, height, 24).fill(fill)
    .roundRect(-width / 2, -height / 2, width, height, 24).stroke({ width: 6, color: border });
  c.addChild(shadow, bg);
  c.cardW = width;
  c.cardH = height;
  c.setBorder = (color, w = 6) => {
    bg.clear();
    bg.roundRect(-width / 2, -height / 2, width, height, 24).fill(fill)
      .roundRect(-width / 2, -height / 2, width, height, 24).stroke({ width: w, color });
  };
  return c;
}


/** Gentle infinite breathing pulse for primary call-to-action buttons. */
export function pulseForever(obj, amount = 1.05, period = 950) {
  const grow = () => {
    if (obj.destroyed) return;
    tween(obj.scale, { x: amount, y: amount }, period / 2, { ease: Ease.inOutQuad })
      .then(() => tween(obj.scale, { x: 1, y: 1 }, period / 2, { ease: Ease.inOutQuad }))
      .then(grow);
  };
  grow();
}

export function popIn(obj, delay = 0, duration = 350) {
  const sx = obj.scale.x, sy = obj.scale.y;
  obj.scale.set(0.01);
  return tween(obj.scale, { x: sx, y: sy }, duration, { delay, ease: Ease.outBack });
}

// ---------------------------------------------------------------------------
// Garden backdrop
// ---------------------------------------------------------------------------

// Sky palettes: [topColor, bottomColor] as rgb triples.
const SKIES = {
  morning:   [[255, 201, 221], [255, 238, 212]],
  midday:    [[111, 199, 240], [214, 240, 255]],
  afternoon: [[127, 184, 232], [255, 217, 160]],
  golden:    [[255, 157, 92],  [255, 226, 138]],
};

function mixRgb(a, b, t) {
  return (Math.round(lerp(a[0], b[0], t)) << 16)
    | (Math.round(lerp(a[1], b[1], t)) << 8)
    | Math.round(lerp(a[2], b[2], t));
}

function drawSky(g, pal, w, h) {
  // a true smooth vertical gradient - no banding
  g.clear();
  const fill = new PIXI.FillGradient({
    type: 'linear',
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
    textureSpace: 'local',
    colorStops: [
      { offset: 0, color: mixRgb(pal[0], pal[1], 0) },
      { offset: 0.55, color: mixRgb(pal[0], pal[1], 0.5) },
      { offset: 1, color: mixRgb(pal[0], pal[1], 1) },
    ],
  });
  g.rect(0, 0, w, h).fill(fill);
}

/**
 * makeGarden(viewW, viewH, { seasonShift }) -> layered backdrop.
 *   setTimeOfDay(t)  - 0 morning .. 1 afternoon (tween the sky over a session)
 *   goldenHour()     - washes the sky to golden hour (season completion)
 *   soilY            - the y of the soil line plants stand on
 *   tick(dt)         - grass sway + sun shimmer
 */
export function makeGarden(viewW, viewH, { seasonShift = 0 } = {}) {
  const container = new PIXI.Container();
  const soilY = viewH * 0.63;

  // Two sky layers crossfaded between times of day + golden overlay
  const skyA = new PIXI.Graphics();
  const skyB = new PIXI.Graphics();
  const skyGold = new PIXI.Graphics();
  drawSky(skyA, SKIES.morning, viewW, soilY + 40);
  drawSky(skyB, SKIES.midday, viewW, soilY + 40);
  drawSky(skyGold, SKIES.golden, viewW, soilY + 40);
  skyB.alpha = 0;
  skyGold.alpha = 0;
  container.addChild(skyA, skyB, skyGold);

  // Autumn seasons get a permanent warm wash
  if (seasonShift > 0) {
    const wash = new PIXI.Graphics().rect(0, 0, viewW, soilY + 40)
      .fill({ color: 0xff9d5c, alpha: seasonShift * 0.16 });
    container.addChild(wash);
  }

  // Sun arcs across the sky with time of day
  const sun = new PIXI.Container();
  const sunGlow = new PIXI.Graphics();
  for (let i = 6; i >= 0; i--) {
    sunGlow.circle(0, 0, 40 + i * 9).fill({ color: 0xffe28a, alpha: 0.06 });
  }
  const sunCore = new PIXI.Graphics().circle(0, 0, 38).fill(0xffd75e).stroke({ width: 5, color: 0xe8b64a });
  sun.addChild(sunGlow, sunCore);
  container.addChild(sun);

  // Soft clouds drifting across the sky
  const clouds = [];
  for (let i = 0; i < 3; i++) {
    const c = new PIXI.Graphics();
    const s = 0.7 + rand() * 0.6;
    c.ellipse(0, 0, 70 * s, 26 * s).fill({ color: 0xffffff, alpha: 0.85 });
    c.ellipse(-42 * s, 8 * s, 44 * s, 20 * s).fill({ color: 0xffffff, alpha: 0.85 });
    c.ellipse(44 * s, 6 * s, 48 * s, 22 * s).fill({ color: 0xffffff, alpha: 0.85 });
    c.x = rand() * viewW;
    c.y = 46 + rand() * (soilY * 0.35);
    c._v = 6 + rand() * 9;
    container.addChild(c);
    clouds.push(c);
  }

  // Distant hills
  const hills = new PIXI.Graphics();
  hills.moveTo(0, soilY).quadraticCurveTo(viewW * 0.22, soilY - 130, viewW * 0.52, soilY).closePath().fill(0x5f9e4a);
  hills.moveTo(viewW * 0.4, soilY).quadraticCurveTo(viewW * 0.72, soilY - 170, viewW * 1.05, soilY).closePath().fill(0x4a8a3c);
  container.addChild(hills);

  // Soil layer
  const soilH = viewH * 0.16;
  const soil = new PIXI.Graphics()
    .rect(0, soilY, viewW, soilH).fill(0x7a4a2b);
  soil.rect(0, soilY, viewW, 10).fill(0x5e3a20);
  for (let i = 0; i < 40; i++) {
    soil.circle(rand() * viewW, soilY + 16 + rand() * (soilH - 24), 3 + rand() * 5)
      .fill({ color: 0x5e3a20, alpha: 0.6 });
  }
  container.addChild(soil);
  const uiY = soilY + soilH;
  // grassy apron below the soil for the UI area
  const apron = new PIXI.Graphics().rect(0, uiY, viewW, viewH - uiY).fill(0x3f7433);
  container.addChild(apron);

  // Foreground grass blades along the soil line
  const grassLayer = new PIXI.Container();
  const blades = [];
  for (let i = 0; i < Math.floor(viewW / 26); i++) {
    const blade = new PIXI.Graphics();
    const h = 16 + rand() * 22;
    blade.moveTo(0, 0).quadraticCurveTo(4, -h * 0.6, 8, -h)
      .stroke({ width: 5, color: rand() < 0.5 ? 0x5f9e4a : 0x4a8a3c, cap: 'round' });
    blade.x = i * 26 + rand() * 14;
    blade.y = soilY + 6;
    blade._phase = rand() * Math.PI * 2;
    grassLayer.addChild(blade);
    blades.push(blade);
  }
  container.addChild(grassLayer);

  // Ambient life: drifting pollen motes and the occasional passing bird,
  // both redrawn each frame into one Graphics.
  const life = new PIXI.Graphics();
  container.addChild(life);
  const pollenMotes = [];
  for (let i = 0; i < 16; i++) {
    pollenMotes.push({
      x: rand() * viewW, y: soilY - rand() * 280,
      vx: 8 + rand() * 12, vy: -(3 + rand() * 5), ph: rand() * Math.PI * 2,
    });
  }
  let bird = null;
  let birdCooldown = 5 + rand() * 8;

  let timeOfDay = 0;
  function placeSun() {
    const t = timeOfDay;
    sun.x = viewW * (0.14 + t * 0.72);
    sun.y = soilY * (0.42 - Math.sin(t * Math.PI) * 0.24);
  }
  placeSun();

  let t = 0;
  return {
    container,
    soilY,
    uiY,
    sun,
    setTimeOfDay(v) {
      timeOfDay = clamp(v, 0, 1);
      // morning -> midday for the first half, midday -> afternoon after
      if (timeOfDay < 0.5) {
        drawSky(skyA, SKIES.morning, viewW, soilY + 40);
        skyB.alpha = timeOfDay * 2;
      } else {
        drawSky(skyA, SKIES.afternoon, viewW, soilY + 40);
        skyB.alpha = 2 - timeOfDay * 2;
      }
      placeSun();
    },
    goldenHour() {
      return tween(skyGold, { alpha: 1 }, 1200, { ease: Ease.inOutQuad });
    },
    tick(dtMS) {
      const dt = dtMS / 1000;
      t += dt;
      for (const b of blades) b.rotation = Math.sin(t * 1.3 + b._phase) * 0.09;
      sunGlow.alpha = 0.85 + Math.sin(t * 1.8) * 0.15;

      for (const c of clouds) {
        c.x += c._v * dt;
        if (c.x > viewW + 160) c.x = -160;
      }

      life.clear();
      for (const m of pollenMotes) {
        m.x += m.vx * dt;
        m.y += m.vy * dt;
        if (m.x > viewW + 8 || m.y < soilY - 320) {
          m.x = rand() * viewW; m.y = soilY - rand() * 40;
        }
        life.circle(m.x + Math.sin(t * 1.1 + m.ph) * 8, m.y, 2)
          .fill({ color: 0xfff3c0, alpha: 0.4 + Math.sin(t * 1.7 + m.ph) * 0.2 });
      }
      if (bird) {
        bird.x += bird.vx * dt;
        if (bird.x < -60 || bird.x > viewW + 60) {
          bird = null;
        } else {
          const flap = Math.sin(t * 10) * 6;
          const bx = bird.x, by = bird.y + Math.sin(t * 2) * 10;
          life.moveTo(bx - 14, by)
            .quadraticCurveTo(bx - 7, by - 8 - flap, bx, by)
            .quadraticCurveTo(bx + 7, by - 8 - flap, bx + 14, by)
            .stroke({ width: 3, color: 0x2e3d1a, alpha: 0.75 });
        }
      } else {
        birdCooldown -= dt;
        if (birdCooldown <= 0) {
          birdCooldown = 8 + rand() * 10;
          const ltr = rand() < 0.5;
          bird = {
            x: ltr ? -50 : viewW + 50,
            y: 60 + rand() * (soilY * 0.4),
            vx: (ltr ? 1 : -1) * (60 + rand() * 50),
          };
        }
      }
    },
  };
}
