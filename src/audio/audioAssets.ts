/**
 * BGMと効果音のViteアセットURLを登録する．
 */

import gameBgm from "./assets/game-bgm.mp3";
import walk from "./assets/walk.mp3";
import floorCreak from "./assets/floor-creak.mp3";
import stonePush from "./assets/stone-push.mp3";
import itemDeliver from "./assets/item-deliver.mp3";
import chaseAlert from "./assets/chase-alert.mp3";
import dash from "./assets/dash.mp3";
import itemPickup from "./assets/item-pickup.mp3";

export const audioAssets = {
  gameBgm,
  sfx: {
    walk,
    floorCreak,
    stonePush,
    itemDeliver,
    chaseAlert,
    dash,
    itemPickup,
  },
} as const;

export type SfxId = keyof typeof audioAssets.sfx;
