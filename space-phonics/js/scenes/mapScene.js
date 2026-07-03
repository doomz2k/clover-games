// The Universe Map: a scrollable parallax starfield dotted with procedural
// planets. Tapping an unlocked planet zooms in and starts that session.

import { Scene, W, H } from '../core/sceneManager.js';
import { makeStarfield, makeText, makeButton, COLORS } from '../core/ui.js';
import { makePlanet } from '../gen/planetGenerator.js';
import { makeAlien } from '../gen/alienGenerator.js';
import { textureFor } from '../core/assets.js';
import { PLANETS } from '../data/planets.js';
import { getProgress, isUnlocked, furthestUnlocked } from '../core/progress.js';
import { tween, Ease } from '../core/tween.js';
import { clamp } from '../core/util.js';
import { sfxBoing, sfxTap } from '../core/audio.js';
import { say, stopSpeech } from '../core/speech.js';
import { IntroScene } from './introScene.js';

const PLANET_R = 72;

function planetX(i) {
  // spacing grows the deeper you fly into the universe
  let x = 420;
  for (let k = 0; k < i; k++) x += 400 + k * 28;
  return x;
}

export class MapScene extends Scene {
  async enter(data = {}) {
    this.worldWidth = planetX(PLANETS.length - 1) + 520;
    this.scrollX = 0;
    this.dragDist = 0;

    this.starfield = makeStarfield(W, H, this.worldWidth);
    this.container.addChild(this.starfield.container);

    this.world = new PIXI.Container();
    this.container.addChild(this.world);

    this.planetNodes = [];
    this.aliens = [];
    const progress = getProgress();

    PLANETS.forEach((planet, i) => {
      const node = new PIXI.Container();
      node.x = planetX(i);
      node.y = i % 2 === 0 ? 330 : 500;
      const saved = progress.planets.find((p) => p.id === planet.id);

      const body = makePlanet(planet.seed, PLANET_R);
      this.planetNodes.push({ node, body, planet });

      // Alien peeking out from beside the planet
      const alien = makeAlien(planet.seed * 7 + 1, 56);
      alien.x = PLANET_R * 0.85;
      alien.y = -PLANET_R * 0.85;
      this.aliens.push(alien);

      node.addChild(alien, body);

      const name = makeText(planet.name, 30);
      name.anchor.set(0.5);
      name.y = PLANET_R + 42;
      node.addChild(name);

      if (!saved.unlocked) {
        body.alpha = 0.55;
        alien.visible = false;
        const lock = new PIXI.Sprite(textureFor('lock'));
        lock.anchor.set(0.5);
        lock.width = lock.height = 54;
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
        starsRow.y = PLANET_R + 84;
        node.addChild(starsRow);
      }

      node.eventMode = 'static';
      node.cursor = saved.unlocked ? 'pointer' : 'default';
      node.hitArea = new PIXI.Circle(0, 0, PLANET_R + 20);
      node.on('pointertap', () => {
        if (this.dragDist > 12 || this.zooming) return;
        if (isUnlocked(planet.id)) this.launchPlanet(planet, node);
        else this.shakeLock(node);
      });

      this.world.addChild(node);

      // Pulse the newly unlocked planet to draw the eye
      if (data.pulsePlanetId === planet.id) {
        this.pulseNode(body);
      }
    });

    // The child's ship parked at the furthest unlocked planet
    const parkedAt = furthestUnlocked() - 1;
    this.parkedShip = new PIXI.Sprite(textureFor('ship_body'));
    this.parkedShip.anchor.set(0.5);
    this.parkedShip.width = this.parkedShip.height = 90;
    this.parkedShip.x = planetX(parkedAt) - PLANET_R - 70;
    this.parkedShip.y = (parkedAt % 2 === 0 ? 330 : 500) - PLANET_R - 40;
    this.parkedShip.rotation = -0.25;
    this.world.addChild(this.parkedShip);

    // Title
    const title = makeText('SPACE PHONICS', 44, { fill: COLORS.gold });
    title.anchor.set(0.5, 0);
    title.x = W / 2;
    title.y = 18;
    this.container.addChild(title);

    // Scroll arrows
    this.mkArrow(-1, 70);
    this.mkArrow(1, W - 70);

    // Drag to scroll
    this.container.eventMode = 'static';
    this.container.hitArea = new PIXI.Rectangle(0, 0, W, H);
    let dragging = false;
    let lastX = 0;
    this.container.on('pointerdown', (e) => {
      dragging = true;
      this.dragDist = 0;
      lastX = e.global.x;
    });
    this.container.on('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.global.x - lastX;
      lastX = e.global.x;
      this.dragDist += Math.abs(dx);
      this.setScroll(this.scrollX - dx / this.container.worldTransform.a);
    });
    const stop = () => { dragging = false; };
    this.container.on('pointerup', stop);
    this.container.on('pointerupoutside', stop);

    // Start centered on the furthest unlocked planet
    this.setScroll(planetX(parkedAt) - W / 2);

    this.time = 0;
  }

  mkArrow(dir, x) {
    const btn = makeButton(dir < 0 ? '◀' : '▶', { width: 76, height: 76, fontSize: 30 });
    btn.x = x;
    btn.y = H - 80;
    btn.on('pointertap', () => this.glideScroll(dir * 560));
    this.container.addChild(btn);
  }

  glideScroll(dx) {
    const target = clamp(this.scrollX + dx, 0, this.worldWidth - W);
    const state = { v: this.scrollX };
    tween(state, { v: target }, 450, {
      ease: Ease.outCubic,
      onUpdate: () => this.setScroll(state.v),
    });
  }

  setScroll(x) {
    this.scrollX = clamp(x, 0, this.worldWidth - W);
    this.world.x = -this.scrollX;
    this.starfield.setScroll(this.scrollX);
  }

  pulseNode(body) {
    const grow = () => tween(body.scale, { x: 1.12, y: 1.12 }, 600, { ease: Ease.inOutQuad })
      .then(() => tween(body.scale, { x: 1, y: 1 }, 600, { ease: Ease.inOutQuad }))
      .then(() => { if (!this._destroyed) grow(); });
    grow();
  }

  shakeLock(node) {
    sfxBoing();
    const lock = node.lock;
    if (!lock) return;
    const seq = [-0.3, 0.3, -0.2, 0.2, 0];
    let p = Promise.resolve();
    for (const r of seq) p = p.then(() => tween(lock, { rotation: r }, 70));
    say('Get all ten right on the planet before it to unlock this one!', { interrupt: true });
  }

  async launchPlanet(planet, node) {
    this.zooming = true;
    sfxTap();
    stopSpeech();
    // Zoom-in transition: scale the world around the tapped planet
    const gx = node.x - this.scrollX;
    const gy = node.y;
    this.world.pivot.set(node.x, node.y);
    this.world.position.set(gx, gy);
    await Promise.all([
      tween(this.world.scale, { x: 3, y: 3 }, 600, { ease: Ease.inCubic }),
      tween(this.world, { alpha: 0.6 }, 600),
    ]);
    this.game.scenes.switchTo(new IntroScene(this.game), { planet });
  }

  async exit() {
    this._destroyed = true;
    stopSpeech();
  }

  update(dtMS) {
    this.time += dtMS / 1000;
    this.starfield.tick(dtMS);
    for (const { body } of this.planetNodes) body.tick(dtMS);
    for (const alien of this.aliens) if (alien.visible) alien.tick(dtMS);
    if (this.parkedShip) this.parkedShip.y += Math.sin(this.time * 1.6) * 0.15;
  }
}
