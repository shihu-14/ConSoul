import { BlockData } from "../data/blockData";
import { GhostData } from "../data/ghostData";
import { MapData } from "../data/mapData";
import { CardinalPlayerDirection, PlayerData } from "../data/playerData";
import { getPlayerDirectionDelta } from "./playerAction";
import { hasBlockAt, isTerrainWalkable } from "./occupancy";
import { playerActionBalance } from "../config/gameBalance";

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
  nowSeconds = performance.now() / 1000,
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
    if (block.movement) return { kind: "blocked" };
    chain.push(block);
    x += dx;
    y += dy;
    block = blocksByPosition.get(`${x},${y}`);
  }

  if (chain.length === 0) return { kind: "noBlock" };
  if (!canBlockOccupyCell(context, x, y)) return { kind: "blocked" };

  for (let index = chain.length - 1; index >= 0; index -= 1) {
    const movingBlock = chain[index];
    movingBlock.renderX = movingBlock.x;
    movingBlock.renderY = movingBlock.y;
    movingBlock.movement = {
      fromX: movingBlock.x,
      fromY: movingBlock.y,
      startedAtSeconds: nowSeconds,
      intervalSeconds: playerActionBalance.blockPushMoveIntervalSeconds,
    };
    movingBlock.x += dx;
    movingBlock.y += dy;
  }
  return { kind: "pushed", movedBlockCount: chain.length };
};

export const updateBlockPositions = (
  blocks: readonly BlockData[],
  nowSeconds: number,
) => {
  blocks.forEach((block) => {
    const { movement } = block;
    if (!movement) {
      block.renderX = block.x;
      block.renderY = block.y;
      return;
    }

    const elapsedSeconds = nowSeconds - movement.startedAtSeconds;
    if (elapsedSeconds >= movement.intervalSeconds - 1e-9) {
      block.renderX = block.x;
      block.renderY = block.y;
      block.movement = undefined;
      return;
    }

    const progress = Math.max(
      0,
      Math.min(1, elapsedSeconds / movement.intervalSeconds),
    );
    block.renderX = movement.fromX + (block.x - movement.fromX) * progress;
    block.renderY = movement.fromY + (block.y - movement.fromY) * progress;
  });
};
