/**
 * Enemy全体で共有する移動，時間，Block判定，方向選択を処理する．
 */

// 残り時間を同じ共通ループで再評価するため，continueを使用する．
/* eslint-disable no-continue */

import { gameConfig, getEnemySpeedTilesPerSecond } from "../config";
import { GameSignal } from "../events";
import {
  getBlockedCellKeys,
  getNextPosition,
  isCellBlocked,
  positionsEqual,
} from "../grid";
import {
  Direction,
  EnemyState,
  PlayerState,
  Position,
  StageState,
} from "../types";

const EPS = 1e-8;

export const directions: readonly Direction[] = ["up", "down", "left", "right"];
export const oppositeDirection: Record<Direction, Direction> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

/**
 * 配列から乱数で1要素を選択する．
 * 乱数が範囲外でも配列の先頭または末尾に収め，呼び出し側の選択処理を安定させる．
 */
export const chooseRandom = <T>(values: readonly T[], random: () => number) => {
  const index = Math.min(
    values.length - 1,
    Math.max(0, Math.floor(random() * values.length)),
  );
  return values[index];
};

/**
 * Enemyの現在セルから移動可能な方向だけを抽出する．
 * 盤面外とBlockの起点・導出先はStageの壁判定に従って除外する．
 */
export const getLegalDirections = (enemy: EnemyState, stage: StageState) =>
  directions.filter(
    (direction) =>
      !isCellBlocked(stage, getNextPosition(enemy.position, direction)),
  );

/**
 * Enemyの次の移動方向をランダムに選択する．
 * 可能なら直前方向の逆走を避け，逆走以外の選択肢がなければ合法方向から選ぶ．
 */
export const chooseRandomDirection = (
  enemy: EnemyState,
  stage: StageState,
  random: () => number,
) => {
  const legal = getLegalDirections(enemy, stage);
  if (legal.length === 0) return null;
  if (!enemy.direction) return chooseRandom(legal, random);
  const forward = legal.filter(
    (direction) => direction !== oppositeDirection[enemy.direction!],
  );
  return chooseRandom(forward.length > 0 ? forward : legal, random);
};

/**
 * PlayerがEnemyの検知範囲内にいるかマンハッタン距離で判定する．
 * 検知範囲は選択中のキャラクター設定から取得する．
 */
export const isDetected = (enemy: EnemyState, player: PlayerState) =>
  Math.abs(enemy.position.x - player.position.x) +
    Math.abs(enemy.position.y - player.position.y) <=
  gameConfig.player[player.characterType].detectionRangeTiles;

/**
 * EnemyとPlayerが同一直線上にいてBlockに遮られていない場合の方向を返す．
 * 同一直線上でない場合，または途中セルにBlockがある場合はnullを返す．
 */
export const getLineOfSightDirection = (
  enemy: EnemyState,
  player: PlayerState,
  stage: StageState,
): Direction | null => {
  const dx = player.position.x - enemy.position.x;
  const dy = player.position.y - enemy.position.y;
  if ((dx !== 0 && dy !== 0) || (dx === 0 && dy === 0)) return null;
  const stepX = Math.sign(dx);
  const stepY = Math.sign(dy);
  const blocked = getBlockedCellKeys(stage);
  let logicalX = enemy.position.x + stepX;
  let logicalY = enemy.position.y + stepY;
  while (logicalX !== player.position.x || logicalY !== player.position.y) {
    if (blocked.has(`${logicalX},${logicalY}`)) return null;
    logicalX += stepX;
    logicalY += stepY;
  }
  if (stepX < 0) return "left";
  if (stepX > 0) return "right";
  return stepY < 0 ? "up" : "down";
};

export type EnemyBehavior<T extends EnemyState> = {
  chooseDirectionAtCell: (
    enemy: T,
    player: PlayerState,
    stage: StageState,
    random: () => number,
  ) => readonly GameSignal[];
  getSpeedTilesPerSecond?: (enemy: T) => number;
  timedMode?: {
    getElapsedTime: (enemy: T) => number;
    addElapsedTime: (enemy: T, seconds: number) => void;
    getWaitTime: (enemy: T) => number | null;
    finish: (enemy: T) => void;
  };
  onMovementStarted?: (enemy: T) => void;
  onBlockedCell?: (enemy: T, stage: StageState) => void;
};

