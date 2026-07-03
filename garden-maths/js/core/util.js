// Small shared helpers: seeded RNG and array utilities.

// Deterministic PRNG (mulberry32) - planet/alien generators take one of
// these so the same seed always draws the same world.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

export function shuffle(rng, arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function clamp(v, min, max) {
  return v < min ? min : v > max ? max : v;
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

// Non-seeded conveniences for gameplay-side randomness.
const liveRng = mulberry32((performance.now() * 1000) ^ 0x9E3779B9);
export const rand = () => liveRng();
export const randPick = (arr) => pick(liveRng, arr);
export const randShuffle = (arr) => shuffle(liveRng, arr);
