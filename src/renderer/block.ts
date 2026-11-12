import {
  BlockState,
  GameState,
  getDisplayPosition,
  getNextPosition,
} from "../game";
import { getImage } from "./assets";
import { getCellSize } from "./layout";

const SOURCE_TILE_SIZE = 64;

const isMovingHorizontally = (block: BlockState): boolean =>
  block.movement?.direction === "left" || block.movement?.direction === "right";

const getHorizontalEndPosition = (block: BlockState) =>
  isMovingHorizontally(block) && block.movement
    ? getNextPosition(block.position, block.movement.direction)
    : block.position;

export const renderBlocks = (
  game: GameState,
  context: CanvasRenderingContext2D,
): void => {
  const cellSize = getCellSize(game);
  game.stage.blocks.forEach((block) => {
    const position = getDisplayPosition(
      block.position,
      block.movement?.direction ?? null,
      block.movement?.elapsedDistance ?? 0,
    );
    const hasFrontBlock = game.stage.blocks.some(
      (candidate) =>
        candidate.position.x === block.position.x &&
        candidate.position.y === block.position.y + 1,
    );
    const endPosition = getHorizontalEndPosition(block);
    // 横押し中だけ，移動先の墓石との重なりを先に反映する．
    const horizontalFrontChange =
      isMovingHorizontally(block) ||
      game.stage.blocks.some(
        (candidate) =>
          isMovingHorizontally(candidate) &&
          candidate.position.y === block.position.y + 1 &&
          (candidate.position.x === block.position.x ||
            getHorizontalEndPosition(candidate).x === endPosition.x),
      );
    const coveredFromFront = horizontalFrontChange
      ? game.stage.blocks.some((candidate) => {
          const candidateEnd = getHorizontalEndPosition(candidate);
          return (
            candidateEnd.x === endPosition.x &&
            candidateEnd.y === endPosition.y + 1
          );
        })
      : hasFrontBlock;
    context.drawImage(
      getImage("wall"),
      block.sprite.wallIndex * SOURCE_TILE_SIZE,
      0,
      SOURCE_TILE_SIZE,
      SOURCE_TILE_SIZE,
      position.x * cellSize,
      position.y * cellSize,
      cellSize,
      cellSize,
    );
    if (!coveredFromFront) {
      context.drawImage(
        getImage("wallMoss"),
        block.sprite.mossIndex * SOURCE_TILE_SIZE,
        0,
        SOURCE_TILE_SIZE,
        SOURCE_TILE_SIZE,
        position.x * cellSize,
        position.y * cellSize,
        cellSize,
        cellSize,
      );
    }
  });
};
