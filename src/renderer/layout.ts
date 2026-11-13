import { GameState } from "../game";

export const FIELD_SIZE = 960;
export const HUD_X = 960;
export const HUD_WIDTH = 320;
export const INVENTORY_Y = 500;
export const INVENTORY_HEIGHT = 112;
export const PANEL_Y = 620;
export const PANEL_HEIGHT = FIELD_SIZE - PANEL_Y;
export const PANEL_PADDING = 16;

export const getCellSize = (game: GameState): number =>
  FIELD_SIZE / game.stage.width;
