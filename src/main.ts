import './style.css';
import { mapRender } from './renderer/mapRender';
import { playerRender } from './renderer/playerRender';
import { ghostRender } from './renderer/ghostRender';
import { settings } from './settings';

import { PlayerData } from './data/playerData';

import { playerMover } from './mover/playerMover';
import { playerInitializer } from './initializer/playerInitializer';
import { gameInitializer } from './initializer/gameInitializer';

import { getCurrentMap } from './controller/stageController';
import {
  titleRendering, resultRendering, result2Rrendering,
} from './renderer/screenRenderer';
import { titleKeydownEvent, resultKeydownEvent, result2KeydownEvent } from './initializer/screenInitializer';

import { GhostData } from './data/ghostData';
import { ghostMover } from './mover/ghostMover';
import { resizeField } from './renderer/resizeField';

const Hackathon = () => {
  const canvas = document.getElementById('cnv') as HTMLCanvasElement;
  if (!canvas) throw new Error('Canvas not found');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not found');
  ctx.imageSmoothingEnabled = false;

  const playerData:PlayerData = {
    x: 10,
    y: 10,
    direction: 'None',
    forward: 'ArrowRight',
    targetX: 10,
    targetY: 10,
    preX: 1,
    preY: 1,
    start: 0,
    have: 0,
    nouhin: 0,
    shurui: 'student',
  };

  const ghostData1: GhostData = { // ランダム挙動
    gtype: 'random',
    gx: 5,
    gy: 5, // ghostの初期位置
    gdirect: 'gNone',
    ginterval: 0.5, // ?秒で次のマスに移動するとする
    gtargetX: 5,
    gtargetY: 5,
    gpreX: 5,
    gpreY: 5,
    gstart: Date.now() / 1000,
  };
  const ghostData2: GhostData = { // Target挙動
    gtype: 'chase',
    gx: 5,
    gy: 5, // ghostの初期位置
    gdirect: 'gNone',
    ginterval: 0.5, // ?秒で次のマスに移動するとする
    gtargetX: 5,
    gtargetY: 5,
    gpreX: 5,
    gpreY: 5,
    gstart: Date.now() / 1000,
  };
  let preMode = 'title';

  playerInitializer(playerData);

  // keydownイベントが起こったときの画面遷移
  titleKeydownEvent(playerData);
  resultKeydownEvent();
  result2KeydownEvent();

  const tick = () => {
    requestAnimationFrame(tick);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const nowMap = getCurrentMap();

    switch (settings.mode) {
      case 'title': {
        // title rendering
        titleRendering(ctx);
        break;
      }
      case 'game':
        if (preMode === 'title') gameInitializer(playerData, [ghostData1, ghostData2]);

        ghostMover(ghostData1, nowMap, playerData); // ghostData1とか分けたい
        ghostMover(ghostData2, nowMap, playerData);
        playerMover(playerData, nowMap, [ghostData1, ghostData2]);
        resizeField(ctx, () => {
          mapRender(nowMap, ctx);
          playerRender(playerData, nowMap, ctx);
          ghostRender(ghostData1, nowMap, ctx);
          ghostRender(ghostData2, nowMap, ctx);
        });
        break;
      case 'result':
        // result rendering
        resultRendering(ctx);
        break;
      case 'result2':
        // 失敗時result rendering
        result2Rrendering(ctx);
        break;
      default:
        throw new Error('Unknown mode');
    }
    preMode = settings.mode;
  };

  tick();
};

Hackathon();
