import { GameState } from "../game/types";
import { getStageCount } from "../game/stage";
import { getImage } from "./assets";
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
} from "./gameLayout";
import { drawItem } from "./renderItems";

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
  context.font = "bold 26px sans-serif";
  context.textAlign = "left";
  context.textBaseline = "alphabetic";
  context.fillText(
    `STAGE ${game.stageIndex + 1} / ${getStageCount()}`,
    HUD_X + PANEL_PADDING,
    40,
  );
  context.restore();
};

/**
 * HUDのInventory背景とPlayerが所持するItem一覧を描画する．
 * Itemは共通のdrawItemへ委譲し，Canvas context状態を呼び出し前へ戻す．
 */
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
  context.fillText("所持中のアイテム", HUD_X + PANEL_PADDING, INVENTORY_Y + 34);
  const slotCount =
    game.stage.remainingItems.length +
    game.player.heldItems.length +
    game.stage.deliveredItems.length;
  const slotGap = 10;
  const slotSize = Math.min(
    58,
    (HUD_WIDTH - 2 * PANEL_PADDING - (slotCount - 1) * slotGap) / slotCount,
  );
  const slotsWidth = slotCount * slotSize + (slotCount - 1) * slotGap;
  const firstSlotX = HUD_X + (HUD_WIDTH - slotsWidth) / 2;
  const slotY = INVENTORY_Y + 50;
  for (let index = 0; index < slotCount; index += 1) {
    const slotX = firstSlotX + index * (slotSize + slotGap);
    context.fillStyle = "#353a57";
    context.strokeStyle = "#69718b";
    context.lineWidth = 2;
    context.beginPath();
    context.roundRect(slotX, slotY, slotSize, slotSize, 8);
    context.fill();
    context.stroke();
    const item = game.player.heldItems[index];
    if (item) {
      const itemSize = Math.min(ITEM_ICON_SIZE, slotSize - 8);
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

/**
 * HUDの移動，Action，リセット操作案内を描画する．
 * 固定レイアウトへ画像とテキストを配置し，Canvas context状態を呼び出し前へ戻す．
 */
const drawControls = (context: CanvasRenderingContext2D): void => {
  context.save();
  context.fillStyle = "rgba(0, 0, 0, 0.68)";
  context.fillRect(HUD_X, PANEL_Y, HUD_WIDTH, PANEL_HEIGHT);
  context.fillStyle = "#ffffff";
  context.textBaseline = "alphabetic";
  context.font = "bold 22px sans-serif";
  context.fillText("操作方法", HUD_X + PANEL_PADDING, PANEL_Y + 38);
  const centerX = HUD_X + HUD_WIDTH / 2;
  const movementCenterX = centerX - 28;
  const movementWidth = 3 * MOVEMENT_ICON_SIZE + 2 * KEY_ICON_GAP;
  const movementX = Math.round(movementCenterX - movementWidth / 2);
  const movementY = PANEL_Y + 67;
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
  const iconLabelGap = 27;
  const movementBottom = movementY + 2 * MOVEMENT_ICON_SIZE + KEY_ICON_GAP;
  context.fillText("MOVE", movementCenterX, movementBottom + iconLabelGap);
  const actionIconBottom = PANEL_Y + 304;
  const actionLabelY = actionIconBottom + iconLabelGap;
  const spaceCenterX = centerX - 75;
  const resetCenterX = centerX + 75;
  const resetIconSize = 64;
  context.drawImage(
    getImage("keySpace"),
    spaceCenterX - ACTION_ICON_SIZE / 2,
    actionIconBottom - ACTION_ICON_SIZE + 20,
    ACTION_ICON_SIZE,
    ACTION_ICON_SIZE,
  );
  context.fillText("DASH / PUSH", spaceCenterX, actionLabelY);
  context.drawImage(
    getImage("keyR"),
    resetCenterX - resetIconSize / 2,
    actionIconBottom - resetIconSize,
    resetIconSize,
    resetIconSize,
  );
  context.fillText("RESET", resetCenterX, actionLabelY);
  context.restore();
};

/**
 * Stage番号，Inventory，操作案内をゲーム画面の右側へ描画する．
 * 各パネルのCanvas context状態を復元し，GameStateは変更しない．
 */
export const renderHud = (
  game: GameState,
  context: CanvasRenderingContext2D,
): void => {
  drawStageProgress(game, context);
  drawInventory(game, context);
  drawControls(context);
};
