import {
  Direction,
  GameSignal,
  PlayerState,
  StageState,
  gameConfig,
  getNextPosition,
  getPlayerDashSpeedTilesPerSecond,
  getPlayerSpeedTilesPerSecond,
  isCellBlocked,
} from "../shared";
import { resolvePlayerItems } from "./inventory";

const EPS = 1e-8;

const recoverPlayerEnergy = (
  player: PlayerState,
  deltaSeconds: number,
): void => {
  player.energy = Math.min(
    gameConfig.energy.maximum,
    player.energy + deltaSeconds * gameConfig.energy.recoveryPerSecond,
  );
};

const emitPlayerWalkSignals = (
  movement: PlayerState["movement"],
  previousElapsedDistance: number,
  speed: number,
  signals: GameSignal[],
  random: () => number,
): void => {
  if (
    movement?.type !== "walk" ||
    previousElapsedDistance + EPS >= gameConfig.audio.playerWalkDistanceTiles ||
    movement.elapsedDistance + EPS < gameConfig.audio.playerWalkDistanceTiles
  ) {
    return;
  }

  signals.push({
    type: "playerStep",
    durationSeconds: gameConfig.audio.playerWalkDistanceTiles / speed,
  });
  if (random() < gameConfig.audio.playerCreakProbability) {
    signals.push({ type: "playerCreak" });
  }
};

const advancePlayerMovement = (
  player: PlayerState,
  stage: StageState,
  moveDirection: Direction | null,
  deltaSeconds: number,
  signals: GameSignal[],
  random: () => number,
): void => {
  let remainingSeconds = deltaSeconds;
  let evaluateInput = true;
  while (evaluateInput || remainingSeconds > EPS) {
    evaluateInput = false;
    if (!player.movement) {
      if (!moveDirection) return;
      player.direction = moveDirection;
      player.movement = { type: "walk", elapsedDistance: 0 };
    }

    const { movement } = player;
    if (
      movement.elapsedDistance <= EPS &&
      isCellBlocked(stage, getNextPosition(player.position, player.direction))
    ) {
      player.movement = null;
      return;
    }
    if (remainingSeconds <= EPS) return;

    const speed =
      movement.type === "dash"
        ? getPlayerDashSpeedTilesPerSecond(player.characterType)
        : getPlayerSpeedTilesPerSecond(
            player.characterType,
            player.heldItems.length,
          );
    const previousElapsedDistance = movement.elapsedDistance;
    const distanceToNextCell = 1 - movement.elapsedDistance;
    const distance = Math.min(speed * remainingSeconds, distanceToNextCell);
    movement.elapsedDistance += distance;
    remainingSeconds -= distance / speed;

    emitPlayerWalkSignals(
      movement,
      previousElapsedDistance,
      speed,
      signals,
      random,
    );

    if (distance + EPS < distanceToNextCell) return;
    player.position = getNextPosition(player.position, player.direction);
    resolvePlayerItems(player, stage, signals);

    if (movement.type === "dash") {
      movement.remainingCells -= 1;
      if (movement.remainingCells > 0) {
        movement.elapsedDistance = 0;
      } else {
        player.movement = null;
      }
    } else {
      player.movement = null;
    }
  }
};

// 移動中の方向は，次のセルに着くまで変えない．
export const updatePlayer = (
  player: PlayerState,
  stage: StageState,
  moveDirection: Direction | null,
  deltaSeconds: number,
  random: () => number = Math.random,
): GameSignal[] => {
  const signals: GameSignal[] = [];
  recoverPlayerEnergy(player, deltaSeconds);
  resolvePlayerItems(player, stage, signals);
  advancePlayerMovement(
    player,
    stage,
    moveDirection,
    deltaSeconds,
    signals,
    random,
  );
  return signals;
};
