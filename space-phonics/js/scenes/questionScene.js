// The question round: 10 phonics questions, each correct answer loading one
// cargo crate onto the ship. Handles both question types, the three-strike
// hint ladder, particle feedback and the alien's running commentary.

import { Scene, W, H } from '../core/sceneManager.js';
import { makeStarfield, makeText, makeCard, makeButton, popIn, COLORS, FONT } from '../core/ui.js';
import { makeAlien } from '../gen/alienGenerator.js';
import { makeCargoShip } from '../core/cargoShip.js';
import { makePlanet } from '../gen/planetGenerator.js';
import { textureFor } from '../core/assets.js';
import { buildQuestions } from '../data/questions.js';
import { SOUND_SPEECH } from '../data/words.js';
import { tween, Ease, wait } from '../core/tween.js';
import { say, stopSpeech } from '../core/speech.js';
import { burst } from '../core/particles.js';
import { sfxCorrect, sfxCorrectSoft, sfxBoing, sfxFanfare, sfxTap } from '../core/audio.js';
import { CompletionScene } from './completionScene.js';

const CARD_W = 272;
const CARD_H = 226;
const CHOICE_X = [320, 640, 960];
const CHOICE_Y = 632;

export class QuestionScene extends Scene {
  async enter({ planet }) {
    this.planet = planet;
    this.questions = buildQuestions(planet);
    this.qIndex = 0;
    this.firstTryCount = 0;
    this.mistakes = 0;
    this.busy = false;

    this.starfield = makeStarfield(W, H);
    this.container.addChild(this.starfield.container);

    // A sliver of the planet glows at the bottom edge for context
    this.bgPlanet = makePlanet(planet.seed, 500);
    this.bgPlanet.x = W / 2;
    this.bgPlanet.y = H + 470;
    this.bgPlanet.alpha = 0.8;
    this.container.addChild(this.bgPlanet);

    // Ship + cargo bays across the top
    this.ship = makeCargoShip(920);
    this.ship.x = W / 2;
    this.ship.y = 96;
    this.container.addChild(this.ship);

    // Preview (replay audio) button
    this.previewBtn = makeButton('', { width: 92, height: 92 });
    const icon = new PIXI.Sprite(textureFor('sound'));
    icon.anchor.set(0.5);
    icon.width = icon.height = 52;
    this.previewBtn.addChild(icon);
    this.previewBtn.x = W / 2;
    this.previewBtn.y = 208;
    // Replays just the phonic sound on sound questions (not the whole
    // sentence again); word questions replay their prompt.
    this.previewBtn.on('pointertap', () => this.replayStimulus());
    this.container.addChild(this.previewBtn);

    // Reacting alien in the corner
    this.alien = makeAlien(planet.seed * 7 + 1, 96);
    this.alien.x = 108;
    this.alien.y = H - 96;
    this.container.addChild(this.alien);

    // Question counter
    this.counter = makeText('', 26, { fill: 0x8888c8 });
    this.counter.anchor.set(1, 0);
    this.counter.x = W - 146; // clear of the mute + fullscreen buttons
    this.counter.y = 20;
    this.container.addChild(this.counter);

    this.stimulusHolder = new PIXI.Container();
    this.stimulusHolder.x = W / 2;
    this.stimulusHolder.y = 386;
    this.choicesHolder = new PIXI.Container();
    this.container.addChild(this.stimulusHolder, this.choicesHolder);

    this.showQuestion();
  }

  get q() { return this.questions[this.qIndex]; }

  speakPrompt(interrupt = false) {
    const q = this.q;
    if (q.promptSound) {
      // sentence first, then the sound on its own - slow and twice
      say(q.promptPre, { interrupt });
      const s = SOUND_SPEECH[q.promptSound] || q.promptSound;
      say(s, { profile: 'sound' });
      say(s, { profile: 'sound' });
    } else {
      say(q.prompt, { interrupt });
    }
  }

  replayStimulus() {
    const q = this.q;
    if (q.promptSound) {
      const s = SOUND_SPEECH[q.promptSound] || q.promptSound;
      say(s, { interrupt: true, profile: 'sound' });
    } else {
      say(q.prompt, { interrupt: true });
    }
  }

  // Speak one answer choice aloud (preview chips).
  speakChoice(choice) {
    if (choice.kind === 'sound') {
      const s = SOUND_SPEECH[choice.value] || choice.value;
      say(s, { interrupt: true, profile: 'sound' });
    } else {
      say(choice.value, { interrupt: true });
    }
  }

