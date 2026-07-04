// Scene manager: owns the logical 1280x800 stage, letterbox scaling, and
// the themed "hyperspace" transition between scenes - star streaks race
// outward while space swallows the old scene, then recede to reveal the new.

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

    // Full-window starfield behind the letterboxed stage, so the game
    // always fills the entire browser window instead of showing bars.
    this.bleed = new PIXI.Graphics();
    app.stage.addChild(this.bleed);

    // stage → root (scaled) → [sceneLayer, particleLayer, overlay]
    this.root = new PIXI.Container();
    this.sceneLayer = new PIXI.Container();
    this.particleLayer = new PIXI.Container();

    // themed transition overlay: dark space + hyperspace star streaks
    this.overlay = new PIXI.Container();
    this.overlayBg = new PIXI.Graphics().rect(-W, -H, W * 3, H * 3).fill(0x05051a);
    this.overlayBg.alpha = 0;
    this.overlayFx = new PIXI.Graphics();
    this.overlay.addChild(this.overlayBg, this.overlayFx);
    this.overlay.eventMode = 'none';
    this.streaks = [];
    for (let i = 0; i < 54; i++) {
      this.streaks.push({
        ang: Math.random() * Math.PI * 2,
        off: Math.random(),
        len: 140 + Math.random() * 260,
        w: 1.5 + Math.random() * 3,
        blue: Math.random() < 0.22,
      });
    }

    this.root.addChild(this.sceneLayer, this.particleLayer, this.overlay);
    app.stage.addChild(this.root);

    const onResize = () => this.layout();
    window.addEventListener('resize', onResize);
    this.layout();

    app.ticker.add((ticker) => this.current?.update(ticker.deltaMS));
  }

  layout() {
    const sw = this.app.renderer.width / this.app.renderer.resolution;
    const sh = this.app.renderer.height / this.app.renderer.resolution;
    const scale = Math.min(sw / W, sh / H);
    this.root.scale.set(scale);
    this.root.x = (sw - W * scale) / 2;
    this.root.y = (sh - H * scale) / 2;

    // repaint the window-filling backdrop stars
    this.bleed.clear();
    this.bleed.rect(0, 0, sw, sh).fill(0x0a0a2e);
    const seeded = (n) => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };
    const count = Math.floor((sw * sh) / 7000);
    for (let i = 0; i < count; i++) {
      this.bleed.circle(seeded(i + 1) * sw, seeded(i + 101) * sh, 0.8 + seeded(i + 201) * 1.8)
        .fill({ color: seeded(i + 301) < 0.12 ? 0xbfe8f9 : 0xffffff, alpha: 0.35 + seeded(i + 401) * 0.55 });
    }
  }

  drawTransition(p) {
    this.overlayBg.alpha = Math.min(1, p * 1.6);
    const g = this.overlayFx;
    g.clear();
    if (p <= 0.01) return;
    const cx = W / 2, cy = H / 2;
    for (const s of this.streaks) {
      const r0 = s.off * 260 + p * p * 900;
      const r1 = r0 + s.len * p;
      g.moveTo(cx + Math.cos(s.ang) * r0, cy + Math.sin(s.ang) * r0)
        .lineTo(cx + Math.cos(s.ang) * r1, cy + Math.sin(s.ang) * r1)
        .stroke({ width: s.w, color: s.blue ? 0xbfe8f9 : 0xffffff, alpha: Math.min(1, p * 1.5) });
    }
  }

  /** Hyperspace-jump to a new scene instance. */
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
