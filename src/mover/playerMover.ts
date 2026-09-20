/* eslint-disable max-len */
import { MapData } from "../data/mapData";
import { PlayerData } from "../data/playerData";
import { GhostData } from "../data/ghostData";
import { settings } from "../settings";
import { moveNextMap } from "../controller/stageController";
import { resetPlayerPosition } from "../initializer/gameInitializer";
import {
  collectItemAtPlayerPosition,
  deliverItemAtPost,
  playerMeetsGhost,
} from "../game/playerLogic";
import {
  getPlayerMoveIntervalSeconds,
  playerActionBalance,
} from "../config/gameBalance";
import { PlayerInputState } from "../data/playerInput";
import {
  getPlayerDirectionDelta,
  isCardinalPlayerDirection,
} from "../game/playerAction";
import { BlockData } from "../data/blockData";
import { isOpenCell } from "../game/occupancy";
import { hasPushableBlock, tryPushBlock } from "../game/blockLogic";

export const playerMover = (
  playerData: PlayerData,
  mapData: MapData,
  ghostDatas: GhostData[],
  input: PlayerInputState,
  now = performance.now() / 1000,
  blocks: BlockData[] = [],
) => {
  const isStationary =
    playerData.targetX === playerData.preX &&
    playerData.targetY === playerData.preY;
  const interval = isStationary ? 0 : playerData.activeMoveIntervalSeconds;
  if (now - playerData.start < interval) {
    playerData.x =
      (playerData.targetX - playerData.preX) *
        ((now - playerData.start) / interval) +
      playerData.preX;
    playerData.y =
      (playerData.targetY - playerData.preY) *
        ((now - playerData.start) / interval) +
      playerData.preY;
  } else {
    playerData.start = now;
    playerData.preX = playerData.targetX;
    playerData.x = playerData.preX;
    playerData.preY = playerData.targetY;
    playerData.y = playerData.preY;
    if (isCardinalPlayerDirection(input.direction)) {
      playerData.forward = input.direction;
    }

    let forceWasPush = false;
    if (input.queuedForce && playerData.movementState.kind === "normal") {
      const context = {
        map: mapData,
        blocks,
        player: playerData,
        ghosts: ghostDatas,
      };
      if (hasPushableBlock(context, input.queuedForce.direction)) {
        tryPushBlock(context, input.queuedForce.direction);
        forceWasPush = true;
      }
    }
    if (
      input.queuedForce &&
      !forceWasPush &&
      playerData.movementState.kind === "normal" &&
      now >= playerData.dashReadyAtSeconds
    ) {
      const { direction } = input.queuedForce;
      const [dx, dy] = getPlayerDirectionDelta(direction);
      if (
        isOpenCell(mapData, blocks, playerData.preX + dx, playerData.preY + dy)
      ) {
        playerData.movementState = {
          kind: "dashing",
          direction,
          remainingTiles: playerActionBalance.dashDistanceTiles,
        };
        playerData.dashReadyAtSeconds =
          now + playerActionBalance.dashCooldownSeconds;
      }
    }
    input.queuedForce = null;

    const { movementState } = playerData;
    const wasDashing = movementState.kind === "dashing";
    const movementDirection = wasDashing
      ? movementState.direction
      : input.direction;
    if (isCardinalPlayerDirection(movementDirection)) {
      const [dx, dy] = getPlayerDirectionDelta(movementDirection);
      playerData.targetX = playerData.preX + dx;
      playerData.targetY = playerData.preY + dy;
    }

    if (!isOpenCell(mapData, blocks, playerData.targetX, playerData.targetY)) {
      playerData.targetX = playerData.preX;
      playerData.targetY = playerData.preY;
      if (wasDashing) playerData.movementState = { kind: "normal" };
    } else if (wasDashing) {
      const remainingTiles = movementState.remainingTiles - 1;
      playerData.movementState =
        remainingTiles > 0
          ? {
              ...movementState,
              remainingTiles,
            }
          : { kind: "normal" };
    }

    collectItemAtPlayerPosition(playerData, mapData);
    deliverItemAtPost(playerData, mapData);

    if (playerData.nouhin === mapData.items.length) {
      playerData.nouhin = 0;
      moveNextMap(now);
      if (settings.mode === "game") {
        resetPlayerPosition(playerData, now);
      }
      return;
    }

    playerData.activeMoveIntervalSeconds = getPlayerMoveIntervalSeconds(
      playerData.shurui,
      playerData.heldItems.length,
    );
    if (wasDashing) {
      playerData.activeMoveIntervalSeconds *=
        playerActionBalance.dashMoveIntervalMultiplier;
    }
  }

  for (let i = 0; i < ghostDatas.length; i += 1) {
    if (playerMeetsGhost(playerData, ghostDatas[i])) {
      settings.mode = "result2";
    }
  }
};
