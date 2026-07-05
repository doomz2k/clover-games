// Planet intro: the alien greets the child, the delivery ship descends and
// parks with its 10 empty cargo bays, and a big "Let's go!" button starts
// the question round.

import { Scene, W, H } from '../core/sceneManager.js';
import { makeStarfield, makeText, makeButton, popIn, pulseForever, COLORS } from '../core/ui.js';
import { makePlanet } from '../gen/planetGenerator.js';
import { makeAlien } from '../gen/alienGenerator.js';
import { makeCargoShip } from '../core/cargoShip.js';
import { tween, Ease, wait } from '../core/tween.js';
import { textureFor } from '../core/assets.js';
import { burst } from '../core/particles.js';
import { sfxWhoosh, sfxClunk } from '../core/audio.js';
import { say, stopSpeech } from '../core/speech.js';
import { QuestionScene } from './questionScene.js';

export class IntroScene extends Scene {
  async enter({ planet }) {
    this.planet = planet;

    this.starfield = makeStarfield(W, H);
    this.container.addChild(this.starfield.container);

    // Planet surface fills the bottom of the frame
    this.bigPlanet = makePlanet(planet.seed, 620);
    this.bigPlanet.x = W / 2;
    this.bigPlanet.y = H + 430;
    this.container.addChild(this.bigPlanet);

    const name = makeText(planet.name, 56, { fill: COLORS.gold });
    name.anchor.set(0.5);
    name.x = W / 2;
    name.y = 78;
    this.container.addChild(name);
    popIn(name, 100);

    // Alien bounces into view
    this.alien = makeAlien(planet.seed * 7 + 1, 170);
    this.alien.x = W / 2 - 240;
    this.alien.y = H + 160;
    this.container.addChild(this.alien);
    tween(this.alien, { y: H - 270 }, 700, { ease: Ease.outBounce, delay: 250 });

    // Ship descends and parks
    this.ship = makeCargoShip(880);
    this.ship.x = W / 2 + 120;
    this.ship.y = -140;
    this.container.addChild(this.ship);
    tween(this.ship, { y: H - 420 }, 1100, { ease: Ease.outCubic, delay: 500 });

    // Arrival cutscene: the child's rocket swoops in and touches down
    // on the planet rim (fire-and-forget; never blocks the Go button)
    this.rocket = new PIXI.Container();
    const flame = new PIXI.Sprite(textureFor('ship_flame'));
    flame.anchor.set(1, 0.5);
    flame.rotation = -Math.PI / 2;
    flame.width = 100;
    flame.height = 50;
    flame.y = 52;
    const body = new PIXI.Sprite(textureFor('ship_body'));
    body.anchor.set(0.5);
    body.rotation = -Math.PI / 2;
    body.width = body.height = 118;
    this.rocket.addChild(flame, body);
    this.rocket.x = -160;
    this.rocket.y = 120;
    this.rocket.rotation = 0.5;
    this.container.addChild(this.rocket);
    (async () => {
      sfxWhoosh();
      tween(this.rocket, { rotation: 0 }, 1300, { ease: Ease.outQuad });
      tween(this.rocket, { x: W / 2 - 470 }, 1400, { ease: Ease.outCubic });
      await tween(this.rocket, { y: H - 335 }, 1400, { ease: Ease.outQuad });
      flame.visible = false;
      sfxClunk();
      const layer = this.game.scenes.particleLayer;
      const lp = layer.toLocal(this.rocket.getGlobalPosition());
      burst(lp.x, lp.y + 50, { count: 14, speed: 160, size: 0.7 });
    })().catch(() => {});

    // greet once the fade has lifted and the alien has landed
    wait(1000).then(() => {
      say(`Hello! I'm ${planet.alien} on ${planet.name}. Can you help load my delivery?`, { profile: 'alien' });
      this.alien.jump();
    });

    // Let's go!
    this.goBtn = makeButton("Let's go!", { width: 330, height: 96, fontSize: 40 });
    this.goBtn.x = W / 2;
    this.goBtn.y = H - 110;
    this.container.addChild(this.goBtn);
    popIn(this.goBtn, 900).then(() => pulseForever(this.goBtn));
    this.goBtn.once('pointertap', () => {
      stopSpeech();
      this.game.scenes.switchTo(new QuestionScene(this.game), { planet });
    });
  }

  async exit() {
    stopSpeech();
  }

  update(dtMS) {
    this.starfield.tick(dtMS);
    this.bigPlanet.tick(dtMS);
    this.alien.tick(dtMS);
  }
}
