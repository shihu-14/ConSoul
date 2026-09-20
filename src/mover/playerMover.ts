/* eslint-disable max-len */
import { MapData } from "../data/mapData";
import { PlayerData } from "../data/playerData";
import { GhostData } from "../data/ghostData";
import { settings } from "../settings";
import { beginStageTransition } from "../controller/stageController";
import {
  collectItemAtPlayerPosition,
  deliverItemAtPost,
  playerMeetsGhost,
} from "../game/playerLogic";
import {
  getPlayerDashMoveIntervalSeconds,
  getPlayerMoveIntervalSeconds,
  playerActionBalance,
  playerEnergyBalance,
} from "../config/gameBalance";
import { PlayerInputState } from "../data/playerInput";
import {
  getPlayerDirectionDelta,
  isCardinalPlayerDirection,
  resetPlayerInputState,
} from "../game/playerAction";
import { BlockData } from "../data/blockData";
import { hasBlockAt, isOpenCell } from "../game/occupancy";
import { tryPushBlockChain } from "../game/blockLogic";
import { recoverPlayerEnergy, spendPlayerEnergy } from "../game/playerEnergy";

export const playerMover = (
  playerData: PlayerData,
  mapData: MapData,
  ghostDatas: GhostData[],
  input: PlayerInputState,
  now = performance.now() / 1000,
  blocks: BlockData[] = [],
) => {
  if (settings.mode === "stageTransition") return;
  recoverPlayerEnergy(playerData, now);
  if (playerData.movementState.kind === "dashing") {
    input.queuedForce = null;
  }
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
    if (
      playerData.movementState.kind === "dashing" &&
      playerData.movementState.remainingTiles === 0
    ) {
      playerData.movementState = { kind: "normal" };
    }
    if (input.queuedForce && playerData.movementState.kind === "normal") {
      const context = {
        map: mapData,
        blocks,
        player: playerData,
        ghosts: ghostDatas,
      };
      const { direction } = input.queuedForce;
      playerData.forward = direction;
      const [dx, dy] = getPlayerDirectionDelta(direction);
      const hasFrontBlock = hasBlockAt(
        blocks,
        playerData.preX + dx,
        playerData.preY + dy,
      );
      consumeForce = true;
      if (hasFrontBlock) {
        if (playerData.energy >= playerEnergyBalance.pushEnergyCost) {
          const result = tryPushBlockChain(context, direction, now);
          if (result.kind === "pushed") {
            spendPlayerEnergy(playerData, playerEnergyBalance.pushEnergyCost);
          }
        }
        suppressNormalMovement = true;
      } else if (
        playerData.energy >= playerEnergyBalance.dashEnergyCost &&
        isOpenCell(mapData, blocks, playerData.preX + dx, playerData.preY + dy)
      ) {
        playerData.movementState = {
          kind: "dashing",
          direction,
          remainingTiles: playerActionBalance.dashDistanceTiles,
        };
        spendPlayerEnergy(playerData, playerEnergyBalance.dashEnergyCost);
      } else {
        suppressNormalMovement = true;
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
      playerData.movementState = {
        ...movementState,
        remainingTiles,
      };
    }

    collectItemAtPlayerPosition(playerData, mapData);
    deliverItemAtPost(playerData, mapData);

    if (playerData.nouhin === mapData.items.length) {
      playerData.nouhin = 0;
      beginStageTransition(now);
      resetPlayerInputState(input);
      return;
    }

    playerData.activeMoveIntervalSeconds = getPlayerMoveIntervalSeconds(
      playerData.shurui,
      playerData.heldItems.length,
    );
    if (wasDashing) {
      playerData.activeMoveIntervalSeconds = getPlayerDashMoveIntervalSeconds(
        playerData.shurui,
        playerData.heldItems.length,
      );
    }
  }

  for (let i = 0; i < ghostDatas.length; i += 1) {
    if (playerMeetsGhost(playerData, ghostDatas[i])) {
      settings.mode = "result2";
    }
  }
};
