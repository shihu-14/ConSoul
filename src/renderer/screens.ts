import { GameState } from "../game";
import { getImage } from "./assets";

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

export const renderTitle = (context: CanvasRenderingContext2D) => {
  drawFullScreenImage(context, getImage("title"));
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
