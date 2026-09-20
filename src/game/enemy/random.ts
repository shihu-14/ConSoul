/**
 * Random Enemyのセル境界における方向決定を処理する．
 */

import { chooseRandomDirection, EnemyBehavior } from "./common";
import { EnemyState } from "../types";

type RandomEnemy = Extract<EnemyState, { type: "random" }>;

/**
 * Random Enemyの次の方向を合法方向から選択する．
 */
const chooseRandomDirectionAtCell: EnemyBehavior<RandomEnemy>["chooseDirectionAtCell"] =
  (enemy, _player, stage, random) => {
    enemy.direction = chooseRandomDirection(enemy, stage, random);
    return [];
  };

export const randomBehavior: EnemyBehavior<RandomEnemy> = {
  chooseDirectionAtCell: chooseRandomDirectionAtCell,
};
