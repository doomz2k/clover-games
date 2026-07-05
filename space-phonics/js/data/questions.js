// Question bank builder. Each session asks 10 questions drawn cumulatively
// from every planet up to and including the current one, alternating the two
// question types with never more than two of the same type in a row.

import { WORDS, SOUND_SPEECH, positionOf } from './words.js';
import { PLANETS } from './planets.js';
import { randPick, randShuffle } from '../core/util.js';

const QUESTIONS_PER_SESSION = 10;

function wordPool(planetId) {
  return WORDS.filter((w) => w.p <= planetId);
}

function soundsUpTo(planetId) {
  const out = [];
  for (const p of PLANETS) {
    if (p.id > planetId) break;
    if (p.sounds) out.push(...p.sounds);
  }
  return out;
}

function hasSoundAt(word, g, pos) {
  if (pos === 'start') return word.first === g;
  if (pos === 'end') return word.last === g;
  // mid: the sound must be present AND spelt with the target grapheme, so
  // "kite" is never the answer for igh even though it contains the sound.
  return word.g.includes(g) && word.w.includes(g);
}

// Sequence of types with at most two repeats in a row.
function typeSequence(n) {
  const seq = [];
  for (let i = 0; i < n; i++) {
    const lastTwoSame = i >= 2 && seq[i - 1] === seq[i - 2];
    if (lastTwoSame) seq.push(seq[i - 1] === 'A' ? 'B' : 'A');
    else seq.push(randPick(['A', 'B']));
  }
  return seq;
}

function positionPhrase(pos) {
  return pos === 'end' ? 'ends with' : 'starts with';
}

function buildSoundQuestion(qtype, g, pool, allSounds, usedWords) {
  const pos = positionOf(g);
  const spoken = SOUND_SPEECH[g];
  let candidates = pool.filter((w) => hasSoundAt(w, g, pos) && !usedWords.has(w.w));
  if (!candidates.length) candidates = pool.filter((w) => hasSoundAt(w, g, pos));
  if (!candidates.length) return null;
  const word = randPick(candidates);
  usedWords.add(word.w);

  if (qtype === 'A') {
    // letter -> picture: distractor pictures must not contain the sound at all
    const distractors = randShuffle(pool.filter((w) => !w.g.includes(g) && w.w !== word.w)).slice(0, 2);
    if (distractors.length < 2) return null;
    const prompt = pos === 'mid'
      ? `Which picture has the '${spoken}' sound in it?`
      : `Which picture ${positionPhrase(pos)} the '${spoken}' sound?`;
    return {
      qtype, sound: g,
      stimulus: { kind: 'sound', value: g },
      prompt,
      // spoken as sentence + isolated slow sound so it never gets mangled
      promptPre: pos === 'mid'
        ? 'Which picture has this sound in it?'
        : `Which picture ${positionPhrase(pos)} this sound?`,
      promptSound: g,
      choices: randShuffle([
        { kind: 'picture', value: word.w, correct: true },
        ...distractors.map((d) => ({ kind: 'picture', value: d.w, correct: false })),
      ]),
      answerSpoken: word.w,
    };
  }

  // B: picture -> letter: distractor sounds must not occur anywhere in the word
  const soundChoices = randShuffle(allSounds.filter((sd) => sd !== g && !word.g.includes(sd)))
    .slice(0, 2);
  if (soundChoices.length < 2) return null;
  const prompt = pos === 'mid'
    ? `${word.w}. Which sound can you hear in '${word.w}'?`
    : `${word.w}. What sound does '${word.w}' ${pos === 'end' ? 'end' : 'start'} with?`;
  return {
    qtype, sound: g,
    stimulus: { kind: 'picture', value: word.w },
    prompt,
    answerIsSound: true,
    choices: randShuffle([
      { kind: 'sound', value: g, correct: true },
      ...soundChoices.map((sd) => ({ kind: 'sound', value: sd, correct: false })),
    ]),
    answerSpoken: spoken,
  };
}

