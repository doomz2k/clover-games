// Question builder for Deep Sea Numbers. Each session is 10 questions:
// ~7 on the level's focus skill plus ~3 review questions drawn from earlier
// depths, all shuffled. Answers are always one of three tappable cards.

import { LEVELS, SPECIES, NUMBER_WORDS } from './levels.js';
import { randPick, randShuffle } from '../core/util.js';

const QUESTIONS_PER_SESSION = 10;

const intIn = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));

// Two distinct wrong numerals near the answer, kept within [lo, hi].
function numeralDistractors(answer, lo = 0, hi = 10) {
  const candidates = randShuffle(
    [answer - 1, answer + 1, answer - 2, answer + 2, answer - 3, answer + 3]
      .filter((v) => v >= lo && v <= hi && v !== answer),
  );
  return candidates.slice(0, 2);
}

const numeralChoices = (answer, lo, hi) => randShuffle([
  { kind: 'numeral', value: answer, correct: true },
  ...numeralDistractors(answer, lo, hi).map((v) => ({ kind: 'numeral', value: v, correct: false })),
]);

// ---------------------------------------------------------------------------
// One builder per question kind
// ---------------------------------------------------------------------------

const BUILDERS = {
  count(level) {
    const n = intIn(level.min, level.max);
    const sp = randPick(SPECIES);
    return {
      kind: 'count',
      stimulus: { kind: 'group', species: sp.key, count: n },
      prompt: `Count the ${sp.plural}! How many can you see?`,
      choices: numeralChoices(n, Math.max(0, level.min - 2), Math.min(10, level.max + 2)),
      answerSpoken: NUMBER_WORDS[n],
    };
  },

  match(level) {
    const n = intIn(level.min, level.max);
    const sp = randPick(SPECIES);
    const wrong = numeralDistractors(n, Math.max(1, level.min - 1), Math.min(10, level.max + 1));
    if (wrong.length < 2) return null;
    return {
      kind: 'match',
      stimulus: { kind: 'numeral', value: n },
      prompt: `${NUMBER_WORDS[n]}! Can you find ${NUMBER_WORDS[n]} ${n === 1 ? sp.word : sp.plural}?`,
      choices: randShuffle([
        { kind: 'group', species: sp.key, count: n, correct: true },
        ...wrong.map((v) => ({ kind: 'group', species: sp.key, count: v, correct: false })),
      ]),
      answerSpoken: NUMBER_WORDS[n],
    };
  },

  more(level) {
    const n = intIn(level.min, Math.min(level.max, 9));
    const sp = randPick(SPECIES);
    return {
      kind: 'more',
      stimulus: { kind: 'group', species: sp.key, count: n, badge: n },
      prompt: `Here ${n === 1 ? 'is' : 'are'} ${NUMBER_WORDS[n]} ${n === 1 ? sp.word : sp.plural}. What is one MORE than ${NUMBER_WORDS[n]}?`,
      choices: numeralChoices(n + 1, Math.max(0, n - 2), Math.min(10, n + 3)),
      answerSpoken: NUMBER_WORDS[n + 1],
    };
  },

  less(level) {
    const n = intIn(Math.max(level.min, 1), level.max);
    const sp = randPick(SPECIES);
    return {
      kind: 'less',
      stimulus: { kind: 'group', species: sp.key, count: n, badge: n },
      prompt: `Here ${n === 1 ? 'is' : 'are'} ${NUMBER_WORDS[n]} ${n === 1 ? sp.word : sp.plural}. What is one LESS than ${NUMBER_WORDS[n]}?`,
      choices: numeralChoices(n - 1, Math.max(0, n - 3), Math.min(10, n + 2)),
      answerSpoken: NUMBER_WORDS[n - 1],
    };
  },

  most(level) {
    return groupCompare(level, 'most');
  },

  fewest(level) {
    return groupCompare(level, 'fewest');
  },

  add(level) {
    const total = intIn(Math.max(2, level.min), level.max);
    const a = intIn(1, total - 1);
    const b = total - a;
    const sp = randPick(SPECIES);
    return {
      kind: 'add',
      stimulus: { kind: 'sum', a, b, op: '+', species: sp.key },
      prompt: `${NUMBER_WORDS[a]} ${sp.plural}, add ${NUMBER_WORDS[b]} more. How many altogether?`,
      choices: numeralChoices(total, Math.max(0, total - 3), Math.min(10, total + 3)),
      answerSpoken: NUMBER_WORDS[total],
    };
  },

  sub(level) {
    const a = intIn(Math.max(2, level.min), level.max);
    const b = intIn(1, a - 1);
    const sp = randPick(SPECIES);
    return {
      kind: 'sub',
      stimulus: { kind: 'sum', a, b, op: '-', species: sp.key },
      prompt: `${NUMBER_WORDS[a]} ${sp.plural}, take away ${NUMBER_WORDS[b]}. How many are left?`,
      choices: numeralChoices(a - b, Math.max(0, a - b - 3), Math.min(10, a - b + 3)),
      answerSpoken: NUMBER_WORDS[a - b],
    };
  },
};

function groupCompare(level, which) {
  const sp = randPick(SPECIES);
  // three clearly distinct counts
  const counts = [];
  let guard = 0;
  while (counts.length < 3 && guard++ < 60) {
    const v = intIn(level.min, level.max);
    if (!counts.includes(v)) counts.push(v);
  }
  if (counts.length < 3) return null;
  const target = which === 'most' ? Math.max(...counts) : Math.min(...counts);
  return {
    kind: which,
    stimulus: { kind: 'label', value: which === 'most' ? 'MOST' : 'FEWEST' },
    prompt: `Look carefully! Which card has the ${which} ${sp.plural}?`,
    choices: randShuffle(counts.map((v) => ({
      kind: 'group', species: sp.key, count: v, correct: v === target,
    }))),
    answerSpoken: NUMBER_WORDS[target],
  };
}

// ---------------------------------------------------------------------------

/** Build the 10 questions for one depth's session. */
export function buildQuestions(level) {
  const questions = [];
  const focusCount = level.id === 1 ? QUESTIONS_PER_SESSION : 7;
  const earlier = LEVELS.filter((l) => l.id < level.id);

  for (let i = 0; i < focusCount; i++) {
    const kind = level.focus[i % level.focus.length];
    const q = BUILDERS[kind](level);
    if (q) questions.push(q);
  }
  while (questions.length < QUESTIONS_PER_SESSION) {
    const src = earlier.length ? randPick(earlier) : level;
    const kind = randPick(src.focus);
    const q = BUILDERS[kind](src);
    if (q) questions.push(q);
  }
  return randShuffle(questions).slice(0, QUESTIONS_PER_SESSION);
}
