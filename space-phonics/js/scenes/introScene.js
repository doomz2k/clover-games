// Planet intro: the alien greets the child, the delivery ship descends and
// parks with its 10 empty cargo bays, and a big "Let's go!" button starts
// the question round.

import { Scene, W, H } from '../core/sceneManager.js';
import { makeStarfield, makeText, makeButton, popIn, COLORS } from '../core/ui.js';
import { makePlanet } from '../gen/planetGenerator.js';
import { makeAlien } from '../gen/alienGenerator.js';
import { makeCargoShip } from '../core/cargoShip.js';
import { tween, Ease, wait } from '../core/tween.js';
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

    // greet once the fade has lifted and the alien has landed
    wait(1000).then(() => {
      say(`Hello! I'm ${planet.alien} on ${planet.name}. Can you help load my delivery?`);
      this.alien.jump();
    });

    // Let's go!
    this.goBtn = makeButton("Let's go!", { width: 330, height: 96, fontSize: 40 });
    this.goBtn.x = W / 2;
    this.goBtn.y = H - 110;
    this.container.addChild(this.goBtn);
    popIn(this.goBtn, 900);
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
