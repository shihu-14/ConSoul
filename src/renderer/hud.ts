import { GameState, getStageCount } from "../game";
import { drawItem, getImage } from "./assets";
import {
  ACTION_ICON_SIZE,
  HUD_WIDTH,
  HUD_X,
  INVENTORY_HEIGHT,
  INVENTORY_Y,
  ITEM_ICON_SIZE,
  KEY_ICON_GAP,
  MOVEMENT_ICON_SIZE,
  PANEL_HEIGHT,
  PANEL_PADDING,
  PANEL_Y,
} from "./layout";

const INVENTORY_SLOT_GAP = 10;
const INVENTORY_SLOT_MAX_SIZE = 58;
const INVENTORY_SLOT_PADDING = 8;
const INVENTORY_SLOT_RADIUS = 8;
const INVENTORY_SLOT_Y_OFFSET = 50;
const CONTROL_LABEL_GAP = 27;
const STAGE_LABEL_BASELINE_Y = 50;
const INVENTORY_LABEL_Y_OFFSET = 20;
const SLOT_BORDER_WIDTH = 2;
const CONTROL_TITLE_Y_OFFSET = 53;
const MOVEMENT_GROUP_X_OFFSET = -28;
const MOVEMENT_GROUP_Y_OFFSET = 82;
const ACTION_ICON_BOTTOM_OFFSET = 304;
const ACTION_GROUP_X_OFFSET = 75;
const RESET_ICON_SIZE = 64;
const SPACE_ICON_ALIGNMENT_Y = 20;

const movementIcons = [
  "keyArrowUp",
  "keyArrowDown",
  "keyArrowLeft",
  "keyArrowRight",
] as const;
const movementIconOffsets = [
  [MOVEMENT_ICON_SIZE + KEY_ICON_GAP, 0],
  [MOVEMENT_ICON_SIZE + KEY_ICON_GAP, MOVEMENT_ICON_SIZE + KEY_ICON_GAP],
  [0, MOVEMENT_ICON_SIZE + KEY_ICON_GAP],
  [2 * (MOVEMENT_ICON_SIZE + KEY_ICON_GAP), MOVEMENT_ICON_SIZE + KEY_ICON_GAP],
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
    STAGE_LABEL_BASELINE_Y,
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
  context.fillText(
    "所持中のアイテム",
    HUD_X + PANEL_PADDING,
    INVENTORY_Y + INVENTORY_LABEL_Y_OFFSET,
  );
  const slotCount =
    game.stage.remainingItems.length +
    game.player.heldItems.length +
    game.stage.deliveredItems.length;
  const slotSize = Math.min(
    INVENTORY_SLOT_MAX_SIZE,
    (HUD_WIDTH - 2 * PANEL_PADDING - (slotCount - 1) * INVENTORY_SLOT_GAP) /
      slotCount,
  );
  const slotsWidth =
    slotCount * slotSize + (slotCount - 1) * INVENTORY_SLOT_GAP;
  const firstSlotX = HUD_X + (HUD_WIDTH - slotsWidth) / 2;
  const slotY = INVENTORY_Y + INVENTORY_SLOT_Y_OFFSET;
  for (let index = 0; index < slotCount; index += 1) {
    const slotX = firstSlotX + index * (slotSize + INVENTORY_SLOT_GAP);
    context.fillStyle = "#353a57";
    context.strokeStyle = "#69718b";
    context.lineWidth = SLOT_BORDER_WIDTH;
    context.beginPath();
    context.roundRect(slotX, slotY, slotSize, slotSize, INVENTORY_SLOT_RADIUS);
    context.fill();
    context.stroke();
    const item = game.player.heldItems[index];
    if (item) {
      const itemSize = Math.min(
        ITEM_ICON_SIZE,
        slotSize - INVENTORY_SLOT_PADDING,
      );
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
  context.fillText(
    "操作方法",
    HUD_X + PANEL_PADDING,
    PANEL_Y + CONTROL_TITLE_Y_OFFSET,
  );
  const centerX = HUD_X + HUD_WIDTH / 2;
  const movementCenterX = centerX + MOVEMENT_GROUP_X_OFFSET;
  const movementWidth = 3 * MOVEMENT_ICON_SIZE + 2 * KEY_ICON_GAP;
  const movementX = Math.round(movementCenterX - movementWidth / 2);
  const movementY = PANEL_Y + MOVEMENT_GROUP_Y_OFFSET;
  movementIcons.forEach((id, index) => {
    const [offsetX, offsetY] = movementIconOffsets[index];
    context.drawImage(
      getImage(id),
      movementX + offsetX,
      movementY + offsetY,
      MOVEMENT_ICON_SIZE,
      MOVEMENT_ICON_SIZE,
    );
  });
  context.textAlign = "center";
  context.font = "bold 20px sans-serif";
  const movementBottom = movementY + 2 * MOVEMENT_ICON_SIZE + KEY_ICON_GAP;
  context.fillText("MOVE", movementCenterX, movementBottom + CONTROL_LABEL_GAP);
  const actionIconBottom = PANEL_Y + ACTION_ICON_BOTTOM_OFFSET;
  const actionLabelY = actionIconBottom + CONTROL_LABEL_GAP;
  const spaceCenterX = centerX - ACTION_GROUP_X_OFFSET;
  const resetCenterX = centerX + ACTION_GROUP_X_OFFSET;
  context.drawImage(
    getImage("keySpace"),
    spaceCenterX - ACTION_ICON_SIZE / 2,
    actionIconBottom - ACTION_ICON_SIZE + SPACE_ICON_ALIGNMENT_Y,
    ACTION_ICON_SIZE,
    ACTION_ICON_SIZE,
  );
  context.fillText("DASH / PUSH", spaceCenterX, actionLabelY);
  context.drawImage(
    getImage("keyR"),
    resetCenterX - RESET_ICON_SIZE / 2,
    actionIconBottom - RESET_ICON_SIZE,
    RESET_ICON_SIZE,
    RESET_ICON_SIZE,
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
