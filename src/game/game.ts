import { gameConfig } from "./config";
import { updateEnemies } from "./enemy";
import { getDisplayPosition, rectanglesOverlap } from "./grid";
import { updateBlocks } from "./block";
import { createPlayer, performPlayerAction, updatePlayer } from "./player";
import { createStage, getStageCount } from "./stage";
import { GameSignal } from "./events";
import { CharacterType, Direction, GameState } from "./types";

const EPS = 1e-8;

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

  // タブ復帰時などに、止まっていた分までゲームが一気に進まないようにする。
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

  // すれ違いを見逃さないよう、長いフレームは小刻みに処理する。
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
