import { PlayerData } from '../data/playerData';
import { GhostData } from '../data/ghostData';
import { stageReset } from '../controller/stageController';
import { settings } from '../settings';

export const resetActorPositions = (playerData: PlayerData, ghostDatas: GhostData[]) => {
  const playerNow = performance.now() / 1000;
  const ghostNow = Date.now() / 1000;

  playerData.x = 10;
  playerData.y = 10;
  playerData.targetX = 10;
  playerData.targetY = 10;
  playerData.preX = 10;
  playerData.preY = 10;
  playerData.start = playerNow;
  playerData.direction = 'None';
  playerData.have = 0;

  for (let i = 0; i < ghostDatas.length; i += 1) {
    ghostDatas[i].gx = 5;
    ghostDatas[i].gy = 5;
    ghostDatas[i].gtargetX = 5;
    ghostDatas[i].gtargetY = 5;
    ghostDatas[i].gpreX = 5;
    ghostDatas[i].gpreY = 5;
    ghostDatas[i].gstart = ghostNow;
    ghostDatas[i].gdirect = 'gNone';
  }
};

export const gameInitializer = (playerData: PlayerData, ghostDatas: GhostData[]) => {
  resetActorPositions(playerData, ghostDatas);
  playerData.nouhin = 0;

  stageReset();
  settings.start = performance.now();
};
