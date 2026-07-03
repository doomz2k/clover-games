// Minimal tween engine driven by the shared PIXI ticker. Handles everything
// the game animates imperatively: crate arcs, card pops, scene fades, ship
// launches. Nested property paths ("scale.x") are supported.

const active = new Set();

export const Ease = {
  linear: (t) => t,
  outQuad: (t) => t * (2 - t),
  inQuad: (t) => t * t,
  inOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  outCubic: (t) => 1 + (--t) * t * t,
  inCubic: (t) => t * t * t,
  outBack: (t) => { const s = 1.70158; return 1 + (--t) * t * ((s + 1) * t + s); },
  outElastic: (t) => t === 0 ? 0 : t === 1 ? 1
    : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI) / 3) + 1,
  outBounce: (t) => {
    const n = 7.5625, d = 2.75;
    if (t < 1 / d) return n * t * t;
    if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75;
    if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375;
    return n * (t -= 2.625 / d) * t + 0.984375;
  },
};

function getPath(obj, path) {
  return path.length === 1 ? obj[path[0]] : obj[path[0]][path[1]];
}
function setPath(obj, path, v) {
  if (path.length === 1) obj[path[0]] = v;
  else obj[path[0]][path[1]] = v;
}

/**
 * tween(target, { x: 100, 'scale.x': 1.2 }, 400, { ease, delay, onUpdate, onComplete })
 * Returns a promise that resolves when the tween finishes (or is killed).
 */
export function tween(target, props, duration, opts = {}) {
  return new Promise((resolve) => {
    const entry = {
      target,
      duration: Math.max(1, duration),
      elapsed: -(opts.delay || 0),
      ease: opts.ease || Ease.outQuad,
      onUpdate: opts.onUpdate,
      onComplete: () => { opts.onComplete?.(); resolve(); },
      fields: null,
      props,
    };
    active.add(entry);
  });
}

export function killTweensOf(target) {
  for (const t of active) if (t.target === target) active.delete(t);
}

export function wait(ms) {
  return tween({ t: 0 }, { t: 1 }, ms);
}

export function initTweens(app) {
  app.ticker.add((ticker) => {
    const dt = ticker.deltaMS;
    for (const t of active) {
      t.elapsed += dt;
      if (t.elapsed < 0) continue; // still in delay
      const p = Math.min(1, t.elapsed / t.duration);
      const e = t.ease(p);
      try {
        if (!t.fields) {
          // capture start values on first live frame (after any delay)
          t.fields = Object.entries(t.props).map(([k, end]) => {
            const path = k.split('.');
            return { path, start: getPath(t.target, path), end };
          });
        }
        for (const f of t.fields) setPath(t.target, f.path, f.start + (f.end - f.start) * e);
        t.onUpdate?.(e, p);
      } catch {
        // target was destroyed mid-tween (scene switch) - drop the tween
        active.delete(t);
        t.onComplete();
        continue;
      }
      if (p >= 1) {
        active.delete(t);
        t.onComplete();
      }
    }
  });
}
