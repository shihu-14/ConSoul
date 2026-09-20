/**
 * プレイヤーの連続移動，Dash，Energy，アイテム移動，Action選択を処理する．
 */

import {
  gameConfig,
  getPlayerDashSpeedTilesPerSecond,
  getPlayerSpeedTilesPerSecond,
} from "./config";
import { findTouchingBlock, tryStartPush } from "./block";
import { getNextPosition, isCellBlocked, positionsEqual } from "./grid";
import {
  CharacterType,
  Direction,
  PlayerState,
  Position,
  StageState,
} from "./types";

const EPSILON = 1e-8;

/**
 * Playerの初期状態を作成する。
 * positionは移動完了済みの整数セル座標として複製し、方向は右向き、移動状態は未開始、Energyは最大値、所持アイテムは空で初期化する。
 */
export const createPlayer = (
  characterType: CharacterType,
  position: Position,
): PlayerState => ({
  position: { ...position },
  direction: "right",
  characterType,
  movement: null,
  energy: gameConfig.energy.maximum,
  heldItems: [],
});

/**
 * Playerが現在いる整数セルに残っているItemを取得する。
 * 取得したItemはStageのremainingItemsから同じオブジェクトのまま取り除き、PlayerのheldItemsへ移動する。
 */
const collectItems = (player: PlayerState, stage: StageState) => {
  const collected = stage.remainingItems.filter((item) =>
    positionsEqual(player.position, item.position),
  );
  if (collected.length === 0) return;
  const collectedSet = new Set(collected);
  stage.remainingItems = stage.remainingItems.filter(
    (item) => !collectedSet.has(item),
  );
  player.heldItems.push(...collected);
};

/**
 * PlayerがPostの整数セルに到達したとき、所持中のItemを一括で納品する。
 * 納品後はPlayerのheldItemsを空にし、StageのdeliveredItemsへ同じItemオブジェクトを移動する。
 */
const deliverItems = (player: PlayerState, stage: StageState) => {
  if (
    player.heldItems.length === 0 ||
    !positionsEqual(player.position, stage.post)
  ) {
    return;
  }
  stage.deliveredItems.push(...player.heldItems);
  player.heldItems = [];
};

/**
 * Playerの通常歩行とDashを時間経過分だけ進める。
 * 移動中のdirectionはセル境界まで固定し、次のセルへ進む直前だけ新しい入力方向を採用する。
 * positionはセル境界で整数更新し、セル途中の表示位置はmovement.elapsedDistanceからRendererが導出する。
 * Energy回復、Item取得、Postへの納品もこの更新処理に含める。
 */
export const updatePlayer = (
  player: PlayerState,
  stage: StageState,
  moveDirection: Direction | null,
  deltaSeconds: number,
) => {
  // 負の時間は受け付けず、Energy回復量と移動量を常に0以上にする。
  const elapsedSeconds = Math.max(0, deltaSeconds);
  // Energyは自然回復するが、設定された最大値を超えない。
  player.energy = Math.min(
    gameConfig.energy.maximum,
    player.energy + elapsedSeconds * gameConfig.energy.recoveryPerSecond,
  );

  collectItems(player, stage);
  deliverItems(player, stage);

  // 1回の更新で複数セル進めるため，未消費時間を保持してセル境界ごとに再評価する．
  let remainingSeconds = elapsedSeconds;
  let evaluateInput = true;
  while (evaluateInput || remainingSeconds > EPSILON) {
    evaluateInput = false;
    // 移動中でないセル境界だけで入力方向を採用する．移動中の方向はこの条件を通らないため固定される．
    if (!player.movement) {
      if (!moveDirection) return;
      player.direction = moveDirection;
      // 通常歩行は1セル分の移動として開始する．
      player.movement = { type: "walk", elapsedDistance: 0 };
    }

    const { movement } = player;
    if (
      movement.elapsedDistance <= EPSILON &&
      isCellBlocked(stage, getNextPosition(player.position, player.direction))
    ) {
      player.movement = null;
      return;
    }
    if (remainingSeconds <= EPSILON) return;

    const speed =
      movement.type === "dash"
        ? getPlayerDashSpeedTilesPerSecond(player.characterType)
        : getPlayerSpeedTilesPerSecond(
            player.characterType,
            player.heldItems.length,
          );
    const distanceToNextCell = 1 - movement.elapsedDistance;
    const distance = Math.min(speed * remainingSeconds, distanceToNextCell);
    movement.elapsedDistance += distance;
    remainingSeconds = Math.max(0, remainingSeconds - distance / speed);

    if (distance + EPSILON < distanceToNextCell) return;
    player.position = getNextPosition(player.position, player.direction);
    collectItems(player, stage);
    deliverItems(player, stage);

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
 * Space相当の1回のActionを処理する．
 * 歩行中は現在方向のDashへ切り替え，Dash中は無視する．停止中は接触BlockのPushを優先する．
 * 失敗したPushはDashへフォールバックせず，失敗したActionはEnergyを消費しない．
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
