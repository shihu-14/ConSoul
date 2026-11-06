import { updateEnemy } from "./common";
import { chaseBehavior } from "./chase";
import { patrolBehavior } from "./patrol";
import { randomBehavior } from "./random";
import { rushBehavior } from "./rush";
import { GameSignal } from "../events";
import { PlayerState, StageState } from "../types";

export const updateEnemies = (
  stage: StageState,
  player: PlayerState,
  deltaSeconds: number,
  random: () => number = Math.random,
): GameSignal[] => {
  const signals: GameSignal[] = [];
  stage.enemies.forEach((enemy) => {
    switch (enemy.type) {
      case "random":
        updateEnemy(
          enemy,
          player,
          stage,
          deltaSeconds,
          random,
          randomBehavior,
          signals,
        );
        break;
      case "patrol":
        updateEnemy(
          enemy,
          player,
          stage,
          deltaSeconds,
          random,
          patrolBehavior,
          signals,
        );
        break;
      case "chase":
        updateEnemy(
          enemy,
          player,
          stage,
          deltaSeconds,
          random,
          chaseBehavior,
          signals,
        );
        break;
      case "rush":
        updateEnemy(
          enemy,
          player,
          stage,
          deltaSeconds,
          random,
          rushBehavior,
          signals,
        );
        break;
      default: {
        const unhandledEnemy: never = enemy;
        throw new Error(`未知の敵種別です。${JSON.stringify(unhandledEnemy)}`);
      }
    }
  });
  return signals;
};
