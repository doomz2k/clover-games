// Season complete: the finished garden under a golden-hour sky, butterflies
// and bees swarming, stars landing one by one. Incomplete seasons get a
// partial celebration and a prominent retry.

import { Scene, W, H } from '../core/sceneManager.js';
import { makeGarden, makeText, makeButton, popIn, COLORS } from '../core/ui.js';
import { makePlant } from '../gen/plantGenerator.js';
import { textureFor } from '../core/assets.js';
import { SEASONS, FAMILIES, FULL_BLOOM } from '../data/seasons.js';
import { saveSeason } from '../core/progress.js';
import { tween, Ease, wait } from '../core/tween.js';
import { say, stopSpeech } from '../core/speech.js';
import { burst, shower } from '../core/particles.js';
import { sfxFanfare, sfxShimmer, sfxCorrect } from '../core/audio.js';
import { GardenScene } from './gardenScene.js';
import { SeasonSelectScene } from './seasonSelect.js';

const PLANT_X = [280, 640, 1000];

export class SeasonCompleteScene extends Scene {
  async enter({ season, stars, bloomed, stages }) {
    this.season = season;
    this.stars = stars;
    this.perfect = stars === 3;
    this.critters = [];

    const { unlockedNext } = saveSeason(season.id, stars, bloomed);
    this.unlockedNext = unlockedNext;
    this.nextSeason = SEASONS.find((s) => s.id === season.id + 1);

    this.garden = makeGarden(W, H, { seasonShift: season.skyShift });
    this.garden.setTimeOfDay(0.9);
    this.container.addChild(this.garden.container);

    this.plants = [];
    FAMILIES.forEach((family, i) => {
      const plant = makePlant(family, season.hues[i], 1);
      plant.setStage(stages[i]);
      plant.x = PLANT_X[i];
      plant.y = this.garden.soilY + 4;
      this.container.addChild(plant);
      this.plants.push(plant);
    });

    // Run the celebration AFTER enter() returns, so it plays in view rather
    // than behind the scene-transition fade.
    this.runSequence(bloomed).catch(console.error);
  }

  async runSequence(bloomed) {
    await wait(700); // let the fade lift
    if (bloomed === 3) {
      // golden hour + swarm + confetti
      this.garden.goldenHour();
      sfxFanfare();
      sfxShimmer();
      shower(W, { count: 100 });
      for (const plant of this.plants) plant.bloomPulse();
      this.spawnCritters(14);
      if (this.nextSeason && this.perfect) {
        say(`Your garden is beautiful! You've unlocked ${this.nextSeason.name}!`);
      } else if (!this.nextSeason && this.perfect) {
        say('Your garden is beautiful! You are a master gardener!');
      } else {
        say('Your garden is beautiful! Grow it with no pest damage to unlock the next season!');
      }
    } else {
      this.spawnCritters(4);
      for (const plant of this.plants) {
        if (plant.stage === FULL_BLOOM) plant.bloomPulse();
      }
      say('Good try! Can you get all three flowers to bloom?');
    }

    await this.showStars(bloomed);
    this.showButtons(bloomed < 3);
  }

