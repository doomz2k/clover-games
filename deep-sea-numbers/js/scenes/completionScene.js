// Depth completion: the submarine delivers the treasure chest down to the
// reef, pearls spill out, the creature celebrates and the star rating lands.
// An imperfect run gets a polite wave and a prominent retry button.

import { Scene, W, H } from '../core/sceneManager.js';
import { makeOcean, makeText, makeButton, popIn, COLORS } from '../core/ui.js';
import { makeReef } from '../gen/reefGenerator.js';
import { makeCreature } from '../gen/creatureGenerator.js';
import { textureFor } from '../core/assets.js';
import { LEVELS } from '../data/levels.js';
import { saveLevel } from '../core/progress.js';
import { tween, Ease, wait } from '../core/tween.js';
import { say, stopSpeech } from '../core/speech.js';
import { burst, shower } from '../core/particles.js';
import { sfxWhoosh, sfxFanfare, sfxClunk, sfxCorrect } from '../core/audio.js';
import { IntroScene } from './introScene.js';
import { MapScene } from './mapScene.js';

const BUBBLE_COLORS = [0x4cc9f0, 0xbfe8f9, 0xffffff, 0xffd75e, 0xf7a1c4];

function starsFor(score) {
  if (score >= 10) return 3;
  if (score >= 8) return 2;
  if (score >= 5) return 1;
  return 0;
}

export class CompletionScene extends Scene {
  async enter({ level, score }) {
    this.level = level;
    this.score = score;
    this.stars = starsFor(score);
    this.perfect = this.stars === 3;

    const { unlockedNext } = saveLevel(level.id, this.stars, score);
    this.unlockedNext = unlockedNext;
    this.nextLevel = LEVELS.find((l) => l.id === level.id + 1);

    const depthT = (level.id - 1) / (LEVELS.length - 1);
    this.ocean = makeOcean(W, H, 0, { depthT });
    this.container.addChild(this.ocean.container);

    this.reef = makeReef(level.seed, W + 80, 220);
    this.reef.x = W / 2;
    this.reef.y = H - 150;
    this.container.addChild(this.reef);

    this.creature = makeCreature(level.seed * 3 + 7, 160);
    this.creature.x = W / 2 - 280;
    this.creature.y = H - 260;
    this.container.addChild(this.creature);

    // Submarine towing the chest, up near the surface
    this.sub = new PIXI.Sprite(textureFor('submarine'));
    this.sub.anchor.set(0.5);
    this.sub.width = this.sub.height = 140;
    this.sub.x = W / 2 + 220;
    this.sub.y = -140;
    this.chest = new PIXI.Sprite(textureFor('chest'));
    this.chest.anchor.set(0.5);
    this.chest.width = this.chest.height = 120;
    this.chest.x = this.sub.x - 10;
    this.chest.y = this.sub.y + 110;
    this.container.addChild(this.chest, this.sub);

    // Run the cutscene AFTER enter() returns so it plays in view rather
    // than behind the scene-transition fade.
    this.runSequence().catch(console.error);
  }

  async runSequence() {
    await wait(700); // let the fade lift
    if (this.perfect) await this.perfectSequence();
    else await this.imperfectSequence();
  }

  // ---------- perfect run ----------

