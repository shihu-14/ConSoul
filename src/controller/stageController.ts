import { GhostData } from "../data/ghostData";
import { MapData, mapData1, mapData2, mapData3 } from "../data/mapData";
import { createGhostsForStage } from "../initializer/ghostInitializer";
import { settings } from "../settings";
import { BlockData } from "../data/blockData";

const maps = [mapData1, mapData2, mapData3] as MapData[];
const createBlocksForStage = (stageIndex: number): BlockData[] =>
  maps[stageIndex].initialBlockPositions.map(([x, y]) => ({ x, y }));
const stageData = {
  current: 0,
  maps,
  ghosts: createGhostsForStage(0, performance.now() / 1000),
  blocks: createBlocksForStage(0),
};

export const moveNextMap = (nowSeconds = performance.now() / 1000) => {
  if (stageData.current < stageData.maps.length - 1) {
    stageData.current += 1;
    stageData.ghosts = createGhostsForStage(stageData.current, nowSeconds);
    stageData.blocks = createBlocksForStage(stageData.current);
  } else {
    settings.mode = "result";
    settings.end = performance.now();
  }
};

export const getCurrentMap = () => stageData.maps[stageData.current];

export const getCurrentGhosts = (): GhostData[] => stageData.ghosts;
export const getCurrentBlocks = (): BlockData[] => stageData.blocks;

export const stageReset = (nowSeconds = performance.now() / 1000) => {
  stageData.current = 0;
  stageData.ghosts = createGhostsForStage(0, nowSeconds);
  stageData.blocks = createBlocksForStage(0);
  stageData.maps.forEach((map) => {
    map.exist = map.items.map(() => true);
  });
};
