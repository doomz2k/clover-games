// Scene manager: owns the logical 1280x800 stage, letterbox scaling, and
// the themed "leaf sweep" transition between scenes - tumbling leaves blow
// across to cover the old scene, then clear to reveal the new one.

import { tween, Ease } from './tween.js';

export const W = 1280;
export const H = 800;

const LEAF_COLORS = [0x4a8a3c, 0x5f9e4a, 0x7ac74f, 0x3f7433];

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

    // stage → root (scaled) → [sceneLayer, particleLayer, overlay]
    this.root = new PIXI.Container();
    this.sceneLayer = new PIXI.Container();
    this.particleLayer = new PIXI.Container();

    // themed transition overlay: garden green + wind-blown tumbling leaves
    this.overlay = new PIXI.Container();
    this.overlayBg = new PIXI.Graphics().rect(-W, -H, W * 3, H * 3).fill(0x2e5d2a);
    this.overlayBg.alpha = 0;
    this.overlayFx = new PIXI.Graphics();
    this.overlay.addChild(this.overlayBg, this.overlayFx);
    this.overlay.eventMode = 'none';
    this.leaves = [];
    for (let i = 0; i < 46; i++) {
      this.leaves.push({
        y: Math.random() * H,
        wob: 30 + Math.random() * 50,
        ph: Math.random() * 0.35,
        size: 16 + Math.random() * 18,
        rot: Math.random() * Math.PI,
        col: LEAF_COLORS[i % LEAF_COLORS.length],
      });
    }

    // cinematic vignette: grades every scene, sits under the transitions
    this.vignette = new PIXI.Graphics();
    this.vignette.eventMode = 'none';
    const vGrad = new PIXI.FillGradient({
      type: 'radial',
      colorStops: [
        { offset: 0, color: 'rgba(20,26,8,0)' },
        { offset: 0.62, color: 'rgba(20,26,8,0)' },
        { offset: 1, color: 'rgba(20,26,8,0.32)' },
      ],
      textureSpace: 'local',
    });
    this.vignette.rect(0, 0, W, H).fill(vGrad);

    this.root.addChild(this.sceneLayer, this.particleLayer, this.vignette, this.overlay);
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

  drawTransition(p) {
    this.overlayBg.alpha = Math.min(1, p * 1.5);
    const g = this.overlayFx;
    g.clear();
    if (p <= 0.01) return;
    for (const l of this.leaves) {
      const t = Math.max(0, Math.min(1, p * 1.35 - l.ph));
      if (t <= 0) continue;
      const x = -240 + t * (W + 480);
      const y = l.y + Math.sin(t * 6 + l.rot) * l.wob;
      const rot = l.rot + t * 7;
      const c = Math.cos(rot), s = Math.sin(rot);
      const L = l.size, Wd = l.size * 0.55;
      g.poly([
        x + L * c, y + L * s,
        x - Wd * s, y + Wd * c,
        x - L * c, y - L * s,
        x + Wd * s, y - Wd * c,
      ]).fill({ color: l.col, alpha: 0.95 });
    }
  }

  /** Leaf-sweep to a new scene instance. */
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
