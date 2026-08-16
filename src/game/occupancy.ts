import { BlockData } from "../data/blockData";
import { MapData } from "../data/mapData";
import { isWalkable } from "./map";

export const hasBlockAt = (
  blocks: readonly BlockData[],
  x: number,
  y: number,
) => blocks.some((block) => block.x === x && block.y === y);

export const isTerrainWalkable = isWalkable;

export const isOpenCell = (
  map: MapData,
  blocks: readonly BlockData[],
  x: number,
  y: number,
) => isTerrainWalkable(map, x, y) && !hasBlockAt(blocks, x, y);
