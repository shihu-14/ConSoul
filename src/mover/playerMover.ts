/* eslint-disable max-len */
import { MapData } from '../data/mapData';
import { PlayerData } from '../data/playerData';
import { GhostData } from '../data/ghostData';
import { settings } from '../settings';
import { moveNextMap } from '../controller/stageController';

// プレイヤーがアイテムを所持していない状態でアイテムをゲットしたとき
// プレイヤーの次の位置を取得する
const getItemFromMap = (player: PlayerData, map: MapData) => {
  for (let i = 0; i < map.items.length; i += 1) {
    if (player.preX === map.items[i][0] && player.preY === map.items[i][1] && player.have === 0 && map.exist[i]) {
      map.exist[i] = false;
      return i;
    }
  }
  return -1;
};

// プレイヤーが納品した時の処理を書く
const checkNouhin = (player: PlayerData, map: MapData) => (player.preX === map.post[0] && player.preY === map.post[1]);

// プレイヤーが幽霊とぶつかったとき（とりあえず幽霊を1体しかいないとする。）
const playerMeetsGhost = (player: PlayerData, ghost: GhostData) => (
  player.x < ghost.gx + 1 && ghost.gx < player.x + 1 && player.y < ghost.gy + 1 && ghost.gy < player.y + 1
);

export const playerMover = (playerData: PlayerData, mapData: MapData, ghostDatas: GhostData[]) => {
  // noting to do
  const checkCollisionWall = (x:number, y:number) => {
    const { width } = mapData;
    return mapData.data[y * width + x] !== '#';
  };

  const now = performance.now() / 1000;
  let interval = 0.1;

  // プレイヤーの種類によってスピードを変える。
  switch (playerData.shurui) {
    case 'student':
      interval = 0.5;
      break;
    case 'monk':
      interval = 0.7;
      break;
    case 'exorcist':
      interval = 0.6;
      break;
    default:
      break;
  }
  if (playerData.targetX === playerData.preX && playerData.targetY === playerData.preY) {
    interval = 0;
  }
  // now - start < intervalのとき
  if (now - playerData.start < interval) {
    playerData.x = (playerData.targetX - playerData.preX) * ((now - playerData.start) / interval) + playerData.preX;
    playerData.y = (playerData.targetY - playerData.preY) * ((now - playerData.start) / interval) + playerData.preY;
  } else {
    playerData.start = now;
    playerData.preX = playerData.targetX;
    playerData.x = playerData.preX;
    playerData.preY = playerData.targetY;
    playerData.y = playerData.preY;
    playerData.forward = playerData.direction === 'None' ? playerData.forward : playerData.direction;
    switch (playerData.direction) {
      case 'ArrowUp':
        playerData.targetX = playerData.preX;
        playerData.targetY = playerData.preY - 1;
        break;
      case 'ArrowDown':
        playerData.targetX = playerData.preX;
        playerData.targetY = playerData.preY + 1;
        break;
      case 'ArrowLeft':
        playerData.targetX = playerData.preX - 1;
        playerData.targetY = playerData.preY;
        break;
      case 'ArrowRight':
        playerData.targetX = playerData.preX + 1;
        playerData.targetY = playerData.preY;
        break;
      default:
        break;
    }
    if (!checkCollisionWall(playerData.targetX, playerData.targetY)) {
      playerData.targetX = playerData.preX;
      playerData.targetY = playerData.preY;
    }
    // アイテム取得時
    if (getItemFromMap(playerData, mapData) !== -1 && playerData.have === 0) {
      playerData.have = 1;
    }

    // プレイヤーが納品したとき
    if (checkNouhin(playerData, mapData)) {
      playerData.nouhin += playerData.have;
      playerData.have = 0;
    }

    // プレイヤーが全て納品したとき、moveNextMapする。
    if (playerData.nouhin === mapData.items.length) {
      playerData.nouhin = 0;
      moveNextMap();
    }
  }

  // プレイヤーが幽霊とぶつかったとき、リザルト画面に飛ぶ
  for (let i = 0; i < ghostDatas.length; i += 1) {
    if (playerMeetsGhost(playerData, ghostDatas[i])) {
      settings.mode = 'result2';
    }
  }
};
