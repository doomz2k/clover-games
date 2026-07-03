// The twelve depths of Deep Sea Numbers, in early-years maths progression
// order. Each level names its host creature and its question focus; sessions
// mix ~7 focus questions with ~3 review questions from earlier depths.
//
// Focus kinds:
//   count   - group of objects -> pick the numeral
//   match   - numeral -> pick the group with that many
//   more    - "what is one more than N?"
//   less    - "what is one less than N?"
//   most    - three groups -> pick the one with the most
//   fewest  - three groups -> pick the one with the fewest
//   add     - a + b with pictures -> numeral
//   sub     - a - b with pictures (taken-away objects ghosted) -> numeral

export const LEVELS = [
  { id: 1,  name: 'Rock Pool Shallows',  creature: 'Bubbles',  focus: ['count'],          min: 1, max: 3,  seed: 2101 },
  { id: 2,  name: 'Seagrass Meadow',     creature: 'Shelly',   focus: ['count', 'match'], min: 1, max: 5,  seed: 2202 },
  { id: 3,  name: 'Bubble Reef',         creature: 'Finn',     focus: ['count', 'match'], min: 1, max: 10, seed: 2303 },
  { id: 4,  name: 'The Kelp Forest',     creature: 'Kelpie',   focus: ['more'],           min: 1, max: 4,  seed: 2404 },
  { id: 5,  name: 'Coral Gardens',       creature: 'Coco',     focus: ['less'],           min: 2, max: 5,  seed: 2505 },
  { id: 6,  name: 'The Shimmer Caves',   creature: 'Shimmer',  focus: ['more', 'less'],   min: 1, max: 9,  seed: 2606 },
  { id: 7,  name: 'Starfish Point',      creature: 'Stella',   focus: ['most'],           min: 1, max: 10, seed: 2707 },
  { id: 8,  name: 'The Twilight Zone',   creature: 'Twyla',    focus: ['fewest'],         min: 1, max: 10, seed: 2808 },
  { id: 9,  name: 'Pearl Valley',        creature: 'Pearl',    focus: ['add'],            min: 1, max: 5,  seed: 2909 },
  { id: 10, name: 'The Sunken Ship',     creature: 'Barnacle', focus: ['add'],            min: 2, max: 10, seed: 3010 },
  { id: 11, name: 'Ink Deep',            creature: 'Inky',     focus: ['sub'],            min: 1, max: 5,  seed: 3111 },
  { id: 12, name: 'The Midnight Trench', creature: 'Luna',     focus: ['sub'],            min: 2, max: 10, seed: 3212 },
];

// Counting-object species (each maps to an SVG asset key + plural word).
export const SPECIES = [
  { key: 'obj_starfish', word: 'starfish', plural: 'starfish' },
  { key: 'obj_fish',     word: 'fish',     plural: 'fish' },
  { key: 'obj_shell',    word: 'shell',    plural: 'shells' },
  { key: 'obj_crab',     word: 'crab',     plural: 'crabs' },
  { key: 'obj_pearl',    word: 'pearl',    plural: 'pearls' },
  { key: 'obj_jelly',    word: 'jellyfish', plural: 'jellyfish' },
];

export const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
