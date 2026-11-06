import {
  chooseRandomDirection,
  EnemyBehavior,
  findBlockAtCell,
  getLineOfSightDirection,
  isDetected,
} from "./common";
import {
  gameConfig,
  getEnemySpeedTilesPerSecond,
  getRushSpeedTilesPerSecond,
} from "../config";
import { getNextPosition, isBoundaryBlock } from "../grid";
import { EnemyState, StageState } from "../types";

type RushEnemy = Extract<EnemyState, { type: "rush" }>;

const chooseRushDirectionAtCell: EnemyBehavior<RushEnemy>["chooseDirectionAtCell"] =
  (enemy, player, stage, random) => {
    if (enemy.mode === "rush") return [];
    if (!isDetected(enemy, player)) {
      enemy.direction = chooseRandomDirection(enemy, stage, random);
      return [];
    }
    const lineOfSight = getLineOfSightDirection(enemy, player, stage);
    if (!lineOfSight) {
      enemy.direction = chooseRandomDirection(enemy, stage, random);
      return [];
    }
    enemy.mode = "alert";
    enemy.elapsedTime = 0;
    enemy.direction = lineOfSight;
    return [{ type: "chaseAlert" }];
  };

// 動かせる墓石にぶつかったときだけスタンする．
const onRushBlockedCell = (enemy: RushEnemy, stage: StageState) => {
  if (enemy.mode !== "rush" || !enemy.direction) {
    enemy.direction = null;
    enemy.movement = null;
    return;
  }
  const nextPosition = getNextPosition(enemy.position, enemy.direction);
  const block = findBlockAtCell(stage, nextPosition);
  const hitsInternalBlock = block && !isBoundaryBlock(block, stage);
  enemy.mode = hitsInternalBlock ? "stun" : "recover";
  enemy.elapsedTime = 0;
  enemy.movement = null;
};

const getRushSpeed = (enemy: RushEnemy) =>
  enemy.mode === "rush"
    ? getRushSpeedTilesPerSecond()
    : getEnemySpeedTilesPerSecond();

const rushTimedMode: NonNullable<EnemyBehavior<RushEnemy>["timedMode"]> = {
  getElapsedTime: (enemy) => enemy.elapsedTime,
  addElapsedTime: (enemy, seconds) => {
    enemy.elapsedTime += seconds;
  },
  getWaitTime: (enemy) => {
    if (enemy.mode === "alert") return gameConfig.enemy.rushAlertSeconds;
    if (enemy.mode === "stun") return gameConfig.enemy.rushBlockStunSeconds;
    if (enemy.mode === "recover") return gameConfig.enemy.rushRecoverySeconds;
    return null;
  },
  finish: (enemy) => {
    if (enemy.mode === "alert") enemy.mode = "rush";
    if (enemy.mode === "recover") enemy.direction = null;
    if (enemy.mode === "stun" || enemy.mode === "recover")
      enemy.mode = "normal";
    enemy.elapsedTime = 0;
  },
};

export const rushBehavior: EnemyBehavior<RushEnemy> = {
  chooseDirectionAtCell: chooseRushDirectionAtCell,
  getSpeedTilesPerSecond: getRushSpeed,
  timedMode: rushTimedMode,
  onBlockedCell: onRushBlockedCell,
};
