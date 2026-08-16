import { GhostData } from '../data/ghostData';
import { MapData } from '../data/mapData';
import { PlayerData } from '../data/playerData';
import { ghostType } from '../type/ghostType';

export const checkCollisionWall = (gx: number, gy: number, mapData: MapData) => {
  const { width, height } = mapData;
  if (gx < 0 || gx >= width || gy < 0 || gy >= height) return false;
  return mapData.data[gy * width + gx] !== '#';
};
// ある方向に一マス移動する
export const ghostMover = (
  tekito: GhostData,
  mapData: MapData,
  playerData: PlayerData,
) => {
  const gnow = Date.now() / 1000;

  if (gnow - tekito.gstart < tekito.ginterval) {
    tekito.gx = (tekito.gtargetX - tekito.gpreX)
    * ((gnow - tekito.gstart) / tekito.ginterval) + tekito.gpreX;
    tekito.gy = (tekito.gtargetY - tekito.gpreY)
    * ((gnow - tekito.gstart) / tekito.ginterval) + tekito.gpreY;
  } else {
    ghostType(tekito, playerData, mapData);
    tekito.gstart = gnow;
    tekito.gpreX = tekito.gtargetX;
    tekito.gpreY = tekito.gtargetY;
    switch (tekito.gdirect) {
      case 'gUp':
        tekito.gtargetX = tekito.gpreX;
        tekito.gtargetY = tekito.gpreY - 1;
        break;
      case 'gDown':
        tekito.gtargetX = tekito.gpreX;
        tekito.gtargetY = tekito.gpreY + 1;
        break;
      case 'gLeft':
        tekito.gtargetX = tekito.gpreX - 1;
        tekito.gtargetY = tekito.gpreY;
        break;
      case 'gRight':
        tekito.gtargetX = tekito.gpreX + 1;
        tekito.gtargetY = tekito.gpreY;
        break;
      default:
        throw new Error('ghostDirectionErrorです');
    }
    if (!checkCollisionWall(tekito.gtargetX, tekito.gtargetY, mapData)) {
      tekito.gtargetX = tekito.gpreX;
      tekito.gtargetY = tekito.gpreY;
    }
  }
};
