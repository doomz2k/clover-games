// Enumerates every line of narration the three games can speak and writes
// voices/manifest.json. The CI workflow (generate-voices.yml) then renders
// each entry with a neural TTS; the games look clips up by the same
// fnv1a-32 hash of `${profile}|${text}` and fall back to browser speech
// for anything missing.
//
// Run from the repo root:  node tools/gen-voice-manifest.mjs

import { writeFileSync, mkdirSync } from 'node:fs';

import { WORDS, SOUND_SPEECH } from '../space-phonics/js/data/words.js';
import { PLANETS } from '../space-phonics/js/data/planets.js';
import { LEVELS, SPECIES, NUMBER_WORDS } from '../deep-sea-numbers/js/data/levels.js';
import { SEASONS } from '../garden-maths/js/data/seasons.js';

function fnv(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

const entries = new Map(); // hash -> { t, p }
function add(text, profile = 'narrator') {
  const h = fnv(`${profile}|${text}`);
  entries.set(h, { t: text, p: profile });
}

// ---------------------------------------------------------------------------
// Shared reaction lines (identical strings across games dedupe by hash)
// ---------------------------------------------------------------------------
add("Brilliant! That's right!", 'alien');
add('Well done - keep going!', 'alien');
add('Ooh, not quite - have another go!', 'alien');
add('Let me give you a clue...', 'alien');

// ---------------------------------------------------------------------------
// Space Phonics
// ---------------------------------------------------------------------------
add('Get all ten right on the planet before it to unlock this one!');
add('Good try! Can you get them all right to unlock the next planet?');
add('The answer is...');
add('Read the word. Which picture does it show?');
add('Which picture starts with this sound?');
add('Which picture ends with this sound?');
add('Which picture has this sound in it?');

PLANETS.forEach((p, i) => {
  add(`Hello! I'm ${p.alien} on ${p.name}. Can you help load my delivery?`, 'alien');
  const next = PLANETS[i + 1];
  if (next) add(`Amazing! ${p.alien} got everything! You've unlocked ${next.name}!`);
  else add(`Amazing! ${p.alien} got everything! You've delivered to the whole universe!`);
});

for (const w of WORDS) {
  add(w.w);                                                 // preview chip
  add(`The answer is ${w.w}!`);
  add(`Which word says '${w.w}'?`);
  add(`${w.w}. What sound does '${w.w}' start with?`);
  add(`${w.w}. What sound does '${w.w}' end with?`);
  add(`${w.w}. Which sound can you hear in '${w.w}'?`);
}
for (const s of new Set(Object.values(SOUND_SPEECH))) add(s, 'sound');

// ---------------------------------------------------------------------------
// Deep Sea Numbers
// ---------------------------------------------------------------------------
add('Collect all ten pearls at the depth before this one to dive deeper!');
add('Good try! Can you collect all ten pearls to dive deeper?');

LEVELS.forEach((l, i) => {
  add(`Hello! I'm ${l.creature} at ${l.name}. Can you help me collect my pearls?`, 'alien');
  const next = LEVELS[i + 1];
  if (next) add(`Amazing! ${l.creature} got every pearl! You've unlocked ${next.name}!`);
  else add(`Amazing! ${l.creature} got every pearl! You've explored the whole ocean!`);
});

for (let n = 0; n <= 10; n++) {
  add(NUMBER_WORDS[n]);                                     // numeral preview
  add(`The answer is ${NUMBER_WORDS[n]}!`);
}

for (const sp of SPECIES) {
  const noun = (n) => (n === 1 ? sp.word : sp.plural);
  add(`Count the ${sp.plural}! How many can you see?`);
  add(`Look carefully! Which card has the most ${sp.plural}?`);
  add(`Look carefully! Which card has the fewest ${sp.plural}?`);
  for (let n = 0; n <= 10; n++) add(`${NUMBER_WORDS[n]} ${noun(n)}`); // group preview
  for (let n = 1; n <= 10; n++) {
    add(`${NUMBER_WORDS[n]}! Can you find ${NUMBER_WORDS[n]} ${noun(n)}?`);
    const isAre = n === 1 ? 'is' : 'are';
    if (n <= 9) add(`Here ${isAre} ${NUMBER_WORDS[n]} ${noun(n)}. What is one MORE than ${NUMBER_WORDS[n]}?`);
    add(`Here ${isAre} ${NUMBER_WORDS[n]} ${noun(n)}. What is one LESS than ${NUMBER_WORDS[n]}?`);
  }
  for (let a = 1; a <= 9; a++) {
    for (let b = 1; a + b <= 10; b++) {
      add(`${NUMBER_WORDS[a]} ${noun(a)}, add ${NUMBER_WORDS[b]} more. How many altogether?`);
    }
  }
  for (let a = 2; a <= 10; a++) {
    for (let b = 1; b < a; b++) {
      add(`${NUMBER_WORDS[a]} ${sp.plural}, take away ${NUMBER_WORDS[b]}. How many are left?`);
    }
  }
}

// ---------------------------------------------------------------------------
// Garden Maths
// ---------------------------------------------------------------------------
add('Welcome to the garden! Roll the dice!');
add('Grow all three flowers in the season before to unlock this one!');
add('Good try! Can you get all three flowers to bloom?');
add('Your garden is beautiful! You are a master gardener!');
add('Your garden is beautiful! Grow it with no pest damage to unlock the next season!');
add("It's growing!");
add('Beautiful! Look at your flower!');
add('The pests are everywhere!');
add('Oh no - the pests got to your plant!');
add('Got one!');
add('Never mind - watch out for that pest!');
add('Ooh, not quite - try again!');
add('Have another go!');
add('Brilliant! Your plant loves it!');
add("That's right! Wonderful!");
add('Brilliant! Look at it grow!');

SEASONS.forEach((s, i) => {
  const next = SEASONS[i + 1];
  if (next) add(`Your garden is beautiful! You've unlocked ${next.name}!`);
});

for (let a = 1; a <= 10; a++) {
  for (let b = 1; b <= 10; b++) {
    add(`What is ${a} plus ${b}?`);
    if (b <= a) add(`What is ${a} take away ${b}?`);
    if (a <= 4) add(`What is ${a} times ${b}?`);
  }
}
for (let v = 2; v <= 4; v++) {
  for (let q = 1; q <= 5; q++) {
    add(`What is ${v * q} shared by ${v}?`);
    add(`A pest is coming! What is ${v * q} shared by ${v}?`);
  }
}
for (let n = 0; n <= 43; n++) add(String(n)); // numeral preview chips

// ---------------------------------------------------------------------------
const manifest = Object.fromEntries(entries);
mkdirSync('voices', { recursive: true });
writeFileSync('voices/manifest.json', JSON.stringify(manifest));
console.log(`voices/manifest.json written: ${entries.size} lines`);