  async perfectSequence() {
    // Sub tows the chest down to the reef
    sfxWhoosh();
    await Promise.all([
      tween(this.sub, { y: H - 420 }, 1400, { ease: Ease.outCubic }),
      tween(this.chest, { y: H - 310 }, 1400, { ease: Ease.outCubic }),
    ]);
    // chest settles onto the sand
    await tween(this.chest, { y: H - 210, x: this.sub.x - 40 }, 600, { ease: Ease.inQuad });
    sfxClunk();
    const layer = this.game.scenes.particleLayer;
    const p = layer.toLocal(this.chest.getGlobalPosition());
    burst(p.x, p.y - 30, { count: 30, colors: BUBBLE_COLORS, speed: 300 });

    // pearls spill toward the creature
    for (let i = 0; i < 5; i++) {
      const pearl = new PIXI.Sprite(textureFor('obj_pearl'));
      pearl.anchor.set(0.5);
      pearl.width = pearl.height = 42;
      pearl.x = this.chest.x - 20;
      pearl.y = this.chest.y - 20;
      this.container.addChild(pearl);
      const tx = this.chest.x - 130 - i * 60;
      const sy = pearl.y, ey = H - 190;
      const state = { t: 0 };
      tween(state, { t: 1 }, 550, {
        delay: i * 150,
        ease: Ease.outQuad,
        onUpdate: () => {
          pearl.x = this.chest.x - 20 + (tx - (this.chest.x - 20)) * state.t;
          pearl.y = sy + (ey - sy) * state.t - Math.sin(state.t * Math.PI) * 110;
        },
      }).then(() => sfxClunk());
    }
    await wait(1000);

    sfxFanfare();
    shower(W, { count: 110 });
    this.creature.celebrate();
    burst(this.creature.x, this.creature.y - 60, { count: 40, colors: BUBBLE_COLORS });

    if (this.nextLevel) {
      say(`Amazing! ${this.level.creature} got every pearl! You've unlocked ${this.nextLevel.name}!`);
    } else {
      say(`Amazing! ${this.level.creature} got every pearl! You've explored the whole ocean!`);
    }

    await this.showStars();
    this.showButtons(false);
  }

  // ---------- imperfect run ----------

  async imperfectSequence() {
    sfxWhoosh();
    await tween(this.sub, { y: H - 420 }, 1200, { ease: Ease.outCubic });
    await tween(this.chest, { y: H - 310 }, 400, { ease: Ease.outQuad });

    this.creature.setMood('sad');
    await this.creature.wobble();
    this.creature.setMood('idle');
    this.creature.jump(12);
    say('Good try! Can you collect all ten pearls to dive deeper?');

    await this.showStars();
    this.showButtons(true);
  }

  // ---------- shared ----------

  async showStars() {
    const holder = new PIXI.Container();
    holder.x = W / 2;
    holder.y = 240;
    this.container.addChild(holder);

    const title = makeText(
      this.perfect ? 'ALL PEARLS FOUND!' : `${this.score} / 10 pearls`,
      52,
      { fill: this.perfect ? COLORS.gold : 0xffffff },
    );
    title.anchor.set(0.5);
    title.y = -110;
    holder.addChild(title);
    popIn(title);

    for (let i = 0; i < 3; i++) {
      const filled = i < this.stars;
      const st = new PIXI.Sprite(textureFor(filled ? 'ui_star' : 'ui_star_empty'));
      st.anchor.set(0.5);
      st.width = st.height = i === 1 ? 130 : 104;
      st.x = (i - 1) * 150;
      st.y = i === 1 ? -6 : 10;
      holder.addChild(st);
      await popIn(st, 120, 420);
      if (filled) {
        sfxCorrect();
        const layer = this.game.scenes.particleLayer;
        const p = layer.toLocal(st.getGlobalPosition());
        burst(p.x, p.y, { count: 18, speed: 260, size: 0.8, colors: BUBBLE_COLORS });
      }
    }
  }

  showButtons(retryProminent) {
    const mapBtn = makeButton('To the map!', {
      width: retryProminent ? 260 : 340,
      height: retryProminent ? 78 : 96,
      fontSize: retryProminent ? 28 : 38,
    });
    mapBtn.x = retryProminent ? W / 2 + 190 : W / 2;
    mapBtn.y = H - 100;
    mapBtn.once('pointertap', () => {
      this.game.scenes.switchTo(new MapScene(this.game), {
        pulseLevelId: this.unlockedNext ? this.level.id + 1 : undefined,
      });
    });
    this.container.addChild(mapBtn);
    popIn(mapBtn, 200);
    this.mapBtn = mapBtn;

    if (retryProminent) {
      const retry = makeButton('Try again!', { width: 340, height: 96, fontSize: 38, fill: 0x7ac74f, edge: 0x437a25 });
      retry.x = W / 2 - 130;
      retry.y = H - 104;
      retry.once('pointertap', () => {
        this.game.scenes.switchTo(new IntroScene(this.game), { level: this.level });
      });
      this.container.addChild(retry);
      popIn(retry, 320);
      this.retryBtn = retry;
    }
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