/**
 * 指定したlogicalPositionのセルを占有しているBlockを返す．
 * 移動中Blockは整数起点と導出先の両方を占有セルとして扱う．
 */
export const findBlockAtCell = (
  stage: StageState,
  logicalPosition: Readonly<Position>,
) =>
  stage.blocks.find(
    (block) =>
      positionsEqual(block.position, logicalPosition) ||
      (block.movement !== null &&
        positionsEqual(
          getNextPosition(block.position, block.movement.direction),
          logicalPosition,
        )),
  );

/**
 * Enemyが次セルへ進めない場合の通常停止処理を行う．
 * Rushだけは専用のBlock衝突処理を持つため，呼び出し側から上書きできる．
 */
export const stopAtBlockedCell = (enemy: EnemyState) => {
  enemy.direction = null;
  enemy.movement = null;
};

/**
 * 1体のEnemyを時間経過分だけ更新する．
 * 時間付きモードの待機とセル単位の移動を順に処理し，EnemyのlogicalPositionはセル完了時だけ整数更新する．
 * 1回の呼び出しで複数セル進む場合も，残り時間を使って状態遷移を連続処理する．
 */
export const updateEnemy = <T extends EnemyState>(
  enemy: T,
  player: PlayerState,
  stage: StageState,
  deltaSeconds: number,
  random: () => number,
  behavior: EnemyBehavior<T>,
  signals: GameSignal[],
): void => {
  let remainingSeconds = Math.max(0, deltaSeconds);
  let evaluateState = true;

  // 時間モードと1マス移動を順に消費し，フレーム分割による結果の差を作らない．
  while (evaluateState || remainingSeconds > EPS) {
    evaluateState = false;
    const { timedMode } = behavior;
    if (timedMode) {
      const modeWaitTime = timedMode.getWaitTime(enemy);
      if (modeWaitTime !== null) {
        const waitRemaining = Math.max(
          0,
          modeWaitTime - timedMode.getElapsedTime(enemy),
        );
        const consumedTime = Math.min(remainingSeconds, waitRemaining);
        timedMode.addElapsedTime(enemy, consumedTime);
        remainingSeconds = Math.max(0, remainingSeconds - consumedTime);
        if (consumedTime + EPS < waitRemaining) return;
        timedMode.finish(enemy);
        const waitTimeAfterFinish = timedMode.getWaitTime(enemy);
        if (
          waitTimeAfterFinish !== null &&
          waitTimeAfterFinish - timedMode.getElapsedTime(enemy) <= EPS
        ) {
          return;
        }
        evaluateState = true;
        continue;
      }
    }

    // 方向決定はセル境界だけで行い，移動中の方向を固定する．
    if (!enemy.movement) {
      signals.push(
        ...behavior.chooseDirectionAtCell(enemy, player, stage, random),
      );
      if ((behavior.timedMode?.getWaitTime(enemy) ?? null) !== null) {
        continue;
      }
      if (!enemy.direction || remainingSeconds <= EPS) {
        timedMode?.addElapsedTime(enemy, remainingSeconds);
        return;
      }
      const nextLogicalPosition = getNextPosition(
        enemy.position,
        enemy.direction,
      );
      // 次セルが塞がっている場合はEnemy種別ごとの停止処理を行う．
      if (isCellBlocked(stage, nextLogicalPosition)) {
        if (behavior.onBlockedCell) {
          behavior.onBlockedCell(enemy, stage);
        } else {
          stopAtBlockedCell(enemy);
        }
        continue;
      }
      enemy.movement = { elapsedDistance: 0 };
      behavior.onMovementStarted?.(enemy);
    }

    if (!enemy.direction || !enemy.movement) return;
    const speed =
      behavior.getSpeedTilesPerSecond?.(enemy) ?? getEnemySpeedTilesPerSecond();
    const distanceRemaining = 1 - enemy.movement.elapsedDistance;
    const distance = Math.min(speed * remainingSeconds, distanceRemaining);
    enemy.movement.elapsedDistance += distance;
    const consumedTime = distance / speed;
    timedMode?.addElapsedTime(enemy, consumedTime);
    remainingSeconds = Math.max(0, remainingSeconds - consumedTime);

    if (distance + EPS < distanceRemaining) return;
    enemy.position = getNextPosition(enemy.position, enemy.direction);
    enemy.movement = null;
  }
};
