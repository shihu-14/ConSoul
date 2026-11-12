import { GameState } from "../game";
import { renderEnemies } from "./enemy";
import { renderHud } from "./hud";
import { renderPlayer } from "./player";
import { renderStage } from "./stage";

export const renderGame = (
  game: GameState,
  context: CanvasRenderingContext2D,
  nowSeconds: number,
): void => {
  renderStage(game, context);
  renderPlayer(game, context, nowSeconds);
  renderEnemies(game, context, nowSeconds);
  renderHud(game, context);
};
