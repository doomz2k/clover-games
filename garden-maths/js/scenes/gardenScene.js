// The Garden: main gameplay scene. State machine:
//   idle -> rolling -> answering -> feedback -> (bonus?) -> idle ... -> pestCheck -> next round / season end
//
// Each round provides one complete set of care (one question per operation
// per unbloomed plant). Wrong answers breed pests; pests attack at the end
// of the round. All three plants at full bloom completes the season.

import { Scene, W, H } from '../core/sceneManager.js';
import { makeGarden, makeText, makeCard, makeButton, popIn, COLORS, FONT } from '../core/ui.js';
import { makePlant } from '../gen/plantGenerator.js';
import { makeDie } from '../gen/diceGenerator.js';
import { makePest, makeLadybird } from '../gen/bugGenerator.js';
import { textureFor } from '../core/assets.js';
import { SEASONS, FAMILIES, FULL_BLOOM, CARE_OF_OP, MAX_ROUNDS, PEST_CAP } from '../data/seasons.js';
import { rollQuestion, rollDivQuestion, makeChoices, OP_SYMBOL } from '../data/questions.js';
import { tween, Ease, wait } from '../core/tween.js';
import { say, stopSpeech } from '../core/speech.js';
import { burst } from '../core/particles.js';
import {
  sfxCorrect, sfxCorrectSoft, sfxBoing, sfxRattle, sfxGrow, sfxFanfare,
  sfxAlarm, sfxPop, sfxTap,
} from '../core/audio.js';
import { SeasonCompleteScene } from './seasonComplete.js';

const PLANT_X = [280, 640, 1000];
const CARE_ICON = { sun: 'icon_sun', water: 'icon_drop', nutrients: 'icon_orb' };

// Small round speaker chip in a card's corner: hear the choice without
// selecting it (the tap must not bubble up into the card's answer handler).
function makePreviewChip(onTap) {
  const chip = new PIXI.Container();
  const bg = new PIXI.Graphics()
    .circle(0, 3, 18).fill(0xb8860b)
    .circle(0, 0, 18).fill(0xffd75e)
    .circle(0, 0, 18).stroke({ width: 3, color: 0xb8860b });
  const icon = new PIXI.Sprite(textureFor('sound'));
  icon.anchor.set(0.5);
  icon.width = icon.height = 20;
  chip.addChild(bg, icon);
  chip.eventMode = 'static';
  chip.cursor = 'pointer';
  chip.hitArea = new PIXI.Circle(0, 0, 23);
  chip.on('pointertap', (e) => {
    e.stopPropagation();
    sfxTap();
    onTap();
  });
  chip.on('pointerdown', (e) => e.stopPropagation());
  chip.on('pointerup', (e) => e.stopPropagation());
  return chip;
}
const CORRECT_LINES = ['Brilliant! Your plant loves it!', "That's right! Wonderful!", 'Brilliant! Look at it grow!'];
const WRONG_LINES = ['Ooh, not quite - try again!', 'Have another go!'];

