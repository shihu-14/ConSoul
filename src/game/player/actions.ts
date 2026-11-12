import {
  Direction,
  PlayerState,
  StageState,
  gameConfig,
  getNextPosition,
  isCellBlocked,
} from "../shared";
import { findTouchingBlock, tryStartPush } from "../stage";

export const performPlayerAction = (
  player: PlayerState,
  stage: StageState,
  direction: Direction,
) => {
  if (player.movement?.type === "dash") return "ignored" as const;
  if (player.movement?.type === "walk") {
    if (player.energy < gameConfig.energy.dashCost) {
      return "insufficientEnergy" as const;
    }
    player.movement = {
      type: "dash",
      elapsedDistance: player.movement.elapsedDistance,
      remainingCells: gameConfig.action.dashDistanceTiles,
    };
    player.energy -= gameConfig.energy.dashCost;
    return "dash" as const;
  }
  player.direction = direction;
  const touchingBlock = findTouchingBlock(
    player.position,
    stage.blocks,
    direction,
  );
  // 墓石に触れているときは，ダッシュよりPushを優先．
  if (touchingBlock) {
    if (player.energy < gameConfig.energy.pushCost) {
      return "insufficientEnergy" as const;
    }
    if (!tryStartPush(stage, direction, touchingBlock)) {
      return "blocked" as const;
    }
    player.energy -= gameConfig.energy.pushCost;
    return "push" as const;
  }

  if (player.energy < gameConfig.energy.dashCost) {
    return "insufficientEnergy" as const;
  }
  if (isCellBlocked(stage, getNextPosition(player.position, direction))) {
    return "blocked" as const;
  }
  // ダッシュ中はアイテムの重さを反映しない．
  player.movement = {
    type: "dash",
    elapsedDistance: 0,
    remainingCells: gameConfig.action.dashDistanceTiles,
  };
  player.energy -= gameConfig.energy.dashCost;
  return "dash" as const;
};
