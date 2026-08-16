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

  const ghostData1: GhostData = {
    gtype: 'random',
    gx: 5,
    gy: 5,
    gdirect: 'gNone',
    ginterval: 0.5,
    gtargetX: 5,
    gtargetY: 5,
    gpreX: 5,
    gpreY: 5,
    gstart: Date.now() / 1000,
  };
  const ghostData2: GhostData = {
    gtype: 'chase',
    gx: 5,
    gy: 5,
    gdirect: 'gNone',
    ginterval: 0.5,
    gtargetX: 5,
    gtargetY: 5,
    gpreX: 5,
    gpreY: 5,
    gstart: Date.now() / 1000,
  };
  let preMode = 'title';

  playerInitializer(playerData);

  titleKeydownEvent(playerData);
  resultKeydownEvent();
  result2KeydownEvent();

  const tick = () => {
    requestAnimationFrame(tick);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    switch (settings.mode) {
      case 'title': {
        titleRendering(ctx);
        break;
      }
      case 'game': {
        if (preMode === 'title') gameInitializer(playerData, [ghostData1, ghostData2]);
        const nowMap = getCurrentMap();

        ghostMover(ghostData1, nowMap, playerData);
        ghostMover(ghostData2, nowMap, playerData);
        playerMover(playerData, nowMap, [ghostData1, ghostData2]);
        const renderMap = getCurrentMap();
        resizeField(ctx, () => {
          mapRender(renderMap, ctx);
          playerRender(playerData, renderMap, ctx);
          ghostRender(ghostData1, renderMap, ctx);
          ghostRender(ghostData2, renderMap, ctx);
        });
        break;
      }
      case 'result':
        resultRendering(ctx);
        break;
      case 'result2':
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
