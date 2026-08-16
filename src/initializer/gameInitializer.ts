import { PlayerData } from '../data/playerData';
import { GhostData } from '../data/ghostData';
import { stageReset } from '../controller/stageController';
import { settings } from '../settings';

export const gameInitializer = (playerData :PlayerData, ghostDatas:GhostData[]) => {
  playerData.x = 10;
  playerData.y = 10;
  playerData.targetX = 10;
  playerData.targetY = 10;
  playerData.preX = 10;
  playerData.preY = 10;
  playerData.have = 0;
  playerData.nouhin = 0;

  for (let i = 0; i < ghostDatas.length; i += 1) {
    ghostDatas[i].gx = 5;
    ghostDatas[i].gy = 5;
    ghostDatas[i].gtargetX = 5;
    ghostDatas[i].gtargetY = 5;
    ghostDatas[i].gpreX = 5;
    ghostDatas[i].gpreY = 5;
  }
  stageReset();
  settings.start = performance.now();
};
