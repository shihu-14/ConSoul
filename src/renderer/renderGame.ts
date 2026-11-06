import { GameState } from "../game/types";
import { renderActors } from "./renderActors";
import { renderField } from "./renderField";
import { renderHud } from "./renderHud";

export const renderGame = (
  game: GameState,
  context: CanvasRenderingContext2D,
  nowSeconds: number,
): void => {
  renderField(game, context);
  renderActors(game, context, nowSeconds);
  renderHud(game, context);
};
