import { BlockData } from "../data/blockData";
import { GhostData } from "../data/ghostData";
import { MapData } from "../data/mapData";
import { CardinalPlayerDirection, PlayerData } from "../data/playerData";
import { getPlayerDirectionDelta } from "./playerAction";
import { hasBlockAt, isTerrainWalkable } from "./occupancy";

export interface BlockMoveContext {
  readonly map: MapData;
  readonly blocks: BlockData[];
  readonly player: PlayerData;
  readonly ghosts: readonly GhostData[];
}

export const canBlockOccupyCell = (
  context: BlockMoveContext,
  x: number,
  y: number,
) => {
  if (!isTerrainWalkable(context.map, x, y)) return false;
  if (hasBlockAt(context.blocks, x, y)) return false;
  if (context.map.post[0] === x && context.map.post[1] === y) return false;
  if (
    context.map.items.some(
      ([itemX, itemY], index) =>
        context.map.exist[index] && itemX === x && itemY === y,
    )
  ) {
    return false;
  }
  return !context.ghosts.some(
    (ghost) =>
      (ghost.gpreX === x && ghost.gpreY === y) ||
      (ghost.gtargetX === x && ghost.gtargetY === y),
  );
};

export type PushResult =
  | { readonly kind: "noBlock" }
  | { readonly kind: "blocked" }
  | { readonly kind: "pushed"; readonly movedBlockCount: number };

export const tryPushBlockChain = (
  context: BlockMoveContext,
  direction: CardinalPlayerDirection,
): PushResult => {
  const [dx, dy] = getPlayerDirectionDelta(direction);
  let x = context.player.preX + dx;
  let y = context.player.preY + dy;
  const chain: BlockData[] = [];
  const blocksByPosition = new Map(
    context.blocks.map((block) => [`${block.x},${block.y}`, block]),
  );

  let block = blocksByPosition.get(`${x},${y}`);
  while (block) {
    chain.push(block);
    x += dx;
    y += dy;
    block = blocksByPosition.get(`${x},${y}`);
  }

  if (chain.length === 0) return { kind: "noBlock" };
  if (!canBlockOccupyCell(context, x, y)) return { kind: "blocked" };

  for (let index = chain.length - 1; index >= 0; index -= 1) {
    chain[index].x += dx;
    chain[index].y += dy;
  }
  return { kind: "pushed", movedBlockCount: chain.length };
};

export type PullResult =
  | { readonly kind: "noBlock" }
  | { readonly kind: "blocked" }
  | { readonly kind: "pulled" };

export const tryPullBlock = (
  context: BlockMoveContext,
  blockDirection: CardinalPlayerDirection,
  retreatDirection: CardinalPlayerDirection,
): PullResult => {
  const [blockDx, blockDy] = getPlayerDirectionDelta(blockDirection);
  const [retreatDx, retreatDy] = getPlayerDirectionDelta(retreatDirection);
  if (blockDx + retreatDx !== 0 || blockDy + retreatDy !== 0) {
    return { kind: "blocked" };
  }

  const block = context.blocks.find(
    ({ x, y }) =>
      x === context.player.preX + blockDx &&
      y === context.player.preY + blockDy,
  );
  if (!block) return { kind: "noBlock" };

  const retreatX = context.player.preX + retreatDx;
  const retreatY = context.player.preY + retreatDy;
  const retreatIsBlocked =
    !isTerrainWalkable(context.map, retreatX, retreatY) ||
    hasBlockAt(context.blocks, retreatX, retreatY) ||
    context.ghosts.some(
      (ghost) =>
        (ghost.gpreX === retreatX && ghost.gpreY === retreatY) ||
        (ghost.gtargetX === retreatX && ghost.gtargetY === retreatY),
    );
  if (
    retreatIsBlocked ||
    !canBlockOccupyCell(context, context.player.preX, context.player.preY)
  ) {
    return { kind: "blocked" };
  }

  block.x = context.player.preX;
  block.y = context.player.preY;
  context.player.targetX = retreatX;
  context.player.targetY = retreatY;
  return { kind: "pulled" };
};
