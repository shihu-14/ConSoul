import { GhostData } from "../data/ghostData";
import { MapData } from "../data/mapData";
import { PlayerData } from "../data/playerData";
import { ghostType } from "../type/ghostType";
import { isWalkable } from "../game/map";
import { enemyBehaviorBalance } from "../config/gameBalance";
import { BlockData } from "../data/blockData";
import { createBlockPositionSet, isOpenCell } from "../game/occupancy";

export const checkCollisionWall = (gx: number, gy: number, mapData: MapData) =>
  isWalkable(mapData, gx, gy);

export const ghostMover = (
  ghostData: GhostData,
  mapData: MapData,
  playerData: PlayerData,
  nowSeconds = performance.now() / 1000,
  blocks: readonly BlockData[] = [],
) => {
  const occupiedBlocks = createBlockPositionSet(blocks);
  const { activeMoveIntervalSeconds } = ghostData;
  if (nowSeconds - ghostData.gstart < activeMoveIntervalSeconds) {
    ghostData.gx =
      (ghostData.gtargetX - ghostData.gpreX) *
        ((nowSeconds - ghostData.gstart) / activeMoveIntervalSeconds) +
      ghostData.gpreX;
    ghostData.gy =
      (ghostData.gtargetY - ghostData.gpreY) *
        ((nowSeconds - ghostData.gstart) / activeMoveIntervalSeconds) +
      ghostData.gpreY;
  } else {
    ghostData.gx = ghostData.gtargetX;
    ghostData.gy = ghostData.gtargetY;
    ghostType(ghostData, playerData, mapData, Math.random, occupiedBlocks);
    let speedMultiplier = 1;
    if (ghostData.state.kind === "alertingChase") {
      ghostData.activeMoveIntervalSeconds =
        enemyBehaviorBalance.chaseAlertDurationSeconds;
    } else if (ghostData.state.kind === "alertingCharge") {
      ghostData.activeMoveIntervalSeconds =
        enemyBehaviorBalance.chargeAlertDurationSeconds;
    } else if (ghostData.state.kind === "stunned") {
      ghostData.activeMoveIntervalSeconds =
        enemyBehaviorBalance.chargeBlockStunDurationSeconds;
    } else {
      if (ghostData.state.kind === "charging") {
        speedMultiplier = enemyBehaviorBalance.chargeSpeedMultiplier;
      } else if (ghostData.state.kind === "chasing") {
        speedMultiplier = enemyBehaviorBalance.chaseSpeedMultiplier;
      }
      ghostData.activeMoveIntervalSeconds =
        ghostData.balance.moveIntervalSeconds * speedMultiplier;
    }
    ghostData.gstart = nowSeconds;
    ghostData.gpreX = ghostData.gtargetX;
    ghostData.gpreY = ghostData.gtargetY;
    switch (ghostData.gdirect) {
      case "gUp":
        ghostData.gtargetX = ghostData.gpreX;
        ghostData.gtargetY = ghostData.gpreY - 1;
        break;
      case "gDown":
        ghostData.gtargetX = ghostData.gpreX;
        ghostData.gtargetY = ghostData.gpreY + 1;
        break;
      case "gLeft":
        ghostData.gtargetX = ghostData.gpreX - 1;
        ghostData.gtargetY = ghostData.gpreY;
        break;
      case "gRight":
        ghostData.gtargetX = ghostData.gpreX + 1;
        ghostData.gtargetY = ghostData.gpreY;
        break;
      case "gNone":
        break;
      default:
        throw new Error("ghostDirectionErrorです");
    }
    if (
      !isOpenCell(
        mapData,
        occupiedBlocks,
        ghostData.gtargetX,
        ghostData.gtargetY,
      )
    ) {
      ghostData.gtargetX = ghostData.gpreX;
      ghostData.gtargetY = ghostData.gpreY;
    }
  }
};
