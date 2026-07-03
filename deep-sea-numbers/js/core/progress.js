// Progress manager - thin wrapper around localStorage.
// Schema: { levels: [ { id, stars, unlocked, bestScore } ] }

import { LEVELS } from '../data/levels.js';

const KEY = 'deepseanumbers_progress';

function freshState() {
  return {
    levels: LEVELS.map((l) => ({
      id: l.id,
      stars: 0,
      unlocked: l.id === 1,
      bestScore: 0,
    })),
  };
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return freshState();
    const data = JSON.parse(raw);
    if (!Array.isArray(data.levels)) return freshState();
    const state = freshState();
    for (const saved of data.levels) {
      const slot = state.levels.find((l) => l.id === saved.id);
      if (slot) Object.assign(slot, {
        stars: saved.stars | 0,
        unlocked: !!saved.unlocked || slot.unlocked,
        bestScore: saved.bestScore | 0,
      });
    }
    return state;
  } catch {
    return freshState();
  }
}

let state = null;

function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage blocked */ }
}

export function getProgress() {
  if (!state) state = load();
  return state;
}

export function levelProgress(id) {
  return getProgress().levels.find((l) => l.id === id);
}

export function isUnlocked(id) {
  return !!levelProgress(id)?.unlocked;
}

/** Record a finished session; a 3-star run unlocks the next depth. */
export function saveLevel(id, stars, score) {
  const l = levelProgress(id);
  if (!l) return { unlockedNext: false };
  l.stars = Math.max(l.stars, stars);
  l.bestScore = Math.max(l.bestScore, score);
  let unlockedNext = false;
  if (stars === 3) {
    const next = levelProgress(id + 1);
    if (next && !next.unlocked) {
      next.unlocked = true;
      unlockedNext = true;
    }
  }
  persist();
  return { unlockedNext };
}

export function furthestUnlocked() {
  let furthest = 1;
  for (const l of getProgress().levels) if (l.unlocked) furthest = l.id;
  return furthest;
}
