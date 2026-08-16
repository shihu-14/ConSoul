import { GhostData } from '../data/ghostData';
import { MapData } from '../data/mapData';
import { PlayerData } from '../data/playerData';
import { checkCollisionWall } from '../mover/ghostMover';

export interface AroundValue {
  left: number;
  right: number;
  up: number;
  down: number;
}
const aroundvalue: AroundValue = {
  left: Math.floor(Math.random() * (-1000)),
  right: Math.floor(Math.random() * (-1000)),
  up: Math.floor(Math.random() * (-1000)),
  down: Math.floor(Math.random() * (-1000)), // 負の値からランダムな初期距離を代入
};

const playerTypeRange = {
  student: 20 * 20,
  exorcist: 6 * 6,
  monk: 4 * 4,
};

export const ghostType = (
  tekito: GhostData,
  playerData: PlayerData,
  mapData: MapData,
) => { // 壁の向きにいかないよ
  const walldirect = (aroundvalue2: AroundValue, tekito2: GhostData, mapData2: MapData) => {
    if (!checkCollisionWall(tekito2.gtargetX, tekito2.gtargetY - 1, mapData2)) { // 上。壁にいったら距離を10000
      aroundvalue2.up = 10000;
    } if (!checkCollisionWall(tekito2.gtargetX, tekito2.gtargetY + 1, mapData2)) { // 下
      aroundvalue2.down = 10000;
    } if (!checkCollisionWall(tekito2.gtargetX - 1, tekito2.gtargetY, mapData2)) { // left
      aroundvalue2.left = 10000;
    } if (!checkCollisionWall(tekito2.gtargetX + 1, tekito2.gtargetY, mapData2)) { // right
      aroundvalue2.right = 10000;
    }
  };
  const backdirect = (aroundvalue3: AroundValue, tekito3: GhostData) => { // 来た道に戻らないように
    if (tekito3.gdirect === 'gUp') { // 今来たマスでの距離を9999にする
      aroundvalue3.down = 9999;
    } else if (tekito3.gdirect === 'gDown') {
      aroundvalue3.up = 9999;
    } else if (tekito3.gdirect === 'gLeft') {
      aroundvalue3.right = 9999;
    } else if (tekito3.gdirect === 'gRight') {
      aroundvalue3.left = 9999;
    }
  };
  const checkAroundValue = () => { // 座標をランダムにリセット
    aroundvalue.left = Math.floor(Math.random() * (-1000));
    aroundvalue.right = Math.floor(Math.random() * (-1000));
    aroundvalue.up = Math.floor(Math.random() * (-1000));
    aroundvalue.down = Math.floor(Math.random() * (-1000));// 負の値からランダムな初期距離を代入
  };
  const MinDirectJudge = (distance: AroundValue, ghostData: GhostData) => { // どれが最短か
    if (Math.min(distance.up, distance.down, distance.left, distance.right) === distance.up) {
      ghostData.gdirect = 'gUp';
    } else if (Math.min(
      distance.up,
      distance.down,
      distance.left,
      distance.right,
    ) === distance.down) {
      ghostData.gdirect = 'gDown';
    } else if (Math.min(
      distance.up,
      distance.down,
      distance.left,
      distance.right,
    ) === distance.left) {
      ghostData.gdirect = 'gLeft';
    } else if (Math.min(
      distance.up,
      distance.down,
      distance.left,
      distance.right,
    ) === distance.right) {
      ghostData.gdirect = 'gRight';
    }
  };

  const dx = tekito.gx - playerData.x;
  const dy = tekito.gy - playerData.y;
  const distance = dx * dx + dy * dy;
  let algorithm = tekito.gtype;
  if (distance > playerTypeRange[playerData.shurui]) {
    algorithm = 'random';
  }

  switch (algorithm) {
    case 'random': { // GhostDataがghostData1のとき
      checkAroundValue();
      // 距離の最小値を取ろう。距離は考えてないので追跡はしない
      walldirect(aroundvalue, tekito, mapData);
      backdirect(aroundvalue, tekito);
      MinDirectJudge(aroundvalue, tekito);
      break;
    }
    case 'chase': { // 距離での判定
      aroundvalue.up = dx ** 2 + (dy - 1) ** 2;
      aroundvalue.down = dx ** 2 + (dy + 1) ** 2;
      aroundvalue.left = (dx - 1) ** 2 + dy ** 2;
      aroundvalue.right = (dx + 1) ** 2 + dy ** 2;
      walldirect(aroundvalue, tekito, mapData);
      backdirect(aroundvalue, tekito);
      MinDirectJudge(aroundvalue, tekito);
      break;
    }
    default:
      throw new Error('Unknown GhostType');
  }
};
