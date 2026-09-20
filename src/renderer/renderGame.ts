/**
 * 現在のGameStateを変更せず，盤面，Actor，HUD，操作案内を描画する．
 */

import { gameConfig } from "../game/config";
import { getDisplayPosition } from "../game/grid";
import { Direction, EnemyState, GameState, Item } from "../game/types";
import { getImage } from "./assets";
import { createSpeedEffectRenderer } from "./speedEffect";

const FIELD_SIZE = 960;
const HUD_X = 960;
const HUD_WIDTH = 320;
const INVENTORY_Y = 500;
const INVENTORY_HEIGHT = 112;
const PANEL_Y = 620;
const PANEL_HEIGHT = FIELD_SIZE - PANEL_Y;
const PANEL_PADDING = 16;
const ITEM_ICON_SIZE = 50;
const ITEM_ICON_GAP = 15;
const MOVEMENT_ICON_SIZE = 39;
const ACTION_ICON_SIZE = 78;
const KEY_ICON_GAP = 1;

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

const movementIcons = [
  "keyArrowUp",
  "keyArrowDown",
  "keyArrowLeft",
  "keyArrowRight",
  "keyW",
  "keyA",
  "keyS",
  "keyD",
] as const;

const movementIconOffsets = [
  [MOVEMENT_ICON_SIZE + KEY_ICON_GAP, 0],
  [MOVEMENT_ICON_SIZE + KEY_ICON_GAP, MOVEMENT_ICON_SIZE + KEY_ICON_GAP],
  [0, MOVEMENT_ICON_SIZE + KEY_ICON_GAP],
  [2 * (MOVEMENT_ICON_SIZE + KEY_ICON_GAP), MOVEMENT_ICON_SIZE + KEY_ICON_GAP],
] as const;

const getCellSize = (game: GameState) => FIELD_SIZE / game.stage.width;

const drawItem = (
  context: CanvasRenderingContext2D,
  item: Item,
  x: number,
  y: number,
  width: number,
  height: number,
) => {
  context.drawImage(
    getImage("item"),
    (item.kind % 3) * 64 + 64,
    0,
    64,
    64,
    x,
    y,
    width,
    height,
  );
};

const drawField = (game: GameState, context: CanvasRenderingContext2D) => {
  const cellSize = getCellSize(game);
  for (let y = 0; y < game.stage.height; y += 1) {
    for (let x = 0; x < game.stage.width; x += 1) {
      const floorVariant = Math.floor(
        Math.abs(Math.sin(x * 12.9898 + y * 78.233) % 1) * 4,
      );
      context.drawImage(
        getImage("floor"),
        (floorVariant % 2) * 64,
        Math.floor(floorVariant / 2) * 64,
        64,
        64,
        x * cellSize,
        y * cellSize,
        cellSize,
        cellSize,
      );
    }
  }
  game.stage.blocks.forEach((block) => {
    const displayPosition = getDisplayPosition(
      block.position,
      block.movement?.direction ?? null,
      block.movement?.elapsedDistance ?? 0,
    );
    const isFixedBoundary =
      block.position.x === 0 ||
      block.position.y === 0 ||
      block.position.x === game.stage.width - 1 ||
      block.position.y === game.stage.height - 1;
    const boundaryContinuesBelow =
      isFixedBoundary &&
      game.stage.blocks.some(
        (candidate) =>
          (candidate.position.x === 0 ||
            candidate.position.x === game.stage.width - 1) &&
          candidate.position.x === block.position.x &&
          candidate.position.y === block.position.y + 1,
      );
    context.drawImage(
      getImage("wall"),
      isFixedBoundary && !boundaryContinuesBelow ? 64 : 0,
      0,
      64,
      64,
      displayPosition.x * cellSize,
      displayPosition.y * cellSize,
      cellSize,
      cellSize,
    );
  });
  game.stage.remainingItems.forEach((item) =>
    drawItem(
      context,
      item,
      item.position.x * cellSize,
      item.position.y * cellSize,
      cellSize,
      cellSize,
    ),
  );
  context.drawImage(
    getImage("item"),
    0,
    0,
    64,
    64,
    game.stage.post.x * cellSize,
    game.stage.post.y * cellSize,
    cellSize,
    cellSize,
  );
};

const drawPlayer = (
  game: GameState,
  context: CanvasRenderingContext2D,
  nowSeconds: number,
) => {
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
    position: displayPosition,
    direction: player.direction,
    nowSeconds,
    cellSize,
  });
  const [sourceX, sourceY, sourceWidth, sourceHeight] =
    directionSource[player.direction];
  const characterSourceY = {
    student: 64,
    monk: 128,
    exorcist: 0,
  }[player.characterType];
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
};