export class GardenScene extends Scene {
  async enter({ season }) {
    this.season = season;
    this.phase = 'idle';
    this.pests = [];           // live pest sprites
    this.damageTaken = 0;      // total stages lost to attacks
    this.round = 1;
    this.questionsAsked = 0;
    this.seenSums = new Set();
    this.bonusShownThisRound = false;

    // --- backdrop ---
    this.garden = makeGarden(W, H, { seasonShift: season.skyShift });
    this.container.addChild(this.garden.container);
    const soilY = this.garden.soilY;

    // --- plants + state ---
    this.plants = [];
    FAMILIES.forEach((family, i) => {
      const plant = makePlant(family, season.hues[i], 1);
      plant.x = PLANT_X[i];
      plant.y = soilY + 4;
      this.container.addChild(plant);
      this.plants.push({
        plant, family,
        careDone: new Set(),   // ops done for the current stage
      });
    });

    // Need indicators above each plant
    this.indicators = this.plants.map((p, i) => {
      const holder = new PIXI.Container();
      holder.x = PLANT_X[i];
      holder.y = soilY - 232;
      this.container.addChild(holder);
      return holder;
    });
    this.refreshIndicators();

    // --- header ---
    const title = makeText(season.name, 40, { fill: COLORS.gold, stroke: 0x2e3d1a, strokeWidth: 5 });
    title.anchor.set(0.5, 0);
    title.x = W / 2;
    title.y = 14;
    this.container.addChild(title);
    this.counter = makeText('', 24, { fill: 0xffffff });
    this.counter.anchor.set(1, 0);
    this.counter.x = W - 146; // clear of the mute + fullscreen buttons
    this.counter.y = 20;
    this.container.addChild(this.counter);

    // --- pest meter (on the soil, right side) ---
    this.meterSlots = [];
    const meter = new PIXI.Container();
    for (let i = 0; i < PEST_CAP; i++) {
      const slot = new PIXI.Graphics().circle(0, 0, 15).fill(0x5e3a20).stroke({ width: 3, color: 0x3e2512 });
      slot.x = i * 38;
      meter.addChild(slot);
      const icon = new PIXI.Sprite(textureFor('icon_bug'));
      icon.anchor.set(0.5);
      icon.width = icon.height = 24;
      icon.x = slot.x;
      icon.visible = false;
      meter.addChild(icon);
      this.meterSlots.push(icon);
    }
    meter.x = W - 24 - (PEST_CAP - 1) * 38 - 15;
    meter.y = this.garden.uiY - 22;
    this.container.addChild(meter);

    // --- bottom UI: dice | sum | choices ---
    const uiY = this.garden.uiY;
    this.uiCenterY = uiY + (H - uiY) / 2;

    this.diceHolder = new PIXI.Container();
    this.diceHolder.x = 190;
    this.diceHolder.y = this.uiCenterY;
    this.container.addChild(this.diceHolder);

    this.rollBtn = makeButton('Roll!', { width: 210, height: 86, fontSize: 38 });
    this.rollBtn.x = 190;
    this.rollBtn.y = this.uiCenterY;
    this.rollBtn.on('pointertap', () => this.onRoll());
    this.container.addChild(this.rollBtn);

    this.sumText = makeText('', 66, { fill: 0xffffff, stroke: 0x2e3d1a, strokeWidth: 7 });
    this.sumText.anchor.set(0.5);
    this.sumText.x = 590;
    this.sumText.y = this.uiCenterY;
    this.sumText.eventMode = 'static';
    this.sumText.cursor = 'pointer';
    this.sumText.on('pointertap', () => { if (this.q) say(this.q.spoken, { interrupt: true }); });
    this.container.addChild(this.sumText);

    this.choicesHolder = new PIXI.Container();
    this.container.addChild(this.choicesHolder);

    // ladybird (hidden until needed)
    this.ladybird = makeLadybird();
    this.ladybird.visible = false;
    this.container.addChild(this.ladybird);

    // bonus overlay root
    this.bonusHolder = new PIXI.Container();
    this.container.addChild(this.bonusHolder);

    this.buildRoundQueue();
    this.updateCounter();
    say('Welcome to the garden! Roll the dice!');
  }

  // ---------------- round bookkeeping ----------------

  buildRoundQueue() {
    // one question per op per plant that can still grow
    const queue = [];
    this.plants.forEach((p, i) => {
      if (p.plant.stage < FULL_BLOOM) {
        for (const op of this.season.ops) {
          if (!p.careDone.has(op)) queue.push({ plantIdx: i, op });
        }
      }
    });
    // interleave: sort by op then plant, then light shuffle across plants
    queue.sort((a, b) => a.plantIdx - b.plantIdx || a.op.localeCompare(b.op));
    this.roundQueue = queue;
    this.roundTotal = queue.length;
    this.bonusShownThisRound = false;
  }

