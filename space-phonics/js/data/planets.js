// The thirteen planets of the Space Phonics universe, in Letters and Sounds
// progression order. `sounds` lists the graphemes introduced on that planet;
// the word-reading planets (11-13) set `wordLength` instead. Seeds drive the
// procedural planet + alien generators so every world is stable but unique.

export const PLANETS = [
  { id: 1,  name: 'Planet Zim',        alien: 'Zib',     sounds: ['s', 'a', 't', 'p'],                  seed: 101 },
  { id: 2,  name: 'The Wobbly Moon',   alien: 'Momo',    sounds: ['i', 'n', 'm', 'd'],                  seed: 202 },
  { id: 3,  name: 'Bopstar',           alien: 'Bloop',   sounds: ['g', 'o', 'c', 'k'],                  seed: 303 },
  { id: 4,  name: 'Frizz Minor',       alien: 'Frizzle', sounds: ['ck', 'e', 'u', 'r'],                 seed: 404 },
  { id: 5,  name: 'Noodle Nebula',     alien: 'Noodle',  sounds: ['h', 'b', 'f', 'ff', 'l', 'll', 'ss'], seed: 505 },
  { id: 6,  name: 'The Grumble Ring',  alien: 'Grum',    sounds: ['sh', 'ch', 'th'],                    seed: 606 },
  { id: 7,  name: 'Planet Whumble',    alien: 'Whum',    sounds: ['ng', 'nk', 'qu'],                    seed: 707 },
  { id: 8,  name: 'Asteroid Vex',      alien: 'Vexa',    sounds: ['ai', 'ee', 'igh'],                   seed: 808 },
  { id: 9,  name: 'The Glitter Belt',  alien: 'Glitta',  sounds: ['oa', 'oo', 'ar'],                    seed: 909 },
  { id: 10, name: "Zog's Crater",      alien: 'Zog',     sounds: ['or', 'ur', 'ow'],                    seed: 1010 },
  { id: 11, name: 'Twin Moons of Pip', alien: 'Pip',     wordLength: 3,                                 seed: 1111 },
  { id: 12, name: 'The Ice Rings',     alien: 'Icicle',  wordLength: 4,                                 seed: 1212 },
  { id: 13, name: "Galaxy's Edge",     alien: 'Nova',    wordLength: 5,                                 seed: 1313 },
];
