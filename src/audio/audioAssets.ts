/**
 * BGMと効果音のViteアセットURLを登録する．
 */

import gameBgm from "../assets/audio/game-bgm.mp3";
import walk from "../assets/audio/walk.mp3";
import floorCreak from "../assets/audio/floor-creak.mp3";
import stonePush from "../assets/audio/stone-push.mp3";
import itemDeliver from "../assets/audio/item-deliver.mp3";
import chaseAlert from "../assets/audio/chase-alert.mp3";
import dash from "../assets/audio/dash.mp3";
import itemPickup from "../assets/audio/item-pickup.mp3";

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
