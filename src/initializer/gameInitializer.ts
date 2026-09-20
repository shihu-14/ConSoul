import {
  getCurrentMap,
  resetCurrentStage,
  stageReset,
} from "../controller/stageController";
import { PlayerData } from "../data/playerData";
import { settings } from "../settings";
import {
  getPlayerMoveIntervalSeconds,
  playerEnergyBalance,
} from "../config/gameBalance";
import { PlayerInputState } from "../data/playerInput";
import { resetPlayerInputState } from "../game/playerAction";
import { MovementEffectState } from "../data/movementEffect";

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
  playerData.energy = playerEnergyBalance.maximumEnergy;
  playerData.energyUpdatedAtSeconds = nowSeconds;
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
  if (input) resetPlayerInputState(input);

  settings.start = nowMilliseconds;
};

export const retryCurrentStage = (
  playerData: PlayerData,
  input: PlayerInputState,
  movementEffects: MovementEffectState,
  nowSeconds = performance.now() / 1000,
) => {
  resetCurrentStage(nowSeconds);
  resetPlayerPosition(playerData, nowSeconds);
  playerData.nouhin = 0;
  resetPlayerInputState(input);
  movementEffects.particles = [];
};
