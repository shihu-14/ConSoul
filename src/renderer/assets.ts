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
import { Direction, Item } from "../game";

const SOURCE_TILE_SIZE = 64;
const ITEM_VARIANT_COUNT = 3;

const directionSources: Record<
  Direction,
  readonly [number, number, number, number]
> = {
  up: [64, 0, SOURCE_TILE_SIZE, SOURCE_TILE_SIZE],
  down: [128, 0, SOURCE_TILE_SIZE, SOURCE_TILE_SIZE],
  left: [0, 0, SOURCE_TILE_SIZE, SOURCE_TILE_SIZE],
  right: [192, 0, SOURCE_TILE_SIZE, SOURCE_TILE_SIZE],
};

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

export const getImage = (id: keyof typeof images) => images[id];

export const getDirectionSource = (direction: Direction) =>
  directionSources[direction];

export const drawItem = (
  context: CanvasRenderingContext2D,
  item: Item,
  displayX: number,
  displayY: number,
  width: number,
  height: number,
): void => {
  context.drawImage(
    getImage("item"),
    (item.kind % ITEM_VARIANT_COUNT) * SOURCE_TILE_SIZE + SOURCE_TILE_SIZE,
    0,
    SOURCE_TILE_SIZE,
    SOURCE_TILE_SIZE,
    displayX,
    displayY,
    width,
    height,
  );
};
