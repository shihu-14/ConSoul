/**
 * ゲーム全体の生成，更新順，モード遷移，ステージ再生成を管理する．
 */

import { gameConfig } from "./config";
import { updateEnemies } from "./enemy";
import { getDisplayPosition, rectanglesOverlap } from "./grid";
import { updateBlocks } from "./block";
import { createPlayer, performPlayerAction, updatePlayer } from "./player";
import { createStage, getStageCount } from "./stage";
import { CharacterType, Direction, GameState } from "./types";

const EPSILON = 1e-8;

export const createGame = (nowSeconds: number): GameState => {
  const stage = createStage(0);
  return {
    mode: "title",
    modeStartedAtSeconds: nowSeconds,
    stageIndex: 0,
    stage,
    player: createPlayer("student", stage.playerStart),
    elapsedSeconds: 0,
  };
};

export const startGame = (
  game: GameState,
  characterType: CharacterType,
  nowSeconds: number,
) => {
  if (game.mode !== "title") return false;
  game.stageIndex = 0;
  game.stage = createStage(0);
  game.player = createPlayer(characterType, game.stage.playerStart);
  game.elapsedSeconds = 0;
  game.mode = "game";
  game.modeStartedAtSeconds = nowSeconds;
  return true;
};

export const retryStage = (game: GameState, nowSeconds: number) => {
  if (game.mode !== "game") return false;
  const { characterType } = game.player;
  game.stage = createStage(game.stageIndex);
  game.player = createPlayer(characterType, game.stage.playerStart);
  game.modeStartedAtSeconds = nowSeconds;
  return true;
};

export const performGameAction = (
  game: GameState,
  requestedDirection: Direction | null,
) => {
  if (game.mode !== "game") return "ignored" as const;
  return performPlayerAction(
    game.player,
    game.stage,
    requestedDirection ?? game.player.direction,
  );
};

export const returnToTitle = (game: GameState, nowSeconds: number) => {
  if (game.mode !== "result" && game.mode !== "gameOver") return false;
  game.mode = "title";
  game.modeStartedAtSeconds = nowSeconds;
  return true;
};

const completeStage = (game: GameState, nowSeconds: number) => {
  if (game.stageIndex >= getStageCount() - 1) {
    game.mode = "result";
    game.modeStartedAtSeconds = nowSeconds;
    return;
  }
  game.mode = "stageTransition";
  game.modeStartedAtSeconds = nowSeconds;
};

const startNextStage = (game: GameState, nowSeconds: number) => {
  game.stageIndex += 1;
  game.stage = createStage(game.stageIndex);
  game.player = createPlayer(game.player.characterType, game.stage.playerStart);
  game.mode = "game";
  game.modeStartedAtSeconds = nowSeconds;
};

const updateActiveGameStep = (
  game: GameState,
  moveDirection: Direction | null,
  deltaSeconds: number,
  nowSeconds: number,
  random: () => number,
) => {
  updateBlocks(game.stage, deltaSeconds);
  updateEnemies(game.stage, game.player, deltaSeconds, random);
  updatePlayer(game.player, game.stage, moveDirection, deltaSeconds);

  if (
    game.stage.remainingItems.length === 0 &&
    game.player.heldItems.length === 0 &&
    game.stage.deliveredItems.length > 0
  ) {
    completeStage(game, nowSeconds);
    return;
  }

  if (
    game.stage.enemies.some((enemy) => {
      const playerPosition = getDisplayPosition(
        game.player.position,
        game.player.movement ? game.player.direction : null,
        game.player.movement?.elapsedDistance ?? 0,
      );
      const enemyPosition = getDisplayPosition(
        enemy.position,
        enemy.movement ? enemy.direction : null,
        enemy.movement?.elapsedDistance ?? 0,
      );
      return rectanglesOverlap(playerPosition, enemyPosition);
    })
  ) {
    game.mode = "gameOver";
    game.modeStartedAtSeconds = nowSeconds;
  }
};

export const updateGame = (
  game: GameState,
  moveDirection: Direction | null,
  deltaSeconds: number,
  nowSeconds: number,
  random: () => number = Math.random,
) => {
  const elapsedDelta = Math.max(0, deltaSeconds);
  if (game.mode === "stageTransition") {
    game.elapsedSeconds += elapsedDelta;
    // 進行度を別状態にせず，モード開始時刻と固定時間の差だけで遷移を確定する．
    if (
      nowSeconds - game.modeStartedAtSeconds + EPSILON >=
      gameConfig.action.stageTransitionSeconds
    ) {
      startNextStage(game, nowSeconds);
    }
    return;
  }
  if (game.mode !== "game") return;

  game.elapsedSeconds += elapsedDelta;

  // 長時間停止後は実時間だけを記録し，シミュレーションの追いつき量を制限する．
  const simulationDelta = Math.min(
    elapsedDelta,
    gameConfig.simulation.maximumCatchUpSeconds,
  );
  const skippedSimulationSeconds = elapsedDelta - simulationDelta;
  if (skippedSimulationSeconds > EPSILON) {
    game.player.energy = Math.min(
      gameConfig.energy.maximum,
      game.player.energy +
        skippedSimulationSeconds * gameConfig.energy.recoveryPerSecond,
    );
  }

  if (elapsedDelta <= EPSILON) {
    updateActiveGameStep(game, moveDirection, 0, nowSeconds, random);
    return;
  }

  // Actor同士の途中交差も判定するため，長いフレームを固定幅で更新する．
  let remainingSeconds = simulationDelta;
  let currentSeconds = nowSeconds - simulationDelta;
  while (remainingSeconds > EPSILON && game.mode === "game") {
    const stepSeconds = Math.min(
      remainingSeconds,
      gameConfig.simulation.maximumStepSeconds,
    );
    currentSeconds += stepSeconds;
    updateActiveGameStep(
      game,
      moveDirection,
      stepSeconds,
      currentSeconds,
      random,
    );
    remainingSeconds -= stepSeconds;
  }
};
