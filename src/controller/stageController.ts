/* eslint-disable max-len */
import {
  MapData, mapData1, mapData2, mapData3,
} from '../data/mapData';

import { settings } from '../settings';

const stageData = {
  current: 0 as number,
  maps: [
    mapData1,
    mapData2,
    mapData3,
  ] as MapData[],
};

export const moveNextMap = () => {
  // 次のマップに移動
  if (stageData.current < stageData.maps.length - 1) {
    stageData.current += 1;
  } else {
    settings.mode = 'result';
    settings.end = performance.now();
  }
};

export const getCurrentMap = () => stageData.maps[stageData.current];

export const stageReset = () => {
  stageData.current = 0;
  for (let i = 0; i < stageData.maps.length; i += 1) {
    stageData.maps[i].exist = [true, true, true, true];
  }
};
