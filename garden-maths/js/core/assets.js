// Asset manager: wraps the SVG icons in the shared chunky-outline style and
// preloads them as textures. Plants, dice and bugs are drawn procedurally
// with Graphics, so the texture set here is small.

import { ICON_SVGS } from '../data/svgIcons.js';

const RASTER_SIZE = 200;

function wrap(body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${RASTER_SIZE}" height="${RASTER_SIZE}">` +
    `<g fill="none" stroke="#1e1e46" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`;
}

export function textureFor(key) {
  const tex = PIXI.Assets.get(key);
  if (!tex) throw new Error(`Texture not preloaded: ${key}`);
  return tex;
}

export async function preloadAll(onProgress) {
  const keys = Object.keys(ICON_SVGS);
  for (const key of keys) {
    PIXI.Assets.add({
      alias: key,
      src: 'data:image/svg+xml;charset=utf8,' + encodeURIComponent(wrap(ICON_SVGS[key])),
    });
  }
  await PIXI.Assets.load(keys, onProgress);
}