  updateCounter() {
    this.counter.text = `Round ${this.round}/${MAX_ROUNDS} • ${this.roundQueue.length} to go`;
    // time of day drifts across the season's rounds
    this.garden.setTimeOfDay((this.round - 1 + (1 - this.roundQueue.length / Math.max(1, this.roundTotal || this.roundQueue.length))) / MAX_ROUNDS);
  }

  refreshIndicators() {
    this.plants.forEach((p, i) => {
      const holder = this.indicators[i];
      holder.removeChildren().forEach((c) => c.destroy({ children: true }));
      if (p.plant.stage >= FULL_BLOOM) {
        const star = new PIXI.Sprite(textureFor('ui_star'));
        star.anchor.set(0.5);
        star.width = star.height = 40;
        holder.addChild(star);
        return;
      }
      const pending = this.season.ops.filter((op) => !p.careDone.has(op));
      pending.forEach((op, k) => {
        const bubble = new PIXI.Container();
        const bg = new PIXI.Graphics().circle(0, 0, 22).fill({ color: 0xfdf6e9, alpha: 0.92 }).stroke({ width: 3.5, color: COLORS.cardBorderDark });
        const icon = new PIXI.Sprite(textureFor(CARE_ICON[CARE_OF_OP[op]]));
        icon.anchor.set(0.5);
        icon.width = icon.height = 30;
        bubble.addChild(bg, icon);
        bubble.x = (k - (pending.length - 1) / 2) * 50;
        bubble.op = op;
        holder.addChild(bubble);
      });
    });
  }

  highlightIndicator(plantIdx, op, on) {
    const holder = this.indicators[plantIdx];
    for (const bubble of holder.children) {
      if (bubble.op === op) {
        if (on) {
          tween(bubble.scale, { x: 1.35, y: 1.35 }, 250, { ease: Ease.outBack });
        } else {
          tween(bubble.scale, { x: 1, y: 1 }, 200);
        }
      }
    }
  }

  // ---------------- question flow ----------------

  async onRoll() {
    if (this.phase !== 'idle') return;
    this.phase = 'rolling';
    this.rollBtn.setEnabled(false);
    this.current = this.roundQueue[0];
    const { plantIdx, op } = this.current;
    this.q = rollQuestion(this.season, op, this.seenSums);
    this.wrongCount = 0;

    // dice tumble
    this.diceHolder.removeChildren().forEach((c) => c.destroy({ children: true }));
    tween(this.rollBtn, { alpha: 0 }, 150).then(() => { this.rollBtn.visible = false; });
    sfxRattle();
    const dies = this.q.dice.map((d, i) => {
      const die = makeDie(d.sides, 46);
      die.x = (i - (this.q.dice.length - 1) / 2) * 120;
      this.diceHolder.addChild(die);
      return die;
    });
    this.highlightIndicator(plantIdx, op, true);
    await Promise.all(dies.map((die, i) => die.rollTo(this.q.dice[i].value)));

    // sum + voice + choices
    this.sumText.text = this.q.text;
    popIn(this.sumText);
    say(this.q.spoken, { interrupt: true });
    this.showChoices(makeChoices(this.q.answer), this.choicesHolder, (card) => this.onAnswer(card));
    this.phase = 'answering';
  }

  showChoices(choices, holder, onTap) {
    holder.removeChildren().forEach((c) => c.destroy({ children: true }));
    const cards = [];
    choices.forEach((choice, i) => {
      const card = makeCard(148, 128);
      card.x = 850 + i * 164;
      card.y = this.uiCenterY;
      const t = makeText(String(choice.value), 62, { fill: COLORS.ink, shadow: false });
      t.anchor.set(0.5);
      card.addChild(t);
      card.choice = choice;
      card.eventMode = 'static';
      card.cursor = 'pointer';
      card.on('pointertap', () => onTap(card));

      // preview chip: hear this number without selecting it
      const chip = makePreviewChip(() => say(String(choice.value), { interrupt: true }));
      chip.x = card.cardW / 2 - 22;
      chip.y = -card.cardH / 2 + 22;
      card.addChild(chip);

      holder.addChild(card);
      cards.push(card);
      popIn(card, 90 + i * 90);
    });
    this.choiceCards = cards;
    return cards;
  }

