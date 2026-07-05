// Scene manager: owns the logical 1280x800 stage, letterbox scaling, and
// the themed "bubble wall" transition between scenes - a curtain of rising
// bubbles covers the old scene, then floats away to reveal the new one.

import { tween, Ease } from './tween.js';

export const W = 1280;
export const H = 800;

export class Scene {
  constructor(game) {
    this.game = game;
    this.container = new PIXI.Container();
  }
  /* eslint-disable no-unused-vars */
  async enter(data) {}
  async exit() {}
  update(dtMS) {}
}

export class SceneManager {
  constructor(app) {
    this.app = app;
    this.current = null;

    // Full-window deep-water backdrop behind the letterboxed stage, so the
    // game always fills the entire browser window instead of showing bars.
    this.bleed = new PIXI.Graphics();
    app.stage.addChild(this.bleed);

    // stage → root (scaled) → [sceneLayer, particleLayer, overlay]
    this.root = new PIXI.Container();
    this.sceneLayer = new PIXI.Container();
    this.particleLayer = new PIXI.Container();

    // themed transition overlay: deep water + a wall of rising bubbles
    this.overlay = new PIXI.Container();
    this.overlayBg = new PIXI.Graphics().rect(-W, -H, W * 3, H * 3).fill(0x041a33);
    this.overlayBg.alpha = 0;
    this.overlayFx = new PIXI.Graphics();
    this.overlay.addChild(this.overlayBg, this.overlayFx);
    this.overlay.eventMode = 'none';
    this.bubbles = [];
    for (let i = 0; i < 52; i++) {
      this.bubbles.push({
        x: Math.random() * W,
        r: 24 + Math.random() * 58,
        ph: Math.random() * 0.35,
      });
    }

    this.root.addChild(this.sceneLayer, this.particleLayer, this.overlay);
    app.stage.addChild(this.root);

    const onResize = () => this.layout();
    window.addEventListener('resize', onResize);
    // Pixi applies its own resize after our window listener may have run -
    // re-layout on the renderer's resize event so sizes are never stale.
    app.renderer.on('resize', onResize);
    this.layout();

    app.ticker.add((ticker) => this.current?.update(ticker.deltaMS));
  }

  layout() {
    // app.screen is in CSS pixels at every devicePixelRatio (renderer.width
    // already is too in Pixi v8 - dividing by resolution shrank the stage
    // by the OS display-scaling factor, leaving dead space below/right).
    const sw = this.app.screen.width;
    const sh = this.app.screen.height;
    // Fill the entire window at any aspect ratio: the logical 1280x800
    // stage stretches to match. No letterboxing, nothing cropped.
    this.root.scale.set(sw / W, sh / H);
    this.root.x = 0;
    this.root.y = 0;

    // repaint the window-filling backdrop (water + faint bubbles)
    this.bleed.clear();
    this.bleed.rect(0, 0, sw, sh).fill(0x06294e);
    const seeded = (n) => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };
    const count = Math.floor((sw * sh) / 16000);
    for (let i = 0; i < count; i++) {
      this.bleed.circle(seeded(i + 1) * sw, seeded(i + 101) * sh, 2 + seeded(i + 201) * 4)
        .stroke({ width: 1.5, color: 0xffffff, alpha: 0.1 + seeded(i + 401) * 0.2 });
    }
  }

  drawTransition(p) {
    this.overlayBg.alpha = Math.min(1, p * 1.5);
    const g = this.overlayFx;
    g.clear();
    if (p <= 0.01) return;
    for (const b of this.bubbles) {
      const t = Math.max(0, Math.min(1, p * 1.35 - b.ph));
      if (t <= 0) continue;
      const y = (H + 140) - t * (H + 280);
      g.circle(b.x, y, b.r).fill({ color: 0x2a7fb8, alpha: 0.35 });
      g.circle(b.x, y, b.r).stroke({ width: 3, color: 0xbfe8f9, alpha: 0.6 });
      g.circle(b.x - b.r * 0.3, y - b.r * 0.3, b.r * 0.25).fill({ color: 0xffffff, alpha: 0.5 });
    }
  }

  /** Bubble-wall to a new scene instance. */
  async switchTo(scene, data) {
    this.overlay.eventMode = 'static'; // swallow input during the transition
    const s = { p: 0 };
    await tween(s, { p: 1 }, 430, { ease: Ease.inQuad, onUpdate: () => this.drawTransition(s.p) });
    if (this.current) {
      await this.current.exit();
      this.sceneLayer.removeChild(this.current.container);
      this.current.container.destroy({ children: true });
    }
    this.current = scene;
    this.sceneLayer.addChild(scene.container);
    await scene.enter(data);
    await tween(s, { p: 0 }, 380, { ease: Ease.outQuad, onUpdate: () => this.drawTransition(s.p) });
    this.overlayFx.clear();
    this.overlay.eventMode = 'none';
  }
}
