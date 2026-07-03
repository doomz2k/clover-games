// Progress manager - thin wrapper around localStorage.
// Schema: { seasons: [ { id, stars, unlocked, plantsBloomed } ] }

import { SEASONS } from '../data/seasons.js';

const KEY = 'gardenMaths_progress';

function freshState() {
  return {
    seasons: SEASONS.map((s) => ({
      id: s.id,
      stars: 0,
      unlocked: s.id === 1,
      plantsBloomed: 0,
    })),
  };
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return freshState();
    const data = JSON.parse(raw);
    if (!Array.isArray(data.seasons)) return freshState();
    const state = freshState();
    for (const saved of data.seasons) {
      const slot = state.seasons.find((s) => s.id === saved.id);
      if (slot) Object.assign(slot, {
        stars: saved.stars | 0,
        unlocked: !!saved.unlocked || slot.unlocked,
        plantsBloomed: saved.plantsBloomed | 0,
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

export function seasonProgress(id) {
  return getProgress().seasons.find((s) => s.id === id);
}

export function isUnlocked(id) {
  return !!seasonProgress(id)?.unlocked;
}

/** Record a finished season; 3 stars unlocks the next one. */
export function saveSeason(id, stars, plantsBloomed) {
  const s = seasonProgress(id);
  if (!s) return { unlockedNext: false };
  s.stars = Math.max(s.stars, stars);
  s.plantsBloomed = Math.max(s.plantsBloomed, plantsBloomed);
  let unlockedNext = false;
  if (stars === 3) {
    const next = seasonProgress(id + 1);
    if (next && !next.unlocked) {
      next.unlocked = true;
      unlockedNext = true;
    }
  }
  persist();
  return { unlockedNext };
}
