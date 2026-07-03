// Programmatic sound effects via the Web Audio API - no audio files.
// The AudioContext can only start after a user gesture, so unlock() is
// called from the first pointer event; every effect no-ops safely before
// then or when Web Audio is unavailable.

let ctx = null;

export function unlock() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
}

function now() { return ctx.currentTime; }

function tone(freq, start, dur, { type = 'sine', vol = 0.2, endFreq = null } = {}) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, start + dur);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(vol, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + dur + 0.05);
}

function noiseBuffer(dur) {
  const len = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

function noise(start, dur, { vol = 0.2, filterFreq = 1000, filterEnd = null, type = 'bandpass', q = 1 } = {}) {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(dur);
  const filter = ctx.createBiquadFilter();
  filter.type = type;
  filter.Q.value = q;
  filter.frequency.setValueAtTime(filterFreq, start);
  if (filterEnd) filter.frequency.exponentialRampToValueAtTime(filterEnd, start + dur);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(vol, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  src.connect(filter).connect(gain).connect(ctx.destination);
  src.start(start);
}

const guard = (fn) => (...args) => { if (ctx && ctx.state === 'running') fn(...args); };

// Bright ascending sine sequence.
export const sfxCorrect = guard(() => {
  const t = now();
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, t + i * 0.09, 0.22, { vol: 0.18 }));
});

// Gentler two-note chime for a correct-after-hint answer.
export const sfxCorrectSoft = guard(() => {
  const t = now();
  [523.25, 659.25].forEach((f, i) => tone(f, t + i * 0.11, 0.25, { vol: 0.12 }));
});

// Descending sine with a pitch wobble.
export const sfxBoing = guard(() => {
  const t = now();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(320, t);
  osc.frequency.exponentialRampToValueAtTime(140, t + 0.28);
  osc.frequency.exponentialRampToValueAtTime(180, t + 0.38);
  osc.frequency.exponentialRampToValueAtTime(120, t + 0.5);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.16, t + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.6);
});

// Short noise burst + low thump for the crate landing in the bay.
export const sfxClunk = guard(() => {
  const t = now();
  noise(t, 0.09, { vol: 0.25, filterFreq: 800, type: 'lowpass' });
  tone(90, t, 0.16, { type: 'sine', vol: 0.3, endFreq: 55 });
});

// Swept noise band, rising then fading - rocket launch.
export const sfxWhoosh = guard(() => {
  const t = now();
  noise(t, 1.4, { vol: 0.3, filterFreq: 180, filterEnd: 2400, q: 2 });
  noise(t + 0.1, 1.5, { vol: 0.18, filterFreq: 90, filterEnd: 500, type: 'lowpass' });
});

// Short major chord arpeggio + top sparkle.
export const sfxFanfare = guard(() => {
  const t = now();
  const seq = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5, 1318.5];
  seq.forEach((f, i) => tone(f, t + i * 0.12, 0.3, { type: 'triangle', vol: 0.16 }));
  tone(2093, t + seq.length * 0.12, 0.5, { vol: 0.08 });
});

// Per-particle high tick, mixed quietly.
export const sfxSparkle = guard(() => {
  const t = now();
  tone(2400 + Math.random() * 1600, t, 0.06, { vol: 0.025 });
});

// Soft UI tap.
export const sfxTap = guard(() => {
  tone(880, now(), 0.08, { type: 'triangle', vol: 0.08 });
});

// ---------------------------------------------------------------------------
// Garden Maths extras
// ---------------------------------------------------------------------------

// Dice roll: short rattling noise bursts.
export const sfxRattle = guard(() => {
  const t = now();
  for (let i = 0; i < 6; i++) {
    noise(t + i * 0.07, 0.05, { vol: 0.16, filterFreq: 1800 + Math.random() * 1200, q: 3 });
  }
});

// Pest attack: ominous low alarm tone.
export const sfxAlarm = guard((severe = false) => {
  const t = now();
  tone(110, t, 0.5, { type: 'sawtooth', vol: severe ? 0.16 : 0.1, endFreq: 78 });
  tone(55, t + 0.1, 0.6, { type: 'sine', vol: severe ? 0.2 : 0.12 });
  if (severe) tone(110, t + 0.55, 0.5, { type: 'sawtooth', vol: 0.14, endFreq: 70 });
});

// Pest cleared: sharp high pop.
export const sfxPop = guard(() => {
  const t = now();
  tone(900, t, 0.07, { type: 'square', vol: 0.12, endFreq: 1600 });
  noise(t, 0.04, { vol: 0.14, filterFreq: 3200, q: 2 });
});

// Butterfly swarm: gentle high shimmer.
export const sfxShimmer = guard(() => {
  const t = now();
  [1568, 1760, 2093, 2349, 2637].forEach((f, i) => {
    tone(f, t + i * 0.12, 0.4, { vol: 0.05 });
  });
});

// Growth: short ascending scale.
export const sfxGrow = guard(() => {
  const t = now();
  [392, 440, 494, 523.25, 587.33].forEach((f, i) => tone(f, t + i * 0.08, 0.18, { type: 'triangle', vol: 0.14 }));
});
