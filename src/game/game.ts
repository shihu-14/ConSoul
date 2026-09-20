/**
 * ゲーム全体の生成，更新順，モード遷移，ステージ再生成を管理する．
 */

import { gameConfig } from "./config";
import { updateEnemies } from "./enemy";
import { getDisplayPosition, rectanglesOverlap } from "./grid";
import { updateBlocks } from "./block";
import { createPlayer, performPlayerAction, updatePlayer } from "./player";
import { createStage, getStageCount } from "./stage";
import { GameSignal } from "./events";
import { CharacterType, Direction, GameState } from "./types";

const EPS = 1e-8;

/**
 * タイトル画面から開始するGameStateを作成する．
 * Stage 1，初期Player，タイトルモード，経過時間0を新規に組み立てる．
 */
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

/**
 * タイトル画面で選択されたキャラクターによるゲームを開始する．
 * Stage 1とPlayerを再生成し，Run全体の経過時間を0へ戻してgameモードへ遷移する．
 */
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

/**
 * 現在のStageだけを初期状態へ戻す．
 * Stage番号と選択キャラクター，Run全体の経過時間を維持し，StageとPlayerを新規作成する．
 */

export const retryStage = (game: GameState, nowSeconds: number) => {
  if (game.mode !== "game") return false;
  const { characterType } = game.player;
  game.stage = createStage(game.stageIndex);
  game.player = createPlayer(characterType, game.stage.playerStart);
  game.modeStartedAtSeconds = nowSeconds;
  return true;
};

/**
 * Gameモード中のActionをPlayer処理へ転送する．
 * requestedDirectionがnullの場合はPlayerの現在方向を使い，Gameモード以外では無視する．
 */
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

/**
 * ResultまたはGameOver画面からタイトル画面へ戻す．
 * 対象モード以外では状態を変更せずfalseを返す．
 */
export const returnToTitle = (game: GameState, nowSeconds: number) => {
  if (game.mode !== "result" && game.mode !== "gameOver") return false;
  game.mode = "title";
  game.modeStartedAtSeconds = nowSeconds;
  return true;
};

/**
 * Item納品完了時のStage終了先を決定する．
 * 最終Stageならresultへ，途中StageならstageTransitionへ遷移し，モード開始時刻を記録する．
 */
const completeStage = (game: GameState, nowSeconds: number) => {
  if (game.stageIndex >= getStageCount() - 1) {
    game.mode = "result";
    game.modeStartedAtSeconds = nowSeconds;
    return;
  }
  game.mode = "stageTransition";
  game.modeStartedAtSeconds = nowSeconds;
};

/**
 * StageTransition完了後に次のStageとPlayerを新規作成する．
 * Stage番号を1つ進め，選択中キャラクターを維持したままgameモードへ戻す．
 */
const startNextStage = (game: GameState, nowSeconds: number) => {
  game.stageIndex += 1;
  game.stage = createStage(game.stageIndex);
  game.player = createPlayer(game.player.characterType, game.stage.playerStart);
  game.mode = "game";
  game.modeStartedAtSeconds = nowSeconds;
};

/**
 * Gameモードの1回分のSimulationを実行する．
 * Block，Enemy，Playerの順に更新し，Stage完了とPlayer・Enemyの表示矩形衝突を判定する．
 */
const updateActiveGameStep = (
  game: GameState,
  moveDirection: Direction | null,
  deltaSeconds: number,
  nowSeconds: number,
  random: () => number,
): GameSignal[] => {
  const events: GameSignal[] = [];
  updateBlocks(game.stage, deltaSeconds);
  events.push(...updateEnemies(game.stage, game.player, deltaSeconds, random));
  events.push(
    ...updatePlayer(
      game.player,
      game.stage,
      moveDirection,
      deltaSeconds,
      random,
    ),
  );

  if (
    game.stage.remainingItems.length === 0 &&
    game.player.heldItems.length === 0 &&
    game.stage.deliveredItems.length > 0
  ) {
    completeStage(game, nowSeconds);
    return events;
  }

  if (
    game.stage.enemies.some((enemy) => {
      const playerDisplayPosition = getDisplayPosition(
        game.player.position,
        game.player.movement ? game.player.direction : null,
        game.player.movement?.elapsedDistance ?? 0,
      );
      const enemyDisplayPosition = getDisplayPosition(
        enemy.position,
        enemy.movement ? enemy.direction : null,
        enemy.movement?.elapsedDistance ?? 0,
      );
      return rectanglesOverlap(playerDisplayPosition, enemyDisplayPosition);
    })
  ) {
    game.mode = "gameOver";
    game.modeStartedAtSeconds = nowSeconds;
  }
  return events;
};

/**
 * GameStateを現在モードに応じて時間更新する．
 * StageTransition中はSimulationを停止し，game中だけBlock，Enemy，Playerを最大追従時間内で進める．
 * 実時間の経過はelapsedSecondsへ記録し，長時間停止分のSimulationは制限する．
 */
export const updateGame = (
  game: GameState,
  moveDirection: Direction | null,
  deltaSeconds: number,
  nowSeconds: number,
  random: () => number = Math.random,
): GameSignal[] => {
  const events: GameSignal[] = [];
  const elapsedDelta = Math.max(0, deltaSeconds);
  if (game.mode === "stageTransition") {
    // 進行度を別状態にせず，モード開始時刻と固定時間の差だけで遷移を確定する．
    if (
      nowSeconds - game.modeStartedAtSeconds + EPS >=
      gameConfig.action.stageTransitionSeconds
    ) {
      startNextStage(game, nowSeconds);
    }
    return events;
  }
  if (game.mode !== "game") return events;

  game.elapsedSeconds += elapsedDelta;

  // 長時間停止後は実時間だけを記録し，シミュレーションの追いつき量を制限する．
  const simulationDelta = Math.min(
    elapsedDelta,
    gameConfig.simulation.maximumCatchUpSeconds,
  );
  const skippedSimulationSeconds = elapsedDelta - simulationDelta;
  if (skippedSimulationSeconds > EPS) {
    game.player.energy = Math.min(
      gameConfig.energy.maximum,
      game.player.energy +
        skippedSimulationSeconds * gameConfig.energy.recoveryPerSecond,
    );
  }

  if (elapsedDelta <= EPS) {
    events.push(
      ...updateActiveGameStep(game, moveDirection, 0, nowSeconds, random),
    );
    return events;
  }

  // Actor同士の途中交差も判定するため，長いフレームを固定幅で更新する．
  let remainingSeconds = simulationDelta;
  let currentSeconds = nowSeconds - simulationDelta;
  while (remainingSeconds > EPS && game.mode === "game") {
    const stepSeconds = Math.min(
      remainingSeconds,
      gameConfig.simulation.maximumStepSeconds,
    );
    currentSeconds += stepSeconds;
    events.push(
      ...updateActiveGameStep(
        game,
        moveDirection,
        stepSeconds,
        currentSeconds,
        random,
      ),
    );
    remainingSeconds -= stepSeconds;
  }
  return events;
};
