import { BlockData } from "../data/blockData";
import { MapData } from "../data/mapData";

export const createInitialBlocks = (map: MapData): BlockData[] => {
  const blocks: BlockData[] = [];
  for (let index = 0; index < map.data.length; index += 1) {
    if (map.data[index] === "B") {
      blocks.push({ x: index % map.width, y: Math.floor(index / map.width) });
    }
  }
  return blocks;
};
