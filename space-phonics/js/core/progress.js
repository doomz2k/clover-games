// Progress manager - thin wrapper around localStorage.
// Schema: { planets: [ { id, stars, unlocked, bestScore } ] }

import { PLANETS } from '../data/planets.js';

const KEY = 'spacephonics_progress';

function freshState() {
  return {
    planets: PLANETS.map((p) => ({
      id: p.id,
      stars: 0,
      unlocked: p.id === 1,
      bestScore: 0,
    })),
  };
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return freshState();
    const data = JSON.parse(raw);
    if (!Array.isArray(data.planets)) return freshState();
    // Merge onto a fresh state so newly added planets get sane defaults.
    const state = freshState();
    for (const saved of data.planets) {
      const slot = state.planets.find((p) => p.id === saved.id);
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
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage full/blocked */ }
}

export function getProgress() {
  if (!state) state = load();
  return state;
}

export function planetProgress(id) {
  return getProgress().planets.find((p) => p.id === id);
}

export function isUnlocked(id) {
  return !!planetProgress(id)?.unlocked;
}

/**
 * Record a finished session. Stars only ever improve. A 3-star (perfect)
 * run unlocks the next planet. Returns { unlockedNext }.
 */
export function savePlanet(id, stars, score) {
  const p = planetProgress(id);
  if (!p) return { unlockedNext: false };
  p.stars = Math.max(p.stars, stars);
  p.bestScore = Math.max(p.bestScore, score);
  let unlockedNext = false;
  if (stars === 3) {
    const next = planetProgress(id + 1);
    if (next && !next.unlocked) {
      next.unlocked = true;
      unlockedNext = true;
    }
  }
  persist();
  return { unlockedNext };
}

/** Furthest unlocked planet id (where the ship is parked on the map). */
export function furthestUnlocked() {
  const planets = getProgress().planets;
  let furthest = 1;
  for (const p of planets) if (p.unlocked) furthest = p.id;
  return furthest;
}
