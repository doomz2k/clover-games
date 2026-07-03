// Web Speech wrapper: en-GB female voice preferred, sequential queueing,
// graceful no-op when speech synthesis is unavailable (the game stays fully
// playable without narration).

const PREFERRED = [
  'Google UK English Female',
  'Microsoft Hazel - English (United Kingdom)',
  'Microsoft Hazel',
];

let chosenVoice = null;
let queue = [];
let speaking = false;

function pickVoice() {
  if (!('speechSynthesis' in window)) return;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return;
  chosenVoice =
    voices.find((v) => PREFERRED.includes(v.name)) ||
    voices.find((v) => v.lang === 'en-GB' && /female|woman/i.test(v.name)) ||
    voices.find((v) => v.lang === 'en-GB') ||
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
  const { text, resolve } = queue.shift();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-GB';
  if (chosenVoice) u.voice = chosenVoice;
  u.rate = 0.92;
  u.pitch = 1.1;
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
 * Queue a line of narration. Returns a promise that resolves when the line
 * has been spoken (immediately if speech is unavailable).
 * opts.interrupt cancels anything queued or currently speaking first.
 */
export function say(text, opts = {}) {
  if (!('speechSynthesis' in window)) return Promise.resolve();
  if (opts.interrupt) stopSpeech();
  return new Promise((resolve) => {
    queue.push({ text, resolve });
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
