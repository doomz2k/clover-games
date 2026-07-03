// The six seasons of Garden Maths, in difficulty order. Each season fields
// three plants (one per flower family) and defines which dice and operations
// are in play. Multiplication always pairs a D4 with a season die so the
// numbers stay small; division exists only as the optional pest-clearing
// bonus (from High Summer onward, mandatory flavour of Harvest).
//
//   dice     - dice available for addition/subtraction rolls
//   ops      - care-giving operations in play ('add' | 'sub' | 'mul')
//   bonusDiv - chance per answered question of offering an optional
//              pest-clearing division question (0 = never)
//   hue      - base garden hue for procedural plant colouring

export const SEASONS = [
  { id: 1, name: 'Spring',       dice: [6],         ops: ['add'],                bonusDiv: 0,    skyShift: 0.0, hues: [48, 340, 265] },
  { id: 2, name: 'Early Summer', dice: [6, 8],      ops: ['add', 'sub'],         bonusDiv: 0,    skyShift: 0.15, hues: [38, 0, 220] },
  { id: 3, name: 'High Summer',  dice: [6, 8],      ops: ['add', 'sub'],         bonusDiv: 0.3,  skyShift: 0.3, hues: [52, 320, 200] },
  { id: 4, name: 'Late Summer',  dice: [8, 10],     ops: ['add', 'sub'],         bonusDiv: 0.3,  skyShift: 0.5, hues: [30, 355, 285] },
  { id: 5, name: 'Autumn',       dice: [8, 10],     ops: ['add', 'sub', 'mul'],  bonusDiv: 0.35, skyShift: 0.75, hues: [22, 8, 305] },
  { id: 6, name: 'Harvest',      dice: [6, 8, 10],  ops: ['add', 'sub', 'mul'],  bonusDiv: 0.6,  skyShift: 1.0, hues: [42, 15, 250] },
];

// Growth stages: 0 seed mound, 1 sprout, 2 bud, 3 full bloom.
export const STAGE_COUNT = 4;
export const FULL_BLOOM = 3;

// Flower families, one per plant slot.
export const FAMILIES = ['sunflower', 'rose', 'bell'];

// Operation -> care mapping (division is pest removal, not care).
export const CARE_OF_OP = { add: 'sun', sub: 'water', mul: 'nutrients' };
export const CARE_LABEL = { sun: 'sunlight', water: 'water', nutrients: 'nutrients' };

// A season ends after this many rounds even if not everything bloomed.
export const MAX_ROUNDS = 5;

// Pest meter capacity.
export const PEST_CAP = 5;
