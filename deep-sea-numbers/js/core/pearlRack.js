// The treasure chest with its 10-slot pearl rack, shared by the intro and
// question scenes. Each correct answer sends a pearl arcing into the next
// empty slot; when all ten are collected the chest sparkles shut.

import { textureFor } from './assets.js';
import { tween, Ease } from './tween.js';
import { sfxClunk } from './audio.js';

export const SLOT_COUNT = 10;

export function makePearlRack(totalWidth = 920) {
  const c = new PIXI.Container();

  const chestSize = 140;
  const rackW = totalWidth - chestSize - 10;
  const slotH = 66;

  // Rack chassis (a piece of sunken driftwood shelving)
  const rack = new PIXI.Graphics()
    .roundRect(-totalWidth / 2, -slotH / 2 - 6, rackW + 16, slotH + 12, 16)
    .fill(0x0a3a66)
    .roundRect(-totalWidth / 2, -slotH / 2 - 6, rackW + 16, slotH + 12, 16)
    .stroke({ width: 4, color: 0x3d8fc9 });
  c.addChild(rack);

  const slotW = rackW / SLOT_COUNT;
  const slots = [];
  const slotsLayer = new PIXI.Container();
  for (let i = 0; i < SLOT_COUNT; i++) {
    const sx = -totalWidth / 2 + 12 + i * slotW + (slotW - 12) / 2;
    const slot = new PIXI.Graphics()
      .circle(0, 0, (slotH - 24) / 2)
      .fill(0x072947)
      .circle(0, 0, (slotH - 24) / 2)
      .stroke({ width: 3, color: 0x2a6a9e });
    slot.x = sx;
    slotsLayer.addChild(slot);
    slots.push(slot);
  }
  c.addChild(slotsLayer);

  // Chest at the right end
  const chest = new PIXI.Sprite(textureFor('chest'));
  chest.anchor.set(0.5);
  chest.width = chest.height = chestSize;
  chest.x = totalWidth / 2 - chestSize / 2 + 20;
  chest.y = -4;
  c.addChild(chest);
  c.chest = chest;

  let pearls = 0;
  c.pearlCount = () => pearls;
  c.slotGlobalPos = (i) => slots[i].getGlobalPosition();

  c.placePearl = (i) => {
    const pearl = new PIXI.Sprite(textureFor('obj_pearl'));
    pearl.anchor.set(0.5);
    pearl.width = pearl.height = slotH - 22;
    pearl.x = slots[i].x;
    pearl.y = 0;
    slotsLayer.addChild(pearl);
    pearls++;
    return pearl;
  };

  /** Animate a pearl arcing from a global position into slot i. */
  c.loadPearl = async (i, fromGlobal, effectsLayer) => {
    const pearl = new PIXI.Sprite(textureFor('obj_pearl'));
    pearl.anchor.set(0.5);
    const startSize = 100;
    pearl.width = pearl.height = startSize;
    const start = effectsLayer.toLocal(fromGlobal);
    const end = effectsLayer.toLocal(c.slotGlobalPos(i));
    pearl.x = start.x;
    pearl.y = start.y;
    effectsLayer.addChild(pearl);

    const arcH = 170;
    const state = { t: 0 };
    await tween(state, { t: 1 }, 600, {
      ease: Ease.inOutQuad,
      onUpdate: () => {
        const t = state.t;
        pearl.x = start.x + (end.x - start.x) * t;
        pearl.y = start.y + (end.y - start.y) * t - Math.sin(t * Math.PI) * arcH;
        const sc = (startSize - (startSize - 44) * t) / pearl.texture.width;
        pearl.scale.set(sc);
      },
    });
    effectsLayer.removeChild(pearl);
    pearl.destroy();
    const placed = c.placePearl(i);
    sfxClunk();
    placed.scale.y *= 0.6;
    const target = placed.scale.x;
    await tween(placed.scale, { y: target }, 220, { ease: Ease.outBack });
  };

  /** Excited chest wiggle when all ten pearls are collected. */
  c.celebrate = async () => {
    for (const r of [-0.12, 0.12, -0.08, 0.08, 0]) {
      await tween(chest, { rotation: r }, 70);
    }
    await tween(chest.scale, { x: chest.scale.x * 1.15, y: chest.scale.y * 1.15 }, 200, { ease: Ease.outBack });
    await tween(chest.scale, { x: chest.scale.x / 1.15, y: chest.scale.y / 1.15 }, 200);
  };

  return c;
}
