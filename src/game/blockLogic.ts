import { BlockData } from "../data/blockData";
import { GhostData } from "../data/ghostData";
import { MapData } from "../data/mapData";
import { CardinalPlayerDirection, PlayerData } from "../data/playerData";
import { getPlayerDirectionDelta } from "./playerAction";
import { hasBlockAt, isTerrainWalkable } from "./occupancy";

export interface BlockPushContext {
  readonly map: MapData;
  readonly blocks: BlockData[];
  readonly player: PlayerData;
  readonly ghosts: readonly GhostData[];
}

const getPushCells = (
  context: BlockPushContext,
  direction: CardinalPlayerDirection,
) => {
  const [dx, dy] = getPlayerDirectionDelta(direction);
  const blockX = context.player.preX + dx;
  const blockY = context.player.preY + dy;
  return {
    blockX,
    blockY,
    destinationX: blockX + dx,
    destinationY: blockY + dy,
  };
};

export const hasPushableBlock = (
  context: BlockPushContext,
  direction: CardinalPlayerDirection,
) => {
  const { blockX, blockY } = getPushCells(context, direction);
  return hasBlockAt(context.blocks, blockX, blockY);
};

export const canPushBlock = (
  context: BlockPushContext,
  direction: CardinalPlayerDirection,
) => {
  const { blockX, blockY, destinationX, destinationY } = getPushCells(
    context,
    direction,
  );
  if (!hasBlockAt(context.blocks, blockX, blockY)) return false;
  if (!isTerrainWalkable(context.map, destinationX, destinationY)) return false;
  if (hasBlockAt(context.blocks, destinationX, destinationY)) return false;
  if (
    context.map.post[0] === destinationX &&
    context.map.post[1] === destinationY
  ) {
    return false;
  }
  if (
    context.map.items.some(
      ([x, y], index) =>
        context.map.exist[index] && x === destinationX && y === destinationY,
    )
  ) {
    return false;
  }
  return !context.ghosts.some(
    (ghost) =>
      (ghost.gpreX === destinationX && ghost.gpreY === destinationY) ||
      (ghost.gtargetX === destinationX && ghost.gtargetY === destinationY),
  );
};

export type PushResult = "noBlock" | "blocked" | "pushed";

export const tryPushBlock = (
  context: BlockPushContext,
  direction: CardinalPlayerDirection,
): PushResult => {
  const { blockX, blockY, destinationX, destinationY } = getPushCells(
    context,
    direction,
  );
  const block = context.blocks.find(({ x, y }) => x === blockX && y === blockY);
  if (!block) return "noBlock";
  if (!canPushBlock(context, direction)) return "blocked";
  block.x = destinationX;
  block.y = destinationY;
  return "pushed";
};
