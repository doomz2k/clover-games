// The word bank. Every entry maps to an SVG picture card of the same key.
//
//   w      - the written word (also the svg asset key)
//   first  - grapheme heard at the START of the word
//   last   - grapheme heard at the END of the word
//   g      - every curriculum grapheme whose SOUND occurs anywhere in the
//            word (used to keep unfair distractors out of a question)
//   p      - planet on which the word is introduced (words stay in the pool
//            for every later planet - questions draw cumulatively)
//
// Note: `g` is deliberately generous (e.g. "sock" lists c, k AND ck, "grass"
// lists ar for the long British-English vowel) so a word is never offered as
// a distractor for a sound it actually contains.

export const WORDS = [
  // Planet 1 - s a t p
  { w: 'sun',      first: 's',  last: 'n',  g: ['s','u','n'],                      p: 1 },
  { w: 'sock',     first: 's',  last: 'ck', g: ['s','o','ck','c','k'],             p: 1 },
  { w: 'ant',      first: 'a',  last: 't',  g: ['a','n','t'],                      p: 1 },
  { w: 'apple',    first: 'a',  last: 'l',  g: ['a','p','l','ll'],                 p: 1 },
  { w: 'tap',      first: 't',  last: 'p',  g: ['t','a','p'],                      p: 1 },
  { w: 'pig',      first: 'p',  last: 'g',  g: ['p','i','g'],                      p: 1 },
  { w: 'pan',      first: 'p',  last: 'n',  g: ['p','a','n'],                      p: 1 },

  // Planet 2 - i n m d
  { w: 'igloo',    first: 'i',  last: 'oo', g: ['i','g','l','oo'],                 p: 2 },
  { w: 'net',      first: 'n',  last: 't',  g: ['n','e','t'],                      p: 2 },
  { w: 'nest',     first: 'n',  last: 't',  g: ['n','e','s','t'],                  p: 2 },
  { w: 'moon',     first: 'm',  last: 'n',  g: ['m','oo','n'],                     p: 2 },
  { w: 'mouse',    first: 'm',  last: 's',  g: ['m','ow','s'],                     p: 2 },
  { w: 'dog',      first: 'd',  last: 'g',  g: ['d','o','g'],                      p: 2 },
  { w: 'duck',     first: 'd',  last: 'ck', g: ['d','u','ck','c','k'],             p: 2 },

  // Planet 3 - g o c k
  { w: 'goat',     first: 'g',  last: 't',  g: ['g','oa','t'],                     p: 3 },
  { w: 'octopus',  first: 'o',  last: 's',  g: ['o','c','k','t','p','u','s'],      p: 3 },
  { w: 'cat',      first: 'c',  last: 't',  g: ['c','k','a','t'],                  p: 3 },
  { w: 'car',      first: 'c',  last: 'ar', g: ['c','k','ar'],                     p: 3 },
  { w: 'kite',     first: 'k',  last: 't',  g: ['k','c','igh','t'],                p: 3 },
  { w: 'key',      first: 'k',  last: 'ee', g: ['k','c','ee'],                     p: 3 },

  // Planet 4 - ck e u r
  { w: 'rock',     first: 'r',  last: 'ck', g: ['r','o','ck','c','k'],             p: 4 },
  { w: 'egg',      first: 'e',  last: 'g',  g: ['e','g'],                          p: 4 },
  { w: 'umbrella', first: 'u',  last: 'a',  g: ['u','m','b','r','e','l','ll','a'], p: 4 },
  { w: 'rat',      first: 'r',  last: 't',  g: ['r','a','t'],                      p: 4 },
  { w: 'rocket',   first: 'r',  last: 't',  g: ['r','o','ck','c','k','e','t'],     p: 4 },

  // Planet 5 - h b f ff l ll ss
  { w: 'hat',      first: 'h',  last: 't',  g: ['h','a','t'],                      p: 5 },
  { w: 'ball',     first: 'b',  last: 'll', g: ['b','a','l','ll','or'],            p: 5 },
  { w: 'bus',      first: 'b',  last: 's',  g: ['b','u','s'],                      p: 5 },
  { w: 'fox',      first: 'f',  last: 's',  g: ['f','o','k','c','s'],              p: 5 },
  { w: 'fish',     first: 'f',  last: 'sh', g: ['f','i','sh'],                     p: 5 },
  { w: 'leaf',     first: 'l',  last: 'f',  g: ['l','ee','f','ff'],                p: 5 },
  { w: 'bell',     first: 'b',  last: 'll', g: ['b','e','l','ll'],                 p: 5 },
  { w: 'shell',    first: 'sh', last: 'll', g: ['sh','e','l','ll'],                p: 5 },
  { w: 'dress',    first: 'd',  last: 'ss', g: ['d','r','e','s','ss'],             p: 5 },
  { w: 'grass',    first: 'g',  last: 'ss', g: ['g','r','a','s','ss','ar'],        p: 5 },
  { w: 'cliff',    first: 'c',  last: 'ff', g: ['c','k','l','i','f','ff'],         p: 5 },

  // Planet 6 - sh ch th
  { w: 'ship',     first: 'sh', last: 'p',  g: ['sh','i','p'],                     p: 6 },
  { w: 'sheep',    first: 'sh', last: 'p',  g: ['sh','ee','p'],                    p: 6 },
  { w: 'chick',    first: 'ch', last: 'ck', g: ['ch','i','ck','c','k'],            p: 6 },
  { w: 'cheese',   first: 'ch', last: 's',  g: ['ch','ee','s'],                    p: 6 },
  { w: 'thumb',    first: 'th', last: 'm',  g: ['th','u','m'],                     p: 6 },
  { w: 'three',    first: 'th', last: 'ee', g: ['th','r','ee'],                    p: 6 },

  // Planet 7 - ng nk qu
  { w: 'ring',     first: 'r',  last: 'ng', g: ['r','i','ng','n'],                 p: 7 },
  { w: 'king',     first: 'k',  last: 'ng', g: ['k','c','i','ng','n'],             p: 7 },
  { w: 'sink',     first: 's',  last: 'nk', g: ['s','i','nk','n','k','c'],         p: 7 },
  { w: 'tank',     first: 't',  last: 'nk', g: ['t','a','nk','n','k','c'],         p: 7 },
  { w: 'queen',    first: 'qu', last: 'n',  g: ['qu','k','c','ee','n'],            p: 7 },
  { w: 'quilt',    first: 'qu', last: 't',  g: ['qu','k','c','i','l','t'],         p: 7 },

  // Planet 8 - ai ee igh
  { w: 'rain',     first: 'r',  last: 'n',  g: ['r','ai','n'],                     p: 8 },
  { w: 'snail',    first: 's',  last: 'l',  g: ['s','n','ai','l'],                 p: 8 },
  { w: 'train',    first: 't',  last: 'n',  g: ['t','r','ai','n'],                 p: 8 },
  { w: 'bee',      first: 'b',  last: 'ee', g: ['b','ee'],                         p: 8 },
  { w: 'tree',     first: 't',  last: 'ee', g: ['t','r','ee'],                     p: 8 },
  { w: 'light',    first: 'l',  last: 't',  g: ['l','igh','t'],                    p: 8 },

  // Planet 9 - oa oo ar
  { w: 'boat',     first: 'b',  last: 't',  g: ['b','oa','t'],                     p: 9 },
  { w: 'coat',     first: 'c',  last: 't',  g: ['c','k','oa','t'],                 p: 9 },
  { w: 'boot',     first: 'b',  last: 't',  g: ['b','oo','t'],                     p: 9 },
  { w: 'spoon',    first: 's',  last: 'n',  g: ['s','p','oo','n'],                 p: 9 },
  { w: 'star',     first: 's',  last: 'ar', g: ['s','t','ar'],                     p: 9 },
  { w: 'shark',    first: 'sh', last: 'k',  g: ['sh','ar','k','c'],                p: 9 },

  // Planet 10 - or ur ow
  { w: 'fork',     first: 'f',  last: 'k',  g: ['f','or','k','c'],                 p: 10 },
  { w: 'corn',     first: 'c',  last: 'n',  g: ['c','k','or','n'],                 p: 10 },
  { w: 'purse',    first: 'p',  last: 's',  g: ['p','ur','s'],                     p: 10 },
  { w: 'cow',      first: 'c',  last: 'ow', g: ['c','k','ow'],                     p: 10 },
  { w: 'owl',      first: 'ow', last: 'l',  g: ['ow','l'],                         p: 10 },
  { w: 'clown',    first: 'c',  last: 'n',  g: ['c','k','l','ow','n'],             p: 10 },

  // Planet 11 - extra CVC words for the word-reading planets
  { w: 'bed',      first: 'b',  last: 'd',  g: ['b','e','d'],                      p: 11 },
  { w: 'cup',      first: 'c',  last: 'p',  g: ['c','k','u','p'],                  p: 11 },
  { w: 'bug',      first: 'b',  last: 'g',  g: ['b','u','g'],                      p: 11 },

  // Planet 12 - extra CVCC / CCVC words
  { w: 'frog',     first: 'f',  last: 'g',  g: ['f','r','o','g'],                  p: 12 },
  { w: 'crab',     first: 'c',  last: 'b',  g: ['c','k','r','a','b'],              p: 12 },
  { w: 'lamp',     first: 'l',  last: 'p',  g: ['l','a','m','p'],                  p: 12 },
  { w: 'tent',     first: 't',  last: 't',  g: ['t','e','n'],                      p: 12 },
  { w: 'milk',     first: 'm',  last: 'k',  g: ['m','i','l','k','c'],              p: 12 },
  { w: 'flag',     first: 'f',  last: 'g',  g: ['f','l','a','g'],                  p: 12 },

  // Planet 13 - extra 5-letter words
  { w: 'plant',    first: 'p',  last: 't',  g: ['p','l','a','n','t','ar'],         p: 13 },
  { w: 'truck',    first: 't',  last: 'ck', g: ['t','r','u','ck','c','k'],         p: 13 },
];

