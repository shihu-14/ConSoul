import {
  chooseRandom,
  chooseRandomDirection,
  EnemyBehavior,
  getLegalDirections,
  isDetected,
  oppositeDirection,
} from "./common";
import {
  gameConfig,
  getChaseSpeedTilesPerSecond,
  getEnemySpeedTilesPerSecond,
} from "../config";
import { findShortestDirections } from "../pathfinding";
import { EnemyState, PlayerState, StageState } from "../types";

type ChaseEnemy = Extract<EnemyState, { type: "chase" }>;

const chooseChaseDirection = (
  enemy: ChaseEnemy,
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
  // 追跡率は，別ルートを選べる交差点でだけ使う．
  if (
    nonReverseLegal.length > 1 &&
    alternatives.length > 0 &&
    random() >= enemy.chaseProbability
  ) {
    return chooseRandom(alternatives, random);
  }
  return chooseRandom(shortest, random);
};

const chooseChaseDirectionAtCell: EnemyBehavior<ChaseEnemy>["chooseDirectionAtCell"] =
  (enemy, player, stage, random) => {
    if (!isDetected(enemy, player)) {
      if (enemy.mode !== "normal") enemy.elapsedTime = 0;
      enemy.mode = "normal";
      enemy.direction = chooseRandomDirection(enemy, stage, random);
      return [];
    }
    if (enemy.mode === "normal") {
      enemy.mode = "alert";
      enemy.elapsedTime = 0;
      enemy.direction = null;
      return [{ type: "chaseAlert" }];
    }
    enemy.direction = chooseChaseDirection(enemy, player, stage, random);
    return [];
  };

const getChaseSpeed = (enemy: ChaseEnemy) =>
  enemy.mode === "chase"
    ? getChaseSpeedTilesPerSecond()
    : getEnemySpeedTilesPerSecond();

const chaseTimedMode: NonNullable<EnemyBehavior<ChaseEnemy>["timedMode"]> = {
  getElapsedTime: (enemy) => enemy.elapsedTime,
  addElapsedTime: (enemy, seconds) => {
    enemy.elapsedTime += seconds;
  },
  getWaitTime: (enemy) =>
    enemy.mode === "alert" ? gameConfig.enemy.chaseAlertSeconds : null,
  finish: (enemy) => {
    enemy.mode = "chase";
    enemy.elapsedTime = 0;
  },
};

export const chaseBehavior: EnemyBehavior<ChaseEnemy> = {
  chooseDirectionAtCell: chooseChaseDirectionAtCell,
  getSpeedTilesPerSecond: getChaseSpeed,
  timedMode: chaseTimedMode,
};