  // Butterflies and bees fluttering across the garden
  spawnCritters(n) {
    for (let i = 0; i < n; i++) {
      const isBee = i % 3 === 2;
      const critter = new PIXI.Container();
      const g = new PIXI.Graphics();
      if (isBee) {
        g.ellipse(0, 0, 10, 7).fill(0xffd75e).stroke({ width: 2.5, color: 0x1e1e46 });
        g.moveTo(-3, -7).lineTo(-3, 7).stroke({ width: 3, color: 0x1e1e46 });
        g.moveTo(3, -7).lineTo(3, 7).stroke({ width: 3, color: 0x1e1e46 });
      } else {
        const hue = [0xf7a1c4, 0x4cc9f0, 0xb07fe0, 0xff9d5c][i % 4];
        g.ellipse(-7, -4, 8, 11).fill(hue).stroke({ width: 2.5, color: 0x1e1e46 });
        g.ellipse(7, -4, 8, 11).fill(hue).stroke({ width: 2.5, color: 0x1e1e46 });
        g.ellipse(0, 2, 2.5, 9).fill(0x1e1e46);
      }
      const wings = new PIXI.Graphics()
        .ellipse(-8, -2, 6, 4).fill({ color: 0xffffff, alpha: 0.55 })
        .ellipse(8, -2, 6, 4).fill({ color: 0xffffff, alpha: 0.55 });
      critter.addChild(g, isBee ? wings : new PIXI.Container());
      critter.x = Math.random() * W;
      critter.y = 100 + Math.random() * (this.garden.soilY - 180);
      critter._cx = critter.x;
      critter._cy = critter.y;
      critter._rx = 60 + Math.random() * 160;
      critter._ry = 30 + Math.random() * 80;
      critter._speed = 0.6 + Math.random() * 1.2;
      critter._phase = Math.random() * Math.PI * 2;
      this.container.addChild(critter);
      this.critters.push(critter);
    }
  }

  async showStars(bloomed) {
    const holder = new PIXI.Container();
    holder.x = W / 2;
    holder.y = 200;
    this.container.addChild(holder);

    const title = makeText(
      bloomed === 3 ? (this.perfect ? 'PERFECT GARDEN!' : 'ALL BLOOMED!') : `${bloomed} / 3 bloomed`,
      52,
      { fill: bloomed === 3 ? COLORS.gold : 0xffffff, stroke: 0x2e3d1a, strokeWidth: 6 },
    );
    title.anchor.set(0.5);
    title.y = -100;
    holder.addChild(title);
    popIn(title);

    for (let i = 0; i < 3; i++) {
      const filled = i < this.stars;
      const st = new PIXI.Sprite(textureFor(filled ? 'ui_star' : 'ui_star_empty'));
      st.anchor.set(0.5);
      st.width = st.height = i === 1 ? 120 : 96;
      st.x = (i - 1) * 140;
      st.y = i === 1 ? -4 : 8;
      holder.addChild(st);
      await popIn(st, 120, 420);
      if (filled) {
        sfxCorrect();
        const layer = this.game.scenes.particleLayer;
        const p = layer.toLocal(st.getGlobalPosition());
        burst(p.x, p.y, { count: 16, speed: 250, size: 0.8 });
      }
    }
  }

  showButtons(retryProminent) {
    const mapBtn = makeButton('Season select', {
      width: retryProminent ? 280 : 360,
      height: retryProminent ? 78 : 96,
      fontSize: retryProminent ? 26 : 34,
    });
    mapBtn.x = retryProminent ? W / 2 + 200 : W / 2;
    mapBtn.y = H - 90;
    mapBtn.once('pointertap', () => {
      this.game.scenes.switchTo(new SeasonSelectScene(this.game), {
        pulseSeasonId: this.unlockedNext ? this.season.id + 1 : undefined,
      });
    });
    this.container.addChild(mapBtn);
    popIn(mapBtn, 200);
    this.mapBtn = mapBtn;

    if (retryProminent) {
      const retry = makeButton('Try again!', { width: 340, height: 96, fontSize: 38, fill: 0x7ac74f, edge: 0x437a25 });
      retry.x = W / 2 - 140;
      retry.y = H - 94;
      retry.once('pointertap', () => {
        this.game.scenes.switchTo(new GardenScene(this.game), { season: this.season });
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
    this.garden.tick(dtMS);
    for (const p of this.plants) p.tick(dtMS);
    const dt = dtMS / 1000;
    for (const c of this.critters) {
      c._phase += dt * c._speed;
      c.x = c._cx + Math.cos(c._phase) * c._rx;
      c.y = c._cy + Math.sin(c._phase * 1.7) * c._ry;
      c.scale.x = Math.cos(c._phase) < 0 ? 1 : -1;
      c.rotation = Math.sin(c._phase * 3) * 0.15;
    }
  }
}
