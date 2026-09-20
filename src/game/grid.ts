/**
 * 整数グリッド上の座標計算，占有判定，表示座標，矩形衝突を扱う．
 */

import { BlockState, Direction, Position, StageState } from "./types";

const COLLISION_EPSILON = 1e-9;

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
export const positionsEqual = (first: Position, second: Position) =>
  first.x === second.x && first.y === second.y;

/**
 * 指定方向へ1セル進んだ整数セル座標を返す．
 * 元のPositionは変更せず，方向ベクトルを加えた新しいPositionを作成する．
 */
export const getNextPosition = (
  position: Position,
  direction: Direction,
): Position => {
  const vector = getDirectionVector(direction);
  return {
    x: position.x + vector.x,
    y: position.y + vector.y,
  };
};

/**
 * 論理セル座標と移動進捗から描画用座標を導出する．
 * positionは整数セルのまま保持し，現在セル内のelapsedDistanceを方向へ加えて補間表示する．
 */
export const getDisplayPosition = (
  position: Position,
  direction: Direction | null,
  elapsedDistance: number,
): Position => {
  if (!direction) return { ...position };
  const vector = getDirectionVector(direction);
  return {
    x: position.x + vector.x * elapsedDistance,
    y: position.y + vector.y * elapsedDistance,
  };
};

/**
 * 指定セルが盤面内で移動可能かを判定する．
 * 盤面外，停止中Blockのセル，移動中Blockの起点と導出先をすべて壁として扱う．
 */
export const isCellBlocked = (stage: StageState, position: Position) => {
  if (
    position.x < 0 ||
    position.y < 0 ||
    position.x >= stage.width ||
    position.y >= stage.height
  ) {
    return true;
  }
  return stage.blocks.some(
    (block) =>
      positionsEqual(block.position, position) ||
      (block.movement !== null &&
        positionsEqual(
          getNextPosition(block.position, block.movement.direction),
          position,
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
      const destination = getNextPosition(
        block.position,
        block.movement.direction,
      );
      blocked.add(`${destination.x},${destination.y}`);
    }
  });
  return blocked;
};

/**
 * 1セルの矩形同士が厳密に重なっているか判定する．
 * 辺が接触するだけの場合は重なりとみなさない．
 */
export const rectanglesOverlap = (first: Position, second: Position) =>
  first.x < second.x + 1 - COLLISION_EPSILON &&
  second.x < first.x + 1 - COLLISION_EPSILON &&
  first.y < second.y + 1 - COLLISION_EPSILON &&
  second.y < first.y + 1 - COLLISION_EPSILON;
