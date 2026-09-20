import { GhostData } from "../data/ghostData";
import { MapData, mapData1, mapData2, mapData3 } from "../data/mapData";
import { createGhostsForStage } from "../initializer/ghostInitializer";
import { settings } from "../settings";
import { BlockData } from "../data/blockData";
import { createInitialBlocks } from "../game/mapTemplate";
import { playerActionBalance } from "../config/gameBalance";

export interface StageTransitionState {
  readonly nextStageNumber: number;
  readonly startedAtSeconds: number;
  readonly endsAtSeconds: number;
}

const maps = [mapData1, mapData2, mapData3] as MapData[];
const createBlocksForStage = (stageIndex: number): BlockData[] =>
  createInitialBlocks(maps[stageIndex]);
const stageData = {
  current: 0,
  maps,
  ghosts: createGhostsForStage(0, performance.now() / 1000),
  blocks: createBlocksForStage(0),
};
let stageTransition: StageTransitionState | null = null;

export const moveNextMap = (nowSeconds = performance.now() / 1000) => {
  stageTransition = null;
  if (stageData.current < stageData.maps.length - 1) {
    stageData.current += 1;
    stageData.ghosts = createGhostsForStage(stageData.current, nowSeconds);
    stageData.blocks = createBlocksForStage(stageData.current);
  } else {
    settings.mode = "result";
    settings.end = performance.now();
  }
};

export const beginStageTransition = (nowSeconds = performance.now() / 1000) => {
  if (stageData.current >= stageData.maps.length - 1) {
    moveNextMap(nowSeconds);
    return false;
  }
  stageTransition = {
    nextStageNumber: stageData.current + 2,
    startedAtSeconds: nowSeconds,
    endsAtSeconds:
      nowSeconds + playerActionBalance.stageTransitionDurationSeconds,
  };
  settings.mode = "stageTransition";
  return true;
};

export const getStageTransition = () => stageTransition;

export const completeStageTransition = (
  nowSeconds = performance.now() / 1000,
) => {
  if (!stageTransition || nowSeconds < stageTransition.endsAtSeconds) {
    return false;
  }
  moveNextMap(nowSeconds);
  settings.mode = "game";
  return true;
};

export const getCurrentMap = () => stageData.maps[stageData.current];

export const getCurrentGhosts = (): GhostData[] => stageData.ghosts;
export const getCurrentBlocks = (): BlockData[] => stageData.blocks;

export const resetCurrentStage = (nowSeconds = performance.now() / 1000) => {
  stageTransition = null;
  stageData.ghosts = createGhostsForStage(stageData.current, nowSeconds);
  stageData.blocks = createBlocksForStage(stageData.current);
  const currentMap = getCurrentMap();
  currentMap.exist = currentMap.items.map(() => true);
};

export const stageReset = (nowSeconds = performance.now() / 1000) => {
  stageTransition = null;
  stageData.current = 0;
  stageData.ghosts = createGhostsForStage(0, nowSeconds);
  stageData.blocks = createBlocksForStage(0);
  stageData.maps.forEach((map) => {
    map.exist = map.items.map(() => true);
  });
};
