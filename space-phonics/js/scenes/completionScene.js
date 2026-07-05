// Planet completion: rocket launch, delivery cutscene, alien celebration and
// the star rating. A perfect run gets the full launch-trail-and-confetti
// treatment and unlocks the next planet; an imperfect run gets a polite wave
// and a prominent retry button.

import { Scene, W, H } from '../core/sceneManager.js';
import { makeStarfield, makeText, makeButton, popIn, COLORS } from '../core/ui.js';
import { makePlanet } from '../gen/planetGenerator.js';
import { makeAlien } from '../gen/alienGenerator.js';
import { textureFor } from '../core/assets.js';
import { PLANETS } from '../data/planets.js';
import { savePlanet } from '../core/progress.js';
import { tween, Ease, wait } from '../core/tween.js';
import { say, stopSpeech } from '../core/speech.js';
import { burst, shower, thrusterPuff } from '../core/particles.js';
import { sfxWhoosh, sfxFanfare, sfxClunk, sfxCorrect } from '../core/audio.js';
import { IntroScene } from './introScene.js';
import { MapScene } from './mapScene.js';

function starsFor(score) {
  if (score >= 10) return 3;
  if (score >= 8) return 2;
  if (score >= 5) return 1;
  return 0;
}

export class CompletionScene extends Scene {
  async enter({ planet, score, words }) {
    this.words = words || [];
    this.planet = planet;
    this.score = score;
    this.stars = starsFor(score);
    this.perfect = this.stars === 3;
    this.launching = false;

    const { unlockedNext } = savePlanet(planet.id, this.stars, score);
    this.unlockedNext = unlockedNext;
    this.nextPlanet = PLANETS.find((p) => p.id === planet.id + 1);

    this.starfield = makeStarfield(W, H);
    this.container.addChild(this.starfield.container);

    this.surface = makePlanet(planet.seed, 640);
    this.surface.x = W / 2;
    this.surface.y = H + 470;
    this.container.addChild(this.surface);

    this.alien = makeAlien(planet.seed * 7 + 1, 150);
    this.alien.x = W / 2 - 300;
    this.alien.y = H - 240;
    this.container.addChild(this.alien);

    // Vertical rocket on the pad
    this.rocket = this.makeRocket();
    this.rocket.x = W / 2 + 120;
    this.rocket.y = H - 260;
    this.container.addChild(this.rocket);

    // Run the cutscene AFTER enter() returns so it plays in view rather
    // than behind the scene-transition fade.
    this.runSequence().catch(console.error);
  }

  async runSequence() {
    await wait(700); // let the fade lift
    if (this.perfect) await this.perfectSequence();
    else await this.imperfectSequence();
  }

  makeRocket() {
    const c = new PIXI.Container();
    const flame = new PIXI.Sprite(textureFor('ship_flame'));
    flame.anchor.set(1, 0.5);
    flame.rotation = -Math.PI / 2; // plume points down
    flame.width = 150;
    flame.height = 74;
    flame.y = 74;
    flame.visible = false;
    const body = new PIXI.Sprite(textureFor('ship_body'));
    body.anchor.set(0.5);
    body.rotation = -Math.PI / 2; // nose up
    body.width = body.height = 170;
    c.addChild(flame, body);
    c.flame = flame;
    return c;
  }

  // ---------- perfect run ----------

