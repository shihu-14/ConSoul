import { describe, expect, it } from "vitest";
import { gameConfig } from "./config";
import {
  createGame,
  retryStage,
  startGame,
  updateGame,
} from "./game";
import { createPlayer } from "./player";
import { GameState } from "./types";

describe("game lifecycle", () => {
  it("starts, retries, and advances to the next stage", () => {
    const game = createGame(0);

    expect(startGame(game, "student", 1)).toBe(true);
    expect(game).toMatchObject({
      mode: "game",
      stageIndex: 0,
      elapsedSeconds: 0,
    });

    game.player.position = { x: 2, y: 2 };
    expect(retryStage(game, 2)).toBe(true);
    expect(game.player.position).toEqual(game.stage.playerStart);

    game.stage.remainingItems = [];
    game.stage.deliveredItems = [{ kind: 0, position: { x: 1, y: 1 } }];
    updateGame(game, null, 0, 3, () => 1);
    expect(game.mode).toBe("stageTransition");

    updateGame(
      game,
      null,
      gameConfig.action.stageTransitionSeconds,
      3 + gameConfig.action.stageTransitionSeconds,
      () => 1,
    );
    expect(game).toMatchObject({ mode: "game", stageIndex: 1 });
  });

  it("caps catch-up simulation while preserving elapsed time", () => {
    const player = createPlayer("student", { x: 1, y: 1 });
    player.energy = 0;
    const game: GameState = {
      mode: "game",
      modeStartedAtSeconds: 0,
      stageIndex: 0,
      stage: {
        width: 10,
        height: 10,
        remainingItems: [],
        deliveredItems: [],
        post: { x: 8, y: 8 },
        playerStart: { x: 1, y: 1 },
        enemies: [],
        blocks: [],
      },
      player,
      elapsedSeconds: 0,
    };

    updateGame(game, "right", 1, 1, () => 1);

    expect(game.elapsedSeconds).toBe(1);
    expect(game.player.position).toEqual({ x: 2, y: 1 });
    expect(game.player.movement).toMatchObject({ type: "walk" });
    expect(game.player.movement?.elapsedDistance).toBeCloseTo(0.5);
    expect(game.player.energy).toBeCloseTo(26);
  });
});
