/**
 * Rush Enemyの検知，突進方向の固定，Block衝突，Stunを処理する．
 */

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

/**
 * Rush Enemyの検知結果から，通常移動，Alert，Rushの方向を決定する．
 */
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

/**
 * Rush中にBlockへ到達した場合の状態遷移を処理する．
 * 内側BlockではStunへ入り，外周Blockでは突進方向を向いたまま回復待ちに入る．
 */
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
