// Scene manager: owns the logical 1280x800 stage, letterbox scaling, and
// fade transitions between the Map / Intro / Question / Completion scenes.

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

    // Full-window leafy backdrop behind the letterboxed stage, so the game
    // always fills the entire browser window instead of showing bars.
    this.bleed = new PIXI.Graphics();
    app.stage.addChild(this.bleed);

    // stage → root (scaled) → [sceneLayer, particleLayer, fade]
    this.root = new PIXI.Container();
    this.sceneLayer = new PIXI.Container();
    this.particleLayer = new PIXI.Container();
    this.fade = new PIXI.Graphics().rect(-W, -H, W * 3, H * 3).fill(0x05051a);
    this.fade.alpha = 0;
    this.fade.eventMode = 'none';
    this.root.addChild(this.sceneLayer, this.particleLayer, this.fade);
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

    // repaint the window-filling backdrop (leafy green + light flecks)
    this.bleed.clear();
    this.bleed.rect(0, 0, sw, sh).fill(0x3f7433);
    const seeded = (n) => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };
    const count = Math.floor((sw * sh) / 12000);
    for (let i = 0; i < count; i++) {
      this.bleed.ellipse(seeded(i + 1) * sw, seeded(i + 101) * sh, 3 + seeded(i + 201) * 5, 2 + seeded(i + 301) * 3)
        .fill({ color: seeded(i + 501) < 0.5 ? 0x4a8a3c : 0x5f9e4a, alpha: 0.35 + seeded(i + 401) * 0.4 });
    }
  }

  /** Cross-fade to a new scene instance. */
  async switchTo(scene, data) {
    this.fade.eventMode = 'static'; // swallow input during the transition
    await tween(this.fade, { alpha: 1 }, 350, { ease: Ease.inQuad });
    if (this.current) {
      await this.current.exit();
      this.sceneLayer.removeChild(this.current.container);
      this.current.container.destroy({ children: true });
    }
    this.current = scene;
    this.sceneLayer.addChild(scene.container);
    await scene.enter(data);
    await tween(this.fade, { alpha: 0 }, 350, { ease: Ease.outQuad });
    this.fade.eventMode = 'none';
  }
}
