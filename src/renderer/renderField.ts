import { getDisplayPosition, getNextPosition } from "../game/grid";
import { BlockState, GameState } from "../game/types";
import { getImage } from "./assets";
import { getCellSize } from "./gameLayout";
import { drawItem } from "./renderItems";

const NORMAL_WALL_SOURCE_X = [0, 64, 128, 192] as const;
const MOSS_SOURCE_X = [0, 64, 128] as const;
const spritesByBlock = new WeakMap<
  BlockState,
  { normalSourceX: number; mossSourceX: number }
>();

const getBlockSprites = (block: BlockState) => {
  const existing = spritesByBlock.get(block);
  if (existing !== undefined) return existing;
  const selected = {
    normalSourceX:
      NORMAL_WALL_SOURCE_X[
        Math.floor(Math.random() * NORMAL_WALL_SOURCE_X.length)
      ],
    mossSourceX:
      MOSS_SOURCE_X[Math.floor(Math.random() * MOSS_SOURCE_X.length)],
  };
  spritesByBlock.set(block, selected);
  return selected;
};

/** 同じStageをRで作り直すとき、各Blockの画像バリエーションを順番どおり引き継ぐ。 */
export const preserveBlockSpritesOnRetry = (
  previousBlocks: readonly BlockState[],
  freshBlocks: readonly BlockState[],
): void => {
  if (previousBlocks.length !== freshBlocks.length)
    throw new Error("Retry前後のBlock数が一致しない。");
  freshBlocks.forEach((block, index) => {
    spritesByBlock.set(block, { ...getBlockSprites(previousBlocks[index]) });
  });
};

const isMovingHorizontally = (block: BlockState): boolean =>
  block.movement?.direction === "left" || block.movement?.direction === "right";

const getHorizontalEndPosition = (block: BlockState) =>
  isMovingHorizontally(block) && block.movement
    ? getNextPosition(block.position, block.movement.direction)
    : block.position;

/**
 * 床，Block，残りItem，Postをゲームフィールドへ描画する．
 * 描画中はGameStateを変更せず，移動中Blockの表示座標だけを補間する．
 */
export const renderField = (
  game: GameState,
  context: CanvasRenderingContext2D,
): void => {
  const cellSize = getCellSize(game);
  for (let logicalY = 0; logicalY < game.stage.height; logicalY += 1) {
    for (let logicalX = 0; logicalX < game.stage.width; logicalX += 1) {
      // セル座標から決定的に床テクスチャのバリエーションを選択する．
      const floorVariant = Math.floor(
        Math.abs(Math.sin(logicalX * 12.9898 + logicalY * 78.233) % 1) * 4,
      );
      context.drawImage(
        getImage("floor"),
        (floorVariant % 2) * 64,
        Math.floor(floorVariant / 2) * 64,
        64,
        64,
        logicalX * cellSize,
        logicalY * cellSize,
        cellSize,
        cellSize,
      );
    }
  }
  game.stage.blocks.forEach((block) => {
    const sprites = getBlockSprites(block);
    const position = getDisplayPosition(
      block.position,
      block.movement?.direction ?? null,
      block.movement?.elapsedDistance ?? 0,
    );
    const frontBlocks = game.stage.blocks.filter(
      (candidate) =>
        candidate.position.x === block.position.x &&
        candidate.position.y === block.position.y + 1,
    );
    const endPosition = getHorizontalEndPosition(block);
    // 横押し中は開始時から移動後の覆いを使い、縦移動中は元のマスで判定する。
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
      : frontBlocks.length > 0;
    const wallImage = getImage("wall");
    context.drawImage(
      wallImage,
      sprites.normalSourceX,
      0,
      64,
      64,
      position.x * cellSize,
      position.y * cellSize,
      cellSize,
      cellSize,
    );
    if (!coveredFromFront) {
      context.drawImage(
        getImage("wallMoss"),
        sprites.mossSourceX,
        0,
        64,
        64,
        position.x * cellSize,
        position.y * cellSize,
        cellSize,
        cellSize,
      );
    }
  });
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
    64,
    64,
    game.stage.post.x * cellSize,
    game.stage.post.y * cellSize,
    cellSize,
    cellSize,
  );
};
