// The question round: 10 number questions, each correct answer sending one
// pearl into the rack. Mirrors the Space Phonics round structure: preview
// button, three answer cards, three-strike hint ladder, reacting creature.

import { Scene, W, H } from '../core/sceneManager.js';
import { makeOcean, makeText, makeCard, makeButton, popIn, COLORS, FONT } from '../core/ui.js';
import { makeCreature } from '../gen/creatureGenerator.js';
import { makeReef } from '../gen/reefGenerator.js';
import { makePearlRack } from '../core/pearlRack.js';
import { textureFor } from '../core/assets.js';
import { buildQuestions } from '../data/questions.js';
import { LEVELS, SPECIES, NUMBER_WORDS } from '../data/levels.js';
import { tween, Ease, wait } from '../core/tween.js';
import { say, stopSpeech } from '../core/speech.js';
import { burst } from '../core/particles.js';
import { sfxCorrect, sfxCorrectSoft, sfxBoing, sfxFanfare, sfxTap } from '../core/audio.js';
import { CompletionScene } from './completionScene.js';

const CARD_W = 272;
const CARD_H = 226;
const CHOICE_X = [320, 640, 960];
const CHOICE_Y = 632;

const BUBBLE_COLORS = [0x4cc9f0, 0xbfe8f9, 0xffffff, 0xffd75e, 0xf7a1c4];

export class QuestionScene extends Scene {
  async enter({ level }) {
    this.level = level;
    this.questions = buildQuestions(level);
    this.qIndex = 0;
    this.firstTryCount = 0;
    this.busy = false;
    const depthT = (level.id - 1) / (LEVELS.length - 1);

    this.ocean = makeOcean(W, H, 0, { depthT });
    this.container.addChild(this.ocean.container);

    this.reef = makeReef(level.seed + 5, W + 80, 160);
    this.reef.x = W / 2;
    this.reef.y = H - 70;
    this.reef.alpha = 0.85;
    this.container.addChild(this.reef);

    this.rack = makePearlRack(920);
    this.rack.x = W / 2;
    this.rack.y = 96;
    this.container.addChild(this.rack);

    this.previewBtn = makeButton('', { width: 92, height: 92 });
    const icon = new PIXI.Sprite(textureFor('sound'));
    icon.anchor.set(0.5);
    icon.width = icon.height = 52;
    this.previewBtn.addChild(icon);
    this.previewBtn.x = W / 2;
    this.previewBtn.y = 208;
    this.previewBtn.on('pointertap', () => this.speakPrompt(true));
    this.container.addChild(this.previewBtn);

    this.creature = makeCreature(level.seed * 3 + 7, 100);
    this.creature.x = 108;
    this.creature.y = H - 100;
    this.container.addChild(this.creature);

    this.counter = makeText('', 26, { fill: 0x8fc3e8 });
    this.counter.anchor.set(1, 0);
    this.counter.x = W - 84; // clear of the fullscreen button overlay
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
    say(this.q.prompt, { interrupt });
  }

