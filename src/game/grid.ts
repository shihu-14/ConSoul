/**
 * 整数グリッド上の座標計算，占有判定，表示座標，矩形衝突を扱う．
 */

import { BlockState, Direction, Position, StageState } from "./types";

const EPS = 1e-8;

/**
 * BlockがStageの外周にあるかを座標から判定する．
 * 外周Blockは固定壁として扱い，内側BlockだけがPush対象になる．
 */
export const isBoundaryBlock = (block: BlockState, stage: StageState) =>
  block.position.x === 0 ||
  block.position.y === 0 ||
  block.position.x === stage.width - 1 ||
  block.position.y === stage.height - 1;

/**
 * Directionを1セル分の座標差へ変換する．
 */
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

/**
 * 2つのPositionが同じセルを指しているか比較する．
 */
export const positionsEqual = (
  first: Readonly<Position>,
  second: Readonly<Position>,
) => first.x === second.x && first.y === second.y;

/**
 * 指定方向へ1セル進んだ整数セル座標を返す．
 * 元のlogicalPositionは変更せず，方向ベクトルを加えた新しいPositionを作成する．
 */
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

/**
 * 論理セル座標と移動進捗から描画用座標を導出する．
 * logicalPositionは整数セルのまま保持し，現在セル内のelapsedDistanceを方向へ加えてdisplayPositionを導出する．
 */
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

/**
 * 指定セルが盤面内で移動可能かを判定する．
 * 盤面外，停止中Blockのセル，移動中Blockの起点と導出先をすべて壁として扱う．
 */
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

/**
 * Stage内でBlockが占有している起点セルと移動先セルのキー集合を返す．
 */
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

/**
 * 1セルの矩形同士が厳密に重なっているか判定する．
 * 辺が接触するだけの場合は重なりとみなさない．
 */
export const rectanglesOverlap = (
  firstDisplayPosition: Readonly<Position>,
  secondDisplayPosition: Readonly<Position>,
) =>
  firstDisplayPosition.x < secondDisplayPosition.x + 1 - EPS &&
  secondDisplayPosition.x < firstDisplayPosition.x + 1 - EPS &&
  firstDisplayPosition.y < secondDisplayPosition.y + 1 - EPS &&
  secondDisplayPosition.y < firstDisplayPosition.y + 1 - EPS;
