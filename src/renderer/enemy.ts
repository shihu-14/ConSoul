import { Direction, EnemyState, GameState, getDisplayPosition } from "../game";
import { getDirectionSource, getImage } from "./assets";
import { drawActorSpeedEffect } from "./effects";
import { getCellSize } from "./layout";

const SOURCE_TILE_SIZE = 64;
const ENEMY_SOURCE_Y = { random: 0, patrol: 0, chase: 64, rush: 128 } as const;
const HEART_FRAME_COUNT = 3;
const HEART_FRAMES_PER_SECOND = 4;
const ALERT_STROKE_TILES = 0.1;
const ALERT_MIN_STROKE_WIDTH = 2;
const ALERT_FONT_TILES = 0.8;
const ALERT_MIN_FONT_SIZE = 14;
const ALERT_POSITION_Y_TILES = 0.05;

const getDisplayDirection = (enemy: EnemyState): Direction =>
  enemy.direction ?? "left";

const renderEnemy = (
  game: GameState,
  enemy: EnemyState,
  context: CanvasRenderingContext2D,
  nowSeconds: number,
): void => {
  context.save();
  const cellSize = getCellSize(game);
  const isActiveChase = enemy.type === "chase" && enemy.mode === "chase";
  const isActiveRush = enemy.type === "rush" && enemy.mode === "rush";
  const displayDirection = getDisplayDirection(enemy);
  const displayPosition = getDisplayPosition(
    enemy.position,
    enemy.movement ? enemy.direction : null,
    enemy.movement?.elapsedDistance ?? 0,
  );
  drawActorSpeedEffect(context, {
    actor: enemy,
    active: enemy.direction !== null && (isActiveChase || isActiveRush),
    displayPosition,
    direction: displayDirection,
    nowSeconds,
    cellSize,
  });
  const [sourceX, sourceY, sourceWidth, sourceHeight] =
    getDirectionSource(displayDirection);
  context.drawImage(
    getImage("ghost"),
    sourceX,
    ENEMY_SOURCE_Y[enemy.type] + sourceY,
    sourceWidth,
    sourceHeight,
    displayPosition.x * cellSize,
    displayPosition.y * cellSize,
    cellSize,
    cellSize,
  );
  context.drawImage(
    getImage("heartAnimation"),
    (Math.floor(nowSeconds * HEART_FRAMES_PER_SECOND) % HEART_FRAME_COUNT) *
      SOURCE_TILE_SIZE,
    0,
    SOURCE_TILE_SIZE,
    SOURCE_TILE_SIZE,
    displayPosition.x * cellSize,
    displayPosition.y * cellSize,
    cellSize,
    cellSize,
  );
  const alert =
    (enemy.type === "chase" || enemy.type === "rush") && enemy.mode === "alert";
  if (alert) {
    context.fillStyle = "#ff3b30";
    context.strokeStyle = "#1b1b1b";
    context.lineWidth = Math.max(
      ALERT_MIN_STROKE_WIDTH,
      cellSize * ALERT_STROKE_TILES,
    );
    context.font = `bold ${Math.max(
      ALERT_MIN_FONT_SIZE,
      cellSize * ALERT_FONT_TILES,
    )}px monospace`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    const label = enemy.type === "rush" ? "!!" : "!";
    const labelX = (displayPosition.x + 0.5) * cellSize;
    const labelY = (displayPosition.y + ALERT_POSITION_Y_TILES) * cellSize;
    context.strokeText(label, labelX, labelY);
    context.fillText(label, labelX, labelY);
  }
  context.restore();
};

export const renderEnemies = (
  game: GameState,
  context: CanvasRenderingContext2D,
  nowSeconds: number,
): void => {
  game.stage.enemies.forEach((enemy) =>
    renderEnemy(game, enemy, context, nowSeconds),
  );
};
