import { settings } from '../settings';

import { getImage } from '../imageloader/imageStore';

export const titleRendering = (ctx:CanvasRenderingContext2D) => {
  const titleImage = getImage('title');
  const { width, height } = ctx.canvas;
  const aspect = titleImage.width / titleImage.height;
  const x = (height * aspect - width) / 2;
  ctx.drawImage(titleImage, -x, 0, height * aspect, height);
};

export const resultRendering = (ctx:CanvasRenderingContext2D) => {
  const scoreTime = (settings.end - settings.start);
  const scoreTimeCorrect = Math.round(scoreTime / 1000);

  const resultImage = getImage('result');
  const { width, height } = ctx.canvas;
  const aspect = resultImage.width / resultImage.height;
  const x = (height * aspect - width) / 2;
  ctx.drawImage(resultImage, -x, 0, height * aspect, height);

  ctx.fillStyle = '#ffffff';
  // ctx.font = '100px sans-serif';
  ctx.font = '75px "Press Start 2P", sans-serif';
  const minutes = (`0${Math.floor(scoreTimeCorrect / 60)}`).slice(-2);
  const seconds = (`0${scoreTimeCorrect % 60}`).slice(-2);
  ctx.fillText(String(minutes), 125, 290);
  ctx.fillText(String(seconds), 325, 290);
};

export const result2Rrendering = (ctx:CanvasRenderingContext2D) => {
  const gameoverImage = getImage('gameover');
  const { width, height } = ctx.canvas;
  const aspect = gameoverImage.width / gameoverImage.height;
  const x = (height * aspect - width) / 2;
  ctx.drawImage(gameoverImage, -x, 0, height * aspect, height);
};
