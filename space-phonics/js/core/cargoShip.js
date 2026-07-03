// The delivery ship with its 10-bay cargo rack, shared by the intro and
// question scenes. The ship hauls a long rack of sockets; crates are loaded
// into the sockets one per correct answer.

import { textureFor } from './assets.js';
import { tween, Ease } from './tween.js';
import { sfxClunk } from './audio.js';

export const BAY_COUNT = 10;

export function makeCargoShip(totalWidth = 920) {
  const c = new PIXI.Container();

  const shipSize = 150;
  const rackW = totalWidth - shipSize - 10;
  const bayW = rackW / BAY_COUNT;
  const bayH = 66;

  // Rack chassis
  const rack = new PIXI.Graphics()
    .roundRect(-totalWidth / 2, -bayH / 2 - 6, rackW + 16, bayH + 12, 16)
    .fill(0x22225e)
    .roundRect(-totalWidth / 2, -bayH / 2 - 6, rackW + 16, bayH + 12, 16)
    .stroke({ width: 4, color: 0x5e5ecf });
  c.addChild(rack);

  // Bays
  const bays = [];
  const baysLayer = new PIXI.Container();
  for (let i = 0; i < BAY_COUNT; i++) {
    const bx = -totalWidth / 2 + 12 + i * bayW + (bayW - 12) / 2;
    const bay = new PIXI.Graphics()
      .roundRect(-(bayW - 16) / 2, -(bayH - 14) / 2, bayW - 16, bayH - 14, 10)
      .fill(0x10103a)
      .roundRect(-(bayW - 16) / 2, -(bayH - 14) / 2, bayW - 16, bayH - 14, 10)
      .stroke({ width: 3, color: 0x3d3d8f });
    bay.x = bx;
    baysLayer.addChild(bay);
    bays.push(bay);
  }
  c.addChild(baysLayer);

  // Ship pulling the rack (nose pointing right)
  const ship = new PIXI.Sprite(textureFor('ship_body'));
  ship.anchor.set(0.5);
  ship.width = shipSize;
  ship.height = shipSize;
  ship.x = totalWidth / 2 - shipSize / 2 + 20;
  ship.y = 0;

  const flame = new PIXI.Sprite(textureFor('ship_flame'));
  flame.anchor.set(1, 0.5); // right edge (nozzle end) anchored at the ship's tail
  flame.width = 110;
  flame.height = 60;
  flame.x = ship.x - shipSize / 2 + 26;
  flame.y = 0;
  flame.visible = false;
  c.addChild(flame, ship);
  c.flame = flame;
  c.ship = ship;

  let crates = 0;
  c.crateCount = () => crates;

  /** Global position of bay i (for aiming the crate-arc animation). */
  c.bayGlobalPos = (i) => bays[i].getGlobalPosition();

  /** Instantly place a crate in bay i (used when restoring mid-session UI). */
  c.placeCrate = (i) => {
    const crate = new PIXI.Sprite(textureFor('crate'));
    crate.anchor.set(0.5);
    crate.width = bayH - 22;
    crate.height = bayH - 22;
    crate.x = bays[i].x;
    crate.y = 0;
    baysLayer.addChild(crate);
    crates++;
    return crate;
  };

  /**
   * Animate a crate flying in an arc from a global position into bay i.
   * `effectsLayer` must be a container above the scene (particle layer works).
   */
  c.loadCrate = async (i, fromGlobal, effectsLayer) => {
    const crate = new PIXI.Sprite(textureFor('crate'));
    crate.anchor.set(0.5);
    const startSize = 110;
    crate.width = startSize;
    crate.height = startSize;
    const start = effectsLayer.toLocal(fromGlobal);
    const end = effectsLayer.toLocal(c.bayGlobalPos(i));
    crate.x = start.x;
    crate.y = start.y;
    effectsLayer.addChild(crate);

    const arcH = 180;
    const state = { t: 0 };
    await tween(state, { t: 1 }, 620, {
      ease: Ease.inOutQuad,
      onUpdate: () => {
        const t = state.t;
        crate.x = start.x + (end.x - start.x) * t;
        crate.y = start.y + (end.y - start.y) * t - Math.sin(t * Math.PI) * arcH;
        crate.rotation = t * Math.PI * 2;
        const sc = (startSize - (startSize - 44) * t) / crate.texture.width;
        crate.scale.set(sc);
      },
    });
    effectsLayer.removeChild(crate);
    crate.destroy();
    const placed = c.placeCrate(i);
    sfxClunk();
    // squash-and-settle
    placed.scale.y *= 0.6;
    const target = placed.scale.x;
    await tween(placed.scale, { y: target }, 220, { ease: Ease.outBack });
  };

  /** Excited shake + flame ignition when all 10 crates are aboard. */
  c.igniteAndShake = async () => {
    flame.visible = true;
    flame.alpha = 0;
    tween(flame, { alpha: 1 }, 150);
    const x0 = c.x, y0 = c.y;
    for (let k = 0; k < 8; k++) {
      c.x = x0 + (Math.random() - 0.5) * 10;
      c.y = y0 + (Math.random() - 0.5) * 8;
      await tween({ t: 0 }, { t: 1 }, 45);
    }
    c.x = x0; c.y = y0;
  };

  /** Flame flicker - call from the scene's update while the flame shows. */
  const flameBaseW = flame.width;
  c.tick = () => {
    if (flame.visible) {
      flame.width = flameBaseW * (0.8 + Math.random() * 0.35);
      flame.alpha = 0.75 + Math.random() * 0.25;
    }
  };

  return c;
}
