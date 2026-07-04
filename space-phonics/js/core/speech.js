// Web Speech wrapper. Two voice profiles share one queue:
//   narrator - male en-GB, warm and unhurried (teaches the phonics)
//   alien    - same synth pushed high and quick, so the aliens sound
//              properly weird and otherworldly
// Gracefully no-ops when speech synthesis is unavailable.

const PREFERRED_MALE = [
  'Google UK English Male',
  'Microsoft Ryan - English (United Kingdom)',
  'Microsoft George - English (United Kingdom)',
  'Microsoft George',
  'Daniel (English (United Kingdom))',
  'Daniel',
];

const PROFILES = {
  narrator: { pitch: 1.05, rate: 0.9 },
  alien: { pitch: 1.85, rate: 1.15 },
};

let chosenVoice = null;
let queue = [];
let speaking = false;

function pickVoice() {
  if (!('speechSynthesis' in window)) return;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return;
  const gb = voices.filter((v) => v.lang === 'en-GB');
  chosenVoice =
    voices.find((v) => PREFERRED_MALE.includes(v.name)) ||
    gb.find((v) => /male|daniel|george|ryan|arthur|oliver|brian/i.test(v.name) && !/female/i.test(v.name)) ||
    gb.find((v) => !/female|hazel|susan|libby|sonia|woman/i.test(v.name)) ||
    gb[0] ||
    voices.find((v) => v.lang.startsWith('en')) ||
    voices[0];
}

export function initSpeech() {
  if (!('speechSynthesis' in window)) return;
  pickVoice();
  window.speechSynthesis.onvoiceschanged = pickVoice;
}

function pump() {
  if (speaking || !queue.length) return;
  const { text, profile, resolve } = queue.shift();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-GB';
  if (chosenVoice) u.voice = chosenVoice;
  const p = PROFILES[profile] || PROFILES.narrator;
  u.rate = p.rate;
  u.pitch = p.pitch;
  speaking = true;
  const done = () => { speaking = false; resolve(); pump(); };
  u.onend = done;
  u.onerror = done;
  try {
    window.speechSynthesis.speak(u);
  } catch {
    done();
  }
}

/**
 * Queue a line. opts.profile: 'narrator' (default) | 'alien'.
 * opts.interrupt cancels anything queued or currently speaking first.
 * Resolves when spoken (immediately if speech is unavailable).
 */
export function say(text, opts = {}) {
  if (!('speechSynthesis' in window)) return Promise.resolve();
  if (opts.interrupt) stopSpeech();
  return new Promise((resolve) => {
    queue.push({ text, profile: opts.profile || 'narrator', resolve });
    pump();
  });
}

export function stopSpeech() {
  if (!('speechSynthesis' in window)) return;
  queue.forEach((q) => q.resolve());
  queue = [];
  speaking = false;
  try { window.speechSynthesis.cancel(); } catch { /* some browsers throw pre-gesture */ }
}