  // ---------- rendering ----------

  showQuestion() {
    const q = this.q;
    this.wrongCount = 0;
    this.busy = false;
    this.counter.text = `${this.qIndex + 1} / ${this.questions.length}`;

    this.stimulusHolder.removeChildren().forEach((ch) => ch.destroy({ children: true }));
    this.choicesHolder.removeChildren().forEach((ch) => ch.destroy({ children: true }));

    // --- Stimulus ---
    if (q.stimulus.kind === 'sound') {
      const glow = makeGlowText(q.stimulus.value, 200);
      this.stimulusHolder.addChild(glow);
    } else if (q.stimulus.kind === 'wordtext') {
      const glow = makeGlowText(q.stimulus.value, 150);
      this.stimulusHolder.addChild(glow);
    } else {
      const card = makeCard(282, 246);
      const pic = new PIXI.Sprite(textureFor(q.stimulus.value));
      pic.anchor.set(0.5);
      pic.width = pic.height = 195;
      card.addChild(pic);
      this.stimulusHolder.addChild(card);
    }
    popIn(this.stimulusHolder);

    // --- Choices ---
    this.cards = [];
    q.choices.forEach((choice, i) => {
      const card = makeCard(CARD_W, CARD_H);
      card.x = CHOICE_X[i];
      card.y = CHOICE_Y;
      if (choice.kind === 'picture') {
        const pic = new PIXI.Sprite(textureFor(choice.value));
        pic.anchor.set(0.5);
        pic.width = pic.height = 172;
        card.addChild(pic);
      } else {
        const size = choice.kind === 'sound' ? 104 : 62;
        const t = makeText(choice.value, size, { fill: COLORS.gold });
        t.anchor.set(0.5);
        card.addChild(t);
      }
      card.choice = choice;
      card.eventMode = 'static';
      card.cursor = 'pointer';
      card.on('pointertap', () => this.handleAnswer(card));
      card.on('pointerover', () => { if (!this.busy) tween(card.scale, { x: 1.05, y: 1.05 }, 120); });
      card.on('pointerout', () => tween(card.scale, { x: 1, y: 1 }, 120));

      // preview chip: hear this choice without selecting it
      const chip = makePreviewChip(() => this.speakChoice(choice));
      chip.x = CARD_W / 2 - 28;
      chip.y = -CARD_H / 2 + 28;
      card.addChild(chip);

      this.choicesHolder.addChild(card);
      this.cards.push(card);
      popIn(card, 120 + i * 110);
    });

    this.speakPrompt(true);
  }

  // ---------- answering ----------

  async handleAnswer(card, auto = false) {
    if (this.busy) return;
    if (card.choice.correct) {
      await this.onCorrect(card, auto);
    } else {
      await this.onWrong(card);
    }
  }

  async onCorrect(card, auto) {
    this.busy = true;
    const firstTry = this.wrongCount === 0 && !auto;
    if (firstTry) this.firstTryCount++;

    card.setBorder(COLORS.good, 8);
    const globalPos = card.getGlobalPosition();
    const layer = this.game.scenes.particleLayer;
    const local = layer.toLocal(globalPos);
    burst(local.x, local.y, firstTry ? { count: 52 } : { count: 22, speed: 300 });

    this.alien.setMood('happy');
    this.alien.jump();
    if (firstTry) {
      sfxCorrect();
      say("Brilliant! That's right!", { interrupt: true, profile: 'alien' });
    } else {
      sfxCorrectSoft();
      say('Well done - keep going!', { interrupt: true, profile: 'alien' });
    }

    // spotlight: the answer pops, the other cards dim and shrink away
    tween(card.scale, { x: 1.12, y: 1.12 }, 200, { ease: Ease.outBack });
    for (const other of this.cards) {
      if (other !== card) {
        tween(other, { alpha: 0 }, 250);
        tween(other.scale, { x: 0.88, y: 0.88 }, 250);
      }
    }
    await this.ship.loadCrate(this.ship.crateCount(), globalPos, layer);
    await tween(card, { alpha: 0 }, 200);
    this.alien.setMood('idle');

    this.qIndex++;
    if (this.qIndex >= this.questions.length) {
      await this.finishRound();
    } else {
      await wait(150);
      this.showQuestion();
    }
  }

