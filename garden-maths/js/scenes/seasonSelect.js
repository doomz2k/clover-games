// Season select: six garden-plot tiles on a sunny hillside, unlocking in
// sequence. Each tile shows a mini bloomed flower trio once earned.

import { Scene, W, H } from '../core/sceneManager.js';
import { makeGarden, makeText, makeCard, popIn, COLORS } from '../core/ui.js';
import { makePlant } from '../gen/plantGenerator.js';
import { textureFor } from '../core/assets.js';
import { SEASONS, FAMILIES } from '../data/seasons.js';
import { getProgress, isUnlocked } from '../core/progress.js';
import { tween, Ease } from '../core/tween.js';
import { sfxBoing, sfxTap } from '../core/audio.js';
import { say, stopSpeech } from '../core/speech.js';
import { GardenScene } from './gardenScene.js';

export class SeasonSelectScene extends Scene {
  async enter(data = {}) {
    this.garden = makeGarden(W, H, { seasonShift: 0.1 });
    this.garden.setTimeOfDay(0.35);
    this.container.addChild(this.garden.container);

    const title = makeText('GARDEN MATHS', 48, { fill: COLORS.gold, stroke: 0x2e3d1a, strokeWidth: 6 });
    title.anchor.set(0.5, 0);
    title.x = W / 2;
    title.y = 20;
    this.container.addChild(title);

    this.plants = [];
    const progress = getProgress();
    const cols = 3;
    SEASONS.forEach((season, i) => {
      const saved = progress.seasons.find((s) => s.id === season.id);
      const tile = makeCard(340, 250);
      tile.x = W / 2 + ((i % cols) - 1) * 380;
      tile.y = 260 + Math.floor(i / cols) * 300;

      const name = makeText(season.name, 33, { fill: COLORS.ink, shadow: false });
      name.anchor.set(0.5);
      name.y = -86;
      tile.addChild(name);

      if (saved.unlocked) {
        // mini flower trio - bloomed if the season has been beaten
        FAMILIES.forEach((family, k) => {
          const stage = saved.stars > 0 ? 3 : k === 1 ? 1 : 0;
          const mini = makePlant(family, season.hues[k], 0.42);
          mini.setStage(stage);
          mini.x = (k - 1) * 88;
          mini.y = 78;
          tile.addChild(mini);
          this.plants.push(mini);
        });
        const starsRow = new PIXI.Container();
        for (let s = 0; s < 3; s++) {
          const st = new PIXI.Sprite(textureFor(s < saved.stars ? 'ui_star' : 'ui_star_empty'));
          st.anchor.set(0.5);
          st.width = st.height = 30;
          st.x = (s - 1) * 36;
          starsRow.addChild(st);
        }
        starsRow.y = 100;
        tile.addChild(starsRow);
      } else {
        tile.alpha = 0.75;
        const lock = new PIXI.Sprite(textureFor('lock'));
        lock.anchor.set(0.5);
        lock.width = lock.height = 64;
        lock.y = 26;
        tile.addChild(lock);
        tile.lock = lock;
      }

      tile.eventMode = 'static';
      tile.cursor = saved.unlocked ? 'pointer' : 'default';
      tile.on('pointertap', () => {
        if (this.zooming) return;
        if (isUnlocked(season.id)) this.startSeason(season, tile);
        else this.shakeLock(tile);
      });

      this.container.addChild(tile);
      if (data.pulseSeasonId === season.id) this.pulseTile(tile);
    });
  }

  pulseTile(tile) {
    const grow = () => tween(tile.scale, { x: 1.06, y: 1.06 }, 600, { ease: Ease.inOutQuad })
      .then(() => tween(tile.scale, { x: 1, y: 1 }, 600, { ease: Ease.inOutQuad }))
      .then(() => { if (!this._destroyed) grow(); });
    grow();
  }

  shakeLock(tile) {
    sfxBoing();
    if (!tile.lock) return;
    let p = Promise.resolve();
    for (const r of [-0.3, 0.3, -0.2, 0.2, 0]) p = p.then(() => tween(tile.lock, { rotation: r }, 70));
    say('Grow all three flowers in the season before to unlock this one!', { interrupt: true });
  }

  async startSeason(season, tile) {
    this.zooming = true;
    sfxTap();
    stopSpeech();
    await tween(tile.scale, { x: 1.18, y: 1.18 }, 250, { ease: Ease.outBack });
    this.game.scenes.switchTo(new GardenScene(this.game), { season });
  }

  async exit() {
    this._destroyed = true;
    stopSpeech();
  }

  update(dtMS) {
    this.garden.tick(dtMS);
    for (const p of this.plants) p.tick(dtMS);
  }
}
