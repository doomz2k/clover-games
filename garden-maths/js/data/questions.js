// Question generation for Garden Maths. Values come from dice rolls; the
// operation is chosen by the garden scene based on plant needs. Distractors
// stay within ±3 of the correct answer, never negative, never duplicated.
// Repeat sums are avoided within a session where possible.

import { randPick, randShuffle } from '../core/util.js';

const roll = (sides) => 1 + Math.floor(Math.random() * sides);

export const OP_SYMBOL = { add: '+', sub: '−', mul: '×', div: '÷' };
export const OP_SPOKEN = { add: 'plus', sub: 'take away', mul: 'times', div: 'shared by' };

/**
 * Roll a care question for `op` using the season's dice.
 * Returns { op, dice: [{sides, value}], a, b, answer, text, spoken }.
 * `seen` is a Set of "a op b" keys used to avoid repeats in a session.
 */
export function rollQuestion(season, op, seen = new Set()) {
  for (let attempt = 0; attempt < 12; attempt++) {
    let d1, d2;
    if (op === 'mul') {
      d1 = 4; // multiplication always uses the D4 for one die
      d2 = randPick(season.dice);
    } else {
      d1 = randPick(season.dice);
      d2 = randPick(season.dice);
    }
    let v1 = roll(d1);
    let v2 = roll(d2);
    let a, b, dice;
    if (op === 'sub') {
      // never negative: big number first (swap dice to match)
      if (v2 > v1) { [v1, v2] = [v2, v1]; [d1, d2] = [d2, d1]; }
      a = v1; b = v2;
      dice = [{ sides: d1, value: v1 }, { sides: d2, value: v2 }];
    } else {
      a = v1; b = v2;
      dice = [{ sides: d1, value: v1 }, { sides: d2, value: v2 }];
    }
    const key = `${a}${op}${b}`;
    if (seen.has(key) && attempt < 11) continue;
    seen.add(key);
    const answer = op === 'add' ? a + b : op === 'sub' ? a - b : a * b;
    return {
      op, dice, a, b, answer,
      text: `${a} ${OP_SYMBOL[op]} ${b} = ?`,
      spoken: `What is ${a} ${OP_SPOKEN[op]} ${b}?`,
    };
  }
  return null; // unreachable: attempt 11 always accepts
}

/** Optional pest-clearing division question - small, friendly numbers. */
export function rollDivQuestion() {
  const divisor = 2 + Math.floor(Math.random() * 3); // 2..4
  const quotient = 1 + Math.floor(Math.random() * 5); // 1..5
  const dividend = divisor * quotient;
  return {
    op: 'div',
    dice: [],
    a: dividend, b: divisor, answer: quotient,
    text: `${dividend} ${OP_SYMBOL.div} ${divisor} = ?`,
    spoken: `What is ${dividend} shared by ${divisor}?`,
  };
}

/** Three shuffled answer choices: the answer + two nearby distractors. */
export function makeChoices(answer) {
  const pool = randShuffle(
    [answer - 1, answer + 1, answer - 2, answer + 2, answer - 3, answer + 3]
      .filter((v) => v >= 0 && v !== answer),
  );
  const distractors = [...new Set(pool)].slice(0, 2);
  return randShuffle([
    { value: answer, correct: true },
    ...distractors.map((v) => ({ value: v, correct: false })),
  ]);
}
