import { Item } from "../game/types";
import { getImage } from "./assets";

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
    (item.kind % 3) * 64 + 64,
    0,
    64,
    64,
    displayX,
    displayY,
    width,
    height,
  );
};
