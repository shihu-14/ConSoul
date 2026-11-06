import { BlockState, Direction, Position, StageState } from "./types";

const EPS = 1e-8;

export const isBoundaryBlock = (block: BlockState, stage: StageState) =>
  block.position.x === 0 ||
  block.position.y === 0 ||
  block.position.x === stage.width - 1 ||
  block.position.y === stage.height - 1;

export const getDirectionVector = (direction: Direction): Position => {
  switch (direction) {
    case "up":
      return { x: 0, y: -1 };
    case "down":
      return { x: 0, y: 1 };
    case "left":
      return { x: -1, y: 0 };
    case "right":
      return { x: 1, y: 0 };
    default:
      throw new Error("未知の移動方向です。");
  }
};

export const positionsEqual = (
  first: Readonly<Position>,
  second: Readonly<Position>,
) => first.x === second.x && first.y === second.y;

export const getNextPosition = (
  logicalPosition: Readonly<Position>,
  direction: Direction,
): Position => {
  const vector = getDirectionVector(direction);
  return {
    x: logicalPosition.x + vector.x,
    y: logicalPosition.y + vector.y,
  };
};

export const getDisplayPosition = (
  logicalPosition: Readonly<Position>,
  direction: Direction | null,
  elapsedDistance: number,
): Position => {
  if (!direction) return { ...logicalPosition };
  const vector = getDirectionVector(direction);
  return {
    x: logicalPosition.x + vector.x * elapsedDistance,
    y: logicalPosition.y + vector.y * elapsedDistance,
  };
};

export const isCellBlocked = (
  stage: StageState,
  logicalPosition: Readonly<Position>,
) => {
  if (
    logicalPosition.x < 0 ||
    logicalPosition.y < 0 ||
    logicalPosition.x >= stage.width ||
    logicalPosition.y >= stage.height
  ) {
    return true;
  }
  // 移動中は、元のマスと移動先の両方を塞ぐ。
  return stage.blocks.some(
    (block) =>
      positionsEqual(block.position, logicalPosition) ||
      (block.movement !== null &&
        positionsEqual(
          getNextPosition(block.position, block.movement.direction),
          logicalPosition,
        )),
  );
};

export const getBlockedCellKeys = (stage: StageState) => {
  const blocked = new Set<string>();
  stage.blocks.forEach((block) => {
    blocked.add(`${block.position.x},${block.position.y}`);
    if (block.movement) {
      const destinationLogicalPosition = getNextPosition(
        block.position,
        block.movement.direction,
      );
      blocked.add(
        `${destinationLogicalPosition.x},${destinationLogicalPosition.y}`,
      );
    }
  });
  return blocked;
};

// 辺が触れただけなら衝突扱いにしない。
export const rectanglesOverlap = (
  firstDisplayPosition: Readonly<Position>,
  secondDisplayPosition: Readonly<Position>,
) =>
  firstDisplayPosition.x < secondDisplayPosition.x + 1 - EPS &&
  secondDisplayPosition.x < firstDisplayPosition.x + 1 - EPS &&
  firstDisplayPosition.y < secondDisplayPosition.y + 1 - EPS &&
  secondDisplayPosition.y < firstDisplayPosition.y + 1 - EPS;
