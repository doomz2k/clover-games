// Object-pooled particle system. One shared pool of sprites is recycled
// across every burst, trail and confetti shower - nothing is allocated
// per-effect once the pool has warmed up.

import { rand, randPick } from './util.js';
import { sfxSparkle } from './audio.js';

const POOL_MAX = 600;

let app = null;
let layer = null;
let starTex = null;
let dotTex = null;

const pool = [];
const live = new Set();

function makeTextures() {
  const starG = new PIXI.Graphics();
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? 12 : 5;
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
    pts.push(Math.cos(a) * r + 14, Math.sin(a) * r + 14);
  }
  starG.poly(pts).fill(0xffffff);
  starTex = app.renderer.generateTexture(starG);

  const dotG = new PIXI.Graphics();
  dotG.circle(7, 7, 6).fill(0xffffff);
  dotTex = app.renderer.generateTexture(dotG);
}

function obtain(texture) {
  let p = pool.pop();
  if (!p) {
    p = new PIXI.Sprite(texture);
    p.anchor.set(0.5);
  } else {
    p.texture = texture;
  }
  p.visible = true;
  layer.addChild(p);
  live.add(p);
  return p;
}

function release(p) {
  live.delete(p);
  layer.removeChild(p);
  p.visible = false;
  if (pool.length < POOL_MAX) pool.push(p);
}

export function initParticles(pixiApp, parentContainer) {
  app = pixiApp;
  layer = parentContainer;
  makeTextures();
  app.ticker.add((ticker) => {
    const dt = ticker.deltaMS / 1000;
    for (const p of live) {
      p._life -= dt;
      if (p._life <= 0) { release(p); continue; }
      p._vy += p._gravity * dt;
      p.x += p._vx * dt;
      p.y += p._vy * dt;
      p.rotation += p._spin * dt;
      const t = p._life / p._maxLife;
      p.alpha = Math.min(1, t * 2);
      p.scale.set(p._size * (0.4 + 0.6 * t));
    }
  });
}

/** Reparent the particle layer (kept above the active scene). */
export function particleLayer() {
  return layer;
}

const STAR_COLORS = [0xffd75e, 0xff9d5c, 0x4cc9f0, 0xf7a1c4, 0x7ac74f, 0xb07fe0, 0xffffff];

/**
 * Radial burst of coloured stars. Used for correct answers (big and small),
 * celebrations and landings.
 */
export function burst(x, y, {
  count = 50, colors = STAR_COLORS, speed = 420, gravity = 500,
  life = 1.0, size = 1, sparkle = true,
} = {}) {
  for (let i = 0; i < count; i++) {
    const p = obtain(rand() < 0.7 ? starTex : dotTex);
    const a = rand() * Math.PI * 2;
    const v = speed * (0.35 + rand() * 0.65);
    p.x = x; p.y = y;
    p._vx = Math.cos(a) * v;
    p._vy = Math.sin(a) * v - speed * 0.25;
    p._gravity = gravity;
    p._spin = (rand() - 0.5) * 10;
    p._maxLife = p._life = life * (0.6 + rand() * 0.6);
    p._size = size * (0.5 + rand() * 0.7);
    p.tint = randPick(colors);
    p.alpha = 1;
    p.scale.set(p._size);
    if (sparkle && i % 12 === 0) sfxSparkle();
  }
}

/** Continuous thruster flame trail - call once per frame while flying. */
export function thrusterPuff(x, y, dirX = -1, dirY = 0) {
  for (let i = 0; i < 3; i++) {
    const p = obtain(dotTex);
    p.x = x + (rand() - 0.5) * 10;
    p.y = y + (rand() - 0.5) * 12;
    const v = 150 + rand() * 200;
    p._vx = dirX * v + (rand() - 0.5) * 80;
    p._vy = dirY * v + (rand() - 0.5) * 80;
    p._gravity = 0;
    p._spin = 0;
    p._maxLife = p._life = 0.35 + rand() * 0.3;
    p._size = 0.7 + rand() * 0.9;
    p.tint = randPick([0xffd75e, 0xff9d5c, 0xf25c54, 0xffffff]);
    p.alpha = 1;
    p.scale.set(p._size);
  }
}

/** Confetti/star shower across the top of the screen (celebrations). */
export function shower(width, {
  count = 80, life = 2.2,
} = {}) {
  for (let i = 0; i < count; i++) {
    const p = obtain(rand() < 0.6 ? starTex : dotTex);
    p.x = rand() * width;
    p.y = -20 - rand() * 160;
    p._vx = (rand() - 0.5) * 120;
    p._vy = 120 + rand() * 240;
    p._gravity = 60;
    p._spin = (rand() - 0.5) * 8;
    p._maxLife = p._life = life * (0.7 + rand() * 0.5);
    p._size = 0.6 + rand() * 0.8;
    p.tint = randPick(STAR_COLORS);
    p.alpha = 1;
    p.scale.set(p._size);
  }
}
