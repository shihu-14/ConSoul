import { GameState, getStageCount } from "../game";
import { drawItem, getImage } from "./assets";
import {
  HUD_WIDTH,
  HUD_X,
  INVENTORY_HEIGHT,
  INVENTORY_Y,
  PANEL_HEIGHT,
  PANEL_PADDING,
  PANEL_Y,
} from "./layout";

const movementIcons = [
  "keyArrowUp",
  "keyArrowDown",
  "keyArrowLeft",
  "keyArrowRight",
] as const;
const movementIconOffsets = [
  [47, 0],
  [47, 47],
  [0, 47],
  [94, 47],
] as const;

const drawStageProgress = (
  game: GameState,
  context: CanvasRenderingContext2D,
): void => {
  context.save();
  context.fillStyle = "#ffffff";
  context.font = "bold 30px sans-serif";
  context.textAlign = "left";
  context.textBaseline = "alphabetic";
  context.fillText(
    `STAGE ${game.stageIndex + 1} / ${getStageCount()}`,
    HUD_X + PANEL_PADDING,
    50,
  );
  context.restore();
};

const drawInventory = (
  game: GameState,
  context: CanvasRenderingContext2D,
): void => {
  context.save();
  context.fillStyle = "rgba(0, 0, 0, 0.68)";
  context.fillRect(HUD_X, INVENTORY_Y, HUD_WIDTH, INVENTORY_HEIGHT);
  context.fillStyle = "#ffffff";
  context.font = "bold 24px sans-serif";
  context.textAlign = "left";
  context.textBaseline = "alphabetic";
  context.fillText("所持中のアイテム", HUD_X + PANEL_PADDING, INVENTORY_Y + 20);
  const slotCount =
    game.stage.remainingItems.length +
    game.player.heldItems.length +
    game.stage.deliveredItems.length;
  const slotSize = Math.min(
    58,
    (HUD_WIDTH - 2 * PANEL_PADDING - (slotCount - 1) * 10) / slotCount,
  );
  const slotsWidth = slotCount * slotSize + (slotCount - 1) * 10;
  const firstSlotX = HUD_X + (HUD_WIDTH - slotsWidth) / 2;
  const slotY = INVENTORY_Y + 50;
  for (let index = 0; index < slotCount; index += 1) {
    const slotX = firstSlotX + index * (slotSize + 10);
    context.fillStyle = "#353a57";
    context.strokeStyle = "#69718b";
    context.lineWidth = 2;
    context.beginPath();
    context.roundRect(slotX, slotY, slotSize, slotSize, 8);
    context.fill();
    context.stroke();
    const item = game.player.heldItems[index];
    if (item) {
      const itemSize = Math.min(50, slotSize - 8);
      drawItem(
        context,
        item,
        slotX + (slotSize - itemSize) / 2,
        slotY + (slotSize - itemSize) / 2,
        itemSize,
        itemSize,
      );
    }
  }
  context.restore();
};

const drawControls = (context: CanvasRenderingContext2D): void => {
  context.save();
  context.fillStyle = "rgba(0, 0, 0, 0.68)";
  context.fillRect(HUD_X, PANEL_Y, HUD_WIDTH, PANEL_HEIGHT);
  context.fillStyle = "#ffffff";
  context.textBaseline = "alphabetic";
  context.font = "bold 24px sans-serif";
  context.fillText("操作方法", HUD_X + PANEL_PADDING, PANEL_Y + 53);
  const centerX = HUD_X + HUD_WIDTH / 2;
  const movementCenterX = centerX - 28;
  const movementWidth = 3 * 46 + 2;
  const movementX = Math.round(movementCenterX - movementWidth / 2);
  const movementY = PANEL_Y + 82;
  movementIcons.forEach((id, index) => {
    const [offsetX, offsetY] = movementIconOffsets[index];
    context.drawImage(
      getImage(id),
      movementX + offsetX,
      movementY + offsetY,
      46,
      46,
    );
  });
  context.textAlign = "center";
  context.font = "bold 20px sans-serif";
  context.fillText("MOVE", movementCenterX, PANEL_Y + 202);
  const actionLabelY = PANEL_Y + 331;
  const spaceCenterX = centerX - 75;
  const resetCenterX = centerX + 75;
  context.drawImage(
    getImage("keySpace"),
    spaceCenterX - 104 / 2,
    PANEL_Y + 220,
    104,
    104,
  );
  context.fillText("DASH / PUSH", spaceCenterX, actionLabelY);
  context.drawImage(
    getImage("keyR"),
    resetCenterX - 64 / 2,
    PANEL_Y + 240,
    64,
    64,
  );
  context.fillText("RESET", resetCenterX, actionLabelY);
  context.restore();
};

export const renderHud = (
  game: GameState,
  context: CanvasRenderingContext2D,
): void => {
  drawStageProgress(game, context);
  drawInventory(game, context);
  drawControls(context);
};
