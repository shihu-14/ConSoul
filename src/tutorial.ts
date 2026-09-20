import { gameConfig } from "./game/config";
import { isProgressImpossible } from "./game/deadlock";
import { GameSignal } from "./game/events";
import { GameState, Position } from "./game/types";

const DASH_HINT_RANGE_TILES = 4;
const PUSH_TUTORIAL_BLOCKS = [
  { x: 2, y: 16 },
  { x: 3, y: 17 },
] as const;
export type TutorialOverlay = { type: "dash"; startedAtSeconds: number } | null;
export type TutorialGuidance = {
  type: "item" | "post";
  target: Position;
} | null;

export type TutorialState = {
  guidanceCompleted: boolean;
  itemPickedUpThisAttempt: boolean;
  guidance: TutorialGuidance;
  dashHintCompleted: boolean;
  blockPushHintCompleted: boolean;
  pushHintVisible: boolean;
  hasPushedBlockThisStage: boolean;
  trackedStageIndex: number | null;
  resetHintStartedAtSeconds: number | null;
  overlay: TutorialOverlay;
};

export const createTutorial = (): TutorialState => ({
  guidanceCompleted: false,
  itemPickedUpThisAttempt: false,
  guidance: null,
  dashHintCompleted: false,
  blockPushHintCompleted: false,
  pushHintVisible: false,
  hasPushedBlockThisStage: false,
  trackedStageIndex: null,
  resetHintStartedAtSeconds: null,
  overlay: null,
});

/** Stage 1の現在の所持状態に合わせて、初回の案内先を選ぶ。 */
export const beginTutorial = (
  tutorial: TutorialState,
  game: GameState,
): void => {
  if (game.mode !== "game") return;
  tutorial.hasPushedBlockThisStage = false;
  tutorial.trackedStageIndex = game.stageIndex;
  tutorial.resetHintStartedAtSeconds = null;
  tutorial.pushHintVisible = false;
  tutorial.overlay = null;
  if (game.stageIndex !== 0 || tutorial.guidanceCompleted) return;
  tutorial.itemPickedUpThisAttempt = game.player.heldItems.length > 0;
  if (game.player.heldItems.length > 0) {
    tutorial.guidance = {
      type: "post",
      target: { ...game.stage.post },
    };
    return;
  }
  const firstItem = game.stage.remainingItems[0];
  if (!firstItem) return;
  tutorial.guidance = {
    type: "item",
    target: { ...firstItem.position },
  };
};

/** 成功したPushを記録し、Stage 1の対象Blockが動けば両方の案内を完了する。 */
export const observeTutorialPush = (
  tutorial: TutorialState,
  game: GameState,
): void => {
  if (game.mode !== "game") return;
  tutorial.hasPushedBlockThisStage = true;
  if (game.stageIndex !== 0) return;
  if (
    PUSH_TUTORIAL_BLOCKS.some((position) =>
      game.stage.blocks.some(
        (block) =>
          block.movement !== null &&
          block.position.x === position.x &&
          block.position.y === position.y,
      ),
    )
  ) {
    tutorial.blockPushHintCompleted = true;
    tutorial.pushHintVisible = false;
  }
};

export const endTutorialGuidance = (tutorial: TutorialState): void => {
  tutorial.guidanceCompleted = true;
  tutorial.guidance = null;
};

/** 最初の取得後は納品場所へ切り替え、最初の納品で案内を終える。 */
export const observeTutorialEvents = (
  tutorial: TutorialState,
  game: GameState,
  events: readonly GameSignal[],
): void => {
  if (game.stageIndex !== 0 || tutorial.guidanceCompleted) return;
  if (events.some((event) => event.type === "itemDeliver")) {
    endTutorialGuidance(tutorial);
  } else if (
    !tutorial.itemPickedUpThisAttempt &&
    events.some((event) => event.type === "itemPickup")
  ) {
    tutorial.itemPickedUpThisAttempt = true;
    tutorial.guidance = {
      type: "post",
      target: { ...game.stage.post },
    };
  }
};

const isPursuedNearby = (game: GameState): boolean =>
  game.stage.enemies.some(
    (enemy) =>
      ((enemy.type === "chase" && enemy.mode === "chase") ||
        (enemy.type === "rush" && enemy.mode === "rush")) &&
      Math.abs(enemy.position.x - game.player.position.x) +
        Math.abs(enemy.position.y - game.player.position.y) <=
        DASH_HINT_RANGE_TILES,
  );

const canPromptDash = (game: GameState): boolean =>
  game.stageIndex === 0 &&
  game.player.movement?.type === "walk" &&
  game.player.energy >= gameConfig.energy.dashCost &&
  isPursuedNearby(game);

const canPromptPush = (tutorial: TutorialState, game: GameState): boolean =>
  game.stageIndex === 0 &&
  !tutorial.blockPushHintCompleted &&
  PUSH_TUTORIAL_BLOCKS.some(
    (position) =>
      Math.abs(position.x - game.player.position.x) +
        Math.abs(position.y - game.player.position.y) ===
        1 &&
      game.stage.blocks.some(
        (block) =>
          block.movement === null &&
          block.position.x === position.x &&
          block.position.y === position.y,
      ),
  );

/** 進行不能，対象Blockへの接近，追跡中の操作案内を更新する。 */
export const updateTutorial = (
  tutorial: TutorialState,
  game: GameState,
  nowSeconds: number,
): void => {
  if (game.mode !== "game") return;
  if (tutorial.trackedStageIndex !== game.stageIndex) {
    tutorial.trackedStageIndex = game.stageIndex;
    tutorial.hasPushedBlockThisStage = false;
    tutorial.resetHintStartedAtSeconds = null;
    tutorial.overlay = null;
  }
  if (
    tutorial.hasPushedBlockThisStage &&
    isProgressImpossible(game.stage, game.player)
  ) {
    tutorial.resetHintStartedAtSeconds ??= nowSeconds;
  } else {
    tutorial.resetHintStartedAtSeconds = null;
  }
  tutorial.pushHintVisible = canPromptPush(tutorial, game);
  if (tutorial.overlay?.type === "dash") return;
  if (tutorial.dashHintCompleted || !canPromptDash(game)) return;
  tutorial.overlay = { type: "dash", startedAtSeconds: nowSeconds };
};

export const clearTutorialHint = (tutorial: TutorialState): void => {
  if (tutorial.overlay?.type === "dash") {
    tutorial.overlay = null;
    tutorial.dashHintCompleted = true;
  }
};
