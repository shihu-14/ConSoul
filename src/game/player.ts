import {
  gameConfig,
  getPlayerDashSpeedTilesPerSecond,
  getPlayerSpeedTilesPerSecond,
} from "./config";
import { findTouchingBlock, tryStartPush } from "./block";
import { GameSignal } from "./events";
import { getNextPosition, isCellBlocked, positionsEqual } from "./grid";
import {
  CharacterType,
  Direction,
  PlayerState,
  Position,
  StageState,
} from "./types";

const EPS = 1e-8;

export const createPlayer = (
  characterType: CharacterType,
  logicalPosition: Readonly<Position>,
): PlayerState => ({
  position: { ...logicalPosition },
  direction: "right",
  characterType,
  movement: null,
  energy: gameConfig.energy.maximum,
  heldItems: [],
});

const collectItems = (player: PlayerState, stage: StageState) => {
  const collected = stage.remainingItems.filter((item) =>
    positionsEqual(player.position, item.position),
  );
  if (collected.length === 0) return false;
  const collectedSet = new Set(collected);
  stage.remainingItems = stage.remainingItems.filter(
    (item) => !collectedSet.has(item),
  );
  player.heldItems.push(...collected);
  return true;
};

const deliverItems = (player: PlayerState, stage: StageState) => {
  if (
    player.heldItems.length === 0 ||
    !positionsEqual(player.position, stage.post)
  ) {
    return false;
  }
  stage.deliveredItems.push(...player.heldItems);
  player.heldItems = [];
  return true;
};

const recoverPlayerEnergy = (
  player: PlayerState,
  deltaSeconds: number,
): void => {
  player.energy = Math.min(
    gameConfig.energy.maximum,
    player.energy + deltaSeconds * gameConfig.energy.recoveryPerSecond,
  );
};

const resolvePlayerItems = (
  player: PlayerState,
  stage: StageState,
  signals: GameSignal[],
): void => {
  if (collectItems(player, stage)) signals.push({ type: "itemPickup" });
  if (deliverItems(player, stage)) signals.push({ type: "itemDeliver" });
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
