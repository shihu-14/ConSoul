import { GameState } from "../game";
import { drawItem, getImage } from "./assets";
import { renderBlocks } from "./block";
import { getCellSize } from "./layout";

const SOURCE_TILE_SIZE = 64;
const FLOOR_VARIANT_COUNT = 4;
const FLOOR_VARIANT_COLUMNS = 2;
const FLOOR_PATTERN_X_FACTOR = 12.9898;
const FLOOR_PATTERN_Y_FACTOR = 78.233;

const getFloorVariant = (logicalX: number, logicalY: number): number =>
  Math.floor(
    Math.abs(
      Math.sin(
        logicalX * FLOOR_PATTERN_X_FACTOR + logicalY * FLOOR_PATTERN_Y_FACTOR,
      ) % 1,
    ) * FLOOR_VARIANT_COUNT,
  );

const renderFloor = (
  game: GameState,
  context: CanvasRenderingContext2D,
): void => {
  const cellSize = getCellSize(game);
  for (let logicalY = 0; logicalY < game.stage.height; logicalY += 1) {
    for (let logicalX = 0; logicalX < game.stage.width; logicalX += 1) {
      // 描き直すたびに床が変わらないよう，座標だけで種類を決める．
      const floorVariant = getFloorVariant(logicalX, logicalY);
      context.drawImage(
        getImage("floor"),
        (floorVariant % FLOOR_VARIANT_COLUMNS) * SOURCE_TILE_SIZE,
        Math.floor(floorVariant / FLOOR_VARIANT_COLUMNS) * SOURCE_TILE_SIZE,
        SOURCE_TILE_SIZE,
        SOURCE_TILE_SIZE,
        logicalX * cellSize,
        logicalY * cellSize,
        cellSize,
        cellSize,
      );
    }
  }
};

const renderItems = (
  game: GameState,
  context: CanvasRenderingContext2D,
): void => {
  const cellSize = getCellSize(game);
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
    SOURCE_TILE_SIZE,
    SOURCE_TILE_SIZE,
    game.stage.post.x * cellSize,
    game.stage.post.y * cellSize,
    cellSize,
    cellSize,
  );
};

export const renderStage = (
  game: GameState,
  context: CanvasRenderingContext2D,
): void => {
  renderFloor(game, context);
  renderBlocks(game, context);
  renderItems(game, context);
};
