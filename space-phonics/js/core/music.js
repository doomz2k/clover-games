// Generative looping soundtrack - pure Web Audio, no asset files.
// A lookahead scheduler lays down slow pad chords, a gently wandering
// pentatonic melody and occasional themed ambient events. Space Phonics
// gets a drifting minor-pentatonic space lullaby with starlight shimmers.

import { audioCtx, isMuted, onMuteChange } from './audio.js';

export const SONG = {
  volume: 0.9,
  filter: 1800,
  tempo: 56,
  beatsPerChord: 8,
  padWave: 'sine',
  padLevel: 0.042,
  // Am - F - C - G, low and slow
  chords: [
    [110.0, 130.81, 164.81],
    [87.31, 130.81, 174.61],
    [130.81, 164.81, 196.0],
    [98.0, 123.47, 146.83],
  ],
  pluckWave: 'sine',
  pluckLevel: 0.055,
  pluckDecay: 1.4,
  pluckChance: 0.14,
  scale: [440.0, 523.25, 587.33, 659.25, 783.99, 880.0], // A minor pentatonic
  ambientChance: 0.025,
  // starlight shimmer: a slow rising sweep, very quiet
  ambient(ctx, out, t) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(1200, t);
    o.frequency.exponentialRampToValueAtTime(2600, t + 2.5);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.015, t + 0.8);
    g.gain.linearRampToValueAtTime(0.0001, t + 2.5);
    o.connect(g).connect(out);
    o.start(t);
    o.stop(t + 2.6);
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
