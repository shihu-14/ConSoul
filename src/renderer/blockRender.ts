import { BlockData } from "../data/blockData";
import { MapData } from "../data/mapData";
import { getImage } from "../imageloader/imageStore";

export const blockRender = (
  blocks: readonly BlockData[],
  map: MapData,
  ctx: CanvasRenderingContext2D,
) => {
  const cellWidth = ctx.canvas.width / map.width;
  const cellHeight = ctx.canvas.height / map.height;
  blocks.forEach(({ x, y, renderX = x, renderY = y }) => {
    ctx.drawImage(
      getImage("wall"),
      0,
      0,
      64,
      64,
      renderX * cellWidth,
      renderY * cellHeight,
      cellWidth,
      cellHeight,
    );
  });
};