// How the narrator pronounces each grapheme as a SOUND. Speech synthesis
// reads bare letters as letter names ("tee", "aitch"), so plosives get a
// gentle schwa and continuants get stretched spellings.
export const SOUND_SPEECH = {
  s: 'sss', a: 'a', t: 'tuh', p: 'puh',
  i: 'ih', n: 'nnn', m: 'mmm', d: 'duh',
  g: 'guh', o: 'o', c: 'kuh', k: 'kuh', ck: 'kuh',
  e: 'eh', u: 'uh', r: 'rrr',
  h: 'huh', b: 'buh', f: 'fff', ff: 'fff', l: 'lll', ll: 'lll', ss: 'sss',
  sh: 'shh', ch: 'chuh', th: 'thuh',
  ng: 'ing', nk: 'ink', qu: 'kwuh',
  ai: 'ay', ee: 'ee', igh: 'eye', oa: 'oh', oo: 'oo',
  ar: 'ar', or: 'or', ur: 'er', ow: 'ow',
};

// Where in a word each grapheme is listened for.
export const SOUND_POSITION = {
  ck: 'end', ff: 'end', ll: 'end', ss: 'end', ng: 'end', nk: 'end',
  ai: 'mid', ee: 'mid', igh: 'mid', oa: 'mid', oo: 'mid',
  ar: 'mid', or: 'mid', ur: 'mid', ow: 'mid',
};

export function positionOf(grapheme) {
  return SOUND_POSITION[grapheme] || 'start';
}
