/**
 * Canvas描画で使用する画像を読み込み，名前から取得できるようにする．
 */

import floorSrc from "../assets/images/floor.png";
import gameoverSrc from "../assets/images/gameover.png";
import ghostSrc from "../assets/images/ghost.png";
import heartAnimationSrc from "../assets/images/heart_animation.png";
import itemSrc from "../assets/images/item.png";
import playerSrc from "../assets/images/player.png";
import resultSrc from "../assets/images/result.png";
import titleSrc from "../assets/images/title.png";
import wallSrc from "../assets/images/wall.png";
import wallMossSrc from "../assets/images/wall_moss.png";
import smokePuffSrc from "../assets/images/smoke_puff.png";
import keyASrc from "../assets/images/key-a.png";
import keyArrowDownSrc from "../assets/images/arrow-down.png";
import keyArrowLeftSrc from "../assets/images/arrow-left.png";
import keyArrowRightSrc from "../assets/images/arrow-right.png";
import keyArrowUpSrc from "../assets/images/arrow-up.png";
import keyDSrc from "../assets/images/key-d.png";
import keyRSrc from "../assets/images/key-r.png";
import keySSrc from "../assets/images/key-s.png";
import keySpaceSrc from "../assets/images/key-space.png";
import keyWSrc from "../assets/images/key-w.png";

/**
 * 画像ソースからHTMLImageElementを作成してsrcを設定する．
 * 画像の登録時に一度だけ呼び出し，描画時は作成済みの要素を再利用する．
 */
const createImage = (source: string) => {
  const image = new Image();
  image.src = source;
  return image;
};

// ゲームで使用する画像を名前付きで一括登録する．
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
  wallMoss: createImage(wallMossSrc),
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

/**
 * 登録済み画像を名前で取得する．
 */
export const getImage = (id: keyof typeof images) => images[id];
