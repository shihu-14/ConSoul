import { GameState, getDisplayPosition } from "../game";
import { TutorialGuidance, TutorialOverlay } from "../tutorial";
import { getImage } from "./assets";
import { FIELD_SIZE, getCellSize } from "./layout";
import { getPlayerEnergyBarLayout } from "./player";

const GUIDANCE_BOB_FREQUENCY = Math.PI * 3;
const GUIDANCE_BOB_TILES = 0.07;
const GUIDANCE_ARROW_WIDTH_TILES = 0.68;
const GUIDANCE_ARROW_HEIGHT_TILES = 0.5;
const GUIDANCE_STROKE_TILES = 0.06;
const GUIDANCE_MIN_STROKE_WIDTH = 2;
const GUIDANCE_TARGET_GAP = 16;
const GUIDANCE_NOTCH_Y_RATIO = 0.48;
const GUIDANCE_SHOULDER_Y_RATIO = 0.4;
const KEY_HINT_SIZE_TILES = 1.5;

const drawGuidance = (
  game: GameState,
  context: CanvasRenderingContext2D,
  guidance: NonNullable<TutorialGuidance>,
  nowSeconds: number,
): void => {
  const cellSize = getCellSize(game);
  const centerX = (guidance.target.x + 0.5) * cellSize;
  const bob =
    Math.sin(nowSeconds * GUIDANCE_BOB_FREQUENCY) *
    cellSize *
    GUIDANCE_BOB_TILES;
  const arrowWidth = cellSize * GUIDANCE_ARROW_WIDTH_TILES;
  const arrowHeight = cellSize * GUIDANCE_ARROW_HEIGHT_TILES;
  context.fillStyle = "#fbbf24";
  context.strokeStyle = "#1b1b1b";
  context.lineWidth = Math.max(
    GUIDANCE_MIN_STROKE_WIDTH,
    cellSize * GUIDANCE_STROKE_TILES,
  );

  const topY =
    guidance.target.y * cellSize - arrowHeight - GUIDANCE_TARGET_GAP + bob;
  context.beginPath();
  context.moveTo(centerX - arrowWidth / 2, topY);
  context.lineTo(centerX, topY + arrowHeight * GUIDANCE_NOTCH_Y_RATIO);
  context.lineTo(centerX + arrowWidth / 2, topY);
  context.lineTo(
    centerX + arrowWidth / 2,
    topY + arrowHeight * GUIDANCE_SHOULDER_Y_RATIO,
  );
  context.lineTo(centerX, topY + arrowHeight);
  context.lineTo(
    centerX - arrowWidth / 2,
    topY + arrowHeight * GUIDANCE_SHOULDER_Y_RATIO,
  );
  context.closePath();
  context.fill();
  context.stroke();
};

const drawKeyHint = (
  game: GameState,
  context: CanvasRenderingContext2D,
): void => {
  const cellSize = getCellSize(game);
  const { player } = game;
  const displayPosition = getDisplayPosition(
    player.position,
    player.movement ? player.direction : null,
    player.movement?.elapsedDistance ?? 0,
  );
  const iconSize = cellSize * KEY_HINT_SIZE_TILES;
  const centerX = (displayPosition.x + 0.5) * cellSize;
  const iconX = Math.max(
    0,
    Math.min(FIELD_SIZE - iconSize, centerX - iconSize / 2),
  );
  const iconY = Math.max(
    0,
    getPlayerEnergyBarLayout(game, displayPosition).y - iconSize,
  );
  context.drawImage(getImage("keySpace"), iconX, iconY, iconSize, iconSize);
};

export const renderTutorial = (
  game: GameState,
  context: CanvasRenderingContext2D,
  overlay: TutorialOverlay,
  nowSeconds: number,
  guidance: TutorialGuidance = null,
  pushHintVisible = false,
): void => {
  if (!overlay && !guidance && !pushHintVisible) return;
  context.save();
  if (guidance) {
    drawGuidance(game, context, guidance, nowSeconds);
  }
  if (pushHintVisible || overlay?.type === "dash") {
    drawKeyHint(game, context);
  }
  context.restore();
};
