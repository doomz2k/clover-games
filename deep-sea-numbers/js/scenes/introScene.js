// Depth intro: the creature greets the child on their reef, the submarine
// putters down with the empty pearl rack, and a big "Dive in!" button
// starts the question round.

import { Scene, W, H } from '../core/sceneManager.js';
import { makeOcean, makeText, makeButton, popIn, pulseForever, COLORS } from '../core/ui.js';
import { makeReef } from '../gen/reefGenerator.js';
import { makeCreature } from '../gen/creatureGenerator.js';
import { makePearlRack } from '../core/pearlRack.js';
import { textureFor } from '../core/assets.js';
import { LEVELS } from '../data/levels.js';
import { tween, Ease, wait } from '../core/tween.js';
import { burst } from '../core/particles.js';
import { say, stopSpeech } from '../core/speech.js';
import { QuestionScene } from './questionScene.js';

export class IntroScene extends Scene {
  async enter({ level }) {
    this.level = level;
    const depthT = (level.id - 1) / (LEVELS.length - 1);

    this.ocean = makeOcean(W, H, 0, { depthT });
    this.container.addChild(this.ocean.container);

    this.reef = makeReef(level.seed, W + 80, 220);
    this.reef.x = W / 2;
    this.reef.y = H - 150;
    this.container.addChild(this.reef);

    const name = makeText(level.name, 56, { fill: COLORS.gold });
    name.anchor.set(0.5);
    name.x = W / 2;
    name.y = 78;
    this.container.addChild(name);
    popIn(name, 100);

    // Arrival cutscene: a splash-down curtain of bubbles rushes up as
    // the dive begins (fire-and-forget, purely decorative)
    (async () => {
      const layer = this.game.scenes.particleLayer;
      for (let i = 0; i < 6; i++) {
        burst(120 + Math.random() * (W - 240), H - 40, {
          count: 12, speed: 340, size: 0.7,
          colors: [0x4cc9f0, 0xbfe8f9, 0xffffff],
        });
        await wait(160);
      }
    })().catch(() => {});

    // Creature swims in from the side
    this.creature = makeCreature(level.seed * 3 + 7, 180);
    this.creature.x = -180;
    this.creature.y = H - 300;
    this.container.addChild(this.creature);
    tween(this.creature, { x: W / 2 - 250 }, 900, { ease: Ease.outCubic, delay: 250 });

    // Submarine + pearl rack sink down from the surface
    this.sub = new PIXI.Sprite(textureFor('submarine'));
    this.sub.anchor.set(0.5);
    this.sub.width = this.sub.height = 150;
    this.sub.x = W / 2 + 330;
    this.sub.y = -160;
    tween(this.sub, { y: H - 350 }, 1200, { ease: Ease.outCubic, delay: 450 });

    this.rack = makePearlRack(760);
    this.rack.x = W / 2 + 60;
    this.rack.y = -300;
    tween(this.rack, { y: H - 480 }, 1200, { ease: Ease.outCubic, delay: 600 });
    this.container.addChild(this.rack, this.sub);

    // greet once the fade has lifted and the creature has swum in
    wait(1000).then(() => {
      say(`Hello! I'm ${level.creature} at ${level.name}. Can you help me collect my pearls?`, { profile: 'alien' });
      this.creature.jump();
    });

    this.goBtn = makeButton('Dive in!', { width: 330, height: 96, fontSize: 40 });
    this.goBtn.x = W / 2;
    this.goBtn.y = H - 110;
    this.container.addChild(this.goBtn);
    popIn(this.goBtn, 900).then(() => pulseForever(this.goBtn));
    this.goBtn.once('pointertap', () => {
      stopSpeech();
      this.game.scenes.switchTo(new QuestionScene(this.game), { level });
    });
  }

  async exit() {
    stopSpeech();
  }

  update(dtMS) {
    this.ocean.tick(dtMS);
    this.reef.tick(dtMS);
    this.creature.tick(dtMS);
  }
}