  async onAnswer(card) {
    if (this.phase !== 'answering') return;
    if (card.choice.correct) {
      this.phase = 'feedback';
      await this.onCorrect(card);
    } else {
      await this.onWrong(card);
    }
  }

  async onCorrect(card) {
    const { plantIdx, op } = this.current;
    const p = this.plants[plantIdx];
    const firstTry = this.wrongCount === 0;

    card.setBorder(COLORS.good, 8);
    const layer = this.game.scenes.particleLayer;
    const gp = layer.toLocal(card.getGlobalPosition());
    burst(gp.x, gp.y, { count: firstTry ? 40 : 20 });
    if (firstTry) sfxCorrect(); else sfxCorrectSoft();
    say(CORRECT_LINES[this.questionsAsked % CORRECT_LINES.length], { interrupt: true });

    for (const other of this.choiceCards) {
      if (other !== card) tween(other, { alpha: 0 }, 220);
    }

    // care effect on the plant
    await this.playCareEffect(op, plantIdx);
    this.highlightIndicator(plantIdx, op, false);
    p.careDone.add(op);
    p.plant.happySway();

    // stage up?
    if (this.season.ops.every((o) => p.careDone.has(o)) && p.plant.stage < FULL_BLOOM) {
      await wait(200);
      sfxGrow();
      const newStage = p.plant.stage + 1;
      await p.plant.setStage(newStage, true);
      p.careDone.clear();
      const pgp = layer.toLocal(p.plant.getGlobalPosition());
      burst(pgp.x, pgp.y - 100, { count: 30, colors: [0x7ac74f, 0xa9e084, 0xffd75e] });
      if (newStage === FULL_BLOOM) {
        sfxFanfare();
        say('Beautiful! Look at your flower!', { interrupt: true });
        await p.plant.bloomPulse();
      } else {
        say("It's growing!", { interrupt: true });
      }
    }

    this.questionsAsked++;
    this.roundQueue.shift();
    this.refreshIndicators();
    this.updateCounter();
    await this.clearQuestionUI();

    // optional pest-clearing bonus (Season 3+, only when pests exist)
    if (!this.bonusShownThisRound && this.pests.length > 0 && this.season.bonusDiv > 0
      && Math.random() < this.season.bonusDiv && this.roundQueue.length > 0) {
      this.bonusShownThisRound = true;
      await this.offerBonus();
    }

    await this.nextStep();
  }

  async onWrong(card) {
    this.phase = 'feedback';
    this.wrongCount++;
    sfxBoing();
    say(WRONG_LINES[this.wrongCount % WRONG_LINES.length], { interrupt: true });
    card.setBorder(COLORS.bad, 8);
    const x0 = card.x;
    for (const dx of [-12, 12, -8, 8, 0]) await tween(card, { x: x0 + dx }, 50);
    card.setBorder(COLORS.cardBorder, 6);
    this.addPest();
    if (this.wrongCount >= 2) {
      for (const other of this.choiceCards) {
        if (!other.choice.correct) tween(other, { alpha: 0.35 }, 300);
      }
    }
    this.phase = 'answering';
  }

  async clearQuestionUI() {
    this.q = null;
    await tween(this.sumText, { alpha: 0 }, 180);
    this.sumText.text = '';
    this.sumText.alpha = 1;
    this.choicesHolder.removeChildren().forEach((c) => c.destroy({ children: true }));
    this.diceHolder.removeChildren().forEach((c) => c.destroy({ children: true }));
  }

