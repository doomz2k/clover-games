// Asset manager: wraps the hand-drawn SVGs in the shared chunky-outline
// style and preloads them as textures (same approach as Space Phonics).

import { ALL_SVGS } from '../data/svgObjects.js';

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
