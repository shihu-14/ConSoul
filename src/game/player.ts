/**
 * プレイヤーの連続移動，Dash，Energy，アイテム移動，Action選択を処理する．
 */

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

/**
 * Playerの初期状態を作成する．
 * logicalPositionを移動完了済みの整数セル座標として複製し，方向は右向き，移動状態は未開始，Energyは最大値，所持アイテムは空で初期化する．
 */
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

/**
 * Playerが現在いる整数セルに残っているItemを取得する．
 * 取得したItemはStageのremainingItemsから同じオブジェクトのまま取り除き，PlayerのheldItemsへ移動する．
 */
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

/**
 * PlayerがPostの整数セルに到達したとき，所持中のItemを一括で納品する．
 * 納品後はPlayerのheldItemsを空にし，StageのdeliveredItemsへ同じItemオブジェクトを移動する．
 */
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

/**
 * deltaSecondsを負数補正してPlayerのEnergyを回復する．
 * PlayerのEnergyだけを最大値まで更新し，最大値を超えない不変条件を守る．
 */
const recoverPlayerEnergy = (
  player: PlayerState,
  deltaSeconds: number,
): void => {
  const elapsedSeconds = Math.max(0, deltaSeconds);
  player.energy = Math.min(
    gameConfig.energy.maximum,
    player.energy + elapsedSeconds * gameConfig.energy.recoveryPerSecond,
  );
};

/**
 * 現在セルのItem取得とPost納品を順序どおり解決する．
 * StageとPlayerのItem配列を更新し，発生した処理ごとにGameSignalを追加する．
 */
const resolvePlayerItems = (
  player: PlayerState,
  stage: StageState,
  signals: GameSignal[],
): void => {
  if (collectItems(player, stage)) signals.push({ type: "itemPickup" });
  if (deliverItems(player, stage)) signals.push({ type: "itemDeliver" });
};

/**
 * 歩行距離の境界通過時だけ歩行と軋みのGameSignalを発生させる．
 * 歩行以外の移動，特にDashではSignalを発生させず，既存のSignal配列だけを追加更新する．
 */
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

/**
 * 入力方向を固定して壁判定，elapsedDistance，セル境界，Dash残りセル，残り時間を処理する．
 * 移動状態とSignal配列を更新し，PlayerのlogicalPositionはセル完了時だけ更新する不変条件を守る．
 */
const advancePlayerMovement = (
  player: PlayerState,
  stage: StageState,
  moveDirection: Direction | null,
  deltaSeconds: number,
  signals: GameSignal[],
  random: () => number,
): void => {
  let remainingSeconds = Math.max(0, deltaSeconds);
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
    remainingSeconds = Math.max(0, remainingSeconds - distance / speed);

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

/**
 * Playerの通常歩行とDashを時間経過分だけ進める．
 * 移動中のdirectionはセル境界まで固定し，次のセルへ進む直前だけ新しい入力方向を採用する．
 * logicalPositionはセル境界で整数更新し，セル途中のdisplayPositionはmovement.elapsedDistanceからRendererが導出する．
 * Energy回復と現在セルのItem効果を解決してから移動を進める．
 */
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

/**
 * Space相当の1回のActionを処理する．
 * 歩行中は現在方向のDashへ切り替え，Dash中は無視する．停止中は接触BlockのPushを優先する．
 */
export const performPlayerAction = (
  player: PlayerState,
  stage: StageState,
  direction: Direction,
) => {
  // Dash中の方向変更や二重開始を防ぐ．
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
  // Playerに接するBlockがある場合は，DashではなくPush判定を優先する．
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
  // Dash開始時点で次セルが塞がっている場合は，移動もEnergy消費も発生しない．
  if (isCellBlocked(stage, getNextPosition(player.position, direction))) {
    return "blocked" as const;
  }
  // Dashの速度は開始時のキャラクターから決まり，Item取得後もDash中は変化しない．
  player.movement = {
    type: "dash",
    elapsedDistance: 0,
    remainingCells: gameConfig.action.dashDistanceTiles,
  };
  player.energy -= gameConfig.energy.dashCost;
  return "dash" as const;
};
