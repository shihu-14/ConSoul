import floorSrc from './img/floor.png';
import gameoverSrc from './img/gameover.png';
import ghostSrc from './img/ghost.png';
import heartAnimationSrc from './img/heart_animation.png';
import playerSrc from './img/player.png';
import resultSrc from './img/result.png';
import titleSrc from './img/title.png';
import wallSrc from './img/wall.png';
import itemSrc from './img/item.png';

const getImageObject = (src: string) => {
  const img = new Image();
  img.src = src;
  return img;
};

const images: Record<string, HTMLImageElement> = {
  floor: getImageObject(floorSrc),
  gameover: getImageObject(gameoverSrc),
  ghost: getImageObject(ghostSrc),
  heartAnimation: getImageObject(heartAnimationSrc),
  player: getImageObject(playerSrc),
  result: getImageObject(resultSrc),
  title: getImageObject(titleSrc),
  wall: getImageObject(wallSrc),
  item: getImageObject(itemSrc),
};

export const getImage = (id: string) => images[id];
