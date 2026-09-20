/**
 * Canvas描画で使用する画像を読み込み，名前から取得できるようにする．
 */

import floorSrc from "../imageloader/img/floor.png";
import gameoverSrc from "../imageloader/img/gameover.png";
import ghostSrc from "../imageloader/img/ghost.png";
import heartAnimationSrc from "../imageloader/img/heart_animation.png";
import itemSrc from "../imageloader/img/item.png";
import playerSrc from "../imageloader/img/player.png";
import resultSrc from "../imageloader/img/result.png";
import titleSrc from "../imageloader/img/title.png";
import wallSrc from "../imageloader/img/wall.png";
import smokePuffSrc from "../imageloader/img/effects/smoke_puff.png";
import keyASrc from "../imageloader/img/input-prompts/key-a.png";
import keyArrowDownSrc from "../imageloader/img/input-prompts/arrow-down.png";
import keyArrowLeftSrc from "../imageloader/img/input-prompts/arrow-left.png";
import keyArrowRightSrc from "../imageloader/img/input-prompts/arrow-right.png";
import keyArrowUpSrc from "../imageloader/img/input-prompts/arrow-up.png";
import keyDSrc from "../imageloader/img/input-prompts/key-d.png";
import keyRSrc from "../imageloader/img/input-prompts/key-r.png";
import keySSrc from "../imageloader/img/input-prompts/key-s.png";
import keySpaceSrc from "../imageloader/img/input-prompts/key-space.png";
import keyWSrc from "../imageloader/img/input-prompts/key-w.png";

const createImage = (source: string) => {
  const image = new Image();
  image.src = source;
  return image;
};

const images = {
  floor: createImage(floorSrc),
  gameover: createImage(gameoverSrc),
  ghost: createImage(ghostSrc),
  heartAnimation: createImage(heartAnimationSrc),
  item: createImage(itemSrc),
  player: createImage(playerSrc),
  result: createImage(resultSrc),
  title: createImage(titleSrc),
  wall: createImage(wallSrc),
  smokePuff: createImage(smokePuffSrc),
  keyA: createImage(keyASrc),
  keyArrowDown: createImage(keyArrowDownSrc),
  keyArrowLeft: createImage(keyArrowLeftSrc),
  keyArrowRight: createImage(keyArrowRightSrc),
  keyArrowUp: createImage(keyArrowUpSrc),
  keyD: createImage(keyDSrc),
  keyR: createImage(keyRSrc),
  keyS: createImage(keySSrc),
  keySpace: createImage(keySpaceSrc),
  keyW: createImage(keyWSrc),
};

export const getImage = (id: keyof typeof images) => images[id];
