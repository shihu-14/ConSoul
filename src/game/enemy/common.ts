// 待機と移動を同じループで消費する．
/* eslint-disable no-continue */

import { gameConfig, getEnemySpeedTilesPerSecond } from "../config";
import { GameSignal } from "../events";
import {
  getBlockedCellKeys,
  getNextPosition,
  isCellBlocked,
  positionsEqual,
} from "../grid";
import {
  Direction,
  EnemyState,
  PlayerState,
  Position,
  StageState,
} from "../types";

const EPS = 1e-8;

export const directions: readonly Direction[] = ["up", "down", "left", "right"];
export const oppositeDirection: Record<Direction, Direction> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

export const chooseRandom = <T>(values: readonly T[], random: () => number) =>
  values[Math.floor(random() * values.length)];

export const getLegalDirections = (enemy: EnemyState, stage: StageState) =>
  directions.filter(
    (direction) =>
      !isCellBlocked(stage, getNextPosition(enemy.position, direction)),
  );

export const chooseRandomDirection = (
  enemy: EnemyState,
  stage: StageState,
  random: () => number,
) => {
  const legal = getLegalDirections(enemy, stage);
  if (legal.length === 0) return null;
  if (!enemy.direction) return chooseRandom(legal, random);
  const forward = legal.filter(
    (direction) => direction !== oppositeDirection[enemy.direction!],
  );
  return chooseRandom(forward.length > 0 ? forward : legal, random);
};

export const isDetected = (enemy: EnemyState, player: PlayerState) =>
  Math.abs(enemy.position.x - player.position.x) +
    Math.abs(enemy.position.y - player.position.y) <=
  gameConfig.player[player.characterType].detectionRangeTiles;

export const getLineOfSightDirection = (
  enemy: EnemyState,
  player: PlayerState,
  stage: StageState,
): Direction | null => {
  const dx = player.position.x - enemy.position.x;
  const dy = player.position.y - enemy.position.y;
  if ((dx !== 0 && dy !== 0) || (dx === 0 && dy === 0)) return null;
  const stepX = Math.sign(dx);
  const stepY = Math.sign(dy);
  const blocked = getBlockedCellKeys(stage);
  let logicalX = enemy.position.x + stepX;
  let logicalY = enemy.position.y + stepY;
  while (logicalX !== player.position.x || logicalY !== player.position.y) {
    if (blocked.has(`${logicalX},${logicalY}`)) return null;
    logicalX += stepX;
    logicalY += stepY;
  }
  if (stepX < 0) return "left";
  if (stepX > 0) return "right";
  return stepY < 0 ? "up" : "down";
};

export type EnemyBehavior<T extends EnemyState> = {
  chooseDirectionAtCell: (
    enemy: T,
    player: PlayerState,
    stage: StageState,
    random: () => number,
  ) => readonly GameSignal[];
  getSpeedTilesPerSecond?: (enemy: T) => number;
  timedMode?: {
    getElapsedTime: (enemy: T) => number;
    addElapsedTime: (enemy: T, seconds: number) => void;
    getWaitTime: (enemy: T) => number | null;
    finish: (enemy: T) => void;
  };
  onMovementStarted?: (enemy: T) => void;
  onBlockedCell?: (enemy: T, stage: StageState) => void;
};

export const findBlockAtCell = (
  stage: StageState,
  logicalPosition: Readonly<Position>,
) =>
  stage.blocks.find(
    (block) =>
      positionsEqual(block.position, logicalPosition) ||
      (block.movement !== null &&
        positionsEqual(
          getNextPosition(block.position, block.movement.direction),
          logicalPosition,
        )),
  );

export const stopAtBlockedCell = (enemy: EnemyState) => {
  enemy.direction = null;
  enemy.movement = null;
};

export const updateEnemy = <T extends EnemyState>(
  enemy: T,
  player: PlayerState,
  stage: StageState,
  deltaSeconds: number,
  random: () => number,
  behavior: EnemyBehavior<T>,
  signals: GameSignal[],
): void => {
  let remainingSeconds = deltaSeconds;
  let evaluateState = true;

  // フレームの切れ目で結果が変わらないよう，残り時間を使い切る．
  while (evaluateState || remainingSeconds > EPS) {
    evaluateState = false;
    const { timedMode } = behavior;
    if (timedMode) {
      const modeWaitTime = timedMode.getWaitTime(enemy);
      if (modeWaitTime !== null) {
        const waitRemaining = Math.max(
          0,
          modeWaitTime - timedMode.getElapsedTime(enemy),
        );
        const consumedTime = Math.min(remainingSeconds, waitRemaining);
        timedMode.addElapsedTime(enemy, consumedTime);
        remainingSeconds -= consumedTime;
        if (consumedTime + EPS < waitRemaining) return;
        timedMode.finish(enemy);
        const waitTimeAfterFinish = timedMode.getWaitTime(enemy);
        if (
          waitTimeAfterFinish !== null &&
          waitTimeAfterFinish - timedMode.getElapsedTime(enemy) <= EPS
        ) {
          return;
        }
        evaluateState = true;
        continue;
      }
    }

    // 進行方向はセル境界でだけ決める．
    if (!enemy.movement) {
      signals.push(
        ...behavior.chooseDirectionAtCell(enemy, player, stage, random),
      );
      if ((behavior.timedMode?.getWaitTime(enemy) ?? null) !== null) {
        continue;
      }
      if (!enemy.direction || remainingSeconds <= EPS) {
        timedMode?.addElapsedTime(enemy, remainingSeconds);
        return;
      }
      const nextLogicalPosition = getNextPosition(
        enemy.position,
        enemy.direction,
      );
      if (isCellBlocked(stage, nextLogicalPosition)) {
        if (behavior.onBlockedCell) {
          behavior.onBlockedCell(enemy, stage);
        } else {
          stopAtBlockedCell(enemy);
        }
        continue;
      }
      enemy.movement = { elapsedDistance: 0 };
      behavior.onMovementStarted?.(enemy);
    }

    if (!enemy.direction || !enemy.movement) return;
    const speed =
      behavior.getSpeedTilesPerSecond?.(enemy) ?? getEnemySpeedTilesPerSecond();
    const distanceRemaining = 1 - enemy.movement.elapsedDistance;
    const distance = Math.min(speed * remainingSeconds, distanceRemaining);
    enemy.movement.elapsedDistance += distance;
    const consumedTime = distance / speed;
    timedMode?.addElapsedTime(enemy, consumedTime);
    remainingSeconds -= consumedTime;

    if (distance + EPS < distanceRemaining) return;
    enemy.position = getNextPosition(enemy.position, enemy.direction);
    enemy.movement = null;
  }
};
