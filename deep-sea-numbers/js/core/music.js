// Generative looping soundtrack - pure Web Audio, no asset files.
// A lookahead scheduler lays down slow pad chords, a gently wandering
// pentatonic melody and occasional themed ambient events. Deep Sea Numbers
// gets a watery marimba over soft pads, with bubble blips drifting past.

import { audioCtx, isMuted, onMuteChange } from './audio.js';

export const SONG = {
  volume: 0.9,
  filter: 2200,
  tempo: 76,
  beatsPerChord: 8,
  padWave: 'triangle',
  padLevel: 0.028,
  // C - Am - F - G, gentle and buoyant
  chords: [
    [130.81, 164.81, 196.0],
    [110.0, 130.81, 164.81],
    [87.31, 130.81, 174.61],
    [98.0, 146.83, 196.0],
  ],
  pluckWave: 'sine',
  pluckLevel: 0.075,
  pluckDecay: 0.5,
  pluckChance: 0.38,
  scale: [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33], // C major pentatonic
  ambientChance: 0.06,
  // bubble blips: two quick rising sines
  ambient(ctx, out, t) {
    for (let i = 0; i < 2; i++) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      const f0 = 380 + Math.random() * 240;
      o.frequency.setValueAtTime(f0, t + i * 0.14);
      o.frequency.exponentialRampToValueAtTime(f0 * 2.1, t + i * 0.14 + 0.1);
      g.gain.setValueAtTime(0.0001, t + i * 0.14);
      g.gain.linearRampToValueAtTime(0.028, t + i * 0.14 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.14 + 0.12);
      o.connect(g).connect(out);
      o.start(t + i * 0.14);
      o.stop(t + i * 0.14 + 0.15);
    }
  },
};

let started = false;

/** Start the soundtrack. Call after the AudioContext is unlocked. */
export function startMusic(song = SONG) {
  const ctx = audioCtx();
  if (!ctx || started) return;
  started = true;

  const master = ctx.createGain();
  master.gain.value = isMuted() ? 0 : song.volume;
  onMuteChange((m) => {
    master.gain.setTargetAtTime(m ? 0 : song.volume, ctx.currentTime, 0.15);
  });
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = song.filter;
  lp.connect(master);
  master.connect(ctx.destination);

  const beat = 60 / song.tempo;
  let nextBeat = ctx.currentTime + 0.15;
  let beatIndex = 0;
  let melodyIdx = Math.floor(song.scale.length / 2);

  function padChord(freqs, t, dur) {
    for (const f of freqs) {
      for (const det of [-5, 4]) {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = song.padWave;
        o.frequency.value = f;
        o.detune.value = det;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(song.padLevel, t + dur * 0.3);
        g.gain.setValueAtTime(song.padLevel, t + dur * 0.7);
        g.gain.linearRampToValueAtTime(0.0001, t + dur);
        o.connect(g).connect(lp);
        o.start(t);
        o.stop(t + dur + 0.05);
      }
    }
  }

  function pluck(freq, t) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = song.pluckWave;
    o.frequency.value = freq;
    g.gain.setValueAtTime(song.pluckLevel, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + song.pluckDecay);
    o.connect(g).connect(lp);
    o.start(t);
    o.stop(t + song.pluckDecay + 0.05);
  }

  function tick() {
    if (ctx.state !== 'running') return; // resumes seamlessly when unlocked
    const horizon = ctx.currentTime + 0.7;
    while (nextBeat < horizon) {
      const t = nextBeat;
      if (beatIndex % song.beatsPerChord === 0) {
        const chord = song.chords[(beatIndex / song.beatsPerChord) % song.chords.length];
        padChord(chord, t, song.beatsPerChord * beat + 0.5);
      }
      if (Math.random() < song.pluckChance) {
        const steps = [-2, -1, -1, 1, 1, 2];
        melodyIdx = Math.max(0, Math.min(song.scale.length - 1,
          melodyIdx + steps[Math.floor(Math.random() * steps.length)]));
        pluck(song.scale[melodyIdx], t + (Math.random() < 0.3 ? beat / 2 : 0));
      }
      if (song.ambient && Math.random() < song.ambientChance) {
        song.ambient(ctx, lp, t);
      }
      beatIndex++;
      nextBeat += beat;
    }
  }

  setInterval(tick, 250);
  tick();
}