  async nextStep() {
    if (this.roundQueue.length === 0) {
      await this.endOfRound();
      return;
    }
    this.rollBtn.visible = true;
    this.rollBtn.alpha = 1;
    this.rollBtn.setEnabled(true);
    this.phase = 'idle';
  }

  // ---------------- pests ----------------

  addPest() {
    if (this.pests.length >= PEST_CAP) return;
    const pest = makePest(this.pests.length + this.round * 10);
    pest.x = 100 + Math.random() * (W - 200);
    pest.y = this.garden.soilY + 40 + Math.random() * 50;
    pest.patrolMin = 80;
    pest.patrolMax = W - 80;
    this.container.addChild(pest);
    this.pests.push(pest);
    this.meterSlots[this.pests.length - 1].visible = true;
    popIn(pest);
  }

  async removePest() {
    const pest = this.pests[this.pests.length - 1];
    if (!pest) return;
    await this.ladybird.swoop(-60, this.garden.soilY - 120, pest.x, pest.y, async () => {
      sfxPop();
      const layer = this.game.scenes.particleLayer;
      const gp = layer.toLocal(pest.getGlobalPosition());
      burst(gp.x, gp.y, { count: 16, speed: 240, colors: [0xf25c54, 0xffd75e, 0xffffff] });
      await pest.pop();
    });
    this.container.removeChild(pest);
    pest.destroy({ children: true });
    this.pests.pop();
    this.meterSlots[this.pests.length].visible = false;
    say('Got one!', { interrupt: true });
  }

  async endOfRound() {
    this.phase = 'pestcheck';
    const n = this.pests.length;

    if (n >= 2) {
      // attack!
      const severe = n >= 4;
      sfxAlarm(severe);
      say(severe ? 'The pests are everywhere!' : 'Oh no - the pests got to your plant!', { interrupt: true });
      if (severe) await this.flashEdges();

      const victims = this.pickVictims(severe ? 2 : 1);
      for (let v = 0; v < victims.length; v++) {
        const p = this.plants[victims[v]];
        // bugs swarm the stem
        await this.swarmPlant(victims[v]);
        const drop = severe && v === 0 ? 2 : 1;
        const newStage = Math.max(0, p.plant.stage - drop);
        this.damageTaken += p.plant.stage - newStage;
        await p.plant.wilt();
        await p.plant.setStage(newStage, true);
        p.careDone.clear();
      }
    } else if (n === 1) {
      // one pest scurries away harmlessly
      const pest = this.pests[0];
      pest.walking = false;
      tween(pest, { x: W + 100 }, 1400, { ease: Ease.inQuad });
      await wait(900);
    }

    // clear all pests + meter
    for (const pest of this.pests) {
      this.container.removeChild(pest);
      pest.destroy({ children: true });
    }
    this.pests = [];
    this.meterSlots.forEach((m) => { m.visible = false; });
    this.refreshIndicators();

    // season over?
    const bloomed = this.plants.filter((p) => p.plant.stage === FULL_BLOOM).length;
    if (bloomed === 3 || this.round >= MAX_ROUNDS) {
      this.finishSeason(bloomed);
      return;
    }
    this.round++;
    this.buildRoundQueue();
    this.updateCounter();
    await this.nextStep();
  }

  pickVictims(count) {
    const candidates = this.plants
      .map((p, i) => ({ i, stage: p.plant.stage }))
      .filter((c) => c.stage > 0)
      .sort(() => Math.random() - 0.5);
    return candidates.slice(0, count).map((c) => c.i);
  }

  async swarmPlant(plantIdx) {
    const targetX = PLANT_X[plantIdx];
    await Promise.all(this.pests.map((pest, i) => {
      pest.walking = false;
      return tween(pest, { x: targetX + (i - this.pests.length / 2) * 24, y: this.garden.soilY + 12 }, 600, { ease: Ease.inOutQuad });
    }));
    // shake the plant
    const p = this.plants[plantIdx].plant;
    for (const dx of [-6, 6, -4, 4, 0]) await tween(p, { x: targetX + dx }, 55);
  }

