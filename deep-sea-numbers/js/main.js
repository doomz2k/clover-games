// Deep Sea Numbers - entry point. Boots PixiJS, preloads the SVG textures
// behind the submarine loading bar, then hands over to the dive map.

import { preloadAll } from './core/assets.js';
import { initTweens } from './core/tween.js';
import { initParticles } from './core/particles.js';
import { initSpeech } from './core/speech.js';
import { unlock as unlockAudio } from './core/audio.js';
import { SceneManager } from './core/sceneManager.js';
import { MapScene } from './scenes/mapScene.js';

const loadBar = document.getElementById('load-bar');
const loadMsg = document.getElementById('load-msg');
const loadingEl = document.getElementById('loading');

function setProgress(p, msg) {
  loadBar.style.width = `${Math.round(p * 100)}%`;
  if (msg) loadMsg.textContent = msg;
}

async function boot() {
  // The CDN <script> may have failed over to the vendored copy, which loads
  // async - wait until the PIXI global exists either way.
  for (let i = 0; i < 200 && !window.PIXI; i++) {
    await new Promise((r) => setTimeout(r, 50));
  }
  if (!window.PIXI) throw new Error('PixiJS failed to load from CDN and vendor fallback');

  setProgress(0.05, 'Polishing the periscope…');
  try {
    await document.fonts.load('40px "Fredoka One"');
    await document.fonts.ready;
  } catch { /* fall back to system font */ }

  setProgress(0.1, 'Lowering the submarine…');
  const app = new PIXI.Application();
  await app.init({
    background: 0x06294e,
    resizeTo: window,
    antialias: true,
    resolution: Math.min(window.devicePixelRatio || 1, 2),
    autoDensity: true,
  });
  document.getElementById('game-canvas-holder').appendChild(app.canvas);

  setProgress(0.15, 'Counting the pearls…');
  await preloadAll((p) => setProgress(0.15 + p * 0.8, 'Counting the pearls…'));

  initTweens(app);
  initSpeech();
  window.addEventListener('pointerdown', unlockAudio, { once: true });

  const scenes = new SceneManager(app);
  initParticles(app, scenes.particleLayer);

  const game = { app, scenes };
  window.__game = game; // console/debug handle
  setProgress(1, 'Dive, dive, dive!');
  await scenes.switchTo(new MapScene(game));

  loadingEl.classList.add('done');
  setTimeout(() => loadingEl.remove(), 600);
}

boot().catch((err) => {
  console.error(err);
  loadMsg.textContent = 'Something went wrong starting the game. Please refresh!';
});
