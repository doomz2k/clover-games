// The Dive Map: a vertically scrolling ocean, sunlit at the surface and
// pitch-dark at the Midnight Trench. Each depth is a porthole-style reef
// node with its host creature peeking out. Tapping an unlocked depth zooms
// in and starts that session.

import { Scene, W, H } from '../core/sceneManager.js';
import { makeOcean, makeText, makeButton, COLORS } from '../core/ui.js';
import { makeReef } from '../gen/reefGenerator.js';
import { makeCreature } from '../gen/creatureGenerator.js';
import { textureFor } from '../core/assets.js';
import { LEVELS } from '../data/levels.js';
import { getProgress, isUnlocked, furthestUnlocked } from '../core/progress.js';
import { tween, Ease } from '../core/tween.js';
import { clamp } from '../core/util.js';
import { sfxBoing, sfxTap } from '../core/audio.js';
import { say, stopSpeech } from '../core/speech.js';
import { IntroScene } from './introScene.js';

const NODE_R = 105;

function levelY(i) {
  let y = 400;
  for (let k = 0; k < i; k++) y += 390 + k * 20;
  return y;
}

export class MapScene extends Scene {
  async enter(data = {}) {
    this.worldHeight = levelY(LEVELS.length - 1) + 480;
    this.scrollY = 0;
    this.dragDist = 0;

    this.ocean = makeOcean(W, H, this.worldHeight);
    this.container.addChild(this.ocean.container);

    this.world = new PIXI.Container();
    this.container.addChild(this.world);

    this.nodes = [];
    this.creatures = [];
    this.reefs = [];
    const progress = getProgress();

    LEVELS.forEach((level, i) => {
      const node = new PIXI.Container();
      node.x = i % 2 === 0 ? 420 : 860;
      node.y = levelY(i);
      const saved = progress.levels.find((l) => l.id === level.id);

      // Porthole: brass ring, water disc, mini reef along the bottom
      const disc = new PIXI.Container();
      const water = new PIXI.Graphics().circle(0, 0, NODE_R).fill(0x1573ad);
      const discMask = new PIXI.Graphics().circle(0, 0, NODE_R).fill(0xffffff);
      const reef = makeReef(level.seed, NODE_R * 2.4, NODE_R);
      reef.y = NODE_R * 0.55;
      reef.scale.set(0.7);
      disc.addChild(water, discMask, reef);
      reef.mask = discMask;
      this.reefs.push(reef);
      const ring = new PIXI.Graphics()
        .circle(0, 0, NODE_R).stroke({ width: 10, color: 0xb8860b })
        .circle(0, 0, NODE_R + 7).stroke({ width: 4, color: 0x8a5a2a });
      disc.addChild(ring);
      node.addChild(disc);
      node.disc = disc;

      // Host creature floating inside (own mask - masks aren't shareable)
      const creature = makeCreature(level.seed * 3 + 7, 92);
      creature.y = -14;
      const creatureMask = new PIXI.Graphics().circle(0, 0, NODE_R).fill(0xffffff);
      disc.addChild(creatureMask, creature);
      creature.mask = creatureMask;
      this.creatures.push(creature);
      disc.addChild(ring); // re-raise the brass ring above the creature

      const name = makeText(level.name, 29);
      name.anchor.set(0.5);
      name.y = NODE_R + 40;
      node.addChild(name);

      if (!saved.unlocked) {
        disc.alpha = 0.5;
        creature.visible = false;
        const lock = new PIXI.Sprite(textureFor('lock'));
        lock.anchor.set(0.5);
        lock.width = lock.height = 56;
        node.addChild(lock);
        node.lock = lock;
      } else if (saved.stars > 0 || saved.bestScore > 0) {
        const starsRow = new PIXI.Container();
        for (let s = 0; s < 3; s++) {
          const st = new PIXI.Sprite(textureFor(s < saved.stars ? 'ui_star' : 'ui_star_empty'));
          st.anchor.set(0.5);
          st.width = st.height = 34;
          st.x = (s - 1) * 38;
          starsRow.addChild(st);
        }
        starsRow.y = NODE_R + 82;
        node.addChild(starsRow);
      }

      node.eventMode = 'static';
      node.cursor = saved.unlocked ? 'pointer' : 'default';
      node.hitArea = new PIXI.Circle(0, 0, NODE_R + 18);
      node.on('pointerover', () => { if (isUnlocked(level.id)) tween(node.scale, { x: 1.05, y: 1.05 }, 120); });
      node.on('pointerout', () => tween(node.scale, { x: 1, y: 1 }, 120));
      node.on('pointertap', () => {
        if (this.dragDist > 12 || this.zooming) return;
        if (isUnlocked(level.id)) this.diveTo(level, node);
        else this.shakeLock(node);
      });

      this.world.addChild(node);
      this.nodes.push({ node, level });

      if (data.pulseLevelId === level.id) this.pulseNode(disc);
    });

    // Submarine parked at the furthest unlocked depth
    const parkedAt = furthestUnlocked() - 1;
    this.sub = new PIXI.Sprite(textureFor('submarine'));
    this.sub.anchor.set(0.5);
    this.sub.width = this.sub.height = 110;
    this.sub.x = (parkedAt % 2 === 0 ? 420 : 860) + NODE_R + 105;
    this.sub.y = levelY(parkedAt) - 40;
    this.sub.scale.x = -Math.abs(this.sub.scale.x); // face the porthole
    this.world.addChild(this.sub);

    const title = makeText('DEEP SEA NUMBERS', 44, { fill: COLORS.gold });
    title.anchor.set(0.5, 0);
    title.x = W / 2;
    title.y = 18;
    this.container.addChild(title);

    this.mkArrow('▲', -1, 148); // below the fullscreen button overlay
    this.mkArrow('▼', 1, H - 84);

    // Drag to scroll (vertical)
    this.container.eventMode = 'static';
    this.container.hitArea = new PIXI.Rectangle(0, 0, W, H);
    let dragging = false;
    let lastY = 0;
    this.container.on('pointerdown', (e) => {
      dragging = true;
      this.dragDist = 0;
      lastY = e.global.y;
    });
    this.container.on('pointermove', (e) => {
      if (!dragging) return;
      const dy = e.global.y - lastY;
      lastY = e.global.y;
      this.dragDist += Math.abs(dy);
      this.setScroll(this.scrollY - dy / this.container.worldTransform.a);
    });
    const stop = () => { dragging = false; };
    this.container.on('pointerup', stop);
    this.container.on('pointerupoutside', stop);

    this.setScroll(levelY(parkedAt) - H / 2);
    this.time = 0;
  }

