/**
 * タイトル，ステージ移行，結果，ゲームオーバーの各画面を描画する．
 */

import { GameState } from "../game/types";
import { getImage } from "./assets";
import { FIELD_SIZE } from "./gameLayout";

const TITLE_SELECTION_NUMBER_SOURCE_X = [510, 885, 1245] as const;
const TITLE_SELECTION_NUMBER_SOURCE_Y = 1010;
const TITLE_SELECTION_NUMBER_COVER_WIDTH = 110;
const TITLE_SELECTION_NUMBER_COVER_HEIGHT = 100;
const TITLE_SELECTION_NUMBER_PIXEL_SIZE = 12;
const RESULT_MINUTE_NUMBER_RIGHT_X = 136;
const RESULT_SECOND_NUMBER_RIGHT_X = 230;
const RESULT_TIME_BASELINE_Y = 144;
const RESULT_TIME_FONT_SIZE = 30;
const TITLE_SELECTION_NUMBER_PATTERNS = [
  [".#.", "##.", ".#.", ".#.", "###"],
  ["###", "..#", "###", "#..", "###"],
  ["###", "..#", "###", "..#", "###"],
] as const;

/**
 * 画像をCanvasの高さに合わせて縦いっぱいに描画する．
 * 画像のアスペクト比を維持し，横方向にはみ出した分を中央基準で切り取る．
 */
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

/**
 * Title画面の背景画像とキャラクター選択番号を描画する．
 * 番号は画像上の指定位置を隠してピクセルパターンを描き，1から3の選択肢を表示する．
 */
export const renderTitle = (context: CanvasRenderingContext2D) => {
  const titleImage = getImage("title");
  const { offsetX, imageScale } = drawFullScreenImage(context, titleImage);
  context.save();
  TITLE_SELECTION_NUMBER_SOURCE_X.forEach((sourceX, index) => {
    const centerX = -offsetX + sourceX * imageScale;
    const centerY = TITLE_SELECTION_NUMBER_SOURCE_Y * imageScale;
    context.fillStyle = "#ffffff";
    context.fillRect(
      centerX - (TITLE_SELECTION_NUMBER_COVER_WIDTH * imageScale) / 2,
      centerY - (TITLE_SELECTION_NUMBER_COVER_HEIGHT * imageScale) / 2,
      TITLE_SELECTION_NUMBER_COVER_WIDTH * imageScale,
      TITLE_SELECTION_NUMBER_COVER_HEIGHT * imageScale,
    );
    context.fillStyle = "#000000";
    const pattern = TITLE_SELECTION_NUMBER_PATTERNS[index];
    const pixelSize = TITLE_SELECTION_NUMBER_PIXEL_SIZE * imageScale;
    const patternWidth = pattern[0].length * pixelSize;
    const patternHeight = pattern.length * pixelSize;
    pattern.forEach((row, rowIndex) => {
      [...row].forEach((pixel, columnIndex) => {
        if (pixel !== "#") return;
        context.fillRect(
          centerX - patternWidth / 2 + columnIndex * pixelSize,
          centerY - patternHeight / 2 + rowIndex * pixelSize,
          pixelSize,
          pixelSize,
        );
      });
    });
  });
  context.restore();
};

/**
 * Result画面の背景画像とRunの経過時間を分と秒で描画する．
 * 経過時間は0未満にならないように補正してから整数秒へ丸める．
 */
export const renderResult = (
  game: GameState,
  context: CanvasRenderingContext2D,
) => {
  context.save();
  const { offsetX, imageScale } = drawFullScreenImage(
    context,
    getImage("result"),
  );
  const elapsedSeconds = Math.max(0, Math.round(game.elapsedSeconds));
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

/**
 * GameOver画面の背景画像をCanvas全体へ描画する．
 */
export const renderGameOver = (context: CanvasRenderingContext2D) => {
  drawFullScreenImage(context, getImage("gameover"));
};

/**
 * StageTransition画面の暗幕と次のStage番号を描画する．
 * StageのSimulationはGame側で停止し，この関数は表示だけを担当する．
 */
export const renderStageTransition = (
  game: GameState,
  context: CanvasRenderingContext2D,
) => {
  context.save();
  context.fillStyle = "rgba(0, 0, 0, 0.62)";
  context.fillRect(0, 0, FIELD_SIZE, context.canvas.height);
  context.fillStyle = "#ffffff";
  context.strokeStyle = "#1b1b1b";
  context.lineWidth = 8;
  context.font = "bold 72px monospace";
  context.textAlign = "center";
  context.textBaseline = "middle";
  const label = `STAGE ${game.stageIndex + 2}`;
  context.strokeText(label, FIELD_SIZE / 2, context.canvas.height / 2);
  context.fillText(label, FIELD_SIZE / 2, context.canvas.height / 2);
  context.restore();
};
