/**
 * Patrol Enemyの固定巡回経路に沿った方向決定を処理する．
 */

import { directions, EnemyBehavior } from "./common";
import { getNextPosition, isCellBlocked, positionsEqual } from "../grid";
import { EnemyState, StageState } from "../types";

type PatrolEnemy = Extract<EnemyState, { type: "patrol" }>;

/**
 * Patrolの巡回経路から次の隣接セルへの方向を決定する．
 * 経路が隣接セルで構成されていない場合はエラーとし，次セルが塞がっている場合は停止する．
 */
const choosePatrolDirection = (enemy: PatrolEnemy, stage: StageState) => {
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

/**
 * Patrol Enemyの方向を決定し，移動開始時に次の巡回地点へ進める．
 */
const choosePatrolDirectionAtCell: EnemyBehavior<PatrolEnemy>["chooseDirectionAtCell"] =
  (enemy, _player, stage) => {
    enemy.direction = choosePatrolDirection(enemy, stage);
    return [];
  };

/**
 * Patrolの移動開始時に次の巡回セルを現在の対象として記録する．
 */
const onPatrolMovementStarted = (enemy: PatrolEnemy) => {
  enemy.routeIndex = (enemy.routeIndex + 1) % enemy.route.length;
};

export const patrolBehavior: EnemyBehavior<PatrolEnemy> = {
  chooseDirectionAtCell: choosePatrolDirectionAtCell,
  onMovementStarted: onPatrolMovementStarted,
};
