import { settings } from "../settings";

import { getImage } from "../imageloader/imageStore";

const TITLE_SELECTION_NUMBER_SOURCE_X = [510, 885, 1245] as const;
const TITLE_SELECTION_NUMBER_SOURCE_Y = 1010;
const TITLE_SELECTION_NUMBER_COVER_WIDTH = 110;
const TITLE_SELECTION_NUMBER_COVER_HEIGHT = 100;
const TITLE_SELECTION_NUMBER_PIXEL_SIZE = 12;
const TITLE_SELECTION_NUMBER_PATTERNS = [
  [".#.", "##.", ".#.", ".#.", "###"],
  ["###", "..#", "###", "#..", "###"],
  ["###", "..#", "###", "..#", "###"],
] as const;

export const titleRendering = (ctx: CanvasRenderingContext2D) => {
  const titleImage = getImage("title");
  const { width, height } = ctx.canvas;
  const aspect = titleImage.width / titleImage.height;
  const x = (height * aspect - width) / 2;
  ctx.drawImage(titleImage, -x, 0, height * aspect, height);

  const imageScale = height / titleImage.height;
  ctx.save();
  TITLE_SELECTION_NUMBER_SOURCE_X.forEach((sourceX, index) => {
    const centerX = -x + sourceX * imageScale;
    const centerY = TITLE_SELECTION_NUMBER_SOURCE_Y * imageScale;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(
      centerX - (TITLE_SELECTION_NUMBER_COVER_WIDTH * imageScale) / 2,
      centerY - (TITLE_SELECTION_NUMBER_COVER_HEIGHT * imageScale) / 2,
      TITLE_SELECTION_NUMBER_COVER_WIDTH * imageScale,
      TITLE_SELECTION_NUMBER_COVER_HEIGHT * imageScale,
    );
    ctx.fillStyle = "#000000";
    const pattern = TITLE_SELECTION_NUMBER_PATTERNS[index];
    const pixelSize = TITLE_SELECTION_NUMBER_PIXEL_SIZE * imageScale;
    const patternWidth = pattern[0].length * pixelSize;
    const patternHeight = pattern.length * pixelSize;
    pattern.forEach((row, rowIndex) => {
      [...row].forEach((pixel, columnIndex) => {
        if (pixel !== "#") return;
        ctx.fillRect(
          centerX - patternWidth / 2 + columnIndex * pixelSize,
          centerY - patternHeight / 2 + rowIndex * pixelSize,
          pixelSize,
          pixelSize,
        );
      });
    });
  });
  ctx.restore();
};

export const resultRendering = (ctx: CanvasRenderingContext2D) => {
  const scoreTime = settings.end - settings.start;
  const scoreTimeCorrect = Math.round(scoreTime / 1000);

  const resultImage = getImage("result");
  const { width, height } = ctx.canvas;
  const aspect = resultImage.width / resultImage.height;
  const x = (height * aspect - width) / 2;
  ctx.drawImage(resultImage, -x, 0, height * aspect, height);

  ctx.fillStyle = "#ffffff";
  // ctx.font = '100px sans-serif';
  ctx.font = '75px "Press Start 2P", sans-serif';
  const minutes = `0${Math.floor(scoreTimeCorrect / 60)}`.slice(-2);
  const seconds = `0${scoreTimeCorrect % 60}`.slice(-2);
  ctx.fillText(String(minutes), 125, 290);
  ctx.fillText(String(seconds), 325, 290);
};

export const result2Rrendering = (ctx: CanvasRenderingContext2D) => {
  const gameoverImage = getImage("gameover");
  const { width, height } = ctx.canvas;
  const aspect = gameoverImage.width / gameoverImage.height;
  const x = (height * aspect - width) / 2;
  ctx.drawImage(gameoverImage, -x, 0, height * aspect, height);
};
