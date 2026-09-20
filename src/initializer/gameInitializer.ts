import { getCurrentMap, stageReset } from "../controller/stageController";
import { PlayerData } from "../data/playerData";
import { settings } from "../settings";
import { getPlayerMoveIntervalSeconds } from "../config/gameBalance";
import { PlayerInputState } from "../data/playerInput";

export const resetPlayerPosition = (
  playerData: PlayerData,
  nowSeconds = performance.now() / 1000,
) => {
  const [startX, startY] = getCurrentMap().playerStart;
  playerData.x = startX;
  playerData.y = startY;
  playerData.targetX = startX;
  playerData.targetY = startY;
  playerData.preX = startX;
  playerData.preY = startY;
  playerData.start = nowSeconds;
  playerData.movementState = { kind: "normal" };
  playerData.dashReadyAtSeconds = nowSeconds;
  playerData.heldItems = [];
  playerData.activeMoveIntervalSeconds = getPlayerMoveIntervalSeconds(
    playerData.shurui,
    0,
  );
};

export const gameInitializer = (
  playerData: PlayerData,
  input?: PlayerInputState,
  nowMilliseconds = performance.now(),
) => {
  const nowSeconds = nowMilliseconds / 1000;
  stageReset(nowSeconds);
  resetPlayerPosition(playerData, nowSeconds);
  playerData.forward = "ArrowRight";
  playerData.nouhin = 0;
  if (input) {
    input.direction = "None";
    input.queuedForce = null;
  }

  settings.start = nowMilliseconds;
};
