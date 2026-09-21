import { gameConfig } from "../game/config";
import { getDisplayPosition } from "../game/grid";
import { Direction, EnemyState, GameState } from "../game/types";
import { getImage } from "./assets";
import { FIELD_SIZE, getCellSize } from "./gameLayout";
import { createSpeedEffectRenderer } from "./speedEffect";

const directionSource: Record<
  Direction,
  readonly [number, number, number, number]
> = {
  up: [64, 0, 64, 64],
  down: [128, 0, 64, 64],
  left: [0, 0, 64, 64],
  right: [192, 0, 64, 64],
};
const speedEffectRenderer = createSpeedEffectRenderer();

/**
 * Playerのスプライト，Speed Effect，Energyを描画する．
 * logicalPositionは変更せず，そこから導出したdisplayPositionで描画し，Canvas context状態を呼び出し前へ戻す．
 */
const drawPlayer = (
  game: GameState,
  context: CanvasRenderingContext2D,
  nowSeconds: number,
): void => {
  context.save();
  const cellSize = getCellSize(game);
  const { player } = game;
  const displayPosition = getDisplayPosition(
    player.position,
    player.movement ? player.direction : null,
    player.movement?.elapsedDistance ?? 0,
  );
  speedEffectRenderer.drawActor(context, {
    actor: player,
    active: player.movement?.type === "dash",
    displayPosition,
    direction: player.direction,
    nowSeconds,
    cellSize,
  });
  const [sourceX, sourceY, sourceWidth, sourceHeight] =
    directionSource[player.direction];
  const characterSourceY = { student: 64, monk: 128, exorcist: 0 }[
    player.characterType
  ];
  context.drawImage(
    getImage("player"),
    sourceX,
    characterSourceY + sourceY,
    sourceWidth,
    sourceHeight,
    displayPosition.x * cellSize,
    displayPosition.y * cellSize,
    cellSize,
    cellSize,
  );
  const barWidth = cellSize * 1.25;
  const barHeight = Math.max(5, cellSize * 0.12);
  const barX = Math.max(
    2,
    Math.min(
      FIELD_SIZE - barWidth - 2,
      (displayPosition.x + 0.5) * cellSize - barWidth / 2,
    ),
  );
  const barY = Math.max(
    2,
    displayPosition.y * cellSize - barHeight - cellSize * 0.08,
  );
  const energyRatio = Math.max(
    0,
    Math.min(1, player.energy / gameConfig.energy.maximum),
  );
  context.fillStyle = "#1b1b1b";
  context.fillRect(barX, barY, barWidth, barHeight);
  context.fillStyle = "#f59e0b";
  context.fillRect(barX, barY, barWidth * energyRatio, barHeight);
  context.strokeStyle = "#000000";
  context.lineWidth = Math.max(1, cellSize * 0.04);
  context.strokeRect(barX, barY, barWidth, barHeight);
  context.restore();
};

const getEnemyDisplayDirection = (enemy: EnemyState): Direction =>
  enemy.direction ?? "left";

/**
 * Enemyのスプライト，ハート，Alert marker，Speed Effectを描画する．
 * EnemyのlogicalPositionは変更せず，そこから導出したdisplayPositionで描画し，Canvas context状態を呼び出し前へ戻す．
 */
const drawEnemy = (
  game: GameState,
  enemy: EnemyState,
  context: CanvasRenderingContext2D,
  nowSeconds: number,
): void => {
  context.save();
  const cellSize = getCellSize(game);
  const isActiveChase = enemy.type === "chase" && enemy.mode === "chase";
  const isActiveRush = enemy.type === "rush" && enemy.mode === "rush";
  const displayDirection = getEnemyDisplayDirection(enemy);
  const displayPosition = getDisplayPosition(
    enemy.position,
    enemy.movement ? enemy.direction : null,
    enemy.movement?.elapsedDistance ?? 0,
  );
  speedEffectRenderer.drawActor(context, {
    actor: enemy,
    active: enemy.direction !== null && (isActiveChase || isActiveRush),
    displayPosition,
    direction: displayDirection,
    nowSeconds,
    cellSize,
  });
  const [sourceX, sourceY, sourceWidth, sourceHeight] =
    directionSource[displayDirection];
  const enemySourceY = { random: 0, patrol: 0, chase: 64, rush: 128 }[
    enemy.type
  ];
  context.drawImage(
    getImage("ghost"),
    sourceX,
    enemySourceY + sourceY,
    sourceWidth,
    sourceHeight,
    displayPosition.x * cellSize,
    displayPosition.y * cellSize,
    cellSize,
    cellSize,
  );
  context.drawImage(
    getImage("heartAnimation"),
    (Math.floor(nowSeconds * 4) % 3) * 64,
    0,
    64,
    64,
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
    context.lineWidth = Math.max(2, cellSize * 0.1);
    context.font = `bold ${Math.max(14, cellSize * 0.8)}px monospace`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    const label = enemy.type === "rush" ? "!!" : "!";
    const labelX = (displayPosition.x + 0.5) * cellSize;
    const labelY = (displayPosition.y + 0.05) * cellSize;
    context.strokeText(label, labelX, labelY);
    context.fillText(label, labelX, labelY);
  }
  context.restore();
};

/**
 * Player，Enemy，Alert marker，Speed Effect，Energyを順に描画する．
 * 各ActorのCanvas context状態を復元し，GameStateは変更しない．
 */
export const renderActors = (
  game: GameState,
  context: CanvasRenderingContext2D,
  nowSeconds: number,
): void => {
  drawPlayer(game, context, nowSeconds);
  game.stage.enemies.forEach((enemy) =>
    drawEnemy(game, enemy, context, nowSeconds),
  );
};
