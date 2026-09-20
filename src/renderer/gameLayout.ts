import { GameState } from "../game/types";

export const FIELD_SIZE = 960;
export const HUD_X = 960;
export const HUD_WIDTH = 320;
export const INVENTORY_Y = 500;
export const INVENTORY_HEIGHT = 112;
export const PANEL_Y = 620;
export const PANEL_HEIGHT = FIELD_SIZE - PANEL_Y;
export const PANEL_PADDING = 16;
export const ITEM_ICON_SIZE = 50;
export const MOVEMENT_ICON_SIZE = 46;
export const ACTION_ICON_SIZE = 104;
export const KEY_ICON_GAP = 1;

/**
 * Stage幅から1セルのCanvas表示サイズを算出する．
 * ゲームフィールドを960px幅に収め，Stageの幅に応じてセルサイズを決定する．
 */
export const getCellSize = (game: GameState): number =>
  FIELD_SIZE / game.stage.width;
