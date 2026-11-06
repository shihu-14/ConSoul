import { EnemyBehavior } from "./common";
import { isCellBlocked } from "../grid";
import { Direction, EnemyState, StageState } from "../types";

type PatrolEnemy = Extract<EnemyState, { type: "patrol" }>;

const choosePatrolDirection = (enemy: PatrolEnemy, stage: StageState) => {
  const nextIndex = (enemy.routeIndex + 1) % enemy.route.length;
  const target = enemy.route[nextIndex];
  const dx = target.x - enemy.position.x;
  const dy = target.y - enemy.position.y;
  let direction: Direction;
  if (dx < 0) direction = "left";
  else if (dx > 0) direction = "right";
  else if (dy < 0) direction = "up";
  else direction = "down";
  return isCellBlocked(stage, target) ? null : direction;
};

const choosePatrolDirectionAtCell: EnemyBehavior<PatrolEnemy>["chooseDirectionAtCell"] =
  (enemy, _player, stage) => {
    enemy.direction = choosePatrolDirection(enemy, stage);
    return [];
  };

const onPatrolMovementStarted = (enemy: PatrolEnemy) => {
  enemy.routeIndex = (enemy.routeIndex + 1) % enemy.route.length;
};

export const patrolBehavior: EnemyBehavior<PatrolEnemy> = {
  chooseDirectionAtCell: choosePatrolDirectionAtCell,
  onMovementStarted: onPatrolMovementStarted,
};
