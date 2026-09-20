import { gameConfig } from "../game/config";
import { getDisplayPosition } from "../game/grid";
import { GameState } from "../game/types";
import { TutorialGuidance, TutorialOverlay } from "../tutorial";
import { getImage } from "./assets";
import { FIELD_SIZE, getCellSize } from "./gameLayout";

const drawGuidance = (
  game: GameState,
  context: CanvasRenderingContext2D,
  guidance: NonNullable<TutorialGuidance>,
  nowSeconds: number,
): void => {
  const cellSize = getCellSize(game);
  const centerX = (guidance.target.x + 0.5) * cellSize;
  const bob = Math.sin(nowSeconds * Math.PI * 3) * cellSize * 0.07;
  const arrowWidth = cellSize * 0.68;
  const arrowHeight = cellSize * 0.5;
  context.fillStyle = "#fbbf24";
  context.strokeStyle = "#1b1b1b";
  context.lineWidth = Math.max(2, cellSize * 0.06);

  const topY = guidance.target.y * cellSize - arrowHeight - 16 + bob;
  context.beginPath();
  context.moveTo(centerX - arrowWidth / 2, topY);
  context.lineTo(centerX, topY + arrowHeight * 0.48);
  context.lineTo(centerX + arrowWidth / 2, topY);
  context.lineTo(centerX + arrowWidth / 2, topY + arrowHeight * 0.4);
  context.lineTo(centerX, topY + arrowHeight);
  context.lineTo(centerX - arrowWidth / 2, topY + arrowHeight * 0.4);
  context.closePath();
  context.fill();
  context.stroke();
};

const drawKeyHint = (
  game: GameState,
  context: CanvasRenderingContext2D,
  key: "keySpace" | "keyR",
): void => {
  const cellSize = getCellSize(game);
  const { player } = game;
  const displayPosition = getDisplayPosition(
    player.position,
    player.movement ? player.direction : null,
    player.movement?.elapsedDistance ?? 0,
  );
  const iconSize = cellSize * 1.5 * (key === "keyR" ? 0.64 : 1);
  const centerX = (displayPosition.x + 0.5) * cellSize;
  const iconX = Math.max(
    0,
    Math.min(FIELD_SIZE - iconSize, centerX - iconSize / 2),
  );
  const barHeight = Math.max(5, cellSize * 0.12);
  const barY = Math.max(
    2,
    displayPosition.y * cellSize - barHeight - cellSize * 0.08,
  );
  const iconY = Math.max(0, barY - iconSize);
  context.drawImage(getImage(key), iconX, iconY, iconSize, iconSize);
};

/** ゲーム画面の上に一時的な案内を描画し、GameStateは変更しない。 */
export const renderTutorial = (
  game: GameState,
  context: CanvasRenderingContext2D,
  overlay: TutorialOverlay,
  nowSeconds: number,
  resetHintStartedAtSeconds: number | null = null,
  guidance: TutorialGuidance = null,
  pushHintVisible = false,
): void => {
  const showResetHint =
    resetHintStartedAtSeconds !== null &&
    nowSeconds - resetHintStartedAtSeconds >=
      gameConfig.tutorial.resetHintDelaySeconds;
  if (!overlay && !showResetHint && !guidance && !pushHintVisible) return;
  context.save();
  if (guidance) {
    drawGuidance(game, context, guidance, nowSeconds);
  }
  if (pushHintVisible) {
    drawKeyHint(game, context, "keySpace");
  } else if (showResetHint) {
    drawKeyHint(game, context, "keyR");
  } else if (overlay?.type === "dash") {
    drawKeyHint(game, context, "keySpace");
  }
  context.restore();
};
