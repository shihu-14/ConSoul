/**
 * 4種類の敵AI，時間付きモード遷移，整数マス間の移動を処理する．
 */

import {
  gameConfig,
  getChaseSpeedTilesPerSecond,
  getEnemySpeedTilesPerSecond,
  getRushSpeedTilesPerSecond,
} from "./config";
import {
  getBlockedCellKeys,
  getNextPosition,
  isBoundaryBlock,
  isCellBlocked,
  positionsEqual,
} from "./grid";
import { findShortestDirections } from "./pathfinding";
import { Direction, EnemyState, PlayerState, StageState } from "./types";

const EPSILON = 1e-8;
const directions: readonly Direction[] = ["up", "down", "left", "right"];
const oppositeDirection: Record<Direction, Direction> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

const chooseRandom = <T>(values: readonly T[], random: () => number) => {
  const index = Math.min(
    values.length - 1,
    Math.max(0, Math.floor(random() * values.length)),
  );
  return values[index];
};

const getLegalDirections = (enemy: EnemyState, stage: StageState) =>
  directions.filter(
    (direction) =>
      !isCellBlocked(stage, getNextPosition(enemy.position, direction)),
  );

const chooseRandomDirection = (
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

const isDetected = (enemy: EnemyState, player: PlayerState) =>
  Math.abs(enemy.position.x - player.position.x) +
    Math.abs(enemy.position.y - player.position.y) <=
  gameConfig.player[player.characterType].detectionRangeTiles;

const getLineOfSightDirection = (
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
  let x = enemy.position.x + stepX;
  let y = enemy.position.y + stepY;
  while (x !== player.position.x || y !== player.position.y) {
    if (blocked.has(`${x},${y}`)) return null;
    x += stepX;
    y += stepY;
  }
  if (stepX < 0) return "left";
  if (stepX > 0) return "right";
  return stepY < 0 ? "up" : "down";
};

const choosePatrolDirection = (
  enemy: Extract<EnemyState, { type: "patrol" }>,
  stage: StageState,
) => {
  const nextIndex = (enemy.routeIndex + 1) % enemy.route.length;
  const target = enemy.route[nextIndex];
  const dx = target.x - enemy.position.x;
  const dy = target.y - enemy.position.y;
  const direction = directions.find((candidate) =>
    positionsEqual(getNextPosition(enemy.position, candidate), target),
  );
  if (!direction || Math.abs(dx) + Math.abs(dy) !== 1) {
    throw new Error("巡回経路は隣接セルで構成します。");
  }
  return isCellBlocked(stage, target) ? null : direction;
};

const chooseChaseDirection = (
  enemy: Extract<EnemyState, { type: "chase" }>,
  player: PlayerState,
  stage: StageState,
  random: () => number,
) => {
  const legal = getLegalDirections(enemy, stage);
  if (legal.length === 0) return null;
  const shortest = findShortestDirections(
    stage,
    enemy.position,
    player.position,
  ).filter((direction) => legal.includes(direction));
  if (shortest.length === 0) return chooseRandomDirection(enemy, stage, random);
  const nonReverseLegal = enemy.direction
    ? legal.filter(
        (direction) => direction !== oppositeDirection[enemy.direction!],
      )
    : legal;
  const alternatives = nonReverseLegal.filter(
    (direction) => !shortest.includes(direction),
  );
  // Chase精度は選択肢が分かれる交差点だけに適用し，一本道では必ず最短方向へ進む．
  if (
    nonReverseLegal.length > 1 &&
    alternatives.length > 0 &&
    random() >= enemy.chaseProbability
  ) {
    return chooseRandom(alternatives, random);
  }
  return chooseRandom(shortest, random);
};

const getEnemySpeed = (enemy: EnemyState) => {
  if (enemy.type === "chase" && enemy.mode === "chase") {
    return getChaseSpeedTilesPerSecond();
  }
  if (enemy.type === "rush" && enemy.mode === "rush") {
    return getRushSpeedTilesPerSecond();
  }
  return getEnemySpeedTilesPerSecond();
};

const getModeWaitTime = (enemy: EnemyState) => {
  if (enemy.type === "chase" && enemy.mode === "alert") {
    return gameConfig.enemy.chaseAlertSeconds;
  }
  if (enemy.type === "rush" && enemy.mode === "alert") {
    return gameConfig.enemy.rushAlertSeconds;
  }
  if (enemy.type === "rush" && enemy.mode === "stun") {
    return gameConfig.enemy.rushBlockStunSeconds;
  }
  return null;
};

const addElapsedTime = (enemy: EnemyState, elapsedTime: number) => {
  if (enemy.type === "chase" || enemy.type === "rush") {
    enemy.elapsedTime += elapsedTime;
  }
};

const getElapsedTime = (enemy: EnemyState) =>
  enemy.type === "chase" || enemy.type === "rush" ? enemy.elapsedTime : 0;

const finishTimedMode = (enemy: EnemyState) => {
  if (enemy.type === "chase" && enemy.mode === "alert") {
    enemy.mode = "chase";
    enemy.elapsedTime = 0;
    return;
  }
  if (enemy.type === "rush" && enemy.mode === "alert") {
    enemy.mode = "rush";
    enemy.elapsedTime = 0;
    return;
  }
  if (enemy.type === "rush" && enemy.mode === "stun") {
    enemy.mode = "normal";
    enemy.elapsedTime = 0;
  }
};

const chooseDirectionAtCell = (
  enemy: EnemyState,
  player: PlayerState,
  stage: StageState,
  random: () => number,
) => {
  switch (enemy.type) {
    case "random":
      enemy.direction = chooseRandomDirection(enemy, stage, random);
      return;
    case "patrol":
      enemy.direction = choosePatrolDirection(enemy, stage);
      return;
    case "chase":
      if (!isDetected(enemy, player)) {
        if (enemy.mode !== "normal") enemy.elapsedTime = 0;
        enemy.mode = "normal";
        enemy.direction = chooseRandomDirection(enemy, stage, random);
        return;
      }
      if (enemy.mode === "normal") {
        enemy.mode = "alert";
        enemy.elapsedTime = 0;
        enemy.direction = null;
        return;
      }
      enemy.direction = chooseChaseDirection(enemy, player, stage, random);
      return;
    case "rush": {
      if (enemy.mode === "rush") return;
      if (!isDetected(enemy, player)) {
        enemy.direction = chooseRandomDirection(enemy, stage, random);
        return;
      }
      const lineOfSight = getLineOfSightDirection(enemy, player, stage);
      if (!lineOfSight) {
        enemy.direction = chooseRandomDirection(enemy, stage, random);
        return;
      }
      enemy.mode = "alert";
      enemy.elapsedTime = 0;
      enemy.direction = lineOfSight;
      return;
    }
    default:
      throw new Error("未知の敵種別です。");
  }
};

const findBlockAtCell = (
  stage: StageState,
  position: { x: number; y: number },
) =>
  stage.blocks.find(
    (block) =>
      positionsEqual(block.position, position) ||
      (block.movement !== null &&
        positionsEqual(
          getNextPosition(block.position, block.movement.direction),
          position,
        )),
  );

const stopAtBlockedCell = (enemy: EnemyState, stage: StageState) => {
  if (enemy.type !== "rush" || enemy.mode !== "rush" || !enemy.direction) {
    enemy.direction = null;
    enemy.movement = null;
    return;
  }
  const nextPosition = getNextPosition(enemy.position, enemy.direction);
  const block = findBlockAtCell(stage, nextPosition);
  const hitsInternalBlock = block && !isBoundaryBlock(block, stage);
  enemy.mode = hitsInternalBlock ? "stun" : "normal";
  enemy.elapsedTime = 0;
  enemy.movement = null;
  if (!hitsInternalBlock) enemy.direction = null;
};

const updateEnemy = (
  enemy: EnemyState,
  player: PlayerState,
  stage: StageState,
  deltaSeconds: number,
  random: () => number,
) => {
  let remainingSeconds = Math.max(0, deltaSeconds);
  let evaluateState = true;

  // 時間モードと1マス移動を順に消費し，フレーム分割による結果の差を作らない．
  while (evaluateState || remainingSeconds > EPSILON) {
    evaluateState = false;
    const modeWaitTime = getModeWaitTime(enemy);
    if (modeWaitTime !== null) {
      const waitRemaining = Math.max(0, modeWaitTime - getElapsedTime(enemy));
      const consumedTime = Math.min(remainingSeconds, waitRemaining);
      addElapsedTime(enemy, consumedTime);
      remainingSeconds = Math.max(0, remainingSeconds - consumedTime);
      if (consumedTime + EPSILON < waitRemaining) return;
      finishTimedMode(enemy);
    }

    if (!enemy.movement) {
      chooseDirectionAtCell(enemy, player, stage, random);
      if (getModeWaitTime(enemy) !== null) {
        if (remainingSeconds > EPSILON) {
          updateEnemy(enemy, player, stage, remainingSeconds, random);
        }
        return;
      }
      if (!enemy.direction || remainingSeconds <= EPSILON) {
        addElapsedTime(enemy, remainingSeconds);
        return;
      }
      const nextPosition = getNextPosition(enemy.position, enemy.direction);
      if (isCellBlocked(stage, nextPosition)) {
        stopAtBlockedCell(enemy, stage);
        if (remainingSeconds > EPSILON) {
          updateEnemy(enemy, player, stage, remainingSeconds, random);
        }
        return;
      }
      enemy.movement = { elapsedDistance: 0 };
      if (enemy.type === "patrol") {
        enemy.routeIndex = (enemy.routeIndex + 1) % enemy.route.length;
      }
    }

    if (!enemy.direction || !enemy.movement) return;
    const speed = getEnemySpeed(enemy);
    const distanceRemaining = 1 - enemy.movement.elapsedDistance;
    const distance = Math.min(speed * remainingSeconds, distanceRemaining);
    enemy.movement.elapsedDistance += distance;
    const consumedTime = distance / speed;
    addElapsedTime(enemy, consumedTime);
    remainingSeconds = Math.max(0, remainingSeconds - consumedTime);

    if (distance + EPSILON < distanceRemaining) return;
    enemy.position = getNextPosition(enemy.position, enemy.direction);
    enemy.movement = null;
  }
};

export const updateEnemies = (
  stage: StageState,
  player: PlayerState,
  deltaSeconds: number,
  random: () => number = Math.random,
) => {
  stage.enemies.forEach((enemy) =>
    updateEnemy(enemy, player, stage, deltaSeconds, random),
  );
};