  async perfectSequence() {
    // 1-2. thrusters fire, screen shakes, ship accelerates off-screen
    this.rocket.flame.visible = true;
    sfxWhoosh();
    this.launching = true;
    this.shakeScreen(10, 900);
    await tween(this.rocket, { y: -260 }, 1500, { ease: Ease.inCubic });
    this.launching = false;

    // 3. delivery cutscene: rocket lands back on the surface
    await wait(250);
    this.rocket.y = -260;
    this.rocket.x = W / 2 + 40;
    sfxWhoosh();
    await tween(this.rocket, { y: H - 250 }, 1300, { ease: Ease.outCubic });
    this.rocket.flame.visible = false;
    sfxClunk();

    // crates tumble out
    for (let i = 0; i < 4; i++) {
      const crate = new PIXI.Sprite(textureFor('crate'));
      crate.anchor.set(0.5);
      crate.width = crate.height = 56;
      crate.x = this.rocket.x - 30;
      crate.y = this.rocket.y + 20;
      this.container.addChild(crate);
      const tx = this.rocket.x - 110 - i * 68;
      const state = { t: 0 };
      const sy = crate.y, ey = H - 190;
      tween(state, { t: 1 }, 550, {
        delay: i * 160,
        ease: Ease.outQuad,
        onUpdate: () => {
          crate.x = this.rocket.x - 30 + (tx - (this.rocket.x - 30)) * state.t;
          crate.y = sy + (ey - sy) * state.t - Math.sin(state.t * Math.PI) * 120;
          crate.rotation = state.t * Math.PI * (i % 2 ? 1 : -1);
        },
      }).then(() => sfxClunk());
    }
    await wait(1000);

    // 4-5. alien celebration + confetti shower
    sfxFanfare();
    shower(W, { count: 110 });
    this.alien.celebrate();
    burst(this.alien.x, this.alien.y - 60, { count: 40 });

    // 6. voice
    const nextName = this.nextPlanet ? this.nextPlanet.name : null;
    if (nextName) {
      say(`Amazing! ${this.planet.alien} got everything! You've unlocked ${nextName}!`);
    } else {
      say(`Amazing! ${this.planet.alien} got everything! You've delivered to the whole universe!`);
    }

    // 7. stars, one by one
    await this.showStars();
    this.showButtons(false);
  }

  // ---------- imperfect run ----------

  async imperfectSequence() {
    // shorter lift-off, no trail
    this.rocket.flame.visible = true;
    sfxWhoosh();
    await tween(this.rocket, { y: -260 }, 1200, { ease: Ease.inQuad });

    // polite but slightly disappointed alien
    this.alien.setMood('sad');
    await this.alien.wobble();
    this.alien.setMood('idle');
    this.alien.jump(12);
    say(`Good try! Can you get them all right to unlock the next planet?`);

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
      this.perfect ? 'PERFECT DELIVERY!' : `${this.score} / 10 loaded`,
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
        burst(p.x, p.y, { count: 18, speed: 260, size: 0.8 });
      }
    }

    // recap strip: the words practised this round, tappable to hear again
    if (this.words.length) {
      const recap = this.words.slice(0, 7); // 7 chips fit the 1280 stage
      const label = makeText('You practised:', 24, { fill: 0x8888c8 });
      label.anchor.set(0.5);
      label.y = 118;
      holder.addChild(label);
      popIn(label, 200);
      const chipW = 132, gap = 14;
      const rowW = recap.length * chipW + (recap.length - 1) * gap;
      recap.forEach((word, i) => {
        const chip = new PIXI.Container();
        chip.addChild(
          new PIXI.Graphics()
            .roundRect(-chipW / 2, -26, chipW, 56, 16).fill(0x1a1a4a)
            .roundRect(-chipW / 2, -26, chipW, 56, 16).stroke({ width: 3, color: 0xffd75e }),
        );
        const t = makeText(word, 30, { fill: COLORS.gold });
        t.anchor.set(0.5);
        chip.addChild(t);
        chip.x = -rowW / 2 + chipW / 2 + i * (chipW + gap);
        chip.y = 168;
        chip.eventMode = 'static';
        chip.cursor = 'pointer';
        chip.on('pointertap', () => say(word, { interrupt: true }));
        holder.addChild(chip);
        popIn(chip, 260 + i * 90);
      });
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
        pulsePlanetId: this.unlockedNext ? this.planet.id + 1 : undefined,
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
        this.game.scenes.switchTo(new IntroScene(this.game), { planet: this.planet });
      });
      this.container.addChild(retry);
      popIn(retry, 320);
      this.retryBtn = retry;
    }
  }

  shakeScreen(strength, duration) {
    const t0 = performance.now();
    const kick = () => {
      if (performance.now() - t0 > duration) {
        this.container.position.set(0, 0);
        return;
      }
      this.container.x = (Math.random() - 0.5) * strength * 2;
      this.container.y = (Math.random() - 0.5) * strength;
      requestAnimationFrame(kick);
    };
    kick();
  }

  async exit() {
    stopSpeech();
  }

  update(dtMS) {
    this.starfield.tick(dtMS);
    this.surface.tick(dtMS);
    this.alien.tick(dtMS);
    if (this.launching) {
      // particle trail streaming behind the rocket
      thrusterPuff(this.rocket.x, this.rocket.y + 85, 0, 1);
    }
  }
}
