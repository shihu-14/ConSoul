import { GhostData } from '../data/ghostData';
import { MapData } from '../data/mapData';
import { PlayerData } from '../data/playerData';
import { ghostType } from '../type/ghostType';

export const checkCollisionWall = (gx:number, gy:number, mapData: MapData) => {
  const { width } = mapData;
  return mapData.data[gy * width + gx] !== '#';
};
// ある方向に一マス移動する
export const ghostMover = (
  tekito: GhostData,
  mapData: MapData,
  playerData: PlayerData,
) => {
  const gnow = Date.now() / 1000;

  // 座標と動きもろもろ.ここはghostDataで123の区別はつかないのか.ghostDataにghostData1,2,3をいれたい

  if (gnow - tekito.gstart < tekito.ginterval) {
    tekito.gx = (tekito.gtargetX - tekito.gpreX)
    * ((gnow - tekito.gstart) / tekito.ginterval) + tekito.gpreX; // なめらか移動
    tekito.gy = (tekito.gtargetY - tekito.gpreY)
    * ((gnow - tekito.gstart) / tekito.ginterval) + tekito.gpreY;
  } else { // 到着したとき
    ghostType(tekito, playerData, mapData); // typeから方向決定
    tekito.gstart = gnow;
    tekito.gpreX = tekito.gtargetX;
    tekito.gpreY = tekito.gtargetY;
    switch (tekito.gdirect) {
      case 'gUp':
        tekito.gtargetX = tekito.gpreX;
        tekito.gtargetY = tekito.gpreY - 1; // →をx正,↓をy正として考えていることに注意
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
