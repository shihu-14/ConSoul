/**
 * 連鎖Pushの検証と開始，PushされたBlockの時間更新を処理する．
 */

import { gameConfig } from "./config";
import {
  getDirectionVector,
  getNextPosition,
  isBoundaryBlock,
  positionsEqual,
} from "./grid";
import { BlockState, Direction, Position, StageState } from "./types";

const EPSILON = 1e-8;

/** PlayerまたはBlockの指定方向に接しているBlockを返す． */
export const findTouchingBlock = (
  position: Position,
  blocks: readonly BlockState[],
  direction: Direction,
  excluded: ReadonlySet<BlockState> = new Set(),
) =>
  blocks.find(
    (block) =>
      !excluded.has(block) &&
      positionsEqual(block.position, getNextPosition(position, direction)),
  );

/** 連鎖末尾の移動先が他の盤面要素に占有されていないか確認する． */
const canOccupyPushDestination = (
  stage: StageState,
  destination: Position,
  chain: ReadonlySet<BlockState>,
) => {
  if (
    destination.x < 0 ||
    destination.y < 0 ||
    destination.x >= stage.width ||
    destination.y >= stage.height
  ) {
    return false;
  }
  if (
    stage.blocks.some(
      (block) =>
        !chain.has(block) &&
        (positionsEqual(destination, block.position) ||
          (block.movement !== null &&
            positionsEqual(
              destination,
              getNextPosition(block.position, block.movement.direction),
            ))),
    )
  ) {
    return false;
  }
  if (positionsEqual(destination, stage.post)) return false;
  if (
    stage.remainingItems.some((item) =>
      positionsEqual(destination, item.position),
    )
  ) {
    return false;
  }
  return !stage.enemies.some(
    (enemy) =>
      positionsEqual(destination, enemy.position) ||
      (enemy.movement !== null &&
        enemy.direction !== null &&
        positionsEqual(
          destination,
          getNextPosition(enemy.position, enemy.direction),
        )),
  );
};

/** 連続する内部Blockを検証し，成立時だけ全BlockのPushを開始する． */
export const tryStartPush = (
  stage: StageState,
  direction: Direction,
  firstBlock: BlockState,
) => {
  const chain: BlockState[] = [];
  const chainSet = new Set<BlockState>();
  let current: BlockState | undefined = firstBlock;
  while (current) {
    if (current.movement || isBoundaryBlock(current, stage)) return false;
    chain.push(current);
    chainSet.add(current);
    current = findTouchingBlock(
      current.position,
      stage.blocks,
      direction,
      chainSet,
    );
  }

  const vector = getDirectionVector(direction);
  const last = chain.at(-1);
  if (!last) return false;
  const destination = {
    x: last.position.x + vector.x,
    y: last.position.y + vector.y,
  };
  if (!canOccupyPushDestination(stage, destination, chainSet)) return false;

  chain.forEach((block) => {
    block.movement = { direction, elapsedDistance: 0 };
  });
  return true;
};

/** Push中のBlockを進め，1セル到達時に整数座標へ確定する． */
export const updateBlocks = (stage: StageState, deltaSeconds: number) => {
  stage.blocks.forEach((block) => {
    if (!block.movement) return;
    block.movement.elapsedDistance = Math.min(
      1,
      block.movement.elapsedDistance +
        Math.max(0, deltaSeconds) / gameConfig.action.blockPushDurationSeconds,
    );
    if (block.movement.elapsedDistance + EPSILON < 1) return;
    block.position = getNextPosition(block.position, block.movement.direction);
    block.movement = null;
  });
};
