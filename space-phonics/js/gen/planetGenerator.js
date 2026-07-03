// PlanetGenerator: builds a fully-configured PIXI.Container for a planet
// from a numeric seed. Same seed, same planet - the map and the intro scene
// can both draw "Planet Zim" and get the identical world.

import { mulberry32, pick } from '../core/util.js';

function hsl(h, s, l) {
  h = ((h % 360) + 360) % 360; s /= 100; l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return (Math.round(f(0) * 255) << 16) | (Math.round(f(8) * 255) << 8) | Math.round(f(4) * 255);
}

/**
 * Returns a PIXI.Container with a `tick(dtMS)` method (rotation + shimmer)
 * and a `radius` property. Features: seed-driven palette, craters / cloud
 * bands / ice caps / lava, optional ring, glowing atmosphere.
 */
export function makePlanet(seed, radius = 90) {
  const rng = mulberry32(seed);
  const c = new PIXI.Container();
  c.radius = radius;

  const hue = rng() * 360;
  const sat = 55 + rng() * 35;
  const baseCol = hsl(hue, sat, 45 + rng() * 15);
  const darkCol = hsl(hue + 18, sat, 30);
  const liteCol = hsl(hue - 20, sat, 68);
  const glowCol = hsl(hue, 90, 70);

  // --- Atmosphere glow: layered translucent rings, no filter (a BlurFilter
  // this size costs whole milliseconds per frame on weak GPUs) ---
  const glow = new PIXI.Graphics();
  for (let i = 9; i >= 0; i--) {
    glow.circle(0, 0, radius * (1.02 + i * 0.045)).fill({ color: glowCol, alpha: 0.05 });
  }
  c.addChild(glow);

  const hasRing = rng() < 0.4;
  let ringHolder = null;
  if (hasRing) {
    // Ring halves drawn in a y-squashed holder so the planet sits "inside" it.
    ringHolder = new PIXI.Container();
    ringHolder.rotation = (rng() - 0.5) * 0.7;
    const squash = new PIXI.Container();
    squash.scale.y = 0.28;
    const ringCol = hsl(hue + 40 + rng() * 60, 70, 65);
    const rr = radius * (1.5 + rng() * 0.35);
    const back = new PIXI.Graphics()
      .arc(0, 0, rr, Math.PI, Math.PI * 2)
      .stroke({ width: radius * 0.22, color: ringCol, alpha: 0.9 });
    squash.addChild(back);
    ringHolder.addChild(squash);
    c.addChild(ringHolder);
  }

  // --- Surface: base disc + masked, slowly-rotating feature layer ---
  const surface = new PIXI.Container();
  const base = new PIXI.Graphics().circle(0, 0, radius).fill(baseCol);
  surface.addChild(base);

  const features = new PIXI.Container();
  const mask = new PIXI.Graphics().circle(0, 0, radius).fill(0xffffff);
  surface.addChild(mask, features);
  features.mask = mask;

  const style = pick(rng, ['craters', 'bands', 'swirly', 'lava']);

  if (style === 'craters') {
    const g = new PIXI.Graphics();
    const n = 4 + Math.floor(rng() * 5);
    for (let i = 0; i < n; i++) {
      const a = rng() * Math.PI * 2;
      const d = rng() * radius * 0.72;
      const r = radius * (0.08 + rng() * 0.16);
      const x = Math.cos(a) * d, y = Math.sin(a) * d;
      g.circle(x, y, r).fill(darkCol);
      g.circle(x - r * 0.18, y - r * 0.18, r * 0.7).fill(hsl(hue + 10, sat, 38));
    }
    features.addChild(g);
  } else if (style === 'bands') {
    const g = new PIXI.Graphics();
    const n = 3 + Math.floor(rng() * 3);
    for (let i = 0; i < n; i++) {
      const y = -radius + (i + 0.5) * ((radius * 2) / n) + (rng() - 0.5) * 12;
      const h = radius * (0.14 + rng() * 0.14);
      g.ellipse(0, y, radius * 1.25, h).fill({ color: i % 2 ? liteCol : darkCol, alpha: 0.5 });
    }
    features.addChild(g);
  } else if (style === 'swirly') {
    const g = new PIXI.Graphics();
    const n = 5 + Math.floor(rng() * 4);
    for (let i = 0; i < n; i++) {
      const a = rng() * Math.PI * 2;
      const d = rng() * radius * 0.7;
      g.ellipse(Math.cos(a) * d, Math.sin(a) * d, radius * (0.18 + rng() * 0.25), radius * (0.08 + rng() * 0.1))
        .fill({ color: rng() < 0.5 ? liteCol : darkCol, alpha: 0.55 });
    }
    features.addChild(g);
  } else { // lava
    const g = new PIXI.Graphics();
    const n = 4 + Math.floor(rng() * 4);
    for (let i = 0; i < n; i++) {
      const a = rng() * Math.PI * 2;
      const d = rng() * radius * 0.68;
      const x = Math.cos(a) * d, y = Math.sin(a) * d;
      const r = radius * (0.1 + rng() * 0.15);
      g.circle(x, y, r).fill(hsl(20 + rng() * 25, 95, 55));
      g.circle(x, y, r * 0.55).fill(hsl(45, 100, 62));
    }
    features.addChild(g);
  }

  // Ice caps can appear on any style.
  if (rng() < 0.35) {
    const caps = new PIXI.Graphics();
    caps.ellipse(0, -radius * 0.92, radius * 0.55, radius * 0.28).fill({ color: 0xf0f8ff, alpha: 0.9 });
    caps.ellipse(0, radius * 0.92, radius * 0.5, radius * 0.24).fill({ color: 0xf0f8ff, alpha: 0.9 });
    features.addChild(caps);
  }

  // Terminator shading + rim highlight for depth.
  const shade = new PIXI.Graphics()
    .circle(radius * 0.22, radius * 0.22, radius).fill({ color: 0x05051a, alpha: 0.28 });
  const rim = new PIXI.Graphics()
    .circle(-radius * 0.28, -radius * 0.28, radius * 0.82).fill({ color: 0xffffff, alpha: 0.10 });
  const shadeWrap = new PIXI.Container();
  const shadeMask = new PIXI.Graphics().circle(0, 0, radius).fill(0xffffff);
  shadeWrap.addChild(shadeMask, shade, rim);
  shade.mask = shadeMask;
  rim.mask = shadeMask;

  c.addChild(surface, shadeWrap);

  if (hasRing) {
    // Front half of the ring passes over the planet.
    const squashF = new PIXI.Container();
    squashF.scale.y = 0.28;
    const rr = radius * 1.62;
    const front = new PIXI.Graphics()
      .arc(0, 0, rr, 0, Math.PI)
      .stroke({ width: radius * 0.22, color: hsl(hue + 60, 70, 72), alpha: 0.95 });
    squashF.addChild(front);
    squashF.rotation = 0;
    ringHolder.addChild(squashF);
    // re-add ring holder on top so its front half overlays the surface
    c.addChild(ringHolder);
  }

  // --- Animation: slow feature rotation + atmospheric shimmer ---
  let t = rng() * 1000;
  const spinSpeed = (0.02 + rng() * 0.04) * (rng() < 0.5 ? 1 : -1);
  c.tick = (dtMS) => {
    t += dtMS / 1000;
    features.rotation += spinSpeed * (dtMS / 1000);
    glow.alpha = 0.85 + Math.sin(t * 1.7) * 0.15;
  };

  return c;
}
