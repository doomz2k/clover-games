// Asset manager: wraps every hand-drawn SVG in the shared chunky-outline
// style, converts it to a data URL and preloads it through PIXI.Assets so
// each drawing becomes a cached GPU texture before the game starts.

import { PICTURES_1 } from '../data/svgPictures1.js';
import { PICTURES_2 } from '../data/svgPictures2.js';
import { UI_SVGS } from '../data/svgUI.js';

const ALL_SVGS = { ...PICTURES_1, ...PICTURES_2, ...UI_SVGS };

// Rendered at 220px for a 100-unit viewBox: crisp at the ~180px the cards
// display at, without ballooning texture memory across ~80 assets.
const RASTER_SIZE = 220;

function wrap(body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${RASTER_SIZE}" height="${RASTER_SIZE}">` +
    `<g fill="none" stroke="#1e1e46" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`;
}

export function textureFor(key) {
  const tex = PIXI.Assets.get(key);
  if (!tex) throw new Error(`Texture not preloaded: ${key}`);
  return tex;
}

export function hasTexture(key) {
  return key in ALL_SVGS;
}

/** Preload every SVG texture. onProgress receives 0..1. */
export async function preloadAll(onProgress) {
  const keys = Object.keys(ALL_SVGS);
  for (const key of keys) {
    PIXI.Assets.add({
      alias: key,
      src: 'data:image/svg+xml;charset=utf8,' + encodeURIComponent(wrap(ALL_SVGS[key])),
    });
  }
  await PIXI.Assets.load(keys, onProgress);
}