  async flashEdges() {
    const flash = new PIXI.Graphics()
      .rect(0, 0, W, 14).fill(0xf25c54)
      .rect(0, H - 14, W, 14).fill(0xf25c54)
      .rect(0, 0, 14, H).fill(0xf25c54)
      .rect(W - 14, 0, 14, H).fill(0xf25c54);
    flash.alpha = 0;
    this.container.addChild(flash);
    for (let i = 0; i < 2; i++) {
      await tween(flash, { alpha: 0.8 }, 140);
      await tween(flash, { alpha: 0 }, 180);
    }
    this.container.removeChild(flash);
    flash.destroy();
  }

  // ---------------- bonus division question ----------------

  async offerBonus() {
    this.phase = 'bonus';
    return new Promise((resolve) => {
      const scrim = new PIXI.Graphics().rect(0, 0, W, H).fill({ color: 0x0a1a08, alpha: 0.55 });
      scrim.eventMode = 'static';
      const panel = makeCard(660, 380);
      panel.x = W / 2;
      panel.y = H / 2 - 40;
      const titleT = makeText('Pest alert! Clear it with a sum?', 34, { fill: COLORS.ink, shadow: false, wrap: 600 });
      titleT.anchor.set(0.5);
      titleT.y = -140;
      const bugIcon = new PIXI.Sprite(textureFor('icon_bug'));
      bugIcon.anchor.set(0.5);
      bugIcon.width = bugIcon.height = 64;
      bugIcon.x = -250; bugIcon.y = -130;
      const bq = rollDivQuestion();
      const sum = makeText(bq.text, 62, { fill: COLORS.ink, shadow: false });
      sum.anchor.set(0.5);
      sum.y = -55;
      panel.addChild(titleT, bugIcon, sum);
      say(`A pest is coming! ${bq.spoken}`, { interrupt: true });

      const cleanup = async () => {
        this.bonusHolder.removeChildren().forEach((c) => c.destroy({ children: true }));
        this.bonusCards = null;
        this.notNowBtn = null;
        this.phase = 'feedback';
        resolve();
      };

      // choices inside the panel
      const cards = [];
      makeChoices(bq.answer).forEach((choice, i) => {
        const card = makeCard(130, 110, { border: COLORS.cardBorderDark });
        card.x = (i - 1) * 160;
        card.y = 40;
        const t = makeText(String(choice.value), 54, { fill: COLORS.ink, shadow: false });
        t.anchor.set(0.5);
        card.addChild(t);
        card.choice = choice;
        card.eventMode = 'static';
        card.cursor = 'pointer';
        const chip = makePreviewChip(() => say(String(choice.value), { interrupt: true }));
        chip.x = card.cardW / 2 - 20;
        chip.y = -card.cardH / 2 + 20;
        card.addChild(chip);
        card.on('pointertap', async () => {
          if (this.phase !== 'bonus') return;
          if (card.choice.correct) {
            this.phase = 'bonusResolving';
            card.setBorder(COLORS.good, 8);
            sfxCorrect();
            await this.removePest();
          } else {
            card.setBorder(COLORS.bad, 8);
            sfxBoing();
            say('Never mind - watch out for that pest!', { interrupt: true });
            await wait(500);
          }
          await cleanup();
        });
        panel.addChild(card);
        cards.push(card);
      });
      this.bonusCards = cards;

      const notNow = makeButton('Not now', { width: 190, height: 64, fontSize: 26, fill: 0xd8d0c0, edge: 0x9a927f });
      notNow.x = 0;
      notNow.y = 140;
      notNow.on('pointertap', async () => {
        if (this.phase !== 'bonus') return;
        await cleanup();
      });
      panel.addChild(notNow);
      this.notNowBtn = notNow;

      this.bonusHolder.addChild(scrim, panel);
      popIn(panel);
    });
  }

