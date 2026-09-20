import { GameState } from "../game/types";
import { getImage } from "./assets";
import {
  ACTION_ICON_SIZE,
  HUD_WIDTH,
  HUD_X,
  INVENTORY_HEIGHT,
  INVENTORY_Y,
  ITEM_ICON_GAP,
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
 * Inventoryと操作案内をゲーム画面の右側へ描画する．
 * 各パネルのCanvas context状態を復元し，GameStateは変更しない．
 */
export const renderHud = (
  game: GameState,
  context: CanvasRenderingContext2D,
): void => {
  drawInventory(game, context);
  drawControls(context);
};
