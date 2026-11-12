import { describe, expect, it } from "vitest";
import { createPlayer } from "../player";
import { EnemyState, StageState, gameConfig } from "../shared";
import { updateEnemies } from ".";

describe("enemy", () => {
  it("alerts before a chase enemy starts chasing", () => {
    const enemy: EnemyState = {
      type: "chase",
      position: { x: 1, y: 1 },
      direction: null,
      movement: null,
      chaseProbability: 1,
      mode: "normal",
      elapsedTime: 0,
    };
    const stage: StageState = {
      width: 5,
      height: 5,
      remainingItems: [],
      deliveredItems: [],
      post: { x: 4, y: 4 },
      playerStart: { x: 2, y: 1 },
      enemies: [enemy],
      blocks: [],
    };
    const player = createPlayer("student", stage.playerStart);

    expect(updateEnemies(stage, player, 0, () => 0)).toEqual([
      { type: "chaseAlert" },
    ]);
    expect(enemy.type === "chase" && enemy.mode).toBe("alert");

    updateEnemies(
      stage,
      player,
      gameConfig.enemy.chaseAlertSeconds,
      () => 0,
    );
    expect(enemy.type === "chase" && enemy.mode).toBe("chase");
  });
});
