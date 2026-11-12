import { describe, expect, it } from "vitest";
import {
  StageState,
  gameConfig,
  getPlayerSpeedTilesPerSecond,
} from "../shared";
import {
  createPlayer,
  performPlayerAction,
  updatePlayer,
} from "../player";

const createEmptyStage = (): StageState => ({
  width: 6,
  height: 6,
  remainingItems: [],
  deliveredItems: [],
  post: { x: 4, y: 4 },
  playerStart: { x: 1, y: 1 },
  enemies: [],
  blocks: [],
});

describe("player", () => {
  it("collects and delivers an item while moving", () => {
    const stage = createEmptyStage();
    stage.remainingItems = [{ kind: 0, position: { x: 2, y: 1 } }];
    stage.post = { x: 3, y: 1 };
    const player = createPlayer("student", stage.playerStart);

    const pickupSignals = updatePlayer(
      player,
      stage,
      "right",
      1 / getPlayerSpeedTilesPerSecond("student", 0),
      () => 1,
    );

    expect(pickupSignals).toContainEqual({ type: "itemPickup" });
    expect(player.position).toEqual({ x: 2, y: 1 });
    expect(player.heldItems).toHaveLength(1);

    const deliverySignals = updatePlayer(
      player,
      stage,
      "right",
      1 / getPlayerSpeedTilesPerSecond("student", 1),
      () => 1,
    );

    expect(deliverySignals).toContainEqual({ type: "itemDeliver" });
    expect(player.position).toEqual({ x: 3, y: 1 });
    expect(player.heldItems).toEqual([]);
    expect(stage.deliveredItems).toHaveLength(1);
  });

  it("prioritizes pushing a touching block over dashing", () => {
    const stage = createEmptyStage();
    stage.blocks = [{ position: { x: 2, y: 1 }, movement: null }];
    const player = createPlayer("student", stage.playerStart);

    expect(performPlayerAction(player, stage, "right")).toBe("push");
    expect(player.energy).toBe(
      gameConfig.energy.maximum - gameConfig.energy.pushCost,
    );
    expect(stage.blocks[0].movement).toEqual({
      direction: "right",
      elapsedDistance: 0,
      durationSeconds: gameConfig.action.blockPushDurationSeconds,
    });
    expect(player.movement).toBeNull();
  });
});