  // ---------------- care effects ----------------

  async playCareEffect(op, plantIdx) {
    const care = CARE_OF_OP[op];
    const px = PLANT_X[plantIdx];
    const soilY = this.garden.soilY;
    const layer = this.game.scenes.particleLayer;

    if (care === 'sun') {
      const sun = new PIXI.Sprite(textureFor('icon_sun'));
      sun.anchor.set(0.5);
      sun.width = sun.height = 90;
      sun.x = px;
      sun.y = soilY - 250;
      sun.alpha = 0;
      this.container.addChild(sun);
      await tween(sun, { alpha: 1, y: soilY - 280 }, 350, { ease: Ease.outQuad });
      burst(px, soilY - 280, { count: 26, colors: [0xffd75e, 0xffe28a, 0xffffff], gravity: 60, speed: 260 });
      await wait(450);
      await tween(sun, { alpha: 0 }, 300);
      this.container.removeChild(sun);
      sun.destroy();
    } else if (care === 'water') {
      // watering can tips over the plant
      const can = new PIXI.Graphics()
        .roundRect(-28, -20, 56, 40, 10).fill(0x8b9bb8)
        .roundRect(-28, -20, 56, 40, 10).stroke({ width: 4, color: 0x1e1e46 })
        .moveTo(28, -8).lineTo(52, -22).stroke({ width: 8, color: 0x8b9bb8, cap: 'round' })
        .moveTo(-28, -6).quadraticCurveTo(-46, -18, -28, -26).stroke({ width: 5, color: 0x1e1e46 });
      can.x = px - 90;
      can.y = soilY - 300;
      can.alpha = 0;
      this.container.addChild(can);
      await tween(can, { alpha: 1, y: soilY - 270 }, 300);
      await tween(can, { rotation: 0.5 }, 300, { ease: Ease.outQuad });
      burst(px - 20, soilY - 240, { count: 30, colors: [0x4cc9f0, 0xbfe8f9, 0xffffff], gravity: 700, speed: 200, sparkle: false });
      await wait(500);
      await tween(can, { alpha: 0 }, 250);
      this.container.removeChild(can);
      can.destroy();
    } else { // nutrients
      const orbs = [];
      for (let i = 0; i < 3; i++) {
        const orb = new PIXI.Sprite(textureFor('icon_orb'));
        orb.anchor.set(0.5);
        orb.width = orb.height = 44;
        orb.x = px + (i - 1) * 46;
        orb.y = soilY - 200 - i * 24;
        orb.alpha = 0;
        this.container.addChild(orb);
        orbs.push(orb);
        tween(orb, { alpha: 1 }, 200, { delay: i * 120 });
        tween(orb, { y: soilY + 16, alpha: 0 }, 750, { delay: 200 + i * 120, ease: Ease.inQuad });
      }
      await wait(1150);
      burst(px, soilY + 10, { count: 18, colors: [0x7ac74f, 0xa9e084], gravity: -160, speed: 130, sparkle: false });
      for (const orb of orbs) { this.container.removeChild(orb); orb.destroy(); }
    }
  }

  // ---------------- season end ----------------

  finishSeason(bloomed) {
    const stars = bloomed === 3 ? (this.damageTaken === 0 ? 3 : 2) : bloomed >= 1 ? 1 : 0;
    this.game.scenes.switchTo(new SeasonCompleteScene(this.game), {
      season: this.season,
      stars,
      bloomed,
      stages: this.plants.map((p) => p.plant.stage),
    });
  }

  async exit() {
    stopSpeech();
  }

  update(dtMS) {
    this.garden.tick(dtMS);
    for (const { plant } of this.plants) plant.tick(dtMS);
    for (const pest of this.pests) pest.tick(dtMS);
    if (this.ladybird.visible) this.ladybird.tick(dtMS);
  }
}
