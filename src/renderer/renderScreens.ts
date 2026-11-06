import { GameState } from "../game/types";
import { getImage } from "./assets";

const TITLE_SELECTION_NUMBER_SIZE = 75;
const TITLE_SELECTION_NUMBERS = [
  {
    cover: { x: 460, y: 985, width: 75, height: 75 },
    destination: { x: 460, y: 985 },
  },
  {
    cover: { x: 840, y: 975, width: 75, height: 75 },
    destination: { x: 840, y: 975 },
  },
  {
    cover: { x: 1220, y: 975, width: 65, height: 75 },
    destination: { x: 1215, y: 975 },
  },
] as const;
const RESULT_MINUTE_NUMBER_RIGHT_X = 136;
const RESULT_SECOND_NUMBER_RIGHT_X = 230;
const RESULT_TIME_BASELINE_Y = 144;
const RESULT_TIME_FONT_SIZE = 30;

const drawFullScreenImage = (
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
) => {
  const { width, height } = context.canvas;
  const aspect = image.width / image.height;
  const offsetX = (height * aspect - width) / 2;
  context.drawImage(image, -offsetX, 0, height * aspect, height);
  return { offsetX, imageScale: height / image.height };
};

// 元画像の番号を隠し、選択用の番号を上から重ねる。
export const renderTitle = (context: CanvasRenderingContext2D) => {
  const titleImage = getImage("title");
  const selectionNumbersImage = getImage("titleSelectionNumbers");
  const { offsetX, imageScale } = drawFullScreenImage(context, titleImage);
  context.save();
  TITLE_SELECTION_NUMBERS.forEach(({ cover, destination }, index) => {
    context.fillStyle = "#ffffff";
    context.fillRect(
      -offsetX + cover.x * imageScale,
      cover.y * imageScale,
      cover.width * imageScale,
      cover.height * imageScale,
    );
    context.drawImage(
      selectionNumbersImage,
      index * TITLE_SELECTION_NUMBER_SIZE,
      0,
      TITLE_SELECTION_NUMBER_SIZE,
      TITLE_SELECTION_NUMBER_SIZE,
      -offsetX + destination.x * imageScale,
      destination.y * imageScale,
      TITLE_SELECTION_NUMBER_SIZE * imageScale,
      TITLE_SELECTION_NUMBER_SIZE * imageScale,
    );
  });
  context.restore();
};

export const renderResult = (
  game: GameState,
  context: CanvasRenderingContext2D,
) => {
  context.save();
  const { offsetX, imageScale } = drawFullScreenImage(
    context,
    getImage("result"),
  );
  const elapsedSeconds = Math.round(game.elapsedSeconds);
  context.fillStyle = "#ffffff";
  context.font = `${RESULT_TIME_FONT_SIZE * imageScale}px "Press Start 2P", sans-serif`;
  context.textAlign = "right";
  context.textBaseline = "alphabetic";
  const baselineY = RESULT_TIME_BASELINE_Y * imageScale;
  context.fillText(
    `0${Math.floor(elapsedSeconds / 60)}`.slice(-2),
    RESULT_MINUTE_NUMBER_RIGHT_X * imageScale - offsetX,
    baselineY,
  );
  context.fillText(
    `0${elapsedSeconds % 60}`.slice(-2),
    RESULT_SECOND_NUMBER_RIGHT_X * imageScale - offsetX,
    baselineY,
  );
  context.restore();
};

export const renderGameOver = (context: CanvasRenderingContext2D) => {
  drawFullScreenImage(context, getImage("gameover"));
};