function buildWordQuestion(qtype, len, pool, usedWords) {
  const lengthPool = pool.filter((w) => w.w.length === len);
  let candidates = lengthPool.filter((w) => !usedWords.has(w.w));
  if (!candidates.length) candidates = lengthPool;
  if (!candidates.length) return null;
  const word = randPick(candidates);
  usedWords.add(word.w);

  if (qtype === 'A') {
    // written word -> picture (silent reading practice: the word itself is
    // NOT spoken, or reading would not be needed)
    const distractors = randShuffle(pool.filter((w) => w.w !== word.w)).slice(0, 2);
    return {
      qtype, word: word.w,
      stimulus: { kind: 'wordtext', value: word.w },
      prompt: 'Read the word. Which picture does it show?',
      choices: randShuffle([
        { kind: 'picture', value: word.w, correct: true },
        ...distractors.map((d) => ({ kind: 'picture', value: d.w, correct: false })),
      ]),
      answerSpoken: word.w,
    };
  }

  // picture -> written word: distractor words share the same length when possible
  let distractors = randShuffle(lengthPool.filter((w) => w.w !== word.w)).slice(0, 2);
  if (distractors.length < 2) {
    distractors = distractors.concat(
      randShuffle(pool.filter((w) => w.w !== word.w && !distractors.includes(w))).slice(0, 2 - distractors.length),
    );
  }
  return {
    qtype, word: word.w,
    stimulus: { kind: 'picture', value: word.w },
    prompt: `Which word says '${word.w}'?`,
    choices: randShuffle([
      { kind: 'wordtext', value: word.w, correct: true },
      ...distractors.map((d) => ({ kind: 'wordtext', value: d.w, correct: false })),
    ]),
    answerSpoken: word.w,
  };
}

/** Build the 10 questions for one planet session. */
export function buildQuestions(planet) {
  const pool = wordPool(planet.id);
  const allSounds = soundsUpTo(planet.id === 11 || planet.id === 12 || planet.id === 13 ? 10 : planet.id);
  const usedWords = new Set();
  const types = typeSequence(QUESTIONS_PER_SESSION);
  const questions = [];

  if (planet.sounds) {
    // Target sounds: every new sound at least once, topped up with repeats of
    // new sounds, then review sounds from earlier planets.
    const targets = [...planet.sounds];
    while (targets.length < 7 && planet.sounds.length) {
      targets.push(randPick(planet.sounds));
    }
    const review = allSounds.filter((g) => !planet.sounds.includes(g));
    while (targets.length < QUESTIONS_PER_SESSION) {
      targets.push(review.length ? randPick(review) : randPick(planet.sounds));
    }
    const shuffled = randShuffle(targets).slice(0, QUESTIONS_PER_SESSION);
    for (let i = 0; i < QUESTIONS_PER_SESSION; i++) {
      let q = buildSoundQuestion(types[i], shuffled[i], pool, allSounds, usedWords);
      // Fallbacks: flip type, then fall back to a random reviewable sound.
      if (!q) q = buildSoundQuestion(types[i] === 'A' ? 'B' : 'A', shuffled[i], pool, allSounds, usedWords);
      if (!q) q = buildSoundQuestion(types[i], randPick(allSounds), pool, allSounds, usedWords);
      if (q) questions.push(q);
    }
  } else {
    for (let i = 0; i < QUESTIONS_PER_SESSION; i++) {
      const q = buildWordQuestion(types[i], planet.wordLength, pool, usedWords);
      if (q) questions.push(q);
    }
  }

  // Guarantee a full session even if a pathological draw dropped a question.
  while (questions.length < QUESTIONS_PER_SESSION && questions.length > 0) {
    questions.push(questions[questions.length % questions.length]);
  }
  return questions.slice(0, QUESTIONS_PER_SESSION);
}