  mkArrow(glyph, dir, y) {
    const btn = makeButton(glyph, { width: 76, height: 76, fontSize: 28 });
    btn.x = W - 74;
    btn.y = y;
    btn.on('pointertap', () => this.glideScroll(dir * 520));
    this.container.addChild(btn);
  }

  glideScroll(dy) {
    const target = clamp(this.scrollY + dy, 0, this.worldHeight - H);
    const state = { v: this.scrollY };
    tween(state, { v: target }, 450, {
      ease: Ease.outCubic,
      onUpdate: () => this.setScroll(state.v),
    });
  }

  setScroll(y) {
    this.scrollY = clamp(y, 0, this.worldHeight - H);
    this.world.y = -this.scrollY;
    this.ocean.setScroll(this.scrollY);
  }

  pulseNode(disc) {
    const grow = () => tween(disc.scale, { x: 1.1, y: 1.1 }, 600, { ease: Ease.inOutQuad })
      .then(() => tween(disc.scale, { x: 1, y: 1 }, 600, { ease: Ease.inOutQuad }))
      .then(() => { if (!this._destroyed) grow(); });
    grow();
  }

  shakeLock(node) {
    sfxBoing();
    const lock = node.lock;
    if (!lock) return;
    let p = Promise.resolve();
    for (const r of [-0.3, 0.3, -0.2, 0.2, 0]) p = p.then(() => tween(lock, { rotation: r }, 70));
    say('Collect all ten pearls at the depth before this one to dive deeper!', { interrupt: true });
  }

  async diveTo(level, node) {
    this.zooming = true;
    sfxTap();
    stopSpeech();
    const gx = node.x;
    const gy = node.y - this.scrollY;
    this.world.pivot.set(node.x, node.y);
    this.world.position.set(gx, gy);
    await Promise.all([
      tween(this.world.scale, { x: 3, y: 3 }, 600, { ease: Ease.inCubic }),
      tween(this.world, { alpha: 0.6 }, 600),
    ]);
    this.game.scenes.switchTo(new IntroScene(this.game), { level });
  }

  async exit() {
    this._destroyed = true;
    stopSpeech();
  }

  update(dtMS) {
    this.time += dtMS / 1000;
    this.ocean.tick(dtMS);
    for (const creature of this.creatures) if (creature.visible) creature.tick(dtMS);
    for (const reef of this.reefs) reef.tick(dtMS);
    if (this.sub) this.sub.y += Math.sin(this.time * 1.4) * 0.18;
  }
}
