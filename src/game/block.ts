import { gameConfig } from "./config";
import {
  getDirectionVector,
  getNextPosition,
  isBoundaryBlock,
  positionsEqual,
} from "./grid";
import { BlockState, Direction, Position, StageState } from "./types";

const EPS = 1e-8;

export const findTouchingBlock = (
  position: Readonly<Position>,
  blocks: readonly BlockState[],
  direction: Direction,
  excluded: ReadonlySet<BlockState> = new Set(),
) =>
  blocks.find(
    (block) =>
      !excluded.has(block) &&
      positionsEqual(block.position, getNextPosition(position, direction)),
  );

const canOccupyPushDestination = (
  stage: StageState,
  destination: Readonly<Position>,
  chain: ReadonlySet<BlockState>,
) => {
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

  const durationSeconds = gameConfig.action.blockPushDurationSeconds;
  chain.forEach((block) => {
    block.movement = { direction, elapsedDistance: 0, durationSeconds };
  });
  return true;
};

export const updateBlocks = (stage: StageState, deltaSeconds: number) => {
  stage.blocks.forEach((block) => {
    if (!block.movement) return;
    block.movement.elapsedDistance = Math.min(
      1,
      block.movement.elapsedDistance +
        deltaSeconds / block.movement.durationSeconds,
    );
    if (block.movement.elapsedDistance + EPS < 1) return;
    block.position = getNextPosition(block.position, block.movement.direction);
    block.movement = null;
  });
};
