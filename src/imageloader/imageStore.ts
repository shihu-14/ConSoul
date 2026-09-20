import floorSrc from "./img/floor.png";
import gameoverSrc from "./img/gameover.png";
import ghostSrc from "./img/ghost.png";
import heartAnimationSrc from "./img/heart_animation.png";
import playerSrc from "./img/player.png";
import resultSrc from "./img/result.png";
import titleSrc from "./img/title.png";
import wallSrc from "./img/wall.png";
import itemSrc from "./img/item.png";
import keyArrowUpSrc from "./img/input-prompts/arrow-up.png";
import keyArrowDownSrc from "./img/input-prompts/arrow-down.png";
import keyArrowLeftSrc from "./img/input-prompts/arrow-left.png";
import keyArrowRightSrc from "./img/input-prompts/arrow-right.png";
import keyWSrc from "./img/input-prompts/key-w.png";
import keyASrc from "./img/input-prompts/key-a.png";
import keySSrc from "./img/input-prompts/key-s.png";
import keyDSrc from "./img/input-prompts/key-d.png";
import keySpaceSrc from "./img/input-prompts/key-space.png";
import keyRSrc from "./img/input-prompts/key-r.png";

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
  keyArrowUp: getImageObject(keyArrowUpSrc),
  keyArrowDown: getImageObject(keyArrowDownSrc),
  keyArrowLeft: getImageObject(keyArrowLeftSrc),
  keyArrowRight: getImageObject(keyArrowRightSrc),
  keyW: getImageObject(keyWSrc),
  keyA: getImageObject(keyASrc),
  keyS: getImageObject(keySSrc),
  keyD: getImageObject(keyDSrc),
  keySpace: getImageObject(keySpaceSrc),
  keyR: getImageObject(keyRSrc),
};

export const getImage = (id: string) => images[id];