  async onWrong(card) {
    this.busy = true;
    this.mistakes++;
    this.wrongCount++;
    sfxBoing();
    this.alien.wobble();

    // red flash + card shake + a kick of screen-shake
    card.setBorder(COLORS.bad, 8);
    this.shakeScreen(8);
    const x0 = card.x;
    for (const dx of [-14, 14, -9, 9, 0]) {
      await tween(card, { x: x0 + dx }, 55);
    }
    card.setBorder(COLORS.cardBorder, 6);

    if (this.wrongCount === 1) {
      say('Ooh, not quite - have another go!', { interrupt: true, profile: 'alien' });
      this.busy = false;
    } else if (this.wrongCount === 2) {
      say('Let me give you a clue...', { interrupt: true, profile: 'alien' });
      for (const other of this.cards) {
        if (!other.choice.correct) tween(other, { alpha: 0.4 }, 350);
      }
      this.busy = false;
    } else {
      // third miss: reveal and auto-select the correct card
      const correct = this.cards.find((c) => c.choice.correct);
      if (this.q.answerIsSound) {
        say('The answer is...', { interrupt: true });
        say(this.q.answerSpoken, { profile: 'sound' });
        say(this.q.answerSpoken, { profile: 'sound' });
      } else {
        say(`The answer is ${this.q.answerSpoken}!`, { interrupt: true });
      }
      correct.setBorder(COLORS.gold, 9);
      await tween(correct.scale, { x: 1.15, y: 1.15 }, 260, { ease: Ease.outBack });
      await tween(correct.scale, { x: 1, y: 1 }, 260);
      this.busy = false;
      await this.handleAnswer(correct, true);
    }
  }

  shakeScreen(strength) {
    const seq = [];
    for (let i = 0; i < 6; i++) {
      seq.push([(Math.random() - 0.5) * strength * 2, (Math.random() - 0.5) * strength]);
    }
    seq.push([0, 0]);
    let p = Promise.resolve();
    for (const [x, y] of seq) {
      p = p.then(() => tween(this.container, { x, y }, 40));
    }
    return p;
  }

  async finishRound() {
    sfxFanfare();
    await this.ship.igniteAndShake();
    this.game.scenes.switchTo(new CompletionScene(this.game), {
      planet: this.planet,
      score: this.firstTryCount,
    });
  }

  async exit() {
    stopSpeech();
  }

  update(dtMS) {
    this.starfield.tick(dtMS);
    this.bgPlanet.tick(dtMS);
    this.alien.tick(dtMS);
    this.ship.tick();
  }
}

// Small round speaker chip in a card's corner: hear the choice without
// selecting it (the tap must not bubble up into the card's answer handler).
function makePreviewChip(onTap) {
  const chip = new PIXI.Container();
  const bg = new PIXI.Graphics()
    .circle(0, 3, 21).fill(0xb8860b)
    .circle(0, 0, 21).fill(0xffd75e)
    .circle(0, 0, 21).stroke({ width: 3, color: 0xb8860b });
  const icon = new PIXI.Sprite(textureFor('sound'));
  icon.anchor.set(0.5);
  icon.width = icon.height = 24;
  chip.addChild(bg, icon);
  chip.eventMode = 'static';
  chip.cursor = 'pointer';
  chip.hitArea = new PIXI.Circle(0, 0, 26);
  chip.on('pointertap', (e) => {
    e.stopPropagation();
    sfxTap();
    onTap();
  });
  // swallow the press so the card underneath never sees it
  chip.on('pointerdown', (e) => e.stopPropagation());
  chip.on('pointerup', (e) => e.stopPropagation());
  return chip;
}

// Big glowing stimulus text (letter, digraph or word). The glow is stacked
// enlarged copies rather than a BlurFilter, which would re-render per frame.
function makeGlowText(value, size) {
  const c = new PIXI.Container();
  for (const [scale, alpha] of [[1.22, 0.10], [1.14, 0.16], [1.07, 0.26]]) {
    const halo = new PIXI.Text({
      text: value,
      style: { fontFamily: FONT, fontSize: size, fill: 0xffd75e },
    });
    halo.anchor.set(0.5);
    halo.scale.set(scale);
    halo.alpha = alpha;
    c.addChild(halo);
  }
  const main = new PIXI.Text({
    text: value,
    style: {
      fontFamily: FONT, fontSize: size, fill: 0xffffff,
      stroke: { color: 0xb8860b, width: Math.max(6, size * 0.05) },
    },
  });
  main.anchor.set(0.5);
  c.addChild(main);
  return c;
}
