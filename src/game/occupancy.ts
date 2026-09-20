import { BlockData } from "../data/blockData";
import { MapData } from "../data/mapData";
import { isWalkable } from "./map";

export type BlockOccupancy = readonly BlockData[] | Set<string>;

const blockPositionKey = (x: number, y: number) => `${x},${y}`;

export const createBlockPositionSet = (blocks: BlockOccupancy): Set<string> => {
  if (blocks instanceof Set) return blocks;
  const positions = new Set<string>();
  blocks.forEach((block) => {
    positions.add(blockPositionKey(block.x, block.y));
    if (block.movement) {
      positions.add(
        blockPositionKey(block.movement.fromX, block.movement.fromY),
      );
    }
  });
  return positions;
};

export const hasBlockAt = (blocks: BlockOccupancy, x: number, y: number) =>
  blocks instanceof Set
    ? blocks.has(blockPositionKey(x, y))
    : blocks.some(
        (block) =>
          (block.x === x && block.y === y) ||
          (block.movement?.fromX === x && block.movement.fromY === y),
      );

export const isTerrainWalkable = isWalkable;

export const isOpenCell = (
  map: MapData,
  blocks: BlockOccupancy,
  x: number,
  y: number,
) => isTerrainWalkable(map, x, y) && !hasBlockAt(blocks, x, y);
