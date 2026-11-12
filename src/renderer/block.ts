import {
  BlockState,
  GameState,
  getDisplayPosition,
  getNextPosition,
} from "../game";
import { getImage } from "./assets";
import { getCellSize } from "./layout";

const SOURCE_TILE_SIZE = 64;
const WALL_VARIANT_COUNT = 4;
const MOSS_VARIANT_COUNT = 3;
const APPEARANCE_VARIANT_COUNT = WALL_VARIANT_COUNT * MOSS_VARIANT_COUNT;
const STAGE_VARIATION_FACTOR = 12.9898;
const BLOCK_VARIATION_FACTOR = 78.233;
const VARIATION_SCALE = 43758.5453;
const BLOCK_APPEARANCE_SEED = Math.random();

const isMovingHorizontally = (block: BlockState): boolean =>
  block.movement?.direction === "left" || block.movement?.direction === "right";

const getLayerPosition = (block: BlockState) =>
  isMovingHorizontally(block) && block.movement
    ? getNextPosition(block.position, block.movement.direction)
    : block.position;

// 起動時のシードと安定IDだけから導出し，描画用の状態をゲームロジックへ持ち込まない．
const getBlockAppearance = (stageIndex: number, blockId: number) => {
  const variation = Math.floor(
    Math.abs(
      Math.sin(
        BLOCK_APPEARANCE_SEED +
          (stageIndex + 1) * STAGE_VARIATION_FACTOR +
          (blockId + 1) * BLOCK_VARIATION_FACTOR,
      ) * VARIATION_SCALE,
    ) % APPEARANCE_VARIANT_COUNT,
  );
  return {
    wallVariant: variation % WALL_VARIANT_COUNT,
    mossVariant:
      Math.floor(variation / WALL_VARIANT_COUNT) % MOSS_VARIANT_COUNT,
  };
};

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
    const layerPosition = getLayerPosition(block);
    // 横移動では移動先の列を使い，アニメーション中の苔の切り替わりを防ぐ．
    const coveredFromFront = game.stage.blocks.some((candidate) => {
      const candidatePosition = getLayerPosition(candidate);
      return (
        candidatePosition.x === layerPosition.x &&
        candidatePosition.y === layerPosition.y + 1
      );
    });
    const appearance = getBlockAppearance(game.stageIndex, block.id);
    context.drawImage(
      getImage("wall"),
      appearance.wallVariant * SOURCE_TILE_SIZE,
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
        appearance.mossVariant * SOURCE_TILE_SIZE,
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