const getEnemyDisplayDirection = (enemy: EnemyState): Direction =>
  enemy.direction ?? "left";

const drawEnemy = (
  game: GameState,
  enemy: EnemyState,
  context: CanvasRenderingContext2D,
  nowSeconds: number,
) => {
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
    position: displayPosition,
    direction: displayDirection,
    nowSeconds,
    cellSize,
  });
  const [sourceX, sourceY, sourceWidth, sourceHeight] =
    directionSource[displayDirection];
  const enemySourceY = {
    random: 0,
    patrol: 0,
    chase: 64,
    rush: 128,
  }[enemy.type];
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
  const stunned = enemy.type === "rush" && enemy.mode === "stun";
  if (!alert && !stunned) return;
  context.save();
  context.fillStyle = alert ? "#ff3b30" : "#9aa0a6";
  context.strokeStyle = "#1b1b1b";
  context.lineWidth = Math.max(2, cellSize * 0.1);
  context.font = `bold ${Math.max(14, cellSize * 0.8)}px monospace`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  let label = "✦";
  if (alert) label = enemy.type === "rush" ? "!!" : "!";
  const labelX = (displayPosition.x + 0.5) * cellSize;
  const labelY = (displayPosition.y + 0.05) * cellSize;
  context.strokeText(label, labelX, labelY);
  context.fillText(label, labelX, labelY);
  context.restore();
};

const drawInventory = (game: GameState, context: CanvasRenderingContext2D) => {
  context.save();
  context.fillStyle = "rgba(0, 0, 0, 0.68)";
  context.fillRect(HUD_X, INVENTORY_Y, HUD_WIDTH, INVENTORY_HEIGHT);
  context.fillStyle = "#ffffff";
  context.font = "bold 24px sans-serif";
  context.textBaseline = "alphabetic";
  context.fillText("所持中のアイテム", HUD_X + PANEL_PADDING, INVENTORY_Y + 34);
  game.player.heldItems.forEach((item, index) =>
    drawItem(
      context,
      item,
      HUD_X + PANEL_PADDING + index * (ITEM_ICON_SIZE + ITEM_ICON_GAP),
      INVENTORY_Y + 56,
      ITEM_ICON_SIZE,
      ITEM_ICON_SIZE,
    ),
  );
  context.restore();
};

const drawControls = (context: CanvasRenderingContext2D) => {
  context.save();
  context.fillStyle = "rgba(0, 0, 0, 0.68)";
  context.fillRect(HUD_X, PANEL_Y, HUD_WIDTH, PANEL_HEIGHT);
  context.fillStyle = "#ffffff";
  context.textBaseline = "alphabetic";
  context.font = "bold 22px sans-serif";
  context.fillText("移動", HUD_X + PANEL_PADDING, PANEL_Y + 40);
  const movementY = PANEL_Y + 56;
  movementIcons.slice(0, 4).forEach((id, index) => {
    const [offsetX, offsetY] = movementIconOffsets[index];
    context.drawImage(
      getImage(id),
      HUD_X + PANEL_PADDING + offsetX,
      movementY + offsetY,
      MOVEMENT_ICON_SIZE,
      MOVEMENT_ICON_SIZE,
    );
  });
  movementIcons.slice(4).forEach((id, index) => {
    const [offsetX, offsetY] = movementIconOffsets[index];
    context.drawImage(
      getImage(id),
      HUD_X + 153 + offsetX,
      movementY + offsetY,
      MOVEMENT_ICON_SIZE,
      MOVEMENT_ICON_SIZE,
    );
  });
  context.font = "bold 20px sans-serif";
  context.fillText(
    "ダッシュ/ブロックのプッシュ",
    HUD_X + PANEL_PADDING,
    PANEL_Y + 170,
  );
  context.drawImage(
    getImage("keySpace"),
    HUD_X + PANEL_PADDING,
    PANEL_Y + 170,
    ACTION_ICON_SIZE,
    ACTION_ICON_SIZE,
  );
  context.font = "bold 22px sans-serif";
  context.fillText("盤面のリセット", HUD_X + PANEL_PADDING, PANEL_Y + 265);
  context.drawImage(
    getImage("keyR"),
    HUD_X + PANEL_PADDING + 10,
    PANEL_Y + 280,
    48,
    48,
  );
  context.restore();
};

export const renderGame = (
  game: GameState,
  context: CanvasRenderingContext2D,
  nowSeconds: number,
) => {
  drawField(game, context);
  drawPlayer(game, context, nowSeconds);
  game.stage.enemies.forEach((enemy) =>
    drawEnemy(game, enemy, context, nowSeconds),
  );
  drawInventory(game, context);
  drawControls(context);
};
