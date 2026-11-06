import { chooseRandomDirection, EnemyBehavior } from "./common";
import { EnemyState } from "../types";

type RandomEnemy = Extract<EnemyState, { type: "random" }>;

const chooseRandomDirectionAtCell: EnemyBehavior<RandomEnemy>["chooseDirectionAtCell"] =
  (enemy, _player, stage, random) => {
    enemy.direction = chooseRandomDirection(enemy, stage, random);
    return [];
  };

export const randomBehavior: EnemyBehavior<RandomEnemy> = {
  chooseDirectionAtCell: chooseRandomDirectionAtCell,
};
