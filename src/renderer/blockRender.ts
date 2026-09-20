import { BlockData } from "../data/blockData";
import { MapData } from "../data/mapData";

export const blockRender = (
  blocks: readonly BlockData[],
  map: MapData,
  ctx: CanvasRenderingContext2D,
) => {
  const cellWidth = ctx.canvas.width / map.width;
  const cellHeight = ctx.canvas.height / map.height;
  blocks.forEach(({ x, y }) => {
    const left = x * cellWidth;
    const top = y * cellHeight;
    ctx.save();
    ctx.fillStyle = "#8b5a2b";
    ctx.strokeStyle = "#4e2f16";
    ctx.lineWidth = Math.max(2, Math.min(cellWidth, cellHeight) * 0.08);
    ctx.fillRect(left + 3, top + 3, cellWidth - 6, cellHeight - 6);
    ctx.strokeRect(left + 3, top + 3, cellWidth - 6, cellHeight - 6);
    ctx.beginPath();
    ctx.moveTo(left + 7, top + 7);
    ctx.lineTo(left + cellWidth - 7, top + cellHeight - 7);
    ctx.moveTo(left + cellWidth - 7, top + 7);
    ctx.lineTo(left + 7, top + cellHeight - 7);
    ctx.stroke();
    ctx.restore();
  });
};