  // Speak one answer choice aloud (preview chips).
  speakChoice(choice) {
    if (choice.kind === 'numeral') {
      say(NUMBER_WORDS[choice.value] ?? String(choice.value), { interrupt: true });
    } else {
      const sp = SPECIES.find((s) => s.key === choice.species);
      say(`${NUMBER_WORDS[choice.count] ?? choice.count} ${choice.count === 1 ? sp.word : sp.plural}`, { interrupt: true });
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
    if (q.stimulus.kind === 'numeral') {
      this.stimulusHolder.addChild(makeGlowText(String(q.stimulus.value), 190));
    } else if (q.stimulus.kind === 'label') {
      this.stimulusHolder.addChild(makeGlowText(q.stimulus.value, 100));
    } else if (q.stimulus.kind === 'group') {
      const card = makeCard(470, 240);
      const group = makeGroup(q.stimulus.species, q.stimulus.count, { slot: q.stimulus.count <= 5 ? 74 : 62 });
      card.addChild(group);
      if (q.stimulus.badge != null) {
        const badge = new PIXI.Container();
        const bg = new PIXI.Graphics().circle(0, 0, 34).fill(COLORS.gold).stroke({ width: 5, color: COLORS.goldDark });
        const num = makeText(String(q.stimulus.badge), 40, { fill: 0x06294e, shadow: false });
        num.anchor.set(0.5);
        badge.addChild(bg, num);
        badge.x = -470 / 2 + 14;
        badge.y = -240 / 2 + 14;
        card.addChild(badge);
      }
      this.stimulusHolder.addChild(card);
    } else { // sum
      const card = makeCard(560, 240);
      const { a, b, op, species } = q.stimulus;
      const eq = makeText(`${a}  ${op === '+' ? '+' : '−'}  ${b}`, 58, { fill: COLORS.gold });
      eq.anchor.set(0.5);
      eq.y = -240 / 2 + 42;
      card.addChild(eq);
      if (op === '+') {
        // shrink sprites when both addends are wide so the row fits the card
        const slot = a + b > 8 ? 38 : a + b > 6 ? 46 : 52;
        const gA = makeGroup(species, a, { slot, maxCols: 5 });
        const gB = makeGroup(species, b, { slot, maxCols: 5 });
        const plus = makeText('+', 64, { fill: COLORS.text });
        plus.anchor.set(0.5);
        const widthA = gA.groupW, widthB = gB.groupW;
        const gap = 56;
        const total = widthA + gap + widthB;
        gA.x = -total / 2 + widthA / 2;
        plus.x = -total / 2 + widthA + gap / 2;
        gB.x = total / 2 - widthB / 2;
        gA.y = gB.y = plus.y = 36;
        card.addChild(gA, plus, gB);
      } else {
        // subtraction: show all `a`, ghost the `b` that swim away
        const g = makeGroup(species, a, { slot: 56, ghostFrom: a - b });
        g.y = 36;
        card.addChild(g);
      }
      this.stimulusHolder.addChild(card);
    }
    popIn(this.stimulusHolder);

    // --- Choices ---
    this.cards = [];
    q.choices.forEach((choice, i) => {
      const card = makeCard(CARD_W, CARD_H);
      card.x = CHOICE_X[i];
      card.y = CHOICE_Y;
      if (choice.kind === 'numeral') {
        const t = makeText(String(choice.value), 110, { fill: COLORS.gold });
        t.anchor.set(0.5);
        card.addChild(t);
      } else {
        const group = makeGroup(choice.species, choice.count, { slot: 42 });
        card.addChild(group);
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
    if (card.choice.correct) await this.onCorrect(card, auto);
    else await this.onWrong(card);
  }

  async onCorrect(card, auto) {
    this.busy = true;
    const firstTry = this.wrongCount === 0 && !auto;
    if (firstTry) this.firstTryCount++;

    card.setBorder(COLORS.good, 8);
    const globalPos = card.getGlobalPosition();
    const layer = this.game.scenes.particleLayer;
    const local = layer.toLocal(globalPos);
    burst(local.x, local.y, firstTry
      ? { count: 52, colors: BUBBLE_COLORS }
      : { count: 22, speed: 300, colors: BUBBLE_COLORS });

    this.creature.setMood('happy');
    this.creature.jump();
    if (firstTry) {
      sfxCorrect();
      say("Brilliant! That's right!", { interrupt: true, profile: 'alien' });
    } else {
      sfxCorrectSoft();
      say('Well done - keep going!', { interrupt: true, profile: 'alien' });
    }

    for (const other of this.cards) {
      if (other !== card) tween(other, { alpha: 0 }, 250);
    }
    await this.rack.loadPearl(this.rack.pearlCount(), globalPos, layer);
    await tween(card, { alpha: 0 }, 200);
    this.creature.setMood('idle');

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
    this.wrongCount++;
    sfxBoing();
    this.creature.wobble();

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
      const correct = this.cards.find((c) => c.choice.correct);
      say(`The answer is ${this.q.answerSpoken}!`, { interrupt: true });
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
    for (const [x, y] of seq) p = p.then(() => tween(this.container, { x, y }, 40));
    return p;
  }

  async finishRound() {
    sfxFanfare();
    await this.rack.celebrate();
    this.game.scenes.switchTo(new CompletionScene(this.game), {
      level: this.level,
      score: this.firstTryCount,
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

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

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
  chip.on('pointerdown', (e) => e.stopPropagation());
  chip.on('pointerup', (e) => e.stopPropagation());
  return chip;
}

// Lay out `count` object sprites in tens-frame rows (up to 5 per row),
// centred on (0,0). Returns a container with .groupW for composition.
// ghostFrom: index from which objects render ghosted with a cross (for
// subtraction stimuli).
function makeGroup(species, count, { slot = 48, maxCols = 5, ghostFrom = Infinity } = {}) {
  const c = new PIXI.Container();
  const cols = Math.min(count, maxCols);
  const rows = Math.ceil(count / maxCols);
  const gap = slot * 0.18;
  const cellW = slot + gap;
  c.groupW = cols * cellW;
  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / maxCols);
    const inRow = row === rows - 1 ? count - row * maxCols : maxCols;
    const col = i % maxCols;
    const sp = new PIXI.Sprite(textureFor(species));
    sp.anchor.set(0.5);
    sp.width = sp.height = slot;
    sp.x = (col - (inRow - 1) / 2) * cellW;
    sp.y = (row - (rows - 1) / 2) * cellW;
    if (i >= ghostFrom) {
      sp.alpha = 0.28;
      const cross = new PIXI.Graphics()
        .moveTo(-slot * 0.32, -slot * 0.32).lineTo(slot * 0.32, slot * 0.32)
        .moveTo(slot * 0.32, -slot * 0.32).lineTo(-slot * 0.32, slot * 0.32)
        .stroke({ width: 6, color: 0xf25c54, cap: 'round' });
      cross.x = sp.x;
      cross.y = sp.y;
      c.addChild(sp, cross);
    } else {
      c.addChild(sp);
    }
  }
  return c;
}

// Big glowing stimulus text (numeral or label) - stacked enlarged copies
// rather than a per-frame BlurFilter.
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
