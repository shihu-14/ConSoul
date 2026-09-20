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
  resetPlayerInputState,
} from "../game/playerAction";
import { BlockData } from "../data/blockData";
import { hasBlockAt, isOpenCell } from "../game/occupancy";
import { tryPullBlock, tryPushBlockChain } from "../game/blockLogic";

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
    if (!input.queuedForce && isCardinalPlayerDirection(input.direction)) {
      playerData.forward = input.direction;
    }

    let suppressNormalMovement = false;
    let consumeForce = false;
    if (input.queuedForce && playerData.movementState.kind === "normal") {
      const context = {
        map: mapData,
        blocks,
        player: playerData,
        ghosts: ghostDatas,
      };
      if (input.queuedForce.kind === "pull") {
        playerData.forward = input.queuedForce.blockDirection;
        tryPullBlock(
          context,
          input.queuedForce.blockDirection,
          input.queuedForce.retreatDirection,
        );
        suppressNormalMovement = true;
        consumeForce = true;
      } else {
        const direction =
          input.queuedForce.kind === "dash"
            ? input.queuedForce.direction
            : input.queuedForce.blockDirection;
        playerData.forward = direction;
        const [dx, dy] = getPlayerDirectionDelta(direction);
        const hasFrontBlock = hasBlockAt(
          blocks,
          playerData.preX + dx,
          playerData.preY + dy,
        );
        if (
          input.queuedForce.kind === "grip" &&
          hasFrontBlock &&
          input.spaceHeld
        ) {
          suppressNormalMovement = true;
        } else if (hasFrontBlock) {
          tryPushBlockChain(context, direction);
          suppressNormalMovement = true;
          consumeForce = true;
        } else {
          consumeForce = true;
          if (
            isOpenCell(
              mapData,
              blocks,
              playerData.preX + dx,
              playerData.preY + dy,
            )
          ) {
            playerData.movementState = {
              kind: "dashing",
              direction,
              remainingTiles: playerActionBalance.dashDistanceTiles,
            };
          } else {
            suppressNormalMovement = true;
          }
        }
      }
    }
    if (consumeForce) input.queuedForce = null;

    const { movementState } = playerData;
    const wasDashing = movementState.kind === "dashing";
    let movementDirection = input.direction;
    if (wasDashing) {
      movementDirection = movementState.direction;
    } else if (suppressNormalMovement) {
      movementDirection = "None";
    }
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
      resetPlayerInputState(input);
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
